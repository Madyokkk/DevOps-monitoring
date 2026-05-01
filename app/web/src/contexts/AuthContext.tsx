'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetcher } from '@/lib/api';

type User = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetcher.post<{ user: User; access_token: string }>('/api/auth/login', {
      email,
      password,
    });
    setUser(res.user);
    setToken(res.access_token);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => {
    const res = await fetcher.post<{ user: User; access_token: string }>('/api/auth/register', data);
    setUser(res.user);
    setToken(res.access_token);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
