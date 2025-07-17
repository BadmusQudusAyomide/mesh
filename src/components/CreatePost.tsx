import {
  Image as ImageIcon,
  User,
  Smile,
  MapPin,
  Gift,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";
import React from "react";

interface CreatePostProps {
  postContent: string;
  setPostContent: (val: string) => void;
  previewImage: string;
  setPreviewImage: (val: string) => void;
  handlePostSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setShowCreatePost: (val: boolean) => void;
}

const CreatePost = ({
  postContent,
  setPostContent,
  previewImage,
  setPreviewImage,
  handlePostSubmit,
  handleImageUpload,
  fileInputRef,
  setShowCreatePost,
}: CreatePostProps) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="font-bold text-xl text-gray-800">Create Post</h3>
        <button
          onClick={() => setShowCreatePost(false)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={handlePostSubmit}>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="Profile"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white"
            />
            <div>
              <h4 className="font-medium text-gray-800">Badmus</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Public</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[120px] p-4 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {previewImage && (
            <div className="mt-4 relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-96 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => setPreviewImage("")}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
        <div className="p-6 border-t">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-medium text-gray-800">Add to your post</h4>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef?.current?.click()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-green-500" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-blue-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Smile className="w-5 h-5 text-yellow-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-5 h-5 text-red-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Gift className="w-5 h-5 text-purple-500" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!postContent.trim() && !previewImage}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
              postContent.trim() || previewImage
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default CreatePost;
