'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api, AuthResponse } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  lastName: string | null;
  role: string;
  tenantId: string;
  tenantName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .get<User>('/auth/profile')
        .then((u) => setUser(u))
        .catch(() => {
          api.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (loginStr: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', {
      login: loginStr,
      password,
    });
    api.setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
