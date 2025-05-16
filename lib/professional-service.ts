import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import {
  TrainerProfile,
  NutritionistProfile,
  ClientRelationship,
  TrainingAssignment,
  NutritionAssignment,
  ClientMessage,
  ClientAssessment,
  ProfessionalPayment,
  ClientWithProfessional,
  ProfessionalWithClients,
  ProfessionalActivitySummary
} from './types/professionals';

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Funciones para perfiles de entrenadores
export const getTrainerProfile = async (userId: string): Promise<QueryResponse<TrainerProfile>> => {
  try {
    const { data, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = data ? {
      id: data.id,
      userId: data.user_id,
      specialties: data.specialties,
      experienceYears: data.experience_years,
      certifications: data.certifications,
      bio: data.bio,
      hourlyRate: data.hourly_rate,
      availability: data.availability,
      maxClients: data.max_clients,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      specializations: data.specializations
    } : null;

    return { data: formattedData as TrainerProfile, error: null };
  } catch (e) {
    console.error('Error en getTrainerProfile:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getTrainerProfile')
    };
  }
};

export const createTrainerProfile = async (profile: Omit<TrainerProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<QueryResponse<TrainerProfile>> => {
  try {
    // Convertir a formato snake_case para la base de datos
    const dbProfile = {
      user_id: profile.userId,
      specialties: profile.specialties || [],
      experience_years: profile.experienceYears || 0,
      certifications: profile.certifications || [],
      bio: profile.bio || '',
      hourly_rate: profile.hourlyRate || 0,
      availability: profile.availability || {},
      max_clients: profile.maxClients || 10,
      is_verified: profile.isVerified || false,
      specializations: profile.specializations || {}
    };

    const { data, error } = await supabase
      .from('trainer_profiles')
      .insert([dbProfile])
      .select()
      .single();

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = {
      id: data.id,
      userId: data.user_id,
      specialties: data.specialties,
      experienceYears: data.experience_years,
      certifications: data.certifications,
      bio: data.bio,
      hourlyRate: data.hourly_rate,
      availability: data.availability,
      maxClients: data.max_clients,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      specializations: data.specializations
    };

    return { data: formattedData as TrainerProfile, error: null };
  } catch (e) {
    console.error('Error en createTrainerProfile:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en createTrainerProfile')
    };
  }
};

export const updateTrainerProfile = async (userId: string, updates: Partial<TrainerProfile>): Promise<QueryResponse<TrainerProfile>> => {
  try {
    // Convertir a formato snake_case para la base de datos
    const dbUpdates: any = {};
    if (updates.specialties) dbUpdates.specialties = updates.specialties;
    if (updates.experienceYears !== undefined) dbUpdates.experience_years = updates.experienceYears;
    if (updates.certifications) dbUpdates.certifications = updates.certifications;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.hourlyRate !== undefined) dbUpdates.hourly_rate = updates.hourlyRate;
    if (updates.availability) dbUpdates.availability = updates.availability;
    if (updates.maxClients !== undefined) dbUpdates.max_clients = updates.maxClients;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
    if (updates.specializations) dbUpdates.specializations = updates.specializations;

    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('trainer_profiles')
      .update(dbUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = {
      id: data.id,
      userId: data.user_id,
      specialties: data.specialties,
      experienceYears: data.experience_years,
      certifications: data.certifications,
      bio: data.bio,
      hourlyRate: data.hourly_rate,
      availability: data.availability,
      maxClients: data.max_clients,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      specializations: data.specializations
    };

    return { data: formattedData as TrainerProfile, error: null };
  } catch (e) {
    console.error('Error en updateTrainerProfile:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en updateTrainerProfile')
    };
  }
};

// Funciones para perfiles de nutricionistas (similar a entrenadores)
export const getNutritionistProfile = async (userId: string): Promise<QueryResponse<NutritionistProfile>> => {
  try {
    const { data, error } = await supabase
      .from('nutritionist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = data ? {
      id: data.id,
      userId: data.user_id,
      specialties: data.specialties,
      experienceYears: data.experience_years,
      certifications: data.certifications,
      bio: data.bio,
      hourlyRate: data.hourly_rate,
      availability: data.availability,
      maxClients: data.max_clients,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      specializations: data.specializations
    } : null;

    return { data: formattedData as NutritionistProfile, error: null };
  } catch (e) {
    console.error('Error en getNutritionistProfile:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getNutritionistProfile')
    };
  }
};

export const createNutritionistProfile = async (profile: Omit<NutritionistProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<QueryResponse<NutritionistProfile>> => {
  try {
    // Convertir a formato snake_case para la base de datos
    const dbProfile = {
      user_id: profile.userId,
      specialties: profile.specialties || [],
      experience_years: profile.experienceYears || 0,
      certifications: profile.certifications || [],
      bio: profile.bio || '',
      hourly_rate: profile.hourlyRate || 0,
      availability: profile.availability || {},
      max_clients: profile.maxClients || 10,
      is_verified: profile.isVerified || false,
      specializations: profile.specializations || {}
    };

    const { data, error } = await supabase
      .from('nutritionist_profiles')
      .insert([dbProfile])
      .select()
      .single();

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = {
      id: data.id,
      userId: data.user_id,
      specialties: data.specialties,
      experienceYears: data.experience_years,
      certifications: data.certifications,
      bio: data.bio,
      hourlyRate: data.hourly_rate,
      availability: data.availability,
      maxClients: data.max_clients,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      specializations: data.specializations
    };

    return { data: formattedData as NutritionistProfile, error: null };
  } catch (e) {
    console.error('Error en createNutritionistProfile:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en createNutritionistProfile')
    };
  }
};

// Funciones para relaciones cliente-profesional
export const getClientRelationships = async (userId: string, type: 'professional' | 'client'): Promise<QueryResponse<ClientRelationship[]>> => {
  try {
    const field = type === 'professional' ? 'professional_id' : 'client_id';

    const { data, error } = await supabase
      .from('client_relationships')
      .select('*')
      .eq(field, userId);

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = data ? data.map(item => ({
      id: item.id,
      professionalId: item.professional_id,
      clientId: item.client_id,
      professionalType: item.professional_type,
      status: item.status,
      startDate: item.start_date,
      endDate: item.end_date,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) : [];

    return { data: formattedData as ClientRelationship[], error: null };
  } catch (e) {
    console.error('Error en getClientRelationships:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getClientRelationships')
    };
  }
};

// Funciones para asignaciones de entrenamiento
export const createTrainingAssignment = async (assignment: Omit<TrainingAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<QueryResponse<TrainingAssignment>> => {
  try {
    // Convertir a formato snake_case para la base de datos
    const dbAssignment = {
      trainer_id: assignment.trainerId,
      client_id: assignment.clientId,
      routine_id: assignment.routineId,
      title: assignment.title,
      description: assignment.description,
      start_date: assignment.startDate,
      end_date: assignment.endDate,
      status: assignment.status,
      feedback: assignment.feedback,
      client_notes: assignment.clientNotes
    };

    const { data, error } = await supabase
      .from('training_assignments')
      .insert([dbAssignment])
      .select()
      .single();

    if (error) throw error;

    // Convertir a formato camelCase
    const formattedData = {
      id: data.id,
      trainerId: data.trainer_id,
      clientId: data.client_id,
      routineId: data.routine_id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      feedback: data.feedback,
      clientNotes: data.client_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: formattedData as TrainingAssignment, error: null };
  } catch (e) {
    console.error('Error en createTrainingAssignment:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en createTrainingAssignment')
    };
  }
};
