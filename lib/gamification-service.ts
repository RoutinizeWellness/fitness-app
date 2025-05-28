import { supabase } from './supabase-client';
import { 
  Achievement, 
  GamificationState, 
  Reward, 
  Streak, 
  UserPoints,
  TrainerAvatar
} from './types/gamification';
import { v4 as uuidv4 } from 'uuid';

// Points awarded for different activities
const POINTS = {
  WORKOUT_COMPLETION: 50,
  WORKOUT_STREAK_DAY: 10,
  EXERCISE_COMPLETION: 5,
  ACHIEVEMENT_UNLOCK: 100,
  PERFECT_FORM: 20,
  NUTRITION_LOG: 15,
  PERSONAL_RECORD: 30
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5000,   // Level 8
  7500,   // Level 9
  10000,  // Level 10
];

/**
 * Get the user's gamification state
 * @param userId The user ID
 * @returns The user's gamification state
 */
export async function getUserGamificationState(userId: string): Promise<GamificationState | null> {
  try {
    // Get points
    const { data: pointsData, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('Error fetching user points:', pointsError);
      return null;
    }

    // Get achievements
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (achievementsError) {
      console.error('Error fetching user achievements:', achievementsError);
      return null;
    }

    // Get rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId);

    if (rewardsError) {
      console.error('Error fetching user rewards:', rewardsError);
      return null;
    }

    // Get streak
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Error fetching user streak:', streakError);
      return null;
    }

    // Calculate level based on total points
    const totalPoints = pointsData?.total || 0;
    let level = 1;
    let nextLevelPoints = LEVEL_THRESHOLDS[1];

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        nextLevelPoints = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i] * 1.5;
      } else {
        break;
      }
    }

    // Create default points if none exist
    const points: UserPoints = pointsData || {
      total: 0,
      workoutPoints: 0,
      streakPoints: 0,
      nutritionPoints: 0,
      milestonePoints: 0,
      specialPoints: 0
    };

    // Create default streak if none exists
    const streak: Streak = streakData || {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: '',
      streakDates: []
    };

    return {
      points,
      achievements: achievementsData || [],
      rewards: rewardsData || [],
      streak,
      level,
      nextLevelPoints
    };
  } catch (error) {
    console.error('Error in getUserGamificationState:', error);
    return null;
  }
}

/**
 * Award points to a user
 * @param userId The user ID
 * @param points The number of points to award
 * @param category The category of points
 * @returns Success status
 */
export async function awardPoints(
  userId: string, 
  points: number, 
  category: keyof Omit<UserPoints, 'total'> = 'workoutPoints'
): Promise<boolean> {
  try {
    // Get current points
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user points:', fetchError);
      return false;
    }

    // Create default points if none exist
    const updatedPoints = currentPoints || {
      user_id: userId,
      total: 0,
      workoutPoints: 0,
      streakPoints: 0,
      nutritionPoints: 0,
      milestonePoints: 0,
      specialPoints: 0
    };

    // Update points
    updatedPoints[category] += points;
    updatedPoints.total += points;

    // Save to database
    const { error: saveError } = await supabase
      .from('user_points')
      .upsert(updatedPoints);

    if (saveError) {
      console.error('Error saving user points:', saveError);
      return false;
    }

    // Check for level-up achievements
    await checkForLevelUpAchievements(userId, updatedPoints.total);

    return true;
  } catch (error) {
    console.error('Error in awardPoints:', error);
    return false;
  }
}

/**
 * Check for level-up achievements
 * @param userId The user ID
 * @param totalPoints The user's total points
 */
async function checkForLevelUpAchievements(userId: string, totalPoints: number): Promise<void> {
  try {
    // Calculate current level
    let currentLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        currentLevel = i + 1;
      } else {
        break;
      }
    }

    // Check if level-up achievement exists
    const achievementId = `level-${currentLevel}`;
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking level-up achievement:', error);
      return;
    }

    // If achievement doesn't exist, create it
    if (!data) {
      await unlockAchievement(userId, achievementId);
    }
  } catch (error) {
    console.error('Error in checkForLevelUpAchievements:', error);
  }
}

/**
 * Unlock an achievement for a user
 * @param userId The user ID
 * @param achievementId The achievement ID
 * @returns Success status
 */
export async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    // Get achievement details
    const { data: achievementData, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievementError) {
      console.error('Error fetching achievement:', achievementError);
      return false;
    }

    // Create user achievement
    const userAchievement = {
      id: uuidv4(),
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
      achievement_data: achievementData
    };

    const { error: saveError } = await supabase
      .from('user_achievements')
      .insert([userAchievement]);

    if (saveError) {
      console.error('Error saving user achievement:', saveError);
      return false;
    }

    // Award points for unlocking achievement
    await awardPoints(userId, POINTS.ACHIEVEMENT_UNLOCK, 'milestonePoints');

    return true;
  } catch (error) {
    console.error('Error in unlockAchievement:', error);
    return false;
  }
}
