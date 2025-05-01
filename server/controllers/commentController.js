const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Создание комментария
const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;

    // Проверяем существование поста
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    const comment = await Comment.create({
      postId,
      author: req.user._id,
      text
    });

    // Получаем комментарий с данными автора
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при создании комментария' });
  }
};

// Получение комментариев к посту
const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('author', 'username')
      .populate('replies.author', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при получении комментариев' });
  }
};

// Добавление ответа на комментарий
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    comment.replies.push({
      author: req.user._id,
      text
    });

    await comment.save();

    // Получаем обновленный комментарий с данными авторов
    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'username')
      .populate('replies.author', 'username');

    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при добавлении ответа' });
  }
};

// Лайк/дизлайк комментария
const toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // Добавляем лайк
      comment.likes.push(req.user._id);
    } else {
      // Убираем лайк
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении лайков' });
  }
};

// Редактирование комментария
const updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверка прав на редактирование
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав на редактирование' });
    }

    comment.text = text;
    comment.isEdited = true;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении комментария' });
  }
};

// Удаление комментария
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверка прав на удаление
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав на удаление' });
    }

    await comment.remove();
    res.json({ message: 'Комментарий удален' });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении комментария' });
  }
};

module.exports = {
  createComment,
  getPostComments,
  addReply,
  toggleLike,
  updateComment,
  deleteComment
}; 