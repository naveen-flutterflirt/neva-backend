const IotKit = require('../models/iotKit');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3Config');
const crypto = require('crypto');

const region = process.env.AWS_REGION;

// Helper to upload a single file to AWS S3
const uploadToS3 = async (file) => {
  const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
  const uniqueKey = `iot-kits/${uniqueSuffix}-${file.originalname.replace(/\s+/g, '-')}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
};

// Create a new IoT Kit (POST /api/iot-kits)
exports.createIotKit = async (req, res) => {
  try {
    const { name, description, price, discountPrice, stock, status, whatsIncluded, projects, faqs } = req.body;

    let kitImages = [];
    if (req.files && req.files.length > 0) {
      // Find main images (fieldname: 'images')
      const imageFiles = req.files.filter(f => f.fieldname === 'images');
      if (imageFiles.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 main images allowed' });
      }

      for (const file of imageFiles) {
        const imageUrl = await uploadToS3(file);
        kitImages.push({
          imageUrl,
          id: crypto.randomBytes(4).toString('hex'),
        });
      }
    }

    // Process whatsIncluded JSON and its associated images
    let parsedWhatsIncluded = [];
    if (whatsIncluded) {
      parsedWhatsIncluded = typeof whatsIncluded === 'string' ? JSON.parse(whatsIncluded) : whatsIncluded;
      
      for (let i = 0; i < parsedWhatsIncluded.length; i++) {
        // Find corresponding image file for this component if uploaded
        const componentImgFile = req.files.find(f => f.fieldname === `components_${i}_image`);
        if (componentImgFile) {
          parsedWhatsIncluded[i].image = await uploadToS3(componentImgFile);
        }
      }
    }

    // Process projects and faqs
    const parsedProjects = projects ? (typeof projects === 'string' ? JSON.parse(projects) : projects) : [];
    const parsedFaqs = faqs ? (typeof faqs === 'string' ? JSON.parse(faqs) : faqs) : [];

    const newKit = await IotKit.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      status: status || 'active',
      images: kitImages,
      whatsIncluded: parsedWhatsIncluded,
      projects: parsedProjects,
      faqs: parsedFaqs,
    });

    res.status(201).json({
      success: true,
      message: 'IoT Kit created successfully',
      kit: newKit,
    });
  } catch (error) {
    console.error('Error creating IoT Kit:', error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// Get all IoT Kits (GET /api/iot-kits)
exports.getAllIotKits = async (req, res) => {
  try {
    const kits = await IotKit.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, count: kits.length, data: kits });
  } catch (error) {
    console.error('Error fetching IoT Kits:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get single IoT Kit by ID (GET /api/iot-kits/:id)
exports.getIotKitById = async (req, res) => {
  try {
    const kit = await IotKit.findByPk(req.params.id);
    if (!kit) {
      return res.status(404).json({ success: false, message: 'IoT Kit not found' });
    }
    res.status(200).json({ success: true, data: kit });
  } catch (error) {
    console.error('Error fetching IoT Kit details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete IoT Kit (DELETE /api/iot-kits/:id)
exports.deleteIotKit = async (req, res) => {
  try {
    const kit = await IotKit.findByPk(req.params.id);
    if (!kit) return res.status(404).json({ success: false, message: 'Kit not found' });

    // Delete main images from S3
    if (kit.images && kit.images.length > 0) {
      for (const img of kit.images) {
        if (img.imageUrl.includes('amazonaws.com')) {
          const key = img.imageUrl.split('.com/')[1];
          await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(e => console.log('S3 delete err:', e));
        }
      }
    }

    // Delete component images from S3
    if (kit.whatsIncluded && kit.whatsIncluded.length > 0) {
      for (const comp of kit.whatsIncluded) {
        if (comp.image && comp.image.includes('amazonaws.com')) {
          const key = comp.image.split('.com/')[1];
          await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(e => console.log('S3 delete err:', e));
        }
      }
    }

    await kit.destroy();
    res.status(200).json({ success: true, message: 'IoT Kit deleted successfully' });
  } catch (error) {
    console.error('Error deleting IoT Kit:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update IoT Kit (PUT /api/iot-kits/:id)
exports.updateIotKit = async (req, res) => {
  try {
    const kit = await IotKit.findByPk(req.params.id);
    if (!kit) return res.status(404).json({ success: false, message: 'Kit not found' });

    const { name, description, price, discountPrice, stock, status, whatsIncluded, projects, faqs, existingImages } = req.body;

    // Handle existing images passed from frontend (which are kept)
    let kitImages = existingImages ? (typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages) : [];

    // Find and upload new main images
    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter(f => f.fieldname === 'images');
      if (kitImages.length + imageFiles.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 main images allowed' });
      }
      for (const file of imageFiles) {
        const imageUrl = await uploadToS3(file);
        kitImages.push({
          imageUrl,
          id: crypto.randomBytes(4).toString('hex'),
        });
      }
    }

    // Identify removed images and delete them from S3
    const keptImageUrls = kitImages.map(img => img.imageUrl);
    for (const oldImg of kit.images) {
      if (!keptImageUrls.includes(oldImg.imageUrl) && oldImg.imageUrl.includes('amazonaws.com')) {
        const key = oldImg.imageUrl.split('.com/')[1];
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(e => console.log('S3 delete err:', e));
      }
    }

    // Process whatsIncluded JSON and its associated images
    let parsedWhatsIncluded = [];
    if (whatsIncluded) {
      parsedWhatsIncluded = typeof whatsIncluded === 'string' ? JSON.parse(whatsIncluded) : whatsIncluded;
      
      for (let i = 0; i < parsedWhatsIncluded.length; i++) {
        // If there's a new file for this component, upload it
        const componentImgFile = req.files && req.files.find(f => f.fieldname === `components_${i}_image`);
        if (componentImgFile) {
          // delete old image from S3 if replacing
          if (parsedWhatsIncluded[i].image && parsedWhatsIncluded[i].image.includes('amazonaws.com')) {
            const oldKey = parsedWhatsIncluded[i].image.split('.com/')[1];
            await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey })).catch(e => console.log('S3 delete err:', e));
          }
          parsedWhatsIncluded[i].image = await uploadToS3(componentImgFile);
        }
      }
    }

    // Identify removed components and delete their images from S3
    const oldComponentImageUrls = kit.whatsIncluded.map(comp => comp.image).filter(Boolean);
    const newComponentImageUrls = parsedWhatsIncluded.map(comp => comp.image).filter(Boolean);
    for (const oldUrl of oldComponentImageUrls) {
      if (!newComponentImageUrls.includes(oldUrl) && oldUrl.includes('amazonaws.com')) {
        const key = oldUrl.split('.com/')[1];
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(e => console.log('S3 delete err:', e));
      }
    }

    // Process projects and faqs
    const parsedProjects = projects ? (typeof projects === 'string' ? JSON.parse(projects) : projects) : [];
    const parsedFaqs = faqs ? (typeof faqs === 'string' ? JSON.parse(faqs) : faqs) : [];

    await kit.update({
      name: name || kit.name,
      description: description || kit.description,
      price: price ? Number(price) : kit.price,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: stock ? Number(stock) : kit.stock,
      status: status || kit.status,
      images: kitImages,
      whatsIncluded: parsedWhatsIncluded,
      projects: parsedProjects,
      faqs: parsedFaqs,
    });

    res.status(200).json({ success: true, message: 'IoT Kit updated successfully', kit });
  } catch (error) {
    console.error('Error updating IoT Kit:', error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};
