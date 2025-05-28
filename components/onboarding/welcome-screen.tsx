"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6">
      {/* Ilustración principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative w-full h-[250px] mb-6"
      >
        <Image
          src="/images/onboarding/beginner-welcome.svg"
          alt="Personaje inclusivo con ropa deportiva casual y expresión amigable"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
      
      {/* Contenido de texto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center space-y-4 mb-8"
      >
        <h1 className="text-2xl font-bold text-[#573353]">
          ¡Bienvenido a tu viaje fitness!
        </h1>
        <p className="text-[#573353] opacity-80">
          Estamos aquí para acompañarte paso a paso
        </p>
        <p className="text-sm text-[#573353] opacity-70">
          Sin presiones, sin jerga técnica, solo apoyo personalizado
        </p>
      </motion.div>
      
      {/* Botón de acción */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full"
      >
        <Button
          onClick={onNext}
          className="w-full bg-[#FDA758] hover:bg-[#FD9A40] text-white font-medium py-6 rounded-xl shadow-md transition-transform active:scale-95"
        >
          Comenzar mi aventura
        </Button>
      </motion.div>
      
      {/* Elementos decorativos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute top-10 right-10 w-16 h-16 rounded-full bg-[#FDA758] opacity-20 blur-xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-20 left-10 w-20 h-20 rounded-full bg-[#9747FF] opacity-20 blur-xl"
      />
    </div>
  )
}
