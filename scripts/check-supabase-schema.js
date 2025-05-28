/**
 * Supabase Schema Check Script
 * 
 * This script checks the current schema of the Supabase database.
 * It lists all tables, functions, and policies.
 * 
 * Usage:
 * node scripts/check-supabase-schema.js
 */

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
 * Get database functions
 * @returns {Promise<any>} - Database functions
 */
async function getDatabaseFunctions() {
  try {
    const response = await supabaseManagementApi.post(`/projects/${SUPABASE_PROJECT_ID}/database/query`, {
      query: `
        SELECT 
          n.nspname as schema,
          p.proname as name,
          pg_get_function_result(p.oid) as result_type,
          pg_get_function_arguments(p.oid) as argument_types,
          CASE
            WHEN p.prosecdef THEN 'security definer'
            ELSE 'security invoker'
          END as security,
          pg_get_functiondef(p.oid) as definition
        FROM 
          pg_proc p
          LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE 
          n.nspname NOT IN ('pg_catalog', 'information_schema')
          AND p.prokind = 'f'
        ORDER BY 
          schema, name;
      `
    });
    return response.data;
  } catch (error) {
    console.error('Error getting database functions:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get database policies
 * @returns {Promise<any>} - Database policies
 */
async function getDatabasePolicies() {
  try {
    const response = await supabaseManagementApi.post(`/projects/${SUPABASE_PROJECT_ID}/database/query`, {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          policyname, 
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM 
          pg_policies
        WHERE 
          schemaname = 'public'
        ORDER BY 
          tablename, policyname;
      `
    });
    return response.data;
  } catch (error) {
    console.error('Error getting database policies:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get database triggers
 * @returns {Promise<any>} - Database triggers
 */
async function getDatabaseTriggers() {
  try {
    const response = await supabaseManagementApi.post(`/projects/${SUPABASE_PROJECT_ID}/database/query`, {
      query: `
        SELECT 
          trigger_schema,
          trigger_name,
          event_manipulation,
          event_object_schema,
          event_object_table,
          action_statement,
          action_timing
        FROM 
          information_schema.triggers
        WHERE 
          trigger_schema = 'public'
        ORDER BY 
          event_object_table, trigger_name;
      `
    });
    return response.data;
  } catch (error) {
    console.error('Error getting database triggers:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Checking Supabase schema...');
  
  try {
    // Get database schema
    const schema = await getDatabaseSchema();
    
    // Get database functions
    const functions = await getDatabaseFunctions();
    
    // Get database policies
    const policies = await getDatabasePolicies();
    
    // Get database triggers
    const triggers = await getDatabaseTriggers();
    
    // Print tables
    console.log('\n=== TABLES ===');
    if (schema.tables && schema.tables.length > 0) {
      schema.tables.forEach(table => {
        console.log(`- ${table.name} (${table.columns.length} columns)`);
        table.columns.forEach(column => {
          console.log(`  - ${column.name}: ${column.type}${column.is_nullable ? '' : ' NOT NULL'}${column.is_primary_key ? ' PRIMARY KEY' : ''}`);
        });
      });
    } else {
      console.log('No tables found');
    }
    
    // Print functions
    console.log('\n=== FUNCTIONS ===');
    if (functions && functions.length > 0) {
      functions.forEach(func => {
        console.log(`- ${func.schema}.${func.name}(${func.argument_types}) -> ${func.result_type} [${func.security}]`);
      });
    } else {
      console.log('No functions found');
    }
    
    // Print policies
    console.log('\n=== POLICIES ===');
    if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`- ${policy.policyname} ON ${policy.tablename} (${policy.cmd})`);
        console.log(`  - USING: ${policy.qual}`);
        if (policy.with_check) {
          console.log(`  - WITH CHECK: ${policy.with_check}`);
        }
      });
    } else {
      console.log('No policies found');
    }
    
    // Print triggers
    console.log('\n=== TRIGGERS ===');
    if (triggers && triggers.length > 0) {
      triggers.forEach(trigger => {
        console.log(`- ${trigger.trigger_name} ON ${trigger.event_object_table} (${trigger.event_manipulation} ${trigger.action_timing})`);
      });
    } else {
      console.log('No triggers found');
    }
    
    console.log('\nSchema check completed successfully');
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

// Run the main function
main();
