const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Регистрация пользователя
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверяем существование пользователя
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Создаем пользователя
    const user = await User.create({
      username,
      passwordHash: password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при создании пользователя' });
  }
};

// Вход пользователя
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Находим пользователя
    const user = await User.findOne({ username });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Неверный логин или пароль' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при входе' });
  }
};

// Получение профиля пользователя
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: 'Пользователь не найден' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
}; 