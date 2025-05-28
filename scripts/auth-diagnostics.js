/**
 * Script de Diagnóstico de Autenticación
 * 
 * Este script ayuda a diagnosticar problemas de autenticación en la aplicación.
 * Proporciona información detallada sobre el estado de la sesión, tokens, y errores comunes.
 * 
 * Cómo usar:
 * 1. Abre la consola del navegador en tu aplicación
 * 2. Copia y pega este script completo en la consola
 * 3. Sigue las instrucciones impresas en la consola
 * 4. El script registrará resultados de diagnóstico y proporcionará orientación
 */

console.clear();
console.log('%c Diagnóstico de Autenticación ', 'background: #1B237E; color: white; font-size: 16px; padding: 5px;');
console.log('Este script te ayudará a diagnosticar problemas de autenticación en tu aplicación.');

// Función para crear un registrador de diagnóstico
function createDiagnosticLogger() {
  const results = {
    issues: [],
    warnings: [],
    info: []
  };

  return {
    issue: (name, details = '') => {
      console.log(`%c ✗ PROBLEMA: ${name}`, 'color: red; font-weight: bold;');
      if (details) console.log(`  Detalles: ${details}`);
      results.issues.push({ name, details });
    },
    warning: (name, details = '') => {
      console.log(`%c ⚠ ADVERTENCIA: ${name}`, 'color: orange; font-weight: bold;');
      if (details) console.log(`  Detalles: ${details}`);
      results.warnings.push({ name, details });
    },
    info: (name, details = '') => {
      console.log(`%c ℹ INFO: ${name}`, 'color: blue; font-weight: bold;');
      if (details) console.log(`  Detalles: ${details}`);
      results.info.push({ name, details });
    },
    success: (name, details = '') => {
      console.log(`%c ✓ ÉXITO: ${name}`, 'color: green; font-weight: bold;');
      if (details) console.log(`  Detalles: ${details}`);
    },
    getResults: () => results
  };
}

// Crear un registrador de diagnóstico
const diagnosticLogger = createDiagnosticLogger();

// Verificar si estamos en el dominio correcto
const isCorrectDomain = window.location.hostname.includes('localhost') || 
                        window.location.hostname.includes('routinize');
if (!isCorrectDomain) {
  diagnosticLogger.warning('Este script debe ejecutarse en el dominio de tu aplicación.');
}

// Verificar si Supabase está disponible
const hasSupabase = typeof window.supabase !== 'undefined' || 
                   localStorage.getItem('supabase.auth.token') !== null;
if (hasSupabase) {
  diagnosticLogger.success('Supabase está disponible');
} else {
  diagnosticLogger.warning('Cliente de Supabase no detectado. Algunas pruebas pueden fallar.');
}

