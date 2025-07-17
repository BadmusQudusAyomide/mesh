import { useState } from "react";
import Navigation from "../components/Navigation";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import "../App.css";

const messages = [
  {
    id: 1,
    user: "Aisha Bello",
    username: "aishabello",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    preview: "Hey! How are you?",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    user: "Chinedu Okafor",
    username: "chineduokafor",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    preview: "Let's catch up soon!",
    time: "10m ago",
    unread: false,
  },
  {
    id: 3,
    user: "Ayomide Balogun",
    username: "ayomidebalogun",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    preview: "Sent you the files.",
    time: "1h ago",
    unread: false,
  },
];

function Inbox() {
  const [activeTab, setActiveTab] = useState("messages");
  const [darkMode, setDarkMode] = useState(false);

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
      <div className="md:pt-24 pb-8 px-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-500" /> Inbox
        </h2>
        <div className="space-y-4">
          {messages.map((msg) => (
            <Link to={`/chat/${msg.username}`} key={msg.id} className="block">
              <div
                className={`flex items-center p-4 rounded-xl shadow bg-white/70 border border-white/20 ${
                  msg.unread ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      {msg.user}
                    </span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <div className="text-gray-600 text-sm mt-1 truncate">
                    {msg.preview}
                  </div>
                </div>
                {msg.unread && (
                  <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Inbox;
