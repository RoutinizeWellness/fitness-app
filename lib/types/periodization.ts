/**
 * Types for the periodization and fatigue management system
 * Based on Spanish fitness resources for advanced training periodization
 * Including concepts from:
 * - Planificación de entrenamiento HsP
 * - Aesthetic Strength INTERMEDIOS
 * - Grande y Fuerte PBO Team Trinidad
 * - Progresa Con ENFAF
 * - Mesociclo Hazlo tú mismo BASQUELIFTS
 */

// Periodization types
export type PeriodizationType =
  | 'linear'
  | 'undulating'
  | 'block'
  | 'conjugate'
  | 'concurrent'
  | 'reverse_linear'
  | 'step_loading'
  | 'wave_loading'
  | 'double_progression'
  | 'triple_progression'
  | 'high_frequency'
  | 'high_intensity'
  | 'high_volume'
  | 'specialization'
  | 'pbo_method'; // PBO Team Trinidad method

export type TrainingPhase =
  | 'anatomical_adaptation'
  | 'hypertrophy'
  | 'strength'
  | 'power'
  | 'peaking'
  | 'maintenance'
  | 'deload'
  | 'recovery'
  | 'accumulation'
  | 'intensification'
  | 'realization'
  | 'volume_phase'
  | 'intensity_phase'
  | 'technique_phase'
  | 'metabolic_phase'
  | 'specialization_phase';

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
  | 'sport_specific'
  | 'aesthetic'
  | 'functional'
  | 'powerbuilding'
  | 'crosstraining';

export type CycleType = 'mesocycle' | 'macrocycle' | 'microcycle';

export type DeloadType =
  | 'volume'
  | 'intensity'
  | 'frequency'
  | 'combined'
  | 'active_recovery'
  | 'total_rest'
  | 'light_technique'
  | 'contrast_method'
  | 'strategic_deload';

export type DeloadTiming =
  | 'planned'
  | 'autoregulated'
  | 'reactive'
  | 'fatigue_based'
  | 'performance_based'
  | 'biomarker_based'
  | 'subjective_based';

// Interfaces for periodization
export interface PeriodizationPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  type: PeriodizationType;
  level: TrainingLevel;
  goal: TrainingGoal;
  frequency: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cycles?: TrainingCycle[];
  // New fields from Spanish resources
  initialAssessment?: {
    strengthBaseline?: Record<string, number>; // Exercise -> weight
    enduranceBaseline?: Record<string, number>; // Exercise -> reps
    bodyComposition?: {
      weight: number;
      bodyFat?: number;
      measurements?: Record<string, number>; // Body part -> measurement in cm
    };
    limitingFactors?: string[];
    technicalProficiency?: Record<string, number>; // Exercise -> score (1-10)
  };
  progressionModel?: {
    volumeProgressionRate: number; // % increase per cycle
    intensityProgressionRate: number; // % increase per cycle
    deloadStrategy: DeloadType;
    autoRegulated: boolean;
    fatigueManagementThreshold: number; // Fatigue score that triggers intervention
  };
  specialTechniques?: string[]; // Advanced techniques to incorporate
  nutritionStrategy?: {
    calorieAdjustment: 'surplus' | 'maintenance' | 'deficit';
    proteinTarget: number; // g/kg of bodyweight
    carbStrategy: 'cycling' | 'constant' | 'periodized';
    supplementation?: string[];
  };
}

export interface TrainingCycle {
  id: string;
  planId: string;
  name: string;
  description?: string;
  cycleType: CycleType;
  phase: TrainingPhase;
  startDate?: string;
  endDate?: string;
  duration: number; // In days
  volume: number; // Scale 1-10
  intensity: number; // Scale 1-10
  frequency: number; // Days per week
  isDeload: boolean;
  weekNumber?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // New fields from Spanish resources
  primaryFocus?: string[]; // Main muscle groups or fitness components
  secondaryFocus?: string[]; // Secondary muscle groups or fitness components
  techniqueEmphasis?: string[]; // Specific techniques to emphasize
  rpeRange?: [number, number]; // Min and max RPE for this cycle
  rirRange?: [number, number]; // Min and max RIR for this cycle
  tempoGuidelines?: string; // Recommended tempo for exercises (e.g., "3-1-2-0")
  restGuidelines?: {
    compound: [number, number]; // Min and max rest for compound exercises (seconds)
    isolation: [number, number]; // Min and max rest for isolation exercises (seconds)
  };
  volumeDistribution?: Record<string, number>; // Muscle group -> % of total volume
  progressionStrategy?: string; // How to progress during this cycle
  deloadStrategy?: DeloadType; // Specific deload strategy for this cycle
  adaptationMarkers?: string[]; // What to look for to confirm adaptation
  exerciseRotation?: 'fixed' | 'rotating' | 'undulating'; // Exercise selection strategy
}

