import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import spanishFoods, { FOOD_CATEGORIES, SUPERMARKETS } from '@/lib/data/spanish-foods-database';

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const supermarket = searchParams.get('supermarket') || '';
    const region = searchParams.get('region') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId') || '';

    // Construir consulta a Supabase
    let supabaseQuery = supabase
      .from('spanish_foods')
      .select('*');

    // Filtrar por término de búsqueda
    if (query) {
      supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
    }

    // Filtrar por categoría
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    // Filtrar por supermercado
    if (supermarket) {
      supabaseQuery = supabaseQuery.eq('supermarket', supermarket);
    }

    // Filtrar por región
    if (region) {
      supabaseQuery = supabaseQuery.eq('region', region);
    }

    // Aplicar límite y offset
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    // Ejecutar consulta
    const { data, error } = await supabaseQuery;

    // Si hay un usuario, obtener sus alimentos favoritos
    let favorites: string[] = [];
    if (userId) {
      const { data: favoritesData } = await supabase
        .from('spanish_favorite_foods')
        .select('food_id')
        .eq('user_id', userId);

      if (favoritesData) {
        favorites = favoritesData.map(fav => fav.food_id);
      }
    }

    if (error) {
      console.error('Error al obtener alimentos de Supabase:', error);

      // Si hay un error en Supabase, intentar devolver alimentos locales
      let localFoods = spanishFoods;

      // Aplicar filtros a los alimentos locales
      if (query) {
        const normalizedQuery = query.toLowerCase();
        localFoods = localFoods.filter(food =>
          food.name.toLowerCase().includes(normalizedQuery)
        );
      }

      if (category) {
        localFoods = localFoods.filter(food => food.category === category);
      }

      if (supermarket) {
        localFoods = localFoods.filter(food => food.supermarket === supermarket);
      }

      if (region) {
        localFoods = localFoods.filter(food => food.region === region);
      }

      // Aplicar límite y offset
      localFoods = localFoods.slice(offset, offset + limit);

      // Marcar favoritos si hay un usuario
      if (favorites.length > 0) {
        localFoods = localFoods.map(food => ({
          ...food,
          isFavorite: favorites.includes(food.id)
        }));
      }

      return NextResponse.json({
        data: localFoods,
        source: 'local',
        error: error.message,
        categories: Object.values(FOOD_CATEGORIES),
        supermarkets: Object.values(SUPERMARKETS)
      });
    }

    // Marcar favoritos si hay un usuario
    let foodsWithFavorites = data;
    if (favorites.length > 0 && data) {
      foodsWithFavorites = data.map(food => ({
        ...food,
        isFavorite: favorites.includes(food.id)
      }));
    }

    return NextResponse.json({
      data: foodsWithFavorites,
      source: 'supabase',
      count: data?.length || 0,
      categories: Object.values(FOOD_CATEGORIES),
      supermarkets: Object.values(SUPERMARKETS)
    });
  } catch (error) {
    console.error('Error en la API de alimentos:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (esto debería mejorarse con middleware)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener datos del alimento
    const foodData = await request.json();

    // Validar datos mínimos
    if (!foodData.name || !foodData.servingSize || foodData.calories === undefined) {
      return NextResponse.json(
        { error: 'Datos de alimento incompletos' },
        { status: 400 }
      );
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('spanish_foods')
      .insert([foodData])
      .select();

    if (error) {
      console.error('Error al guardar alimento en Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data[0],
      message: 'Alimento guardado correctamente'
    });
  } catch (error) {
    console.error('Error en la API de alimentos (POST):', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
