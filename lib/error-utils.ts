/**
 * Utility functions for handling errors in the application
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Checks if an error is an empty object ({})
 * @param error The error to check
 * @returns True if the error is an empty object, false otherwise
 */
export const isEmptyErrorObject = (error: unknown): boolean => {
  return error !== null &&
         typeof error === 'object' &&
         Object.keys(error).length === 0;
};

/**
 * Gets a user-friendly error message from any error type
 * @param error The error to get a message from
 * @param defaultMessage Default message to use if no specific message can be extracted
 * @returns A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  error: unknown,
  defaultMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."
): string => {
  // Handle empty error objects (common with webpack chunk loading issues)
  if (isEmptyErrorObject(error)) {
    return "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Handle Supabase PostgrestError
  if (error && typeof error === 'object' && 'message' in error) {
    // For Supabase errors or other objects with message property
    const supabaseError = error as PostgrestError;

    // Check for specific Supabase error codes
    if ('code' in error) {
      const errorCode = String(supabaseError.code);

      // Map common Supabase error codes to user-friendly messages
      if (errorCode === '23505') {
        return "Ya existe un registro con esa información.";
      }
      if (errorCode === '23503') {
        return "No se puede realizar esta operación porque hay datos relacionados.";
      }
      if (errorCode === '42P01') {
        return "Error en la base de datos: tabla no encontrada.";
      }
    }

    return String(supabaseError.message) || defaultMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default case
  return defaultMessage;
};

/**
 * Logs an error with additional context information
 * @param error The error to log
 * @param context Additional context information
 */
export const logErrorWithContext = (error: unknown, context: Record<string, any> = {}): void => {
  // Mejorar el logging para errores vacíos
  if (isEmptyErrorObject(error)) {
    console.warn("🚨 Error vacío detectado ({}). Posible problema de cookies corruptas o conexión.");
    console.info("📊 Información de diagnóstico:", {
      ...context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      online: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'unknown',
      cookiesCount: typeof document !== 'undefined' ? document.cookie.split(';').length : 'unknown',
      hasSupabaseCookies: typeof document !== 'undefined' ? document.cookie.includes('sb-') : 'unknown'
    });

    // Sugerir acciones de recuperación
    console.info("💡 Acciones sugeridas:");
    console.info("1. Verificar cookies de Supabase");
    console.info("2. Limpiar cookies corruptas");
    console.info("3. Recargar la página");
    console.info("4. Verificar conexión a internet");

    return;
  }

  // Log detallado para otros tipos de errores
  console.error("❌ Error detectado:", error);
  console.error("📋 Contexto del error:", {
    ...context,
    errorType: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : 'No stack trace available',
    timestamp: new Date().toISOString()
  });
};
