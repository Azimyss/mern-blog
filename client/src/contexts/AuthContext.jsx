import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Добавляем отладочный эффект для отслеживания изменений currentUser
  useEffect(() => {
    console.log('currentUser изменен:', currentUser);
  }, [currentUser]);

  const updateAuthHeaders = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Токен установлен в заголовках:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      delete api.defaults.headers.common['Authorization'];
      console.log('Токен удален из заголовков');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Инициализация AuthContext, токен есть:', !!token);
    console.log('Инициализация AuthContext, пользователь в localStorage:', !!storedUser);
    
    if (token) {
      // Устанавливаем токен в заголовки запросов глобально
      updateAuthHeaders(token);
      
      // Пробуем получить данные пользователя с сервера
      checkAuth();
    } else if (storedUser) {
      // Если токена нет, но есть данные пользователя в localStorage,
      // пробуем восстановить сессию из localStorage
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData._id && userData.username) {
          console.log('Восстановление данных пользователя из localStorage без токена:', userData);
          setCurrentUser(userData);
        }
      } catch (e) {
        console.error('Ошибка при парсинге данных пользователя из localStorage:', e);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('Данные пользователя получены:', response.data);
      
      // Предполагаем, что ответ от /auth/me уже содержит нужные поля пользователя
      const userData = response.data;
      
      // Убедимся, что имеем корректный объект пользователя
      const userObject = {
        _id: userData._id,
        username: userData.username,
        // Добавляем другие поля пользователя из ответа при необходимости
      };
      
      setCurrentUser(userObject);
      setError(null);
    } catch (err) {
      console.error('Ошибка при проверке авторизации:', err);
      
      // Если ошибка 404 (Not Found) или 500 (Server Error), 
      // но у нас есть данные пользователя в localStorage,
      // не разлогиниваем пользователя, а используем данные из localStorage
      if ((err.response?.status === 404 || err.response?.status === 500) && 
          localStorage.getItem('user')) {
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          if (userData && userData._id && userData.username) {
            console.log('Восстановление данных пользователя из localStorage:', userData);
            setCurrentUser(userData);
            setError(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Ошибка при парсинге данных пользователя из localStorage:', e);
        }
      }
      
      // Если произошла ошибка авторизации (401), или не удалось восстановить
      // данные из localStorage, разлогиниваем пользователя
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setError('Сессия истекла');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const userData = response.data;
      const token = userData.token;
      
      // Создаем объект пользователя
      const userObject = {
        _id: userData._id,
        username: userData.username
      };
      
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObject));
      
      // Устанавливаем токен в заголовки запросов
      updateAuthHeaders(token);
      
      // Обновляем состояние
      setCurrentUser(userObject);
      setError(null);
      console.log('Успешный вход:', userObject);
      return true;
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.response?.data?.message || 'Ошибка при входе');
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.post('/auth/register', { username, password });
      const userData = response.data;
      const token = userData.token;
      
      // Создаем объект пользователя
      const userObject = {
        _id: userData._id,
        username: userData.username
      };
      
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObject));
      
      // Устанавливаем токен в заголовки запросов
      updateAuthHeaders(token);
      
      // Обновляем состояние
      setCurrentUser(userObject);
      setError(null);
      console.log('Успешная регистрация:', userObject);
      return true;
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError(err.response?.data?.message || 'Ошибка при регистрации');
      return false;
    }
  };

  const logout = () => {
    // Удаляем данные из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Удаляем токен из заголовков запросов
    updateAuthHeaders(null);
    
    // Сбрасываем состояние
    setCurrentUser(null);
    setError(null);
    console.log('Пользователь вышел из системы');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 