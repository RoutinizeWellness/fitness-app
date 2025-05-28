import { supabase } from '@/lib/supabase-client'
import { handleSupabaseError } from '@/lib/supabase-client-enhanced'
import { spanishFoodDatabase, SpanishFoodItem } from '@/data/spanish-food-database'
import { isEmptyErrorObject, logErrorWithContext } from '@/lib/error-utils'

const FOOD_DATABASE_TABLE = 'food_database'

/**
 * Inicializa la base de datos de alimentos españoles en Supabase
 * @returns Resultado de la operación
 */
export const initializeSpanishFoodDatabase = async (): Promise<{ success: boolean, error: any }> => {
  try {
    // Verificar si la tabla existe
    const { error: tableCheckError } = await supabase
      .from(FOOD_DATABASE_TABLE)
      .select('count', { count: 'exact', head: true })
      .limit(1)

    // Si hay un error, es posible que la tabla no exista
    if (tableCheckError) {
      console.error('Error al verificar la tabla de alimentos:', tableCheckError)
      return {
        success: false,
        error: handleSupabaseError(tableCheckError, 'Error al verificar la tabla de alimentos')
      }
    }

    // Verificar si ya hay datos españoles en la tabla
    const { data: existingData, error: countError } = await supabase
      .from(FOOD_DATABASE_TABLE)
      .select('id')
      .ilike('id', 'es-%')
      .limit(1)

    if (countError) {
      console.error('Error al verificar datos existentes:', countError)
      return {
        success: false,
        error: handleSupabaseError(countError, 'Error al verificar datos existentes')
      }
    }

    // Si ya hay datos españoles, no hacer nada
    if (existingData && existingData.length > 0) {
      console.log('La base de datos de alimentos españoles ya está inicializada')
      return { success: true, error: null }
    }

    // Preparar los datos para inserción
    const foodItemsToInsert = spanishFoodDatabase.map(item => ({
      id: `es-${item.id}`,
      name: item.name,
      brand: item.brand || null,
      category: item.category,
      subcategory: item.subcategory || null,
      region: item.region || null,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber || null,
      sugar: item.sugar || null,
      serving_size: item.servingSize,
      serving_unit: item.servingUnit,
      image_url: item.image || null,
      metadata: {
        supermarket: item.supermarket || [],
        country: 'España'
      }
    }))

    // Insertar los datos en lotes de 20 para evitar límites de tamaño
    const batchSize = 20
    for (let i = 0; i < foodItemsToInsert.length; i += batchSize) {
      const batch = foodItemsToInsert.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from(FOOD_DATABASE_TABLE)
        .insert(batch)

      if (insertError) {
        console.error(`Error al insertar lote ${i / batchSize + 1}:`, insertError)
        return {
          success: false,
          error: handleSupabaseError(insertError, 'Error al insertar alimentos españoles')
        }
      }
    }

    console.log(`Se han insertado ${foodItemsToInsert.length} alimentos españoles en la base de datos`)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error inesperado al inicializar la base de datos de alimentos españoles:', error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Error inesperado al inicializar la base de datos')
    }
  }
}

/**
 * Busca alimentos españoles en la base de datos
 * @param query Término de búsqueda
 * @param options Opciones de búsqueda
 * @returns Resultados de la búsqueda
 */
