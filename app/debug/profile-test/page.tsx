"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useProfile } from "@/lib/contexts/profile-context"
import { supabase } from "@/lib/supabase-unified"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ProfileTestPage() {
  const { user } = useAuth()
  const { profile, refreshProfile, isLoading } = useProfile()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  const runTests = async () => {
    if (!user) {
      setTestResults([
        {
          name: "Authentication Check",
          success: false,
          message: "No user found. Please log in first."
        }
      ])
      return
    }

    setIsRunningTests(true)
    setTestResults([])

    const results = []

    // Test 1: Check if user is authenticated
    results.push({
      name: "Authentication Check",
      success: true,
      message: `User is authenticated with ID: ${user.id}`,
      data: { userId: user.id, email: user.email }
    })

    // Test 2: Check if profile exists
    try {
      const { data: existingProfile, error: profileError } = await enhancedSupabase.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        results.push({
          name: "Profile Existence Check",
          success: false,
          message: `Error checking if profile exists: ${profileError.message}`,
          error: profileError
        })
      } else if (existingProfile) {
        results.push({
          name: "Profile Existence Check",
          success: true,
          message: "Profile exists in the database",
          data: existingProfile
        })
      } else {
        results.push({
          name: "Profile Existence Check",
          success: false,
          message: "Profile does not exist in the database",
          data: null
        })
      }
    } catch (error) {
      results.push({
        name: "Profile Existence Check",
        success: false,
        message: `Unexpected error checking profile: ${error instanceof Error ? error.message : String(error)}`,
        error
      })
    }

    // Test 3: Check RLS policies
    try {
      const { data: policies, error: policiesError } = await enhancedSupabase.supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'profiles')

      if (policiesError) {
        results.push({
          name: "RLS Policies Check",
          success: false,
          message: `Error checking RLS policies: ${policiesError.message}`,
          error: policiesError
        })
      } else {
        results.push({
          name: "RLS Policies Check",
          success: true,
          message: `Found ${policies.length} RLS policies for profiles table`,
          data: policies
        })
      }
    } catch (error) {
      results.push({
        name: "RLS Policies Check",
        success: false,
        message: `Unexpected error checking RLS policies: ${error instanceof Error ? error.message : String(error)}`,
        error
      })
    }

    // Test 4: Test direct profile creation
    if (!profile) {
      try {
        const testProfile = {
          user_id: user.id,
          full_name: 'Test User',
          level: 'beginner',
          is_admin: false,
          onboarding_completed: false,
          experience_level: 'beginner',
          interface_mode: 'beginner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await enhancedSupabase.supabase
          .from('profiles')
          .insert([testProfile])
          .select()

        if (error) {
          results.push({
            name: "Direct Profile Creation",
            success: false,
            message: `Error creating profile directly: ${error.message} (${error.code})`,
            error
          })
        } else if (data && data.length > 0) {
          results.push({
            name: "Direct Profile Creation",
            success: true,
            message: "Successfully created profile directly",
            data: data[0]
          })

          // Refresh the profile
          await refreshProfile()
        } else {
          results.push({
            name: "Direct Profile Creation",
            success: false,
            message: "No data returned after profile creation",
            data
          })
        }
      } catch (error) {
        results.push({
          name: "Direct Profile Creation",
          success: false,
          message: `Unexpected error creating profile directly: ${error instanceof Error ? error.message : String(error)}`,
          error
        })
      }
    } else {
      results.push({
        name: "Direct Profile Creation",
        success: true,
        message: "Profile already exists, skipping creation test",
        data: profile
      })
    }

    // Test 5: Test API route profile creation
    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profile: {
            fullName: 'API Test User',
            level: 'beginner',
            onboardingCompleted: false,
            experienceLevel: 'beginner',
            interfaceMode: 'beginner'
          }
        }),
      })

      const result = await response.json()

      if (response.ok) {
        results.push({
          name: "API Route Profile Creation",
          success: true,
          message: "Successfully created/updated profile via API route",
          data: result
        })
      } else {
        results.push({
          name: "API Route Profile Creation",
          success: false,
          message: `Error creating profile via API route: ${result.error || 'Unknown error'}`,
          error: result
        })
      }
    } catch (error) {
      results.push({
        name: "API Route Profile Creation",
        success: false,
        message: `Unexpected error creating profile via API route: ${error instanceof Error ? error.message : String(error)}`,
        error
      })
    }

    setTestResults(results)
    setIsRunningTests(false)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Profile Creation Test</h1>

      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Test Profile Creation</CardTitle>
          <CardDescription>
            Esta herramienta prueba diferentes métodos para crear perfiles de usuario y diagnostica problemas de RLS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Estado Actual</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Usuario:</span>{" "}
                  {user ? (
                    <span className="text-green-600">{user.id} ({user.email})</span>
                  ) : (
                    <span className="text-red-600">No autenticado</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Perfil:</span>{" "}
                  {isLoading ? (
                    <span className="text-amber-600">Cargando...</span>
                  ) : profile ? (
                    <span className="text-green-600">Cargado ({profile.id})</span>
                  ) : (
                    <span className="text-red-600">No cargado</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Acciones</h3>
              <div className="space-y-2">
                <Button
                  onClick={runTests}
                  variant="default"
                  className="w-full"
                  disabled={isRunningTests}
                >
                  {isRunningTests ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ejecutando pruebas...
                    </>
                  ) : (
                    "Ejecutar Pruebas"
                  )}
                </Button>
                <Button
                  onClick={() => refreshProfile()}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Perfil"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Resultados de las Pruebas</h3>

              {testResults.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <AlertTitle className="flex items-center">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    {result.name}
                  </AlertTitle>
                  <AlertDescription>
                    {result.message}
                  </AlertDescription>
                </Alert>
              ))}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger>Detalles Técnicos</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          Esta herramienta es solo para depuración y no debe estar disponible en producción.
        </CardFooter>
      </Card>
    </div>
  )
}
