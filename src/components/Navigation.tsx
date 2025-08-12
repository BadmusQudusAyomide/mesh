import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Users,
  Zap,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContextHelpers";
import { useToast } from "../components/ui/toast";
import { useNotifications } from "../contexts/NotificationContextHelpers";
import { apiService } from "../lib/api";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  hideBottomBar?: boolean;
}

const Navigation = ({
  darkMode,
  setDarkMode,
  hideBottomBar,
}: NavigationProps) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { addToast } = useToast();
  const { unreadCount } = useNotifications();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Fetch unread messages count periodically
  useEffect(() => {
    let timer: number | undefined;
    const fetchCount = async () => {
      try {
        if (!user?._id) return;
        const res = await apiService.getUnreadMessagesCount();
        setUnreadMessages(res.count || 0);
      } catch (e) {
        // silent
      }
    };
    fetchCount();
    // Poll every 20s to keep badge fresh
    timer = window.setInterval(fetchCount, 20000);
    // Update when tab becomes visible
    const onVis = () => {
      if (document.visibilityState === "visible") fetchCount();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user?._id]);

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
            <Link
              to="/home"
              className={`p-2 rounded-xl transition-all duration-200 ${
                location.pathname === "/home"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Home className="w-5 h-5" />
            </Link>

            <Link
              to="/alert"
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                location.pathname === "/alert"
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
            </Link>
            <Link
              to="/inbox"
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                location.pathname === "/inbox"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/20"
              }`}
            >
              <Mail className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadMessages}
                </span>
              )}
            </Link>
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
      {/* Bottom nav: only on mobile */}
      {!hideBottomBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="mx-4 mb-4">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 px-2 py-3">
              <div className="flex justify-around items-center">
                <Link
                  to="/home"
                  className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    location.pathname === "/home"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Home className={`w-6 h-6 mb-1 ${location.pathname === "/home" ? "drop-shadow-sm" : ""}`} />
                  <span className="text-xs font-medium">Home</span>
                </Link>

                <Link
                  to="/alert"
                  className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-110 relative ${
                    location.pathname === "/alert"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Bell className={`w-6 h-6 mb-1 ${location.pathname === "/alert" ? "drop-shadow-sm" : ""}`} />
                  <span className="text-xs font-medium">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/friends"
                  className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    location.pathname === "/friends"
                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Users className={`w-6 h-6 mb-1 ${location.pathname === "/friends" ? "drop-shadow-sm" : ""}`} />
                  <span className="text-xs font-medium">Friends</span>
                </Link>

                <Link
                  to="/inbox"
                  className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-110 relative ${
                    location.pathname === "/inbox"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Mail className={`w-6 h-6 mb-1 ${location.pathname === "/inbox" ? "drop-shadow-sm" : ""}`} />
                  <span className="text-xs font-medium">Inbox</span>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg animate-pulse">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                <Link
                  to={user ? `/profile/${user.username}` : "/profile"}
                  className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    location.pathname.startsWith("/profile")
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {location.pathname.startsWith("/profile") ? (
                    <div className="w-6 h-6 mb-1 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-4 h-4 drop-shadow-sm" />
                    </div>
                  ) : (
                    <User className="w-6 h-6 mb-1" />
                  )}
                  <span className="text-xs font-medium">Me</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;
