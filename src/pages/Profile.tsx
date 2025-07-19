import { useState } from "react";
import Navigation from "../components/Navigation";
import {
  Crown,
  Settings,
  MapPin,
  Calendar,
  ExternalLink,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Camera,
  Edit3,
} from "lucide-react";

const user = {
  name: "Badmus Qudus",
  username: "badmuzzzzzzz",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  bio: "Software Engineer & Tech Enthusiast | Building the future with AI ✨ | Based in Lagos, Nigeria 🇳🇬",
  location: "Lagos, Nigeria",
  website: "badmusqudusayomide.vercel.app",
  joinDate: "March 2006",
  coverImage:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
};

const initialPosts = [
  {
    id: 1,
    user: "Badmus Adebayo",
    username: "badmus",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
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
    user: "Badmus Adebayo",
    username: "badmus",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    content:
      "Working on something exciting in the blockchain space. Can't wait to share more details soon! Who else is excited about Web3? 🌐⛓️",
    time: "1h ago",
    likes: 156,
    comments: 42,
    shares: 8,
    views: 1203,
    isLiked: true,
    isBookmarked: false,
    isVerified: true,
    category: "Blockchain",
  },
  {
    id: 3,
    user: "Badmus Adebayo",
    username: "badmus",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    content:
      "Beautiful sunset from my balcony today. Sometimes you need to pause and appreciate the simple things in life 🌅",
    time: "3h ago",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    likes: 89,
    comments: 12,
    shares: 3,
    views: 456,
    isLiked: false,
    isBookmarked: true,
    isVerified: true,
    category: "Lifestyle",
  },
];

interface PostProps {
  post: {
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
    engagement?: number;
    trending?: boolean;
    category?: string;
  };
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
  <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex items-start space-x-4 mb-4">
      <img
        src={post.avatar}
        alt={post.user}
        className="w-12 h-12 rounded-xl object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-800">{post.user}</h4>
          {post.isVerified && <Crown className="w-4 h-4 text-yellow-500" />}
          <span className="text-gray-500 text-sm">@{post.username}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 text-sm">{post.time}</span>
        </div>
        <p className="text-gray-700 mt-2 leading-relaxed">{post.content}</p>
      </div>
      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>

    {post.image && (
      <div className="mb-4 rounded-xl overflow-hidden">
        <img
          src={post.image}
          alt="Post content"
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
      <button
        onClick={() => handleLike(post.id)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
          post.isLiked
            ? "text-red-500 bg-red-50"
            : "text-gray-500 hover:text-red-500 hover:bg-red-50"
        }`}
      >
        <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
        <span className="font-medium">{formatNumber(post.likes)}</span>
      </button>

      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all">
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium">{formatNumber(post.comments)}</span>
      </button>

      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 transition-all">
        <Share className="w-5 h-5" />
        <span className="font-medium">{formatNumber(post.shares)}</span>
      </button>

      <button
        onClick={() => handleBookmark(post.id)}
        className={`p-2 rounded-lg transition-all ${
          post.isBookmarked
            ? "text-yellow-500 bg-yellow-50"
            : "text-gray-500 hover:text-yellow-500 hover:bg-yellow-50"
        }`}
      >
        <Bookmark
          className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`}
        />
      </button>
    </div>
  </div>
);

function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [darkMode] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [isFollowing, setIsFollowing] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleLike = (postId: number): void => {
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

  const handleBookmark = (postId: number): void => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const tabs = [
    { id: "posts", label: "Posts", count: 342 },
    { id: "media", label: "Media", count: 89 },
    { id: "likes", label: "Likes", count: 1.2 },
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      <Navigation
        activeTab="profile"
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={() => {}}
      />
      {/* Header with Settings */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-bold text-lg text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-600">{formatNumber(342)} posts</p>
            </div>
          </div>
          <button className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Cover Photo & Profile Section */}
        <div className="relative -mt-4">
          <div className="h-48 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl overflow-hidden">
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
            />
            <button className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-lg text-white hover:bg-black/40 transition-all">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full border-2 border-white text-white hover:bg-blue-600 transition-all flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex space-x-3 mt-16">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button className="px-6 py-2 rounded-xl font-medium bg-white/70 backdrop-blur-sm text-gray-800 border border-gray-200 hover:bg-white transition-all">
                  Message
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>{user.name}</span>
                  <Crown className="w-6 h-6 text-yellow-500" />
                </h2>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              <p className="text-gray-700 leading-relaxed">{user.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ExternalLink className="w-4 h-4" />
                  <a href="#" className="text-blue-500 hover:underline">
                    {user.website}
                  </a>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>

              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">2.5K</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">15.2K</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">342</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-24 z-40 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 mb-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-sm opacity-60">
                  {typeof tab.count === "number" && tab.count < 1000
                    ? tab.count
                    : formatNumber(tab.count)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Content */}
        <div className="pb-8">
          {activeTab === "posts" && (
            <div className="space-y-6">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  formatNumber={formatNumber}
                  handleLike={handleLike}
                  handleBookmark={handleBookmark}
                />
              ))}
            </div>
          )}

          {activeTab === "media" && (
            <div className="grid grid-cols-2 gap-4">
              {posts
                .filter((post) => post.image)
                .map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square rounded-xl overflow-hidden"
                  >
                    <img
                      src={post.image}
                      alt="Media"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
            </div>
          )}

          {activeTab === "likes" && (
            <div className="space-y-6">
              {posts
                .filter((post) => post.isLiked)
                .map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    formatNumber={formatNumber}
                    handleLike={handleLike}
                    handleBookmark={handleBookmark}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
