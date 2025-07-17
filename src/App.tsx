import { useState, useRef } from "react";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Image as ImageIcon,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Zap,
  Compass,
  Sun,
  Moon,
  Crown,
  TrendingUp,
  Camera,
  Mic,
  Calendar,
  Users,
  Plus,
  MapPin,
  Verified,
  Flame,
  Eye,
  Activity,
  Hash,
  Sparkles,
  BarChart3,
  Clock,
  X,
  Globe,
  ChevronDown,
  Smile,
  Gift,
} from "lucide-react";
import "./App.css";

const initialPosts = [
  {
    id: 1,
    user: "Alex Chen",
    username: "alexchen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content:
      "Just shipped a new feature that uses AI to optimize user experiences in real-time. The future is now! 🚀✨",
    time: "2m ago",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    likes: 342,
    comments: 28,
    shares: 15,
    views: 2847,
    isLiked: false,
    isBookmarked: false,
    isVerified: true,
    engagement: 95,
    trending: true,
    category: "Tech",
  },
  {
    id: 2,
    user: "Maya Rodriguez",
    username: "mayarod",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content:
      "Breaking: New study shows that decentralized networks are 40% more efficient than traditional systems. Game changer! 🌐⚡",
    time: "8m ago",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
    likes: 1247,
    comments: 156,
    shares: 89,
    views: 8934,
    isLiked: true,
    isBookmarked: true,
    isVerified: true,
    engagement: 99,
    trending: true,
    category: "News",
  },
  {
    id: 3,
    user: "David Kim",
    username: "davekim",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    content:
      "Mind-blowing sunset from my rooftop garden. Nature never fails to inspire! 🌅🌱",
    time: "15m ago",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    likes: 523,
    comments: 67,
    shares: 34,
    views: 3456,
    isLiked: false,
    isBookmarked: false,
    isVerified: false,
    engagement: 78,
    trending: false,
    category: "Photography",
  },
  {
    id: 4,
    user: "Zoe Mitchell",
    username: "zoemitch",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    content:
      "Excited to announce our new sustainable tech initiative! We're building the future while protecting our planet 🌍💚",
    time: "32m ago",
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop",
    likes: 892,
    comments: 124,
    shares: 67,
    views: 5678,
    isLiked: false,
    isBookmarked: true,
    isVerified: true,
    engagement: 88,
    trending: false,
    category: "Environment",
  },
];

const trendingTopics = [
  { tag: "#AI", posts: "2.4M", growth: "+15%" },
  { tag: "#Web3", posts: "1.8M", growth: "+8%" },
  { tag: "#ClimateAction", posts: "956K", growth: "+12%" },
  { tag: "#Innovation", posts: "742K", growth: "+6%" },
  { tag: "#FutureOfWork", posts: "623K", growth: "+9%" },
];

