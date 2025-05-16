// Script para poblar la base de datos de alimentos con productos españoles (Parte 2)
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
  'Legumbres': [
    { name: 'Garbanzos cocidos', calories: 164, protein: 8.9, carbs: 27.0, fat: 2.6, brand: 'Hacendado' },
    { name: 'Lentejas cocidas', calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, brand: 'Luengo' },
    { name: 'Judías blancas', calories: 127, protein: 8.7, carbs: 22.0, fat: 0.5, brand: 'El Cidacos' },
    { name: 'Judías pintas', calories: 130, protein: 8.5, carbs: 23.0, fat: 0.6, brand: 'Luengo' },
    { name: 'Habas', calories: 110, protein: 7.6, carbs: 19.0, fat: 0.4, brand: 'Hacendado' },
    { name: 'Soja texturizada', calories: 340, protein: 52.0, carbs: 30.0, fat: 1.0, brand: 'Biográ' },
    { name: 'Guisantes', calories: 81, protein: 5.4, carbs: 14.0, fat: 0.4, brand: 'Findus' },
    { name: 'Alubias rojas', calories: 127, protein: 8.7, carbs: 22.0, fat: 0.5, brand: 'Luengo' },
    { name: 'Garbanzos secos', calories: 364, protein: 19.0, carbs: 61.0, fat: 6.0, brand: 'Hacendado' },
    { name: 'Lentejas secas', calories: 353, protein: 24.0, carbs: 60.0, fat: 1.1, brand: 'Luengo' },
    { name: 'Hummus', calories: 166, protein: 7.9, carbs: 14.0, fat: 9.6, brand: 'Hacendado' },
    { name: 'Tofu', calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8, brand: 'Sojasun' },
    { name: 'Tempeh', calories: 193, protein: 19.0, carbs: 9.4, fat: 11.0, brand: 'Vegetalia' },
    { name: 'Edamame', calories: 121, protein: 11.0, carbs: 10.0, fat: 5.0, brand: 'Hacendado' },
    { name: 'Falafel', calories: 333, protein: 13.0, carbs: 31.0, fat: 18.0, brand: 'Vegetalia' },
  ],
  'Cereales y derivados': [
    { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, brand: 'La Fallera' },
    { name: 'Arroz integral', calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, brand: 'Brillante' },
    { name: 'Pan blanco', calories: 265, protein: 8.5, carbs: 52.0, fat: 1.6, brand: 'Bimbo' },
    { name: 'Pan integral', calories: 247, protein: 10.0, carbs: 46.0, fat: 3.0, brand: 'Silueta' },
    { name: 'Pasta', calories: 158, protein: 5.8, carbs: 31.0, fat: 0.9, brand: 'Gallo' },
    { name: 'Pasta integral', calories: 152, protein: 6.5, carbs: 30.0, fat: 1.0, brand: 'Hacendado' },
    { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21.0, fat: 1.9, brand: 'Quinua Real' },
    { name: 'Cuscús', calories: 112, protein: 3.8, carbs: 23.0, fat: 0.2, brand: 'Hacendado' },
    { name: 'Avena', calories: 389, protein: 16.9, carbs: 66.0, fat: 6.9, brand: 'Quaker' },
    { name: 'Maíz dulce', calories: 86, protein: 3.2, carbs: 19.0, fat: 1.2, brand: 'Bonduelle' },
    { name: 'Tortitas de arroz', calories: 388, protein: 7.0, carbs: 81.0, fat: 3.0, brand: 'Bicentury' },
    { name: 'Tortitas de maíz', calories: 381, protein: 7.7, carbs: 78.0, fat: 4.0, brand: 'Hacendado' },
    { name: 'Cereales de desayuno', calories: 378, protein: 7.5, carbs: 84.0, fat: 0.8, brand: 'Kellogg\'s' },
    { name: 'Muesli', calories: 367, protein: 10.0, carbs: 62.0, fat: 8.0, brand: 'Hacendado' },
    { name: 'Harina de trigo', calories: 364, protein: 10.0, carbs: 76.0, fat: 1.0, brand: 'Gallo' },
  ],
  'Aceites y grasas': [
    { name: 'Aceite de oliva virgen extra', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Carbonell' },
    { name: 'Aceite de oliva', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Hacendado' },
    { name: 'Aceite de girasol', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Koipesol' },
    { name: 'Mantequilla', calories: 717, protein: 0.9, carbs: 0.1, fat: 81.0, brand: 'Asturiana' },
    { name: 'Margarina', calories: 720, protein: 0.2, carbs: 0.7, fat: 80.0, brand: 'Tulipán' },
    { name: 'Manteca de cerdo', calories: 891, protein: 0.0, carbs: 0.0, fat: 99.0, brand: 'Casa Tarradellas' },
    { name: 'Aceite de coco', calories: 862, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Naturgreen' },
    { name: 'Aceite de sésamo', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'La Chinata' },
    { name: 'Ghee (mantequilla clarificada)', calories: 900, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Ayurveda' },
    { name: 'Aceite de aguacate', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Naturgreen' },
    { name: 'Aceite de lino', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Biográ' },
    { name: 'Aceite de nuez', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'La Chinata' },
    { name: 'Aceite de cacahuete', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Hacendado' },
    { name: 'Aceite de maíz', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Koipesol' },
    { name: 'Aceite de colza', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, brand: 'Borges' },
  ],
  'Frutos secos y semillas': [
    { name: 'Almendras', calories: 576, protein: 21.0, carbs: 22.0, fat: 49.0, brand: 'Hacendado' },
    { name: 'Nueces', calories: 654, protein: 15.0, carbs: 14.0, fat: 65.0, brand: 'Borges' },
    { name: 'Avellanas', calories: 628, protein: 15.0, carbs: 17.0, fat: 61.0, brand: 'Hacendado' },
    { name: 'Pistachos', calories: 562, protein: 20.0, carbs: 28.0, fat: 45.0, brand: 'Borges' },
    { name: 'Cacahuetes', calories: 567, protein: 26.0, carbs: 16.0, fat: 49.0, brand: 'Hacendado' },
    { name: 'Pipas de girasol', calories: 584, protein: 21.0, carbs: 20.0, fat: 51.0, brand: 'Facundo' },
    { name: 'Pipas de calabaza', calories: 559, protein: 30.0, carbs: 10.0, fat: 49.0, brand: 'Hacendado' },
    { name: 'Semillas de chía', calories: 486, protein: 17.0, carbs: 42.0, fat: 31.0, brand: 'Biográ' },
    { name: 'Semillas de lino', calories: 534, protein: 18.0, carbs: 29.0, fat: 42.0, brand: 'Hacendado' },
    { name: 'Semillas de sésamo', calories: 573, protein: 17.0, carbs: 23.0, fat: 50.0, brand: 'Biográ' },
    { name: 'Anacardos', calories: 553, protein: 18.0, carbs: 30.0, fat: 44.0, brand: 'Hacendado' },
    { name: 'Piñones', calories: 673, protein: 14.0, carbs: 13.0, fat: 68.0, brand: 'Borges' },
    { name: 'Nueces de Brasil', calories: 656, protein: 14.0, carbs: 12.0, fat: 66.0, brand: 'Hacendado' },
    { name: 'Nueces de macadamia', calories: 718, protein: 8.0, carbs: 14.0, fat: 76.0, brand: 'Borges' },
    { name: 'Semillas de amapola', calories: 525, protein: 18.0, carbs: 28.0, fat: 42.0, brand: 'Biográ' },
  ],
  'Embutidos y fiambres': [
    { name: 'Jamón serrano', calories: 195, protein: 31.0, carbs: 0.0, fat: 8.0, brand: 'Navidul' },
    { name: 'Jamón ibérico', calories: 250, protein: 43.0, carbs: 0.0, fat: 8.0, brand: 'Joselito' },
    { name: 'Chorizo', calories: 455, protein: 24.0, carbs: 2.0, fat: 38.0, brand: 'Revilla' },
    { name: 'Salchichón', calories: 450, protein: 25.0, carbs: 2.0, fat: 37.0, brand: 'Espuña' },
    { name: 'Fuet', calories: 422, protein: 25.0, carbs: 1.0, fat: 35.0, brand: 'Casa Tarradellas' },
    { name: 'Mortadela', calories: 311, protein: 14.0, carbs: 3.0, fat: 28.0, brand: 'El Pozo' },
    { name: 'Pavo en lonchas', calories: 111, protein: 22.0, carbs: 2.0, fat: 2.0, brand: 'Campofrío' },
    { name: 'Jamón cocido', calories: 126, protein: 18.0, carbs: 2.0, fat: 5.0, brand: 'El Pozo' },
    { name: 'Lomo embuchado', calories: 380, protein: 40.0, carbs: 0.0, fat: 23.0, brand: 'Navidul' },
    { name: 'Bacon', calories: 417, protein: 13.0, carbs: 1.0, fat: 42.0, brand: 'Campofrío' },
    { name: 'Salami', calories: 378, protein: 22.0, carbs: 2.0, fat: 32.0, brand: 'Revilla' },
    { name: 'Morcilla', calories: 446, protein: 19.0, carbs: 3.0, fat: 40.0, brand: 'Ríos' },
    { name: 'Sobrasada', calories: 470, protein: 15.0, carbs: 2.0, fat: 45.0, brand: 'Espuña' },
    { name: 'Cecina', calories: 250, protein: 43.0, carbs: 0.0, fat: 8.0, brand: 'El Pozo' },
    { name: 'Paté', calories: 330, protein: 14.0, carbs: 3.0, fat: 30.0, brand: 'La Piara' },
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
  console.log('Iniciando inserción de alimentos (Parte 2)...');
  
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
