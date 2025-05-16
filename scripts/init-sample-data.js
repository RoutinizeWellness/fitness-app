const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Crear cliente de Supabase
const supabaseUrl = 'https://soviwrzrgskhvgcmujfj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Datos de ejemplo para hábitos
 */
const getSampleHabits = (userId) => {
  return [
    {
      id: uuidv4(),
      userId,
      title: 'Meditación matutina',
      description: '10 minutos de meditación para empezar el día con claridad mental',
      category: 'morning_routine',
      frequency: ['daily'],
      timeOfDay: '07:00',
      duration: 10,
      reminder: true,
      reminderTime: '15min_before',
      streak: 3,
      longestStreak: 5,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: 'Revisar correos',
      description: 'Revisar y responder correos importantes',
      category: 'work',
      frequency: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeOfDay: '09:30',
      duration: 30,
      reminder: true,
      reminderTime: '15min_before',
      streak: 1,
      longestStreak: 10,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: 'Ejercicio',
      description: '30 minutos de actividad física',
      category: 'health',
      frequency: ['monday', 'wednesday', 'friday'],
      timeOfDay: '18:00',
      duration: 30,
      reminder: true,
      reminderTime: '30min_before',
      streak: 0,
      longestStreak: 8,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: 'Lectura antes de dormir',
      description: '20 minutos de lectura para relajarse',
      category: 'evening',
      frequency: ['daily'],
      timeOfDay: '22:00',
      duration: 20,
      reminder: true,
      reminderTime: '15min_before',
      streak: 5,
      longestStreak: 15,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

/**
 * Datos de ejemplo para plantillas de horarios españoles
 */
const getSampleWorkScheduleTemplates = () => {
  return [
    {
      id: uuidv4(),
      name: 'Horario estándar español',
      description: 'Horario laboral típico español con pausa para comida',
      schedule: {
        monday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        tuesday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        wednesday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        thursday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        friday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }]
      },
      isSpanish: true,
      includesSiesta: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Horario con siesta',
      description: 'Horario laboral español con pausa para comida y siesta',
      schedule: {
        monday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        tuesday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        wednesday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        thursday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        friday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }]
      },
      isSpanish: true,
      includesSiesta: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Jornada intensiva',
      description: 'Horario laboral español de jornada continua',
      schedule: {
        monday: [{ start: '08:00', end: '15:00' }],
        tuesday: [{ start: '08:00', end: '15:00' }],
        wednesday: [{ start: '08:00', end: '15:00' }],
        thursday: [{ start: '08:00', end: '15:00' }],
        friday: [{ start: '08:00', end: '15:00' }]
      },
      isSpanish: true,
      includesSiesta: false,
      createdAt: new Date().toISOString()
    }
  ];
};

/**
 * Datos de ejemplo para ejercicios de mindfulness
 */
const getSampleMindfulnessExercises = () => {
  return [
    {
      id: uuidv4(),
      title: 'Respiración 4-7-8',
      description: 'Técnica de respiración para reducir el estrés y la ansiedad',
      category: 'breathing',
      duration: 5,
      difficulty: 'beginner',
      instructions: [
        { text: 'Siéntate en una posición cómoda con la espalda recta', duration: 30 },
        { text: 'Inhala por la nariz durante 4 segundos', duration: 4 },
        { text: 'Mantén la respiración durante 7 segundos', duration: 7 },
        { text: 'Exhala completamente por la boca durante 8 segundos', duration: 8 },
        { text: 'Repite el ciclo 4 veces', duration: 76 }
      ],
      benefits: ['Reduce estrés', 'Mejora el sueño', 'Disminuye ansiedad'],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Meditación de atención plena',
      description: 'Práctica de mindfulness para estar presente en el momento',
      category: 'meditation',
      duration: 10,
      difficulty: 'beginner',
      instructions: [
        { text: 'Siéntate en una posición cómoda con la espalda recta', duration: 30 },
        { text: 'Cierra los ojos y respira naturalmente', duration: 30 },
        { text: 'Centra tu atención en tu respiración', duration: 60 },
        { text: 'Observa cómo el aire entra y sale de tu cuerpo', duration: 120 },
        { text: 'Si tu mente divaga, vuelve suavemente a la respiración', duration: 180 },
        { text: 'Continúa observando tu respiración sin juzgar', duration: 180 }
      ],
      benefits: ['Mejora concentración', 'Reduce estrés', 'Aumenta autoconciencia'],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Visualización de lugar seguro',
      description: 'Técnica de visualización para reducir el estrés',
      category: 'visualization',
      duration: 8,
      difficulty: 'beginner',
      instructions: [
        { text: 'Siéntate o recuéstate en una posición cómoda', duration: 30 },
        { text: 'Cierra los ojos y respira profundamente', duration: 30 },
        { text: 'Imagina un lugar donde te sientas completamente seguro y en paz', duration: 60 },
        { text: 'Observa los detalles: colores, sonidos, olores, texturas', duration: 120 },
        { text: 'Siente la paz y seguridad de este lugar', duration: 120 },
        { text: 'Permanece en este lugar seguro, disfrutando de la sensación', duration: 120 }
      ],
      benefits: ['Reduce ansiedad', 'Promueve relajación', 'Mejora estado de ánimo'],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Body scan',
      description: 'Técnica de relajación progresiva para reducir tensión física',
      category: 'body_scan',
      duration: 15,
      difficulty: 'intermediate',
      instructions: [
        { text: 'Recuéstate en una posición cómoda', duration: 30 },
        { text: 'Cierra los ojos y respira profundamente', duration: 30 },
        { text: 'Lleva tu atención a los pies y observa las sensaciones', duration: 60 },
        { text: 'Sube gradualmente por las piernas, observando cada parte', duration: 120 },
        { text: 'Continúa subiendo por el torso, brazos y hombros', duration: 120 },
        { text: 'Finaliza con el cuello, cara y cabeza', duration: 120 },
        { text: 'Observa todo tu cuerpo como una unidad', duration: 60 },
        { text: 'Respira profundamente y abre los ojos lentamente', duration: 30 }
      ],
      benefits: ['Reduce tensión muscular', 'Mejora conciencia corporal', 'Promueve relajación profunda'],
      createdAt: new Date().toISOString()
    }
  ];
};

