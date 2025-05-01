const User = require('../models/User');
const Post = require('../models/Post');

// Получение профиля пользователя
const getUserProfile = async (req, res) => {
  try {
    console.log(`Запрос профиля пользователя: ${req.params.username}`);
    console.log(`Запрос от пользователя: ${req.user ? req.user._id : 'не авторизован'}`);

    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash');

    if (!user) {
      console.log(`Пользователь не найден: ${req.params.username}`);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Подсчитываем количество подписчиков и подписок
    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    // Получаем публичные посты пользователя
    const posts = await Post.find({
      author: user._id,
      isPrivate: false,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username');

    // Проверяем, авторизован ли пользователь и определяем, подписан ли он
    let isFollowing = false;
    if (req.user && req.user._id) {
      isFollowing = user.followers && user.followers.some(
        follower => follower.toString() === req.user._id.toString()
      );
      console.log(`Пользователь ${req.user._id} ${isFollowing ? 'подписан' : 'не подписан'} на ${user._id}`);
    }

    const responseData = {
      user: {
        ...user.toObject(),
        followersCount,
        followingCount
      },
      posts,
      isFollowing
    };

    console.log(`Отправка данных профиля: ${user.username}, постов: ${posts.length}`);
    res.json(responseData);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
};

// Подписка на пользователя
const followUser = async (req, res) => {
  try {
    console.log(`Запрос на подписку: от ${req.user._id} к ${req.params.id}`);
    
    if (req.params.id === req.user._id.toString()) {
      console.log('Попытка подписаться на самого себя');
      return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      console.log(`Целевой пользователь не найден: ${req.params.id}`);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      console.log(`Текущий пользователь не найден: ${req.user._id}`);
      return res.status(404).json({ message: 'Текущий пользователь не найден' });
    }

    // Проверяем, не подписаны ли мы уже
    const isAlreadyFollowing = currentUser.following.some(
      userId => userId.toString() === userToFollow._id.toString()
    );
    
    if (isAlreadyFollowing) {
      console.log(`Пользователь ${req.user._id} уже подписан на ${req.params.id}`);
      return res.status(400).json({ message: 'Вы уже подписаны на этого пользователя' });
    }

    // Добавляем подписку
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await Promise.all([currentUser.save(), userToFollow.save()]);
    console.log(`Подписка успешно добавлена: ${req.user._id} -> ${req.params.id}`);

    res.json({ 
      message: 'Вы успешно подписались',
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Ошибка при подписке:', error);
    res.status(500).json({ message: 'Ошибка при подписке' });
  }
};

// Отписка от пользователя
const unfollowUser = async (req, res) => {
  try {
    console.log(`Запрос на отписку: от ${req.user._id} от ${req.params.id}`);
    
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      console.log(`Целевой пользователь не найден: ${req.params.id}`);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      console.log(`Текущий пользователь не найден: ${req.user._id}`);
      return res.status(404).json({ message: 'Текущий пользователь не найден' });
    }

    // Проверяем, подписаны ли мы
    const isFollowing = currentUser.following.some(
      userId => userId.toString() === userToUnfollow._id.toString()
    );
    
    if (!isFollowing) {
      console.log(`Пользователь ${req.user._id} не подписан на ${req.params.id}`);
      return res.status(400).json({ message: 'Вы не подписаны на этого пользователя' });
    }

    // Удаляем подписку
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    console.log(`Отписка успешно выполнена: ${req.user._id} X ${req.params.id}`);

    res.json({ 
      message: 'Вы успешно отписались',
      followersCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Ошибка при отписке:', error);
    res.status(500).json({ message: 'Ошибка при отписке' });
  }
};

// Получение ленты постов от подписок
const getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Получаем посты от пользователей, на которых подписаны
    const posts = await Post.find({
      author: { $in: user.following },
      status: 'published',
      $or: [
        { isPrivate: false },
        { allowedUsers: req.user._id }
      ]
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при получении ленты' });
  }
};

/**
 * @desc    Получить подписчиков текущего пользователя
 * @route   GET /api/users/followers
 * @access  Private
 */
const getFollowers = async (req, res) => {
  try {
    // Находим пользователя
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Находим пользователей, которые подписаны на текущего пользователя
    const followers = await User.find({ 
      following: { $in: [req.user.id] } 
    }).select('username avatar bio');
    
    // Подсчитываем количество постов и подписчиков для каждого пользователя
    const followersWithDetails = await Promise.all(followers.map(async (follower) => {
      const postsCount = await Post.countDocuments({ author: follower._id });
      const followersCount = await User.countDocuments({ following: follower._id });
      
      return {
        _id: follower._id,
        username: follower.username,
        avatar: follower.avatar,
        bio: follower.bio,
        postsCount,
        followersCount
      };
    }));
    
    res.json(followersWithDetails);
  } catch (error) {
    console.error('Ошибка при получении подписчиков:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении подписчиков' });
  }
};

/**
 * @desc    Получить подписки текущего пользователя
 * @route   GET /api/users/following
 * @access  Private
 */
const getFollowing = async (req, res) => {
  try {
    // Находим пользователя
    const user = await User.findById(req.user.id).populate('following', 'username avatar bio');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Подсчитываем количество постов и подписчиков для каждого пользователя
    const followingWithDetails = await Promise.all(user.following.map(async (followed) => {
      const postsCount = await Post.countDocuments({ author: followed._id });
      const followersCount = await User.countDocuments({ following: followed._id });
      
      return {
        _id: followed._id,
        username: followed.username,
        avatar: followed.avatar,
        bio: followed.bio,
        postsCount,
        followersCount
      };
    }));
    
    res.json(followingWithDetails);
  } catch (error) {
    console.error('Ошибка при получении подписок:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении подписок' });
  }
};

module.exports = {
  getUserProfile,
  followUser,
  unfollowUser,
  getFeed,
  getFollowers,
  getFollowing
}; 