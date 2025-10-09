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
    <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Who to Follow</h2>
        <Users className="w-4 h-4 text-gray-600" />
      </div>
      <div className="space-y-3">
        {whoToFollow.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 bg-white/50 rounded-lg hover:bg-white/80 transition-colors backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                />
                {user.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <Verified className="w-1.5 h-1.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">@{user.username}</div>
                {user.followers && (
                  <div className="text-xs text-gray-500">
                    {user.followers} followers
                  </div>
                )}
              </div>
            </div>
            <button className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Live Events */}
    <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Live Events</h2>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-600 font-medium">LIVE</span>
        </div>
      </div>
      <div className="space-y-3">
        {liveEvents.map((event, index) => (
          <div
            key={index}
            className="p-3 bg-red-50/50 rounded-lg border border-red-200/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-medium text-gray-900 text-sm">
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
              <button className="bg-red-600 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* AI Insights */}
    <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">AI Insights</h2>
        <Sparkles className="w-4 h-4 text-gray-600" />
      </div>
      <div className="space-y-3">
        {aiInsights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${insight.title === "Growth Rate"
                ? "bg-green-50/50 border-green-200/50"
                : insight.title === "Best Time"
                  ? "bg-blue-50/50 border-blue-200/50"
                  : "bg-purple-50/50 border-purple-200/50"
              }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                {insight.icon}
                <span className="font-medium text-gray-900 text-sm">
                  {insight.title}
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    insight.title === "Growth Rate"
                      ? "#16a34a"
                      : insight.title === "Best Time"
                        ? "#2563eb"
                        : "#9333ea",
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
    <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        <Clock className="w-4 h-4 text-gray-600" />
      </div>
      <div className="space-y-3">
        {recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-center space-x-2.5 p-2.5 bg-white/50 rounded-lg hover:bg-white/80 transition-colors backdrop-blur-sm"
          >
            <img
              src={activity.avatar}
              alt={activity.user}
              className="w-9 h-9 rounded-lg object-cover border border-gray-200"
            />
            <div>
              <p className="text-sm text-gray-900">
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