/**
 * Utilidad para limpiar cookies corruptas de Supabase
 */

export function clearSupabaseCookies() {
  if (typeof window === 'undefined') return;

  console.log('🧹 Limpiando cookies corruptas de Supabase...');

  // Obtener todas las cookies
  const cookies = document.cookie.split(';');

  let clearedCount = 0;

  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    // Limpiar cookies de Supabase
    if (name.includes('sb-')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      console.log(`🗑️ Cookie eliminada: ${name}`);
      clearedCount++;
    }
  });

  console.log(`✅ Se eliminaron ${clearedCount} cookies de Supabase`);

  // También limpiar localStorage relacionado con Supabase
  try {
    const keys = Object.keys(localStorage);
    let localStorageCleared = 0;

    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
        console.log(`🗑️ LocalStorage eliminado: ${key}`);
        localStorageCleared++;
      }
    });

    console.log(`✅ Se eliminaron ${localStorageCleared} elementos de localStorage`);
  } catch (error) {
    console.warn('⚠️ No se pudo acceder a localStorage:', error);
  }
}

export function checkForCorruptedCookies(): boolean {
  if (typeof window === 'undefined') return false;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    const value = eqPos > -1 ? cookie.substr(eqPos + 1).trim() : '';

    if (name.includes('sb-') && value.includes('base64-')) {
      try {
        // Intentar parsear el valor como JSON
        const decoded = atob(value.replace('base64-', ''));
        JSON.parse(decoded);
      } catch (error) {
        console.warn(`🚨 Cookie corrupta detectada: ${name}`);
        return true;
      }
    }
  }

  return false;
}

export function initializeCookieChecker() {
  if (typeof window === 'undefined') return;

  console.log('🔍 Verificando cookies de Supabase...');

  if (checkForCorruptedCookies()) {
    console.log('🚨 Se detectaron cookies corruptas, limpiando...');
    clearSupabaseCookies();

    // Recargar la página después de limpiar las cookies
    setTimeout(() => {
      console.log('🔄 Recargando página después de limpiar cookies...');
      window.location.reload();
    }, 1000);
  } else {
    console.log('✅ Las cookies de Supabase están en buen estado');
  }
}

export function handleEmptyErrorRecovery() {
  if (typeof window === 'undefined') return false;

  console.log('🔧 Intentando recuperación automática de error vacío...');

  // Verificar si hay cookies corruptas
  if (checkForCorruptedCookies()) {
    console.log('🚨 Cookies corruptas detectadas durante error vacío');
    clearSupabaseCookies();

    // Mostrar mensaje al usuario
    if (typeof window !== 'undefined' && window.confirm) {
      const shouldReload = window.confirm(
        'Se detectaron problemas de autenticación. ¿Deseas recargar la página para solucionarlos?'
      );

      if (shouldReload) {
        window.location.reload();
        return true;
      }
    }
  }

  return false;
}

// Variable global para controlar la frecuencia de limpieza automática
let lastAutoClearTime = 0;
const AUTO_CLEAR_COOLDOWN = 30000; // 30 segundos

export function autoHandleCorruptedCookies() {
  if (typeof window === 'undefined') return false;

  const now = Date.now();

  // Evitar limpiar demasiado frecuentemente
  if (now - lastAutoClearTime < AUTO_CLEAR_COOLDOWN) {
    return false;
  }

  if (checkForCorruptedCookies()) {
    console.log('🧹 Limpieza automática de cookies corruptas...');
    clearSupabaseCookies();
    lastAutoClearTime = now;

    // Mostrar notificación discreta
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Routinize', {
          body: 'Se han limpiado cookies corruptas automáticamente',
          icon: '/favicon.ico'
        });
      }
    }

    return true;
  }

  return false;
}
