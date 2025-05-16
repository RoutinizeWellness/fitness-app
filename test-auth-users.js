// Script para probar la conexión a Supabase y verificar usuarios
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s";

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('Probando conexión a Supabase...');
    
    // Verificar si podemos obtener datos de la tabla profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return false;
    }
    
    console.log('Conexión exitosa a Supabase');
    return true;
  } catch (error) {
    console.error('Error inesperado al conectar con Supabase:', error);
    return false;
  }
}

// Función para verificar usuarios en auth.users
async function checkAuthUsers() {
  try {
    console.log('Verificando usuarios en auth.users...');
    
    // Intentar obtener usuarios de auth.users
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(5);
    
    if (error) {
      console.error('Error al verificar usuarios en auth.users:', error);
      
      // Intentar con un enfoque alternativo
      console.log('Intentando enfoque alternativo...');
      const { data: userData, error: userError } = await supabase.rpc('create_user_record', {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'default@routinize.com',
        user_role: 'authenticated'
      });
      
      if (userError) {
        console.error('Error al llamar a create_user_record:', userError);
        return false;
      }
      
      console.log('Resultado de create_user_record:', userData);
      return true;
    }
    
    if (!data || data.length === 0) {
      console.log('No se encontraron usuarios en auth.users');
      return false;
    }
    
    console.log('Usuarios encontrados en auth.users:', data);
    return true;
  } catch (error) {
    console.error('Error inesperado al verificar usuarios:', error);
    return false;
  }
}

// Función para verificar la tabla workout_routines
async function checkWorkoutRoutines() {
  try {
    console.log('Verificando tabla workout_routines...');
    
    // Obtener la estructura de la tabla
    const { data, error } = await supabase
      .from('workout_routines')
      .select('id, user_id')
      .limit(1);
    
    if (error) {
      console.error('Error al verificar workout_routines:', error);
      return false;
    }
    
    console.log('Estructura de workout_routines:', data);
    return true;
  } catch (error) {
    console.error('Error inesperado al verificar workout_routines:', error);
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
  
  const authUsersSuccess = await checkAuthUsers();
  const workoutRoutinesSuccess = await checkWorkoutRoutines();
  
  if (authUsersSuccess && workoutRoutinesSuccess) {
    console.log('Todas las pruebas completadas exitosamente.');
  } else {
    console.error('Algunas pruebas fallaron.');
  }
}

// Ejecutar pruebas
main().catch(error => {
  console.error('Error en la ejecución de pruebas:', error);
});
