import { useState, useRef, useEffect } from "react";
import Navigation from "../components/Navigation";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import Stories from "../components/Stories";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import { Zap, Target, BarChart3 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";
import { apiService } from "../lib/api";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
}/image/upload`;
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "mesh_unsigned";

const initialPosts = [
  {
    id: 1,
    user: "Adufe",
    username: "omorrrrrr",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    content:
      "Omor i just did some cratzy thing now., CHeck ot out .The future is now! 🚀✨",
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
    user: "Owoyemi ",
    username: "owoyemi",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
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
    user: "Codetream Eric",
    username: "codetreameric",
    avatar: "https://randomuser.me/api/portraits/men/37.jpg",
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
    user: "Alfred Chinedu",
    username: "alfredchinedu",
    avatar: "https://randomuser.me/api/portraits/men/38.jpg",
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
    user: "Omor omor",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    hasStory: true,
    isViewed: false,
  },
  {
    id: 3,
    user: "Owoyemi",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    hasStory: true,
    isViewed: true,
  },
  {
    id: 4,
    user: "Codetream Eric",
    avatar: "https://randomuser.me/api/portraits/men/37.jpg",
    hasStory: true,
    isViewed: false,
  },
  {
    id: 5,
    user: "Alfred Chinedu",
    avatar: "https://randomuser.me/api/portraits/men/38.jpg",
    hasStory: true,
    isViewed: true,
  },
  {
    id: 6,
    user: "Ngozi Okonjo",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
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

function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [postContent, setPostContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiService.getPosts();
        // Map backend posts to frontend format if needed
        const backendPosts = res.posts.map((post: any) => ({
          id: post._id,
          user: post.user?.fullName || "Anonymous",
          username: post.user?.username || "anonymous",
          avatar:
            post.user?.avatar ||
            "https://randomuser.me/api/portraits/men/1.jpg",
          content: post.content,
          time: new Date(post.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: post.image,
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          shares: 0,
          views: 0,
          isLiked: false,
          isBookmarked: false,
          isVerified: post.user?.isVerified || false,
          engagement: 0,
          trending: false,
          category: "General",
        }));
        setPosts(backendPosts);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchPosts();
  }, []);

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
      } catch (err) {
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
          isVerified: false,
          engagement: 0,
          trending: false,
          category: "General",
        },
        ...posts,
      ]);
      setPostContent("");
      setPreviewImage("");
      setShowCreatePost(false);
    } catch (err) {
      alert("Failed to create post");
    }
  };

  // Helper to convert dataURL to File
  function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
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
      {/* App Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mesh
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <svg
                className="w-6 h-6 text-gray-600"
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
            </button>
          </div>
        </div>
      </div>
      <div className="pb-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden md:block">
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
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {/* API Test Section - Only show for testing */}
            {/* {showApiTest && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <ApiTest />
              </div>
            )} */}

            <Stories
              stories={stories}
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
