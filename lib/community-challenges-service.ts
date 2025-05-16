/**
 * Community Challenges Service
 * Implements community challenges based on Spanish fitness resources
 * for social engagement and motivation.
 */

import { supabase } from '@/lib/supabase-client';
import {
  CommunityChallenge,
  ChallengeParticipant,
  ChallengeType
} from '@/lib/types/periodization';

// Challenge templates
export interface ChallengeTemplate {
  title: string;
  description: string;
  challengeType: ChallengeType;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  goalMetric: string;
  goalValue: number;
  duration: number; // In days
  rules: string;
  rewards: string;
  maxParticipants?: number;
}

// Challenge templates catalog
export const CHALLENGE_TEMPLATES: Record<string, ChallengeTemplate> = {
  // Strength challenges
  'bench_press_challenge': {
    title: 'Desafío de Press de Banca',
    description: 'Aumenta tu press de banca en 4 semanas siguiendo el programa especializado.',
    challengeType: 'strength',
    difficulty: 'intermediate',
    goalMetric: 'Aumento en kg en press de banca',
    goalValue: 5,
    duration: 28,
    rules: 'Realizar el programa de entrenamiento 3 veces por semana. Registrar los pesos utilizados en cada sesión. Realizar un test de 1RM al inicio y al final.',
    rewards: 'Insignia de "Pecho de Acero" en tu perfil. Acceso a programa avanzado de press de banca.',
    maxParticipants: 50
  },
  'squat_challenge': {
    title: 'Desafío de Sentadilla',
    description: 'Mejora tu técnica y fuerza en sentadilla con este programa de 6 semanas.',
    challengeType: 'strength',
    difficulty: 'all_levels',
    goalMetric: 'Aumento en kg en sentadilla',
    goalValue: 10,
    duration: 42,
    rules: 'Realizar el programa de entrenamiento 2-3 veces por semana. Grabar un video de la técnica al inicio y al final para comparar. Realizar un test de 1RM o 5RM al inicio y al final.',
    rewards: 'Insignia de "Rey/Reina de la Sentadilla" en tu perfil. Acceso a programa especializado de piernas.',
    maxParticipants: 50
  },

  // Endurance challenges
  'running_challenge': {
    title: 'Desafío de Carrera 5K',
    description: 'Prepárate para correr 5K en 8 semanas, incluso si nunca has corrido antes.',
    challengeType: 'endurance',
    difficulty: 'beginner',
    goalMetric: 'Tiempo en minutos para 5K',
    goalValue: 30,
    duration: 56,
    rules: 'Seguir el plan de entrenamiento 3-4 veces por semana. Registrar tiempo y distancia de cada sesión. Realizar un test de 5K al final.',
    rewards: 'Insignia de "Corredor 5K" en tu perfil. Plan de entrenamiento para 10K.',
    maxParticipants: 100
  },
  'hiit_challenge': {
    title: 'Desafío HIIT de 30 Días',
    description: 'Mejora tu condición cardiovascular y quema grasa con entrenamientos HIIT diarios.',
    challengeType: 'endurance',
    difficulty: 'intermediate',
    goalMetric: 'Sesiones completadas',
    goalValue: 30,
    duration: 30,
    rules: 'Realizar un entrenamiento HIIT cada día durante 30 días. Los entrenamientos varían entre 10-30 minutos. Registrar frecuencia cardíaca y percepción de esfuerzo.',
    rewards: 'Insignia de "Maestro HIIT" en tu perfil. Acceso a entrenamientos HIIT avanzados.',
    maxParticipants: 200
  },

  // Consistency challenges
  'morning_workout_challenge': {
    title: 'Desafío de Entrenamiento Matutino',
    description: 'Establece el hábito de entrenar por la mañana durante 21 días consecutivos.',
    challengeType: 'consistency',
    difficulty: 'all_levels',
    goalMetric: 'Días consecutivos',
    goalValue: 21,
    duration: 21,
    rules: 'Realizar cualquier tipo de entrenamiento antes de las 9:00 AM. Mínimo 20 minutos de duración. Registrar la hora de inicio y fin.',
    rewards: 'Insignia de "Madrugador Fitness" en tu perfil. Acceso a rutinas matutinas especiales.',
    maxParticipants: 300
  },
  'no_excuses_challenge': {
    title: 'Desafío Sin Excusas',
    description: 'Entrena 4 veces por semana durante 8 semanas, sin fallar ni una sesión.',
    challengeType: 'consistency',
    difficulty: 'intermediate',
    goalMetric: 'Semanas completadas',
    goalValue: 8,
    duration: 56,
    rules: 'Realizar 4 entrenamientos cada semana durante 8 semanas. Los entrenamientos deben durar al menos 30 minutos. Se permite elegir los días de entrenamiento cada semana.',
    rewards: 'Insignia de "Sin Excusas" en tu perfil. Acceso a programas premium.',
    maxParticipants: 150
  },

  // Transformation challenges
  'body_recomposition_challenge': {
    title: 'Desafío de Recomposición Corporal',
    description: 'Transforma tu cuerpo en 12 semanas con este programa completo de entrenamiento y nutrición.',
    challengeType: 'transformation',
    difficulty: 'advanced',
    goalMetric: 'Cambio en composición corporal',
    goalValue: 1, // Cualquier mejora visible
    duration: 84,
    rules: 'Seguir el plan de entrenamiento y nutrición durante 12 semanas. Tomar fotos de progreso cada 2 semanas. Registrar medidas corporales al inicio, mitad y final.',
    rewards: 'Insignia de "Transformación Total" en tu perfil. Consulta gratuita con entrenador personal.',
    maxParticipants: 50
  },
  'summer_body_challenge': {
    title: 'Desafío Cuerpo de Verano',
    description: 'Prepárate para el verano con este programa de 8 semanas enfocado en definición muscular.',
    challengeType: 'transformation',
    difficulty: 'intermediate',
    goalMetric: 'Reducción de porcentaje de grasa corporal',
    goalValue: 3, // 3% de reducción
    duration: 56,
    rules: 'Seguir el plan de entrenamiento 5 veces por semana. Seguir las pautas nutricionales proporcionadas. Registrar peso y medidas semanalmente.',
    rewards: 'Insignia de "Cuerpo de Verano" en tu perfil. Acceso a recetas fitness especiales.',
    maxParticipants: 100
  },

  // Skill challenges
  'handstand_challenge': {
    title: 'Desafío del Pino',
    description: 'Aprende a hacer el pino (vertical) en 30 días con progresiones diarias.',
    challengeType: 'skill',
    difficulty: 'intermediate',
    goalMetric: 'Segundos manteniendo el pino',
    goalValue: 10,
    duration: 30,
    rules: 'Realizar las progresiones diarias durante 30 días. Grabar un video al final manteniendo el pino. Se permite usar pared para apoyo.',
    rewards: 'Insignia de "Maestro del Pino" en tu perfil. Acceso a tutoriales de habilidades avanzadas.',
    maxParticipants: 50
  },
  'muscle_up_challenge': {
    title: 'Desafío del Muscle Up',
    description: 'Domina el muscle up en 8 semanas con este programa progresivo.',
    challengeType: 'skill',
    difficulty: 'advanced',
    goalMetric: 'Muscle ups consecutivos',
    goalValue: 1,
    duration: 56,
    rules: 'Seguir el programa de entrenamiento 3 veces por semana. Grabar un video al final realizando al menos un muscle up completo.',
    rewards: 'Insignia de "Dominador del Muscle Up" en tu perfil. Acceso a programa de calistenia avanzada.',
    maxParticipants: 30
  },

  // Team challenges
  'gym_buddies_challenge': {
    title: 'Desafío Compañeros de Gym',
    description: 'Entrena con un amigo durante 4 semanas y motívense mutuamente para alcanzar sus metas.',
    challengeType: 'team',
    difficulty: 'all_levels',
    goalMetric: 'Entrenamientos juntos',
    goalValue: 16,
    duration: 28,
    rules: 'Entrenar con tu compañero al menos 4 veces por semana durante 4 semanas. Ambos deben registrar el entrenamiento. Crear y compartir al menos 2 entrenamientos originales.',
    rewards: 'Insignia de "Dúo Dinámico" en tu perfil. Acceso a entrenamientos especiales para parejas.',
    maxParticipants: 100
  },
  'fitness_squad_challenge': {
    title: 'Desafío Escuadrón Fitness',
    description: 'Forma un equipo de 3-5 personas y compitan contra otros equipos en diversos retos semanales.',
    challengeType: 'team',
    difficulty: 'intermediate',
    goalMetric: 'Puntos de equipo',
    goalValue: 1000,
    duration: 42,
    rules: 'Formar un equipo de 3-5 personas. Completar los retos semanales y acumular puntos. Cada miembro debe contribuir al menos al 15% de los puntos totales.',
    rewards: 'Insignia de "Escuadrón Elite" para cada miembro. Sesión de entrenamiento grupal con entrenador profesional.',
    maxParticipants: 200
  }
};

