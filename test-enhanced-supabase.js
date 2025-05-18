// Script para probar la conexión mejorada a Supabase
const { enhancedSupabase } = require('./lib/enhanced-supabase-client');

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
