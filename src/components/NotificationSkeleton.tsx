import React from 'react';

interface NotificationSkeletonProps {
  count?: number;
}

const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ count = 5 }) => {
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
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-200 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Name and username skeleton */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                  
                  {/* Message skeleton */}
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  
                  {/* Post preview skeleton */}
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  
                  {/* Action buttons skeleton */}
                  <div className="flex items-center space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-14"></div>
                  </div>
                </div>
                
                {/* Action menu skeleton */}
                <div className="flex items-center space-x-1 ml-3">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
