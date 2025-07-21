// User types
export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  cover?: string;
  bio: string;
  website: string;
  location: string;
  isVerified: boolean;
  isPrivate: boolean;
  followers: string[];
  following: string[];
  posts: string[];
  savedPosts: string[];
  notifications: string[];
  isOnline: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Response types
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface ProfileUpdateResponse {
  message: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

// Post types
export interface Post {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  image?: string;
  likes: string[];
  comments: Array<{
    user: {
      _id: string;
      fullName: string;
      username: string;
      avatar: string;
      isVerified: boolean;
    };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FeedPost {
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

export interface Notification {
  _id: string;
  type: string;
  from: { fullName: string; avatar: string; username: string };
  post: { content: string; image?: string };
  text: string;
  isRead: boolean;
  createdAt: string;
} 