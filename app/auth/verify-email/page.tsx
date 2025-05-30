'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SafeClientButton as Button } from '@/components/ui/safe-client-button';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { MotionComponent } from '@/components/ui/motion-fallback';
import { toast } from '@/components/ui/use-toast';
import { supabaseAuth } from '@/lib/auth/supabase-auth';
import { handleEmailVerificationError } from '@/lib/auth-error-handler';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener el email de los parámetros de búsqueda
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Verificar si hay un token en la URL (para verificación automática)
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  /**
   * Verifica el email usando el token proporcionado
   */
  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('Verificando email con token...');

      // Verificar el token
      const { data, error, status, message } = await authService.verifyEmail(token);

      if (error) {
        console.error('Error al verificar email:', error);

        // Usar el manejador de errores de autenticación para mensajes consistentes
        const friendlyErrorMessage = handleEmailVerificationError(error, true);
        setErrorMessage(friendlyErrorMessage);
        setVerificationStatus('error');
        return;
      }

      // Mostrar mensaje de éxito
      setSuccessMessage('Tu correo electrónico ha sido verificado correctamente. Ahora puedes iniciar sesión.');
      setVerificationStatus('success');

      // Mostrar toast de éxito
      toast({
        title: 'Email verificado',
        description: 'Tu correo electrónico ha sido verificado correctamente.',
      });

      // Redirigir al login después de un tiempo
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Error inesperado al verificar email:', error);
      const errorMsg = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setErrorMessage(`Error: ${errorMsg}. Por favor, inténtalo de nuevo más tarde.`);
      setVerificationStatus('error');

      // Mostrar notificación toast
      toast({
        title: 'Error de verificación',
        description: 'Ocurrió un error inesperado al verificar tu correo electrónico.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Reenvía el correo de verificación
   */
  const handleResendEmail = async () => {
    if (!email) {
      setErrorMessage('Por favor, proporciona un correo electrónico válido.');
      return;
    }

    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('Reenviando correo de verificación a:', email);

      // Reenviar correo de verificación
      // Nota: Supabase no tiene un método directo para reenviar el correo de verificación,
      // por lo que usamos el método de restablecimiento de contraseña como alternativa
      const { data, error, status, message } = await authService.resetPassword(email);

      if (error) {
        console.error('Error al reenviar correo de verificación:', error);

        // Usar el manejador de errores de autenticación para mensajes consistentes
        const friendlyErrorMessage = handleEmailVerificationError(error, true);
        setErrorMessage(friendlyErrorMessage);
        return;
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(`Se ha enviado un nuevo correo de verificación a ${email}. Por favor, revisa tu bandeja de entrada.`);

      // Mostrar toast de éxito
      toast({
        title: 'Correo enviado',
        description: 'Se ha enviado un nuevo correo de verificación a tu dirección de correo electrónico.',
      });
    } catch (error) {
      console.error('Error inesperado al reenviar correo de verificación:', error);
      const errorMsg = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setErrorMessage(`Error: ${errorMsg}. Por favor, inténtalo de nuevo más tarde.`);

      // Mostrar notificación toast
      toast({
        title: 'Error al enviar correo',
        description: 'Ocurrió un error inesperado al enviar el correo de verificación.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Verify email illustration component
  const verifyEmailIllustration = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-32 h-32 relative">
        <Image
          src="/images/verify-email-illustration-1.svg"
          alt="Verify Email Illustration"
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
              fallback.innerHTML = "<span class='text-[#573353] font-medium'>Verify Email</span>";
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

  // Verify email footer component
  const verifyEmailFooter = (
    <p className="text-[#573353] text-sm">
      ¿Ya verificaste tu correo? <Link href="/auth/login" className="font-medium text-[#FDA758]">Inicia sesión</Link>
    </p>
  );

  return (
    <AuthLayout
      title="Verifica tu correo electrónico"
      illustration={verifyEmailIllustration}
      footer={verifyEmailFooter}
      showBackButton={true}
    >
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <MotionComponent
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg"
          >
            <p className="text-sm">{successMessage}</p>
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

        <div className="text-center mb-6">
          {verificationStatus === 'success' ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-[#573353] mb-2">¡Verificación exitosa!</h2>
              <p className="text-[#573353]/70">
                Tu correo electrónico ha sido verificado correctamente. Serás redirigido a la página de inicio de sesión en unos segundos.
              </p>
            </div>
          ) : (
            <>
              <Mail className="h-16 w-16 text-[#FDA758] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#573353] mb-2">Verifica tu correo electrónico</h2>
              <p className="text-[#573353]/70">
                Hemos enviado un correo de verificación a <span className="font-semibold">{email}</span>. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.
              </p>
            </>
          )}
        </div>

        {verificationStatus !== 'success' && (
          <div className="space-y-4">
            <div className="bg-[#FDA758]/10 rounded-lg p-4">
              <p className="text-sm text-[#573353]">
                Si no encuentras el correo, revisa tu carpeta de spam o solicita un nuevo correo de verificación.
              </p>
            </div>

            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando correo...
                </>
              ) : (
                "Reenviar correo de verificación"
              )}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-[#573353] text-sm hover:text-[#FDA758]">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isVerifying && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#FDA758]" />
              <p className="mt-4 text-[#573353] font-medium">Verificando tu correo electrónico...</p>
              <p className="mt-2 text-[#573353]/70 text-sm">Por favor, espera mientras procesamos la verificación</p>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
