import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContextHelpers";
import { apiService } from "../lib/api";
import {
  MessageCircle,
  Search,
  Plus,
  MoreHorizontal,
  CheckCheck,
  Users,
  Sparkles,
} from "lucide-react";

interface Conversation {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
    isOnline: boolean;
    lastActive: string;
  };
  lastMessage: {
    _id: string;
    content: string;
    messageType: string;
    createdAt: string;
    isRead: boolean;
    sender: string;
  };
  unreadCount: number;
}

function Inbox() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState<any[]>([]);
  const [loadingMutualFollowers, setLoadingMutualFollowers] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getConversations();
      setConversations(response.conversations);
      setFilteredConversations(response.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMutualFollowers = async () => {
    try {
      setLoadingMutualFollowers(true);
      const response = await apiService.getMutualFollowers();
      setMutualFollowers(response.mutualFollowers);
    } catch (error) {
      console.error("Failed to fetch mutual followers:", error);
    } finally {
      setLoadingMutualFollowers(false);
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
    fetchMutualFollowers();
  };

  const startChatWithUser = (username: string) => {
    setShowNewChatModal(false);
    navigate(`/chat/${username}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(
        (conversation) =>
          conversation.user.fullName.toLowerCase().includes(query.toLowerCase()) ||
          conversation.user.username.toLowerCase().includes(query.toLowerCase()) ||
          conversation.lastMessage?.content.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  };

  const handleChatClick = (username: string) => {
    navigate(`/chat/${username}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500">Connect with people you follow</p>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 text-sm font-medium">{unreadCount} unread</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                <MoreHorizontal className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <button 
                onClick={handleNewChat}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading conversations...</span>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start following people to begin conversations with them"}
            </p>
            <button 
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Discover People
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group hover:shadow-lg"
                onClick={() => handleChatClick(conversation.user.username)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar with Online Status */}
                  <div className="relative">
                    <img
                      src={conversation.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.user.username}`}
                      alt={conversation.user.fullName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                    {conversation.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-sm">
                        <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {conversation.user.fullName}
                        </h3>
                        <span className="text-gray-500 text-sm">@{conversation.user.username}</span>
                        {conversation.user.isOnline && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-green-700 text-xs font-medium">Online</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                        {conversation.lastMessage?.sender === currentUser?._id && (
                          <CheckCheck className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-gray-600 text-sm truncate group-hover:text-gray-700 transition-colors">
                        {conversation.lastMessage.sender === currentUser?._id ? 'You: ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread Indicator */}
                  {conversation.unreadCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                        {conversation.unreadCount}
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
                    <p className="text-sm text-gray-500">Start a conversation with mutual followers</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600 rotate-45" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingMutualFollowers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading mutual followers...</span>
                  </div>
                </div>
              ) : mutualFollowers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No mutual followers yet</h4>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Follow people and have them follow you back to start chatting with mutual followers.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {mutualFollowers.length} mutual follower{mutualFollowers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {mutualFollowers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => startChatWithUser(user.username)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                        <div className="relative">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.fullName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {user.fullName}
                          </h4>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inbox;
