const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3Config');
const CustomPrintRequest = require('../models/customPrintRequest');
const crypto = require('crypto');

const region = process.env.AWS_REGION || 'us-east-1';

// Helper function to upload base64 image or 3D model file strings to AWS S3
const uploadBase64ToS3 = async (base64Str, prefix = 'ref', originalFileName = '') => {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:')) {
    return base64Str || null;
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    let ext = 'bin';
    if (originalFileName && originalFileName.includes('.')) {
      ext = originalFileName.split('.').pop().toLowerCase();
    } else {
      ext = mimeType.split('/')[1] || 'bin';
      if (ext.includes('octet-stream') || ext.includes('plain')) ext = 'stl';
    }

    const uniqueKey = `custom-prints/${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueKey,
      Body: buffer,
      ContentType: mimeType === 'application/octet-stream' && ext === 'stl' ? 'model/stl' : mimeType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
    console.log(`✓ AWS S3 Upload Success [${prefix}]: ${s3Url}`);
    return s3Url;
  } catch (err) {
    console.error(`❌ AWS S3 Upload Error [${prefix}]:`, err.message);
    return base64Str;
  }
};

// Create a new custom print request (POST)
exports.createCustomPrintRequest = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      deliveryInstructions,
      fileName,
      fileSize,
      fileUrl,
      material,
      color,
      quality,
      height,
      infill,
      quantity,
      notes,
      frontImage,
      sideImage,
      backImage,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !fileName || !material || !color) {
      return res.status(400).json({
        message: 'Please provide all required fields (customerName, customerEmail, customerPhone, fileName, material, color).',
      });
    }

    const selectedHeight = height || quality || '6 Inch';

    // Upload 3D file and reference images to AWS S3
    const uploadedFileUrl = await uploadBase64ToS3(fileUrl, '3d-model', fileName);
    const uploadedFrontImage = await uploadBase64ToS3(frontImage, 'front');
    const uploadedSideImage = await uploadBase64ToS3(sideImage, 'side');
    const uploadedBackImage = await uploadBase64ToS3(backImage, 'back');

    // Generate reference request ID e.g. #CR-2031 or PR-XXXX
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const requestId = `#CR-${randomNum}`;

    const newRequest = await CustomPrintRequest.create({
      requestId,
      customerName,
      customerEmail,
      customerPhone,
      addressLine1: addressLine1 || '',
      addressLine2: addressLine2 || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      deliveryInstructions: deliveryInstructions || '',
      fileName,
      fileSize: fileSize || '42.8 MB',
      fileUrl: uploadedFileUrl || null,
      material,
      color,
      quality: selectedHeight,
      height: selectedHeight,
      infill: infill ? parseInt(infill, 10) : 20,
      quantity: quantity ? parseInt(quantity, 10) : 1,
      notes: notes || '',
      frontImage: uploadedFrontImage,
      sideImage: uploadedSideImage,
      backImage: uploadedBackImage,
      status: 'pending_review',
    });

    return res.status(201).json({
      message: 'Custom print request submitted successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error creating custom print request:', error);
    return res.status(500).json({
      message: 'Internal server error while creating custom print request',
      error: error.message,
    });
  }
};

// Get all custom print requests (GET)
exports.getCustomPrintRequests = async (req, res) => {
  try {
    const { email, customerEmail } = req.query;
    const whereClause = {};
    const targetEmail = email || customerEmail;

    if (targetEmail) {
      whereClause.customerEmail = targetEmail.trim().toLowerCase();
    }

    const requests = await CustomPrintRequest.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      message: 'Custom print requests fetched successfully',
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching custom print requests:', error);
    return res.status(500).json({
      message: 'Internal server error while fetching custom print requests',
      error: error.message,
    });
  }
};

// Update custom print request status or quote price (PUT)
exports.updateCustomPrintRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quotePrice, paymentStatus, paymentMethod } = req.body;

    const printReq = await CustomPrintRequest.findByPk(id);
    if (!printReq) {
      return res.status(404).json({ message: 'Custom print request not found' });
    }

    if (status !== undefined) printReq.status = status;
    if (quotePrice !== undefined) printReq.quotePrice = quotePrice;
    if (paymentStatus !== undefined) printReq.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) printReq.paymentMethod = paymentMethod;

    await printReq.save();

    return res.status(200).json({
      message: 'Custom print request updated successfully',
      data: printReq,
    });
  } catch (error) {
    console.error('Error updating custom print request:', error);
    return res.status(500).json({
      message: 'Internal server error while updating custom print request',
      error: error.message,
    });
  }
};

// Delete custom print request (DELETE)
exports.deleteCustomPrintRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const printReq = await CustomPrintRequest.findByPk(id);
    if (!printReq) {
      return res.status(404).json({ message: 'Custom print request not found' });
    }

    await printReq.destroy();

    return res.status(200).json({
      message: 'Custom print request deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting custom print request:', error);
    return res.status(500).json({
      message: 'Internal server error while deleting custom print request',
      error: error.message,
    });
  }
};
