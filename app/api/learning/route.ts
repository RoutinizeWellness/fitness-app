import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  analyzeWorkoutPatterns,
  generateSmartRecommendations,
  getSmartRecommendations,
  saveRecommendationFeedback
} from '@/lib/learning-algorithm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Endpoint para analizar patrones de entrenamiento
export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Learning API: POST request received')

    // ✅ SECURE: Create Supabase client with proper cookie handling
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })

    // ✅ SECURE: Get the current user with server verification
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Learning API: Authentication failed:', userError)
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { action } = body;

    // Analizar patrones de entrenamiento
    if (action === 'analyzePatterns') {
      const { data, error } = await analyzeWorkoutPatterns(userId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    }

    // Generar recomendaciones inteligentes
    if (action === 'generateRecommendations') {
      const { data, error } = await generateSmartRecommendations(userId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    }

    // Guardar feedback sobre recomendaciones
    if (action === 'saveFeedback') {
      const { recommendationId, rating, feedbackText } = body;

      if (!recommendationId || rating === undefined) {
        return NextResponse.json(
          { error: 'Faltan parámetros requeridos' },
          { status: 400 }
        );
      }

      const { data, error } = await saveRecommendationFeedback({
        user_id: userId,
        recommendation_id: recommendationId,
        recommendation_type: body.recommendationType || 'workout',
        rating,
        feedback_text: feedbackText
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en la API de aprendizaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener recomendaciones inteligentes
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const { data, error } = await getSmartRecommendations(userId, {
      type: type as any,
      limit,
      activeOnly
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error en la API de aprendizaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