// Función para verificar el estado de autenticación
async function checkAuthState() {
  console.log('%c Estado de Autenticación Actual ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  // Verificar localStorage para token de autenticación
  const hasLocalStorageToken = localStorage.getItem('supabase.auth.token') !== null;
  console.log(`Token en localStorage: ${hasLocalStorageToken ? 'Existe' : 'No existe'}`);
  
  // Verificar sessionStorage para token de autenticación
  const hasSessionStorageToken = sessionStorage.getItem('supabase.auth.token') !== null;
  console.log(`Token en sessionStorage: ${hasSessionStorageToken ? 'Existe' : 'No existe'}`);
  
  // Verificar expiración de sesión
  const sessionExpiry = localStorage.getItem('session_expiry');
  if (sessionExpiry) {
    const expiryDate = new Date(sessionExpiry);
    const now = new Date();
    const timeUntilExpiry = expiryDate - now;
    console.log(`La sesión expira en: ${expiryDate.toISOString()}`);
    console.log(`Tiempo hasta expiración: ${Math.floor(timeUntilExpiry / 1000 / 60)} minutos`);
    
    // Advertir si la sesión está a punto de expirar
    if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutos
      diagnosticLogger.warning('La sesión está a punto de expirar', 
        `Expira en ${Math.floor(timeUntilExpiry / 1000 / 60)} minutos`);
    }
  } else {
    console.log('No se encontró información de expiración de sesión');
    
    if (hasLocalStorageToken || hasSessionStorageToken) {
      diagnosticLogger.issue('Token presente pero sin información de expiración', 
        'Esto puede indicar un problema con el manejo de sesiones');
    }
  }
  
  // Intentar obtener sesión de Supabase si está disponible
  if (typeof window.supabase !== 'undefined') {
    try {
      const { data, error } = await window.supabase.auth.getSession();
      if (error) {
        console.error('Error al obtener sesión:', error);
        diagnosticLogger.issue('Error al obtener sesión de Supabase', error.message);
      } else if (data && data.session) {
        console.log('Sesión activa encontrada:', {
          user_id: data.session.user.id,
          expires_at: new Date(data.session.expires_at * 1000).toISOString()
        });
        
        // Verificar si la sesión está a punto de expirar
        const expiresAt = data.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        if (timeUntilExpiry < 5 * 60) { // 5 minutos
          diagnosticLogger.warning('La sesión de Supabase está a punto de expirar', 
            `Expira en ${Math.floor(timeUntilExpiry / 60)} minutos`);
        } else {
          diagnosticLogger.success('Sesión de Supabase válida', 
            `Expira en ${Math.floor(timeUntilExpiry / 60)} minutos`);
        }
      } else {
        console.log('No se encontró sesión activa');
        
        if (hasLocalStorageToken || hasSessionStorageToken) {
          diagnosticLogger.issue('Token presente pero sin sesión activa', 
            'Esto indica un problema con la autenticación');
        } else {
          diagnosticLogger.info('No hay sesión activa ni tokens', 
            'El usuario no está autenticado');
        }
      }
    } catch (e) {
      console.error('Excepción al obtener sesión:', e);
      diagnosticLogger.issue('Excepción al obtener sesión de Supabase', e.message);
    }
  }
  
  // Verificar cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  const authCookies = cookies.filter(c => 
    c.startsWith('sb-') || 
    c.includes('auth') || 
    c.includes('supabase') || 
    c.includes('session')
  );
  
  console.log('Cookies relacionadas con autenticación:', authCookies);
  
  if (authCookies.length === 0 && (hasLocalStorageToken || hasSessionStorageToken)) {
    diagnosticLogger.warning('No se encontraron cookies de autenticación pero hay tokens', 
      'Esto puede indicar un problema con el manejo de cookies');
  }
  
  return {
    hasLocalStorageToken,
    hasSessionStorageToken,
    sessionExpiry: sessionExpiry ? new Date(sessionExpiry) : null,
    authCookies
  };
}

// Función para verificar localStorage
function checkLocalStorage() {
  console.log('%c Items en localStorage ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  const authRelatedItems = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('auth') || key.includes('token') || key.includes('session') || 
        key.includes('user') || key.includes('profile') || key.includes('supabase')) {
      try {
        const value = localStorage.getItem(key);
        authRelatedItems[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
      } catch (e) {
        authRelatedItems[key] = '[Error al leer valor]';
      }
    }
  }
  
  console.table(authRelatedItems);
  
  // Verificar inconsistencias
  if (authRelatedItems['supabase.auth.token'] && !authRelatedItems['session_expiry']) {
    diagnosticLogger.issue('Token presente pero sin información de expiración', 
      'Esto puede causar problemas con la renovación de sesiones');
  }
  
  return authRelatedItems;
}

// Función para verificar sessionStorage
function checkSessionStorage() {
  console.log('%c Items en sessionStorage ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  const authRelatedItems = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key.includes('auth') || key.includes('token') || key.includes('session') || 
        key.includes('user') || key.includes('profile') || key.includes('supabase')) {
      try {
        const value = sessionStorage.getItem(key);
        authRelatedItems[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
      } catch (e) {
        authRelatedItems[key] = '[Error al leer valor]';
      }
    }
  }
  
  console.table(authRelatedItems);
  return authRelatedItems;
}

