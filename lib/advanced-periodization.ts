/**
 * Sistema de Periodización Avanzada
 * Basado en principios científicos de planificación del entrenamiento
 * Inspirado en documentos como "Planificación de entrenamiento HsP", "Aesthetic Strength INTERMEDIOS",
 * "Mesociclo Hazlo tú mismo BASQUELIFTS", entre otros.
 */

import { v4 as uuidv4 } from "uuid";

// Tipos para la periodización
export type PeriodizationType = 
  | 'linear' 
  | 'undulating' 
  | 'block' 
  | 'conjugate'
  | 'concurrent'
  | 'reverse_linear'
  | 'step_loading'
  | 'wave_loading';

export type TrainingPhase = 
  | 'anatomical_adaptation' 
  | 'hypertrophy' 
  | 'strength' 
  | 'power'
  | 'peaking'
  | 'maintenance'
  | 'deload'
  | 'recovery';

export type TrainingLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'elite';

export type TrainingGoal = 
  | 'strength' 
  | 'hypertrophy' 
  | 'endurance' 
  | 'power' 
  | 'weight_loss'
  | 'body_recomposition'
  | 'general_fitness'
  | 'sport_specific';

export type TrainingFrequency = 2 | 3 | 4 | 5 | 6 | 7;

// Interfaces para la periodización
export interface MicroCycle {
  id: string;
  name: string;
  duration: number; // En días
  volume: number; // Escala 1-10
  intensity: number; // Escala 1-10
  frequency: number; // Días de entrenamiento
  isDeload: boolean;
  fatigueAccumulation: number; // Escala 1-10
  recoveryDemand: number; // Escala 1-10
  weekNumber: number;
  phase: TrainingPhase;
  notes?: string;
}

export interface MesoCycle {
  id: string;
  name: string;
  duration: number; // En semanas
  microCycles: MicroCycle[];
  phase: TrainingPhase;
  goal: TrainingGoal;
  volumeProgression: 'ascending' | 'descending' | 'wave' | 'step' | 'constant';
  intensityProgression: 'ascending' | 'descending' | 'wave' | 'step' | 'constant';
  includesDeload: boolean;
  deloadStrategy: DeloadStrategy;
  notes?: string;
}

