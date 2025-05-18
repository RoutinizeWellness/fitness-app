import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AssistantContext, AssistantMessage } from '@/lib/services/ai-assistant-service';
import OpenAI from 'openai';

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Endpoint para comunicarse con el asistente de IA basado en OpenAI
 * 
 * Este endpoint maneja las solicitudes al asistente de IA y devuelve las respuestas al cliente.
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    // Verificar autenticación
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { message, context, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Se requiere un mensaje' },
        { status: 400 }
      );
    }

    // Obtener información del usuario para enriquecer el contexto
    const userId = session.user.id;
    let userContext: AssistantContext = {
      userId,
      userName: session.user.user_metadata?.full_name || '',
      currentModule: context?.currentModule || ''
    };

    // Fusionar con el contexto proporcionado
    if (context) {
      userContext = { ...userContext, ...context };
    }

    // Obtener preferencias del usuario desde Supabase si no están en el contexto
    if (!userContext.trainingLevel || !userContext.dietPreferences || !userContext.userGoals) {
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
    }

    // Preparar mensajes para OpenAI
    const messages = prepareMessagesForOpenAI(message, userContext, history);

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Procesar la respuesta de OpenAI
    const aiResponse = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
    
    // Analizar la respuesta para extraer sugerencias y acciones
    const processedResponse = processAIResponse(aiResponse, userContext);

    return NextResponse.json({ response: processedResponse });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Prepara los mensajes para enviar a OpenAI
 */
function prepareMessagesForOpenAI(
  userMessage: string, 
  context: AssistantContext,
  history: AssistantMessage[] = []
): any[] {
  // Mensaje del sistema con instrucciones y contexto
  const systemMessage = {
    role: "system",
    content: `Eres un asistente de fitness y bienestar llamado Routinize AI. Tu objetivo es ayudar al usuario a alcanzar sus objetivos de salud y fitness.
    
Información del usuario:
- Nombre: ${context.userName || 'Usuario'}
- Nivel de entrenamiento: ${context.trainingLevel || 'No especificado'}
- Preferencias dietéticas: ${context.dietPreferences?.join(', ') || 'No especificadas'}
- Objetivos: ${context.userGoals?.join(', ') || 'No especificados'}
- Módulo actual: ${context.currentModule || 'No especificado'}

Debes ser amigable, motivador y proporcionar información precisa sobre fitness, nutrición, sueño y bienestar general. Tus respuestas deben ser concisas (máximo 3 párrafos) y personalizadas según el contexto del usuario.

Cuando respondas, puedes sugerir acciones específicas que el usuario puede realizar en la aplicación, como ver rutinas de entrenamiento, registrar comidas, etc.

Responde en español y adapta tu tono para ser motivador pero respetuoso.`
  };

  // Convertir el historial de conversación al formato esperado por OpenAI
  const historyMessages = history.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Mensaje del usuario actual
  const currentUserMessage = {
    role: "user",
    content: userMessage
  };

  // Combinar todos los mensajes
  return [systemMessage, ...historyMessages, currentUserMessage];
}

/**
 * Procesa la respuesta de OpenAI para extraer sugerencias y acciones
 */
function processAIResponse(aiResponse: string, context: AssistantContext) {
  // Respuesta básica
  const response = {
    message: aiResponse,
    suggestions: [] as string[],
    actions: [] as any[]
  };

  // Generar sugerencias basadas en el contexto y la respuesta
  if (context.currentModule === 'training' || aiResponse.toLowerCase().includes('entrenamiento') || aiResponse.toLowerCase().includes('ejercicio')) {
    response.suggestions = ['Ver mis rutinas', 'Crear nueva rutina', 'Registrar entrenamiento'];
    response.actions = [
      { type: 'link', label: 'Ir a Entrenamiento', value: '/training' }
    ];
  } else if (context.currentModule === 'nutrition' || aiResponse.toLowerCase().includes('nutrición') || aiResponse.toLowerCase().includes('comida') || aiResponse.toLowerCase().includes('dieta')) {
    response.suggestions = ['Ver mi plan alimenticio', 'Registrar comida', 'Calcular calorías'];
    response.actions = [
      { type: 'link', label: 'Ir a Nutrición', value: '/nutrition' }
    ];
  } else if (aiResponse.toLowerCase().includes('sueño') || aiResponse.toLowerCase().includes('dormir')) {
    response.suggestions = ['Ver estadísticas de sueño', 'Consejos para dormir mejor'];
    response.actions = [
      { type: 'link', label: 'Ir a Sueño', value: '/sleep' }
    ];
  } else if (aiResponse.toLowerCase().includes('bienestar') || aiResponse.toLowerCase().includes('estrés') || aiResponse.toLowerCase().includes('meditación')) {
    response.suggestions = ['Ejercicios de respiración', 'Meditación guiada', 'Técnicas anti-estrés'];
    response.actions = [
      { type: 'link', label: 'Ir a Bienestar', value: '/wellness' }
    ];
  } else {
    // Sugerencias por defecto
    response.suggestions = ['Entrenamientos', 'Nutrición', 'Sueño', 'Bienestar'];
  }

  return response;
}
