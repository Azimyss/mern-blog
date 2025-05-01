const Tag = require('../models/Tag');
const Post = require('../models/Post');

// Создание нового тега
const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    const tag = await Tag.create({
      name,
      description
    });

    res.status(201).json(tag);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ message: 'Тег с таким именем уже существует' });
    } else {
      res.status(400).json({ message: 'Ошибка при создании тега' });
    }
  }
};

// Получение всех тегов
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find()
      .sort({ postsCount: -1, name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при получении тегов' });
  }
};

// Получение постов по тегу
const getPostsByTag = async (req, res) => {
  try {
    const { slug } = req.params;
    const tag = await Tag.findOne({ slug });

    if (!tag) {
      return res.status(404).json({ message: 'Тег не найден' });
    }

    const posts = await Post.find({
      tags: tag.name,
      status: 'published',
      isPrivate: false
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 });

    res.json({
      tag,
      posts
    });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при получении постов по тегу' });
  }
};

// Обновление тега
const updateTag = async (req, res) => {
  try {
    const { description } = req.body;
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Тег не найден' });
    }

    tag.description = description;
    await tag.save();

    res.json(tag);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении тега' });
  }
};

// Удаление тега
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Тег не найден' });
    }

    // Проверяем, есть ли посты с этим тегом
    const postsWithTag = await Post.countDocuments({ tags: tag.name });
    if (postsWithTag > 0) {
      return res.status(400).json({ 
        message: 'Невозможно удалить тег, который используется в постах' 
      });
    }

    await tag.remove();
    res.json({ message: 'Тег удален' });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении тега' });
  }
};

// Поиск тегов (для автодополнения)
const searchTags = async (req, res) => {
  try {
    const { query } = req.query;
    const tags = await Tag.find({
      name: { $regex: query, $options: 'i' }
    })
    .limit(10)
    .sort({ postsCount: -1 });

    res.json(tags);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при поиске тегов' });
  }
};

module.exports = {
  createTag,
  getAllTags,
  getPostsByTag,
  updateTag,
  deleteTag,
  searchTags
}; 