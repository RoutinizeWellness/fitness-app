import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔍 DEBUG: Profile API called')
  
  try {
    // Log request details
    console.log('Request method:', request.method)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Get the request body
    let body;
    try {
      const text = await request.text()
      console.log('Request body (raw):', text)
      body = JSON.parse(text)
      console.log('Request body (parsed):', body)
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError.message },
        { status: 400 }
      )
    }

    const { userId } = body

    if (!userId) {
      console.log('❌ No userId provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('✅ UserId provided:', userId)

    // Create a Supabase client
    const cookieStore = await cookies()
    console.log('Cookies available:', cookieStore.getAll().map(c => c.name))
    
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    console.log('✅ Supabase client created')

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getUser()
    console.log('Auth result:', {
      hasUser: !!authData.user,
      userId: authData.user?.id,
      email: authData.user?.email,
      error: authError?.message
    })

    if (authError || !authData.user) {
      console.log('❌ Auth failed')
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message, debug: 'Auth failed' },
        { status: 401 }
      )
    }

    // Test database connection
    try {
      console.log('🔍 Testing database connection...')
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
      
      console.log('Database test result:', { testData, testError })
      
      if (testError) {
        console.log('❌ Database connection failed:', testError)
        return NextResponse.json(
          { error: 'Database connection failed', details: testError.message, debug: 'DB test failed' },
          { status: 500 }
        )
      }
    } catch (dbError) {
      console.log('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'Database error', details: dbError.message, debug: 'DB exception' },
        { status: 500 }
      )
    }

    // Try to fetch profile
    console.log('🔍 Fetching profile for userId:', userId)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('Profile fetch result:', { data, error })

    if (error) {
      console.log('❌ Profile fetch error:', error)
      return NextResponse.json(
        { error: 'Profile fetch failed', details: error.message, code: error.code, debug: 'Profile fetch error' },
        { status: 500 }
      )
    }

    if (!data) {
      console.log('⚠️ No profile data found')
      return NextResponse.json(
        { message: 'Profile not found', debug: 'No data returned' },
        { status: 404 }
      )
    }

    console.log('✅ Profile found successfully')
    return NextResponse.json({ 
      profile: data, 
      debug: 'Success',
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Unexpected error in debug API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        debug: 'Unexpected error'
      },
      { status: 500 }
    )
  }
}
