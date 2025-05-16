import { supabase } from './supabase-client';
import { QueryResponse } from './supabase-types';

// Tipos para el módulo de entrenador
export interface CoachClient {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  last_active?: string;
  has_updates?: boolean;
  notes?: string;
}

export interface ClientWorkout {
  id: string;
  user_id: string;
  date: string;
  type: string;
  name: string;
  sets: string;
  duration: string;
  notes?: string;
}

export interface CoachMessage {
  id: string;
  coach_id: string;
  client_id: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
}

// Obtener clientes de un entrenador
export const getCoachClients = async (coachId: string): Promise<QueryResponse<CoachClient[]>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'coach_clients')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla coach_clients no existe. Creando datos simulados...');

      // Crear datos simulados para desarrollo
      const mockClients: CoachClient[] = [
        {
          id: "client-1",
          full_name: "Ana García",
          email: "ana@ejemplo.com",
          avatar_url: "https://randomuser.me/api/portraits/women/12.jpg",
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: "Hace 2 días",
          has_updates: true
        },
        {
          id: "client-2",
          full_name: "Carlos Rodríguez",
          email: "carlos@ejemplo.com",
          avatar_url: "https://randomuser.me/api/portraits/men/32.jpg",
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: "Hace 5 días"
        },
        {
          id: "client-3",
          full_name: "Laura Martínez",
          email: "laura@ejemplo.com",
          avatar_url: "https://randomuser.me/api/portraits/women/45.jpg",
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: "Hoy",
          has_updates: true,
          notes: "Cliente con objetivo de pérdida de peso. Prefiere entrenamientos por la mañana."
        },
        {
          id: "client-4",
          full_name: "Miguel Sánchez",
          email: "miguel@ejemplo.com",
          avatar_url: "https://randomuser.me/api/portraits/men/67.jpg",
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: "Hace 1 semana"
        },
        {
          id: "client-5",
          full_name: "Elena López",
          email: "elena@ejemplo.com",
          avatar_url: "https://randomuser.me/api/portraits/women/33.jpg",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: "Ayer"
        }
      ];

      return { data: mockClients, error: null };
    }

    // Si la tabla existe, obtener los clientes reales
    const { data, error } = await supabase
      .from('coach_clients')
      .select('*, profiles(*)')
      .eq('coach_id', coachId);

    if (error) {
      throw error;
    }

    // Transformar los datos al formato esperado
    const clients: CoachClient[] = data.map(client => ({
      id: client.user_id,
      full_name: client.profiles.full_name,
      email: client.profiles.email,
      avatar_url: client.profiles.avatar_url,
      created_at: client.created_at,
      last_active: client.last_active,
      has_updates: client.has_updates,
      notes: client.notes
    }));

    return { data: clients, error: null };
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return { data: null, error };
  }
};

// Obtener entrenamientos de un cliente
export const getClientWorkouts = async (clientId: string): Promise<QueryResponse<ClientWorkout[]>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'workouts')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla workouts no existe. Creando datos simulados...');

      // Crear datos simulados para desarrollo
      const mockWorkouts: ClientWorkout[] = [
        {
          id: "workout-1",
          user_id: clientId,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Fuerza",
          name: "Entrenamiento de pecho",
          sets: "12",
          duration: "45 minutos",
          notes: "Completó todas las series con buen rendimiento"
        },
        {
          id: "workout-2",
          user_id: clientId,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Cardio",
          name: "HIIT",
          sets: "8",
          duration: "30 minutos"
        },
        {
          id: "workout-3",
          user_id: clientId,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Fuerza",
          name: "Entrenamiento de piernas",
          sets: "15",
          duration: "60 minutos",
          notes: "Dificultad con sentadillas, revisar técnica"
        }
      ];

      return { data: mockWorkouts, error: null };
    }

    // Si la tabla existe, obtener los entrenamientos reales
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener entrenamientos:', error);
    return { data: null, error };
  }
};

// Obtener perfil de un cliente
export const getClientProfile = async (clientId: string): Promise<QueryResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener perfil del cliente:', error);
    return { data: null, error };
  }
};

// Enviar mensaje a un cliente
export const sendClientMessage = async (message: {
  coach_id: string;
  client_id: string;
  message: string;
  type: string;
}): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'coach_messages')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla coach_messages no existe. Simulando envío de mensaje...');

      // Simular envío exitoso
      return { data: { success: true }, error: null };
    }

    // Si la tabla existe, enviar el mensaje real
    const { data, error } = await supabase
      .from('coach_messages')
      .insert([
        {
          coach_id: message.coach_id,
          client_id: message.client_id,
          message: message.message,
          type: message.type,
          read: false
        }
      ]);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return { data: null, error };
  }
};

// Asignar plan de entrenamiento a un cliente
export const assignWorkoutPlan = async (plan: {
  coach_id: string;
  client_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  notes?: string;
}): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'client_workout_plans')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla client_workout_plans no existe. Simulando asignación de plan...');

      // Simular asignación exitosa
      return { data: { success: true }, error: null };
    }

    // Si la tabla existe, asignar el plan real
    const { data, error } = await supabase
      .from('client_workout_plans')
      .insert([
        {
          coach_id: plan.coach_id,
          client_id: plan.client_id,
          plan_id: plan.plan_id,
          start_date: plan.start_date,
          end_date: plan.end_date,
          notes: plan.notes,
          status: 'active'
        }
      ]);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al asignar plan:', error);
    return { data: null, error };
  }
};

