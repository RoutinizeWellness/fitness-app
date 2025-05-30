'use client';

import { useState, useEffect } from 'react';
import { SafeClientButton as Button } from '@/components/ui/safe-client-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';

// ✅ SECURE: Initialize Supabase client for secure authentication
const supabase = createClient();

/**
 * Componente de diagnóstico para la autenticación
 * Solo se muestra en entorno de desarrollo
 */
export function AuthDiagnostics() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Cargar datos de sesión, usuario y localStorage
  const loadData = async () => {
    setIsLoading(true);

    try {
      console.log('🔐 Auth Diagnostics: Verificando usuario de forma segura...');

      // ✅ SECURE: Obtener usuario verificado por el servidor
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Error al obtener usuario verificado:', userError);
        setSessionData({ error: userError.message });
        setUserData(null);
      } else if (user) {
        console.log('✅ Usuario verificado por el servidor:', user.id);
        setUserData(user);

        // Obtener sesión local solo para información adicional
        const { data: sessionData } = await supabase.auth.getSession();
        setSessionData(sessionData.session);
      } else {
        console.log('ℹ️ No hay usuario autenticado');
        setUserData(null);
        setSessionData(null);
      }

      // Obtener datos de localStorage
      if (typeof window !== 'undefined') {
        const storageData: Record<string, string> = {};

        // Filtrar claves relacionadas con autenticación
        const authKeys = [
          'session_expiry',
          'session_refreshed',
          'session_refresh_time',
          'login_success',
          'login_time',
          'auth_return_url',
          'session_auto_refresh',
          'session_persistent',
          'session_persistence_updated',
          'session_last_refresh',
          'session_refresh_interval_id',
          'supabase.auth.token',
          'auth_event',
          'auth_event_time',
          'login_attempt',
          'login_return_url',
          'token_debug_info',
          'user_id'
        ];

        // Recorrer localStorage y obtener valores de claves relacionadas con autenticación
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);

          if (key && authKeys.some(authKey => key.includes(authKey))) {
            try {
              storageData[key] = localStorage.getItem(key) || '';
            } catch (e) {
              storageData[key] = 'Error al leer valor';
            }
          }
        }

        setLocalStorageData(storageData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error al cargar datos',
        description: 'Ocurrió un error al cargar los datos de diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar sesión usando el contexto de autenticación
  const { refreshSession } = useAuth();

  const handleRefreshSession = async () => {
    setIsRefreshing(true);

    try {
      console.log('🔄 Auth Diagnostics: Refrescando sesión...');
      const success = await refreshSession();

      if (success) {
        console.log('✅ Auth Diagnostics: Sesión refrescada exitosamente');
        toast({
          title: 'Sesión refrescada',
          description: 'La sesión se ha refrescado correctamente.',
          variant: 'default'
        });

        // Recargar datos
        await loadData();
      } else {
        console.error('❌ Auth Diagnostics: Error al refrescar sesión');
        toast({
          title: 'Error al refrescar sesión',
          description: 'No se pudo refrescar la sesión.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('💥 Auth Diagnostics: Error inesperado al refrescar sesión:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error inesperado al refrescar la sesión.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Limpiar datos de sesión
  const handleClearSessionData = async () => {
    setIsClearing(true);

    try {
      console.log('🧹 Auth Diagnostics: Limpiando datos de sesión...');

      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        const authKeys = [
          'session_expiry',
          'session_refreshed',
          'session_refresh_time',
          'login_success',
          'login_time',
          'auth_return_url',
          'session_auto_refresh',
          'session_persistent',
          'session_persistence_updated',
          'session_last_refresh',
          'session_refresh_interval_id',
          'supabase.auth.token',
          'auth_event',
          'auth_event_time',
          'login_attempt',
          'login_return_url',
          'token_debug_info',
          'user_id',
          'auth_success',
          'auth_success_time',
          'auth_user_id',
          'supabase_session_backup'
        ];

        authKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        // También limpiar cualquier clave que contenga 'supabase' o 'auth'
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            localStorage.removeItem(key);
          }
        }
      }

      // Cerrar sesión en Supabase
      await supabase.auth.signOut();

      console.log('✅ Auth Diagnostics: Datos limpiados exitosamente');
      toast({
        title: 'Datos limpiados',
        description: 'Los datos de sesión se han limpiado correctamente.',
        variant: 'default'
      });

      // Recargar datos
      await loadData();
    } catch (error) {
      console.error('💥 Auth Diagnostics: Error al limpiar datos de sesión:', error);
      toast({
        title: 'Error al limpiar datos',
        description: 'Ocurrió un error al limpiar los datos de sesión.',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Formatear fecha de expiración
  const formatExpiryDate = (expiresAt: number) => {
    if (!expiresAt) return 'No disponible';

    const date = new Date(expiresAt * 1000);
    return date.toLocaleString();
  };

  // Calcular tiempo restante hasta expiración
  const calculateTimeRemaining = (expiresAt: number) => {
    if (!expiresAt) return 'No disponible';

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry <= 0) return 'Expirada';

    const minutes = Math.floor(timeUntilExpiry / 60);
    const seconds = timeUntilExpiry % 60;

    return `${minutes}m ${seconds}s`;
  };

  // Si no estamos en desarrollo, no mostrar nada
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isExpanded ? 'w-[600px]' : 'w-[200px]'}`}>
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="p-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Auth Diagnostics</span>
            <span className="text-xs text-gray-500">{isExpanded ? '▼' : '▶'}</span>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <>
            <Tabs defaultValue="session">
              <TabsList className="w-full">
                <TabsTrigger value="session" className="flex-1">Sesión</TabsTrigger>
                <TabsTrigger value="user" className="flex-1">Usuario</TabsTrigger>
                <TabsTrigger value="storage" className="flex-1">LocalStorage</TabsTrigger>
              </TabsList>

              <TabsContent value="session" className="p-3">
                {isLoading ? (
                  <div className="text-center py-4">Cargando datos de sesión...</div>
                ) : sessionData ? (
                  <div className="text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="font-medium">ID:</div>
                      <div className="truncate">{sessionData.id || 'No disponible'}</div>

                      <div className="font-medium">Expira:</div>
                      <div>{formatExpiryDate(sessionData.expires_at)}</div>

                      <div className="font-medium">Tiempo restante:</div>
                      <div>{calculateTimeRemaining(sessionData.expires_at)}</div>

                      <div className="font-medium">Refresh Token:</div>
                      <div>{sessionData.refresh_token ? '✓ Disponible' : '✗ No disponible'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-red-500">No hay sesión activa</div>
                )}
              </TabsContent>

              <TabsContent value="user" className="p-3">
                {isLoading ? (
                  <div className="text-center py-4">Cargando datos de usuario...</div>
                ) : userData ? (
                  <div className="text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="font-medium">ID:</div>
                      <div className="truncate">{userData.id || 'No disponible'}</div>

                      <div className="font-medium">Email:</div>
                      <div className="truncate">{userData.email || 'No disponible'}</div>

                      <div className="font-medium">Confirmado:</div>
                      <div>{userData.email_confirmed_at ? '✓ Sí' : '✗ No'}</div>

                      <div className="font-medium">Último inicio:</div>
                      <div>{userData.last_sign_in_at ? new Date(userData.last_sign_in_at).toLocaleString() : 'No disponible'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-red-500">No hay usuario activo</div>
                )}
              </TabsContent>

              <TabsContent value="storage" className="p-3">
                {isLoading ? (
                  <div className="text-center py-4">Cargando datos de localStorage...</div>
                ) : Object.keys(localStorageData).length > 0 ? (
                  <div className="text-xs space-y-2 max-h-[200px] overflow-y-auto">
                    {Object.entries(localStorageData).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 pb-1">
                        <div className="font-medium">{key}:</div>
                        <div className="truncate text-gray-600">{value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No hay datos de autenticación en localStorage</div>
                )}
              </TabsContent>
            </Tabs>

            <CardFooter className="p-3 flex justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshSession}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refrescando...' : 'Refrescar Sesión'}
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearSessionData}
                disabled={isClearing}
              >
                {isClearing ? 'Limpiando...' : 'Limpiar Datos'}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={loadData}
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Recargar'}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
