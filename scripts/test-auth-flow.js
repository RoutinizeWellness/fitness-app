/**
 * Authentication Flow Test Script
 * 
 * This script helps test the authentication flow in the application.
 * It provides a checklist of tests to perform manually and logs the results.
 * 
 * How to use:
 * 1. Open the browser console on your application
 * 2. Copy and paste this entire script into the console
 * 3. Follow the instructions printed in the console
 * 4. The script will log test results and provide guidance
 */

console.clear();
console.log('%c Authentication Flow Test Script ', 'background: #1B237E; color: white; font-size: 16px; padding: 5px;');
console.log('This script will help you test the authentication flow in your application.');

// Helper function to create a test logger
function createTestLogger() {
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };

  return {
    pass: (name, details = '') => {
      console.log(`%c ✓ PASS: ${name}`, 'color: green; font-weight: bold;');
      if (details) console.log(`  Details: ${details}`);
      results.passed++;
      results.tests.push({ name, status: 'passed', details });
    },
    fail: (name, details = '') => {
      console.log(`%c ✗ FAIL: ${name}`, 'color: red; font-weight: bold;');
      if (details) console.log(`  Details: ${details}`);
      results.failed++;
      results.tests.push({ name, status: 'failed', details });
    },
    skip: (name, reason = '') => {
      console.log(`%c ○ SKIP: ${name}`, 'color: gray; font-weight: bold;');
      if (reason) console.log(`  Reason: ${reason}`);
      results.skipped++;
      results.tests.push({ name, status: 'skipped', reason });
    },
    info: (message) => {
      console.log(`%c ℹ INFO: ${message}`, 'color: blue; font-weight: bold;');
    },
    warn: (message) => {
      console.log(`%c ⚠ WARNING: ${message}`, 'color: orange; font-weight: bold;');
    },
    getResults: () => results
  };
}

// Create a test logger
const testLogger = createTestLogger();

// Check if we're on the right domain
const isCorrectDomain = window.location.hostname.includes('localhost') || 
                        window.location.hostname.includes('routinize');
if (!isCorrectDomain) {
  testLogger.warn('This script should be run on your application domain.');
}

// Check if Supabase is available
const hasSupabase = typeof window.supabase !== 'undefined' || 
                   localStorage.getItem('supabase.auth.token') !== null;
if (hasSupabase) {
  testLogger.pass('Supabase is available');
} else {
  testLogger.warn('Supabase client not detected. Some tests may fail.');
}

// Print test instructions
console.log('\n%c Test Instructions ', 'background: #333; color: white; font-size: 14px; padding: 3px;');
console.log(`
Please perform the following tests manually and mark them as pass/fail:

1. Sign Out Test:
   - Click on your profile or account menu
   - Click "Sign Out" or "Logout"
   - Verify you are redirected to the login page
   - Check browser storage to ensure auth tokens are cleared

2. Login Test:
   - Enter valid credentials on the login page
   - Click "Sign In" or "Login"
   - Verify you are redirected to the dashboard
   - Check that your profile information is loaded correctly

3. Session Persistence Test:
   - After logging in, refresh the page
   - Verify you remain logged in
   - Navigate to different pages and verify session persists

4. Invalid Credentials Test:
   - Log out
   - Try to log in with invalid credentials
   - Verify you see a user-friendly error message

5. Session Expiry Test (if possible):
   - Modify the session expiry time for testing (or wait for natural expiry)
   - Verify the app handles expiry gracefully
   - Check if token refresh happens automatically

6. Protected Route Test:
   - Log out
   - Try to access a protected route directly by URL
   - Verify you are redirected to the login page
   - After logging in, verify you are redirected back to the intended page

After completing each test, use the following commands to log results:
- testLogger.pass('Test Name', 'Optional details')
- testLogger.fail('Test Name', 'Details about the failure')
- testLogger.skip('Test Name', 'Reason for skipping')

When finished, call testLogger.getResults() to see a summary.
`);

