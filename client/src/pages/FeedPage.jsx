import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostList from '../components/PostList';
import { api, posts as postsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем авторизацию пользователя
    if (!isAuthenticated) {
      console.log('Пользователь не авторизован, перенаправляем на страницу входа');
      navigate('/login');
      return;
    }

    const fetchFeed = async () => {
      try {
        setLoading(true);
        // Проверка токена перед запросом
        const token = localStorage.getItem('token');
        console.log('Токен авторизации перед запросом:', token ? `${token.substring(0, 10)}...` : 'отсутствует');
        console.log('Текущий пользователь:', currentUser);
        
        console.log('Попытка получения ленты постов...');
        const response = await postsApi.getFeed();
        console.log('Получен ответ для ленты:', response);
        setPosts(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке ленты:', err);
        console.log('Детали ошибки:', {
          status: err.response?.status,
          message: err.response?.data?.message,
        });
        
        // Если ошибка 401, перенаправляем на страницу входа
        if (err.response?.status === 401) {
          console.log('Ошибка авторизации, перенаправляем на страницу входа');
          navigate('/login');
        } else {
          setError('Не удалось загрузить ленту. Пожалуйста, попробуйте позже.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [isAuthenticated, navigate, currentUser]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Моя лента</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Ваша лента пуста</h2>
          <p className="text-gray-600 mb-4">
            Ваша лента будет отображать посты от пользователей, на которых вы подписаны.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Найти интересных авторов
          </button>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
};

export default FeedPage; 