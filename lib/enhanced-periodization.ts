/**
 * Enhanced Periodization System
 * Implements advanced periodization concepts with mesocycles, deload weeks,
 * and fatigue management based on Spanish fitness resources.
 */

import { v4 as uuidv4 } from "uuid";
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";
import { getUserFatigue } from "@/lib/training-algorithm";

// Types for periodization
export type TrainingPhase = 
  | "anatomical_adaptation" 
  | "hypertrophy" 
  | "strength" 
  | "power" 
  | "deload" 
  | "maintenance" 
  | "metabolic";

export type PeriodizationType = 
  | "linear" 
  | "undulating" 
  | "block" 
  | "conjugate" 
  | "reverse_linear" 
  | "wave";

export type TrainingGoal = 
  | "strength" 
  | "hypertrophy" 
  | "endurance" 
  | "power" 
  | "weight_loss" 
  | "general_fitness";

export type TrainingLevel = 
  | "beginner" 
  | "intermediate" 
  | "advanced" 
  | "elite";

export type DeloadType = 
  | "volume" 
  | "intensity" 
  | "frequency" 
  | "combined" 
  | "none";

export type DeloadTiming = 
  | "fixed" 
  | "autoregulated" 
  | "reactive" 
  | "proactive";

export interface MicroCycle {
  id: string;
  name: string;
  weekNumber: number;
  volume: "very_low" | "low" | "moderate" | "high" | "very_high";
  intensity: "very_low" | "low" | "moderate" | "high" | "very_high";
  frequency: number; // Days per week
  isDeload: boolean;
  notes?: string;
}

export interface MesoCycle {
  id: string;
  name: string;
  duration: number; // In weeks
  microCycles: MicroCycle[];
  phase: TrainingPhase;
  goal: TrainingGoal;
  volumeProgression: "ascending" | "descending" | "wave" | "step" | "constant";
  intensityProgression: "ascending" | "descending" | "wave" | "step" | "constant";
  includesDeload: boolean;
  deloadStrategy: DeloadStrategy;
  notes?: string;
}

export interface MacroCycle {
  id: string;
  name: string;
  duration: number; // In months
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
  type: DeloadType;
  volumeReduction: number; // Percentage (0-100)
  intensityReduction: number; // Percentage (0-100)
  frequencyReduction: number; // Days reduced
  duration: number; // In days
  timing: DeloadTiming;
}

