import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CopilotContext } from '@/lib/copilot-service';

/**
 * Endpoint para comunicarse con Microsoft Copilot Studio
 *
 * Este endpoint maneja las solicitudes al bot de Microsoft Copilot Studio
 * y devuelve las respuestas al cliente.
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener las cookies y crear el cliente de Supabase
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    // Verificar autenticación
    if (!session) {
      console.error('No session found in Copilot API');
      return NextResponse.json(
        { error: 'No autorizado. Por favor, inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    // Log session info for debugging
    console.log('Session found:', {
      userId: session.user.id,
      email: session.user.email,
      hasMetadata: !!session.user.user_metadata
    });

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Se requiere un mensaje' },
        { status: 400 }
      );
    }

    // Obtener información del usuario para enriquecer el contexto
    const userId = session.user.id;
    let userContext: CopilotContext = {
      userId,
      userName: session.user.user_metadata?.full_name || '',
      currentModule: context?.currentModule || ''
    };

    // Obtener preferencias del usuario desde Supabase
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('training_level, diet_preferences, goals')
      .eq('user_id', userId)
      .single();

    if (userProfile) {
      userContext = {
        ...userContext,
        trainingLevel: userProfile.training_level,
        dietPreferences: userProfile.diet_preferences,
        userGoals: userProfile.goals
      };
    }

    // En un entorno real, aquí se realizaría la llamada a la API de Microsoft Copilot Studio
    // Por ahora, simulamos la respuesta para desarrollo

    // Simulación de latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generar respuesta simulada
    const response = getMockResponse(message, userContext);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error details:', { message: errorMessage, stack: errorStack });

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Función temporal para simular respuestas del bot durante el desarrollo
 * En producción, esto sería reemplazado por llamadas reales a la API de Microsoft Copilot Studio
 */
function getMockResponse(message: string, context: CopilotContext) {
  const lowerMessage = message.toLowerCase();
  const userName = context.userName ? ` ${context.userName}` : '';

  // Respuestas personalizadas basadas en el contexto del usuario
  if (context.currentModule === 'training') {
    if (lowerMessage.includes('rutina') || lowerMessage.includes('ejercicio')) {
      return {
        message: `Basado en tu nivel de entrenamiento ${context.trainingLevel || 'actual'}, te recomendaría una rutina de entrenamiento enfocada en ${context.userGoals?.[0] || 'fuerza'}. ¿Te gustaría ver algunas opciones?`,
        suggestions: ['Ver rutinas recomendadas', 'Crear rutina personalizada', 'Registrar entrenamiento'],
        actions: [
          { type: 'link', label: 'Ver rutinas', value: '/training/routines' }
        ]
      };
    }
  }

  if (context.currentModule === 'nutrition') {
    if (lowerMessage.includes('comida') || lowerMessage.includes('dieta') || lowerMessage.includes('receta')) {
      const dietType = context.dietPreferences?.includes('vegetarian')
        ? 'vegetariana'
        : context.dietPreferences?.includes('vegan')
          ? 'vegana'
          : 'equilibrada';

      return {
        message: `Tengo algunas recomendaciones de alimentación ${dietType} que podrían ayudarte a alcanzar tus objetivos. ¿Quieres ver un plan alimenticio personalizado?`,
        suggestions: ['Ver plan alimenticio', 'Recetas recomendadas', 'Registrar comida'],
        actions: [
          { type: 'link', label: 'Plan alimenticio', value: '/nutrition/meal-plan' }
        ]
      };
    }
  }

  // Respuestas basadas en el módulo de entrenamiento
  if (lowerMessage.includes('entrena') || lowerMessage.includes('ejercicio') || lowerMessage.includes('rutina')) {
    return {
      message: `Puedo ayudarte con tu entrenamiento${userName}. ¿Qué te gustaría hacer?`,
      suggestions: ['Ver mis rutinas', 'Crear nueva rutina', 'Registrar entrenamiento'],
      actions: [
        { type: 'link', label: 'Ir a Entrenamiento', value: '/training' }
      ]
    };
  }

  // Respuestas basadas en el módulo de nutrición
  if (lowerMessage.includes('nutri') || lowerMessage.includes('comida') || lowerMessage.includes('dieta')) {
    return {
      message: `La nutrición es clave para alcanzar tus objetivos${userName}. ¿En qué puedo ayudarte?`,
      suggestions: ['Ver mi plan alimenticio', 'Registrar comida', 'Calcular calorías'],
      actions: [
        { type: 'link', label: 'Ir a Nutrición', value: '/nutrition' }
      ]
    };
  }

  // Respuestas para saludos
  if (lowerMessage.includes('hola') || lowerMessage.includes('saludos')) {
    return {
      message: `¡Hola${userName}! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?`,
      suggestions: ['Entrenamientos', 'Nutrición', 'Sueño', 'Bienestar']
    };
  }

  // Respuesta por defecto
  return {
    message: `Estoy aquí para ayudarte con tu bienestar${userName}. Puedo asistirte con entrenamientos, nutrición, sueño y hábitos saludables. ¿Podrías darme más detalles sobre lo que necesitas?`,
    suggestions: ['Entrenamientos', 'Nutrición', 'Sueño', 'Bienestar', 'Mis objetivos']
  };
}
