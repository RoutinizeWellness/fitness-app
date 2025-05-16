import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { createTrainerProfile, createNutritionistProfile } from './professional-service';
import { TrainerProfile, NutritionistProfile } from './types/professionals';

/**
 * Verifica si un usuario es administrador
 * @param userId ID del usuario a verificar
 * @returns Objeto con el resultado de la verificación
 */
export const isUserAdmin = async (userId: string): Promise<{ isAdmin: boolean; error: PostgrestError | Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { isAdmin: data?.is_admin === true, error: null };
  } catch (e) {
    console.error('Error en isUserAdmin:', e);
    return {
      isAdmin: false,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en isUserAdmin')
    };
  }
};

/**
 * Verifica si el administrador ya tiene perfiles profesionales y los crea si no existen
 * @param userId ID del usuario administrador
 * @returns Objeto con el resultado de la operación
 */
export const setupAdminProfessionalProfiles = async (userId: string): Promise<{
  success: boolean;
  trainerProfile?: TrainerProfile;
  nutritionistProfile?: NutritionistProfile;
  error?: string;
}> => {
  try {
    // Verificar si el usuario es administrador
    const { isAdmin, error: adminCheckError } = await isUserAdmin(userId);
    
    if (adminCheckError) {
      return { 
        success: false, 
        error: `Error al verificar si el usuario es administrador: ${adminCheckError.message}` 
      };
    }
    
    if (!isAdmin) {
      return { 
        success: false, 
        error: 'El usuario no es administrador' 
      };
    }

    // Verificar si ya tiene perfil de entrenador
    const { data: existingTrainerProfile, error: trainerCheckError } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Verificar si ya tiene perfil de nutricionista
    const { data: existingNutritionistProfile, error: nutritionistCheckError } = await supabase
      .from('nutritionist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let trainerProfile: TrainerProfile | undefined;
    let nutritionistProfile: NutritionistProfile | undefined;

    // Si no tiene perfil de entrenador, crearlo
    if (!existingTrainerProfile) {
      const { data: newTrainerProfile, error: createTrainerError } = await createTrainerProfile({
        userId,
        specialties: ['strength_training', 'hypertrophy', 'weight_loss', 'functional_training', 'rehabilitation'],
        experienceYears: 10,
        certifications: ['Certified Personal Trainer (CPT)', 'Strength and Conditioning Specialist (CSCS)'],
        bio: 'Entrenador personal con amplia experiencia en diferentes áreas del fitness. Especializado en entrenamiento de fuerza, hipertrofia y pérdida de peso.',
        hourlyRate: 50,
        maxClients: 50,
        isVerified: true,
        specializations: {
          strengthTraining: true,
          hypertrophy: true,
          weightLoss: true,
          endurance: true,
          flexibility: true,
          rehabilitation: true,
          sports: ['Fútbol', 'Baloncesto', 'Tenis'],
          other: ['Entrenamiento funcional', 'HIIT', 'Crossfit']
        }
      });

      if (createTrainerError) {
        console.error('Error al crear perfil de entrenador para admin:', createTrainerError);
      } else {
        trainerProfile = newTrainerProfile;
      }
    } else {
      // Convertir a formato camelCase
      trainerProfile = {
        id: existingTrainerProfile.id,
        userId: existingTrainerProfile.user_id,
        specialties: existingTrainerProfile.specialties,
        experienceYears: existingTrainerProfile.experience_years,
        certifications: existingTrainerProfile.certifications,
        bio: existingTrainerProfile.bio,
        hourlyRate: existingTrainerProfile.hourly_rate,
        availability: existingTrainerProfile.availability,
        maxClients: existingTrainerProfile.max_clients,
        isVerified: existingTrainerProfile.is_verified,
        createdAt: existingTrainerProfile.created_at,
        updatedAt: existingTrainerProfile.updated_at,
        specializations: existingTrainerProfile.specializations
      };
    }

    // Si no tiene perfil de nutricionista, crearlo
    if (!existingNutritionistProfile) {
      const { data: newNutritionistProfile, error: createNutritionistError } = await createNutritionistProfile({
        userId,
        specialties: ['weight_management', 'sports_nutrition', 'clinical_nutrition', 'vegan_vegetarian', 'diabetes_management'],
        experienceYears: 8,
        certifications: ['Registered Dietitian (RD)', 'Certified Nutrition Specialist (CNS)'],
        bio: 'Nutricionista especializado en nutrición deportiva y pérdida de peso. Enfoque personalizado para cada cliente según sus necesidades y objetivos.',
        hourlyRate: 45,
        maxClients: 50,
        isVerified: true,
        specializations: {
          weightManagement: true,
          sportsNutrition: true,
          clinicalNutrition: true,
          veganVegetarian: true,
          eatingDisorders: true,
          diabetesManagement: true,
          foodAllergies: true,
          other: ['Nutrición para deportistas', 'Dietas cetogénicas', 'Ayuno intermitente']
        }
      });

      if (createNutritionistError) {
        console.error('Error al crear perfil de nutricionista para admin:', createNutritionistError);
      } else {
        nutritionistProfile = newNutritionistProfile;
      }
    } else {
      // Convertir a formato camelCase
      nutritionistProfile = {
        id: existingNutritionistProfile.id,
        userId: existingNutritionistProfile.user_id,
        specialties: existingNutritionistProfile.specialties,
        experienceYears: existingNutritionistProfile.experience_years,
        certifications: existingNutritionistProfile.certifications,
        bio: existingNutritionistProfile.bio,
        hourlyRate: existingNutritionistProfile.hourly_rate,
        availability: existingNutritionistProfile.availability,
        maxClients: existingNutritionistProfile.max_clients,
        isVerified: existingNutritionistProfile.is_verified,
        createdAt: existingNutritionistProfile.created_at,
        updatedAt: existingNutritionistProfile.updated_at,
        specializations: existingNutritionistProfile.specializations
      };
    }

    return {
      success: true,
      trainerProfile,
      nutritionistProfile
    };
  } catch (e) {
    console.error('Error en setupAdminProfessionalProfiles:', e);
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Error desconocido en setupAdminProfessionalProfiles'
    };
  }
};
