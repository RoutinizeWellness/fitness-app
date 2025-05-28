/**
 * Supabase Database Setup Script
 * 
 * This script sets up the Supabase database by:
 * 1. Applying migrations
 * 2. Importing exercises
 * 3. Importing food database
 * 4. Generating TypeScript types
 * 
 * Usage:
 * node scripts/setup-database.js
 */

const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['SUPABASE_SERVICE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Error: The following environment variables are required: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file with these variables or set them in your environment.');
  process.exit(1);
}

/**
 * Run a script and return a promise that resolves when the script completes
 * @param {string} scriptPath - Path to the script to run
 * @returns {Promise<void>} - Promise that resolves when the script completes
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${scriptPath}...`);
    
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', code => {
      if (code === 0) {
        console.log(`${scriptPath} completed successfully`);
        resolve();
      } else {
        console.error(`${scriptPath} failed with code ${code}`);
        reject(new Error(`Script ${scriptPath} failed with code ${code}`));
      }
    });
    
    child.on('error', error => {
      console.error(`Error running ${scriptPath}:`, error);
      reject(error);
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('Starting Supabase database setup...');
  
  try {
    // Step 1: Apply migrations
    console.log('\n=== STEP 1: APPLYING MIGRATIONS ===');
    await runScript('./scripts/supabase-management-migrations.js');
    
    // Step 2: Import exercises
    console.log('\n=== STEP 2: IMPORTING EXERCISES ===');
    await runScript('./scripts/import-exercises.js');
    
    // Step 3: Import food database
    console.log('\n=== STEP 3: IMPORTING FOOD DATABASE ===');
    await runScript('./scripts/import-food-database.js');
    
    // Step 4: Generate TypeScript types
    console.log('\n=== STEP 4: GENERATING TYPESCRIPT TYPES ===');
    await runScript('./scripts/generate-supabase-types.js');
    
    // Step 5: Check schema
    console.log('\n=== STEP 5: CHECKING SCHEMA ===');
    await runScript('./scripts/check-supabase-schema.js');
    
    console.log('\nDatabase setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the main function
main();
