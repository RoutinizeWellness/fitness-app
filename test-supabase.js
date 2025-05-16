// Script para probar la integración con Supabase
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
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
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

// Función para probar la obtención de ejercicios
async function testGetExercises() {
  try {
    console.log('Probando obtención de ejercicios...');
    const { data, error } = await supabase.from('exercises').select('*').limit(5);
    
    if (error) {
      console.error('Error al obtener ejercicios:', error);
      return false;
    }
    
    console.log(`Se obtuvieron ${data.length} ejercicios:`);
    data.forEach(exercise => {
      console.log(`- ${exercise.name} (${exercise.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('Error inesperado al obtener ejercicios:', error);
    return false;
  }
}

// Función para probar la obtención de rutinas
async function testGetRoutines() {
  try {
    console.log('Probando obtención de rutinas...');
    const { data, error } = await supabase.from('workout_routines').select('*').limit(5);
    
    if (error) {
      console.error('Error al obtener rutinas:', error);
      return false;
    }
    
    console.log(`Se obtuvieron ${data.length} rutinas:`);
    data.forEach(routine => {
      console.log(`- ${routine.name} (${routine.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('Error inesperado al obtener rutinas:', error);
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
  
  await testGetExercises();
  await testGetRoutines();
  
  console.log('Pruebas completadas.');
}

// Ejecutar pruebas
main().catch(error => {
  console.error('Error en la ejecución de pruebas:', error);
});
