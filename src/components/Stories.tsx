import { Plus, Camera, Play, Calendar } from "lucide-react";

interface StoriesProps {
  currentUser?: {
    name: string;
    avatar: string;
  };
  onCreatePost?: () => void;
}

const Stories = ({ currentUser, onCreatePost }: StoriesProps) => {
  return (
    <div className="w-full">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-4 border border-white/30 shadow-2xl mb-6 mt-6">
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white shadow-lg text-gray-500">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <button
                onClick={onCreatePost}
                className="w-full bg-gray-50/80 hover:bg-gray-100/80 rounded-full px-6 py-3 text-left text-gray-500 transition-all duration-200 border border-gray-200/50"
              >
                <span className="text-base">What's on your mind?</span>
              </button>
            </div>
          </div>
        )}
        {/* Quick actions under the input */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/70">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/70 transition text-gray-600 hover:text-gray-800">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/70 transition text-gray-600 hover:text-gray-800">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Video</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/70 transition text-gray-600 hover:text-gray-800">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Event</span>
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-gray-800">Stories</h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <p className="text-gray-500">No stories yet</p>
        </div>
      </div>
    </div>
  );
};

export default Stories;
