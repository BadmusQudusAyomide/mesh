import Post from "./Post";

interface FeedPost {
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
  engagement?: number;
  trending?: boolean;
  category?: string;
  commentList: Array<{
    id: string;
    user: {
      id: string;
      fullName: string;
      avatar: string;
    };
    text: string;
    createdAt: string;
  }>;
}

interface PostsFeedProps {
  posts: FeedPost[];
  formatNumber: (num: number) => string;
  handleLike: (postId: string) => void;
  handleBookmark: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  commentInputs?: { [postId: string]: string };
  setCommentInputs?: React.Dispatch<
    React.SetStateAction<{ [postId: string]: string }>
  >;
}

const PostsFeed = ({
  posts,
  formatNumber,
  handleLike,
  handleBookmark,
  onAddComment,
  commentInputs,
  setCommentInputs,
}: PostsFeedProps) => (
  <div className="space-y-4 w-full max-w-2xl mx-auto">
    {posts.map((post) => (
      <Post
        key={post.id}
        post={post}
        formatNumber={formatNumber}
        handleLike={handleLike}
        handleBookmark={handleBookmark}
        onAddComment={onAddComment}
        commentInput={commentInputs ? commentInputs[post.id] || "" : ""}
        setCommentInput={
          setCommentInputs
            ? (val: string) =>
                setCommentInputs((inputs) => ({ ...inputs, [post.id]: val }))
            : undefined
        }
      />
    ))}
  </div>
);

export default PostsFeed;
