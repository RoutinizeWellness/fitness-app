'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('test@routinize.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(`🧪 SIMPLE LOGIN: ${message}`);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🔐 Iniciando proceso de login con API route...');

    try {
      addLog(`📧 Email: ${email}`);
      addLog('🌐 Llamando a /api/auth/login...');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        addLog(`❌ Error en login: ${result.error}`);
        toast({
          title: 'Error de login',
          description: result.error,
          variant: 'destructive'
        });
        return;
      }

      addLog('✅ Login exitoso via API!');
      addLog(`👤 Usuario ID: ${result.user?.id}`);
      addLog(`🍪 Sesión establecida: ${result.session ? 'SÍ' : 'NO'}`);

      if (result.session) {
        addLog(`⏰ Sesión expira: ${new Date(result.session.expires_at * 1000).toISOString()}`);
        addLog(`🔑 Access token: ${result.session.access_token}`);

        // Verificar cookies después del login
        setTimeout(() => {
          const cookies = document.cookie.split(';').map(c => c.trim());
          const supabaseCookies = cookies.filter(c => c.includes('sb-'));
          addLog(`🍪 Cookies de Supabase encontradas: ${supabaseCookies.length}`);
          supabaseCookies.forEach(cookie => {
            addLog(`🍪 ${cookie.split('=')[0]}`);
          });

          if (supabaseCookies.length > 0) {
            addLog('✅ Cookies establecidas correctamente');
            addLog('🔄 Redirigiendo al dashboard...');

            toast({
              title: 'Login exitoso',
              description: 'Redirigiendo al dashboard...',
            });

            // Redirección con recarga de página para asegurar que las cookies se lean
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1000);
          } else {
            addLog('❌ No se establecieron cookies de Supabase');
            toast({
              title: 'Error',
              description: 'Las cookies de sesión no se establecieron correctamente',
              variant: 'destructive'
            });
          }
        }, 500);
      } else {
        addLog('❌ No se recibió sesión en la respuesta');
        toast({
          title: 'Error',
          description: 'No se pudo establecer la sesión',
          variant: 'destructive'
        });
      }

    } catch (error) {
      addLog(`💥 Error inesperado: ${error}`);
      console.error('Error:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error durante el login',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const checkSession = async () => {
    addLog('🔍 Verificando sesión actual...');

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      addLog(`❌ Error al obtener sesión: ${error.message}`);
    } else if (session) {
      addLog(`✅ Sesión encontrada: ${session.user.id}`);
      addLog(`⏰ Expira: ${new Date(session.expires_at * 1000).toISOString()}`);
    } else {
      addLog('❌ No hay sesión activa');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Login */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Login Simple (Via API Route)</CardTitle>
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
                onClick={checkSession}
                variant="outline"
                className="w-full"
              >
                🔍 Verificar Sesión Actual
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Nota:</strong> Este login usa directamente el cliente de Supabase sin contexto.</p>
              <p>Debería establecer las cookies correctamente.</p>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📋 Logs de Login</CardTitle>
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
            <CardTitle>📝 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Este es un login simplificado que usa directamente el cliente de Supabase</li>
              <li>Debería establecer las cookies de sesión correctamente</li>
              <li>Si funciona, el problema está en el contexto de autenticación</li>
              <li>Si no funciona, el problema está en la configuración del cliente de Supabase</li>
              <li>Observa los logs para ver exactamente qué está pasando</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
