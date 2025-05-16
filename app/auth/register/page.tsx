"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const [name, setName] = useState("Mira Passaquindici")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [emailMarketing, setEmailMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const { data, error } = await signUp(email, password, {
        data: {
          full_name: name,
          email_marketing: emailMarketing,
        },
      })

      if (error) {
        console.error("Error de registro:", error)
        setErrorMessage(error.message || "Error al crear la cuenta. Por favor, inténtalo de nuevo.")
      } else {
        // Mostrar mensaje de éxito y redirigir a la página de confirmación
        router.push("/auth/verify-email")
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setErrorMessage("")

    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error("Error de inicio de sesión con Google:", error)
        setErrorMessage(error.message || "Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.")
      }
      // No necesitamos redireccionar aquí, ya que la redirección la maneja Supabase
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setIsFacebookLoading(true)
    setErrorMessage("")

    try {
      // Implementación pendiente para Facebook
      setTimeout(() => {
        setIsFacebookLoading(false)
        setErrorMessage("Inicio de sesión con Facebook no implementado aún")
      }, 1000)
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
      setIsFacebookLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const registerIllustration = (
    <div className="relative w-full h-48">
      <Image
        src="/images/auth/register-illustration.png"
        alt="Register Illustration"
        width={300}
        height={300}
        className="object-contain"
        priority
        onError={(e) => {
          // Fallback para imagen no encontrada
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = "w-32 h-32 rounded-full bg-[#FDA758]/20 flex items-center justify-center mx-auto";
            fallback.innerHTML = "<span class='text-[#573353] font-medium'>Register Image</span>";
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  )

  const registerFooter = (
    <p className="text-[#573353] text-sm">
      Already have an account? <Link href="/auth/login" className="font-medium text-[#FDA758]">Sign in</Link>
    </p>
  )

  return (
    <div className="min-h-screen bg-[#FFF5EB] flex flex-col items-center justify-center px-4">
      <h1 className="text-[#573353] text-2xl font-bold mb-8">CREATE YOUR ACCOUNT</h1>

      {/* Register Images */}
      <div className="relative w-full max-w-md flex flex-col items-center mb-6">
        <div className="w-40 h-40 rounded-full bg-[#FFDFC8] flex items-center justify-center mb-4">
          <span className="text-[#573353] text-lg">Register Image</span>
        </div>
        <div className="w-40 h-40 rounded-full bg-[#FFDFC8] flex items-center justify-center">
          <span className="text-[#573353] text-lg">Register Image</span>
        </div>
      </div>

      {/* Register Form */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-6">
        {errorMessage && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-6">
          <h2 className="text-[#573353] text-lg font-medium">Create your account</h2>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-6 py-6 rounded-full border border-gray-200 text-[#573353] focus-visible:ring-1 focus-visible:ring-[#573353] focus-visible:ring-offset-0"
            placeholder="Full Name"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-6 rounded-full border border-gray-200 text-[#573353] focus-visible:ring-1 focus-visible:ring-[#573353] focus-visible:ring-offset-0"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6 relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-6 rounded-full border border-gray-200 text-[#573353] focus-visible:ring-1 focus-visible:ring-[#573353] focus-visible:ring-offset-0"
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="text-[#573353] text-sm absolute right-6 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
              className="mt-1 border-[#FDA758] text-[#FDA758] rounded-md"
            />
            <label htmlFor="keep-signed-in" className="text-[#573353] text-sm">
              Keep me signed in
            </label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="email-marketing"
              checked={emailMarketing}
              onCheckedChange={(checked) => setEmailMarketing(checked as boolean)}
              className="mt-1 border-[#FDA758] text-[#FDA758] rounded-md"
            />
            <label htmlFor="email-marketing" className="text-[#573353] text-sm">
              Email me about special pricing and more
            </label>
          </div>
        </div>

        {/* Register Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-full py-6 mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Social Login Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-[#573353] opacity-10"></div>
          <span className="px-4 text-[#573353] text-sm">Or sign up with</span>
          <div className="flex-1 h-px bg-[#573353] opacity-10"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="bg-white hover:bg-gray-50 text-[#573353] rounded-full py-5 border border-gray-200"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FBBB00" d="M5.31891 14.5034L4.4835 17.6221L1.43011 17.6867C0.517594 15.9942 0 14.0577 0 11.9999C0 10.01 0.483938 8.1335 1.34175 6.4812H1.34241L4.06078 6.97958L5.25159 9.68164C5.00236 10.4082 4.86652 11.1882 4.86652 11.9999C4.86661 12.8808 5.02617 13.7247 5.31891 14.5034Z"/>
                  <path fill="#518EF8" d="M23.7902 9.8738C23.928 10.5627 23.9999 11.2742 23.9999 12C23.9999 12.8591 23.9095 13.6971 23.7375 14.5055C23.1533 17.2563 21.6269 19.6582 19.5124 21.358L19.5118 21.3574L16.0878 21.1827L15.6032 18.1576C17.0063 17.3347 18.1028 16.047 18.6822 14.5055H12.2637V9.8738H18.774H23.7902Z"/>
                  <path fill="#28B446" d="M19.5114 21.3574L19.5121 21.358C17.4556 23.011 14.8433 24 11.9999 24C7.4524 24 3.5542 21.4457 1.43011 17.6867L5.31891 14.5034C6.3323 17.2081 8.94408 19.1334 11.9999 19.1334C13.2886 19.1334 14.5034 18.778 15.6028 18.1576L19.5114 21.3574Z"/>
                  <path fill="#F14336" d="M19.6596 2.76262L15.7721 5.94525C14.6295 5.26153 13.3571 4.86656 12 4.86656C8.87213 4.86656 6.21431 6.88017 5.25156 9.68164L1.34175 6.4812H1.34109C3.43402 2.63476 7.36284 0 12 0C14.9117 0 17.5814 1.03716 19.6596 2.76262Z"/>
                </svg>
                Google
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleFacebookSignIn}
            disabled={isFacebookLoading}
            className="bg-white hover:bg-gray-50 text-[#573353] rounded-full py-5 border border-gray-200"
          >
            {isFacebookLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1772EA"/>
                </svg>
                Facebook
              </>
            )}
          </Button>
        </div>

        {/* Login Link */}
        <div className="flex justify-center">
          <p className="text-[#573353] text-sm">
            Already have an account? <Link href="/auth/login" className="font-medium text-[#FDA758]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
