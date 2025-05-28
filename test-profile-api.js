// Test script para verificar la API de perfil independientemente
const fetch = require('node-fetch');

async function testProfileAPI() {
  console.log('🧪 Testing Profile API...');
  
  try {
    // Test 1: Verificar que la ruta existe
    console.log('\n1. Testing API route existence...');
    const response = await fetch('http://localhost:3000/api/profile/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'test-user-id' })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body (raw):', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response body (parsed):', responseJson);
    } catch (parseError) {
      console.log('Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Ejecutar el test
testProfileAPI();
