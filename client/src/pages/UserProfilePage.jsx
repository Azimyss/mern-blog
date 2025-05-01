import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostList from '../components/PostList';
import { api, users } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const UserProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Загрузка профиля пользователя:', username);
        
        // Загружаем данные пользователя и его посты
        const response = await users.getProfile(username);
        console.log('Получены данные профиля:', response.data);
        
        const userData = response.data.user;
        const userPosts = response.data.posts;
        
        setUser(userData);
        setPosts(userPosts);
        setIsFollowing(response.data.isFollowing);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке профиля:', err);
        setError('Не удалось загрузить профиль пользователя. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      if (window.confirm('Для подписки необходимо авторизоваться. Перейти на страницу входа?')) {
        navigate('/login');
      }
      return;
    }

    try {
      if (isFollowing) {
        // Отписка
        console.log('Отписка от пользователя:', user._id);
        await users.unfollow(user._id);
        console.log('Успешная отписка');
      } else {
        // Подписка
        console.log('Подписка на пользователя:', user._id);
        await users.follow(user._id);
        console.log('Успешная подписка');
      }
      
      // Обновляем состояние подписки
      setIsFollowing(!isFollowing);
      
      // Обновляем количество подписчиков
      setUser(prevUser => ({
        ...prevUser,
        followersCount: isFollowing 
          ? (prevUser.followersCount || 1) - 1
          : (prevUser.followersCount || 0) + 1
      }));
    } catch (err) {
      console.error(`Ошибка при ${isFollowing ? 'отписке' : 'подписке'}:`, err);
      alert(`Не удалось ${isFollowing ? 'отписаться' : 'подписаться'}. Попробуйте позже.`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Профиль пользователя */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Аватар пользователя */}
            <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {username[0].toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{username}</h1>
                
                {!isOwnProfile && currentUser && (
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-md mt-3 sm:mt-0 ${
                      isFollowing 
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    } transition-colors`}
                  >
                    {isFollowing ? 'Отписаться' : 'Подписаться'}
                  </button>
                )}
                
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md mt-3 sm:mt-0"
                  >
                    Редактировать профиль
                  </button>
                )}
              </div>
              
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              <div className="flex space-x-6 text-sm text-gray-500">
                <div>
                  <span className="font-semibold text-gray-900">{posts.length}</span> статей
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{user.followersCount || 0}</span> подписчиков
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{user.followingCount || 0}</span> подписок
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Посты пользователя */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Статьи пользователя</h2>
      
      {posts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">
            {isOwnProfile 
              ? 'У вас еще нет опубликованных статей.' 
              : 'У этого пользователя еще нет опубликованных статей.'}
          </p>
          {isOwnProfile && (
            <button 
              onClick={() => navigate('/create-post')}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Создать новую статью
            </button>
          )}
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
};

export default UserProfilePage; 