/**
 * Datos de ejemplo para programas de bienestar corporativo
 */
const getSampleCorporateWellnessPrograms = (companyId) => {
  return [
    {
      id: uuidv4(),
      companyId,
      name: 'Bienestar en el trabajo',
      description: 'Programa para mejorar el bienestar de los empleados',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      goals: {
        sleep_improvement: 20,
        stress_reduction: 30,
        activity_increase: 25
      },
      participantsCount: 42,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

/**
 * Datos de ejemplo para retos corporativos
 */
const getSampleCorporateChallenges = (programId) => {
  return [
    {
      id: uuidv4(),
      programId,
      title: '10,000 pasos diarios',
      description: 'Alcanza un promedio de 10,000 pasos diarios durante una semana',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      challengeType: 'steps',
      targetValue: 10000,
      reward: 'Día libre adicional',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      programId,
      title: 'Meditación diaria',
      description: 'Completa 5 sesiones de meditación de al menos 10 minutos',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      challengeType: 'stress',
      targetValue: 5,
      reward: 'Sesión de masaje',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      programId,
      title: 'Mejora del sueño',
      description: 'Logra un promedio de 7 horas de sueño durante dos semanas',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      challengeType: 'sleep',
      targetValue: 7,
      reward: 'Auriculares con cancelación de ruido',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
};

/**
 * Datos de ejemplo para estadísticas anónimas de bienestar corporativo
 */
const getSampleCorporateWellnessStats = (companyId) => {
  return {
    id: uuidv4(),
    companyId,
    date: new Date().toISOString(),
    statsType: 'summary',
    statsData: {
      sleep_optimal_percentage: 68,
      stress_reduction: 15,
      stress_absences_reduction: 22,
      popular_challenges: [
        {
          title: '10,000 pasos diarios',
          type: 'steps',
          participants: 38,
          completion_rate: 72
        },
        {
          title: 'Meditación diaria',
          type: 'stress',
          participants: 25,
          completion_rate: 64
        },
        {
          title: 'Mejora del sueño',
          type: 'sleep',
          participants: 31,
          completion_rate: 58
        }
      ]
    },
    createdAt: new Date().toISOString()
  };
};

/**
 * Inicializa datos de ejemplo para las nuevas funcionalidades
 */
async function initSampleData() {
  try {
    console.log('Iniciando carga de datos de ejemplo...');

    // Usar un ID de usuario fijo para los datos de ejemplo
    const userId = '00000000-0000-0000-0000-000000000000';
    console.log(`Usando ID de usuario de ejemplo: ${userId}`);

    // Inicializar plantillas de horarios españoles
    console.log('Inicializando plantillas de horarios españoles...');
    const workScheduleTemplates = getSampleWorkScheduleTemplates();

    for (const template of workScheduleTemplates) {
      const { error } = await supabase
        .from('work_schedule_templates')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          schedule: template.schedule,
          is_spanish: template.isSpanish,
          includes_siesta: template.includesSiesta,
          created_at: template.createdAt
        });

      if (error) {
        console.error(`Error al insertar plantilla ${template.name}:`, error);
      } else {
        console.log(`Plantilla insertada: ${template.name}`);
      }
    }

    // Inicializar hábitos de ejemplo
    console.log('Inicializando hábitos de ejemplo...');
    const habits = getSampleHabits(userId);

    for (const habit of habits) {
      const { error } = await supabase
        .from('habits')
        .upsert({
          id: habit.id,
          user_id: habit.userId,
          title: habit.title,
          description: habit.description,
          category: habit.category,
          frequency: habit.frequency,
          time_of_day: habit.timeOfDay,
          duration: habit.duration,
          reminder: habit.reminder,
          reminder_time: habit.reminderTime,
          streak: habit.streak,
          longest_streak: habit.longestStreak,
          last_completed: habit.lastCompleted,
          start_date: habit.startDate,
          is_active: habit.isActive,
          created_at: habit.createdAt,
          updated_at: habit.updatedAt
        });

      if (error) {
        console.error(`Error al insertar hábito ${habit.title}:`, error);
      } else {
        console.log(`Hábito insertado: ${habit.title}`);
      }
    }

    // Inicializar ejercicios de mindfulness
    console.log('Inicializando ejercicios de mindfulness...');
    const mindfulnessExercises = getSampleMindfulnessExercises();

    for (const exercise of mindfulnessExercises) {
      const { error } = await supabase
        .from('mindfulness_exercises')
        .upsert({
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          category: exercise.category,
          duration: exercise.duration,
          difficulty: exercise.difficulty,
          instructions: exercise.instructions,
          benefits: exercise.benefits,
          audio_url: exercise.audioUrl,
          image_url: exercise.imageUrl,
          created_at: exercise.createdAt
        });

      if (error) {
        console.error(`Error al insertar ejercicio ${exercise.title}:`, error);
      } else {
        console.log(`Ejercicio insertado: ${exercise.title}`);
      }
    }

    // Inicializar programas de bienestar corporativo
    console.log('Inicializando programas de bienestar corporativo...');
    const companyId = 'default-company';
    const corporatePrograms = getSampleCorporateWellnessPrograms(companyId);

    for (const program of corporatePrograms) {
      const { error } = await supabase
        .from('corporate_wellness_programs')
        .upsert({
          id: program.id,
          company_id: program.companyId,
          name: program.name,
          description: program.description,
          start_date: program.startDate,
          end_date: program.endDate,
          goals: program.goals,
          participants_count: program.participantsCount,
          is_active: program.isActive,
          created_at: program.createdAt,
          updated_at: program.updatedAt
        });

      if (error) {
        console.error(`Error al insertar programa ${program.name}:`, error);
      } else {
        console.log(`Programa insertado: ${program.name}`);

        // Inicializar retos corporativos
        console.log('Inicializando retos corporativos...');
        const corporateChallenges = getSampleCorporateChallenges(program.id);

        for (const challenge of corporateChallenges) {
          const { error } = await supabase
            .from('corporate_challenges')
            .upsert({
              id: challenge.id,
              program_id: challenge.programId,
              title: challenge.title,
              description: challenge.description,
              start_date: challenge.startDate,
              end_date: challenge.endDate,
              challenge_type: challenge.challengeType,
              target_value: challenge.targetValue,
              reward: challenge.reward,
              is_active: challenge.isActive,
              created_at: challenge.createdAt
            });

          if (error) {
            console.error(`Error al insertar reto ${challenge.title}:`, error);
          } else {
            console.log(`Reto insertado: ${challenge.title}`);
          }
        }
      }
    }

    // Inicializar estadísticas anónimas
    console.log('Inicializando estadísticas anónimas...');
    const corporateStats = getSampleCorporateWellnessStats(companyId);

    const { error: statsError } = await supabase
      .from('corporate_wellness_stats')
      .upsert({
        id: corporateStats.id,
        company_id: corporateStats.companyId,
        date: corporateStats.date,
        stats_type: corporateStats.statsType,
        stats_data: corporateStats.statsData,
        created_at: corporateStats.createdAt
      });

    if (statsError) {
      console.error('Error al insertar estadísticas:', statsError);
    } else {
      console.log('Estadísticas insertadas correctamente');
    }

    console.log('Datos de ejemplo inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar datos de ejemplo:', error);
  }
}

// Ejecutar la función
initSampleData();
