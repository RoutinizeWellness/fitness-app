/**
 * Spanish Training Science - Principios avanzados de entrenamiento basados en recursos españoles
 * Implementa conceptos de periodización, técnicas avanzadas y planificación a largo plazo
 */

import { TrainingLevel, TrainingGoal, MuscleGroup, ExerciseType } from './bodybuilding-science';

// Tipos específicos para la periodización avanzada
export type MesocycleType = 'volumen' | 'fuerza' | 'definicion' | 'potencia' | 'recuperacion';
export type TrainingPhaseAdvanced = 'adaptacion_anatomica' | 'hipertrofia' | 'fuerza' | 'potencia' | 'definicion' | 'descarga';
export type TrainingSpecialization = 'full_body' | 'upper_body' | 'lower_body' | 'push' | 'pull' | 'specific_muscle';

// Interfaz para técnicas avanzadas específicas
export interface AdvancedSpanishTechnique {
  name: string;
  description: string;
  implementation: string;
  recommendedPhase: TrainingPhaseAdvanced[];
  fatigueImpact: number; // 1-10
  muscleGrowthPotential: number; // 1-10
  strengthGainPotential: number; // 1-10
  recommendedFrequency: string; // Ej: "1 vez por semana por grupo muscular"
}

// Interfaz para configuración de mesociclos
export interface MesocycleConfig {
  type: MesocycleType;
  duration: number; // En semanas
  volumeMultiplier: number; // Multiplicador de volumen base
  intensityRange: [number, number]; // Rango de intensidad (% de 1RM o RPE)
  repRanges: [number, number]; // Rango de repeticiones
  rirRange: [number, number]; // Rango de RIR (Reps in Reserve)
  recommendedTechniques: string[]; // Nombres de técnicas recomendadas
  deloadRequired: boolean; // Si requiere descarga después
  description: string;
}

// Configuración de mesociclos según recursos españoles
export const SPANISH_MESOCYCLE_CONFIGS: MesocycleConfig[] = [
  {
    type: 'volumen',
    duration: 6,
    volumeMultiplier: 1.2,
    intensityRange: [65, 75],
    repRanges: [8, 15],
    rirRange: [1, 3],
    recommendedTechniques: ['Series Mecánicas', 'Super Sets', 'Drop Sets', 'Pre-fatiga'],
    deloadRequired: true,
    description: 'Fase de acumulación de volumen para maximizar la hipertrofia. Alta frecuencia y volumen.'
  },
  {
    type: 'fuerza',
    duration: 4,
    volumeMultiplier: 0.8,
    intensityRange: [80, 90],
    repRanges: [3, 6],
    rirRange: [1, 2],
    recommendedTechniques: ['Cluster Sets', 'Rest-Pause', 'Isometría'],
    deloadRequired: true,
    description: 'Fase de intensificación para maximizar la fuerza. Menor volumen, mayor intensidad.'
  },
  {
    type: 'definicion',
    duration: 4,
    volumeMultiplier: 1.0,
    intensityRange: [70, 80],
    repRanges: [10, 15],
    rirRange: [0, 2],
    recommendedTechniques: ['Super Sets', 'Giant Sets', 'Drop Sets', 'Repeticiones Parciales'],
    deloadRequired: true,
    description: 'Fase de definición muscular. Densidad alta, descansos cortos, técnicas intensificadoras.'
  },
  {
    type: 'potencia',
    duration: 3,
    volumeMultiplier: 0.6,
    intensityRange: [75, 85],
    repRanges: [2, 5],
    rirRange: [2, 3],
    recommendedTechniques: ['Cluster Sets', 'Tempo Training'],
    deloadRequired: true,
    description: 'Fase de desarrollo de potencia. Enfoque en velocidad de ejecución y explosividad.'
  },
  {
    type: 'recuperacion',
    duration: 1,
    volumeMultiplier: 0.5,
    intensityRange: [60, 70],
    repRanges: [10, 15],
    rirRange: [3, 4],
    recommendedTechniques: [],
    deloadRequired: false,
    description: 'Fase de descarga para facilitar la recuperación. Volumen e intensidad reducidos.'
  }
];

