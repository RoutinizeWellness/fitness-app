"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HelpCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
// Importar componentes de motion fallback
import { MotionFadeIn, MotionSlideUp } from "@/components/ui/motion-fallback"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  showBackButton?: boolean
  showHelpButton?: boolean
  illustration?: ReactNode
  footer?: ReactNode
}

export function AuthLayout({
  children,
  title,
  showBackButton = false,
  showHelpButton = true,
  illustration,
  footer
}: AuthLayoutProps) {
  const router = useRouter()

  // Eliminamos las animaciones para evitar problemas con framer-motion

  return (
    <div
      className="relative min-h-screen bg-[#FFF3E9] overflow-hidden flex flex-col items-center justify-center p-4"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left blob */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#F8D0E0] rounded-full opacity-70 blur-md" />

        {/* Top right blob */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-[#FDA758] rounded-full opacity-70 blur-md" />

        {/* Bottom left blob */}
        <div className="absolute bottom-20 left-10 w-28 h-28 bg-[#9747FF] rounded-full opacity-40 blur-md" />
      </div>

      {/* Header Icons */}
      <div
        className="absolute top-8 left-0 right-0 flex justify-between px-4 z-20"
      >
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#573353] bg-opacity-10 w-10 h-10 flex items-center justify-center"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-[#573353]" />
          </Button>
        )}

        {!showBackButton && <div className="w-10"></div>}

        {showHelpButton && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#573353] bg-opacity-10 w-10 h-10 flex items-center justify-center"
          >
            <HelpCircle className="h-5 w-5 text-[#573353]" />
          </Button>
        )}
      </div>

      {/* Content Container */}
      <div
        className="w-full max-w-md relative z-10"
      >
        {/* Title */}
        <h1 className="text-2xl font-medium tracking-tight text-[#573353] mb-6 text-center">
          {title}
        </h1>

        {/* Illustration */}
        {illustration && (
          <div
            className="w-full flex items-center justify-center mb-6"
          >
            {illustration}
          </div>
        )}

        {/* Card Content */}
        <div
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="mt-6 text-center"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
