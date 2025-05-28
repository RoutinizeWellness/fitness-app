// Manejador mejorado de errores de carga de chunks para Next.js
// Se incluirá en el archivo layout.tsx

(function() {
  // Configuración
  const MAX_RETRIES = 3;                // Número máximo de reintentos reducido para evitar demasiados intentos
  const RETRY_DELAY = 800;              // Retraso entre reintentos (ms) reducido
  const RETRY_BACKOFF_FACTOR = 1.3;     // Factor de retroceso exponencial reducido
  const CLEAR_CACHE_ON_ERROR = true;    // Limpiar caché en error
  const REPORT_ERRORS = true;           // Reportar errores a la consola
  const SHOW_USER_NOTIFICATION = false; // Desactivar notificación al usuario para evitar confusión

  // Seguimiento de intentos de recarga por chunk
  const retryAttempts = {};

  // Almacenar la función original de carga de chunks
  if (!window.__webpack_require__ || !window.__webpack_require__.e) {
    console.warn('El manejador de errores de chunks no pudo inicializarse: __webpack_require__.e no está disponible');
    return;
  }

  const originalLoadChunk = window.__webpack_require__.e;

  // Sobrescribir la función de carga de chunks con nuestro mecanismo de reintento
  window.__webpack_require__.e = function(chunkId) {
    return originalLoadChunk(chunkId).catch(error => {
      // Solo manejar ChunkLoadError y errores de carga de scripts
      if (error && (error.name === 'ChunkLoadError' ||
                    error.message && error.message.includes('Loading chunk') ||
                    error.message && error.message.includes('script error'))) {

        // Inicializar contador de reintentos para este chunk si no existe
        if (!retryAttempts[chunkId]) {
          retryAttempts[chunkId] = 0;
        }

        // Verificar si no hemos excedido el máximo de reintentos
        if (retryAttempts[chunkId] < MAX_RETRIES) {
          retryAttempts[chunkId]++;

          // Calcular retraso con retroceso exponencial
          const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_FACTOR, retryAttempts[chunkId] - 1);

          if (REPORT_ERRORS) {
            console.log(`Error de carga de chunk ${chunkId}. Reintentando (${retryAttempts[chunkId]}/${MAX_RETRIES}) en ${delay}ms...`);
            console.error('Detalles del error:', error);
          }

          // Esperar antes de reintentar
          return new Promise((resolve) => {
            setTimeout(() => {
              // Limpiar caché para este chunk si está habilitado
              if (CLEAR_CACHE_ON_ERROR) {
                try {
                  // Limpiar caché de webpack
                  if (window.webpackJsonp) {
                    Object.keys(window.webpackJsonp).forEach(key => {
                      if (key.startsWith(chunkId + ':')) {
                        delete window.webpackJsonp[key];
                      }
                    });
                  }

                  // Intentar limpiar caché de Next.js
                  if (window.__NEXT_DATA__ && window.__NEXT_DATA__.chunks) {
                    const index = window.__NEXT_DATA__.chunks.indexOf(chunkId.toString());
                    if (index !== -1) {
                      window.__NEXT_DATA__.chunks.splice(index, 1);
                    }
                  }
                } catch (cacheError) {
                  console.warn('Error al limpiar caché:', cacheError);
                }
              }

              // Reintentar cargar el chunk
              resolve(originalLoadChunk(chunkId));
            }, delay);
          });
        }
      }

      // Si se excedieron los reintentos máximos o no es un ChunkLoadError, relanzar
      throw error;
    });
  };

  // Agregar un manejador de errores global para errores de chunk no manejados
  window.addEventListener('error', function(event) {
    // Verificar si es un error de carga de chunk o script
    const isChunkError = event.error &&
      (event.error.name === 'ChunkLoadError' ||
       (event.error.message && event.error.message.includes('Loading chunk')) ||
       (event.error.message && event.error.message.includes('script error')));

    // También detectar errores de carga de script en el evento mismo
    const isScriptError = event.target && event.target.tagName === 'SCRIPT' && event.target.src;

    if (isChunkError || isScriptError) {
      if (REPORT_ERRORS) {
        console.error('Error de carga de módulo no manejado:', event.error || event);
      }

      // Mostrar un mensaje amigable al usuario
      if (SHOW_USER_NOTIFICATION) {
        // Verificar si ya existe una notificación
        const existingNotification = document.getElementById('chunk-error-notification');
        if (existingNotification) {
          return; // Evitar múltiples notificaciones
        }

        const errorContainer = document.createElement('div');
        errorContainer.id = 'chunk-error-notification';
        errorContainer.style.position = 'fixed';
        errorContainer.style.top = '20px';
        errorContainer.style.left = '50%';
        errorContainer.style.transform = 'translateX(-50%)';
        errorContainer.style.backgroundColor = '#f44336';
        errorContainer.style.color = 'white';
        errorContainer.style.padding = '15px';
        errorContainer.style.borderRadius = '4px';
        errorContainer.style.zIndex = '9999';
        errorContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        errorContainer.style.maxWidth = '90%';
        errorContainer.style.width = '400px';
        errorContainer.innerHTML = `
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">⚠️</div>
            <div style="flex: 1;">
              <div style="font-weight: bold; margin-bottom: 5px;">Error al cargar recursos</div>
              <div>Hubo un problema al cargar algunos componentes. Intenta recargar la página o limpiar la caché.</div>
            </div>
            <button style="margin-left: 10px; background: white; color: #f44336; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" onclick="window.location.reload(true)">Recargar</button>
          </div>
        `;

        document.body.appendChild(errorContainer);

        // Eliminar el mensaje de error después de 15 segundos
        setTimeout(() => {
          if (document.body.contains(errorContainer)) {
            document.body.removeChild(errorContainer);
          }
        }, 15000);
      }

      // Prevenir el comportamiento predeterminado para errores de script
      if (isScriptError) {
        event.preventDefault();
      }
    }
  }, true); // Usar captura para interceptar antes de otros manejadores

  // Función para verificar si un error está relacionado con autenticación
  const isAuthError = (error) => {
    if (!error) return false;

    // Extraer el mensaje de error
    const errorMessage = typeof error === 'string'
      ? error
      : (error.message || (error.reason && error.reason.message) || '');

    // Verificar si contiene mensajes relacionados con autenticación
    return (
      errorMessage.includes('Auth session missing') ||
      errorMessage.includes('JWT expired') ||
      errorMessage.includes('AuthSessionMissingError') ||
      errorMessage.includes('PGRST301') ||
      errorMessage.includes('42501') // Código de error de permisos en Postgres
    );
  };

  // Función para manejar errores de autenticación
  const handleAuthError = () => {
    console.warn('Error de autenticación detectado, limpiando tokens...');

    try {
      // Limpiar tokens de autenticación
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.expires_at');
      localStorage.removeItem('session_expiry');

      // Incrementar contador de errores de sesión
      const currentCount = parseInt(localStorage.getItem('session_error_count') || '0', 10);
      localStorage.setItem('session_error_count', (currentCount + 1).toString());
      localStorage.setItem('last_session_error', Date.now().toString());

      // Almacenar indicador de refresco forzado
      localStorage.setItem('force_refresh_after_error', 'true');
      localStorage.setItem('force_refresh_timestamp', Date.now().toString());

      // Verificar si estamos en la página de login
      const isLoginPage = window.location.pathname.startsWith('/auth/login');

      // Si hay demasiados errores, redirigir a login
      if (currentCount > 5 && !isLoginPage) {
        console.log('Demasiados errores de autenticación, redirigiendo a página de login');
        window.location.href = '/auth/login?reason=session_expired';
      } else if (!isLoginPage) {
        // Intentar refrescar la página primero
        console.log('Refrescando página debido a error de autenticación');
        window.location.reload();
      }
    } catch (e) {
      console.error('Error al manejar error de autenticación:', e);
    }
  };

  // Agregar manejador global para errores de autenticación
  window.addEventListener('error', function(event) {
    if (event.error && isAuthError(event.error)) {
      console.warn('Error de autenticación detectado en evento global:', event.error);
      handleAuthError();
      event.preventDefault();
    }
  }, true);

  // Agregar manejador para promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && isAuthError(event.reason)) {
      console.warn('Error de autenticación detectado en promesa rechazada:', event.reason);
      handleAuthError();
      event.preventDefault();
    }
  });

  // Verificar conexión a Supabase periódicamente
  const checkSupabaseConnection = async () => {
    try {
      // Intentar hacer una petición simple a Supabase
      const response = await fetch('https://soviwrzrgskhvgcmujfj.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5NTU5NzYsImV4cCI6MjAxNTUzMTk3Nn0.Gy1Qj5HXyQFGXBE_fLQeKSYKuHbDFxTJ5xqThkHXdXE'
        },
        // Añadir cache: 'no-store' para evitar problemas de caché
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn('Problemas de conexión con Supabase detectados');
      }
    } catch (error) {
      console.warn('Error al verificar la conexión con Supabase:', error);
    }
  };

  // Verificar conexión cada 60 segundos (reducido para disminuir la carga)
  setInterval(checkSupabaseConnection, 60000);

  // Verificar conexión inicial después de 5 segundos para dar tiempo a que la app se cargue
  setTimeout(checkSupabaseConnection, 5000);

  console.log('Manejador de errores de carga de chunks inicializado correctamente');
})();
