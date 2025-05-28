"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Dumbbell, Utensils, Moon, Zap, Brain } from "lucide-react"
import { MissionBadge } from "./mission-badge"
import { OnboardingMission } from "@/lib/types/beginner-onboarding"

interface NavigationScreenProps {
  onNext: () => void
  onMissionComplete: (mission: OnboardingMission) => void
  sectionsVisited: number
  onSectionVisit?: (count: number) => void
}

export function NavigationScreen({
  onNext,
  onMissionComplete,
  sectionsVisited = 0,
  onSectionVisit
}: NavigationScreenProps) {
  const [visitedSections, setVisitedSections] = useState(sectionsVisited)
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [sectionStates, setSectionStates] = useState<boolean[]>([false, false, false, false, false])
  const missionCompletedRef = useRef(false)

  console.log('🗺️ NavigationScreen - Render:', {
    visitedSections,
    selectedSection,
    sectionsVisited,
    sectionStates,
    shouldShowButton: visitedSections >= 5,
    missionCompleted: missionCompletedRef.current
  })

  // Actualizar el estado cuando cambia la prop sectionsVisited
  useEffect(() => {
    setVisitedSections(sectionsVisited)
  }, [sectionsVisited])

  // Verificar si se han visitado todas las secciones (solo una vez)
  useEffect(() => {
    console.log('🔄 NavigationScreen useEffect - Verificando progreso:', {
      visitedSections,
      missionCompleted: missionCompletedRef.current,
      shouldComplete: visitedSections >= 5 && !missionCompletedRef.current
    })

    if (visitedSections >= 5 && !missionCompletedRef.current) {
      console.log('🎯 NavigationScreen - Completando misión explore_sections')
      missionCompletedRef.current = true
      onMissionComplete('explore_sections')

      // Avanzar automáticamente después de 3 segundos (aumentado para dar más tiempo)
      console.log('⏰ NavigationScreen - Configurando timer para navegación automática en 3 segundos')
      const timer = setTimeout(() => {
        console.log('🚀 NavigationScreen - Ejecutando navegación automática')
        onNext()
      }, 3000)

      return () => {
        console.log('🧹 NavigationScreen - Limpiando timer de navegación')
        clearTimeout(timer)
      }
    }
  }, [visitedSections, onMissionComplete, onNext])

  // Simular visita a una sección (lógica simplificada y más confiable)
  const handleSectionClick = useCallback((index: number) => {
    console.log('🖱️ NavigationScreen - Click en sección:', index)
    console.log('📊 Estado actual:', {
      selectedSection,
      visitedSections,
      sectionStates,
      isAlreadyVisited: sectionStates[index]
    })

    // Verificar si ya hay una sección seleccionada (evitar clicks múltiples)
    if (selectedSection !== null) {
      console.log('⚠️ Ya hay una sección seleccionada, ignorando click')
      return
    }

    // Verificar si la sección ya fue visitada
    if (sectionStates[index]) {
      console.log('⚠️ Sección ya visitada anteriormente:', index)
      return
    }

    setSelectedSection(index)

    // Simular tiempo de visualización más corto para mejor UX
    setTimeout(() => {
      console.log('⏰ Timeout completado para sección:', index)
      setSelectedSection(null)

      // Marcar sección como visitada
      console.log('✅ NavigationScreen - Nueva sección visitada:', index)
      setSectionStates(prev => {
        const newStates = [...prev]
        newStates[index] = true
        console.log('📝 Nuevo estado de secciones:', newStates)
        return newStates
      })

      const newCount = visitedSections + 1
      setVisitedSections(newCount)

      // Notificar al componente padre
      if (onSectionVisit) {
        console.log('📡 Notificando al padre:', newCount)
        onSectionVisit(newCount)
      }

      console.log('📊 NavigationScreen - Total secciones visitadas:', newCount)
    }, 1000) // Reducido de 1500ms a 1000ms
  }, [sectionStates, visitedSections, onSectionVisit, selectedSection])

  // Iconos de secciones (memoizado para evitar recreación)
  const sectionIcons = useMemo(() => [
    { icon: <Dumbbell className="h-6 w-6" />, name: "Entrenamiento" },
    { icon: <Utensils className="h-6 w-6" />, name: "Nutrición" },
    { icon: <Moon className="h-6 w-6" />, name: "Sueño" },
    { icon: <Zap className="h-6 w-6" />, name: "Productividad" },
    { icon: <Brain className="h-6 w-6" />, name: "Bienestar" }
  ], [])

  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6">
      {/* Título y descripción */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center space-y-2 mb-6"
      >
        <h1 className="text-2xl font-bold text-[#573353]">
          Descubre todo lo que puedes hacer
        </h1>
        <p className="text-[#573353] opacity-80">
          Desliza para explorar cada sección
        </p>
      </motion.div>

      {/* Mapa de la app */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative w-full h-[300px] mb-6 bg-white/50 rounded-xl p-4 shadow-sm"
      >
        {/* Imagen de fondo del mapa */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <Image
            src="/images/onboarding/app-map-bg.svg"
            alt="Mapa de la aplicación"
            fill
            className="object-cover opacity-10"
          />
        </div>

        {/* Secciones de la app */}
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex justify-between">
            {/* Sección 1 */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-[45%] h-24 rounded-lg flex flex-col items-center justify-center gap-2
                ${selectedSection === 0
                  ? 'bg-blue-100 shadow-md'
                  : sectionStates[0]
                    ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                    : 'bg-white/80 shadow-sm'
                }
                transition-all duration-300 cursor-pointer
              `}
              onClick={() => handleSectionClick(0)}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {sectionIcons[0].icon}
              </div>
              <span className="text-sm font-medium text-[#573353]">{sectionIcons[0].name}</span>
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FDA758] flex items-center justify-center text-white font-bold text-xs">
                1
              </div>
              {sectionStates[0] && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </motion.div>

            {/* Sección 2 */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-[45%] h-24 rounded-lg flex flex-col items-center justify-center gap-2
                ${selectedSection === 1
                  ? 'bg-green-100 shadow-md'
                  : sectionStates[1]
                    ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                    : 'bg-white/80 shadow-sm'
                }
                transition-all duration-300 cursor-pointer
              `}
              onClick={() => handleSectionClick(1)}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                {sectionIcons[1].icon}
              </div>
              <span className="text-sm font-medium text-[#573353]">{sectionIcons[1].name}</span>
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FDA758] flex items-center justify-center text-white font-bold text-xs">
                2
              </div>
              {sectionStates[1] && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex justify-center">
            {/* Sección 3 */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-[45%] h-24 rounded-lg flex flex-col items-center justify-center gap-2
                ${selectedSection === 2
                  ? 'bg-purple-100 shadow-md'
                  : sectionStates[2]
                    ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                    : 'bg-white/80 shadow-sm'
                }
                transition-all duration-300 cursor-pointer
              `}
              onClick={() => handleSectionClick(2)}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                {sectionIcons[2].icon}
              </div>
              <span className="text-sm font-medium text-[#573353]">{sectionIcons[2].name}</span>
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FDA758] flex items-center justify-center text-white font-bold text-xs">
                3
              </div>
              {sectionStates[2] && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex justify-between">
            {/* Sección 4 */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-[45%] h-24 rounded-lg flex flex-col items-center justify-center gap-2
                ${selectedSection === 3
                  ? 'bg-amber-100 shadow-md'
                  : sectionStates[3]
                    ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                    : 'bg-white/80 shadow-sm'
                }
                transition-all duration-300 cursor-pointer
              `}
              onClick={() => handleSectionClick(3)}
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                {sectionIcons[3].icon}
              </div>
              <span className="text-sm font-medium text-[#573353]">{sectionIcons[3].name}</span>
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FDA758] flex items-center justify-center text-white font-bold text-xs">
                4
              </div>
              {sectionStates[3] && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </motion.div>

            {/* Sección 5 */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-[45%] h-24 rounded-lg flex flex-col items-center justify-center gap-2
                ${selectedSection === 4
                  ? 'bg-indigo-100 shadow-md'
                  : sectionStates[4]
                    ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                    : 'bg-white/80 shadow-sm'
                }
                transition-all duration-300 cursor-pointer
              `}
              onClick={() => handleSectionClick(4)}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                {sectionIcons[4].icon}
              </div>
              <span className="text-sm font-medium text-[#573353]">{sectionIcons[4].name}</span>
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FDA758] flex items-center justify-center text-white font-bold text-xs">
                5
              </div>
              {sectionStates[4] && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Flechas indicadoras */}
        {selectedSection === null && (
          <>
            <motion.div
              animate={{
                x: [0, 5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5
              }}
              className="absolute top-1/4 right-1/4 text-[#FDA758]"
            >
              ↓
            </motion.div>
            <motion.div
              animate={{
                x: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: 0.5
              }}
              className="absolute bottom-1/4 left-1/4 text-[#FDA758]"
            >
              ↓
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Misión gamificada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full"
      >
        <MissionBadge
          mission="explore_sections"
          text="Explora cada sección principal para ganar tu primera medalla de descubrimiento"
          completed={visitedSections >= 5}
          progress={visitedSections}
          total={5}
          className="mb-4"
        />

        {/* Indicador de progreso */}
        <div className="flex items-center justify-between text-xs text-[#573353] opacity-70 mb-4">
          <span>Secciones visitadas</span>
          <span>{visitedSections}/5</span>
        </div>

        {/* Botón manual de continuar (aparece cuando todas las secciones están visitadas) */}
        {visitedSections >= 5 && (
          <div className="space-y-3">
            <div className="text-center text-green-600 font-semibold">
              ¡Todas las secciones completadas!
            </div>

            <button
              onClick={() => {
                console.log('🖱️ NavigationScreen - Click manual en botón Continuar')
                onNext()
              }}
              className="w-full py-3 px-6 bg-[#FDA758] text-white font-semibold rounded-lg shadow-md hover:bg-[#E8965A] transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Continuar al Entrenamiento</span>
              <span className="animate-pulse">→</span>
            </button>
          </div>
        )}

        {/* Botón de debug - siempre visible para verificar renderizado */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-xs text-gray-600 mb-2">
            DEBUG: visitedSections = {visitedSections}, shouldShow = {visitedSections >= 5 ? 'true' : 'false'}
          </div>
          <button
            onClick={() => {
              console.log('🧪 DEBUG - Forzando navegación manual');
              onNext();
            }}
            className="w-full py-2 px-4 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            DEBUG: Forzar Navegación
          </button>
        </div>
      </motion.div>
    </div>
  )
}
