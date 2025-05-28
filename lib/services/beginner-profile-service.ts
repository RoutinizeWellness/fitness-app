/**
 * Servicio para gestionar perfiles de principiantes absolutos en fitness
 */

import { supabase } from '@/lib/supabase-client';
import {
  BeginnerProfile,
  BeginnerMotivation,
  AvailableTime,
  PhysicalLimitation,
  ExerciseLocation,
  BasicEquipment,
  InitialFeeling,
  OnboardingMission
} from '@/lib/types/beginner-onboarding';

/**
 * Obtiene el perfil de principiante de un usuario
 * @param userId - ID del usuario
 * @returns Perfil de principiante o null si no existe
 */
export async function getBeginnerProfile(userId: string): Promise<BeginnerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener perfil de principiante:', error);
      return null;
    }

    return data as BeginnerProfile;
  } catch (error) {
    console.error('Error en getBeginnerProfile:', error);
    return null;
  }
}

/**
 * Crea o actualiza el perfil de principiante de un usuario
 * @param profile - Perfil de principiante
 * @returns Perfil de principiante actualizado o null si hay error
 */
export async function updateBeginnerProfile(profile: Partial<BeginnerProfile> & { user_id: string }): Promise<BeginnerProfile | null> {
  try {
    console.log('🔄 Actualizando perfil de principiante:', {
      userId: profile.user_id,
      fields: Object.keys(profile).filter(key => key !== 'user_id')
    });

    // Asegurarse de que el campo updated_at esté actualizado
    const updatedProfile = {
      ...profile,
      updated_at: new Date().toISOString()
    };

    console.log('📝 Datos a actualizar:', updatedProfile);

    // Primero verificar si el perfil existe
    const { data: existingProfile, error: selectError } = await supabase
      .from('beginner_profiles')
      .select('user_id')
      .eq('user_id', profile.user_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error al verificar perfil existente:', selectError);
      throw new Error(`Error al verificar perfil existente: ${selectError.message}`);
    }

    let data, error;

    if (existingProfile) {
      // El perfil existe, hacer UPDATE
      console.log('📝 Perfil existe, haciendo UPDATE...');
      const updateResult = await supabase
        .from('beginner_profiles')
        .update(updatedProfile)
        .eq('user_id', profile.user_id)
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    } else {
      // El perfil no existe, hacer INSERT
      console.log('📝 Perfil no existe, haciendo INSERT...');
      const insertResult = await supabase
        .from('beginner_profiles')
        .insert(updatedProfile)
        .select()
        .single();

      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('❌ Error al actualizar perfil de principiante:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        profile: updatedProfile,
        operation: existingProfile ? 'UPDATE' : 'INSERT'
      });
      throw new Error(`Error al actualizar perfil: ${error.message} (Código: ${error.code})`);
    }

    console.log('✅ Perfil de principiante actualizado exitosamente:', data);
    return data as BeginnerProfile;
  } catch (error) {
    console.error('💥 Error en updateBeginnerProfile:', error);

    // Proporcionar información más detallada del error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error desconocido al actualizar perfil: ${JSON.stringify(error)}`);
    }
  }
}

/**
 * Marca una misión como completada
 * @param userId - ID del usuario
 * @param mission - Misión completada
 * @returns Perfil de principiante actualizado o null si hay error
 */
export async function completeMission(userId: string, mission: OnboardingMission): Promise<BeginnerProfile | null> {
  try {
    console.log('🎯 Completando misión:', { userId, mission });

    // Obtener el perfil actual
    const currentProfile = await getBeginnerProfile(userId);

    if (!currentProfile) {
      console.error('❌ No se encontró el perfil de principiante para el usuario:', userId);
      throw new Error(`No se encontró el perfil de principiante para el usuario: ${userId}`);
    }

    console.log('📋 Perfil actual:', {
      userId: currentProfile.user_id,
      missionsCompleted: currentProfile.missions_completed
    });

    // Verificar si la misión ya está completada
    if (currentProfile.missions_completed.includes(mission)) {
      console.log('⚠️ La misión ya está completada:', mission);
      return currentProfile;
    }

    // Actualizar la lista de misiones completadas
    const updatedMissions = [...currentProfile.missions_completed, mission];
    console.log('📝 Nuevas misiones completadas:', updatedMissions);

    // Actualizar el perfil
    const updatedProfile = await updateBeginnerProfile({
      user_id: userId,
      missions_completed: updatedMissions
    });

    if (!updatedProfile) {
      throw new Error('No se pudo actualizar el perfil con la nueva misión');
    }

    console.log('✅ Misión completada exitosamente:', mission);
    return updatedProfile;
  } catch (error) {
    console.error('💥 Error en completeMission:', error);

    // Proporcionar información más detallada del error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error desconocido al completar misión: ${JSON.stringify(error)}`);
    }
  }
}

/**
 * Marca el onboarding como completado
 * @param userId - ID del usuario
 * @returns Perfil de principiante actualizado o null si hay error
 */
export async function completeOnboarding(userId: string): Promise<BeginnerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_profiles')
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error al completar onboarding:', error);
      return null;
    }

    // También actualizar la tabla de perfiles generales
    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        experience_level: 'beginner',
        interface_mode: 'beginner',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    return data as BeginnerProfile;
  } catch (error) {
    console.error('Error en completeOnboarding:', error);
    return null;
  }
}

/**
 * Inicializa un perfil de principiante con valores por defecto
 * @param userId - ID del usuario
 * @returns Perfil de principiante inicializado o null si hay error
 */
export async function initializeBeginnerProfile(userId: string): Promise<BeginnerProfile | null> {
  try {
    console.log('🔄 Inicializando perfil de principiante para usuario:', userId);

    // Primero verificar si ya existe un perfil
    const { data: existingProfile, error: selectError } = await supabase
      .from('beginner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error al verificar perfil existente:', selectError);
      throw new Error(`Error al verificar perfil existente: ${selectError.message}`);
    }

    if (existingProfile) {
      console.log('✅ Perfil de principiante ya existe, retornando perfil existente');
      return existingProfile as BeginnerProfile;
    }

    console.log('📝 Creando nuevo perfil de principiante...');
    const defaultProfile: BeginnerProfile = {
      user_id: userId,
      motivation: 'energy',
      available_time: '20-30',
      physical_limitations: ['none'],
      exercise_location: ['home_no_equipment'],
      initial_feeling: 'excited_nervous',
      onboarding_completed: false,
      missions_completed: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('beginner_profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar perfil de principiante:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error al crear perfil: ${error.message} (Código: ${error.code})`);
    }

    console.log('✅ Perfil de principiante creado exitosamente:', data);
    return data as BeginnerProfile;
  } catch (error) {
    console.error('💥 Error en initializeBeginnerProfile:', error);

    // Proporcionar información más detallada del error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error desconocido al inicializar perfil: ${JSON.stringify(error)}`);
    }
  }
}

/**
 * Verifica si el usuario ya ha completado el onboarding
 * @param userId - ID del usuario
 * @returns true si el onboarding está completado, false en caso contrario
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('beginner_profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.onboarding_completed;
  } catch (error) {
    console.error('Error en isOnboardingCompleted:', error);
    return false;
  }
}
