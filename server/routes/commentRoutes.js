const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createComment,
  getPostComments,
  addReply,
  toggleLike,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// Маршруты для комментариев к посту
router.get('/post/:postId', getPostComments);
router.post('/post/:postId', protect, createComment);

// Маршруты для работы с комментарием
router.post('/:commentId/reply', protect, addReply);
router.post('/:commentId/like', protect, toggleLike);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router; 