import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase project details
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://soviwrzrgskhvgcmujfj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s'

/**
 * Interface for auth token extraction result
 */
export interface AuthTokenResult {
  token: string | null
  source: 'cookie' | 'header' | 'query' | 'localStorage' | 'none'
  userId: string | null
  error?: any
}

/**
 * Create a Supabase admin client with the service role key
 */
export const createAdminClient = () => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not defined')
    return null
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Extract the auth token from various sources
 * @param request The Next.js request object
 * @returns The auth token result
 */
export async function extractAuthToken(request: NextRequest): Promise<AuthTokenResult> {
  try {
    // Try to get the token from cookies first
    const cookieStore = await cookies()
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || 'soviwrzrgskhvgcmujfj'

    // Log all cookies for debugging
    const allCookies = [...cookieStore.getAll()].map(c => c.name)
    console.log('Available cookies:', allCookies)

    // Check for code verifier cookie without auth token cookie
    const hasCodeVerifier = allCookies.some(name => name.includes('code-verifier'))
    const hasAuthToken = allCookies.some(name => name.includes('auth-token'))

    if (hasCodeVerifier && !hasAuthToken) {
      console.warn('Found code verifier cookie but no auth token cookie - possible authentication issue');
    }

    // Look for Supabase auth token cookie
    const authTokenCookie = cookieStore.get(`sb-${projectRef}-auth-token`)

    if (authTokenCookie) {
      try {
        // Parse the cookie value to extract the access token
        const cookieData = JSON.parse(authTokenCookie.value)
        const accessToken = cookieData?.access_token

        if (accessToken) {
          // Verify the token
          const adminClient = createAdminClient()
          if (adminClient) {
            const { data, error } = await adminClient.auth.getUser(accessToken)
            if (!error && data?.user) {
              return {
                token: accessToken,
                source: 'cookie',
                userId: data.user.id
              }
            } else {
              console.error('Invalid token in cookie:', error)
            }
          }
        }
      } catch (cookieParseError) {
        console.error('Error parsing auth cookie:', cookieParseError)
      }
    }

    // Try to get the token from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7)

      // Verify the token
      const adminClient = createAdminClient()
      if (adminClient && bearerToken) {
        const { data, error } = await adminClient.auth.getUser(bearerToken)
        if (!error && data?.user) {
          return {
            token: bearerToken,
            source: 'header',
            userId: data.user.id
          }
        } else {
          console.error('Invalid token in header:', error)
        }
      }
    }

    // Try to get the token from query parameters
    const url = new URL(request.url)
    const queryToken = url.searchParams.get('token')

    if (queryToken) {
      // Verify the token
      const adminClient = createAdminClient()
      if (adminClient) {
        const { data, error } = await adminClient.auth.getUser(queryToken)
        if (!error && data?.user) {
          return {
            token: queryToken,
            source: 'query',
            userId: data.user.id
          }
        } else {
          console.error('Invalid token in query:', error)
        }
      }
    }

    // No valid token found
    return {
      token: null,
      source: 'none',
      userId: null
    }
  } catch (error) {
    console.error('Error extracting auth token:', error)
    return {
      token: null,
      source: 'none',
      userId: null,
      error
    }
  }
}

/**
 * Create a Supabase client with the appropriate authentication
 * @param request The Next.js request object
 * @returns An object containing the Supabase client and user ID
 */
export async function createAuthenticatedClient(request: NextRequest) {
  // Try to extract the auth token
  const { token, userId, source, error } = await extractAuthToken(request)

  // If we have a valid token and user ID, create a client with the token
  if (token && userId) {
    console.log(`Creating authenticated client with token from ${source}`)

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Add a retry mechanism to the client
    const clientWithRetry = {
      ...client,
      withRetry: async <T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> => {
        let lastError: any = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;

            if (attempt < maxRetries) {
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              // Increase delay for next attempt (exponential backoff)
              delay *= 2;
            }
          }
        }

        throw lastError || new Error('All retry attempts failed');
      }
    }

    return {
      client: clientWithRetry,
      userId,
      isAuthenticated: true,
      tokenSource: source,
      error: null
    }
  }

  // If we don't have a valid token, try to use the service role
  const adminClient = createAdminClient()
  if (adminClient) {
    console.log('Creating admin client with service role')

    // Add a retry mechanism to the admin client
    const adminClientWithRetry = {
      ...adminClient,
      withRetry: async <T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> => {
        let lastError: any = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;

            if (attempt < maxRetries) {
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              // Increase delay for next attempt (exponential backoff)
              delay *= 2;
            }
          }
        }

        throw lastError || new Error('All retry attempts failed');
      }
    }

    return {
      client: adminClientWithRetry,
      userId: null,
      isAuthenticated: false,
      tokenSource: 'service_role',
      error: error || null
    }
  }

  // If we can't create an admin client, return null
  return {
    client: null,
    userId: null,
    isAuthenticated: false,
    tokenSource: 'none',
    error: error || new Error('Failed to create authenticated client')
  }
}
