import { supabase } from "./supabase-client"

// Función para crear la tabla de wellness_scores si no existe
export async function createWellnessScoresTableIfNotExists() {
  const { data, error } = await supabase.rpc('create_wellness_scores_if_not_exists')
  
  if (error) {
    console.error("Error creating wellness_scores table:", error)
    return false
  }
  
  return true
}

// Función para crear la tabla de emotional_journal si no existe
export async function createEmotionalJournalTableIfNotExists() {
  const { data, error } = await supabase.rpc('create_emotional_journal_if_not_exists')
  
  if (error) {
    console.error("Error creating emotional_journal table:", error)
    return false
  }
  
  return true
}

// Función para crear la tabla de recovery_sessions si no existe
export async function createRecoverySessionsTableIfNotExists() {
  const { data, error } = await supabase.rpc('create_recovery_sessions_if_not_exists')
  
  if (error) {
    console.error("Error creating recovery_sessions table:", error)
    return false
  }
  
  return true
}

// Función para inicializar todas las tablas necesarias
export async function initializeWellnessTables() {
  await createWellnessScoresTableIfNotExists()
  await createEmotionalJournalTableIfNotExists()
  await createRecoverySessionsTableIfNotExists()
}

// Función para obtener las puntuaciones de bienestar de un usuario
export async function getWellnessScores(userId: string, limit = 14) {
  const { data, error } = await supabase
    .from("wellness_scores")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching wellness scores:", error)
    return []
  }
  
  return data || []
}

// Función para guardar una puntuación de bienestar
export async function saveWellnessScore(wellnessData: any) {
  // Verificar si ya existe un registro para la fecha
  const { data: existingData, error: checkError } = await supabase
    .from("wellness_scores")
    .select("*")
    .eq("user_id", wellnessData.user_id)
    .eq("date", wellnessData.date)
    .maybeSingle()
  
  if (checkError) {
    console.error("Error checking existing wellness score:", checkError)
    return false
  }
  
  let saveError
  
  if (existingData) {
    // Actualizar registro existente
    const { error } = await supabase
      .from("wellness_scores")
      .update(wellnessData)
      .eq("user_id", wellnessData.user_id)
      .eq("date", wellnessData.date)
    
    saveError = error
  } else {
    // Insertar nuevo registro
    const { error } = await supabase
      .from("wellness_scores")
      .insert(wellnessData)
    
    saveError = error
  }
  
  if (saveError) {
    console.error("Error saving wellness score:", saveError)
    return false
  }
  
  return true
}

// Función para obtener las entradas del diario emocional de un usuario
export async function getEmotionalJournalEntries(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("emotional_journal")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching emotional journal entries:", error)
    return []
  }
  
  return data || []
}

// Función para guardar una entrada del diario emocional
export async function saveEmotionalJournalEntry(entryData: any) {
  const { error } = await supabase
    .from("emotional_journal")
    .insert(entryData)
  
  if (error) {
    console.error("Error saving emotional journal entry:", error)
    return false
  }
  
  return true
}

// Función para actualizar una entrada del diario emocional
export async function updateEmotionalJournalEntry(entryId: string, userId: string, entryData: any) {
  const { error } = await supabase
    .from("emotional_journal")
    .update(entryData)
    .eq("id", entryId)
    .eq("user_id", userId)
  
  if (error) {
    console.error("Error updating emotional journal entry:", error)
    return false
  }
  
  return true
}

// Función para eliminar una entrada del diario emocional
export async function deleteEmotionalJournalEntry(entryId: string, userId: string) {
  const { error } = await supabase
    .from("emotional_journal")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId)
  
  if (error) {
    console.error("Error deleting emotional journal entry:", error)
    return false
  }
  
  return true
}

// Función para obtener las sesiones de recuperación completadas de un usuario
export async function getCompletedRecoverySessions(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("recovery_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("created_at", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching completed recovery sessions:", error)
    return []
  }
  
  return data || []
}

// Función para guardar una sesión de recuperación completada
export async function saveCompletedRecoverySession(sessionData: any) {
  const { error } = await supabase
    .from("recovery_sessions")
    .insert(sessionData)
  
  if (error) {
    console.error("Error saving completed recovery session:", error)
    return false
  }
  
  return true
}