// Configurations for periodization based on level and goal
export const PERIODIZATION_CONFIGS: Record<TrainingLevel, Record<TrainingGoal, {
  recommendedType: PeriodizationType,
  mesoCycleDuration: number, // In weeks
  deloadFrequency: number, // Every X weeks
  volumeRange: [number, number], // [min, max] in sets per muscle group per week
  intensityRange: [number, number], // [min, max] in % of 1RM or RPE
  frequencyRange: [number, number], // [min, max] in days per week
  phasesSequence: TrainingPhase[],
  recommendedDeloadType: DeloadType,
  autoRegulationStrategy: "none" | "fatigue_based" | "performance_based" | "combined",
  fatigueManagementThreshold: number, // 0-10 scale
  rirRange?: [number, number], // [min, max] RIR (Reps In Reserve)
  rpeRange?: [number, number], // [min, max] RPE (Rate of Perceived Exertion)
  tempoRecommendations?: Record<TrainingPhase, string>,
  restRecommendations?: Record<TrainingPhase, [number, number]> // [min, max] in seconds
}>> = {
  beginner: {
    strength: {
      recommendedType: "linear",
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [10, 15],
      intensityRange: [70, 85],
      frequencyRange: [3, 4],
      phasesSequence: ["anatomical_adaptation", "hypertrophy", "strength", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "none",
      fatigueManagementThreshold: 8.0,
      rirRange: [2, 4],
      rpeRange: [6, 8]
    },
    hypertrophy: {
      recommendedType: "linear",
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [10, 20],
      intensityRange: [65, 80],
      frequencyRange: [3, 5],
      phasesSequence: ["anatomical_adaptation", "hypertrophy", "metabolic", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "none",
      fatigueManagementThreshold: 8.0,
      rirRange: [1, 3],
      rpeRange: [7, 9]
    },
    endurance: {
      recommendedType: "linear",
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [15, 25],
      intensityRange: [50, 70],
      frequencyRange: [3, 5],
      phasesSequence: ["anatomical_adaptation", "endurance", "metabolic", "deload"],
      recommendedDeloadType: "frequency",
      autoRegulationStrategy: "none",
      fatigueManagementThreshold: 8.0,
      rirRange: [2, 4],
      rpeRange: [6, 8]
    },
    power: {
      recommendedType: "linear",
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [8, 12],
      intensityRange: [70, 85],
      frequencyRange: [3, 4],
      phasesSequence: ["anatomical_adaptation", "strength", "power", "deload"],
      recommendedDeloadType: "intensity",
      autoRegulationStrategy: "none",
      fatigueManagementThreshold: 8.0,
      rirRange: [2, 4],
      rpeRange: [6, 8]
    },
    weight_loss: {
      recommendedType: "linear",
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 20],
      intensityRange: [60, 75],
      frequencyRange: [3, 5],
      phasesSequence: ["anatomical_adaptation", "metabolic", "hypertrophy", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "none",
      fatigueManagementThreshold: 8.0,
      rirRange: [1, 3],
      rpeRange: [7, 9]
    },
    general_fitness: {
      recommendedType: "undulating",
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [10, 18],
      intensityRange: [60, 80],
      frequencyRange: [3, 5],
      phasesSequence: ["anatomical_adaptation", "hypertrophy", "endurance", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "none",
      fatigueManagementThreshold: 8.0,
      rirRange: [2, 4],
      rpeRange: [6, 8]
    }
  },
  intermediate: {
    strength: {
      recommendedType: "block",
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 18],
      intensityRange: [75, 90],
      frequencyRange: [4, 5],
      phasesSequence: ["hypertrophy", "strength", "power", "deload"],
      recommendedDeloadType: "intensity",
      autoRegulationStrategy: "fatigue_based",
      fatigueManagementThreshold: 7.5,
      rirRange: [1, 3],
      rpeRange: [7, 9],
      tempoRecommendations: {
        hypertrophy: "3-0-1-0", // 3s eccentric, 0s bottom, 1s concentric, 0s top
        strength: "2-0-X-0", // 2s eccentric, 0s bottom, explosive concentric, 0s top
        power: "1-0-X-0", // 1s eccentric, 0s bottom, explosive concentric, 0s top
        deload: "2-0-2-0", // Controlled tempo during deload
        anatomical_adaptation: "2-0-2-0",
        maintenance: "2-0-2-0",
        metabolic: "1-0-1-0"
      },
      restRecommendations: {
        hypertrophy: [90, 150],
        strength: [150, 240],
        power: [180, 300],
        deload: [120, 180],
        anatomical_adaptation: [60, 90],
        maintenance: [90, 150],
        metabolic: [30, 60]
      }
    },
    hypertrophy: {
      recommendedType: "undulating",
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [14, 22],
      intensityRange: [65, 85],
      frequencyRange: [4, 6],
      phasesSequence: ["hypertrophy", "metabolic", "strength", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "fatigue_based",
      fatigueManagementThreshold: 7.5,
      rirRange: [1, 3],
      rpeRange: [7, 9],
      tempoRecommendations: {
        hypertrophy: "3-0-2-0", // Slower tempo for hypertrophy
        strength: "2-0-1-0",
        power: "1-0-X-0",
        deload: "2-0-2-0",
        anatomical_adaptation: "2-0-2-0",
        maintenance: "2-0-2-0",
        metabolic: "1-0-1-0"
      },
      restRecommendations: {
        hypertrophy: [60, 120],
        strength: [120, 180],
        power: [150, 240],
        deload: [90, 150],
        anatomical_adaptation: [60, 90],
        maintenance: [90, 120],
        metabolic: [30, 60]
      }
    },
    endurance: {
      recommendedType: "wave",
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [18, 30],
      intensityRange: [55, 75],
      frequencyRange: [4, 6],
      phasesSequence: ["hypertrophy", "metabolic", "endurance", "deload"],
      recommendedDeloadType: "frequency",
      autoRegulationStrategy: "fatigue_based",
      fatigueManagementThreshold: 7.5,
      rirRange: [1, 3],
      rpeRange: [7, 9]
    },
    power: {
      recommendedType: "conjugate",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [10, 16],
      intensityRange: [75, 90],
      frequencyRange: [4, 5],
      phasesSequence: ["strength", "power", "strength", "deload"],
      recommendedDeloadType: "intensity",
      autoRegulationStrategy: "performance_based",
      fatigueManagementThreshold: 7.0,
      rirRange: [1, 3],
      rpeRange: [7, 9]
    },
    weight_loss: {
      recommendedType: "undulating",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [16, 24],
      intensityRange: [60, 80],
      frequencyRange: [4, 6],
      phasesSequence: ["metabolic", "hypertrophy", "metabolic", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "fatigue_based",
      fatigueManagementThreshold: 7.5,
      rirRange: [1, 3],
      rpeRange: [7, 9]
    },
    general_fitness: {
      recommendedType: "undulating",
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [12, 20],
      intensityRange: [65, 85],
      frequencyRange: [4, 5],
      phasesSequence: ["hypertrophy", "strength", "metabolic", "hypertrophy", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "fatigue_based",
      fatigueManagementThreshold: 7.5,
      rirRange: [1, 3],
      rpeRange: [7, 9]
    }
  },
  advanced: {
    strength: {
      recommendedType: "conjugate",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [12, 20],
      intensityRange: [75, 95],
      frequencyRange: [4, 6],
      phasesSequence: ["hypertrophy", "strength", "power", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 7.0,
      rirRange: [0, 2],
      rpeRange: [8, 10],
      tempoRecommendations: {
        hypertrophy: "3-0-1-0", // 3s eccentric, 0s bottom, 1s concentric, 0s top
        strength: "2-1-X-0", // 2s eccentric, 1s bottom, explosive concentric, 0s top
        power: "1-0-X-0", // 1s eccentric, 0s bottom, explosive concentric, 0s top
        deload: "2-0-2-0", // Controlled tempo during deload
        anatomical_adaptation: "2-0-2-0",
        maintenance: "2-0-2-0",
        metabolic: "1-0-1-0"
      },
      restRecommendations: {
        hypertrophy: [90, 180],
        strength: [180, 300],
        power: [180, 300],
        deload: [120, 180],
        anatomical_adaptation: [60, 90],
        maintenance: [90, 150],
        metabolic: [30, 60]
      }
    },
    hypertrophy: {
      recommendedType: "undulating",
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [16, 25],
      intensityRange: [65, 85],
      frequencyRange: [5, 6],
      phasesSequence: ["hypertrophy", "strength", "hypertrophy", "metabolic", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 7.0,
      rirRange: [0, 2],
      rpeRange: [8, 10]
    },
    endurance: {
      recommendedType: "block",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [20, 35],
      intensityRange: [55, 75],
      frequencyRange: [5, 7],
      phasesSequence: ["hypertrophy", "metabolic", "endurance", "deload"],
      recommendedDeloadType: "frequency",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 7.0,
      rirRange: [0, 2],
      rpeRange: [8, 10]
    },
    power: {
      recommendedType: "block",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [8, 16],
      intensityRange: [80, 97],
      frequencyRange: [4, 6],
      phasesSequence: ["strength", "power", "peaking", "deload"],
      recommendedDeloadType: "intensity",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 7.0,
      rirRange: [0, 2],
      rpeRange: [8, 10]
    },
    weight_loss: {
      recommendedType: "undulating",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [18, 28],
      intensityRange: [65, 85],
      frequencyRange: [5, 7],
      phasesSequence: ["metabolic", "hypertrophy", "metabolic", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 7.0,
      rirRange: [0, 2],
      rpeRange: [8, 10]
    },
    general_fitness: {
      recommendedType: "conjugate",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [14, 24],
      intensityRange: [70, 90],
      frequencyRange: [5, 6],
      phasesSequence: ["hypertrophy", "strength", "metabolic", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 7.0,
      rirRange: [0, 2],
      rpeRange: [8, 10]
    }
  },
  elite: {
    // Similar to advanced but with more specialized parameters
    strength: {
      recommendedType: "conjugate",
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [10, 18],
      intensityRange: [80, 100],
      frequencyRange: [5, 7],
      phasesSequence: ["strength", "power", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 6.5,
      rirRange: [0, 1],
      rpeRange: [9, 10]
    },
    hypertrophy: {
      recommendedType: "undulating",
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [18, 30],
      intensityRange: [70, 90],
      frequencyRange: [5, 7],
      phasesSequence: ["hypertrophy", "strength", "metabolic", "deload"],
      recommendedDeloadType: "volume",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 6.5,
      rirRange: [0, 1],
      rpeRange: [9, 10]
    },
    endurance: {
      recommendedType: "block",
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [25, 40],
      intensityRange: [60, 80],
      frequencyRange: [6, 7],
      phasesSequence: ["metabolic", "endurance", "deload"],
      recommendedDeloadType: "frequency",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 6.5,
      rirRange: [0, 1],
      rpeRange: [9, 10]
    },
    power: {
      recommendedType: "block",
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [6, 14],
      intensityRange: [85, 100],
      frequencyRange: [5, 6],
      phasesSequence: ["power", "peaking", "deload"],
      recommendedDeloadType: "intensity",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 6.5,
      rirRange: [0, 1],
      rpeRange: [9, 10]
    },
    weight_loss: {
      recommendedType: "undulating",
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [20, 30],
      intensityRange: [70, 90],
      frequencyRange: [6, 7],
      phasesSequence: ["metabolic", "hypertrophy", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 6.5,
      rirRange: [0, 1],
      rpeRange: [9, 10]
    },
    general_fitness: {
      recommendedType: "conjugate",
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [16, 26],
      intensityRange: [75, 95],
      frequencyRange: [5, 7],
      phasesSequence: ["hypertrophy", "strength", "deload"],
      recommendedDeloadType: "combined",
      autoRegulationStrategy: "combined",
      fatigueManagementThreshold: 6.5,
      rirRange: [0, 1],
      rpeRange: [9, 10]
    }
  }
};
