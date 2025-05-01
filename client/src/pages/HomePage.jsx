import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import PostList from '../components/PostList';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/posts/public');
        setPosts(response.data);
        
        // Извлекаем уникальные теги из постов
        const allTags = response.data.reduce((acc, post) => {
          if (post.tags && post.tags.length) {
            post.tags.forEach(tag => {
              if (!acc.includes(tag)) {
                acc.push(tag);
              }
            });
          }
          return acc;
        }, []);
        
        setTags(allTags);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке постов:', err);
        setError(err.response?.data?.message || 'Произошла ошибка при загрузке постов');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser]);

  // Фильтрация постов по выбранному тегу
  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags && post.tags.includes(selectedTag))
    : posts;

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Приветственный баннер */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16 shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {currentUser 
                  ? `Добро пожаловать, ${currentUser.username}!` 
                  : 'Добро пожаловать в MERN Blog'}
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl">
                {currentUser 
                  ? 'Здесь вы можете читать и публиковать интересные статьи на различные темы'
                  : 'Современная платформа для обмена знаниями и идеями'}
              </p>
              
              {!currentUser ? (
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/login"
                    className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Войти
                  </Link>
                  <Link 
                    to="/register"
                    className="px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Зарегистрироваться
                  </Link>
                </div>
              ) : (
                <Link 
                  to="/create-post"
                  className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Создать пост
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Фильтры по тегам */}
        {tags.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Популярные темы
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagClick(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedTag === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                Все
              </button>
              
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedTag === tag
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Посты */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedTag ? `Посты по теме #${selectedTag}` : 'Последние публикации'}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-600">По вашему запросу не найдено постов</p>
            </div>
          ) : (
            <PostList posts={filteredPosts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 