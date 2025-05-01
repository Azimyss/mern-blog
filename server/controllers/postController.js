const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Создание нового поста
const createPost = async (req, res) => {
  try {
    const { title, content, summary, tags, isPrivate, isByRequest, coverImage } = req.body;

    console.log('Данные для создания поста:', {
      title,
      content: content ? `${content.substring(0, 50)}...` : undefined,
      summary: summary ? `${summary.substring(0, 50)}...` : undefined,
      tags,
      isPrivate,
      isByRequest,
      coverImage: coverImage ? 'provided' : undefined,
      user: req.user ? req.user._id : undefined
    });

    // Создаем краткое описание из контента, если не указано
    const postSummary = summary || content.substring(0, 200).trim() + (content.length > 200 ? '...' : '');

    const postData = {
      author: req.user._id,
      title,
      content,
      summary: postSummary,
      isPrivate: isPrivate || false,
      isByRequest: isByRequest || false
    };

    // Добавляем опциональные поля только если они определены
    if (tags && Array.isArray(tags)) {
      postData.tags = tags;
    }

    if (coverImage) {
      postData.coverImage = coverImage;
    }

    console.log('Создаю новый пост с данными:', postData);
    const post = await Post.create(postData);
    console.log('Пост успешно создан:', post._id);

    res.status(201).json(post);
  } catch (error) {
    console.error('Ошибка при создании поста:', error);
    res.status(400).json({ 
      message: 'Ошибка при создании поста', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Получение всех публичных постов
const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      isPrivate: false,
      isByRequest: false,
      status: 'published'
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при получении постов' });
  }
};

// Получение поста по ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('allowedUsers', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверка доступа к приватному посту
    if (post.isPrivate || post.isByRequest) {
      const isAuthor = post.author._id.toString() === req.user._id.toString();
      const isAllowed = post.allowedUsers.some(user => 
        user._id.toString() === req.user._id.toString()
      );

      if (!isAuthor && !isAllowed) {
        return res.status(403).json({ message: 'Нет доступа к посту' });
      }
    }

    // Увеличиваем счетчик просмотров
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при получении поста' });
  }
};

// Обновление поста
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверка прав на редактирование
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав на редактирование' });
    }

    const { title, content, summary, tags, isPrivate, isByRequest, status, coverImage } = req.body;

    // Обновляем основные поля
    if (title) post.title = title;
    
    // Если контент изменился, обновляем его и, возможно, summary
    if (content) {
      post.content = content;
      // Если summary не передан, но контент изменился, обновляем summary автоматически
      if (!summary) {
        post.summary = content.substring(0, 200).trim() + (content.length > 200 ? '...' : '');
      }
    }
    
    // Если summary передан явно, используем его
    if (summary) {
      post.summary = summary;
    }
    
    if (tags) post.tags = tags;
    if (isPrivate !== undefined) post.isPrivate = isPrivate;
    if (isByRequest !== undefined) post.isByRequest = isByRequest;
    if (status) post.status = status;
    
    // Если coverImage передан в запросе, обновляем его
    // Если передана пустая строка, удаляем изображение
    if (coverImage !== undefined) {
      if (coverImage === '') {
        post.coverImage = undefined;  // Удаляем поле из документа
      } else {
        post.coverImage = coverImage;
      }
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error('Ошибка при обновлении поста:', error);
    res.status(400).json({ message: 'Ошибка при обновлении поста' });
  }
};

// Удаление поста
const deletePost = async (req, res) => {
  try {
    console.log('Запрос на удаление поста. ID:', req.params.id);
    console.log('Пользователь:', req.user ? req.user._id : 'не авторизован');

    if (!req.user) {
      console.log('Попытка удаления без авторизации');
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('Пост не найден:', req.params.id);
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверка прав на удаление
    if (post.author.toString() !== req.user._id.toString()) {
      console.log('Нет прав на удаление. Автор:', post.author, 'Пользователь:', req.user._id);
      return res.status(403).json({ message: 'Нет прав на удаление' });
    }

    // В mongoose метод remove() устарел, используем deleteOne()
    await Post.deleteOne({ _id: post._id });
    console.log('Пост успешно удален:', req.params.id);

    res.json({ message: 'Пост удален' });
  } catch (error) {
    console.error('Ошибка при удалении поста:', error);
    res.status(400).json({ message: 'Ошибка при удалении поста', error: error.message });
  }
};

/**
 * @desc    Получить ленту постов (от пользователей, на которых подписан)
 * @route   GET /api/posts/feed
 * @access  Private
 */
const getFeedPosts = async (req, res) => {
  try {
    // Получаем подписки пользователя
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Получаем посты от пользователей, на которых подписан
    const posts = await Post.find({
      author: { $in: user.following },
      // Показываем только публичные посты или те, к которым у пользователя есть доступ
      $or: [
        { isPrivate: false },
        { allowedUsers: { $in: [req.user.id] } }
      ]
    })
    .sort({ createdAt: -1 }) // Сортировка от новых к старым
    .populate('author', 'username')
    .lean();
    
    // Добавляем информацию о лайках и комментариях
    const postsWithDetails = await Promise.all(posts.map(async (post) => {
      // Проверяем, лайкнул ли текущий пользователь пост
      const isLiked = post.likes && post.likes.includes(req.user.id);
      
      // Получаем количество комментариев
      const commentsCount = await Comment.countDocuments({ postId: post._id });
      
      return {
        ...post,
        isLiked,
        commentsCount,
        likes: post.likes ? post.likes.length : 0,
      };
    }));
    
    res.json(postsWithDetails);
  } catch (error) {
    console.error('Ошибка при получении ленты постов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении ленты' });
  }
};

/**
 * @desc    Получить посты пользователя
 * @route   GET /api/posts/my
 * @access  Private
 */
const getUserPosts = async (req, res) => {
  try {
    // Получаем посты текущего пользователя
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 }) // Сортировка от новых к старым
      .populate('author', 'username')
      .lean();
    
    // Добавляем информацию о лайках и комментариях
    const postsWithDetails = await Promise.all(posts.map(async (post) => {
      // Получаем количество комментариев
      const commentsCount = await Comment.countDocuments({ postId: post._id });
      
      return {
        ...post,
        commentsCount,
        likes: post.likes ? post.likes.length : 0,
      };
    }));
    
    res.json(postsWithDetails);
  } catch (error) {
    console.error('Ошибка при получении постов пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении постов пользователя' });
  }
};

module.exports = {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
  getFeedPosts,
  getUserPosts
}; 