# Техническое задание на рефакторинг MERN-блога

## Описание проекта

Проект представляет собой блог-платформу на стеке MERN (MongoDB, Express, React, Node.js). Необходимо провести рефакторинг кода для повышения качества, устранения дублирования, улучшения читаемости и оптимизации структуры.

## Цели рефакторинга

1. Разделить логику на слои (routes, controllers, services, models, middlewares, utils)
2. Устранить дублирование кода
3. Упростить поддержку и расширение проекта
4. Стандартизировать обработку ошибок и логирование
5. Улучшить валидацию данных
6. Оптимизировать работу с базой данных

## 1. Реструктуризация файловой системы 

### Серверная часть

#### Создать структуру папок:

```
📦 server/
├── 📂 config/                  # Конфигурационные файлы
│   ├── 📜 db.js                # Подключение к MongoDB
│   ├── 📜 logger.js            # Конфигурация Winston для логирования
│   └── 📜 index.js             # Экспорт всех конфигураций
├── 📂 models/                  # Mongoose модели (остаются без изменений)
├── 📂 services/                # Сервисный слой (бизнес-логика)
│   ├── 📜 authService.js       # Логика аутентификации
│   ├── 📜 postService.js       # Логика работы с постами
│   ├── 📜 userService.js       # Логика работы с пользователями
│   ├── 📜 commentService.js    # Логика работы с комментариями
│   └── 📜 tagService.js        # Логика работы с тегами
├── 📂 middlewares/             # Middleware компоненты
│   ├── 📜 auth.js              # Аутентификация (существующий)
│   ├── 📜 errorHandler.js      # Централизованная обработка ошибок
│   ├── 📜 validator.js         # Валидация данных с express-validator
│   └── 📜 logger.js            # Middleware для логирования запросов
├── 📂 utils/                   # Вспомогательные функции
│   ├── 📜 apiError.js          # Класс ошибок API
│   ├── 📜 formatters.js        # Форматирование данных
│   ├── 📜 validators.js        # Схемы валидации
│   └── 📜 helpers.js           # Общие вспомогательные функции
└── 📜 server.js                # Входная точка приложения
```

#### Задачи:
- Создать указанные директории и файлы
- Перенести существующий код в новую структуру
- Установить недостающие зависимости

### Клиентская часть

#### Создать структуру папок:

```
📦 client/
├── 📂 src/
│   ├── 📂 api/                 # API взаимодействие
│   │   ├── 📜 axios.js         # Настройка axios с интерцепторами
│   │   ├── 📜 authApi.js       # Методы API для аутентификации
│   │   ├── 📜 postApi.js       # Методы API для операций с постами
│   │   ├── 📜 userApi.js       # Методы API для операций с пользователями
│   │   └── 📜 commentApi.js    # Методы API для операций с комментариями
│   ├── 📂 hooks/               # Пользовательские хуки React
│   │   ├── 📜 useAuth.js       # Хук для работы с аутентификацией
│   │   ├── 📜 usePosts.js      # Хук для работы с постами
│   │   ├── 📜 useUsers.js      # Хук для работы с пользователями
│   │   └── 📜 useForm.js       # Хук для упрощения работы с формами
│   ├── 📂 utils/               # Вспомогательные функции
│   │   ├── 📜 formatters.js    # Форматирование дат, текста и т.д.
│   │   ├── 📜 validators.js    # Клиентская валидация
│   │   └── 📜 helpers.js       # Общие вспомогательные функции
```

#### Задачи:
- Создать указанные директории и файлы
- Реорганизовать код в соответствии с новой структурой
- Обновить импорты во всех затронутых файлах

## 2. Серверная часть

### 2.1. Установка зависимостей

```
npm install winston express-validator lodash
```

### 2.2. Создание сервисного слоя

#### Задачи:
- Перенести бизнес-логику из контроллеров в соответствующие сервисы
- Выделить повторяющиеся операции в отдельные функции
- Оптимизировать запросы к базе данных

#### Пример реализации postService.js:

```javascript
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const ApiError = require('../utils/apiError');
const logger = require('../config/logger');
const { formatPostSummary } = require('../utils/formatters');

// Создание нового поста
const createPost = async (userId, postData) => {
  logger.info(`Creating post for user: ${userId}`);
  
  // Создаем краткое описание из контента, если не указано
  const summary = postData.summary || formatPostSummary(postData.content);

  const post = await Post.create({
    author: userId,
    title: postData.title,
    content: postData.content,
    summary,
    isPrivate: postData.isPrivate || false,
    isByRequest: postData.isByRequest || false,
    tags: postData.tags || [],
    coverImage: postData.coverImage
  });

  logger.info(`Post created: ${post._id}`);
  return post;
};

// Другие методы...

module.exports = {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
  getFeedPosts,
  checkPostAccess
};
```

### 2.3. Упрощение контроллеров

#### Задачи:
- Сделать контроллеры "тонкими" - оставить только обработку HTTP запросов/ответов
- Переместить логику обработки данных в сервисы
- Добавить обработку ошибок с использованием общего механизма

#### Пример реализации postController.js:

```javascript
const postService = require('../services/postService');
const logger = require('../config/logger');

// Создание нового поста
const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user._id, req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// Другие методы...

module.exports = {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
  getFeedPosts
};
```

### 2.4. Обработка ошибок

#### Задачи:
- Создать класс ApiError для унифицированной обработки ошибок
- Реализовать middleware для централизованной обработки ошибок
- Добавить типы ошибок для различных случаев (404, 401, 403, 400, 500)

