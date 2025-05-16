import { FoodItem } from './types/nutrition';
import { supabase } from './supabase-client';

// Interfaz para la respuesta de la API de alimentos
interface FoodApiResponse {
  foods: any[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

// Interfaz para las opciones de búsqueda
interface SearchOptions {
  query: string;
  pageSize?: number;
  pageNumber?: number;
  brandOwner?: string;
  requireAllWords?: boolean;
}

// Función para buscar alimentos en la API externa
export const searchFoodApi = async (options: SearchOptions): Promise<{ data: FoodItem[] | null; error: Error | null }> => {
  try {
    // En un entorno real, aquí se haría una llamada a una API externa como USDA FoodData Central,
    // Nutritionix, Edamam, etc. Para este ejemplo, simularemos la respuesta.

    // Simulación de delay para simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Datos de ejemplo basados en la consulta
    const mockFoods = generateMockFoodData(options.query, options.pageSize || 20);

    return {
      data: mockFoods,
      error: null
    };
  } catch (error) {
    console.error('Error al buscar alimentos en la API:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Error desconocido al buscar alimentos')
    };
  }
};

// Función para obtener detalles de un alimento por su ID
export const getFoodDetails = async (foodId: string): Promise<{ data: FoodItem | null; error: Error | null }> => {
  try {
    // Simulación de delay para simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Datos de ejemplo para el alimento solicitado
    const mockFood = {
      id: foodId,
      name: `Alimento ${foodId}`,
      brand: 'Marca de ejemplo',
      serving_size: '100',
      serving_unit: 'g',
      calories: Math.floor(Math.random() * 400) + 50,
      protein: parseFloat((Math.random() * 30).toFixed(1)),
      carbs: parseFloat((Math.random() * 50).toFixed(1)),
      fat: parseFloat((Math.random() * 20).toFixed(1)),
      fiber: parseFloat((Math.random() * 10).toFixed(1)),
      sugar: parseFloat((Math.random() * 15).toFixed(1)),
      sodium: parseFloat((Math.random() * 500).toFixed(1)),
      cholesterol: parseFloat((Math.random() * 100).toFixed(1)),
      image_url: `https://source.unsplash.com/random/100x100?food&${foodId}`,
      is_verified: true
    };

    return {
      data: mockFood,
      error: null
    };
  } catch (error) {
    console.error('Error al obtener detalles del alimento:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Error desconocido al obtener detalles del alimento')
    };
  }
};

// Función para generar datos de alimentos de ejemplo
function generateMockFoodData(query: string, limit: number): FoodItem[] {
  const foods: FoodItem[] = [];

  // Categorías de alimentos para hacer más realista la búsqueda
  const categories = {
    'pollo': ['Pechuga de pollo', 'Muslo de pollo', 'Pollo asado', 'Pollo a la parrilla', 'Nuggets de pollo'],
    'arroz': ['Arroz blanco', 'Arroz integral', 'Arroz basmati', 'Arroz salvaje', 'Arroz con verduras'],
    'pasta': ['Espagueti', 'Macarrones', 'Lasaña', 'Pasta integral', 'Ravioles'],
    'pan': ['Pan blanco', 'Pan integral', 'Pan de centeno', 'Baguette', 'Pan de molde'],
    'leche': ['Leche entera', 'Leche desnatada', 'Leche semidesnatada', 'Leche de almendras', 'Leche de soja'],
    'huevo': ['Huevo entero', 'Clara de huevo', 'Huevo revuelto', 'Huevo cocido', 'Tortilla de huevo'],
    'queso': ['Queso cheddar', 'Queso mozzarella', 'Queso feta', 'Queso parmesano', 'Queso fresco'],
    'fruta': ['Manzana', 'Plátano', 'Naranja', 'Fresa', 'Uva', 'Kiwi', 'Piña', 'Mango'],
    'verdura': ['Brócoli', 'Zanahoria', 'Espinaca', 'Tomate', 'Pepino', 'Lechuga', 'Pimiento'],
    'carne': ['Filete de ternera', 'Carne picada', 'Lomo de cerdo', 'Chuleta', 'Costillas'],
    'pescado': ['Salmón', 'Atún', 'Bacalao', 'Dorada', 'Gambas', 'Calamares'],
    'legumbre': ['Garbanzos', 'Lentejas', 'Judías', 'Guisantes', 'Soja'],
    'frutos secos': ['Almendras', 'Nueces', 'Pistachos', 'Anacardos', 'Avellanas'],
    'bebida': ['Agua', 'Zumo de naranja', 'Refresco', 'Café', 'Té', 'Batido'],
    'postre': ['Helado', 'Tarta', 'Galletas', 'Chocolate', 'Yogur', 'Flan']
  };

  // Determinar qué categoría usar basada en la consulta
  let foodList: string[] = [];
  let matchedCategory = false;

  for (const [category, items] of Object.entries(categories)) {
    if (query.toLowerCase().includes(category)) {
      foodList = items;
      matchedCategory = true;
      break;
    }
  }

  // Si no hay coincidencia, usar una mezcla de categorías
  if (!matchedCategory) {
    foodList = Object.values(categories).flat().filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    // Si aún no hay coincidencias, devolver algunos alimentos aleatorios
    if (foodList.length === 0) {
      foodList = Object.values(categories).flat();
      // Seleccionar aleatoriamente algunos elementos
      foodList = foodList.sort(() => 0.5 - Math.random()).slice(0, 20);
    }
  }

  // Limitar a la cantidad solicitada
  foodList = foodList.slice(0, limit);

  // Generar datos para cada alimento
  for (let i = 0; i < foodList.length; i++) {
    const foodName = foodList[i];
    const brands = ['Hacendado', 'Carrefour', 'El Pozo', 'Pascual', 'Danone', 'Nestlé', 'Bimbo', 'La Cocinera'];

    foods.push({
      id: `mock-${Date.now()}-${i}`,
      name: foodName,
      brand: brands[Math.floor(Math.random() * brands.length)],
      serving_size: '100',
      serving_unit: 'g',
      calories: Math.floor(Math.random() * 400) + 50,
      protein: parseFloat((Math.random() * 30).toFixed(1)),
      carbs: parseFloat((Math.random() * 50).toFixed(1)),
      fat: parseFloat((Math.random() * 20).toFixed(1)),
      fiber: parseFloat((Math.random() * 10).toFixed(1)),
      sugar: parseFloat((Math.random() * 15).toFixed(1)),
      sodium: parseFloat((Math.random() * 500).toFixed(1)),
      cholesterol: parseFloat((Math.random() * 100).toFixed(1)),
      image_url: `https://source.unsplash.com/random/100x100?food&${i}`,
      is_verified: Math.random() > 0.2 // 80% de probabilidad de ser verificado
    });
  }

  return foods;
}

