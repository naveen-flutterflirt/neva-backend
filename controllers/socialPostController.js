const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3Config');
const crypto = require('crypto');
const SocialPost = require('../models/socialPost');

const region = process.env.AWS_REGION || 'us-east-1';

// Helper to upload a single video file to AWS S3 Bucket
const uploadToS3 = async (file) => {
  const uniqueKey = `social-proof/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${file.originalname.replace(/\s+/g, '-')}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
};

// Helper to delete a file from AWS S3 Bucket
const deleteFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes('amazonaws.com')) return;
    const urlParts = fileUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) return;
    const key = urlParts[1];

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Failed to delete AWS S3 object:', error.message);
  }
};

// Get all active social posts (GET)
exports.getSocialPosts = async (req, res) => {
  try {
    const posts = await SocialPost.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({
      success: true,
      message: 'Social posts fetched successfully',
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching social posts',
      error: error.message,
    });
  }
};

// Create a new social post (POST) - Pure AWS S3 Video Upload
exports.createSocialPost = async (req, res) => {
  try {
    const { url, image, title } = req.body;
    let finalVideoUrl = url;
    let finalImageUrl = image || '';

    // Handle Direct AWS S3 Video Upload
    if (req.file) {
      finalVideoUrl = await uploadToS3(req.file);
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ success: false, message: 'Video file upload or URL is required.' });
    }

    const newPost = await SocialPost.create({
      url: finalVideoUrl,
      image: finalImageUrl,
      title: title,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Social video uploaded to AWS S3 & published successfully',
      data: newPost,
    });
  } catch (error) {
    console.error('Error uploading video to AWS S3:', error);
    return res.status(500).json({
      success: false,
      message: 'AWS S3 upload error: ' + error.message,
      error: error.message,
    });
  }
};

// Update a social post (PUT)
exports.updateSocialPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, image, title, isActive } = req.body;

    const post = await SocialPost.findByPk(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Social post not found' });
    }

    if (req.file) {
      if (post.url) await deleteFromS3(post.url);
      post.url = await uploadToS3(req.file);
    } else if (url !== undefined) {
      post.url = url;
    }

    if (image !== undefined) post.image = image;
    if (title !== undefined) post.title = title;
    if (isActive !== undefined) post.isActive = isActive;

    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Social post updated successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error updating social post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating social post',
      error: error.message,
    });
  }
};

// Delete a social post (DELETE)
exports.deleteSocialPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await SocialPost.findByPk(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Social post not found' });
    }

    if (post.url) {
      await deleteFromS3(post.url);
    }

    await post.destroy();

    return res.status(200).json({
      success: true,
      message: 'Social post and AWS S3 object deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting social post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting social post',
      error: error.message,
    });
  }
};