/**
 * Initialize the challenge templates in the database
 * @returns Promise with success status
 */
export async function initializeChallengeTemplates(): Promise<boolean> {
  try {
    // Check if challenges already exist
    const { data: existingChallenges, error: checkError } = await supabase
      .from('community_challenges')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking community challenges:', checkError);
      return false;
    }

    // If challenges already exist, don't reinitialize
    if (existingChallenges && existingChallenges.length > 0) {
      console.log('Challenge templates already initialized');
      return true;
    }

    // Get admin user ID
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@routinize.com')
      .single();

    if (adminError) {
      console.error('Error getting admin user:', adminError);
      return false;
    }

    const adminId = adminUser?.id;

    // Prepare challenges for insertion
    const challengesToInsert = Object.entries(CHALLENGE_TEMPLATES).map(([key, challenge]) => {
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + challenge.duration);

      return {
        creator_id: adminId,
        title: challenge.title,
        description: challenge.description,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        challenge_type: challenge.challengeType,
        difficulty: challenge.difficulty,
        goal_metric: challenge.goalMetric,
        goal_value: challenge.goalValue,
        rules: challenge.rules,
        rewards: challenge.rewards,
        is_active: true,
        max_participants: challenge.maxParticipants
      };
    });

    // Insert challenges
    const { error: insertError } = await supabase
      .from('community_challenges')
      .insert(challengesToInsert);

    if (insertError) {
      console.error('Error initializing challenge templates:', insertError);
      return false;
    }

    console.log('Challenge templates initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing challenge templates:', error);
    return false;
  }
}

