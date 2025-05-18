"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("jonathansmth@gmail.com")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Error de inicio de sesión:", error)
        setErrorMessage(error.message || "Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
      } else if (data) {
        setSuccessMessage("Inicio de sesión exitoso")
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error("Error de inicio de sesión con Google:", error)
        setErrorMessage(error.message || "Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.")
      } else {
        setSuccessMessage("Iniciando sesión con Google...")
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
    setSuccessMessage("")

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

  // Login illustration component
  const loginIllustration = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-32 h-32 relative">
        <Image
          src="/images/login-illustration-1.svg"
          alt="Login Illustration"
          width={160}
          height={160}
          className="object-contain"
          priority
          onError={(e) => {
            // Fallback para imagen no encontrada
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = "w-32 h-32 rounded-full bg-[#FDA758]/20 flex items-center justify-center";
              fallback.innerHTML = "<span class='text-[#573353] font-medium'>Login</span>";
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      <div className="w-16 h-16 relative">
        <Image
          src="/images/monumental-logo.svg"
          alt="Monumental Logo"
          width={64}
          height={64}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )

  // Login footer component
  const loginFooter = (
    <p className="text-[#573353] text-sm">
      ¿No tienes una cuenta? <Link href="/auth/register" className="font-medium text-[#FDA758]">Regístrate</Link>
    </p>
  )

  // Animation variants for form elements
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      illustration={loginIllustration}
      footer={loginFooter}
      showBackButton={false}
    >
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg"
          >
            <p className="text-sm">{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg"
          >
            <p className="text-sm">{errorMessage}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#573353]">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="text-sm font-medium text-[#573353]">
                Contraseña
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-[#FDA758] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#573353]/50">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-[#573353] focus-visible:ring-2 focus-visible:ring-[#FDA758] focus-visible:ring-offset-0"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#573353]/70 hover:text-[#573353]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember Me Checkbox */}
          <motion.div variants={itemVariants} className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-[#FDA758] text-[#FDA758] rounded-md"
            />
            <label htmlFor="remember-me" className="text-sm text-[#573353]">
              Mantener sesión iniciada
            </label>
          </motion.div>

          {/* Login Button */}
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
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
          </motion.div>
        </form>

        {/* Social Login Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[#573353] opacity-10"></div>
          <span className="px-4 text-[#573353] text-sm">O continúa con</span>
          <div className="flex-1 h-px bg-[#573353] opacity-10"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="bg-white hover:bg-gray-50 text-[#573353] rounded-xl py-3 border border-gray-200 shadow-sm hover:shadow transition-all duration-200"
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
            className="bg-white hover:bg-gray-50 text-[#573353] rounded-xl py-3 border border-gray-200 shadow-sm hover:shadow transition-all duration-200"
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
      </div>
    </AuthLayout>
  )
}
