/**
 * Food Database Import Script
 *
 * This script imports food data from a JSON file into the Supabase database.
 * It reads the food data from the data/food-database.json file and inserts it into the food_database table.
 *
 * Usage:
 * node scripts/import-food-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

// Supabase Management API client
const supabaseManagementApi = axios.create({
  baseURL: 'https://api.supabase.com/v1',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  }
});

// Supabase Project ID
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'soviwrzrgskhvgcmujfj';

// Path to food data file
const foodFilePath = path.join(__dirname, '..', 'data', 'food-database.json');

// Function to import food data
async function importFoodData() {
  try {
    // Check if file exists
    if (!fs.existsSync(foodFilePath)) {
      console.error(`Error: Food data file not found at ${foodFilePath}`);
      return false;
    }

    // Read food data
    const foodData = JSON.parse(fs.readFileSync(foodFilePath, 'utf8'));

    if (!Array.isArray(foodData) || foodData.length === 0) {
      console.error('Error: Food data is empty or not an array');
      return false;
    }

    console.log(`Found ${foodData.length} food items to import`);

    // Transform food data to match database schema
    const transformedFoodItems = foodData.map(food => ({
      id: food.id || crypto.randomUUID(),
      name: food.name,
      brand: food.brand || null,
      category: food.category || null,
      serving_size: food.servingSize || 100,
      serving_unit: food.servingUnit || 'g',
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || null,
      sugar: food.sugar || null,
      sodium: food.sodium || null,
      cholesterol: food.cholesterol || null,
      is_spanish_product: food.isSpanishProduct || false,
      region: food.region || null,
      supermarket: food.supermarket || null,
      metadata: food.metadata || {}
    }));

    // Import food items in batches of 100
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < transformedFoodItems.length; i += batchSize) {
      const batch = transformedFoodItems.slice(i, i + batchSize);

      console.log(`Importing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(transformedFoodItems.length / batchSize)}`);

      const { data, error } = await supabase
        .from('food_database')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error importing batch: ${error.message}`);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Successfully imported ${successCount} food items so far`);
      }
    }

    console.log(`Import completed: ${successCount} food items imported successfully, ${errorCount} failed`);
    return errorCount === 0;
  } catch (error) {
    console.error('Error importing food data:', error);
    return false;
  }
}

// Function to check if food_database table exists
async function checkFoodDatabaseTable() {
  try {
    // Use Management API to check if table exists
    const response = await supabaseManagementApi.get(`/projects/${SUPABASE_PROJECT_ID}/database/schema`);
    const schema = response.data;

    if (!schema.tables || !Array.isArray(schema.tables)) {
      console.error('Error: Could not retrieve database schema');
      return false;
    }

    const foodDatabaseTable = schema.tables.find(table => table.name === 'food_database');

    if (!foodDatabaseTable) {
      console.error('Error: Food database table does not exist. Please run migrations first.');
      return false;
    }

    console.log('Food database table exists with the following columns:');
    foodDatabaseTable.columns.forEach(column => {
      console.log(`- ${column.name}: ${column.type}${column.is_nullable ? '' : ' NOT NULL'}`);
    });

    return true;
  } catch (error) {
    console.error('Error checking food database table:', error.response?.data || error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting food database import process...');

  // Check if food_database table exists
  const tableExists = await checkFoodDatabaseTable();

  if (!tableExists) {
    process.exit(1);
  }

  // Import food data
  const success = await importFoodData();

  if (success) {
    console.log('Food database import process completed successfully');
  } else {
    console.error('Food database import process completed with errors');
    process.exit(1);
  }
}

// Execute the main function
main();
