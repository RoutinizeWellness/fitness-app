/**
 * Servicio para gestionar notificaciones relacionadas con la salud y el fitness
 * Proporciona funciones para enviar notificaciones push, mostrar toasts y gestionar logros
 */

import { supabase } from './supabase-client';
import { toast } from '@/components/ui/use-toast';

// Tipos para notificaciones
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'reminder' | 'goal' | 'info' | 'alert';
  icon?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Tipos para logros
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'steps' | 'workouts' | 'nutrition' | 'sleep' | 'streak' | 'general';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  threshold: number;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  points: number;
}

// Clase principal para gestionar notificaciones
export class NotificationService {
  private static instance: NotificationService;
  private userId: string | null = null;
  private notifications: Notification[] = [];
  private achievements: Achievement[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private achievementListeners: Array<(achievement: Achievement) => void> = [];
  private hasPermission: boolean = false;

  // Obtener la instancia singleton
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Constructor privado para singleton
  private constructor() {
    // Verificar permisos de notificación
    this.checkNotificationPermission();

    // Cargar notificaciones desde localStorage
    this.loadFromLocalStorage();
  }

  // Verificar permisos de notificación
  private async checkNotificationPermission(): Promise<void> {
    if (typeof Notification === 'undefined') {
      this.hasPermission = false;
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }
  }

  // Cargar notificaciones desde localStorage
  private loadFromLocalStorage(): void {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        this.notifications = JSON.parse(storedNotifications);
      }

      const storedAchievements = localStorage.getItem('achievements');
      if (storedAchievements) {
        this.achievements = JSON.parse(storedAchievements);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones desde localStorage:', error);
    }
  }

