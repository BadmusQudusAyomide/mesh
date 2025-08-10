import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { API_BASE_URL } from "../config";
import { useAuth } from "../contexts/AuthContextHelpers";
import { apiService } from "../lib/api";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import PostSkeleton from "../components/PostSkeleton";
import type { User, Post, FeedPost } from "../types";
import {
  Crown,
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
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Home,
  Building2,
  Phone,
  
} from "lucide-react";
import { io as socketIOClient, Socket } from "socket.io-client";
import PostsFeed from "../components/PostsFeed";

// Default cover image
const defaultCoverImage =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop";

interface PostProps {
  post: FeedPost;
  formatNumber: (num: number) => string;
  handleLike: (postId: string) => void;
  handleBookmark: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  commentInput: string;
  setCommentInput: (val: string) => void;
}

const Post = ({
  post,
  formatNumber,
  handleLike,
  handleBookmark,
  onAddComment,
  commentInput,
  setCommentInput,
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
    {/* Comments Section */}
    <div className="mt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (commentInput.trim()) {
            onAddComment(post.id, commentInput);
          }
        }}
        className="flex gap-2 items-center mb-2"
      >
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-1"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Comment
        </button>
      </form>
      <div className="space-y-2">
        {post.commentList.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2">
            <Link to={`/profile/${comment.user.username}`} className="flex-shrink-0" aria-label={`View ${comment.user.fullName}'s profile`}>
              <img
                src={comment.user.avatar}
                alt={comment.user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
            <div>
              <Link to={`/profile/${comment.user.username}`} className="font-semibold text-sm hover:underline">
                {comment.user.fullName}
              </Link>
              <p className="text-gray-700 text-sm mb-0.5">{comment.text}</p>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface EditProfileProps {
  user: User;
  onClose: () => void;
  onSave: (data: {
    fullName: string;
    bio: string;
    website: string;
    location: string;
    avatar: string;
    cover: string;
    birthday?: string | null;
    gender?: "male" | "female" | "other" | "prefer_not_to_say" | "";
    relationshipStatus?:
      | "single"
      | "in_a_relationship"
      | "engaged"
      | "married"
      | "complicated"
      | "separated"
      | "divorced"
      | "widowed"
      | "";
    workplace?: string;
    education?: string;
    hometown?: string;
    currentCity?: string;
    phone?: string;
  }) => Promise<void>;
}

function EditProfile({ user, onClose, onSave }: EditProfileProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [website, setWebsite] = useState(user.website || "");
  const [location, setLocation] = useState(user.location || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [cover, setCover] = useState(user.cover || "");
  const [birthday, setBirthday] = useState<string>(
    user.birthday ? new Date(user.birthday).toISOString().slice(0, 10) : ""
  );
  const [gender, setGender] = useState<
    "male" | "female" | "other" | "prefer_not_to_say" | ""
  >(user.gender || "");
  const [relationshipStatus, setRelationshipStatus] = useState<
    | "single"
    | "in_a_relationship"
    | "engaged"
    | "married"
    | "complicated"
    | "separated"
    | "divorced"
    | "widowed"
    | ""
  >(user.relationshipStatus || "");
  const [workplace, setWorkplace] = useState(user.workplace || "");
  const [education, setEducation] = useState(user.education || "");
  const [hometown, setHometown] = useState(user.hometown || "");
  const [currentCity, setCurrentCity] = useState(user.currentCity || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image/upload`;
  const UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "mesh_unsigned";

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
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
    } catch {
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        fullName,
        bio,
        website,
        location,
        avatar,
        cover,
        birthday: birthday || null,
        gender,
        relationshipStatus,
        workplace,
        education,
        hometown,
        currentCity,
        phone,
      } as any);
      onClose();
    } catch {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-semibold text-gray-900">Edit Profile</h3>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        <div className="relative h-40 rounded-2xl overflow-hidden mb-8">
          <img src={cover} alt="Cover" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => {
              if (coverInputRef.current) coverInputRef.current.click();
            }}
            className="absolute top-4 right-4 p-2 bg-black/30 rounded-lg text-white hover:bg-black/40 transition-all"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            className="hidden"
            onChange={(e) => handleImageUpload(e, "cover")}
          />
        </div>
        <div className="flex justify-center -mt-20 mb-4">
          <div className="relative">
            <img
              src={avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
            />
            <button
              type="button"
              onClick={() => {
                if (avatarInputRef.current) avatarInputRef.current.click();
              }}
              className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full border-2 border-white text-white hover:bg-blue-600 transition-all flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              className="hidden"
              onChange={(e) => handleImageUpload(e, "avatar")}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Relationship Status
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={relationshipStatus}
                onChange={(e) => setRelationshipStatus(e.target.value as any)}
              >
                <option value="">Prefer not to say</option>
                <option value="single">Single</option>
                <option value="in_a_relationship">In a relationship</option>
                <option value="engaged">Engaged</option>
                <option value="married">Married</option>
                <option value="complicated">It's complicated</option>
                <option value="separated">Separated</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Workplace
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hometown
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current City
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("posts");
  const [darkMode] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{
    [postId: string]: string;
  }>({});

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

        // Load initial posts with pagination
        await loadInitialPosts(username);
      } catch {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  // Load initial posts function
  const loadInitialPosts = async (username: string) => {
    try {
      setIsInitialLoading(true);
      setPostsError(null);
      const postsRes = await apiService.getPostsByUsernamePaginated(username, 1, 5);
      const transformedPosts = postsRes.posts.map((post) => ({
        id: post._id,
        authorId: post.user._id,
        user: post.user.fullName,
        username: post.user.username,
        avatar: post.user.avatar,
        content: post.content,
        time: new Date(post.createdAt).toLocaleString(),
        image: post.image,
        likes: post.likes.length,
        comments: post.comments.length,
        shares: 0,
        views: 0,
        isLiked: currentUser ? post.likes.includes(currentUser._id) : false,
        isBookmarked: false,
        isVerified: post.user.isVerified,
        engagement: 0,
        trending: undefined,
        category: undefined,
        commentList: (post.comments || []).map((c: any) => ({
          id: c._id,
          user: {
            id: c.user._id,
            fullName: c.user.fullName,
            username: c.user.username,
            avatar: c.user.avatar,
          },
          text: c.text,
          createdAt: c.createdAt,
        })),
      }));
      setPosts(transformedPosts);
      setCurrentPage(2); // Next page to load
      setHasMore(postsRes.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load initial posts:', err);
      setPostsError('Failed to load posts');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Load more posts function
  const loadMorePosts = async () => {
    if (!hasMore || !username) return;
    
    try {
      const postsRes = await apiService.getPostsByUsernamePaginated(username, currentPage, 5);
      const transformedPosts = postsRes.posts.map((post) => ({
        id: post._id,
        authorId: post.user._id,
        user: post.user.fullName,
        username: post.user.username,
        avatar: post.user.avatar,
        content: post.content,
        time: new Date(post.createdAt).toLocaleString(),
        image: post.image,
        likes: post.likes.length,
        comments: post.comments.length,
        shares: 0,
        views: 0,
        isLiked: currentUser ? post.likes.includes(currentUser._id) : false,
        isBookmarked: false,
        isVerified: post.user.isVerified,
        engagement: 0,
        trending: undefined,
        category: undefined,
        commentList: (post.comments || []).map((c: any) => ({
          id: c._id,
          user: {
            id: c.user._id,
            fullName: c.user.fullName,
            username: c.user.username,
            avatar: c.user.avatar,
          },
          text: c.text,
          createdAt: c.createdAt,
        })),
      }));
      
      setPosts(prev => {
        // Prevent duplicates by filtering out posts that already exist
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPosts = transformedPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });
      
      setCurrentPage(prev => prev + 1);
      setHasMore(postsRes.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load more posts:', err);
      setPostsError('Failed to load more posts');
    }
  };

  // Infinite scroll hook
  const { isFetching, setIsFetching } = useInfiniteScroll(loadMorePosts);

  // Stop fetching when done loading
  useEffect(() => {
    if (isFetching && !hasMore) {
      setIsFetching(false);
    }
  }, [isFetching, hasMore, setIsFetching]);

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

        // Load initial posts with pagination
        await loadInitialPosts(username);
      } catch {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api.*/, "");
    const socket: Socket = socketIOClient(SOCKET_URL);
    socket.on("postUpdated", (updatedPost: Post) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost._id
            ? {
                ...post,
                likes: updatedPost.likes.length,
                isLiked: currentUser
                  ? updatedPost.likes.includes(currentUser._id)
                  : false,
                comments: updatedPost.comments.length,
                commentList: (updatedPost.comments || []).map((c) => ({
                  id: c._id,
                  user: {
                    id: c.user._id,
                    fullName: c.user.fullName,
                    username: c.user.username,
                    avatar: c.user.avatar,
                  },
                  text: c.text,
                  createdAt: c.createdAt,
                })),
              }
            : post
        )
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [username, currentUser]);

  const handleFollow = async (userIdToFollow: string) => {
    if (!currentUser || !profileUser) return;

    try {
      const response = await apiService.followUser(userIdToFollow);

      // Update the profile page's state if the action is for the profile user
      if (userIdToFollow === profileUser._id) {
        setIsFollowing(response.isFollowing);
        setProfileUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            followerCount: response.isFollowing
              ? (prevUser.followerCount || 0) + 1
              : Math.max(0, (prevUser.followerCount || 0) - 1),
          };
        });
      }

      // Update the global user context for app-wide consistency
      if (updateUser) {
        const currentFollowing = currentUser.following || [];
        const newFollowing = response.isFollowing
          ? [...currentFollowing, userIdToFollow]
          : currentFollowing.filter(id => id.toString() !== userIdToFollow.toString());
        updateUser({ ...currentUser, following: newFollowing });
      }

    } catch {
      console.error("Error following user");
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

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
                commentList: (res.post.comments || []).map((c) => ({
                  id: c._id,
                  user: {
                    id: c.user._id,
                    fullName: c.user.fullName,
                    username: c.user.username,
                    avatar: c.user.avatar,
                  },
                  text: c.text,
                  createdAt: c.createdAt,
                })),
              }
            : post
        )
      );
    } catch {
      alert("Failed to like post");
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      const res = await apiService.addComment(postId, text);
      setPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: res.post.comments.length,
                commentList: (res.post.comments || []).map((c) => ({
                  id: c._id,
                  user: {
                    id: c.user._id,
                    fullName: c.user.fullName,
                    username: c.user.username,
                    avatar: c.user.avatar,
                  },
                  text: c.text,
                  createdAt: c.createdAt,
                })),
              }
            : post
        )
      );
      setCommentInputs((inputs) => ({ ...inputs, [postId]: "" }));
    } catch {
      alert("Failed to add comment");
    }
  };

  const handleBookmark = (postId: string): void => {
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
    { id: "media", label: "Media", count: 0 },
    { id: "likes", label: "Likes", count: 0 },
  ];

  // Lightweight inline SVG placeholder (no network)
  const AvatarPlaceholder = ({ className }: { className: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="#e5e7eb"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="999" fill="#e5e7eb" />
      <circle cx="12" cy="9" r="4" fill="#cbd5e1" />
      <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" fill="#cbd5e1" />
    </svg>
  );

  if (error || (!profileUser && !isLoading)) {
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
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {profileUser?.avatar ? (
              <img
                src={profileUser.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <AvatarPlaceholder className="w-10 h-10 rounded-xl" />
            )}
            <div>
              <h1 className="font-bold text-lg text-gray-800">
                {profileUser?.fullName || "..."}
              </h1>
              <p className="text-sm text-gray-600">
                {formatNumber(profileUser?.postCount || 0)} posts
              </p>
            </div>
          </div>
          {currentUser &&
            profileUser &&
            currentUser._id === profileUser._id && (
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
              >
                Edit Profile
              </button>
            )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="relative -mt-4">
          <div className="h-48 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl overflow-hidden">
            <img
              src={profileUser?.cover || defaultCoverImage}
              alt="Cover"
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
            />
            <button className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-lg text-white hover:bg-black/40 transition-all">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="relative">
                {profileUser?.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <AvatarPlaceholder className="w-full h-full" />
                  </div>
                )}
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full border-2 border-white text-white hover:bg-blue-600 transition-all flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex space-x-3 mt-16">
                {currentUser && profileUser && currentUser._id !== profileUser._id && (
                  <button
                    onClick={() => handleFollow(profileUser._id)}
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
                  <span>{profileUser?.fullName || "..."}</span>
                  {profileUser?.isVerified && (
                    <Crown className="w-6 h-6 text-yellow-500" />
                  )}
                </h2>
                <p className="text-gray-600">@{profileUser?.username}</p>
              </div>

              {profileUser?.bio && (
                <p className="text-gray-700 leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {profileUser?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser?.website && (
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
                    {new Date(profileUser?.createdAt || "").toLocaleDateString(
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
                <Link
                  to={`/profile/${profileUser?.username}/follow?tab=following`}
                  className="text-center hover:opacity-80 transition"
                >
                  <div className="font-bold text-xl text-gray-800">
                    {formatNumber(profileUser?.followingCount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </Link>
                <Link
                  to={`/profile/${profileUser?.username}/follow?tab=followers`}
                  className="text-center hover:opacity-80 transition"
                >
                  <div className="font-bold text-xl text-gray-800">
                    {formatNumber(profileUser?.followerCount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </Link>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {formatNumber(profileUser?.postCount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            {profileUser?.birthday && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(profileUser.birthday).toLocaleDateString()}</span>
              </div>
            )}
            {profileUser?.gender && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-gray-500">⚧</span>
                <span className="capitalize">{profileUser.gender.replaceAll('_', ' ')}</span>
              </div>
            )}
            {profileUser?.relationshipStatus && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-gray-500">❤️</span>
                <span className="capitalize">{profileUser.relationshipStatus.replaceAll('_', ' ')}</span>
              </div>
            )}
            {profileUser?.workplace && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span>Works at {profileUser.workplace}</span>
              </div>
            )}
            {profileUser?.education && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <span>Studied at {profileUser.education}</span>
              </div>
            )}
            {profileUser?.hometown && (
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                <span>From {profileUser.hometown}</span>
              </div>
            )}
            {profileUser?.currentCity && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span>Lives in {profileUser.currentCity}</span>
              </div>
            )}
            {profileUser?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{profileUser.phone}</span>
              </div>
            )}
          </div>
        </div>

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

        <div className="pb-8">
          {activeTab === "posts" && (
            <>
              {/* Initial Loading State */}
              {isInitialLoading ? (
                <PostSkeleton count={5} />
              ) : postsError ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ExternalLink className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Failed to load posts
                  </h3>
                  <p className="text-gray-500 mb-4">{postsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {currentUser && profileUser && currentUser._id === profileUser._id 
                      ? "Share your first post to get started!" 
                      : `${profileUser?.fullName} hasn't posted anything yet.`}
                  </p>
                </div>
              ) : (
                <>
                  <PostsFeed
                    posts={posts}
                    formatNumber={formatNumber}
                    handleLike={handleLike}
                    handleBookmark={handleBookmark}
                    onAddComment={handleAddComment}
                    commentInputs={commentInputs}
                    setCommentInputs={setCommentInputs}
                    onFollow={handleFollow} // Pass the generic follow handler
                  />
                  
                  {/* Loading more posts */}
                  {isFetching && hasMore && (
                    <div className="mt-6">
                      <PostSkeleton count={3} />
                    </div>
                  )}
                  
                  {/* End of posts message */}
                  {!hasMore && posts.length > 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                        <Crown className="w-4 h-4 mr-2" />
                        You've seen all posts!
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
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
                    onAddComment={handleAddComment}
                    commentInput={commentInputs[post.id] || ""}
                    setCommentInput={(val) =>
                      setCommentInputs((inputs) => ({
                        ...inputs,
                        [post.id]: val,
                      }))
                    }
                  />
                ))}
            </div>
          )}
        </div>
      </div>
      {showEdit && profileUser && (
        <EditProfile
          user={profileUser}
          onClose={() => setShowEdit(false)}
          onSave={async (data) => {
            const res = await apiService.updateProfile(data);
            const updated = res.user || { ...profileUser, ...data };
            setProfileUser({ ...profileUser, ...updated });
            // Also update auth context if this is the current user
            if (currentUser && profileUser && currentUser._id === profileUser._id && updateUser) {
              updateUser({ ...currentUser, ...updated });
            }
          }}
        />
      )}
    </div>
  );
}

export default Profile;
