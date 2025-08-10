import React from 'react';

interface ConversationSkeletonProps {
  count?: number;
}

const ConversationSkeleton: React.FC<ConversationSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex items-center space-x-3">
            {/* Avatar skeleton */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                {/* Name and username skeleton */}
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                
                {/* Time skeleton */}
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              
              {/* Message preview skeleton */}
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            
            {/* Unread count skeleton */}
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationSkeleton;
