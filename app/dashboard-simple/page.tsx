'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SimpleDashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Verificación de autenticación simplificada
  useEffect(() => {
    console.log('🏠 Simple Dashboard: Verificando autenticación...');
    console.log('🏠 Simple Dashboard: isLoading:', isLoading);
    console.log('🏠 Simple Dashboard: user:', user);
    
    if (!isLoading && !user) {
      console.log('🏠 Simple Dashboard: Usuario no autenticado, redirigiendo a login');
      router.push('/auth/login?returnUrl=/dashboard-simple');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      console.log('🏠 Simple Dashboard: Cerrando sesión...');
      await signOut();
    } catch (error) {
      console.error('🏠 Simple Dashboard: Error al cerrar sesión:', error);
    }
  };

  const handleGoToMainDashboard = () => {
    console.log('🏠 Simple Dashboard: Navegando al dashboard principal...');
    router.push('/dashboard');
  };

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Simplificado</h1>
            <p className="text-gray-600">¡Bienvenido de vuelta, {user.email}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        {/* Estado de autenticación */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Usuario:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
              <div>
                <p><strong>Estado de carga:</strong> {isLoading ? 'Cargando' : 'Completado'}</p>
                <p><strong>Autenticado:</strong> {user ? 'Sí' : 'No'}</p>
                <p><strong>URL actual:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleGoToMainDashboard} className="w-full">
                Ir al Dashboard Principal
              </Button>
              <Button onClick={() => router.push('/training')} variant="outline" className="w-full">
                Ir a Entrenamiento
              </Button>
              <Button onClick={() => router.push('/activity')} variant="outline" className="w-full">
                Ir a Actividad
              </Button>
              <Button onClick={() => router.push('/admin')} variant="outline" className="w-full">
                Ir a Admin (si eres admin)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información de debug */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify({
                  user: user ? {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at
                  } : null,
                  isLoading,
                  timestamp: new Date().toISOString(),
                  userAgent: typeof window !== 'undefined' ? navigator.userAgent.substring(0, 100) + '...' : 'N/A'
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de éxito */}
        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            ✅ Dashboard Compilado y Cargado Exitosamente
          </h2>
          <p className="text-green-600">
            El dashboard se ha compilado correctamente y está funcionando. 
            La autenticación está funcionando y el usuario está correctamente autenticado.
          </p>
        </div>
      </div>
    </div>
  );
}
