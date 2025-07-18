import { useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Music,
} from "lucide-react";
import Navigation from "../components/Navigation";

const reels = [
  {
    id: 1,
    type: "video",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    user: "Ngozi Okonjo",
    username: "ngoziok",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    caption:
      "AI is transforming Africa's future! 🌍🤖 #AI #Future #Technology #Innovation",
    likes: 1200,
    comments: 98,
    shares: 34,
    bookmarks: 156,
    isLiked: false,
    isBookmarked: false,
    isFollowing: false,
    music: "Original Sound - Ngozi Okonjo",
  },
  {
    id: 2,
    type: "image",
    src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    user: "Tunde Bakare",
    username: "tundebakare",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    caption:
      "Web3 is more than crypto. It's about ownership! 🚀 #Web3 #Blockchain #Future",
    likes: 980,
    comments: 67,
    shares: 21,
    bookmarks: 89,
    isLiked: true,
    isBookmarked: false,
    isFollowing: true,
    music: "Trending - Tech Vibes",
  },
  {
    id: 3,
    type: "video",
    src: "https://www.w3schools.com/html/movie.mp4",
    user: "Chiamaka Eze",
    username: "chiamakaeze",
    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
    caption:
      "Climate action starts with us. Every small step matters! 🌱 #ClimateAction #Environment #Sustainability",
    likes: 1500,
    comments: 120,
    shares: 45,
    bookmarks: 203,
    isLiked: false,
    isBookmarked: true,
    isFollowing: false,
    music: "Nature Sounds - Peaceful",
  },
  {
    id: 4,
    type: "image",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    user: "Emeka Umeh",
    username: "emekaumeh",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    caption:
      "Nature's beauty is unmatched! 🌅🌱 Sometimes we need to pause and appreciate the world around us.",
    likes: 523,
    comments: 67,
    shares: 34,
    bookmarks: 78,
    isLiked: true,
    isBookmarked: false,
    isFollowing: false,
    music: "Calm Vibes - Relaxing",
  },
];

function Explore() {
  const [activeTab, setActiveTab] = useState<string>("explore");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(0);
  const [reelData, setReelData] = useState(reels);
  const touchStartY = useRef<number | null>(null);
  // Removed: const videoRef = useRef(null);

  // Removed useEffect for videoRef

  // Swipe navigation handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 60 && current > 0) {
      setCurrent((c) => c - 1);
    } else if (deltaY < -60 && current < reels.length - 1) {
      setCurrent((c) => c + 1);
    }
    touchStartY.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" && current > 0) setCurrent((c) => c - 1);
    if (e.key === "ArrowDown" && current < reels.length - 1)
      setCurrent((c) => c + 1);
  };

  // Handle interactions
  const handleLike = () => {
    setReelData((prev) =>
      prev.map((reel) =>
        reel.id === reelData[current].id
          ? {
              ...reel,
              isLiked: !reel.isLiked,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
            }
          : reel
      )
    );
  };

  const handleBookmark = () => {
    setReelData((prev) =>
      prev.map((reel) =>
        reel.id === reelData[current].id
          ? {
              ...reel,
              isBookmarked: !reel.isBookmarked,
              bookmarks: reel.isBookmarked
                ? reel.bookmarks - 1
                : reel.bookmarks + 1,
            }
          : reel
      )
    );
  };

  const handleFollow = () => {
    setReelData((prev) =>
      prev.map((reel) =>
        reel.id === reelData[current].id
          ? { ...reel, isFollowing: !reel.isFollowing }
          : reel
      )
    );
  };

  const reel = reelData[current];

  return (
    <div
      className={`min-h-screen w-full transition-all duration-300 flex flex-col ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        hideBottomBar={false}
      />

      {/* Main Content */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ height: "100vh" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Reel Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Media */}
            {reel.type === "video" ? (
              <video
                src={reel.src}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={reel.src}
                alt={reel.caption}
                className="w-full h-full object-cover"
              />
            )}

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
              {/* Profile Avatar with Follow Button */}
              <div className="relative">
                <img
                  src={reel.avatar}
                  alt={reel.user}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                {!reel.isFollowing && (
                  <button
                    onClick={handleFollow}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  >
                    +
                  </button>
                )}
              </div>

              {/* Like Button */}
              <button
                onClick={handleLike}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="relative">
                  <Heart
                    className={`w-8 h-8 transition-all duration-200 ${
                      reel.isLiked
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-white group-hover:scale-110"
                    }`}
                  />
                  {reel.isLiked && (
                    <div className="absolute inset-0 animate-ping">
                      <Heart className="w-8 h-8 fill-red-500 text-red-500 opacity-75" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-white font-medium">
                  {reel.likes > 999
                    ? `${(reel.likes / 1000).toFixed(1)}K`
                    : reel.likes}
                </span>
              </button>

              {/* Comment Button */}
              <button className="flex flex-col items-center space-y-1 group">
                <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs text-white font-medium">
                  {reel.comments}
                </span>
              </button>

              {/* Share Button */}
              <button className="flex flex-col items-center space-y-1 group">
                <Send className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs text-white font-medium">
                  {reel.shares}
                </span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className="flex flex-col items-center space-y-1 group"
              >
                <Bookmark
                  className={`w-8 h-8 transition-all duration-200 ${
                    reel.isBookmarked
                      ? "fill-yellow-500 text-yellow-500 scale-110"
                      : "text-white group-hover:scale-110"
                  }`}
                />
                <span className="text-xs text-white font-medium">
                  {reel.bookmarks > 999
                    ? `${(reel.bookmarks / 1000).toFixed(1)}K`
                    : reel.bookmarks}
                </span>
              </button>

              {/* More Options */}
              <button className="flex flex-col items-center space-y-1 group">
                <MoreHorizontal className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Bottom Content */}
            <div
              className="absolute left-0 right-16 px-4 pb-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              style={{ bottom: "64px" }}
            >
              {/* Name */}
              <div className="mb-1">
                <span className="font-semibold text-white text-base">
                  {reel.user}
                </span>
              </div>
              {/* Caption */}
              <p className="text-white text-xs mb-2 leading-snug max-w-xs">
                {reel.caption}
              </p>
              {/* Music Info */}
              <div className="flex items-center space-x-2 text-white text-xs">
                <Music className="w-4 h-4" />
                <span className="truncate max-w-xs">{reel.music}</span>
              </div>
            </div>

            {/* Navigation Indicators */}
            {current > 0 && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
                <div className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center">
                  ↑
                </div>
              </div>
            )}
            {current < reels.length - 1 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
                <div className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center">
                  ↓
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explore;
