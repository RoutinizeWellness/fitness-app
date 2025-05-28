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
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession) {
          setUser(initialSession.user);
          setSession(initialSession);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
