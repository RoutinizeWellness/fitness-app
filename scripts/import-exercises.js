/**
 * Exercise Import Script
 *
 * This script imports exercise data from a JSON file into the Supabase database.
 * It reads the exercise data from the data/exercises.json file and inserts it into the exercises table.
 *
 * Usage:
 * node scripts/import-exercises.js
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

// Path to exercise data file
const exercisesFilePath = path.join(__dirname, '..', 'data', 'exercises.json');

// Function to import exercises
async function importExercises() {
  try {
    // Check if file exists
    if (!fs.existsSync(exercisesFilePath)) {
      console.error(`Error: Exercise data file not found at ${exercisesFilePath}`);
      return false;
    }

    // Read exercise data
    const exercisesData = JSON.parse(fs.readFileSync(exercisesFilePath, 'utf8'));

    if (!Array.isArray(exercisesData) || exercisesData.length === 0) {
      console.error('Error: Exercise data is empty or not an array');
      return false;
    }

    console.log(`Found ${exercisesData.length} exercises to import`);

    // Transform exercise data to match database schema
    const transformedExercises = exercisesData.map(exercise => ({
      id: exercise.id || crypto.randomUUID(),
      name: exercise.name,
      description: exercise.description || null,
      category: exercise.category || null,
      muscle_group: Array.isArray(exercise.muscleGroup) ? exercise.muscleGroup : [exercise.muscleGroup],
      secondary_muscle_groups: exercise.secondaryMuscleGroups || [],
      difficulty: exercise.difficulty || 'intermediate',
      equipment: exercise.equipment || [],
      is_compound: exercise.isCompound || false,
      image_url: exercise.imageUrl || null,
      video_url: exercise.videoUrl || null,
      instructions: exercise.instructions || null,
      tips: exercise.tips || [],
      alternatives: exercise.alternatives || []
    }));

    // Import exercises in batches of 100
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < transformedExercises.length; i += batchSize) {
      const batch = transformedExercises.slice(i, i + batchSize);

      console.log(`Importing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(transformedExercises.length / batchSize)}`);

      const { data, error } = await supabase
        .from('exercises')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error importing batch: ${error.message}`);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Successfully imported ${successCount} exercises so far`);
      }
    }

    console.log(`Import completed: ${successCount} exercises imported successfully, ${errorCount} failed`);
    return errorCount === 0;
  } catch (error) {
    console.error('Error importing exercises:', error);
    return false;
  }
}

// Function to check if exercises table exists
async function checkExercisesTable() {
  try {
    // Use Management API to check if table exists
    const response = await supabaseManagementApi.get(`/projects/${SUPABASE_PROJECT_ID}/database/schema`);
    const schema = response.data;

    if (!schema.tables || !Array.isArray(schema.tables)) {
      console.error('Error: Could not retrieve database schema');
      return false;
    }

    const exercisesTable = schema.tables.find(table => table.name === 'exercises');

    if (!exercisesTable) {
      console.error('Error: Exercises table does not exist. Please run migrations first.');
      return false;
    }

    console.log('Exercises table exists with the following columns:');
    exercisesTable.columns.forEach(column => {
      console.log(`- ${column.name}: ${column.type}${column.is_nullable ? '' : ' NOT NULL'}`);
    });

    return true;
  } catch (error) {
    console.error('Error checking exercises table:', error.response?.data || error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting exercise import process...');

  // Check if exercises table exists
  const tableExists = await checkExercisesTable();

  if (!tableExists) {
    process.exit(1);
  }

  // Import exercises
  const success = await importExercises();

  if (success) {
    console.log('Exercise import process completed successfully');
  } else {
    console.error('Exercise import process completed with errors');
    process.exit(1);
  }
}

// Execute the main function
main();
