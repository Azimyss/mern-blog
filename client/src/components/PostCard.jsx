import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PostCard = ({ post }) => {
  const {
    _id,
    title,
    excerpt,
    author,
    createdAt,
    tags,
    likes,
    commentsCount,
    coverImage
  } = post;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {coverImage && (
        <img
          src={coverImage}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <Link to={`/post/${_id}`}>
          <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-2">
            {title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {excerpt}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Link 
            to={`/user/${author.username}`}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            {author.username}
          </Link>
          <span className="mx-2">•</span>
          <time dateTime={createdAt}>
            {format(new Date(createdAt), 'd MMMM yyyy', { locale: ru })}
          </time>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <Link
                key={tag}
                to={`/tags/${tag}`}
                className="px-2 py-1 bg-gray-100 text-sm text-gray-600 rounded-full hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {likes}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {commentsCount}
            </span>
          </div>
          
          <Link 
            to={`/post/${_id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Читать далее →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 