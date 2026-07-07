"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, setToken, clearToken, getToken } from "@/lib/api";

interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {},
});

const STORAGE_KEY = "zoro_auth_user";
const REFRESH_KEY = "zoro_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      const token  = getToken();
      if (stored && token) {
        try {
          setIsAuthenticated(true);
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && pathname !== "/login") router.replace("/login");
    if (isAuthenticated && pathname === "/login") router.replace("/");
  }, [hydrated, isAuthenticated, pathname, router]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, password);
      setToken(res.access);
      if (typeof window !== "undefined") localStorage.setItem(REFRESH_KEY, res.refresh);
      const userData: AuthUser = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar: res.user.avatar || (res.user.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase() ?? "AD"),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (refresh) {
        authApi.logout(refresh).catch(() => {});
        localStorage.removeItem(REFRESH_KEY);
      }
      localStorage.removeItem(STORAGE_KEY);
      clearToken();
    }
    setIsAuthenticated(false);
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
