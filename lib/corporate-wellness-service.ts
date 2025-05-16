import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaces para el módulo de bienestar corporativo
 */
export interface CorporateWellnessProgram {
  id: string
  companyId: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  goals?: any
  participantsCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CorporateChallenge {
  id: string
  programId: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  challengeType: string
  targetValue?: number
  reward?: string
  isActive: boolean
  createdAt: string
}

export interface ChallengeParticipant {
  id: string
  challengeId: string
  userId: string
  anonymousId: string
  currentValue: number
  completed: boolean
  joinedAt: string
}

export interface CorporateWellnessStats {
  id: string
  companyId: string
  date: string
  statsType: string
  statsData: any
  createdAt: string
}

/**
 * Obtiene programas de bienestar corporativo
 * @param companyId - ID de la empresa
 * @param options - Opciones de filtrado
 * @returns - Lista de programas o null en caso de error
 */
export const getCorporateWellnessPrograms = async (
  companyId: string,
  options?: {
    isActive?: boolean
    limit?: number
  }
): Promise<{ data: CorporateWellnessProgram[] | null, error: any }> => {
  try {
    let query = supabase
      .from('corporate_wellness_programs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener programas de bienestar corporativo:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const programs: CorporateWellnessProgram[] = data.map(item => ({
      id: item.id,
      companyId: item.company_id,
      name: item.name,
      description: item.description,
      startDate: item.start_date,
      endDate: item.end_date,
      goals: item.goals,
      participantsCount: item.participants_count,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return { data: programs, error: null }
  } catch (error) {
    console.error('Error al obtener programas de bienestar corporativo:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un programa de bienestar corporativo
 * @param program - Datos del programa
 * @returns - Programa guardado o null en caso de error
 */
export const saveCorporateWellnessProgram = async (
  program: Omit<CorporateWellnessProgram, 'id' | 'participantsCount' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ data: CorporateWellnessProgram | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const programId = program.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo del programa
    const completeProgram: CorporateWellnessProgram = {
      id: programId,
      participantsCount: 0,
      createdAt: program.id ? (program as any).createdAt || now : now,
      updatedAt: now,
      ...program
    } as CorporateWellnessProgram

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeProgram.id,
      company_id: completeProgram.companyId,
      name: completeProgram.name,
      description: completeProgram.description,
      start_date: completeProgram.startDate,
      end_date: completeProgram.endDate,
      goals: completeProgram.goals,
      participants_count: completeProgram.participantsCount,
      is_active: completeProgram.isActive,
      created_at: completeProgram.createdAt,
      updated_at: completeProgram.updatedAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('corporate_wellness_programs')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeProgram, error }
      }

      console.log('Programa de bienestar corporativo guardado exitosamente en Supabase')
      return { data: completeProgram, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar programa de bienestar corporativo:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene retos corporativos
 * @param programId - ID del programa
 * @param options - Opciones de filtrado
 * @returns - Lista de retos o null en caso de error
 */
export const getCorporateChallenges = async (
  programId: string,
  options?: {
    isActive?: boolean
    limit?: number
  }
): Promise<{ data: CorporateChallenge[] | null, error: any }> => {
  try {
    let query = supabase
      .from('corporate_challenges')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: false })

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener retos corporativos:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const challenges: CorporateChallenge[] = data.map(item => ({
      id: item.id,
      programId: item.program_id,
      title: item.title,
      description: item.description,
      startDate: item.start_date,
      endDate: item.end_date,
      challengeType: item.challenge_type,
      targetValue: item.target_value,
      reward: item.reward,
      isActive: item.is_active,
      createdAt: item.created_at
    }))

    return { data: challenges, error: null }
  } catch (error) {
    console.error('Error al obtener retos corporativos:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un reto corporativo
 * @param challenge - Datos del reto
 * @returns - Reto guardado o null en caso de error
 */
export const saveCorporateChallenge = async (
  challenge: Omit<CorporateChallenge, 'id' | 'createdAt'> & { id?: string }
): Promise<{ data: CorporateChallenge | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const challengeId = challenge.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo del reto
    const completeChallenge: CorporateChallenge = {
      id: challengeId,
      createdAt: now,
      ...challenge
    } as CorporateChallenge

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeChallenge.id,
      program_id: completeChallenge.programId,
      title: completeChallenge.title,
      description: completeChallenge.description,
      start_date: completeChallenge.startDate,
      end_date: completeChallenge.endDate,
      challenge_type: completeChallenge.challengeType,
      target_value: completeChallenge.targetValue,
      reward: completeChallenge.reward,
      is_active: completeChallenge.isActive,
      created_at: completeChallenge.createdAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('corporate_challenges')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeChallenge, error }
      }

      console.log('Reto corporativo guardado exitosamente en Supabase')
      return { data: completeChallenge, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar reto corporativo:', error)
    return { data: null, error }
  }
}

/**
 * Unirse a un reto corporativo
 * @param challengeId - ID del reto
 * @param userId - ID del usuario
 * @returns - Participante o null en caso de error
 */
export const joinCorporateChallenge = async (
  challengeId: string,
  userId: string
): Promise<{ data: ChallengeParticipant | null, error: any }> => {
  try {
    // Verificar si ya está unido
    const { data: existingParticipant } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single()

    if (existingParticipant) {
      return {
        data: {
          id: existingParticipant.id,
          challengeId: existingParticipant.challenge_id,
          userId: existingParticipant.user_id,
          anonymousId: existingParticipant.anonymous_id,
          currentValue: existingParticipant.current_value,
          completed: existingParticipant.completed,
          joinedAt: existingParticipant.joined_at
        },
        error: null
      }
    }

    // Crear un ID anónimo para reportes
    const anonymousId = uuidv4().substring(0, 8)
    const now = new Date().toISOString()

    // Crear el participante
    const participant: ChallengeParticipant = {
      id: uuidv4(),
      challengeId,
      userId,
      anonymousId,
      currentValue: 0,
      completed: false,
      joinedAt: now
    }

    // Preparar datos para Supabase
    const supabaseData = {
      id: participant.id,
      challenge_id: participant.challengeId,
      user_id: participant.userId,
      anonymous_id: participant.anonymousId,
      current_value: participant.currentValue,
      completed: participant.completed,
      joined_at: participant.joinedAt
    }

    // Guardar en Supabase
    const { error } = await supabase
      .from('challenge_participants')
      .insert(supabaseData)

    if (error) {
      console.error('Error al unirse al reto:', error)
      return { data: null, error }
    }

    // Incrementar contador de participantes en el programa
    const { data: challengeData } = await supabase
      .from('corporate_challenges')
      .select('program_id')
      .eq('id', challengeId)
      .single()

    if (challengeData) {
      await supabase.rpc('increment_participants_count', {
        program_id: challengeData.program_id
      })
    }

    return { data: participant, error: null }
  } catch (error) {
    console.error('Error al unirse al reto corporativo:', error)
    return { data: null, error }
  }
}

/**
 * Actualiza el progreso en un reto
 * @param challengeId - ID del reto
 * @param userId - ID del usuario
 * @param value - Valor actual
 * @returns - Éxito o error
 */
export const updateChallengeProgress = async (
  challengeId: string,
  userId: string,
  value: number
): Promise<{ success: boolean, completed: boolean, error: any }> => {
  try {
    // Obtener el participante
    const { data: participant } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single()

    if (!participant) {
      return { success: false, completed: false, error: 'No se encontró el participante' }
    }

    // Obtener el reto para verificar el valor objetivo
    const { data: challenge } = await supabase
      .from('corporate_challenges')
      .select('target_value')
      .eq('id', challengeId)
      .single()

    // Determinar si se ha completado el reto
    const completed = challenge && challenge.target_value ? value >= challenge.target_value : false

    // Actualizar el progreso
    const { error } = await supabase
      .from('challenge_participants')
      .update({
        current_value: value,
        completed
      })
      .eq('id', participant.id)

    if (error) {
      console.error('Error al actualizar progreso:', error)
      return { success: false, completed: false, error }
    }

    return { success: true, completed, error: null }
  } catch (error) {
    console.error('Error al actualizar progreso del reto:', error)
    return { success: false, completed: false, error }
  }
}

/**
 * Obtiene estadísticas anónimas de bienestar corporativo
 * @param companyId - ID de la empresa
 * @param options - Opciones de filtrado
 * @returns - Estadísticas o null en caso de error
 */
export const getCorporateWellnessStats = async (
  companyId: string,
  options?: {
    statsType?: string
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<{ data: CorporateWellnessStats[] | null, error: any }> => {
  try {
    let query = supabase
      .from('corporate_wellness_stats')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: false })

    if (options?.statsType) {
      query = query.eq('stats_type', options.statsType)
    }

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener estadísticas de bienestar corporativo:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const stats: CorporateWellnessStats[] = data.map(item => ({
      id: item.id,
      companyId: item.company_id,
      date: item.date,
      statsType: item.stats_type,
      statsData: item.stats_data,
      createdAt: item.created_at
    }))

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error al obtener estadísticas de bienestar corporativo:', error)
    return { data: null, error }
  }
}
