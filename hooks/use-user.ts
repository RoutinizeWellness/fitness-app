import { useAuth } from '@/lib/auth/auth-context'

/**
 * @deprecated Use useAuth from @/lib/auth/auth-context instead
 * This hook is deprecated and redirects to the unified authentication system
 */
export function useUser() {
  console.warn('useUser hook is deprecated. Use useAuth from @/lib/auth/auth-context instead');

  // Redirect to the unified authentication system
  const { user, isLoading } = useAuth();

  return {
    user,
    isLoading,
    error: null // The unified system handles errors internally
  };
}
