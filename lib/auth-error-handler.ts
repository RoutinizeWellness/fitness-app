'use client';

import { AuthError } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";

/**
 * Maneja errores de autenticación de manera consistente
 * @param error Error de autenticación
 * @param showToast Si se debe mostrar una notificación toast
 * @returns Mensaje de error amigable para el usuario
 */
export function handleAuthError(error: AuthError | Error | any, showToast: boolean = false): string {
  // Mensaje por defecto
  let friendlyMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';
  let toastVariant: 'default' | 'destructive' = 'destructive';
  let shouldRedirect = false;
  let redirectUrl = '';

  // Verificar si el error es nulo o indefinido
  if (!error) {
    return friendlyMessage;
  }

  // Extraer mensaje y código de error
  const errorMessage = error.message || '';
  const errorCode = error.code || '';
  const errorStatus = error.status || 0;

  // Manejar errores específicos de autenticación
  if (errorMessage.includes('Auth session missing') || errorCode === 'PGRST301') {
    friendlyMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    shouldRedirect = true;
    redirectUrl = '/auth/login?reason=session_expired';
  } else if (errorMessage.includes('JWT expired') || errorMessage.includes('token is expired')) {
    friendlyMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    shouldRedirect = true;
    redirectUrl = '/auth/login?reason=session_expired';
  } else if (errorMessage.includes('Invalid login credentials')) {
    friendlyMessage = 'Credenciales de inicio de sesión inválidas. Por favor, verifica tu email y contraseña.';
  } else if (errorMessage.includes('Email not confirmed')) {
    friendlyMessage = 'Tu correo electrónico no ha sido confirmado. Por favor, verifica tu bandeja de entrada.';
  } else if (errorMessage.includes('User already registered')) {
    friendlyMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
  } else if (errorMessage.includes('Password should be at least')) {
    friendlyMessage = 'La contraseña debe tener al menos 6 caracteres.';
  } else if (errorMessage.includes('Email format is invalid')) {
    friendlyMessage = 'El formato del correo electrónico es inválido.';
  } else if (errorMessage.includes('Rate limit exceeded')) {
    friendlyMessage = 'Has realizado demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.';
  } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    friendlyMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
  } else if (errorCode === '42501' || errorMessage.includes('permission denied')) {
    friendlyMessage = 'No tienes permisos para realizar esta acción.';
  } else if (errorStatus === 429) {
    friendlyMessage = 'Has realizado demasiadas solicitudes. Por favor, espera unos minutos e inténtalo de nuevo.';
  } else if (errorStatus === 500 || errorStatus === 502 || errorStatus === 503 || errorStatus === 504) {
    friendlyMessage = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
  }

  // Registrar el error en la consola
  console.error('Error de autenticación:', {
    message: errorMessage,
    code: errorCode,
    status: errorStatus,
    friendlyMessage
  });

  // Mostrar toast si se solicita
  if (showToast) {
    toast({
      title: 'Error de autenticación',
      description: friendlyMessage,
      variant: toastVariant
    });
  }

  // Redirigir si es necesario
  if (shouldRedirect && typeof window !== 'undefined') {
    // Usar setTimeout para permitir que el toast se muestre antes de redirigir
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);
  }

  return friendlyMessage;
}

/**
 * Maneja errores de autenticación específicamente para el inicio de sesión
 * @param error Error de autenticación
 * @param showToast Si se debe mostrar una notificación toast
 * @returns Mensaje de error amigable para el usuario
 */
export function handleLoginError(error: AuthError | Error | any, showToast: boolean = false): string {
  // Mensaje por defecto
  let friendlyMessage = 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';

  // Verificar si el error es nulo o indefinido
  if (!error) {
    return friendlyMessage;
  }

  // Extraer mensaje y código de error
  const errorMessage = error.message || '';

  // Manejar errores específicos de inicio de sesión
  if (errorMessage.includes('Invalid login credentials')) {
    friendlyMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
  } else if (errorMessage.includes('Email not confirmed')) {
    friendlyMessage = 'Tu correo electrónico no ha sido confirmado. Por favor, verifica tu bandeja de entrada.';
  } else if (errorMessage.includes('Rate limit exceeded')) {
    friendlyMessage = 'Has realizado demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.';
  } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    friendlyMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
  } else {
    // Usar el manejador general para otros errores
    friendlyMessage = handleAuthError(error, false);
  }

  // Mostrar toast si se solicita
  if (showToast) {
    toast({
      title: 'Error de inicio de sesión',
      description: friendlyMessage,
      variant: 'destructive'
    });
  }

  return friendlyMessage;
}

