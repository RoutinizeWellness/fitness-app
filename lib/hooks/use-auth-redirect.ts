import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  onRedirect?: (url: string) => void;
}

/**
 * Hook personalizado para manejar redirecciones basadas en el estado de autenticación
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const {
    redirectTo = '/dashboard',
    requireAuth = false,
    requireNoAuth = false,
    onRedirect
  } = options;

  const { user, session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // No hacer nada mientras se está cargando
    if (isLoading) {
      console.log('🔄 useAuthRedirect: Esperando carga de autenticación...');
      return;
    }

    const isAuthenticated = !!(user && session);
    console.log('🔍 useAuthRedirect: Estado de autenticación:', {
      isAuthenticated,
      hasUser: !!user,
      hasSession: !!session,
      requireAuth,
      requireNoAuth
    });

    // Si requiere autenticación y no está autenticado, redirigir a login
    if (requireAuth && !isAuthenticated) {
      console.log('🔐 useAuthRedirect: Requiere autenticación, redirigiendo a login');
      const currentPath = window.location.pathname;
      const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
      
      if (onRedirect) {
        onRedirect(loginUrl);
      }
      
      router.push(loginUrl);
      return;
    }

    // Si requiere NO estar autenticado y está autenticado, redirigir
    if (requireNoAuth && isAuthenticated) {
      console.log('🚀 useAuthRedirect: Usuario autenticado, redirigiendo a:', redirectTo);
      
      if (onRedirect) {
        onRedirect(redirectTo);
      }
      
      router.push(redirectTo);
      return;
    }

    console.log('✅ useAuthRedirect: No se requiere redirección');
  }, [user, session, isLoading, requireAuth, requireNoAuth, redirectTo, router, onRedirect]);

  return {
    isAuthenticated: !!(user && session),
    isLoading,
    user,
    session
  };
}

/**
 * Hook específico para páginas que requieren autenticación
 */
export function useRequireAuth(redirectTo?: string) {
  return useAuthRedirect({
    requireAuth: true,
    redirectTo
  });
}

/**
 * Hook específico para páginas de autenticación (login, register)
 */
export function useRequireNoAuth(redirectTo?: string) {
  return useAuthRedirect({
    requireNoAuth: true,
    redirectTo
  });
}

/**
 * Hook para manejar redirección después de login exitoso
 */
export function usePostLoginRedirect() {
  const router = useRouter();

  const handlePostLoginRedirect = (returnUrl?: string) => {
    // Obtener URL de retorno de diferentes fuentes
    const finalReturnUrl = returnUrl || 
                          (typeof window !== 'undefined' ? localStorage.getItem('login_return_url') : null) ||
                          (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('returnUrl') : null) ||
                          '/dashboard';

    console.log('🔄 handlePostLoginRedirect: Redirigiendo a:', finalReturnUrl);

    // Limpiar URL de retorno almacenada
    if (typeof window !== 'undefined') {
      localStorage.removeItem('login_return_url');
      localStorage.setItem('post_login_redirect', finalReturnUrl);
      localStorage.setItem('post_login_redirect_time', new Date().toISOString());
    }

    // Ejecutar redirección
    router.push(finalReturnUrl);
  };

  return { handlePostLoginRedirect };
}
