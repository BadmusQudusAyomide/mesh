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
import React, { useEffect, useMemo, useRef } from "react";
import { useAuth } from "../contexts/AuthContextHelpers";

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
}: CreatePostProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { user } = useAuth();
  const avatar =
    user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg";
  const displayName = user?.fullName || user?.username || "You";

  // Auto-resize textarea without causing layout thrash
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 320) + "px";
  }, [postContent]);

  // Stable handlers for minor perf wins
  const onClose = useMemo(
    () => () => setShowCreatePost(false),
    [setShowCreatePost]
  );
  const onRemoveImage = useMemo(
    () => () => setPreviewImage(""),
    [setPreviewImage]
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl shadow-2xl overflow-hidden my-2 sm:my-4 md:my-8 max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b flex-shrink-0">
          <h3 className="font-bold text-xl text-gray-800">Create Post</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handlePostSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4 md:mb-6">
              <img
                src={avatar}
                alt={displayName}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-white"
              />
              <div>
                <h4 className="font-medium text-gray-800">{displayName}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Public</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[100px] p-3 sm:p-4 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />

            {previewImage && (
              <div className="mt-4 relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[35vh] sm:max-h-[45vh] md:max-h-[50vh] object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 md:p-6 border-t flex-shrink-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h4 className="font-medium text-gray-800">Add to your post</h4>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef?.current?.click()}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
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
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
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
};

function areEqual(prev: CreatePostProps, next: CreatePostProps) {
  return (
    prev.postContent === next.postContent &&
    prev.previewImage === next.previewImage &&
    prev.fileInputRef === next.fileInputRef &&
    prev.handlePostSubmit === next.handlePostSubmit &&
    prev.handleImageUpload === next.handleImageUpload &&
    prev.setShowCreatePost === next.setShowCreatePost
  );
}

export default React.memo(CreatePost, areEqual);