// Técnicas avanzadas específicas de los recursos españoles
export const SPANISH_ADVANCED_TECHNIQUES: AdvancedSpanishTechnique[] = [
  {
    name: 'Series Compuestas Antagonistas',
    description: 'Alternar ejercicios para músculos antagonistas (ej: bíceps y tríceps) con descanso mínimo',
    implementation: 'Realizar una serie de curl de bíceps seguida inmediatamente de una serie de extensiones de tríceps',
    recommendedPhase: ['hipertrofia', 'definicion'],
    fatigueImpact: 6,
    muscleGrowthPotential: 8,
    strengthGainPotential: 5,
    recommendedFrequency: "2-3 veces por semana"
  },
  {
    name: 'Series Descendentes-Ascendentes',
    description: 'Combinar series descendentes (reducir peso) con series ascendentes (aumentar peso) en el mismo ejercicio',
    implementation: 'Comenzar con peso alto (6 reps), reducir peso (8 reps), reducir más (10 reps), luego aumentar peso (8 reps), aumentar más (6 reps)',
    recommendedPhase: ['hipertrofia', 'fuerza'],
    fatigueImpact: 9,
    muscleGrowthPotential: 9,
    strengthGainPotential: 7,
    recommendedFrequency: "1 vez por semana por grupo muscular"
  },
  {
    name: 'Entrenamiento 3/7',
    description: 'Método que combina series de 3 y 7 repeticiones con descansos mínimos',
    implementation: 'Realizar 5 mini-series de 3 repeticiones con 15s de descanso, seguidas de 1 serie de 7 repeticiones',
    recommendedPhase: ['fuerza', 'hipertrofia'],
    fatigueImpact: 8,
    muscleGrowthPotential: 8,
    strengthGainPotential: 9,
    recommendedFrequency: "1-2 veces por semana por ejercicio"
  },
  {
    name: 'Series Gigantes Específicas',
    description: 'Realizar 4-5 ejercicios consecutivos para el mismo grupo muscular atacando diferentes ángulos',
    implementation: 'Para pecho: Press banca plano → Press inclinado → Aperturas → Fondos → Pullover',
    recommendedPhase: ['hipertrofia', 'definicion'],
    fatigueImpact: 10,
    muscleGrowthPotential: 10,
    strengthGainPotential: 4,
    recommendedFrequency: "1 vez por semana por grupo muscular"
  },
  {
    name: 'Método Holístico',
    description: 'Combinar ejercicios compuestos con aislamiento y técnicas de intensidad en una secuencia específica',
    implementation: 'Ejercicio compuesto pesado → Ejercicio compuesto medio → Aislamiento con drop set → Aislamiento con isometría',
    recommendedPhase: ['hipertrofia'],
    fatigueImpact: 9,
    muscleGrowthPotential: 10,
    strengthGainPotential: 7,
    recommendedFrequency: "1 vez por semana por grupo muscular"
  },
  // Nuevas técnicas de Hipertrofia Maxima Bazman Science 2
  {
    name: 'Entrenamiento de Densidad Progresiva',
    description: 'Realizar un número fijo de repeticiones en el menor tiempo posible, aumentando la densidad progresivamente',
    implementation: 'Completar 50-100 repeticiones de un ejercicio en el menor tiempo posible, reduciendo descansos cada semana',
    recommendedPhase: ['hipertrofia', 'definicion'],
    fatigueImpact: 8,
    muscleGrowthPotential: 7,
    strengthGainPotential: 5,
    recommendedFrequency: "1 vez por semana por grupo muscular"
  },
  {
    name: 'Método de Fatiga Selectiva',
    description: 'Pre-fatigar un músculo específico antes de un ejercicio compuesto para enfocarse en ese músculo',
    implementation: 'Realizar extensiones de cuádriceps antes de sentadillas para enfocar más el trabajo en cuádriceps',
    recommendedPhase: ['hipertrofia'],
    fatigueImpact: 7,
    muscleGrowthPotential: 9,
    strengthGainPotential: 4,
    recommendedFrequency: "1-2 veces por semana"
  },
  {
    name: 'Entrenamiento de Oclusión Controlada',
    description: 'Restricción parcial del flujo sanguíneo durante ejercicios con pesos ligeros para maximizar la hipertrofia',
    implementation: 'Usar bandas elásticas en la parte proximal de extremidades con 20-30% de 1RM y 15-30 repeticiones',
    recommendedPhase: ['hipertrofia', 'recuperacion'],
    fatigueImpact: 6,
    muscleGrowthPotential: 8,
    strengthGainPotential: 3,
    recommendedFrequency: "1-2 veces por semana"
  },
  // Técnicas de Pure Bodybuilding Phase 2
  {
    name: 'Series Mecánicas Compuestas',
    description: 'Combinar diferentes variantes mecánicas del mismo ejercicio en una sola serie',
    implementation: 'Press banca con pausa → Press banca normal → Press banca con rebote controlado, todo en la misma serie',
    recommendedPhase: ['hipertrofia', 'fuerza'],
    fatigueImpact: 9,
    muscleGrowthPotential: 9,
    strengthGainPotential: 8,
    recommendedFrequency: "1 vez por semana por ejercicio"
  },
  {
    name: 'Método de Contracción Máxima',
    description: 'Enfocarse en la contracción máxima del músculo con pausas isométricas en el punto de mayor tensión',
    implementation: 'Realizar curl de bíceps con pausa de 2-3 segundos en la contracción máxima en cada repetición',
    recommendedPhase: ['hipertrofia'],
    fatigueImpact: 7,
    muscleGrowthPotential: 10,
    strengthGainPotential: 5,
    recommendedFrequency: "2 veces por semana"
  },
  {
    name: 'Entrenamiento de Rango Parcial Extendido',
    description: 'Combinar repeticiones de rango completo con repeticiones parciales en diferentes rangos de movimiento',
    implementation: '8 repeticiones completas + 8 repeticiones en rango superior + 8 repeticiones en rango inferior',
    recommendedPhase: ['hipertrofia', 'fuerza'],
    fatigueImpact: 8,
    muscleGrowthPotential: 9,
    strengthGainPotential: 7,
    recommendedFrequency: "1 vez por semana por grupo muscular"
  }
];

