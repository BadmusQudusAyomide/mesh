import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiService } from "../lib/api";
import type { User } from "../types";
import { AuthContext } from "./AuthContextHelpers";
import type { AuthContextType } from "./AuthContextHelpers";

// AuthContext and useAuth are now in AuthContextHelpers.tsx

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiService.getToken();
        if (token && token.trim() !== "") {
          const { user } = await apiService.getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Only clear token if it's an auth error (401, 403)
        if (
          error instanceof Error &&
          (error.message.includes("token") ||
            error.message.includes("Authentication failed"))
        ) {
          apiService.clearToken();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      apiService.setToken(response.token);
      setUser(response.user);
      if (response.user && response.user._id) {
        localStorage.setItem("userId", response.user._id);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const response = await apiService.register({
        username,
        email,
        password,
        fullName,
      });
      apiService.setToken(response.token);
      setUser(response.user);
      if (response.user && response.user._id) {
        localStorage.setItem("userId", response.user._id);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      apiService.clearToken();
      setUser(null);
      localStorage.removeItem("userId");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