// Provide helper functions to check auth state
console.log('\n%c Helper Functions ', 'background: #333; color: white; font-size: 14px; padding: 3px;');
console.log(`
Use these helper functions to check the current auth state:

1. checkAuthState() - Check the current authentication state
2. checkLocalStorage() - Check auth-related items in localStorage
3. checkSessionStorage() - Check auth-related items in sessionStorage
4. clearAuthData() - Clear all auth-related data from storage
5. testLogger.getResults() - Get a summary of test results
`);

// Define helper functions
window.checkAuthState = async function() {
  console.log('%c Current Auth State ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  // Check localStorage for auth token
  const hasLocalStorageToken = localStorage.getItem('supabase.auth.token') !== null;
  console.log(`LocalStorage token exists: ${hasLocalStorageToken}`);
  
  // Check sessionStorage for auth token
  const hasSessionStorageToken = sessionStorage.getItem('supabase.auth.token') !== null;
  console.log(`SessionStorage token exists: ${hasSessionStorageToken}`);
  
  // Check for session expiry
  const sessionExpiry = localStorage.getItem('session_expiry');
  if (sessionExpiry) {
    const expiryDate = new Date(sessionExpiry);
    const now = new Date();
    const timeUntilExpiry = expiryDate - now;
    console.log(`Session expires at: ${expiryDate.toISOString()}`);
    console.log(`Time until expiry: ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);
  } else {
    console.log('No session expiry information found');
  }
  
  // Try to get session from Supabase if available
  if (typeof window.supabase !== 'undefined') {
    try {
      const { data, error } = await window.supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else if (data && data.session) {
        console.log('Active session found:', {
          user_id: data.session.user.id,
          expires_at: new Date(data.session.expires_at * 1000).toISOString()
        });
      } else {
        console.log('No active session found');
      }
    } catch (e) {
      console.error('Exception getting session:', e);
    }
  }
  
  return {
    hasLocalStorageToken,
    hasSessionStorageToken,
    sessionExpiry: sessionExpiry ? new Date(sessionExpiry) : null
  };
};

window.checkLocalStorage = function() {
  console.log('%c LocalStorage Items ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  const authRelatedItems = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('auth') || key.includes('token') || key.includes('session') || 
        key.includes('user') || key.includes('profile')) {
      try {
        const value = localStorage.getItem(key);
        authRelatedItems[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
      } catch (e) {
        authRelatedItems[key] = '[Error reading value]';
      }
    }
  }
  
  console.table(authRelatedItems);
  return authRelatedItems;
};

window.checkSessionStorage = function() {
  console.log('%c SessionStorage Items ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  const authRelatedItems = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key.includes('auth') || key.includes('token') || key.includes('session') || 
        key.includes('user') || key.includes('profile')) {
      try {
        const value = sessionStorage.getItem(key);
        authRelatedItems[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
      } catch (e) {
        authRelatedItems[key] = '[Error reading value]';
      }
    }
  }
  
  console.table(authRelatedItems);
  return authRelatedItems;
};

window.clearAuthData = function() {
  console.log('%c Clearing Auth Data ', 'background: #1B237E; color: white; font-size: 14px; padding: 3px;');
  
  // Clear Supabase-specific items
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('session_expiry');
  
  // Clear app-specific items
  localStorage.removeItem('lastProfile');
  localStorage.removeItem('lastRoute');
  localStorage.removeItem('auth_return_url');
  localStorage.removeItem('google_auth_start');
  localStorage.removeItem('auth_success');
  localStorage.removeItem('last_login');
  sessionStorage.removeItem('profile_error');
  
  console.log('Auth data cleared from storage');
};

// Make testLogger available globally
window.testLogger = testLogger;

console.log('\n%c Ready to Test! ', 'background: green; color: white; font-size: 16px; padding: 5px;');
console.log('Start by running checkAuthState() to see your current authentication status.');
