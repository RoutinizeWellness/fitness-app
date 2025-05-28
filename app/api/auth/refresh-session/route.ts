import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API route para refrescar la sesión desde el servidor
 * Esta ruta se utiliza como fallback cuando el refresco de sesión desde el cliente falla
 */
export async function POST(request: NextRequest) {
  try {
    // Crear cliente de Supabase para el servidor
    const supabase = createRouteHandlerClient({ cookies })
    
    // Obtener el token de actualización del cuerpo de la solicitud
    const requestData = await request.json()
    const { refresh_token } = requestData
    
    if (!refresh_token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se proporcionó token de actualización' 
        },
        { status: 400 }
      )
    }
    
    // Intentar actualizar la sesión con el token de actualización
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })
    
    if (error) {
      console.error('Error al actualizar la sesión desde el servidor:', error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 401 }
      )
    }
    
    if (!data.session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo obtener una nueva sesión' 
        },
        { status: 401 }
      )
    }
    
    // Devolver éxito
    return NextResponse.json({ 
      success: true,
      message: 'Sesión actualizada correctamente',
      expiresAt: data.session.expires_at
    })
  } catch (error) {
    console.error('Error en la ruta de actualización de sesión:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}
