import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { 
  TrainerProfile, 
  NutritionistProfile, 
  ClientRelationship,
  ClientWithProfessional,
  ProfessionalWithClients
} from './types/professionals';

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Tipo para estadísticas globales
export interface GlobalStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalTrainers: number;
  verifiedTrainers: number;
  totalNutritionists: number;
  verifiedNutritionists: number;
  totalWorkouts: number;
  workoutsThisMonth: number;
  totalMealPlans: number;
  mealPlansThisMonth: number;
  totalClientRelationships: number;
  activeClientRelationships: number;
}

// Tipo para usuario con detalles
export interface UserWithDetails {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isTrainer: boolean;
  isNutritionist: boolean;
  createdAt: string;
  lastSignIn?: string;
  isVerified: boolean;
  trainerProfile?: TrainerProfile;
  nutritionistProfile?: NutritionistProfile;
}

// Tipo para mensaje masivo
export interface MassMessage {
  id: string;
  senderId: string;
  title: string;
  content: string;
  targetGroup: 'all' | 'trainers' | 'nutritionists' | 'clients';
  sentAt: string;
  readCount: number;
  totalRecipients: number;
}

/**
 * Obtiene estadísticas globales de la plataforma
 */
export const getGlobalStats = async (): Promise<QueryResponse<GlobalStats>> => {
  try {
    // Obtener fecha de inicio del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Obtener total de usuarios
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Obtener usuarios activos (que han iniciado sesión en los últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

    // Obtener nuevos usuarios este mes
    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    // Obtener total de entrenadores
    const { count: totalTrainers, error: trainersError } = await supabase
      .from('trainer_profiles')
      .select('*', { count: 'exact', head: true });

    // Obtener entrenadores verificados
    const { count: verifiedTrainers, error: verifiedTrainersError } = await supabase
      .from('trainer_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    // Obtener total de nutricionistas
    const { count: totalNutritionists, error: nutritionistsError } = await supabase
      .from('nutritionist_profiles')
      .select('*', { count: 'exact', head: true });

    // Obtener nutricionistas verificados
    const { count: verifiedNutritionists, error: verifiedNutritionistsError } = await supabase
      .from('nutritionist_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    // Obtener total de entrenamientos
    const { count: totalWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true });

    // Obtener entrenamientos de este mes
    const { count: workoutsThisMonth, error: workoutsThisMonthError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    // Obtener total de planes de comida
    const { count: totalMealPlans, error: mealPlansError } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true });

    // Obtener planes de comida de este mes
    const { count: mealPlansThisMonth, error: mealPlansThisMonthError } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    // Obtener total de relaciones cliente-profesional
    const { count: totalClientRelationships, error: relationshipsError } = await supabase
      .from('client_relationships')
      .select('*', { count: 'exact', head: true });

    // Obtener relaciones cliente-profesional activas
    const { count: activeClientRelationships, error: activeRelationshipsError } = await supabase
      .from('client_relationships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Compilar estadísticas
    const stats: GlobalStats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      totalTrainers: totalTrainers || 0,
      verifiedTrainers: verifiedTrainers || 0,
      totalNutritionists: totalNutritionists || 0,
      verifiedNutritionists: verifiedNutritionists || 0,
      totalWorkouts: totalWorkouts || 0,
      workoutsThisMonth: workoutsThisMonth || 0,
      totalMealPlans: totalMealPlans || 0,
      mealPlansThisMonth: mealPlansThisMonth || 0,
      totalClientRelationships: totalClientRelationships || 0,
      activeClientRelationships: activeClientRelationships || 0
    };

    return { data: stats, error: null };
  } catch (e) {
    console.error('Error en getGlobalStats:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getGlobalStats')
    };
  }
};

/**
 * Obtiene todos los usuarios con detalles
 */
