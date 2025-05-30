'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { usePostLoginRedirect } from '@/lib/hooks/use-auth-redirect';
import { SafeClientButton as Button } from '@/components/ui/safe-client-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const [email, setEmail] = useState('test@routinize.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [authLogs, setAuthLogs] = useState<string[]>([]);
  const { signIn, user, session, isLoading: authLoading } = useAuth();
  const { handlePostLoginRedirect } = usePostLoginRedirect();
  const router = useRouter();

  // Función para agregar logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAuthLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🧪 TEST LOGIN: ${message}`);
  };

  // Monitorear cambios en el estado de autenticación
  useEffect(() => {
    addLog(`Auth state - User: ${user?.id || 'null'}, Session: ${session ? 'exists' : 'null'}, Loading: ${authLoading}`);
  }, [user, session, authLoading]);

  const handleLogin = async () => {
    setIsLoading(true);
    addLog('🔐 Iniciando proceso de login...');

    try {
      addLog(`📧 Email: ${email}`);
      addLog('🔑 Llamando a signIn...');

      const { data, error } = await signIn(email, password);

      if (error) {
        addLog(`❌ Error en signIn: ${error.message}`);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      addLog('✅ signIn completado exitosamente');
      addLog(`👤 Data user: ${data?.user?.id || 'null'}`);
      addLog(`🍪 Data session: ${data?.session ? 'exists' : 'null'}`);

      if (data?.session) {
        addLog(`🕐 Session expires: ${new Date(data.session.expires_at * 1000).toISOString()}`);
        addLog('⏳ Esperando 2 segundos para que el contexto se actualice...');

        // Esperar un poco para que el contexto se actualice
        setTimeout(() => {
          addLog('🔄 Verificando estado del contexto después del login...');
          addLog(`👤 Context user: ${user?.id || 'null'}`);
          addLog(`🍪 Context session: ${session ? 'exists' : 'null'}`);

          if (user && session) {
            addLog('✅ Contexto actualizado correctamente, ejecutando redirección...');
            handlePostLoginRedirect('/dashboard');
          } else {
            addLog('⚠️ Contexto no actualizado, intentando redirección manual...');
            router.push('/dashboard');
          }
        }, 2000);
      } else {
        addLog('❌ No se recibió sesión en la respuesta');
      }

    } catch (error) {
      addLog(`💥 Error inesperado: ${error}`);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setAuthLogs([]);
  };

  const testRedirect = () => {
    addLog('🧪 Probando redirección manual...');
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de Login */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@routinize.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
              <Button 
                onClick={testRedirect} 
                variant="outline"
                className="w-full"
              >
                🧪 Test Redirect Manual
              </Button>
            </div>
            
            {/* Estado actual */}
            <div className="p-3 bg-gray-100 rounded text-sm">
              <p><strong>Estado Actual:</strong></p>
              <p>User: {user?.id || 'null'}</p>
              <p>Session: {session ? 'exists' : 'null'}</p>
              <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
              <p>Login Loading: {isLoading ? 'true' : 'false'}</p>
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
              {authLogs.length === 0 ? (
                <p>No hay logs aún...</p>
              ) : (
                authLogs.map((log, index) => (
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
            <CardTitle>📝 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Primero, ve a <a href="/test-register" className="text-blue-600 underline">/test-register</a> para crear un usuario si no lo has hecho</li>
              <li>Usa las credenciales: <code>test@routinize.com</code> / <code>password123</code></li>
              <li>Haz clic en "Iniciar Sesión" y observa los logs</li>
              <li>Verifica si la redirección automática funciona</li>
              <li>Si no funciona, prueba el "Test Redirect Manual"</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
