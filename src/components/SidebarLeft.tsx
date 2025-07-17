import { Crown, TrendingUp, Camera, Mic, Calendar, Users } from "lucide-react";

interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

interface SidebarLeftProps {
  trendingTopics: TrendingTopic[];
  user: { name: string; username: string; avatar: string };
}

const SidebarLeft = ({ trendingTopics, user }: SidebarLeftProps) => (
  <div className="lg:col-span-1 space-y-6">
    {/* Profile Card: only on md+ */}
    <div className="hidden md:block">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
            <p className="text-gray-600 text-sm">@{user.username}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">
                Pro Member
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg text-gray-800">2.5K</div>
            <div className="text-xs text-gray-600">Following</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-gray-800">15.2K</div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-gray-800">342</div>
            <div className="text-xs text-gray-600">Posts</div>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
          Edit Profile
        </button>
      </div>
    </div>
    {/* Trending Topics */}
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">Trending</h2>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <div className="space-y-4">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="font-medium text-gray-800">{topic.tag}</div>
              <div className="text-sm text-gray-600">{topic.posts} posts</div>
            </div>
            <div className="text-green-500 text-sm font-medium">
              {topic.growth}
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Quick Actions */}
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <h2 className="font-bold text-lg text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center space-x-2 p-3 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all duration-200">
          <Camera className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Story</span>
        </button>
        <button className="flex items-center space-x-2 p-3 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-all duration-200">
          <Mic className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Live</span>
        </button>
        <button className="flex items-center space-x-2 p-3 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-all duration-200">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Event</span>
        </button>
        <button className="flex items-center space-x-2 p-3 bg-orange-500/20 rounded-xl hover:bg-orange-500/30 transition-all duration-200">
          <Users className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">Group</span>
        </button>
      </div>
    </div>
  </div>
);

export default SidebarLeft;
