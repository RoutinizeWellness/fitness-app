import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/auth-token-helper'

export async function POST(request: NextRequest) {
  try {
    console.log('Fix database structure API called:', request.url);

    // Try to create an authenticated client using our helper function
    const { client: dbClient, userId, isAuthenticated } = await createAuthenticatedClient(request);

    if (!dbClient) {
      console.error('Failed to create Supabase client');
      return NextResponse.json(
        {
          error: 'Database connection error',
          details: 'Failed to create Supabase client',
          code: 'CLIENT_CREATION_FAILED',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Only allow admin users or service role to fix database structure
    if (!isAuthenticated && !userId) {
      // Check if we're using the service role
      const isServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY === request.headers.get('x-supabase-service-key');

      if (!isServiceRole) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            details: 'Only admin users or service role can fix database structure',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        );
      }
    }

    // Call the fix_profiles_table function which handles both creating and fixing the table
    const { data, error } = await dbClient.rpc('fix_profiles_table');

    if (error) {
      console.error('Error fixing database structure:', error);
      return NextResponse.json(
        {
          error: 'Failed to fix database structure',
          details: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log('Database structure fix result:', data);

    // Check if the profiles table exists
    const { data: tableExists, error: tableError } = await dbClient.rpc('check_table_exists', {
      table_name: 'profiles'
    });

    if (tableError) {
      console.error('Error checking if profiles table exists:', tableError);
      return NextResponse.json(
        {
          error: 'Failed to check if profiles table exists',
          details: tableError.message,
          code: tableError.code,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    if (!tableExists) {
      console.error('Profiles table still does not exist after fix attempt');
      return NextResponse.json(
        {
          error: 'Failed to create profiles table',
          details: 'Table does not exist after fix attempt',
          code: 'TABLE_CREATION_FAILED',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Verify that all required columns exist
    const { data: verifyData, error: verifyError } = await dbClient.rpc('verify_required_columns', {
      table_name: 'profiles',
      required_columns: ['id', 'user_id', 'full_name', 'created_at']
    });

    if (verifyError) {
      console.error('Error verifying required columns:', verifyError);
      return NextResponse.json(
        {
          error: 'Failed to verify required columns',
          details: verifyError.message,
          code: verifyError.code,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Check if any required columns are still missing
    const missingColumns = verifyData
      .filter(col => !col.column_exists)
      .map(col => col.column_name);

    return NextResponse.json({
      success: true,
      result: data,
      tableExists: tableExists,
      missingColumns: missingColumns,
      allColumnsExist: missingColumns.length === 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fixing database structure:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
