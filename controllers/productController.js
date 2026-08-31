const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3Config');
const productRepository = require('../repositories/productRepository');
const crypto = require('crypto');

const region = process.env.AWS_REGION || 'us-east-1';

// Helper to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Helper to upload a single file to AWS S3
const uploadToS3 = async (file) => {
  const uniqueKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${file.originalname.replace(/\s+/g, '-')}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
};

// Helper to delete a file from AWS S3
const deleteFromS3 = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const key = urlParts[urlParts.length - 1];

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Failed to delete S3 object:', error.message);
  }
};

// Helper to safely parse JSON field from request body
const parseJSONField = (val, fallback = []) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

// Helper to format product data
const formatProduct = (product) => {
  if (!product) return null;
  return product.toJSON ? product.toJSON() : product;
};

class ProductController {
  async getProducts(req, res) {
    try {
      const products = await productRepository.findAll();
      const formattedProducts = (products || []).map(formatProduct);
      return res.status(200).json({
        success: true,
        data: formattedProducts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: error.message,
      });
    }
  }

  async getNewArrivals(req, res) {
    try {
      const products = await productRepository.findNewArrivals();
      const formattedProducts = (products || []).map(formatProduct);
      return res.status(200).json({
        success: true,
        data: formattedProducts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve new arrivals',
        error: error.message,
      });
    }
  }

  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: formatProduct(product),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: error.message,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const {
        name,
        categoryId,
        sku,
        description,
        price,
        discountPrice,
        stock,
        status,
        isNewArrival,
        primaryImageIndex,
        materialVariants,
        colorOptions,
        sizeVariants,
        careInstructions,
        keyFeatures,
        specifications,
        sortOrder,
        subCategoryId,
      } = req.body;
      const images = req.files && req.files['images'] ? req.files['images'] : [];
      const videos = req.files && req.files['videos'] ? req.files['videos'] : [];

