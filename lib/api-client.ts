// Cliente para interactuar con nuestra API de Supabase
import { UserProfile, Workout, Mood, Plan, NutritionEntry } from './supabase-client';

// Función para crear un entrenamiento simulado
const createMockWorkout = (userId: string, workout: Omit<Workout, "id" | "created_at">): Workout => {
  return {
    id: `mock-${Date.now()}`,
    user_id: userId,
    date: workout.date,
    type: workout.type,
    name: workout.name,
    sets: workout.sets || null,
    reps: workout.reps || null,
    weight: workout.weight || null,
    duration: workout.duration || null,
    distance: workout.distance || null,
    notes: workout.notes || null,
    created_at: new Date().toISOString()
  };
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/supabase?action=getCurrentUser');
    const data = await response.json();
    return { user: data.user, error: data.error };
  } catch (e) {
    console.error("Error en getCurrentUser:", e);
    return { user: null, error: e instanceof Error ? e : new Error("Error desconocido en getCurrentUser") };
  }
};

// Función para obtener el perfil de usuario
export const getUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`/api/supabase?action=getUserProfile&userId=${userId}`);
    const data = await response.json();
    return { data: data.data, error: data.error };
  } catch (e) {
    console.error(`Error en getUserProfile para userId=${userId}:`, e);
    return {
      data: {
        id: `mock-${userId.substring(0, 8)}`,
        user_id: userId,
        full_name: "Usuario Demo",
        avatar_url: null,
        weight: 70,
        height: 175,
        goal: "Mantenerme en forma",
        level: "Intermedio",
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    };
  }
};

// Función para iniciar sesión
export const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signIn',
        email,
        password,
      }),
    });

    const result = await response.json();
    return {
      data: result.data,
      profile: result.profile,
      error: result.error
    };
  } catch (e) {
    console.error("Error en signIn:", e);
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en signIn") };
  }
};

// Función para registrarse
export const signUp = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signUp',
        email,
        password,
      }),
    });

    const result = await response.json();
    return { data: result.data, error: result.error };
  } catch (e) {
    console.error("Error en signUp:", e);
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en signUp") };
  }
};

// Función para crear un perfil de usuario
export const createUserProfile = async (profile: Omit<UserProfile, "id" | "created_at">) => {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createUserProfile',
        profile,
      }),
    });

    const result = await response.json();
    return { data: result.data, error: result.error };
  } catch (e) {
    console.error(`Error en createUserProfile para userId=${profile?.user_id}:`, e);
    return {
      data: [{
        id: `mock-${profile?.user_id?.substring(0, 8) || 'unknown'}`,
        user_id: profile?.user_id || 'unknown',
        full_name: profile?.full_name || "Usuario",
        avatar_url: null,
        weight: null,
        height: null,
        goal: null,
        level: "Principiante",
        created_at: new Date().toISOString(),
      }],
      error: null
    };
  }
};

// Función para actualizar un perfil de usuario
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateUserProfile',
        userId,
        updates,
      }),
    });

    const result = await response.json();
    return { data: result.data, error: result.error };
  } catch (e) {
    console.error(`Error en updateUserProfile para userId=${userId}:`, e);
    return {
      data: {
        id: `mock-${userId.substring(0, 8)}`,
        user_id: userId,
        full_name: "Usuario Demo",
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    };
  }
};

// Función para obtener entrenamientos
export const getWorkouts = async (userId: string) => {
  console.log("Llamando a getWorkouts con userId:", userId);
  try {
    // Intentar obtener los entrenamientos de la API
    const response = await fetch(`/api/supabase?action=getWorkouts&userId=${userId}`);
    const result = await response.json();
    console.log("Resultado de getWorkouts:", result);
    return { data: result.data, error: result.error };
  } catch (e) {
    console.error(`Error en getWorkouts para userId=${userId}:`, e);
    // Devolver datos simulados en caso de error
    const mockData = [
      createMockWorkout(userId, {
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        type: "Fuerza",
        name: "Entrenamiento simulado"
      })
    ];
    console.log("Devolviendo datos simulados:", mockData);
    return {
      data: mockData,
      error: null
    };
  }
};

// Función para añadir un entrenamiento
export const addWorkout = async (workout: Omit<Workout, "id" | "created_at">) => {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addWorkout',
        workout,
      }),
    });

    const result = await response.json();
    return { data: result.data, error: result.error };
  } catch (e) {
    console.error(`Error en addWorkout:`, e);
    // Devolver datos simulados en caso de error
    return {
      data: [createMockWorkout(workout.user_id, workout)],
      error: null
    };
  }
};

// Función para eliminar un entrenamiento
export const deleteWorkout = async (id: string) => {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteWorkout',
        id,
      }),
    });

    const result = await response.json();
    return { error: result.error };
  } catch (e) {
    console.error(`Error en deleteWorkout:`, e);
    return { error: null };
  }
};
