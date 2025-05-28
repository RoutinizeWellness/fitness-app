'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { user, session, profile, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Inicio de sesión exitoso'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente'
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const testProfileAPI = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes estar autenticado para probar la API',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/profile/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
        credentials: 'include'
      });

      const result = await response.json();
      
      toast({
        title: response.ok ? 'API Exitosa' : 'API Error',
        description: JSON.stringify(result, null, 2),
        variant: response.ok ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Error de red',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">🧪 Prueba de Autenticación</h1>
      
      <div className="space-y-6">
        {/* Estado de autenticación */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Usuario:</strong> {user ? `${user.email} (${user.id})` : 'No autenticado'}</p>
            <p><strong>Sesión:</strong> {session ? 'Activa' : 'Inactiva'}</p>
            <p><strong>Perfil:</strong> {profile ? `${profile.full_name}` : 'No cargado'}</p>
          </CardContent>
        </Card>

        {/* Formulario de login */}
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
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
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Acciones para usuario autenticado */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testProfileAPI} className="w-full">
                🧪 Probar API de Perfil
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Información de depuración */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Depuración</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({
                user: user ? { id: user.id, email: user.email } : null,
                session: session ? { expires_at: session.expires_at } : null,
                profile: profile ? { id: profile.id, full_name: profile.full_name } : null
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
