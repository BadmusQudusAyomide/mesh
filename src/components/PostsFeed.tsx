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
  <div className="space-y-6">
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
