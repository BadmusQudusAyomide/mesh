import {
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  UserPlusIcon,
  FaceSmileIcon,
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  FlagIcon,
  UserMinusIcon,
  SpeakerXMarkIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect, useMemo, memo } from "react";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  authorId: string; // The ID of the user who created the post
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
  engagement?: number;
  trending?: boolean;
  category?: string;
  commentList: {
    id: string;
    user: {
      id: string;
      fullName: string;
      username: string;
      avatar: string;
    };
    text: string;
    createdAt: string;
  }[];
}

interface PostProps {
  post: Post;
  userId: string; // The ID of the currently logged-in user
  formatNumber: (num: number) => string;
  handleLike: (postId: string) => void;
  handleBookmark: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  commentInput?: string;
  setCommentInput?: (val: string) => void;
  isFollowing?: boolean;
  onFollow?: (userId: string) => void;
  onDelete?: (postId: string) => void;
}

const Post = ({
  post,
  userId,
  formatNumber,
  handleLike,
  onAddComment,
  commentInput = "",
  setCommentInput,
  isFollowing = false,
  onFollow,
  onDelete,
}: PostProps) => {
  // Remove mock comments state
  // const [comments, setComments] = useState([...]);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // Remove replyingTo and setReplyingTo
  // const [replyingTo, setReplyingTo] = useState<number | null>(null);

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

  // Remove focus effect for replyingTo
  // useEffect(() => {
  //   if (replyingTo && commentInputRef.current) {
  //     commentInputRef.current.focus();
  //   }
  // }, [replyingTo]);

  // Remove handleAddComment, handleCommentLike, handleReply logic for local state

  const menuOptions = useMemo(() => [
    {
      icon: FlagIcon,
      label: "Report post",
      action: () => console.log("Report post"),
    },
    // Only show unfollow option if user is following the post author and onFollow is available
    ...(isFollowing && onFollow && userId !== post.authorId ? [{
      icon: UserMinusIcon,
      label: "Unfollow user",
      action: () => onFollow(post.authorId),
    }] : []),
    {
      icon: SpeakerXMarkIcon,
      label: "Mute user",
      action: () => console.log("Mute user"),
    },
    {
      icon: DocumentDuplicateIcon,
      label: "Copy link",
      action: async () => {
        try {
          const url = getPostShareUrl();
          await navigator.clipboard.writeText(url);
          // Optionally, replace with your toast system
          alert("Post link copied to clipboard");
        } catch (e) {
          console.error("Failed to copy link", e);
        }
      },
    },
    {
      icon: LinkIcon,
      label: "Share via...",
      action: () => handleShare(),
    },
    {
      icon: PencilSquareIcon,
      label: "Edit post",
      action: () => console.log("Edit post"),
      divider: true,
    },
    // Show Delete only for owner
    ...(userId === post.authorId && onDelete
      ? [{
          icon: TrashIcon,
          label: "Delete post",
          action: () => {
            if (confirm("Delete this post? This action cannot be undone.")) {
              onDelete(post.id);
            }
          },
          danger: true,
        }]
      : []),
  ], [isFollowing, onFollow, userId, post.authorId, onDelete, post.id]);

  // Add submit handler for comment
  const handleCommentSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (onAddComment && setCommentInput && commentInput.trim()) {
      onAddComment(post.id, commentInput);
      setCommentInput("");
    }
  };

  // Build a shareable URL to this post. Uses current path with a post anchor
  const getPostShareUrl = () => {
    try {
      const { origin, pathname } = window.location;
      return `${origin}${pathname}#post-${post.id}`;
    } catch {
      return `#post-${post.id}`;
    }
  };

  // Web Share API with clipboard fallback
  const handleShare = async () => {
    const shareData = {
      title: `${post.user} on Mesh`,
      text: post.content?.slice(0, 140) || "Check out this post on Mesh",
      url: getPostShareUrl(),
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData as ShareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        alert("Post link copied to clipboard");
      } else {
        // Last resort
        prompt("Copy this link:", shareData.url);
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <>
      {/* Modern Post Card with Glassmorphism */}
      <div id={`post-${post.id}`} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        {/* Post Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link to={`/profile/${post.username}`} className="relative group" aria-label={`View ${post.user}'s profile`}>
                <img
                  src={post.avatar}
                  alt={post.user}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg group-hover:brightness-95 transition"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${post.username}`} className="font-bold text-gray-900 text-lg hover:underline">
                    {post.user}
                  </Link>
                  {post.isVerified && (
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {onFollow && userId && userId !== post.authorId && !isFollowing && (
                    <button
                      onClick={() => onFollow(post.authorId)}
                      className="ml-3 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      Follow
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="font-medium">{post.time}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
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
          <div className="mb-4">
            <p className="text-gray-800 text-base sm:text-[17px] leading-normal font-normal">
              {post.content}
            </p>
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="mx-6 mb-4 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.image}
              alt="Post content"
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                    ❤️
                  </div>
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                    👍
                  </div>
                </div>
                <span className="font-semibold">{formatNumber(post.likes)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium">{formatNumber(post.comments)} comments</span>
              <span className="font-medium">{formatNumber(post.shares)} shares</span>
            </div>
          </div>
        </div>

        {/* Modern Post Actions */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                post.isLiked
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              aria-label="Like"
            >
              <HeartIcon
                className={`w-5 h-5 ${
                  post.isLiked
                    ? "fill-current"
                    : "fill-none stroke-2 stroke-current"
                }`}
              />
              <span className="font-medium text-sm">{formatNumber(post.likes)}</span>
            </button>
            
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
              aria-label="Comment"
            >
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
              <span className="font-medium text-sm">{formatNumber(post.comments)}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 transform hover:scale-105"
              aria-label="Share"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span className="font-medium text-sm">{formatNumber(post.shares)}</span>
            </button>
          </div>
        </div>

        {/* Single Random Comment Preview */}
        {post.commentList.length > 0 && !showComments && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <Link to={`/profile/${post.commentList[0].user.username}`} className="flex-shrink-0" aria-label={`View ${post.commentList[0].user.fullName}'s profile`}>
                <img
                  src={post.commentList[0].user.avatar}
                  alt={post.commentList[0].user.fullName}
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                <Link to={`/profile/${post.commentList[0].user.username}`} className="font-semibold text-sm text-gray-900 mr-1 hover:underline">
                  {post.commentList[0].user.fullName}
                </Link>
                <span className="text-sm text-gray-800">
                  {post.commentList[0].text}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 ml-11">
              <span className="text-xs text-gray-500">
                {new Date(post.commentList[0].createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="px-4 py-3 border-t border-gray-200">
          <form
            className="flex items-center gap-2"
            onSubmit={handleCommentSubmit}
          >
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="You"
              loading="lazy"
              decoding="async"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full px-3 py-2 pr-10 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={commentInput}
                onChange={(e) =>
                  setCommentInput && setCommentInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleCommentSubmit(e);
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  type="button"
                >
                  <FaceSmileIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            {commentInput &&
              commentInput.trim() &&
              onAddComment &&
              setCommentInput && (
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Post
                </button>
              )}
          </form>
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
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
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
                          <EyeIcon className="w-3 h-3" />
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
                      <span>
                        {formatNumber(post.commentList.length)} comments
                      </span>
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
                  Comments ({post.commentList.length})
                </h4>
              </div>

              {/* Comments List */}
              <div className="px-4 py-2 space-y-4">
                {post.commentList.map((comment, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2">
                    <Link to={`/profile/${comment.user.username}`} className="flex-shrink-0" aria-label={`View ${comment.user.fullName}'s profile`}>
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.fullName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/profile/${comment.user.username}`} className="font-semibold text-gray-900 text-sm hover:underline">
                            {comment.user.fullName}
                          </Link>
                          {/* Example: show Follow if not following this commenter (logic to be implemented) */}
                          {onFollow && (
                            <button
                              className="ml-1 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs flex items-center gap-1 hover:bg-blue-600 transition-all"
                              onClick={() => onFollow(comment.user.id)}
                            >
                              <UserPlusIcon className="w-4 h-4" /> Follow
                            </button>
                          )}
                        </div>
                        <p className="text-gray-800 text-sm">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 ml-3">
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
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
            <form
              className="flex-1 relative flex items-center gap-2"
              onSubmit={handleCommentSubmit}
            >
              <input
                ref={commentInputRef}
                type="text"
                value={commentInput}
                onChange={(e) =>
                  setCommentInput && setCommentInput(e.target.value)
                }
                placeholder="Write a comment..."
                className="w-full px-3 py-2 pr-10 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleCommentSubmit(e);
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FaceSmileIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {commentInput &&
                commentInput.trim() &&
                onAddComment &&
                setCommentInput && (
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Post
                  </button>
                )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Post);
