/**
 * Servicio para la búsqueda y gestión de alimentos españoles
 */

import { FoodItem, NutritionSearchOptions } from './types/nutrition';
import spanishFoods, { FOOD_CATEGORIES, SUPERMARKETS } from './data/spanish-foods-database';
import { createClient } from './supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient();

type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Busca alimentos españoles en la base de datos local
 */
export const searchSpanishFoods = (
  query: string,
  options?: NutritionSearchOptions
): FoodItem[] => {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Filtrar por nombre
  let results = spanishFoods.filter(food =>
    food.name.toLowerCase().includes(normalizedQuery)
  );

  // Aplicar filtros adicionales si se proporcionan
  if (options) {
    // Filtrar por categoría
    if (options.category) {
      results = results.filter(food => food.category === options.category);
    }

    // Filtrar por supermercado
    if (options.supermarket) {
      results = results.filter(food => food.supermarket === options.supermarket);
    }

    // Filtrar por región (para platos regionales)
    if (options.region) {
      results = results.filter(food => food.region === options.region);
    }

    // Ordenar resultados
    if (options.sortBy) {
      results.sort((a, b) => {
        switch (options.sortBy) {
          case 'calories':
            return (a.calories || 0) - (b.calories || 0);
          case 'protein':
            return (a.protein || 0) - (b.protein || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

      // Invertir orden si es descendente
      if (options.sortDirection === 'desc') {
        results.reverse();
      }
    }

    // Limitar resultados
    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }
  }

  return results;
};

/**
 * Obtiene un alimento español por su ID
 */
export const getSpanishFoodById = (id: string): FoodItem | null => {
  return spanishFoods.find(food => food.id === id) || null;
};

/**
 * Obtiene alimentos españoles por categoría
 */
export const getSpanishFoodsByCategory = (category: string): FoodItem[] => {
  return spanishFoods.filter(food => food.category === category);
};

/**
 * Obtiene alimentos españoles por supermercado
 */
export const getSpanishFoodsBySupermarket = (supermarket: string): FoodItem[] => {
  return spanishFoods.filter(food => food.supermarket === supermarket);
};

/**
 * Obtiene platos regionales españoles
 */
export const getRegionalDishes = (region?: string): FoodItem[] => {
  const regionalDishes = spanishFoods.filter(food => food.category === FOOD_CATEGORIES.REGIONAL);

  if (region) {
    return regionalDishes.filter(food => food.region === region);
  }

  return regionalDishes;
};

/**
 * Guarda un alimento español en la base de datos de Supabase
 */
export const saveSpanishFoodToSupabase = async (
  food: FoodItem
): Promise<QueryResponse<FoodItem>> => {
  try {
    // Verificar si el alimento ya existe
    const { data: existingFood, error: checkError } = await supabase
      .from('food_database')
      .select('*')
      .eq('id', food.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingFood) {
      // Actualizar alimento existente
      const { data, error } = await supabase
        .from('food_database')
        .update(food)
        .eq('id', food.id)
        .select();

      return { data: data?.[0] as FoodItem, error };
    } else {
      // Insertar nuevo alimento
      const { data, error } = await supabase
        .from('food_database')
        .insert([food])
        .select();

      return { data: data?.[0] as FoodItem, error };
    }
  } catch (e) {
    console.error(`Error en saveSpanishFoodToSupabase:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en saveSpanishFoodToSupabase`)
    };
  }
};

/**
 * Importa todos los alimentos españoles a la base de datos de Supabase
 */
export const importAllSpanishFoodsToSupabase = async (): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  error: PostgrestError | Error | null;
}> => {
  try {
    let imported = 0;
    let failed = 0;

    // Importar en lotes de 50 para evitar límites de tamaño de solicitud
    const batchSize = 50;
    for (let i = 0; i < spanishFoods.length; i += batchSize) {
      const batch = spanishFoods.slice(i, i + batchSize);

      const { error } = await supabase
        .from('food_database')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error al importar lote ${i / batchSize + 1}:`, error);
        failed += batch.length;
      } else {
        imported += batch.length;
      }
    }

    return {
      success: failed === 0,
      imported,
      failed,
      error: null
    };
  } catch (e) {
    console.error(`Error en importAllSpanishFoodsToSupabase:`, e);
    return {
      success: false,
      imported: 0,
      failed: spanishFoods.length,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en importAllSpanishFoodsToSupabase`)
    };
  }
};

export default {
  searchSpanishFoods,
  getSpanishFoodById,
  getSpanishFoodsByCategory,
  getSpanishFoodsBySupermarket,
  getRegionalDishes,
  saveSpanishFoodToSupabase,
  importAllSpanishFoodsToSupabase,
  FOOD_CATEGORIES,
  SUPERMARKETS
};
