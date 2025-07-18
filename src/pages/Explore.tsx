import { useState, useRef } from "react";
import Navigation from "../components/Navigation";
import { Heart, MessageCircle, Send, User } from "lucide-react";

const reels = [
  {
    id: 1,
    type: "video",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    user: "Ngozi Okonjo",
    username: "ngoziok",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    caption: "AI is transforming Africa's future! 🌍🤖 #AI #Future",
    likes: 1200,
    comments: 98,
    shares: 34,
  },
  {
    id: 2,
    type: "image",
    src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    user: "Tunde Bakare",
    username: "tundebakare",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    caption: "Web3 is more than crypto. It's about ownership!",
    likes: 980,
    comments: 67,
    shares: 21,
  },
  {
    id: 3,
    type: "video",
    src: "https://www.w3schools.com/html/movie.mp4",
    user: "Chiamaka Eze",
    username: "chiamakaeze",
    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
    caption: "Climate action starts with us. #ClimateAction",
    likes: 1500,
    comments: 120,
    shares: 45,
  },
  {
    id: 4,
    type: "image",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    user: "Emeka Umeh",
    username: "emekaumeh",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    caption: "Nature's beauty is unmatched! 🌅🌱",
    likes: 523,
    comments: 67,
    shares: 34,
  },
];

function Explore() {
  const [activeTab, setActiveTab] = useState("explore");
  const [darkMode, setDarkMode] = useState(false);
  const [current, setCurrent] = useState(0);
  const touchStartY = useRef<number | null>(null);

  // Swipe navigation handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 60 && current > 0) {
      setCurrent((c) => c - 1);
    } else if (deltaY < -60 && current < reels.length - 1) {
      setCurrent((c) => c + 1);
    }
    touchStartY.current = null;
  };

  // Keyboard navigation (optional)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && current > 0) setCurrent((c) => c - 1);
    if (e.key === "ArrowDown" && current < reels.length - 1)
      setCurrent((c) => c + 1);
  };

  const reel = reels[current];

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
      />
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Reel Card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            {reel.type === "video" ? (
              <video
                src={reel.src}
                className="object-cover w-full h-full max-h-[90vh]"
                autoPlay
                loop
                muted
                playsInline
                style={{ background: "#000" }}
              />
            ) : (
              <img
                src={reel.src}
                alt={reel.caption}
                className="object-cover w-full h-full max-h-[90vh]"
                style={{ background: "#000" }}
              />
            )}
            {/* Overlay UI */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end min-h-[40%]">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={reel.avatar}
                  alt={reel.user}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <span className="font-semibold text-white">{reel.user}</span>
                  <span className="ml-2 text-xs text-gray-300">
                    @{reel.username}
                  </span>
                </div>
              </div>
              <p className="text-white text-base mb-4 line-clamp-3 drop-shadow-lg">
                {reel.caption}
              </p>
              <div className="flex items-center gap-8 text-white text-lg">
                <button className="flex items-center gap-2 hover:text-pink-400 transition-colors">
                  <Heart className="w-6 h-6" />
                  <span className="text-base">{reel.likes}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-base">{reel.comments}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                  <Send className="w-6 h-6" />
                  <span className="text-base">{reel.shares}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-yellow-400 transition-colors ml-auto">
                  <User className="w-6 h-6" />
                  <span className="text-base">Follow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Up/Down indicators */}
        {current > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-2xl animate-bounce">
            ▲
          </div>
        )}
        {current < reels.length - 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-2xl animate-bounce">
            ▼
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