/**
 * Maneja errores de autenticación específicamente para el registro
 * @param error Error de autenticación
 * @param showToast Si se debe mostrar una notificación toast
 * @returns Mensaje de error amigable para el usuario
 */
export function handleSignUpError(error: AuthError | Error | any, showToast: boolean = false): string {
  // Mensaje por defecto
  let friendlyMessage = 'Error al registrar usuario. Por favor, inténtalo de nuevo.';

  // Verificar si el error es nulo o indefinido
  if (!error) {
    return friendlyMessage;
  }

  // Extraer mensaje y código de error
  const errorMessage = error.message || '';

  // Manejar errores específicos de registro
  if (errorMessage.includes('User already registered')) {
    friendlyMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
  } else if (errorMessage.includes('Password should be at least')) {
    friendlyMessage = 'La contraseña debe tener al menos 6 caracteres.';
  } else if (errorMessage.includes('Email format is invalid')) {
    friendlyMessage = 'El formato del correo electrónico es inválido.';
  } else if (errorMessage.includes('Rate limit exceeded')) {
    friendlyMessage = 'Has realizado demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.';
  } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    friendlyMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
  } else {
    // Usar el manejador general para otros errores
    friendlyMessage = handleAuthError(error, false);
  }

  // Mostrar toast si se solicita
  if (showToast) {
    toast({
      title: 'Error de registro',
      description: friendlyMessage,
      variant: 'destructive'
    });
  }

  return friendlyMessage;
}

/**
 * Maneja errores de autenticación específicamente para la recuperación de contraseña
 * @param error Error de autenticación
 * @param showToast Si se debe mostrar una notificación toast
 * @returns Mensaje de error amigable para el usuario
 */
export function handlePasswordResetError(error: AuthError | Error | any, showToast: boolean = false): string {
  // Mensaje por defecto
  let friendlyMessage = 'Error al restablecer contraseña. Por favor, inténtalo de nuevo.';

  // Verificar si el error es nulo o indefinido
  if (!error) {
    return friendlyMessage;
  }

  // Extraer mensaje y código de error
  const errorMessage = error.message || '';

  // Manejar errores específicos de recuperación de contraseña
  if (errorMessage.includes('Email not found')) {
    friendlyMessage = 'No se encontró ninguna cuenta con este correo electrónico.';
  } else if (errorMessage.includes('Rate limit exceeded')) {
    friendlyMessage = 'Has realizado demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.';
  } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    friendlyMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
  } else {
    // Usar el manejador general para otros errores
    friendlyMessage = handleAuthError(error, false);
  }

  // Mostrar toast si se solicita
  if (showToast) {
    toast({
      title: 'Error al restablecer contraseña',
      description: friendlyMessage,
      variant: 'destructive'
    });
  }

  return friendlyMessage;
}

/**
 * Maneja errores de autenticación específicamente para la verificación de email
 * @param error Error de autenticación
 * @param showToast Si se debe mostrar una notificación toast
 * @returns Mensaje de error amigable para el usuario
 */
export function handleEmailVerificationError(error: AuthError | Error | any, showToast: boolean = false): string {
  // Mensaje por defecto
  let friendlyMessage = 'Error al verificar correo electrónico. Por favor, inténtalo de nuevo.';

  // Verificar si el error es nulo o indefinido
  if (!error) {
    return friendlyMessage;
  }

  // Extraer mensaje y código de error
  const errorMessage = error.message || '';

  // Manejar errores específicos de verificación de email
  if (errorMessage.includes('Invalid token')) {
    friendlyMessage = 'El enlace de verificación es inválido o ha expirado. Por favor, solicita uno nuevo.';
  } else if (errorMessage.includes('Rate limit exceeded')) {
    friendlyMessage = 'Has realizado demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.';
  } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    friendlyMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
  } else {
    // Usar el manejador general para otros errores
    friendlyMessage = handleAuthError(error, false);
  }

  // Mostrar toast si se solicita
  if (showToast) {
    toast({
      title: 'Error de verificación',
      description: friendlyMessage,
      variant: 'destructive'
    });
  }

  return friendlyMessage;
}