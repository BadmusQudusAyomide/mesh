import React, { useState, useEffect } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Share2,
  Bookmark,
  MoreHorizontal,
  Filter,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContextHelpers";
import { useNotifications } from "../contexts/NotificationContextHelpers";
import { apiService } from "../lib/api";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import NotificationSkeleton from "../components/NotificationSkeleton";
import type { Notification } from "../types";

const Alert: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  // Removed unused selection-related state to satisfy TS build

  // Infinite scroll state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { notifications: liveNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [loading, setLoading] = useState(false);
  const { user: authUser, updateUser } = useAuth();

  const isFollowingUser = (userId: string) => !!authUser?.following?.includes(userId);
  const handleFollowBack = async (userId: string) => {
    try {
      const res = await apiService.followUser(userId);
      // Update auth context following list
      if (!authUser || !updateUser) return;
      if (res.isFollowing) {
        const next = Array.from(new Set([...(authUser.following || []), userId]));
        updateUser({ following: next });
      } else {
        const next = (authUser.following || []).filter((id) => id !== userId);
        updateUser({ following: next });
      }
    } catch (e) {
      console.error("Follow back failed", e);
    }
  };

  useEffect(() => {
    setLoading(notifications.length === 0);
    if (notifications.length > 0) {
      setLoading(false);
    }
  }, [notifications]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "message":
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "mention":
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case "share":
        return <Share2 className="w-4 h-4 text-orange-500" />;
      case "bookmark":
        return <Bookmark className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Load more notifications function
  const loadMoreNotifications = async () => {
    if (!hasMore) return;

    try {
      const response = await apiService.getNotificationsPaginated(currentPage, 5);
      const newNotifications = response.notifications;

      setNotifications((prev) => {
        // Prevent duplicates by filtering out notifications that already exist
        const existingIds = new Set(prev.map((n) => n._id));
        const uniqueNewNotifications = newNotifications.filter((n) => !existingIds.has(n._id));
        return [...prev, ...uniqueNewNotifications];
      });

      setCurrentPage((prev) => prev + 1);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error("Failed to load more notifications:", err);
      setError("Failed to load notifications");
    }
  };

  // Infinite scroll hook
  const { isFetching, setIsFetching } = useInfiniteScroll(loadMoreNotifications);

  // Initial load
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        const response = await apiService.getNotificationsPaginated(1, 5);
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n._id));
          const toAdd = response.notifications.filter((n) => !existingIds.has(n._id));
          // Keep already-present (including live) first, then append fetched unique
          return [...prev, ...toAdd];
        });
        setCurrentPage(2); // Next page to load
        setHasMore(response.pagination.hasMore);
      } catch (err) {
        console.error("Failed to load initial notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialNotifications();
  }, []);

  // Merge in live notifications from context at the top, avoiding duplicates
  useEffect(() => {
    if (!liveNotifications || liveNotifications.length === 0) return;
    setNotifications((prev) => {
      const seen = new Set(prev.map((n) => n._id));
      const toPrepend = liveNotifications.filter((n) => !seen.has(n._id));
      if (toPrepend.length === 0) return prev;
      return [...toPrepend, ...prev];
    });
  }, [liveNotifications]);

  // Stop fetching when done loading
  useEffect(() => {
    if (isFetching && !hasMore) {
      setIsFetching(false);
    }
  }, [isFetching, hasMore, setIsFetching]);

  // Filter notifications based on active tab
  const filteredAlerts =
    activeTab === "all"
      ? notifications
      : notifications.filter((alert: Notification) => alert.type === activeTab);

  return (
    <div className={`min-h-screen transition-all duration-300 bg-gray-50`}>
      <Navigation
        activeTab="notifications"
        setActiveTab={setActiveTab}
        darkMode={false}
        setDarkMode={() => {}}
      />

      {/* Main Content */}
      <div className="pt-20 md:pt-6 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Notifications
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredAlerts.filter((alert) => !alert.isRead).length > 0
                        ? `${filteredAlerts.filter((alert) => !alert.isRead).length} unread`
                        : "All caught up!"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {filteredAlerts.filter((alert) => !alert.isRead).length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Filter Tabs */}
            {showFilters && (
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      id: "all",
                      label: "All",
                      count: notifications.length,
                      icon: Bell,
                    },
                    {
                      id: "like",
                      label: "Likes",
                      count: notifications.filter(
                        (a: Notification) => a.type === "like"
                      ).length,
                      icon: Heart,
                    },
                    {
                      id: "comment",
                      label: "Comments",
                      count: notifications.filter(
                        (a: Notification) => a.type === "comment"
                      ).length,
                      icon: MessageCircle,
                    },
                    {
                      id: "follow",
                      label: "Follows",
                      count: notifications.filter(
                        (a: Notification) => a.type === "follow"
                      ).length,
                      icon: UserPlus,
                    },
                    {
                      id: "mention",
                      label: "Mentions",
                      count: notifications.filter(
                        (a: Notification) => a.type === "mention"
                      ).length,
                      icon: AtSign,
                    },
                    {
                      id: "share",
                      label: "Shares",
                      count: notifications.filter(
                        (a: Notification) => a.type === "share"
                      ).length,
                      icon: Share2,
                    },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          activeTab === tab.id
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              activeTab === tab.id
                                ? "bg-white/20 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Notifications List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Initial Loading State */}
                {isInitialLoading && filteredAlerts.length === 0 ? (
                  <NotificationSkeleton count={5} />
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Failed to load notifications
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No notifications yet
                    </h3>
                    <p className="text-gray-500">
                      When you get notifications, they'll show up here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {filteredAlerts.map((alert) => (
                        <div
                          key={alert._id}
                          className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md group ${
                            !alert.isRead
                              ? "border-blue-200 bg-blue-50/30"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start space-x-3">
                              {/* Avatar with notification icon */}
                              <div className="relative flex-shrink-0">
                                <img
                                  src={alert.from.avatar}
                                  alt={alert.from.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                  {getAlertIcon(alert.type)}
                                </div>
                                {!alert.isRead && (
                                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-gray-900 text-sm">
                                        {(alert.from.fullName || '').split(' ')[0]}
                                      </span>
                                      <span className="text-gray-400">·</span>
                                      <span className="text-gray-500 text-sm">
                                        {formatTimeAgo(alert.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                      {alert.text}
                                    </p>
                                    
                                    {/* Post preview */}
                                    {alert.post && (
                                      <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                          {alert.post.content}
                                        </p>
                                        {alert.post.image && (
                                          <img
                                            src={alert.post.image}
                                            alt="Post attachment"
                                            className="mt-2 w-16 h-16 rounded-lg object-cover"
                                          />
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Action buttons */}
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => markAsRead(alert._id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          alert.isRead
                                            ? "bg-gray-100 text-gray-600"
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        }`}
                                      >
                                        {alert.isRead ? "Read" : "Mark as read"}
                                      </button>
                                      {alert.type === "follow" && alert.from?._id && (
                                        <button
                                          onClick={() => handleFollowBack(alert.from._id)}
                                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
                                            isFollowingUser(alert.from._id)
                                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                              : "bg-green-600 text-white hover:bg-green-700"
                                          }`}
                                        >
                                          {isFollowingUser(alert.from._id) ? "Following" : "Follow back"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Action menu */}
                                  <div className="flex items-center space-x-1 ml-3">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Loading more notifications */}
                    {isFetching && hasMore && (
                      <div className="mt-6">
                        <NotificationSkeleton count={3} />
                      </div>
                    )}
                    
                    {/* End of notifications message */}
                    {!hasMore && notifications.length > 0 && (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                          <Check className="w-4 h-4 mr-2" />
                          You're all caught up!
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Alert;
