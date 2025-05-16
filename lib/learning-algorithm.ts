import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { getWorkouts } from './supabase-queries';
import { getMoods } from './supabase-queries';
import { getBodyMeasurements, getWearableData } from './body-measurements';
import { PostgrestError } from '@supabase/supabase-js';

// Tipos para el algoritmo de aprendizaje
export type UserPattern = {
  id: string;
  user_id: string;
  pattern_type: 'workout_preference' | 'exercise_selection' | 'timing' | 'intensity_response' | 'progression' | 'stagnation' | 'mood_correlation' | 'recovery_pattern';
  pattern_data: any;
  confidence: number;
  last_updated: string;
  created_at: string;
};

export type UserPreference = {
  id: string;
  user_id: string;
  preference_type: 'exercise_type' | 'muscle_group' | 'equipment' | 'time_of_day' | 'workout_duration' | 'intensity_level' | 'recovery_need';
  preference_value: string;
  strength: number;
  created_at: string;
  updated_at: string;
};

export type RecommendationFeedback = {
  id: string;
  user_id: string;
  recommendation_id: string;
  recommendation_type: 'workout' | 'exercise' | 'plan' | 'habit' | 'recovery';
  rating: number;
  feedback_text?: string;
  created_at: string;
};

export type SmartRecommendation = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  recommendation_type: 'workout' | 'exercise' | 'plan' | 'habit' | 'recovery';
  recommendation_data: any;
  confidence: number;
  reasoning: string;
  patterns_used?: any;
  is_active: boolean;
  feedback_count?: number;
  positive_feedback_ratio?: number;
  created_at: string;
  updated_at: string;
};

export type UserCluster = {
  id: string;
  cluster_name: string;
  cluster_description: string;
  user_ids: string[];
  common_patterns: {
    pattern_type: string;
    pattern_data: any;
  }[];
  created_at: string;
  updated_at: string;
};

export type IntensityResponse = {
  intensity_level: 'low' | 'moderate' | 'high';
  performance_score: number;
  recovery_time: number;
  mood_impact: number;
  sample_size: number;
};

export type ProgressionPattern = {
  exercise_id?: string;
  exercise_name?: string;
  muscle_group?: string;
  progression_rate: number;
  weeks_of_data: number;
  is_progressing: boolean;
  is_stagnant: boolean;
  is_regressing: boolean;
  last_progression_date?: string;
};

export type MoodCorrelation = {
  workout_type: string;
  mood_before: number;
  mood_after: number;
  mood_change: number;
  sample_size: number;
};

// Tipo para respuestas de consultas
export type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Registra la respuesta del usuario a una intensidad de entrenamiento específica
 */
