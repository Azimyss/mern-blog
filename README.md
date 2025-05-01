# MERN Blog App

## Стек технологий

- **Frontend:** React, React Router, Axios, TailwindCSS (по желанию)
- **Backend:** Node.js, Express
- **Database:** MongoDB (через Mongoose)
- **Auth:** JWT (JSON Web Token)
- **Hosting** (по желанию): 
  - Frontend: Vercel
  - Backend: Render/Heroku
  - Database: MongoDB Atlas

## Маршруты

### Публичные маршруты 🔓

| Путь | Описание |
|------|----------|
| `/` | Главная страница с открытыми постами |
| `/login` | Страница входа |
| `/register` | Страница регистрации |
| `/user/:username` | Профиль пользователя с публичными постами |
| `/post/:id` | Страница конкретного поста |

### Приватные маршруты 🔐

| Путь | Описание |
|------|----------|
| `/feed` | Лента из постов подписок |
| `/create-post` | Создание нового поста |
| `/edit-post/:id` | Редактирование поста |
| `/dashboard` | Управление постами и подписками |

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя (логин, пароль)
- `POST /api/auth/login` - Вход по логину и паролю, получение JWT токена

### Посты

- `POST /api/posts` - Создание поста
- `GET /api/posts/public` - Получение публичных постов
- `GET /api/posts/feed` - Получение ленты подписок
- `PUT /api/posts/:id` - Редактирование поста
- `DELETE /api/posts/:id` - Удаление поста
- `GET /api/posts?tags=tech,lifestyle` - Фильтрация по тегам

### Подписки

- `POST /api/users/:id/follow` - Подписка на пользователя
- `POST /api/users/:id/unfollow` - Отписка от пользователя

### Доступ к постам

- `POST /api/posts/:id/request-access` - Запрос доступа к посту
- `POST /api/posts/:id/grant-access/:userId` - Предоставление доступа

### Комментарии

- `POST /api/posts/:id/comments` - Добавление комментария
- `GET /api/posts/:id/comments` - Получение комментариев

## Структура базы данных

### Users
```json
{
  "_id": "ObjectId",
  "username": "String",
  "passwordHash": "String",
  "followers": ["UserId"],
  "following": ["UserId"],
  "requestedPosts": ["PostId"]
}
```

### Posts
```json
{
  "_id": "ObjectId",
  "author": "UserId",
  "title": "String",
  "content": "String",
  "tags": ["String"],
  "isPrivate": "Boolean",
  "isByRequest": "Boolean",
  "allowedUsers": ["UserId"],
  "createdAt": "Date"
}
```

### Comments
```json
{
  "_id": "ObjectId",
  "postId": "PostId",
  "author": "UserId",
  "text": "String",
  "createdAt": "Date"
}
```

## Функциональность

### Гость может:
- Просматривать публичные посты
- Регистрироваться/входить
- Просматривать профили пользователей

### Авторизованный пользователь может:
- Получать доступ к приватной ленте
- Создавать посты (публичные/приватные/по запросу)
- Подписываться на других пользователей
- Редактировать/удалять свои посты
- Использовать поиск и фильтрацию по тегам
- Комментировать посты
- Управлять доступом к своим постам 

## Структура проекта

```
📦 mern-blog
├── 📂 client/                  # Frontend часть
│   ├── 📂 public/             # Статические файлы
│   └── 📂 src/
│       ├── 📂 components/     # React компоненты
│       │   ├── 📂 auth/      # Компоненты аутентификации
│       │   ├── 📂 posts/     # Компоненты для постов
│       │   ├── 📂 layout/    # Общие компоненты layout
│       │   └── 📂 ui/        # Переиспользуемые UI компоненты
│       ├── 📂 pages/         # Страницы приложения
│       ├── 📂 services/      # API сервисы
│       ├── 📂 store/         # Управление состоянием
│       ├── 📂 hooks/         # Кастомные хуки
│       ├── 📂 utils/         # Вспомогательные функции
│       └── 📂 styles/        # Стили
├── 📂 server/                 # Backend часть
│   ├── 📂 config/            # Конфигурация
│   ├── 📂 controllers/       # Контроллеры
│   ├── 📂 middleware/        # Middleware
│   ├── 📂 models/           # Mongoose модели
│   ├── 📂 routes/           # API маршруты
│   ├── 📂 services/         # Бизнес-логика
│   └── 📂 utils/            # Вспомогательные функции
└── 📜 README.md
```

## Полная схема базы данных

### Users
```json
{
  "_id": "ObjectId",
  "username": "String",
  "passwordHash": "String",
  "followers": ["UserId"],
  "following": ["UserId"],
  "requestedPosts": ["PostId"],
  "createdAt": "Date",
  "updatedAt": "Date",
  "lastLoginAt": "Date",
  "isActive": "Boolean",
  "avatar": "String",
  "bio": "String"
}
```

### Posts
```json
{
  "_id": "ObjectId",
  "author": "UserId",
  "title": "String",
  "content": "String",
  "summary": "String",
  "tags": ["String"],
  "isPrivate": "Boolean",
  "isByRequest": "Boolean",
  "allowedUsers": ["UserId"],
  "likes": ["UserId"],
  "views": "Number",
  "commentsCount": "Number",
  "status": "String", // draft, published, archived
  "createdAt": "Date",
  "updatedAt": "Date",
  "publishedAt": "Date",
  "coverImage": "String"
}
```

### Comments
```json
{
  "_id": "ObjectId",
  "postId": "PostId",
  "author": "UserId",
  "text": "String",
  "likes": ["UserId"],
  "replies": [{
    "author": "UserId",
    "text": "String",
    "createdAt": "Date"
  }],
  "createdAt": "Date",
  "updatedAt": "Date",
  "isEdited": "Boolean"
}
```

### Tags
```json
{
  "_id": "ObjectId",
  "name": "String",
  "slug": "String",
  "postsCount": "Number",
  "createdAt": "Date"
}
```

### AccessRequests
```json
{
  "_id": "ObjectId",
  "postId": "PostId",
  "requestedBy": "UserId",
  "status": "String", // pending, approved, rejected
  "requestedAt": "Date",
  "respondedAt": "Date",
  "response": "String"
}
```

### Индексы

```javascript
// Users
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "followers": 1 })
db.users.createIndex({ "following": 1 })

// Posts
db.posts.createIndex({ "author": 1 })
db.posts.createIndex({ "tags": 1 })
db.posts.createIndex({ "createdAt": -1 })
db.posts.createIndex({ "isPrivate": 1 })
db.posts.createIndex({ "allowedUsers": 1 })

// Comments
db.comments.createIndex({ "postId": 1 })
db.comments.createIndex({ "author": 1 })

// Tags
db.tags.createIndex({ "name": 1 }, { unique: true })
db.tags.createIndex({ "slug": 1 }, { unique: true })

// AccessRequests
db.accessRequests.createIndex({ "postId": 1, "requestedBy": 1 }, { unique: true })
db.accessRequests.createIndex({ "status": 1 })
``` 