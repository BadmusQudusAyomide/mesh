import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Flag,
  UserMinus,
  Link,
  Copy,
  VolumeX,
  Trash2,
  Edit3,
  Send,
  Smile,
  Image,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
}: PostProps) => {
  // State management
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      text: "This is amazing! 🔥",
      time: "2h",
      likes: 12,
      isLiked: false,
    },
    {
      id: 2,
      user: "Mike Brown",
      avatar: "https://randomuser.me/api/portraits/men/25.jpg",
      text: "Love this update! Keep up the great work 👏",
      time: "1h",
      likes: 5,
      isLiked: true,
    },
    {
      id: 3,
      user: "Emma Stone",
      avatar: "https://randomuser.me/api/portraits/women/35.jpg",
      text: "So inspiring! This really motivates me to push forward with my own projects.",
      time: "45m",
      likes: 8,
      isLiked: false,
    },
    {
      id: 4,
      user: "Alex Chen",
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      text: "Amazing work! How long did this take you to complete?",
      time: "30m",
      likes: 3,
      isLiked: false,
    },
  ]);

  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

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
    setShowComments(true);
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

  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

  return (
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
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-bold text-gray-800">{post.user}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{post.time}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(post.views)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
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
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{formatNumber(post.comments)}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">{formatNumber(post.shares)}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
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
      {/* Single Random Comment Preview */}
      {comments.length > 0 && (
        <div className="px-6 pb-2">
          <div className="flex items-start gap-3 bg-white/80 rounded-xl px-3 py-2 shadow-sm">
            <img
              src={comments[Math.floor(Math.random() * comments.length)].avatar}
              alt={comments[Math.floor(Math.random() * comments.length)].user}
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />
            <div>
              <span className="font-semibold text-gray-800 text-sm mr-2">
                {comments[Math.floor(Math.random() * comments.length)].user}
              </span>
              <span className="text-gray-700 text-sm">
                {comments[Math.floor(Math.random() * comments.length)].text}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Comment Modal (Sheet) */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h3 className="font-semibold text-gray-800 text-lg">
                Comments ({formatNumber(comments.length)})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
              {visibleComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/80 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm">
                          {comment.user}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-3">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.isLiked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
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
                        className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length > 2 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-sm text-blue-500 hover:underline mb-4 font-medium"
                >
                  View all {comments.length} comments
                </button>
              )}
            </div>
            {/* Reply indicator */}
            {replyingTo && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg mx-4">
                <span className="text-sm text-blue-600">
                  Replying to {comments.find((c) => c.id === replyingTo)?.user}
                </span>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setCommentInput("");
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Enhanced Comment Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white sticky bottom-0">
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="You"
                className="w-8 h-8 rounded-full object-cover border-2 border-white flex-shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment(e)}
                  placeholder={
                    replyingTo ? "Write a reply..." : "Add a comment..."
                  }
                  className="w-full px-4 py-2 pr-20 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Smile className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Image className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddComment}
                disabled={!commentInput.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
