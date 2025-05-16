/**
 * Advanced Training Techniques Service
 * Implements advanced training techniques from Spanish fitness resources
 * for maximizing muscle growth, strength, and performance.
 */

import { supabase } from '@/lib/supabase-client';
import { TechniqueCategory, AdvancedTechnique } from '@/lib/types/periodization';
import { v4 as uuidv4 } from 'uuid';

// Advanced training techniques
export interface TechniqueDetails {
  name: string;
  description: string;
  category: TechniqueCategory;
  difficulty: 'intermediate' | 'advanced' | 'elite';
  suitableExercises: string[];
  implementationNotes: string;
  benefits: string[];
  cautions: string[];
  recommendedReps?: [number, number]; // [min, max]
  recommendedSets?: [number, number]; // [min, max]
  recommendedRir?: [number, number]; // [min, max]
  restPeriod?: [number, number]; // [min, max] in seconds
  frequencyPerWeek?: [number, number]; // [min, max]
}

// Advanced training techniques catalog
export const ADVANCED_TECHNIQUES: Record<string, TechniqueDetails> = {
  // Intensity techniques
  'rest_pause': {
    name: 'Rest-Pause',
    description: 'Realizar una serie hasta el fallo o cerca del fallo, descansar brevemente (10-20 segundos), y continuar con el mismo peso para más repeticiones.',
    category: 'intensity',
    difficulty: 'intermediate',
    suitableExercises: ['compound', 'isolation', 'machine', 'free_weights'],
    implementationNotes: 'Realizar 1-3 mini-series después de la serie principal. Usar con moderación (1-2 ejercicios por sesión).',
    benefits: [
      'Aumenta el tiempo bajo tensión',
      'Recluta más fibras musculares',
      'Incrementa el estrés metabólico',
      'Permite más volumen en menos tiempo'
    ],
    cautions: [
      'Alta fatiga del sistema nervioso central',
      'Puede comprometer la técnica si se abusa',
      'No recomendado para principiantes',
      'Evitar en ejercicios técnicamente complejos'
    ],
    recommendedReps: [8, 12],
    recommendedSets: [1, 3],
    recommendedRir: [0, 1],
    restPeriod: [10, 20],
    frequencyPerWeek: [1, 2]
  },
  'drop_set': {
    name: 'Series Descendentes',
    description: 'Realizar una serie hasta el fallo o cerca del fallo, reducir inmediatamente el peso (20-30%) y continuar sin descanso.',
    category: 'intensity',
    difficulty: 'intermediate',
    suitableExercises: ['machine', 'dumbbell', 'cable'],
    implementationNotes: 'Ideal para el final del entrenamiento. Preparar los pesos con anticipación. Realizar 1-3 reducciones de peso.',
    benefits: [
      'Maximiza la fatiga muscular',
      'Recluta fibras de diferentes tipos',
      'Aumenta la congestión muscular',
      'Eficiente para ahorrar tiempo'
    ],
    cautions: [
      'Alta demanda de recuperación',
      'Puede comprometer la técnica',
      'Requiere equipo adecuado o compañero',
      'No abusar (máximo 1-2 ejercicios por grupo muscular)'
    ],
    recommendedReps: [8, 12],
    recommendedSets: [1, 2],
    recommendedRir: [0, 1],
    frequencyPerWeek: [1, 2]
  },
  'myo_reps': {
    name: 'Myo-Reps',
    description: 'Realizar una serie de activación hasta casi el fallo, descansar brevemente (5-10 segundos), y realizar mini-series de pocas repeticiones.',
    category: 'intensity',
    difficulty: 'advanced',
    suitableExercises: ['isolation', 'machine', 'cable'],
    implementationNotes: 'Serie de activación: 12-15 reps. Mini-series: 3-5 reps. Continuar hasta que no se puedan completar las repeticiones objetivo.',
    benefits: [
      'Maximiza la estimulación de fibras musculares',
      'Eficiente en tiempo',
      'Combina fatiga metabólica y mecánica',
      'Excelente para hipertrofia'
    ],
    cautions: [
      'Alta fatiga acumulada',
      'Requiere buena conciencia corporal',
      'No recomendado para principiantes',
      'Limitar a 1-2 ejercicios por sesión'
    ],
    recommendedReps: [3, 5],
    recommendedSets: [4, 8],
    recommendedRir: [1, 2],
    restPeriod: [5, 10],
    frequencyPerWeek: [1, 2]
  },
  'cluster_sets': {
    name: 'Series Cluster',
    description: 'Dividir una serie en varios segmentos con micro-descansos, permitiendo usar cargas más pesadas para el mismo número total de repeticiones.',
    category: 'intensity',
    difficulty: 'advanced',
    suitableExercises: ['compound', 'free_weights', 'machine'],
    implementationNotes: 'Ejemplo: 5 reps, 15s descanso, 5 reps, 15s descanso, 5 reps. Cuenta como una serie completa.',
    benefits: [
      'Permite mayor volumen con cargas altas',
      'Mejora la fuerza y potencia',
      'Reduce la fatiga técnica',
      'Efectivo para romper mesetas'
    ],
    cautions: [
      'Alta demanda del sistema nervioso',
      'Requiere cronometraje preciso',
      'No abusar en frecuencia',
      'Mejor para fases de fuerza'
    ],
    recommendedReps: [3, 5],
    recommendedSets: [3, 5],
    recommendedRir: [1, 2],
    restPeriod: [10, 20],
    frequencyPerWeek: [1, 2]
  },

  // Time under tension techniques
  'tempo_training': {
    name: 'Entrenamiento con Tempo',
    description: 'Manipular deliberadamente la velocidad de las fases concéntrica, excéntrica e isométrica de cada repetición.',
    category: 'time_under_tension',
    difficulty: 'intermediate',
    suitableExercises: ['all'],
    implementationNotes: 'Notación: 4-1-2-0 (4s excéntrica, 1s pausa abajo, 2s concéntrica, 0s pausa arriba).',
    benefits: [
      'Aumenta el tiempo bajo tensión',
      'Mejora el control y la técnica',
      'Incrementa la conciencia muscular',
      'Reduce el riesgo de lesiones'
    ],
    cautions: [
      'Requiere reducir el peso usado',
      'Puede ser mentalmente desafiante',
      'No abusar de tempos muy lentos',
      'Balancear con entrenamiento regular'
    ],
    recommendedReps: [6, 12],
    recommendedSets: [2, 4],
    recommendedRir: [2, 3],
    frequencyPerWeek: [1, 3]
  },
  'isometric_holds': {
    name: 'Contracciones Isométricas',
    description: 'Mantener una posición estática bajo tensión durante un período prolongado, generalmente en el punto de mayor tensión del ejercicio.',
    category: 'time_under_tension',
    difficulty: 'intermediate',
    suitableExercises: ['all'],
    implementationNotes: 'Mantener 3-10 segundos en posición de máxima tensión. Puede usarse al final de una serie normal o como técnica independiente.',
    benefits: [
      'Mejora la estabilidad y control',
      'Aumenta la congestión muscular',
      'Desarrolla fuerza en puntos débiles',
      'Mejora la conexión mente-músculo'
    ],
    cautions: [
      'Puede aumentar la presión arterial',
      'Evitar en personas con problemas cardiovasculares',
      'No mantener la respiración durante las isometrías',
      'Limitar la duración total'
    ],
    recommendedReps: [3, 6],
    recommendedSets: [2, 4],
    recommendedRir: [1, 3],
    frequencyPerWeek: [1, 3]
  },

  // Metabolic techniques
  'supersets': {
    name: 'Supersets',
    description: 'Realizar dos ejercicios consecutivos sin descanso entre ellos. Pueden ser para el mismo grupo muscular (agonista) o grupos opuestos (antagonista).',
    category: 'metabolic',
    difficulty: 'intermediate',
    suitableExercises: ['all'],
    implementationNotes: 'Descansar solo después de completar ambos ejercicios. Ideal para ahorrar tiempo o aumentar la intensidad.',
    benefits: [
      'Aumenta la densidad del entrenamiento',
      'Mejora la resistencia muscular',
      'Incrementa el gasto calórico',
      'Ahorra tiempo en el gimnasio'
    ],
    cautions: [
      'Puede comprometer la fuerza en el segundo ejercicio',
      'Requiere buena planificación logística',
      'No ideal para objetivos de fuerza máxima',
      'Considerar la fatiga acumulada'
    ],
    recommendedReps: [8, 15],
    recommendedSets: [3, 4],
    recommendedRir: [1, 3],
    frequencyPerWeek: [1, 4]
  },
  'giant_sets': {
    name: 'Series Gigantes',
    description: 'Realizar 3-5 ejercicios consecutivos para el mismo grupo muscular o grupos relacionados, sin descanso entre ellos.',
    category: 'metabolic',
    difficulty: 'advanced',
    suitableExercises: ['all'],
    implementationNotes: 'Descansar solo después de completar todos los ejercicios. Ideal para fases de definición o para romper mesetas.',
    benefits: [
      'Maximiza el estrés metabólico',
      'Estimula la liberación hormonal',
      'Excelente para quemar calorías',
      'Ataca el músculo desde múltiples ángulos'
    ],
    cautions: [
      'Alta demanda cardiovascular',
      'Requiere buena condición física',
      'Difícil de mantener la intensidad en todos los ejercicios',
      'No abusar en frecuencia'
    ],
    recommendedReps: [10, 15],
    recommendedSets: [2, 4],
    recommendedRir: [1, 3],
    frequencyPerWeek: [1, 2]
  },
  'emom': {
    name: 'EMOM (Every Minute On the Minute)',
    description: 'Realizar un número específico de repeticiones al comienzo de cada minuto, descansando el tiempo restante hasta el siguiente minuto.',
    category: 'metabolic',
    difficulty: 'advanced',
    suitableExercises: ['compound', 'free_weights', 'bodyweight'],
    implementationNotes: 'Ajustar el número de repeticiones para tener 15-30 segundos de descanso. Duración típica: 10-20 minutos.',
    benefits: [
      'Mejora la condición cardiovascular',
      'Desarrolla resistencia muscular',
      'Entrena la recuperación entre esfuerzos',
      'Estructura clara y motivante'
    ],
    cautions: [
      'Puede comprometer la técnica con la fatiga',
      'Requiere selección cuidadosa del peso',
      'No ideal para principiantes',
      'Monitorear la frecuencia cardíaca'
    ],
    recommendedReps: [5, 10],
    recommendedSets: [8, 20],
    recommendedRir: [2, 4],
    frequencyPerWeek: [1, 2]
  },

  // Compound techniques
  'mechanical_drop_set': {
    name: 'Series Descendentes Mecánicas',
    description: 'Cambiar la mecánica o variante del ejercicio para continuar cuando se alcanza el fallo, aprovechando diferentes ángulos o palancas.',
    category: 'compound',
    difficulty: 'advanced',
    suitableExercises: ['compound', 'isolation'],
    implementationNotes: 'Ejemplo: Dominadas → Dominadas asistidas → Jalones. O: Press inclinado → Press plano → Press declinado.',
    benefits: [
      'Permite continuar más allá del fallo muscular',
      'Estimula diferentes fibras y ángulos',
      'No requiere cambiar pesos',
      'Muy efectivo para hipertrofia'
    ],
    cautions: [
      'Alta fatiga acumulada',
      'Requiere planificación cuidadosa',
      'Puede comprometer la técnica',
      'Usar con moderación (1-2 ejercicios por sesión)'
    ],
    recommendedReps: [8, 12],
    recommendedSets: [1, 3],
    recommendedRir: [0, 1],
    frequencyPerWeek: [1, 2]
  },
  'pre_exhaustion': {
    name: 'Pre-Exhaustion',
    description: 'Realizar un ejercicio de aislamiento seguido inmediatamente por un ejercicio compuesto para el mismo grupo muscular.',
    category: 'compound',
    difficulty: 'advanced',
    suitableExercises: ['isolation', 'compound'],
    implementationNotes: 'Ejemplo: Extensiones de cuádriceps → Sentadillas. O: Aperturas → Press de banca.',
    benefits: [
      'Asegura la fatiga del músculo objetivo',
      'Supera músculos limitantes',
      'Aumenta la sensación de "quemazón"',
      'Mejora la conexión mente-músculo'
    ],
    cautions: [
      'Reduce el peso que se puede usar en el compuesto',
      'Puede aumentar el riesgo si la técnica se compromete',
      'No ideal para objetivos de fuerza',
      'Usar estratégicamente, no en cada entrenamiento'
    ],
    recommendedReps: [10, 15],
    recommendedSets: [2, 4],
    recommendedRir: [1, 2],
    frequencyPerWeek: [1, 2]
  }
};

