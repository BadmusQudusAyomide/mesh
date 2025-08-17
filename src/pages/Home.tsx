import { useState, useRef, useEffect } from "react";
import { io as socketIOClient, Socket } from "socket.io-client";
import Navigation from "../components/Navigation";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import Stories from "../components/Stories";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import PostSkeleton from "../components/PostSkeleton";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { useAuth } from "../contexts/AuthContextHelpers";
import "../App.css";
import { apiService } from "../lib/api";
import { API_BASE_URL } from "../config";
import type { Post as BackendPost, FeedPost } from "../types";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api.*/, "");

// Type for backend comment structure
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

function mapBackendCommentToFeedComment(c: BackendComment, idx: number) {
  return {
    id: c._id || String(idx),
    user: {
      id: c.user._id || String(idx),
      fullName: c.user.fullName,
      username: c.user.username || "anonymous",
      avatar: c.user.avatar,
    },
    text: c.text,
    createdAt: c.createdAt,
  };
}

const trendingTopics = [
  { tag: "#AI", posts: "2.4M", growth: "+15%" },
  { tag: "#Web3", posts: "1.8M", growth: "+8%" },
  { tag: "#ClimateAction", posts: "956K", growth: "+12%" },
  { tag: "#Innovation", posts: "742K", growth: "+6%" },
  { tag: "#FutureOfWork", posts: "623K", growth: "+9%" },
];

// Stories feature not implemented yet: show placeholder in component

// Who to follow (loaded from backend mutual followers)
type WhoToFollowItem = {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers?: string;
};
const numberFormat = (n: number) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "M"
    : n >= 1000
    ? (n / 1000).toFixed(1) + "K"
    : String(n);

const liveEvents = [
  { title: "Tech Conference 2024", viewers: "12.5K", category: "Technology" },
  { title: "Climate Action Summit", viewers: "8.2K", category: "Environment" },
  { title: "AI Innovation Panel", viewers: "15.7K", category: "AI" },
];

const aiInsights = [
  {
    icon: null,
    title: "Engagement Boost",
    value: "+23%",
    description: "Your posts perform better with images and hashtags",
  },
  {
    icon: null,
    title: "Best Time",
    value: "2-4 PM",
    description: "Optimal posting time for your audience",
  },
  {
    icon: null,
    title: "Growth Rate",
    value: "+18%",
    description: "Your follower growth this week",
  },
];