      if (!name || !categoryId || !sku || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, Category, SKU, and Price are required fields',
        });
      }

      // Check unique SKU
      const existingSku = await productRepository.findBySku(sku);
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: `Product SKU '${sku}' already exists`,
        });
      }

      const slug = generateSlug(name);

      // Verify unique slug
      const existingSlug = await productRepository.findBySlug(slug);
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: `Product slug '${slug}' already exists from the name`,
        });
      }

      const product = await productRepository.create({
        name,
        categoryId,
        sku,
        description,
        price,
        discountPrice: discountPrice || null,
        stock: stock || 0,
        status: status || 'draft',
        isNewArrival: isNewArrival === 'true' || isNewArrival === true,
        slug,
        materialVariants: parseJSONField(materialVariants, []),
        colorOptions: parseJSONField(colorOptions, []),
        sizeVariants: parseJSONField(sizeVariants, []),
        careInstructions: parseJSONField(careInstructions, []),
        keyFeatures: parseJSONField(keyFeatures, []),
        specifications: parseJSONField(specifications, {}),
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        subCategoryId: subCategoryId || null
      });

      // Upload files to S3
      const mediaToSave = [];
      const primaryIdx = parseInt(primaryImageIndex, 10) || 0;

      // Handle Image uploads
      for (let i = 0; i < images.length; i++) {
        const fileUrl = await uploadToS3(images[i]);
        mediaToSave.push({
          productId: product.id,
          imageUrl: fileUrl,
          isPrimary: i === primaryIdx,
          sortOrder: i,
          mediaType: 'image',
        });
      }

      // Handle Video uploads
      for (let i = 0; i < videos.length; i++) {
        const fileUrl = await uploadToS3(videos[i]);
        mediaToSave.push({
          productId: product.id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: images.length + i,
          mediaType: 'video',
        });
      }

      // Handle Color Option Specific Image uploads to AWS S3
      const colorImages = req.files && req.files['colorImages'] ? req.files['colorImages'] : [];
      let colorImageIndices = [];
      const rawIndices = req.body.colorImageIndices;
      if (Array.isArray(rawIndices)) {
        colorImageIndices = rawIndices.map(x => parseInt(x, 10));
      } else if (typeof rawIndices === 'string') {
        try { colorImageIndices = JSON.parse(rawIndices); } catch (e) { colorImageIndices = [parseInt(rawIndices, 10)]; }
      }
      let parsedColorOptions = parseJSONField(colorOptions, []);

      for (let i = 0; i < colorImages.length; i++) {
        const fileUrl = await uploadToS3(colorImages[i]);
        const targetIdx = colorImageIndices[i] !== undefined ? parseInt(colorImageIndices[i], 10) : i;
        if (parsedColorOptions[targetIdx]) {
          parsedColorOptions[targetIdx].imageUrl = fileUrl;
        }
        mediaToSave.push({
          productId: product.id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: images.length + videos.length + i,
          mediaType: 'image',
          color: parsedColorOptions[targetIdx] ? parsedColorOptions[targetIdx].name : null,
        });
      }

      if (colorImages.length > 0) {
        await productRepository.update(product.id, { colorOptions: parsedColorOptions });
      }

      // Save media records
      await productRepository.addImages(mediaToSave);

      const freshProduct = await productRepository.findById(product.id);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: freshProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        categoryId,
        sku,
        description,
        price,
        discountPrice,
        stock,
        status,
        primaryImageIndex,
        deletedImageIds,
        materialVariants,
        colorOptions,
        sizeVariants,
        careInstructions,
        keyFeatures,
        specifications,
        subCategoryId,
      } = req.body;
      const images = req.files && req.files['images'] ? req.files['images'] : [];
      const videos = req.files && req.files['videos'] ? req.files['videos'] : [];

      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const updateData = {};
      if (name) {
        updateData.name = name;
        updateData.slug = generateSlug(name);
      }
      if (categoryId) updateData.categoryId = categoryId;
      if (sku) {
        if (sku !== product.sku) {
          const existingSku = await productRepository.findBySku(sku);
          if (existingSku) {
            return res.status(400).json({
              success: false,
              message: `SKU '${sku}' already in use by another product`,
            });
          }
        }
        updateData.sku = sku;
      }
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (discountPrice !== undefined) updateData.discountPrice = discountPrice || null;
      if (stock !== undefined) updateData.stock = stock;
      if (status) updateData.status = status;
      if (req.body.isNewArrival !== undefined) {
        updateData.isNewArrival = req.body.isNewArrival === 'true' || req.body.isNewArrival === true;
      }

      if (materialVariants !== undefined) updateData.materialVariants = parseJSONField(materialVariants, []);
      if (colorOptions !== undefined) updateData.colorOptions = parseJSONField(colorOptions, []);
      if (sizeVariants !== undefined) updateData.sizeVariants = parseJSONField(sizeVariants, []);
      if (careInstructions !== undefined) updateData.careInstructions = parseJSONField(careInstructions, []);
      if (keyFeatures !== undefined) updateData.keyFeatures = parseJSONField(keyFeatures, []);
      if (specifications !== undefined) updateData.specifications = parseJSONField(specifications, {});
      if (req.body.sortOrder !== undefined) updateData.sortOrder = parseInt(req.body.sortOrder, 10) || 0;
      if (subCategoryId !== undefined) updateData.subCategoryId = subCategoryId || null;

      await productRepository.update(id, updateData);

      // Handle Media Deletions
      if (deletedImageIds) {
        const idList = Array.isArray(deletedImageIds) ? deletedImageIds : [deletedImageIds];
        for (const imgId of idList) {
          const imgObj = product.images.find(img => img.id === imgId);
          if (imgObj) {
            await deleteFromS3(imgObj.imageUrl);
            await productRepository.deleteImage(imgId);
          }
        }
      }

      // Automatically cleanup images associated with color options that were deleted
      if (colorOptions !== undefined && product.images) {
        const remainingColorNames = (updateData.colorOptions || []).map(c => (c.name || '').toLowerCase().trim());
        for (const imgObj of product.images) {
          if (imgObj.color && imgObj.color.trim() !== '') {
            const isColorStillPresent = remainingColorNames.includes(imgObj.color.toLowerCase().trim());
            if (!isColorStillPresent) {
              await deleteFromS3(imgObj.imageUrl);
              await productRepository.deleteImage(imgObj.id);
            }
          }
        }
      }

      // Handle new uploads
      const newMedia = [];
      const startSortOrder = product.images.length;

      // Handle new images
      for (let i = 0; i < images.length; i++) {
        const fileUrl = await uploadToS3(images[i]);
        newMedia.push({
          productId: id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: startSortOrder + i,
          mediaType: 'image',
        });
      }

      // Handle new videos
      for (let i = 0; i < videos.length; i++) {
        const fileUrl = await uploadToS3(videos[i]);
        newMedia.push({
          productId: id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: startSortOrder + images.length + i,
          mediaType: 'video',
        });
      }

      // Handle Color Option Specific Image uploads to AWS S3
      const colorImages = req.files && req.files['colorImages'] ? req.files['colorImages'] : [];
      let colorImageIndices = [];
      const rawIndicesUpdate = req.body.colorImageIndices;
      if (Array.isArray(rawIndicesUpdate)) {
        colorImageIndices = rawIndicesUpdate.map(x => parseInt(x, 10));
      } else if (typeof rawIndicesUpdate === 'string') {
        try { colorImageIndices = JSON.parse(rawIndicesUpdate); } catch (e) { colorImageIndices = [parseInt(rawIndicesUpdate, 10)]; }
      }
      let updatedColorOpts = updateData.colorOptions !== undefined ? updateData.colorOptions : (product.colorOptions || []);

      for (let i = 0; i < colorImages.length; i++) {
        const fileUrl = await uploadToS3(colorImages[i]);
        const targetIdx = colorImageIndices[i] !== undefined ? parseInt(colorImageIndices[i], 10) : i;
        if (updatedColorOpts[targetIdx]) {
          updatedColorOpts[targetIdx].imageUrl = fileUrl;
        }
        newMedia.push({
          productId: id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: startSortOrder + images.length + videos.length + i,
          mediaType: 'image',
          color: updatedColorOpts[targetIdx] ? updatedColorOpts[targetIdx].name : null,
        });
      }

      if (colorImages.length > 0) {
        await productRepository.update(id, { colorOptions: updatedColorOpts });
      }

      if (newMedia.length > 0) {
        await productRepository.createImages(newMedia);
      }

      // Re-fetch product images to adjust primary image
      const refreshedProduct = await productRepository.findById(id);

      if (primaryImageIndex !== undefined) {
        const primaryIdx = parseInt(primaryImageIndex, 10);
        const allImages = refreshedProduct.images.filter(img => img.mediaType === 'image');
        if (allImages[primaryIdx]) {
          await productRepository.setPrimaryImage(allImages[primaryIdx].id);
        }
      }

      const finalProduct = await productRepository.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: formatProduct(finalProduct),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Delete images and videos from S3
      for (const img of product.images) {
        await deleteFromS3(img.imageUrl);
      }

      // Delete from DB
      await productRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Product and all associated media deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