#### Пример реализации apiError.js:

```javascript
class ApiError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
  
  static badRequest(message, errors = []) {
    return new ApiError(message, 400, errors);
  }
  
  static unauthorized(message = 'Не авторизован') {
    return new ApiError(message, 401);
  }
  
  static forbidden(message = 'Доступ запрещен') {
    return new ApiError(message, 403);
  }
  
  static notFound(message = 'Ресурс не найден') {
    return new ApiError(message, 404);
  }
  
  static serverError(message = 'Внутренняя ошибка сервера') {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;
```

### 2.5. Валидация данных

#### Задачи:
- Интегрировать express-validator для валидации данных в API
- Создать схемы валидации для различных сущностей (пользователи, посты, комментарии)
- Добавить middleware для обработки ошибок валидации

#### Пример реализации схем валидации:

```javascript
const { body } = require('express-validator');

// Валидация создания/обновления поста
const postValidation = [
  body('title')
    .notEmpty().withMessage('Заголовок обязателен')
    .isLength({ min: 3, max: 100 }).withMessage('Заголовок должен быть от 3 до 100 символов'),
  
  body('content')
    .notEmpty().withMessage('Содержание поста обязательно')
    .isLength({ min: 10 }).withMessage('Содержание должно быть не менее 10 символов'),
  
  // Другие поля...
];

// Другие схемы...

module.exports = {
  postValidation,
  registerValidation,
  loginValidation,
  commentValidation
};
```

### 2.6. Логирование

#### Задачи:
- Настроить логирование с использованием Winston
- Создать middleware для логирования запросов
- Заменить все console.log на использование логгера

#### Пример реализации logger.js:

```javascript
const winston = require('winston');
const path = require('path');

// Определяем форматы для логов
const formats = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Настройка логгера
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: formats,
  defaultMeta: { service: 'mern-blog' },
  transports: [
    // Транспорты...
  ]
});

module.exports = logger;
```

## 3. Клиентская часть

### 3.1. Реорганизация API-слоя

#### Задачи:
- Разделить API-слой на модули по сущностям
- Вынести настройки axios в отдельный файл
- Удалить дублирующий код работы с токеном

#### Пример реализации axios.js:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцепторы...

export default api;
```

#### Пример реализации postApi.js:

```javascript
import api from './axios';

const postApi = {
  getPublic: () => api.get('/posts/public'),
  getById: (id) => api.get(`/posts/${id}`),
  create: (postData) => api.post('/posts', postData),
  update: (id, postData) => api.put(`/posts/${id}`, postData),
  delete: (id) => api.delete(`/posts/${id}`),
  getFeed: () => api.get('/posts/feed'),
  getMyPosts: () => api.get('/posts/my'),
};

export default postApi;
```

### 3.2. Создание пользовательских хуков

#### Задачи:
- Создать хуки для работы с API и состоянием
- Вынести повторяющуюся логику из компонентов
- Упростить обработку загрузки и ошибок

#### Пример реализации usePosts.js:

```javascript
import { useState, useCallback } from 'react';
import postApi from '../api/postApi';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPublicPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postApi.getPublic();
      setPosts(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при загрузке постов');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Другие методы...

  return {
    posts,
    loading,
    error,
    fetchPublicPosts,
    // Другие методы...
  };
};
```

### 3.3. Разделение больших компонентов

#### Задачи:
- Разделить компоненты, превышающие 200 строк, на подкомпоненты
- Вынести повторяющиеся фрагменты UI в переиспользуемые компоненты
- Оптимизировать обновление компонентов (React.memo, useCallback)

#### Пример разделения Navbar.jsx:

```
📂 components/
└── 📂 layout/
    └── 📂 Navbar/
        ├── 📜 index.jsx         # Основной компонент
        ├── 📜 DesktopMenu.jsx   # Меню для десктопа
        ├── 📜 MobileMenu.jsx    # Мобильное меню
        ├── 📜 Logo.jsx          # Компонент логотипа
        ├── 📜 AuthButtons.jsx   # Кнопки авторизации
        └── 📜 UserProfile.jsx   # Профиль пользователя
```

## 4. Интеграция и тестирование

### 4.1. План интеграции

1. Начать с серверной части:
   - Создать структуру папок и файлов
   - Реализовать логирование и обработку ошибок
   - Реализовать сервисный слой
   - Обновить контроллеры и маршруты
   - Добавить валидацию

2. Продолжить клиентской частью:
   - Создать структуру папок и файлов
   - Реорганизовать API-слой
   - Создать пользовательские хуки
   - Разделить большие компоненты

### 4.2. Тестирование

- Проверить все API-эндпоинты
- Протестировать логирование и обработку ошибок
- Проверить правильность работы валидации
- Протестировать клиентскую часть на разных устройствах

## 5. Необходимые зависимости

### Серверная часть
- winston
- express-validator
- lodash

### Клиентская часть
- date-fns (для форматирования дат)
- lodash (опционально, для работы с массивами и объектами)
- react-hook-form (опционально, для работы с формами)

## 6. Сроки реализации

Общее время реализации: 2-3 недели

1. Реструктуризация серверной части - 5-7 дней
2. Реструктуризация клиентской части - 5-7 дней
3. Интеграция и тестирование - 3-5 дней
4. Исправление ошибок и доработки - 2-3 дня

## Заключение

Предложенный рефакторинг значительно улучшит качество кода, упростит его поддержку и расширение, а также повысит надежность системы благодаря улучшенному логированию, обработке ошибок и валидации данных. 