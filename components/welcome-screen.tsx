"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface WelcomeScreenProps {
  onComplete?: () => void
  duration?: number // duración en milisegundos
}

export function WelcomeScreen({
  onComplete,
  duration = 20000 // Aumentado a 20 segundos para dar más tiempo a visualizar
}: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0)
  const [showTagline, setShowTagline] = useState(false)

  useEffect(() => {
    // Mostrar el tagline después de 1 segundo
    const taglineTimer = setTimeout(() => {
      setShowTagline(true)
    }, 1000)

    // Configurar el intervalo para la barra de progreso
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1
        if (newProgress >= 100) {
          clearInterval(interval)
          if (onComplete) {
            setTimeout(() => {
              onComplete()
            }, 3000) // Retraso más largo después de completar la barra
          }
          return 100
        }
        return newProgress
      })
    }, duration / 100)

    return () => {
      clearInterval(interval)
      clearTimeout(taglineTimer)
    }
  }, [onComplete, duration])

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
      {/* Fondo con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-blue-300 blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-purple-300 blur-3xl"></div>
        </div>
      </div>

      {/* Logo centrado con animación mejorada */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-32 h-32 mb-6">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
            <circle cx="60" cy="60" r="50" fill="white" fillOpacity="0.1" />
            <path d="M60 20C38.1 20 20 38.1 20 60C20 81.9 38.1 100 60 100C81.9 100 100 81.9 100 60C100 38.1 81.9 20 60 20ZM60 90C43.5 90 30 76.5 30 60C30 43.5 43.5 30 60 30C76.5 30 90 43.5 90 60C90 76.5 76.5 90 60 90Z" fill="white"/>
            <path d="M60 40C49.5 40 40 49.5 40 60C40 70.5 49.5 80 60 80C70.5 80 80 70.5 80 60" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M60 50C54.5 50 50 54.5 50 60C50 65.5 54.5 70 60 70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M80 60C80 54.5 75.5 50 70 50" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-white text-4xl font-bold mb-2 tracking-wide drop-shadow-lg">Routinize</h1>

        {/* Tagline con animación de aparición */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showTagline ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="text-white/80 text-lg text-center max-w-xs px-4"
        >
          Tu compañero holístico para el bienestar y fitness
        </motion.p>
      </motion.div>

      {/* Barra de progreso en la parte inferior con animación mejorada */}
      <div className="absolute bottom-16 left-0 right-0 px-12 z-10">
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Información de la app en la parte inferior */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 z-10">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2 backdrop-blur-sm">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <span className="text-white/80 text-sm font-medium">Routinize</span>
        </div>
        <div className="text-white/80 text-sm font-medium backdrop-blur-sm px-3 py-1 rounded-full bg-white/10">
          Wellness & Fitness
        </div>
      </div>
    </div>
  )
}
