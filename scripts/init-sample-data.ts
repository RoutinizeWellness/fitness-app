import { supabase } from '../lib/supabase-client'
import {
  getSampleHabits,
  getSampleWorkScheduleTemplates,
  getSampleMindfulnessExercises,
  getSampleCorporateWellnessPrograms,
  getSampleCorporateChallenges,
  getSampleCorporateWellnessStats
} from '../lib/sample-data'

/**
 * Inicializa datos de ejemplo para las nuevas funcionalidades
 */
async function initSampleData() {
  try {
    console.log('Iniciando carga de datos de ejemplo...')
    
    // Obtener usuario de prueba
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No se encontró un usuario autenticado. Por favor, inicia sesión primero.')
      return
    }
    
    const userId = user.id
    console.log(`Usuario autenticado: ${userId}`)
    
    // Inicializar plantillas de horarios españoles
    console.log('Inicializando plantillas de horarios españoles...')
    const workScheduleTemplates = getSampleWorkScheduleTemplates()
    
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
        })
      
      if (error) {
        console.error(`Error al insertar plantilla ${template.name}:`, error)
      } else {
        console.log(`Plantilla insertada: ${template.name}`)
      }
    }
    
    // Inicializar hábitos de ejemplo
    console.log('Inicializando hábitos de ejemplo...')
    const habits = getSampleHabits(userId)
    
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
        })
      
      if (error) {
        console.error(`Error al insertar hábito ${habit.title}:`, error)
      } else {
        console.log(`Hábito insertado: ${habit.title}`)
      }
    }
    
    // Inicializar ejercicios de mindfulness
    console.log('Inicializando ejercicios de mindfulness...')
    const mindfulnessExercises = getSampleMindfulnessExercises()
    
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
        })
      
      if (error) {
        console.error(`Error al insertar ejercicio ${exercise.title}:`, error)
      } else {
        console.log(`Ejercicio insertado: ${exercise.title}`)
      }
    }
    
    // Inicializar programas de bienestar corporativo
    console.log('Inicializando programas de bienestar corporativo...')
    const companyId = 'default-company'
    const corporatePrograms = getSampleCorporateWellnessPrograms(companyId)
    
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
        })
      
      if (error) {
        console.error(`Error al insertar programa ${program.name}:`, error)
      } else {
        console.log(`Programa insertado: ${program.name}`)
        
        // Inicializar retos corporativos
        console.log('Inicializando retos corporativos...')
        const corporateChallenges = getSampleCorporateChallenges(program.id)
        
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
            })
          
          if (error) {
            console.error(`Error al insertar reto ${challenge.title}:`, error)
          } else {
            console.log(`Reto insertado: ${challenge.title}`)
          }
        }
      }
    }
    
    // Inicializar estadísticas anónimas
    console.log('Inicializando estadísticas anónimas...')
    const corporateStats = getSampleCorporateWellnessStats(companyId)
    
    const { error: statsError } = await supabase
      .from('corporate_wellness_stats')
      .upsert({
        id: corporateStats.id,
        company_id: corporateStats.companyId,
        date: corporateStats.date,
        stats_type: corporateStats.statsType,
        stats_data: corporateStats.statsData,
        created_at: corporateStats.createdAt
      })
    
    if (statsError) {
      console.error('Error al insertar estadísticas:', statsError)
    } else {
      console.log('Estadísticas insertadas correctamente')
    }
    
    console.log('Datos de ejemplo inicializados correctamente')
  } catch (error) {
    console.error('Error al inicializar datos de ejemplo:', error)
  }
}

// Ejecutar la función
initSampleData()
