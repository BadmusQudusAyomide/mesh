import { useState, useRef, useEffect } from "react";
import Navigation from "../components/Navigation";
import { usePreloader } from "../hooks/usePreloader";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Search,
  TrendingUp,
  Users,
  MapPin,
  Play,
  Volume2,
  VolumeX,
  Grid3X3,
  Video,
  ImageIcon,
  Music,
  Hash,
  Sparkles,
  Filter,
  X,
  Compass,
  Zap,
  Flame,
  Star,
  Aperture,
  Globe,
  Film,
} from "lucide-react";

// Define content type
interface ContentItem {
  id: number;
  type: string;
  src: string;
  thumbnail?: string;
  user: string;
  username: string;
  avatar: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views: string;
  duration?: string;
  tags: string[];
  category: string;
  isLiked: boolean;
  isBookmarked: boolean;
  location?: string;
  music?: string;
  readTime?: string;
}

// Enhanced sample data
const trendingTopics = [
  {
    id: 1,
    tag: "TechInAfrica",
    posts: "12.5K",
    growth: "+15%",
    category: "Technology",
  },
  {
    id: 2,
    tag: "Afrobeats2024",
    posts: "8.9K",
    growth: "+32%",
    category: "Music",
  },
  {
    id: 3,
    tag: "SustainableLiving",
    posts: "15.2K",
    growth: "+8%",
    category: "Lifestyle",
  },
  {
    id: 4,
    tag: "Nollywood",
    posts: "22.1K",
    growth: "+12%",
    category: "Entertainment",
  },
  {
    id: 5,
    tag: "StartupAfrica",
    posts: "9.8K",
    growth: "+25%",
    category: "Business",
  },
  {
    id: 6,
    tag: "AfricanFashion",
    posts: "7.3K",
    growth: "+18%",
    category: "Fashion",
  },
  { id: 7, tag: "NaijaFood", posts: "14.6K", growth: "+22%", category: "Food" },
];

const featuredCreators = [
  {
    id: 1,
    name: "Kemi Adebayo",
    username: "kemiadebayo",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    followers: "125K",
    category: "Tech Creator",
    isVerified: true,
    isFollowing: false,
    content: "AI | Web Development | Tech News",
  },
  {
    id: 2,
    name: "David Okafor",
    username: "davidokafor",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    followers: "89K",
    category: "Entrepreneur",
    isVerified: true,
    isFollowing: true,
    content: "Startups | Business Growth | Finance",
  },
  {
    id: 3,
    name: "Funmi Lagos",
    username: "funmilagos",
    avatar: "https://randomuser.me/api/portraits/women/38.jpg",
    followers: "67K",
    category: "Designer",
    isVerified: false,
    isFollowing: false,
    content: "UI/UX | Graphic Design | Creativity",
  },
  {
    id: 4,
    name: "Tunde Bakare",
    username: "tundebakare",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    followers: "112K",
    category: "Blockchain Expert",
    isVerified: true,
    isFollowing: false,
    content: "Web3 | Crypto | Blockchain Tech",
  },
];

