"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { motion } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("jonathansmth@gmail.com")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { error } = await resetPassword(email)

      if (error) {
        console.error("Error al enviar correo de recuperación:", error)
        setErrorMessage(error.message || "Error al enviar correo de recuperación. Por favor, inténtalo de nuevo.")
      } else {
        setSuccessMessage(`Se ha enviado un correo a ${email} con instrucciones para restablecer tu contraseña.`)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Forgot password illustration
  const forgotPasswordIllustration = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-32 h-32 relative">
        <Image
          src="/images/xmlid-30.svg"
          alt="Forgot Password Illustration"
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
              fallback.innerHTML = "<span class='text-[#573353] font-medium'>Recuperar</span>";
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    </div>
  )

  // Footer component
  const forgotPasswordFooter = (
    <p className="text-[#573353] text-sm">
      ¿Recordaste tu contraseña? <Link href="/auth/login" className="font-medium text-[#FDA758]">Iniciar sesión</Link>
    </p>
  )

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      illustration={forgotPasswordIllustration}
      footer={forgotPasswordFooter}
      showBackButton={true}
    >
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg"
          >
            <p className="text-sm">{successMessage}</p>
            <div className="mt-4">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3"
              >
                Volver a inicio de sesión
              </Button>
            </div>
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

        {!successMessage && (
          <>
            <div className="text-center mb-6">
              <p className="text-[#573353] text-sm">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
            </div>

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

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>
              </motion.div>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
