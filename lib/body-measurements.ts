import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { QueryResponse } from './supabase-queries';

// Tipos para medidas corporales
export type BodyMeasurement = {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  created_at: string;
};

// Tipos para datos de wearables
export type WearableData = {
  id: string;
  user_id: string;
  date: string;
  device_type: 'fitbit' | 'garmin' | 'apple_health' | 'google_fit' | 'other';
  steps?: number;
  calories_burned?: number;
  active_minutes?: number;
  heart_rate?: {
    resting?: number;
    average?: number;
    max?: number;
    zones?: {
      fat_burn?: number;
      cardio?: number;
      peak?: number;
    };
  };
  sleep?: {
    duration?: number;
    deep?: number;
    light?: number;
    rem?: number;
    awake?: number;
    score?: number;
  };
  stress_level?: number;
  data_json?: any;
  created_at: string;
};

// Funciones para medidas corporales
export const getBodyMeasurements = async (
  userId: string,
  options?: {
    limit?: number;
    orderBy?: { column: string; ascending: boolean };
    dateRange?: { from: string; to: string };
  }
): Promise<QueryResponse<BodyMeasurement[]>> => {
  try {
    let query = supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId);

    // Aplicar rango de fechas si se proporciona
    if (options?.dateRange) {
      query = query
        .gte('date', options.dateRange.from)
        .lte('date', options.dateRange.to);
    }

    // Aplicar ordenamiento si se proporciona
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
    } else {
      query = query.order('date', { ascending: false });
    }

    // Aplicar límite si se proporciona
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    return { data: data as BodyMeasurement[], error };
  } catch (e) {
    console.error(`Error en getBodyMeasurements para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getBodyMeasurements')
    };
  }
};

export const getLatestBodyMeasurement = async (
  userId: string
): Promise<QueryResponse<BodyMeasurement>> => {
  try {
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return { data: data as BodyMeasurement, error };
  } catch (e) {
    console.error(`Error en getLatestBodyMeasurement para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getLatestBodyMeasurement')
    };
  }
};

export const addBodyMeasurement = async (
  measurement: Omit<BodyMeasurement, 'id' | 'created_at'>
): Promise<QueryResponse<BodyMeasurement>> => {
  try {
    const { data, error } = await supabase
      .from('body_measurements')
      .insert([measurement])
      .select()
      .single();

    return { data: data as BodyMeasurement, error };
  } catch (e) {
    console.error('Error en addBodyMeasurement:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en addBodyMeasurement')
    };
  }
};

export const updateBodyMeasurement = async (
  id: string,
  updates: Partial<BodyMeasurement>
): Promise<QueryResponse<BodyMeasurement>> => {
  try {
    const { data, error } = await supabase
      .from('body_measurements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data: data as BodyMeasurement, error };
  } catch (e) {
    console.error(`Error en updateBodyMeasurement para id=${id}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en updateBodyMeasurement')
    };
  }
};

export const deleteBodyMeasurement = async (
  id: string
): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteBodyMeasurement para id=${id}:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en deleteBodyMeasurement')
    };
  }
};

// Funciones para datos de wearables
export const saveWearableData = async (
  data: Omit<WearableData, 'id' | 'created_at'>
): Promise<QueryResponse<WearableData>> => {
  try {
    // Verificar si ya existe un registro para esta fecha y dispositivo
    const { data: existingData, error: checkError } = await supabase
      .from('wearable_data')
      .select('id')
      .eq('user_id', data.user_id)
      .eq('date', data.date)
      .eq('device_type', data.device_type)
      .maybeSingle();

    if (checkError) {
      return { data: null, error: checkError };
    }

    let result;

    if (existingData) {
      // Actualizar registro existente
      const { data: updatedData, error: updateError } = await supabase
        .from('wearable_data')
        .update(data)
        .eq('id', existingData.id)
        .select()
        .single();

      result = { data: updatedData as WearableData, error: updateError };
    } else {
      // Insertar nuevo registro
      const { data: newData, error: insertError } = await supabase
        .from('wearable_data')
        .insert([data])
        .select()
        .single();

      result = { data: newData as WearableData, error: insertError };
    }

    return result;
  } catch (e) {
    console.error('Error en saveWearableData:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en saveWearableData')
    };
  }
};

export const getWearableData = async (
  userId: string,
  options?: {
    deviceType?: string;
    limit?: number;
    dateRange?: { from: string; to: string };
  }
): Promise<QueryResponse<WearableData[]>> => {
  try {
    let query = supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId);

    // Filtrar por tipo de dispositivo si se proporciona
    if (options?.deviceType) {
      query = query.eq('device_type', options.deviceType);
    }

    // Aplicar rango de fechas si se proporciona
    if (options?.dateRange) {
      query = query
        .gte('date', options.dateRange.from)
        .lte('date', options.dateRange.to);
    }

    // Ordenar por fecha descendente
    query = query.order('date', { ascending: false });

    // Aplicar límite si se proporciona
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    return { data: data as WearableData[], error };
  } catch (e) {
    console.error(`Error en getWearableData para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getWearableData')
    };
  }
};

// Función para obtener datos de salud combinados (medidas corporales + wearables)
export const getHealthData = async (
  userId: string,
  options?: {
    dateRange?: { from: string; to: string };
    includeWearables?: boolean;
    deviceTypes?: string[];
  }
): Promise<QueryResponse<{
  bodyMeasurements: BodyMeasurement[];
  wearableData?: WearableData[];
}>> => {
  try {
    // Obtener medidas corporales
    const { data: bodyMeasurements, error: bodyError } = await getBodyMeasurements(userId, {
      dateRange: options?.dateRange,
      orderBy: { column: 'date', ascending: true }
    });

    if (bodyError) {
      return { data: null, error: bodyError };
    }

    // Si no se solicitan datos de wearables, devolver solo medidas corporales
    if (!options?.includeWearables) {
      return { data: { bodyMeasurements: bodyMeasurements || [] }, error: null };
    }

    // Obtener datos de wearables
    const { data: wearableData, error: wearableError } = await getWearableData(userId, {
      dateRange: options?.dateRange,
      deviceType: options?.deviceTypes?.length === 1 ? options.deviceTypes[0] : undefined
    });

    if (wearableError) {
      console.error('Error al obtener datos de wearables:', wearableError);
      // Devolver medidas corporales incluso si hay error en wearables
      return { 
        data: { bodyMeasurements: bodyMeasurements || [] }, 
        error: wearableError 
      };
    }

    // Filtrar por tipos de dispositivos si se proporcionan varios
    let filteredWearableData = wearableData || [];
    if (options?.deviceTypes && options.deviceTypes.length > 1) {
      filteredWearableData = filteredWearableData.filter(data => 
        options.deviceTypes?.includes(data.device_type)
      );
    }

    return {
      data: {
        bodyMeasurements: bodyMeasurements || [],
        wearableData: filteredWearableData
      },
      error: null
    };
  } catch (e) {
    console.error(`Error en getHealthData para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getHealthData')
    };
  }
};
