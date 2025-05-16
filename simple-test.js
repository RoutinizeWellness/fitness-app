// Simple test script for Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function
async function testConnection() {
  console.log("Testing Supabase connection...");
  
  try {
    // Try a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Connection error:", error);
      return;
    }
    
    console.log("Connection successful. Data received:", data);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the test
testConnection();
