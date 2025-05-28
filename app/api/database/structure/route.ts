import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/auth-token-helper'

// Supabase project details
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://soviwrzrgskhvgcmujfj.supabase.co'

export async function GET(request: NextRequest) {
  try {
    console.log('Database structure API called:', request.url);

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

    // Log authentication status
    if (isAuthenticated) {
      console.log(`Authenticated as user: ${userId}`);
    } else {
      console.log('Using admin client with service role');
    }

    // Verify connection to Supabase
    try {
      const { error: pingError } = await dbClient.from('_pgrst_reserved_dummy').select('*', { head: true, count: 'exact' }).limit(1);

      // 42501 is permission denied, which is expected for some queries
      // PGRST116 is no rows returned, which is also expected
      if (pingError && pingError.code !== '42501' && pingError.code !== 'PGRST116') {
        console.error('Database connection error:', pingError);
        return NextResponse.json(
          {
            error: 'Database connection error',
            details: pingError.message,
            code: pingError.code,
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }
    } catch (connectionError) {
      console.error('Failed to connect to database:', connectionError);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: connectionError instanceof Error ? connectionError.message : String(connectionError),
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // If we're using the admin client without authentication, we need to be careful about what we return
    // Only return basic structure information, not sensitive data
    const isAdminMode = !isAuthenticated;

    // Check if the profiles table exists by trying to query it
    const { data: profilesData, error: profilesError } = await dbClient
      .from('profiles')
      .select('id')
      .limit(1)

    const profilesTableExists = !profilesError ||
      (profilesError.code !== '42P01' && profilesError.code !== '42501');

    // Get table columns if the table exists
    let columns = []
    let columnsError = null
    let missingRequiredColumns = []

    if (profilesTableExists) {
      try {
        // Check for required columns using our new function
        const requiredColumns = ['id', 'user_id', 'full_name', 'created_at'];

        const { data: verifyData, error: verifyError } = await dbClient.rpc('verify_required_columns', {
          table_name: 'profiles',
          required_columns: requiredColumns
        });

        if (!verifyError && verifyData) {
          // Check which required columns exist
          missingRequiredColumns = verifyData
            .filter(col => !col.column_exists)
            .map(col => col.column_name);

          if (missingRequiredColumns.length > 0) {
            console.error('Missing required columns:', missingRequiredColumns);
          } else {
            console.log('All required columns exist');
          }
        }

        // Get all columns
        const { data: rpcData, error: rpcError } = await dbClient.rpc('get_table_columns', {
          table_name: 'profiles'
        });

        if (!rpcError && rpcData) {
          // RPC function worked
          columns = rpcData;
          columnsError = null;
        } else {
          // Method 2: Try querying information_schema directly
          console.log('RPC method failed, trying information_schema query');

          const { data: schemaData, error: schemaError } = await dbClient
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'profiles')
            .eq('table_schema', 'public')
            .order('ordinal_position');

          if (!schemaError && schemaData && schemaData.length > 0) {
            // Information schema query worked
            columns = schemaData;
            columnsError = null;
          } else {
            // Method 3: Try a direct query on the profiles table
            console.log('Information schema query failed, trying direct table query');

            const { data: directData, error: directError } = await dbClient
              .from('profiles')
              .select('*')
              .limit(1);

            if (!directError && directData && directData.length > 0) {
              // Extract column names from the first row
              const columnNames = Object.keys(directData[0]);
              columns = columnNames.map(name => ({ column_name: name, data_type: 'unknown' }));
              columnsError = null;
            } else {
              // All methods failed
              columns = [];
              columnsError = {
                message: 'Failed to get column information using all available methods',
                details: {
                  rpc: rpcError?.message,
                  schema: schemaError?.message,
                  direct: directError?.message
                },
                code: 'COLUMN_QUERY_ERROR'
              };
            }
          }
        }
      } catch (columnError) {
        console.error('Error getting column information:', columnError);
        columnsError = {
          message: columnError instanceof Error ? columnError.message : String(columnError),
          code: 'COLUMN_QUERY_ERROR'
        };
      }
    }

    // Check RLS policies
    let policies = []
    let policiesError = null

    if (profilesTableExists) {
      try {
        // Try to get policy information using different methods

        // Method 1: Try using the get_table_policies RPC function
        const { data: rpcData, error: rpcError } = await dbClient.rpc('get_table_policies', {
          table_name: 'profiles'
        });

        if (!rpcError && rpcData) {
          // RPC function worked
          policies = rpcData;
          policiesError = null;
        } else {
          // Method 2: Try querying pg_policies directly
          console.log('RPC method failed, trying pg_policies query');

          const { data: pgData, error: pgError } = await dbClient
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'profiles');

          if (!pgError && pgData) {
            // pg_policies query worked
            policies = pgData;
            policiesError = null;
          } else {
            // Method 3: Try a raw SQL query
            console.log('pg_policies query failed, trying raw SQL query');

            try {
              // Use a raw SQL query to check if RLS is enabled
              const { data: rlsData, error: rlsError } = await dbClient.rpc('check_rls_enabled', {
                table_name: 'profiles'
              });

              if (!rlsError && rlsData) {
                policies = [{ is_enabled: rlsData }];
                policiesError = null;
              } else {
                // All methods failed
                policies = [];
                policiesError = {
                  message: 'Failed to get policy information using all available methods',
                  details: {
                    rpc: rpcError?.message,
                    pg: pgError?.message,
                    rls: rlsError?.message
                  },
                  code: 'POLICY_QUERY_ERROR'
                };
              }
            } catch (sqlError) {
              policies = [];
              policiesError = {
                message: 'Error executing SQL query for policies',
                details: sqlError instanceof Error ? sqlError.message : String(sqlError),
                code: 'SQL_QUERY_ERROR'
              };
            }
          }
        }
      } catch (policyError) {
        console.error('Error getting policy information:', policyError);
        policiesError = {
          message: policyError instanceof Error ? policyError.message : String(policyError),
          code: 'POLICY_QUERY_ERROR'
        };
      }
    }

    // Prepare the response data
    const responseData = {
      auth: {
        authenticated: isAuthenticated,
        userId: userId || null,
        mode: isAdminMode ? 'admin' : 'user'
      },
      profilesTable: {
        exists: profilesTableExists,
        error: profilesError ? {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details
        } : null
      },
      columns: {
        data: isAdminMode && !isAuthenticated ? [] : columns, // Only return columns if authenticated or in user mode
        error: columnsError ? {
          code: columnsError.code,
          message: columnsError.message,
          details: columnsError.details
        } : null,
        missingRequired: missingRequiredColumns,
        requiredColumnsStatus: missingRequiredColumns.length === 0 ? 'complete' : 'incomplete'
      },
      policies: {
        data: isAdminMode && !isAuthenticated ? [] : policies, // Only return policies if authenticated or in user mode
        error: policiesError ? {
          code: policiesError.code,
          message: policiesError.message,
          details: policiesError.details
        } : null
      },
      timestamp: new Date().toISOString(), // Add timestamp to ensure response is never empty
      serverInfo: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        cookiesAvailable: true,
        projectRef: SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || 'soviwrzrgskhvgcmujfj'
      }
    };

    // Log the response for debugging (but don't log sensitive data)
    console.log('Database structure response status:', {
      authenticated: responseData.auth.authenticated,
      mode: responseData.auth.mode,
      profilesTableExists: responseData.profilesTable.exists,
      hasColumns: responseData.columns.data.length > 0,
      hasPolicies: responseData.policies.data.length > 0,
      timestamp: responseData.timestamp
    });

    // Return the response with proper headers
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error checking database structure:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
