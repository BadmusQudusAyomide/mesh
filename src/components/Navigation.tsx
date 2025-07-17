import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Zap,
  Compass,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  hideBottomBar?: boolean;
}

const Navigation = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  hideBottomBar,
}: NavigationProps) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat/");
  return (
    <>
      {/* Top nav: only on md+ */}
      <nav className="hidden md:block fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl px-6 py-3">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mesh
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "explore"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Compass className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                activeTab === "notifications"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === "messages"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Mail className="w-5 h-5" />
            </button>
            <Link
              to="/profile"
              className={`p-2 rounded-xl transition-all duration-200 ${
                location.pathname === "/profile"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Mesh..."
                className="pl-10 pr-4 py-2 bg-white/20 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-600 hover:bg-white/20 transition-all duration-200"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>
      {/* Bottom nav: only on mobile, not on chat page */}
      {!hideBottomBar && !isChatPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t shadow-lg md:hidden z-50">
          <div className="flex justify-around items-center h-16 text-gray-700 text-2xl">
            <Link
              to="/"
              className={`flex flex-col items-center flex-1 py-2 ${
                location.pathname === "/"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Home className="w-7 h-7 mb-1" />
              <span className="text-xs">Home</span>
            </Link>
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex flex-col items-center flex-1 py-2 ${
                activeTab === "explore"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Compass className="w-7 h-7 mb-1" />
              <span className="text-xs">Explore</span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex flex-col items-center flex-1 py-2 relative ${
                activeTab === "notifications"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Bell className="w-7 h-7 mb-1" />
              <span className="text-xs">Alerts</span>
              <span className="absolute top-1 right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </button>
            <Link
              to="/inbox"
              className={`flex flex-col items-center flex-1 py-2 ${
                location.pathname === "/inbox"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Mail className="w-7 h-7 mb-1" />
              <span className="text-xs">Inbox</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center flex-1 py-2 ${
                location.pathname === "/profile"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <User className="w-7 h-7 mb-1" />
              <span className="text-xs">Me</span>
            </Link>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute right-4 top-2 p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
            style={{ zIndex: 10 }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </nav>
      )}
    </>
  );
};

export default Navigation;
