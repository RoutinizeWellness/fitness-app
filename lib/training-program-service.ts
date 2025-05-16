import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { 
  TrainingProgram, 
  MesoCycle, 
  MicroCycle, 
  MacroCycle,
  ProgramProgress,
  ProgramAdjustment,
  ProgramTemplate
} from './types/training-program';
import { WorkoutDay, Exercise } from './types/training';

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Obtiene todos los programas de entrenamiento de un usuario
 */
export const getTrainingPrograms = async (userId: string): Promise<QueryResponse<TrainingProgram[]>> => {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Transformar los datos al formato esperado
    const programs: TrainingProgram[] = data.map(transformProgramFromDB);
    
    return { data: programs, error: null };
  } catch (error) {
    console.error('Error al obtener programas de entrenamiento:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Obtiene un programa de entrenamiento específico
 */
export const getTrainingProgram = async (programId: string): Promise<QueryResponse<TrainingProgram>> => {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) throw error;

    // Transformar los datos al formato esperado
    const program = transformProgramFromDB(data);
    
    return { data: program, error: null };
  } catch (error) {
    console.error('Error al obtener programa de entrenamiento:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Crea un nuevo programa de entrenamiento
 */
export const createTrainingProgram = async (program: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<QueryResponse<TrainingProgram>> => {
  try {
    // Preparar el programa para la base de datos
    const programForDB = transformProgramToDB({
      ...program,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('training_programs')
      .insert(programForDB)
      .select()
      .single();

    if (error) throw error;

    // Transformar los datos al formato esperado
    const createdProgram = transformProgramFromDB(data);
    
    return { data: createdProgram, error: null };
  } catch (error) {
    console.error('Error al crear programa de entrenamiento:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Actualiza un programa de entrenamiento existente
 */
export const updateTrainingProgram = async (programId: string, updates: Partial<TrainingProgram>): Promise<QueryResponse<TrainingProgram>> => {
  try {
    // Preparar las actualizaciones para la base de datos
    const updatesForDB = {
      ...transformProgramToDB(updates as TrainingProgram),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('training_programs')
      .update(updatesForDB)
      .eq('id', programId)
      .select()
      .single();

    if (error) throw error;

    // Transformar los datos al formato esperado
    const updatedProgram = transformProgramFromDB(data);
    
    return { data: updatedProgram, error: null };
  } catch (error) {
    console.error('Error al actualizar programa de entrenamiento:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Elimina un programa de entrenamiento
 */
export const deleteTrainingProgram = async (programId: string): Promise<QueryResponse<null>> => {
  try {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', programId);

    if (error) throw error;
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error al eliminar programa de entrenamiento:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Obtiene todas las plantillas de programas de entrenamiento
 */
export const getProgramTemplates = async (): Promise<QueryResponse<ProgramTemplate[]>> => {
  try {
    const { data, error } = await supabase
      .from('program_templates')
      .select('*');

    if (error) throw error;

    // Transformar los datos al formato esperado
    const templates: ProgramTemplate[] = data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      level: template.level,
      type: template.type,
      duration: template.duration,
      frequency: template.frequency,
      goal: template.goal,
      structure: template.structure,
      hasDeload: template.has_deload,
      deloadFrequency: template.deload_frequency,
      sampleExercises: template.sample_exercises || [],
      imageUrl: template.image_url,
      popularity: template.popularity,
      createdBy: template.created_by,
      createdAt: template.created_at
    }));
    
    return { data: templates, error: null };
  } catch (error) {
    console.error('Error al obtener plantillas de programas:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Obtiene el progreso de un usuario en un programa específico
 */
export const getProgramProgress = async (userId: string, programId: string): Promise<QueryResponse<ProgramProgress>> => {
  try {
    const { data, error } = await supabase
      .from('program_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();

    if (error) throw error;

    // Transformar los datos al formato esperado
    const progress: ProgramProgress = {
      id: data.id,
      userId: data.user_id,
      programId: data.program_id,
      currentWeek: data.current_week,
      currentDay: data.current_day,
      completedWorkouts: data.completed_workouts,
      totalWorkouts: data.total_workouts,
      adherenceRate: data.adherence_rate,
      startDate: data.start_date,
      lastWorkoutDate: data.last_workout_date,
      isCompleted: data.is_completed,
      completionDate: data.completion_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return { data: progress, error: null };
  } catch (error) {
    console.error('Error al obtener progreso del programa:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Actualiza el progreso de un usuario en un programa
 */
export const updateProgramProgress = async (progressId: string, updates: Partial<ProgramProgress>): Promise<QueryResponse<ProgramProgress>> => {
  try {
    // Convertir a formato de base de datos
    const updatesForDB: any = {};
    
    if (updates.currentWeek !== undefined) updatesForDB.current_week = updates.currentWeek;
    if (updates.currentDay !== undefined) updatesForDB.current_day = updates.currentDay;
    if (updates.completedWorkouts !== undefined) updatesForDB.completed_workouts = updates.completedWorkouts;
    if (updates.totalWorkouts !== undefined) updatesForDB.total_workouts = updates.totalWorkouts;
    if (updates.adherenceRate !== undefined) updatesForDB.adherence_rate = updates.adherenceRate;
    if (updates.lastWorkoutDate !== undefined) updatesForDB.last_workout_date = updates.lastWorkoutDate;
    if (updates.isCompleted !== undefined) updatesForDB.is_completed = updates.isCompleted;
    if (updates.completionDate !== undefined) updatesForDB.completion_date = updates.completionDate;
    if (updates.notes !== undefined) updatesForDB.notes = updates.notes;
    
    updatesForDB.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('program_progress')
      .update(updatesForDB)
      .eq('id', progressId)
      .select()
      .single();

    if (error) throw error;

    // Transformar los datos al formato esperado
    const updatedProgress: ProgramProgress = {
      id: data.id,
      userId: data.user_id,
      programId: data.program_id,
      currentWeek: data.current_week,
      currentDay: data.current_day,
      completedWorkouts: data.completed_workouts,
      totalWorkouts: data.total_workouts,
      adherenceRate: data.adherence_rate,
      startDate: data.start_date,
      lastWorkoutDate: data.last_workout_date,
      isCompleted: data.is_completed,
      completionDate: data.completion_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return { data: updatedProgress, error: null };
  } catch (error) {
    console.error('Error al actualizar progreso del programa:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

/**
 * Crea un nuevo ajuste para un programa
 */
export const createProgramAdjustment = async (adjustment: Omit<ProgramAdjustment, 'id' | 'createdAt'>): Promise<QueryResponse<ProgramAdjustment>> => {
  try {
    // Preparar el ajuste para la base de datos
    const adjustmentForDB = {
      id: uuidv4(),
      program_id: adjustment.programId,
      user_id: adjustment.userId,
      adjusted_by: adjustment.adjustedBy,
      adjustment_type: adjustment.adjustmentType,
      description: adjustment.description,
      reason: adjustment.reason,
      original_value: adjustment.originalValue,
      new_value: adjustment.newValue,
      applied_date: adjustment.appliedDate,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('program_adjustments')
      .insert(adjustmentForDB)
      .select()
      .single();

    if (error) throw error;

    // Transformar los datos al formato esperado
    const createdAdjustment: ProgramAdjustment = {
      id: data.id,
      programId: data.program_id,
      userId: data.user_id,
      adjustedBy: data.adjusted_by,
      adjustmentType: data.adjustment_type,
      description: data.description,
      reason: data.reason,
      originalValue: data.original_value,
      newValue: data.new_value,
      appliedDate: data.applied_date,
      createdAt: data.created_at
    };
    
    return { data: createdAdjustment, error: null };
  } catch (error) {
    console.error('Error al crear ajuste del programa:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Funciones auxiliares para transformar datos

/**
 * Transforma un programa de la base de datos al formato de la aplicación
 */
const transformProgramFromDB = (dbProgram: any): TrainingProgram => {
  return {
    id: dbProgram.id,
    userId: dbProgram.user_id,
    name: dbProgram.name,
    description: dbProgram.description,
    level: dbProgram.level,
    type: dbProgram.type,
    duration: dbProgram.duration,
    frequency: dbProgram.frequency,
    goal: dbProgram.goal,
    targetMuscleGroups: dbProgram.target_muscle_groups,
    structure: dbProgram.structure,
    mesoCycles: dbProgram.meso_cycles,
    macroCycle: dbProgram.macro_cycle,
    routines: dbProgram.routines,
    createdBy: dbProgram.created_by,
    assignedTo: dbProgram.assigned_to,
    isTemplate: dbProgram.is_template,
    isActive: dbProgram.is_active,
    startDate: dbProgram.start_date,
    endDate: dbProgram.end_date,
    createdAt: dbProgram.created_at,
    updatedAt: dbProgram.updated_at
  };
};

/**
 * Transforma un programa del formato de la aplicación al formato de la base de datos
 */
const transformProgramToDB = (program: Partial<TrainingProgram>): any => {
  const dbProgram: any = {};
  
  if (program.id !== undefined) dbProgram.id = program.id;
  if (program.userId !== undefined) dbProgram.user_id = program.userId;
  if (program.name !== undefined) dbProgram.name = program.name;
  if (program.description !== undefined) dbProgram.description = program.description;
  if (program.level !== undefined) dbProgram.level = program.level;
  if (program.type !== undefined) dbProgram.type = program.type;
  if (program.duration !== undefined) dbProgram.duration = program.duration;
  if (program.frequency !== undefined) dbProgram.frequency = program.frequency;
  if (program.goal !== undefined) dbProgram.goal = program.goal;
  if (program.targetMuscleGroups !== undefined) dbProgram.target_muscle_groups = program.targetMuscleGroups;
  if (program.structure !== undefined) dbProgram.structure = program.structure;
  if (program.mesoCycles !== undefined) dbProgram.meso_cycles = program.mesoCycles;
  if (program.macroCycle !== undefined) dbProgram.macro_cycle = program.macroCycle;
  if (program.routines !== undefined) dbProgram.routines = program.routines;
  if (program.createdBy !== undefined) dbProgram.created_by = program.createdBy;
  if (program.assignedTo !== undefined) dbProgram.assigned_to = program.assignedTo;
  if (program.isTemplate !== undefined) dbProgram.is_template = program.isTemplate;
  if (program.isActive !== undefined) dbProgram.is_active = program.isActive;
  if (program.startDate !== undefined) dbProgram.start_date = program.startDate;
  if (program.endDate !== undefined) dbProgram.end_date = program.endDate;
  if (program.createdAt !== undefined) dbProgram.created_at = program.createdAt;
  if (program.updatedAt !== undefined) dbProgram.updated_at = program.updatedAt;
  
  return dbProgram;
};