/**
 * Get all active community challenges
 * @returns Promise with the challenges or empty array if not found
 */
export async function getActiveChallenges(): Promise<CommunityChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error getting active challenges:', error);
      return [];
    }

    return data.map((challenge: any) => ({
      id: challenge.id,
      creatorId: challenge.creator_id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      challengeType: challenge.challenge_type,
      difficulty: challenge.difficulty,
      goalMetric: challenge.goal_metric,
      goalValue: challenge.goal_value,
      rules: challenge.rules,
      rewards: challenge.rewards,
      isActive: challenge.is_active,
      maxParticipants: challenge.max_participants,
      createdAt: challenge.created_at,
      updatedAt: challenge.updated_at
    }));
  } catch (error) {
    console.error('Error getting active challenges:', error);
    return [];
  }
}

/**
 * Get community challenges by type
 * @param type - Challenge type
 * @returns Promise with the challenges or empty array if not found
 */
export async function getChallengesByType(type: ChallengeType): Promise<CommunityChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('challenge_type', type)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error getting challenges by type:', error);
      return [];
    }

    return data.map((challenge: any) => ({
      id: challenge.id,
      creatorId: challenge.creator_id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      challengeType: challenge.challenge_type,
      difficulty: challenge.difficulty,
      goalMetric: challenge.goal_metric,
      goalValue: challenge.goal_value,
      rules: challenge.rules,
      rewards: challenge.rewards,
      isActive: challenge.is_active,
      maxParticipants: challenge.max_participants,
      createdAt: challenge.created_at,
      updatedAt: challenge.updated_at
    }));
  } catch (error) {
    console.error('Error getting challenges by type:', error);
    return [];
  }
}

