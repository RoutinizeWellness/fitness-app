'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { initializeBeginnerProfile } from '@/lib/services/beginner-profile-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestOnboardingPage() {
  console.log('🎯 TestOnboardingPage - Renderizando página de test');
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(`🧪 TEST ONBOARDING: ${message}`);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        addLog('🔄 Iniciando proceso de onboarding de prueba...');

        addLog('🔍 Obteniendo usuario actual...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          addLog(`❌ Error al obtener usuario: ${userError.message}`);
          setError(`Error de autenticación: ${userError.message}`);
          return;
        }

        if (user) {
          addLog(`✅ Usuario obtenido: ${user.id}`);
          setUserId(user.id);

          addLog('🔄 Inicializando perfil de principiante...');
          const profile = await initializeBeginnerProfile(user.id);

          if (profile) {
            addLog('✅ Perfil inicializado correctamente');
            addLog(`📋 Perfil: ${JSON.stringify(profile, null, 2)}`);
          } else {
            addLog('❌ No se pudo inicializar el perfil');
            setError('No se pudo inicializar el perfil de principiante');
          }
        } else {
          addLog('❌ No hay usuario autenticado');
          setError('No hay usuario autenticado');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        addLog(`💥 Error inesperado: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const clearLogs = () => {
    setLogs([]);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToRealOnboarding = () => {
    router.push('/onboarding/beginner');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Estado */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test de Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Estado:</strong> {loading ? 'Cargando...' : 'Completado'}</p>
              <p><strong>Usuario ID:</strong> {userId || 'No disponible'}</p>
              <p><strong>Error:</strong> {error || 'Ninguno'}</p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={clearLogs} 
                variant="outline"
                className="w-full"
              >
                🗑️ Limpiar Logs
              </Button>
              <Button 
                onClick={goToDashboard} 
                variant="default"
                className="w-full"
                disabled={!userId}
              >
                🏠 Ir al Dashboard
              </Button>
              <Button 
                onClick={goToRealOnboarding} 
                variant="secondary"
                className="w-full"
                disabled={!userId}
              >
                🎯 Ir al Onboarding Real
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Propósito:</strong> Probar la inicialización del perfil de principiante.</p>
              <p><strong>Resultado esperado:</strong> Perfil creado exitosamente sin errores.</p>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Logs de Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs">
              {logs.length === 0 ? (
                <p>No hay logs aún...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Instrucciones */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>📝 Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Esta página prueba la funcionalidad de inicialización del perfil de principiante</li>
              <li>Debería obtener el usuario autenticado y crear/obtener su perfil</li>
              <li>Si funciona correctamente, no debería haber errores en los logs</li>
              <li>Si hay errores, aparecerán en los logs con detalles específicos</li>
              <li>Una vez que funcione, puedes ir al onboarding real o al dashboard</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
