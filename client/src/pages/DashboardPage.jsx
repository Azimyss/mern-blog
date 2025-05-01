import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, posts, users } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Пользователь не авторизован, перенаправляем на страницу входа');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Проверка токена перед запросом
        const token = localStorage.getItem('token');
        console.log('Токен авторизации перед запросом:', token ? `${token.substring(0, 10)}...` : 'отсутствует');
        console.log('Текущий пользователь:', currentUser);
        console.log(`Запрашиваем данные для вкладки "${activeTab}"`);
        
        if (activeTab === 'posts') {
          const response = await posts.getMyPosts();
          console.log('Ответ от API (мои посты):', response.data.length);
          setUserPosts(response.data);
        } else if (activeTab === 'followers') {
          const response = await users.getFollowers();
          console.log('Ответ от API (подписчики):', response.data.length);
          setFollowers(response.data);
        } else if (activeTab === 'following') {
          const response = await users.getFollowing();
          console.log('Ответ от API (подписки):', response.data.length);
          setFollowing(response.data);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Ошибка при загрузке данных для вкладки "${activeTab}":`, err);
        console.log('Детали ошибки:', {
          status: err.response?.status,
          message: err.response?.data?.message,
        });
        
        // Если ошибка 401, перенаправляем на страницу входа
        if (err.response?.status === 401) {
          console.log('Ошибка авторизации, перенаправляем на страницу входа');
          navigate('/login');
        } else {
          setError(`Не удалось загрузить данные. Пожалуйста, попробуйте позже.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, isAuthenticated, navigate, currentUser]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.')) {
      return;
    }
    
    try {
      console.log('Отправка запроса на удаление поста:', postId);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Попытка удаления поста без токена авторизации');
        alert('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
        navigate('/login');
        return;
      }
      
      await posts.delete(postId);
      console.log('Пост успешно удален, ID:', postId);
      
      // Обновляем список постов после удаления
      setUserPosts(userPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Ошибка при удалении поста:', err);
      
      // Более детальная обработка ошибок
      if (err.response?.status === 401) {
        alert('Необходима авторизация. Пожалуйста, войдите в систему заново.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        alert('У вас нет прав на удаление этого поста.');
      } else {
        alert('Не удалось удалить статью. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handleUnfollow = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите отписаться от этого пользователя?')) {
      return;
    }
    
    try {
      await users.unfollow(userId);
      // Обновляем список подписок после отписки
      setFollowing(following.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Ошибка при отписке:', err);
      alert('Не удалось отписаться. Пожалуйста, попробуйте позже.');
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      );
    }

    if (activeTab === 'posts') {
      return renderPosts();
    } else if (activeTab === 'followers') {
      return renderUsers(followers, false);
    } else if (activeTab === 'following') {
      return renderUsers(following, true);
    }
  };

  const renderPosts = () => {
    if (userPosts.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">У вас еще нет опубликованных статей.</p>
          <Link 
            to="/create-post"
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Создать новую статью
          </Link>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Заголовок</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Дата</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Просмотры</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Статус</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {userPosts.map(post => (
              <tr key={post._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link to={`/post/${post._id}`} className="text-primary-600 font-medium hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {format(new Date(post.createdAt), 'd MMM yyyy', { locale: ru })}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {post.views || 0}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.isPrivate 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {post.isPrivate ? 'Приватный' : 'Публичный'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Link 
                    to={`/edit-post/${post._id}`}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    Изменить
                  </Link>
                  <button 
                    onClick={() => handleDeletePost(post._id)}
                    className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUsers = (users, showUnfollow) => {
    if (users.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">
            {activeTab === 'followers' 
              ? 'У вас еще нет подписчиков.' 
              : 'Вы еще не подписаны ни на одного пользователя.'}
          </p>
          {activeTab === 'following' && (
            <Link 
              to="/"
              className="mt-4 inline-block px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Найти интересных авторов
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user._id} className="bg-white shadow rounded-lg p-4 flex items-start">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <Link 
                to={`/user/${user.username}`}
                className="text-lg font-medium text-gray-900 hover:text-primary-600"
              >
                {user.username}
              </Link>
              {user.bio && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{user.bio}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                {user.postsCount || 0} статей • {user.followersCount || 0} подписчиков
              </div>
              {showUnfollow && (
                <button 
                  onClick={() => handleUnfollow(user._id)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Отписаться
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Моя панель управления</h1>
      
      {/* Вкладки */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Мои статьи
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'followers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Подписчики
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'following'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Подписки
          </button>
        </nav>
      </div>
      
      {/* Содержимое активной вкладки */}
      {renderTabContent()}
    </div>
  );
};

export default DashboardPage; 