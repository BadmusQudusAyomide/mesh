import Post from "./Post";

interface PostData {
  id: string;
  user: string;
  username: string;
  avatar: string;
  content: string;
  time: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isVerified: boolean;
  engagement: number;
  trending: boolean;
  category: string;
}

interface PostsFeedProps {
  posts: PostData[];
  formatNumber: (num: number) => string;
  handleLike: (postId: string) => void;
  handleBookmark: (postId: string) => void;
}

const PostsFeed = ({
  posts,
  formatNumber,
  handleLike,
  handleBookmark,
}: PostsFeedProps) => (
  <div className="space-y-4 w-full max-w-2xl mx-auto">
    {posts.map((post) => (
      <Post
        key={post.id}
        post={post}
        formatNumber={formatNumber}
        handleLike={handleLike}
        handleBookmark={handleBookmark}
      />
    ))}
  </div>
);

export default PostsFeed;
