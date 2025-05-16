// Script para insertar datos de entrenamiento de demostración
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Configuración de Supabase
const supabaseUrl = 'https://soviwrzrgskhvgcmujfj.supabase.co';
const supabaseKey = process.argv[2]; // Pasar la clave como argumento
const userId = process.argv[3]; // Pasar el ID de usuario como argumento

if (!supabaseKey || !userId) {
  console.error('Uso: node insert-demo-workouts.js SUPABASE_KEY USER_ID');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertDemoData() {
  try {
    console.log(`Insertando datos de demostración para el usuario ${userId}...`);
    
    // Insertar entrenamientos
    const { error: workoutsError } = await supabase
      .from('workouts')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 días atrás
          type: 'strength',
          name: 'Press de banca',
          sets: '3',
          reps: '10',
          weight: '60',
          duration: '30',
          notes: 'Buen entrenamiento',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 días atrás
          type: 'strength',
          name: 'Sentadillas',
          sets: '4',
          reps: '12',
          weight: '80',
          duration: '40',
          notes: 'Aumenté el peso',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 días atrás
          type: 'cardio',
          name: 'Correr',
          sets: '1',
          duration: '45',
          distance: '5',
          notes: 'Ritmo moderado',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días atrás
          type: 'strength',
          name: 'Press de banca',
          sets: '3',
          reps: '10',
          weight: '65',
          duration: '30',
          notes: 'Aumenté el peso',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 días atrás
          type: 'flexibility',
          name: 'Yoga',
          sets: '1',
          duration: '60',
          notes: 'Sesión relajante',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 días atrás
          type: 'strength',
          name: 'Sentadillas',
          sets: '4',
          reps: '12',
          weight: '85',
          duration: '40',
          notes: 'Progresando bien',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 días atrás
          type: 'cardio',
          name: 'Ciclismo',
          sets: '1',
          duration: '60',
          distance: '15',
          notes: 'Buena resistencia',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 días atrás
          type: 'strength',
          name: 'Press de banca',
          sets: '3',
          reps: '10',
          weight: '70',
          duration: '30',
          notes: 'Sigo progresando',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 días atrás
          type: 'strength',
          name: 'Peso muerto',
          sets: '3',
          reps: '8',
          weight: '100',
          duration: '35',
          notes: 'Primera vez',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 día atrás
          type: 'cardio',
          name: 'Correr',
          sets: '1',
          duration: '50',
          distance: '6',
          notes: 'Aumenté la distancia',
          created_at: new Date().toISOString()
        }
      ]);

    if (workoutsError) {
      console.error('Error al insertar entrenamientos:', workoutsError);
      return;
    }

    console.log('Entrenamientos insertados correctamente.');
    
    // Insertar estados de ánimo
    const { error: moodsError } = await supabase
      .from('moods')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood_level: 7,
          stress_level: 4,
          sleep_hours: 7.5,
          notes: 'Buen día',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood_level: 8,
          stress_level: 3,
          sleep_hours: 8,
          notes: 'Muy buen día después del entrenamiento',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood_level: 6,
          stress_level: 5,
          sleep_hours: 6.5,
          notes: 'Algo cansado',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood_level: 7,
          stress_level: 4,
          sleep_hours: 7,
          notes: 'Normal',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood_level: 9,
          stress_level: 2,
          sleep_hours: 8.5,
          notes: 'Excelente después del yoga',
          created_at: new Date().toISOString()
        }
      ]);

    if (moodsError) {
      console.error('Error al insertar estados de ánimo:', moodsError);
      return;
    }

    console.log('Estados de ánimo insertados correctamente.');
    
    // Insertar datos de wearables
    const { error: wearableError } = await supabase
      .from('wearable_data')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          device_type: 'fitbit',
          steps: 8500,
          calories_burned: 2200,
          active_minutes: 45,
          heart_rate: {
            resting: 65,
            average: 72,
            max: 140
          },
          sleep: {
            duration: 450,
            deep: 90,
            light: 240,
            rem: 90,
            awake: 30,
            score: 85
          },
          stress_level: 40,
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          device_type: 'fitbit',
          steps: 9200,
          calories_burned: 2400,
          active_minutes: 60,
          heart_rate: {
            resting: 64,
            average: 75,
            max: 155
          },
          sleep: {
            duration: 480,
            deep: 100,
            light: 250,
            rem: 100,
            awake: 30,
            score: 88
          },
          stress_level: 35,
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          device_type: 'fitbit',
          steps: 7800,
          calories_burned: 2000,
          active_minutes: 40,
          heart_rate: {
            resting: 66,
            average: 70,
            max: 135
          },
          sleep: {
            duration: 420,
            deep: 80,
            light: 230,
            rem: 80,
            awake: 30,
            score: 80
          },
          stress_level: 45,
          created_at: new Date().toISOString()
        }
      ]);

    if (wearableError) {
      console.error('Error al insertar datos de wearables:', wearableError);
      return;
    }

    console.log('Datos de wearables insertados correctamente.');
    console.log('Todos los datos de demostración se han insertado correctamente.');
  } catch (error) {
    console.error('Error al insertar datos de demostración:', error);
  }
}

// Ejecutar la función principal
insertDemoData();
