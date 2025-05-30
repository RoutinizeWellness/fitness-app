"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// ✅ SECURE: Initialize Supabase client for secure authentication
const supabase = createClient()

export function AuthDebugger() {
  const { user, session, profile, refreshProfile } = useAuth()
  const [cookies, setCookies] = useState<string>("")
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([])
  const [sessionStorageKeys, setSessionStorageKeys] = useState<string[]>([])
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Get cookies
    setCookies(document.cookie)

    // Get localStorage keys
    try {
      setLocalStorageKeys(Object.keys(localStorage))
    } catch (e) {
      console.error("Error accessing localStorage:", e)
    }

    // Get sessionStorage keys
    try {
      setSessionStorageKeys(Object.keys(sessionStorage))
    } catch (e) {
      console.error("Error accessing sessionStorage:", e)
    }

    // ✅ SECURE: Get verified user from server
    const getVerifiedUser = async () => {
      try {
        console.log('🔐 Auth Debugger: Verificando usuario con el servidor...')

        // ✅ SECURE: Usar getUser() para verificar con el servidor
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error("❌ Error getting verified user:", error)
          setSupabaseSession(null)
        } else if (user) {
          console.log('✅ Usuario verificado por el servidor:', user.id)

          // Obtener sesión local solo para información adicional
          const { data: sessionData } = await supabase.auth.getSession()
          setSupabaseSession(sessionData.session)
        } else {
          console.log('ℹ️ No hay usuario autenticado')
          setSupabaseSession(null)
        }
      } catch (error) {
        console.error("💥 Error inesperado al verificar usuario:", error)
        setSupabaseSession(null)
      }
    }

    getVerifiedUser()
  }, [])

  const handleRefreshProfile = async () => {
    try {
      const result = await refreshProfile()
      console.log("Profile refresh result:", result)
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  const handleClearStorage = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      window.location.reload()
    } catch (e) {
      console.error("Error clearing storage:", e)
    }
  }

  const handleForceRedirect = () => {
    window.location.href = "/dashboard"
  }

  const handleSignOut = async () => {
    try {
      // Use the unified authentication system
      const { supabaseAuth } = await import('@/lib/auth/supabase-auth')
      await supabaseAuth.signOut()
      window.location.href = "/auth/login"
    } catch (e) {
      console.error("Error signing out:", e)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Auth Debugger</CardTitle>
        <CardDescription>
          Herramienta para depurar problemas de autenticación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Estado de Autenticación</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Usuario:</span>{" "}
                {user ? (
                  <span className="text-green-600">Autenticado ({user.id})</span>
                ) : (
                  <span className="text-red-600">No autenticado</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Sesión:</span>{" "}
                {session ? (
                  <span className="text-green-600">Activa</span>
                ) : (
                  <span className="text-red-600">Inactiva</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Perfil:</span>{" "}
                {profile ? (
                  <span className="text-green-600">Cargado ({profile.id})</span>
                ) : (
                  <span className="text-red-600">No cargado</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Onboarding:</span>{" "}
                {profile?.onboarding_completed ? (
                  <span className="text-green-600">Completado</span>
                ) : (
                  <span className="text-amber-600">No completado</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Entorno:</span>{" "}
                {isClient ? (
                  <span className="text-green-600">Cliente</span>
                ) : (
                  <span className="text-blue-600">Servidor</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Acciones</h3>
            <div className="space-y-2">
              <Button
                onClick={handleRefreshProfile}
                variant="outline"
                className="w-full"
              >
                Actualizar Perfil
              </Button>
              <Button
                onClick={handleForceRedirect}
                variant="outline"
                className="w-full"
              >
                Forzar Redirección a Dashboard
              </Button>
              <Button
                onClick={handleClearStorage}
                variant="outline"
                className="w-full text-amber-600"
              >
                Limpiar Almacenamiento
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full text-red-600"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="session">
            <AccordionTrigger>Detalles de Sesión</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {JSON.stringify(session, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="profile">
            <AccordionTrigger>Detalles de Perfil</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="supabase-session">
            <AccordionTrigger>Sesión Directa de Supabase</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {JSON.stringify(supabaseSession, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cookies">
            <AccordionTrigger>Cookies</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {cookies}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="local-storage">
            <AccordionTrigger>LocalStorage</AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                <ul className="list-disc pl-5 text-xs">
                  {localStorageKeys.map((key) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="session-storage">
            <AccordionTrigger>SessionStorage</AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                <ul className="list-disc pl-5 text-xs">
                  {sessionStorageKeys.map((key) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Esta herramienta es solo para depuración y no debe estar disponible en producción.
      </CardFooter>
    </Card>
  )
}
