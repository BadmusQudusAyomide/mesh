import { useState } from "react";
import Navigation from "../components/Navigation";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Share2,
  Bookmark,
  Eye,
  MoreHorizontal,
  Check,
} from "lucide-react";

interface Alert {
  id: number;
  type:
    | "like"
    | "comment"
    | "follow"
    | "mention"
    | "share"
    | "bookmark"
    | "view";
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  time: string;
  isRead: boolean;
  postImage?: string;
  postContent?: string;
}

const Alert = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const alerts: Alert[] = [
    {
      id: 1,
      type: "like",
      user: {
        name: "Owoyemi Samuel",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg",
        username: "owoyemisamuel",
      },
      content: "liked your post",
      time: "2m ago",
      isRead: false,
      postImage:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      type: "comment",
      user: {
        name: "Codetream Eric",
        avatar: "https://randomuser.me/api/portraits/men/37.jpg",
        username: "codetreameric",
      },
      content: 'commented: "This is amazing! 🔥"',
      time: "5m ago",
      isRead: false,
      postContent:
        "Just shipped a new feature that uses AI to optimize user experiences in real-time. The future is now! 🚀✨",
    },
    {
      id: 3,
      type: "follow",
      user: {
        name: "Alfred Chinedu",
        avatar: "https://randomuser.me/api/portraits/men/38.jpg",
        username: "alfredchinedu",
      },
      content: "started following you",
      time: "12m ago",
      isRead: false,
    },
    {
      id: 4,
      type: "mention",
      user: {
        name: "Ngozi Okonjo",
        avatar: "https://randomuser.me/api/portraits/women/42.jpg",
        username: "ngoziok",
      },
      content: "mentioned you in a comment",
      time: "1h ago",
      isRead: true,
      postContent: "Check out what @omomhiiislamiyat built! Amazing work!",
    },
    {
      id: 5,
      type: "share",
      user: {
        name: "Tunde Bakare",
        avatar: "https://randomuser.me/api/portraits/men/33.jpg",
        username: "tundebakare",
      },
      content: "shared your post",
      time: "2h ago",
      isRead: true,
      postImage:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop",
    },
    {
      id: 6,
      type: "bookmark",
      user: {
        name: "Chiamaka Eze",
        avatar: "https://randomuser.me/api/portraits/women/51.jpg",
        username: "chiamakaeze",
      },
      content: "bookmarked your post",
      time: "3h ago",
      isRead: true,
      postContent:
        "Breaking: New study shows that decentralized networks are 40% more efficient than traditional systems. Game changer! 🌐⚡",
    },
    {
      id: 7,
      type: "view",
      user: {
        name: "Aisha Bello",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        username: "aishabello",
      },
      content: "viewed your story",
      time: "4h ago",
      isRead: true,
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "mention":
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case "share":
        return <Share2 className="w-4 h-4 text-orange-500" />;
      case "bookmark":
        return <Bookmark className="w-4 h-4 text-blue-500" />;
      case "view":
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "like":
        return "bg-red-50 border-red-100";
      case "comment":
        return "bg-blue-50 border-blue-100";
      case "follow":
        return "bg-green-50 border-green-100";
      case "mention":
        return "bg-purple-50 border-purple-100";
      case "share":
        return "bg-orange-50 border-orange-100";
      case "bookmark":
        return "bg-blue-50 border-blue-100";
      case "view":
        return "bg-gray-50 border-gray-100";
      default:
        return "bg-gray-50 border-gray-100";
    }
  };

  const filteredAlerts =
    activeTab === "all"
      ? alerts
      : alerts.filter((alert) => alert.type === activeTab);

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  const markAsRead = (alertId: number) => {
    // In a real app, this would update the backend
    console.log("Mark as read:", alertId);
  };

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    console.log("Mark all as read");
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mesh
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8 px-4 max-w-4xl mx-auto">
        {/* Alert Header */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Notifications
                </h2>
                <p className="text-gray-600">
                  {unreadCount} unread notifications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All", count: alerts.length },
              {
                id: "like",
                label: "Likes",
                count: alerts.filter((a) => a.type === "like").length,
              },
              {
                id: "comment",
                label: "Comments",
                count: alerts.filter((a) => a.type === "comment").length,
              },
              {
                id: "follow",
                label: "Follows",
                count: alerts.filter((a) => a.type === "follow").length,
              },
              {
                id: "mention",
                label: "Mentions",
                count: alerts.filter((a) => a.type === "mention").length,
              },
              {
                id: "share",
                label: "Shares",
                count: alerts.filter((a) => a.type === "share").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id ? "bg-white/20" : "bg-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                !alert.isRead ? "ring-2 ring-blue-200" : ""
              } ${getAlertColor(alert.type)}`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="relative">
                    <img
                      src={alert.user.avatar}
                      alt={alert.user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      {getAlertIcon(alert.type)}
                    </div>
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            {alert.user.name}
                          </span>
                          <span className="text-gray-500">
                            @{alert.user.username}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-sm">
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{alert.content}</p>

                        {/* Post Preview */}
                        {alert.postContent && (
                          <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {alert.postContent}
                            </p>
                          </div>
                        )}

                        {alert.postImage && (
                          <div className="mb-3">
                            <img
                              src={alert.postImage}
                              alt="Post"
                              className="w-20 h-20 rounded-xl object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                      {alert.type === "follow" && (
                        <>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
                            Follow back
                          </button>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                            Message
                          </button>
                        </>
                      )}
                      {alert.type === "comment" && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
                          Reply
                        </button>
                      )}
                      {alert.type === "mention" && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
                          View post
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              You're all caught up! Check back later for new updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
