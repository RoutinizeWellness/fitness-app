import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://soviwrzrgskhvgcmujfj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Profile GET API called')

    // Get the request body with proper error handling
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 }
      );
    }

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📋 Fetching profile for userId:', userId)

    // Try multiple authentication strategies
    let supabase;
    let authData = null;
    let authError = null;
    let authMethod = 'none';

    // Strategy 1: Try with route handler client (cookies-based auth)
    try {
      const cookieStore = await cookies()
      const availableCookies = cookieStore.getAll().map(c => c.name)
      console.log('🍪 Available cookies:', availableCookies)

      supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const authResult = await supabase.auth.getUser()
      authData = authResult.data
      authError = authResult.error
      authMethod = 'cookies'

      console.log('🔐 Cookie-based auth result:', {
        hasUser: !!authData.user,
        userId: authData.user?.id,
        requestedUserId: userId,
        error: authError?.message
      })
    } catch (routeError) {
      console.error('❌ Route handler client failed:', routeError)
    }

    // Strategy 2: If cookies fail and we have service role, use it as fallback
    if ((!authData?.user || authError) && SUPABASE_SERVICE_ROLE_KEY) {
      console.log('🔑 Trying service role client as fallback')

      try {
        supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        // With service role, we bypass auth but validate userId format
        if (userId && typeof userId === 'string' && userId.length > 0) {
          authData = { user: { id: userId } }
          authError = null
          authMethod = 'service_role'
          console.log('✅ Using service role for userId:', userId)
        } else {
          console.log('❌ Invalid userId format for service role')
        }
      } catch (serviceError) {
        console.error('❌ Service role client failed:', serviceError)
      }
    }

    // Final auth check
    if (!authData?.user || authError) {
      console.log('❌ All authentication methods failed')
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: authError?.message || 'No valid authentication method available',
          authMethod,
          hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY
        },
        { status: 401 }
      )
    }

    console.log(`✅ Authentication successful via ${authMethod}`)

    // Only enforce user matching for cookie-based auth (not service role)
    if (authMethod === 'cookies' && authData.user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only fetch your own profile' },
        { status: 403 }
      )
    }

    // Fetch the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)

      // Check for specific error types
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Table does not exist', details: error.message, code: error.code },
          { status: 500 }
        )
      }

      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Permission denied', details: error.message, code: error.code },
          { status: 403 }
        )
      }

      if (error.code === 'PGRST116') {
        // No profile found (not an error, just no results)
        return NextResponse.json(
          { message: 'Profile not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Error fetching profile', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile: data }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in profile fetch API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
