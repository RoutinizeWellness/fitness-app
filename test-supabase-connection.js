// Script para probar la conexión a Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NTI1NzcsImV4cCI6MjAyNTEyODU3N30.Nh83ebqzf1iGHTaGywss6WGxrIx0-IgCJQkE-MgLe-g";

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

    // Probar autenticación
    console.log('\nProbando autenticación...');
    const authTest = await supabase.auth.signInWithPassword({
      email: 'jonathansmth@gmail.com',
      password: 'password123',
    });

    if (authTest.error) {
      console.error('Error de autenticación:', authTest.error);
    } else {
      console.log('Autenticación exitosa:', authTest.data.user.email);
      console.log('Sesión:', authTest.data.session ? 'Creada correctamente' : 'No se creó');
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al conectar con Supabase:', error);
    return false;
  }
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

// Función para generar un UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Función para probar la creación de una rutina
async function testCreateRoutine(userId) {
  try {
    console.log('Probando creación de rutina para usuario:', userId);

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
      console.error('Error al crear rutina:', error);
      return false;
    }

    console.log('Rutina creada exitosamente:', data);

    // Eliminar la rutina de prueba
    const { error: deleteError } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routine.id);

    if (deleteError) {
      console.error('Error al eliminar rutina de prueba:', deleteError);
    } else {
      console.log('Rutina de prueba eliminada correctamente');
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al crear rutina:', error);
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

  const userId = await getExistingUser();

  if (!userId) {
    console.error('No se pudo encontrar un usuario existente. Abortando pruebas.');
    return;
  }

  const routineSuccess = await testCreateRoutine(userId);

  if (routineSuccess) {
    console.log('Todas las pruebas completadas exitosamente.');
  } else {
    console.error('Algunas pruebas fallaron.');
  }
}

// Ejecutar pruebas
main().catch(error => {
  console.error('Error en la ejecución de pruebas:', error);
});