export const getAllUsers = async (options?: {
  search?: string;
  role?: 'admin' | 'trainer' | 'nutritionist' | 'client';
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<QueryResponse<{ users: UserWithDetails[]; total: number }>> => {
  try {
    // Construir consulta base
    let query = supabase
      .from('profiles')
      .select(`
        *,
        auth_users:auth.users(email, created_at, last_sign_in_at),
        trainer_profiles:trainer_profiles(*),
        nutritionist_profiles:nutritionist_profiles(*)
      `);

    // Aplicar filtros
    if (options?.search) {
      query = query.or(`full_name.ilike.%${options.search}%,auth_users.email.ilike.%${options.search}%`);
    }

    if (options?.role === 'admin') {
      query = query.eq('is_admin', true);
    } else if (options?.role === 'trainer') {
      query = query.not('trainer_profiles', 'is', null);
    } else if (options?.role === 'nutritionist') {
      query = query.not('nutritionist_profiles', 'is', null);
    } else if (options?.role === 'client') {
      query = query.is('is_admin', false)
        .is('trainer_profiles', null)
        .is('nutritionist_profiles', null);
    }

    // Obtener recuento total
    const { count, error: countError } = await query.select('id', { count: 'exact', head: true });

    if (countError) throw countError;

    // Aplicar paginación
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    // Ejecutar consulta
    const { data, error } = await query;

    if (error) throw error;

    // Transformar datos
    const users: UserWithDetails[] = data.map(item => ({
      id: item.user_id,
      email: item.auth_users?.email || '',
      fullName: item.full_name || '',
      avatarUrl: item.avatar_url,
      isAdmin: item.is_admin || false,
      isTrainer: !!item.trainer_profiles,
      isNutritionist: !!item.nutritionist_profiles,
      createdAt: item.auth_users?.created_at || item.created_at,
      lastSignIn: item.auth_users?.last_sign_in_at,
      isVerified: (item.trainer_profiles?.is_verified || item.nutritionist_profiles?.is_verified) || false,
      trainerProfile: item.trainer_profiles ? {
        id: item.trainer_profiles.id,
        userId: item.trainer_profiles.user_id,
        specialties: item.trainer_profiles.specialties,
        experienceYears: item.trainer_profiles.experience_years,
        certifications: item.trainer_profiles.certifications,
        bio: item.trainer_profiles.bio,
        hourlyRate: item.trainer_profiles.hourly_rate,
        availability: item.trainer_profiles.availability,
        maxClients: item.trainer_profiles.max_clients,
        isVerified: item.trainer_profiles.is_verified,
        createdAt: item.trainer_profiles.created_at,
        updatedAt: item.trainer_profiles.updated_at,
        specializations: item.trainer_profiles.specializations
      } : undefined,
      nutritionistProfile: item.nutritionist_profiles ? {
        id: item.nutritionist_profiles.id,
        userId: item.nutritionist_profiles.user_id,
        specialties: item.nutritionist_profiles.specialties,
        experienceYears: item.nutritionist_profiles.experience_years,
        certifications: item.nutritionist_profiles.certifications,
        bio: item.nutritionist_profiles.bio,
        hourlyRate: item.nutritionist_profiles.hourly_rate,
        availability: item.nutritionist_profiles.availability,
        maxClients: item.nutritionist_profiles.max_clients,
        isVerified: item.nutritionist_profiles.is_verified,
        createdAt: item.nutritionist_profiles.created_at,
        updatedAt: item.nutritionist_profiles.updated_at,
        specializations: item.nutritionist_profiles.specializations
      } : undefined
    }));

    return { 
      data: { 
        users, 
        total: count || users.length 
      }, 
      error: null 
    };
  } catch (e) {
    console.error('Error en getAllUsers:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getAllUsers')
    };
  }
};

/**
 * Verifica o rechaza un perfil profesional
 */
export const updateProfessionalVerification = async (
  userId: string,
  professionalType: 'trainer' | 'nutritionist',
  isVerified: boolean
): Promise<QueryResponse<boolean>> => {
  try {
    const table = professionalType === 'trainer' ? 'trainer_profiles' : 'nutritionist_profiles';
    
    const { data, error } = await supabase
      .from(table)
      .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (e) {
    console.error(`Error en updateProfessionalVerification:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en updateProfessionalVerification`)
    };
  }
};

/**
 * Envía un mensaje masivo a un grupo de usuarios
 */
export const sendMassMessage = async (
  senderId: string,
  title: string,
  content: string,
  targetGroup: 'all' | 'trainers' | 'nutritionists' | 'clients'
): Promise<QueryResponse<MassMessage>> => {
  try {
    // Crear el mensaje masivo
    const { data: massMessageData, error: massMessageError } = await supabase
      .from('mass_messages')
      .insert([{
        sender_id: senderId,
        title,
        content,
        target_group: targetGroup,
        sent_at: new Date().toISOString(),
        read_count: 0
      }])
      .select()
      .single();

    if (massMessageError) throw massMessageError;

    // Obtener los destinatarios según el grupo objetivo
    let recipientQuery = supabase.from('profiles').select('user_id');

    if (targetGroup === 'trainers') {
      recipientQuery = supabase.from('trainer_profiles').select('user_id');
    } else if (targetGroup === 'nutritionists') {
      recipientQuery = supabase.from('nutritionist_profiles').select('user_id');
    } else if (targetGroup === 'clients') {
      // Clientes son usuarios que no son admin, ni entrenadores, ni nutricionistas
      recipientQuery = supabase
        .from('profiles')
        .select('user_id')
        .eq('is_admin', false)
        .not('user_id', 'in', (subquery) => {
          return subquery.from('trainer_profiles').select('user_id');
        })
        .not('user_id', 'in', (subquery) => {
          return subquery.from('nutritionist_profiles').select('user_id');
        });
    }

    const { data: recipients, error: recipientsError } = await recipientQuery;

    if (recipientsError) throw recipientsError;

    // Crear notificaciones para cada destinatario
    const notifications = recipients.map(recipient => ({
      user_id: recipient.user_id,
      type: 'admin_message',
      title,
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      data: { message_id: massMessageData.id },
      is_read: false,
      created_at: new Date().toISOString()
    }));

    // Insertar notificaciones en lotes de 100 para evitar límites de tamaño
    const batchSize = 100;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(batch);

      if (notificationError) {
        console.error('Error al insertar notificaciones:', notificationError);
      }
    }

    // Actualizar el recuento total de destinatarios
    const { error: updateError } = await supabase
      .from('mass_messages')
      .update({ total_recipients: recipients.length })
      .eq('id', massMessageData.id);

    if (updateError) {
      console.error('Error al actualizar el recuento de destinatarios:', updateError);
    }

    // Formatear respuesta
    const massMessage: MassMessage = {
      id: massMessageData.id,
      senderId: massMessageData.sender_id,
      title: massMessageData.title,
      content: massMessageData.content,
      targetGroup: massMessageData.target_group,
      sentAt: massMessageData.sent_at,
      readCount: 0,
      totalRecipients: recipients.length
    };

    return { data: massMessage, error: null };
  } catch (e) {
    console.error('Error en sendMassMessage:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en sendMassMessage')
    };
  }
};
