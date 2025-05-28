import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://soviwrzrgskhvgcmujfj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Profile CREATE API called')

    // Get the request body
    const body = await request.json()
    const { userId, profile } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📋 Creating profile for userId:', userId)

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
        { error: 'You can only create a profile for yourself' },
        { status: 403 }
      )
    }

    // Check if a profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for existing profile:', checkError)
      return NextResponse.json(
        { error: 'Error checking for existing profile', details: checkError.message },
        { status: 500 }
      )
    }

    if (existingProfile) {
      return NextResponse.json(
        { message: 'Profile already exists', profile: existingProfile },
        { status: 200 }
      )
    }

    // Create a default profile
    const defaultProfile = {
      user_id: userId,
      full_name: profile?.fullName || authData.user.email?.split('@')[0] || 'User',
      level: profile?.level || 'beginner',
      is_admin: false,
      onboarding_completed: profile?.onboardingCompleted || false,
      experience_level: profile?.experienceLevel || 'beginner',
      interface_mode: profile?.interfaceMode || 'beginner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([defaultProfile])
      .select()

    if (error) {
      console.error('Error creating profile:', error)
      return NextResponse.json(
        { error: 'Error creating profile', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in profile creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
