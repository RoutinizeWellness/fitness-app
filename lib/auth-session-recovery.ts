'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/components/ui/use-toast'
import { AuthError } from '@supabase/supabase-js'

/**
 * Intenta recuperar una sesión refrescando el token
 * @returns Promise<boolean> indicando si la recuperación fue exitosa
 */
export async function attemptSessionRecovery(): Promise<boolean> {
  try {
    console.log("Intentando recuperar sesión...");

    // Verificar si estamos en un entorno de navegador
    if (typeof window === 'undefined') {
      console.log("Recuperación de sesión no disponible en entorno de servidor");
      return false;
    }

    // Crear cliente de Supabase
    const supabase = createClientComponentClient();

    // Verificar si hay tokens en localStorage/sessionStorage como prueba rápida
    const hasLocalStorageToken = !!localStorage.getItem('supabase.auth.token');
    const hasSessionStorageToken = !!sessionStorage.getItem('supabase.auth.token');
    const hasExpiryTime = !!localStorage.getItem('session_expiry');

    console.log("Estado de tokens:", {
      localStorageToken: hasLocalStorageToken,
      sessionStorageToken: hasSessionStorageToken,
      expiryTimeExists: hasExpiryTime
    });

    // Verificar si hay un perfil en la base de datos para el usuario actual
    try {
      // Obtener la sesión actual para verificar el usuario
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user?.id) {
        const userId = sessionData.session.user.id;
        console.log("Verificando perfil para el usuario:", userId);

        // Verificar si existe un perfil para este usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError) {
          console.error("Error al verificar perfil:", profileError);
        } else if (!profileData) {
          console.log("No se encontró perfil para el usuario, intentando crear uno");

          // Crear un perfil por defecto
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: sessionData.session.user.email || 'Usuario',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              onboarding_completed: false,
              experience_level: 'beginner',
              interface_mode: 'beginner'
            });

          if (insertError) {
            console.error("Error al crear perfil:", insertError);
          } else {
            console.log("Perfil creado exitosamente");
          }
        } else {
          console.log("Perfil encontrado para el usuario");
        }
      }
    } catch (profileCheckError) {
      console.error("Error al verificar/crear perfil:", profileCheckError);
    }

    // Si no hay ningún token, no hay nada que recuperar
    if (!hasLocalStorageToken && !hasSessionStorageToken && !hasExpiryTime) {
      console.log("No se encontraron tokens para recuperar");
      return false;
    }

    // Primero verificar si tenemos una sesión
    let sessionData = null;

    try {
      // Intentar obtener la sesión con manejo de errores
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        sessionData = data;

        if (sessionError) {
          console.error("Error al obtener sesión:", sessionError);
          console.error("Tipo de error:", typeof sessionError);
          console.error("Propiedades del error:", Object.keys(sessionError));

          if (sessionError instanceof Error) {
            console.error("Nombre del error:", sessionError.name);
            console.error("Mensaje del error:", sessionError.message);
            console.error("Stack del error:", sessionError.stack);
          }

          // Manejar específicamente el error AuthSessionMissingError
          if (sessionError.message?.includes('Auth session missing')) {
            console.log("Sesión de autenticación faltante, limpiando estado");

            // Limpiar tokens obsoletos
            clearAuthTokens();

            // Intentar cerrar sesión para limpiar cualquier estado inválido
            try {
              await supabase.auth.signOut({ scope: 'local' });
              console.log("Sesión cerrada localmente después de error de sesión faltante");
            } catch (signOutError) {
              console.error("Error al cerrar sesión después de error de sesión faltante:", signOutError);
            }

            return false;
          }

          return false;
        }
      } catch (getSessionError) {
        console.error("Error inesperado al obtener sesión:", getSessionError);

        if (getSessionError instanceof Error) {
          console.error("Nombre del error:", getSessionError.name);
          console.error("Mensaje del error:", getSessionError.message);
          console.error("Stack del error:", getSessionError.stack);
        }

        // Intentar limpiar tokens como medida de precaución
        clearAuthTokens();
        return false;
      }
    } catch (sessionCatchError) {
      console.error("Excepción al obtener sesión:", sessionCatchError);

      // Manejar específicamente el error AuthSessionMissingError como excepción
      if (sessionCatchError instanceof Error && sessionCatchError.message?.includes('Auth session missing')) {
        console.log("Excepción de sesión de autenticación faltante capturada");

        // Limpiar tokens obsoletos
        clearAuthTokens();

        // Intentar cerrar sesión para limpiar cualquier estado inválido
        try {
          // Use the unified authentication system
          const { supabaseAuth } = await import('@/lib/auth/supabase-auth');
          await supabaseAuth.signOut();
          console.log("Sesión cerrada localmente después de excepción de sesión faltante");
        } catch (signOutError) {
          console.error("Error al cerrar sesión después de excepción de sesión faltante:", signOutError);
        }

        return false;
      }

      return false;
    }

    // Verificar si tenemos una sesión válida
    if (!sessionData || !sessionData.session) {
      console.log("No se encontró sesión para recuperar");

      // Si tenemos un token en localStorage pero no hay sesión, el token podría ser inválido
      if (hasLocalStorageToken || hasSessionStorageToken) {
        console.log("Limpiando tokens potencialmente inválidos");
        clearAuthTokens();
      }

      return false;
    }

    // Verificar si la sesión está expirada o a punto de expirar
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const timeUntilExpiry = expiresAt - now;

    // Almacenar información de expiración para depuración
    if (typeof window !== 'undefined') {
      localStorage.setItem('session_expiry', new Date(expiresAt * 1000).toISOString());
      localStorage.setItem('session_time_remaining', timeUntilExpiry.toString());
    }

    console.log(`Sesión expira en: ${new Date(expiresAt * 1000).toISOString()}`);
    console.log(`Tiempo hasta expiración: ${timeUntilExpiry} segundos`);

    // Determinar si necesitamos refrescar el token
    const needsRefresh = timeUntilExpiry < 15 * 60 || timeUntilExpiry <= 0;

    if (!needsRefresh) {
      console.log("Sesión válida y no necesita refresco");
      return true;
    }

    if (timeUntilExpiry <= 0) {
      console.log("Sesión expirada, intentando refrescar");
    } else {
      console.log("Sesión a punto de expirar, intentando refrescar");
    }

    // Intentar refrescar la sesión
    try {
      console.log("Intentando refrescar sesión con supabase.auth.refreshSession()");

      // Verificar si hay una sesión actual antes de intentar refrescarla
      const { data: currentSession } = await supabase.auth.getSession();

      if (!currentSession || !currentSession.session) {
        console.log("No hay sesión actual para refrescar, intentando iniciar sesión anónima");

        // Intentar iniciar sesión anónima como último recurso
        try {
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();

          if (anonError) {
            console.error("Error al iniciar sesión anónima:", anonError);
            return false;
          }

          if (anonData && anonData.session) {
            console.log("Sesión anónima creada con éxito");
            return true;
          }
        } catch (anonError) {
          console.error("Error inesperado al iniciar sesión anónima:", anonError);
        }
      }

      // Intentar refrescar la sesión
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Falló el refresco de sesión:", error);
        console.error("Tipo de error:", typeof error);
        console.error("Propiedades del error:", Object.keys(error));

        if (error instanceof Error) {
          console.error("Nombre del error:", error.name);
          console.error("Mensaje del error:", error.message);
          console.error("Stack del error:", error.stack);
        }

        // Si el refresco falla con un error de autenticación, limpiar la sesión
        if (error.message?.includes('JWT expired') ||
            error.message?.includes('token is expired') ||
            error.message?.includes('Auth session missing')) {

          console.log("JWT expirado o faltante, limpiando sesión");

          // Limpiar tokens obsoletos
          clearAuthTokens();

          // Intentar cerrar sesión para limpiar cualquier estado inválido
          try {
            // Use the unified authentication system
            const { supabaseAuth } = await import('@/lib/auth/supabase-auth');
            await supabaseAuth.signOut();
            console.log("Sesión cerrada localmente con éxito");
          } catch (signOutError) {
            console.error("Error al cerrar sesión:", signOutError);
          }

          // Intentar iniciar sesión anónima como último recurso
          try {
            console.log("Intentando iniciar sesión anónima después de error de autenticación");
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();

            if (anonError) {
              console.error("Error al iniciar sesión anónima:", anonError);
              return false;
            }

            if (anonData && anonData.session) {
              console.log("Sesión anónima creada con éxito después de error de autenticación");
              return true;
            }
          } catch (anonError) {
            console.error("Error inesperado al iniciar sesión anónima:", anonError);
          }
        }

        return false;
      }

      // Verificar que tenemos una sesión refrescada
      if (data.session) {
        // Almacenar información de la sesión refrescada
        const newExpiresAt = data.session.expires_at;
        console.log("Sesión recuperada con éxito, expira en:",
          new Date(newExpiresAt * 1000).toISOString());

        // Almacenar nueva información de expiración
        if (typeof window !== 'undefined') {
          localStorage.setItem('session_expiry', new Date(newExpiresAt * 1000).toISOString());
          localStorage.setItem('session_refreshed_at', new Date().toISOString());
        }

        return true;
      }

      return false;
    } catch (refreshError) {
      console.error("Excepción durante el refresco de sesión:", refreshError);

      // Manejar AuthSessionMissingError específicamente
      if (refreshError instanceof Error && refreshError.message?.includes('Auth session missing')) {
        console.log("AuthSessionMissingError capturado, limpiando estado de sesión");

        // Limpiar tokens obsoletos
        clearAuthTokens();

        // Intentar cerrar sesión para limpiar cualquier estado inválido
        try {
          // Use the unified authentication system
          const { supabaseAuth } = await import('@/lib/auth/supabase-auth');
          await supabaseAuth.signOut();
          console.log("Sesión cerrada localmente con éxito después de error");
        } catch (signOutError) {
          console.error("Error al cerrar sesión después de error:", signOutError);
        }
      }

      // Manejar errores de sintaxis JSON (cuando se recibe HTML en lugar de JSON)
      if (refreshError instanceof SyntaxError && refreshError.message.includes('Unexpected token')) {
        console.error("Error de sintaxis JSON detectado durante el refresco de sesión");
        console.error("Mensaje de error completo:", refreshError.message);

        // Registrar información detallada sobre el error
        console.log("Información detallada del error:");
        console.log("- Tipo de error:", refreshError.name);
        console.log("- Mensaje:", refreshError.message);
        console.log("- Stack:", refreshError.stack);

        // Intentar una estrategia alternativa: usar la API de servidor
        try {
          console.log('Intentando recuperar sesión a través de la API del servidor...');

          // Intentar obtener el token de actualización de varias fuentes
          let refreshToken = localStorage.getItem('supabase.auth.refreshToken') ||
                            sessionStorage.getItem('supabase.auth.refreshToken');

          // Buscar en otras ubicaciones posibles
          if (!refreshToken) {
            console.log('Buscando token de actualización en ubicaciones alternativas...');

            // Buscar en el objeto de sesión almacenado
            const storedSession = localStorage.getItem('supabase.auth.token');
            if (storedSession) {
              try {
                const sessionData = JSON.parse(storedSession);
                if (sessionData?.refresh_token) {
                  refreshToken = sessionData.refresh_token;
                  console.log('Token de actualización encontrado en supabase.auth.token');
                }
              } catch (parseError) {
                console.error('Error al analizar supabase.auth.token:', parseError);
              }
            }
          }

          if (refreshToken) {
            console.log('Token de actualización encontrado, intentando recuperar sesión...');

            const response = await fetch('/api/auth/refresh-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
              credentials: 'include'
            });

            console.log('Respuesta de la API de recuperación de sesión:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            });

            if (response.ok) {
              try {
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                  const result = await response.json();
                  console.log('Resultado de la API de recuperación de sesión:', result);

                  if (result.success) {
                    console.log('Sesión recuperada correctamente a través de la API');

                    // Intentar obtener la sesión actual para verificar
                    try {
                      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                      if (!sessionError && sessionData.session) {
                        console.log('Sesión verificada después de la recuperación');

                        // Almacenar información de la sesión recuperada
                        if (typeof window !== 'undefined' && sessionData.session.expires_at) {
                          localStorage.setItem('session_expiry', new Date(sessionData.session.expires_at * 1000).toISOString());
                          localStorage.setItem('session_refreshed_at', new Date().toISOString());
                        }

                        return true;
                      } else {
                        console.error('La sesión no pudo ser verificada después de la recuperación:', sessionError);
                      }
                    } catch (verifyError) {
                      console.error('Error al verificar la sesión después de la recuperación:', verifyError);
                    }

                    return true;
                  } else {
                    console.error('La API de recuperación de sesión falló:', result.error);
                  }
                } else {
                  console.error('La respuesta de la API no es JSON:', contentType);

                  // Intentar obtener el texto de la respuesta para depuración
                  try {
                    const textResponse = await response.text();
                    console.error('Respuesta no JSON de la API:', textResponse.substring(0, 200) + '...');
                  } catch (textError) {
                    console.error('Error al obtener el texto de la respuesta:', textError);
                  }
                }
              } catch (jsonError) {
                console.error('Error al analizar respuesta JSON de la API:', jsonError);
              }
            } else {
              console.error('La API de recuperación de sesión devolvió un error:', response.status, response.statusText);

              // Intentar obtener el texto de la respuesta para depuración
              try {
                const textResponse = await response.text();
                console.error('Respuesta de error de la API:', textResponse.substring(0, 200) + '...');
              } catch (textError) {
                console.error('Error al obtener el texto de la respuesta de error:', textError);
              }
            }
          } else {
            console.error('No se encontró token de actualización');
          }
        } catch (apiError) {
          console.error('Error al intentar recuperar la sesión a través de la API:', apiError);

          // Registrar información detallada sobre el error
          if (apiError instanceof Error) {
            console.error("Información detallada del error de API:");
            console.error("- Tipo de error:", apiError.name);
            console.error("- Mensaje:", apiError.message);
            console.error("- Stack:", apiError.stack);
          }
        }

        // Si todo falla, limpiar tokens
        console.log('Limpiando tokens después de fallar todos los intentos de recuperación');
        clearAuthTokens();
      }

      return false;
    }
  } catch (error) {
    console.error("Error durante la recuperación de sesión:", error);
    return false;
  }
}

