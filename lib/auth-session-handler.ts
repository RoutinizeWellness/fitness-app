import { supabase } from "./supabase-unified";
import { toast } from "@/components/ui/use-toast";

/**
 * Error class for authentication session errors
 */
export class AuthSessionError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AuthSessionError';
  }
}

/**
 * Checks if an error is an AuthSessionMissingError
 * @param error The error to check
 * @returns True if the error is an AuthSessionMissingError
 */
export function isAuthSessionMissingError(error: any): boolean {
  return (
    error?.name === 'AuthSessionMissingError' ||
    error?.message?.includes('Auth session missing') ||
    error?.message?.includes('JWT expired') ||
    error?.code === 'PGRST301'
  );
}

/**
 * Handles an AuthSessionMissingError by clearing tokens and redirecting to login
 * @param error The error to handle
 * @param redirectToLogin Whether to redirect to login
 */
export function handleAuthSessionMissingError(error: any, redirectToLogin: boolean = true): void {
  console.error('Auth session missing error:', error);

  // Clear any stale tokens from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token');

    // Show a toast notification
    toast({
      title: 'Sesión expirada',
      description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
      variant: 'destructive',
    });

    // Redirect to login if requested and not already on login page
    if (redirectToLogin && !window.location.pathname.startsWith('/auth/login')) {
      window.location.href = '/auth/login?reason=session_expired';
    }
  }
}

/**
 * Wraps a function that uses Supabase auth to handle AuthSessionMissingError
 * @param fn The function to wrap
 * @param redirectOnError Whether to redirect on error
 * @returns The wrapped function
 */
export function withAuthSessionHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  redirectOnError: boolean = true
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (isAuthSessionMissingError(error)) {
        handleAuthSessionMissingError(error, redirectOnError);
        throw new AuthSessionError('Session expired', error);
      }
      throw error;
    }
  };
}

/**
 * Initializes auth session handling for the application
 * This should be called once at app startup
 */
export function initAuthSessionHandling(): void {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }

  // Add global error handler for uncaught auth errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (isAuthSessionMissingError(error)) {
      handleAuthSessionMissingError(error);
      return true; // Prevent default error handling
    }

    // Call original handler
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (isAuthSessionMissingError(event.reason)) {
      handleAuthSessionMissingError(event.reason);
      event.preventDefault(); // Prevent default error handling
    }
  });

  console.log('Auth session error handling initialized');
}

/**
 * Checks if the current auth session is valid
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function isAuthSessionValid(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking auth session:', error);
      return false;
    }

    return !!data.session;
  } catch (error) {
    console.error('Exception checking auth session:', error);
    return false;
  }
}
