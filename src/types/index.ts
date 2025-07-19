// User types
export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
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