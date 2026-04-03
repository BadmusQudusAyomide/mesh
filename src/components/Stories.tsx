import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import type { StoryGroup } from "../types";
import { formatRelativeTime } from "../lib/utils";

interface StoriesProps {
  currentUser?: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  stories: StoryGroup[];
  onCreateStory: (
    file: File,
    caption: string,
    mediaType: "image" | "video"
  ) => Promise<void>;
  onStoryViewed: (storyId: string) => Promise<void> | void;
  isCreating?: boolean;
}

const STORY_IMAGE_MS = 5000;

export default function Stories({
  currentUser,
  stories,
  onCreateStory,
  onStoryViewed,
  isCreating = false,
}: StoriesProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);
  const [viewerStoryIndex, setViewerStoryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const activeGroup =
    viewerGroupIndex !== null ? stories[viewerGroupIndex] || null : null;
  const activeStory =
    activeGroup && activeGroup.stories[viewerStoryIndex]
      ? activeGroup.stories[viewerStoryIndex]
      : null;

  useEffect(() => {
    if (!activeStory) return;
    const key = activeStory._id;
    if (viewedKeysRef.current.has(key)) return;
    viewedKeysRef.current.add(key);
    void onStoryViewed(key);
  }, [activeStory, onStoryViewed]);

  useEffect(() => {
    if (!activeStory || activeStory.mediaType !== "image") return;
    const id = window.setTimeout(() => {
      goToNextStory();
    }, STORY_IMAGE_MS);
    return () => window.clearTimeout(id);
  }, [activeStory?._id]);

  const storyTiles = useMemo(() => stories, [stories]);

  const openViewer = (groupIndex: number) => {
    setViewerGroupIndex(groupIndex);
    setViewerStoryIndex(0);
  };

  const closeViewer = () => {
    setViewerGroupIndex(null);
    setViewerStoryIndex(0);
  };

  const goToNextStory = () => {
    if (!activeGroup) {
      closeViewer();
      return;
    }

    if (viewerStoryIndex < activeGroup.stories.length - 1) {
      setViewerStoryIndex((prev) => prev + 1);
      return;
    }

    if (viewerGroupIndex !== null && viewerGroupIndex < stories.length - 1) {
      setViewerGroupIndex((prev) => (prev === null ? prev : prev + 1));
      setViewerStoryIndex(0);
      return;
    }

    closeViewer();
  };

  const goToPreviousStory = () => {
    if (!activeGroup) return;

    if (viewerStoryIndex > 0) {
      setViewerStoryIndex((prev) => prev - 1);
      return;
    }

    if (viewerGroupIndex !== null && viewerGroupIndex > 0) {
      const previousGroupIndex = viewerGroupIndex - 1;
      const previousGroup = stories[previousGroupIndex];
      setViewerGroupIndex(previousGroupIndex);
      setViewerStoryIndex(Math.max(0, previousGroup.stories.length - 1));
    }
  };

  const handleFileSelected = (file?: File | null) => {
    if (!file) return;
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCreateModal(true);
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const mediaType = selectedFile.type.startsWith("video/") ? "video" : "image";
    await onCreateStory(selectedFile, caption.trim(), mediaType);
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setCaption("");
    setShowCreateModal(false);
  };

  const clearCreateState = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setCaption("");
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="rounded-2xl p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Stories</h3>
            <p className="text-xs text-gray-500">Share moments that disappear in 24 hours</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Add Story
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
        />

        <div className="flex gap-3 overflow-x-auto pb-1">
          {currentUser && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-20 text-center"
            >
              <div className="relative mx-auto w-16 h-16 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-full object-cover opacity-70"
                  />
                ) : null}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center border-2 border-white">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xs font-medium text-gray-700 truncate">
                Your Story
              </div>
            </button>
          )}

          {storyTiles.length === 0 && (
            <div className="text-sm text-gray-500 py-4">
              No stories yet. Be the first to post one.
            </div>
          )}

          {storyTiles.map((group, groupIndex) => (
            <button
              key={group.user._id}
              onClick={() => openViewer(groupIndex)}
              className="shrink-0 w-20 text-center"
            >
              <div
                className={`mx-auto p-[3px] rounded-full ${
                  group.hasUnviewed
                    ? "bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400"
                    : "bg-gray-200"
                }`}
              >
                <div className="bg-white rounded-full p-[2px]">
                  <img
                    src={group.user.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                    alt={group.user.fullName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs font-medium text-gray-700 truncate">
                {group.user._id === currentUser?._id ? "You" : group.user.fullName.split(" ")[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Story</h3>
              <button
                onClick={clearCreateState}
                disabled={isCreating}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitStory} className="p-5 space-y-4">
              {previewUrl && selectedFile?.type.startsWith("video/") ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-[60vh] rounded-xl bg-black"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="w-full max-h-[60vh] object-cover rounded-xl"
                />
              ) : null}

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption"
                className="w-full rounded-xl border border-gray-200 p-3 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                maxLength={280}
              />

              <button
                type="submit"
                disabled={!selectedFile || isCreating}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCreating ? "Sharing..." : "Share Story"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeGroup && activeStory && viewerGroupIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="px-4 pt-4 flex gap-1">
            {activeGroup.stories.map((story, index) => (
              <div key={story._id} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    index < viewerStoryIndex
                      ? "w-full bg-white"
                      : index === viewerStoryIndex
                      ? "w-1/2 bg-white"
                      : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <img
                src={activeGroup.user.avatar}
                alt={activeGroup.user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{activeGroup.user.fullName}</div>
                <div className="text-xs text-white/70">
                  {formatRelativeTime(activeStory.createdAt)}
                </div>
              </div>
            </div>
            <button onClick={closeViewer} className="p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center">
            <button
              onClick={goToPreviousStory}
              className="absolute left-3 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              {activeStory.mediaType === "video" ? (
                <video
                  key={activeStory._id}
                  src={activeStory.mediaUrl}
                  autoPlay
                  controls
                  onEnded={goToNextStory}
                  className="max-h-full max-w-full"
                />
              ) : (
                <img
                  src={activeStory.mediaUrl}
                  alt={activeStory.caption || "Story"}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <button
              onClick={goToNextStory}
              className="absolute right-3 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {activeStory.caption && (
            <div className="px-4 py-4 text-white bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-sm leading-relaxed">{activeStory.caption}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
