"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MissionBadge } from "./mission-badge"
import { OnboardingMission } from "@/lib/types/beginner-onboarding"
import { ArrowRight, Check, Calendar, Target, Award } from "lucide-react"

interface TrackingScreenProps {
  onNext: () => void
  onMissionComplete: (mission: OnboardingMission) => void
}

export function TrackingScreen({ onNext, onMissionComplete }: TrackingScreenProps) {
  const [showGoalSetting, setShowGoalSetting] = useState(false)
  const [goalSet, setGoalSet] = useState(false)
  
  // Manejar la visualización del establecimiento de objetivos
  const handleShowGoalSetting = () => {
    setShowGoalSetting(true)
  }
  
  // Manejar el establecimiento de objetivos
  const handleSetGoal = () => {
    setGoalSet(true)
    onMissionComplete('set_goal')
    
    // Avanzar automáticamente después de 2 segundos
    setTimeout(() => {
      onNext()
    }, 2000)
  }
  
  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6">
      {!showGoalSetting ? (
        // Pantalla principal de seguimiento
        <>
          {/* Ilustración */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-[250px] mb-6"
          >
            <Image
              src="/images/onboarding/beginner-tracking.svg"
              alt="Calendario con marcas de progreso"
              fill
              className="object-contain"
              priority
            />
            
            {/* Elementos decorativos */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-1/4 right-1/4 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"
            >
              <Check className="h-4 w-4" />
            </motion.div>
            
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-1/3 left-1/4 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"
            >
              <Award className="h-4 w-4" />
            </motion.div>
            
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute bottom-1/4 right-1/3 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
            >
              <Calendar className="h-4 w-4" />
            </motion.div>
          </motion.div>
          
          {/* Contenido de texto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center space-y-4 mb-8"
          >
            <h1 className="text-2xl font-bold text-[#573353]">
              Celebra cada pequeño logro en tu camino
            </h1>
            <p className="text-[#573353] opacity-80">
              Incluso 5 minutos de actividad cuentan como una victoria
            </p>
            <p className="text-sm text-[#573353] opacity-70">
              Establece objetivos realistas y observa tu progreso día a día
            </p>
          </motion.div>
          
          {/* Misión y botón */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full space-y-4"
          >
            <MissionBadge
              mission="set_goal"
              text="Establece tu primer objetivo semanal realista para desbloquear tu planificador personal"
              completed={goalSet}
            />
            
            <Button
              onClick={handleShowGoalSetting}
              className="w-full bg-[#FDA758] hover:bg-[#FD9A40] text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Crear mi primer objetivo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </>
      ) : (
        // Pantalla de establecimiento de objetivos
        <>
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full text-center mb-4"
          >
            <h2 className="text-xl font-bold text-[#573353]">
              Mi primer objetivo
            </h2>
            <p className="text-sm text-[#573353] opacity-70">
              Comienza con algo alcanzable
            </p>
          </motion.div>
          
          {/* Formulario de objetivos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex-1 overflow-auto"
          >
            <div className="space-y-4">
              {/* Tipo de objetivo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <label className="block text-sm font-medium text-[#573353] mb-2">
                  Tipo de objetivo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm">Actividad</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm">Nutrición</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm">Sueño</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm">Bienestar</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Objetivo específico */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <label className="block text-sm font-medium text-[#573353] mb-2">
                  Objetivo específico
                </label>
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-[#573353]">Completar 2 entrenamientos</h3>
                      <p className="text-xs text-[#573353] opacity-70">Esta semana • Principiante</p>
                    </div>
                    <Check className="ml-auto h-5 w-5 text-green-500" />
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-[#573353]">Caminar 20 minutos diarios</h3>
                      <p className="text-xs text-[#573353] opacity-70">Esta semana • Principiante</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-[#573353]">Completar 3 mini-rutinas</h3>
                      <p className="text-xs text-[#573353] opacity-70">Esta semana • Principiante</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Recordatorios */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-[#573353]">
                    Recordatorios
                  </label>
                  <div className="w-10 h-6 bg-blue-100 rounded-full relative cursor-pointer">
                    <div className="absolute w-5 h-5 bg-blue-600 rounded-full top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </div>
                <p className="text-xs text-[#573353] opacity-70 mt-1">
                  Te enviaremos recordatorios amigables para ayudarte a alcanzar tu objetivo
                </p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="w-full mt-6 space-y-3"
          >
            <Button
              onClick={handleSetGoal}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Establecer objetivo
            </Button>
            
            <Button
              onClick={() => setShowGoalSetting(false)}
              variant="outline"
              className="w-full font-medium py-3 rounded-xl"
            >
              Volver
            </Button>
          </motion.div>
        </>
      )}
    </div>
  )
}
