/**
 * Types for the 3D Avatar Trainer
 */

export interface AvatarAppearance {
  gender: 'male' | 'female' | 'neutral';
  bodyType: 'athletic' | 'slim' | 'muscular' | 'average';
  skinTone: 'light' | 'medium' | 'dark' | 'tan' | 'olive';
  hairStyle: string;
  hairColor: string;
  facialFeatures: {
    eyeColor: string;
    faceShape: string;
    hasBeard?: boolean;
    beardStyle?: string;
  };
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    color: string;
    accessories: string[];
  };
}

export interface AvatarAnimation {
  name: string;
  duration: number;
  loop: boolean;
  category: 'idle' | 'exercise' | 'reaction' | 'navigation';
  exerciseType?: string;
  muscleGroups?: string[];
}

export interface AvatarPersonality {
  type: 'motivational' | 'technical' | 'supportive' | 'challenging';
  energyLevel: 'high' | 'medium' | 'low';
  communicationStyle: 'direct' | 'friendly' | 'professional' | 'casual';
  specialization: 'strength' | 'cardio' | 'flexibility' | 'nutrition' | 'general';
  phrases: {
    greetings: string[];
    encouragement: string[];
    instruction: string[];
    correction: string[];
    celebration: string[];
    farewell: string[];
  };
}

export interface AvatarKnowledge {
  exercises: {
    [key: string]: {
      description: string;
      muscleGroups: string[];
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      equipment: string[];
      tips: string[];
      commonMistakes: string[];
      variations: string[];
    }
  };
  nutrition: {
    mealPlans: any[];
    nutritionTips: string[];
    recipes: any[];
  };
  recovery: {
    techniques: string[];
    stretchingRoutines: any[];
    restRecommendations: string[];
  };
  wellness: {
    sleepTips: string[];
    stressManagement: string[];
    mindfulness: string[];
  };
}

export interface AvatarFeedback {
  formCorrection: {
    exerciseName: string;
    issues: string[];
    suggestions: string[];
    severity: 'minor' | 'moderate' | 'critical';
  };
  performanceFeedback: {
    metric: string;
    value: number;
    comparison: 'better' | 'worse' | 'same';
    previousValue?: number;
    suggestion?: string;
  };
}

export interface AvatarTrainer {
  id: string;
  name: string;
  appearance: AvatarAppearance;
  animations: AvatarAnimation[];
  personality: AvatarPersonality;
  knowledge: AvatarKnowledge;
  userPreferences: {
    userId: string;
    favoriteExercises: string[];
    avoidedExercises: string[];
    goals: string[];
    schedule: {
      preferredDays: string[];
      preferredTimes: string[];
    };
    adaptations: {
      injuries: string[];
      limitations: string[];
    };
  };
  trainingHistory: {
    lastInteraction: string;
    completedSessions: number;
    feedbackGiven: AvatarFeedback[];
    userProgress: {
      [key: string]: {
        metric: string;
        values: { date: string; value: number }[];
      }
    };
  };
}

export interface AvatarInteraction {
  type: 'greeting' | 'instruction' | 'feedback' | 'encouragement' | 'celebration' | 'farewell';
  message: string;
  animation?: string;
  duration?: number;
  requiresResponse?: boolean;
  options?: {
    text: string;
    value: string;
    action?: () => void;
  }[];
}

export interface AvatarRecommendation {
  type: 'exercise' | 'workout' | 'nutrition' | 'recovery' | 'wellness';
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  data: any;
}

export interface AvatarState {
  isActive: boolean;
  currentAnimation: string;
  currentInteraction?: AvatarInteraction;
  position: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
  context: {
    location: 'dashboard' | 'training' | 'nutrition' | 'sleep' | 'wellness' | 'profile';
    time: string;
    userActivity: string;
    userMood?: string;
    userEnergy?: number; // 0-100
  };
}

export interface AvatarTrainingData {
  phrases: string[];
  exercises: any[];
  nutritionFacts: string[];
  recoveryTips: string[];
  userFeedback: {
    type: string;
    content: string;
    timestamp: string;
  }[];
}
