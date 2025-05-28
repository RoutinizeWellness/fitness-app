import { supabase } from '@/lib/supabase-client';
import { 
  VolumeLandmark, 
  VolumeLandmarkWithStatus, 
  MuscleGroupType, 
  DEFAULT_VOLUME_LANDMARKS,
  MuscleGroupVolumeSummary,
  MUSCLE_GROUP_DISPLAY_NAMES
} from '@/lib/types/volume-landmarks';
import { WorkoutLog } from '@/lib/types/training';
import { getWorkoutLogs } from '@/lib/supabase-training';
import { addWeeks, subWeeks, isWithinInterval } from 'date-fns';

/**
 * Get volume landmarks for a user
 * @param userId - User ID
 * @returns Array of volume landmarks
 */
export async function getVolumeLandmarks(userId: string): Promise<VolumeLandmark[]> {
  try {
    const { data, error } = await supabase
      .from('volume_landmarks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching volume landmarks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVolumeLandmarks:', error);
    return [];
  }
}

/**
 * Get volume landmark for a specific muscle group
 * @param userId - User ID
 * @param muscleGroup - Muscle group
 * @returns Volume landmark or null
 */
export async function getVolumeLandmarkForMuscleGroup(
  userId: string,
  muscleGroup: MuscleGroupType
): Promise<VolumeLandmark | null> {
  try {
    const { data, error } = await supabase
      .from('volume_landmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('muscle_group', muscleGroup)
      .single();

    if (error) {
      console.error(`Error fetching volume landmark for ${muscleGroup}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getVolumeLandmarkForMuscleGroup:', error);
    return null;
  }
}

/**
 * Update or create volume landmark
 * @param userId - User ID
 * @param landmark - Volume landmark data
 * @returns Updated volume landmark
 */
export async function updateVolumeLandmark(
  userId: string,
  landmark: VolumeLandmark
): Promise<VolumeLandmark | null> {
  try {
    // Check if landmark exists
    const existingLandmark = await getVolumeLandmarkForMuscleGroup(userId, landmark.muscle_group);

    if (existingLandmark) {
      // Update existing landmark
      const { data, error } = await supabase
        .from('volume_landmarks')
        .update({
          mev: landmark.mev,
          mav: landmark.mav,
          mrv: landmark.mrv,
          current_volume: landmark.current_volume,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLandmark.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating volume landmark:', error);
        return null;
      }

      return data;
    } else {
      // Create new landmark
      const { data, error } = await supabase
        .from('volume_landmarks')
        .insert({
          user_id: userId,
          muscle_group: landmark.muscle_group,
          mev: landmark.mev,
          mav: landmark.mav,
          mrv: landmark.mrv,
          current_volume: landmark.current_volume || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating volume landmark:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in updateVolumeLandmark:', error);
    return null;
  }
}

/**
 * Initialize volume landmarks for a user based on their training level
 * @param userId - User ID
 * @param trainingLevel - Training level (beginner, intermediate, advanced)
 * @returns Boolean indicating success
 */
export async function initializeVolumeLandmarks(
  userId: string,
  trainingLevel: 'beginner' | 'intermediate' | 'advanced'
): Promise<boolean> {
  try {
    const defaultLandmarks = DEFAULT_VOLUME_LANDMARKS[trainingLevel];
    const landmarks = Object.values(defaultLandmarks).map(landmark => ({
      user_id: userId,
      ...landmark
    }));

    const { error } = await supabase
      .from('volume_landmarks')
      .upsert(landmarks, { onConflict: 'user_id, muscle_group' });

    if (error) {
      console.error('Error initializing volume landmarks:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in initializeVolumeLandmarks:', error);
    return false;
  }
}

/**
 * Calculate current volume for a muscle group from workout logs
 * @param userId - User ID
 * @param muscleGroup - Muscle group
 * @param timeframe - Timeframe in weeks (default: 1)
 * @returns Current volume in sets per week
 */
export async function calculateCurrentVolume(
  userId: string,
  muscleGroup: MuscleGroupType,
  timeframe: number = 1
): Promise<number> {
  try {
    // Get workout logs for the specified timeframe
    const endDate = new Date();
    const startDate = subWeeks(endDate, timeframe);
    
    const logs = await getWorkoutLogs(userId);
    
    if (!logs || logs.length === 0) {
      return 0;
    }

    // Filter logs by date
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: startDate, end: endDate });
    });

    // Calculate total sets for the muscle group
    let totalSets = 0;

    filteredLogs.forEach(log => {
      log.exercises.forEach(exercise => {
        // Check if exercise targets the specified muscle group
        const targetsMuscleGroup = exercise.muscleGroups?.includes(muscleGroup as string) || 
                                  exercise.secondaryMuscleGroups?.includes(muscleGroup as string);
        
        if (targetsMuscleGroup) {
          // Count completed sets
          totalSets += exercise.sets.length;
        }
      });
    });

    // Calculate average sets per week
    const volumePerWeek = Math.round(totalSets / timeframe);
    
    // Update the current volume in the database
    await updateVolumeLandmark(userId, {
      muscle_group: muscleGroup,
      mev: 0, // These will be updated with actual values from the database
      mav: 0,
      mrv: 0,
      current_volume: volumePerWeek
    });

    return volumePerWeek;
  } catch (error) {
    console.error('Error in calculateCurrentVolume:', error);
    return 0;
  }
}

/**
 * Get volume status and recommendations for a muscle group
 * @param userId - User ID
 * @param muscleGroup - Muscle group
 * @returns Volume landmark with status and recommendations
 */
export async function getVolumeStatusAndRecommendations(
  userId: string,
  muscleGroup: MuscleGroupType
): Promise<VolumeLandmarkWithStatus | null> {
  try {
    // Get volume landmark
    const landmark = await getVolumeLandmarkForMuscleGroup(userId, muscleGroup);
    
    if (!landmark) {
      return null;
    }

    // Calculate current volume if not available
    if (landmark.current_volume === undefined || landmark.current_volume === null) {
      landmark.current_volume = await calculateCurrentVolume(userId, muscleGroup);
    }

    // Determine status
    let status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv';
    let recommendation: string;

    if (landmark.current_volume < landmark.mev) {
      status = 'below_mev';
      recommendation = `Aumenta el volumen de entrenamiento para ${MUSCLE_GROUP_DISPLAY_NAMES[muscleGroup]} a al menos ${landmark.mev} series por semana para alcanzar el volumen mínimo efectivo (MEV).`;
    } else if (landmark.current_volume >= landmark.mev && landmark.current_volume <= landmark.mav) {
      status = 'optimal';
      recommendation = `Tu volumen actual para ${MUSCLE_GROUP_DISPLAY_NAMES[muscleGroup]} está en el rango óptimo. Mantén entre ${landmark.mev}-${landmark.mav} series por semana para maximizar el crecimiento.`;
    } else if (landmark.current_volume > landmark.mav && landmark.current_volume <= landmark.mrv) {
      status = 'approaching_mrv';
      recommendation = `Tu volumen para ${MUSCLE_GROUP_DISPLAY_NAMES[muscleGroup]} está acercándose al máximo recuperable. Considera reducir a ${landmark.mav} series por semana para optimizar la recuperación.`;
    } else {
      status = 'exceeding_mrv';
      recommendation = `Estás excediendo el volumen máximo recuperable para ${MUSCLE_GROUP_DISPLAY_NAMES[muscleGroup]}. Reduce a ${landmark.mav} series por semana para evitar sobreentrenamiento.`;
    }

    return {
      ...landmark,
      status,
      recommendation
    };
  } catch (error) {
    console.error('Error in getVolumeStatusAndRecommendations:', error);
    return null;
  }
}

/**
 * Get volume summary for all muscle groups
 * @param userId - User ID
 * @returns Array of muscle group volume summaries
 */
export async function getAllMuscleGroupVolumeSummaries(
  userId: string
): Promise<MuscleGroupVolumeSummary[]> {
  try {
    // Get all volume landmarks
    const landmarks = await getVolumeLandmarks(userId);
    
    if (!landmarks || landmarks.length === 0) {
      return [];
    }

    // Create summaries
    const summaries: MuscleGroupVolumeSummary[] = [];

    for (const landmark of landmarks) {
      // Calculate current volume if not available
      if (landmark.current_volume === undefined || landmark.current_volume === null) {
        landmark.current_volume = await calculateCurrentVolume(userId, landmark.muscle_group);
      }

      // Determine status
      let status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv';

      if (landmark.current_volume < landmark.mev) {
        status = 'below_mev';
      } else if (landmark.current_volume >= landmark.mev && landmark.current_volume <= landmark.mav) {
        status = 'optimal';
      } else if (landmark.current_volume > landmark.mav && landmark.current_volume <= landmark.mrv) {
        status = 'approaching_mrv';
      } else {
        status = 'exceeding_mrv';
      }

      summaries.push({
        muscle_group: landmark.muscle_group,
        display_name: MUSCLE_GROUP_DISPLAY_NAMES[landmark.muscle_group],
        current_volume: landmark.current_volume,
        target_volume: landmark.mav,
        mev: landmark.mev,
        mav: landmark.mav,
        mrv: landmark.mrv,
        status
      });
    }

    return summaries;
  } catch (error) {
    console.error('Error in getAllMuscleGroupVolumeSummaries:', error);
    return [];
  }
}
