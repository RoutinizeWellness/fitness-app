"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Mail } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail, resendVerificationEmail } = useAuth()

  // Get token from URL
  const token = searchParams?.get('token')
  const type = searchParams?.get('type')
  const userEmail = searchParams?.get('email')

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail)
    }

    // If token is present, verify email automatically
    if (token && type === 'signup') {
      verifyEmailWithToken(token)
    }
  }, [token, type, userEmail])

  const verifyEmailWithToken = async (token: string) => {
    setIsVerifying(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { error } = await verifyEmail(token)

      if (error) {
        console.error("Error al verificar el correo electrónico:", error)
        setErrorMessage(error.message || "Error al verificar el correo electrónico. Por favor, inténtalo de nuevo.")
      } else {
        setSuccessMessage("Tu correo electrónico ha sido verificado correctamente.")
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage("No se ha proporcionado un correo electrónico")
      return
    }

    setIsResending(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { error } = await resendVerificationEmail(email)

      if (error) {
        console.error("Error al reenviar el correo de verificación:", error)
        setErrorMessage(error.message || "Error al reenviar el correo de verificación. Por favor, inténtalo de nuevo.")
      } else {
        setSuccessMessage("Se ha enviado un nuevo correo de verificación a tu dirección de correo electrónico.")
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsResending(false)
    }
  }

  const verifyEmailIllustration = (
    <div className="relative w-full h-48 flex items-center justify-center">
      <div className="bg-[#FFF3E9] rounded-full p-8">
        <Mail className="h-16 w-16 text-[#FDA758]" />
      </div>
    </div>
  )

  const verifyEmailFooter = (
    <p className="text-[#573353] text-sm">
      ¿Ya verificaste tu correo? <Link href="/auth/login" className="font-medium">Iniciar Sesión</Link>
    </p>
  )

  return (
    <AuthLayout 
      title="Verifica tu correo" 
      illustration={verifyEmailIllustration}
      footer={verifyEmailFooter}
      showBackButton={true}
    >
      {/* Verify Email Content */}
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
          {token && isVerifying ? (
            <p className="text-[#573353] text-sm font-medium">
              Verificando tu correo electrónico...
            </p>
          ) : token && successMessage ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-[#573353] text-sm font-medium">
                ¡Tu correo electrónico ha sido verificado correctamente!
              </p>
            </div>
          ) : (
            <p className="text-[#573353] text-sm font-medium">
              Hemos enviado un correo electrónico de verificación a <span className="font-bold">{email || "tu dirección de correo"}</span>. 
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.
            </p>
          )}
        </div>

        {/* Resend Button (only show if not already verified) */}
        {!successMessage && (
          <Button
            onClick={handleResendVerification}
            disabled={isResending || !email}
            className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-[#573353] font-bold rounded-lg py-6 mb-6"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              "Reenviar correo de verificación"
            )}
          </Button>
        )}

        {/* Return to Login Button */}
        {successMessage && (
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-[#573353] font-bold rounded-lg py-6 mb-6"
          >
            Ir a Iniciar Sesión
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