export async function recordIntensityResponse(
  userId: string,
  data: {
    workout_id: string;
    intensity_level: 'low' | 'moderate' | 'high';
    performance_score: number; // 1-10
    recovery_time?: number; // horas
    mood_impact?: number; // -5 a 5
    notes?: string;
  }
): Promise<QueryResponse<{ id: string }>> {
  try {
    const { data: response, error } = await supabase
      .from('intensity_responses')
      .insert([{
        user_id: userId,
        workout_id: data.workout_id,
        intensity_level: data.intensity_level,
        performance_score: data.performance_score,
        recovery_time: data.recovery_time,
        mood_impact: data.mood_impact,
        notes: data.notes,
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: response as { id: string }, error: null };
  } catch (e) {
    console.error('Error en recordIntensityResponse:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en recordIntensityResponse')
    };
  }
}

/**
 * Analiza la respuesta del usuario a diferentes intensidades de entrenamiento
 */
export async function analyzeIntensityResponses(
  userId: string
): Promise<QueryResponse<UserPattern>> {
  try {
    // Obtener todas las respuestas de intensidad del usuario
    const { data: responses, error: responsesError } = await supabase
      .from('intensity_responses')
      .select('*')
      .eq('user_id', userId);

    if (responsesError) {
      return { data: null, error: responsesError };
    }

    if (!responses || responses.length < 3) {
      return {
        data: null,
        error: new Error('No hay suficientes datos de respuesta a intensidades para analizar')
      };
    }

    // Agrupar respuestas por nivel de intensidad
    const intensityGroups: Record<string, any[]> = {
      'low': [],
      'moderate': [],
      'high': []
    };

    responses.forEach(response => {
      if (intensityGroups[response.intensity_level]) {
        intensityGroups[response.intensity_level].push(response);
      }
    });

    // Calcular promedios para cada nivel de intensidad
    const intensityAnalysis: Record<string, IntensityResponse> = {};

    for (const [level, levelResponses] of Object.entries(intensityGroups)) {
      if (levelResponses.length > 0) {
        const avgPerformance = levelResponses.reduce((sum, r) => sum + r.performance_score, 0) / levelResponses.length;
        const avgRecovery = levelResponses.filter(r => r.recovery_time).reduce((sum, r) => sum + r.recovery_time, 0) /
                          levelResponses.filter(r => r.recovery_time).length || 0;
        const avgMoodImpact = levelResponses.filter(r => r.mood_impact).reduce((sum, r) => sum + r.mood_impact, 0) /
                            levelResponses.filter(r => r.mood_impact).length || 0;

        intensityAnalysis[level] = {
          intensity_level: level as 'low' | 'moderate' | 'high',
          performance_score: parseFloat(avgPerformance.toFixed(1)),
          recovery_time: parseFloat(avgRecovery.toFixed(1)),
          mood_impact: parseFloat(avgMoodImpact.toFixed(1)),
          sample_size: levelResponses.length
        };
      }
    }

    // Determinar la intensidad óptima basada en rendimiento y recuperación
    let optimalIntensity = 'moderate';
    let optimalReason = '';

    // Si hay suficientes datos para cada nivel de intensidad
    if (intensityAnalysis.low && intensityAnalysis.moderate && intensityAnalysis.high) {
      // Calcular una puntuación ponderada para cada intensidad
      // Rendimiento: 50%, Recuperación: 30%, Impacto en el estado de ánimo: 20%
      const scores = {
        low: (intensityAnalysis.low.performance_score * 0.5) +
             ((24 - intensityAnalysis.low.recovery_time) / 24 * 10 * 0.3) +
             ((intensityAnalysis.low.mood_impact + 5) / 10 * 10 * 0.2),
        moderate: (intensityAnalysis.moderate.performance_score * 0.5) +
                 ((24 - intensityAnalysis.moderate.recovery_time) / 24 * 10 * 0.3) +
                 ((intensityAnalysis.moderate.mood_impact + 5) / 10 * 10 * 0.2),
        high: (intensityAnalysis.high.performance_score * 0.5) +
             ((24 - intensityAnalysis.high.recovery_time) / 24 * 10 * 0.3) +
             ((intensityAnalysis.high.mood_impact + 5) / 10 * 10 * 0.2)
      };

      // Encontrar la intensidad con la puntuación más alta
      if (scores.low > scores.moderate && scores.low > scores.high) {
        optimalIntensity = 'low';
        optimalReason = 'Mejor equilibrio entre rendimiento y recuperación';
      } else if (scores.high > scores.moderate && scores.high > scores.low) {
        optimalIntensity = 'high';
        optimalReason = 'Mejor rendimiento a pesar de mayor tiempo de recuperación';
      } else {
        optimalReason = 'Mejor equilibrio general entre rendimiento, recuperación y estado de ánimo';
      }
    } else {
      // Si no hay suficientes datos para todos los niveles, usar el que tenga mejor rendimiento
      const availableLevels = Object.keys(intensityAnalysis).filter(
        level => intensityAnalysis[level] && intensityAnalysis[level].sample_size > 0
      );

      if (availableLevels.length > 0) {
        const bestPerformanceLevel = availableLevels.reduce((best, level) =>
          intensityAnalysis[level].performance_score > intensityAnalysis[best].performance_score ? level : best
        , availableLevels[0]);

        optimalIntensity = bestPerformanceLevel;
        optimalReason = 'Mejor rendimiento basado en datos limitados';
      }
    }

    // Crear el patrón de respuesta a intensidad
    const pattern: UserPattern = {
      id: uuidv4(),
      user_id: userId,
      pattern_type: 'intensity_response',
      pattern_data: {
        intensity_analysis: intensityAnalysis,
        optimal_intensity: optimalIntensity,
        optimal_reason: optimalReason,
        total_responses: responses.length
      },
      confidence: Math.min(responses.length * 5, 90), // Confianza basada en cantidad de datos
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Guardar el patrón en la base de datos
    await saveUserPattern(pattern);

    return { data: pattern, error: null };
  } catch (e) {
    console.error(`Error en analyzeIntensityResponses para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en analyzeIntensityResponses')
    };
  }
}

/**
 * Analiza patrones de progresión y estancamiento en ejercicios específicos
 */
export async function analyzeProgressionPatterns(
  userId: string
): Promise<QueryResponse<UserPattern>> {
  try {
    // Obtener entrenamientos del usuario ordenados por fecha
    const { data: workouts, error: workoutsError } = await getWorkouts(userId, {
      orderBy: { column: 'date', ascending: true }
    });

    if (workoutsError) {
      return { data: null, error: workoutsError };
    }

    if (!workouts || workouts.length < 5) {
      return {
        data: null,
        error: new Error('No hay suficientes datos de entrenamiento para analizar progresión')
      };
    }

    // Agrupar entrenamientos por ejercicio y analizar progresión
    const exerciseData: Record<string, {
      dates: string[];
      weights: number[];
      reps: number[];
      name?: string;
      muscle_group?: string;
    }> = {};

    // Extraer datos de ejercicios de los entrenamientos
    workouts.forEach(workout => {
      // Verificar si hay datos de peso y repeticiones
      if (workout.weight && workout.reps && workout.name) {
        const exerciseKey = workout.name.toLowerCase().trim();

        if (!exerciseData[exerciseKey]) {
          exerciseData[exerciseKey] = {
            dates: [],
            weights: [],
            reps: [],
            name: workout.name,
            muscle_group: workout.type
          };
        }

        // Convertir peso y repeticiones a números
        const weight = parseFloat(workout.weight) || 0;
        const reps = parseInt(workout.reps) || 0;

        if (weight > 0 && reps > 0) {
          exerciseData[exerciseKey].dates.push(workout.date);
          exerciseData[exerciseKey].weights.push(weight);
          exerciseData[exerciseKey].reps.push(reps);
        }
      }
    });

    // Analizar progresión para cada ejercicio
    const progressionPatterns: ProgressionPattern[] = [];

    for (const [exerciseKey, data] of Object.entries(exerciseData)) {
      // Solo analizar ejercicios con suficientes datos
      if (data.dates.length >= 3) {
        // Calcular volumen (peso x repeticiones) para cada sesión
        const volumes = data.weights.map((weight, i) => weight * data.reps[i]);

        // Convertir fechas a objetos Date
        const dates = data.dates.map(d => new Date(d));

        // Calcular días entre primera y última sesión
        const daysDiff = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
        const weeksDiff = daysDiff / 7;

        if (weeksDiff > 0) {
          // Calcular tasa de progresión semanal
          const firstVolume = volumes[0];
          const lastVolume = volumes[volumes.length - 1];
          const volumeChange = lastVolume - firstVolume;
          const weeklyProgressionRate = (volumeChange / firstVolume) * 100 / weeksDiff;

          // Determinar si está progresando, estancado o retrocediendo
          const isProgressing = weeklyProgressionRate > 1; // Más de 1% de mejora semanal
          const isStagnant = Math.abs(weeklyProgressionRate) <= 1; // Entre -1% y 1% por semana
          const isRegressing = weeklyProgressionRate < -1; // Más de 1% de pérdida semanal

          // Encontrar fecha de última progresión
          let lastProgressionDate = null;
          for (let i = volumes.length - 1; i > 0; i--) {
            if (volumes[i] > volumes[i-1]) {
              lastProgressionDate = data.dates[i];
              break;
            }
          }

          progressionPatterns.push({
            exercise_name: data.name,
            muscle_group: data.muscle_group,
            progression_rate: parseFloat(weeklyProgressionRate.toFixed(2)),
            weeks_of_data: Math.round(weeksDiff),
            is_progressing: isProgressing,
            is_stagnant: isStagnant,
            is_regressing: isRegressing,
            last_progression_date: lastProgressionDate
          });
        }
      }
    }

    // Guardar patrones de progresión en la base de datos
    for (const pattern of progressionPatterns) {
      await supabase
        .from('progression_patterns')
        .upsert([{
          user_id: userId,
          exercise_name: pattern.exercise_name,
          muscle_group: pattern.muscle_group,
          progression_rate: pattern.progression_rate,
          weeks_of_data: pattern.weeks_of_data,
          is_progressing: pattern.is_progressing,
          is_stagnant: pattern.is_stagnant,
          is_regressing: pattern.is_regressing,
          last_progression_date: pattern.last_progression_date,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'user_id, exercise_name'
        });
    }

    // Crear patrón de progresión general
    const progressingExercises = progressionPatterns.filter(p => p.is_progressing).length;
    const stagnantExercises = progressionPatterns.filter(p => p.is_stagnant).length;
    const regressingExercises = progressionPatterns.filter(p => p.is_regressing).length;

    const pattern: UserPattern = {
      id: uuidv4(),
      user_id: userId,
      pattern_type: 'progression',
      pattern_data: {
        exercise_patterns: progressionPatterns,
        summary: {
          total_exercises_analyzed: progressionPatterns.length,
          progressing_exercises: progressingExercises,
          stagnant_exercises: stagnantExercises,
          regressing_exercises: regressingExercises,
          progressing_percentage: progressionPatterns.length > 0
            ? (progressingExercises / progressionPatterns.length) * 100
            : 0
        }
      },
      confidence: Math.min(progressionPatterns.length * 10, 90),
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Guardar el patrón en la base de datos
    await saveUserPattern(pattern);

    return { data: pattern, error: null };
  } catch (e) {
    console.error(`Error en analyzeProgressionPatterns para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en analyzeProgressionPatterns')
    };
  }
}

/**
 * Analiza la correlación entre estado de ánimo y rendimiento en entrenamientos
 */
export async function analyzeMoodCorrelations(
  userId: string
): Promise<QueryResponse<UserPattern>> {
  try {
    // Obtener datos de estado de ánimo
    const { data: moods, error: moodsError } = await getMoods(userId);

    if (moodsError) {
      return { data: null, error: moodsError };
    }

    // Obtener entrenamientos
    const { data: workouts, error: workoutsError } = await getWorkouts(userId);

    if (workoutsError) {
      return { data: null, error: workoutsError };
    }

    if (!moods || !workouts || moods.length < 3 || workouts.length < 3) {
      return {
        data: null,
        error: new Error('No hay suficientes datos de estado de ánimo o entrenamientos para analizar correlaciones')
      };
    }

    // Agrupar entrenamientos por tipo
    const workoutsByType: Record<string, any[]> = {};

    workouts.forEach(workout => {
      if (!workoutsByType[workout.type]) {
        workoutsByType[workout.type] = [];
      }
      workoutsByType[workout.type].push(workout);
    });

    // Analizar correlación entre estado de ánimo y entrenamientos
    const correlations: MoodCorrelation[] = [];

    for (const [type, typeWorkouts] of Object.entries(workoutsByType)) {
      if (typeWorkouts.length < 2) continue;

      let totalMoodBefore = 0;
      let totalMoodAfter = 0;
      let count = 0;

      // Para cada entrenamiento, buscar estados de ánimo cercanos
      typeWorkouts.forEach(workout => {
        const workoutDate = new Date(workout.date);

        // Buscar estado de ánimo antes del entrenamiento (mismo día o día anterior)
        const moodBefore = moods.find(mood => {
          const moodDate = new Date(mood.date);
          const diffDays = (workoutDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 1;
        });

        // Buscar estado de ánimo después del entrenamiento (mismo día o día siguiente)
        const moodAfter = moods.find(mood => {
          const moodDate = new Date(mood.date);
          const diffDays = (moodDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 1;
        });

        if (moodBefore && moodAfter) {
          totalMoodBefore += moodBefore.mood_level;
          totalMoodAfter += moodAfter.mood_level;
          count++;
        }
      });

      if (count > 0) {
        const avgMoodBefore = totalMoodBefore / count;
        const avgMoodAfter = totalMoodAfter / count;
        const avgMoodChange = avgMoodAfter - avgMoodBefore;

        correlations.push({
          workout_type: type,
          mood_before: parseFloat(avgMoodBefore.toFixed(1)),
          mood_after: parseFloat(avgMoodAfter.toFixed(1)),
          mood_change: parseFloat(avgMoodChange.toFixed(1)),
          sample_size: count
        });

        // Guardar correlación en la base de datos
        await supabase
          .from('mood_correlations')
          .upsert([{
            user_id: userId,
            workout_type: type,
            mood_before: parseFloat(avgMoodBefore.toFixed(1)),
            mood_after: parseFloat(avgMoodAfter.toFixed(1)),
            mood_change: parseFloat(avgMoodChange.toFixed(1)),
            sample_size: count,
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'user_id, workout_type'
          });
      }
    }

    // Crear patrón de correlación de estado de ánimo
    const pattern: UserPattern = {
      id: uuidv4(),
      user_id: userId,
      pattern_type: 'mood_correlation',
      pattern_data: {
        correlations,
        best_mood_impact: correlations.length > 0
          ? correlations.reduce((best, current) =>
              current.mood_change > best.mood_change ? current : best
            , correlations[0])
          : null,
        worst_mood_impact: correlations.length > 0
          ? correlations.reduce((worst, current) =>
              current.mood_change < worst.mood_change ? current : worst
            , correlations[0])
          : null
      },
      confidence: Math.min(correlations.reduce((sum, c) => sum + c.sample_size, 0) * 5, 90),
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Guardar el patrón en la base de datos
    await saveUserPattern(pattern);

    return { data: pattern, error: null };
  } catch (e) {
    console.error(`Error en analyzeMoodCorrelations para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en analyzeMoodCorrelations')
    };
  }
}

/**
 * Analiza los patrones de entrenamiento del usuario
 * Esta función examina el historial de entrenamientos para identificar patrones
 */
export async function analyzeWorkoutPatterns(
  userId: string
): Promise<QueryResponse<UserPattern[]>> {
  try {
    // Obtener los últimos 20 entrenamientos del usuario
    const { data: workouts, error: workoutsError } = await getWorkouts(userId, {
      limit: 20,
      orderBy: { column: 'date', ascending: false }
    });

    if (workoutsError) {
      return { data: null, error: workoutsError };
    }

    if (!workouts || workouts.length < 3) {
      console.log(`No hay suficientes datos para el usuario ${userId}. Encontrados: ${workouts ? workouts.length : 0} entrenamientos`);
      return {
        data: null,
        error: new Error(`No hay suficientes datos de entrenamiento para analizar patrones. Se necesitan al menos 3 entrenamientos, pero se encontraron ${workouts ? workouts.length : 0} para el usuario ${userId}`)
      };
    }

    const patterns: UserPattern[] = [];

    // Analizar preferencias de tipo de entrenamiento
    const workoutTypes: Record<string, number> = {};
    workouts.forEach(workout => {
      if (!workoutTypes[workout.type]) {
        workoutTypes[workout.type] = 0;
      }
      workoutTypes[workout.type]++;
    });

    // Calcular porcentajes y encontrar preferencias
    const totalWorkouts = workouts.length;
    const typePreferences: { type: string; percentage: number }[] = [];

    for (const [type, count] of Object.entries(workoutTypes)) {
      const percentage = (count / totalWorkouts) * 100;
      typePreferences.push({ type, percentage });
    }

    // Ordenar por preferencia
    typePreferences.sort((a, b) => b.percentage - a.percentage);

    // Crear patrón de preferencia de tipo de entrenamiento
    if (typePreferences.length > 0) {
      patterns.push({
        id: uuidv4(),
        user_id: userId,
        pattern_type: 'workout_preference',
        pattern_data: {
          preferred_types: typePreferences,
          sample_size: totalWorkouts
        },
        confidence: Math.min(totalWorkouts * 5, 90), // Confianza basada en cantidad de datos
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    // Analizar patrones de tiempo de entrenamiento
    const workoutTimes: Record<string, number> = {
      'morning': 0,   // 5:00 - 11:59
      'afternoon': 0, // 12:00 - 17:59
      'evening': 0,   // 18:00 - 21:59
      'night': 0      // 22:00 - 4:59
    };

    // Analizar días de la semana
    const workoutDays: Record<string, number> = {
      'monday': 0,
      'tuesday': 0,
      'wednesday': 0,
      'thursday': 0,
      'friday': 0,
      'saturday': 0,
      'sunday': 0
    };

    // Analizar frecuencia de entrenamiento
    let workoutFrequency = 0;
    let lastWorkoutDate: Date | null = null;
    let totalGapDays = 0;
    let gapCount = 0;

    // Ordenar entrenamientos por fecha (más antiguo primero)
    const sortedWorkouts = [...workouts].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const hour = workoutDate.getHours();
      const dayOfWeek = workoutDate.getDay(); // 0 = domingo, 1 = lunes, ...

      // Determinar momento del día
      if (hour >= 5 && hour < 12) {
        workoutTimes['morning']++;
      } else if (hour >= 12 && hour < 18) {
        workoutTimes['afternoon']++;
      } else if (hour >= 18 && hour < 22) {
        workoutTimes['evening']++;
      } else {
        workoutTimes['night']++;
      }

      // Determinar día de la semana
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      workoutDays[days[dayOfWeek]]++;

      // Calcular frecuencia (días entre entrenamientos)
      if (lastWorkoutDate) {
        const gapDays = Math.round((workoutDate.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (gapDays > 0) {
          totalGapDays += gapDays;
          gapCount++;
        }
      }

      lastWorkoutDate = workoutDate;
    });

    // Calcular tiempo preferido
    const timePreferences: { time: string; percentage: number }[] = [];
    for (const [time, count] of Object.entries(workoutTimes)) {
      const percentage = (count / totalWorkouts) * 100;
      timePreferences.push({ time, percentage });
    }
    timePreferences.sort((a, b) => b.percentage - a.percentage);

    // Calcular días preferidos
    const dayPreferences: { day: string; percentage: number }[] = [];
    for (const [day, count] of Object.entries(workoutDays)) {
      const percentage = (count / totalWorkouts) * 100;
      dayPreferences.push({ day, percentage });
    }
    dayPreferences.sort((a, b) => b.percentage - a.percentage);

    // Calcular frecuencia promedio
    const averageGapDays = gapCount > 0 ? totalGapDays / gapCount : 0;
    const weeklyFrequency = averageGapDays > 0 ? 7 / averageGapDays : 0;

    // Crear patrón de tiempo de entrenamiento
    patterns.push({
      id: uuidv4(),
      user_id: userId,
      pattern_type: 'timing',
      pattern_data: {
        preferred_times: timePreferences,
        preferred_days: dayPreferences,
        weekly_frequency: weeklyFrequency.toFixed(1),
        average_gap_days: averageGapDays.toFixed(1),
        sample_size: totalWorkouts
      },
      confidence: Math.min(totalWorkouts * 5, 85),
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    // Guardar los patrones detectados en la base de datos
    for (const pattern of patterns) {
      await saveUserPattern(pattern);
    }

    // Ejecutar análisis adicionales en segundo plano
    // No esperamos a que terminen para no bloquear la respuesta
    Promise.all([
      analyzeIntensityResponses(userId).catch(e => console.error('Error en analyzeIntensityResponses:', e)),
      analyzeProgressionPatterns(userId).catch(e => console.error('Error en analyzeProgressionPatterns:', e)),
      analyzeMoodCorrelations(userId).catch(e => console.error('Error en analyzeMoodCorrelations:', e))
    ]).then(() => {
      console.log(`Análisis avanzados completados para el usuario ${userId}`);
    });

    return { data: patterns, error: null };
  } catch (e) {
    console.error(`Error en analyzeWorkoutPatterns para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en analyzeWorkoutPatterns')
    };
  }
}

/**
 * Guarda un patrón de usuario en la base de datos
 */
export async function saveUserPattern(
  pattern: Omit<UserPattern, 'id' | 'created_at'>
): Promise<QueryResponse<UserPattern>> {
  try {
    // Verificar si ya existe un patrón similar
    const { data: existingPatterns, error: queryError } = await supabase
      .from('user_patterns')
      .select('*')
      .eq('user_id', pattern.user_id)
      .eq('pattern_type', pattern.pattern_type);

    if (queryError) {
      return { data: null, error: queryError };
    }

    if (existingPatterns && existingPatterns.length > 0) {
      // Actualizar el patrón existente
      const { data, error } = await supabase
        .from('user_patterns')
        .update({
          pattern_data: pattern.pattern_data,
          confidence: pattern.confidence,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingPatterns[0].id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: data as UserPattern, error: null };
    } else {
      // Crear un nuevo patrón
      const { data, error } = await supabase
        .from('user_patterns')
        .insert([{
          id: uuidv4(),
          user_id: pattern.user_id,
          pattern_type: pattern.pattern_type,
          pattern_data: pattern.pattern_data,
          confidence: pattern.confidence,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: data as UserPattern, error: null };
    }
  } catch (e) {
    console.error('Error en saveUserPattern:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en saveUserPattern')
    };
  }
}

/**
 * Obtiene los patrones de usuario almacenados
 */
export async function getUserPatterns(
  userId: string,
  options?: {
    patternType?: UserPattern['pattern_type'];
  }
): Promise<QueryResponse<UserPattern[]>> {
  try {
    let query = supabase
      .from('user_patterns')
      .select('*')
      .eq('user_id', userId);

    if (options?.patternType) {
      query = query.eq('pattern_type', options.patternType);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data: data as UserPattern[], error: null };
  } catch (e) {
    console.error(`Error en getUserPatterns para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getUserPatterns')
    };
  }
}

/**
 * Genera recomendaciones inteligentes basadas en patrones aprendidos
 */
export async function generateSmartRecommendations(
  userId: string,
  options?: {
    includeWearableData?: boolean;
    includeSimilarUsers?: boolean;
  }
): Promise<QueryResponse<SmartRecommendation[]>> {
  try {
    // Obtener patrones del usuario
    const { data: patterns, error: patternsError } = await getUserPatterns(userId);

    if (patternsError) {
      return { data: null, error: patternsError };
    }

    if (!patterns || patterns.length === 0) {
      // Si no hay patrones, intentar analizarlos primero
      const { error: analysisError } = await analyzeWorkoutPatterns(userId);

      if (analysisError) {
        return {
          data: null,
          error: new Error('No se pudieron generar recomendaciones: ' + analysisError.message)
        };
      }

      // Intentar obtener patrones nuevamente
      const { data: newPatterns, error: newPatternsError } = await getUserPatterns(userId);

      if (newPatternsError || !newPatterns || newPatterns.length === 0) {
        return {
          data: null,
          error: new Error('No hay suficientes datos para generar recomendaciones inteligentes')
        };
      }
    }

    const recommendations: SmartRecommendation[] = [];
    const patternsUsed: string[] = [];

    // Procesar patrones de preferencia de entrenamiento
    const workoutPreferences = patterns.find(p => p.pattern_type === 'workout_preference');

    if (workoutPreferences) {
      const preferredTypes = workoutPreferences.pattern_data.preferred_types;

      if (preferredTypes && preferredTypes.length > 0) {
        const topPreference = preferredTypes[0];

        // Crear recomendación basada en el tipo de entrenamiento preferido
        recommendations.push({
          id: uuidv4(),
          user_id: userId,
          title: `Entrenamiento de ${topPreference.type} personalizado`,
          description: `Basado en tu historial, hemos detectado que prefieres entrenamientos de tipo ${topPreference.type}. Hemos creado un plan optimizado para ti.`,
          recommendation_type: 'workout',
          recommendation_data: {
            workout_type: topPreference.type,
            intensity: 'moderate',
            duration_minutes: 45
          },
          confidence: workoutPreferences.confidence,
          reasoning: `Has realizado entrenamientos de tipo ${topPreference.type} un ${topPreference.percentage.toFixed(0)}% de las veces.`,
          patterns_used: [workoutPreferences.id],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        patternsUsed.push(workoutPreferences.id);
      }
    }

    // Procesar patrones de tiempo y frecuencia
    const timingPattern = patterns.find(p => p.pattern_type === 'timing');

    if (timingPattern) {
      // Obtener momento del día preferido
      const preferredTimes = timingPattern.pattern_data.preferred_times;
      const topTimePreference = preferredTimes[0];

      // Obtener día de la semana preferido
      const preferredDays = timingPattern.pattern_data.preferred_days;
      const topDayPreference = preferredDays[0];

      // Obtener frecuencia semanal
      const weeklyFrequency = parseFloat(timingPattern.pattern_data.weekly_frequency);

      // Mapear nombres de días en español
      const dayNames: Record<string, string> = {
        'monday': 'lunes',
        'tuesday': 'martes',
        'wednesday': 'miércoles',
        'thursday': 'jueves',
        'friday': 'viernes',
        'saturday': 'sábado',
        'sunday': 'domingo'
      };

      // Mapear momentos del día en español
      const timeNames: Record<string, string> = {
        'morning': 'mañana',
        'afternoon': 'tarde',
        'evening': 'noche',
        'night': 'madrugada'
      };

      // Crear recomendación basada en el momento del día preferido
      if (topTimePreference && topTimePreference.percentage > 40) {
        recommendations.push({
          id: uuidv4(),
          user_id: userId,
          title: `Optimiza tu horario de entrenamiento`,
          description: `Hemos detectado que rindes mejor cuando entrenas por la ${timeNames[topTimePreference.time]}.`,
          recommendation_type: 'habit',
          recommendation_data: {
            preferred_time: topTimePreference.time,
            action: 'schedule_workout',
            time_range: topTimePreference.time === 'morning' ? '7:00 - 11:00' :
                        topTimePreference.time === 'afternoon' ? '14:00 - 17:00' :
                        topTimePreference.time === 'evening' ? '18:00 - 21:00' : '22:00 - 5:00'
          },
          confidence: Math.min(topTimePreference.percentage, timingPattern.confidence),
          reasoning: `Entrenas por la ${timeNames[topTimePreference.time]} un ${topTimePreference.percentage.toFixed(0)}% de las veces, lo que sugiere que es tu momento preferido.`,
          patterns_used: [timingPattern.id],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        patternsUsed.push(timingPattern.id);
      }

      // Crear recomendación basada en la frecuencia de entrenamiento
      if (weeklyFrequency > 0) {
        // Determinar si la frecuencia es adecuada o se puede mejorar
        let frequencyRecommendation: SmartRecommendation | null = null;

        if (weeklyFrequency < 3) {
          // Frecuencia baja
          frequencyRecommendation = {
            id: uuidv4(),
            user_id: userId,
            title: `Aumenta tu frecuencia de entrenamiento`,
            description: `Actualmente entrenas ${weeklyFrequency.toFixed(1)} veces por semana. Para mejores resultados, intenta aumentar a 3-4 sesiones semanales.`,
            recommendation_type: 'habit',
            recommendation_data: {
              current_frequency: weeklyFrequency,
              target_frequency: 3,
              action: 'increase_frequency'
            },
            confidence: timingPattern.confidence * 0.8,
            reasoning: `Una mayor frecuencia de entrenamiento (3-4 veces por semana) puede mejorar significativamente tus resultados.`,
            patterns_used: [timingPattern.id],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else if (weeklyFrequency > 5) {
          // Frecuencia alta - posible sobreentrenamiento
          frequencyRecommendation = {
            id: uuidv4(),
            user_id: userId,
            title: `Optimiza tu recuperación`,
            description: `Entrenas con alta frecuencia (${weeklyFrequency.toFixed(1)} veces/semana). Asegúrate de incluir días de descanso para evitar el sobreentrenamiento.`,
            recommendation_type: 'habit',
            recommendation_data: {
              current_frequency: weeklyFrequency,
              action: 'optimize_recovery',
              recovery_tips: [
                'Incluye al menos 2 días de descanso completo a la semana',
                'Alterna entre entrenamientos de alta y baja intensidad',
                'Prioriza el sueño y la nutrición para una mejor recuperación'
              ]
            },
            confidence: timingPattern.confidence * 0.7,
            reasoning: `Entrenar ${weeklyFrequency.toFixed(1)} veces por semana puede aumentar el riesgo de sobreentrenamiento si no se gestiona adecuadamente la recuperación.`,
            patterns_used: [timingPattern.id],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else if (topDayPreference && topDayPreference.percentage > 30) {
          // Frecuencia óptima pero con preferencia por ciertos días
          frequencyRecommendation = {
            id: uuidv4(),
            user_id: userId,
            title: `Optimiza tu rutina semanal`,
            description: `Hemos notado que prefieres entrenar los ${dayNames[topDayPreference.day]}. Hemos creado un plan semanal optimizado basado en tus preferencias.`,
            recommendation_type: 'plan',
            recommendation_data: {
              preferred_day: topDayPreference.day,
              weekly_frequency: weeklyFrequency,
              suggested_schedule: createSuggestedSchedule(preferredDays, weeklyFrequency)
            },
            confidence: Math.min(topDayPreference.percentage, timingPattern.confidence),
            reasoning: `Entrenas los ${dayNames[topDayPreference.day]} un ${topDayPreference.percentage.toFixed(0)}% de las veces, y mantienes una buena frecuencia de ${weeklyFrequency.toFixed(1)} entrenamientos por semana.`,
            patterns_used: [timingPattern.id],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }

        if (frequencyRecommendation) {
          recommendations.push(frequencyRecommendation);
        }
      }
    }

    // Combinar patrones para recomendaciones más sofisticadas
    if (workoutPreferences && timingPattern && !patternsUsed.includes(workoutPreferences.id + timingPattern.id)) {
      const preferredTypes = workoutPreferences.pattern_data.preferred_types;
      const preferredTimes = timingPattern.pattern_data.preferred_times;

      if (preferredTypes.length > 0 && preferredTimes.length > 0) {
        const topType = preferredTypes[0];
        const topTime = preferredTimes[0];

        // Mapear momentos del día en español
        const timeNames: Record<string, string> = {
          'morning': 'mañana',
          'afternoon': 'tarde',
          'evening': 'noche',
          'night': 'madrugada'
        };

        // Crear recomendación combinada
        recommendations.push({
          id: uuidv4(),
          user_id: userId,
          title: `Plan personalizado: ${topType.type} por la ${timeNames[topTime.time]}`,
          description: `Basado en tu historial, hemos creado un plan de entrenamiento de ${topType.type} optimizado para realizar por la ${timeNames[topTime.time]}.`,
          recommendation_type: 'workout',
          recommendation_data: {
            workout_type: topType.type,
            preferred_time: topTime.time,
            intensity: topTime.time === 'morning' ? 'moderate' :
                      topTime.time === 'evening' ? 'high' : 'moderate',
            duration_minutes: topTime.time === 'morning' ? 30 : 45
          },
          confidence: Math.min(workoutPreferences.confidence, timingPattern.confidence) * 0.9,
          reasoning: `Combina tu preferencia por entrenamientos de ${topType.type} (${topType.percentage.toFixed(0)}%) con tu momento preferido del día (${timeNames[topTime.time]}, ${topTime.percentage.toFixed(0)}%).`,
          patterns_used: [workoutPreferences.id, timingPattern.id],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // Incluir recomendaciones basadas en datos de wearables si se solicita
    if (options?.includeWearableData) {
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { analyzeRecoveryPatterns, isReadyToTrain } = await import('./wearable-integration');

        // Analizar patrones de recuperación
        const { data: recoveryPattern } = await analyzeRecoveryPatterns(userId);

        if (recoveryPattern) {
          // Verificar si el usuario está listo para entrenar
          const { data: readyStatus } = await isReadyToTrain(userId);

          if (readyStatus) {
            // Crear recomendación basada en estado de recuperación
            const recoveryRecommendation: SmartRecommendation = {
              id: uuidv4(),
              user_id: userId,
              title: readyStatus.ready
                ? 'Óptimo para entrenar hoy'
                : 'Día de recuperación recomendado',
              description: readyStatus.ready
                ? `Tu puntuación de recuperación es ${readyStatus.recovery_score}/100. Es un buen momento para entrenar.`
                : `Tu puntuación de recuperación es ${readyStatus.recovery_score}/100. Considera un entrenamiento ligero o descanso.`,
              recommendation_type: readyStatus.ready ? 'workout' : 'recovery',
              recommendation_data: {
                recovery_score: readyStatus.recovery_score,
                recommendations: readyStatus.recommendations,
                sleep_quality: recoveryPattern.pattern_data.daily_recovery[0]?.sleep_quality || 0,
                heart_rate: recoveryPattern.pattern_data.daily_recovery[0]?.resting_heart_rate || 0,
                stress_level: recoveryPattern.pattern_data.daily_recovery[0]?.stress_level || 0
              },
              confidence: Math.min(recoveryPattern.confidence, 90),
              reasoning: `Basado en tus datos de sueño, frecuencia cardíaca y niveles de estrés.`,
              patterns_used: [recoveryPattern.id],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            recommendations.push(recoveryRecommendation);
          }

          // Añadir recomendación de sueño si es necesario
          if (recoveryPattern.pattern_data.sleep_patterns.average_duration < 420) { // Menos de 7 horas
            const sleepRecommendation: SmartRecommendation = {
              id: uuidv4(),
              user_id: userId,
              title: 'Optimiza tu sueño para mejor rendimiento',
              description: `Estás durmiendo un promedio de ${Math.round(recoveryPattern.pattern_data.sleep_patterns.average_duration / 60)} horas. Aumentar a 7-8 horas mejorará tu recuperación y rendimiento.`,
              recommendation_type: 'habit',
              recommendation_data: {
                action: 'improve_sleep',
                current_duration: recoveryPattern.pattern_data.sleep_patterns.average_duration,
                target_duration: 480, // 8 horas en minutos
                tips: [
                  'Mantén un horario regular de sueño',
                  'Evita pantallas 1 hora antes de dormir',
                  'Mantén tu habitación fresca y oscura',
                  'Limita la cafeína después del mediodía'
                ]
              },
              confidence: recoveryPattern.confidence * 0.9,
              reasoning: 'El sueño insuficiente afecta negativamente la recuperación muscular y el rendimiento deportivo.',
              patterns_used: [recoveryPattern.id],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            recommendations.push(sleepRecommendation);
          }
        }
      } catch (e) {
        console.error('Error al generar recomendaciones basadas en wearables:', e);
        // Continuar con otras recomendaciones
      }
    }

    // Incluir recomendaciones basadas en usuarios similares si se solicita
    if (options?.includeSimilarUsers) {
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { getRecommendationsFromSimilarUsers } = await import('./user-clustering');

        // Obtener recomendaciones de usuarios similares
        const { data: similarRecommendations } = await getRecommendationsFromSimilarUsers(userId);

        if (similarRecommendations && similarRecommendations.length > 0) {
          // Convertir a formato SmartRecommendation
          for (const rec of similarRecommendations) {
            if (rec.type === 'workout_recommendation') {
              recommendations.push({
                id: uuidv4(),
                user_id: userId,
                title: `${rec.workout_name} - Popular entre usuarios similares`,
                description: `Este entrenamiento de ${rec.workout_type} es popular entre usuarios con patrones similares a los tuyos.`,
                recommendation_type: 'workout',
                recommendation_data: {
                  workout_type: rec.workout_type,
                  workout_name: rec.workout_name,
                  sets: rec.example.sets,
                  reps: rec.example.reps,
                  weight: rec.example.weight,
                  source: 'similar_users'
                },
                confidence: rec.confidence,
                reasoning: `${rec.popularity} usuarios con patrones similares a los tuyos han tenido buenos resultados con este entrenamiento.`,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        }
      } catch (e) {
        console.error('Error al generar recomendaciones basadas en usuarios similares:', e);
        // Continuar con otras recomendaciones
      }
    }

    // Guardar las recomendaciones en la base de datos
    for (const recommendation of recommendations) {
      await saveSmartRecommendation(recommendation);
    }

    return { data: recommendations, error: null };
  } catch (e) {
    console.error(`Error en generateSmartRecommendations para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en generateSmartRecommendations')
    };
  }
}

/**
 * Crea un horario sugerido basado en las preferencias de días
 */
function createSuggestedSchedule(
  preferredDays: { day: string; percentage: number }[],
  weeklyFrequency: number
): { day: string; workout: boolean; reason: string }[] {
  const schedule: { day: string; workout: boolean; reason: string }[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Ordenar días por preferencia
  const sortedDays = [...preferredDays].sort((a, b) => b.percentage - a.percentage);

  // Seleccionar los N días más preferidos, donde N es la frecuencia semanal redondeada
  const targetFrequency = Math.round(weeklyFrequency);
  const selectedDays = sortedDays.slice(0, targetFrequency).map(d => d.day);

  // Crear horario para toda la semana
  for (const day of days) {
    const isWorkoutDay = selectedDays.includes(day);
    const dayData = preferredDays.find(d => d.day === day);
    const percentage = dayData ? dayData.percentage : 0;

    schedule.push({
      day,
      workout: isWorkoutDay,
      reason: isWorkoutDay
        ? `Entrenas este día un ${percentage.toFixed(0)}% de las veces`
        : 'Día de descanso recomendado'
    });
  }

  return schedule;
}

/**
 * Guarda una recomendación inteligente en la base de datos
 */
export async function saveSmartRecommendation(
  recommendation: Omit<SmartRecommendation, 'id' | 'created_at' | 'updated_at'>
): Promise<QueryResponse<SmartRecommendation>> {
  try {
    const { data, error } = await supabase
      .from('smart_recommendations')
      .insert([{
        id: uuidv4(),
        user_id: recommendation.user_id,
        title: recommendation.title,
        description: recommendation.description,
        recommendation_type: recommendation.recommendation_type,
        recommendation_data: recommendation.recommendation_data,
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        patterns_used: recommendation.patterns_used,
        is_active: recommendation.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as SmartRecommendation, error: null };
  } catch (e) {
    console.error('Error en saveSmartRecommendation:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en saveSmartRecommendation')
    };
  }
}

/**
 * Obtiene las recomendaciones inteligentes para un usuario
 */
export async function getSmartRecommendations(
  userId: string,
  options?: {
    limit?: number;
    type?: SmartRecommendation['recommendation_type'];
    activeOnly?: boolean;
  }
): Promise<QueryResponse<SmartRecommendation[]>> {
  try {
    let query = supabase
      .from('smart_recommendations')
      .select('*')
      .eq('user_id', userId);

    if (options?.type) {
      query = query.eq('recommendation_type', options.type);
    }

    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data: data as SmartRecommendation[], error: null };
  } catch (e) {
    console.error(`Error en getSmartRecommendations para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getSmartRecommendations')
    };
  }
}

/**
 * Registra feedback sobre una recomendación y actualiza la confianza
 */
export async function saveRecommendationFeedback(
  feedback: Omit<RecommendationFeedback, 'id' | 'created_at'>
): Promise<QueryResponse<RecommendationFeedback>> {
  try {
    const { data, error } = await supabase
      .from('recommendation_feedback')
      .insert([{
        id: uuidv4(),
        user_id: feedback.user_id,
        recommendation_id: feedback.recommendation_id,
        recommendation_type: feedback.recommendation_type,
        rating: feedback.rating,
        feedback_text: feedback.feedback_text,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Obtener la recomendación actual
    const { data: recommendation, error: recError } = await supabase
      .from('smart_recommendations')
      .select('*')
      .eq('id', feedback.recommendation_id)
      .single();

    if (recError) {
      console.error('Error al obtener recomendación:', recError);
      return { data: data as RecommendationFeedback, error: null };
    }

    // Obtener todo el feedback para esta recomendación
    const { data: allFeedback, error: feedbackError } = await supabase
      .from('recommendation_feedback')
      .select('*')
      .eq('recommendation_id', feedback.recommendation_id);

    if (feedbackError) {
      console.error('Error al obtener feedback:', feedbackError);
      return { data: data as RecommendationFeedback, error: null };
    }

    // Calcular métricas de feedback
    const feedbackCount = allFeedback ? allFeedback.length : 1;
    const positiveFeedback = allFeedback ? allFeedback.filter(f => f.rating >= 4).length : (feedback.rating >= 4 ? 1 : 0);
    const positiveFeedbackRatio = positiveFeedback / feedbackCount;

    // Ajustar confianza basada en feedback
    let newConfidence = recommendation.confidence;

    if (positiveFeedbackRatio >= 0.8) {
      // Aumentar confianza si el feedback es muy positivo
      newConfidence = Math.min(newConfidence + 5, 100);
    } else if (positiveFeedbackRatio <= 0.2) {
      // Reducir confianza si el feedback es muy negativo
      newConfidence = Math.max(newConfidence - 10, 10);
    }

    // Si la valoración es baja, desactivar la recomendación
    if (feedback.rating < 3) {
      await supabase
        .from('smart_recommendations')
        .update({
          is_active: false,
          confidence: newConfidence,
          feedback_count: feedbackCount,
          positive_feedback_ratio: positiveFeedbackRatio,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedback.recommendation_id);
    } else {
      // Actualizar métricas de feedback
      await supabase
        .from('smart_recommendations')
        .update({
          confidence: newConfidence,
          feedback_count: feedbackCount,
          positive_feedback_ratio: positiveFeedbackRatio,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedback.recommendation_id);
    }

    // Aprender de este feedback para futuras recomendaciones
    learnFromFeedback(feedback).catch(e =>
      console.error('Error al aprender del feedback:', e)
    );

    return { data: data as RecommendationFeedback, error: null };
  } catch (e) {
    console.error('Error en saveRecommendationFeedback:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en saveRecommendationFeedback')
    };
  }
}

/**
 * Aprende del feedback del usuario para mejorar futuras recomendaciones
 */
async function learnFromFeedback(
  feedback: Omit<RecommendationFeedback, 'id' | 'created_at'>
): Promise<void> {
  try {
    // Obtener la recomendación
    const { data: recommendation, error: recError } = await supabase
      .from('smart_recommendations')
      .select('*')
      .eq('id', feedback.recommendation_id)
      .single();

    if (recError) {
      console.error('Error al obtener recomendación para aprendizaje:', recError);
      return;
    }

    // Obtener preferencias actuales del usuario
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', feedback.user_id);

    if (prefError) {
      console.error('Error al obtener preferencias para aprendizaje:', prefError);
      return;
    }

    // Determinar si el feedback es positivo o negativo
    const isPositive = feedback.rating >= 4;
    const isNegative = feedback.rating <= 2;

    if (!isPositive && !isNegative) {
      // Feedback neutral, no aprendemos de él
      return;
    }

    // Extraer información relevante de la recomendación
    const recType = recommendation.recommendation_type;
    const recData = recommendation.recommendation_data;

    // Actualizar preferencias basadas en el tipo de recomendación
    if (recType === 'workout') {
      // Aprender sobre preferencias de tipo de entrenamiento
      if (recData.workout_type) {
        updatePreference(
          feedback.user_id,
          'exercise_type',
          recData.workout_type,
          isPositive ? 5 : -5
        );
      }

      // Aprender sobre preferencias de intensidad
      if (recData.intensity) {
        updatePreference(
          feedback.user_id,
          'intensity_level',
          recData.intensity,
          isPositive ? 5 : -5
        );
      }
    } else if (recType === 'habit' && recData.preferred_time) {
      // Aprender sobre preferencias de momento del día
      updatePreference(
        feedback.user_id,
        'time_of_day',
        recData.preferred_time,
        isPositive ? 5 : -5
      );
    } else if (recType === 'recovery') {
      // Aprender sobre necesidades de recuperación
      updatePreference(
        feedback.user_id,
        'recovery_need',
        'high',
        isPositive ? 5 : -5
      );
    }

    console.log(`Aprendizaje de feedback completado para usuario ${feedback.user_id}`);
  } catch (e) {
    console.error('Error en learnFromFeedback:', e);
  }
}

/**
 * Actualiza una preferencia de usuario basada en feedback
 */
async function updatePreference(
  userId: string,
  preferenceType: string,
  preferenceValue: string,
  strengthChange: number
): Promise<void> {
  try {
    // Buscar si ya existe la preferencia
    const { data: existingPref, error: queryError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_type', preferenceType)
      .eq('preference_value', preferenceValue)
      .single();

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no se encontró
      console.error('Error al buscar preferencia:', queryError);
      return;
    }

    if (existingPref) {
      // Actualizar preferencia existente
      const newStrength = Math.max(0, Math.min(100, existingPref.strength + strengthChange));

      await supabase
        .from('user_preferences')
        .update({
          strength: newStrength,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPref.id);
    } else {
      // Crear nueva preferencia
      const initialStrength = 50 + strengthChange; // Valor inicial moderado
      const strength = Math.max(0, Math.min(100, initialStrength));

      await supabase
        .from('user_preferences')
        .insert([{
          id: uuidv4(),
          user_id: userId,
          preference_type: preferenceType,
          preference_value: preferenceValue,
          strength,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
    }
  } catch (e) {
    console.error('Error en updatePreference:', e);
  }
}
