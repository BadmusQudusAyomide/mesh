import type { 
  User, 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  HealthCheckResponse, 
  ProfileUpdateResponse, 
  LogoutResponse, 
  Notification, 
  Post 
} from '../types';
import { API_BASE_URL } from '../config';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    // For auth errors, provide more specific error messages
    if (response.status === 401) {
      throw new Error((data && data.error) || data || 'Authentication failed');
    }
    throw new Error((data && data.error) || data || 'Something went wrong');
  }

  return data;
};

// API service class
class ApiService {
  private token: string | null = null;

  // Set token for authenticated requests
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Get token from localStorage
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  // Clear token (logout)
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get headers for requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Make API request
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(),
    };

    try {
      const response = await fetch(url, config);
      return await handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me', {
      method: 'GET',
    });
  }

  async getUserProfile(username: string): Promise<{ user: User; isFollowing: boolean }> {
    return this.request<{ user: User; isFollowing: boolean }>(`/auth/profile/${username}`, {
      method: 'GET',
    });
  }

  async updateProfile(data: Partial<User>): Promise<ProfileUpdateResponse> {
    return this.request<ProfileUpdateResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async followUser(userId: string): Promise<{ message: string; isFollowing: boolean }> {
    return this.request<{ message: string; isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async logout(): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health', {
      method: 'GET',
    });
  }

  // Message: get total unread count
  async getUnreadMessagesCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>(`/messages/unread-count/total`, { method: 'GET' });
  }

  // Create a new post
  async createPost(data: { content: string; image?: string }): Promise<{ post: Post }> {
    return this.request<{ post: Post }>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get all posts
  async getPosts(): Promise<{ posts: Post[] }> {
    return this.request<{ posts: Post[] }>("/posts", {
      method: "GET",
    });
  }

  // Get main feed posts with pagination for infinite scroll
  async getPostsPaginated(page: number = 1, limit: number = 5): Promise<{
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasMore: boolean;
      limit: number;
    };
  }> {
    return this.request<{
      posts: Post[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        hasMore: boolean;
        limit: number;
      };
    }>(`/posts?page=${page}&limit=${limit}`, { method: "GET" });
  }

  // Get posts by username
  async getPostsByUsername(username: string): Promise<{ posts: any[] }> {
    return this.request<{ posts: any[] }>(`/posts/user/${username}`, { method: "GET" });
  }

  // Get user posts with pagination for infinite scroll
  async getPostsByUsernamePaginated(username: string, page: number = 1, limit: number = 5): Promise<{ 
    posts: any[]; 
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasMore: boolean;
      limit: number;
    }
  }> {
    return this.request<{ 
      posts: any[]; 
      pagination: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        hasMore: boolean;
        limit: number;
      }
    }>(`/posts/user/${username}?page=${page}&limit=${limit}`, { method: "GET" });
  }

  // Like or unlike a post
  async likePost(postId: string): Promise<{ liked: boolean; likesCount: number; post: Post }> {
    return this.request<{ liked: boolean; likesCount: number; post: Post }>(`/posts/${postId}/like`, {
      method: "POST",
    });
  }

  // Add a comment to a post
  async addComment(postId: string, text: string): Promise<{ comment: Post['comments'][0]; post: Post }> {
    return this.request<{ comment: Post['comments'][0]; post: Post }>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Get notifications for the current user
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    return this.request<{ notifications: Notification[] }>("/posts/notifications", { method: "GET" });
  }

  // Get notifications with pagination for infinite scroll
  async getNotificationsPaginated(page: number = 1, limit: number = 5): Promise<{ 
    notifications: Notification[]; 
    pagination: {
      currentPage: number;
      totalPages: number;
      totalNotifications: number;
      hasMore: boolean;
      limit: number;
    }
  }> {
    return this.request<{ 
      notifications: Notification[]; 
      pagination: {
        currentPage: number;
        totalPages: number;
        totalNotifications: number;
        hasMore: boolean;
        limit: number;
      }
    }>(`/posts/notifications?page=${page}&limit=${limit}`, { method: "GET" });
  }

  // Message endpoints
  async getConversations(): Promise<{ conversations: any[] }> {
    return this.request<{ conversations: any[] }>("/messages/conversations", { method: "GET" });
  }

  // Get conversations with pagination for infinite scroll
  async getConversationsPaginated(page: number = 1, limit: number = 5): Promise<{ 
    conversations: any[]; 
    pagination: {
      currentPage: number;
      totalPages: number;
      totalConversations: number;
      hasMore: boolean;
      limit: number;
    }
  }> {
    return this.request<{ 
      conversations: any[]; 
      pagination: {
        currentPage: number;
        totalPages: number;
        totalConversations: number;
        hasMore: boolean;
        limit: number;
      }
    }>(`/messages/conversations?page=${page}&limit=${limit}`, { method: "GET" });
  }

  async getMessages(userId: string): Promise<{ messages: any[] }> {
    return this.request<{ messages: any[] }>(`/messages/${userId}`, { method: "GET" });
  }

  async sendMessage(recipientId: string, content: string, messageType: string = 'text'): Promise<{ message: any }> {
    return this.request<{ message: any }>("/messages", {
      method: "POST",
      body: JSON.stringify({ recipientId, content, messageType }),
    });
  }

  async markAsRead(messageId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/messages/${messageId}/read`, { method: "PUT" });
  }

  async getMutualFollowers(): Promise<{ mutualFollowers: User[] }> {
    return this.request<{ mutualFollowers: User[] }>(`/messages/mutual-followers`);
  }

  async getUserSuggestions(limit: number = 5): Promise<{ suggestions: User[] }> {
    return this.request<{ suggestions: User[] }>(`/auth/suggestions?limit=${limit}`, { method: 'GET' });
  }

  async listUsers(params: { query?: string; page?: number; limit?: number } = {}): Promise<{ users: User[]; page: number; totalPages: number; total: number; hasMore: boolean }> {
    const q = encodeURIComponent(params.query ?? '');
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const queryStr = `query=${q}&page=${page}&limit=${limit}`;
    return this.request<{ users: User[]; page: number; totalPages: number; total: number; hasMore: boolean }>(`/auth/users?${queryStr}`, { method: 'GET' });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing
export default ApiService; 