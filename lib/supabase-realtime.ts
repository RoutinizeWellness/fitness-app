import { supabase } from './supabase-client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Tipos para Realtime
export type SubscriptionCallback<T> = (payload: RealtimePostgresChangesPayload<T>) => void;

export type SubscriptionOptions = {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
};

// Clase para manejar suscripciones
export class RealtimeSubscription<T = any> {
  private channel: RealtimeChannel;
  private isSubscribed: boolean = false;

  constructor(
    private options: SubscriptionOptions,
    private callback: SubscriptionCallback<T>
  ) {
    // Crear un canal único para esta suscripción
    const channelName = `realtime:${options.schema || 'public'}:${options.table}:${options.event || '*'}:${options.filter || '*'}`;
    this.channel = supabase.channel(channelName);
  }

  // Iniciar la suscripción
  subscribe(): void {
    if (this.isSubscribed) {
      console.warn('Ya existe una suscripción activa');
      return;
    }

    const { event = '*', schema = 'public', table, filter } = this.options;

    // Configurar el canal para escuchar cambios en la tabla
    this.channel
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        (payload) => {
          this.callback(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true;
          console.log(`Suscripción activa para ${table}`);
        }
      });
  }

  // Detener la suscripción
  unsubscribe(): void {
    if (!this.isSubscribed) {
      console.warn('No hay una suscripción activa para detener');
      return;
    }

    supabase.removeChannel(this.channel);
    this.isSubscribed = false;
    console.log(`Suscripción detenida para ${this.options.table}`);
  }
}

// Funciones para crear suscripciones específicas
export const subscribeToWorkouts = (
  userId: string,
  callback: SubscriptionCallback<any>
): RealtimeSubscription => {
  const subscription = new RealtimeSubscription(
    {
      table: 'workouts',
      filter: `user_id=eq.${userId}`,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

export const subscribeToMoods = (
  userId: string,
  callback: SubscriptionCallback<any>
): RealtimeSubscription => {
  const subscription = new RealtimeSubscription(
    {
      table: 'moods',
      filter: `user_id=eq.${userId}`,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

export const subscribeToPlans = (
  userId: string,
  callback: SubscriptionCallback<any>
): RealtimeSubscription => {
  const subscription = new RealtimeSubscription(
    {
      table: 'plans',
      filter: `user_id=eq.${userId}`,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

export const subscribeToNutrition = (
  userId: string,
  callback: SubscriptionCallback<any>
): RealtimeSubscription => {
  const subscription = new RealtimeSubscription(
    {
      table: 'nutrition',
      filter: `user_id=eq.${userId}`,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

export const subscribeToCommunityActivities = (
  callback: SubscriptionCallback<any>
): RealtimeSubscription => {
  const subscription = new RealtimeSubscription(
    {
      table: 'community_activities',
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

// Función para suscribirse a cambios en el perfil de usuario
export const subscribeToUserProfile = (
  userId: string,
  callback: SubscriptionCallback<any>
): RealtimeSubscription => {
  const subscription = new RealtimeSubscription(
    {
      table: 'profiles',
      filter: `user_id=eq.${userId}`,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

// Función para suscribirse a cambios en una tabla específica
export const subscribeToTable = <T>(
  table: string,
  callback: SubscriptionCallback<T>,
  filter?: string
): RealtimeSubscription<T> => {
  const subscription = new RealtimeSubscription<T>(
    {
      table,
      filter,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};

// Función para suscribirse a un evento específico en una tabla
export const subscribeToEvent = <T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  callback: SubscriptionCallback<T>,
  filter?: string
): RealtimeSubscription<T> => {
  const subscription = new RealtimeSubscription<T>(
    {
      table,
      event,
      filter,
    },
    callback
  );
  
  subscription.subscribe();
  return subscription;
};
