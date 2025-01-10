// src/contexts/auth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
  given_name: string;
  family_name: string;
  locale: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL as string;

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/me`, {
        withCredentials: true,
      });
      setUser(response.data);
      setError(null);
    } catch (error) {
      setUser(null);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Logout failed");
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
