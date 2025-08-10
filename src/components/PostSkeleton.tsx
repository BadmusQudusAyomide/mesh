import React from 'react';

interface PostSkeletonProps {
  count?: number;
}

const PostSkeleton: React.FC<PostSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg animate-pulse"
        >
          {/* Header skeleton */}
          <div className="flex items-start space-x-4 mb-4">
            {/* Avatar skeleton */}
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            
            {/* User info skeleton */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            
            {/* Menu skeleton */}
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-3 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Image skeleton (randomly show/hide to simulate real posts) */}
          {Math.random() > 0.5 && (
            <div className="w-full h-64 bg-gray-200 rounded-xl mb-4"></div>
          )}
          
          {/* Engagement bar skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Like, Comment, Share buttons */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
            
            {/* Bookmark skeleton */}
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeleton;
