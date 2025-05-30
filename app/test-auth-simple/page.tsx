'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Cliente de Supabase simplificado sin SSR
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestAuthSimplePage() {
  const [email, setEmail] = useState('admin@routinize.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🧪 SIMPLE AUTH: ${message}`);
  };

  // Verificar sesión inicial de forma SEGURA
  useEffect(() => {
    const checkSession = async () => {
      try {
        addLog('🔐 Verificando usuario de forma segura...');

        // ✅ SECURE: Usar getUser() para verificar con el servidor
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          addLog(`❌ Error al obtener usuario verificado: ${error.message}`);
          setUser(null);
          setSession(null);
        } else if (user) {
          addLog(`✅ Usuario verificado por el servidor: ${user.email}`);
          setUser(user);

          // Obtener sesión local solo para información adicional
          const { data: sessionData } = await supabase.auth.getSession();
          setSession(sessionData.session);
          addLog('ℹ️ Sesión local obtenida para información adicional');
        } else {
          addLog('ℹ️ No hay usuario autenticado');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        addLog(`💥 Error inesperado: ${error}`);
        setUser(null);
        setSession(null);
      }
    };

    checkSession();

    // Listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        addLog(`🔔 Auth event: ${event}`);

        // ✅ SECURE: Verificar usuario con el servidor después de cada evento
        try {
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error || !user) {
            addLog(`❌ Error al verificar usuario después del evento: ${error?.message || 'Usuario no encontrado'}`);
            setUser(null);
            setSession(null);
          } else {
            addLog(`✅ Usuario verificado después del evento: ${user.email}`);
            setUser(user);
            setSession(session);
          }
        } catch (verifyError) {
          addLog(`💥 Error al verificar usuario: ${verifyError}`);
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    addLog('🔐 Iniciando login...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addLog(`❌ Error de login: ${error.message}`);
        return;
      }

      addLog('✅ Login exitoso');
      addLog(`👤 Usuario: ${data.user?.email}`);
      addLog(`🍪 Sesión: ${data.session ? 'creada' : 'no creada'}`);

      if (data.session) {
        addLog(`🕐 Expira: ${new Date(data.session.expires_at * 1000).toISOString()}`);
        
        // Almacenar en localStorage como respaldo
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
        localStorage.setItem('supabase_user', JSON.stringify(data.user));
        
        addLog('💾 Sesión guardada en localStorage');
        
        // Esperar un momento y luego redirigir
        setTimeout(() => {
          addLog('🔄 Redirigiendo al dashboard...');
          window.location.href = '/dashboard';
        }, 2000);
      }

    } catch (error) {
      addLog(`💥 Error inesperado: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    addLog('🚪 Cerrando sesión...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addLog(`❌ Error al cerrar sesión: ${error.message}`);
      } else {
        addLog('✅ Sesión cerrada');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('supabase_user');
      }
    } catch (error) {
      addLog(`💥 Error inesperado: ${error}`);
    }
  };

  const testDashboard = () => {
    addLog('🧪 Probando acceso directo al dashboard...');
    router.push('/dashboard');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Login */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Auth Simple (Sin SSR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado actual */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Estado Actual:</h3>
              <p><strong>Usuario:</strong> {user ? user.email : 'No autenticado'}</p>
              <p><strong>Sesión:</strong> {session ? 'Activa' : 'Inactiva'}</p>
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Sí' : 'No'}</p>
            </div>

            {!user ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email:</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@routinize.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraseña:</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                  />
                </div>

                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Login Simple'}
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={testDashboard}
                  className="w-full"
                >
                  Ir al Dashboard
                </Button>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar Sesión
                </Button>
              </div>
            )}

            {/* Información de localStorage */}
            <div className="p-3 bg-blue-50 rounded text-sm">
              <h4 className="font-medium mb-2">LocalStorage:</h4>
              <p>Session: {typeof window !== 'undefined' && localStorage.getItem('supabase_session') ? 'Existe' : 'No existe'}</p>
              <p>User: {typeof window !== 'undefined' && localStorage.getItem('supabase_user') ? 'Existe' : 'No existe'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📋 Logs de Autenticación</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Limpiar
            </Button>
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

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>📝 Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Propósito:</strong> Esta página usa un cliente de Supabase simplificado sin SSR para probar la autenticación básica.</p>
              <p><strong>Diferencias:</strong> No usa cookies, solo localStorage. Esto debería funcionar sin problemas de configuración.</p>
              <p><strong>Credenciales:</strong> admin@routinize.com / admin123</p>
              <p><strong>Siguiente paso:</strong> Si esto funciona, el problema está en la configuración de SSR/cookies.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
