import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import {
  Mail,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Check,
  CheckCheck,
} from "lucide-react";

const messages = [
  {
    id: 1,
    user: "Aisha Bello",
    username: "aishabello",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    preview:
      "Hey! How are you doing today? I was thinking about our last conversation...",
    time: "2m ago",
    unread: true,
    online: true,
    messageCount: 3,
    type: "message",
  },
  {
    id: 2,
    user: "Chinedu Okafor",
    username: "chineduokafor",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    preview: "Let's catch up soon! I have some exciting news to share with you",
    time: "10m ago",
    unread: false,
    online: false,
    messageCount: 0,
    type: "message",
  },
  {
    id: 3,
    user: "Ayomide Balogun",
    username: "ayomidebalogun",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    preview: "Sent you the files. Please review them when you have a chance",
    time: "1h ago",
    unread: false,
    online: true,
    messageCount: 0,
    type: "message",
  },
  {
    id: 4,
    user: "Kemi Adeyemi",
    username: "kemiadeyemi",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    preview: "Thanks for the help yesterday! Really appreciate it 🙏",
    time: "3h ago",
    unread: true,
    online: false,
    messageCount: 1,
    type: "message",
  },
  {
    id: 5,
    user: "Tunde Ogundimu",
    username: "tundeogundimu",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    preview: "Are we still on for the meeting tomorrow at 2 PM?",
    time: "1d ago",
    unread: false,
    online: true,
    messageCount: 0,
    type: "message",
  },
];

function Inbox() {
  const [activeTab, setActiveTab] = useState("messages");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const navigate = useNavigate();

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "unread") return matchesSearch && msg.unread;
    if (activeTab === "online") return matchesSearch && msg.online;
    return matchesSearch;
  });

  const unreadCount = messages.filter((msg) => msg.unread).length;

  const toggleMessageSelection = (messageId: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleMessageClick = (username: string) => {
    navigate(`/chat/${username}`);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: "all", label: "All", count: messages.length },
              { id: "unread", label: "Unread", count: unreadCount },
              {
                id: "online",
                label: "Online",
                count: messages.filter((m) => m.online).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No messages found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try adjusting your search"
                : "Start a new conversation"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  message.unread
                    ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                } ${
                  selectedMessages.includes(message.id)
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => handleMessageClick(message.username)}
              >
                {/* Selection Checkbox */}
                <div
                  className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => toggleMessageSelection(message.id, e)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMessages.includes(message.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {selectedMessages.includes(message.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                {/* Avatar with Online Status */}
                <div className="relative mr-4">
                  <img
                    src={message.avatar}
                    alt={message.user}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {message.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold truncate ${
                        message.unread ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {message.user}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {message.time}
                      </span>
                      {!message.unread && (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      message.unread
                        ? "text-gray-700 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {message.preview}
                  </p>
                </div>

                {/* Unread Indicator */}
                {message.unread && (
                  <div className="flex items-center gap-2 ml-3">
                    {message.messageCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {message.messageCount}
                      </span>
                    )}
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Actions */}
      {selectedMessages.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
          <span className="text-sm">{selectedMessages.length} selected</span>
          <button className="text-sm hover:text-gray-300 transition-colors">
            Mark as read
          </button>
          <button className="text-sm hover:text-gray-300 transition-colors">
            Delete
          </button>
          <button
            className="text-sm hover:text-gray-300 transition-colors"
            onClick={() => setSelectedMessages([])}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default Inbox;
