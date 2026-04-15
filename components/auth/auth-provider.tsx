"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { User, Role } from "@/lib/types";
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
} from "@/lib/auth-store";
import { generateId } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (name: string, email: string, role: Role) => void;
  logout: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  canEdit: false,
  canDelete: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback((name: string, email: string, role: Role) => {
    const newUser: User = {
      id: generateId(),
      name,
      email,
      role,
    };
    setCurrentUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
  }, []);

  const canEdit = user?.role === "admin" || user?.role === "editor";
  const canDelete = user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, canEdit, canDelete, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
