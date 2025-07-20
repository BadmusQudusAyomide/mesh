import { useState, useRef, useEffect } from "react";
import Navigation from "../components/Navigation";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import Stories from "../components/Stories";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";
import { apiService } from "../lib/api";
import type { Post as BackendPost, FeedPost } from "../types";

// Type for backend comment structure
type BackendComment = {
  _id?: string;
  user: {
    _id?: string;
    fullName: string;
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
  const [postContent, setPostContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentInputs, setCommentInputs] = useState<{
    [postId: string]: string;
  }>({});
  // 3. Get user from useAuth
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiService.getPosts();
        setPosts(
          res.posts.map(
            (post: BackendPost): FeedPost => ({
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
          )
        );
      } catch {
        // Optionally handle error
      }
    };
    fetchPosts();
  }, [user]);

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
              onAddComment={handleAddComment}
              commentInputs={commentInputs}
              setCommentInputs={setCommentInputs}
              currentUserId={user?._id || null}
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
