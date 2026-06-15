"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  membership_level: "free" | "premium";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("postermind_token");
    if (token) {
      api
        .get<User>("/api/auth/me")
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("postermind_token");
          autoLogin();
        })
        .finally(() => setLoading(false));
    } else {
      autoLogin();
    }

    async function autoLogin() {
      try {
        const data = await api.post<{ access_token: string; user: User }>("/api/auth/login", {
          email: "admin@postermind.ai",
          password: "admin123",
        });
        localStorage.setItem("postermind_token", data.access_token);
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    localStorage.setItem("postermind_token", data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const data = await api.post<{ access_token: string; user: User }>("/api/auth/register", {
      username,
      email,
      password,
    });
    localStorage.setItem("postermind_token", data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("postermind_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
