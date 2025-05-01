const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTag,
  getAllTags,
  getPostsByTag,
  updateTag,
  deleteTag,
  searchTags
} = require('../controllers/tagController');

// Публичные маршруты
router.get('/', getAllTags);
router.get('/search', searchTags);
router.get('/:slug/posts', getPostsByTag);

// Защищенные маршруты (только для админов)
router.post('/', protect, createTag);
router.put('/:id', protect, updateTag);
router.delete('/:id', protect, deleteTag);

module.exports = router; 