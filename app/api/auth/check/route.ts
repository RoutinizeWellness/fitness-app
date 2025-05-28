import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with the service role
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return NextResponse.json(
        { error: 'Error getting session', details: sessionError.message },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { authenticated: false, message: 'No active session' },
        { status: 200 }
      )
    }

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error getting user:', userError)
      return NextResponse.json(
        { error: 'Error getting user', details: userError.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: 'No user found' },
        { status: 200 }
      )
    }

    // Return user information
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at ? true : false,
        lastSignInAt: user.last_sign_in_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        role: user.role
      },
      session: {
        expires_at: session.expires_at,
        refresh_token_expires_in: session.refresh_token_expires_in
      }
    })
  } catch (error) {
    console.error('Unexpected error in auth check API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
