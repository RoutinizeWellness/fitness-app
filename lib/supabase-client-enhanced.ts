import { createClient } from "@supabase/supabase-js"
import { TABLES, COLUMNS, STORAGE, AUTH } from "./config/supabase-config"

// Usar las credenciales proporcionadas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://soviwrzrgskhvgcmujfj.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s"

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verificar la conexión a Supabase
export const checkSupabaseConnection = async () => {
  try {
    console.log("Verificando conexión a Supabase...")
    const { data, error } = await supabase.from(TABLES.PROFILES).select('count').limit(1)

    if (error) {
      console.error("Error de conexión a Supabase:", error)
      return { success: false, error }
    }

    console.log("Conexión a Supabase exitosa:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error al verificar conexión a Supabase:", error)
    return { success: false, error }
  }
}

// Ejecutar la verificación de conexión de forma asíncrona sin bloquear
if (typeof window !== 'undefined') {
  setTimeout(() => {
    checkSupabaseConnection().catch(err => {
      console.error("Error en la verificación asíncrona de Supabase:", err)
    })
  }, 2000)
}

// Funciones de utilidad para trabajar con Supabase

/**
 * Función para manejar errores de Supabase
 * @param error - Error de Supabase
 * @param message - Mensaje de error personalizado
 */
export const handleSupabaseError = (error: any, message: string = "Error en la operación con Supabase") => {
  if (error) {
    console.error(`${message}:`, error)
  }
  return error
}

/**
 * Función para normalizar los datos de Supabase a camelCase
 * @param data - Datos de Supabase en snake_case
 */
export const normalizeData = (data: any) => {
  if (!data) return null
  
  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const normalized = {}
    
    Object.keys(data).forEach(key => {
      // Convertir snake_case a camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      normalized[camelKey] = normalizeData(data[key])
    })
    
    return normalized
  }
  
  return data
}

/**
 * Función para convertir datos de camelCase a snake_case para Supabase
 * @param data - Datos en camelCase
 */
export const denormalizeData = (data: any) => {
  if (!data) return null
  
  if (Array.isArray(data)) {
    return data.map(item => denormalizeData(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const denormalized = {}
    
    Object.keys(data).forEach(key => {
      // Convertir camelCase a snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      denormalized[snakeKey] = denormalizeData(data[key])
    })
    
    return denormalized
  }
  
  return data
}

// Exportar constantes para uso en otros archivos
export { TABLES, COLUMNS, STORAGE, AUTH }
