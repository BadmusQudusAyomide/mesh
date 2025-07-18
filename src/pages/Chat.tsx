import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";

// 1. Define a type for users and add index signature

type User = {
  name: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
};

const users: Record<string, User> = {
  aishabello: {
    name: "Aisha Bello",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    online: true,
    lastSeen: "Active now",
  },
  chineduokafor: {
    name: "Chinedu Okafor",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    online: false,
    lastSeen: "Last seen 2 hours ago",
  },
  ayomidebalogun: {
    name: "Ayomide Balogun",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    online: true,
    lastSeen: "Active now",
  },
  kemiadeyemi: {
    name: "Kemi Adeyemi",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    online: false,
    lastSeen: "Last seen 5 minutes ago",
  },
  tundeogundimu: {
    name: "Tunde Ogundimu",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    online: true,
    lastSeen: "Active now",
  },
};

const initialMessages = [
  {
    id: 1,
    fromMe: false,
    text: "Hey! How are you doing today?",
    time: "2:30 PM",
    timestamp: new Date(Date.now() - 120000),
    status: "read",
  },
  {
    id: 2,
    fromMe: true,
    text: "I'm good, thanks! How about you?",
    time: "2:31 PM",
    timestamp: new Date(Date.now() - 60000),
    status: "read",
  },
  {
    id: 3,
    fromMe: false,
    text: "Doing well! Just finished a project I've been working on 🎉",
    time: "2:32 PM",
    timestamp: new Date(Date.now() - 30000),
    status: "read",
  },
  {
    id: 4,
    fromMe: true,
    text: "That's awesome! Congratulations 🎊",
    time: "2:33 PM",
    timestamp: new Date(Date.now() - 15000),
    status: "delivered",
  },
];

function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState("aishabello");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Get user from current selection (in a real app, this would come from URL params)
  const user = users[currentUser] || users["aishabello"];

  // Add user selector for demo purposes
  const handleUserChange = (username: string) => {
    setCurrentUser(username);
    // Reset messages when switching users
    setMessages(initialMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const handleSend = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      fromMe: true,
      text: input,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      timestamp: new Date(),
      status: "sending",
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 2000);

    // Simulate typing response
    setTimeout(() => {
      setIsTyping(true);
    }, 3000);

    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Nice! 😊",
        "That sounds great!",
        "I'm happy for you!",
        "Tell me more about it",
        "That's interesting",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          fromMe: false,
          text: randomResponse,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          timestamp: new Date(),
          status: "read",
        },
      ]);
    }, 6000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return <Circle className="w-3 h-3 text-gray-400" />;
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* User Selector for Demo */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            Demo: Select user to chat with:
          </span>
          <select
            value={currentUser}
            onChange={(e) => handleUserChange(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
          >
            {Object.entries(users).map(([username, userData]) => (
              <option key={username} value={username}>
                {userData.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {user.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500">{user.lastSeen}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-end space-x-2 max-w-xs ${
                msg.fromMe ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {!msg.fromMe && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.fromMe
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <div
                  className={`flex items-center space-x-1 mt-1 ${
                    msg.fromMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="text-xs text-gray-500">{msg.time}</span>
                  {msg.fromMe && getStatusIcon(msg.status)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>

          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2 rounded-full transition-all ${
              input.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex space-x-2">
            {["😊", "😂", "❤️", "👍", "🎉", "😍", "🤔", "👏"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInput((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="text-xl hover:bg-gray-100 p-1 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
