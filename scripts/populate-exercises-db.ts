import { supabase } from '../lib/supabase-client';
import { generateExercises } from './generate-exercises';
import { Exercise } from '../lib/supabase';

// Número de ejercicios a generar e insertar
const TOTAL_EXERCISES = 1000; // Generamos 1000 ejercicios
const BATCH_SIZE = 50; // Aumentamos el tamaño del lote para mayor eficiencia

// Función para verificar la conexión a Supabase
async function verifySupabaseConnection() {
  // Verificar conexión a Supabase
  console.log("Verificando conexión a Supabase...");

  // Verificar tabla profiles
  console.log("Verificando tabla profiles...");
  const { data: profilesData } = await supabase.from('profiles').select('*').limit(1);
  console.log(`Tabla profiles verificada. Contiene ${profilesData?.length || 0} registros.`);

  // Verificar tabla workouts
  console.log("Verificando tabla workouts...");
  const { data: workoutsData } = await supabase.from('workouts').select('*').limit(1);
  console.log(`Tabla workouts verificada. Contiene ${workoutsData?.length || 0} registros.`);

  // Verificar permisos de inserción
  console.log("Verificando permisos de inserción en tabla workouts...");
  const testWorkout = {
    user_id: profilesData?.[0]?.id || '0b2ea1bf-89b8-4c77-8d28-9b92f734070d',
    date: new Date().toISOString().split('T')[0],
    type: 'Test',
    name: 'Test Connection',
    notes: 'Este es un entrenamiento de prueba para verificar la conexión'
  };

  const { data: insertedWorkout, error: insertError } = await supabase
    .from('workouts')
    .insert(testWorkout)
    .select();

  if (insertError) {
    console.error("Error al insertar registro de prueba:", insertError);
  } else {
    console.log("Inserción de prueba exitosa:", insertedWorkout);

    // Eliminar el registro de prueba
    const { error: deleteError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', insertedWorkout[0].id);

    if (deleteError) {
      console.error("Error al eliminar registro de prueba:", deleteError);
    } else {
      console.log("Registro de prueba eliminado correctamente");
    }
  }

  console.log("Conexión a Supabase establecida correctamente");
}

async function populateExercisesDatabase() {
  console.log(`Generando ${TOTAL_EXERCISES} ejercicios...`);

  // Generar todos los ejercicios
  const allExercises = generateExercises(TOTAL_EXERCISES);
  console.log(`Se han generado ${allExercises.length} ejercicios.`);

  // Adaptar los ejercicios a la estructura de la tabla
  const adaptedExercises = allExercises.map(exercise => {
    // Crear un objeto con solo las propiedades que existen en la tabla
    return {
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      description: exercise.description,
      image_url: exercise.image_url,
      video_url: exercise.video_url,
      instructions: exercise.instructions,
      tips: exercise.tips,
      secondary_muscle_groups: exercise.secondary_muscle_groups,
      calories_burned: exercise.calories_burned,
      is_compound: exercise.is_compound,
      movement_pattern: exercise.movement_pattern,
      force_type: exercise.force_type,
      mechanics: exercise.mechanics,
      popularity: exercise.popularity,
      average_rating: exercise.average_rating,
      tags: exercise.tags,
      category: exercise.category,
      sub_category: exercise.sub_category,
      variations: exercise.variations
    };
  });

  // Dividir en lotes para inserción
  const batches: any[][] = [];
  for (let i = 0; i < adaptedExercises.length; i += BATCH_SIZE) {
    batches.push(adaptedExercises.slice(i, i + BATCH_SIZE));
  }

  console.log(`Dividido en ${batches.length} lotes para inserción.`);

  // Insertar cada lote
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Insertando lote ${i + 1}/${batches.length} (${batch.length} ejercicios)...`);

    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error al insertar lote ${i + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`Lote ${i + 1} insertado correctamente. ${data?.length} ejercicios añadidos.`);
        successCount += data?.length || 0;
      }
    } catch (e) {
      console.error(`Excepción al insertar lote ${i + 1}:`, e);
      errorCount += batch.length;
    }

    // Pequeña pausa entre lotes para no sobrecargar la API
    if (i < batches.length - 1) {
      console.log('Esperando 1 segundo antes del siguiente lote...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n--- RESUMEN ---');
  console.log(`Total de ejercicios generados: ${TOTAL_EXERCISES}`);
  console.log(`Ejercicios insertados correctamente: ${successCount}`);
  console.log(`Ejercicios con error: ${errorCount}`);
}

// Función principal que ejecuta todo el proceso
async function main() {
  try {
    // Verificar la conexión a Supabase
    await verifySupabaseConnection();

    // Poblar la base de datos con ejercicios
    await populateExercisesDatabase();

    console.log('Proceso completado.');
    process.exit(0);
  } catch (error) {
    console.error('Error en el proceso principal:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