const stories = [
  {
    id: 1,
    user: "You",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    hasStory: false,
    isAdd: true,
  },
  {
    id: 2,
    user: "Sarah",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    hasStory: true,
    isViewed: false,
  },
  {
    id: 3,
    user: "Mike",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    hasStory: true,
    isViewed: true,
  },
  {
    id: 4,
    user: "Emma",
    avatar: "https://randomuser.me/api/portraits/women/35.jpg",
    hasStory: true,
    isViewed: false,
  },
  {
    id: 5,
    user: "Josh",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    hasStory: true,
    isViewed: true,
  },
  {
    id: 6,
    user: "Luna",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    hasStory: true,
    isViewed: false,
  },
];

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [postContent, setPostContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postContent.trim() && !previewImage) return;

    const newPost = {
      id: posts.length + 1,
      user: "Current User",
      username: "currentuser",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: postContent,
      time: "Just now",
      image: previewImage,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      isLiked: false,
      isBookmarked: false,
      isVerified: false,
      engagement: 0,
      trending: false,
      category: "General",
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
    setPreviewImage("");
    setShowCreatePost(false);
  };

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

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isBookmarked: !post.isBookmarked,
            }
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
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl px-6 py-3">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mesh
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("explore")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "explore"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                activeTab === "notifications"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "messages"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Mail className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Mesh..."
                className="pl-10 pr-4 py-2 bg-white/20 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
              />
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-600 hover:bg-white/20 transition-all duration-200"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Alex Johnson
                  </h3>
                  <p className="text-gray-600 text-sm">@alexj</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600 font-medium">
                      Pro Member
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">2.5K</div>
                  <div className="text-xs text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">15.2K</div>
                  <div className="text-xs text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">342</div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
                Edit Profile
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">Trending</h2>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>

              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {topic.tag}
                      </div>
                      <div className="text-sm text-gray-600">
                        {topic.posts} posts
                      </div>
                    </div>
                    <div className="text-green-500 text-sm font-medium">
                      {topic.growth}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="font-bold text-lg text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center space-x-2 p-3 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all duration-200">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Story
                  </span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-all duration-200">
                  <Mic className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    Live
                  </span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-all duration-200">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Event
                  </span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-orange-500/20 rounded-xl hover:bg-orange-500/30 transition-all duration-200">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">
                    Group
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stories Section */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">Stories</h2>
                <button className="text-blue-500 hover:text-blue-600 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex space-x-4 overflow-x-auto pb-2">
                {stories.map((story) => (
                  <div key={story.id} className="flex-shrink-0 text-center">
                    <div
                      className={`relative w-16 h-16 rounded-2xl overflow-hidden ${
                        story.isAdd
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                          : story.hasStory && !story.isViewed
                          ? "p-0.5 bg-gradient-to-br from-pink-500 to-orange-500"
                          : "p-0.5 bg-gray-300"
                      }`}
                    >
                      {story.isAdd ? (
                        <Plus className="w-8 h-8 text-white" />
                      ) : (
                        <img
                          src={story.avatar}
                          alt={story.user}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-2 truncate w-16">
                      {story.user}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Post */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Profile"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white"
                />
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-2xl px-4 py-3 text-left text-gray-500 transition-all duration-200"
                >
                  What's on your mind?
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all duration-200">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Photo
                    </span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-all duration-200">
                    <Mic className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Audio
                    </span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-all duration-200">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">
                      Location
                    </span>
                  </button>
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
                  Post
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
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
                            <span className="font-bold text-gray-800">
                              {post.user}
                            </span>
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
                            className={`w-5 h-5 ${
                              post.isLiked ? "fill-current" : ""
                            }`}
                          />
                          <span className="font-medium">
                            {formatNumber(post.likes)}
                          </span>
                        </button>

                        <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">
                            {formatNumber(post.comments)}
                          </span>
                        </button>

                        <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200">
                          <Share2 className="w-5 h-5" />
                          <span className="font-medium">
                            {formatNumber(post.shares)}
                          </span>
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
                            className={`w-5 h-5 ${
                              post.isBookmarked ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Who to Follow */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">
                  Who to Follow
                </h2>
                <Users className="w-5 h-5 text-blue-500" />
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "Sarah Wilson",
                    username: "sarahw",
                    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
                    verified: true,
                    followers: "125K",
                  },
                  {
                    name: "Marcus Chen",
                    username: "marcusc",
                    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
                    verified: true,
                    followers: "89K",
                  },
                  {
                    name: "Elena Rodriguez",
                    username: "elenar",
                    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
                    verified: false,
                    followers: "45K",
                  },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        {user.verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Verified className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          @{user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.followers} followers
                        </div>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Events */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">Live Events</h2>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-500 font-medium">LIVE</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Tech Conference 2024",
                    viewers: "12.5K",
                    category: "Technology",
                  },
                  {
                    title: "Climate Action Summit",
                    viewers: "8.2K",
                    category: "Environment",
                  },
                  {
                    title: "AI Innovation Panel",
                    viewers: "15.7K",
                    category: "AI",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-200/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-800 text-sm">
                        {event.title}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">
                          {event.viewers}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {event.category}
                      </span>
                      <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-600 transition-all duration-200">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">AI Insights</h2>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-800 text-sm">
                      Trend Alert
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Your network is highly engaged with #Web3 content. Consider
                    posting about decentralized technologies.
                  </p>
                  <button className="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-600 transition-all duration-200">
                    Get Suggestions
                  </button>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl border border-blue-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-800 text-sm">
                      Engagement Tip
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Posts with images between 2-4pm get 32% more engagement
                    based on your audience activity.
                  </p>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-600 transition-all duration-200">
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">
                  Recent Activity
                </h2>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>

              <div className="space-y-4">
                {[
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
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200"
                  >
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-xl text-gray-800">Create Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit}>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="Profile"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">Alex Johnson</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Public</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[120px] p-4 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />

                {previewImage && (
                  <div className="mt-4 relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage("")}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-medium text-gray-800">
                    Add to your post
                  </h4>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-green-500" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-5 h-5 text-blue-500" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Smile className="w-5 h-5 text-yellow-500" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-red-500" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Gift className="w-5 h-5 text-purple-500" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!postContent.trim() && !previewImage}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    postContent.trim() || previewImage
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
