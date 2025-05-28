"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MissionBadge } from "./mission-badge"
import { OnboardingMission } from "@/lib/types/beginner-onboarding"
import { ArrowRight, Check, Plus, Camera, Utensils } from "lucide-react"

interface NutritionScreenProps {
  onNext: () => void
  onMissionComplete: (mission: OnboardingMission) => void
}

export function NutritionScreen({ onNext, onMissionComplete }: NutritionScreenProps) {
  const [showMealLog, setShowMealLog] = useState(false)
  const [mealLogged, setMealLogged] = useState(false)
  
  // Manejar la visualización del registro de comida
  const handleShowMealLog = () => {
    setShowMealLog(true)
  }
  
  // Manejar el registro de comida
  const handleLogMeal = () => {
    setMealLogged(true)
    onMissionComplete('log_meal')
    
    // Avanzar automáticamente después de 2 segundos
    setTimeout(() => {
      onNext()
    }, 2000)
  }
  
  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6">
      {!showMealLog ? (
        // Pantalla principal de nutrición
        <>
          {/* Ilustración */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-[250px] mb-6"
          >
            <Image
              src="/images/onboarding/beginner-nutrition.svg"
              alt="Plato dividido en secciones coloridas"
              fill
              className="object-contain"
              priority
            />
            
            {/* Etiquetas de secciones del plato */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-1/4 right-1/4 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
            >
              Vegetales 50%
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-1/3 left-1/4 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium"
            >
              Proteínas 25%
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute bottom-1/4 right-1/3 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
            >
              Carbohidratos 25%
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
              Alimentación simple y efectiva
            </h1>
            <p className="text-[#573353] opacity-80">
              Sin dietas restrictivas ni complicaciones
            </p>
            <p className="text-sm text-[#573353] opacity-70">
              Aprenderás paso a paso, sin necesidad de contar calorías al principio
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
              mission="log_meal"
              text="Registra una comida para desbloquear consejos personalizados y tu insignia de nutrición"
              completed={mealLogged}
            />
            
            <Button
              onClick={handleShowMealLog}
              className="w-full bg-[#FDA758] hover:bg-[#FD9A40] text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Registrar mi primera comida
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </>
      ) : (
        // Pantalla de registro de comida
        <>
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full text-center mb-4"
          >
            <h2 className="text-xl font-bold text-[#573353]">
              Registra tu comida
            </h2>
            <p className="text-sm text-[#573353] opacity-70">
              Forma simple y rápida
            </p>
          </motion.div>
          
          {/* Formulario de registro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex-1 overflow-auto"
          >
            <div className="space-y-4">
              {/* Tipo de comida */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <label className="block text-sm font-medium text-[#573353] mb-2">
                  Tipo de comida
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm">Desayuno</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm">Almuerzo</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm">Cena</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm">Snack</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Método de registro */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <label className="block text-sm font-medium text-[#573353] mb-2">
                  Método de registro
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <span className="text-sm">Comida rápida</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <Camera className="h-5 w-5" />
                    </div>
                    <span className="text-sm">Foto</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Comida seleccionada */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#573353]">
                    Comida seleccionada
                  </label>
                  <Button size="sm" variant="ghost" className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Añadir
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                    <Image
                      src="/images/onboarding/toast.svg"
                      alt="Tostada con aguacate"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#573353]">Tostada con aguacate</h3>
                    <p className="text-xs text-[#573353] opacity-70">~250 kcal • Proteína: 8g • Carbs: 30g • Grasas: 12g</p>
                  </div>
                  <Check className="ml-auto h-5 w-5 text-green-500" />
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
              onClick={handleLogMeal}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Guardar comida
            </Button>
            
            <Button
              onClick={() => setShowMealLog(false)}
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
