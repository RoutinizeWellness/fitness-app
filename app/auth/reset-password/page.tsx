"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()

  // Get token from URL
  const token = searchParams?.get('token')
  
  useEffect(() => {
    if (!token) {
      setErrorMessage("Token de restablecimiento no válido o expirado. Por favor, solicita un nuevo enlace de restablecimiento.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      return
    }
    
    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres")
      return
    }
    
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      if (!token) {
        throw new Error("Token de restablecimiento no válido")
      }
      
      const { error } = await updatePassword(password, token)

      if (error) {
        console.error("Error al restablecer la contraseña:", error)
        setErrorMessage(error.message || "Error al restablecer la contraseña. Por favor, inténtalo de nuevo.")
      } else {
        setSuccessMessage("Tu contraseña ha sido restablecida correctamente.")
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const resetPasswordIllustration = (
    <div className="relative w-full h-48">
      <Image 
        src="/images/auth/reset-password-illustration.svg"
        alt="Reset Password Illustration"
        width={434}
        height={300}
        className="object-contain"
      />
    </div>
  )

  const resetPasswordFooter = (
    <p className="text-[#573353] text-sm">
      ¿Recuerdas tu contraseña? <Link href="/auth/login" className="font-medium">Iniciar Sesión</Link>
    </p>
  )

  return (
    <AuthLayout 
      title="Restablecer Contraseña" 
      illustration={resetPasswordIllustration}
      footer={resetPasswordFooter}
      showBackButton={true}
    >
      {/* Reset Password Form */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pt-8 pb-24">
        {errorMessage && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 text-center">
          <p className="text-[#573353] text-sm font-medium">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <div className="bg-[#FFF6ED] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <svg className="w-5 h-5 text-[#573353] opacity-50 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
              </svg>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-none bg-transparent text-[#573353] opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
              />
            </div>
            <button 
              type="button" 
              onClick={toggleShowPassword}
              className="text-[#573353] text-sm underline"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <div className="bg-[#FFF6ED] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <svg className="w-5 h-5 text-[#573353] opacity-50 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
              </svg>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-none bg-transparent text-[#573353] opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
              />
            </div>
            <button 
              type="button" 
              onClick={toggleShowConfirmPassword}
              className="text-[#573353] text-sm underline"
            >
              {showConfirmPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !token}
          className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-[#573353] font-bold rounded-lg py-6 mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restableciendo...
            </>
          ) : (
            "Restablecer Contraseña"
          )}
        </Button>
      </div>
    </AuthLayout>
  )
}
