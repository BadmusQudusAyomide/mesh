import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import "../App.css";

const users = {
  aishabello: {
    name: "Aisha Bello",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  chineduokafor: {
    name: "Chinedu Okafor",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  ayomidebalogun: {
    name: "Ayomide Balogun",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
  },
};

const initialMessages = [
  { id: 1, fromMe: false, text: "Hey! How are you?", time: "2m ago" },
  {
    id: 2,
    fromMe: true,
    text: "I'm good, thanks! How about you?",
    time: "1m ago",
  },
  { id: 3, fromMe: false, text: "Doing well!", time: "Just now" },
];

function Chat() {
  const { username } = useParams();
  const navigate = useNavigate();
  const user =
    users[(username as keyof typeof users) || "aishabello"] ||
    users["aishabello"];
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [darkMode, setDarkMode] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { id: messages.length + 1, fromMe: true, text: input, time: "now" },
    ]);
    setInput("");
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
        hideBottomBar
      />
      <div className="md:pt-24 pb-8 px-4 max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)]">
        {/* Chat Header */}
        <div className="flex items-center space-x-4 py-4 border-b border-white/20 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-bold text-lg text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">@{username}</div>
          </div>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-24 md:pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-xs ${
                  msg.fromMe
                    ? "bg-blue-500 text-white"
                    : "bg-white/80 text-gray-800"
                }`}
              >
                {msg.text}
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Chat Input: fixed at bottom on mobile, static on desktop */}
        <form
          onSubmit={handleSend}
          className="md:static md:mt-4 md:mb-0 fixed bottom-0 left-0 right-0 bg-white/90 md:bg-transparent px-4 py-3 flex items-center gap-2 z-40 md:rounded-none rounded-t-2xl shadow md:shadow-none md:max-w-2xl md:mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
