import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Middleware para gestionar la autenticación y protección de rutas
 *
 * Este middleware se encarga de:
 * 1. Verificar si el usuario está autenticado
 * 2. Refrescar el token si está a punto de expirar
 * 3. Redirigir a login si intenta acceder a rutas protegidas sin autenticación
 * 4. Redirigir a dashboard si intenta acceder a login estando autenticado
 * 5. Redirigir a onboarding si no ha completado el proceso
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const response = NextResponse.next()

  // Añadir cabeceras para evitar caché y mejorar debugging
  response.headers.set('x-middleware-cache', 'no-cache')
  response.headers.set('x-middleware-path', url.pathname)

  try {
    // Crear cliente de Supabase para el middleware
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log(`Middleware - Cookies disponibles: ${cookies.length}`)
          cookies.forEach(cookie => {
            if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
              console.log(`Middleware - Cookie Supabase: ${cookie.name} = ${cookie.value ? 'exists' : 'empty'}`)
            }
          })
          return cookies
        },
        setAll(cookiesToSet) {
          console.log(`Middleware - Estableciendo ${cookiesToSet.length} cookies`)
          cookiesToSet.forEach(({ name, value, options }) => {
            if (name.includes('supabase') || name.includes('sb-')) {
              console.log(`Middleware - Estableciendo cookie Supabase: ${name}`)
            }
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Intentar obtener sesión desde localStorage como respaldo
    let sessionFromStorage = null
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Middleware - Token de autorización encontrado en headers')
    }

    // ✅ SECURE: Obtener usuario verificado por el servidor
    let user = null
    let session = null

    try {
      console.log('🔐 Middleware: Verificando usuario con el servidor...')

      // ✅ SECURE: Usar getUser() para verificar con el servidor
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error("❌ Middleware: Error al obtener usuario verificado:", userError)
        response.headers.set('x-middleware-user-error', userError.message)

        // Manejar específicamente el error AuthSessionMissingError
        if (userError.message?.includes('Auth session missing')) {
          console.warn('⚠️ Middleware: AuthSessionMissingError - limpiando estado de sesión')
          response.headers.set('x-middleware-auth-session-missing', 'true')

          // Intentar cerrar sesión para limpiar cualquier estado inválido
          try {
            await supabase.auth.signOut({ scope: 'local' })
            console.log("✅ Middleware: Sesión cerrada localmente con éxito")
          } catch (signOutError) {
            console.error("❌ Middleware: Error al cerrar sesión:", signOutError)
          }
        }
      } else if (userData.user) {
        console.log('✅ Middleware: Usuario verificado por el servidor:', userData.user.id)
        user = userData.user

        // Obtener la sesión local solo para información adicional (no para autenticación)
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          session = sessionData.session
          console.log('ℹ️ Middleware: Sesión local obtenida para información adicional')
        } catch (sessionError) {
          console.warn('⚠️ Middleware: Error al obtener sesión local (no crítico):', sessionError)
          // No es crítico si no podemos obtener la sesión local
        }
      } else {
        console.log('ℹ️ Middleware: No hay usuario autenticado')
      }
    } catch (authError) {
      console.error("💥 Middleware: Excepción al verificar usuario:", authError)
      response.headers.set('x-middleware-auth-error',
        authError instanceof Error ? authError.message : 'Error desconocido')

      // Manejar específicamente el error AuthSessionMissingError como excepción
      if (authError instanceof Error && authError.message?.includes('Auth session missing')) {
        console.warn('⚠️ Middleware: Excepción AuthSessionMissingError - limpiando estado de sesión')
        response.headers.set('x-middleware-auth-session-missing-exception', 'true')

        // Intentar cerrar sesión para limpiar cualquier estado inválido
        try {
          await supabase.auth.signOut({ scope: 'local' })
          console.log("✅ Middleware: Sesión cerrada localmente con éxito después de excepción")
        } catch (signOutError) {
          console.error("❌ Middleware: Error al cerrar sesión después de excepción:", signOutError)
        }
      }
    }

    // Refrescar el token de autenticación si es necesario
    if (session) {
      try {
        // Verificar si la sesión está a punto de expirar (dentro de 15 minutos)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        const fifteenMinutesInSeconds = 15 * 60;
        const timeUntilExpiry = expiresAt - now;

        // Información de depuración sobre la expiración de la sesión
        console.log(`Sesión expira en: ${new Date(expiresAt * 1000).toISOString()}`);
        console.log(`Tiempo hasta expiración: ${timeUntilExpiry} segundos`);

        // Añadir información de sesión a las cabeceras para depuración
        response.headers.set('x-middleware-session-expires-at', new Date(expiresAt * 1000).toISOString());
        response.headers.set('x-middleware-session-time-remaining', `${timeUntilExpiry}`);

        // Determinar si necesitamos refrescar el token
        const needsRefresh = timeUntilExpiry < fifteenMinutesInSeconds || timeUntilExpiry <= 0;

        if (needsRefresh) {
          console.log("Sesión cerca de expirar o ya expirada, refrescando...");
          response.headers.set('x-middleware-session-status', timeUntilExpiry <= 0 ? 'expired' : 'expiring_soon');

          // Intentar refrescar la sesión
          const { data, error } = await supabase.auth.refreshSession();

          if (error) {
            console.error("Error al refrescar sesión en middleware:", error);
            response.headers.set('x-middleware-refresh-error', error.message);

            // Si el refresco falla con un token expirado o faltante, limpiar la sesión
            if (error.message.includes('JWT expired') ||
                error.message.includes('token is expired') ||
                error.message.includes('Auth session missing')) {

              console.log("JWT expirado o faltante, limpiando sesión");
              await supabase.auth.signOut({ scope: 'local' });
              session = null;

              // Redirigir a login para rutas protegidas
              if (!url.pathname.startsWith('/auth')) {
                const loginUrl = new URL('/auth/login', request.url);
                loginUrl.searchParams.set('reason', 'session_expired');
                loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
                return NextResponse.redirect(loginUrl);
              }
            }
          } else if (data.session) {
            // Usar la sesión refrescada
            session = data.session;
            console.log("Sesión refrescada con éxito, nueva expiración:",
              new Date(data.session.expires_at * 1000).toISOString());

            // Añadir información de refresco a las cabeceras
            response.headers.set('x-middleware-session-refreshed', 'true');
            response.headers.set('x-middleware-session-expires',
              new Date(data.session.expires_at * 1000).toISOString());
          }
        } else {
          console.log("Sesión válida, no es necesario refrescar");
          response.headers.set('x-middleware-session-status', 'valid');
        }
      } catch (refreshError) {
        console.error("Excepción al refrescar sesión en middleware:", refreshError);
        response.headers.set('x-middleware-refresh-error',
          refreshError instanceof Error ? refreshError.message : 'Error desconocido');
        response.headers.set('x-middleware-session-status', 'refresh_error');

        // Si hay un AuthSessionMissingError, limpiar la sesión y redirigir
        if (refreshError instanceof Error && refreshError.message?.includes('Auth session missing')) {
          console.log("AuthSessionMissingError durante refresco, limpiando sesión");

          try {
            await supabase.auth.signOut({ scope: 'local' });
            session = null;

            // Redirigir a login para rutas protegidas
            if (!url.pathname.startsWith('/auth')) {
              const loginUrl = new URL('/auth/login', request.url);
              loginUrl.searchParams.set('reason', 'session_missing');
              loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
              return NextResponse.redirect(loginUrl);
            }
          } catch (signOutError) {
            console.error("Error al cerrar sesión después de error de refresco:", signOutError);
          }
        }
      }
    } else {
      response.headers.set('x-middleware-session-status', 'no_session');
    }

    // Añadir información de depuración a las cabeceras
    response.headers.set('x-middleware-has-user', user ? 'true' : 'false')
    response.headers.set('x-middleware-has-session', session ? 'true' : 'false')

    console.log("🔍 Middleware - URL:", url.pathname)
    console.log("🔍 Middleware - User:", user ? `Verificado (${user.id})` : "No autenticado")

    // Definir rutas protegidas
    const isProtectedRoute = url.pathname.startsWith('/dashboard') ||
                            url.pathname.startsWith('/training') ||
                            url.pathname.startsWith('/nutrition') ||
                            url.pathname.startsWith('/sleep') ||
                            url.pathname.startsWith('/productivity') ||
                            url.pathname.startsWith('/wellness') ||
                            url.pathname.startsWith('/activity') ||
                            url.pathname.startsWith('/onboarding');

    // Definir rutas de autenticación
    const isAuthRoute = url.pathname.startsWith('/auth');
    const isLoginPage = url.pathname === '/auth/login';

    // Las rutas de autenticación ahora se manejan directamente en los componentes
    // y no pasan por el middleware para evitar conflictos

    // 2. Manejar rutas protegidas
    if (isProtectedRoute) {
      // ✅ SECURE: Verificar usuario autenticado (no sesión)
      if (!user) {
        console.log("🚫 Usuario no autenticado intentando acceder a ruta protegida, redirigiendo a login");
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Si está autenticado, verificar si ha completado el onboarding
      try {
        // Solo verificar el onboarding para rutas que no sean de onboarding
        if (!url.pathname.startsWith('/onboarding')) {
          console.log('🔍 Middleware: Verificando perfil para usuario:', user.id);

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed, id')
            .eq('user_id', user.id)
            .single();

          // Añadir información del perfil a las cabeceras para depuración
          response.headers.set('x-middleware-profile-found', profile ? 'true' : 'false');

          if (profile) {
            response.headers.set('x-middleware-profile-id', profile.id);
            response.headers.set('x-middleware-onboarding-completed',
              profile.onboarding_completed === true ? 'true' :
              profile.onboarding_completed === false ? 'false' : 'null');

            // Si el onboarding no está completado, redirigir a onboarding
            if (profile.onboarding_completed === false) {
              console.log("📝 Usuario no ha completado onboarding, redirigiendo a onboarding");
              return NextResponse.redirect(new URL('/onboarding/beginner', request.url));
            }
          } else if (error) {
            console.error("❌ Error al obtener perfil en middleware:", error);
            response.headers.set('x-middleware-profile-error', error.message);

            // Si hay un error de permisos o perfil no encontrado, no redirigir a onboarding
            if (error.code === '42501' || error.code === 'PGRST116') {
              console.log("⚠️ Error de permisos o perfil no encontrado, no redirigir a onboarding");
            }
          }
        }
      } catch (error) {
        console.error("💥 Error inesperado al verificar perfil en middleware:", error);
        response.headers.set('x-middleware-profile-error',
          error instanceof Error ? error.message : 'Error desconocido');
      }
    }

    return response;
  } catch (middlewareError) {
    // Manejador global de errores para el middleware
    console.error("Error crítico en middleware:", middlewareError);

    // Definir rutas protegidas para el manejo de errores
    const isProtectedRoute = url.pathname.startsWith('/dashboard') ||
                            url.pathname.startsWith('/training') ||
                            url.pathname.startsWith('/nutrition') ||
                            url.pathname.startsWith('/sleep') ||
                            url.pathname.startsWith('/productivity') ||
                            url.pathname.startsWith('/wellness') ||
                            url.pathname.startsWith('/activity') ||
                            url.pathname.startsWith('/onboarding');

    // Para rutas de autenticación, permitir acceso incluso si el middleware falla
    if (url.pathname.startsWith('/auth')) {
      return response;
    }

    // Para rutas protegidas, redirigir a login si el middleware falla
    if (isProtectedRoute) {
      console.log("Error crítico en middleware para ruta protegida, redirigiendo a login");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return response;
  }
}

/**
 * Configuración del middleware para ejecutarse en rutas específicas
 *
 * Incluye:
 * - Rutas del dashboard y módulos principales
 * - Rutas de onboarding
 * - Rutas de API
 *
 * Nota: Las rutas de autenticación (/auth/*) se han excluido para evitar conflictos
 */
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/training',
    '/training/:path*',
    '/nutrition',
    '/nutrition/:path*',
    '/sleep',
    '/sleep/:path*',
    '/productivity',
    '/productivity/:path*',
    '/wellness',
    '/wellness/:path*',
    '/activity',
    '/activity/:path*',
    '/onboarding/:path*',
    '/api/:path*'
  ],
}
