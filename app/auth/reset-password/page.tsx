'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { MotionComponent } from '@/components/ui/motion-fallback';
import { toast } from '@/components/ui/use-toast';
import { supabaseAuth } from '@/lib/auth/supabase-auth';
import { handlePasswordResetError } from '@/lib/auth-error-handler';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetStatus, setResetStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener token de la URL
  const token = searchParams?.get('token');

  // Verificar token al cargar la página
  useEffect(() => {
    if (!token) {
      setErrorMessage("Token de restablecimiento no válido o expirado. Por favor, solicita un nuevo enlace de restablecimiento.");
      setResetStatus('error');
    }
  }, [token]);

  /**
   * Maneja el envío del formulario de restablecimiento de contraseña
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseñas
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Configurar un timeout para detectar problemas de conexión
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('El restablecimiento de contraseña está tardando demasiado tiempo');
        setErrorMessage('La conexión está tardando demasiado. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
        setIsLoading(false);
      }
    }, 15000); // 15 segundos de timeout

    try {
      if (!token) {
        throw new Error("Token de restablecimiento no válido");
      }

      console.log('Restableciendo contraseña con token...');

      // Actualizar contraseña con el token
      const { data, error, status, message } = await authService.updatePassword(password, token);

      // Limpiar el timeout ya que la respuesta llegó
      clearTimeout(timeoutId);

      if (error) {
        console.error('Error al restablecer contraseña:', error);

        // Usar el manejador de errores de autenticación para mensajes consistentes
        const friendlyErrorMessage = handlePasswordResetError(error, true);
        setErrorMessage(friendlyErrorMessage);
        setResetStatus('error');
        return;
      }

      // Mostrar mensaje de éxito
      setSuccessMessage("Tu contraseña ha sido restablecida correctamente.");
      setResetStatus('success');

      // Mostrar toast de éxito
      toast({
        title: 'Contraseña restablecida',
        description: 'Tu contraseña ha sido actualizada correctamente.',
      });

      // Redirigir al login después de un tiempo
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      // Limpiar el timeout ya que la respuesta llegó (con error)
      clearTimeout(timeoutId);

      console.error('Error inesperado durante el restablecimiento de contraseña:', error);
      const errorMsg = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setErrorMessage(`Error: ${errorMsg}. Por favor, inténtalo de nuevo más tarde.`);
      setResetStatus('error');

      // Mostrar notificación toast
      toast({
        title: 'Error al restablecer contraseña',
        description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Reset password illustration
  const resetPasswordIllustration = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-32 h-32 relative">
        <Image
          src="/images/reset-password-illustration-1.svg"
          alt="Reset Password Illustration"
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
              fallback.innerHTML = "<span class='text-[#573353] font-medium'>Reset</span>";
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

  // Reset password footer
  const resetPasswordFooter = (
    <p className="text-[#573353] text-sm">
      ¿Recordaste tu contraseña? <Link href="/auth/login" className="font-medium text-[#FDA758]">Iniciar sesión</Link>
    </p>
  );

  return (
    <AuthLayout
      title="Restablecer contraseña"
      illustration={resetPasswordIllustration}
      footer={resetPasswordFooter}
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
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-[#573353] mb-2">¡Contraseña actualizada!</h2>
              <p className="text-[#573353]/70 text-center">{successMessage}</p>
              <div className="mt-4 w-full">
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3"
                >
                  Ir a inicio de sesión
                </Button>
              </div>
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
            {!token && (
              <div className="mt-4">
                <Button
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3"
                >
                  Solicitar nuevo enlace
                </Button>
              </div>
            )}
          </MotionComponent>
        )}

        {!successMessage && token && resetStatus === 'pending' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <p className="text-[#573353] text-sm">
                Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#573353]">
                Nueva contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
                  placeholder="Nueva contraseña"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#573353]/70 hover:text-[#573353]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#573353]/70">
                La contraseña debe tener al menos 6 caracteres.
              </p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#573353]">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
                  placeholder="Confirmar contraseña"
                />
                <button
                  type="button"
                  onClick={toggleShowConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#573353]/70 hover:text-[#573353]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
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
                    Actualizando...
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#FDA758]" />
                  <p className="mt-4 text-[#573353] font-medium">Actualizando contraseña...</p>
                  <p className="mt-2 text-[#573353]/70 text-sm">Por favor, espera mientras procesamos tu solicitud</p>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
