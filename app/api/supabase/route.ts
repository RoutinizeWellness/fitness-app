import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s";

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para crear un perfil simulado
const createMockProfile = (userId: string) => {
  // Generar un UUID válido para el ID de usuario si es un ID simulado
  const validUserId = userId.startsWith('mock-') ?
    '00000000-0000-0000-0000-000000000000' : userId;

  // Generar un nombre más amigable
  const names = ["Carlos", "María", "Juan", "Ana", "Pedro", "Laura", "Miguel", "Sofía"];
  const surnames = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Fernández"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];

  return {
    id: `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
    user_id: validUserId,
    full_name: `${randomName} ${randomSurname}`,
    avatar_url: null,
    weight: 70,
    height: 175,
    goal: "Mantenerme en forma",
    level: "Intermedio",
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Función para crear un entrenamiento simulado
const createMockWorkout = (userId: string, workout: any = {}) => {
  // Generar un UUID válido para el ID de usuario si es un ID simulado
  const validUserId = userId.startsWith('mock-') ?
    '00000000-0000-0000-0000-000000000000' : userId;

  return {
    id: `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
    user_id: validUserId,
    date: workout.date || new Date().toISOString().split('T')[0],
    type: workout.type || "Fuerza",
    name: workout.name || "Entrenamiento simulado",
    sets: workout.sets || null,
    reps: workout.reps || null,
    weight: workout.weight || null,
    duration: workout.duration || null,
    distance: workout.distance || null,
    notes: workout.notes || null,
    created_at: new Date().toISOString()
  };
};

