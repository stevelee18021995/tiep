"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LoginData, RegisterData, User } from '@/types';

// Auth Context Type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Cookie utilities
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();

  // Computed values
  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.is_admin || false;

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Initialize auth from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = getCookie('auth_token');
        const savedUserData = getCookie('user_data');

        if (savedToken) {
          setToken(savedToken);
          // Load user from cookie
          if (savedUserData) {
            try {
              const userData = JSON.parse(savedUserData);
              if (userData && userData.id) {
                setUser(userData);
              }
            } catch (error) {
              console.error('Failed to parse user data from cookie:', error);
              deleteCookie('user_data');
            }
          }

          // Verify with backend
          try {
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${savedToken}` }
            });

            const backendUser = response.data.user;
            if (backendUser) {
              setUser(backendUser);
              setCookie('user_data', JSON.stringify(backendUser));
            }
          } catch {
            // Invalid token
            deleteCookie('auth_token');
            deleteCookie('user_data');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Auth initialization error
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      const { user: userData, access_token } = response.data;

      setUser(userData);
      setToken(access_token);

      if (access_token) {
        setCookie('auth_token', access_token);
      }
      if (userData) {
        setCookie('user_data', JSON.stringify(userData));
      }

      // Redirect
      router.push(userData.is_admin ? '/admin/users' : '/member/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      const { user: userData, access_token } = response.data;

      setUser(userData);
      setToken(access_token);

      if (access_token) {
        setCookie('auth_token', access_token);
      }
      if (userData) {
        setCookie('user_data', JSON.stringify(userData));
      }

      // Redirect
      router.push(userData.is_admin ? '/admin/users' : '/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Update Profile
  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      const result = await response.json();
      const updatedUser = result.user || result.data;
      setUser(updatedUser);
      setCookie('user_data', JSON.stringify(updatedUser));
    } catch (err: any) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Change Password
  const changePassword = useCallback(async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password change failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Handle logout error, e.g., show notification
      // Logout API error
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      deleteCookie('auth_token');
      deleteCookie('user_data');
      setIsLoading(false);

      window.location.href = '/login';
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isInitialized,
    login,
    register,
    updateProfile,
    changePassword,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
