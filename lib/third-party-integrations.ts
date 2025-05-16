import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { QueryResponse } from './supabase-types';

// Tipos para integraciones de terceros
export interface ThirdPartyIntegration {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  scopes?: string[];
  status: 'active' | 'expired' | 'revoked';
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationData {
  provider: string;
  data: any;
  timestamp: string;
  type: 'nutrition' | 'workout' | 'sleep' | 'activity' | 'weight' | 'other';
}

// Proveedores soportados
export const SUPPORTED_PROVIDERS = [
  {
    id: 'myfitnesspal',
    name: 'MyFitnessPal',
    icon: '/icons/myfitnesspal.svg',
    description: 'Sincroniza tus datos de nutrición y calorías',
    dataTypes: ['nutrition', 'weight'],
    authUrl: 'https://www.myfitnesspal.com/oauth2/authorize',
    scopes: ['diary', 'measurements'],
  },
  {
    id: 'strava',
    name: 'Strava',
    icon: '/icons/strava.svg',
    description: 'Sincroniza tus actividades y entrenamientos',
    dataTypes: ['workout', 'activity'],
    authUrl: 'https://www.strava.com/oauth/authorize',
    scopes: ['read,activity:read_all,profile:read_all'],
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    icon: '/icons/garmin.svg',
    description: 'Sincroniza tus datos de actividad y sueño',
    dataTypes: ['activity', 'sleep', 'workout'],
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    scopes: ['activity', 'sleep'],
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: '/icons/fitbit.svg',
    description: 'Sincroniza tus datos de actividad, sueño y ritmo cardíaco',
    dataTypes: ['activity', 'sleep', 'workout'],
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    scopes: ['activity', 'heartrate', 'sleep', 'weight'],
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    icon: '/icons/apple-health.svg',
    description: 'Sincroniza tus datos de salud y actividad',
    dataTypes: ['activity', 'sleep', 'workout', 'nutrition', 'weight'],
    authUrl: null, // Requiere integración nativa
    scopes: [],
  },
  {
    id: 'google_fit',
    name: 'Google Fit',
    icon: '/icons/google-fit.svg',
    description: 'Sincroniza tus datos de actividad y salud',
    dataTypes: ['activity', 'sleep', 'workout', 'weight'],
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    scopes: ['https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.body.read'],
  },
];

// Obtener integraciones de un usuario
export async function getUserIntegrations(userId: string): Promise<QueryResponse<ThirdPartyIntegration[]>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'third_party_integrations')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla third_party_integrations no existe. Creando datos simulados...');
      
      // Crear datos simulados para desarrollo
      const mockIntegrations: ThirdPartyIntegration[] = [
        {
          id: uuidv4(),
          user_id: userId,
          provider: 'strava',
          provider_user_id: 'strava_123456',
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          scopes: ['read', 'activity:read_all'],
          status: 'active',
          last_sync_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return { data: mockIntegrations, error: null };
    }

    // Si la tabla existe, obtener las integraciones reales
    const { data, error } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener integraciones:', error);
    return { data: null, error };
  }
}

// Conectar una nueva integración
export async function connectIntegration(
  userId: string,
  provider: string,
  authData: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    provider_user_id?: string;
    scopes?: string[];
  }
): Promise<QueryResponse<ThirdPartyIntegration>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'third_party_integrations')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla third_party_integrations no existe. Simulando conexión...');
      
      // Simular conexión exitosa
      const mockIntegration: ThirdPartyIntegration = {
        id: uuidv4(),
        user_id: userId,
        provider,
        provider_user_id: authData.provider_user_id || `${provider}_user_${Date.now()}`,
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        token_expires_at: authData.expires_in 
          ? new Date(Date.now() + authData.expires_in * 1000).toISOString() 
          : undefined,
        scopes: authData.scopes,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { data: mockIntegration, error: null };
    }

    // Verificar si ya existe una integración para este proveedor
    const { data: existingIntegration, error: checkError } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('status', 'active')
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    // Calcular fecha de expiración del token
    const tokenExpiresAt = authData.expires_in 
      ? new Date(Date.now() + authData.expires_in * 1000).toISOString() 
      : undefined;

    let result;
    
    if (existingIntegration) {
      // Actualizar integración existente
      result = await supabase
        .from('third_party_integrations')
        .update({
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          token_expires_at: tokenExpiresAt,
          scopes: authData.scopes,
          provider_user_id: authData.provider_user_id || existingIntegration.provider_user_id,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id)
        .select()
        .single();
    } else {
      // Crear nueva integración
      result = await supabase
        .from('third_party_integrations')
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            provider,
            provider_user_id: authData.provider_user_id,
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            token_expires_at: tokenExpiresAt,
            scopes: authData.scopes,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error al conectar integración:', error);
    return { data: null, error };
  }
}

