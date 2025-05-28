/**
 * Servicio para la gestión de recetas españolas en Supabase
 */

import { createClient } from './supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import spanishRecipes, { Recipe } from './data/spanish-recipes-database';

// Initialize Supabase client
const supabase = createClient();

type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Busca recetas españolas en la base de datos local
 */
export const searchSpanishRecipes = (
  query: string,
  options?: {
    category?: string;
    region?: string;
    difficulty?: string;
    maxResults?: number;
  }
): Recipe[] => {
  if (!query || query.trim() === '') {
    return spanishRecipes;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Filtrar por nombre o descripción
  let results = spanishRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(normalizedQuery) ||
    recipe.description.toLowerCase().includes(normalizedQuery) ||
    recipe.category.some(cat => cat.toLowerCase().includes(normalizedQuery)) ||
    (recipe.region && recipe.region.toLowerCase().includes(normalizedQuery))
  );

  // Aplicar filtros adicionales si se proporcionan
  if (options) {
    // Filtrar por categoría
    if (options.category) {
      results = results.filter(recipe =>
        recipe.category.some(cat => cat.toLowerCase() === options.category?.toLowerCase())
      );
    }

    // Filtrar por región
    if (options.region) {
      results = results.filter(recipe =>
        recipe.region && recipe.region.toLowerCase() === options.region?.toLowerCase()
      );
    }

    // Filtrar por dificultad
    if (options.difficulty) {
      results = results.filter(recipe =>
        recipe.difficulty.toLowerCase() === options.difficulty?.toLowerCase()
      );
    }

    // Limitar resultados
    if (options.maxResults && options.maxResults > 0) {
      results = results.slice(0, options.maxResults);
    }
  }

  return results;
};

/**
 * Obtiene una receta española por su ID
 */
export const getSpanishRecipeById = (id: string): Recipe | null => {
  return spanishRecipes.find(recipe => recipe.id === id) || null;
};

/**
 * Obtiene recetas españolas por categoría
 */
export const getSpanishRecipesByCategory = (category: string): Recipe[] => {
  return spanishRecipes.filter(recipe =>
    recipe.category.some(cat => cat.toLowerCase() === category.toLowerCase())
  );
};

/**
 * Obtiene recetas españolas por región
 */
export const getSpanishRecipesByRegion = (region: string): Recipe[] => {
  return spanishRecipes.filter(recipe =>
    recipe.region && recipe.region.toLowerCase() === region.toLowerCase()
  );
};

/**
 * Guarda una receta española en la base de datos de Supabase
 */
export const saveSpanishRecipeToSupabase = async (
  recipe: Recipe
): Promise<QueryResponse<Recipe>> => {
  try {
    // Verificar si la receta ya existe
    const { data: existingRecipe, error: checkError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipe.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingRecipe) {
      // Actualizar receta existente
      const { data, error } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', recipe.id)
        .select();

      return { data: data?.[0] as Recipe, error };
    } else {
      // Insertar nueva receta
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipe])
        .select();

      return { data: data?.[0] as Recipe, error };
    }
  } catch (e) {
    console.error(`Error en saveSpanishRecipeToSupabase:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en saveSpanishRecipeToSupabase`)
    };
  }
};

/**
 * Importa todas las recetas españolas a la base de datos de Supabase
 */
export const importAllSpanishRecipesToSupabase = async (): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  error: PostgrestError | Error | null;
}> => {
  try {
    let imported = 0;
    let failed = 0;

    // Importar en lotes de 20 para evitar límites de tamaño de solicitud
    const batchSize = 20;
    for (let i = 0; i < spanishRecipes.length; i += batchSize) {
      const batch = spanishRecipes.slice(i, i + batchSize);

      const { error } = await supabase
        .from('recipes')
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
    console.error(`Error en importAllSpanishRecipesToSupabase:`, e);
    return {
      success: false,
      imported: 0,
      failed: spanishRecipes.length,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en importAllSpanishRecipesToSupabase`)
    };
  }
};

export default {
  searchSpanishRecipes,
  getSpanishRecipeById,
  getSpanishRecipesByCategory,
  getSpanishRecipesByRegion,
  saveSpanishRecipeToSupabase,
  importAllSpanishRecipesToSupabase
};