/**
 * Función auxiliar para limpiar tokens de autenticación
 */
function clearAuthTokens() {
  if (typeof window === 'undefined') return;

  // Limpiar tokens específicos de Supabase
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('session_expiry');

  // Limpiar otros datos relacionados con la sesión
  localStorage.removeItem('auth_return_url');
  localStorage.removeItem('google_auth_start');
  localStorage.removeItem('auth_success');
  localStorage.removeItem('last_login');
  sessionStorage.removeItem('profile_error');

  console.log("Tokens de autenticación limpiados");
}

/**
 * Verifica si la sesión actual es válida e intenta recuperarla si es necesario
 * @param showToast Si se debe mostrar una notificación toast en caso de éxito/fallo
 * @returns Promise<boolean> indicando si la sesión es válida
 */
export async function ensureValidSession(showToast: boolean = false): Promise<boolean> {
  try {
    // Verificar si estamos en un entorno de navegador
    if (typeof window === 'undefined') {
      console.log("Verificación de sesión no disponible en entorno de servidor");
      return false;
    }

    // Crear cliente de Supabase
    const supabase = createClientComponentClient();

    // Verificar si tenemos una sesión
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();

      // Si hay un error al obtener la sesión
      if (error) {
        console.error("Error al verificar sesión:", error);

        // Si el error es de sesión faltante, intentar limpiar el estado
        if (error.message?.includes('Auth session missing')) {
          clearAuthTokens();

          if (showToast) {
            toast({
              title: "Sesión expirada",
              description: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
              variant: "destructive",
            });
          }
        }

        return false;
      }

      // Si no hay sesión
      if (!sessionData.session) {
        console.log("No hay sesión activa");

        if (showToast) {
          toast({
            title: "No hay sesión activa",
            description: "Por favor, inicia sesión para continuar.",
            variant: "destructive",
          });
        }

        return false;
      }

      // Verificar si la sesión está a punto de expirar (dentro de 10 minutos)
      const expiresAt = sessionData.session.expires_at;
      const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
      const tenMinutesInSeconds = 10 * 60;
      const timeUntilExpiry = expiresAt - now;

      // Almacenar información de expiración para depuración
      if (typeof window !== 'undefined') {
        localStorage.setItem('session_expiry', new Date(expiresAt * 1000).toISOString());
        localStorage.setItem('session_time_remaining', timeUntilExpiry.toString());
        localStorage.setItem('session_checked_at', new Date().toISOString());
      }

      // Si la sesión está a punto de expirar, intentar refrescarla
      if (timeUntilExpiry < tenMinutesInSeconds) {
        console.log("Sesión a punto de expirar, intentando refrescar...");
        const recovered = await attemptSessionRecovery();

        if (recovered) {
          console.log("Sesión refrescada con éxito");

          if (showToast) {
            toast({
              title: "Sesión actualizada",
              description: "Tu sesión ha sido actualizada correctamente.",
            });
          }

          return true;
        } else {
          console.log("No se pudo refrescar la sesión");

          if (showToast) {
            toast({
              title: "Error al actualizar sesión",
              description: "No se pudo actualizar tu sesión. Por favor, inicia sesión de nuevo.",
              variant: "destructive",
            });
          }

          return false;
        }
      }

      // Sesión válida y no a punto de expirar
      console.log("Sesión válida", {
        expiresAt: new Date(expiresAt * 1000).toISOString(),
        timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)} minutos`
      });

      return true;
    } catch (sessionError) {
      console.error("Excepción al verificar sesión:", sessionError);

      // Intentar recuperación como último recurso
      const recovered = await attemptSessionRecovery();

      if (!recovered && showToast) {
        toast({
          title: "Error de sesión",
          description: "Hubo un problema con tu sesión. Por favor, inicia sesión de nuevo.",
          variant: "destructive",
        });
      }

      return recovered;
    }
  } catch (error) {
    console.error("Error general al verificar validez de sesión:", error);
    return false;
  }
}

/**
 * Componente que inicializa la recuperación de sesión
 * Este componente no renderiza nada visible y debe incluirse una vez en la raíz de la aplicación
 */
export function AuthSessionRecovery() {
  // Ejecutar recuperación de sesión inmediatamente
  attemptSessionRecovery();

  // Ejecutar recuperación de sesión cada 5 minutos
  setInterval(attemptSessionRecovery, 5 * 60 * 1000);

  return null;
}

/**
 * Maneja errores de autenticación y muestra mensajes apropiados
 * @param error El error de autenticación
 * @param showToast Si se debe mostrar una notificación toast
 * @returns Un mensaje de error amigable para el usuario
 */
export function handleAuthError(error: any, showToast: boolean = true): string {
  let errorMessage = "Error de autenticación desconocido";

  if (!error) {
    return errorMessage;
  }

  // Extraer el mensaje de error
  const message = error.message || (typeof error === 'string' ? error : JSON.stringify(error));

  // Registrar el error para depuración
  console.error("Error de autenticación:", error);

  // Mapear códigos de error comunes a mensajes amigables para el usuario
  if (message.includes('Auth session missing')) {
    errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
  } else if (message.includes('JWT expired') || message.includes('token is expired')) {
    errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
  } else if (message.includes('Invalid login credentials')) {
    errorMessage = "Credenciales de inicio de sesión inválidas. Por favor, verifica tu correo y contraseña.";
  } else if (message.includes('Email not confirmed')) {
    errorMessage = "Tu correo electrónico no ha sido confirmado. Por favor, revisa tu bandeja de entrada.";
  } else if (message.includes('User not found')) {
    errorMessage = "Usuario no encontrado. Por favor, verifica tu correo electrónico.";
  } else if (message.includes('Email already in use')) {
    errorMessage = "Este correo electrónico ya está en uso. Por favor, utiliza otro o inicia sesión.";
  } else if (message.includes('Password should be at least')) {
    errorMessage = "La contraseña debe tener al menos 6 caracteres.";
  } else if (message.includes('rate limit')) {
    errorMessage = "Demasiados intentos. Por favor, espera unos minutos antes de intentarlo de nuevo.";
  } else if (message.includes('No user found with that email')) {
    errorMessage = "No se encontró ningún usuario con ese correo electrónico.";
  } else if (message.includes('New password should be different')) {
    errorMessage = "La nueva contraseña debe ser diferente a la actual.";
  } else if (message.includes('For security purposes, you can only request this once every 60 seconds')) {
    errorMessage = "Por seguridad, solo puedes solicitar esto una vez cada 60 segundos. Por favor, espera un momento.";
  } else if (message.includes('Unable to validate email')) {
    errorMessage = "No se pudo validar el correo electrónico. Por favor, verifica que sea correcto.";
  } else if (message.includes('Network error')) {
    errorMessage = "Error de red. Por favor, verifica tu conexión a internet e inténtalo de nuevo.";
  } else if (message.includes('timeout')) {
    errorMessage = "La operación ha excedido el tiempo de espera. Por favor, inténtalo de nuevo.";
  } else if (message.includes('Unexpected token') && message.includes('<!DOCTYPE')) {
    errorMessage = "Error de conexión con el servidor. Por favor, intenta de nuevo más tarde.";
  } else {
    // Usar el mensaje de error original si no tenemos un mapeo específico
    errorMessage = `Error: ${message}`;
  }

  // Mostrar notificación toast si se solicita
  if (showToast) {
    toast({
      title: "Error de autenticación",
      description: errorMessage,
      variant: "destructive",
    });
  }

  // Intentar limpiar tokens si el error está relacionado con la sesión
  if (message.includes('session') || message.includes('token') || message.includes('JWT')) {
    if (typeof window !== 'undefined') {
      clearAuthTokens();
    }
  }

  return errorMessage;
}

/**
 * Función auxiliar para realizar solicitudes fetch con manejo de errores mejorado
 * @param url URL a la que se realizará la solicitud
 * @param options Opciones de la solicitud fetch
 * @returns Promesa con la respuesta JSON
 */
export async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    // Asegurar que se incluyan las cookies para la autenticación
    const fetchOptions: RequestInit = {
      ...options,
      credentials: 'include'
    };

    // Realizar la solicitud
    const response = await fetch(url, fetchOptions);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Verificar el tipo de contenido antes de intentar analizar como JSON
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        // Si es JSON, intentar obtener los detalles del error
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      } else {
        // Si no es JSON, lanzar un error genérico
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    // Verificar el tipo de contenido antes de intentar analizar como JSON
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      throw new Error('La respuesta no es JSON');
    }
  } catch (error) {
    // Manejar errores de sintaxis JSON (cuando se recibe HTML en lugar de JSON)
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      console.error("Error de sintaxis JSON detectado, probablemente recibiendo HTML en lugar de JSON");

      // Intentar recuperar la sesión como último recurso
      await attemptSessionRecovery();

      // Propagar un error más descriptivo
      throw new Error("Error de conexión con el servidor. Por favor, intenta de nuevo más tarde.");
    }

    // Propagar otros errores
    throw error;
  }
}

/**
 * Función para realizar un reintento de operaciones con Supabase
 * @param operation La operación a reintentar
 * @param maxRetries Número máximo de reintentos
 * @param delayMs Retraso entre reintentos en milisegundos
 * @returns El resultado de la operación
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  let attemptedRecovery = false;
  let attemptedAnonymousAuth = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Registrar información sobre el intento actual
      console.log(`Ejecutando operación (intento ${attempt}/${maxRetries})...`);
      const startTime = Date.now();

      // Ejecutar la operación
      const result = await operation();

      // Registrar tiempo de ejecución
      const endTime = Date.now();
      console.log(`Operación completada en ${endTime - startTime}ms`);

      return result;
    } catch (error) {
      lastError = error;
      console.error(`Intento ${attempt}/${maxRetries} falló:`, error);

      // Registrar información detallada sobre el error
      if (error instanceof Error) {
        console.error("Información detallada del error:");
        console.error("- Tipo de error:", error.name);
        console.error("- Mensaje:", error.message);
        console.error("- Stack:", error.stack);
      }

      // Manejar específicamente el error AuthSessionMissingError
      if (error instanceof Error && error.message?.includes('Auth session missing')) {
        console.log("AuthSessionMissingError detectado en withRetry, intentando recuperar sesión");

        if (!attemptedRecovery) {
          // Intentar recuperar la sesión (solo una vez por operación)
          attemptedRecovery = true;
          const recovered = await attemptSessionRecovery();

          if (recovered) {
            console.log("Sesión recuperada, reintentando operación");
            // Si la recuperación fue exitosa, intentar de nuevo inmediatamente
            continue;
          } else {
            console.log("No se pudo recuperar la sesión, intentando autenticación anónima");

            // Intentar autenticación anónima como último recurso
            if (!attemptedAnonymousAuth) {
              attemptedAnonymousAuth = true;

              try {
                // Intentar usar la API route para autenticación anónima
                const response = await fetch('/api/auth/anonymous-auth', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include'
                });

                if (response.ok) {
                  const result = await response.json();

                  if (result.success) {
                    console.log("Autenticación anónima exitosa, reintentando operación");
                    continue;
                  }
                }
              } catch (anonError) {
                console.error("Error al intentar autenticación anónima:", anonError);
              }
            }

            console.log("No se pudo recuperar la sesión ni crear una anónima, limpiando tokens");
            clearAuthTokens();

            // Si no se pudo recuperar la sesión, propagar un error más amigable
            throw new Error("Tu sesión ha expirado. Por favor, refresca la página o inicia sesión de nuevo.");
          }
        } else {
          console.log("Ya se intentó recuperar la sesión anteriormente, no se reintentará");
        }
      }

      // Manejar errores de sintaxis JSON (cuando se recibe HTML en lugar de JSON)
      if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
        console.error("Error de sintaxis JSON detectado, probablemente recibiendo HTML en lugar de JSON");

        if (!attemptedRecovery) {
          // Intentar recuperar la sesión como último recurso (solo una vez)
          attemptedRecovery = true;
          console.log("Intentando recuperar sesión como último recurso");
          await attemptSessionRecovery();
        }

        // Propagar un error más descriptivo
        throw new Error("Error de conexión con el servidor. Por favor, intenta de nuevo más tarde.");
      }

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        // Esperar con backoff exponencial
        const backoffDelay = delayMs * Math.pow(2, attempt - 1);
        console.log(`Reintentando en ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  if (lastError instanceof Error) {
    // Crear un error más amigable para el usuario
    if (lastError.message?.includes('Auth session missing') ||
        lastError.message?.includes('JWT expired') ||
        lastError.message?.includes('token is expired')) {
      throw new Error("Tu sesión ha expirado. Por favor, refresca la página o inicia sesión de nuevo.");
    }
  }

  throw lastError;
}
