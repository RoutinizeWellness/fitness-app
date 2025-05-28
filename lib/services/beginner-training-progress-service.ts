/**
 * Servicio para gestionar el progreso de entrenamiento para principiantes absolutos en fitness
 */

import { supabase } from '@/lib/supabase-client';
import { BeginnerTrainingProgress, TrainingAchievement } from '@/lib/types/beginner-training';

/**
 * Obtiene el progreso de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns Progreso de entrenamiento o null si no existe
 */
export async function getTrainingProgress(userId: string): Promise<BeginnerTrainingProgress | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_training_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener progreso de entrenamiento:', error);
      return null;
    }

    return data as BeginnerTrainingProgress;
  } catch (error) {
    console.error('Error en getTrainingProgress:', error);
    return null;
  }
}

/**
 * Inicializa el progreso de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns Progreso de entrenamiento inicializado o null si hay error
 */
export async function initializeTrainingProgress(userId: string): Promise<BeginnerTrainingProgress | null> {
  try {
    const defaultProgress: BeginnerTrainingProgress = {
      user_id: userId,
      workouts_completed: 0,
      total_time: 0,
      current_streak: 0,
      longest_streak: 0,
      achievements: [],
      exercise_progress: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('beginner_training_progress')
      .upsert(defaultProgress)
      .select()
      .single();

    if (error) {
      console.error('Error al inicializar progreso de entrenamiento:', error);
      return null;
    }

    return data as BeginnerTrainingProgress;
  } catch (error) {
    console.error('Error en initializeTrainingProgress:', error);
    return null;
  }
}

/**
 * Registra la finalización de un entrenamiento
 * @param userId - ID del usuario
 * @param routineId - ID de la rutina completada
 * @param duration - Duración del entrenamiento en minutos
 * @param exercisesPerformed - Lista de ejercicios realizados con su progreso
 * @returns Progreso de entrenamiento actualizado o null si hay error
 */
export async function recordWorkoutCompletion(
  userId: string,
  routineId: string,
  duration: number,
  exercisesPerformed: {
    exercise_id: string;
    weight?: number;
    reps?: number;
  }[]
): Promise<BeginnerTrainingProgress | null> {
  try {
    // Obtener el progreso actual
    let progress = await getTrainingProgress(userId);
    
    if (!progress) {
      progress = await initializeTrainingProgress(userId);
      if (!progress) {
        throw new Error('No se pudo inicializar el progreso de entrenamiento');
      }
    }
    
    // Calcular la racha actual
    const today = new Date().toISOString().split('T')[0];
    const lastWorkoutDate = progress.last_workout_date?.split('T')[0];
    
    let currentStreak = progress.current_streak;
    
    if (lastWorkoutDate) {
      const lastDate = new Date(lastWorkoutDate);
      const todayDate = new Date(today);
      
      // Calcular la diferencia en días
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Si el último entrenamiento fue ayer, incrementar la racha
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Si han pasado más de un día, reiniciar la racha
        currentStreak = 1;
      }
      // Si es el mismo día, mantener la racha actual
    } else {
      // Primer entrenamiento
      currentStreak = 1;
    }
    
    // Actualizar el progreso
    const updatedProgress = {
      ...progress,
      workouts_completed: progress.workouts_completed + 1,
      total_time: progress.total_time + duration,
      current_streak: currentStreak,
      longest_streak: Math.max(currentStreak, progress.longest_streak),
      last_workout_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Actualizar el progreso de los ejercicios
    const updatedExerciseProgress = [...progress.exercise_progress];
    
    for (const exercise of exercisesPerformed) {
      const existingIndex = updatedExerciseProgress.findIndex(
        e => e.exercise_id === exercise.exercise_id
      );
      
      if (existingIndex >= 0) {
        // Actualizar ejercicio existente
        updatedExerciseProgress[existingIndex] = {
          ...updatedExerciseProgress[existingIndex],
          times_performed: updatedExerciseProgress[existingIndex].times_performed + 1,
          best_weight: exercise.weight 
            ? Math.max(exercise.weight, updatedExerciseProgress[existingIndex].best_weight || 0)
            : updatedExerciseProgress[existingIndex].best_weight,
          best_reps: exercise.reps
            ? Math.max(exercise.reps, updatedExerciseProgress[existingIndex].best_reps || 0)
            : updatedExerciseProgress[existingIndex].best_reps
        };
      } else {
        // Añadir nuevo ejercicio
        updatedExerciseProgress.push({
          exercise_id: exercise.exercise_id,
          times_performed: 1,
          best_weight: exercise.weight,
          best_reps: exercise.reps
        });
      }
    }
    
    updatedProgress.exercise_progress = updatedExerciseProgress;
    
    // Guardar el progreso actualizado
    const { data, error } = await supabase
      .from('beginner_training_progress')
      .upsert(updatedProgress)
      .select()
      .single();
    
    if (error) {
      console.error('Error al registrar finalización de entrenamiento:', error);
      return null;
    }
    
    // Verificar logros desbloqueados
    await checkAchievements(userId);
    
    return data as BeginnerTrainingProgress;
  } catch (error) {
    console.error('Error en recordWorkoutCompletion:', error);
    return null;
  }
}

/**
 * Verifica y actualiza los logros desbloqueados
 * @param userId - ID del usuario
 * @returns Lista de nuevos logros desbloqueados o null si hay error
 */
export async function checkAchievements(userId: string): Promise<TrainingAchievement[] | null> {
  try {
    // Obtener el progreso actual
    const progress = await getTrainingProgress(userId);
    
    if (!progress) {
      return null;
    }
    
    // Obtener todos los logros
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('training_achievements')
      .select('*');
    
    if (achievementsError) {
      console.error('Error al obtener logros:', achievementsError);
      return null;
    }
    
    // Filtrar logros ya desbloqueados
    const unlockedAchievementIds = progress.achievements || [];
    const availableAchievements = allAchievements.filter(
      achievement => !unlockedAchievementIds.includes(achievement.id)
    );
    
    // Verificar nuevos logros desbloqueados
    const newlyUnlockedAchievements: TrainingAchievement[] = [];
    const newUnlockedIds: string[] = [];
    
    for (const achievement of availableAchievements) {
      let unlocked = false;
      
      switch (achievement.requirements.type) {
        case 'workouts_completed':
          unlocked = progress.workouts_completed >= achievement.requirements.value;
          break;
        case 'days_streak':
          unlocked = progress.longest_streak >= achievement.requirements.value;
          break;
        case 'total_time':
          unlocked = progress.total_time >= achievement.requirements.value;
          break;
        case 'specific_exercise':
          if (achievement.requirements.exercise_id) {
            const exerciseProgress = progress.exercise_progress.find(
              e => e.exercise_id === achievement.requirements.exercise_id
            );
            unlocked = exerciseProgress 
              ? exerciseProgress.times_performed >= achievement.requirements.value
              : false;
          }
          break;
      }
      
      if (unlocked) {
        newlyUnlockedAchievements.push(achievement);
        newUnlockedIds.push(achievement.id);
      }
    }
    
    // Si hay nuevos logros, actualizar el progreso
    if (newUnlockedIds.length > 0) {
      const updatedAchievements = [...unlockedAchievementIds, ...newUnlockedIds];
      
      const { error: updateError } = await supabase
        .from('beginner_training_progress')
        .update({ 
          achievements: updatedAchievements,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error al actualizar logros:', updateError);
      }
    }
    
    return newlyUnlockedAchievements;
  } catch (error) {
    console.error('Error en checkAchievements:', error);
    return null;
  }
}

/**
 * Obtiene los logros de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns Lista de logros o null si hay error
 */
export async function getUserAchievements(userId: string): Promise<TrainingAchievement[] | null> {
  try {
    // Obtener el progreso actual
    const progress = await getTrainingProgress(userId);
    
    if (!progress || !progress.achievements || progress.achievements.length === 0) {
      return [];
    }
    
    // Obtener los logros desbloqueados
    const { data, error } = await supabase
      .from('training_achievements')
      .select('*')
      .in('id', progress.achievements);
    
    if (error) {
      console.error('Error al obtener logros del usuario:', error);
      return null;
    }
    
    return data as TrainingAchievement[];
  } catch (error) {
    console.error('Error en getUserAchievements:', error);
    return null;
  }
}
