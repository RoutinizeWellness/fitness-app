import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-unified'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { AuthContext } from '@/lib/auth/auth-context'

export type UserProfile = {
  id: string
  userId: string
  fullName: string
  avatarUrl?: string
  weight?: number
  height?: number
  goal?: string
  level?: string
  isAdmin?: boolean
  onboardingCompleted?: boolean
  experienceLevel?: string
  interfaceMode?: string
  createdAt: string
  updatedAt?: string
}

type ProfileContextType = {
  profile: UserProfile | null
  isLoading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Get auth context safely
  const authContext = React.useContext(AuthContext)
  const user = authContext?.user || null
  const session = authContext?.session || null

  // Helper function to transform Supabase profile data to our app's format
  const transformProfileData = (profileData: any): UserProfile => {
    if (!profileData || typeof profileData !== 'object') {
      console.error('Invalid profile data received:', profileData)
      throw new Error('Invalid profile data')
    }

    console.log('Transforming profile data:', profileData)

    // Create a transformed profile with default values for missing fields
    const transformedProfile: UserProfile = {
      id: profileData.id,
      userId: profileData.user_id,
      fullName: profileData.full_name || 'User',
      avatarUrl: profileData.avatar_url,
      weight: profileData.weight,
      height: profileData.height,
      goal: profileData.goal,
      level: profileData.level || 'beginner',
      isAdmin: profileData.is_admin || false,
      onboardingCompleted: profileData.onboarding_completed || false,
      experienceLevel: profileData.experience_level || 'beginner',
      interfaceMode: profileData.interface_mode || 'beginner',
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at || profileData.created_at
    }

    console.log('Transformed profile:', transformedProfile)
    return transformedProfile
  }

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true)

      console.log('Fetching profile for userId:', userId)

      if (!userId) {
        console.error('fetchProfile: userId is null or undefined')
        return null
      }

      // Skip API route and go directly to Supabase client for now to avoid fetch errors
      console.log('Using direct Supabase client for profile fetch')

      // Importar withRetry directamente para asegurar que esté disponible
      let withRetry;
      try {
        const { withRetry: importedWithRetry } = await import('@/lib/auth-session-recovery');
        withRetry = importedWithRetry;
      } catch (importError) {
        console.error('Error importando withRetry:', importError);
        // Usar una función simple como fallback
        withRetry = (fn: any) => fn();
      }

      // Use the Supabase client with retry logic
      const { data, error } = await withRetry(() =>
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
      )

      if (error) {
        // Log detailed error information
        console.error('Error fetching profile:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)

        // Check for specific error types
        if (error.code === '42P01') {
          console.error('Table does not exist error')
          toast({
            title: 'Error de base de datos',
            description: 'La tabla de perfiles no existe. Contacta al administrador.',
            variant: 'destructive'
          })
          return null
        }

        if (error.code === '42501') {
          console.error('Permission denied error - RLS policy issue')
          toast({
            title: 'Error de permisos',
            description: 'No tienes permisos para acceder al perfil. Contacta al administrador.',
            variant: 'destructive'
          })
          return null
        }

        toast({
          title: 'Error',
          description: 'No se pudo cargar el perfil. Por favor, intenta de nuevo.',
          variant: 'destructive'
        })
        return null
      }

      if (!data) {
        console.log('No profile found, creating default profile')
        return null
      }

      // Check if data is an empty object
      if (typeof data === 'object' && Object.keys(data).length === 0) {
        console.error('Empty object response from Supabase when fetching profile')

        // Try to verify if the profile exists despite the empty response
        try {
          console.log('Attempting to verify profile existence via database structure check')
          const structureResponse = await fetch('/api/database/structure', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (structureResponse.ok) {
            const structureResult = await structureResponse.json()
            console.log('Database structure check result:', structureResult)

            if (!structureResult.profilesTable.exists) {
              toast({
                title: 'Error de base de datos',
                description: 'La tabla de perfiles no existe. Contacta al administrador.',
                variant: 'destructive'
              })
              return null
            }

            // If table exists but we got empty response, it's likely an RLS policy issue
            toast({
              title: 'Error de permisos',
              description: 'No tienes permisos para acceder al perfil. Contacta al administrador.',
              variant: 'destructive'
            })
          } else {
            toast({
              title: 'Error de conexión',
              description: 'Respuesta vacía del servidor. Por favor, intenta de nuevo.',
              variant: 'destructive'
            })
          }
        } catch (structureError) {
          console.error('Error checking database structure:', structureError)
          toast({
            title: 'Error de conexión',
            description: 'Respuesta vacía del servidor. Por favor, intenta de nuevo.',
            variant: 'destructive'
          })
        }

        return null
      }

      console.log('Profile data received:', data)

      try {
        // Use the helper function to transform the data
        return transformProfileData(data)
      } catch (transformError) {
        console.error('Error transforming profile data:', transformError)

        // If transformation fails, try to create a minimal valid profile
        const minimalProfile: UserProfile = {
          id: data.id,
          userId: data.user_id,
          fullName: data.full_name || 'User',
          level: 'beginner',
          isAdmin: false,
          onboardingCompleted: false,
          experienceLevel: 'beginner',
          interfaceMode: 'beginner',
          createdAt: data.created_at,
          updatedAt: data.updated_at || data.created_at
        }

        console.log('Created minimal profile as fallback:', minimalProfile)
        return minimalProfile
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al cargar el perfil. Por favor, intenta de nuevo.',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultProfile = async (userId: string) => {
    try {
      setIsLoading(true)

      console.log('Creating default profile for userId:', userId)

      if (!userId) {
        console.error('createDefaultProfile: userId is null or undefined')
        return null
      }

      // First, check if a profile already exists to avoid duplicate entries
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking for existing profile:', checkError)
        // Continue with creation attempt
      } else if (existingProfile) {
        console.log('Profile already exists, fetching instead of creating')
        return await fetchProfile(userId)
      }

      // Create a minimal default profile with only essential fields
      const defaultProfile = {
        fullName: 'User',
        level: 'beginner',
        onboardingCompleted: false,
        experienceLevel: 'beginner',
        interfaceMode: 'beginner'
      }

      console.log('Default profile to create:', defaultProfile)

      // Try to create the profile using the server-side API route first
      try {
        console.log('Attempting to create profile using server-side API route for userId:', userId)
        const response = await fetch('/api/profile/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            profile: defaultProfile
          }),
          credentials: 'include' // Asegurar que se incluyan las cookies
        })

        console.log('Create API response status:', response.status, 'statusText:', response.statusText)

        if (response.ok) {
          const result = await response.json()
          console.log('Profile created successfully via API route:', result.profile)
          return transformProfileData(result.profile)
        } else {
          // Mejorar el manejo de errores de la API
          try {
            const errorData = await response.json()
            console.error('Error creating profile via API route:', errorData)
          } catch (jsonError) {
            console.error('Error parsing API error response:', jsonError)
            console.error('Response status:', response.status, 'Response statusText:', response.statusText)
          }
          // Fall back to direct client approach
        }
      } catch (apiError) {
        console.error('Error using API route for profile creation:', apiError)
        // Fall back to direct client approach
      }

      // Verificar si hay una sesión válida antes de continuar
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { ensureValidSession, attemptSessionRecovery } = await import('@/lib/auth-session-recovery');
        const isSessionValid = await ensureValidSession(false);

        if (!isSessionValid) {
          console.log('No hay sesión válida, intentando recuperarla');
          const recovered = await attemptSessionRecovery();

          if (!recovered) {
            console.error('No se pudo recuperar la sesión para crear el perfil');
            throw new Error('Sesión inválida');
          }

          console.log('Sesión recuperada, continuando con la creación del perfil');
        }
      } catch (sessionError) {
        console.error('Error al verificar la sesión:', sessionError);
        // Continuar de todos modos, pero registrar el error
      }

      // Fall back to direct Supabase client if API route fails
      console.log('Falling back to direct Supabase client for profile creation')
      const supabaseProfile = {
        user_id: userId,
        full_name: defaultProfile.fullName,
        level: defaultProfile.level,
        is_admin: false,
        onboarding_completed: defaultProfile.onboardingCompleted,
        experience_level: defaultProfile.experienceLevel,
        interface_mode: defaultProfile.interfaceMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Importar withRetry directamente para asegurar que esté disponible
      let withRetry;
      try {
        const { withRetry: importedWithRetry } = await import('@/lib/auth-session-recovery');
        withRetry = importedWithRetry;
      } catch (importError) {
        console.error('Error importando withRetry:', importError);
        // Usar el cliente normal como fallback
        withRetry = (fn) => fn();
      }

      const { data, error } = await withRetry(() =>
        supabase
          .from('profiles')
          .insert([supabaseProfile])
          .select()
      )

      if (error) {
        console.error('Error creating default profile:', error)

        // Log detailed error information
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)

        // Check for specific error types
        if (error.code === '23505') {
          console.log('Duplicate key error - profile might already exist, trying to fetch instead')
          return await fetchProfile(userId)
        }

        if (error.code === '42P01') {
          console.error('Table does not exist error')
          toast({
            title: 'Error de base de datos',
            description: 'La tabla de perfiles no existe. Contacta al administrador.',
            variant: 'destructive'
          })
          return null
        }

        if (error.code === '42501') {
          console.error('Permission denied error - RLS policy issue')
          toast({
            title: 'Error de permisos',
            description: 'No tienes permisos para crear un perfil. Contacta al administrador.',
            variant: 'destructive'
          })
          return null
        }

        // Generic error message
        toast({
          title: 'Error',
          description: `No se pudo crear el perfil: ${error.message}`,
          variant: 'destructive'
        })
        return null
      }

      if (!data || data.length === 0) {
        console.error('No data returned after creating default profile')

        // Try a fallback approach - create with minimal fields
        console.log('Attempting fallback profile creation with minimal fields')
        const fallbackProfile = {
          user_id: userId,
          full_name: 'User',
          created_at: new Date().toISOString()
        }

        const fallbackResult = await supabase
          .from('profiles')
          .insert([fallbackProfile])
          .select()

        if (fallbackResult.error) {
          console.error('Fallback profile creation also failed:', fallbackResult.error)
          toast({
            title: 'Error',
            description: 'No se pudo crear el perfil. Por favor, intenta de nuevo más tarde.',
            variant: 'destructive'
          })
          return null
        }

        if (fallbackResult.data && fallbackResult.data.length > 0) {
          console.log('Fallback profile creation succeeded:', fallbackResult.data[0])
          // Use the fallback data instead
          return transformProfileData(fallbackResult.data[0])
        } else {
          toast({
            title: 'Error',
            description: 'No se recibieron datos al crear el perfil. Por favor, intenta de nuevo.',
            variant: 'destructive'
          })
          return null
        }
      }

      // Check if data is an empty object or array
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && Object.keys(data[0]).length === 0) {
        console.error('Empty object response from Supabase when creating profile')

        // Try to verify if the profile was actually created despite the empty response
        console.log('Verifying if profile was created despite empty response')
        const verifyResult = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!verifyResult.error && verifyResult.data && Object.keys(verifyResult.data).length > 0) {
          console.log('Profile exists despite empty response:', verifyResult.data)
          return await fetchProfile(userId)
        }

        toast({
          title: 'Error de conexión',
          description: 'Respuesta vacía del servidor. Por favor, intenta de nuevo.',
          variant: 'destructive'
        })
        return null
      }

      console.log('Profile created successfully:', data[0])
      return transformProfileData(data[0])
    } catch (error) {
      console.error('Unexpected error creating default profile:', error)
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al crear el perfil. Por favor, intenta de nuevo.',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) {
      console.log('refreshProfile: No user found, clearing profile')
      setProfile(null)
      setIsLoading(false)
      return
    }

    console.log('🔄 Refreshing profile for user:', user.id)
    setIsLoading(true)

    try {
      // Simplified session check
      if (!session) {
        console.log('❌ No session found in auth context, clearing profile')
        setProfile(null)
        setIsLoading(false)
        return
      }

      // Verify user ID matches session
      if (user.id !== session.user?.id) {
        console.error('❌ User ID mismatch in refreshProfile:', { contextId: user.id, sessionId: session.user?.id })
        setProfile(null)
        setIsLoading(false)
        return
      }

      // Step 1: Try to fetch existing profile
      console.log('📋 Attempting to fetch existing profile')
      const fetchedProfile = await fetchProfile(user.id)

      if (fetchedProfile) {
        console.log('✅ Existing profile found')
        setProfile(fetchedProfile)
        setIsLoading(false)
        return fetchedProfile
      }

      // Step 2: No profile found, create a default one
      console.log('📝 No profile found, creating default profile')
      const defaultProfile = await createDefaultProfile(user.id)

      if (defaultProfile) {
        console.log('✅ Default profile created successfully')
        setProfile(defaultProfile)
        setIsLoading(false)
        return defaultProfile
      }

      // Step 3: If direct creation fails, try API route as fallback
      console.log('🔄 Direct creation failed, trying API route')
      try {
        const response = await fetch('/api/profile/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            profile: {
              fullName: user.email?.split('@')[0] || 'User',
              level: 'beginner',
              onboardingCompleted: false,
              experienceLevel: 'beginner',
              interfaceMode: 'beginner'
            }
          }),
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          if (result.profile) {
            console.log('✅ Profile created via API route')
            const profile = transformProfileData(result.profile)
            setProfile(profile)
            setIsLoading(false)
            return profile
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('❌ API route failed:', errorData)
        }
      } catch (apiError) {
        console.error('❌ API route threw exception:', apiError)
      }

      // If all methods fail, show error
      console.error('❌ All profile creation methods failed')
      toast({
        title: 'Error de perfil',
        description: 'No se pudo crear tu perfil. Por favor, recarga la página e intenta de nuevo.',
        variant: 'destructive'
      })
      setProfile(null)
      setIsLoading(false)
      return null

    } catch (error) {
      console.error('❌ Unexpected error in refreshProfile:', error)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cargar tu perfil. Por favor, intenta de nuevo.',
        variant: 'destructive'
      })
      setProfile(null)
      setIsLoading(false)
      return null
    }
  }

  // Diagnostic function to check database structure
  const checkDatabaseStructure = async () => {
    try {
      console.log('Running database structure check...')

      // Verificar si hay una sesión válida antes de continuar
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { ensureValidSession } = await import('@/lib/auth-session-recovery')
        const isSessionValid = await ensureValidSession(false)

        if (!isSessionValid) {
          console.log('No hay sesión válida para verificar la estructura de la base de datos')
          return false
        }
      } catch (sessionError) {
        console.error('Error al verificar la sesión:', sessionError)
        return false
      }

      // Use the server-side API route to check database structure
      try {
        console.log('Using server-side API route to check database structure')
        const response = await fetch('/api/database/structure', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Asegurar que se incluyan las cookies para la autenticación
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Database structure check result:', result)

          // Check if profiles table exists
          if (!result.profilesTable.exists) {
            console.error('Profiles table does not exist!', result.profilesTable.error)
            return false
          }

          console.log('Profiles table exists')

          // Check for required columns
          if (result.columns.missingRequired && Array.isArray(result.columns.missingRequired)) {
            if (result.columns.missingRequired.length > 0) {
              console.error('Missing required columns:', result.columns.missingRequired)

              // Try to fix the database structure
              console.log('Attempting to fix database structure...')
              try {
                const fixResponse = await fetch('/api/database/fix-structure', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })

                if (fixResponse.ok) {
                  const fixResult = await fixResponse.json()
                  console.log('Database structure fix result:', fixResult)

                  if (fixResult.allColumnsExist) {
                    console.log('All required columns now exist')
                    return true
                  } else {
                    console.error('Failed to fix all missing columns:', fixResult.missingColumns)
                    return false
                  }
                } else {
                  console.error('Failed to fix database structure:', fixResponse.status)
                  return false
                }
              } catch (fixError) {
                console.error('Error fixing database structure:', fixError)
                return false
              }
            } else {
              console.log('All required columns exist')
            }
          } else if (result.columns.data && Array.isArray(result.columns.data)) {
            console.log('Profiles table columns:', result.columns.data)

            const requiredColumns = ['id', 'user_id', 'full_name', 'created_at']
            const columnNames = result.columns.data.map(col => col.column_name)
            const missingColumns = requiredColumns.filter(col => !columnNames.includes(col))

            if (missingColumns.length > 0) {
              console.error('Missing required columns (legacy check):', missingColumns)

              // Try to fix the database structure
              console.log('Attempting to fix database structure (legacy)...')
              try {
                const fixResponse = await fetch('/api/database/fix-structure', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })

                if (fixResponse.ok) {
                  const fixResult = await fixResponse.json()
                  console.log('Database structure fix result:', fixResult)

                  if (fixResult.allColumnsExist) {
                    console.log('All required columns now exist')
                    return true
                  } else {
                    console.error('Failed to fix all missing columns:', fixResult.missingColumns)
                    return false
                  }
                } else {
                  console.error('Failed to fix database structure:', fixResponse.status)
                  return false
                }
              } catch (fixError) {
                console.error('Error fixing database structure:', fixError)
                return false
              }
            }
          } else {
            console.error('Could not retrieve column information:', result.columns.error)
          }

          // Check RLS policies
          if (result.policies.data && Array.isArray(result.policies.data)) {
            console.log('RLS policies for profiles table:', result.policies.data)

            // Check if essential policies exist
            const hasSelectPolicy = result.policies.data.some(p => p.cmd === 'SELECT')
            const hasInsertPolicy = result.policies.data.some(p => p.cmd === 'INSERT')
            const hasUpdatePolicy = result.policies.data.some(p => p.cmd === 'UPDATE')

            if (!hasSelectPolicy || !hasInsertPolicy || !hasUpdatePolicy) {
              console.warn('Missing essential RLS policies:', {
                select: hasSelectPolicy,
                insert: hasInsertPolicy,
                update: hasUpdatePolicy
              })
            }
          } else {
            console.error('Could not retrieve policy information:', result.policies.error)
          }

          return true
        } else {
          // Handle different HTTP status codes
          console.error(`Error from database structure API: Status ${response.status}`)

          try {
            // Verificar el tipo de contenido antes de intentar analizar como JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              // Try to parse the error response
              const errorData = await response.json();
              console.error('Error details:', errorData);
            } else {
              // Si no es JSON, obtener el texto de la respuesta para depuración
              const textResponse = await response.text();
              console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 200) + '...');
            }

            // If it's an authentication error, try to recover the session
            if (response.status === 401) {
              console.log('Authentication error detected, attempting session recovery');

              // Import dynamically to avoid circular dependencies
              const { attemptSessionRecovery } = await import('@/lib/auth-session-recovery');
              const recovered = await attemptSessionRecovery();

              if (recovered) {
                console.log('Session recovered, retrying database structure check');
                // Try the API again after session recovery
                const retryResponse = await fetch('/api/database/structure', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include'
                });

                if (retryResponse.ok) {
                  try {
                    const retryResult = await retryResponse.json();
                    console.log('Retry successful:', retryResult);
                    return true;
                  } catch (jsonError) {
                    console.error('Error al analizar respuesta JSON después de recuperar sesión:', jsonError);
                  }
                }
              }
            }
          } catch (parseError) {
            console.error('Error parsing API response:', parseError);

            // Si es un error de sintaxis JSON, probablemente recibimos HTML en lugar de JSON
            if (parseError instanceof SyntaxError && parseError.message.includes('Unexpected token')) {
              console.error("Error de sintaxis JSON detectado, probablemente recibiendo HTML en lugar de JSON");

              // Intentar recuperar la sesión como último recurso
              const { attemptSessionRecovery } = await import('@/lib/auth-session-recovery');
              await attemptSessionRecovery();
            }
          }

          // Fall back to direct check if API fails
          return await directDatabaseCheck()
        }
      } catch (apiError) {
        console.error('Error using API route for database structure check:', apiError)

        // Fall back to direct check if API throws an exception
        return await directDatabaseCheck()
      }
    } catch (error) {
      console.error('Error checking database structure:', error)
      return false
    }
  }

  // Fallback function for direct database checks
  const directDatabaseCheck = async () => {
    try {
      console.log('Falling back to direct database check')

      // Verificar si hay una sesión válida antes de continuar
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { ensureValidSession, attemptSessionRecovery } = await import('@/lib/auth-session-recovery');
        const isSessionValid = await ensureValidSession(false);

        if (!isSessionValid) {
          console.log('No hay sesión válida, intentando recuperarla');
          const recovered = await attemptSessionRecovery();

          if (!recovered) {
            console.error('No se pudo recuperar la sesión para verificar la base de datos');
            return false;
          }

          console.log('Sesión recuperada, continuando con la verificación de la base de datos');
        }
      } catch (sessionError) {
        console.error('Error al verificar la sesión:', sessionError);
        // Continuar de todos modos, pero registrar el error
      }

      // Importar withRetry directamente para asegurar que esté disponible
      let withRetry;
      try {
        const { withRetry: importedWithRetry } = await import('@/lib/auth-session-recovery');
        withRetry = importedWithRetry;
      } catch (importError) {
        console.error('Error importando withRetry:', importError);
        // Usar el cliente normal como fallback
        withRetry = (fn) => fn();
      }

      // Try a query to check if the profiles table exists with all required columns
      const { data, error } = await withRetry(() =>
        supabase
          .from('profiles')
          .select('id, user_id, full_name, created_at')
          .limit(1)
      )

      if (error) {
        // Check if the error is because the table doesn't exist
        if (error.code === '42P01') {
          console.error('Profiles table does not exist!')
          return false
        }

        // Check if the error is because a column is missing
        if (error.code === '42703') {
          console.error('Required column missing in profiles table:', error.message)

          // Try to identify which column is missing
          const missingColumn = error.message.match(/column "([^"]+)" does not exist/)?.[1]
          if (missingColumn) {
            console.error(`Missing column: ${missingColumn}`)

            // Check if we can access the table at all
            const { error: basicError } = await supabase
              .from('profiles')
              .select('*')
              .limit(1)

            if (!basicError) {
              console.log('Profiles table exists but is missing required columns')
              return true // Table exists but needs migration
            }
          }

          return false
        }

        // If it's a permission error, the table likely exists
        if (error.code === '42501') {
          console.warn('Permission error when checking profiles table, but table likely exists')

          // Try to check if the table exists using a different approach
          try {
            const { data: schemaData, error: schemaError } = await supabase.rpc(
              'check_table_exists',
              { table_name: 'profiles' }
            )

            if (!schemaError && schemaData) {
              console.log('Confirmed profiles table exists via RPC')
              return true
            }
          } catch (rpcError) {
            console.error('Error checking table existence via RPC:', rpcError)
          }

          return true // Assume table exists despite permission error
        }

        console.error('Error checking if profiles table exists:', error)
        return false
      }

      // Check if we got data back
      if (data && data.length > 0) {
        console.log('Profiles table exists with all required columns')
        return true
      }

      // Table exists but no data
      console.log('Profiles table exists but has no data')
      return true
    } catch (error) {
      console.error('Error in direct database check:', error)
      return false
    }
  }

  useEffect(() => {
    // Only try to refresh profile if user is authenticated
    if (user) {
      console.log('User authenticated, refreshing profile for:', user.id)
      refreshProfile()

      // Run database structure check in development
      if (process.env.NODE_ENV === 'development') {
        checkDatabaseStructure()
      }
    } else {
      console.log('No authenticated user, clearing profile state')
      setProfile(null)
      setIsLoading(false)
    }
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setIsLoading(true)
      console.log('Updating profile with:', updates)

      if (!user || !profile) {
        console.error('updateProfile: User or profile not found')
        toast({
          title: 'Error',
          description: 'No se encontró usuario o perfil para actualizar.',
          variant: 'destructive'
        })
        return { error: new Error('User or profile not found') }
      }

      // Prepare data for Supabase
      const supabaseData = {
        user_id: user.id,
        full_name: updates.fullName || profile.fullName,
        avatar_url: updates.avatarUrl,
        weight: updates.weight,
        height: updates.height,
        goal: updates.goal,
        level: updates.level || profile.level,
        is_admin: profile.isAdmin, // Don't allow updating admin status
        onboarding_completed: updates.onboardingCompleted !== undefined ? updates.onboardingCompleted : profile.onboardingCompleted,
        experience_level: updates.experienceLevel || profile.experienceLevel,
        interface_mode: updates.interfaceMode || profile.interfaceMode,
        updated_at: new Date().toISOString()
      }

      // Remove undefined values
      Object.keys(supabaseData).forEach(key => {
        if (supabaseData[key] === undefined) {
          delete supabaseData[key]
        }
      })

      console.log('Supabase updates prepared:', supabaseData)

      // Importar withRetry directamente para asegurar que esté disponible
      let withRetry;
      try {
        const { withRetry: importedWithRetry } = await import('@/lib/auth-session-recovery');
        withRetry = importedWithRetry;
      } catch (importError) {
        console.error('Error importando withRetry:', importError);
        // Usar una función simple como fallback
        withRetry = (fn) => fn();
      }

      // Verificar si hay una sesión válida antes de continuar
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { ensureValidSession } = await import('@/lib/auth-session-recovery');
        const isSessionValid = await ensureValidSession(false);

        if (!isSessionValid) {
          console.error('No hay sesión válida para actualizar el perfil');
          throw new Error('Sesión inválida');
        }
      } catch (sessionError) {
        console.error('Error al verificar la sesión:', sessionError);
        // Continuar de todos modos, pero registrar el error
      }

      // Use the Supabase client with retry logic
      const { data, error } = await withRetry(() =>
        supabase
          .from('profiles')
          .update(supabaseData)
          .eq('user_id', user.id)
          .select()
      )

      if (error) {
        console.error('Error updating profile:', error)
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el perfil. Por favor, intenta de nuevo.',
          variant: 'destructive'
        })
        return { error }
      }

      if (!data || data.length === 0) {
        const err = new Error('No data returned after update')
        console.error(err)
        toast({
          title: 'Error',
          description: 'No se recibieron datos al actualizar el perfil. Por favor, intenta de nuevo.',
          variant: 'destructive'
        })
        return { error: err }
      }

      // Check if data is an empty object or array
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && Object.keys(data[0]).length === 0) {
        const err = new Error('Empty object response from Supabase when updating profile')
        console.error(err)
        toast({
          title: 'Error de conexión',
          description: 'Respuesta vacía del servidor. Por favor, intenta de nuevo.',
          variant: 'destructive'
        })
        return { error: err }
      }

      console.log('Profile updated successfully:', data[0])

      // Update local state
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      console.log('Updated profile state:', updatedProfile)
      setProfile(updatedProfile)

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado correctamente.',
      })

      return { data: updatedProfile, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al actualizar el perfil. Por favor, intenta de nuevo.',
        variant: 'destructive'
      })
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    profile,
    isLoading,
    updateProfile,
    refreshProfile
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