/**
 * Initialize the advanced techniques in the database
 * @returns Promise with success status
 */
export async function initializeAdvancedTechniques(): Promise<boolean> {
  try {
    // Check if techniques already exist
    const { data: existingTechniques, error: checkError } = await supabase
      .from('advanced_techniques')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking advanced techniques:', checkError);
      return false;
    }

    // If techniques already exist, don't reinitialize
    if (existingTechniques && existingTechniques.length > 0) {
      console.log('Advanced techniques already initialized');
      return true;
    }

    // Prepare techniques for insertion
    const techniquesToInsert = Object.entries(ADVANCED_TECHNIQUES).map(([key, technique]) => ({
      name: technique.name,
      description: technique.description,
      category: technique.category,
      difficulty: technique.difficulty,
      suitable_exercises: technique.suitableExercises,
      implementation_notes: technique.implementationNotes
    }));

    // Insert techniques
    const { error: insertError } = await supabase
      .from('advanced_techniques')
      .insert(techniquesToInsert);

    if (insertError) {
      console.error('Error initializing advanced techniques:', insertError);
      return false;
    }

    console.log('Advanced techniques initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing advanced techniques:', error);
    return false;
  }
}

/**
 * Get all advanced techniques
 * @returns Promise with the techniques or empty array if not found
 */