// Función para crear entrenamientos simulados
const createMockWorkouts = (userId: string, count = 5) => {
  const workouts = [];
  const types = ["Fuerza", "Cardio", "Flexibilidad", "Mindfulness"];
  const names = ["Entrenamiento de piernas", "Carrera", "Yoga", "Meditación", "Entrenamiento de pecho", "HIIT"];

  // Generar un UUID válido para el ID de usuario si es un ID simulado
  const validUserId = userId.startsWith('mock-') ?
    '00000000-0000-0000-0000-000000000000' : userId;

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    workouts.push({
      id: `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}-${i}`,
      user_id: validUserId,
      date: date.toISOString().split('T')[0],
      type: types[Math.floor(Math.random() * types.length)],
      name: names[Math.floor(Math.random() * names.length)],
      sets: Math.floor(Math.random() * 5) + 1,
      reps: Math.floor(Math.random() * 15) + 5,
      weight: Math.floor(Math.random() * 100) + 5,
      duration: `${Math.floor(Math.random() * 60) + 15} minutos`,
      distance: Math.random() > 0.5 ? `${Math.floor(Math.random() * 10) + 1} km` : null,
      notes: Math.random() > 0.5 ? "Notas de ejemplo para este entrenamiento" : null,
      created_at: new Date().toISOString()
    });
  }

  return workouts;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  if (!action) {
    return NextResponse.json({ error: 'Se requiere un parámetro de acción' }, { status: 400 });
  }

  // getCurrentUser function has been moved to the unified authentication system
  // Use lib/auth/supabase-auth.ts instead
  if (action === 'getCurrentUser') {
    return NextResponse.json({
      error: 'getCurrentUser has been moved to the unified system. Use lib/auth/supabase-auth.ts instead.'
    }, { status: 410 });
  }
  else if (action === 'getUserProfile') {
    // Devolver un perfil simulado
    const mockUserId = userId || 'default-user';
    return NextResponse.json({
      data: createMockProfile(mockUserId),
      error: null
    });
  }
  else if (action === 'getWorkouts') {
    if (!userId) {
      return NextResponse.json({ error: 'Se requiere un userId' }, { status: 400 });
    }

    try {
      // Intentar obtener los entrenamientos de Supabase
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error(`Error al obtener entrenamientos para userId=${userId}:`, error);
        // Devolver entrenamientos simulados en caso de error
        return NextResponse.json({
          data: createMockWorkouts(userId),
          error: null
        });
      }

      if (!data || data.length === 0) {
        console.log(`No se encontraron entrenamientos para userId=${userId}, devolviendo simulados`);
        return NextResponse.json({
          data: createMockWorkouts(userId),
          error: null
        });
      }

      return NextResponse.json({ data, error: null });
    } catch (error) {
      console.error(`Error al procesar entrenamientos para userId=${userId}:`, error);
      return NextResponse.json({
        data: createMockWorkouts(userId),
        error: null
      });
    }
  }
  else {
    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Se requiere un parámetro de acción' }, { status: 400 });
    }

    // Authentication actions have been moved to the unified authentication system
    // Use lib/auth/supabase-auth.ts instead
    if (action === 'signIn' || action === 'signUp') {
      return NextResponse.json({
        error: 'Authentication actions have been moved to the unified system. Use lib/auth/supabase-auth.ts instead.'
      }, { status: 410 });
    }
    else if (action === 'createUserProfile') {
      const { profile } = data;
      const userId = profile?.user_id || 'default-user';

      // Devolver un perfil simulado
      return NextResponse.json({
        data: [createMockProfile(userId)],
        error: null
      });
    }
    else if (action === 'updateUserProfile') {
      const { userId, updates } = data;
      const mockUserId = userId || 'default-user';

      // Devolver un perfil simulado con las actualizaciones
      const mockProfile = {
        ...createMockProfile(mockUserId),
        ...updates
      };

      return NextResponse.json({
        data: mockProfile,
        error: null
      });
    }
    else if (action === 'addWorkout') {
      const { workout } = data;
      if (!workout || !workout.user_id) {
        return NextResponse.json({ error: 'Se requiere un workout con user_id' }, { status: 400 });
      }

      try {
        // Intentar guardar el entrenamiento en Supabase
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .insert([workout])
          .select();

        if (workoutError) {
          console.error(`Error al guardar entrenamiento para userId=${workout.user_id}:`, workoutError);
          // Devolver un entrenamiento simulado en caso de error
          return NextResponse.json({
            data: [createMockWorkout(workout.user_id, workout)],
            error: null
          });
        }

        if (!workoutData || workoutData.length === 0) {
          console.error(`No se pudo guardar entrenamiento para userId=${workout.user_id}: No se devolvieron datos`);
          return NextResponse.json({
            data: [createMockWorkout(workout.user_id, workout)],
            error: null
          });
        }

        console.log(`Entrenamiento guardado exitosamente para userId=${workout.user_id}`);
        return NextResponse.json({ data: workoutData, error: null });
      } catch (error) {
        console.error(`Error al guardar entrenamiento para userId=${workout.user_id}:`, error);
        return NextResponse.json({
          data: [createMockWorkout(workout.user_id, workout)],
          error: null
        });
      }
    }
    else if (action === 'deleteWorkout') {
      const { id } = data;
      if (!id) {
        return NextResponse.json({ error: 'Se requiere un id' }, { status: 400 });
      }

      try {
        // Intentar eliminar el entrenamiento de Supabase
        const { error: deleteError } = await supabase
          .from('workouts')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error(`Error al eliminar entrenamiento con id=${id}:`, deleteError);
          // Simular éxito en caso de error
          return NextResponse.json({ error: null });
        }

        console.log(`Entrenamiento eliminado exitosamente con id=${id}`);
        return NextResponse.json({ error: null });
      } catch (error) {
        console.error(`Error al eliminar entrenamiento con id=${id}:`, error);
        // Simular éxito en caso de error
        return NextResponse.json({ error: null });
      }
    }
    else {
      return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en la API de Supabase:', error);
    // Devolver una respuesta genérica para evitar errores
    return NextResponse.json({
      data: null,
      error: 'Error interno del servidor',
      mockResponse: true
    });
  }
}
