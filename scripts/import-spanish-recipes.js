// Script para importar recetas españolas a Supabase
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

// Función para extraer las recetas españolas del archivo
async function extractSpanishRecipes() {
  try {
    // Leer el contenido del archivo
    const spanishRecipesPath = path.join(process.cwd(), 'lib', 'data', 'spanish-recipes-database.ts');
    let content = fs.readFileSync(spanishRecipesPath, 'utf8');
    
    // Extraer las recetas españolas
    const spanishRecipesMatch = content.match(/export const spanishRecipes: Recipe\[\] = \[([^\]]+)\]/s);
    if (!spanishRecipesMatch) {
      throw new Error('No se pudo encontrar spanishRecipes en el archivo');
    }
    
    // Crear un archivo temporal con los datos extraídos
    const tempContent = `
      const spanishRecipes = [${spanishRecipesMatch[1]}];
      
      module.exports = {
        spanishRecipes
      };
    `;
    
    const tempFilePath = path.join(process.cwd(), 'scripts', 'temp-spanish-recipes.js');
    fs.writeFileSync(tempFilePath, tempContent);
    
    // Cargar los datos desde el archivo temporal
    const spanishRecipesData = require('./temp-spanish-recipes.js');
    
    // Eliminar el archivo temporal
    fs.unlinkSync(tempFilePath);
    
    return spanishRecipesData.spanishRecipes;
  } catch (error) {
    console.error('Error al extraer las recetas españolas:', error);
    throw error;
  }
}

// Función para importar recetas a Supabase
async function importRecipesToSupabase(recipes) {
  try {
    console.log(`Importando ${recipes.length} recetas a Supabase...`);
    
    // Importar en lotes de 20 para evitar límites de tamaño de solicitud
    const batchSize = 20;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      console.log(`Importando lote ${i / batchSize + 1} de ${Math.ceil(recipes.length / batchSize)}...`);
      
      // Convertir arrays a JSON
      const processedBatch = batch.map(recipe => {
        return {
          ...recipe,
          ingredients: JSON.stringify(recipe.ingredients),
          steps: JSON.stringify(recipe.steps),
          category: JSON.stringify(recipe.category)
        };
      });
      
      const { error } = await supabase
        .from('recipes')
        .upsert(processedBatch, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error al importar lote ${i / batchSize + 1}:`, error);
        failed += batch.length;
      } else {
        imported += batch.length;
        console.log(`Lote ${i / batchSize + 1} importado correctamente (${batch.length} recetas)`);
      }
    }
    
    console.log(`Importación completada: ${imported} recetas importadas, ${failed} fallidas`);
    return { imported, failed };
  } catch (error) {
    console.error('Error al importar recetas a Supabase:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando importación de recetas españolas a Supabase...');
    
    // Extraer las recetas españolas
    const spanishRecipes = await extractSpanishRecipes();
    console.log(`Se han extraído ${spanishRecipes.length} recetas españolas`);
    
    // Importar las recetas a Supabase
    const result = await importRecipesToSupabase(spanishRecipes);
    
    console.log('Importación finalizada');
    console.log(`Total de recetas importadas: ${result.imported}`);
    console.log(`Total de recetas fallidas: ${result.failed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error en la importación:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
