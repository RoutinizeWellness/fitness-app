import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import spanishFoods, { FOOD_CATEGORIES, SUPERMARKETS } from '@/lib/data/spanish-foods-database';

export async function GET(request: NextRequest) {
  try {
    // Obtener estadísticas de Supabase

    // 1. Total de alimentos
    const { count: totalFoods, error: countError } = await supabase
      .from('spanish_foods')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error al obtener conteo de alimentos:', countError);

      // Si hay error, usar datos locales
      const localStats = getLocalFoodStats();
      return NextResponse.json({
        ...localStats,
        source: 'local',
        error: countError.message
      });
    }

    // 2. Conteo por categoría
    const categoryCounts: { category: string; count: number }[] = [];

    // Obtener conteo para cada categoría
    for (const category of Object.values(FOOD_CATEGORIES)) {
      const { count, error } = await supabase
        .from('spanish_foods')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);

      if (!error) {
        categoryCounts.push({
          category,
          count: count || 0
        });
      }
    }

    // 3. Conteo por supermercado
    const supermarketCounts: { supermarket: string; count: number }[] = [];

    // Obtener conteo para cada supermercado
    for (const supermarket of Object.values(SUPERMARKETS)) {
      const { count, error } = await supabase
        .from('spanish_foods')
        .select('*', { count: 'exact', head: true })
        .eq('supermarket', supermarket);

      if (!error) {
        supermarketCounts.push({
          supermarket,
          count: count || 0
        });
      }
    }

    // 4. Conteo de alimentos regionales
    const { count: regionalCount, error: regionalError } = await supabase
      .from('spanish_foods')
      .select('*', { count: 'exact', head: true })
      .not('region', 'is', null);

    // 5. Conteo de alimentos verificados
    const { count: verifiedCount, error: verifiedError } = await supabase
      .from('spanish_foods')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    return NextResponse.json({
      totalFoods: totalFoods || 0,
      categoryCounts,
      supermarketCounts,
      regionalCount: regionalCount || 0,
      verifiedCount: verifiedCount || 0,
      source: 'supabase'
    });
  } catch (error) {
    console.error('Error en la API de estadísticas de alimentos:', error);

    // Si hay error, usar datos locales
    const localStats = getLocalFoodStats();
    return NextResponse.json({
      ...localStats,
      source: 'local',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// Función para obtener estadísticas de la base de datos local
function getLocalFoodStats() {
  // 1. Total de alimentos
  const totalFoods = spanishFoods.length;

  // 2. Conteo por categoría
  const categoryCounts: { category: string; count: number }[] = [];

  // Crear un mapa para contar por categoría
  const categoryMap = new Map<string, number>();

  spanishFoods.forEach(food => {
    if (food.category) {
      const count = categoryMap.get(food.category) || 0;
      categoryMap.set(food.category, count + 1);
    }
  });

  // Convertir el mapa a array
  for (const [category, count] of categoryMap.entries()) {
    categoryCounts.push({ category, count });
  }

  // 3. Conteo por supermercado
  const supermarketCounts: { supermarket: string; count: number }[] = [];

  // Crear un mapa para contar por supermercado
  const supermarketMap = new Map<string, number>();

  spanishFoods.forEach(food => {
    if (food.supermarket) {
      const count = supermarketMap.get(food.supermarket) || 0;
      supermarketMap.set(food.supermarket, count + 1);
    }
  });

  // Convertir el mapa a array
  for (const [supermarket, count] of supermarketMap.entries()) {
    supermarketCounts.push({ supermarket, count });
  }

  // 4. Conteo de alimentos regionales
  const regionalCount = spanishFoods.filter(food => food.region).length;

  // 5. Conteo de alimentos verificados
  const verifiedCount = spanishFoods.filter(food => food.isVerified).length;

  return {
    totalFoods,
    categoryCounts,
    supermarketCounts,
    regionalCount,
    verifiedCount
  };
}
