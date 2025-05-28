import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Manejador de ruta para el callback de autenticación de Supabase
 * Esta ruta se llama después de que el usuario se autentica con un proveedor externo (Google, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Callback de autenticación recibido');
    
    // Obtener el código de autenticación y la URL de retorno de los parámetros de consulta
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    // Registrar información para depuración
    console.log('Parámetros de callback:', {
      code: code ? 'presente' : 'ausente',
      error: error || 'ninguno',
      errorDescription: errorDescription || 'ninguno'
    });
    
    // Si hay un error, redirigir a la página de login con el error
    if (error) {
      console.error('Error en callback de autenticación:', error, errorDescription);
      
      const loginUrl = new URL('/auth/login', requestUrl.origin);
      loginUrl.searchParams.set('error', error);
      loginUrl.searchParams.set('error_description', errorDescription || '');
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Si no hay código, redirigir a la página de login
    if (!code) {
      console.error('No se encontró código de autenticación en el callback');
      
      const loginUrl = new URL('/auth/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'no_code');
      loginUrl.searchParams.set('error_description', 'No se encontró código de autenticación');
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Crear cliente de Supabase para el manejador de ruta
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Intercambiar el código por una sesión
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error al intercambiar código por sesión:', exchangeError);
      
      const loginUrl = new URL('/auth/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'exchange_error');
      loginUrl.searchParams.set('error_description', exchangeError.message);
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Obtener la URL de retorno almacenada en localStorage (si existe)
    // Esto se hace en el cliente después de la redirección
    
    // Redirigir a la página de dashboard por defecto
    const redirectUrl = new URL('/dashboard', requestUrl.origin);
    
    console.log('Autenticación exitosa, redirigiendo a:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error inesperado en callback de autenticación:', error);
    
    // En caso de error, redirigir a la página de login con el error
    const loginUrl = new URL('/auth/login', request.nextUrl.origin);
    loginUrl.searchParams.set('error', 'unexpected_error');
    loginUrl.searchParams.set('error_description', error instanceof Error ? error.message : 'Error inesperado');
    
    return NextResponse.redirect(loginUrl);
  }
}
