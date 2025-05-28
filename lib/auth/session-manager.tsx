'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { toast } from '@/components/ui/use-toast';

/**
 * Componente que gestiona la sesión de autenticación
 * Se encarga de verificar y refrescar la sesión periódicamente
 */
export function SessionManager() {
  const router = useRouter();
  const { session, isSessionExpiring, refreshSession } = useAuth();

  /**
   * Verifica si la sesión está activa y la refresca si es necesario
   */
  const verifySession = useCallback(async () => {
    try {
      console.log('Verificando sesión...');

      // Si no hay sesión, no hay nada que verificar
      if (!session) {
        console.log('No hay sesión activa');
        return;
      }

      // Si la sesión está por expirar, refrescarla
      if (isSessionExpiring()) {
        console.log('Sesión por expirar, refrescando...');
        
        const success = await refreshSession();
        
        if (success) {
          console.log('Sesión refrescada correctamente');
        } else {
          console.error('Error al refrescar sesión');
          
          // Mostrar mensaje solo si la sesión está muy cerca de expirar
          const expiresAt = session.expires_at || 0;
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = expiresAt - now;
          
          if (timeUntilExpiry < 5 * 60) { // 5 minutos
            toast({
              title: 'Sesión a punto de expirar',
              description: 'Tu sesión está a punto de expirar. Por favor, vuelve a iniciar sesión.',
              variant: 'destructive'
            });
          }
        }
      } else {
        // Calcular tiempo hasta expiración
        const expiresAt = session.expires_at || 0;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        console.log(`Sesión válida, expira en ${Math.floor(timeUntilExpiry / 60)} minutos y ${timeUntilExpiry % 60} segundos`);
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    }
  }, [session, isSessionExpiring, refreshSession, toast]);

  // Verificar la sesión periódicamente
  useEffect(() => {
    // Verificar la sesión al montar el componente
    verifySession();
    
    // Configurar intervalo para verificar la sesión cada 5 minutos
    const intervalId = setInterval(() => {
      verifySession();
    }, 5 * 60 * 1000);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [verifySession]);

  // Este componente no renderiza nada visible
  return null;
}
