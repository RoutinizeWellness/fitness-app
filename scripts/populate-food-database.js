// Script para poblar la base de datos de alimentos con productos españoles
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

// Categorías de alimentos españoles
const foodCategories = {
  'Lácteos': [
    { name: 'Leche entera Hacendado', calories: 65, protein: 3.1, carbs: 4.7, fat: 3.6, brand: 'Hacendado' },
    { name: 'Leche semidesnatada Pascual', calories: 46, protein: 3.2, carbs: 4.8, fat: 1.6, brand: 'Pascual' },
    { name: 'Leche desnatada Asturiana', calories: 35, protein: 3.3, carbs: 4.9, fat: 0.3, brand: 'Asturiana' },
    { name: 'Yogur natural Danone', calories: 57, protein: 3.8, carbs: 5.0, fat: 2.9, brand: 'Danone' },
    { name: 'Yogur griego Fage', calories: 97, protein: 5.6, carbs: 3.8, fat: 5.0, brand: 'Fage' },
    { name: 'Queso fresco Burgos', calories: 174, protein: 11.0, carbs: 2.5, fat: 13.0, brand: 'Burgos' },
    { name: 'Queso manchego curado', calories: 392, protein: 26.0, carbs: 0.5, fat: 32.0, brand: 'García Baquero' },
    { name: 'Queso de cabra', calories: 364, protein: 21.6, carbs: 2.0, fat: 30.0, brand: 'El Pastor' },
    { name: 'Requesón', calories: 96, protein: 11.1, carbs: 3.0, fat: 4.3, brand: 'La Fageda' },
    { name: 'Cuajada', calories: 90, protein: 5.6, carbs: 5.0, fat: 5.0, brand: 'Kaiku' },
    { name: 'Batido de chocolate Puleva', calories: 80, protein: 3.0, carbs: 12.0, fat: 2.5, brand: 'Puleva' },
    { name: 'Natillas vainilla Danone', calories: 120, protein: 3.5, carbs: 20.0, fat: 3.0, brand: 'Danone' },
    { name: 'Flan de huevo Dhul', calories: 125, protein: 3.8, carbs: 22.0, fat: 3.0, brand: 'Dhul' },
    { name: 'Arroz con leche Nestlé', calories: 135, protein: 3.0, carbs: 24.0, fat: 3.5, brand: 'Nestlé' },
    { name: 'Queso para untar Philadelphia', calories: 235, protein: 5.5, carbs: 4.0, fat: 21.0, brand: 'Philadelphia' },
  ],
  'Carnes': [
    { name: 'Pechuga de pollo', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, brand: 'El Pozo' },
    { name: 'Filete de ternera', calories: 250, protein: 26.0, carbs: 0.0, fat: 17.0, brand: 'Carrefour' },
    { name: 'Lomo de cerdo', calories: 242, protein: 27.0, carbs: 0.0, fat: 14.0, brand: 'Campofrio' },
    { name: 'Chuletas de cordero', calories: 294, protein: 25.0, carbs: 0.0, fat: 21.0, brand: 'Mercadona' },
    { name: 'Hamburguesa de ternera', calories: 250, protein: 20.0, carbs: 0.0, fat: 20.0, brand: 'Hacendado' },
    { name: 'Pavo en filetes', calories: 135, protein: 29.0, carbs: 0.0, fat: 2.0, brand: 'Campofrío' },
    { name: 'Conejo entero', calories: 173, protein: 25.0, carbs: 0.0, fat: 8.0, brand: 'Carrefour' },
    { name: 'Carne picada mixta', calories: 243, protein: 17.0, carbs: 0.0, fat: 20.0, brand: 'Dia' },
    { name: 'Solomillo ibérico', calories: 208, protein: 21.0, carbs: 0.0, fat: 14.0, brand: 'Navidul' },
    { name: 'Costillas de cerdo', calories: 277, protein: 17.0, carbs: 0.0, fat: 23.0, brand: 'El Pozo' },
    { name: 'Pollo entero', calories: 215, protein: 18.0, carbs: 0.0, fat: 15.0, brand: 'Coren' },
    { name: 'Muslos de pollo', calories: 209, protein: 17.0, carbs: 0.0, fat: 15.0, brand: 'Pavofrío' },
    { name: 'Alitas de pollo', calories: 266, protein: 19.0, carbs: 0.0, fat: 21.0, brand: 'Coren' },
    { name: 'Hígado de ternera', calories: 175, protein: 27.0, carbs: 3.0, fat: 7.0, brand: 'Carrefour' },
    { name: 'Callos', calories: 112, protein: 16.0, carbs: 0.0, fat: 5.0, brand: 'La Cocina de Senén' },
  ],
  'Pescados y mariscos': [
    { name: 'Merluza fresca', calories: 86, protein: 17.0, carbs: 0.0, fat: 2.0, brand: 'Pescanova' },
    { name: 'Salmón', calories: 206, protein: 20.0, carbs: 0.0, fat: 13.0, brand: 'Carrefour' },
    { name: 'Atún fresco', calories: 184, protein: 25.0, carbs: 0.0, fat: 8.0, brand: 'Hacendado' },
    { name: 'Dorada', calories: 156, protein: 21.0, carbs: 0.0, fat: 7.0, brand: 'Pescanova' },
    { name: 'Bacalao fresco', calories: 105, protein: 23.0, carbs: 0.0, fat: 1.0, brand: 'Pescanova' },
    { name: 'Gambas', calories: 119, protein: 24.0, carbs: 0.0, fat: 2.0, brand: 'Pescanova' },
    { name: 'Mejillones', calories: 172, protein: 24.0, carbs: 7.0, fat: 4.5, brand: 'Rianxeira' },
    { name: 'Pulpo', calories: 164, protein: 30.0, carbs: 4.0, fat: 2.0, brand: 'Pescanova' },
    { name: 'Calamares', calories: 175, protein: 18.0, carbs: 8.0, fat: 7.0, brand: 'Pescanova' },
    { name: 'Boquerones', calories: 131, protein: 20.0, carbs: 0.0, fat: 5.0, brand: 'Carrefour' },
    { name: 'Sardinas', calories: 208, protein: 24.0, carbs: 0.0, fat: 12.0, brand: 'Hacendado' },
    { name: 'Rape', calories: 97, protein: 21.0, carbs: 0.0, fat: 1.0, brand: 'Pescanova' },
    { name: 'Lubina', calories: 124, protein: 24.0, carbs: 0.0, fat: 2.5, brand: 'Carrefour' },
    { name: 'Almejas', calories: 148, protein: 26.0, carbs: 5.0, fat: 2.0, brand: 'Pescanova' },
    { name: 'Berberechos', calories: 130, protein: 18.0, carbs: 3.5, fat: 4.0, brand: 'Rianxeira' },
  ],
  'Frutas': [
    { name: 'Naranja', calories: 47, protein: 0.9, carbs: 12.0, fat: 0.1, brand: 'Hacendado' },
    { name: 'Manzana Golden', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, brand: 'Carrefour' },
    { name: 'Plátano de Canarias', calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, brand: 'Plátano de Canarias' },
    { name: 'Fresas', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, brand: 'Hacendado' },
    { name: 'Uvas', calories: 69, protein: 0.6, carbs: 18.0, fat: 0.2, brand: 'Carrefour' },
    { name: 'Sandía', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, brand: 'Hacendado' },
    { name: 'Melón', calories: 34, protein: 0.8, carbs: 8.0, fat: 0.2, brand: 'Carrefour' },
    { name: 'Piña', calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1, brand: 'Dole' },
    { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15.0, fat: 0.5, brand: 'Zespri' },
    { name: 'Melocotón', calories: 39, protein: 0.9, carbs: 10.0, fat: 0.3, brand: 'Hacendado' },
    { name: 'Pera', calories: 57, protein: 0.4, carbs: 15.0, fat: 0.1, brand: 'Carrefour' },
    { name: 'Mandarina', calories: 40, protein: 0.6, carbs: 10.0, fat: 0.2, brand: 'Hacendado' },
    { name: 'Mango', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, brand: 'Carrefour' },
    { name: 'Aguacate', calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0, brand: 'Hacendado' },
    { name: 'Cerezas', calories: 50, protein: 1.0, carbs: 12.0, fat: 0.3, brand: 'Carrefour' },
  ],
  'Verduras y hortalizas': [
    { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, brand: 'Hacendado' },
    { name: 'Lechuga', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, brand: 'Carrefour' },
    { name: 'Zanahoria', calories: 41, protein: 0.9, carbs: 10.0, fat: 0.2, brand: 'Hacendado' },
    { name: 'Cebolla', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, brand: 'Carrefour' },
    { name: 'Pimiento verde', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, brand: 'Hacendado' },
    { name: 'Pimiento rojo', calories: 31, protein: 1.0, carbs: 6.0, fat: 0.3, brand: 'Carrefour' },
    { name: 'Calabacín', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, brand: 'Hacendado' },
    { name: 'Berenjena', calories: 25, protein: 1.0, carbs: 6.0, fat: 0.2, brand: 'Carrefour' },
    { name: 'Espinacas', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, brand: 'Hacendado' },
    { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, brand: 'Carrefour' },
    { name: 'Coliflor', calories: 25, protein: 2.0, carbs: 5.0, fat: 0.3, brand: 'Hacendado' },
    { name: 'Judías verdes', calories: 31, protein: 1.8, carbs: 7.0, fat: 0.1, brand: 'Carrefour' },
    { name: 'Alcachofas', calories: 47, protein: 3.3, carbs: 10.5, fat: 0.2, brand: 'Hacendado' },
    { name: 'Espárragos', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.2, brand: 'Carrefour' },
    { name: 'Patata', calories: 77, protein: 2.0, carbs: 17.0, fat: 0.1, brand: 'Hacendado' },
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
  console.log('Iniciando inserción de alimentos...');
  
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
