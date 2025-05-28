"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MissionBadge } from "./mission-badge"
import { OnboardingMission } from "@/lib/types/beginner-onboarding"
import { ArrowRight, Play, Dumbbell } from "lucide-react"

interface TrainingScreenProps {
  onNext: () => void
  onMissionComplete: (mission: OnboardingMission) => void
}

export function TrainingScreen({ onNext, onMissionComplete }: TrainingScreenProps) {
  const [showMiniRoutine, setShowMiniRoutine] = useState(false)
  const [routineCompleted, setRoutineCompleted] = useState(false)
  
  // Manejar la visualización de la mini rutina
  const handleShowRoutine = () => {
    setShowMiniRoutine(true)
  }
  
  // Manejar la finalización de la mini rutina
  const handleCompleteRoutine = () => {
    setRoutineCompleted(true)
    onMissionComplete('complete_mini_routine')
    
    // Avanzar automáticamente después de 2 segundos
    setTimeout(() => {
      onNext()
    }, 2000)
  }
  
  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6">
      {!showMiniRoutine ? (
        // Pantalla principal de entrenamiento
        <>
          {/* Ilustración */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-[250px] mb-6"
          >
            <Image
              src="/images/onboarding/beginner-training.svg"
              alt="Personaje realizando una sentadilla básica"
              fill
              className="object-contain"
              priority
            />
            
            {/* Indicadores visuales de postura */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center"
            >
              <span className="text-xs text-green-500">✓</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-1/3 left-1/3 w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center"
            >
              <span className="text-xs text-green-500">✓</span>
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
              Entrenamientos diseñados especialmente para ti
            </h1>
            <p className="text-[#573353] opacity-80">
              Sin experiencia previa necesaria
            </p>
            <p className="text-sm text-[#573353] opacity-70">
              Comenzaremos con lo básico y avanzaremos a tu ritmo
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
              mission="complete_mini_routine"
              text="Completa tu primera mini-rutina de 5 minutos para desbloquear tu insignia de iniciación"
              completed={routineCompleted}
            />
            
            <Button
              onClick={handleShowRoutine}
              className="w-full bg-[#FDA758] hover:bg-[#FD9A40] text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Ver mi primera rutina
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </>
      ) : (
        // Mini rutina de 5 minutos
        <>
          {/* Encabezado de la rutina */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full text-center mb-4"
          >
            <h2 className="text-xl font-bold text-[#573353]">
              Tu Primera Mini-Rutina
            </h2>
            <p className="text-sm text-[#573353] opacity-70">
              5 minutos para sentirte mejor
            </p>
          </motion.div>
          
          {/* Lista de ejercicios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex-1 overflow-auto"
          >
            <div className="space-y-4">
              {/* Ejercicio 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#573353]">Marcha en el sitio</h3>
                    <p className="text-xs text-[#573353] opacity-70">60 segundos • Calentamiento</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              
              {/* Ejercicio 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#573353]">Sentadillas asistidas</h3>
                    <p className="text-xs text-[#573353] opacity-70">10 repeticiones • Fuerza</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              
              {/* Ejercicio 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#573353]">Flexiones en pared</h3>
                    <p className="text-xs text-[#573353] opacity-70">8 repeticiones • Fuerza</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              
              {/* Ejercicio 4 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#573353]">Estiramiento básico</h3>
                    <p className="text-xs text-[#573353] opacity-70">60 segundos • Enfriamiento</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
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
              onClick={handleCompleteRoutine}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Completar rutina
            </Button>
            
            <Button
              onClick={() => setShowMiniRoutine(false)}
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
