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
  const [email, setEmail] = useState("jonathansmth@gmail.com")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Error de inicio de sesión:", error)
        setErrorMessage(error.message || "Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
      } else if (data) {
        console.log("Inicio de sesión exitoso, redirigiendo al dashboard...")
        
        // Usar la página de redirección forzada
        router.push("/force-redirect")
        
        // Como respaldo, usar redirección directa
        setTimeout(() => {
          if (window.location.pathname.includes("/auth/login")) {
            window.location.href = "/dashboard"
          }
        }, 500)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto flex flex-col items-center justify-center px-4 overflow-hidden relative">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 mb-4">
          <Image
            src="/images/monumental-logo.svg"
            alt="Monumental Logo"
            width={64}
            height={64}
            priority
          />
        </div>
        <h1 className="text-[#573353] text-2xl font-bold text-center">WELCOME TO MONUMENTAL HABITS</h1>
      </div>

      {/* Login Images */}
      <div className="relative w-full max-w-md flex flex-col items-center mb-6">
        <div className="w-40 h-40 mb-4 relative">
          <Image
            src="/images/login-illustration-1.svg"
            alt="Login Illustration"
            width={160}
            height={160}
            priority
          />
        </div>
        <div className="w-40 h-40 relative">
          <Image
            src="/images/login-illustration-2.svg"
            alt="Login Illustration"
            width={160}
            height={160}
            priority
          />
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-6">
        {errorMessage && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} id="login-form">
          {/* Email Input */}
          <div className="mb-4">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-6 rounded-full border border-gray-200 text-[#573353] focus-visible:ring-1 focus-visible:ring-[#573353] focus-visible:ring-offset-0"
              placeholder="jonathansmth@gmail.com"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-6 rounded-full border border-gray-200 text-[#573353] focus-visible:ring-1 focus-visible:ring-[#573353] focus-visible:ring-offset-0"
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-full py-6 mb-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in with email"
            )}
          </Button>

          {/* Botón de redirección manual (se añadirá dinámicamente si es necesario) */}
          <div id="manual-redirect-container"></div>
        </form>

        {/* Sign Up Link */}
        <div className="flex justify-center">
          <p className="text-[#573353] text-sm">
            Or sign up <Link href="/auth/register" className="font-medium text-[#FDA758]">here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
