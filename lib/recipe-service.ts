import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { Recipe, FoodItem, NutritionRecommendation } from './types/nutrition';

type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Funciones para recetas
export const getRecipes = async (
  options?: {
    userId?: string;
    isPublic?: boolean;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    maxTime?: number; // tiempo máximo de preparación + cocción en minutos
    limit?: number;
  }
): Promise<QueryResponse<Recipe[]>> => {
  try {
    let query = supabase
      .from('recipes')
      .select('*');

    if (options?.userId) {
      query = query.eq('created_by', options.userId);
    }

    if (options?.isPublic !== undefined) {
      query = query.eq('is_public', options.isPublic);
    }

    if (options?.tags && options.tags.length > 0) {
      // Buscar recetas que contengan al menos una de las etiquetas
      query = query.contains('tags', options.tags);
    }

    if (options?.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }

    if (options?.maxTime) {
      // Buscar recetas cuyo tiempo total (preparación + cocción) sea menor o igual al máximo
      query = query.or(`preparation_time.lte.${options.maxTime},cooking_time.lte.${options.maxTime}`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const getRecipeById = async (id: string): Promise<QueryResponse<Recipe>> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener receta:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const createRecipe = async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResponse<Recipe>> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al crear receta:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>): Promise<QueryResponse<Recipe>> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar receta:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const deleteRecipe = async (id: string): Promise<QueryResponse<null>> => {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null };
  } catch (error) {
    console.error('Error al eliminar receta:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Funciones para recomendaciones nutricionales
export const getNutritionRecommendations = async (
  userId: string,
  options?: {
    type?: string;
    isRead?: boolean;
    limit?: number;
  }
): Promise<QueryResponse<NutritionRecommendation[]>> => {
  try {
    let query = supabase
      .from('nutrition_recommendations')
      .select('*')
      .eq('user_id', userId);

    if (options?.type) {
      query = query.eq('recommendation_type', options.type);
    }

    if (options?.isRead !== undefined) {
      query = query.eq('is_read', options.isRead);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const createNutritionRecommendation = async (
  recommendation: Omit<NutritionRecommendation, 'id' | 'created_at'>
): Promise<QueryResponse<NutritionRecommendation>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_recommendations')
      .insert(recommendation)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al crear recomendación:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const markRecommendationAsRead = async (id: string): Promise<QueryResponse<NutritionRecommendation>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_recommendations')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al marcar recomendación como leída:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const applyRecommendation = async (id: string): Promise<QueryResponse<NutritionRecommendation>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_recommendations')
      .update({ is_applied: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al aplicar recomendación:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Función para encontrar alimentos alternativos
export const findAlternativeFoods = async (
  foodId: string,
  options?: {
    dietType?: string;
    excludeCategories?: string[];
    limit?: number;
  }
): Promise<QueryResponse<FoodItem[]>> => {
  try {
    // Primero obtenemos el alimento original para ver sus alternativas
    const { data: originalFood, error: originalError } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', foodId)
      .single();

    if (originalError) throw originalError;

    if (originalFood?.alternative_foods && originalFood.alternative_foods.length > 0) {
      // Si el alimento tiene alternativas definidas, las obtenemos
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .in('id', originalFood.alternative_foods);

      if (error) throw error;
      return { data, error: null };
    } else {
      // Si no tiene alternativas definidas, buscamos alimentos similares
      let query = supabase
        .from('food_items')
        .select('*')
        .neq('id', foodId); // Excluir el alimento original

      if (originalFood?.category) {
        // Buscar en la misma categoría
        query = query.eq('category', originalFood.category);
      }

      if (options?.dietType) {
        // Filtrar por tipo de dieta (esto requeriría un campo adicional en la tabla food_items)
        query = query.eq('diet_type', options.dietType);
      }

      if (options?.excludeCategories && options.excludeCategories.length > 0) {
        // Excluir categorías específicas
        query = query.not('category', 'in', `(${options.excludeCategories.join(',')})`);
      }

      // Limitar resultados
      query = query.limit(options?.limit || 5);

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error al buscar alimentos alternativos:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};
