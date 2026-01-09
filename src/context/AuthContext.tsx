import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, setCurrentUser, saveUser, getUserByEmail, generateId } from '../utils/storage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Hardcoded credentials for testing
    const TEST_CREDENTIALS = {
      'test@test.com': { password: 'test123', name: 'Usuario de Prueba' },
      'demo@demo.com': { password: 'demo123', name: 'Demo User' },
    };

    // Check hardcoded credentials first
    if (TEST_CREDENTIALS[email as keyof typeof TEST_CREDENTIALS]) {
      const creds = TEST_CREDENTIALS[email as keyof typeof TEST_CREDENTIALS];
      if (password === creds.password) {
        let user = getUserByEmail(email);
        if (!user) {
          // Create user if doesn't exist
          user = {
            id: generateId(),
            email,
            name: creds.name,
            createdAt: new Date().toISOString(),
          };
          saveUser(user);
        }
        setCurrentUser(user);
        setAuthState({ user, isAuthenticated: true });
        return { success: true };
      } else {
        return { success: false, error: 'Contraseña incorrecta' };
      }
    }

    // Regular authentication
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // For MVP, we'll just check if user exists
    // In production, verify password hash
    setCurrentUser(user);
    setAuthState({ user, isAuthenticated: true });
    return { success: true };
  };

  const register = async (email: string, _password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' };
    }

    const newUser: User = {
      id: generateId(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setCurrentUser(newUser);
    setAuthState({ user: newUser, isAuthenticated: true });
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
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

