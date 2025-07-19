import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Explore from "./pages/Explore";
import Alert from "./pages/Alert";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { usePreloader } from "./hooks/usePreloader";
import "./App.css";

// Sample content data for preloading
const sampleContent = [
  {
    id: 1,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
  },
  {
    id: 2,
    type: "reel",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
  },
  {
    id: 3,
    type: "image",
    src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500",
    thumbnail:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500",
  },
];

function App() {
  const { startPreloading, isPreloading, preloadProgress } = usePreloader();

  useEffect(() => {
    // Start preloading content when app loads
    startPreloading(sampleContent);
  }, []);

  return (
    <Router>
      {/* Preloading Progress Indicator */}
      {isPreloading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-2 text-sm">
          Loading content... {Math.round(preloadProgress)}%
        </div>
      )}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/chat/:username" element={<Chat />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/alert" element={<Alert />} />
      </Routes>
    </Router>
  );
}

export default App;
