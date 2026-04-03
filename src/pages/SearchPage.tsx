import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Image as ImageIcon, Search, Sparkles, Users, FileText, PlayCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import { apiService } from "../lib/api";
import type {
  SearchPostResult,
  SearchStoryResult,
  SearchUserResult,
} from "../types";
import { formatRelativeTime } from "../lib/utils";

type SearchTab = "all" | "users" | "posts" | "stories";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialTab = (searchParams.get("tab") as SearchTab) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [users, setUsers] = useState<SearchUserResult[]>([]);
  const [posts, setPosts] = useState<SearchPostResult[]>([]);
  const [stories, setStories] = useState<SearchStoryResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedQuery) next.set("query", debouncedQuery);
      else next.delete("query");
      next.set("tab", activeTab);
      return next;
    });
  }, [debouncedQuery, activeTab, setSearchParams]);

  useEffect(() => {
    if (!debouncedQuery) {
      setUsers([]);
      setPosts([]);
      setStories([]);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const res = await apiService.searchAll(debouncedQuery, 10);
        setUsers(res.users || []);
        setPosts(res.posts || []);
        setStories(res.stories || []);
      } catch (error) {
        console.error("Search failed:", error);
        setUsers([]);
        setPosts([]);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debouncedQuery]);

  const counts = useMemo(
    () => ({
      all: users.length + posts.length + stories.length,
      users: users.length,
      posts: posts.length,
      stories: stories.length,
    }),
    [users, posts, stories]
  );

  const tabs: { id: SearchTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "users", label: "People" },
    { id: "posts", label: "Posts" },
    { id: "stories", label: "Stories" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeTab="search"
        setActiveTab={() => {}}
        darkMode={false}
        setDarkMode={() => {}}
      />

      <div className="max-w-5xl mx-auto px-4 pt-20 md:pt-6 pb-24">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 mb-6 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-200">
              <Search className="w-5 h-5 text-gray-800" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Search Mesh</h1>
              <p className="text-sm text-gray-500">
                Find friends, posts, and stories from one place
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDebouncedQuery(query.trim());
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, posts, stories..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-gray-200/60 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-white/50 text-gray-600 hover:bg-white/80"
                }`}
              >
                {tab.label} {counts[tab.id] > 0 ? `(${counts[tab.id]})` : ""}
              </button>
            ))}
          </div>
        </div>

        {!debouncedQuery && (
          <div className="text-center py-14 text-gray-500">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Start typing to search across Mesh.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-10 text-gray-500">Searching...</div>
        )}

        {!loading && debouncedQuery && counts.all === 0 && (
          <div className="text-center py-14 text-gray-500">
            <p>No results found for "{debouncedQuery}".</p>
          </div>
        )}

        {!loading && debouncedQuery && counts.all > 0 && (
          <div className="space-y-6">
            {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
              <section className="bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gray-700" />
                  <h2 className="font-semibold text-gray-900">People</h2>
                </div>
                <div className="space-y-3">
                  {users.map((person) => (
                    <button
                      key={person._id}
                      onClick={() => navigate(`/profile/${person.username}`)}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                    >
                      <img
                        src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}`}
                        alt={person.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">{person.fullName}</div>
                        <div className="text-sm text-gray-500 truncate">@{person.username}</div>
                        {person.bio && (
                          <div className="text-sm text-gray-600 truncate">{person.bio}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {person.followerCount} followers
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
              <section className="bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <h2 className="font-semibold text-gray-900">Posts</h2>
                </div>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/profile/${post.user.username}`}
                      className="block rounded-xl p-4 hover:bg-white/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`}
                          alt={post.user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{post.user.fullName}</div>
                          <div className="text-xs text-gray-500">
                            @{post.user.username} · {formatRelativeTime(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post"
                          className="mt-3 w-full max-h-72 object-cover rounded-xl border border-gray-200"
                        />
                      )}
                      <div className="mt-3 text-xs text-gray-500">
                        {post.likesCount} likes · {post.commentsCount} comments
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "stories") && stories.length > 0 && (
              <section className="bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <PlayCircle className="w-4 h-4 text-gray-700" />
                  <h2 className="font-semibold text-gray-900">Stories</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stories.map((story) => (
                    <Link
                      key={story._id}
                      to="/home"
                      className="block rounded-xl overflow-hidden border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors"
                    >
                      <div className="aspect-[4/5] bg-gray-100">
                        {story.mediaType === "video" ? (
                          <video
                            src={story.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={story.mediaUrl}
                            alt={story.caption || "Story"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={story.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.user.username}`}
                            alt={story.user.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {story.user.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatRelativeTime(story.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {story.caption || "Story update"}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Expires {formatRelativeTime(story.expiresAt)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
