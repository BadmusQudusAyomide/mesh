import Post from "./Post";

interface PostsFeedProps {
  posts: any[];
  formatNumber: (num: number) => string;
  handleLike: (postId: number) => void;
  handleBookmark: (postId: number) => void;
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
