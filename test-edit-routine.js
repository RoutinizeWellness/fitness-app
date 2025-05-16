// Script para probar la edición de una rutina existente
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

// Función para obtener un usuario existente
async function getExistingUser() {
  try {
    console.log('Buscando un usuario existente...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (error) {
      console.error('Error al buscar usuario:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No se encontraron usuarios');
      return null;
    }
    
    console.log('Usuario encontrado:', data[0].user_id);
    return data[0].user_id;
  } catch (error) {
    console.error('Error inesperado al buscar usuario:', error);
    return null;
  }
}

// Función para crear una rutina de prueba
async function createTestRoutine(userId) {
  try {
    console.log('Creando rutina de prueba para usuario:', userId);
    
    // Crear una rutina de prueba
    const routine = {
      id: generateUUID(),
      user_id: userId,
      name: 'Rutina de prueba para editar',
      description: 'Esta es una rutina de prueba que vamos a editar',
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
      return null;
    }
    
    console.log('Rutina de prueba creada exitosamente:', data[0].id);
    return data[0];
  } catch (error) {
    console.error('Error inesperado al crear rutina de prueba:', error);
    return null;
  }
}

// Función para editar una rutina existente
async function editRoutine(routine) {
  try {
    console.log('Editando rutina:', routine.id);
    
    // Modificar la rutina
    const updatedRoutine = {
      ...routine,
      name: 'Rutina de prueba editada',
      description: 'Esta rutina ha sido editada',
      updated_at: new Date().toISOString()
    };
    
    // Guardar los cambios
    const { data, error } = await supabase
      .from('workout_routines')
      .update(updatedRoutine)
      .eq('id', routine.id)
      .select();
    
    if (error) {
      console.error('Error al editar rutina:', error);
      return false;
    }
    
    console.log('Rutina editada exitosamente:', data);
    return true;
  } catch (error) {
    console.error('Error inesperado al editar rutina:', error);
    return false;
  }
}

// Función para eliminar una rutina
async function deleteRoutine(routineId) {
  try {
    console.log('Eliminando rutina de prueba:', routineId);
    
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId);
    
    if (error) {
      console.error('Error al eliminar rutina de prueba:', error);
      return false;
    }
    
    console.log('Rutina de prueba eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado al eliminar rutina:', error);
    return false;
  }
}

// Función principal
async function main() {
  // Obtener un usuario existente
  const userId = await getExistingUser();
  
  if (!userId) {
    console.error('No se pudo encontrar un usuario existente. Abortando pruebas.');
    return;
  }
  
  // Crear una rutina de prueba
  const routine = await createTestRoutine(userId);
  
  if (!routine) {
    console.error('No se pudo crear una rutina de prueba. Abortando pruebas.');
    return;
  }
  
  // Editar la rutina
  const editSuccess = await editRoutine(routine);
  
  if (!editSuccess) {
    console.error('No se pudo editar la rutina. Abortando pruebas.');
    // Eliminar la rutina de prueba aunque haya fallado la edición
    await deleteRoutine(routine.id);
    return;
  }
  
  // Eliminar la rutina de prueba
  await deleteRoutine(routine.id);
  
  console.log('Todas las pruebas completadas exitosamente.');
}

// Ejecutar pruebas
main().catch(error => {
  console.error('Error en la ejecución de pruebas:', error);
});
