import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET handler for training data
 * @param request - The request object
 * @returns - The response object
 */
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the request type from the URL
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    // Handle different request types
    switch (type) {
      case 'profile':
        // Get the user's training profile
        const { data: profileData, error: profileError } = await supabase
          .from('training_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          return NextResponse.json(
            { error: profileError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: profileData })

      case 'routines':
        // Get all workout routines for the user
        const { data: routinesData, error: routinesError } = await supabase
          .from('workout_routines')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (routinesError) {
          return NextResponse.json(
            { error: routinesError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: routinesData })

      case 'routine':
        // Get a specific workout routine
        if (!id) {
          return NextResponse.json(
            { error: 'Missing routine ID' },
            { status: 400 }
          )
        }

        const { data: routineData, error: routineError } = await supabase
          .from('workout_routines')
          .select('*')
          .eq('id', id)
          .single()

        if (routineError) {
          return NextResponse.json(
            { error: routineError.message },
            { status: 500 }
          )
        }

        // Verify that the user is the owner of the routine or it's a template
        // Add more detailed logging to help diagnose the issue
        console.log('Routine access check:', {
          routineUserId: routineData.user_id,
          currentUserId: user.id,
          isTemplate: routineData.is_template,
          routineId: id
        })

        // Only check ownership if both user IDs are present and not null/undefined
        if (routineData.user_id && user.id && routineData.user_id !== user.id && !routineData.is_template) {
          return NextResponse.json(
            { error: 'Unauthorized: You do not have permission to access this routine' },
            { status: 403 }
          )
        }

        return NextResponse.json({ data: routineData })

      case 'active-routine':
        // Get the active workout routine for the user
        const { data: activeRoutineData, error: activeRoutineError } = await supabase
          .from('workout_routines')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (activeRoutineError && activeRoutineError.code !== 'PGRST116') {
          return NextResponse.json(
            { error: activeRoutineError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: activeRoutineData })

      case 'sessions':
        // Get all workout sessions for the user
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (sessionsError) {
          return NextResponse.json(
            { error: sessionsError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: sessionsData })

      case 'session':
        // Get a specific workout session
        if (!id) {
          return NextResponse.json(
            { error: 'Missing session ID' },
            { status: 400 }
          )
        }

        const { data: sessionData, error: sessionError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('id', id)
          .single()

        if (sessionError) {
          return NextResponse.json(
            { error: sessionError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: sessionData })

      case 'exercises':
        // Get all exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .order('name')

        if (exercisesError) {
          return NextResponse.json(
            { error: exercisesError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: exercisesData })

      case 'exercise':
        // Get a specific exercise
        if (!id) {
          return NextResponse.json(
            { error: 'Missing exercise ID' },
            { status: 400 }
          )
        }

        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', id)
          .single()

        if (exerciseError) {
          return NextResponse.json(
            { error: exerciseError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: exerciseData })

      case 'stats':
        // Get workout statistics for the user
        const { data: statsData, error: statsError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (statsError) {
          return NextResponse.json(
            { error: statsError.message },
            { status: 500 }
          )
        }

        // Calculate statistics
        const totalSessions = statsData.length
        const totalDuration = statsData.reduce((acc, session) => acc + (session.duration || 0), 0)
        const totalSets = statsData.reduce((acc, session) => {
          const exercises = session.exercises || []
          return acc + exercises.reduce((setAcc, ex) => setAcc + (ex.sets?.length || 0), 0)
        }, 0)

        // Calculate sessions per week
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const workoutsThisWeek = statsData.filter(session =>
          new Date(session.date) >= oneWeekAgo
        ).length

        return NextResponse.json({
          data: {
            totalSessions,
            totalDuration,
            totalSets,
            workoutsThisWeek
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in training API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler for training data
 * @param request - The request object
 * @returns - The response object
 */
export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()
    const { type, data } = body

    // Handle different request types
    switch (type) {
      case 'profile':
        // Save the user's training profile
        const profileData = {
          user_id: user.id,
          assessment_data: data
        }

        const { data: savedProfile, error: profileError } = await supabase
          .from('training_assessments')
          .insert([profileData])
          .select()

        if (profileError) {
          return NextResponse.json(
            { error: profileError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: savedProfile[0] })

      case 'routine':
        // Save a workout routine
        const routineData = {
          ...data,
          id: data.id || uuidv4(),
          user_id: user.id,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Check if the routine exists
        const { data: existingRoutine, error: checkError } = await supabase
          .from('workout_routines')
          .select('id')
          .eq('id', routineData.id)
          .maybeSingle()

        let result

        if (existingRoutine) {
          // Update existing routine
          result = await supabase
            .from('workout_routines')
            .update(routineData)
            .eq('id', routineData.id)
            .select()
        } else {
          // Insert new routine
          result = await supabase
            .from('workout_routines')
            .insert([routineData])
            .select()
        }

        if (result.error) {
          return NextResponse.json(
            { error: result.error.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: result.data[0] })

      case 'activate-routine':
        // Activate a workout routine
        const { id } = data

        if (!id) {
          return NextResponse.json(
            { error: 'Missing routine ID' },
            { status: 400 }
          )
        }

        // First, deactivate all routines
        const { error: deactivateError } = await supabase
          .from('workout_routines')
          .update({ is_active: false })
          .eq('user_id', user.id)

        if (deactivateError) {
          return NextResponse.json(
            { error: deactivateError.message },
            { status: 500 }
          )
        }

        // Then, activate the specified routine
        const { error: activateError } = await supabase
          .from('workout_routines')
          .update({ is_active: true })
          .eq('id', id)
          .eq('user_id', user.id)

        if (activateError) {
          return NextResponse.json(
            { error: activateError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true })

      case 'session':
        // Save a workout session
        const sessionData = {
          ...data,
          id: data.id || uuidv4(),
          user_id: user.id,
          created_at: data.created_at || new Date().toISOString()
        }

        const { data: savedSession, error: sessionError } = await supabase
          .from('workout_sessions')
          .insert([sessionData])
          .select()

        if (sessionError) {
          return NextResponse.json(
            { error: sessionError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ data: savedSession[0] })

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in training API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for training data
 * @param request - The request object
 * @returns - The response object
 */
export async function DELETE(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the request type from the URL
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing ID' },
        { status: 400 }
      )
    }

    // Handle different request types
    switch (type) {
      case 'routine':
        // Delete a workout routine
        const { error: routineError } = await supabase
          .from('workout_routines')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (routineError) {
          return NextResponse.json(
            { error: routineError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true })

      case 'session':
        // Delete a workout session
        const { error: sessionError } = await supabase
          .from('workout_sessions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (sessionError) {
          return NextResponse.json(
            { error: sessionError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in training API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
