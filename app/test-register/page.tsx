'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function TestRegisterPage() {
  const [email, setEmail] = useState('test@routinize.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Usuario registrado. Revisa tu correo para confirmar la cuenta.'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Registro de Usuario de Prueba</CardTitle>
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
          <Button 
            onClick={handleRegister} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Registrando...' : 'Registrar Usuario de Prueba'}
          </Button>
          
          <div className="text-sm text-gray-600">
            <p><strong>Nota:</strong> Este es un usuario de prueba para verificar el flujo de autenticación.</p>
            <p>Después del registro, ve a <a href="/auth/login" className="text-blue-600 underline">/auth/login</a> para probar el login.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
