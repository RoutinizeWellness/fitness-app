import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Safety settings for the Gemini API
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * POST handler for Gemini API
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { message, context, history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Se requiere un mensaje' },
        { status: 400 }
      );
    }

    // Get user profile for context enrichment
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Get user's training profile for additional context
    const { data: trainingProfile } = await supabase
      .from('training_assessments')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Enrich context with user data
    const enrichedContext = {
      ...context,
      userId: session.user.id,
      userName: userProfile?.full_name || userProfile?.username,
      trainingLevel: trainingProfile?.experience_level || 'intermediate',
      userGoals: trainingProfile?.goals || [],
      dietPreferences: userProfile?.diet_preferences || [],
    };

    // Initialize Gemini API
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      );
    }

    // Import the rate limiter
    const { geminiRateLimiter } = await import('@/lib/gemini-rate-limiter');

    // Get rate limit status
    const rateLimitStatus = geminiRateLimiter.getRateLimitStatus();

    // If we're in backoff mode, return a limited status with fallback response
    if (rateLimitStatus.isBackingOff) {
      const backoffTimeRemaining = Math.max(0, rateLimitStatus.backoffUntil - Date.now());
      const backoffSeconds = Math.ceil(backoffTimeRemaining / 1000);

      console.log(`Gemini API in backoff mode. Returning fallback response. Retry in ${backoffSeconds}s`);

      return NextResponse.json({
        response: {
          message: `Lo siento, el asistente está experimentando alta demanda en este momento. Por favor, intenta de nuevo en ${backoffSeconds} segundos.`,
          suggestions: [
            "¿Qué ejercicios puedo hacer sin el asistente?",
            "Muéstrame rutinas predefinidas",
            "¿Cómo puedo seguir mi progreso manualmente?"
          ],
          limited: true,
          retryAfter: backoffSeconds
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings,
    });

    // Format chat history
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    }));

    // Create chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Add context to the prompt
    const promptWithContext = addContextToPrompt(message, enrichedContext);

    // Estimate token count (rough estimate: 1.5 tokens per word)
    const estimatedTokens = Math.ceil((promptWithContext.length +
      formattedHistory.reduce((sum, msg) => sum + msg.parts[0].text.length, 0)) * 1.5);

    try {
      // Send message to Gemini using rate limiter
      const result = await geminiRateLimiter.executeRequest(
        async () => chat.sendMessage(promptWithContext),
        5, // Medium priority for chat messages
        estimatedTokens
      );

      const responseText = result.response.text();

      // Extract suggestions if any
      const suggestions = extractSuggestions(responseText);

      // Return response
      return NextResponse.json({
        response: {
          message: responseText,
          suggestions,
        }
      });
    } catch (error: any) {
      console.error('Error al procesar la solicitud a Gemini:', error);

      // Check if it's a rate limit error
      if (error.message && (
          error.message.includes('429') ||
          error.message.includes('Too Many Requests') ||
          error.message.includes('quota') ||
          error.message.includes('rate limit')
      )) {
        // Extract retry delay if available
        let retryAfter = 60; // Default to 60 seconds
        const retryMatch = error.message.match(/retryDelay:"(\d+)s"/);
        if (retryMatch && retryMatch[1]) {
          retryAfter = parseInt(retryMatch[1], 10);
        }

        console.log(`Rate limit error detected. Suggesting retry after ${retryAfter} seconds`);

        return NextResponse.json({
          response: {
            message: `Lo siento, el asistente está experimentando alta demanda en este momento. Por favor, intenta de nuevo en ${retryAfter} segundos.`,
            suggestions: [
              "¿Qué ejercicios puedo hacer sin el asistente?",
              "Muéstrame rutinas predefinidas",
              "¿Cómo puedo seguir mi progreso manualmente?"
            ],
            limited: true,
            retryAfter
          }
        });
      }

      return NextResponse.json(
        {
          error: 'Error interno del servidor',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Add context to the user's prompt
 */
function addContextToPrompt(message: string, context: any): string {
  // Create a context string based on available information
  let contextStr = "Contexto del usuario:\n";

  if (context.userName) {
    contextStr += `- Nombre: ${context.userName}\n`;
  }

  if (context.trainingLevel) {
    contextStr += `- Nivel de entrenamiento: ${context.trainingLevel}\n`;
  }

  if (context.userGoals && context.userGoals.length > 0) {
    contextStr += `- Objetivos: ${context.userGoals.join(", ")}\n`;
  }

  if (context.dietPreferences && context.dietPreferences.length > 0) {
    contextStr += `- Preferencias dietéticas: ${context.dietPreferences.join(", ")}\n`;
  }

  if (context.currentModule) {
    contextStr += `- Módulo actual: ${context.currentModule}\n`;
  }

  return `${contextStr}\n\nConsulta del usuario: ${message}\n\nResponde en español, de manera concisa y útil. Si es apropiado, incluye una sección de "Sugerencias:" al final con 2-3 preguntas de seguimiento relacionadas.`;
}

/**
 * Extract suggested responses from the AI's reply
 */
function extractSuggestions(text: string): string[] {
  // Look for suggestions in the format "Sugerencias:" or similar patterns
  const suggestionsMatch = text.match(/Sugerencias:?\s*([\s\S]*?)(?:\n\n|$)/i);

  if (suggestionsMatch && suggestionsMatch[1]) {
    // Extract bullet points or numbered items
    const suggestions = suggestionsMatch[1]
      .split(/\n/)
      .map(line => line.replace(/^[-*•]|\d+\.\s*/, "").trim())
      .filter(item => item.length > 0);

    return suggestions;
  }

  return [];
}

/**
 * GET handler for Gemini API recommendations
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get request parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'general';

    // Initialize Gemini API
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      );
    }

    // Import the rate limiter
    const { geminiRateLimiter } = await import('@/lib/gemini-rate-limiter');

    // Get rate limit status
    const rateLimitStatus = geminiRateLimiter.getRateLimitStatus();

    // If we're in backoff mode, return predefined recommendations instead of an error
    if (rateLimitStatus.isBackingOff) {
      const backoffTimeRemaining = Math.max(0, rateLimitStatus.backoffUntil - Date.now());
      const backoffSeconds = Math.ceil(backoffTimeRemaining / 1000);

      console.log(`Gemini API in backoff mode. Returning predefined recommendations. Retry in ${backoffSeconds}s`);

      // Return predefined recommendations based on type
      return NextResponse.json({
        recommendations: getPredefinedRecommendations(type),
        limited: true,
        retryAfter: backoffSeconds
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings,
    });

    // Create prompt based on recommendation type
    let prompt = "";

    switch (type) {
      case "workout":
        prompt = `Genera 3 recomendaciones de entrenamiento personalizadas.
                 Cada recomendación debe incluir: título, descripción breve, y razón.
                 Formatea la respuesta como una lista numerada.`;
        break;
      case "nutrition":
        prompt = `Genera 3 recomendaciones nutricionales personalizadas.
                 Cada recomendación debe incluir: título, descripción breve, y beneficio principal.
                 Formatea la respuesta como una lista numerada.`;
        break;
      case "wellness":
        prompt = `Genera 3 recomendaciones de bienestar general para mejorar la salud integral.
                 Cada recomendación debe incluir: título, descripción breve, y beneficio para la salud.
                 Formatea la respuesta como una lista numerada.`;
        break;
      default:
        prompt = `Genera 3 consejos generales de fitness.
                 Cada consejo debe incluir: título, descripción breve, y beneficio.
                 Formatea la respuesta como una lista numerada.`;
    }

    try {
      // Estimate token count (rough estimate: 1.5 tokens per word)
      const estimatedTokens = Math.ceil(prompt.length * 1.5);

      // Generate content using rate limiter
      const result = await geminiRateLimiter.executeRequest(
        async () => model.generateContent(prompt),
        3, // Lower priority for recommendations
        estimatedTokens
      );

      const responseText = result.response.text();

      // Parse recommendations
      const recommendations = parseRecommendations(responseText, type);

      // Return response
      return NextResponse.json({ recommendations });
    } catch (error: any) {
      console.error('Error al generar recomendaciones:', error);

      // Check if it's a rate limit error
      if (error.message && (
          error.message.includes('429') ||
          error.message.includes('Too Many Requests') ||
          error.message.includes('quota') ||
          error.message.includes('rate limit')
      )) {
        // Return predefined recommendations instead of an error
        console.log('Rate limit error detected. Returning predefined recommendations.');

        return NextResponse.json({
          recommendations: getPredefinedRecommendations(type),
          limited: true
        });
      }

      return NextResponse.json(
        {
          error: 'Error interno del servidor',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Parse recommendations from the Gemini response
 */
function parseRecommendations(text: string, type: string): any[] {
  try {
    // Simple parsing of numbered list
    const recommendations = [];
    const lines = text.split("\n");

    let currentRec: any = null;

    for (const line of lines) {
      // Check for numbered item (1., 2., 3., etc.)
      if (/^\d+\./.test(line.trim())) {
        // If we have a previous recommendation, add it
        if (currentRec) {
          recommendations.push(currentRec);
        }

        // Start a new recommendation
        currentRec = {
          id: `${type}-${recommendations.length + 1}`,
          title: line.replace(/^\d+\.\s*/, "").trim(),
          description: "",
          type: type,
        };
      } else if (currentRec && line.trim()) {
        // Add non-empty lines to the description
        currentRec.description += line.trim() + " ";
      }
    }

    // Add the last recommendation
    if (currentRec) {
      recommendations.push(currentRec);
    }

    return recommendations;
  } catch (error) {
    console.error("Error parsing recommendations:", error);
    return [];
  }
}

/**
 * Get predefined recommendations when Gemini API is rate limited
 */
function getPredefinedRecommendations(type: string): any[] {
  // Predefined recommendations by type
  const predefinedRecommendations: Record<string, any[]> = {
    workout: [
      {
        id: "workout-1",
        title: "Incorpora entrenamiento de fuerza",
        description: "Añade 2-3 sesiones semanales de entrenamiento con pesas para aumentar tu masa muscular y metabolismo basal. Beneficio: Mejora la composición corporal y previene lesiones.",
        type: "workout"
      },
      {
        id: "workout-2",
        title: "Prioriza la técnica sobre el peso",
        description: "Asegúrate de dominar la técnica correcta antes de aumentar la carga en tus ejercicios. Beneficio: Maximiza resultados y minimiza el riesgo de lesiones.",
        type: "workout"
      },
      {
        id: "workout-3",
        title: "Incluye días de recuperación activa",
        description: "Alterna entrenamientos intensos con días de actividad ligera como caminar, yoga o natación suave. Beneficio: Acelera la recuperación muscular y reduce la fatiga acumulada.",
        type: "workout"
      }
    ],
    nutrition: [
      {
        id: "nutrition-1",
        title: "Aumenta tu ingesta de proteínas",
        description: "Consume entre 1.6-2g de proteína por kg de peso corporal para optimizar la recuperación muscular. Beneficio: Mejora la síntesis proteica y la recuperación tras el ejercicio.",
        type: "nutrition"
      },
      {
        id: "nutrition-2",
        title: "Hidratación estratégica",
        description: "Bebe agua antes, durante y después del entrenamiento. Añade electrolitos en sesiones de más de 60 minutos. Beneficio: Mantiene el rendimiento y acelera la recuperación.",
        type: "nutrition"
      },
      {
        id: "nutrition-3",
        title: "Planifica comidas post-entrenamiento",
        description: "Consume una combinación de proteínas y carbohidratos dentro de los 30-60 minutos posteriores al ejercicio. Beneficio: Optimiza la recuperación y reposición de glucógeno.",
        type: "nutrition"
      }
    ],
    wellness: [
      {
        id: "wellness-1",
        title: "Establece una rutina de sueño consistente",
        description: "Mantén horarios regulares de sueño, incluso los fines de semana. Beneficio: Mejora la calidad del descanso y optimiza la recuperación hormonal.",
        type: "wellness"
      },
      {
        id: "wellness-2",
        title: "Practica técnicas de respiración",
        description: "Dedica 5-10 minutos diarios a ejercicios de respiración profunda. Beneficio: Reduce el estrés y mejora la concentración durante los entrenamientos.",
        type: "wellness"
      },
      {
        id: "wellness-3",
        title: "Implementa descansos digitales",
        description: "Evita pantallas al menos 1 hora antes de dormir y haz pausas regulares durante el día. Beneficio: Mejora la calidad del sueño y reduce la fatiga mental.",
        type: "wellness"
      }
    ],
    general: [
      {
        id: "general-1",
        title: "Establece objetivos SMART",
        description: "Define metas Específicas, Medibles, Alcanzables, Relevantes y con Tiempo definido. Beneficio: Aumenta la motivación y facilita el seguimiento del progreso.",
        type: "general"
      },
      {
        id: "general-2",
        title: "Registra tus entrenamientos",
        description: "Lleva un diario de tus sesiones, incluyendo ejercicios, series, repeticiones y sensaciones. Beneficio: Facilita la progresión y ayuda a identificar patrones.",
        type: "general"
      },
      {
        id: "general-3",
        title: "Prioriza la consistencia sobre la perfección",
        description: "Es mejor hacer entrenamientos moderados regularmente que sesiones intensas esporádicas. Beneficio: Construye hábitos sostenibles y reduce el riesgo de abandono.",
        type: "general"
      }
    ]
  };

  // Return recommendations for the requested type, or general if not found
  return predefinedRecommendations[type] || predefinedRecommendations.general;
}
