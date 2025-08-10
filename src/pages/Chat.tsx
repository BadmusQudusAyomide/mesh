import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextHelpers";
import { apiService } from "../lib/api";
import socketIOClient from "socket.io-client";
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  CheckCheck,
  Image,
  Mic,
  Plus,
  Camera,
  FileText,
  MapPin,
  X,
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  recipient: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

function Chat() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [isTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username || !currentUser) return;

    // Initialize socket connection
    const socket = socketIOClient(SOCKET_URL);

    // Join user's room
    socket.emit('join', currentUser._id);

    // Listen for new messages
    socket.on('newMessage', (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
    });

    // Listen for message sent confirmation
    socket.on('messageSent', (sentMessage: Message) => {
      setMessages(prev => [...prev, sentMessage]);
    });

    // Fetch chat user and messages
    fetchChatData();

    return () => {
      socket.disconnect();
    };
  }, [username, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    if (!username) return;
    
    try {
      setIsLoading(true);
      // Get user profile
      const userProfile = await apiService.getUserProfile(username);
      setChatUser(userProfile.user);
      
      // Get messages
      const messagesResponse = await apiService.getMessages(userProfile.user._id);
      setMessages(messagesResponse.messages);
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chatUser || !currentUser) return;

    try {
      const messageContent = message.trim();
      setMessage("");
      
      await apiService.sendMessage(chatUser._id, messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(message); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }, [message]);

  // Close attachments when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showAttachments) {
        setShowAttachments(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAttachments]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (lastActive: string, isOnline: boolean) => {
    if (isOnline) return "Active now";
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <button 
            onClick={() => navigate('/inbox')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/inbox')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
          <div className="relative">
            <img
              src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
              alt={chatUser.fullName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
            />
            {chatUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{chatUser.fullName}</h2>
            <p className="text-sm text-gray-500">{formatLastSeen(chatUser.lastActive, chatUser.isOnline)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
            <Video className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
            <MoreVertical className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Smile className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-500 max-w-sm">Send a message to {chatUser.fullName} to begin your chat.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender._id === currentUser?._id ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                {msg.sender._id !== currentUser?._id && (
                  <img
                    src={msg.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.username}`}
                    alt={msg.sender.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.sender._id === currentUser?._id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div
                    className={`flex items-center justify-end mt-2 space-x-1 ${
                      msg.sender._id === currentUser?._id ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">{formatTime(msg.createdAt)}</span>
                    {msg.sender._id === currentUser?._id && (
                      <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-blue-200' : 'text-blue-300'}`} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <img
                src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
                alt={chatUser.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 relative">
        {/* Attachment Popup */}
        {showAttachments && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowAttachments(false)}
            />
            <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50">
              <div className="grid grid-cols-3 gap-2 w-48">
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600 transition-colors">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Camera</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-600 transition-colors">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Gallery</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-600 transition-colors">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Document</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-600 transition-colors">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Location</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-600 transition-colors">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Sticker</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        <div className="px-4 py-3">
          <div className="flex items-end space-x-2">
            {/* Attachment Button - Hidden when typing on mobile */}
            {(!message.trim() || !isInputFocused) && (
              <button 
                onClick={() => setShowAttachments(!showAttachments)}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${
                  showAttachments 
                    ? 'bg-blue-500 text-white transform rotate-45' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {showAttachments ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            )}
            
            {/* Input Container */}
            <div className="flex-1 relative">
              <div className={`flex items-end bg-gray-100 rounded-2xl transition-all duration-200 ${
                isInputFocused ? 'bg-white border border-gray-300 shadow-sm' : ''
              }`}>
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${chatUser.fullName}...`}
                    className="w-full px-4 py-3 bg-transparent border-0 rounded-2xl focus:outline-none resize-none placeholder-gray-500 text-gray-900 max-h-32"
                    rows={1}
                    style={{
                      minHeight: '44px',
                      height: 'auto',
                      overflowY: message.length > 100 ? 'auto' : 'hidden'
                    }}
                  />
                </div>
                
                {/* Emoji Button - Only show when not typing or on desktop */}
                {(!message.trim() || window.innerWidth >= 768) && (
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0">
                    <Smile className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Voice/Send Button */}
            <div className="flex-shrink-0">
              {message.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
