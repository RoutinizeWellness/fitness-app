export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-100
}

export type AchievementCategory = 
  | 'workout'
  | 'streak'
  | 'nutrition'
  | 'milestone'
  | 'special';

export interface AchievementCriteria {
  type: 'workout_count' | 'streak_days' | 'weight_lifted' | 'calories_burned' | 'custom';
  target: number;
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
}

export interface UserPoints {
  total: number;
  workoutPoints: number;
  streakPoints: number;
  nutritionPoints: number;
  milestonePoints: number;
  specialPoints: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsCost: number;
  isAvailable: boolean;
  isRedeemed: boolean;
  redeemedAt?: string;
  category: RewardCategory;
}

export type RewardCategory = 
  | 'customization'
  | 'feature'
  | 'content'
  | 'partner';

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string;
  streakDates: string[];
}

export interface GamificationState {
  points: UserPoints;
  achievements: Achievement[];
  rewards: Reward[];
  streak: Streak;
  level: number;
  nextLevelPoints: number;
}

export interface AvatarCustomization {
  bodyType: string;
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  facialFeatures: string;
  outfit: string;
  accessories: string[];
}

export interface TrainerAvatar {
  id: string;
  name: string;
  customization: AvatarCustomization;
  personality: 'motivational' | 'technical' | 'supportive' | 'challenging';
  specialization: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'general';
  phrases: {
    greeting: string[];
    encouragement: string[];
    milestone: string[];
    workout: string[];
  };
  animation: {
    idle: string;
    demonstrating: string;
    celebrating: string;
    guiding: string;
  };
}
