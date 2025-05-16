import { supabase } from './supabase-client';
import { QueryResponse } from './supabase-types';

// Tipos para la integración con wearables
export interface ConnectedWearable {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  connected_at: string;
  last_sync: string;
  status: string;
}

export interface WearableData {
  device_id: string;
  steps: number;
  calories: number;
  active_calories: number;
  distance: number;
  heart_rate: number;
  max_heart_rate: number;
  workouts: {
    name: string;
    duration: string;
    calories: number;
    date: string;
  }[];
}

// Obtener dispositivos conectados de un usuario
export const getConnectedWearables = async (userId: string): Promise<QueryResponse<ConnectedWearable[]>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'connected_wearables')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla connected_wearables no existe. Creando datos simulados...');
      
      // Crear datos simulados para desarrollo
      const mockWearables: ConnectedWearable[] = [
        {
          id: "wearable-1",
          user_id: userId,
          device_id: "fitbit",
          device_name: "Fitbit",
          connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "active"
        }
      ];
      
      return { data: mockWearables, error: null };
    }

    // Si la tabla existe, obtener los dispositivos reales
    const { data, error } = await supabase
      .from('connected_wearables')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener dispositivos conectados:', error);
    return { data: null, error };
  }
};

// Conectar un dispositivo wearable
export const connectWearable = async (userId: string, deviceId: string): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'connected_wearables')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla connected_wearables no existe. Simulando conexión...');
      
      // Simular conexión exitosa
      return { data: { success: true }, error: null };
    }

    // Obtener nombre del dispositivo
    let deviceName = deviceId;
    switch (deviceId) {
      case 'fitbit':
        deviceName = 'Fitbit';
        break;
      case 'garmin':
        deviceName = 'Garmin';
        break;
      case 'apple_watch':
        deviceName = 'Apple Watch';
        break;
      case 'samsung_health':
        deviceName = 'Samsung Health';
        break;
      case 'google_fit':
        deviceName = 'Google Fit';
        break;
      case 'strava':
        deviceName = 'Strava';
        break;
      case 'polar':
        deviceName = 'Polar';
        break;
      case 'suunto':
        deviceName = 'Suunto';
        break;
    }

    // Si la tabla existe, insertar el dispositivo
    const { data, error } = await supabase
      .from('connected_wearables')
      .insert([
        {
          user_id: userId,
          device_id: deviceId,
          device_name: deviceName,
          connected_at: new Date().toISOString(),
          last_sync: new Date().toISOString(),
          status: 'active'
        }
      ]);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al conectar dispositivo:', error);
    return { data: null, error };
  }
};

// Desconectar un dispositivo wearable
export const disconnectWearable = async (userId: string, deviceId: string): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'connected_wearables')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla connected_wearables no existe. Simulando desconexión...');
      
      // Simular desconexión exitosa
      return { data: { success: true }, error: null };
    }

    // Si la tabla existe, actualizar el estado del dispositivo
    const { data, error } = await supabase
      .from('connected_wearables')
      .update({ status: 'disconnected' })
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al desconectar dispositivo:', error);
    return { data: null, error };
  }
};

// Obtener datos de un dispositivo wearable
export const getWearableData = async (userId: string, deviceId: string): Promise<QueryResponse<WearableData>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'wearable_data')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla wearable_data no existe. Creando datos simulados...');
      
      // Crear datos simulados para desarrollo
      const mockData: WearableData = {
        device_id: deviceId,
        steps: 8742,
        calories: 2156,
        active_calories: 845,
        distance: 6.3,
        heart_rate: 72,
        max_heart_rate: 142,
        workouts: [
          {
            name: "Carrera",
            duration: "45 minutos",
            calories: 420,
            date: "Hoy, 08:30"
          },
          {
            name: "Entrenamiento de fuerza",
            duration: "60 minutos",
            calories: 380,
            date: "Ayer, 18:15"
          },
          {
            name: "Ciclismo",
            duration: "30 minutos",
            calories: 280,
            date: "Hace 3 días, 07:45"
          }
        ]
      };
      
      return { data: mockData, error: null };
    }

    // Si la tabla existe, obtener los datos reales
    const { data, error } = await supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    // Obtener entrenamientos recientes
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('wearable_workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .order('date', { ascending: false })
      .limit(5);

    if (workoutsError) {
      console.error('Error al obtener entrenamientos:', workoutsError);
    }

    // Transformar los datos al formato esperado
    const wearableData: WearableData = {
      device_id: data.device_id,
      steps: data.steps,
      calories: data.calories,
      active_calories: data.active_calories,
      distance: data.distance,
      heart_rate: data.heart_rate,
      max_heart_rate: data.max_heart_rate,
      workouts: workoutsData ? workoutsData.map(workout => ({
        name: workout.name,
        duration: workout.duration,
        calories: workout.calories,
        date: new Date(workout.date).toLocaleDateString()
      })) : []
    };

    return { data: wearableData, error: null };
  } catch (error) {
    console.error('Error al obtener datos del dispositivo:', error);
    return { data: null, error };
  }
};
