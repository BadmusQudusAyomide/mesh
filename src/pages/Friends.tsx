import { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "../components/Navigation";
import { apiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContextHelpers";
import { UserPlus, UserMinus, Search as SearchIcon, Users as UsersIcon } from "lucide-react";

interface FriendItem {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
  isVerified?: boolean;
  followerCount?: number;
}

const LIMIT = 12;

export default function Friends() {
  const { user: currentUser, updateUser } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const followingSet = useMemo(() => new Set((currentUser?.following || []).map(String)), [currentUser]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Reset list on new query
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchPage = async () => {
      if (!hasMore || loading) return;
      setLoading(true);
      try {
        const res = await apiService.listUsers({ query: debouncedQuery, page, limit: LIMIT });
        setItems((prev) => (page === 1 ? res.users : [...prev, ...res.users]));
        setHasMore(res.hasMore);
      } catch (e) {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [page, debouncedQuery]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    const el = observerRef.current;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !loading) {
        setPage((p) => p + 1);
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, observerRef.current]);

  const toggleFollow = async (u: FriendItem) => {
    try {
      const res = await apiService.followUser(u._id);
      const isFollowing = res.isFollowing;
      // Update local optimistic state by updating currentUser.following in context
      const idStr = String(u._id);
      if (isFollowing) {
        updateUser?.({ following: [...(currentUser?.following || []), idStr] as any });
      } else {
        updateUser?.({ following: (currentUser?.following || []).filter((x: any) => String(x) !== idStr) as any });
      }
    } catch (e) {
      // ignore
    }
  };

  const isFollowing = (id: string) => followingSet.has(String(id));
  const firstName = (name?: string, username?: string) => (name || username || "").split(" ")[0];

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navigation activeTab="friends" setActiveTab={() => { }} darkMode={false} setDarkMode={() => { }} />

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-white border border-gray-200">
            <UsersIcon className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Find Friends</h1>
            <p className="text-sm text-gray-500">Discover people on Mesh. Recently joined first.</p>
          </div>
        </div>

        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @username"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 border border-gray-200/50 focus:outline-none focus:ring-1 focus:ring-gray-400 backdrop-blur-sm"
          />
        </div>

        {/* Grid list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((u) => (
            <div
              key={u._id}
              className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3.5 flex items-center gap-3.5 transition-all duration-200 hover:shadow-sm"
            >
              <img
                src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                alt={u.fullName}
                className="w-11 h-11 rounded-full object-cover border border-gray-200"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={`/profile/${u.username}`}
                    className="font-medium text-gray-900 truncate max-w-[60vw] hover:text-gray-700 transition-colors"
                    title={u.fullName}
                  >
                    {firstName(u.fullName, u.username)}
                  </a>
                </div>
                <p className="text-sm text-gray-500 truncate">@{u.username}</p>
              </div>
              <div>
                {isFollowing(u._id) ? (
                  <button
                    onClick={() => toggleFollow(u)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-white/50 transition-colors backdrop-blur-sm"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => toggleFollow(u)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Follow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Loading / sentinel */}
        <div ref={observerRef} className="h-8" />
        {loading && (
          <div className="text-center text-gray-500 py-4 text-sm">Loading...</div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">No users found.</div>
        )}
      </div>
    </div>
  );
}