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
  Download,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContextHelpers";
import { useToast } from "../components/ui/toast";
import { useNotifications } from "../contexts/NotificationContextHelpers";
import { apiService } from "../lib/api";
import { useInstall } from "../contexts/InstallContext";

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
  const { canInstall, isStandalone, isIOS, promptInstall } = useInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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
      <nav className="hidden md:block fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-sm px-5 py-2.5">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <Zap className="w-4 h-4 text-gray-800" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Mesh</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/home"
              className={`p-1.5 rounded-lg transition-colors ${location.pathname === "/home"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-white/50"
                }`}
            >
              <Home className="w-4.5 h-4.5" />
            </Link>

            <Link
              to="/alert"
              className={`p-1.5 rounded-lg transition-colors relative ${location.pathname === "/alert"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-white/50"
                }`}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/inbox"
              className={`p-1.5 rounded-lg transition-colors relative ${location.pathname === "/inbox"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-white/50"
                }`}
            >
              <Mail className="w-4.5 h-4.5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              to={user ? `/profile/${user.username}` : "/profile"}
              className={`p-1.5 rounded-lg transition-colors ${location.pathname.startsWith("/profile")
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-white/50"
                }`}
            >
              <User className="w-4.5 h-4.5" />
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {/* Install button (desktop, non-intrusive) */}
            {!isStandalone && (canInstall || isIOS) && (
              <button
                onClick={async () => {
                  if (canInstall) {
                    const res = await promptInstall();
                    if (res === 'accepted') {
                      addToast({ type: 'success', title: 'Installing', message: 'Mesh is being added to your device.' });
                    } else if (res === 'dismissed') {
                      addToast({ type: 'info', title: 'Install canceled', message: 'You can install Mesh anytime from this button.' });
                    }
                  } else if (isIOS) {
                    setShowIOSGuide(true);
                  }
                }}
                className="p-1.5 rounded-lg text-gray-600 hover:bg-white/50 transition-colors"
                title="Install Mesh"
              >
                <Download className="w-4.5 h-4.5" />
              </button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Mesh..."
                className="pl-8 pr-3 py-1.5 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-xs placeholder-gray-500 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white/50 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4.5 h-4.5" />
              ) : (
                <Moon className="w-4.5 h-4.5" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg max-w-sm w-[90%] p-4 border border-gray-200/50">
            <h3 className="text-base font-medium text-gray-900 mb-2">Install Mesh on iPhone</h3>
            <ol className="list-decimal ml-4 text-xs text-gray-700 space-y-1">
              <li>Tap the Share button in Safari.</li>
              <li>Select <span className="font-medium">Add to Home Screen</span>.</li>
              <li>Tap <span className="font-medium">Add</span> to finish.</li>
            </ol>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav: only on mobile */}
      {!hideBottomBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="mx-3 mb-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 px-1.5 py-2">
              <div className="flex justify-around items-center">
                <Link
                  to="/home"
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-colors ${location.pathname === "/home"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white/70"
                    }`}
                >
                  <Home className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                  to="/alert"
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-colors relative ${location.pathname === "/alert"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white/70"
                    }`}
                >
                  <Bell className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/friends"
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-colors ${location.pathname === "/friends"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white/70"
                    }`}
                >
                  <Users className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Friends</span>
                </Link>

                <Link
                  to="/inbox"
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-colors relative ${location.pathname === "/inbox"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white/70"
                    }`}
                >
                  <Mail className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Inbox</span>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                <Link
                  to={user ? `/profile/${user.username}` : "/profile"}
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-colors ${location.pathname.startsWith("/profile")
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white/70"
                    }`}
                >
                  <User className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Me</span>
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