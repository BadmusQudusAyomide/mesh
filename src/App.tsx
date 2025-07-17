import React, { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Image as ImageIcon,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import "./App.css";

const initialPosts = [
  {
    id: 1,
    user: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    content: "Excited to join this new platform! #hello",
    time: "2m ago",
    image: "",
    likes: 24,
    comments: 5,
    shares: 2,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    user: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    content: "Loving the clean UI. Great job team!",
    time: "10m ago",
    image: "https://source.unsplash.com/random/800x600?nature",
    likes: 42,
    comments: 8,
    shares: 3,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 3,
    user: "Alice Lee",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    content: "Anyone up for a coding challenge?",
    time: "30m ago",
    image: "https://source.unsplash.com/random/800x600?tech",
    likes: 15,
    comments: 7,
    shares: 1,
    isLiked: false,
    isBookmarked: true,
  },
];

function App() {
  const [posts, setPosts] = useState<typeof initialPosts>(initialPosts);
  const [postContent, setPostContent] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePostSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postContent.trim() && !previewImage) return;

    const newPost = {
      id: posts.length + 1,
      user: "Current User",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: postContent,
      time: "Just now",
      image: previewImage,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
    setPreviewImage("");
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreviewImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isBookmarked: !post.isBookmarked,
            }
          : post
      )
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-blue-600">Mesh</span>
              <div className="hidden md:flex items-center space-x-4">
                <Search className="text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Mesh"
                  className="bg-gray-100 rounded-full px-4 py-1 focus:outline-none"
                />
              </div>
            </div>
            {/* Top nav icons only on md+ */}
            <div className="hidden md:flex items-center space-x-6 text-gray-600 text-xl">
              <Home
                className="hover:text-blue-500 cursor-pointer w-6 h-6"
                title="Home"
              />
              <Bell
                className="hover:text-blue-500 cursor-pointer w-6 h-6"
                title="Notifications"
              />
              <Mail
                className="hover:text-blue-500 cursor-pointer w-6 h-6"
                title="Messages"
              />
              <div className="relative">
                <User
                  className="hover:text-blue-500 cursor-pointer w-6 h-6"
                  title="Profile"
                />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom navigation bar for mobile */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95vw] max-w-md bg-white/80 backdrop-blur-md border shadow-lg rounded-2xl md:hidden z-20">
        <div className="flex justify-around items-center h-14 text-gray-700 text-2xl">
          <Home
            className="hover:text-blue-500 cursor-pointer w-7 h-7 transition"
            title="Home"
          />
          <Search
            className="hover:text-blue-500 cursor-pointer w-7 h-7 transition"
            title="Search"
          />
          <Bell
            className="hover:text-blue-500 cursor-pointer w-7 h-7 transition"
            title="Notifications"
          />
          <Mail
            className="hover:text-blue-500 cursor-pointer w-7 h-7 transition"
            title="Messages"
          />
          <User
            className="hover:text-blue-500 cursor-pointer w-7 h-7 transition"
            title="Profile"
          />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row mt-6 gap-6 px-4">
        {/* Left Sidebar */}
        <aside className="hidden md:block md:w-1/4">
          <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-24">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">Current User</h3>
                <p className="text-gray-500 text-sm">@currentuser</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <div>
                <span className="font-semibold text-gray-700">245</span>{" "}
                Following
              </div>
              <div>
                <span className="font-semibold text-gray-700">1.2K</span>{" "}
                Followers
              </div>
            </div>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 rounded-lg text-sm font-medium transition">
              Edit Profile
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sticky top-80">
            <h2 className="font-semibold text-lg mb-2">Trends</h2>
            <ul className="space-y-3">
              <li className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <div className="text-sm text-gray-500">Trending in Tech</div>
                <div className="font-medium">#ReactJS</div>
                <div className="text-sm text-gray-500">15.2K posts</div>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <div className="text-sm text-gray-500">Trending</div>
                <div className="font-medium">#TailwindCSS</div>
                <div className="text-sm text-gray-500">8.7K posts</div>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <div className="text-sm text-gray-500">Technology</div>
                <div className="font-medium">#OpenAI</div>
                <div className="text-sm text-gray-500">32.1K posts</div>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <div className="text-sm text-gray-500">Programming</div>
                <div className="font-medium">#WebDev</div>
                <div className="text-sm text-gray-500">12.5K posts</div>
              </li>
            </ul>
          </div>
        </aside>

        {/* Feed */}
        <main className="flex-1">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handlePostSubmit}>
              <div className="flex space-x-3">
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="User"
                  className="w-12 h-12 rounded-full"
                />
                <textarea
                  className="flex-1 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                  placeholder="What's happening?"
                  value={postContent}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setPostContent(e.target.value)
                  }
                ></textarea>
              </div>
              {previewImage && (
                <div className="mt-3 relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="rounded-lg w-full max-h-80 object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                    onClick={() => {
                      setPreviewImage("");
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() =>
                      fileInputRef.current && fileInputRef.current.click()
                    }
                  >
                    <ImageIcon className="inline mr-1 w-5 h-5" />
                    <span className="text-sm">Photo</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </button>
                </div>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    postContent.trim() || previewImage
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } transition`}
                  disabled={!postContent.trim() && !previewImage}
                >
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition hover:shadow-2xl border border-gray-100"
              >
                <div className="p-4 flex space-x-3">
                  <img
                    src={post.avatar}
                    alt={post.user}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{post.user}</span>
                        <span className="text-gray-500 text-sm">
                          @{post.user.replace(/\s+/g, "").toLowerCase()}
                        </span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="text-gray-400 text-sm">
                          {post.time}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal />
                      </button>
                    </div>
                    <p className="mt-1 text-gray-700">{post.content}</p>
                    {post.image && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex justify-between mt-3 text-gray-500">
                      <button
                        className={`flex items-center space-x-1 ${
                          post.isLiked ? "text-red-500" : "hover:text-red-500"
                        }`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <MessageCircle />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-green-500">
                        <Share2 />
                        <span>{post.shares}</span>
                      </button>
                      <button
                        className={`flex items-center space-x-1 ${
                          post.isBookmarked
                            ? "text-blue-500"
                            : "hover:text-blue-500"
                        }`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden md:block md:w-1/4">
          <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Who to follow</h2>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <img
                  src="https://randomuser.me/api/portraits/men/4.jpg"
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Mike Ross</h4>
                  <p className="text-gray-500 text-sm">@mikeross</p>
                </div>
                <button className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-800 transition">
                  Follow
                </button>
              </li>
              <li className="flex items-center space-x-3">
                <img
                  src="https://randomuser.me/api/portraits/women/5.jpg"
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Sara Kim</h4>
                  <p className="text-gray-500 text-sm">@sarakim</p>
                </div>
                <button className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-800 transition">
                  Follow
                </button>
              </li>
              <li className="flex items-center space-x-3">
                <img
                  src="https://randomuser.me/api/portraits/men/6.jpg"
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-medium">David Wilson</h4>
                  <p className="text-gray-500 text-sm">@davidwilson</p>
                </div>
                <button className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-800 transition">
                  Follow
                </button>
              </li>
            </ul>
            <button className="text-blue-500 text-sm mt-3 hover:text-blue-600">
              Show more
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sticky top-96">
            <h2 className="font-semibold text-lg mb-2">News</h2>
            <div className="space-y-4">
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <h3 className="font-medium">
                  React 19 Beta released with new features
                </h3>
                <p className="text-gray-500 text-sm">Tech News · 2h ago</p>
              </div>
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <h3 className="font-medium">
                  The future of AI in web development
                </h3>
                <p className="text-gray-500 text-sm">Technology · 5h ago</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