  // Guardar notificaciones en localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      localStorage.setItem('achievements', JSON.stringify(this.achievements));
    } catch (error) {
      console.error('Error al guardar notificaciones en localStorage:', error);
    }
  }

  // Establecer el ID de usuario
  public async setUserId(userId: string): Promise<void> {
    this.userId = userId;

    // Cargar notificaciones desde Supabase
    await this.loadNotificationsFromSupabase();

    // Cargar logros desde Supabase
    await this.loadAchievementsFromSupabase();
  }

  // Cargar notificaciones desde Supabase
  private async loadNotificationsFromSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      console.log('Verificando si existe la tabla notifications...');

      // Verificar si la tabla notifications existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'notifications')
        .single();

      if (tableCheckError) {
        console.warn('Error al verificar tabla notifications:', tableCheckError);
        // Continuar usando los datos de localStorage
        return;
      }

      if (!tableExists) {
        console.warn('La tabla notifications no existe, usando datos de localStorage');
        return;
      }

      console.log('Consultando notificaciones para el usuario:', this.userId);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error al consultar notificaciones:', error);
        return;
      }

      if (data) {
        console.log(`Se encontraron ${data.length} notificaciones`);
        this.notifications = data.map(notification => ({
          id: notification.id,
          userId: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          icon: notification.icon,
          read: notification.read,
          actionUrl: notification.action_url,
          createdAt: new Date(notification.created_at),
          expiresAt: notification.expires_at ? new Date(notification.expires_at) : undefined
        }));

        // Guardar en localStorage
        this.saveToLocalStorage();

        // Notificar a los listeners
        this.notifyListeners();
      } else {
        console.log('No se encontraron notificaciones');
      }
    } catch (error) {
      console.error('Error al cargar notificaciones desde Supabase:', error);
      // Continuar usando los datos de localStorage
    }
  }

  // Cargar logros desde Supabase
  private async loadAchievementsFromSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      console.log('Verificando si existen las tablas de logros...');

      // Verificar si la tabla user_achievements existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'user_achievements')
        .single();

      if (tableCheckError) {
        console.warn('Error al verificar tabla user_achievements:', tableCheckError);
        // Continuar usando los datos de localStorage
        return;
      }

      if (!tableExists) {
        console.warn('La tabla user_achievements no existe, usando datos de localStorage');
        return;
      }

      console.log('Consultando logros para el usuario:', this.userId);
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          achievement_id,
          progress,
          completed,
          completed_at,
          achievements (
            name,
            description,
            icon,
            category,
            level,
            threshold,
            points
          )
        `)
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error al consultar logros:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`Se encontraron ${data.length} logros`);

        // Filtrar elementos que tienen la propiedad achievements definida
        const validData = data.filter(item => item.achievements);

        if (validData.length < data.length) {
          console.warn(`Se ignoraron ${data.length - validData.length} logros con datos incompletos`);
        }

        this.achievements = validData.map(item => ({
          id: item.achievement_id,
          name: item.achievements.name,
          description: item.achievements.description,
          icon: item.achievements.icon,
          category: item.achievements.category,
          level: item.achievements.level,
          threshold: item.achievements.threshold,
          progress: item.progress,
          completed: item.completed,
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
          points: item.achievements.points
        }));

        // Guardar en localStorage
        this.saveToLocalStorage();
      } else {
        console.log('No se encontraron logros');
      }
    } catch (error) {
      console.error('Error al cargar logros desde Supabase:', error);
      // Continuar usando los datos de localStorage
    }
  }

  // Enviar una notificación
  public async sendNotification(notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Promise<string | undefined> {
    if (!this.userId) return;

    try {
      const newNotification: Notification = {
        ...notification,
        userId: this.userId,
        read: false,
        createdAt: new Date()
      };

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: this.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          icon: notification.icon,
          read: false,
          action_url: notification.actionUrl,
          created_at: new Date().toISOString(),
          expires_at: notification.expiresAt?.toISOString()
        }])
        .select('id');

      if (error) throw error;

      if (data && data.length > 0) {
        newNotification.id = data[0].id;

        // Agregar a la lista local
        this.notifications.unshift(newNotification);

        // Guardar en localStorage
        this.saveToLocalStorage();

        // Notificar a los listeners
        this.notifyListeners();

        // Mostrar notificación push si hay permiso
        this.showPushNotification(newNotification);

        // Mostrar toast
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: this.getToastVariant(newNotification.type)
        });

        return newNotification.id;
      }
    } catch (error) {
      console.error('Error al enviar notificación:', error);
    }
  }

  // Obtener variante de toast según el tipo de notificación
  private getToastVariant(type: Notification['type']): 'default' | 'destructive' | null {
    switch (type) {
      case 'achievement':
      case 'goal':
        return null; // Usar estilo personalizado
      case 'alert':
        return 'destructive';
      default:
        return 'default';
    }
  }

  // Mostrar notificación push
  private showPushNotification(notification: Notification): void {
    if (!this.hasPermission) return;

    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icons/app-icon.png'
      });
    } catch (error) {
      console.error('Error al mostrar notificación push:', error);
    }
  }

  // Marcar notificación como leída
  public async markAsRead(notificationId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', this.userId);

      if (error) throw error;

      // Actualizar localmente
      this.notifications = this.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      // Guardar en localStorage
      this.saveToLocalStorage();

      // Notificar a los listeners
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      return false;
    }
  }

  // Eliminar notificación
  public async deleteNotification(notificationId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', this.userId);

      if (error) throw error;

      // Eliminar localmente
      this.notifications = this.notifications.filter(
        notification => notification.id !== notificationId
      );

      // Guardar en localStorage
      this.saveToLocalStorage();

      // Notificar a los listeners
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      return false;
    }
  }

  // Actualizar progreso de un logro
  public async updateAchievementProgress(achievementId: string, progress: number): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (!achievement) return false;

      const wasCompleted = achievement.completed;
      const newCompleted = progress >= achievement.threshold;

      // Actualizar en Supabase
      const { error } = await supabase
        .from('user_achievements')
        .update({
          progress,
          completed: newCompleted,
          completed_at: newCompleted && !wasCompleted ? new Date().toISOString() : null
        })
        .eq('achievement_id', achievementId)
        .eq('user_id', this.userId);

      if (error) throw error;

      // Actualizar localmente
      this.achievements = this.achievements.map(a =>
        a.id === achievementId
          ? {
              ...a,
              progress,
              completed: newCompleted,
              completedAt: newCompleted && !wasCompleted ? new Date() : a.completedAt
            }
          : a
      );

      // Si se completó el logro, enviar notificación
      if (newCompleted && !wasCompleted) {
        const updatedAchievement = this.achievements.find(a => a.id === achievementId);
        if (updatedAchievement) {
          // Notificar a los listeners de logros
          this.notifyAchievementListeners(updatedAchievement);

          // Enviar notificación
          await this.sendNotification({
            title: '¡Nuevo logro desbloqueado!',
            message: `Has conseguido: ${updatedAchievement.name}`,
            type: 'achievement',
            icon: updatedAchievement.icon
          });
        }
      }

      // Guardar en localStorage
      this.saveToLocalStorage();

      return true;
    } catch (error) {
      console.error('Error al actualizar progreso de logro:', error);
      return false;
    }
  }

  // Verificar logros relacionados con pasos
  public async checkStepAchievements(steps: number): Promise<void> {
    const stepAchievements = this.achievements.filter(a => a.category === 'steps');

    for (const achievement of stepAchievements) {
      if (steps >= achievement.threshold && !achievement.completed) {
        await this.updateAchievementProgress(achievement.id, steps);
      } else if (!achievement.completed) {
        await this.updateAchievementProgress(achievement.id, steps);
      }
    }
  }

  // Verificar logros relacionados con entrenamientos
  public async checkWorkoutAchievements(workoutCount: number): Promise<void> {
    const workoutAchievements = this.achievements.filter(a => a.category === 'workouts');

    for (const achievement of workoutAchievements) {
      if (workoutCount >= achievement.threshold && !achievement.completed) {
        await this.updateAchievementProgress(achievement.id, workoutCount);
      } else if (!achievement.completed) {
        await this.updateAchievementProgress(achievement.id, workoutCount);
      }
    }
  }

  // Obtener notificaciones no leídas
  public getUnreadNotifications(): Notification[] {
    return this.notifications.filter(notification => !notification.read);
  }

  // Obtener todas las notificaciones
  public getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Obtener todos los logros
  public getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // Agregar listener para notificaciones
  public addNotificationListener(listener: (notifications: Notification[]) => void): void {
    this.listeners.push(listener);
    listener([...this.notifications]);
  }

  // Eliminar listener de notificaciones
  public removeNotificationListener(listener: (notifications: Notification[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Agregar listener para logros
  public addAchievementListener(listener: (achievement: Achievement) => void): void {
    this.achievementListeners.push(listener);
  }

  // Eliminar listener de logros
  public removeAchievementListener(listener: (achievement: Achievement) => void): void {
    this.achievementListeners = this.achievementListeners.filter(l => l !== listener);
  }

  // Notificar a los listeners de notificaciones
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Notificar a los listeners de logros
  private notifyAchievementListeners(achievement: Achievement): void {
    this.achievementListeners.forEach(listener => listener(achievement));
  }
}
