import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContextHelpers";
import { apiService } from "../lib/api";
import { API_BASE_URL } from "../config";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import ConversationSkeleton from "../components/ConversationSkeleton";
import socketIOClient from "socket.io-client";
import {
  MessageCircle,
  Search,
  Plus,
  Users,
  Sparkles,
  X,
  Settings,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  Mic,
  Video as VideoIcon,
} from "lucide-react";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api.*/, "");

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
  const socketRef = useRef<ReturnType<typeof socketIOClient> | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState<any[]>([]);
  const [loadingMutualFollowers, setLoadingMutualFollowers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // Setup Socket.IO for real-time conversation updates
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = socketIOClient(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.emit("join", currentUser._id);
    socket.on("connect", () => {
      socket.emit("join", currentUser._id);
    });
    socket.on("connect_error", (err) => {
      console.error(
        "[Inbox] Socket connect_error:",
        err?.message || err,
        "URL:",
        SOCKET_URL
      );
    });

    const upsertConversationFromMessage = (msg: any) => {
      if (!msg || !msg.sender || !msg.recipient) return;
      const sender = msg.sender; // object with _id, username, fullName, avatar
      const recipient = msg.recipient; // may be object or id
      const recipientId =
        typeof recipient === "object" ? recipient._id : recipient;
      const isIncoming = recipientId?.toString() === currentUser._id.toString();
      const otherUser = isIncoming
        ? sender
        : typeof recipient === "object"
        ? recipient
        : null;
      const otherUserId = isIncoming ? sender._id : recipientId;
      if (!otherUserId) return;

      setConversations((prev) => {
        // find existing conversation
        const idx = prev.findIndex((c) => c._id === otherUserId);
        const updatedLast = {
          _id: msg._id,
          content: msg.content,
          messageType: msg.messageType || "text",
          createdAt: msg.createdAt || new Date().toISOString(),
          isRead: !isIncoming, // if incoming, not read yet
          sender: sender._id,
        } as Conversation["lastMessage"];

        if (idx !== -1) {
          const copy = [...prev];
          const conv = copy[idx];
          const inc = isIncoming ? 1 : 0;
          copy[idx] = {
            ...conv,
            lastMessage: updatedLast,
            unreadCount: (conv.unreadCount || 0) + inc,
          };
          // move updated conversation to top
          const [moved] = copy.splice(idx, 1);
          return [moved, ...copy];
        }

        // Create new conversation entry
        const other = otherUser || sender; // ensure we have details
        const newConv: Conversation = {
          _id: otherUserId,
          user: {
            _id: other._id,
            username: other.username,
            fullName: other.fullName,
            avatar: other.avatar,
            isOnline: !!other.isOnline,
            lastActive: other.lastActive || new Date().toISOString(),
          },
          lastMessage: updatedLast,
          unreadCount: isIncoming ? 1 : 0,
        };
        return [newConv, ...prev];
      });
    };

    const handleNewMessage = (msg: any) => {
      const involvesMe = [
        msg?.sender?._id,
        typeof msg?.recipient === "object"
          ? msg?.recipient?._id
          : msg?.recipient,
      ]
        .map(String)
        .includes(String(currentUser._id));
      if (!involvesMe) return;
      upsertConversationFromMessage(msg);
    };
    const handleMessageSent = (msg: any) => handleNewMessage(msg);

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSent", handleMessageSent);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser]);

  // Load more conversations function
  const loadMoreConversations = async () => {
    if (!hasMore) return;

    try {
      const response = await apiService.getConversationsPaginated(
        currentPage,
        5
      );
      const newConversations = response.conversations;

      setConversations((prev) => {
        // Prevent duplicates by filtering out conversations that already exist
        const existingIds = new Set(prev.map((c) => c._id));
        const uniqueNewConversations = newConversations.filter(
          (c) => !existingIds.has(c._id)
        );
        return [...prev, ...uniqueNewConversations];
      });

      setCurrentPage((prev) => prev + 1);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error("Failed to load more conversations:", err);
      setError("Failed to load conversations");
    }
  };

  // Infinite scroll hook
  const { isFetching, setIsFetching } = useInfiniteScroll(
    loadMoreConversations
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh conversations when window gains focus to reflect read-state changes
  useEffect(() => {
    const onFocus = () => {
      // Re-fetch first page; this will also update unread counts
      fetchConversations();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Stop fetching when done loading
  useEffect(() => {
    if (isFetching && !hasMore) {
      setIsFetching(false);
    }
  }, [isFetching, hasMore, setIsFetching]);

  // Update filtered conversations when conversations change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [conversations]);

  // Initial load
  const fetchConversations = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);
      const response = await apiService.getConversationsPaginated(1, 5);
      setConversations(response.conversations);
      setCurrentPage(2); // Next page to load
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setIsInitialLoading(false);
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
          conversation.user.fullName
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          conversation.user.username
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          conversation.lastMessage?.content
            .toLowerCase()
            .includes(query.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  };

  const handleChatClick = (username: string) => {
    // Optimistically clear unread count for this conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.user.username === username
          ? {
              ...c,
              unreadCount: 0,
              lastMessage: { ...c.lastMessage, isRead: true },
            }
          : c
      )
    );
    navigate(`/chat/${username}`);
  };

  // Truncate helper to keep preview short and avoid layout shift
  const getPreviewMax = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (w < 360) return 28;
    if (w < 420) return 34;
    if (w < 640) return 42; // base phones
    if (w < 768) return 54; // small tablets
    return 60; // desktop
  };
  const truncatePreview = (text: string, max = getPreviewMax()) => {
    if (!text) return "";
    const clean = String(text).replace(/\n/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  const getFilteredConversations = () => {
    let filtered = filteredConversations;
    if (filterType === "unread") {
      filtered = filtered.filter((conv) => conv.unreadCount > 0);
    } else if (filterType === "online") {
      filtered = filtered.filter((conv) => conv.user.isOnline);
    }
    return filtered;
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Navigation
        activeTab="messages"
        setActiveTab={() => {}}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Messages
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {unreadCount > 0
                        ? `${unreadCount} unread messages`
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
                    <span className="text-sm font-medium hidden sm:inline">
                      Filter
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleNewChat}
                    title="Start a new chat"
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Chat</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All", count: conversations.length },
                    {
                      id: "unread",
                      label: "Unread",
                      count: conversations.filter((c) => c.unreadCount > 0)
                        .length,
                    },
                    {
                      id: "online",
                      label: "Online",
                      count: conversations.filter((c) => c.user.isOnline)
                        .length,
                    },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterType(filter.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        filterType === filter.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>{filter.label}</span>
                      {filter.count > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            filterType === filter.id
                              ? "bg-white/20 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {filter.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            {/* Initial Loading State */}
            {isInitialLoading ? (
              <ConversationSkeleton count={5} />
            ) : error ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to load conversations
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : getFilteredConversations().length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery
                    ? "No conversations found"
                    : filterType === "unread"
                    ? "No unread messages"
                    : filterType === "online"
                    ? "No online contacts"
                    : "No conversations yet"}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : filterType === "unread"
                    ? "All your messages are read!"
                    : filterType === "online"
                    ? "No contacts are currently online"
                    : "Start following people to begin conversations with them"}
                </p>
                {!searchQuery && filterType === "all" && (
                  <button
                    onClick={() => navigate("/home")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Discover People
                  </button>
                )}
              </div>
            ) : (
              getFilteredConversations().map((conversation) => (
                <div
                  key={conversation._id}
                  className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer group overflow-hidden ${
                    conversation.unreadCount > 0
                      ? "border-blue-200 bg-blue-50/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleChatClick(conversation.user.username)}
                >
                  <div className="p-4 overflow-hidden">
                    <div className="flex items-center space-x-3 w-full">
                      {/* Avatar with status */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            conversation.user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.user.username}`
                          }
                          alt={conversation.user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {conversation.user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                            <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1 min-w-0">
                              <h3
                                className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate max-w-full"
                                title={conversation.user.fullName}
                              >
                                {
                                  (
                                    conversation.user.fullName ||
                                    conversation.user.username
                                  ).split(" ")[0]
                                }
                              </h3>
                              {conversation.user.isOnline && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-green-700 text-xs font-medium">
                                    Online
                                  </span>
                                </div>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <div className="flex items-start justify-between gap-2 w-full overflow-hidden">
                                <div className="text-gray-600 text-sm truncate group-hover:text-gray-700 transition-colors flex-1 mr-2 min-w-0 max-w-full flex items-center gap-1 overflow-hidden">
                                  <span className="shrink-0">
                                    {conversation.lastMessage.sender ===
                                    currentUser?._id
                                      ? "You: "
                                      : ""}
                                  </span>
                                  {conversation.lastMessage?.messageType ===
                                    "image" && (
                                    <span className="inline-flex items-center gap-1 shrink-0">
                                      <ImageIcon className="w-4 h-4 text-blue-500" />
                                      <span>Photo</span>
                                    </span>
                                  )}
                                  {conversation.lastMessage?.messageType ===
                                    "audio" && (
                                    <span className="inline-flex items-center gap-1 shrink-0">
                                      <Mic className="w-4 h-4 text-purple-500" />
                                      <span>Voice note</span>
                                    </span>
                                  )}
                                  {conversation.lastMessage?.messageType ===
                                    "video" && (
                                    <span className="inline-flex items-center gap-1 shrink-0">
                                      <VideoIcon className="w-4 h-4 text-red-500" />
                                      <span>Video</span>
                                    </span>
                                  )}
                                  {!["image", "audio", "video"].includes(
                                    conversation.lastMessage?.messageType
                                  ) && (
                                    <span className="truncate block max-w-full">
                                      {truncatePreview(
                                        conversation.lastMessage.content
                                      )}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 w-16 sm:w-20 ml-2 whitespace-nowrap">
                                  <span className="text-[10px] sm:text-xs text-gray-500 leading-none">
                                    {formatTime(
                                      conversation.lastMessage.createdAt
                                    )}
                                  </span>
                                  {conversation.unreadCount > 0 && (
                                    <span className="mt-1 inline-flex items-center justify-center bg-blue-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium min-w-[1.5rem]">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Unread indicator moved into right-side fixed column above */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading more conversations */}
            {isFetching && hasMore && (
              <div className="mt-6">
                <ConversationSkeleton count={3} />
              </div>
            )}

            {/* End of conversations message */}
            {!hasMore && conversations.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  You're all caught up!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      New Chat
                    </h3>
                    <p className="text-sm text-gray-500">
                      Start a conversation with mutual followers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingMutualFollowers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">
                      Loading mutual followers...
                    </span>
                  </div>
                </div>
              ) : mutualFollowers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    No mutual followers yet
                  </h4>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Follow people and have them follow you back to start
                    chatting with mutual followers.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {mutualFollowers.length} mutual follower
                      {mutualFollowers.length !== 1 ? "s" : ""}
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
                            src={
                              user.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                            }
                            alt={user.fullName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 text-left">
                          <h4
                            className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                            title={user.fullName}
                          >
                            {(user.fullName || user.username).split(" ")[0]}
                          </h4>
                          <p className="text-sm text-gray-500">
                            @{user.username}
                          </p>
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
