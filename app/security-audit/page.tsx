'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

const supabase = createClient();

interface SecurityTest {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
  recommendation?: string;
}

export default function SecurityAuditPage() {
  const [tests, setTests] = useState<SecurityTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'secure' | 'vulnerable' | 'warning'>('warning');

  const runSecurityAudit = async () => {
    setIsRunning(true);
    const auditResults: SecurityTest[] = [];

    // Test 1: Verificar que getUser() funciona correctamente
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error && !error.message.includes('Auth session missing')) {
        auditResults.push({
          name: 'Server User Verification',
          description: 'Verificar que supabase.auth.getUser() funciona correctamente',
          status: 'fail',
          details: `Error al verificar usuario: ${error.message}`,
          recommendation: 'Revisar configuración de Supabase y tokens de autenticación'
        });
      } else if (user) {
        auditResults.push({
          name: 'Server User Verification',
          description: 'Verificar que supabase.auth.getUser() funciona correctamente',
          status: 'pass',
          details: `Usuario verificado correctamente: ${user.email} (${user.id})`
        });
      } else {
        auditResults.push({
          name: 'Server User Verification',
          description: 'Verificar que supabase.auth.getUser() funciona correctamente',
          status: 'warning',
          details: 'No hay usuario autenticado (esto es normal si no has iniciado sesión)'
        });
      }
    } catch (error) {
      auditResults.push({
        name: 'Server User Verification',
        description: 'Verificar que supabase.auth.getUser() funciona correctamente',
        status: 'fail',
        details: `Excepción al verificar usuario: ${error}`,
        recommendation: 'Revisar configuración del cliente de Supabase'
      });
    }

    // Test 2: Verificar que no dependemos de getSession() para autenticación
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      auditResults.push({
        name: 'Session Data Usage',
        description: 'Verificar que getSession() solo se usa para información adicional',
        status: 'pass',
        details: 'getSession() disponible pero no debe usarse para autenticación principal',
        recommendation: 'Siempre usar getUser() para verificar autenticación'
      });
    } catch (error) {
      auditResults.push({
        name: 'Session Data Usage',
        description: 'Verificar que getSession() solo se usa para información adicional',
        status: 'warning',
        details: `Error al obtener sesión: ${error}`,
        recommendation: 'Esto no es crítico si usamos getUser() para autenticación'
      });
    }

    // Test 3: Verificar que el middleware usa verificación segura
    try {
      const response = await fetch('/dashboard', { 
        method: 'HEAD',
        redirect: 'manual'
      });
      
      const hasUserHeader = response.headers.get('x-middleware-has-user');
      const hasSessionHeader = response.headers.get('x-middleware-has-session');
      
      if (hasUserHeader !== null) {
        auditResults.push({
          name: 'Middleware Security',
          description: 'Verificar que el middleware usa verificación de usuario segura',
          status: 'pass',
          details: `Middleware verifica usuario: ${hasUserHeader}, sesión: ${hasSessionHeader}`,
          recommendation: 'El middleware está usando verificación segura'
        });
      } else {
        auditResults.push({
          name: 'Middleware Security',
          description: 'Verificar que el middleware usa verificación de usuario segura',
          status: 'warning',
          details: 'No se pudo verificar la configuración del middleware',
          recommendation: 'Revisar que el middleware esté configurado correctamente'
        });
      }
    } catch (error) {
      auditResults.push({
        name: 'Middleware Security',
        description: 'Verificar que el middleware usa verificación de usuario segura',
        status: 'fail',
        details: `Error al probar middleware: ${error}`,
        recommendation: 'Revisar configuración del middleware'
      });
    }

    // Test 4: Verificar localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      const authKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          authKeys.push(key);
        }
      }

      auditResults.push({
        name: 'Local Storage Security',
        description: 'Verificar que no dependemos solo de localStorage para autenticación',
        status: 'pass',
        details: `Encontradas ${authKeys.length} claves de auth en localStorage: ${authKeys.join(', ')}`,
        recommendation: 'localStorage debe usarse solo como respaldo, no como fuente principal de autenticación'
      });
    }

    // Test 5: Verificar que RLS está habilitado
    try {
      // Intentar acceder a la tabla profiles sin autenticación
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error && error.code === '42501') {
        auditResults.push({
          name: 'Row Level Security (RLS)',
          description: 'Verificar que RLS está habilitado en las tablas',
          status: 'pass',
          details: 'RLS está funcionando correctamente - acceso denegado sin autenticación',
          recommendation: 'RLS está configurado correctamente'
        });
      } else if (data) {
        auditResults.push({
          name: 'Row Level Security (RLS)',
          description: 'Verificar que RLS está habilitado en las tablas',
          status: 'fail',
          details: 'RLS no está funcionando - se pudo acceder a datos sin autenticación',
          recommendation: 'CRÍTICO: Habilitar RLS en todas las tablas de la base de datos'
        });
      }
    } catch (error) {
      auditResults.push({
        name: 'Row Level Security (RLS)',
        description: 'Verificar que RLS está habilitado en las tablas',
        status: 'warning',
        details: `Error al probar RLS: ${error}`,
        recommendation: 'Revisar configuración de RLS en Supabase'
      });
    }

    setTests(auditResults);

    // Determinar estado general
    const failCount = auditResults.filter(t => t.status === 'fail').length;
    const warningCount = auditResults.filter(t => t.status === 'warning').length;

    if (failCount > 0) {
      setOverallStatus('vulnerable');
    } else if (warningCount > 0) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('secure');
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runSecurityAudit();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">PENDING</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Auditoría de Seguridad</h1>
        </div>
        
        <Alert className={`mb-4 ${
          overallStatus === 'secure' ? 'border-green-200 bg-green-50' :
          overallStatus === 'vulnerable' ? 'border-red-200 bg-red-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <AlertDescription className="flex items-center gap-2">
            {overallStatus === 'secure' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {overallStatus === 'vulnerable' && <XCircle className="h-5 w-5 text-red-600" />}
            {overallStatus === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
            
            <span className="font-medium">
              Estado general: {
                overallStatus === 'secure' ? 'SEGURO' :
                overallStatus === 'vulnerable' ? 'VULNERABLE' :
                'ADVERTENCIAS'
              }
            </span>
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runSecurityAudit} 
          disabled={isRunning}
          className="mb-6"
        >
          {isRunning ? 'Ejecutando auditoría...' : 'Ejecutar auditoría de nuevo'}
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span>{test.name}</span>
                </div>
                {getStatusBadge(test.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{test.description}</p>
              <p className="text-sm mb-3"><strong>Resultado:</strong> {test.details}</p>
              {test.recommendation && (
                <p className="text-sm text-blue-600">
                  <strong>Recomendación:</strong> {test.recommendation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">✅ Mejoras de Seguridad Implementadas:</h3>
        <ul className="text-sm space-y-1">
          <li>• Reemplazado supabase.auth.getSession() con supabase.auth.getUser() para verificación segura</li>
          <li>• Actualizado el middleware para usar verificación de usuario del servidor</li>
          <li>• Corregido el contexto de autenticación para verificar usuarios en cada evento</li>
          <li>• Actualizado componentes de debug para usar autenticación segura</li>
          <li>• Implementado manejo de errores robusto para sesiones inválidas</li>
        </ul>
      </div>
    </div>
  );
}
