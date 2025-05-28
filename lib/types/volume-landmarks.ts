// Types for volume landmarks tracking

export type MuscleGroupType = 
  | 'chest' 
  | 'back' 
  | 'legs' 
  | 'shoulders' 
  | 'arms' 
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'traps'
  | 'lats'
  | 'abs'
  | 'lower_back'
  | 'upper_back';

export interface VolumeLandmark {
  id?: string;
  user_id?: string;
  muscle_group: MuscleGroupType;
  mev: number; // Minimum Effective Volume (sets per week)
  mav: number; // Maximum Adaptive Volume (sets per week)
  mrv: number; // Maximum Recoverable Volume (sets per week)
  current_volume?: number; // Current training volume (sets per week)
  created_at?: string;
  updated_at?: string;
}

export interface VolumeLandmarkWithStatus extends VolumeLandmark {
  status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv';
  recommendation: string;
}

export interface MuscleGroupVolumeSummary {
  muscle_group: MuscleGroupType;
  display_name: string;
  current_volume: number;
  target_volume: number;
  mev: number;
  mav: number;
  mrv: number;
  status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv';
}

// Default values for volume landmarks based on training experience
export const DEFAULT_VOLUME_LANDMARKS: Record<string, Record<MuscleGroupType, Omit<VolumeLandmark, 'id' | 'user_id' | 'created_at' | 'updated_at'>>> = {
  beginner: {
    chest: { muscle_group: 'chest', mev: 8, mav: 12, mrv: 16, current_volume: 0 },
    back: { muscle_group: 'back', mev: 8, mav: 12, mrv: 16, current_volume: 0 },
    legs: { muscle_group: 'legs', mev: 8, mav: 12, mrv: 16, current_volume: 0 },
    shoulders: { muscle_group: 'shoulders', mev: 6, mav: 10, mrv: 14, current_volume: 0 },
    arms: { muscle_group: 'arms', mev: 6, mav: 10, mrv: 14, current_volume: 0 },
    core: { muscle_group: 'core', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    quads: { muscle_group: 'quads', mev: 6, mav: 10, mrv: 14, current_volume: 0 },
    hamstrings: { muscle_group: 'hamstrings', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    glutes: { muscle_group: 'glutes', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    calves: { muscle_group: 'calves', mev: 6, mav: 10, mrv: 14, current_volume: 0 },
    biceps: { muscle_group: 'biceps', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    triceps: { muscle_group: 'triceps', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    forearms: { muscle_group: 'forearms', mev: 2, mav: 4, mrv: 8, current_volume: 0 },
    traps: { muscle_group: 'traps', mev: 2, mav: 4, mrv: 8, current_volume: 0 },
    lats: { muscle_group: 'lats', mev: 6, mav: 10, mrv: 14, current_volume: 0 },
    abs: { muscle_group: 'abs', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    lower_back: { muscle_group: 'lower_back', mev: 4, mav: 6, mrv: 10, current_volume: 0 },
    upper_back: { muscle_group: 'upper_back', mev: 4, mav: 8, mrv: 12, current_volume: 0 }
  },
  intermediate: {
    chest: { muscle_group: 'chest', mev: 10, mav: 16, mrv: 22, current_volume: 0 },
    back: { muscle_group: 'back', mev: 10, mav: 16, mrv: 22, current_volume: 0 },
    legs: { muscle_group: 'legs', mev: 10, mav: 16, mrv: 22, current_volume: 0 },
    shoulders: { muscle_group: 'shoulders', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    arms: { muscle_group: 'arms', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    core: { muscle_group: 'core', mev: 6, mav: 10, mrv: 16, current_volume: 0 },
    quads: { muscle_group: 'quads', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    hamstrings: { muscle_group: 'hamstrings', mev: 6, mav: 12, mrv: 16, current_volume: 0 },
    glutes: { muscle_group: 'glutes', mev: 6, mav: 12, mrv: 16, current_volume: 0 },
    calves: { muscle_group: 'calves', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    biceps: { muscle_group: 'biceps', mev: 6, mav: 12, mrv: 16, current_volume: 0 },
    triceps: { muscle_group: 'triceps', mev: 6, mav: 12, mrv: 16, current_volume: 0 },
    forearms: { muscle_group: 'forearms', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    traps: { muscle_group: 'traps', mev: 4, mav: 8, mrv: 12, current_volume: 0 },
    lats: { muscle_group: 'lats', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    abs: { muscle_group: 'abs', mev: 6, mav: 10, mrv: 16, current_volume: 0 },
    lower_back: { muscle_group: 'lower_back', mev: 6, mav: 8, mrv: 12, current_volume: 0 },
    upper_back: { muscle_group: 'upper_back', mev: 6, mav: 12, mrv: 16, current_volume: 0 }
  },
  advanced: {
    chest: { muscle_group: 'chest', mev: 12, mav: 20, mrv: 26, current_volume: 0 },
    back: { muscle_group: 'back', mev: 12, mav: 20, mrv: 26, current_volume: 0 },
    legs: { muscle_group: 'legs', mev: 12, mav: 20, mrv: 26, current_volume: 0 },
    shoulders: { muscle_group: 'shoulders', mev: 10, mav: 18, mrv: 24, current_volume: 0 },
    arms: { muscle_group: 'arms', mev: 10, mav: 18, mrv: 24, current_volume: 0 },
    core: { muscle_group: 'core', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    quads: { muscle_group: 'quads', mev: 10, mav: 18, mrv: 24, current_volume: 0 },
    hamstrings: { muscle_group: 'hamstrings', mev: 8, mav: 16, mrv: 20, current_volume: 0 },
    glutes: { muscle_group: 'glutes', mev: 8, mav: 16, mrv: 20, current_volume: 0 },
    calves: { muscle_group: 'calves', mev: 10, mav: 18, mrv: 24, current_volume: 0 },
    biceps: { muscle_group: 'biceps', mev: 8, mav: 16, mrv: 20, current_volume: 0 },
    triceps: { muscle_group: 'triceps', mev: 8, mav: 16, mrv: 20, current_volume: 0 },
    forearms: { muscle_group: 'forearms', mev: 6, mav: 12, mrv: 16, current_volume: 0 },
    traps: { muscle_group: 'traps', mev: 6, mav: 12, mrv: 16, current_volume: 0 },
    lats: { muscle_group: 'lats', mev: 10, mav: 18, mrv: 24, current_volume: 0 },
    abs: { muscle_group: 'abs', mev: 8, mav: 14, mrv: 20, current_volume: 0 },
    lower_back: { muscle_group: 'lower_back', mev: 8, mav: 12, mrv: 16, current_volume: 0 },
    upper_back: { muscle_group: 'upper_back', mev: 8, mav: 16, mrv: 20, current_volume: 0 }
  }
};

// Mapping of muscle groups to display names
export const MUSCLE_GROUP_DISPLAY_NAMES: Record<MuscleGroupType, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
  quads: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  glutes: 'Glúteos',
  calves: 'Pantorrillas',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  traps: 'Trapecios',
  lats: 'Dorsales',
  abs: 'Abdominales',
  lower_back: 'Lumbar',
  upper_back: 'Espalda Superior'
};
