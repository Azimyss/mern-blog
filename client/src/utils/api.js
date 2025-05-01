import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    console.log('Отправка запроса:', config.method.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    console.log('Токен доступен в localStorage:', token ? 'Да' : 'Нет');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Токен добавлен в заголовки:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('Запрос отправляется без токена авторизации');
      
      // Для операций требующих обязательную авторизацию, проверяем URL и метод
      if ((config.url.includes('/posts/') && (config.method === 'delete' || config.method === 'put')) || 
          config.url.includes('/users/follow/') || 
          config.url.includes('/users/unfollow/')) {
        console.error('ВНИМАНИЕ: Попытка выполнить операцию, требующую авторизацию, без токена');
      }
    }
    
    console.log('Заголовки запроса:', config.headers);
    console.log('URL запроса:', config.url);
    console.log('Метод запроса:', config.method);
    
    return config;
  },
  (error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

// Обработка ответов
api.interceptors.response.use(
  (response) => {
    console.log('Получен ответ:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Ошибка ответа:', error.response || error);
    
    // Если токен истек или недействителен, разлогиниваем пользователя
    if (error.response?.status === 401) {
      console.log('Ошибка авторизации (401), перенаправляем на вход');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Используем window.location вместо navigate, т.к. этот код может выполниться вне компонента React
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Аутентификация
export const auth = {
  register: (username, password) => 
    api.post('/auth/register', { username, password }),
  
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  getProfile: () => 
    api.get('/auth/profile')
};

// Посты
export const posts = {
  getPublic: () => 
    api.get('/posts/public'),
  
  getById: (id) => 
    api.get(`/posts/${id}`),
  
  create: (postData) => 
    api.post('/posts', postData),
  
  update: (id, postData) => 
    api.put(`/posts/${id}`, postData),
  
  delete: (id) => {
    console.log(`Вызов метода удаления поста с ID: ${id}`);
    const token = localStorage.getItem('token');
    console.log('Токен доступен при удалении:', token ? 'Да' : 'Нет');
    
    // Явно добавляем токен в заголовки для этого запроса
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Заголовки для запроса удаления:', headers);
    return api.delete(`/posts/${id}`, { headers });
  },
  
  getFeed: () => {
    console.log('Запрос к API: GET /posts/feed');
    const token = localStorage.getItem('token');
    console.log('Токен в getFeed:', token ? 'присутствует' : 'отсутствует');
    // Проверяем, установлен ли заголовок Authorization
    console.log('Headers в getFeed:', api.defaults.headers);
    return api.get('/posts/feed');
  },
    
  getMyPosts: () => {
    console.log('Запрос к API: GET /posts/my');
    const token = localStorage.getItem('token');
    console.log('Токен в getMyPosts:', token ? 'присутствует' : 'отсутствует');
    return api.get('/posts/my');
  },
};

// Комментарии
export const comments = {
  getForPost: (postId) => 
    api.get(`/comments/post/${postId}`),
  
  create: (postId, text) => 
    api.post(`/comments/post/${postId}`, { text }),
  
  reply: (commentId, text) => 
    api.post(`/comments/${commentId}/reply`, { text }),
  
  toggleLike: (commentId) => 
    api.post(`/comments/${commentId}/like`)
};

// Теги
export const tags = {
  getAll: () => 
    api.get('/tags'),
  
  search: (query) => 
    api.get(`/tags/search?query=${query}`),
  
  getPostsByTag: (slug) => 
    api.get(`/tags/${slug}/posts`)
};

// Пользователи
export const users = {
  getProfile: (username) => {
    console.log('Вызов API для получения профиля:', username);
    return api.get(`/users/profile/${username}`);
  },
  
  follow: (userId) => {
    console.log('Вызов API для подписки на пользователя:', userId);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Попытка подписки без токена авторизации');
      return Promise.reject(new Error('Требуется авторизация'));
    }
    return api.post(`/users/follow/${userId}`);
  },
  
  unfollow: (userId) => {
    console.log('Вызов API для отписки от пользователя:', userId);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Попытка отписки без токена авторизации');
      return Promise.reject(new Error('Требуется авторизация'));
    }
    return api.post(`/users/unfollow/${userId}`);
  },
  
  getFollowers: () => {
    console.log('Вызов API для получения подписчиков');
    return api.get(`/users/followers`);
  },
  
  getFollowing: () => {
    console.log('Вызов API для получения подписок');
    return api.get(`/users/following`);
  },
    
  getFollowersOf: (userId) => 
    api.get(`/users/${userId}/followers`),
  
  getFollowingOf: (userId) => 
    api.get(`/users/${userId}/following`),
};

export { api }; 