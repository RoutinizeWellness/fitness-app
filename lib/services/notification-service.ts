import { SupabaseClient } from '@supabase/supabase-js';

export interface Notification {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: 'habit' | 'streak' | 'system' | 'subscription';
  is_read: boolean;
  created_at?: string;
  action_url?: string;
  image_url?: string;
}

export class NotificationService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async getUserNotifications(userId: string, limit = 10): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('count', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return data[0]?.count || 0;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  }

  async createNotification(notification: Notification): Promise<Notification | null> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: false,
        action_url: notification.action_url,
        image_url: notification.image_url
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  }

  // Métodos para crear notificaciones específicas
  async createHabitReminder(userId: string, habitName: string): Promise<Notification | null> {
    return this.createNotification({
      user_id: userId,
      title: 'Habit Reminder',
      message: `Don't forget to complete your "${habitName}" habit today!`,
      type: 'habit',
      is_read: false,
      action_url: '/habit-dashboard/habits'
    });
  }

  async createStreakNotification(userId: string, streakDays: number): Promise<Notification | null> {
    return this.createNotification({
      user_id: userId,
      title: 'Streak Achievement',
      message: `Congratulations! You've maintained a ${streakDays}-day streak.`,
      type: 'streak',
      is_read: false,
      image_url: '/images/notifications/streak.png'
    });
  }

  async createSubscriptionNotification(userId: string, planName: string): Promise<Notification | null> {
    return this.createNotification({
      user_id: userId,
      title: 'Subscription Activated',
      message: `Your ${planName} subscription has been activated successfully.`,
      type: 'subscription',
      is_read: false,
      action_url: '/profile/habit-subscription'
    });
  }

  // Configuración de notificaciones push (Web Push API)
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async savePushSubscription(userId: string, subscription: PushSubscriptionJSON): Promise<boolean> {
    const { error } = await this.supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving push subscription:', error);
      return false;
    }

    return true;
  }

  // En una implementación real, este método sería llamado desde un servidor
  async sendPushNotification(userId: string, title: string, message: string): Promise<boolean> {
    // En una implementación real, aquí se enviaría la notificación push
    // a través de un servicio como Firebase Cloud Messaging o un servidor propio
    console.log(`[MOCK] Sending push notification to ${userId}: ${title} - ${message}`);
    return true;
  }
}
