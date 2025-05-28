import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import spanishRecipes from '@/lib/data/spanish-recipes-database';

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const region = searchParams.get('region') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir consulta a Supabase
    let supabaseQuery = supabase
      .from('spanish_recipes')
      .select('*');

    // Filtrar por término de búsqueda
    if (query) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
    }

    // Filtrar por categoría
    if (category) {
      // Para buscar en un array de categorías
      supabaseQuery = supabaseQuery.contains('category', [category]);
    }

    // Filtrar por región
    if (region) {
      supabaseQuery = supabaseQuery.eq('region', region);
    }

    // Filtrar por dificultad
    if (difficulty) {
      supabaseQuery = supabaseQuery.eq('difficulty', difficulty);
    }

    // Aplicar límite y offset
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    // Ejecutar consulta
    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error al obtener recetas de Supabase:', error);

      // Si hay un error en Supabase, intentar devolver recetas locales
      let localRecipes = spanishRecipes;

      // Aplicar filtros a las recetas locales
      if (query) {
        const normalizedQuery = query.toLowerCase();
        localRecipes = localRecipes.filter(recipe =>
          recipe.title.toLowerCase().includes(normalizedQuery) ||
          recipe.description.toLowerCase().includes(normalizedQuery)
        );
      }

      if (category) {
        const normalizedCategory = category.toLowerCase();
        localRecipes = localRecipes.filter(recipe =>
          recipe.category.some(cat => cat.toLowerCase() === normalizedCategory)
        );
      }

      if (region) {
        const normalizedRegion = region.toLowerCase();
        localRecipes = localRecipes.filter(recipe =>
          recipe.region && recipe.region.toLowerCase() === normalizedRegion
        );
      }

      if (difficulty) {
        const normalizedDifficulty = difficulty.toLowerCase();
        localRecipes = localRecipes.filter(recipe =>
          recipe.difficulty.toLowerCase() === normalizedDifficulty
        );
      }

      // Aplicar límite y offset
      localRecipes = localRecipes.slice(offset, offset + limit);

      return NextResponse.json({
        data: localRecipes,
        source: 'local',
        error: error.message
      });
    }

    return NextResponse.json({
      data,
      source: 'supabase',
      count: data.length
    });
  } catch (error) {
    console.error('Error en la API de recetas:', error);
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

    // Obtener datos de la receta
    const recipeData = await request.json();

    // Validar datos mínimos
    if (!recipeData.title || !recipeData.ingredients || !recipeData.steps) {
      return NextResponse.json(
        { error: 'Datos de receta incompletos' },
        { status: 400 }
      );
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('spanish_recipes')
      .insert([recipeData])
      .select();

    if (error) {
      console.error('Error al guardar receta en Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data[0],
      message: 'Receta guardada correctamente'
    });
  } catch (error) {
    console.error('Error en la API de recetas (POST):', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
