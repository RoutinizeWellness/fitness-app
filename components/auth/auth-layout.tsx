"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HelpCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  }

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } }
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div
      className="relative min-h-screen bg-[#FFF3E9] overflow-hidden flex flex-col items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left blob */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#1B237E] rounded-full opacity-20 blur-md" />

        {/* Top right blob */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-[#FEA800] rounded-full opacity-30 blur-md" />

        {/* Bottom left blob */}
        <div className="absolute bottom-20 left-10 w-28 h-28 bg-[#1B237E] rounded-full opacity-20 blur-md" />
      </div>

      {/* Header Icons */}
      <motion.div
        className="absolute top-8 left-0 right-0 flex justify-between px-4 z-20"
        variants={fadeIn}
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
      </motion.div>

      {/* Content Container */}
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={slideUp}
      >
        {/* Title */}
        <h1 className="text-2xl font-medium tracking-tight text-[#573353] mb-6 text-center">
          {title}
        </h1>

        {/* Illustration */}
        {illustration && (
          <motion.div
            className="w-full flex items-center justify-center mb-6"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            {illustration}
          </motion.div>
        )}

        {/* Card Content */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
          variants={staggerChildren}
        >
          {children}
        </motion.div>

        {/* Footer */}
        {footer && (
          <motion.div
            className="mt-6 text-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
