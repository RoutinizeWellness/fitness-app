import { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  notifications_enabled?: boolean;
  customize_notifications?: boolean;
  more_customization_enabled?: boolean;
  dark_mode?: boolean;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSubscription {
  id?: string;
  user_id: string;
  plan_id?: string;
  status?: 'active' | 'canceled' | 'expired' | 'trial';
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HabitProgress {
  id?: string;
  user_id: string;
  habit_id: string;
  habit_name: string;
  progress: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  weekly_habits: number;
  completed_habits: number;
  streak_days: number;
}

export class ProfileService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // Perfil de usuario
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('user-content')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data } = this.supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);

    // Actualizar el perfil con la nueva URL
    const { error: updateError } = await this.supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError);
      return null;
    }

    return data.publicUrl;
  }

  // Configuración de usuario
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default settings
        return this.createDefaultSettings(userId);
      }
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data;
  }

  async createDefaultSettings(userId: string): Promise<UserSettings | null> {
    const defaultSettings: UserSettings = {
      user_id: userId,
      notifications_enabled: true,
      customize_notifications: true,
      more_customization_enabled: true,
      dark_mode: false,
      language: 'en'
    };

    const { data, error } = await this.supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
      return null;
    }

    return data;
  }

  async updateUserSettings(settings: UserSettings): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .upsert({
        user_id: settings.user_id,
        notifications_enabled: settings.notifications_enabled,
        customize_notifications: settings.customize_notifications,
        more_customization_enabled: settings.more_customization_enabled,
        dark_mode: settings.dark_mode,
        language: settings.language,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return null;
    }

    return data;
  }

  // Suscripción de usuario
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data;
  }

  async createSubscription(subscription: UserSubscription): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: subscription.user_id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        start_date: subscription.start_date || new Date().toISOString(),
        end_date: subscription.end_date,
        auto_renew: subscription.auto_renew || true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }

    return data;
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }

    return true;
  }

  // Progreso de hábitos
  async getHabitProgress(userId: string): Promise<HabitProgress[]> {
    const { data, error } = await this.supabase
      .from('habit_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching habit progress:', error);
      return [];
    }

    return data || [];
  }

  async updateHabitProgress(progress: HabitProgress): Promise<HabitProgress | null> {
    const { data, error } = await this.supabase
      .from('habit_progress')
      .upsert({
        user_id: progress.user_id,
        habit_id: progress.habit_id,
        habit_name: progress.habit_name,
        progress: progress.progress,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating habit progress:', error);
      return null;
    }

    return data;
  }

  // Estadísticas de usuario
  async getUserStats(userId: string): Promise<UserStats | null> {
    // Obtener hábitos semanales
    const { data: weeklyHabits, error: weeklyError } = await this.supabase
      .from('habits')
      .select('count')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (weeklyError) {
      console.error('Error fetching weekly habits:', weeklyError);
      return null;
    }

    // Obtener hábitos completados
    const { data: completedHabits, error: completedError } = await this.supabase
      .from('habit_completions')
      .select('count')
      .eq('user_id', userId)
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (completedError) {
      console.error('Error fetching completed habits:', completedError);
      return null;
    }

    // Obtener racha de días
    const { data: streakData, error: streakError } = await this.supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Error fetching streak days:', streakError);
      return null;
    }

    return {
      weekly_habits: weeklyHabits[0]?.count || 0,
      completed_habits: completedHabits[0]?.count || 0,
      streak_days: streakData?.current_streak || 0
    };
  }
}