// Desconectar una integración
export async function disconnectIntegration(
  userId: string,
  provider: string
): Promise<QueryResponse<any>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'third_party_integrations')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla third_party_integrations no existe. Simulando desconexión...');
      
      // Simular desconexión exitosa
      return { data: { success: true }, error: null };
    }

    // Actualizar el estado de la integración a 'revoked'
    const { data, error } = await supabase
      .from('third_party_integrations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error al desconectar integración:', error);
    return { data: null, error };
  }
}

// Sincronizar datos de una integración
export async function syncIntegrationData(
  userId: string,
  provider: string,
  options?: {
    dataTypes?: string[];
    startDate?: string;
    endDate?: string;
  }
): Promise<QueryResponse<any>> {
  try {
    // Obtener la integración
    const { data: integration, error: integrationError } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('status', 'active')
      .single();

    if (integrationError) {
      throw integrationError;
    }

    if (!integration) {
      return {
        data: null,
        error: new Error(`No hay una integración activa con ${provider}`)
      };
    }

    // Verificar si el token ha expirado
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      // Intentar renovar el token
      const refreshResult = await refreshIntegrationToken(userId, provider);
      
      if (refreshResult.error) {
        return {
          data: null,
          error: new Error(`El token de acceso ha expirado y no se pudo renovar: ${refreshResult.error.message}`)
        };
      }
    }

    // Implementar la sincronización específica para cada proveedor
    let syncResult;
    
    switch (provider) {
      case 'myfitnesspal':
        syncResult = await syncMyFitnessPalData(integration, options);
        break;
      case 'strava':
        syncResult = await syncStravaData(integration, options);
        break;
      case 'fitbit':
        syncResult = await syncFitbitData(integration, options);
        break;
      case 'garmin':
        syncResult = await syncGarminData(integration, options);
        break;
      case 'google_fit':
        syncResult = await syncGoogleFitData(integration, options);
        break;
      default:
        return {
          data: null,
          error: new Error(`Proveedor no soportado: ${provider}`)
        };
    }

    if (syncResult.error) {
      throw syncResult.error;
    }

    // Actualizar la fecha de última sincronización
    await supabase
      .from('third_party_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id);

    return { data: syncResult.data, error: null };
  } catch (error) {
    console.error(`Error al sincronizar datos de ${provider}:`, error);
    return { data: null, error };
  }
}

