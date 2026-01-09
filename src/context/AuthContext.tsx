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
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        await checkSession();
        
        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              await loadUser(session);
            } else if (event === 'SIGNED_OUT') {
              if (isMounted) {
                setAuthState({ user: null, isAuthenticated: false });
              }
            }
          }
        );
        
        subscription = authSubscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setAuthState({ user: null, isAuthenticated: false });
        setLoading(false);
        return;
      }
      
      if (session) {
        await loadUser(session);
      } else {
        setAuthState({ user: null, isAuthenticated: false });
      }
    } catch (error: any) {
      // Ignore AbortError - it's usually harmless
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.warn('Request was aborted (this is usually harmless)');
        return;
      }
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
    } catch (error: any) {
      // Ignore AbortError - it's usually harmless (component unmounted or request cancelled)
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.warn('Request was aborted (this is usually harmless)');
        return;
      }
      console.error('Error loading user:', error);
      // Don't reset auth state on error - might be temporary network issue
      // setAuthState({ user: null, isAuthenticated: false });
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
