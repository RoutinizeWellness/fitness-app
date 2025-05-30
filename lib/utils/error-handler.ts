import { toast } from "@/components/ui/use-toast"

export interface ErrorContext {
  context: string
  showToast?: boolean
  logToConsole?: boolean
  userId?: string
  additionalData?: Record<string, any>
}

export interface ErrorDetails {
  code?: string
  message: string
  details?: string
  timestamp: string
  context?: string
  userId?: string
  additionalData?: Record<string, any>
}

/**
 * Maneja errores de Supabase de forma consistente
 */
export const handleSupabaseError = (error: any, context: ErrorContext = { context: 'Unknown' }): ErrorDetails => {
  const errorDetails: ErrorDetails = {
    code: error?.code || 'UNKNOWN_ERROR',
    message: error?.message || 'Error desconocido',
    details: error?.details || '',
    timestamp: new Date().toISOString(),
    context: context.context,
    userId: context.userId,
    additionalData: context.additionalData
  }

  // Log del error en consola si está habilitado
  if (context.logToConsole !== false) {
    console.error(`[${context.context}] Supabase Error:`, {
      ...errorDetails,
      originalError: error
    })
  }

  // Mostrar toast si está habilitado
  if (context.showToast) {
    const userFriendlyMessage = getUserFriendlyMessage(error)
    toast({
      title: "Error",
      description: userFriendlyMessage,
      variant: "destructive"
    })
  }

  // Enviar error a servicio de monitoreo (si está configurado)
  if (process.env.NODE_ENV === 'production') {
    sendErrorToMonitoring(errorDetails)
  }

  return errorDetails
}

/**
 * Convierte errores técnicos en mensajes amigables para el usuario
 */
export const getUserFriendlyMessage = (error: any): string => {
  const code = error?.code
  const message = error?.message?.toLowerCase() || ''

  // Errores de autenticación
  if (code === 'PGRST301' || message.includes('jwt')) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  }

  if (code === 'PGRST116' || message.includes('no rows')) {
    return 'No se encontraron datos.'
  }

  // Errores de permisos
  if (code === '42501' || message.includes('permission denied') || message.includes('rls')) {
    return 'No tienes permisos para realizar esta acción.'
  }

  // Errores de conexión
  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return 'Problema de conexión. Verifica tu internet e inténtalo de nuevo.'
  }

  // Errores de validación
  if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
    return 'Este elemento ya existe. Por favor, usa un valor diferente.'
  }

  if (code === '23503' || message.includes('foreign key')) {
    return 'No se puede completar la acción debido a dependencias de datos.'
  }

  if (code === '23502' || message.includes('not null')) {
    return 'Faltan campos obligatorios. Por favor, completa toda la información requerida.'
  }

  // Errores de límites
  if (message.includes('limit') || message.includes('quota')) {
    return 'Has alcanzado el límite permitido. Contacta con soporte si necesitas más capacidad.'
  }

  // Error genérico
  return 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
}

/**
 * Maneja errores de la API de forma consistente
 */
export const handleAPIError = async (response: Response, context: ErrorContext): Promise<ErrorDetails> => {
  let errorData: any = {}
  
  try {
    errorData = await response.json()
  } catch {
    errorData = { message: 'Error de respuesta del servidor' }
  }

  const errorDetails: ErrorDetails = {
    code: `HTTP_${response.status}`,
    message: errorData.message || `Error ${response.status}: ${response.statusText}`,
    details: errorData.details || '',
    timestamp: new Date().toISOString(),
    context: context.context,
    userId: context.userId,
    additionalData: {
      ...context.additionalData,
      status: response.status,
      url: response.url
    }
  }

  if (context.logToConsole !== false) {
    console.error(`[${context.context}] API Error:`, errorDetails)
  }

  if (context.showToast) {
    const userMessage = getAPIErrorMessage(response.status, errorData.message)
    toast({
      title: "Error",
      description: userMessage,
      variant: "destructive"
    })
  }

  return errorDetails
}