// Función para limpiar datos de autenticación
function clearAuthData() {
  console.log('%c Limpiando Datos de Autenticación ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  // Limpiar items específicos de Supabase
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('session_expiry');
  
  // Limpiar items específicos de la aplicación
  localStorage.removeItem('lastProfile');
  localStorage.removeItem('lastRoute');
  localStorage.removeItem('auth_return_url');
  localStorage.removeItem('google_auth_start');
  localStorage.removeItem('auth_success');
  localStorage.removeItem('last_login');
  sessionStorage.removeItem('profile_error');
  
  console.log('Datos de autenticación limpiados del almacenamiento');
  
  // Intentar cerrar sesión en Supabase si está disponible
  if (typeof window.supabase !== 'undefined') {
    window.supabase.auth.signOut()
      .then(() => console.log('Sesión cerrada en Supabase'))
      .catch(err => console.error('Error al cerrar sesión en Supabase:', err));
  }
}

// Función para verificar problemas de redirección
function checkRedirectionIssues() {
  console.log('%c Verificando Problemas de Redirección ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  // Verificar URL actual
  const currentPath = window.location.pathname;
  console.log('Ruta actual:', currentPath);
  
  // Verificar parámetros de consulta
  const searchParams = new URLSearchParams(window.location.search);
  const reason = searchParams.get('reason');
  const returnUrl = searchParams.get('returnUrl');
  
  if (reason) {
    console.log('Razón de redirección:', reason);
    diagnosticLogger.info('Redirección con razón', reason);
    
    if (reason === 'session_expired' || reason === 'session_missing') {
      diagnosticLogger.issue('Sesión expirada o faltante', 
        'La sesión anterior expiró o no se encontró');
    }
  }
  
  if (returnUrl) {
    console.log('URL de retorno:', returnUrl);
    diagnosticLogger.info('Redirección con URL de retorno', returnUrl);
  }
  
  // Verificar última ruta visitada
  const lastRoute = localStorage.getItem('lastRoute');
  if (lastRoute) {
    console.log('Última ruta visitada:', lastRoute);
    
    if (lastRoute !== currentPath && currentPath.startsWith('/auth/login')) {
      diagnosticLogger.info('Redirigido desde otra página', 
        `De ${lastRoute} a ${currentPath}`);
    }
  }
}

// Hacer disponibles las funciones globalmente
window.checkAuthState = checkAuthState;
window.checkLocalStorage = checkLocalStorage;
window.checkSessionStorage = checkSessionStorage;
window.clearAuthData = clearAuthData;
window.checkRedirectionIssues = checkRedirectionIssues;
window.diagnosticLogger = diagnosticLogger;

// Ejecutar diagnóstico inicial
console.log('\n%c Ejecutando Diagnóstico Inicial ', 'background: #333; color: white; font-size: 14px; padding: 3px;');
checkAuthState().then(() => {
  checkLocalStorage();
  checkSessionStorage();
  checkRedirectionIssues();
  
  console.log('\n%c Diagnóstico Completado ', 'background: green; color: white; font-size: 16px; padding: 5px;');
  console.log(`
Problemas encontrados: ${diagnosticLogger.getResults().issues.length}
Advertencias: ${diagnosticLogger.getResults().warnings.length}
Información: ${diagnosticLogger.getResults().info.length}

Usa las siguientes funciones para realizar más diagnósticos:
- checkAuthState() - Verificar el estado de autenticación actual
- checkLocalStorage() - Verificar items relacionados con autenticación en localStorage
- checkSessionStorage() - Verificar items relacionados con autenticación en sessionStorage
- clearAuthData() - Limpiar todos los datos de autenticación
- checkRedirectionIssues() - Verificar problemas de redirección
- diagnosticLogger.getResults() - Obtener un resumen de los resultados del diagnóstico
  `);
});
