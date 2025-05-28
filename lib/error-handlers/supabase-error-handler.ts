"use client"

import { PostgrestError } from '@supabase/supabase-js'
import { toast } from '@/components/ui/use-toast'

/**
 * Tipos de errores de Supabase
 */
export enum SupabaseErrorType {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  CONSTRAINT = 'constraint',
  TABLE_NOT_EXISTS = 'table_not_exists',
  EMPTY_RESPONSE = 'empty_response',
  UNKNOWN = 'unknown'
}

/**
 * Interfaz para el resultado del manejo de errores
 */
export interface ErrorHandlerResult {
  type: SupabaseErrorType
  message: string
  originalError: any
  handled: boolean
  fallbackData?: any
}

/**
 * Opciones para el manejador de errores
 */
export interface ErrorHandlerOptions {
  showToast?: boolean
  context?: string
  fallbackData?: any
  logToConsole?: boolean
  rethrow?: boolean
}

/**
 * Determina el tipo de error de Supabase
 */
function determineErrorType(error: any): SupabaseErrorType {
  if (!error) return SupabaseErrorType.UNKNOWN

  // Verificar si es un objeto vacío
  if (typeof error === 'object' && Object.keys(error).length === 0) {
    return SupabaseErrorType.EMPTY_RESPONSE
  }

  // Errores de PostgrestError
  if (error instanceof PostgrestError || (error.code && error.message)) {
    const message = error.message?.toLowerCase() || ''
    const code = error.code?.toString() || ''

    // Errores de conexión
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      code.startsWith('PGRST') ||
      code === '502' ||
      code === '503' ||
      code === '504'
    ) {
      return SupabaseErrorType.CONNECTION
    }

    // Errores de autenticación
    if (
      message.includes('auth') ||
      message.includes('jwt') ||
      message.includes('token') ||
      message.includes('login') ||
      message.includes('password') ||
      code === '401' ||
      code === '403'
    ) {
      return SupabaseErrorType.AUTHENTICATION
    }

    // Errores de permisos
    if (
      message.includes('permission') ||
      message.includes('access') ||
      message.includes('policy') ||
      message.includes('rls') ||
      code === '403'
    ) {
      return SupabaseErrorType.PERMISSION
    }

    // Errores de tabla no existente
    if (
      message.includes('no existe') ||
      message.includes('does not exist') ||
      message.includes('table') ||
      code === '42P01'
    ) {
      return SupabaseErrorType.TABLE_NOT_EXISTS
    }

    // Errores de restricciones
    if (
      message.includes('constraint') ||
      message.includes('violates') ||
      message.includes('foreign key') ||
      message.includes('unique') ||
      code.startsWith('23')
    ) {
      return SupabaseErrorType.CONSTRAINT
    }

    // Errores de no encontrado
    if (
      message.includes('not found') ||
      message.includes('no encontrado') ||
      code === '404'
    ) {
      return SupabaseErrorType.NOT_FOUND
    }
  }

  // Error desconocido
  return SupabaseErrorType.UNKNOWN
}

/**
 * Obtiene un mensaje de error amigable basado en el tipo de error
 */
function getFriendlyErrorMessage(error: any, type: SupabaseErrorType, context?: string): string {
  const contextPrefix = context ? `${context}: ` : ''

  switch (type) {
    case SupabaseErrorType.CONNECTION:
      return `${contextPrefix}No se pudo conectar a la base de datos. Verifica tu conexión a internet.`
    
    case SupabaseErrorType.AUTHENTICATION:
      return `${contextPrefix}Error de autenticación. Por favor, inicia sesión nuevamente.`
    
    case SupabaseErrorType.PERMISSION:
      return `${contextPrefix}No tienes permisos para realizar esta acción.`
    
    case SupabaseErrorType.NOT_FOUND:
      return `${contextPrefix}No se encontraron los datos solicitados.`
    
    case SupabaseErrorType.CONSTRAINT:
      if (error.message?.includes('foreign key')) {
        return `${contextPrefix}Error de referencia: Los datos están relacionados con otros registros.`
      }
      if (error.message?.includes('unique')) {
        return `${contextPrefix}Ya existe un registro con esos datos.`
      }
      return `${contextPrefix}Error de validación en los datos.`
    
    case SupabaseErrorType.TABLE_NOT_EXISTS:
      return `${contextPrefix}La funcionalidad no está disponible en este momento. Se está configurando la base de datos.`
    
    case SupabaseErrorType.EMPTY_RESPONSE:
      return `${contextPrefix}Error de conexión o respuesta vacía. Intenta nuevamente.`
    
    default:
      // Intentar extraer un mensaje útil del error
      if (error instanceof Error) {
        return `${contextPrefix}${error.message}`
      }
      
      if (typeof error === 'string') {
        return `${contextPrefix}${error}`
      }
      
      return `${contextPrefix}Se produjo un error inesperado.`
  }
}

/**
 * Manejador de errores de Supabase
 * @param error Error a manejar
 * @param options Opciones de manejo
 * @returns Resultado del manejo de errores
 */
export function handleSupabaseError(error: any, options: ErrorHandlerOptions = {}): ErrorHandlerResult {
  const {
    showToast = true,
    context = 'Error',
    fallbackData = null,
    logToConsole = true,
    rethrow = false
  } = options

  // Determinar el tipo de error
  const errorType = determineErrorType(error)
  
  // Obtener mensaje amigable
  const friendlyMessage = getFriendlyErrorMessage(error, errorType, context)
  
  // Registrar en consola si está habilitado
  if (logToConsole) {
    console.error(`[${context}] ${friendlyMessage}`, error)
  }
  
  // Mostrar toast si está habilitado
  if (showToast) {
    toast({
      title: context,
      description: friendlyMessage,
      variant: 'destructive',
    })
  }
  
  // Relanzar el error si se solicita
  if (rethrow) {
    throw error
  }
  
  // Devolver resultado
  return {
    type: errorType,
    message: friendlyMessage,
    originalError: error,
    handled: true,
    fallbackData
  }
}

/**
 * Hook para usar el manejador de errores de Supabase en componentes
 */
export function useSupabaseErrorHandler() {
  return (error: any, options: ErrorHandlerOptions = {}) => {
    return handleSupabaseError(error, options)
  }
}

export default handleSupabaseError
