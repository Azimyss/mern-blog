import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Comment = ({ comment, onDelete, canDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {comment.author.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <Link 
              to={`/user/${comment.author.username}`}
              className="font-medium text-gray-900 hover:text-blue-600"
            >
              {comment.author.username}
            </Link>
            <p className="text-sm text-gray-500">
              {format(new Date(comment.createdAt), 'd MMMM yyyy в HH:mm', { locale: ru })}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={() => onDelete(comment._id)}
            className="text-gray-400 hover:text-red-500"
            title="Удалить комментарий"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="text-gray-700 whitespace-pre-wrap">
        {comment.text}
      </div>
    </div>
  );
};

export default Comment; 