import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { extractAuthToken } from '@/lib/auth-token-helper';

// Obtener alimentos favoritos de un usuario
export async function GET(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Obtener IDs de alimentos favoritos
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('spanish_favorite_foods')
      .select('food_id')
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);

    if (favoritesError) {
      console.error('Error al obtener favoritos:', favoritesError);
      return NextResponse.json(
        { error: favoritesError.message },
        { status: 500 }
      );
    }

    if (!favoritesData || favoritesData.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Obtener detalles de los alimentos favoritos
    const foodIds = favoritesData.map(fav => fav.food_id);
    const { data: foodsData, error: foodsError } = await supabase
      .from('spanish_foods')
      .select('*')
      .in('id', foodIds);

    if (foodsError) {
      console.error('Error al obtener detalles de alimentos:', foodsError);
      return NextResponse.json(
        { error: foodsError.message },
        { status: 500 }
      );
    }

    // Marcar todos como favoritos
    const foodsWithFavorites = foodsData.map(food => ({
      ...food,
      isFavorite: true
    }));

    return NextResponse.json({
      data: foodsWithFavorites,
      count: foodsWithFavorites.length
    });
  } catch (error) {
    console.error('Error en la API de favoritos:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Añadir o eliminar un alimento de favoritos
export async function POST(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener datos de la solicitud
    const { foodId, isFavorite } = await request.json();

    if (!foodId) {
      return NextResponse.json(
        { error: 'ID de alimento no proporcionado' },
        { status: 400 }
      );
    }

    if (isFavorite) {
      // Añadir a favoritos
      const { data, error } = await supabase
        .from('spanish_favorite_foods')
        .insert([
          { user_id: userId, food_id: foodId }
        ])
        .select();

      if (error) {
        // Si el error es por duplicado, no es un problema real
        if (error.code === '23505') { // Código de error de duplicado en PostgreSQL
          return NextResponse.json({
            message: 'El alimento ya estaba en favoritos',
            success: true
          });
        }

        console.error('Error al añadir favorito:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Alimento añadido a favoritos',
        success: true,
        data
      });
    } else {
      // Eliminar de favoritos
      const { error } = await supabase
        .from('spanish_favorite_foods')
        .delete()
        .eq('user_id', userId)
        .eq('food_id', foodId);

      if (error) {
        console.error('Error al eliminar favorito:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Alimento eliminado de favoritos',
        success: true
      });
    }
  } catch (error) {
    console.error('Error en la API de favoritos (POST):', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
