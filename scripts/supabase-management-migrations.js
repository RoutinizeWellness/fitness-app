/**
 * Supabase Management API Migration Script
 * 
 * This script uses the Supabase Management API to apply migrations to the database.
 * It creates tables, functions, and policies defined in the migration files.
 * 
 * Usage:
 * node scripts/supabase-management-migrations.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Supabase Management API configuration
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'soviwrzrgskhvgcmujfj';
const SUPABASE_API_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_API_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

// Supabase Management API client
const supabaseManagementApi = axios.create({
  baseURL: 'https://api.supabase.com/v1',
  headers: {
    'Authorization': `Bearer ${SUPABASE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Migrations directory
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

/**
 * Execute a SQL query using the Supabase Management API
 * @param {string} sql - SQL query to execute
 * @returns {Promise<any>} - Query result
 */
async function executeSql(sql) {
  try {
    const response = await supabaseManagementApi.post(`/projects/${SUPABASE_PROJECT_ID}/database/query`, {
      query: sql
    });
    
    return response.data;
  } catch (error) {
    console.error('Error executing SQL:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get database schema information
 * @returns {Promise<any>} - Database schema information
 */
async function getDatabaseSchema() {
  try {
    const response = await supabaseManagementApi.get(`/projects/${SUPABASE_PROJECT_ID}/database/schema`);
    return response.data;
  } catch (error) {
    console.error('Error getting database schema:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check if a table exists in the database
 * @param {string} tableName - Table name to check
 * @returns {Promise<boolean>} - True if table exists, false otherwise
 */
async function tableExists(tableName) {
  try {
    const schema = await getDatabaseSchema();
    const tables = schema.tables || [];
    return tables.some(table => table.name === tableName);
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Create a table in the database
 * @param {string} tableName - Table name
 * @param {string} tableDefinition - SQL table definition
 * @returns {Promise<boolean>} - True if table was created, false otherwise
 */
async function createTable(tableName, tableDefinition) {
  try {
    // Check if table already exists
    const exists = await tableExists(tableName);
    
    if (exists) {
      console.log(`Table ${tableName} already exists, skipping creation`);
      return true;
    }
    
    // Create table
    await executeSql(tableDefinition);
    console.log(`Table ${tableName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    return false;
  }
}

/**
 * Enable Row Level Security (RLS) on a table
 * @param {string} tableName - Table name
 * @returns {Promise<boolean>} - True if RLS was enabled, false otherwise
 */
async function enableRls(tableName) {
  try {
    await executeSql(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
    console.log(`RLS enabled on table ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error enabling RLS on table ${tableName}:`, error);
    return false;
  }
}

/**
 * Create a policy on a table
 * @param {string} policyName - Policy name
 * @param {string} tableName - Table name
 * @param {string} policyDefinition - SQL policy definition
 * @returns {Promise<boolean>} - True if policy was created, false otherwise
 */
async function createPolicy(policyName, tableName, policyDefinition) {
  try {
    // Check if policy already exists
    const checkSql = `
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = '${tableName}' 
      AND policyname = '${policyName}'
    `;
    
    const result = await executeSql(checkSql);
    
    if (result.length > 0) {
      console.log(`Policy ${policyName} on table ${tableName} already exists, skipping creation`);
      return true;
    }
    
    // Create policy
    await executeSql(policyDefinition);
    console.log(`Policy ${policyName} on table ${tableName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating policy ${policyName} on table ${tableName}:`, error);
    return false;
  }
}

/**
 * Create a function in the database
 * @param {string} functionName - Function name
 * @param {string} functionDefinition - SQL function definition
 * @returns {Promise<boolean>} - True if function was created, false otherwise
 */
async function createFunction(functionName, functionDefinition) {
  try {
    // Create or replace function
    await executeSql(functionDefinition);
    console.log(`Function ${functionName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating function ${functionName}:`, error);
    return false;
  }
}

/**
 * Create a trigger in the database
 * @param {string} triggerName - Trigger name
 * @param {string} triggerDefinition - SQL trigger definition
 * @returns {Promise<boolean>} - True if trigger was created, false otherwise
 */
async function createTrigger(triggerName, triggerDefinition) {
  try {
    // Create trigger
    await executeSql(triggerDefinition);
    console.log(`Trigger ${triggerName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating trigger ${triggerName}:`, error);
    return false;
  }
}

/**
 * Parse SQL file and extract table, function, policy, and trigger definitions
 * @param {string} sqlContent - SQL file content
 * @returns {Object} - Parsed SQL definitions
 */
function parseSqlFile(sqlContent) {
  const tables = [];
  const functions = [];
  const policies = [];
  const triggers = [];
  const extensions = [];
  const rls = [];
  
  // Remove comments
  const sqlWithoutComments = sqlContent.replace(/--.*$/gm, '');
  
  // Extract CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let tableMatch;
  
  while ((tableMatch = tableRegex.exec(sqlWithoutComments)) !== null) {
    const tableName = tableMatch[1];
    const tableDefinition = tableMatch[0];
    tables.push({ name: tableName, definition: tableDefinition });
  }
  
  // Extract CREATE OR REPLACE FUNCTION statements
  const functionRegex = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+(\w+)[\s\S]*?LANGUAGE\s+\w+;/gi;
  let functionMatch;
  
  while ((functionMatch = functionRegex.exec(sqlWithoutComments)) !== null) {
    const functionName = functionMatch[1];
    const functionDefinition = functionMatch[0];
    functions.push({ name: functionName, definition: functionDefinition });
  }
  
  // Extract CREATE POLICY statements
  const policyRegex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(\w+)([\s\S]*?);/gi;
  let policyMatch;
  
  while ((policyMatch = policyRegex.exec(sqlWithoutComments)) !== null) {
    const policyName = policyMatch[1];
    const tableName = policyMatch[2];
    const policyDefinition = policyMatch[0];
    policies.push({ name: policyName, table: tableName, definition: policyDefinition });
  }
  
  // Extract CREATE TRIGGER statements
  const triggerRegex = /CREATE\s+TRIGGER\s+(\w+)([\s\S]*?);/gi;
  let triggerMatch;
  
  while ((triggerMatch = triggerRegex.exec(sqlWithoutComments)) !== null) {
    const triggerName = triggerMatch[1];
    const triggerDefinition = triggerMatch[0];
    triggers.push({ name: triggerName, definition: triggerDefinition });
  }
  
  // Extract CREATE EXTENSION statements
  const extensionRegex = /CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"([^"]+)";/gi;
  let extensionMatch;
  
  while ((extensionMatch = extensionRegex.exec(sqlWithoutComments)) !== null) {
    const extensionName = extensionMatch[1];
    const extensionDefinition = extensionMatch[0];
    extensions.push({ name: extensionName, definition: extensionDefinition });
  }
  
  // Extract ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements
  const rlsRegex = /ALTER\s+TABLE\s+(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY;/gi;
  let rlsMatch;
  
  while ((rlsMatch = rlsRegex.exec(sqlWithoutComments)) !== null) {
    const tableName = rlsMatch[1];
    rls.push(tableName);
  }
  
  return { tables, functions, policies, triggers, extensions, rls };
}

/**
 * Apply a migration file
 * @param {string} filePath - Migration file path
 * @returns {Promise<boolean>} - True if migration was applied successfully, false otherwise
 */
async function applyMigration(filePath) {
  try {
    console.log(`Applying migration: ${path.basename(filePath)}`);
    
    // Read migration file
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse SQL file
    const { tables, functions, policies, triggers, extensions, rls } = parseSqlFile(sqlContent);
    
    // Create extensions
    for (const extension of extensions) {
      await executeSql(extension.definition);
      console.log(`Extension ${extension.name} created successfully`);
    }
    
    // Create tables
    for (const table of tables) {
      await createTable(table.name, table.definition);
    }
    
    // Enable RLS
    for (const tableName of rls) {
      await enableRls(tableName);
    }
    
    // Create functions
    for (const func of functions) {
      await createFunction(func.name, func.definition);
    }
    
    // Create triggers
    for (const trigger of triggers) {
      await createTrigger(trigger.name, trigger.definition);
    }
    
    // Create policies
    for (const policy of policies) {
      await createPolicy(policy.name, policy.table, policy.definition);
    }
    
    console.log(`Migration ${path.basename(filePath)} applied successfully`);
    return true;
  } catch (error) {
    console.error(`Error applying migration ${path.basename(filePath)}:`, error);
    return false;
  }
}

/**
 * Apply all migrations
 * @returns {Promise<boolean>} - True if all migrations were applied successfully, false otherwise
 */
async function applyAllMigrations() {
  try {
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found: ${migrationsDir}`);
      return false;
    }
    
    // Get all SQL files in the migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations are applied in order
    
    if (files.length === 0) {
      console.log('No migration files found');
      return true;
    }
    
    console.log(`Found ${files.length} migrations to apply`);
    
    // Apply each migration
    let success = true;
    for (const file of files) {
      const result = await applyMigration(path.join(migrationsDir, file));
      if (!result) {
        success = false;
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error applying migrations:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting migration process using Supabase Management API...');
  
  try {
    // Apply migrations
    const success = await applyAllMigrations();
    
    if (success) {
      console.log('Migration process completed successfully');
    } else {
      console.error('Migration process completed with errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error in migration process:', error);
    process.exit(1);
  }
}

// Run the main function
main();
