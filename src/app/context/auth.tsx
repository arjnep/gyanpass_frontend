// context/AuthContext.tsx
'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For routing
import { registerUser, loginUser } from '../api/auth'; // Adjust imports as needed

interface AuthContextType {
  user: any; // Replace with a proper user type
  isAuthenticated: boolean;
  login: (token: string, user: any) => Promise<void>;
  register: (token: string, user: any) => Promise<void>;
  token: string | null;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null); // Replace 'any' with a proper user type
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken); // Set token state
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (token: string, user: any) => {
    localStorage.setItem('token', token); // Store JWT
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token); // Update token state
    setUser(user);
    setIsAuthenticated(true);
    // router.push('/dashboard');
  };

  const register = async (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token); // Update token state
    setUser(user);
    setIsAuthenticated(true);
    // router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); // Clear token state
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth');
  };

  const validateToken = async (): Promise<boolean> => {
    if (!token) {
      return false
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error.type == "AUTHORIZATION") 
        {
          return false
        }
      }
  
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Token validation failed', error);
      return false;
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
