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
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextHelpers";
import { useToast } from "../components/ui/toast";
import { useNotifications } from "../contexts/NotificationContextHelpers";

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
  const { logout, user } = useAuth();
  const { addToast } = useToast();
  const isChatPage = location.pathname.startsWith("/chat/");
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        type: "success",
        title: "Logged Out",
        message: "You have been successfully logged out.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Logout Failed",
        message: "There was an error logging out.",
      });
    }
  };
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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadCount}
                </span>
              )}
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
              to={user ? `/profile/${user.username}` : "/profile"}
              className={`p-2 rounded-xl transition-all duration-200 ${
                location.pathname.startsWith("/profile")
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
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
      {/* Bottom nav: only on mobile, not on chat page */}
      {!hideBottomBar && !isChatPage && (
        <nav
          className="fixed bottom-0 left-0 right-0 md:hidden z-50 border-t border-white/30 bg-white/60 backdrop-blur-xl rounded-t-2xl shadow-2xl"
          style={{
            WebkitBackdropFilter: "blur(24px)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="flex justify-around items-center h-16 text-gray-700 text-2xl">
            <Link
              to="/home"
              className={`flex flex-col items-center flex-1 py-2 ${
                location.pathname === "/home"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Home className="w-7 h-7 mb-1" />
              <span className="text-xs">Home</span>
            </Link>
            <Link
              to="/explore"
              className={`flex flex-col items-center flex-1 py-2 ${
                location.pathname === "/explore"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Compass className="w-7 h-7 mb-1" />
              <span className="text-xs">Explore</span>
            </Link>
            <Link
              to="/alert"
              className={`flex flex-col items-center flex-1 py-2 relative ${
                location.pathname === "/alert"
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <Bell className="w-7 h-7 mb-1" />
              <span className="text-xs">Alerts</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
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
              to={user ? `/profile/${user.username}` : "/profile"}
              className={`flex flex-col items-center flex-1 py-2 ${
                location.pathname.startsWith("/profile")
                  ? "text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              <User className="w-7 h-7 mb-1" />
              <span className="text-xs">Me</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center flex-1 py-2 text-gray-600 hover:text-red-500"
              title="Logout"
            >
              <LogOut className="w-7 h-7 mb-1" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;