export const searchSpanishFoods = async (
  query: string,
  options?: {
    category?: string;
    region?: string;
    supermarket?: string;
    limit?: number;
  }
): Promise<{ data: any[] | null, error: any }> => {
  try {
    // Si no hay término de búsqueda, devolver los primeros 20 alimentos
    if (!query || query.trim() === '') {
      let dbQuery = supabase
        .from(FOOD_DATABASE_TABLE)
        .select('*')
        .like('id', 'es-%')  // Usando like en lugar de ilike para evitar problemas con UUID
        .limit(options?.limit || 20)

      // Aplicar filtros adicionales si se proporcionan
      if (options?.category) {
        dbQuery = dbQuery.eq('category', options.category)
      }

      if (options?.region) {
        dbQuery = dbQuery.eq('region', options.region)
      }

      if (options?.supermarket) {
        dbQuery = dbQuery.contains('metadata->supermarket', [options.supermarket])
      }

      const { data, error } = await dbQuery

      // Verificar si hay un error vacío
      if (isEmptyErrorObject(error)) {
        logErrorWithContext(error, {
          operation: 'searchSpanishFoods',
          source: 'food_database table',
          query: 'empty query',
          filters: JSON.stringify(options),
          timestamp: new Date().toISOString()
        });

        // Si hay un error vacío, usar datos locales
        let filteredResults = spanishFoodDatabase;

        if (options?.category) {
          filteredResults = filteredResults.filter(item => item.category === options.category);
        }

        if (options?.region) {
          filteredResults = filteredResults.filter(item => item.region === options.region);
        }

        if (options?.supermarket) {
          filteredResults = filteredResults.filter(item =>
            item.supermarket && item.supermarket.includes(options.supermarket as string)
          );
        }

        return { data: filteredResults.slice(0, options?.limit || 20), error: null };
      }

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error, 'Error al buscar alimentos españoles')
        }
      }

      return { data, error: null }
    }

    // Buscar alimentos que coincidan con el término de búsqueda
    // Usamos una consulta más segura para evitar el error "operator does not exist: uuid ~~* unknown"
    let dbQuery = supabase
      .from(FOOD_DATABASE_TABLE)
      .select('*')
      .like('id', 'es-%')  // Usando like en lugar de ilike para evitar problemas con UUID
      .or(
        `name.ilike.%${query}%,` +
        `brand.ilike.%${query}%,` +
        `category.ilike.%${query}%,` +
        `region.ilike.%${query}%`
      )
      .limit(options?.limit || 20)

    // Aplicar filtros adicionales si se proporcionan
    if (options?.category) {
      dbQuery = dbQuery.eq('category', options.category)
    }

    if (options?.region) {
      dbQuery = dbQuery.eq('region', options.region)
    }

    if (options?.supermarket) {
      dbQuery = dbQuery.contains('metadata->supermarket', [options.supermarket])
    }

    const { data, error } = await dbQuery

    // Verificar si hay un error vacío
    if (isEmptyErrorObject(error)) {
      logErrorWithContext(error, {
        operation: 'searchSpanishFoods',
        source: 'food_database table',
        query: query,
        filters: JSON.stringify(options),
        timestamp: new Date().toISOString()
      });

      // Si hay un error vacío, usar datos locales
      let filteredResults = spanishFoodDatabase.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(query.toLowerCase())) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.region && item.region.toLowerCase().includes(query.toLowerCase()))
      );

      if (options?.category) {
        filteredResults = filteredResults.filter(item => item.category === options.category);
      }

      if (options?.region) {
        filteredResults = filteredResults.filter(item => item.region === options.region);
      }

      if (options?.supermarket) {
        filteredResults = filteredResults.filter(item =>
          item.supermarket && item.supermarket.includes(options.supermarket as string)
        );
      }

      return { data: filteredResults.slice(0, options?.limit || 20), error: null };
    }

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error, 'Error al buscar alimentos españoles')
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al buscar alimentos españoles:', error);

    // Usar datos locales como fallback
    let filteredResults = spanishFoodDatabase;

    if (query) {
      filteredResults = filteredResults.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(query.toLowerCase())) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.region && item.region.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (options?.category) {
      filteredResults = filteredResults.filter(item => item.category === options.category);
    }

    if (options?.region) {
      filteredResults = filteredResults.filter(item => item.region === options.region);
    }

    if (options?.supermarket) {
      filteredResults = filteredResults.filter(item =>
        item.supermarket && item.supermarket.includes(options.supermarket as string)
      );
    }

    return { data: filteredResults.slice(0, options?.limit || 20), error: null };
  }
}

/**
 * Obtiene las categorías de alimentos españoles disponibles
 * @returns Lista de categorías
 */
