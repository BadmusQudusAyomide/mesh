import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Explore from "./pages/Explore";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/chat/:username" element={<Chat />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Router>
  );
}

export default App;
