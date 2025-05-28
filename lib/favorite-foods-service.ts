/**
 * Servicio para gestionar alimentos favoritos
 */
import { FoodItem } from './types/nutrition';

/**
 * Obtiene los alimentos favoritos del usuario actual
 */
export const getFavoriteFoods = async (userId?: string, limit: number = 50, offset: number = 0): Promise<{
  data: FoodItem[];
  count: number;
  error?: string;
}> => {
  try {
    const url = userId
      ? `/api/foods/favorites?userId=${userId}&limit=${limit}&offset=${offset}`
      : `/api/foods/favorites?limit=${limit}&offset=${offset}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener alimentos favoritos');
    }

    const data = await response.json();
    return {
      data: data.data || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error('Error en getFavoriteFoods:', error);
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Añade o elimina un alimento de favoritos
 */
export const toggleFavoriteFood = async (foodId: string, isFavorite: boolean, userId?: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    const response = await fetch('/api/foods/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ foodId, isFavorite, userId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar favorito');
    }

    const data = await response.json();
    return {
      success: data.success || false,
      message: data.message || 'Operación completada'
    };
  } catch (error) {
    console.error('Error en toggleFavoriteFood:', error);
    return {
      success: false,
      message: 'Error al actualizar favorito',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Busca alimentos en la API
 */
export const searchFoods = async (
  query: string = '',
  options?: {
    category?: string;
    supermarket?: string;
    region?: string;
    limit?: number;
    offset?: number;
    userId?: string;
  }
): Promise<{
  data: FoodItem[];
  count: number;
  categories: string[];
  supermarkets: string[];
  error?: string;
}> => {
  try {
    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (options?.category) params.append('category', options.category);
    if (options?.supermarket) params.append('supermarket', options.supermarket);
    if (options?.region) params.append('region', options.region);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.userId) params.append('userId', options.userId);

    const response = await fetch(`/api/foods?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al buscar alimentos');
    }

    const data = await response.json();
    return {
      data: data.data || [],
      count: data.count || 0,
      categories: data.categories || [],
      supermarkets: data.supermarkets || [],
      source: data.source
    };
  } catch (error) {
    console.error('Error en searchFoods:', error);
    return {
      data: [],
      count: 0,
      categories: [],
      supermarkets: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene estadísticas de la base de datos de alimentos
 */
export const getFoodDatabaseStats = async (): Promise<{
  totalFoods: number;
  categoryCounts: { category: string; count: number }[];
  supermarketCounts: { supermarket: string; count: number }[];
  error?: string;
}> => {
  try {
    const response = await fetch('/api/foods/stats');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener estadísticas');
    }

    const data = await response.json();
    return {
      totalFoods: data.totalFoods || 0,
      categoryCounts: data.categoryCounts || [],
      supermarketCounts: data.supermarketCounts || []
    };
  } catch (error) {
    console.error('Error en getFoodDatabaseStats:', error);
    return {
      totalFoods: 0,
      categoryCounts: [],
      supermarketCounts: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export default {
  getFavoriteFoods,
  toggleFavoriteFood,
  searchFoods,
  getFoodDatabaseStats
};