/**
 * Obtiene mensaje amigable para errores de API
 */
export const getAPIErrorMessage = (status: number, message?: string): string => {
  switch (status) {
    case 400:
      return 'Solicitud inválida. Verifica los datos enviados.'
    case 401:
      return 'No autorizado. Por favor, inicia sesión.'
    case 403:
      return 'No tienes permisos para realizar esta acción.'
    case 404:
      return 'Recurso no encontrado.'
    case 429:
      return 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'
    case 500:
      return 'Error interno del servidor. Inténtalo más tarde.'
    case 503:
      return 'Servicio no disponible temporalmente.'
    default:
      return message || 'Error de conexión con el servidor.'
  }
}

/**
 * Maneja errores de validación de formularios
 */
export const handleValidationError = (errors: Record<string, string[]>, context: ErrorContext): void => {
  const firstError = Object.values(errors)[0]?.[0]
  
  if (context.showToast && firstError) {
    toast({
      title: "Error de validación",
      description: firstError,
      variant: "destructive"
    })
  }

  if (context.logToConsole !== false) {
    console.warn(`[${context.context}] Validation Error:`, errors)
  }
}

/**
 * Maneja errores generales de JavaScript
 */
export const handleGenericError = (error: Error, context: ErrorContext): ErrorDetails => {
  const errorDetails: ErrorDetails = {
    code: error.name || 'GENERIC_ERROR',
    message: error.message || 'Error inesperado',
    details: error.stack || '',
    timestamp: new Date().toISOString(),
    context: context.context,
    userId: context.userId,
    additionalData: context.additionalData
  }

  if (context.logToConsole !== false) {
    console.error(`[${context.context}] Generic Error:`, errorDetails)
  }

  if (context.showToast) {
    toast({
      title: "Error",
      description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
      variant: "destructive"
    })
  }

  return errorDetails
}

/**
 * Wrapper para funciones async que maneja errores automáticamente
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: ErrorContext
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        handleSupabaseError(error, context)
      } else if (error instanceof Error) {
        handleGenericError(error, context)
      } else {
        handleGenericError(new Error(String(error)), context)
      }
      return null
    }
  }
}

/**
 * Envía errores a servicio de monitoreo (implementar según necesidades)
 */
const sendErrorToMonitoring = (errorDetails: ErrorDetails): void => {
  // Aquí se implementaría la integración con servicios como Sentry, LogRocket, etc.
  // Por ahora solo guardamos en localStorage para debugging
  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
    errors.push(errorDetails)
    
    // Mantener solo los últimos 50 errores
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50)
    }
    
    localStorage.setItem('app_errors', JSON.stringify(errors))
  } catch {
    // Ignorar errores de localStorage
  }
}

/**
 * Obtiene errores almacenados localmente (para debugging)
 */
export const getStoredErrors = (): ErrorDetails[] => {
  try {
    return JSON.parse(localStorage.getItem('app_errors') || '[]')
  } catch {
    return []
  }
}

/**
 * Limpia errores almacenados localmente
 */
export const clearStoredErrors = (): void => {
  try {
    localStorage.removeItem('app_errors')
  } catch {
    // Ignorar errores de localStorage
  }
}

/**
 * Hook personalizado para manejo de errores en componentes React
 */
export const useErrorHandler = () => {
  const handleError = (error: any, context: string, showToast: boolean = true) => {
    const errorContext: ErrorContext = {
      context,
      showToast,
      logToConsole: true
    }

    if (error && typeof error === 'object' && 'code' in error) {
      return handleSupabaseError(error, errorContext)
    } else if (error instanceof Error) {
      return handleGenericError(error, errorContext)
    } else {
      return handleGenericError(new Error(String(error)), errorContext)
    }
  }

  return { handleError }
}

export default {
  handleSupabaseError,
  handleAPIError,
  handleValidationError,
  handleGenericError,
  withErrorHandling,
  useErrorHandler,
  getUserFriendlyMessage,
  getAPIErrorMessage,
  getStoredErrors,
  clearStoredErrors
}
