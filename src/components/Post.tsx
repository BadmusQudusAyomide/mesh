import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Flag,
  UserMinus,
  Link,
  Copy,
  VolumeX,
  Trash2,
  Edit3,
  Smile,
  ArrowLeft,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Post {
  id: number;
  user: string;
  username: string;
  avatar: string;
  content: string;
  time: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isVerified: boolean;
  engagement: number;
  trending: boolean;
  category: string;
}

interface PostProps {
  post: Post;
  formatNumber: (num: number) => string;
  handleLike: (postId: number) => void;
  handleBookmark: (postId: number) => void;
}

const Post = ({ post, formatNumber, handleLike }: PostProps) => {
  // State management
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Omo omor",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      text: "This is amazing! 🔥",
      time: "2h",
      likes: 12,
      isLiked: false,
    },
    {
      id: 2,
      user: "Owoyemi ",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg",
      text: "Love this update! Keep up the great work 👏",
      time: "1h",
      likes: 5,
      isLiked: true,
    },
    {
      id: 3,
      user: "Codetream Eric",
      avatar: "https://randomuser.me/api/portraits/men/37.jpg",
      text: "So inspiring! This really motivates me to push forward with my own projects.",
      time: "45m",
      likes: 8,
      isLiked: false,
    },
    {
      id: 4,
      user: "Alfred Chinedu",
      avatar: "https://randomuser.me/api/portraits/men/38.jpg",
      text: "Amazing work! How long did this take you to complete?",
      time: "30m",
      likes: 3,
      isLiked: false,
    },
    {
      id: 5,
      user: "Ngozi Okonjo",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg",
      text: "Proud to see Nigerians doing great things!",
      time: "10m",
      likes: 6,
      isLiked: false,
    },
    {
      id: 6,
      user: "Tunde Bakare",
      avatar: "https://randomuser.me/api/portraits/men/40.jpg",
      text: "This is exactly what we need more of in the tech space. Keep pushing boundaries!",
      time: "5m",
      likes: 2,
      isLiked: false,
    },
    {
      id: 7,
      user: "Funmi Adebayo",
      avatar: "https://randomuser.me/api/portraits/women/50.jpg",
      text: "Inspiring work! Can't wait to see what you build next 🚀",
      time: "3m",
      likes: 4,
      isLiked: false,
    },
    {
      id: 8,
      user: "Kemi Adeola",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
      text: "This is what innovation looks like! Well done 👏👏👏",
      time: "1m",
      likes: 1,
      isLiked: false,
    },
  ]);

  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus comment input when replying
  useEffect(() => {
    if (replyingTo && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [replyingTo]);

  const handleAddComment = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: comments.length + 1,
      user: "You",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      text: replyingTo
        ? `@${comments.find((c) => c.id === replyingTo)?.user} ${commentInput}`
        : commentInput,
      time: "now",
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, newComment]);
    setCommentInput("");
    setReplyingTo(null);
  };

  const handleCommentLike = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleReply = (commentId: number, username: string) => {
    setReplyingTo(commentId);
    setCommentInput(`@${username} `);
  };

  const menuOptions = [
    {
      icon: Flag,
      label: "Report post",
      action: () => console.log("Report post"),
    },
    {
      icon: UserMinus,
      label: "Unfollow user",
      action: () => console.log("Unfollow user"),
    },
    {
      icon: VolumeX,
      label: "Mute user",
      action: () => console.log("Mute user"),
    },
    { icon: Copy, label: "Copy link", action: () => console.log("Copy link") },
    {
      icon: Link,
      label: "Share via...",
      action: () => console.log("Share via"),
    },
    {
      icon: Edit3,
      label: "Edit post",
      action: () => console.log("Edit post"),
      divider: true,
    },
    {
      icon: Trash2,
      label: "Delete post",
      action: () => console.log("Delete post"),
      danger: true,
    },
  ];

  return (
    <>
      {/* Main Post Card */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
        {/* Post Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={post.avatar}
                alt={post.user}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">
                    {post.user}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{post.time}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatNumber(post.views)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  {menuOptions.map((option, index) => (
                    <div key={index}>
                      {option.divider && (
                        <div className="border-t border-gray-100 my-1" />
                      )}
                      <button
                        onClick={() => {
                          option.action();
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                          option.danger ? "text-red-600" : "text-gray-700"
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mb-3">
            <p className="text-gray-800 text-base leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="border-t border-b border-gray-200">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  👍
                </div>
                <span>{formatNumber(post.likes)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span>{formatNumber(post.comments)} comments</span>
              <span>{formatNumber(post.shares)} shares</span>
            </div>
          </div>
        </div>

        {/* Post Actions */}
        <div className="px-2 py-1">
          <div className="flex items-center justify-between text-gray-500">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-2 py-2 rounded-md transition-all duration-200 ${
                post.isLiked
                  ? "text-blue-600"
                  : "hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm font-medium">Like</span>
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="flex-1 flex items-center justify-center space-x-2 px-2 py-2 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 px-2 py-2 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-all duration-200">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Single Random Comment Preview */}
        {comments.length > 0 && !showComments && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <img
                src={comments[0].avatar}
                alt={comments[0].user}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                <span className="font-semibold text-sm text-gray-900 mr-1">
                  {comments[0].user}
                </span>
                <span className="text-sm text-gray-800">
                  {comments[0].text}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 ml-11">
              <span className="text-xs text-gray-500">Like</span>
              <span className="text-xs text-gray-500">Reply</span>
              <span className="text-xs text-gray-500">{comments[0].time}</span>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="You"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full px-3 py-2 pr-10 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <Smile className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Page Comment View (Facebook Style) */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowComments(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="font-semibold text-gray-900">Comments</h3>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Post Content Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.avatar}
                      alt={post.user}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">
                        {post.user}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{post.time}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(post.views)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 text-base leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-3">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Post Stats */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          👍
                        </div>
                        <span>{formatNumber(post.likes)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span>{formatNumber(comments.length)} comments</span>
                      <span>{formatNumber(post.shares)} shares</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white">
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">
                  Comments ({comments.length})
                </h4>
              </div>

              {/* Comments List */}
              <div className="px-4 py-2 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 py-2">
                    <img
                      src={comment.avatar}
                      alt={comment.user}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {comment.user}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 ml-3">
                        <span className="text-xs text-gray-500">
                          {comment.time}
                        </span>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.isLiked
                              ? "text-blue-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              comment.isLiked ? "fill-current" : ""
                            }`}
                          />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                        <button
                          onClick={() => handleReply(comment.id, comment.user)}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Comment Input at Bottom */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white">
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="You"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <input
                ref={commentInputRef}
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment(e)}
                placeholder={
                  replyingTo ? "Write a reply..." : "Write a comment..."
                }
                className="w-full px-3 py-2 pr-10 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Smile className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            {commentInput.trim() && (
              <button
                onClick={handleAddComment}
                className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Post
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
