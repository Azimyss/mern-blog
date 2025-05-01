const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
  getFeedPosts,
  getUserPosts
} = require('../controllers/postController');

// Публичные маршруты
router.get('/public', getPublicPosts);

// Защищенные маршруты
router.post('/', protect, createPost);
router.get('/feed', protect, getFeedPosts);
router.get('/my', protect, getUserPosts);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router; 