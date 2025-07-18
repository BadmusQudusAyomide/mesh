import { useState, useRef } from "react";
import Navigation from "../components/Navigation";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import Stories from "../components/Stories";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import { Zap, Target, BarChart3 } from "lucide-react";
import "../App.css";

const initialPosts = [
  {
    id: 1,
    user: "Chinedu Okafor",
    username: "chineduokafor",
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
    user: "Aisha Bello",
    username: "aishabello",
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
    user: "Emeka Umeh",
    username: "emekaumeh",
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
    user: "Ayomide Balogun",
    username: "ayomidebalogun",
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

const whoToFollow = [
  {
    name: "Ngozi Okonjo",
    username: "ngoziok",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    verified: true,
    followers: "125K",
  },
  {
    name: "Tunde Bakare",
    username: "tundebakare",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    verified: true,
    followers: "89K",
  },
  {
    name: "Chiamaka Eze",
    username: "chiamakaeze",
    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
    verified: false,
    followers: "45K",
  },
];

const liveEvents = [
  { title: "Tech Conference 2024", viewers: "12.5K", category: "Technology" },
  { title: "Climate Action Summit", viewers: "8.2K", category: "Environment" },
  { title: "AI Innovation Panel", viewers: "15.7K", category: "AI" },
];

const aiInsights = [
  {
    icon: <Zap className="w-4 h-4 text-purple-500" />,
    title: "Engagement Boost",
    value: "+23%",
    description: "Your posts perform better with images and hashtags",
  },
  {
    icon: <Target className="w-4 h-4 text-blue-500" />,
    title: "Best Time",
    value: "2-4 PM",
    description: "Optimal posting time for your audience",
  },
  {
    icon: <BarChart3 className="w-4 h-4 text-green-500" />,
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

const user = {
  name: "Badmus",
  username: "badmus",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
};

function Home() {
  const [posts, setPosts] = useState(initialPosts);
  const [postContent, setPostContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postContent.trim() && !previewImage) return;
    const newPost = {
      id: posts.length + 1,
      user: user.name,
      username: user.username,
      avatar: user.avatar,
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
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className="md:pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <Stories stories={stories} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden md:block">
            <SidebarLeft trendingTopics={trendingTopics} user={user} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post prompt: show first on mobile, after Stories on desktop */}
            <div className="block md:hidden">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={user.avatar}
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
                <div className="flex flex-nowrap space-x-2">
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all duration-200"
                  >
                    <span className="w-4 h-4 bg-blue-600 rounded-full inline-block" />
                    <span className="text-sm font-medium text-blue-600">
                      Photo
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-all duration-200"
                  >
                    <span className="w-4 h-4 bg-green-600 rounded-full inline-block" />
                    <span className="text-sm font-medium text-green-600">
                      Audio
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-all duration-200"
                  >
                    <span className="w-4 h-4 bg-purple-600 rounded-full inline-block" />
                    <span className="text-sm font-medium text-purple-600">
                      Location
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {/* Desktop: show create post prompt after stories */}
            <div className="hidden md:block">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={user.avatar}
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
                <div className="flex flex-nowrap space-x-2">
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all duration-200"
                  >
                    <span className="w-4 h-4 bg-blue-600 rounded-full inline-block" />
                    <span className="text-sm font-medium text-blue-600">
                      Photo
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-all duration-200"
                  >
                    <span className="w-4 h-4 bg-green-600 rounded-full inline-block" />
                    <span className="text-sm font-medium text-green-600">
                      Audio
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-all duration-200"
                  >
                    <span className="w-4 h-4 bg-purple-600 rounded-full inline-block" />
                    <span className="text-sm font-medium text-purple-600">
                      Location
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <PostsFeed
              posts={posts}
              formatNumber={formatNumber}
              handleLike={handleLike}
              handleBookmark={handleBookmark}
            />
          </div>
          <SidebarRight
            whoToFollow={whoToFollow}
            liveEvents={liveEvents}
            aiInsights={aiInsights}
            recentActivity={recentActivity}
          />
        </div>
      </div>
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
