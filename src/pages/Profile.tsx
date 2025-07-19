import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../lib/api";
import type { User } from "../types";
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
  Loader2,
  ArrowLeft,
} from "lucide-react";

// Default cover image
const defaultCoverImage =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop";

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

// Add EditProfile overlay component inside Profile
function EditProfile({ user, onClose, onSave }) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [website, setWebsite] = useState(user.website || "");
  const [location, setLocation] = useState(user.location || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [cover, setCover] = useState(user.cover || "");
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Cloudinary unsigned upload preset (replace with your preset if needed)
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "mesh_unsigned";

  const handleImageUpload = async (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    setLoading(true);
    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (type === "avatar") setAvatar(data.secure_url);
      if (type === "cover") setCover(data.secure_url);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ fullName, bio, website, location, avatar, cover });
      onClose();
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-semibold text-gray-900">Edit Profile</h3>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Cover Image */}
        <div className="relative h-40 rounded-2xl overflow-hidden mb-8">
          <img src={cover} alt="Cover" className="w-full h-full object-cover" />
          <button type="button" onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 p-2 bg-black/30 rounded-lg text-white hover:bg-black/40 transition-all">
            <Camera className="w-5 h-5" />
          </button>
          <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={e => handleImageUpload(e, "cover")}/>
        </div>
        {/* Avatar */}
        <div className="flex justify-center -mt-20 mb-4">
          <div className="relative">
            <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" />
            <button type="button" onClick={() => avatarInputRef.current.click()} className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full border-2 border-white text-white hover:bg-blue-600 transition-all flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </button>
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={e => handleImageUpload(e, "avatar")}/>
          </div>
        </div>
        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 mt-1" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea className="w-full border rounded-lg px-3 py-2 mt-1" value={bio} onChange={e => setBio(e.target.value)} maxLength={200} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input type="url" className="w-full border rounded-lg px-3 py-2 mt-1" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 mt-1" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("posts");
  const [darkMode] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError("Username is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getUserProfile(username);
        setProfileUser(response.user);
        setIsFollowing(response.isFollowing);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!profileUser || !currentUser) return;

    try {
      const response = await apiService.followUser(profileUser._id);
      setIsFollowing(response.isFollowing);
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

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
    { id: "posts", label: "Posts", count: profileUser?.postCount || 0 },
    { id: "media", label: "Media", count: 0 }, // TODO: Implement media count
    { id: "likes", label: "Likes", count: 0 }, // TODO: Implement likes count
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
              src={profileUser.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-bold text-lg text-gray-800">
                {profileUser.fullName}
              </h1>
              <p className="text-sm text-gray-600">
                {formatNumber(profileUser.postCount || 0)} posts
              </p>
            </div>
          </div>
          {/* Show Edit Profile button for current user */}
          {currentUser && currentUser._id === profileUser._id && (
            <button onClick={() => setShowEdit(true)} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Cover Photo & Profile Section */}
        <div className="relative -mt-4">
          <div className="h-48 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl overflow-hidden">
            <img
              src={defaultCoverImage}
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
                  src={profileUser.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full border-2 border-white text-white hover:bg-blue-600 transition-all flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex space-x-3 mt-16">
                {currentUser && currentUser._id !== profileUser._id && (
                <button
                    onClick={handleFollow}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                )}
                <button className="px-6 py-2 rounded-xl font-medium bg-white/70 backdrop-blur-sm text-gray-800 border border-gray-200 hover:bg-white transition-all">
                  Message
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>{profileUser.fullName}</span>
                  {profileUser.isVerified && (
                  <Crown className="w-6 h-6 text-yellow-500" />
                  )}
                </h2>
                <p className="text-gray-600">@{profileUser.username}</p>
              </div>

              {profileUser.bio && (
                <p className="text-gray-700 leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {profileUser.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                    <span>{profileUser.location}</span>
                </div>
                )}
                {profileUser.website && (
                <div className="flex items-center space-x-1">
                  <ExternalLink className="w-4 h-4" />
                    <a
                      href={
                        profileUser.website.startsWith("http")
                          ? profileUser.website
                          : `https://${profileUser.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profileUser.website}
                  </a>
                </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(profileUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </span>
                </div>
              </div>

              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {formatNumber(profileUser.followingCount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {formatNumber(profileUser.followerCount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {formatNumber(profileUser.postCount || 0)}
                  </div>
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
      {/* Edit Profile Overlay */}
      {showEdit && (
        <EditProfile
          user={profileUser}
          onClose={() => setShowEdit(false)}
          onSave={async (data) => {
            await apiService.updateProfile(data);
            // Optionally, refetch profile data here
            setProfileUser({ ...profileUser, ...data });
          }}
        />
      )}
    </div>
  );
}

export default Profile;
