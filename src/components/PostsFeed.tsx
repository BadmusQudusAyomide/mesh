import Post from "./Post";
import { useAuth } from "../contexts/AuthContextHelpers";


interface FeedPost {
  id: string;
  authorId: string;
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
  onFollow?: (userId: string) => void;
}

const PostsFeed = ({
  posts,
  formatNumber,
  handleLike,
  handleBookmark,
  onAddComment,
  commentInputs,
  setCommentInputs,
  onFollow,
}: PostsFeedProps) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          userId={user?._id || ''} // Pass current user's ID
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
          isFollowing={user?.following?.map(id => id.toString()).includes(post.authorId?.toString() || '')}
          onFollow={onFollow}
        />
      ))}
    </div>
  );
};

export default PostsFeed;
