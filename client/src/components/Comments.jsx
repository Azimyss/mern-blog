import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Comment from './Comment';

const Comments = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('Загрузка комментариев для поста:', postId);
      const response = await api.get(`/comments/post/${postId}`);
      console.log('Полученные комментарии:', response.data);
      setComments(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке комментариев:', err.response || err);
      setError(err.response?.data?.message || 'Ошибка при загрузке комментариев');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/comments/post/${postId}`, {
        text: newComment
      });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setError(null);
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err.response || err);
      setError(err.response?.data?.message || 'Ошибка при добавлении комментария');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      setError(null);
    } catch (err) {
      console.error('Ошибка при удалении комментария:', err.response || err);
      setError(err.response?.data?.message || 'Ошибка при удалении комментария');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Пока нет комментариев. Будьте первым!
          </div>
        ) : (
          comments.map(comment => (
            <Comment
              key={comment._id}
              comment={comment}
              onDelete={handleDelete}
              canDelete={currentUser && (
                currentUser._id === comment.author._id || 
                currentUser.role === 'admin'
              )}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Comments; 