// Configuración de periodización a largo plazo
export interface LongTermPeriodizationConfig {
  name: string;
  description: string;
  duration: number; // En semanas
  phases: {
    type: MesocycleType;
    duration: number; // En semanas
  }[];
  recommendedLevel: TrainingLevel[];
  recommendedGoal: TrainingGoal[];
  includesDeload: boolean;
}

// Modelos de periodización a largo plazo
export const LONG_TERM_PERIODIZATION_MODELS: LongTermPeriodizationConfig[] = [
  {
    name: 'Ciclo Hipertrofia-Fuerza',
    description: 'Ciclo de 12 semanas enfocado en construir masa muscular y luego fuerza',
    duration: 12,
    phases: [
      { type: 'volumen', duration: 6 },
      { type: 'recuperacion', duration: 1 },
      { type: 'fuerza', duration: 4 },
      { type: 'recuperacion', duration: 1 }
    ],
    recommendedLevel: ['intermediate', 'advanced'],
    recommendedGoal: ['hypertrophy', 'strength'],
    includesDeload: true
  },
  {
    name: 'Ciclo Completo de Transformación',
    description: 'Ciclo completo de 16 semanas para transformación física total',
    duration: 16,
    phases: [
      { type: 'volumen', duration: 6 },
      { type: 'recuperacion', duration: 1 },
      { type: 'fuerza', duration: 4 },
      { type: 'recuperacion', duration: 1 },
      { type: 'definicion', duration: 3 },
      { type: 'recuperacion', duration: 1 }
    ],
    recommendedLevel: ['intermediate', 'advanced'],
    recommendedGoal: ['hypertrophy', 'strength', 'weight_loss'],
    includesDeload: true
  },
  // Nuevos modelos basados en Hipertrofia Maxima Bazman Science 2
  {
    name: 'Hipertrofia Máxima Bazman',
    description: 'Ciclo avanzado de 16 semanas basado en Hipertrofia Maxima Bazman Science 2 con énfasis en técnicas avanzadas',
    duration: 16,
    phases: [
      { type: 'volumen', duration: 5 },
      { type: 'recuperacion', duration: 1 },
      { type: 'volumen', duration: 4 },
      { type: 'recuperacion', duration: 1 },
      { type: 'fuerza', duration: 4 },
      { type: 'recuperacion', duration: 1 }
    ],
    recommendedLevel: ['advanced'],
    recommendedGoal: ['hypertrophy'],
    includesDeload: true
  },
  // Modelo basado en Pure Bodybuilding Phase 2
  {
    name: 'Pure Bodybuilding PPL',
    description: 'Ciclo de 20 semanas basado en Pure Bodybuilding Phase 2 con estructura PPL y periodización por bloques',
    duration: 20,
    phases: [
      { type: 'volumen', duration: 6 },
      { type: 'recuperacion', duration: 1 },
      { type: 'fuerza', duration: 5 },
      { type: 'recuperacion', duration: 1 },
      { type: 'volumen', duration: 3 },
      { type: 'recuperacion', duration: 1 },
      { type: 'definicion', duration: 2 },
      { type: 'recuperacion', duration: 1 }
    ],
    recommendedLevel: ['advanced'],
    recommendedGoal: ['hypertrophy', 'strength'],
    includesDeload: true
  },
  // Modelo de periodización ondulante avanzada
  {
    name: 'Periodización Ondulante Avanzada',
    description: 'Ciclo de 12 semanas con variación diaria de volumen e intensidad para maximizar ganancias y prevenir estancamientos',
    duration: 12,
    phases: [
      // Cada fase combina diferentes tipos de entrenamiento en la misma semana
      { type: 'volumen', duration: 3 },
      { type: 'recuperacion', duration: 1 },
      { type: 'fuerza', duration: 3 },
      { type: 'recuperacion', duration: 1 },
      { type: 'potencia', duration: 3 },
      { type: 'recuperacion', duration: 1 }
    ],
    recommendedLevel: ['advanced'],
    recommendedGoal: ['hypertrophy', 'strength', 'power'],
    includesDeload: true
  }
];

