import React from "react";
import { Users, Verified, Eye, Sparkles, Clock } from "lucide-react";

interface User {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers?: string;
}

interface Event {
  title: string;
  viewers: string;
  category: string;
}

interface SidebarRightProps {
  whoToFollow: User[];
  liveEvents: Event[];
  aiInsights: {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
  }[];
  recentActivity: {
    user: string;
    action: string;
    time: string;
    avatar: string;
  }[];
}

const SidebarRight = ({
  whoToFollow,
  liveEvents,
  aiInsights,
  recentActivity,
}: SidebarRightProps) => (
  <div className="lg:col-span-1 space-y-6">
    {/* Who to Follow */}
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">Who to Follow</h2>
        <Users className="w-5 h-5 text-blue-500" />
      </div>
      <div className="space-y-4">
        {whoToFollow.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Verified className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">
                  {user.name}
                </div>
                <div className="text-xs text-gray-600">@{user.username}</div>
                {user.followers && (
                  <div className="text-xs text-gray-500">
                    {user.followers} followers
                  </div>
                )}
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
    {/* Live Events */}
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">Live Events</h2>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-500 font-medium">LIVE</span>
        </div>
      </div>
      <div className="space-y-4">
        {liveEvents.map((event, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800 text-sm">
                {event.title}
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-600 font-medium">
                  {event.viewers}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{event.category}</span>
              <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-600 transition-all duration-200">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* AI Insights */}
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">AI Insights</h2>
        <Sparkles className="w-5 h-5 text-purple-500" />
      </div>
      <div className="space-y-4">
        {aiInsights.map((insight, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border"
            style={{
              background:
                insight.title === "Growth Rate"
                  ? "linear-gradient(to right, #22c55e33, #10b98133)"
                  : insight.title === "Best Time"
                  ? "linear-gradient(to right, #3b82f633, #06b6d433)"
                  : "linear-gradient(to right, #a21caf33, #ec489933)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {insight.icon}
                <span className="font-medium text-gray-800 text-sm">
                  {insight.title}
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    insight.title === "Growth Rate"
                      ? "#22c55e"
                      : insight.title === "Best Time"
                      ? "#3b82f6"
                      : "#a21caf",
                }}
              >
                {insight.value}
              </span>
            </div>
            <p className="text-xs text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
    {/* Recent Activity */}
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">Recent Activity</h2>
        <Clock className="w-5 h-5 text-blue-500" />
      </div>
      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200"
          >
            <img
              src={activity.avatar}
              alt={activity.user}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm text-gray-800">
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SidebarRight;