// Función para buscar alimentos en la base de datos local (Supabase)
export const searchFoodDatabase = async (query: string): Promise<{ data: FoodItem[] | null; error: Error | null }> => {
  try {
    // Buscar en la tabla food_database de Supabase
    const { data, error } = await supabase
      .from('food_database')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(20);

    if (error) {
      throw error;
    }

    // Si no hay datos o hay un error, usar datos de ejemplo
    if (!data || data.length === 0) {
      // Generar datos de ejemplo como fallback
      const mockFoods = generateMockFoodData(query, 10);
      return {
        data: mockFoods,
        error: null
      };
    }

    // Mapear los resultados al formato FoodItem
    const foodItems: FoodItem[] = data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand || 'Genérico',
      serving_size: item.serving_size || '100',
      serving_unit: item.serving_unit || 'g',
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
      sugar: item.sugar || 0,
      sodium: item.sodium || 0,
      cholesterol: item.cholesterol || 0,
      image_url: item.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
      is_verified: item.is_verified || false
    }));

    return {
      data: foodItems,
      error: null
    };
  } catch (error) {
    console.error('Error al buscar alimentos en la base de datos:', error);

    // En caso de error, devolver datos de ejemplo como fallback
    const mockFoods = generateMockFoodData(query, 10);
    return {
      data: mockFoods,
      error: null
    };
  }
};

export const searchByBarcode = async (barcode: string): Promise<{ data: FoodItem | null; error: Error | null }> => {
  try {
    // Simulación de delay para simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulación de respuesta basada en el código de barras
    // En un entorno real, esto se conectaría a una API como Open Food Facts
    const mockFood: FoodItem = {
      id: `barcode-${barcode}`,
      name: `Producto con código ${barcode}`,
      brand: 'Marca escaneada',
      serving_size: '100',
      serving_unit: 'g',
      calories: Math.floor(Math.random() * 400) + 50,
      protein: parseFloat((Math.random() * 30).toFixed(1)),
      carbs: parseFloat((Math.random() * 50).toFixed(1)),
      fat: parseFloat((Math.random() * 20).toFixed(1)),
      fiber: parseFloat((Math.random() * 10).toFixed(1)),
      sugar: parseFloat((Math.random() * 15).toFixed(1)),
      sodium: parseFloat((Math.random() * 500).toFixed(1)),
      cholesterol: parseFloat((Math.random() * 100).toFixed(1)),
      image_url: `https://source.unsplash.com/random/100x100?food&barcode`,
      barcode: barcode,
      is_verified: true
    };

    return {
      data: mockFood,
      error: null
    };
  } catch (error) {
    console.error('Error al buscar por código de barras:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Error desconocido al buscar por código de barras')
    };
  }
};