export interface MacroCycle {
  id: string;
  name: string;
  duration: number; // En meses
  mesoCycles: MesoCycle[];
  periodizationType: PeriodizationType;
  primaryGoal: TrainingGoal;
  secondaryGoals: TrainingGoal[];
  trainingLevel: TrainingLevel;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface DeloadStrategy {
  type: 'volume' | 'intensity' | 'frequency' | 'combined';
  volumeReduction: number; // Porcentaje (0-100)
  intensityReduction: number; // Porcentaje (0-100)
  frequencyReduction: number; // Días reducidos
  duration: number; // En días
  timing: 'planned' | 'autoregulated' | 'reactive';
  notes?: string;
}

export interface FatigueManagement {
  currentFatigue: number; // Escala 1-10
  recoveryCapacity: number; // Escala 1-10
  sleepQuality: number; // Escala 1-10
  stressLevel: number; // Escala 1-10
  muscleSoreness: Record<string, number>; // Grupo muscular -> nivel de dolor (1-10)
  performanceDecrement: number; // Porcentaje (0-100)
  readinessToTrain: number; // Escala 1-10
  recommendedAction: 'proceed' | 'reduce_volume' | 'reduce_intensity' | 'active_recovery' | 'rest';
}

// Configuraciones de periodización según nivel y objetivo
export const PERIODIZATION_CONFIGS: Record<TrainingLevel, Record<TrainingGoal, {
  recommendedType: PeriodizationType,
  mesoCycleDuration: number, // En semanas
  deloadFrequency: number, // Cada cuántas semanas
  volumeRange: [number, number], // [min, max] en sets por grupo muscular por semana
  intensityRange: [number, number], // [min, max] en % de 1RM o RPE
  frequencyRange: [number, number], // [min, max] en días por semana
  phasesSequence: TrainingPhase[]
}>> = {
  beginner: {
    strength: {
      recommendedType: 'linear',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [10, 15],
      intensityRange: [70, 85],
      frequencyRange: [3, 4],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'strength', 'deload']
    },
    hypertrophy: {
      recommendedType: 'linear',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [10, 20],
      intensityRange: [65, 80],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'hypertrophy', 'deload']
    },
    endurance: {
      recommendedType: 'linear',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [15, 25],
      intensityRange: [50, 70],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'endurance', 'endurance', 'deload']
    },
    weight_loss: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 20],
      intensityRange: [60, 75],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'endurance', 'deload']
    },
    general_fitness: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [10, 18],
      intensityRange: [60, 80],
      frequencyRange: [3, 4],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'strength', 'deload']
    }
  },
  intermediate: {
    strength: {
      recommendedType: 'block',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 18],
      intensityRange: [75, 90],
      frequencyRange: [4, 5],
      phasesSequence: ['hypertrophy', 'strength', 'strength', 'power', 'deload']
    },
    hypertrophy: {
      recommendedType: 'undulating',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [14, 22],
      intensityRange: [65, 85],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'hypertrophy', 'strength', 'hypertrophy', 'deload']
    },
    power: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [10, 16],
      intensityRange: [70, 95],
      frequencyRange: [4, 5],
      phasesSequence: ['strength', 'power', 'power', 'deload']
    },
    body_recomposition: {
      recommendedType: 'undulating',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 20],
      intensityRange: [70, 85],
      frequencyRange: [4, 5],
      phasesSequence: ['hypertrophy', 'strength', 'hypertrophy', 'strength', 'deload']
    },
    sport_specific: {
      recommendedType: 'block',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [10, 18],
      intensityRange: [70, 90],
      frequencyRange: [3, 5],
      phasesSequence: ['hypertrophy', 'strength', 'power', 'deload']
    }
  },
  advanced: {
    strength: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [12, 20],
      intensityRange: [75, 95],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'strength', 'power', 'deload']
    },
    hypertrophy: {
      recommendedType: 'undulating',
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [16, 25],
      intensityRange: [65, 85],
      frequencyRange: [5, 6],
      phasesSequence: ['hypertrophy', 'strength', 'hypertrophy', 'metabolic', 'deload']
    },
    power: {
      recommendedType: 'block',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [8, 16],
      intensityRange: [80, 97],
      frequencyRange: [4, 6],
      phasesSequence: ['strength', 'power', 'peaking', 'deload']
    },
    sport_specific: {
      recommendedType: 'block',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [10, 20],
      intensityRange: [70, 95],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'strength', 'power', 'peaking', 'deload']
    }
  },
  elite: {
    strength: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [10, 18],
      intensityRange: [80, 100],
      frequencyRange: [5, 6],
      phasesSequence: ['strength', 'power', 'peaking', 'deload']
    },
    hypertrophy: {
      recommendedType: 'undulating',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [18, 30],
      intensityRange: [65, 90],
      frequencyRange: [5, 7],
      phasesSequence: ['hypertrophy', 'strength', 'metabolic', 'deload']
    },
    power: {
      recommendedType: 'block',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [8, 15],
      intensityRange: [85, 100],
      frequencyRange: [4, 6],
      phasesSequence: ['strength', 'power', 'peaking', 'deload']
    },
    sport_specific: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [8, 20],
      intensityRange: [70, 100],
      frequencyRange: [5, 7],
      phasesSequence: ['strength', 'power', 'peaking', 'deload']
    }
  }
};

// Estrategias de deload según nivel y objetivo
export const DELOAD_STRATEGIES: Record<TrainingLevel, Record<TrainingGoal, DeloadStrategy>> = {
  beginner: {
    strength: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    hypertrophy: {
      type: 'volume',
      volumeReduction: 50,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    endurance: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    weight_loss: {
      type: 'volume',
      volumeReduction: 30,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    general_fitness: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    body_recomposition: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    power: {
      type: 'volume',
      volumeReduction: 50,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    sport_specific: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    }
  },
  intermediate: {
    strength: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    hypertrophy: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 15,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    endurance: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 1,
      duration: 7,
      timing: 'planned'
    },
    weight_loss: {
      type: 'combined',
      volumeReduction: 20,
      intensityReduction: 10,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    general_fitness: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 10,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    body_recomposition: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 15,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    power: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 25,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    }
  },
  advanced: {
    strength: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    hypertrophy: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 15,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    endurance: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 2,
      duration: 7,
      timing: 'autoregulated'
    },
    weight_loss: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 15,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    general_fitness: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 15,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    body_recomposition: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    power: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 25,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    }
  },
  elite: {
    strength: {
      type: 'combined',
      volumeReduction: 60,
      intensityReduction: 30,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    },
    hypertrophy: {
      type: 'combined',
      volumeReduction: 70,
      intensityReduction: 20,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    },
    endurance: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 3,
      duration: 7,
      timing: 'autoregulated'
    },
    weight_loss: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 20,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    },
    general_fitness: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 20,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    },
    body_recomposition: {
      type: 'combined',
      volumeReduction: 60,
      intensityReduction: 25,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    },
    power: {
      type: 'combined',
      volumeReduction: 70,
      intensityReduction: 40,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 60,
      intensityReduction: 30,
      frequencyReduction: 1,
      duration: 7,
      timing: 'autoregulated'
    }
  }
};
