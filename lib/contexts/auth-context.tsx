// lib/contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Assuming your supabase client is correctly aliased or located at 'lib/supabase-client' (see below for file content)
import { supabase } from '@/lib/supabase-client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  // You can add other auth-related functions here if needed in the future
  // e.g., signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  // signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          // Handle specific auth errors
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('refresh_token_not_found')) {
            console.warn('Token de sesión expirado, limpiando sesión local');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
          } else {
            console.error('Error de autenticación:', error);
          }
        } else if (initialSession) {
          setUser(initialSession.user);
          setSession(initialSession);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Clear any corrupted session data
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_IN') {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
