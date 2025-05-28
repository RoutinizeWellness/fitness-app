import { supabase } from "@/lib/supabase-client";
import { 
  PeriodizationProgram, 
  Mesocycle, 
  Microcycle, 
  PeriodizedSession,
  TrainingObjective,
  ObjectiveAssociation,
  PeriodizationTemplate,
  PeriodizationType,
  TrainingLevel,
  TrainingGoal,
  TrainingPhase,
  DeloadStrategy
} from "@/lib/types/advanced-periodization";
import { v4 as uuidv4 } from "uuid";

/**
 * Servicio para gestionar la periodización avanzada
 */
export const PeriodizationService = {
  /**
   * Obtiene todos los programas de periodización del usuario
   */
  async getUserPrograms(userId: string): Promise<PeriodizationProgram[]> {
    const { data, error } = await supabase
      .from('periodization_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener programas:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Obtiene un programa de periodización por ID
   */
  async getProgramById(programId: string): Promise<PeriodizationProgram | null> {
    const { data, error } = await supabase
      .from('periodization_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) {
      console.error('Error al obtener programa:', error);
      return null;
    }

    return data;
  },

  /**
   * Crea un nuevo programa de periodización
   */
  async createProgram(program: PeriodizationProgram): Promise<PeriodizationProgram> {
    const { data, error } = await supabase
      .from('periodization_programs')
      .insert([program])
      .select()
      .single();

    if (error) {
      console.error('Error al crear programa:', error);
      throw error;
    }

    return data;
  },

  /**
   * Actualiza un programa de periodización
   */
  async updateProgram(program: PeriodizationProgram): Promise<PeriodizationProgram> {
    const { data, error } = await supabase
      .from('periodization_programs')
      .update(program)
      .eq('id', program.id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar programa:', error);
      throw error;
    }

    return data;
  },

  /**
   * Elimina un programa de periodización
   */
  async deleteProgram(programId: string): Promise<void> {
    const { error } = await supabase
      .from('periodization_programs')
      .delete()
      .eq('id', programId);

    if (error) {
      console.error('Error al eliminar programa:', error);
      throw error;
    }
  },

  /**
   * Obtiene los mesociclos de un programa
   */
  async getProgramMesocycles(programId: string): Promise<Mesocycle[]> {
    const { data, error } = await supabase
      .from('mesocycles')
      .select('*')
      .eq('program_id', programId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error al obtener mesociclos:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Crea un nuevo mesociclo
   */
  async createMesocycle(mesocycle: Mesocycle): Promise<Mesocycle> {
    const { data, error } = await supabase
      .from('mesocycles')
      .insert([mesocycle])
      .select()
      .single();

    if (error) {
      console.error('Error al crear mesociclo:', error);
      throw error;
    }

    return data;
  },

  /**
   * Obtiene los microciclos de un mesociclo
   */
  async getMesocycleMicrocycles(mesocycleId: string): Promise<Microcycle[]> {
    const { data, error } = await supabase
      .from('microcycles')
      .select('*')
      .eq('mesocycle_id', mesocycleId)
      .order('week_number', { ascending: true });

    if (error) {
      console.error('Error al obtener microciclos:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Crea un nuevo microciclo
   */
  async createMicrocycle(microcycle: Microcycle): Promise<Microcycle> {
    const { data, error } = await supabase
      .from('microcycles')
      .insert([microcycle])
      .select()
      .single();

    if (error) {
      console.error('Error al crear microciclo:', error);
      throw error;
    }

    return data;
  },

  /**
   * Obtiene las sesiones de un microciclo
   */
  async getMicrocycleSessions(microcycleId: string): Promise<PeriodizedSession[]> {
    const { data, error } = await supabase
      .from('periodized_sessions')
      .select('*')
      .eq('microcycle_id', microcycleId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error al obtener sesiones:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Crea una nueva sesión
   */
  async createSession(session: PeriodizedSession): Promise<PeriodizedSession> {
    const { data, error } = await supabase
      .from('periodized_sessions')
      .insert([session])
      .select()
      .single();

    if (error) {
      console.error('Error al crear sesión:', error);
      throw error;
    }

    return data;
  },

  /**
   * Obtiene los objetivos de entrenamiento del usuario
   */
  async getUserObjectives(userId: string): Promise<TrainingObjective[]> {
    const { data, error } = await supabase
      .from('training_objectives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener objetivos:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Crea un nuevo objetivo de entrenamiento
   */
  async createObjective(objective: TrainingObjective): Promise<TrainingObjective> {
    const { data, error } = await supabase
      .from('training_objectives')
      .insert([objective])
      .select()
      .single();

    if (error) {
      console.error('Error al crear objetivo:', error);
      throw error;
    }

    return data;
  },

  /**
   * Asocia un objetivo a una entidad (programa, mesociclo, etc.)
   */
  async associateObjective(association: ObjectiveAssociation): Promise<ObjectiveAssociation> {
    const { data, error } = await supabase
      .from('objective_associations')
      .insert([association])
      .select()
      .single();

    if (error) {
      console.error('Error al asociar objetivo:', error);
      throw error;
    }

    return data;
  },

  /**
   * Obtiene las plantillas de periodización
   */
  async getTemplates(trainingLevel?: TrainingLevel, goal?: TrainingGoal): Promise<PeriodizationTemplate[]> {
    let query = supabase
      .from('periodization_templates')
      .select('*')
      .eq('is_official', true);

    if (trainingLevel) {
      query = query.eq('training_level', trainingLevel);
    }

    if (goal) {
      query = query.eq('goal', goal);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Error al obtener plantillas:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Crea un programa a partir de una plantilla
   */
  async createProgramFromTemplate(
    userId: string,
    templateId: string,
    programName: string,
    startDate?: string
  ): Promise<PeriodizationProgram> {
    // Obtener la plantilla
    const { data: template, error: templateError } = await supabase
      .from('periodization_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) {
      console.error('Error al obtener plantilla:', templateError);
      throw templateError;
    }

    // Crear el programa
    const program: PeriodizationProgram = {
      user_id: userId,
      name: programName,
      description: template.description,
      periodization_type: template.periodization_type,
      start_date: startDate || new Date().toISOString(),
      goal: template.goal,
      training_level: template.training_level,
      frequency: template.structure.frequency || 4,
      structure: template.structure
    };

    return await this.createProgram(program);
  }
};
