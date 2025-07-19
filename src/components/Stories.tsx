import React, { useState } from "react";
import { Plus, ChevronRight, Camera, Play } from "lucide-react";

interface Story {
  id: number;
  user: string;
  avatar: string;
  hasStory: boolean;
  isAdd?: boolean;
  isViewed?: boolean;
  isLive?: boolean;
  storyCount?: number;
  lastSeen?: string;
  previewImage?: string;
}

interface StoriesProps {
  stories: Story[];
  currentUser?: {
    name: string;
    avatar: string;
  };
  onCreatePost?: () => void;
}

const Stories = ({ stories, currentUser, onCreatePost }: StoriesProps) => {
  const [hoveredStory, setHoveredStory] = useState<number | null>(null);

  const handleStoryClick = (story: Story) => {
    if (story.isAdd) {
      // Handle adding new story
      console.log("Add new story");
    } else {
      // Handle viewing story
      console.log("View story:", story.user);
    }
  };

  const getStoryGradient = (story: Story) => {
    if (story.isAdd) return "from-blue-500 to-purple-600";
    if (story.isLive) return "from-red-500 to-pink-500";
    if (story.hasStory && !story.isViewed)
      return "from-purple-500 via-pink-500 to-orange-500";
    return "from-gray-400 to-gray-500";
  };

  return (
    <div className="w-full">
      {/* Enhanced Create Post Section */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-4 border border-white/30 shadow-2xl mb-4 hover:shadow-3xl transition-all duration-300">
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt="Your avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <button
                onClick={onCreatePost}
                className="w-full bg-gray-50/80 hover:bg-gray-100/80 rounded-full px-6 py-3 text-left text-gray-500 transition-all duration-200 hover:shadow-lg border border-gray-200/50 backdrop-blur-sm"
              >
                <span className="text-base">What's on your mind?</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/50">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/60 transition-all duration-200 text-gray-600 hover:text-gray-800">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/60 transition-all duration-200 text-gray-600 hover:text-gray-800">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Video</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/60 transition-all duration-200 text-gray-600 hover:text-gray-800">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
              />
            </svg>
            <span className="text-sm font-medium">Event</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stories Section */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl text-gray-800">Stories</h2>
          <button className="text-blue-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex-shrink-0 text-center cursor-pointer group"
                onMouseEnter={() => setHoveredStory(story.id)}
                onMouseLeave={() => setHoveredStory(null)}
                onClick={() => handleStoryClick(story)}
              >
                <div className="relative">
                  {/* Story Ring with Gradient */}
                  {story.hasStory && !story.isAdd && (
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStoryGradient(
                        story
                      )} p-0.5 ${story.isLive ? "animate-pulse" : ""}`}
                    >
                      <div className="bg-white rounded-full p-0.5">
                        <div className="w-16 h-16 rounded-full bg-white"></div>
                      </div>
                    </div>
                  )}

                  {/* Story Avatar */}
                  <div
                    className={`relative w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ${
                      story.isAdd
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105"
                        : "hover:scale-105"
                    } ${
                      hoveredStory === story.id ? "transform scale-110" : ""
                    }`}
                  >
                    {story.isAdd ? (
                      <Plus className="w-6 h-6 text-white" />
                    ) : (
                      <>
                        <img
                          src={story.avatar}
                          alt={story.user}
                          className="w-full h-full object-cover"
                        />
                        {story.previewImage && hoveredStory === story.id && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Live Indicator */}
                  {story.isLive && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                      LIVE
                    </div>
                  )}

                  {/* Story Count */}
                  {story.storyCount && story.storyCount > 1 && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {story.storyCount}
                    </div>
                  )}

                  {/* Viewed Indicator */}
                  {story.hasStory && story.isViewed && (
                    <div className="absolute -bottom-1 -right-1 bg-gray-400 w-4 h-4 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Story Name */}
                <div className="mt-2 w-16">
                  <div
                    className={`text-xs font-medium truncate transition-colors ${
                      story.isViewed ? "text-gray-500" : "text-gray-800"
                    }`}
                  >
                    {story.user}
                  </div>
                  {story.lastSeen && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {story.lastSeen}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* See More Button */}
            <div className="flex-shrink-0 text-center cursor-pointer group">
              <div className="relative w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl">
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
              </div>
              <div className="text-xs text-gray-400 mt-2 w-16 truncate">
                See All
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Stories;
