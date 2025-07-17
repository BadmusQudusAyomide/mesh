import { useState } from "react";
import Navigation from "../components/Navigation";
import Post from "../components/Post";
import { Crown } from "lucide-react";
import "../App.css";

const user = {
  name: "Badmus",
  username: "badmus",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
};

const initialPosts = [
  {
    id: 1,
    user: "Badmus",
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
  // ...add more posts as needed...
];

function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [posts] = useState(initialPosts);

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
      <div className="md:pt-24 pb-8 px-4 max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mt-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-gray-800">{user.name}</h3>
              <p className="text-gray-600 text-lg">@{user.username}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-yellow-600 font-medium">
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
        {/* User's Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              formatNumber={formatNumber}
              handleLike={() => {}}
              handleBookmark={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
