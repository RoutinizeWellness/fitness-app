/**
 * Script para configurar las tablas de datos de salud en Supabase
 * 
 * Uso:
 * node scripts/setup-health-tables.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config()

// Crear cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Leer el archivo SQL
const sqlFilePath = path.join(__dirname, '..', 'sql', 'health_data_tables.sql')
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

// Ejecutar el SQL
async function setupTables() {
  try {
    console.log('Configurando tablas de datos de salud en Supabase...')
    
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('pgexecute', { query: sqlContent })
    
    if (error) {
      throw error
    }
    
    console.log('Tablas configuradas correctamente')
    console.log('Tablas creadas:')
    console.log('- health_data')
    console.log('- health_goals')
    console.log('- sensor_logs')
    
  } catch (error) {
    console.error('Error al configurar tablas:', error)
  }
}

setupTables()
