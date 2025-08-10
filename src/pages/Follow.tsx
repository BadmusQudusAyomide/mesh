import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import Navigation from "../components/Navigation";
import { ArrowLeft } from "lucide-react";

type LiteUser = {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
};

const PAGE_SIZE = 20;

type TabKey = "followers" | "following";

export default function Follow() {
  const { username = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "followers";
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [activeTabNav, setActiveTabNav] = useState<string>("home");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [followers, setFollowers] = useState<LiteUser[]>([]);
  const [following, setFollowing] = useState<LiteUser[]>([]);
  const [pageFollowers, setPageFollowers] = useState(1);
  const [pageFollowing, setPageFollowing] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [loading, setLoading] = useState(false);

  // Swipe detection
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    setSearchParams({ tab });
  }, [tab]);

  useEffect(() => {
    // Initial loads
    if (tab === "followers" && followers.length === 0) loadFollowers(1, true);
    if (tab === "following" && following.length === 0) loadFollowing(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, username]);

  const loadFollowers = async (page: number, replace = false) => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/profile/${encodeURIComponent(
          username
        )}/followers?page=${page}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      const items: LiteUser[] = data.followers || [];
      setFollowers((prev) => (replace ? items : [...prev, ...items]));
      setHasMoreFollowers(items.length === PAGE_SIZE);
      setPageFollowers(page);
    } catch (e) {
      console.error("Failed to load followers", e);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async (page: number, replace = false) => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/profile/${encodeURIComponent(
          username
        )}/following?page=${page}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      const items: LiteUser[] = data.following || [];
      setFollowing((prev) => (replace ? items : [...prev, ...items]));
      setHasMoreFollowing(items.length === PAGE_SIZE);
      setPageFollowing(page);
    } catch (e) {
      console.error("Failed to load following", e);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom && !loading) {
      if (tab === "followers" && hasMoreFollowers) {
        loadFollowers(pageFollowers + 1);
      } else if (tab === "following" && hasMoreFollowing) {
        loadFollowing(pageFollowing + 1);
      }
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const dx = touchEndX.current - touchStartX.current;
    const threshold = 50; // px
    if (Math.abs(dx) > threshold) {
      if (dx < 0 && tab === "followers") setTab("following"); // swipe left
      if (dx > 0 && tab === "following") setTab("followers"); // swipe right
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeList = tab === "followers" ? followers : following;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeTab={activeTabNav}
        setActiveTab={setActiveTabNav}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <div className="font-semibold text-gray-900">@{username}</div>
              <div className="text-sm text-gray-500 capitalize">
                {tab}
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex">
            {(["followers", "following"] as TabKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div
          className="px-4 pb-20 overflow-y-auto"
          style={{ height: "calc(100vh - 106px)" }}
          onScroll={onScroll}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {activeList.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-16">
              No {tab} yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activeList.map((u) => (
                <li key={u._id} className="py-3 flex items-center gap-3">
                  <Link to={`/profile/${u.username}`} className="flex-shrink-0">
                    <img
                      src={u.avatar || "https://i.pravatar.cc/100?u=" + u._id}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${u.username}`}
                      className="font-medium text-gray-900 hover:underline truncate"
                    >
                      {u.fullName}
                    </Link>
                    <div className="text-sm text-gray-500 truncate">@{u.username}</div>
                    {u.bio && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{u.bio}</div>
                    )}
                  </div>
                  {/* Future: Follow/Unfollow button here if desired */}
                </li>
              ))}
            </ul>
          )}

          {loading && (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}
