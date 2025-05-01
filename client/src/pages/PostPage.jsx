import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { api } from '../utils/api';
import Comments from '../components/Comments';
import { useAuth } from '../contexts/AuthContext';

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
        setError(null);
        
        // После загрузки поста ищем похожие посты по тегам
        if (response.data.tags && response.data.tags.length) {
          try {
            const relatedResponse = await api.get(`/posts/related/${id}`);
            setRelatedPosts(relatedResponse.data);
          } catch (relErr) {
            console.error('Ошибка при загрузке похожих постов:', relErr);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке поста:', err.response || err);
        setError(err.response?.data?.message || 'Произошла ошибка при загрузке поста');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!currentUser) {
      // Если пользователь не авторизован, предлагаем войти
      if (window.confirm('Необходимо войти, чтобы ставить лайки. Перейти на страницу входа?')) {
        navigate('/login');
      }
      return;
    }
    
    try {
      const response = await api.post(`/posts/${id}/like`);
      setPost(prev => ({
        ...prev,
        likes: response.data.likes,
        isLiked: response.data.isLiked
      }));
    } catch (err) {
      console.error('Ошибка при попытке поставить лайк:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full">
          <div className="flex flex-col items-center text-center">
            <svg className="h-12 w-12 text-red-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 text-lg font-medium mb-2">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const renderContent = () => {
    // Проверяем, что это обычный текст, а не HTML
    if (!post.content.includes('<')) {
      // Разбиваем текст на абзацы
      return post.content.split('\n').map((paragraph, index) => 
        paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
      );
    }
    
    // Если это HTML, отображаем как есть
    return <div dangerouslySetInnerHTML={{ __html: post.content }} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="text-blue-500 hover:text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Вернуться на главную
          </Link>
        </div>
        
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          {post.coverImage && (
            <div className="relative h-96">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <h1 className="absolute bottom-0 left-0 right-0 text-4xl font-bold text-white p-6">
                {post.title}
              </h1>
            </div>
          )}

          <div className="p-6">
            {!post.coverImage && (
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center justify-between mb-6">
              <Link 
                to={`/user/${post.author.username}`}
                className="flex items-center space-x-3 mb-2"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {post.author.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author.username}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(post.createdAt), 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              </Link>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${
                    post.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                  } transition-colors`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-sm text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-800">
              {renderContent()}
            </div>
          </div>
        </article>

        {/* Комментарии */}
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Комментарии</h2>
          <Comments postId={id} currentUser={currentUser} />
        </div>

        {/* Похожие посты */}
        {relatedPosts.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Похожие статьи</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link 
                  key={relatedPost._id} 
                  to={`/post/${relatedPost._id}`}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-medium text-lg mb-2 text-gray-900">{relatedPost.title}</h3>
                  {relatedPost.tags && relatedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {relatedPost.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage; 