export interface DeloadWeek {
  id: string;
  userId: string;
  planId?: string;
  cycleId?: string;
  startDate?: string;
  endDate?: string;
  type: DeloadType;
  volumeReduction: number; // Percentage (0-100)
  intensityReduction: number; // Percentage (0-100)
  frequencyReduction: number; // Days reduced
  timing: DeloadTiming;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // New fields from Spanish resources
  fatigueScoreBefore?: number; // Fatigue score that triggered deload
  recoveryActivities?: string[]; // Specific recovery activities to perform
  nutritionAdjustments?: {
    calorieChange?: number; // % change from normal
    carbChange?: number; // % change from normal
    proteinChange?: number; // % change from normal
    fatChange?: number; // % change from normal
    hydrationFocus?: boolean;
  };
  sleepFocus?: boolean; // Whether to prioritize sleep during deload
  stressManagementActivities?: string[]; // Stress reduction techniques
  techniqueFocus?: boolean; // Whether to focus on technique during deload
  mobilityWork?: boolean; // Whether to emphasize mobility work
  expectedOutcome?: string; // What to expect after deload
}

// Interfaces for fatigue tracking
export interface FatigueTracking {
  id: string;
  userId: string;
  date: string;
  overallFatigue: number; // Scale 1-10
  muscleGroupFatigue?: Record<string, number>; // Map of muscle groups to fatigue levels
  rpeIncrease?: number; // Increase in RPE for same weight (0-10)
  strengthDecrease?: number; // Percentage decrease in strength (0-100)
  soreness?: number; // Scale 1-10
  sleepQuality?: number; // Scale 1-10
  motivation?: number; // Scale 1-10
  restingHeartRate?: number; // BPM
  moodScore?: number; // Scale 1-10
  stressScore?: number; // Scale 1-10
  appetiteChanges?: number; // Scale -5 to 5
  technicalProficiency?: number; // Scale 1-10
  notes?: string;
  createdAt: string;
  // New fields from Spanish resources
  perceivedRecovery?: number; // Scale 1-10
  energyLevel?: number; // Scale 1-10
  jointPain?: Record<string, number>; // Joint -> pain level (1-10)
  performanceMetrics?: {
    strengthPerformance?: number; // % of baseline (80-120%)
    endurancePerformance?: number; // % of baseline (80-120%)
    explosivePerformance?: number; // % of baseline (80-120%)
    technicalPerformance?: number; // % of baseline (80-120%)
  };
  biomarkers?: {
    hrv?: number; // Heart Rate Variability
    cortisol?: number; // Cortisol level if measured
    testosteroneCortisol?: number; // T:C ratio if measured
    inflammationMarkers?: number; // General inflammation level
    ck?: number; // Creatine Kinase level if measured
  };
  readinessScore?: number; // Overall readiness to train (1-10)
  fatigueSource?: 'physical' | 'mental' | 'emotional' | 'combined';
  recoveryStrategiesUsed?: string[]; // Recovery methods used
  nutritionCompliance?: number; // Scale 1-10
  hydrationStatus?: number; // Scale 1-10
  recommendedAction?: 'proceed' | 'modify' | 'deload' | 'rest';
}

// Advanced training techniques
export type TechniqueCategory =
  | 'intensity'
  | 'volume'
  | 'metabolic'
  | 'time_under_tension'
  | 'compound'
  | 'mechanical_tension'
  | 'metabolic_stress'
  | 'muscle_damage'
  | 'neurological'
  | 'recovery_optimization'
  | 'mind_muscle_connection'
  | 'progressive_overload';

