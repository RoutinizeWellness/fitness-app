// Script para ejecutar todos los scripts de población de alimentos
const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando población de la base de datos de alimentos...');

// Función para ejecutar un script
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Ejecutando script: ${scriptPath}`);
    
    const process = exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar ${scriptPath}:`, error);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`Error en la salida de ${scriptPath}:`, stderr);
      }
      
      console.log(stdout);
      resolve();
    });
    
    // Mostrar la salida en tiempo real
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}

// Ejecutar los scripts en secuencia
async function runAllScripts() {
  try {
    // Ejecutar el primer script
    await runScript(path.join(__dirname, 'populate-food-database.js'));
    console.log('Script 1 completado');
    
    // Ejecutar el segundo script
    await runScript(path.join(__dirname, 'populate-food-database-part2.js'));
    console.log('Script 2 completado');
    
    // Ejecutar el tercer script
    await runScript(path.join(__dirname, 'populate-food-database-part3.js'));
    console.log('Script 3 completado');
    
    console.log('¡Todos los scripts han sido ejecutados correctamente!');
    console.log('La base de datos de alimentos ha sido poblada con éxito.');
  } catch (error) {
    console.error('Error al ejecutar los scripts:', error);
    process.exit(1);
  }
}

// Ejecutar todos los scripts
runAllScripts();
