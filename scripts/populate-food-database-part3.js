// Script para poblar la base de datos de alimentos con productos españoles (Parte 3)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Más categorías de alimentos españoles
const foodCategories = {
  'Bebidas': [
    { name: 'Agua mineral', calories: 0, protein: 0.0, carbs: 0.0, fat: 0.0, brand: 'Font Vella' },
    { name: 'Agua con gas', calories: 0, protein: 0.0, carbs: 0.0, fat: 0.0, brand: 'Vichy Catalán' },
    { name: 'Zumo de naranja', calories: 45, protein: 0.7, carbs: 10.0, fat: 0.2, brand: 'Don Simón' },
    { name: 'Zumo de manzana', calories: 47, protein: 0.1, carbs: 11.5, fat: 0.1, brand: 'Hacendado' },
    { name: 'Zumo de piña', calories: 50, protein: 0.3, carbs: 12.0, fat: 0.1, brand: 'Don Simón' },
    { name: 'Refresco de cola', calories: 42, protein: 0.0, carbs: 10.6, fat: 0.0, brand: 'Coca-Cola' },
    { name: 'Refresco de naranja', calories: 48, protein: 0.0, carbs: 12.0, fat: 0.0, brand: 'Fanta' },
    { name: 'Refresco de limón', calories: 43, protein: 0.0, carbs: 10.5, fat: 0.0, brand: 'Fanta' },
    { name: 'Cerveza', calories: 43, protein: 0.5, carbs: 3.6, fat: 0.0, brand: 'Mahou' },
    { name: 'Cerveza sin alcohol', calories: 24, protein: 0.4, carbs: 5.0, fat: 0.0, brand: 'San Miguel' },
    { name: 'Vino tinto', calories: 85, protein: 0.1, carbs: 2.7, fat: 0.0, brand: 'Torres' },
    { name: 'Vino blanco', calories: 82, protein: 0.1, carbs: 2.6, fat: 0.0, brand: 'Marqués de Riscal' },
    { name: 'Café', calories: 2, protein: 0.1, carbs: 0.0, fat: 0.0, brand: 'Marcilla' },
    { name: 'Té', calories: 1, protein: 0.0, carbs: 0.2, fat: 0.0, brand: 'Hornimans' },
    { name: 'Leche de almendras', calories: 24, protein: 1.1, carbs: 3.0, fat: 1.1, brand: 'Almond Breeze' },
    { name: 'Leche de soja', calories: 33, protein: 3.3, carbs: 1.0, fat: 1.8, brand: 'Alpro' },
    { name: 'Leche de avena', calories: 40, protein: 1.0, carbs: 6.5, fat: 1.5, brand: 'Oatly' },
    { name: 'Leche de coco', calories: 20, protein: 0.2, carbs: 1.0, fat: 2.0, brand: 'Alpro' },
    { name: 'Batido de chocolate', calories: 80, protein: 3.3, carbs: 12.0, fat: 2.0, brand: 'Puleva' },
    { name: 'Batido de fresa', calories: 74, protein: 3.3, carbs: 11.0, fat: 2.0, brand: 'Puleva' },
  ],
  'Dulces y postres': [
    { name: 'Chocolate negro', calories: 598, protein: 7.8, carbs: 46.0, fat: 43.0, brand: 'Valor' },
    { name: 'Chocolate con leche', calories: 535, protein: 7.7, carbs: 59.0, fat: 30.0, brand: 'Nestlé' },
    { name: 'Chocolate blanco', calories: 539, protein: 6.1, carbs: 59.0, fat: 31.0, brand: 'Milka' },
    { name: 'Galletas María', calories: 436, protein: 7.5, carbs: 75.0, fat: 12.0, brand: 'Fontaneda' },
    { name: 'Galletas de chocolate', calories: 480, protein: 6.0, carbs: 68.0, fat: 20.0, brand: 'Oreo' },
    { name: 'Croissant', calories: 406, protein: 8.0, carbs: 45.0, fat: 22.0, brand: 'La Bella Easo' },
    { name: 'Magdalenas', calories: 389, protein: 5.4, carbs: 51.0, fat: 19.0, brand: 'La Bella Easo' },
    { name: 'Donut', calories: 391, protein: 5.0, carbs: 51.0, fat: 19.0, brand: 'Donuts' },
    { name: 'Tarta de queso', calories: 321, protein: 6.0, carbs: 26.0, fat: 21.0, brand: 'Hacendado' },
    { name: 'Tarta de chocolate', calories: 389, protein: 5.0, carbs: 45.0, fat: 21.0, brand: 'Hacendado' },
    { name: 'Helado de vainilla', calories: 207, protein: 3.5, carbs: 23.0, fat: 11.0, brand: 'Häagen-Dazs' },
    { name: 'Helado de chocolate', calories: 216, protein: 3.8, carbs: 24.0, fat: 12.0, brand: 'Häagen-Dazs' },
    { name: 'Flan', calories: 126, protein: 3.7, carbs: 22.0, fat: 3.0, brand: 'Dhul' },
    { name: 'Natillas', calories: 120, protein: 3.5, carbs: 20.0, fat: 3.0, brand: 'Danone' },
    { name: 'Arroz con leche', calories: 135, protein: 3.0, carbs: 24.0, fat: 3.5, brand: 'Nestlé' },
    { name: 'Churros', calories: 356, protein: 5.8, carbs: 40.0, fat: 20.0, brand: 'Caseros' },
    { name: 'Turrón de Jijona', calories: 519, protein: 12.0, carbs: 48.0, fat: 32.0, brand: '1880' },
    { name: 'Turrón de Alicante', calories: 478, protein: 11.0, carbs: 50.0, fat: 26.0, brand: '1880' },
    { name: 'Polvorones', calories: 510, protein: 5.0, carbs: 60.0, fat: 28.0, brand: 'El Almendro' },
    { name: 'Mantecados', calories: 520, protein: 5.0, carbs: 62.0, fat: 29.0, brand: 'El Almendro' },
  ],
  'Salsas y condimentos': [
    { name: 'Ketchup', calories: 112, protein: 1.7, carbs: 26.0, fat: 0.1, brand: 'Heinz' },
    { name: 'Mayonesa', calories: 680, protein: 1.3, carbs: 7.0, fat: 75.0, brand: 'Hellmann\'s' },
    { name: 'Mostaza', calories: 66, protein: 4.4, carbs: 6.3, fat: 3.3, brand: 'Dijon' },
    { name: 'Salsa de tomate', calories: 74, protein: 1.5, carbs: 16.0, fat: 0.5, brand: 'Orlando' },
    { name: 'Salsa barbacoa', calories: 112, protein: 1.0, carbs: 28.0, fat: 0.5, brand: 'Heinz' },
    { name: 'Alioli', calories: 700, protein: 1.0, carbs: 6.0, fat: 77.0, brand: 'Hacendado' },
    { name: 'Salsa brava', calories: 120, protein: 1.0, carbs: 12.0, fat: 8.0, brand: 'Hacendado' },
    { name: 'Salsa de soja', calories: 53, protein: 5.6, carbs: 6.0, fat: 0.1, brand: 'Kikkoman' },
    { name: 'Vinagre de vino', calories: 18, protein: 0.0, carbs: 0.9, fat: 0.0, brand: 'Borges' },
    { name: 'Vinagre balsámico', calories: 88, protein: 0.5, carbs: 17.0, fat: 0.0, brand: 'Hacendado' },
    { name: 'Sal', calories: 0, protein: 0.0, carbs: 0.0, fat: 0.0, brand: 'Hacendado' },
    { name: 'Pimienta negra', calories: 251, protein: 10.0, carbs: 64.0, fat: 3.3, brand: 'Hacendado' },
    { name: 'Pimentón', calories: 282, protein: 14.0, carbs: 54.0, fat: 13.0, brand: 'La Chinata' },
    { name: 'Orégano', calories: 306, protein: 11.0, carbs: 69.0, fat: 4.3, brand: 'Hacendado' },
    { name: 'Ajo en polvo', calories: 331, protein: 17.0, carbs: 73.0, fat: 0.7, brand: 'Hacendado' },
    { name: 'Canela', calories: 247, protein: 4.0, carbs: 81.0, fat: 1.2, brand: 'Hacendado' },
    { name: 'Curry', calories: 325, protein: 14.0, carbs: 58.0, fat: 14.0, brand: 'Hacendado' },
    { name: 'Comino', calories: 375, protein: 18.0, carbs: 44.0, fat: 22.0, brand: 'Hacendado' },
    { name: 'Azafrán', calories: 310, protein: 11.0, carbs: 65.0, fat: 6.0, brand: 'La Rosera' },
    { name: 'Cúrcuma', calories: 312, protein: 9.7, carbs: 67.0, fat: 3.3, brand: 'Hacendado' },
  ],
  'Platos preparados': [
    { name: 'Paella', calories: 157, protein: 6.0, carbs: 27.0, fat: 3.0, brand: 'Hacendado' },
    { name: 'Tortilla de patatas', calories: 210, protein: 7.0, carbs: 15.0, fat: 14.0, brand: 'Hacendado' },
    { name: 'Croquetas de jamón', calories: 210, protein: 6.0, carbs: 20.0, fat: 12.0, brand: 'La Cocinera' },
    { name: 'Lasaña de carne', calories: 175, protein: 8.0, carbs: 16.0, fat: 9.0, brand: 'Findus' },
    { name: 'Canelones', calories: 165, protein: 7.0, carbs: 15.0, fat: 8.0, brand: 'La Cocinera' },
    { name: 'Pizza margarita', calories: 267, protein: 11.0, carbs: 33.0, fat: 10.0, brand: 'Casa Tarradellas' },
    { name: 'Pizza de jamón y queso', calories: 280, protein: 13.0, carbs: 30.0, fat: 13.0, brand: 'Casa Tarradellas' },
    { name: 'Gazpacho', calories: 40, protein: 1.0, carbs: 6.0, fat: 1.5, brand: 'Alvalle' },
    { name: 'Salmorejo', calories: 87, protein: 1.5, carbs: 8.0, fat: 5.0, brand: 'Hacendado' },
    { name: 'Fabada asturiana', calories: 160, protein: 7.0, carbs: 20.0, fat: 6.0, brand: 'Litoral' },
    { name: 'Cocido madrileño', calories: 170, protein: 9.0, carbs: 15.0, fat: 8.0, brand: 'Litoral' },
    { name: 'Lentejas con chorizo', calories: 140, protein: 8.0, carbs: 18.0, fat: 4.0, brand: 'Litoral' },
    { name: 'Albóndigas en salsa', calories: 190, protein: 12.0, carbs: 8.0, fat: 12.0, brand: 'Hacendado' },
    { name: 'Ensaladilla rusa', calories: 160, protein: 3.0, carbs: 15.0, fat: 10.0, brand: 'Hacendado' },
    { name: 'Empanada de atún', calories: 280, protein: 9.0, carbs: 30.0, fat: 14.0, brand: 'Hacendado' },
    { name: 'Caldo de pollo', calories: 30, protein: 2.0, carbs: 3.0, fat: 1.0, brand: 'Gallina Blanca' },
    { name: 'Sopa de fideos', calories: 70, protein: 3.0, carbs: 12.0, fat: 1.0, brand: 'Gallina Blanca' },
    { name: 'Puré de patatas', calories: 90, protein: 2.0, carbs: 15.0, fat: 3.0, brand: 'Maggi' },
    { name: 'Hamburguesa con patatas', calories: 450, protein: 20.0, carbs: 40.0, fat: 25.0, brand: 'Hacendado' },
    { name: 'Macarrones con tomate', calories: 150, protein: 5.0, carbs: 25.0, fat: 3.0, brand: 'Hacendado' },
  ],
};

// Función para generar un UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Función para insertar alimentos en la base de datos
async function insertFoods() {
  console.log('Iniciando inserción de alimentos (Parte 3)...');
  
  let totalInserted = 0;
  const batchSize = 50; // Insertar en lotes para evitar sobrecargar la API
  
  for (const [category, foods] of Object.entries(foodCategories)) {
    console.log(`Procesando categoría: ${category}`);
    
    // Preparar los datos para inserción
    const foodsToInsert = foods.map(food => ({
      id: uuidv4(),
      name: food.name,
      category: category,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || Math.random() * 5,
      sugar: food.sugar || Math.random() * 10,
      serving_size: food.serving_size || 100,
      serving_unit: food.serving_unit || 'g',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insertar en lotes
    for (let i = 0; i < foodsToInsert.length; i += batchSize) {
      const batch = foodsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('food_database')
        .insert(batch);
      
      if (error) {
        console.error(`Error al insertar alimentos de ${category}:`, error);
      } else {
        totalInserted += batch.length;
        console.log(`Insertados ${batch.length} alimentos de ${category}`);
      }
    }
  }
  
  console.log(`Proceso completado. Total de alimentos insertados: ${totalInserted}`);
}

// Ejecutar la función principal
insertFoods()
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