/**
 * Obtiene la configuración de mesociclo recomendada
 */
export function getRecommendedMesocycle(
  goal: TrainingGoal,
  level: TrainingLevel,
  currentPhase?: MesocycleType
): MesocycleConfig {
  // Si no hay fase actual, recomendar según objetivo
  if (!currentPhase) {
    switch (goal) {
      case 'hypertrophy':
        return SPANISH_MESOCYCLE_CONFIGS.find(config => config.type === 'volumen') || SPANISH_MESOCYCLE_CONFIGS[0];
      case 'strength':
        return SPANISH_MESOCYCLE_CONFIGS.find(config => config.type === 'fuerza') || SPANISH_MESOCYCLE_CONFIGS[1];
      case 'weight_loss':
        return SPANISH_MESOCYCLE_CONFIGS.find(config => config.type === 'definicion') || SPANISH_MESOCYCLE_CONFIGS[2];
      case 'power':
        return SPANISH_MESOCYCLE_CONFIGS.find(config => config.type === 'potencia') || SPANISH_MESOCYCLE_CONFIGS[3];
      default:
        return SPANISH_MESOCYCLE_CONFIGS[0];
    }
  }

  // Si hay fase actual, recomendar la siguiente en la secuencia
  const nextPhaseMap: Record<MesocycleType, MesocycleType> = {
    'volumen': 'fuerza',
    'fuerza': 'definicion',
    'definicion': 'recuperacion',
    'potencia': 'recuperacion',
    'recuperacion': 'volumen'
  };

  const nextPhase = nextPhaseMap[currentPhase];
  return SPANISH_MESOCYCLE_CONFIGS.find(config => config.type === nextPhase) || SPANISH_MESOCYCLE_CONFIGS[0];
}

/**
 * Obtiene un modelo de periodización a largo plazo recomendado
 */
export function getRecommendedLongTermPlan(
  goal: TrainingGoal,
  level: TrainingLevel
): LongTermPeriodizationConfig {
  // Filtrar planes que coincidan con el nivel y objetivo
  const matchingPlans = LONG_TERM_PERIODIZATION_MODELS.filter(
    plan => plan.recommendedLevel.includes(level) && plan.recommendedGoal.includes(goal)
  );

  return matchingPlans.length > 0 ? matchingPlans[0] : LONG_TERM_PERIODIZATION_MODELS[0];
}
