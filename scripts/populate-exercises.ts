import { supabase } from '../lib/supabase-client';
import generateExercises from './generate-exercises';
import fs from 'fs';
import path from 'path';

// Número de ejercicios a generar
const NUM_EXERCISES = 1000;

// Función para guardar los ejercicios en un archivo JSON
async function saveExercisesToFile(count: number) {
  console.log(`Generando ${count} ejercicios...`);
  const exercises = generateExercises(count);
  
  const outputPath = path.join(__dirname, 'exercises-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));
  
  console.log(`Ejercicios guardados en ${outputPath}`);
  return exercises;
}

// Función para insertar ejercicios en Supabase
async function insertExercisesToSupabase(count: number) {
  console.log(`Generando e insertando ${count} ejercicios en Supabase...`);
  
  // Generar ejercicios
  const exercises = generateExercises(count);
  
  // Insertar en lotes de 100 para evitar límites de API
  const batchSize = 100;
  const batches = Math.ceil(exercises.length / batchSize);
  
  console.log(`Insertando en ${batches} lotes de ${batchSize} ejercicios...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, exercises.length);
    const batch = exercises.slice(start, end);
    
    console.log(`Insertando lote ${i + 1}/${batches} (${batch.length} ejercicios)...`);
    
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert(batch);
      
      if (error) {
        console.error(`Error al insertar lote ${i + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`Lote ${i + 1} insertado correctamente.`);
        successCount += batch.length;
      }
    } catch (err) {
      console.error(`Error al insertar lote ${i + 1}:`, err);
      errorCount += batch.length;
    }
    
    // Esperar un poco entre lotes para no sobrecargar la API
    if (i < batches - 1) {
      console.log('Esperando 2 segundos antes del siguiente lote...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`Proceso completado. ${successCount} ejercicios insertados correctamente, ${errorCount} con errores.`);
}

// Función para leer ejercicios de un archivo JSON y subirlos a Supabase
async function uploadExercisesFromFile(filePath: string) {
  console.log(`Leyendo ejercicios desde ${filePath}...`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const exercises = JSON.parse(fileContent);
    
    console.log(`Encontrados ${exercises.length} ejercicios en el archivo.`);
    
    // Insertar en lotes de 100 para evitar límites de API
    const batchSize = 100;
    const batches = Math.ceil(exercises.length / batchSize);
    
    console.log(`Insertando en ${batches} lotes de ${batchSize} ejercicios...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, exercises.length);
      const batch = exercises.slice(start, end);
      
      console.log(`Insertando lote ${i + 1}/${batches} (${batch.length} ejercicios)...`);
      
      try {
        const { data, error } = await supabase
          .from('exercises')
          .insert(batch);
        
        if (error) {
          console.error(`Error al insertar lote ${i + 1}:`, error);
          errorCount += batch.length;
        } else {
          console.log(`Lote ${i + 1} insertado correctamente.`);
          successCount += batch.length;
        }
      } catch (err) {
        console.error(`Error al insertar lote ${i + 1}:`, err);
        errorCount += batch.length;
      }
      
      // Esperar un poco entre lotes para no sobrecargar la API
      if (i < batches - 1) {
        console.log('Esperando 2 segundos antes del siguiente lote...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`Proceso completado. ${successCount} ejercicios insertados correctamente, ${errorCount} con errores.`);
  } catch (err) {
    console.error('Error al leer o procesar el archivo:', err);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'generate':
      // Generar y guardar en archivo
      const count = parseInt(args[1]) || NUM_EXERCISES;
      await saveExercisesToFile(count);
      break;
      
    case 'insert':
      // Insertar directamente en Supabase
      const insertCount = parseInt(args[1]) || NUM_EXERCISES;
      await insertExercisesToSupabase(insertCount);
      break;
      
    case 'upload':
      // Leer de archivo y subir a Supabase
      const filePath = args[1] || path.join(__dirname, 'exercises-data.json');
      await uploadExercisesFromFile(filePath);
      break;
      
    default:
      console.log(`
Uso: ts-node populate-exercises.ts [comando] [opciones]

Comandos:
  generate [count]    Genera y guarda ejercicios en un archivo JSON
  insert [count]      Genera e inserta ejercicios directamente en Supabase
  upload [filePath]   Lee ejercicios de un archivo JSON y los sube a Supabase

Ejemplos:
  ts-node populate-exercises.ts generate 500
  ts-node populate-exercises.ts insert 1000
  ts-node populate-exercises.ts upload ./my-exercises.json
      `);
  }
}

// Ejecutar el script
main().catch(console.error);
