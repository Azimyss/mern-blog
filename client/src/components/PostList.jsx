import React from 'react';
import PostCard from './PostCard';

const PostList = ({ posts, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Произошла ошибка при загрузке постов: {error}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        Посты не найдены
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList; 