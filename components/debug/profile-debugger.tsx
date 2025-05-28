"use client"

import { useState } from "react"
import { useProfile } from "@/lib/contexts/profile-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { supabase } from "@/lib/supabase-unified"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

export function ProfileDebugger() {
  const { profile, refreshProfile, isLoading } = useProfile()
  const { user } = useAuth()
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [diagnosisLoading, setDiagnosisLoading] = useState(false)
  const [repairResult, setRepairResult] = useState<any>(null)
  const [repairLoading, setRepairLoading] = useState(false)

  const runDiagnosis = async () => {
    if (!user) {
      setDiagnosisResult({
        success: false,
        message: "No user found. Please log in first."
      })
      return
    }

    try {
      setDiagnosisLoading(true)
      setDiagnosisResult(null)

      console.log("Running profile diagnosis for user:", user.id)

      // Check if profiles table exists
      const { data: tables, error: tablesError } = await enhancedSupabase.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')

      if (tablesError) {
        console.error("Error checking tables:", tablesError)
        setDiagnosisResult({
          success: false,
          message: "Error checking database tables",
          error: tablesError
        })
        return
      }

      const profileTableExists = tables && tables.length > 0

      if (!profileTableExists) {
        setDiagnosisResult({
          success: false,
          message: "Profiles table does not exist in the database",
          tableCheck: { exists: false }
        })
        return
      }

      // Check if user has a profile
      const { data: userProfile, error: profileError } = await enhancedSupabase.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Error checking user profile:", profileError)
        setDiagnosisResult({
          success: false,
          message: "Error checking user profile",
          error: profileError,
          tableCheck: { exists: true }
        })
        return
      }

      // Check RLS policies
      const { data: policies, error: policiesError } = await enhancedSupabase.supabase
        .rpc('get_policies_for_table', { table_name: 'profiles' })

      const results = {
        success: true,
        tableCheck: { exists: true },
        profileCheck: {
          exists: !!userProfile,
          data: userProfile
        },
        policiesCheck: {
          success: !policiesError,
          data: policies,
          error: policiesError
        }
      }

      console.log("Diagnosis results:", results)
      setDiagnosisResult(results)
    } catch (error) {
      console.error("Error running diagnosis:", error)
      setDiagnosisResult({
        success: false,
        message: "Unexpected error during diagnosis",
        error
      })
    } finally {
      setDiagnosisLoading(false)
    }
  }

  const repairProfile = async () => {
    if (!user) {
      setRepairResult({
        success: false,
        message: "No user found. Please log in first."
      })
      return
    }

    try {
      setRepairLoading(true)
      setRepairResult(null)

      console.log("Attempting to repair profile for user:", user.id)

      // Check if user has a profile
      const { data: existingProfile, error: checkError } = await enhancedSupabase.supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking for existing profile:", checkError)
        setRepairResult({
          success: false,
          message: "Error checking for existing profile",
          error: checkError
        })
        return
      }

      let result

      if (existingProfile) {
        // Profile exists, try to update it
        console.log("Profile exists, updating it")

        const { data, error } = await enhancedSupabase.supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()

        if (error) {
          console.error("Error updating profile:", error)
          result = {
            success: false,
            message: "Error updating existing profile",
            error
          }
        } else {
          result = {
            success: true,
            message: "Profile updated successfully",
            data
          }
        }
      } else {
        // Profile doesn't exist, create a new one
        console.log("Profile doesn't exist, creating a new one")

        const defaultProfile = {
          user_id: user.id,
          full_name: user.email?.split('@')[0] || 'User',
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
          .insert([defaultProfile])
          .select()

        if (error) {
          console.error("Error creating profile:", error)
          result = {
            success: false,
            message: "Error creating new profile",
            error
          }
        } else {
          result = {
            success: true,
            message: "Profile created successfully",
            data
          }
        }
      }

      console.log("Repair result:", result)
      setRepairResult(result)

      // Refresh the profile in the context
      if (result.success) {
        await refreshProfile()
      }
    } catch (error) {
      console.error("Error repairing profile:", error)
      setRepairResult({
        success: false,
        message: "Unexpected error during repair",
        error
      })
    } finally {
      setRepairLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Profile Debugger</CardTitle>
        <CardDescription>
          Herramienta para diagnosticar y reparar problemas con el perfil de usuario
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Estado del Perfil</h3>
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
              {profile && (
                <>
                  <div>
                    <span className="font-semibold">Nombre:</span>{" "}
                    <span>{profile.fullName}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Onboarding:</span>{" "}
                    {profile.onboardingCompleted ? (
                      <span className="text-green-600">Completado</span>
                    ) : (
                      <span className="text-amber-600">No completado</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Acciones</h3>
            <div className="space-y-2">
              <Button
                onClick={runDiagnosis}
                variant="outline"
                className="w-full"
                disabled={diagnosisLoading || !user}
              >
                {diagnosisLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Diagnosticando...
                  </>
                ) : (
                  "Diagnosticar Problemas"
                )}
              </Button>
              <Button
                onClick={repairProfile}
                variant="outline"
                className="w-full"
                disabled={repairLoading || !user}
              >
                {repairLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reparando...
                  </>
                ) : (
                  "Reparar Perfil"
                )}
              </Button>
              <Button
                onClick={() => refreshProfile()}
                variant="outline"
                className="w-full"
                disabled={isLoading || !user}
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

        {diagnosisResult && (
          <Alert variant={diagnosisResult.success ? "default" : "destructive"}>
            <AlertTitle className="flex items-center">
              {diagnosisResult.success ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Resultado del Diagnóstico
            </AlertTitle>
            <AlertDescription>
              {diagnosisResult.message || (diagnosisResult.success ? "Diagnóstico completado sin problemas" : "Se encontraron problemas")}
            </AlertDescription>
          </Alert>
        )}

        {repairResult && (
          <Alert variant={repairResult.success ? "default" : "destructive"}>
            <AlertTitle className="flex items-center">
              {repairResult.success ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Resultado de la Reparación
            </AlertTitle>
            <AlertDescription>
              {repairResult.message}
            </AlertDescription>
          </Alert>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="profile">
            <AccordionTrigger>Detalles del Perfil</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          {diagnosisResult && (
            <AccordionItem value="diagnosis">
              <AccordionTrigger>Detalles del Diagnóstico</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {JSON.stringify(diagnosisResult, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}

          {repairResult && (
            <AccordionItem value="repair">
              <AccordionTrigger>Detalles de la Reparación</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {JSON.stringify(repairResult, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Esta herramienta es solo para depuración y no debe estar disponible en producción.
      </CardFooter>
    </Card>
  )
}
