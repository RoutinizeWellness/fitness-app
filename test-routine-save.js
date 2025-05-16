// Script para probar la función saveWorkoutRoutine
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

// Función para guardar una rutina de entrenamiento
async function saveWorkoutRoutine(routine) {
  try {
    console.log('Intentando guardar rutina:', routine.name);

    // Generar un UUID válido si no existe uno
    const routineId = routine.id || generateUUID();
    console.log('ID de rutina a usar:', routineId);

    // Generar un UUID para el usuario si no es válido
    const userId = routine.userId || generateUUID();

    // Preparar los datos para Supabase
    const processedDays = routine.days.map(day => ({
      id: day.id,
      name: day.name,
      description: day.description || '',
      target_muscle_groups: day.targetMuscleGroups || [],
      difficulty: day.difficulty || 'intermediate',
      estimated_duration: day.estimatedDuration || 0,
      notes: day.notes || '',
      exercise_sets: day.exerciseSets.map(set => ({
        id: set.id,
        exercise_id: set.exerciseId,
        alternative_exercise_id: set.alternativeExerciseId || null,
        target_reps: set.targetReps,
        target_rir: set.targetRir,
        weight: set.weight || null,
        rest_time: set.restTime || null,
        is_warmup: set.isWarmup || false,
        is_drop_set: set.isDropSet || false,
        is_superset_with: set.isSupersetWith || null
      }))
    }));

    const supabaseData = {
      id: routineId,
      user_id: userId,
      name: routine.name,
      description: routine.description || '',
      level: routine.level || 'intermediate',
      is_template: false,
      exercises: processedDays,
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Guardando en Supabase con datos:', JSON.stringify(supabaseData, null, 2));

    // Primero verificamos si el registro existe
    const { data: existingData, error: checkError } = await supabase
      .from('workout_routines')
      .select('id')
      .eq('id', routineId)
      .maybeSingle();

    if (checkError) {
      console.error('Error al verificar si la rutina existe:', checkError);
      return { data: null, error: checkError };
    }

    let result;

    if (existingData) {
      // Si existe, actualizamos
      console.log('La rutina existe, actualizando...');
      result = await supabase
        .from('workout_routines')
        .update(supabaseData)
        .eq('id', routineId)
        .select();
    } else {
      // Si no existe, insertamos
      console.log('La rutina no existe, creando nueva...');
      result = await supabase
        .from('workout_routines')
        .insert(supabaseData)
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error al guardar en Supabase:', error);
      console.error('Detalles del error:', JSON.stringify(error, null, 2));
      return { data: null, error: error };
    }

    if (!data || data.length === 0) {
      console.error('No se recibieron datos de Supabase al guardar la rutina');
      return { data: null, error: new Error('No se recibieron datos de Supabase') };
    }

    console.log('Datos guardados en Supabase:', data);
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error general en saveWorkoutRoutine:', error);
    return { data: null, error: error };
  }
}

// Crear una rutina de prueba
const testRoutine = {
  name: "Rutina de prueba " + new Date().toISOString(),
  description: "Esta es una rutina de prueba",
  level: "intermediate",
  days: [
    {
      id: "day-" + Date.now(),
      name: "Día 1",
      targetMuscleGroups: ["chest", "triceps"],
      difficulty: "intermediate",
      exerciseSets: [
        {
          id: "set-" + Date.now() + "-1",
          exerciseId: "bench-press",
          targetReps: 10,
          targetRir: 2
        },
        {
          id: "set-" + Date.now() + "-2",
          exerciseId: "triceps-pushdown",
          targetReps: 12,
          targetRir: 1
        }
      ]
    }
  ],
  frequency: 3,
  goal: "hypertrophy",
  userId: generateUUID()
};

// Función principal
async function main() {
  console.log('Iniciando prueba de guardado de rutina...');

  const { data, error } = await saveWorkoutRoutine(testRoutine);

  if (error) {
    console.error('Error al guardar la rutina:', error);
  } else {
    console.log('Rutina guardada exitosamente:', data);
  }

  console.log('Prueba completada.');
}

// Ejecutar prueba
main().catch(error => {
  console.error('Error en la ejecución de la prueba:', error);
});
