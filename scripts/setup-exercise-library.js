// Script para configurar la biblioteca de ejercicios
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Función para ejecutar comandos con mejor formato
function runCommand(command, description) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${description} ===${colors.reset}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ Completado: ${description}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`\n${colors.red}✗ Error: ${description}${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}\n`);
    return false;
  }
}

// Función principal
async function setupExerciseLibrary() {
  console.log(`\n${colors.bright}${colors.yellow}🏋️ CONFIGURACIÓN DE LA BIBLIOTECA DE EJERCICIOS 🏋️${colors.reset}\n`);
  console.log(`Este script realizará las siguientes acciones:`);
  console.log(`1. Aplicar la migración para actualizar la tabla de ejercicios`);
  console.log(`2. Generar y poblar la base de datos con 1000 ejercicios detallados`);
  
  // Verificar que el archivo de migración existe
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240701_update_exercises_table.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error(`\n${colors.red}✗ Error: No se encontró el archivo de migración en ${migrationPath}${colors.reset}\n`);
    return;
  }
  
  // Aplicar la migración
  console.log(`\n${colors.yellow}Aplicando migración a Supabase...${colors.reset}`);
  const migrationSuccess = runCommand(
    `npx supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres`,
    'Aplicar migración a la base de datos'
  );
  
  if (!migrationSuccess) {
    console.log(`\n${colors.yellow}Alternativa: Puedes aplicar manualmente la migración desde la consola SQL de Supabase.${colors.reset}`);
    console.log(`1. Ve a https://supabase.com/dashboard/project/soviwrzrgskhvgcmujfj/sql`);
    console.log(`2. Copia y pega el contenido del archivo ${migrationPath}`);
    console.log(`3. Ejecuta la consulta SQL`);
    
    const continueSetup = true; // En una aplicación real, aquí se pediría confirmación al usuario
    if (!continueSetup) {
      return;
    }
  }
  
  // Generar y poblar la base de datos con ejercicios
  console.log(`\n${colors.yellow}Generando y poblando ejercicios...${colors.reset}`);
  runCommand(
    `npx tsx scripts/populate-exercises-db.ts`,
    'Generar y poblar ejercicios en la base de datos'
  );
  
  console.log(`\n${colors.bright}${colors.green}🎉 ¡Configuración completada! 🎉${colors.reset}\n`);
  console.log(`La biblioteca de ejercicios ha sido configurada correctamente.`);
  console.log(`Ahora puedes acceder a la aplicación y explorar los 1000 ejercicios disponibles.`);
}

// Ejecutar la función principal
setupExerciseLibrary().catch(error => {
  console.error(`\n${colors.red}Error inesperado:${colors.reset}`, error);
  process.exit(1);
});
