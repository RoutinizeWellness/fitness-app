// Script para importar alimentos españoles a Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://soviwrzrgskhvgcmujfj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY no está definida en las variables de entorno');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para extraer los alimentos españoles del archivo
async function extractSpanishFoods() {
  try {
    // Leer el contenido del archivo
    const spanishFoodsPath = path.join(process.cwd(), 'lib', 'data', 'spanish-foods-database.ts');
    let content = fs.readFileSync(spanishFoodsPath, 'utf8');
    
    // Extraer las categorías de alimentos
    const foodCategoriesMatch = content.match(/export const FOOD_CATEGORIES = {([^}]+)}/s);
    if (!foodCategoriesMatch) {
      throw new Error('No se pudo encontrar FOOD_CATEGORIES en el archivo');
    }
    
    // Extraer los supermercados
    const supermarketsMatch = content.match(/export const SUPERMARKETS = {([^}]+)}/s);
    if (!supermarketsMatch) {
      throw new Error('No se pudo encontrar SUPERMARKETS en el archivo');
    }
    
    // Extraer los alimentos españoles
    const spanishFoodsMatch = content.match(/export const spanishFoods: FoodItem\[\] = \[([^\]]+)\]/s);
    if (!spanishFoodsMatch) {
      throw new Error('No se pudo encontrar spanishFoods en el archivo');
    }
    
    // Extraer los productos de Mercadona
    const mercadonaProductsMatch = content.match(/const mercadonaProducts: FoodItem\[\] = \[([^\]]+)\]/s);
    if (!mercadonaProductsMatch) {
      throw new Error('No se pudo encontrar mercadonaProducts en el archivo');
    }
    
    // Extraer los productos de Carrefour
    const carrefourProductsMatch = content.match(/const carrefourProducts: FoodItem\[\] = \[([^\]]+)\]/s);
    if (!carrefourProductsMatch) {
      throw new Error('No se pudo encontrar carrefourProducts en el archivo');
    }
    
    // Extraer los platos regionales
    const regionalDishesMatch = content.match(/const regionalDishes: FoodItem\[\] = \[([^\]]+)\]/s);
    if (!regionalDishesMatch) {
      throw new Error('No se pudo encontrar regionalDishes en el archivo');
    }
    
    // Crear un archivo temporal con los datos extraídos
    const tempContent = `
      const FOOD_CATEGORIES = {${foodCategoriesMatch[1]}};
      const SUPERMARKETS = {${supermarketsMatch[1]}};
      const spanishFoods = [${spanishFoodsMatch[1]}];
      const mercadonaProducts = [${mercadonaProductsMatch[1]}];
      const carrefourProducts = [${carrefourProductsMatch[1]}];
      const regionalDishes = [${regionalDishesMatch[1]}];
      
      // Combinar todas las categorías de alimentos
      const allSpanishFoods = [
        ...spanishFoods,
        ...mercadonaProducts,
        ...carrefourProducts,
        ...regionalDishes
      ];
      
      module.exports = {
        FOOD_CATEGORIES,
        SUPERMARKETS,
        spanishFoods,
        mercadonaProducts,
        carrefourProducts,
        regionalDishes,
        allSpanishFoods
      };
    `;
    
    const tempFilePath = path.join(process.cwd(), 'scripts', 'temp-spanish-foods.js');
    fs.writeFileSync(tempFilePath, tempContent);
    
    // Cargar los datos desde el archivo temporal
    const spanishFoodsData = require('./temp-spanish-foods.js');
    
    // Eliminar el archivo temporal
    fs.unlinkSync(tempFilePath);
    
    return spanishFoodsData.allSpanishFoods;
  } catch (error) {
    console.error('Error al extraer los alimentos españoles:', error);
    throw error;
  }
}

// Función para importar alimentos a Supabase
async function importFoodsToSupabase(foods) {
  try {
    console.log(`Importando ${foods.length} alimentos a Supabase...`);
    
    // Importar en lotes de 50 para evitar límites de tamaño de solicitud
    const batchSize = 50;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < foods.length; i += batchSize) {
      const batch = foods.slice(i, i + batchSize);
      console.log(`Importando lote ${i / batchSize + 1} de ${Math.ceil(foods.length / batchSize)}...`);
      
      // Convertir alternativeFoods de array a JSON si existe
      const processedBatch = batch.map(food => {
        const processedFood = { ...food };
        if (processedFood.alternativeFoods) {
          processedFood.alternativeFoods = JSON.stringify(processedFood.alternativeFoods);
        }
        return processedFood;
      });
      
      const { error } = await supabase
        .from('food_database')
        .upsert(processedBatch, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error al importar lote ${i / batchSize + 1}:`, error);
        failed += batch.length;
      } else {
        imported += batch.length;
        console.log(`Lote ${i / batchSize + 1} importado correctamente (${batch.length} alimentos)`);
      }
    }
    
    console.log(`Importación completada: ${imported} alimentos importados, ${failed} fallidos`);
    return { imported, failed };
  } catch (error) {
    console.error('Error al importar alimentos a Supabase:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando importación de alimentos españoles a Supabase...');
    
    // Extraer los alimentos españoles
    const spanishFoods = await extractSpanishFoods();
    console.log(`Se han extraído ${spanishFoods.length} alimentos españoles`);
    
    // Importar los alimentos a Supabase
    const result = await importFoodsToSupabase(spanishFoods);
    
    console.log('Importación finalizada');
    console.log(`Total de alimentos importados: ${result.imported}`);
    console.log(`Total de alimentos fallidos: ${result.failed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error en la importación:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