const exploreContent = [
  // Short-form videos (Reels)
  {
    id: 1,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
    user: "Ngozi Okonjo",
    username: "ngoziok",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "The Future of AI in Africa",
    description:
      "Exploring how AI is transforming African industries and creating new opportunities for growth.",
    likes: 1420,
    comments: 98,
    shares: 34,
    views: "12.5K",
    duration: "0:15",
    tags: ["AI", "Africa", "Technology", "Future"],
    category: "Technology",
    isLiked: false,
    isBookmarked: false,
    location: "Lagos, Nigeria",
    music: "Original Sound - Ngozi Okonjo",
  },
  {
    id: 2,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
    user: "Adeola Johnson",
    username: "adeolaj",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    title: "Lagos Nightlife",
    description: "Experience the vibrant nightlife in Nigeria's largest city!",
    likes: 3200,
    comments: 245,
    shares: 156,
    views: "45.8K",
    duration: "0:22",
    tags: ["Lagos", "Nightlife", "Nigeria", "Travel"],
    category: "Lifestyle",
    isLiked: true,
    isBookmarked: false,
    location: "Lagos, Nigeria",
    music: "Afrobeat Mix - DJ Kool",
  },

  // Standard posts
  {
    id: 3,
    type: "image",
    src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500",
    user: "Tunde Bakare",
    username: "tundebakare",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    title: "Web3 Revolution in Nigeria",
    description:
      "How blockchain technology is empowering Nigerian creators and entrepreneurs.",
    likes: 980,
    comments: 67,
    shares: 21,
    views: "8.2K",
    tags: ["Web3", "Blockchain", "Nigeria", "Crypto"],
    category: "Technology",
    isLiked: true,
    isBookmarked: false,
    location: "Abuja, Nigeria",
  },
  {
    id: 4,
    type: "video",
    src: "https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500",
    user: "Chiamaka Eze",
    username: "chiamakaeze",
    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
    title: "Sustainable Living Tips",
    description: "Simple changes that make a big impact on our environment.",
    likes: 1500,
    comments: 120,
    shares: 45,
    views: "18.7K",
    duration: "2:45",
    tags: ["Sustainability", "Environment", "GreenLiving"],
    category: "Lifestyle",
    isLiked: false,
    isBookmarked: true,
    location: "Enugu, Nigeria",
  },

  // More content
  {
    id: 5,
    type: "image",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    user: "Emeka Umeh",
    username: "emekaumeh",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    title: "Mountain Views",
    description: "Sometimes we need to pause and appreciate nature's beauty.",
    likes: 523,
    comments: 67,
    shares: 34,
    views: "5.1K",
    tags: ["Nature", "Photography", "Mountains"],
    category: "Photography",
    isLiked: true,
    isBookmarked: false,
    location: "Jos, Nigeria",
  },
  {
    id: 6,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
    user: "Adaora Nkem",
    username: "adaorankem",
    avatar: "https://randomuser.me/api/portraits/women/29.jpg",
    title: "Traditional Nigerian Recipes",
    description: "Authentic Igbo cuisine passed down through generations.",
    likes: 2100,
    comments: 180,
    shares: 89,
    views: "25.3K",
    duration: "0:30",
    tags: ["Food", "Nigerian", "Culture", "Recipe"],
    category: "Food",
    isLiked: false,
    isBookmarked: false,
    location: "Onitsha, Nigeria",
    music: "African Kitchen Sounds",
  },
  {
    id: 7,
    type: "image",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500",
    user: "Segun Arinze",
    username: "segunarinze",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    title: "Startup Culture in Lagos",
    description:
      "Inside Nigeria's thriving tech ecosystem and startup culture.",
    likes: 856,
    comments: 94,
    shares: 67,
    views: "7.8K",
    tags: ["Startup", "Lagos", "Tech", "Business"],
    category: "Business",
    isLiked: false,
    isBookmarked: true,
    location: "Lagos, Nigeria",
  },
  {
    id: 8,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=500",
    user: "Bisi Adeleke",
    username: "bisia",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    title: "Nigerian Wildlife",
    description: "Exploring the beautiful wildlife in Yankari Game Reserve",
    likes: 3200,
    comments: 245,
    shares: 156,
    views: "45.8K",
    duration: "0:45",
    tags: ["Wildlife", "Nature", "Nigeria", "Travel"],
    category: "Travel",
    isLiked: false,
    isBookmarked: false,
    location: "Bauchi, Nigeria",
    music: "Nature Sounds",
  },
  {
    id: 9,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
    user: "Kemi Adebayo",
    username: "kemiadebayo",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    title: "Tech Tips Daily",
    description: "Quick tech tips to make your digital life easier!",
    likes: 1800,
    comments: 120,
    shares: 67,
    views: "22.1K",
    duration: "0:18",
    tags: ["Tech", "Tips", "Digital", "Life"],
    category: "Technology",
    isLiked: true,
    isBookmarked: false,
    location: "Ibadan, Nigeria",
    music: "Tech Vibes - Digital",
  },
  {
    id: 10,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
    user: "David Okafor",
    username: "davidokafor",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    title: "Business Insights",
    description: "Key insights for Nigerian entrepreneurs and business owners",
    likes: 2500,
    comments: 180,
    shares: 95,
    views: "31.5K",
    duration: "0:25",
    tags: ["Business", "Entrepreneur", "Nigeria", "Success"],
    category: "Business",
    isLiked: false,
    isBookmarked: true,
    location: "Port Harcourt, Nigeria",
    music: "Success Motivation",
  },
];

