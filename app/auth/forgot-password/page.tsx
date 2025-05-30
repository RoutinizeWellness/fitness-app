'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SafeClientButton as Button } from '@/components/ui/safe-client-button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { MotionComponent } from '@/components/ui/motion-fallback';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/auth-context';
import { handlePasswordResetError } from '@/lib/auth-error-handler';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Configurar un timeout para detectar problemas de conexión
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('La recuperación de contraseña está tardando demasiado tiempo');
        setErrorMessage('La conexión está tardando demasiado. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
        setIsLoading(false);
      }
    }, 15000); // 15 segundos de timeout

    try {
      console.log('Enviando correo de recuperación a:', email);

      // Enviar correo de recuperación
      const { data, error, status, message } = await authService.resetPassword(email);

      // Limpiar el timeout ya que la respuesta llegó
      clearTimeout(timeoutId);

      if (error) {
        console.error('Error al enviar correo de recuperación:', error);

        // Usar el manejador de errores de autenticación para mensajes consistentes
        const friendlyErrorMessage = handlePasswordResetError(error, true);
        setErrorMessage(friendlyErrorMessage);
        setIsLoading(false);
        return;
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(`Se ha enviado un correo a ${email} con instrucciones para restablecer tu contraseña.`);

      // Mostrar toast de éxito
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
    } catch (error) {
      // Limpiar el timeout ya que la respuesta llegó (con error)
      clearTimeout(timeoutId);

      console.error('Error inesperado durante la recuperación de contraseña:', error);
      const errorMsg = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setErrorMessage(`Error: ${errorMsg}. Por favor, inténtalo de nuevo más tarde.`);

      // Mostrar notificación toast
      toast({
        title: 'Error al enviar correo',
        description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password illustration
  const forgotPasswordIllustration = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-32 h-32 relative">
        <Image
          src="/images/forgot-password-illustration-1.svg"
          alt="Forgot Password Illustration"
          width={160}
          height={160}
          className="object-contain"
          priority
          onError={(e) => {
            // Fallback para imagen no encontrada
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = "w-32 h-32 rounded-full bg-[#FDA758]/20 flex items-center justify-center";
              fallback.innerHTML = "<span class='text-[#573353] font-medium'>Recuperar</span>";
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      <div className="w-16 h-16 relative">
        <Image
          src="/images/monumental-logo.svg"
          alt="Monumental Logo"
          width={64}
          height={64}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );

  // Footer component
  const forgotPasswordFooter = (
    <p className="text-[#573353] text-sm">
      ¿Recordaste tu contraseña? <Link href="/auth/login" className="font-medium text-[#FDA758]">Iniciar sesión</Link>
    </p>
  )

  return (
    <AuthLayout
      title="Recuperar contraseña"
      illustration={forgotPasswordIllustration}
      footer={forgotPasswordFooter}
      showBackButton={true}
    >
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <MotionComponent
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg"
          >
            <p className="text-sm">{successMessage}</p>
            <div className="mt-4">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3"
              >
                Volver a inicio de sesión
              </Button>
            </div>
          </MotionComponent>
        )}

        {/* Error Message */}
        {errorMessage && (
          <MotionComponent
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg"
          >
            <p className="text-sm">{errorMessage}</p>
          </MotionComponent>
        )}

        {!successMessage && (
          <>
            <div className="text-center mb-6">
              <p className="text-[#573353] text-sm">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#573353]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>
              </div>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#FDA758]" />
                    <p className="mt-4 text-[#573353] font-medium">Enviando correo...</p>
                    <p className="mt-2 text-[#573353]/70 text-sm">Por favor, espera mientras procesamos tu solicitud</p>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
