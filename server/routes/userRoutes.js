const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  followUser,
  unfollowUser,
  getFeed,
  getFollowers,
  getFollowing
} = require('../controllers/userController');

// Публичные маршруты
router.get('/profile/:username', getUserProfile);

// Защищенные маршруты
router.get('/feed', protect, getFeed);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/followers', protect, getFollowers);
router.get('/following', protect, getFollowing);

module.exports = router; 