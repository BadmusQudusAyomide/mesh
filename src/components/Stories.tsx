interface Story {
  id: number;
  user: string;
  avatar: string;
  hasStory: boolean;
  isAdd?: boolean;
  isViewed?: boolean;
}

interface StoriesProps {
  stories: Story[];
}

const Stories = ({ stories }: StoriesProps) => (
  <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold text-lg text-gray-800">Stories</h2>
      <button className="text-blue-500 hover:text-blue-600 transition-colors">
        +
      </button>
    </div>
    <div className="flex space-x-4 overflow-x-auto pb-2">
      {stories.map((story) => (
        <div key={story.id} className="flex-shrink-0 text-center">
          <div
            className={`relative w-16 h-16 rounded-2xl overflow-hidden ${
              story.isAdd
                ? "bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                : story.hasStory && !story.isViewed
                ? "p-0.5 bg-gradient-to-br from-pink-500 to-orange-500"
                : "p-0.5 bg-gray-300"
            }`}
          >
            {story.isAdd ? (
              <span className="text-white text-2xl font-bold">+</span>
            ) : (
              <img
                src={story.avatar}
                alt={story.user}
                className="w-full h-full object-cover rounded-2xl"
              />
            )}
          </div>
          <div className="text-xs text-gray-600 mt-2 truncate w-16">
            {story.user}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Stories;