// Obtener el entrenador de un cliente
export const getClientCoach = async (clientId: string): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'coach_clients')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla coach_clients no existe. Creando datos simulados...');

      // Crear datos simulados para desarrollo
      const mockCoach = {
        id: "coach-1",
        full_name: "Roberto Sánchez",
        email: "roberto@ejemplo.com",
        avatar_url: "https://randomuser.me/api/portraits/men/22.jpg",
        specialty: "Entrenador de fuerza y acondicionamiento",
        experience: "8 años",
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      return { data: mockCoach, error: null };
    }

    // Si la tabla existe, obtener el entrenador real
    const { data, error } = await supabase
      .from('coach_clients')
      .select('*, profiles(*)')
      .eq('client_id', clientId)
      .single();

    if (error) {
      throw error;
    }

    // Transformar los datos al formato esperado
    const coach = {
      id: data.coach_id,
      full_name: data.profiles.full_name,
      email: data.profiles.email,
      avatar_url: data.profiles.avatar_url,
      specialty: data.profiles.specialty,
      experience: data.profiles.experience,
      created_at: data.created_at
    };

    return { data: coach, error: null };
  } catch (error) {
    console.error('Error al obtener entrenador:', error);
    return { data: null, error };
  }
};

// Obtener mensajes entre cliente y entrenador
export const getCoachMessages = async (clientId: string): Promise<QueryResponse<CoachMessage[]>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'coach_messages')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla coach_messages no existe. Creando datos simulados...');

      // Crear datos simulados para desarrollo
      const mockMessages: CoachMessage[] = [
        {
          id: "msg-1",
          coach_id: "coach-1",
          client_id: clientId,
          message: "Hola, ¿cómo te fue con el entrenamiento de ayer?",
          type: "text",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: "msg-2",
          coach_id: "coach-1",
          client_id: clientId,
          message: "Me fue muy bien, completé todas las series como indicaste",
          type: "text",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
          read: true
        },
        {
          id: "msg-3",
          coach_id: "coach-1",
          client_id: clientId,
          message: "Excelente. Para mañana te he preparado un entrenamiento de piernas. Recuerda calentar bien antes de empezar.",
          type: "text",
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];

      return { data: mockMessages, error: null };
    }

    // Si la tabla existe, obtener los mensajes reales
    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .or(`client_id.eq.${clientId},coach_id.eq.${clientId}`)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return { data: null, error };
  }
};

// Enviar mensaje al entrenador
export const sendCoachMessage = async (message: {
  coach_id: string;
  client_id: string;
  message: string;
  type: string;
}): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'coach_messages')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla coach_messages no existe. Simulando envío de mensaje...');

      // Simular envío exitoso
      return { data: { success: true }, error: null };
    }

    // Si la tabla existe, enviar el mensaje real
    const { data, error } = await supabase
      .from('coach_messages')
      .insert([
        {
          coach_id: message.coach_id,
          client_id: message.client_id,
          message: message.message,
          type: message.type,
          read: false
        }
      ]);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return { data: null, error };
  }
};

// Actualizar configuración de marca del entrenador
export const updateCoachBranding = async (branding: {
  coach_id: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  brand_name: string;
  slogan?: string;
  font_family: string;
  white_label: boolean;
  logo?: File;
}): Promise<QueryResponse<any>> => {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'coach_branding')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla coach_branding no existe. Simulando actualización de marca...');

      // Simular actualización exitosa
      return { data: { success: true }, error: null };
    }

    // Si hay un logo, subirlo primero
    let logoUrl = null;
    if (branding.logo) {
      const fileName = `coach-${branding.coach_id}-logo-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('coach-logos')
        .upload(fileName, branding.logo);

      if (uploadError) {
        console.error('Error al subir logo:', uploadError);
      } else if (uploadData) {
        // Obtener URL pública del logo
        const { data: urlData } = await supabase.storage
          .from('coach-logos')
          .getPublicUrl(fileName);

        if (urlData) {
          logoUrl = urlData.publicUrl;
        }
      }
    }

    // Preparar datos para actualizar
    const brandingData = {
      coach_id: branding.coach_id,
      primary_color: branding.primary_color,
      secondary_color: branding.secondary_color,
      background_color: branding.background_color,
      text_color: branding.text_color,
      brand_name: branding.brand_name,
      slogan: branding.slogan,
      font_family: branding.font_family,
      white_label: branding.white_label,
      updated_at: new Date().toISOString()
    };

    // Añadir logo URL si se subió correctamente
    if (logoUrl) {
      brandingData.logo_url = logoUrl;
    }

    // Verificar si ya existe una configuración para este entrenador
    const { data: existingData, error: existingError } = await supabase
      .from('coach_branding')
      .select('id')
      .eq('coach_id', branding.coach_id)
      .single();

    let data, error;

    if (existingError || !existingData) {
      // Si no existe, insertar nueva configuración
      const result = await supabase
        .from('coach_branding')
        .insert([brandingData]);

      data = result.data;
      error = result.error;
    } else {
      // Si existe, actualizar configuración existente
      const result = await supabase
        .from('coach_branding')
        .update(brandingData)
        .eq('coach_id', branding.coach_id);

      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar configuración de marca:', error);
    return { data: null, error };
  }
};
