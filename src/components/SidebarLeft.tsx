import { Crown, TrendingUp, Camera, Mic, Calendar, Users } from "lucide-react";

interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

interface SidebarLeftProps {
  trendingTopics: TrendingTopic[];
  user: { name: string; username: string; avatar: string };
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
}

const SidebarLeft = ({ trendingTopics, user, followerCount = 0, followingCount = 0, postCount = 0 }: SidebarLeftProps) => (
  <div className="lg:col-span-1 space-y-6">
    {/* Profile Card: only on md+ */}
    <div className="hidden md:block">
      <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600 text-sm">@{user.username}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <Crown className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-xs text-yellow-600 font-medium">
                Pro Member
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{new Intl.NumberFormat().format(followingCount)}</div>
            <div className="text-xs text-gray-600">Following</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{new Intl.NumberFormat().format(followerCount)}</div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{new Intl.NumberFormat().format(postCount)}</div>
            <div className="text-xs text-gray-600">Posts</div>
          </div>
        </div>
        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Edit Profile
        </button>
      </div>
    </div>

    {/* Trending Topics */}
    <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Trending</h2>
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>
      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer backdrop-blur-sm"
          >
            <div>
              <div className="font-medium text-gray-900">{topic.tag}</div>
              <div className="text-sm text-gray-600">{topic.posts} posts</div>
            </div>
            <div className="text-green-600 text-sm font-medium">
              {topic.growth}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <button className="flex items-center space-x-2 p-2.5 bg-blue-50/60 rounded-lg hover:bg-blue-50/80 transition-colors">
          <Camera className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Story</span>
        </button>
        <button className="flex items-center space-x-2 p-2.5 bg-purple-50/60 rounded-lg hover:bg-purple-50/80 transition-colors">
          <Mic className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Live</span>
        </button>
        <button className="flex items-center space-x-2 p-2.5 bg-green-50/60 rounded-lg hover:bg-green-50/80 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Event</span>
        </button>
        <button className="flex items-center space-x-2 p-2.5 bg-orange-50/60 rounded-lg hover:bg-orange-50/80 transition-colors">
          <Users className="w-3.5 h-3.5 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">Group</span>
        </button>
      </div>
    </div>
  </div>
);

export default SidebarLeft;