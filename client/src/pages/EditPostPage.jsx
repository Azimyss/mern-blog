import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    isPrivate: false,
    coverImage: ''
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        const fetchedPost = response.data;
        
        // Проверяем, является ли текущий пользователь автором поста
        if (fetchedPost.author._id !== currentUser?._id) {
          navigate('/');
          return;
        }
        
        setPost({
          title: fetchedPost.title,
          content: fetchedPost.content,
          excerpt: fetchedPost.excerpt || '',
          tags: fetchedPost.tags ? fetchedPost.tags.join(', ') : '',
          isPrivate: fetchedPost.isPrivate || false,
          coverImage: fetchedPost.coverImage || ''
        });
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке поста:', err);
        setError('Не удалось загрузить пост для редактирования. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPost();
    } else {
      navigate('/login');
    }
  }, [id, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Преобразуем строку тегов в массив
      const tagsArray = post.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      await api.put(`/posts/${id}`, {
        ...post,
        tags: tagsArray
      });
      
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Ошибка при обновлении поста:', err);
      setError('Не удалось обновить пост. Пожалуйста, проверьте введенные данные и попробуйте снова.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Редактирование статьи</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Заголовок
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Введите заголовок статьи"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-gray-700 font-medium mb-2">
            Краткое описание
          </label>
          <input
            type="text"
            id="excerpt"
            name="excerpt"
            value={post.excerpt}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Краткое описание статьи (до 160 символов)"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
            Содержание
          </label>
          <textarea
            id="content"
            name="content"
            value={post.content}
            onChange={handleInputChange}
            required
            rows="12"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Введите текст статьи..."
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
            Теги (через запятую)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={post.tags}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Например: технологии, программирование, веб-разработка"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="coverImage" className="block text-gray-700 font-medium mb-2">
            URL обложки
          </label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={post.coverImage}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com/image.jpg"
          />
          {post.coverImage && (
            <div className="mt-2">
              <img 
                src={post.coverImage} 
                alt="Предпросмотр обложки" 
                className="max-h-40 rounded-md"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPrivate"
              checked={post.isPrivate}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Сделать приватным (только для подписчиков)</span>
          </label>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(`/post/${id}`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 ${
              submitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage; 