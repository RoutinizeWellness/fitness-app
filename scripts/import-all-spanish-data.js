// Script para importar todos los datos españoles a Supabase
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Función para ejecutar un script
async function runScript(scriptPath) {
  try {
    console.log(`Ejecutando script: ${scriptPath}`);
    const { stdout, stderr } = await execPromise(`node ${scriptPath}`);
    
    if (stderr) {
      console.error(`Error en la ejecución del script ${scriptPath}:`, stderr);
    }
    
    console.log(stdout);
    return true;
  } catch (error) {
    console.error(`Error al ejecutar el script ${scriptPath}:`, error);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando importación de todos los datos españoles a Supabase...');
    
    // Importar alimentos españoles
    console.log('\n=== IMPORTANDO ALIMENTOS ESPAÑOLES ===\n');
    const foodsResult = await runScript('./scripts/import-spanish-foods.js');
    
    // Importar recetas españolas
    console.log('\n=== IMPORTANDO RECETAS ESPAÑOLAS ===\n');
    const recipesResult = await runScript('./scripts/import-spanish-recipes.js');
    
    console.log('\n=== RESUMEN DE LA IMPORTACIÓN ===\n');
    console.log(`Alimentos españoles: ${foodsResult ? 'COMPLETADO' : 'FALLIDO'}`);
    console.log(`Recetas españolas: ${recipesResult ? 'COMPLETADO' : 'FALLIDO'}`);
    
    if (foodsResult && recipesResult) {
      console.log('\nImportación completada con éxito');
      process.exit(0);
    } else {
      console.error('\nLa importación ha fallado parcialmente');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error en la importación:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
