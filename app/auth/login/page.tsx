"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    // Validación básica
    if (!email || !password) {
      setErrorMessage("Por favor, ingresa tu correo electrónico y contraseña")
      setIsLoading(false)
      return
    }

    try {
      console.log("Intentando iniciar sesión con:", email)
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Error de inicio de sesión:", error)
        setErrorMessage(error.message || "Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
      } else if (data) {
        console.log("Inicio de sesión exitoso, redirigiendo al dashboard...")

        // Redirección directa al dashboard usando router.push y window.location como respaldo
        router.push("/dashboard")

        // Como respaldo, usar redirección directa después de un breve retraso
        setTimeout(() => {
          if (window.location.pathname.includes("/auth/login")) {
            console.log("Redirección con router.push no funcionó, usando window.location")
            window.location.href = "/dashboard"
          }
        }, 500)
      } else {
        setErrorMessage("No se pudo iniciar sesión. Inténtalo de nuevo.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Routinize Fitness</h1>
          <p className="text-muted-foreground mb-8">Inicia sesión para continuar</p>
        </div>

        {/* Login Form */}
        <div className="w-full bg-card rounded-lg border border-border shadow-sm p-6">
          {errorMessage && (
            <Alert className="mb-6 bg-red-50 border-red-200 border">
              <AlertDescription className="text-red-600 font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} id="login-form" className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border-input"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border-input"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B237E] hover:bg-[#1B237E]/90 text-white font-medium py-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            {/* Botón de redirección manual (se añadirá dinámicamente si es necesario) */}
            <div id="manual-redirect-container"></div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" className="font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Script para detectar problemas de redirección */}
          <script dangerouslySetInnerHTML={{
            __html: `
              // Verificar si hay problemas de redirección después de 3 segundos
              setTimeout(function() {
                // Si seguimos en la página de login y hay un usuario en localStorage
                const authData = localStorage.getItem('supabase.auth.token');
                if (authData && window.location.pathname.includes('/auth/login')) {
                  console.log('Detectado problema de redirección. Añadiendo botón manual.');

                  // Crear botón de redirección manual
                  const container = document.getElementById('manual-redirect-container');
                  if (container) {
                    container.innerHTML = '<div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md"><p class="text-yellow-800 mb-2">Parece que hay un problema con la redirección automática.</p><button type="button" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-md" onclick="window.location.href=\'/dashboard\';">Ir al Dashboard manualmente</button></div>';
                  }
                }
              }, 3000);
            `
          }} />
        </div>
      </div>
    </div>
  )
}
