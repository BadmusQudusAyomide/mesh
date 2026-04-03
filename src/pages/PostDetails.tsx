import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import Post from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";
import { apiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContextHelpers";
import type { FeedPost, Post as BackendPost } from "../types";
import { formatRelativeTime } from "../lib/utils";

type BackendComment = {
  _id?: string;
  user: {
    _id?: string;
    fullName: string;
    username?: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
};

const mapBackendPostToFeedPost = (
  post: BackendPost,
  currentUserId?: string
): FeedPost => ({
  authorId: post.user?._id || "",
  id: post._id,
  user: post.user?.fullName || "Anonymous",
  username: post.user?.username || "anonymous",
  avatar:
    post.user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
  content: post.content,
  time: formatRelativeTime(post.createdAt),
  image: post.image,
  likes: post.likes.length,
  comments: post.comments.length,
  shares: 0,
  views: 0,
  isLiked: currentUserId ? post.likes.includes(currentUserId) : false,
  isBookmarked: false,
  isVerified: post.user?.isVerified || false,
  engagement: 0,
  trending: undefined,
  category: undefined,
  commentList: (post.comments as BackendComment[]).map((comment, idx) => ({
    id: comment._id || String(idx),
    user: {
      id: comment.user._id || String(idx),
      fullName: comment.user.fullName,
      username: comment.user.username || "anonymous",
      avatar: comment.user.avatar,
    },
    text: comment.text,
    createdAt: comment.createdAt,
  })),
});

const formatNumber = (num: number) =>
  num >= 1000000
    ? `${(num / 1000000).toFixed(1)}M`
    : num >= 1000
      ? `${(num / 1000).toFixed(1)}K`
      : String(num);

function PostDetails() {
  const { postId = "" } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const currentUserId = user?._id;
  const isFollowing = useMemo(
    () =>
      !!post &&
      new Set((user?.following || []).map((id: any) => id.toString())).has(
        post.authorId?.toString() || ""
      ),
    [post, user?.following]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getPostById(postId);
        if (!isMounted) return;
        setPost(mapBackendPostToFeedPost(response.post, currentUserId));
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load this post"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (postId) {
      fetchPost();
    } else {
      setLoading(false);
      setError("Post not found");
    }

    return () => {
      isMounted = false;
    };
  }, [postId, currentUserId]);

  const refreshPost = async () => {
    if (!postId) return;
    const response = await apiService.getPostById(postId);
    setPost(mapBackendPostToFeedPost(response.post, currentUserId));
  };

  const handleLike = async (id: string) => {
    if (!post || id !== post.id) return;

    const previous = post;
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.likes + (post.isLiked ? -1 : 1),
    });

    try {
      await apiService.likePost(id);
      await refreshPost();
    } catch (err) {
      setPost(previous);
      console.error("Failed to like post:", err);
    }
  };

  const handleComment = async (id: string, text: string) => {
    if (!text.trim() || id !== postId) return;

    try {
      await apiService.addComment(id, text.trim());
      setCommentInput("");
      await refreshPost();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleFollow = async (authorId: string) => {
    try {
      await apiService.followUser(authorId);
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb]">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <main className="max-w-3xl mx-auto px-4 py-6 md:px-6">
        <div className="mb-5">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-black hover:text-white"
          >
            Back to feed
          </Link>
        </div>

        {loading && <PostSkeleton count={1} />}

        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">
              We couldn&apos;t load this post
            </h1>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
        )}

        {!loading && !error && post && (
          <Post
            post={post}
            userId={currentUserId || ""}
            formatNumber={formatNumber}
            handleLike={handleLike}
            handleBookmark={() => {}}
            onAddComment={handleComment}
            commentInput={commentInput}
            setCommentInput={setCommentInput}
            isFollowing={isFollowing}
            onFollow={handleFollow}
          />
        )}
      </main>
    </div>
  );
}

export default PostDetails;