// Renovar token de acceso
async function refreshIntegrationToken(
  userId: string,
  provider: string
): Promise<QueryResponse<any>> {
  try {
    // Obtener la integración
    const { data: integration, error: integrationError } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('status', 'active')
      .single();

    if (integrationError) {
      throw integrationError;
    }

    if (!integration || !integration.refresh_token) {
      return {
        data: null,
        error: new Error(`No hay una integración activa con ${provider} o no tiene refresh_token`)
      };
    }

    // Implementar la renovación específica para cada proveedor
    let refreshResult;
    
    switch (provider) {
      case 'myfitnesspal':
        refreshResult = await refreshMyFitnessPalToken(integration);
        break;
      case 'strava':
        refreshResult = await refreshStravaToken(integration);
        break;
      case 'fitbit':
        refreshResult = await refreshFitbitToken(integration);
        break;
      case 'garmin':
        refreshResult = await refreshGarminToken(integration);
        break;
      case 'google_fit':
        refreshResult = await refreshGoogleFitToken(integration);
        break;
      default:
        return {
          data: null,
          error: new Error(`Proveedor no soportado: ${provider}`)
        };
    }

    if (refreshResult.error) {
      throw refreshResult.error;
    }

    // Actualizar los tokens en la base de datos
    const { error: updateError } = await supabase
      .from('third_party_integrations')
      .update({
        access_token: refreshResult.data.access_token,
        refresh_token: refreshResult.data.refresh_token || integration.refresh_token,
        token_expires_at: refreshResult.data.expires_in 
          ? new Date(Date.now() + refreshResult.data.expires_in * 1000).toISOString() 
          : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id);

    if (updateError) {
      throw updateError;
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error(`Error al renovar token de ${provider}:`, error);
    return { data: null, error };
  }
}

// Implementaciones específicas para cada proveedor
// Estas funciones serían implementadas con las APIs específicas de cada servicio

async function syncMyFitnessPalData(integration: ThirdPartyIntegration, options?: any): Promise<QueryResponse<any>> {
  // Implementación simulada para desarrollo
  console.log(`Sincronizando datos de MyFitnessPal para el usuario ${integration.user_id}`);
  
  // Simular datos de nutrición
  const mockData = {
    diary: [
      {
        date: new Date().toISOString().split('T')[0],
        meals: {
          breakfast: [
            { name: 'Avena con leche', calories: 250, protein: 10, carbs: 40, fat: 5 },
            { name: 'Plátano', calories: 105, protein: 1, carbs: 27, fat: 0 }
          ],
          lunch: [
            { name: 'Ensalada de pollo', calories: 350, protein: 30, carbs: 15, fat: 18 },
            { name: 'Pan integral', calories: 80, protein: 3, carbs: 15, fat: 1 }
          ],
          dinner: [
            { name: 'Salmón a la plancha', calories: 300, protein: 25, carbs: 0, fat: 20 },
            { name: 'Verduras al vapor', calories: 70, protein: 2, carbs: 15, fat: 0 }
          ],
          snacks: [
            { name: 'Yogur griego', calories: 120, protein: 15, carbs: 5, fat: 3 },
            { name: 'Nueces', calories: 180, protein: 4, carbs: 4, fat: 18 }
          ]
        },
        totals: {
          calories: 1455,
          protein: 90,
          carbs: 121,
          fat: 65
        }
      }
    ]
  };
  
  return { data: mockData, error: null };
}

async function syncStravaData(integration: ThirdPartyIntegration, options?: any): Promise<QueryResponse<any>> {
  // Implementación simulada para desarrollo
  console.log(`Sincronizando datos de Strava para el usuario ${integration.user_id}`);
  
  // Simular datos de actividades
  const mockData = {
    activities: [
      {
        id: 'strava_activity_1',
        type: 'Run',
        name: 'Carrera matutina',
        start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        distance: 5200, // metros
        moving_time: 1800, // segundos
        elapsed_time: 1900, // segundos
        total_elevation_gain: 50, // metros
        average_speed: 2.89, // m/s
        max_speed: 3.5, // m/s
        average_heartrate: 155,
        max_heartrate: 175,
        calories: 450
      },
      {
        id: 'strava_activity_2',
        type: 'Ride',
        name: 'Ciclismo de fin de semana',
        start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        distance: 25000, // metros
        moving_time: 4500, // segundos
        elapsed_time: 5000, // segundos
        total_elevation_gain: 350, // metros
        average_speed: 5.56, // m/s
        max_speed: 12.2, // m/s
        average_heartrate: 145,
        max_heartrate: 165,
        calories: 850
      }
    ]
  };
  
  return { data: mockData, error: null };
}

async function syncFitbitData(integration: ThirdPartyIntegration, options?: any): Promise<QueryResponse<any>> {
  // Implementación simulada para desarrollo
  console.log(`Sincronizando datos de Fitbit para el usuario ${integration.user_id}`);
  
  // Simular datos de actividad y sueño
  const mockData = {
    activity: {
      steps: 8500,
      distance: 6.2, // km
      floors: 12,
      elevation: 36.6, // metros
      calories: {
        total: 2100,
        active: 750
      },
      active_minutes: {
        sedentary: 720,
        lightly_active: 180,
        fairly_active: 60,
        very_active: 45
      }
    },
    sleep: {
      main_sleep: {
        start_time: new Date(Date.now() - 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 60 * 1000).toISOString(),
        duration: 28800000, // 8 horas en ms
        efficiency: 85,
        stages: {
          deep: 5400000, // 1.5 horas en ms
          light: 14400000, // 4 horas en ms
          rem: 5400000, // 1.5 horas en ms
          wake: 3600000 // 1 hora en ms
        }
      }
    },
    heart_rate: {
      resting: 65,
      zones: [
        { name: 'Out of Range', min: 30, max: 91, minutes: 720 },
        { name: 'Fat Burn', min: 91, max: 127, minutes: 180 },
        { name: 'Cardio', min: 127, max: 154, minutes: 60 },
        { name: 'Peak', min: 154, max: 220, minutes: 15 }
      ]
    }
  };
  
  return { data: mockData, error: null };
}

async function syncGarminData(integration: ThirdPartyIntegration, options?: any): Promise<QueryResponse<any>> {
  // Implementación simulada para desarrollo
  console.log(`Sincronizando datos de Garmin para el usuario ${integration.user_id}`);
  
  // Simular datos
  const mockData = {
    activity: {
      steps: 9200,
      distance: 7.1, // km
      floors: 15,
      calories: 2300,
      active_calories: 820,
      intensity_minutes: 95
    },
    sleep: {
      duration: 7.5, // horas
      deep_sleep: 1.8, // horas
      light_sleep: 4.2, // horas
      rem_sleep: 1.5, // horas
      awake: 0.5, // horas
      sleep_score: 85
    },
    body: {
      weight: 75.5, // kg
      body_fat: 18.2, // porcentaje
      bmi: 24.1
    },
    stress: {
      average: 35,
      max: 65,
      rest_stress: 25
    }
  };
  
  return { data: mockData, error: null };
}

async function syncGoogleFitData(integration: ThirdPartyIntegration, options?: any): Promise<QueryResponse<any>> {
  // Implementación simulada para desarrollo
  console.log(`Sincronizando datos de Google Fit para el usuario ${integration.user_id}`);
  
  // Simular datos
  const mockData = {
    activity: {
      steps: 8800,
      distance: 6.7, // km
      calories: 2050,
      active_minutes: 110,
      heart_points: 85
    },
    workouts: [
      {
        type: 'running',
        start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        duration: 2700000, // 45 minutos en ms
        calories: 420,
        distance: 5500, // metros
        steps: 6200
      }
    ],
    body: {
      weight: 74.2, // kg
      height: 178, // cm
      bmi: 23.4
    }
  };
  
  return { data: mockData, error: null };
}

// Funciones para renovar tokens
async function refreshMyFitnessPalToken(integration: ThirdPartyIntegration): Promise<QueryResponse<any>> {
  // Implementación simulada
  return {
    data: {
      access_token: `new_mfp_token_${Date.now()}`,
      refresh_token: `new_mfp_refresh_${Date.now()}`,
      expires_in: 3600 * 24 * 30 // 30 días
    },
    error: null
  };
}

async function refreshStravaToken(integration: ThirdPartyIntegration): Promise<QueryResponse<any>> {
  // Implementación simulada
  return {
    data: {
      access_token: `new_strava_token_${Date.now()}`,
      refresh_token: `new_strava_refresh_${Date.now()}`,
      expires_in: 3600 * 6 // 6 horas
    },
    error: null
  };
}

async function refreshFitbitToken(integration: ThirdPartyIntegration): Promise<QueryResponse<any>> {
  // Implementación simulada
  return {
    data: {
      access_token: `new_fitbit_token_${Date.now()}`,
      refresh_token: `new_fitbit_refresh_${Date.now()}`,
      expires_in: 3600 * 24 // 24 horas
    },
    error: null
  };
}

async function refreshGarminToken(integration: ThirdPartyIntegration): Promise<QueryResponse<any>> {
  // Implementación simulada
  return {
    data: {
      access_token: `new_garmin_token_${Date.now()}`,
      refresh_token: `new_garmin_refresh_${Date.now()}`,
      expires_in: 3600 * 24 * 7 // 7 días
    },
    error: null
  };
}

async function refreshGoogleFitToken(integration: ThirdPartyIntegration): Promise<QueryResponse<any>> {
  // Implementación simulada
  return {
    data: {
      access_token: `new_googlefit_token_${Date.now()}`,
      refresh_token: `new_googlefit_refresh_${Date.now()}`,
      expires_in: 3600 // 1 hora
    },
    error: null
  };
}
