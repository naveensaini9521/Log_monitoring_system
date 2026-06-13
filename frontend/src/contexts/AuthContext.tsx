// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import { userApi } from "../services/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  permissions: string[];
  avatar?: string;
  lastActive?: string;
  notifications?: boolean;
  darkMode?: boolean;
  twoFactor?: boolean;
}

export type UserRole =
  | "super_admin"
  | "org_admin"
  | "security_analyst"
  | "devops_engineer"
  | "ai_analyst"
  | "viewer";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    username: string,
    role: string,
    additionalData?: any,
  ) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const API_BASE_URL = "";

const normalizeEndpoint = (endpoint: string): string => {
  let e = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return e;
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const fullUrl = `${API_BASE_URL}${normalizeEndpoint(endpoint)}`;
    const response = await fetch(fullUrl, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    checkAuth().finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiFetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(mapUser(data.user));
          return;
        }
      }
      setUser(null);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiFetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(mapUser(data.user));
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.user) setUser(mapUser(data.user));
        else await refreshUser();
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(data.message || "Invalid email or password");
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Network error");
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      toast.success("Logged out");
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    role: string,
    additionalData?: any,
  ) => {
    try {
      const payload = { email, password, username, role, ...additionalData };
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.user) setUser(mapUser(data.user));
        else await refreshUser();
        toast.success("Account created successfully!");
        return { success: true };
      } else {
        const errorMsg = data.message || "Registration failed";
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Network error");
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      await userApi.updateProfile(data);
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
      throw error;
    }
  };

  const mapUser = (data: any): User => ({
    id: data.id || data._id,
    email: data.email,
    name: data.name || data.username,
    role: data.role || "viewer",
    organization: data.organization,
    permissions: data.permissions || ["view_dashboards"],
    avatar: data.avatar,
    lastActive: data.lastActive,
    notifications: data.notifications ?? true,
    darkMode: data.darkMode ?? true,
    twoFactor: data.twoFactor ?? false,
  });

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    signup,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