const categories = [
  { id: "all", name: "For You", icon: <Sparkles size={18} /> },
  { id: "reel", name: "Reels", icon: <Film size={18} /> },
  { id: "Technology", name: "Tech", icon: <Zap size={18} /> },
  { id: "Lifestyle", name: "Lifestyle", icon: <Compass size={18} /> },
  { id: "Food", name: "Food", icon: <Aperture size={18} /> },
  { id: "Business", name: "Business", icon: <TrendingUp size={18} /> },
  { id: "Photography", name: "Photo", icon: <ImageIcon size={18} /> },
  { id: "Music", name: "Music", icon: <Music size={18} /> },
  { id: "Travel", name: "Travel", icon: <Globe size={18} /> },
];

function Explore() {
  const [activeView, setActiveView] = useState("grid");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [content, setContent] = useState<ContentItem[]>(exploreContent);
  const [creators, setCreators] = useState(featuredCreators);
  const [activeTab, setActiveTab] = useState("trending");
  const [showComments, setShowComments] = useState(false);
  const [selectedReelForComments, setSelectedReelForComments] =
    useState<ContentItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  // Preloader hook
  const { isItemPreloaded, getPreloadStatus } = usePreloader();

  // Filter content based on search and category
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "reel"
        ? item.type === "reel"
        : item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Handle video playback
  useEffect(() => {
    if (selectedContent && selectedContent.type === "reel") {
      // Play the video after a short delay to ensure DOM is ready
      setTimeout(() => {
        const videoElement = videoRefs.current[selectedContent.id];
        if (videoElement) {
          videoElement.play().catch(console.error);
        }
      }, 100);
    }
  }, [selectedContent]);

  const handleLike = (contentId: number) => {
    setContent((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const handleBookmark = (contentId: number) => {
    setContent((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? { ...item, isBookmarked: !item.isBookmarked }
          : item
      )
    );
  };

  const handleFollow = (creatorId: number) => {
    setCreators((prev) =>
      prev.map((creator) =>
        creator.id === creatorId
          ? { ...creator, isFollowing: !creator.isFollowing }
          : creator
      )
    );
  };

  const formatNumber = (num: number | string) => {
    if (typeof num === "string") return num; // already formatted
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Handle comment button click
  const handleCommentClick = (reel: ContentItem) => {
    setSelectedReelForComments(reel);
    setShowComments(true);
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (commentText.trim() && selectedReelForComments) {
      // Here you would typically send the comment to your backend
      console.log(
        `Adding comment to reel ${selectedReelForComments.id}: ${commentText}`
      );

      // For demo purposes, we'll just clear the input
      setCommentText("");
    }
  };

  // Sample comments data
  const getCommentsForReel = () => {
    const sampleComments = [
      {
        id: 1,
        user: "Kemi Adebayo",
        username: "kemiadebayo",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "This is amazing! 🔥",
        timestamp: "2m ago",
        likes: 12,
        isLiked: false,
      },
      {
        id: 2,
        user: "David Okafor",
        username: "davidokafor",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg",
        text: "Great content! Keep it up 💪",
        timestamp: "5m ago",
        likes: 8,
        isLiked: true,
      },
      {
        id: 3,
        user: "Funmi Lagos",
        username: "funmilagos",
        avatar: "https://randomuser.me/api/portraits/women/38.jpg",
        text: "Love this! 😍",
        timestamp: "10m ago",
        likes: 15,
        isLiked: false,
      },
    ];
    return sampleComments;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-800">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={false}
        setDarkMode={() => {}}
      />
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Explore
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar - Only shown when not searching */}
          {!showFilters && (
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search content, creators, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 backdrop-blur-sm text-gray-800 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Content Type Tabs */}
          <div className="flex border-b border-gray-200 mb-3">
            <button
              onClick={() => setActiveTab("trending")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 ${
                activeTab === "trending"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Flame className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab("reels")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 ${
                activeTab === "reels"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Film className="w-4 h-4" />
              Reels
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 ${
                activeTab === "creators"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Star className="w-4 h-4" />
              Creators
            </button>
          </div>

          {/* View Toggle */}
          {activeTab !== "reels" && (
            <div className="flex items-center justify-end mb-2">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setActiveView("grid")}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeView === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveView("list")}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeView === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600"
                  }`}
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-3 border-t border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowFilters(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
                    selectedCategory === category.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span className="mb-1">{category.icon}</span>
                  <span className="text-xs">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {activeTab === "trending" && (
          <>
            {/* Trending Topics */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Trending Now
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex-shrink-0 bg-white/60 backdrop-blur-lg rounded-xl p-4 min-w-[160px] border border-white/20 shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-800">
                        {topic.tag}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {topic.category}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-600">
                        {topic.posts} posts
                      </div>
                      <div className="text-xs text-green-600">
                        {topic.growth}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Creators */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Featured Creators
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  See all
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {creators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex-shrink-0 bg-white/60 backdrop-blur-lg rounded-xl p-4 w-[200px] border border-white/20 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                      />
                      <button
                        onClick={() => handleFollow(creator.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          creator.isFollowing
                            ? "bg-gray-200 text-gray-600"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {creator.isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                    <h3 className="font-medium flex items-center gap-1 text-gray-800">
                      {creator.name}
                      {creator.isVerified && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      @{creator.username}
                    </p>
                    <p className="text-xs text-blue-600 mb-2">
                      {creator.category}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {creator.content}
                    </p>
                    <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {creator.followers} followers
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Grid/List */}
            <div className="px-4 py-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                {selectedCategory === "all" ? (
                  <>
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Recommended For You
                  </>
                ) : (
                  <>
                    {categories.find((c) => c.id === selectedCategory)?.icon}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </>
                )}
              </h2>

              {activeView === "grid" ? (
                <div className="grid grid-cols-2 gap-2">
                  {filteredContent.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square bg-white/60 backdrop-blur-lg rounded-xl overflow-hidden cursor-pointer group border border-white/20 shadow-lg"
                      onClick={() => setSelectedContent(item)}
                    >
                      {item.type === "video" || item.type === "reel" ? (
                        <div className="relative w-full h-full">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                          <Play className="absolute top-2 right-2 w-6 h-6 text-white" />
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {item.duration}
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        </div>
                      )}

                      {/* Overlay Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h3 className="text-white text-sm font-medium truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={item.avatar}
                            alt={item.user}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-gray-300 text-xs">
                            @{item.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(item.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {item.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContent.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/60 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-lg"
                    >
                      {/* User Info */}
                      <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.user}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {item.user}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Users className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Content */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setSelectedContent(item)}
                      >
                        {item.type === "video" || item.type === "reel" ? (
                          <div className="relative">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full aspect-video object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {item.duration}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full aspect-video object-cover"
                          />
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <h3 className="font-medium mb-2 text-gray-800">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>

                        {/* Tags */}
                        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full whitespace-nowrap"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(item.id);
                              }}
                              className={`flex items-center gap-1 ${
                                item.isLiked ? "text-red-500" : "text-gray-600"
                              }`}
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  item.isLiked ? "fill-current" : ""
                                }`}
                              />
                              <span className="text-sm">
                                {formatNumber(item.likes)}
                              </span>
                            </button>
                            <button
                              className="flex items-center gap-1 text-gray-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm">{item.comments}</span>
                            </button>
                            <button
                              className="flex items-center gap-1 text-gray-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="w-5 h-5" />
                              <span className="text-sm">{item.shares}</span>
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(item.id);
                            }}
                            className={`${
                              item.isBookmarked
                                ? "text-yellow-500"
                                : "text-gray-600"
                            }`}
                          >
                            <Bookmark
                              className={`w-5 h-5 ${
                                item.isBookmarked ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "reels" && (
          <div className="px-4 py-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Video className="w-5 h-5 text-blue-600" />
              Reels
              {getPreloadStatus().total > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  ({getPreloadStatus().loaded}/{getPreloadStatus().total}{" "}
                  loaded)
                </span>
              )}
            </h2>

            {/* Reels Grid */}
            <div className="grid grid-cols-3 gap-1">
              {content
                .filter((item) => item.type === "reel")
                .map((reel) => (
                  <div
                    key={reel.id}
                    className={`relative aspect-[9/16] bg-white/60 backdrop-blur-lg rounded-lg overflow-hidden cursor-pointer group border border-white/20 shadow-lg ${
                      isItemPreloaded(`video-${reel.id}`)
                        ? "ring-2 ring-green-500"
                        : ""
                    }`}
                    onClick={() => setSelectedContent(reel)}
                  >
                    {/* Reel Thumbnail */}
                    <div className="relative w-full h-full">
                      <img
                        src={reel.thumbnail}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                      {/* Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Duration */}
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {reel.duration}
                      </span>

                      {/* Views */}
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {reel.views}
                      </span>
                    </div>

                    {/* Overlay Info on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-xs font-medium truncate">
                          {reel.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <img
                            src={reel.avatar}
                            alt={reel.user}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-gray-300 text-xs truncate">
                            @{reel.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* No Reels Message */}
            {content.filter((item) => item.type === "reel").length === 0 && (
              <div className="text-center py-12">
                <Film className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600">No reels available</p>
                <p className="text-sm text-gray-500 mt-2">
                  Check back later for new reels
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "creators" && (
          <div className="px-4 py-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Users className="w-5 h-5 text-blue-600" />
              Top Creators to Follow
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                      />
                      <div>
                        <h3 className="font-medium flex items-center gap-1 text-gray-800">
                          {creator.name}
                          {creator.isVerified && (
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          @{creator.username}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {creator.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(creator.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        creator.isFollowing
                          ? "bg-gray-200 text-gray-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {creator.isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {creator.content}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{creator.followers} followers</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-md bg-gray-200 overflow-hidden"
                        >
                          <img
                            src={`https://source.unsplash.com/random/200x200/?${
                              creator.category.split(" ")[0]
                            },${i}`}
                            alt="Sample post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => {
              setSelectedContent(null);
              setIsMuted(true);
            }}
            className="absolute top-4 right-4 z-60 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {selectedContent.type === "video" ||
            selectedContent.type === "reel" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {selectedContent.type === "reel" ? (
                  <div className="relative w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
                    {content
                      .filter((item) => item.type === "reel")
                      .map((reel, index) => (
                        <div
                          key={reel.id}
                          className="relative w-full h-full snap-start flex items-center justify-center bg-black"
                        >
                          <video
                            ref={(el) => {
                              videoRefs.current[reel.id] = el;
                            }}
                            src={reel.src}
                            className="h-full object-cover"
                            loop
                            muted={isMuted}
                            playsInline
                            controls={false}
                            onError={(e) => {
                              console.log("Video loading error:", e);
                              // Fallback to thumbnail if video fails to load
                              const videoElement = e.target as HTMLVideoElement;
                              videoElement.style.display = "none";
                            }}
                          />
                          {/* Fallback thumbnail if video fails to load */}
                          <img
                            src={reel.thumbnail}
                            alt={reel.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ display: "none" }}
                            onLoad={(e) => {
                              const videoElement = e.currentTarget
                                .previousElementSibling as HTMLVideoElement;
                              if (
                                videoElement &&
                                videoElement.style.display === "none"
                              ) {
                                e.currentTarget.style.display = "block";
                              }
                            }}
                          />

                          {/* Right Side Engagement Icons for Each Reel */}
                          <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-20">
                            {/* Profile Picture with Plus Button (TikTok Style) */}
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <img
                                  src={reel.avatar}
                                  alt={reel.user}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                />
                                {/* Plus Button Overlay */}
                                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg border-2 border-white">
                                  <span className="text-white text-sm font-bold">
                                    +
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Like Button */}
                            <button
                              onClick={() => handleLike(reel.id)}
                              className="flex flex-col items-center"
                            >
                              <Heart
                                className={`w-8 h-8 ${
                                  reel.isLiked
                                    ? "fill-red-500 text-red-500"
                                    : "text-white"
                                }`}
                              />
                              <span className="text-xs text-white mt-1">
                                {formatNumber(reel.likes)}
                              </span>
                            </button>

                            {/* Comment Button */}
                            <button
                              className="flex flex-col items-center"
                              onClick={() => handleCommentClick(reel)}
                            >
                              <MessageCircle className="w-8 h-8 text-white" />
                              <span className="text-xs text-white mt-1">
                                {reel.comments}
                              </span>
                            </button>

                            {/* Share Button */}
                            <button className="flex flex-col items-center">
                              <Share2 className="w-8 h-8 text-white" />
                              <span className="text-xs text-white mt-1">
                                {reel.shares}
                              </span>
                            </button>

                            {/* Bookmark Button */}
                            <button
                              onClick={() => handleBookmark(reel.id)}
                              className="flex flex-col items-center"
                            >
                              <Bookmark
                                className={`w-8 h-8 ${
                                  reel.isBookmarked
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-white"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Content Info Overlay for Each Reel */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* User Name */}
                                <div className="mb-2">
                                  <h3 className="font-bold text-white text-lg">
                                    {reel.user}
                                  </h3>
                                </div>

                                {/* Description with Hashtags */}
                                <div className="mb-4">
                                  <p className="text-white text-base leading-relaxed">
                                    {reel.description}{" "}
                                    {reel.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-blue-400 font-medium"
                                      >
                                        #{tag}{" "}
                                      </span>
                                    ))}
                                  </p>
                                </div>

                                {/* Music Info */}
                                {reel.music && (
                                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 w-fit">
                                    <Music className="w-4 h-4 text-white" />
                                    <span className="text-white text-sm font-medium">
                                      {reel.music}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress Indicator */}
                          <div className="absolute top-4 left-4 right-4 z-20">
                            <div className="flex gap-1">
                              {content
                                .filter((item) => item.type === "reel")
                                .map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                                      i === index ? "bg-white" : "bg-white/30"
                                    }`}
                                  />
                                ))}
                            </div>
                          </div>

                          {/* Reel Number */}
                          <div className="absolute top-4 right-4 z-20">
                            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                              <span className="text-white text-sm font-medium">
                                {index + 1} /{" "}
                                {
                                  content.filter((item) => item.type === "reel")
                                    .length
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <video
                    ref={(el) => {
                      videoRefs.current[selectedContent.id] = el;
                    }}
                    src={selectedContent.src}
                    className="max-w-full max-h-full object-contain"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    controls={selectedContent.type === "video"}
                  />
                )}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-20"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
              <img
                src={selectedContent.src}
                alt={selectedContent.title}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Content Info Overlay */}
            {selectedContent.type !== "reel" && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={selectedContent.avatar}
                        alt={selectedContent.user}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-white">
                          {selectedContent.user}
                        </h3>
                        <p className="text-sm text-gray-300">
                          @{selectedContent.username}
                        </p>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      {selectedContent.title}
                    </h2>
                    <p className="text-gray-300 mb-3">
                      {selectedContent.description}
                    </p>

                    <div className="flex gap-2 mb-4">
                      {selectedContent.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-800/70 text-purple-400 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(selectedContent.id)}
                        className={`flex items-center gap-2 ${
                          selectedContent.isLiked
                            ? "text-red-500"
                            : "text-white"
                        }`}
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            selectedContent.isLiked ? "fill-current" : ""
                          }`}
                        />
                        <span>{formatNumber(selectedContent.likes)}</span>
                      </button>
                      <button className="flex items-center gap-2 text-white">
                        <MessageCircle className="w-6 h-6" />
                        <span>{selectedContent.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-white">
                        <Share2 className="w-6 h-6" />
                        <span>{selectedContent.shares}</span>
                      </button>
                      <button
                        onClick={() => handleBookmark(selectedContent.id)}
                        className={`${
                          selectedContent.isBookmarked
                            ? "text-yellow-500"
                            : "text-white"
                        }`}
                      >
                        <Bookmark
                          className={`w-6 h-6 ${
                            selectedContent.isBookmarked ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Modal/Sheet */}
      {showComments && selectedReelForComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full h-[80vh] rounded-t-3xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Comments ({getCommentsForReel().length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {getCommentsForReel().map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">
                          {comment.user}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                        <Heart
                          className={`w-3 h-3 ${
                            comment.isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                      commentText.trim()
                        ? "text-blue-500 hover:text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;