export async function getAllAdvancedTechniques(): Promise<AdvancedTechnique[]> {
  try {
    const { data, error } = await supabase
      .from('advanced_techniques')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting advanced techniques:', error);
      return [];
    }

    return data.map((technique: any) => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      category: technique.category,
      difficulty: technique.difficulty,
      suitableExercises: technique.suitable_exercises,
      implementationNotes: technique.implementation_notes,
      createdAt: technique.created_at
    }));
  } catch (error) {
    console.error('Error getting advanced techniques:', error);
    return [];
  }
}

/**
 * Get advanced techniques by category
 * @param category - Technique category
 * @returns Promise with the techniques or empty array if not found
 */
export async function getAdvancedTechniquesByCategory(category: TechniqueCategory): Promise<AdvancedTechnique[]> {
  try {
    const { data, error } = await supabase
      .from('advanced_techniques')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting advanced techniques by category:', error);
      return [];
    }

    return data.map((technique: any) => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      category: technique.category,
      difficulty: technique.difficulty,
      suitableExercises: technique.suitable_exercises,
      implementationNotes: technique.implementation_notes,
      createdAt: technique.created_at
    }));
  } catch (error) {
    console.error('Error getting advanced techniques by category:', error);
    return [];
  }
}

/**
 * Get advanced techniques by difficulty
 * @param difficulty - Technique difficulty
 * @returns Promise with the techniques or empty array if not found
 */
