import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';
import { getUserById } from '../utils/storage';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadUser(session);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, isAuthenticated: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUser(session);
      } else {
        setAuthState({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAuthState({ user: null, isAuthenticated: false });
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async (session: Session | null) => {
    if (!session?.user) {
      setAuthState({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const user = await getUserById(session.user.id);
      if (user) {
        setAuthState({ user, isAuthenticated: true });
      } else {
        // If profile doesn't exist, create it
        const newUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Usuario',
          createdAt: session.user.created_at,
        };
        setAuthState({ user: newUser, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setAuthState({ user: null, isAuthenticated: false });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        await loadUser(data.session);
        return { success: true };
      }

      return { success: false, error: 'Error al iniciar sesión' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        await loadUser(data.session);
        return { success: true };
      }

      // If email confirmation is required, user will need to confirm email
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, loading }}>
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