export interface AdvancedTechnique {
  id: string;
  name: string;
  description?: string;
  category: TechniqueCategory;
  difficulty: 'intermediate' | 'advanced' | 'elite';
  suitableExercises?: string[]; // Array of exercise types this technique can be applied to
  implementationNotes?: string;
  createdAt: string;
  // New fields from Spanish resources
  primaryMechanism?: 'tension' | 'metabolic' | 'damage' | 'neural' | 'hormonal';
  secondaryMechanisms?: string[];
  fatigueImpact?: number; // Scale 1-10
  recoveryRequirement?: number; // Scale 1-10
  effectiveReps?: number; // Number of effective reps this technique adds
  hormoneResponse?: {
    testosterone?: number; // Scale 1-10
    growthHormone?: number; // Scale 1-10
    igf1?: number; // Scale 1-10
  };
  recommendedFrequency?: string; // How often to use (e.g., "1-2 times per week")
  contraindicatedFor?: string[]; // Conditions or situations where this shouldn't be used
  scientificEvidence?: 'strong' | 'moderate' | 'limited' | 'anecdotal';
  setupInstructions?: string;
  executionTips?: string[];
  commonMistakes?: string[];
  progressionModel?: string;
  deloadConsiderations?: string;
  videoUrl?: string;
}

// Community challenges
export type ChallengeType =
  | 'strength'
  | 'endurance'
  | 'consistency'
  | 'transformation'
  | 'skill'
  | 'team'
  | 'volume'
  | 'intensity'
  | 'technique'
  | 'habit_formation'
  | 'nutrition'
  | 'recovery'
  | 'mindfulness'
  | 'competition'
  | 'progressive_overload'
  | 'specialization';

export interface CommunityChallenge {
  id: string;
  creatorId?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  challengeType: ChallengeType;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  goalMetric: string;
  goalValue: number;
  rules?: string;
  rewards?: string;
  isActive: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  participants?: ChallengeParticipant[];
  // New fields from Spanish resources
  category?: 'individual' | 'group' | 'team' | 'global';
  focusArea?: string[]; // Specific areas of focus (e.g., "chest", "squat", "nutrition")
  requiredEquipment?: string[]; // Equipment needed to participate
  verificationMethod?: 'photo' | 'video' | 'data' | 'coach' | 'honor';
  progressTracking?: 'daily' | 'weekly' | 'completion_only';
  milestones?: {
    value: number;
    reward?: string;
    badge?: string;
  }[];
  leaderboard?: boolean; // Whether to display a leaderboard
  privateChallenge?: boolean; // Whether the challenge is invite-only
  inviteCode?: string; // Code for private challenges
  recommendedWorkouts?: string[]; // IDs of recommended workouts for this challenge
  nutritionGuidelines?: string; // Nutrition recommendations for the challenge
  recoveryProtocol?: string; // Recovery recommendations
  expertTips?: string[]; // Tips from experts for success
  relatedContent?: string[]; // Related articles, videos, etc.
  socialHashtag?: string; // Hashtag for social media
  sponsoredBy?: string; // Sponsor information
  challengeImage?: string; // URL to challenge image
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  joinDate: string;
  currentProgress: number;
  completed: boolean;
  completionDate?: string;
  notes?: string;
  // New fields from Spanish resources
  dailyProgress?: Record<string, number>; // Date -> progress value
  weeklyProgress?: Record<string, number>; // Week number -> progress value
  achievements?: string[]; // Achievements earned
  rank?: number; // Current rank in the challenge
  personalBest?: number; // Personal best in the challenge
  verificationProof?: string[]; // URLs to verification proof
  feedbackProvided?: string; // Feedback on the challenge
  engagementScore?: number; // How engaged the participant is (1-10)
  teamId?: string; // Team ID if part of a team challenge
  referredBy?: string; // User ID of who referred them
  referralCount?: number; // Number of people they've referred
  publicProfile?: boolean; // Whether their progress is public
  customGoal?: number; // Personal goal that may differ from challenge goal
}