export async function getAdvancedTechniquesByDifficulty(difficulty: 'intermediate' | 'advanced' | 'elite'): Promise<AdvancedTechnique[]> {
  try {
    const { data, error } = await supabase
      .from('advanced_techniques')
      .select('*')
      .eq('difficulty', difficulty)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting advanced techniques by difficulty:', error);
      return [];
    }

    return data.map((technique: any) => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      category: technique.category,
      difficulty: technique.difficulty,
      suitableExercises: technique.suitable_exercises,
      implementationNotes: technique.implementation_notes,
      createdAt: technique.created_at
    }));
  } catch (error) {
    console.error('Error getting advanced techniques by difficulty:', error);
    return [];
  }
}

/**
 * Get advanced techniques suitable for specific exercise types
 * @param exerciseType - Exercise type
 * @returns Promise with the techniques or empty array if not found
 */
export async function getAdvancedTechniquesByExerciseType(exerciseType: string): Promise<AdvancedTechnique[]> {
  try {
    const { data, error } = await supabase
      .from('advanced_techniques')
      .select('*')
      .contains('suitable_exercises', [exerciseType])
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting advanced techniques by exercise type:', error);
      return [];
    }

    return data.map((technique: any) => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      category: technique.category,
      difficulty: technique.difficulty,
      suitableExercises: technique.suitable_exercises,
      implementationNotes: technique.implementation_notes,
      createdAt: technique.created_at
    }));
  } catch (error) {
    console.error('Error getting advanced techniques by exercise type:', error);
    return [];
  }
}

