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

  // Get posts by username
  async getPostsByUsername(username: string): Promise<{ posts: Post[] }> {
    return this.request<{ posts: Post[] }>(`/posts/user/${username}`, {
      method: "GET",
    });
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
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing
export default ApiService; 