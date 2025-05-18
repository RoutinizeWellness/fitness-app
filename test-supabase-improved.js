// Script para probar la conexión mejorada a Supabase
const { createClient } = require('@supabase/supabase-js');

// Usar variables de entorno para las credenciales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s";

// Configuración para reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Clase para mejorar el cliente de Supabase
class EnhancedSupabaseClient {
  constructor() {
    // Crear el cliente de Supabase con opciones mejoradas
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: {
          'x-application-name': 'routinize-fitness-app',
        },
      },
    });

    this.connectionStatus = 'unknown';
    this.connectionPromise = null;
    this.cache = new Map();
    this.CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos por defecto

    // Verificar la conexión al inicializar
    this.checkConnection();
  }

  // Método para acceder al cliente original de Supabase
  get supabase() {
    return this.client;
  }

  // Verificar la conexión a Supabase
  async checkConnection() {
    // Si ya hay una verificación en curso, devolver esa promesa
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Crear una nueva promesa para verificar la conexión
    this.connectionPromise = new Promise(async (resolve) => {
      try {
        console.log("Verificando conexión a Supabase...");
        const { error } = await this.client.from('profiles').select('count', { count: 'exact', head: true });

        if (error) {
          console.error("Error de conexión a Supabase:", error);
          this.connectionStatus = 'disconnected';
          resolve(false);
        } else {
          console.log("Conexión a Supabase establecida correctamente");
          this.connectionStatus = 'connected';
          resolve(true);
        }
      } catch (err) {
        console.error("Error al verificar la conexión con Supabase:", err);
        this.connectionStatus = 'disconnected';
        resolve(false);
      } finally {
        // Limpiar la promesa después de un tiempo para permitir futuras verificaciones
        setTimeout(() => {
          this.connectionPromise = null;
        }, 10000);
      }
    });

    return this.connectionPromise;
  }

  // Método para ejecutar una operación con reintentos
  async withRetry(operation, cacheKey, cacheTTL) {
    // Verificar caché si se proporciona una clave
    if (cacheKey) {
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        return { data: cachedResult, error: null };
      }
    }

    let retries = 0;
    let lastError = null;

    while (retries < MAX_RETRIES) {
      try {
        // Verificar la conexión antes de intentar la operación
        if (this.connectionStatus === 'disconnected') {
          const isConnected = await this.checkConnection();
          if (!isConnected) {
            retries++;
            if (retries < MAX_RETRIES) {
              await this.delay(RETRY_DELAY_MS * retries);
              continue;
            } else {
              return { 
                data: null, 
                error: { message: "No se pudo establecer conexión con Supabase después de varios intentos" }
              };
            }
          }
        }

        // Ejecutar la operación
        const result = await operation();

        // Si hay un error, intentar de nuevo
        if (result.error) {
          lastError = result.error;
          retries++;
          if (retries < MAX_RETRIES) {
            await this.delay(RETRY_DELAY_MS * retries);
            continue;
          }
          return result;
        }

        // Si la operación fue exitosa y hay una clave de caché, guardar el resultado
        if (cacheKey && result.data) {
          this.saveToCache(cacheKey, result.data, cacheTTL);
        }

        return result;
      } catch (e) {
        console.error(`Error en la operación (intento ${retries + 1}/${MAX_RETRIES}):`, e);
        lastError = e instanceof Error 
          ? { message: e.message }
          : { message: "Error desconocido" };
        
        retries++;
        if (retries < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * retries);
        }
      }
    }

    return { data: null, error: lastError };
  }

  // Método para guardar en caché
  saveToCache(key, data, ttl) {
    const timestamp = Date.now();
    this.cache.set(key, { data, timestamp });
    
    // Programar la limpieza de la caché
    const actualTTL = ttl || this.CACHE_TTL_MS;
    setTimeout(() => {
      const cached = this.cache.get(key);
      if (cached && cached.timestamp === timestamp) {
        this.cache.delete(key);
      }
    }, actualTTL);
  }

  // Método para obtener de la caché
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Método para invalidar la caché
  invalidateCache(keyPrefix) {
    if (keyPrefix) {
      // Eliminar solo las entradas que comienzan con el prefijo
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Limpiar toda la caché
      this.cache.clear();
    }
  }

  // Método de utilidad para esperar
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Crear una instancia del cliente mejorado
const enhancedSupabase = new EnhancedSupabaseClient();

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('Probando conexión mejorada a Supabase...');
    
    const isConnected = await enhancedSupabase.checkConnection();
    
    if (!isConnected) {
      console.error('No se pudo establecer conexión con Supabase');
      return false;
    }
    
    console.log('Conexión exitosa a Supabase');
    return true;
  } catch (error) {
    console.error('Error inesperado al conectar con Supabase:', error);
    return false;
  }
}

