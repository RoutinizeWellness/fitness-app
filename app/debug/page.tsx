"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { checkSupabaseConnection, checkTablePolicies, checkRlsEnabled, checkUserPermissions } from "@/lib/debug-supabase"
import { useAuth } from "@/lib/auth/auth-context"
import { getUserProfile, updateUserProfile } from "@/lib/supabase-client"
import { createClient } from '@supabase/supabase-js'
import { supabase } from "@/lib/supabase-client"

export default function DebugPage() {
  const { user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [policiesStatus, setPoliciesStatus] = useState<any>(null)
  const [rlsStatus, setRlsStatus] = useState<any>(null)
  const [permissionsStatus, setPermissionsStatus] = useState<any>(null)
  const [profileStatus, setProfileStatus] = useState<any>(null)
  const [updateStatus, setUpdateStatus] = useState<any>(null)
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tableName, setTableName] = useState("profiles")
  const [testName, setTestName] = useState("Test User")

  // Verificar sesión actual
  const checkSession = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      setSessionStatus({ data, error })
    } catch (error) {
      setSessionStatus({
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar la sesión al iniciar
  useEffect(() => {
    checkSession()
  }, [])

  // Verificar conexión a Supabase
  const checkConnection = async () => {
    setIsLoading(true)
    try {
      const result = await checkSupabaseConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar políticas de seguridad
  const checkPolicies = async () => {
    setIsLoading(true)
    try {
      const result = await checkTablePolicies(tableName)
      setPoliciesStatus(result)
    } catch (error) {
      setPoliciesStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar RLS
  const checkRls = async () => {
    setIsLoading(true)
    try {
      const result = await checkRlsEnabled(tableName)
      setRlsStatus(result)
    } catch (error) {
      setRlsStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar permisos de usuario
  const checkPermissions = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await checkUserPermissions(user.id, tableName)
      setPermissionsStatus(result)
    } catch (error) {
      setPermissionsStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener perfil de usuario
  const getProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await getUserProfile(user.id)
      setProfileStatus(result)
    } catch (error) {
      setProfileStatus({
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar perfil de usuario
  const updateProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await updateUserProfile(user.id, {
        full_name: testName,
        updated_at: new Date().toISOString()
      })
      setUpdateStatus(result)
    } catch (error) {
      setUpdateStatus({
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar variables de entorno
  const checkEnvVars = () => {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌"
    }
  }

  // Intentar una operación directa con Supabase
  const testDirectOperation = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (!supabaseUrl || !supabaseKey) {
        setUpdateStatus({
          success: false,
          error: 'Faltan variables de entorno para Supabase'
        })
        return
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Verificar si el perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let result;

      const profileData = {
        user_id: user.id,
        full_name: testName,
        updated_at: new Date().toISOString()
      };

      if (checkError || !existingProfile) {
        console.log("Perfil no encontrado, intentando insertar...");

        // Si no existe, intentar insertar
        result = await supabase
          .from("profiles")
          .insert([profileData])
          .select();
      } else {
        console.log("Perfil encontrado, intentando actualizar...");

        // Si existe, intentar actualizar
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id)
          .select();
      }

      setUpdateStatus({
        operation: checkError || !existingProfile ? 'insert' : 'update',
        result
      })
    } catch (error) {
      setUpdateStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Depuración de Supabase</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Información del usuario</CardTitle>
            <CardDescription>Datos del usuario actual</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Variables de entorno:</strong></p>
                <pre className="bg-gray-100 p-2 rounded mt-2">
                  {JSON.stringify(checkEnvVars(), null, 2)}
                </pre>
              </div>
            ) : (
              <p>No hay usuario autenticado</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkConnection} disabled={isLoading}>
              Verificar conexión
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de sesión</CardTitle>
            <CardDescription>Datos de la sesión actual</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionStatus ? (
              <pre className="bg-gray-100 p-2 rounded text-xs max-h-60 overflow-auto">
                {JSON.stringify(sessionStatus, null, 2)}
              </pre>
            ) : (
              <p>Cargando información de sesión...</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkSession} disabled={isLoading}>
              Actualizar sesión
            </Button>
            <Button
              onClick={async () => {
                try {
                  await supabase.auth.refreshSession()
                  checkSession()
                } catch (error) {
                  console.error("Error al refrescar sesión:", error)
                }
              }}
              disabled={isLoading}
              className="ml-2"
            >
              Refrescar token
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de la conexión</CardTitle>
            <CardDescription>Resultado de la verificación de conexión</CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus ? (
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(connectionStatus, null, 2)}
              </pre>
            ) : (
              <p>Haz clic en "Verificar conexión" para ver el estado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Políticas de seguridad</CardTitle>
            <CardDescription>Verificar políticas de seguridad de una tabla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tableName">Nombre de la tabla</Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={checkPolicies} disabled={isLoading}>
                  Verificar políticas
                </Button>
                <Button onClick={checkRls} disabled={isLoading}>
                  Verificar RLS
                </Button>
                {user && (
                  <Button onClick={checkPermissions} disabled={isLoading}>
                    Verificar permisos
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              {policiesStatus && (
                <div>
                  <h3 className="font-medium">Políticas:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(policiesStatus, null, 2)}
                  </pre>
                </div>
              )}

              {rlsStatus && (
                <div>
                  <h3 className="font-medium">RLS:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(rlsStatus, null, 2)}
                  </pre>
                </div>
              )}

              {permissionsStatus && (
                <div>
                  <h3 className="font-medium">Permisos:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(permissionsStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operaciones de perfil</CardTitle>
            <CardDescription>Probar operaciones con el perfil de usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testName">Nombre de prueba</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={getProfile} disabled={isLoading || !user}>
                  Obtener perfil
                </Button>
                <Button onClick={updateProfile} disabled={isLoading || !user}>
                  Actualizar perfil
                </Button>
                <Button onClick={testDirectOperation} disabled={isLoading || !user}>
                  Operación directa
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              {profileStatus && (
                <div>
                  <h3 className="font-medium">Perfil:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(profileStatus, null, 2)}
                  </pre>
                </div>
              )}

              {updateStatus && (
                <div>
                  <h3 className="font-medium">Actualización:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(updateStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
