import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { PostgrestError } from '@supabase/supabase-js';
import { UserCluster, UserPattern, QueryResponse } from './learning-algorithm';
import { getUserProfile } from './supabase-queries';

/**
 * Encuentra usuarios similares basados en patrones y preferencias
 */
export async function findSimilarUsers(
  userId: string,
  options?: {
    minSimilarity?: number; // 0-1, default 0.7
    maxUsers?: number; // default 10
  }
): Promise<QueryResponse<string[]>> {
  try {
    const minSimilarity = options?.minSimilarity || 0.7;
    const maxUsers = options?.maxUsers || 10;

    // Obtener patrones del usuario actual
    const { data: userPatterns, error: patternsError } = await supabase
      .from('user_patterns')
      .select('*')
      .eq('user_id', userId);

    if (patternsError) {
      return { data: null, error: patternsError };
    }

    if (!userPatterns || userPatterns.length === 0) {
      return {
        data: null,
        error: new Error('No hay suficientes datos de patrones para encontrar usuarios similares')
      };
    }

    // Obtener preferencias del usuario actual
    const { data: userPreferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (preferencesError) {
      return { data: null, error: preferencesError };
    }

    // Obtener perfil del usuario
    const { data: userProfile, error: profileError } = await getUserProfile(userId);

    if (profileError) {
      return { data: null, error: profileError };
    }

    // Obtener todos los usuarios con patrones
    const { data: allPatterns, error: allPatternsError } = await supabase
      .from('user_patterns')
      .select('user_id')
      .neq('user_id', userId)
      .limit(100);

    if (allPatternsError) {
      return { data: null, error: allPatternsError };
    }

    if (!allPatterns || allPatterns.length === 0) {
      return {
        data: null,
        error: new Error('No hay otros usuarios con patrones para comparar')
      };
    }

    // Obtener IDs únicos de usuarios
    const otherUserIds = [...new Set(allPatterns.map(p => p.user_id))];

    // Calcular similitud para cada usuario
    const userSimilarities: { userId: string; similarity: number }[] = [];

    for (const otherId of otherUserIds) {
      // Obtener patrones del otro usuario
      const { data: otherPatterns, error: otherPatternsError } = await supabase
        .from('user_patterns')
        .select('*')
        .eq('user_id', otherId);

      if (otherPatternsError || !otherPatterns) {
        console.error(`Error al obtener patrones para usuario ${otherId}:`, otherPatternsError);
        continue;
      }

      // Obtener preferencias del otro usuario
      const { data: otherPreferences, error: otherPreferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', otherId);

      if (otherPreferencesError) {
        console.error(`Error al obtener preferencias para usuario ${otherId}:`, otherPreferencesError);
        continue;
      }

      // Obtener perfil del otro usuario
      const { data: otherProfile, error: otherProfileError } = await getUserProfile(otherId);

      if (otherProfileError || !otherProfile) {
        console.error(`Error al obtener perfil para usuario ${otherId}:`, otherProfileError);
        continue;
      }

      // Calcular similitud de patrones (50%)
      let patternSimilarity = 0;
      if (userPatterns.length > 0 && otherPatterns.length > 0) {
        // Comparar patrones de tipo de entrenamiento
        const userWorkoutPattern = userPatterns.find(p => p.pattern_type === 'workout_preference');
        const otherWorkoutPattern = otherPatterns.find(p => p.pattern_type === 'workout_preference');

        if (userWorkoutPattern && otherWorkoutPattern) {
          const userTypes = userWorkoutPattern.pattern_data.preferred_types;
          const otherTypes = otherWorkoutPattern.pattern_data.preferred_types;

          // Comparar los tipos principales
          if (userTypes.length > 0 && otherTypes.length > 0) {
            const userTopType = userTypes[0].type;
            const otherTopType = otherTypes[0].type;
            patternSimilarity += userTopType === otherTopType ? 0.3 : 0;
          }
        }

        // Comparar patrones de tiempo
        const userTimingPattern = userPatterns.find(p => p.pattern_type === 'timing');
        const otherTimingPattern = otherPatterns.find(p => p.pattern_type === 'timing');

        if (userTimingPattern && otherTimingPattern) {
          // Comparar momento del día preferido
          const userTimes = userTimingPattern.pattern_data.preferred_times;
          const otherTimes = otherTimingPattern.pattern_data.preferred_times;

          if (userTimes.length > 0 && otherTimes.length > 0) {
            const userTopTime = userTimes[0].time;
            const otherTopTime = otherTimes[0].time;
            patternSimilarity += userTopTime === otherTopTime ? 0.2 : 0;
          }

          // Comparar frecuencia de entrenamiento
          const userFrequency = parseFloat(userTimingPattern.pattern_data.weekly_frequency);
          const otherFrequency = parseFloat(otherTimingPattern.pattern_data.weekly_frequency);
          const frequencyDiff = Math.abs(userFrequency - otherFrequency);
          patternSimilarity += frequencyDiff <= 1 ? 0.2 : (frequencyDiff <= 2 ? 0.1 : 0);
        }

        // Comparar respuesta a intensidad
        const userIntensityPattern = userPatterns.find(p => p.pattern_type === 'intensity_response');
        const otherIntensityPattern = otherPatterns.find(p => p.pattern_type === 'intensity_response');

        if (userIntensityPattern && otherIntensityPattern) {
          const userOptimalIntensity = userIntensityPattern.pattern_data.optimal_intensity;
          const otherOptimalIntensity = otherIntensityPattern.pattern_data.optimal_intensity;
          patternSimilarity += userOptimalIntensity === otherOptimalIntensity ? 0.3 : 0;
        }
      }

      // Calcular similitud de perfil (30%)
      let profileSimilarity = 0;
      
      // Comparar nivel
      if (userProfile.level && otherProfile.level) {
        profileSimilarity += userProfile.level === otherProfile.level ? 0.15 : 0;
      }
      
      // Comparar objetivo
      if (userProfile.goal && otherProfile.goal) {
        profileSimilarity += userProfile.goal === otherProfile.goal ? 0.15 : 0;
      }

      // Calcular similitud de preferencias (20%)
      let preferenceSimilarity = 0;
      if (userPreferences && otherPreferences && userPreferences.length > 0 && otherPreferences.length > 0) {
        // Contar preferencias coincidentes
        let matchCount = 0;
        let totalComparisons = 0;
        
        for (const userPref of userPreferences) {
          const matchingPref = otherPreferences.find(
            p => p.preference_type === userPref.preference_type && 
                 p.preference_value === userPref.preference_value
          );
          
          if (matchingPref) {
            // Calcular similitud basada en la fuerza de la preferencia
            const strengthDiff = Math.abs(userPref.strength - matchingPref.strength);
            const strengthSimilarity = 1 - (strengthDiff / 100);
            matchCount += strengthSimilarity;
          }
          
          totalComparisons++;
        }
        
        preferenceSimilarity = totalComparisons > 0 ? (matchCount / totalComparisons) * 0.2 : 0;
      }

      // Calcular similitud total
      const totalSimilarity = patternSimilarity + profileSimilarity + preferenceSimilarity;
      
      userSimilarities.push({
        userId: otherId,
        similarity: totalSimilarity
      });
    }

    // Ordenar por similitud y filtrar por umbral mínimo
    const similarUsers = userSimilarities
      .filter(u => u.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxUsers)
      .map(u => u.userId);

    return { data: similarUsers, error: null };
  } catch (e) {
    console.error(`Error en findSimilarUsers para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en findSimilarUsers')
    };
  }
}

/**
 * Crea un cluster de usuarios similares
 */
export async function createUserCluster(
  userId: string,
  options?: {
    minSimilarity?: number;
    maxUsers?: number;
    clusterName?: string;
  }
): Promise<QueryResponse<UserCluster>> {
  try {
    // Encontrar usuarios similares
    const { data: similarUsers, error: similarError } = await findSimilarUsers(userId, {
      minSimilarity: options?.minSimilarity,
      maxUsers: options?.maxUsers
    });

    if (similarError) {
      return { data: null, error: similarError };
    }

    if (!similarUsers || similarUsers.length === 0) {
      return {
        data: null,
        error: new Error('No se encontraron usuarios similares para crear un cluster')
      };
    }

    // Obtener patrones comunes entre los usuarios
    const allUserIds = [userId, ...similarUsers];
    const commonPatterns = await findCommonPatterns(allUserIds);

    // Crear nombre para el cluster si no se proporciona
    const clusterName = options?.clusterName || `Grupo de entrenamiento ${new Date().toLocaleDateString()}`;

    // Crear el cluster
    const cluster: UserCluster = {
      id: uuidv4(),
      cluster_name: clusterName,
      cluster_description: `Grupo de ${allUserIds.length} usuarios con patrones de entrenamiento similares`,
      user_ids: allUserIds,
      common_patterns: commonPatterns,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Guardar el cluster en la base de datos
    const { data, error } = await supabase
      .from('user_clusters')
      .insert([cluster])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as UserCluster, error: null };
  } catch (e) {
    console.error(`Error en createUserCluster para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en createUserCluster')
    };
  }
}

/**
 * Encuentra patrones comunes entre un grupo de usuarios
 */
async function findCommonPatterns(
  userIds: string[]
): Promise<{ pattern_type: string; pattern_data: any }[]> {
  try {
    const commonPatterns = [];

    // Obtener todos los patrones para estos usuarios
    const { data: allPatterns, error } = await supabase
      .from('user_patterns')
      .select('*')
      .in('user_id', userIds);

    if (error || !allPatterns) {
      console.error('Error al obtener patrones para usuarios:', error);
      return [];
    }

    // Agrupar patrones por tipo
    const patternsByType: Record<string, UserPattern[]> = {};
    
    allPatterns.forEach(pattern => {
      if (!patternsByType[pattern.pattern_type]) {
        patternsByType[pattern.pattern_type] = [];
      }
      patternsByType[pattern.pattern_type].push(pattern);
    });

    // Analizar patrones comunes por tipo
    for (const [type, patterns] of Object.entries(patternsByType)) {
      if (type === 'workout_preference') {
        // Encontrar tipos de entrenamiento comunes
        const typeFrequency: Record<string, number> = {};
        
        patterns.forEach(pattern => {
          const preferredTypes = pattern.pattern_data.preferred_types;
          if (preferredTypes && preferredTypes.length > 0) {
            const topType = preferredTypes[0].type;
            typeFrequency[topType] = (typeFrequency[topType] || 0) + 1;
          }
        });
        
        // Encontrar el tipo más común
        let mostCommonType = '';
        let highestFrequency = 0;
        
        for (const [type, frequency] of Object.entries(typeFrequency)) {
          if (frequency > highestFrequency) {
            mostCommonType = type;
            highestFrequency = frequency;
          }
        }
        
        if (mostCommonType && highestFrequency >= userIds.length * 0.5) {
          commonPatterns.push({
            pattern_type: 'workout_preference',
            pattern_data: {
              common_workout_type: mostCommonType,
              frequency_percentage: (highestFrequency / userIds.length) * 100
            }
          });
        }
      } else if (type === 'timing') {
        // Encontrar momentos del día comunes
        const timeFrequency: Record<string, number> = {};
        
        patterns.forEach(pattern => {
          const preferredTimes = pattern.pattern_data.preferred_times;
          if (preferredTimes && preferredTimes.length > 0) {
            const topTime = preferredTimes[0].time;
            timeFrequency[topTime] = (timeFrequency[topTime] || 0) + 1;
          }
        });
        
        // Encontrar el momento más común
        let mostCommonTime = '';
        let highestFrequency = 0;
        
        for (const [time, frequency] of Object.entries(timeFrequency)) {
          if (frequency > highestFrequency) {
            mostCommonTime = time;
            highestFrequency = frequency;
          }
        }
        
        if (mostCommonTime && highestFrequency >= userIds.length * 0.5) {
          commonPatterns.push({
            pattern_type: 'timing',
            pattern_data: {
              common_time: mostCommonTime,
              frequency_percentage: (highestFrequency / userIds.length) * 100
            }
          });
        }
      } else if (type === 'intensity_response') {
        // Encontrar intensidad óptima común
        const intensityFrequency: Record<string, number> = {};
        
        patterns.forEach(pattern => {
          const optimalIntensity = pattern.pattern_data.optimal_intensity;
          if (optimalIntensity) {
            intensityFrequency[optimalIntensity] = (intensityFrequency[optimalIntensity] || 0) + 1;
          }
        });
        
        // Encontrar la intensidad más común
        let mostCommonIntensity = '';
        let highestFrequency = 0;
        
        for (const [intensity, frequency] of Object.entries(intensityFrequency)) {
          if (frequency > highestFrequency) {
            mostCommonIntensity = intensity;
            highestFrequency = frequency;
          }
        }
        
        if (mostCommonIntensity && highestFrequency >= userIds.length * 0.5) {
          commonPatterns.push({
            pattern_type: 'intensity_response',
            pattern_data: {
              common_optimal_intensity: mostCommonIntensity,
              frequency_percentage: (highestFrequency / userIds.length) * 100
            }
          });
        }
      }
    }

    return commonPatterns;
  } catch (e) {
    console.error('Error en findCommonPatterns:', e);
    return [];
  }
}

/**
 * Obtiene recomendaciones basadas en usuarios similares
 */
export async function getRecommendationsFromSimilarUsers(
  userId: string
): Promise<QueryResponse<any[]>> {
  try {
    // Encontrar usuarios similares
    const { data: similarUsers, error: similarError } = await findSimilarUsers(userId);

    if (similarError || !similarUsers || similarUsers.length === 0) {
      return { 
        data: null, 
        error: similarError || new Error('No se encontraron usuarios similares') 
      };
    }

    // Obtener entrenamientos efectivos de usuarios similares
    const { data: similarWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .in('user_id', similarUsers)
      .order('created_at', { ascending: false })
      .limit(50);

    if (workoutsError) {
      return { data: null, error: workoutsError };
    }

    // Agrupar entrenamientos por tipo
    const workoutsByType: Record<string, any[]> = {};
    
    similarWorkouts?.forEach(workout => {
      if (!workoutsByType[workout.type]) {
        workoutsByType[workout.type] = [];
      }
      workoutsByType[workout.type].push(workout);
    });

    // Generar recomendaciones basadas en entrenamientos populares
    const recommendations = [];
    
    for (const [type, workouts] of Object.entries(workoutsByType)) {
      if (workouts.length >= 3) {
        // Encontrar el entrenamiento más común
        const workoutNames: Record<string, number> = {};
        
        workouts.forEach(workout => {
          workoutNames[workout.name] = (workoutNames[workout.name] || 0) + 1;
        });
        
        // Encontrar el nombre más común
        let mostCommonName = '';
        let highestFrequency = 0;
        
        for (const [name, frequency] of Object.entries(workoutNames)) {
          if (frequency > highestFrequency) {
            mostCommonName = name;
            highestFrequency = frequency;
          }
        }
        
        // Encontrar un ejemplo de este entrenamiento
        const exampleWorkout = workouts.find(w => w.name === mostCommonName);
        
        if (exampleWorkout) {
          recommendations.push({
            type: 'workout_recommendation',
            workout_type: type,
            workout_name: mostCommonName,
            popularity: highestFrequency,
            example: {
              sets: exampleWorkout.sets,
              reps: exampleWorkout.reps,
              weight: exampleWorkout.weight,
              duration: exampleWorkout.duration,
              distance: exampleWorkout.distance
            },
            source: 'similar_users',
            confidence: Math.min((highestFrequency / similarUsers.length) * 100, 90)
          });
        }
      }
    }

    return { data: recommendations, error: null };
  } catch (e) {
    console.error(`Error en getRecommendationsFromSimilarUsers para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getRecommendationsFromSimilarUsers')
    };
  }
}
