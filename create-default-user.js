// Script para crear un usuario y una rutina por defecto
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

// Función para crear un usuario por defecto
async function createDefaultUser() {
  try {
    console.log('Intentando crear un usuario por defecto...');
    
    // Registrar un nuevo usuario
    const { data, error } = await supabase.auth.signUp({
      email: 'default@routinize.com',
      password: 'Routinize123!',
    });
    
    if (error) {
      console.error('Error al crear usuario por defecto:', error);
      return null;
    }
    
    if (!data || !data.user) {
      console.error('No se recibieron datos del usuario');
      return null;
    }
    
    console.log('Usuario por defecto creado exitosamente:', data.user.id);
    return data.user.id;
  } catch (error) {
    console.error('Error inesperado al crear usuario por defecto:', error);
    return null;
  }
}

// Función para crear una rutina por defecto
async function createDefaultRoutine(userId) {
  try {
    if (!userId) {
      console.log('No se proporcionó un ID de usuario válido');
      return false;
    }
    
    console.log('Creando rutina por defecto para usuario:', userId);
    
    // Crear una rutina por defecto
    const routine = {
      id: generateUUID(),
      user_id: userId,
      name: 'Rutina por defecto',
      description: 'Esta es una rutina por defecto para el sistema',
      level: 'intermediate',
      is_template: true,
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
      console.error('Error al crear rutina por defecto:', error);
      return false;
    }
    
    console.log('Rutina por defecto creada exitosamente:', data[0].id);
    return true;
  } catch (error) {
    console.error('Error inesperado al crear rutina por defecto:', error);
    return false;
  }
}

// Función principal
async function main() {
  // Intentar iniciar sesión con el usuario por defecto
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'default@routinize.com',
    password: 'Routinize123!',
  });
  
  let userId;
  
  if (signInError || !signInData.user) {
    console.log('No se pudo iniciar sesión con el usuario por defecto, intentando crear uno nuevo...');
    userId = await createDefaultUser();
  } else {
    console.log('Sesión iniciada con el usuario por defecto:', signInData.user.id);
    userId = signInData.user.id;
  }
  
  if (userId) {
    const routineSuccess = await createDefaultRoutine(userId);
    
    if (routineSuccess) {
      console.log('Configuración por defecto completada exitosamente.');
    } else {
      console.error('No se pudo crear la rutina por defecto.');
    }
  } else {
    console.error('No se pudo crear o iniciar sesión con el usuario por defecto.');
  }
}

// Ejecutar script
main().catch(error => {
  console.error('Error en la ejecución del script:', error);
});
