/**
 * Supabase Migration Script
 *
 * This script applies migrations to the Supabase database.
 * It can apply all migrations or a specific migration.
 *
 * Usage:
 * node scripts/apply-migrations.js [migration-file.sql]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://soviwrzrgskhvgcmujfj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: Supabase service key (SUPABASE_SERVICE_KEY) or anonymous key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is required');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migrations directory
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Function to apply a migration
async function applyMigration(filePath) {
  try {
    console.log(`Applying migration: ${path.basename(filePath)}`);

    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL query
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`Error applying migration ${path.basename(filePath)}:`, error);
      return false;
    }

    console.log(`Successfully applied migration: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Error processing migration ${path.basename(filePath)}:`, error);
    return false;
  }
}

// Function to apply a specific migration
async function applySpecificMigration(migrationName) {
  const filePath = path.join(migrationsDir, migrationName);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Migration ${migrationName} not found`);
    return false;
  }

  return await applyMigration(filePath);
}

// Function to apply all migrations
async function applyAllMigrations() {
  try {
    // Check if directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Error: Migrations directory not found at ${migrationsDir}`);
      return false;
    }

    // Get all SQL files in the directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically

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

// Main function
async function main() {
  console.log('Starting migration process...');

  // Check if a specific migration was specified
  const specificMigration = process.argv[2];

  let success;
  if (specificMigration) {
    console.log(`Applying specific migration: ${specificMigration}`);
    success = await applySpecificMigration(specificMigration);
  } else {
    console.log('Applying all migrations');
    success = await applyAllMigrations();
  }

  if (success) {
    console.log('Migration process completed successfully');
  } else {
    console.error('Migration process completed with errors');
    process.exit(1);
  }
}

// Execute the main function
main();
