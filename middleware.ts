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
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Obtener la sesión del usuario con manejo de errores
    let session = null
    try {
      // Obtener la sesión actual
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error al obtener sesión en middleware:", error)
        response.headers.set('x-middleware-session-error', error.message)

        // Manejar específicamente el error AuthSessionMissingError
        if (error.message?.includes('Auth session missing')) {
          console.warn('AuthSessionMissingError en middleware - limpiando estado de sesión')
          response.headers.set('x-middleware-auth-session-missing', 'true')

          // Intentar cerrar sesión para limpiar cualquier estado inválido
          try {
            await supabase.auth.signOut({ scope: 'local' })
            console.log("Sesión cerrada localmente con éxito en middleware")
          } catch (signOutError) {
            console.error("Error al cerrar sesión en middleware:", signOutError)
          }
        }
      } else {
        session = data.session
      }
    } catch (sessionError) {
      console.error("Excepción al obtener sesión en middleware:", sessionError)
      response.headers.set('x-middleware-session-error',
        sessionError instanceof Error ? sessionError.message : 'Error desconocido')

      // Manejar específicamente el error AuthSessionMissingError como excepción
      if (sessionError instanceof Error && sessionError.message?.includes('Auth session missing')) {
        console.warn('Excepción AuthSessionMissingError en middleware - limpiando estado de sesión')
        response.headers.set('x-middleware-auth-session-missing-exception', 'true')

        // Intentar cerrar sesión para limpiar cualquier estado inválido
        try {
          await supabase.auth.signOut({ scope: 'local' })
          console.log("Sesión cerrada localmente con éxito después de excepción en middleware")
        } catch (signOutError) {
          console.error("Error al cerrar sesión después de excepción en middleware:", signOutError)
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
    response.headers.set('x-middleware-has-session', session ? 'true' : 'false')

    console.log("Middleware - URL:", url.pathname)
    console.log("Middleware - Session:", session ? `Existe (${session.user.id})` : "No existe")

    // Definir rutas protegidas
    const isProtectedRoute = url.pathname.startsWith('/dashboard') ||
                            url.pathname.startsWith('/training') ||
                            url.pathname.startsWith('/nutrition') ||
                            url.pathname.startsWith('/sleep') ||
                            url.pathname.startsWith('/productivity') ||
                            url.pathname.startsWith('/wellness') ||
                            url.pathname.startsWith('/onboarding');

    // Definir rutas de autenticación
    const isAuthRoute = url.pathname.startsWith('/auth');
    const isLoginPage = url.pathname === '/auth/login';

    // Las rutas de autenticación ahora se manejan directamente en los componentes
    // y no pasan por el middleware para evitar conflictos

    // 2. Manejar rutas protegidas
    if (isProtectedRoute) {
      // Si no está autenticado, redirigir a login con URL de retorno
      if (!session) {
        console.log("Usuario no autenticado intentando acceder a ruta protegida, redirigiendo a login");
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Si está autenticado, verificar si ha completado el onboarding
      try {
        // Solo verificar el onboarding para rutas que no sean de onboarding
        if (!url.pathname.startsWith('/onboarding')) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed, id')
            .eq('user_id', session.user.id)
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
              console.log("Usuario no ha completado onboarding, redirigiendo a onboarding");
              return NextResponse.redirect(new URL('/onboarding/beginner', request.url));
            }
          } else if (error) {
            console.error("Error al obtener perfil en middleware:", error);
            response.headers.set('x-middleware-profile-error', error.message);

            // Si hay un error de permisos o perfil no encontrado, no redirigir a onboarding
            if (error.code === '42501' || error.code === 'PGRST116') {
              console.log("Error de permisos o perfil no encontrado, no redirigir a onboarding");
            }
          }
        }
      } catch (error) {
        console.error("Error inesperado al verificar perfil en middleware:", error);
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
    '/dashboard/:path*',
    '/training/:path*',
    '/nutrition/:path*',
    '/sleep/:path*',
    '/productivity/:path*',
    '/wellness/:path*',
    '/onboarding/:path*',
    '/api/:path*'
  ],
}