// Función para probar la obtención de perfiles con reintentos
async function testGetProfiles() {
  try {
    console.log('Probando obtención de perfiles con reintentos...');
    
    const result = await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('profiles')
          .select('*')
          .limit(5);
      },
      'test-profiles'
    );
    
    if (result.error) {
      console.error('Error al obtener perfiles:', result.error);
      return false;
    }
    
    console.log(`Se obtuvieron ${result.data.length} perfiles:`);
    result.data.forEach(profile => {
      console.log(`- ${profile.full_name || 'Sin nombre'} (${profile.user_id})`);
    });
    
    // Probar la caché
    console.log('Probando caché...');
    console.time('Primera llamada');
    await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('profiles')
          .select('*')
          .limit(5);
      },
      'test-profiles'
    );
    console.timeEnd('Primera llamada');
    
    console.time('Segunda llamada (desde caché)');
    await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('profiles')
          .select('*')
          .limit(5);
      },
      'test-profiles'
    );
    console.timeEnd('Segunda llamada (desde caché)');
    
    return true;
  } catch (error) {
    console.error('Error inesperado al obtener perfiles:', error);
    return false;
  }
}

// Función para probar la obtención de ejercicios con reintentos
async function testGetExercises() {
  try {
    console.log('Probando obtención de ejercicios con reintentos...');
    
    const result = await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('exercises')
          .select('*')
          .limit(5);
      },
      'test-exercises'
    );
    
    if (result.error) {
      console.error('Error al obtener ejercicios:', result.error);
      return false;
    }
    
    console.log(`Se obtuvieron ${result.data.length} ejercicios:`);
    result.data.forEach(exercise => {
      console.log(`- ${exercise.name} (${exercise.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('Error inesperado al obtener ejercicios:', error);
    return false;
  }
}

// Función para probar la obtención de rutinas con reintentos
async function testGetRoutines() {
  try {
    console.log('Probando obtención de rutinas con reintentos...');
    
    const result = await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('workout_routines')
          .select('*')
          .limit(5);
      },
      'test-routines'
    );
    
    if (result.error) {
      console.error('Error al obtener rutinas:', result.error);
      return false;
    }
    
    console.log(`Se obtuvieron ${result.data.length} rutinas:`);
    result.data.forEach(routine => {
      console.log(`- ${routine.name} (${routine.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('Error inesperado al obtener rutinas:', error);
    return false;
  }
}

// Función para probar la invalidación de caché
async function testCacheInvalidation() {
  try {
    console.log('Probando invalidación de caché...');
    
    // Obtener datos y guardar en caché
    console.log('Obteniendo datos y guardando en caché...');
    await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('profiles')
          .select('*')
          .limit(5);
      },
      'test-cache-invalidation'
    );
    
    // Invalidar la caché
    console.log('Invalidando caché...');
    enhancedSupabase.invalidateCache('test-cache-invalidation');
    
    // Verificar que la caché fue invalidada
    console.time('Llamada después de invalidar caché');
    await enhancedSupabase.withRetry(
      async () => {
        return await enhancedSupabase.supabase
          .from('profiles')
          .select('*')
          .limit(5);
      },
      'test-cache-invalidation'
    );
    console.timeEnd('Llamada después de invalidar caché');
    
    return true;
  } catch (error) {
    console.error('Error inesperado al probar invalidación de caché:', error);
    return false;
  }
}

// Función principal
async function main() {
  const connectionSuccess = await testConnection();
  
  if (!connectionSuccess) {
    console.error('No se pudo conectar con Supabase. Abortando pruebas.');
    return;
  }
  
  await testGetProfiles();
  await testGetExercises();
  await testGetRoutines();
  await testCacheInvalidation();
  
  console.log('Todas las pruebas completadas.');
}

// Ejecutar pruebas
main().catch(error => {
  console.error('Error en la ejecución de pruebas:', error);
});
