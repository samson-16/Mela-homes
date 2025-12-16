"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshTokenFunc = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await axios.post(`${API_URL}/users/login/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken =
        response.data.access ||
        response.data.token ||
        response.data.access_token;
      if (newAccessToken) {
        setToken(newAccessToken);
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
      }

      logout();
      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  };

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/users/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUser(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        const newToken = await refreshTokenFunc();
        if (newToken) {
          try {
            const retryResponse = await axios.get(`${API_URL}/users/me/`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            setUser(retryResponse.data);
          } catch {
            logout();
          }
        }
      } else {
        console.error("Failed to fetch user:", error);
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/users/login/`, {
        email,
        password,
      });

      const accessToken =
        response.data.access ||
        response.data.token ||
        response.data.access_token;
      const refreshToken = response.data.refresh || response.data.refresh_token;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      setToken(accessToken);
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      await fetchUser(accessToken);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Login failed";
      throw new Error(errorMessage);
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      await axios.post(`${API_URL}/users/register/`, {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
    } catch (error: any) {
      let errorMessage = "Signup failed";
      const errorData = error.response?.data;
      if (typeof errorData === "object") {
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0] as string;
        } else if (typeof firstError === "string") {
          errorMessage = firstError;
        }
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshToken: refreshTokenFunc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