const recentActivity = [
  {
    user: "Mike",
    action: "liked your post",
    time: "5m ago",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
  },
  {
    user: "Emma",
    action: "commented on your photo",
    time: "12m ago",
    avatar: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    user: "Sarah",
    action: "shared your post",
    time: "27m ago",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    user: "Josh",
    action: "started following you",
    time: "1h ago",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
  },
];

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
}/image/upload`;
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "mesh_unsigned";

function Home() {
  // 2. Type posts as Post[]
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentInputs, setCommentInputs] = useState<{
    [postId: string]: string;
  }>({});
  const [whoToFollow, setWhoToFollow] = useState<WhoToFollowItem[]>([]);
  // 3. Get user from useAuth
  const { user, updateUser } = useAuth();
  // const [following, setFollowing] = useState<string[]>(user?.following || []);

  useEffect(() => {
    // setFollowing(user?.following || []);
  }, [user]);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setInitialLoading(true);
      setLoadingError(null);
      try {
        const res = await apiService.getPostsPaginated(1, 5);
        const mapped = res.posts.map(
          (post: BackendPost): FeedPost => ({
            authorId: post.user?._id || "",
            id: post._id,
            user: post.user?.fullName || "Anonymous",
            username: post.user?.username || "anonymous",
            avatar:
              post.user?.avatar ||
              "https://randomuser.me/api/portraits/men/1.jpg",
            content: post.content,
            time: new Date(post.createdAt).toLocaleString(),
            image: post.image,
            likes: post.likes.length,
            comments: post.comments.length,
            shares: 0,
            views: 0,
            isLiked: user ? post.likes.includes(user._id) : false,
            isBookmarked: false,
            isVerified: post.user?.isVerified || false,
            engagement: 0,
            trending: undefined,
            category: undefined,
            commentList: (post.comments as BackendComment[]).map(
              mapBackendCommentToFeedComment
            ),
          })
        );
        setPosts(mapped);
        setHasMore(res.pagination?.hasMore ?? false);
        setCurrentPage(1);
      } catch (e) {
        setLoadingError("Failed to load posts");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialPosts();

    // Socket.IO real-time updates
    const socket: Socket = socketIOClient(SOCKET_URL);
    socket.on("postUpdated", (updatedPost: BackendPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost._id
            ? {
                ...post,
                likes: updatedPost.likes.length,
                isLiked: user ? updatedPost.likes.includes(user._id) : false,
                comments: updatedPost.comments.length,
                commentList: (updatedPost.comments as BackendComment[]).map(
                  mapBackendCommentToFeedComment
                ),
              }
            : post
        )
      );
    });
    socket.on("postDeleted", ({ postId }: { postId: string }) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Load who to follow (random new users, excluding following)
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const res = await apiService.getUserSuggestions(5);
        const items = (res?.suggestions || []).map(
          (u: any): WhoToFollowItem => ({
            name: u.fullName || u.username,
            username: u.username,
            avatar: u.avatar,
            verified: !!u.isVerified,
            followers:
              typeof u.followerCount === "number"
                ? numberFormat(u.followerCount)
                : undefined,
          })
        );
        setWhoToFollow(items);
      } catch (e) {
        // silent fail for sidebar suggestions
      }
    };
    loadSuggestions();
  }, []);

  // Infinite scroll loader
  const loadMorePosts = async () => {
    if (!hasMore) return;
    try {
      const nextPage = currentPage + 1;
      const res = await apiService.getPostsPaginated(nextPage, 5);
      const mapped = res.posts.map(
        (post: BackendPost): FeedPost => ({
          authorId: post.user?._id || "",
          id: post._id,
          user: post.user?.fullName || "Anonymous",
          username: post.user?.username || "anonymous",
          avatar:
            post.user?.avatar ||
            "https://randomuser.me/api/portraits/men/1.jpg",
          content: post.content,
          time: new Date(post.createdAt).toLocaleString(),
          image: post.image,
          likes: post.likes.length,
          comments: post.comments.length,
          shares: 0,
          views: 0,
          isLiked: user ? post.likes.includes(user._id) : false,
          isBookmarked: false,
          isVerified: post.user?.isVerified || false,
          engagement: 0,
          trending: undefined,
          category: undefined,
          commentList: (post.comments as BackendComment[]).map(
            mapBackendCommentToFeedComment
          ),
        })
      );
      setPosts((prev) => [...prev, ...mapped]);
      setCurrentPage(nextPage);
      setHasMore(res.pagination?.hasMore ?? false);
    } catch (e) {
      setLoadingError("Failed to load more posts");
    }
  };

  const { isFetching } = useInfiniteScroll(loadMorePosts);

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postContent.trim() && !previewImage) return;

    let imageUrl = "";
    if (previewImage && previewImage.startsWith("data:")) {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", dataURLtoFile(previewImage, "post-image.png"));
      formData.append("upload_preset", UPLOAD_PRESET);
      try {
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        imageUrl = data.secure_url;
      } catch {
        alert("Image upload failed");
        return;
      }
    } else if (previewImage) {
      imageUrl = previewImage;
    }

    try {
      const postRes = await apiService.createPost({
        content: postContent,
        image: imageUrl || undefined,
      });
      // Add the new post to the feed (optimistic update)
      setPosts([
        {
          id: postRes.post._id,
          authorId: user?._id || "",
          user: user?.fullName || "Anonymous",
          username: user?.username || "anonymous",
          avatar:
            user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
          content: postRes.post.content,
          time: "Just now",
          image: postRes.post.image,
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          isLiked: false,
          isBookmarked: false,
          isVerified: user?.isVerified || false,
          engagement: 0,
          trending: false,
          category: "General",
          commentList: [], // No comments for new posts
        },
        ...posts,
      ]);
      setPostContent("");
      setPreviewImage("");
      setShowCreatePost(false);
    } catch {
      alert("Failed to create post");
    }
  };

  // Helper to convert dataURL to File
  function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    // 4. Fix possible null in match
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreviewImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete a post (owner only)
  const handleDeletePost = async (postId: string) => {
    // Optimistic remove
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await apiService.deletePost(postId);
    } catch (e) {
      // Rollback on failure: ideally refetch; for now, show alert and refetch first page
      alert("Failed to delete post");
      try {
        const res = await apiService.getPostsPaginated(1, 5);
        const mapped = res.posts.map(
          (post: BackendPost): FeedPost => ({
            authorId: post.user?._id || "",
            id: post._id,
            user: post.user?.fullName || "Anonymous",
            username: post.user?.username || "anonymous",
            avatar:
              post.user?.avatar ||
              "https://randomuser.me/api/portraits/men/1.jpg",
            content: post.content,
            time: new Date(post.createdAt).toLocaleString(),
            image: post.image,
            likes: post.likes.length,
            comments: post.comments.length,
            shares: 0,
            views: 0,
            isLiked: user ? post.likes.includes(user._id) : false,
            isBookmarked: false,
            isVerified: post.user?.isVerified || false,
            engagement: 0,
            trending: undefined,
            category: undefined,
            commentList: (post.comments as BackendComment[]).map(
              mapBackendCommentToFeedComment
            ),
          })
        );
        setPosts(mapped);
        setHasMore(res.pagination?.hasMore ?? false);
        setCurrentPage(1);
      } catch {}
    }
  };

  // Like handler
  const handleLike = async (postId: string) => {
    try {
      const res = await apiService.likePost(postId);
      setPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: res.liked,
                likes: res.likesCount,
                comments: res.post.comments.length,
                commentList: (res.post.comments as BackendComment[]).map(
                  mapBackendCommentToFeedComment
                ),
              }
            : post
        )
      );
    } catch {
      alert("Failed to like post");
    }
  };

  // Comment handler
  const handleAddComment = async (postId: string, text: string) => {
    try {
      const res = await apiService.addComment(postId, text);
      setPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: res.post.comments.length,
                commentList: (res.post.comments as BackendComment[]).map(
                  mapBackendCommentToFeedComment
                ),
              }
            : post
        )
      );
      setCommentInputs((inputs) => ({ ...inputs, [postId]: "" }));
    } catch {
      alert("Failed to add comment");
    }
  };

  const handleFollow = async (authorId: string) => {
    if (!user) return;

    try {
      const res = await apiService.followUser(authorId);
      // Update the user context
      const updatedFollowing = res.isFollowing
        ? [...user.following, authorId]
        : user.following.filter((id) => id.toString() !== authorId.toString());

      updateUser({ ...user, following: updatedFollowing });
    } catch (error) {
      console.error("Failed to follow user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleBookmark = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-indigo-50 via-white to-cyan-50"
      }`}
    >
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Modern App Header with Glassmorphism */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-lg transition-all duration-300 ${
          darkMode
            ? "bg-gray-900/70 border-gray-700/50"
            : "bg-white/70 border-gray-200/50"
        }`}
      >
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mesh
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Connect • Share • Discover
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div
              className={`relative hidden md:flex items-center ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm rounded-2xl border ${
                darkMode ? "border-gray-700/50" : "border-gray-200/50"
              } px-4 py-2 min-w-[300px] transition-all duration-200 hover:shadow-md`}
            >
              <svg
                className={`w-5 h-5 mr-3 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search Mesh..."
                className={`bg-transparent outline-none flex-1 ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Action Buttons */}
            <button
              className={`p-3 rounded-2xl transition-all duration-200 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300"
                  : "bg-white/50 hover:bg-white/80 text-gray-600"
              } backdrop-blur-sm border ${
                darkMode ? "border-gray-700/50" : "border-gray-200/50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pb-8 px-4 max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <SidebarLeft
                trendingTopics={trendingTopics}
                user={
                  user
                    ? {
                        name: user.fullName,
                        username: user.username,
                        avatar: user.avatar,
                      }
                    : {
                        name: "Anonymous",
                        username: "anonymous",
                        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
                      }
                }
                followerCount={user?.followerCount || 0}
                followingCount={user?.followingCount || 0}
                postCount={user?.postCount || 0}
              />
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Welcome Banner */}
            <div
              className={`relative overflow-hidden rounded-3xl p-6 ${
                darkMode
                  ? "bg-gradient-to-r from-purple-900/50 to-blue-900/50"
                  : "bg-gradient-to-r from-purple-500/10 to-blue-500/10"
              } backdrop-blur-sm border ${
                darkMode ? "border-gray-700/50" : "border-white/50"
              } shadow-xl`}
            >
              <div className="relative z-10">
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Welcome back, {user?.fullName || "Friend"}! 👋
                </h2>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  What's happening in your world today?
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-violet-400/20 rounded-full -ml-12 -mb-12"></div>
            </div>

            {/* Stories Section */}
            <div
              className={`rounded-3xl p-1 ${
                darkMode
                  ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50"
                  : "bg-gradient-to-r from-white/80 to-gray-50/80"
              } backdrop-blur-sm border ${
                darkMode ? "border-gray-700/50" : "border-gray-200/50"
              } shadow-lg`}
            >
              <Stories
                currentUser={
                  user
                    ? {
                        name: user.fullName,
                        avatar: user.avatar,
                      }
                    : undefined
                }
                onCreatePost={() => setShowCreatePost(true)}
              />
            </div>

            {/* Quick Actions */}
            <div
              className={`rounded-3xl p-6 ${
                darkMode ? "bg-gray-800/50" : "bg-white/80"
              } backdrop-blur-sm border ${
                darkMode ? "border-gray-700/50" : "border-gray-200/50"
              } shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className={`p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                      : "bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400"
                  } text-white shadow-lg`}
                >
                  <div className="text-center">
                    <svg
                      className="w-6 h-6 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm font-medium">Post</span>
                  </div>
                </button>

                <button
                  className={`p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? "bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                      : "bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                  } text-white shadow-lg`}
                >
                  <div className="text-center">
                    <svg
                      className="w-6 h-6 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Photo</span>
                  </div>
                </button>

                <button
                  className={`p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? "bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500"
                      : "bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400"
                  } text-white shadow-lg`}
                >
                  <div className="text-center">
                    <svg
                      className="w-6 h-6 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Video</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {initialLoading && <PostSkeleton count={5} />}
              {!initialLoading && posts.length > 0 && (
                <PostsFeed
                  posts={posts}
                  formatNumber={formatNumber}
                  handleLike={handleLike}
                  handleBookmark={handleBookmark}
                  onAddComment={handleAddComment}
                  commentInputs={commentInputs}
                  setCommentInputs={setCommentInputs}
                  onFollow={handleFollow}
                  onDelete={handleDeletePost}
                />
              )}
              {loadingError && (
                <div className="text-center text-sm text-red-500">
                  {loadingError}
                </div>
              )}
              {isFetching && !initialLoading && <PostSkeleton count={3} />}
              {!hasMore && !initialLoading && (
                <div className="text-center text-xs text-gray-500 py-4">
                  You\'re all caught up
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <SidebarRight
                whoToFollow={whoToFollow}
                liveEvents={liveEvents}
                aiInsights={aiInsights}
                recentActivity={recentActivity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          postContent={postContent}
          setPostContent={setPostContent}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
          handlePostSubmit={handlePostSubmit}
          handleImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
          setShowCreatePost={setShowCreatePost}
        />
      )}
    </div>
  );
}

export default Home;