/**
 * Get detailed information about a technique from the catalog
 * @param techniqueKey - Technique key in the catalog
 * @returns Technique details or null if not found
 */
export function getTechniqueDetails(techniqueKey: string): TechniqueDetails | null {
  return ADVANCED_TECHNIQUES[techniqueKey] || null;
}

/**
 * Get recommended techniques based on training level and goal
 * @param level - Training level
 * @param goal - Training goal
 * @returns Promise with the recommended techniques
 */
export async function getRecommendedTechniques(
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite',
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'weight_loss' | 'body_recomposition'
): Promise<AdvancedTechnique[]> {
  try {
    // Determine appropriate difficulty levels
    let difficulties: ('intermediate' | 'advanced' | 'elite')[] = [];

    switch (level) {
      case 'beginner':
        difficulties = ['intermediate'];
        break;
      case 'intermediate':
        difficulties = ['intermediate', 'advanced'];
        break;
      case 'advanced':
        difficulties = ['intermediate', 'advanced', 'elite'];
        break;
      case 'elite':
        difficulties = ['advanced', 'elite'];
        break;
    }

    // Determine appropriate categories
    let categories: TechniqueCategory[] = [];

    switch (goal) {
      case 'strength':
        categories = ['intensity', 'compound'];
        break;
      case 'hypertrophy':
        categories = ['intensity', 'time_under_tension', 'compound'];
        break;
      case 'endurance':
        categories = ['metabolic', 'time_under_tension'];
        break;
      case 'power':
        categories = ['intensity', 'compound'];
        break;
      case 'weight_loss':
        categories = ['metabolic', 'compound'];
        break;
      case 'body_recomposition':
        categories = ['intensity', 'metabolic', 'compound'];
        break;
    }

    // Get techniques that match the criteria
    const { data, error } = await supabase
      .from('advanced_techniques')
      .select('*')
      .in('difficulty', difficulties)
      .in('category', categories)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting recommended techniques:', error);
      return [];
    }

    return data.map((technique: any) => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      category: technique.category,
      difficulty: technique.difficulty,
      suitableExercises: technique.suitable_exercises,
      implementationNotes: technique.implementation_notes,
      createdAt: technique.created_at
    }));
  } catch (error) {
    console.error('Error getting recommended techniques:', error);
    return [];
  }
}
