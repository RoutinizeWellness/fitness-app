// Script para probar la conexión a Supabase y verificar workout_routines
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s";

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para generar un UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

// Función para verificar la tabla workout_routines
async function checkWorkoutRoutines() {
  try {
    console.log('Verificando tabla workout_routines...');
    
    // Obtener la estructura de la tabla
    const { data, error } = await supabase
      .from('workout_routines')
      .select('id, user_id, name')
      .limit(5);
    
    if (error) {
      console.error('Error al verificar workout_routines:', error);
      return false;
    }
    
    console.log('Rutinas existentes:', data);
    
    if (data && data.length > 0) {
      console.log('Usuario válido encontrado:', data[0].user_id);
      return data[0].user_id;
    } else {
      console.log('No hay rutinas existentes');
      return null;
    }
  } catch (error) {
    console.error('Error inesperado al verificar workout_routines:', error);
    return false;
  }
}

// Función para crear una rutina de prueba
async function createTestRoutine(userId) {
  try {
    if (!userId) {
      console.log('No se proporcionó un ID de usuario válido');
      return false;
    }
    
    console.log('Creando rutina de prueba para usuario:', userId);
    
    // Crear una rutina de prueba
    const routine = {
      id: generateUUID(),
      user_id: userId,
      name: 'Rutina de prueba',
      description: 'Esta es una rutina de prueba',
      level: 'intermediate',
      is_template: false,
      exercises: [
        {
          id: generateUUID(),
          name: 'Día 1',
          description: 'Día de prueba',
          target_muscle_groups: ['chest', 'triceps'],
          difficulty: 'intermediate',
          estimated_duration: 60,
          notes: 'Notas de prueba',
          exercise_sets: [
            {
              id: generateUUID(),
              exercise_id: 'bench-press',
              alternative_exercise_id: 'incline-bench-press',
              target_reps: 10,
              target_rir: 2,
              rest_time: 90
            }
          ]
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Guardar la rutina
    const { data, error } = await supabase
      .from('workout_routines')
      .insert([routine])
      .select();
    
    if (error) {
      console.error('Error al crear rutina de prueba:', error);
      return false;
    }
    
    console.log('Rutina de prueba creada exitosamente:', data[0].id);
    
    // Eliminar la rutina de prueba
    const { error: deleteError } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routine.id);
    
    if (deleteError) {
      console.error('Error al eliminar rutina de prueba:', deleteError);
      return false;
    }
    
    console.log('Rutina de prueba eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado al crear rutina de prueba:', error);
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
  
  const userId = await checkWorkoutRoutines();
  
  if (userId) {
    const routineSuccess = await createTestRoutine(userId);
    
    if (routineSuccess) {
      console.log('Todas las pruebas completadas exitosamente.');
    } else {
      console.error('Algunas pruebas fallaron.');
    }
  } else {
    console.error('No se pudo encontrar un usuario válido. Abortando pruebas.');
  }
}

// Ejecutar pruebas
main().catch(error => {
  console.error('Error en la ejecución de pruebas:', error);
});
