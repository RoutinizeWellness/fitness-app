'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { MotionComponent } from '@/components/ui/motion-fallback';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/auth-context';
import { handleSignUpError } from '@/lib/auth-error-handler';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for return URL in query parameters
  useEffect(() => {
    const returnPath = searchParams.get('returnUrl');
    if (returnPath) {
      setReturnUrl(returnPath);
      console.log('Return URL set to:', returnPath);
    }
  }, [searchParams]);

  /**
   * Maneja el envío del formulario de registro
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validar formulario
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    // Configurar un timeout para detectar problemas de conexión
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('El registro está tardando demasiado tiempo');
        setErrorMessage('La conexión está tardando demasiado. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
        setIsLoading(false);
      }
    }, 15000); // 15 segundos de timeout

    try {
      console.log('Iniciando proceso de registro...');

      // Almacenar información de registro para depuración
      if (typeof window !== 'undefined') {
        localStorage.setItem('register_attempt', new Date().toISOString());
        if (returnUrl) {
          localStorage.setItem('register_return_url', returnUrl);
        }
      }

      // Configurar opciones de registro
      const options = {
        data: {
          full_name: fullName,
          level: 'beginner',
          onboarding_completed: false,
          experience_level: 'beginner',
          interface_mode: 'beginner'
        },
        redirectTo: `${window.location.origin}/auth/verify-email`
      };

      // Registrar usuario
      const { data, error, status, message } = await authService.signUp(email, password, options);

      // Limpiar el timeout ya que la respuesta llegó
      clearTimeout(timeoutId);

      if (error) {
        console.error('Error de registro:', error);

        // Usar el manejador de errores de autenticación para mensajes consistentes
        const friendlyErrorMessage = handleSignUpError(error, true);
        setErrorMessage(friendlyErrorMessage);
        setIsLoading(false);
        return;
      }

      // Mostrar mensaje de éxito
      setSuccessMessage('Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.');
      console.log('Registro exitoso, redirigiendo a verificación de email...');

      // Mostrar toast de éxito
      toast({
        title: 'Registro exitoso',
        description: 'Te hemos enviado un correo electrónico para verificar tu cuenta.',
      });

      // Almacenar información para depuración
      if (typeof window !== 'undefined') {
        localStorage.setItem('register_success', 'true');
        localStorage.setItem('register_email', email);
        localStorage.setItem('register_time', new Date().toISOString());
      }

      // Redirigir a la página de verificación de email
      setTimeout(() => {
        router.push('/auth/verify-email?email=' + encodeURIComponent(email));
      }, 2000);
    } catch (error) {
      // Limpiar el timeout ya que la respuesta llegó (con error)
      clearTimeout(timeoutId);

      console.error('Error inesperado durante el registro:', error);
      const errorMsg = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setErrorMessage(`Error: ${errorMsg}. Por favor, inténtalo de nuevo más tarde.`);
      setIsLoading(false);

      // Mostrar notificación toast
      toast({
        title: 'Error de registro',
        description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Valida el formulario de registro
   */
  const validateForm = (): boolean => {
    // Validar nombre completo
    if (!fullName.trim()) {
      setErrorMessage('Por favor, ingresa tu nombre completo.');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return false;
    }

    // Validar contraseña
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return false;
    }

    // Validar aceptación de términos
    if (!acceptTerms) {
      setErrorMessage('Debes aceptar los términos y condiciones para registrarte.');
      return false;
    }

    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Almacenar la URL de retorno en localStorage para usarla después de la redirección OAuth
      if (returnUrl) {
        localStorage.setItem('auth_return_url', returnUrl);
        console.log('URL de retorno almacenada para después de redirección OAuth:', returnUrl);
      }

      // Almacenar información adicional para depuración
      localStorage.setItem('google_auth_start', new Date().toISOString());
      localStorage.setItem('google_auth_path', window.location.pathname);

      // Intentar iniciar sesión con Google
      const { data, error } = await authService.signInWithProvider('google');

      if (error) {
        console.error('Error de inicio de sesión con Google:', error);
        setErrorMessage(error.message || 'Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.');
        setIsGoogleLoading(false);
      } else {
        setSuccessMessage('Redirigiendo a Google para iniciar sesión...');

        // No necesitamos redireccionar aquí, ya que la redirección la maneja Supabase
        // Pero mantenemos el estado de carga para indicar que se está procesando
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setErrorMessage('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsFacebookLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Implementación pendiente para Facebook
      setTimeout(() => {
        setIsFacebookLoading(false);
        setErrorMessage('Inicio de sesión con Facebook no implementado aún');

        toast({
          title: 'Funcionalidad no disponible',
          description: 'El inicio de sesión con Facebook no está implementado todavía.',
          variant: 'destructive',
        });
      }, 1000);
    } catch (error) {
      console.error('Error inesperado:', error);
      setErrorMessage('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
      setIsFacebookLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Register illustration component
  const registerIllustration = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-32 h-32 relative">
        <Image
          src="/images/register-illustration-1.svg"
          alt="Register Illustration"
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
              fallback.innerHTML = "<span class='text-[#573353] font-medium'>Register</span>";
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

  // Register footer component
  const registerFooter = (
    <p className="text-[#573353] text-sm">
      ¿Ya tienes una cuenta? <Link href="/auth/login" className="font-medium text-[#FDA758]">Inicia sesión</Link>
    </p>
  );

  return (
    <AuthLayout
      title="Crear cuenta"
      illustration={registerIllustration}
      footer={registerFooter}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-[#573353]">
              Nombre completo
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                <User className="h-5 w-5" />
              </div>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
                placeholder="Nombre y apellido"
              />
            </div>
          </div>

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

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#573353]">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
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
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
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

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start space-x-2 mt-4">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="border-[#FDA758] text-[#FDA758] rounded-md mt-1"
            />
            <label htmlFor="terms" className="text-sm text-[#573353]">
              Acepto los <Link href="/terms" className="text-[#FDA758] hover:underline">Términos y Condiciones</Link> y la <Link href="/privacy" className="text-[#FDA758] hover:underline">Política de Privacidad</Link>
            </label>
          </div>

          {/* Register Button */}
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#FDA758]" />
                <p className="mt-4 text-[#573353] font-medium">Creando tu cuenta...</p>
                <p className="mt-2 text-[#573353]/70 text-sm">Por favor, espera mientras procesamos tu registro</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </AuthLayout>
  );
}
