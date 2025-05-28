/**
 * Tipos para el módulo de sueño, productividad y bienestar
 */

// Tipos comunes
export type DeviceSource = 'manual' | 'whoop' | 'oura' | 'garmin' | 'apple_watch' | 'fitbit' | 'polar';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type FocusTechnique = 'pomodoro' | 'deep_work' | 'flow';
export type RoutineType = 'morning' | 'evening';
export type EmotionType = 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited' | 'tired' | 'content' | 'frustrated' | 'other';
export type BreathingTechnique = 'wim_hof' | 'box_breathing' | '4-7-8' | 'alternate_nostril' | 'diaphragmatic' | 'other';
export type MindfulnessType = 'meditation' | 'body_scan' | 'visualization' | 'mindful_walking' | 'mindful_eating' | 'other';
export type TrainingAdjustment = 'reduce_intensity' | 'reduce_volume' | 'normal' | 'increase';

// Interfaces para el módulo de sueño
export interface SleepEntry {
  id?: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // en minutos
  quality: number; // 1-10
  deepSleep?: number; // en minutos
  remSleep?: number; // en minutos
  lightSleep?: number; // en minutos
  awakeTime?: number; // en minutos
  hrv?: number; // en ms
  restingHeartRate?: number; // en ppm
  bodyTemperature?: number; // en °C
  factors?: {
    alcohol: boolean;
    caffeine: boolean;
    screens: boolean;
    stress: boolean;
    exercise: boolean;
    lateMeal: boolean;
    noise: boolean;
    temperature: boolean;
    other?: string;
  };
  notes?: string;
  deviceSource: DeviceSource;
  createdAt?: string;
  updatedAt?: string;
}

export interface SleepGoal {
  id?: string;
  userId: string;
  targetDuration: number; // en minutos
  targetBedtime: string;
  targetWakeTime: string;
  targetDeepSleepPercentage?: number;
  targetRemSleepPercentage?: number;
  targetHrv?: number; // en ms
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NapEntry {
  id?: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // en minutos
  quality: number; // 1-10
  preNapEnergy: number; // 1-10
  postNapEnergy: number; // 1-10
  notes?: string;
  createdAt?: string;
}

// Interfaces para el módulo de productividad
export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags?: string[];
  category?: string;
  estimatedTime?: number; // en minutos
  actualTime?: number; // en minutos
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSession {
  id?: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // en minutos
  technique?: FocusTechnique;
  taskId?: string;
  distractions?: number;
  productivityScore?: number; // 1-10
  notes?: string;
  createdAt?: string;
}

export interface DailyRoutine {
  id?: string;
  userId: string;
  type: RoutineType;
  items: RoutineItem[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoutineItem {
  id?: string;
  title: string;
  completed: boolean;
  order: number;
  duration?: number; // en minutos
}

// Interfaces para el módulo de bienestar
export interface MoodEntry {
  id?: string;
  userId: string;
  date: string;
  time: string;
  moodLevel: number; // 1-10
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  anxietyLevel: number; // 1-10
  mentalClarity: number; // 1-10
  emotionType?: EmotionType;
  emotionIntensity?: number; // 1-10
  emotionValence?: number; // -5 a 5 (negativo a positivo)
  emotionArousal?: number; // 1-10 (bajo a alto)
  journalEntry?: string;
  factors?: string[];
  createdAt?: string;
}

export interface BreathingSession {
  id?: string;
  userId: string;
  date: string;
  time: string;
  technique: BreathingTechnique;
  duration: number; // en minutos
  rounds?: number;
  breathHolds?: string[]; // duración de cada retención en segundos
  preSessionState: number; // 1-10
  postSessionState: number; // 1-10
  notes?: string;
  createdAt?: string;
}

export interface MindfulnessSession {
  id?: string;
  userId: string;
  date: string;
  time: string;
  type: MindfulnessType;
  duration: number; // en minutos
  guided: boolean;
  guideSource?: string;
  preSessionStress: number; // 1-10
  postSessionStress: number; // 1-10
  notes?: string;
  createdAt?: string;
}

// Interfaces para el sistema de readiness
export interface ReadinessScore {
  id?: string;
  userId: string;
  date: string;
  overallScore: number; // 1-100
  sleepScore: number; // 1-100
  physicalScore: number; // 1-100
  mentalScore: number; // 1-100
  lifestyleScore: number; // 1-100
  components: {
    sleep: {
      duration: number;
      quality: number;
      hrv?: number;
      restingHeartRate?: number;
      deepSleepPercentage?: number;
    };
    physical: {
      muscleSoreness?: number;
      fatigue?: number;
      previousDayRpe?: number;
      recovery?: number;
    };
    mental: {
      stress?: number;
      mood?: number;
      mentalClarity?: number;
      anxiety?: number;
    };
    lifestyle: {
      nutrition?: number;
      hydration?: number;
      alcohol?: boolean;
      activeRecovery?: boolean;
    };
  };
  recommendations?: string[];
  trainingAdjustment?: TrainingAdjustment;
  createdAt?: string;
}

export interface WearableIntegration {
  id?: string;
  userId: string;
  deviceType: DeviceSource;
  isConnected: boolean;
  authToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  lastSyncAt?: string;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces para análisis y estadísticas
export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  averageDeepSleep?: number;
  averageRemSleep?: number;
  averageLightSleep?: number;
  averageHrv?: number;
  averageRestingHeartRate?: number;
  sleepDebt?: number;
  consistencyScore?: number;
  trends: {
    duration: number[];
    quality: number[];
    deepSleep?: number[];
    remSleep?: number[];
    hrv?: number[];
  };
  dates: string[];
}

export interface ProductivityStats {
  focusTime: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  tasks: {
    completed: number;
    pending: number;
    completionRate: number;
  };
  focusSessions: {
    count: number;
    averageDuration: number;
    peakHours: string[];
  };
  routineAdherence: number;
}

export interface WellnessStats {
  averageMood: number;
  averageStress: number;
  averageEnergy: number;
  averageMentalClarity: number;
  breathingSessions: number;
  mindfulnessSessions: number;
  totalMindfulnessMinutes: number;
  emotionDistribution: Record<EmotionType, number>;
  stressTrend: number[];
  dates: string[];
}

export interface ReadinessStats {
  averageOverallScore: number;
  averageSleepScore: number;
  averagePhysicalScore: number;
  averageMentalScore: number;
  averageLifestyleScore: number;
  trends: {
    overall: number[];
    sleep: number[];
    physical: number[];
    mental: number[];
    lifestyle: number[];
  };
  dates: string[];
  trainingAdjustments: Record<TrainingAdjustment, number>;
}
