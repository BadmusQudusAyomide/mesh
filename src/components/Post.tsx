import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Verified,
  Flame,
  Eye,
  Activity,
  Hash,
} from "lucide-react";

interface PostProps {
  post: any;
  formatNumber: (num: number) => string;
  handleLike: (postId: number) => void;
  handleBookmark: (postId: number) => void;
}

const Post = ({
  post,
  formatNumber,
  handleLike,
  handleBookmark,
}: PostProps) => (
  <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
    {/* Post Header */}
    <div className="p-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={post.avatar}
              alt={post.user}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white"
            />
            {post.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Verified className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-800">{post.user}</span>
              {post.trending && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-orange-500/20 rounded-lg">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">
                    Trending
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>@{post.username}</span>
              <span>•</span>
              <span>{post.time}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(post.views)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded-lg">
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">
              {post.engagement}%
            </span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-gray-800 text-[15px] leading-relaxed">
          {post.content}
        </p>
      </div>
    </div>
    {/* Post Image */}
    {post.image && (
      <div className="px-6 pb-4">
        <div className="rounded-2xl overflow-hidden">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      </div>
    )}
    {/* Post Actions */}
    <div className="px-6 py-4 bg-gray-50/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              post.isLiked
                ? "bg-red-500/20 text-red-500"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
            />
            <span className="font-medium">{formatNumber(post.likes)}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{formatNumber(post.comments)}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">{formatNumber(post.shares)}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded-lg">
            <Hash className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-600 font-medium">
              {post.category}
            </span>
          </div>
          <button
            onClick={() => handleBookmark(post.id)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              post.isBookmarked
                ? "bg-blue-500/20 text-blue-500"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Bookmark
              className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Post;
