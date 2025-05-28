import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 API Login - Email:', email)

    // Crear respuesta
    const response = NextResponse.json({ success: false })

    // Crear cliente de Supabase con manejo de cookies
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Intentar login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ API Login - Error:', error.message)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 400 }
      )
    }

    if (!data.session || !data.user) {
      console.error('❌ API Login - No session or user returned')
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo establecer la sesión' 
        },
        { status: 400 }
      )
    }

    console.log('✅ API Login - Success:', data.user.id)
    console.log('🍪 API Login - Session expires:', new Date(data.session.expires_at * 1000).toISOString())

    // Establecer cookies manualmente como respaldo
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    }

    // Establecer cookies de sesión
    response.cookies.set(
      `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`,
      JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
        user: data.user,
      }),
      cookieOptions
    )

    // Respuesta exitosa
    const responseData = {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token.substring(0, 20) + '...',
        expires_at: data.session.expires_at,
      },
    }

    console.log('✅ API Login - Returning success response')
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: response.headers,
    })

  } catch (error) {
    console.error('💥 API Login - Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
