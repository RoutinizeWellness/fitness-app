/**
 * Script para actualizar los botones existentes en la aplicación
 * 
 * Este script busca todos los archivos .tsx y .jsx en la aplicación
 * y actualiza los botones existentes para usar los nuevos componentes
 * de botones mejorados.
 * 
 * Uso:
 * node scripts/update-buttons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const rootDir = path.resolve(__dirname, '..');
const excludeDirs = ['node_modules', '.next', 'out', 'build', 'dist', 'scripts'];
const fileExtensions = ['.tsx', '.jsx'];

// Patrones de reemplazo
const replacements = [
  // Reemplazar importaciones
  {
    pattern: /import\s+{\s*Button(?:,\s*[^}]+)?\s*}\s+from\s+["']@\/components\/ui\/button["']/g,
    replacement: `import { ImprovedButton } from "@/components/ui/buttons"`
  },
  // Reemplazar componentes Button por ImprovedButton
  {
    pattern: /<Button(\s+[^>]*)?>/g,
    replacement: `<ImprovedButton$1>`
  },
  {
    pattern: /<\/Button>/g,
    replacement: `</ImprovedButton>`
  },
  // Reemplazar botones de icono
  {
    pattern: /<Button(\s+[^>]*)?size="icon"([^>]*)>/g,
    replacement: `<IconButton$1$2>`
  },
  {
    pattern: /<\/Button>(\s*)(?={\s*\w+\s*})/g,
    checkPrevious: /<Button[^>]*size="icon"/,
    replacement: `</IconButton>$1`
  }
];

// Función para buscar archivos recursivamente
function findFiles(dir, extensions, excludeDirs) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        results = results.concat(findFiles(filePath, extensions, excludeDirs));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// Función para actualizar un archivo
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Verificar si el archivo ya importa los nuevos componentes
  const hasNewImports = content.includes('import { ImprovedButton }') || 
                        content.includes('import { IconButton }');
  
  // Aplicar reemplazos
  for (const { pattern, replacement, checkPrevious } of replacements) {
    if (checkPrevious && !checkPrevious.test(content)) {
      continue;
    }
    
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  }
  
  // Si hay cambios, añadir importaciones necesarias
  if (hasChanges && !hasNewImports) {
    // Buscar la última importación
    const lastImportIndex = content.lastIndexOf('import');
    if (lastImportIndex !== -1) {
      const endOfImport = content.indexOf('\n', lastImportIndex);
      if (endOfImport !== -1) {
        const beforeImport = content.substring(0, endOfImport + 1);
        const afterImport = content.substring(endOfImport + 1);
        content = beforeImport + 
                 `import { ImprovedButton, IconButton } from "@/components/ui/buttons"\n` + 
                 afterImport;
      }
    }
  }
  
  // Guardar cambios
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado: ${filePath}`);
    return true;
  }
  
  return false;
}

// Función principal
function main() {
  console.log('🔍 Buscando archivos...');
  const files = findFiles(rootDir, fileExtensions, excludeDirs);
  console.log(`🔎 Encontrados ${files.length} archivos para procesar.`);
  
  let updatedCount = 0;
  
  for (const file of files) {
    try {
      const updated = updateFile(file);
      if (updated) {
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error al procesar ${file}:`, error.message);
    }
  }
  
  console.log(`\n✨ Proceso completado. Actualizados ${updatedCount} archivos.`);
}

// Ejecutar
main();