export const getSpanishFoodCategories = async (): Promise<{ data: string[] | null, error: any }> => {
  try {
    // Primero intentar obtener categorías de la tabla food_categories
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('food_categories')
        .select('name')
        .order('name')

      // Verificar si hay un error vacío
      if (isEmptyErrorObject(categoriesError)) {
        logErrorWithContext(categoriesError, {
          operation: 'getSpanishFoodCategories',
          source: 'food_categories table',
          timestamp: new Date().toISOString()
        });

        // Si hay un error vacío, intentar con el método alternativo
        throw new Error('Error vacío al consultar food_categories');
      }

      // Si no hay error, devolver las categorías
      if (!categoriesError && categoriesData && categoriesData.length > 0) {
        const categories = categoriesData.map(item => item.name);
        return { data: categories, error: null };
      }
    } catch (err) {
      console.warn('Error al obtener categorías de food_categories, intentando método alternativo:', err);
      // Continuar con el método alternativo
    }

    // Método alternativo: obtener categorías del food_database
    const { data, error } = await supabase
      .from(FOOD_DATABASE_TABLE)
      .select('category')
      .ilike('id', 'es-%')
      .order('category')

    // Verificar si hay un error vacío
    if (isEmptyErrorObject(error)) {
      logErrorWithContext(error, {
        operation: 'getSpanishFoodCategories',
        source: 'food_database table',
        timestamp: new Date().toISOString()
      });

      // Si hay un error vacío, usar datos locales
      const localCategories = [...new Set(spanishFoodDatabase.map(item => item.category))];
      return { data: localCategories, error: null };
    }

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error, 'Error al obtener categorías de alimentos')
      }
    }

    // Extraer categorías únicas
    const categories = [...new Set(data.map(item => item.category))];
    return { data: categories, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener categorías de alimentos:', error);

    // Usar datos locales como fallback
    const localCategories = [...new Set(spanishFoodDatabase.map(item => item.category))];
    return { data: localCategories, error: null };
  }
}

/**
 * Obtiene las regiones de alimentos españoles disponibles
 * @returns Lista de regiones
 */
export const getSpanishFoodRegions = async (): Promise<{ data: string[] | null, error: any }> => {
  try {
    // Primero intentar obtener regiones de la tabla food_regions
    try {
      const { data: regionsData, error: regionsError } = await supabase
        .from('food_regions')
        .select('name')
        .order('name')

      // Verificar si hay un error vacío
      if (isEmptyErrorObject(regionsError)) {
        logErrorWithContext(regionsError, {
          operation: 'getSpanishFoodRegions',
          source: 'food_regions table',
          timestamp: new Date().toISOString()
        });

        // Si hay un error vacío, intentar con el método alternativo
        throw new Error('Error vacío al consultar food_regions');
      }

      // Si no hay error, devolver las regiones
      if (!regionsError && regionsData && regionsData.length > 0) {
        const regions = regionsData.map(item => item.name);
        return { data: regions, error: null };
      }
    } catch (err) {
      console.warn('Error al obtener regiones de food_regions, intentando método alternativo:', err);
      // Continuar con el método alternativo
    }

    // Método alternativo: obtener regiones del food_database
    const { data, error } = await supabase
      .from(FOOD_DATABASE_TABLE)
      .select('region')
      .ilike('id', 'es-%')
      .not('region', 'is', null)
      .order('region')

    // Verificar si hay un error vacío
    if (isEmptyErrorObject(error)) {
      logErrorWithContext(error, {
        operation: 'getSpanishFoodRegions',
        source: 'food_database table',
        timestamp: new Date().toISOString()
      });

      // Si hay un error vacío, usar datos locales
      const localRegions = [...new Set(spanishFoodDatabase
        .filter(item => item.region)
        .map(item => item.region as string))];
      return { data: localRegions, error: null };
    }

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error, 'Error al obtener regiones de alimentos')
      }
    }

    // Extraer regiones únicas
    const regions = [...new Set(data.map(item => item.region))];
    return { data: regions, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener regiones de alimentos:', error);

    // Usar datos locales como fallback
    const localRegions = [...new Set(spanishFoodDatabase
      .filter(item => item.region)
      .map(item => item.region as string))];
    return { data: localRegions, error: null };
  }
}