/**
 * Get community challenges by difficulty
 * @param difficulty - Challenge difficulty
 * @returns Promise with the challenges or empty array if not found
 */
export async function getChallengesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'): Promise<CommunityChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('difficulty', difficulty)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error getting challenges by difficulty:', error);
      return [];
    }

    return data.map((challenge: any) => ({
      id: challenge.id,
      creatorId: challenge.creator_id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      challengeType: challenge.challenge_type,
      difficulty: challenge.difficulty,
      goalMetric: challenge.goal_metric,
      goalValue: challenge.goal_value,
      rules: challenge.rules,
      rewards: challenge.rewards,
      isActive: challenge.is_active,
      maxParticipants: challenge.max_participants,
      createdAt: challenge.created_at,
      updatedAt: challenge.updated_at
    }));
  } catch (error) {
    console.error('Error getting challenges by difficulty:', error);
    return [];
  }
}

/**
 * Get challenge by ID
 * @param challengeId - Challenge ID
 * @returns Promise with the challenge or null if not found
 */
export async function getChallengeById(challengeId: string): Promise<CommunityChallenge | null> {
  try {
    const { data, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('Error getting challenge by ID:', error);
      return null;
    }

    return {
      id: data.id,
      creatorId: data.creator_id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      challengeType: data.challenge_type,
      difficulty: data.difficulty,
      goalMetric: data.goal_metric,
      goalValue: data.goal_value,
      rules: data.rules,
      rewards: data.rewards,
      isActive: data.is_active,
      maxParticipants: data.max_participants,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error getting challenge by ID:', error);
    return null;
  }
}

/**
 * Join a challenge
 * @param challengeId - Challenge ID
 * @param userId - User ID
 * @returns Promise with the participant data or null on error
 */
export async function joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant | null> {
  try {
    // Check if user is already participating
    const { data: existingParticipant, error: checkError } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking challenge participation:', checkError);
      return null;
    }

    // If already participating, return existing data
    if (existingParticipant) {
      return {
        id: existingParticipant.id,
        challengeId: existingParticipant.challenge_id,
        userId: existingParticipant.user_id,
        joinDate: existingParticipant.join_date,
        currentProgress: existingParticipant.current_progress,
        completed: existingParticipant.completed,
        completionDate: existingParticipant.completion_date,
        notes: existingParticipant.notes
      };
    }

    // Join challenge
    const { data, error } = await supabase
      .from('challenge_participants')
      .insert([{
        challenge_id: challengeId,
        user_id: userId,
        current_progress: 0,
        completed: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error joining challenge:', error);
      return null;
    }

    return {
      id: data.id,
      challengeId: data.challenge_id,
      userId: data.user_id,
      joinDate: data.join_date,
      currentProgress: data.current_progress,
      completed: data.completed,
      completionDate: data.completion_date,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error joining challenge:', error);
    return null;
  }
}

/**
 * Update challenge progress
 * @param challengeId - Challenge ID
 * @param userId - User ID
 * @param progress - Current progress
 * @param completed - Whether the challenge is completed
 * @param notes - Optional notes
 * @returns Promise with the updated participant data or null on error
 */
export async function updateChallengeProgress(
  challengeId: string,
  userId: string,
  progress: number,
  completed: boolean = false,
  notes?: string
): Promise<ChallengeParticipant | null> {
  try {
    const updateData: any = {
      current_progress: progress,
      completed
    };

    if (completed) {
      updateData.completion_date = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('challenge_participants')
      .update(updateData)
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating challenge progress:', error);
      return null;
    }

    return {
      id: data.id,
      challengeId: data.challenge_id,
      userId: data.user_id,
      joinDate: data.join_date,
      currentProgress: data.current_progress,
      completed: data.completed,
      completionDate: data.completion_date,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return null;
  }
}

/**
 * Get user's active challenges
 * @param userId - User ID
 * @returns Promise with the challenges or empty array if not found
 */
export async function getUserActiveChallenges(userId: string): Promise<CommunityChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        challenge:challenge_id(*)
      `)
      .eq('user_id', userId)
      .eq('completed', false);

    if (error) {
      console.error('Error getting user active challenges:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.challenge.id,
      creatorId: item.challenge.creator_id,
      title: item.challenge.title,
      description: item.challenge.description,
      startDate: item.challenge.start_date,
      endDate: item.challenge.end_date,
      challengeType: item.challenge.challenge_type,
      difficulty: item.challenge.difficulty,
      goalMetric: item.challenge.goal_metric,
      goalValue: item.challenge.goal_value,
      rules: item.challenge.rules,
      rewards: item.challenge.rewards,
      isActive: item.challenge.is_active,
      maxParticipants: item.challenge.max_participants,
      createdAt: item.challenge.created_at,
      updatedAt: item.challenge.updated_at,
      participants: [{
        id: item.id,
        challengeId: item.challenge_id,
        userId: item.user_id,
        joinDate: item.join_date,
        currentProgress: item.current_progress,
        completed: item.completed,
        completionDate: item.completion_date,
        notes: item.notes
      }]
    }));
  } catch (error) {
    console.error('Error getting user active challenges:', error);
    return [];
  }
}

/**
 * Get challenge participants
 * @param challengeId - Challenge ID
 * @returns Promise with the participants or empty array if not found
 */
export async function getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('current_progress', { ascending: false });

    if (error) {
      console.error('Error getting challenge participants:', error);
      return [];
    }

    return data.map((participant: any) => ({
      id: participant.id,
      challengeId: participant.challenge_id,
      userId: participant.user_id,
      joinDate: participant.join_date,
      currentProgress: participant.current_progress,
      completed: participant.completed,
      completionDate: participant.completion_date,
      notes: participant.notes
    }));
  } catch (error) {
    console.error('Error getting challenge participants:', error);
    return [];
  }
}

/**
 * Create a new community challenge
 * @param creatorId - Creator user ID
 * @param challenge - Challenge data
 * @returns Promise with the created challenge or null on error
 */
export async function createChallenge(
  creatorId: string,
  challenge: Omit<CommunityChallenge, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>
): Promise<CommunityChallenge | null> {
  try {
    const { data, error } = await supabase
      .from('community_challenges')
      .insert([{
        creator_id: creatorId,
        title: challenge.title,
        description: challenge.description,
        start_date: challenge.startDate,
        end_date: challenge.endDate,
        challenge_type: challenge.challengeType,
        difficulty: challenge.difficulty,
        goal_metric: challenge.goalMetric,
        goal_value: challenge.goalValue,
        rules: challenge.rules,
        rewards: challenge.rewards,
        is_active: challenge.isActive,
        max_participants: challenge.maxParticipants
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }

    return {
      id: data.id,
      creatorId: data.creator_id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      challengeType: data.challenge_type,
      difficulty: data.difficulty,
      goalMetric: data.goal_metric,
      goalValue: data.goal_value,
      rules: data.rules,
      rewards: data.rewards,
      isActive: data.is_active,
      maxParticipants: data.max_participants,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error creating challenge:', error);
    return null;
  }
}
