"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import {
  BeginnerOnboardingState,
  OnboardingScreen,
  OnboardingMission,
  QuestionnaireData
} from "@/lib/types/beginner-onboarding"
import {
  initializeBeginnerProfile,
  updateBeginnerProfile,
  completeMission,
  completeOnboarding
} from "@/lib/services/beginner-profile-service"
import { WelcomeScreen } from "./welcome-screen"
import { NavigationScreen } from "./navigation-screen"
import { TrainingScreen } from "./training-screen"
import { NutritionScreen } from "./nutrition-screen"
import { TrackingScreen } from "./tracking-screen"
import { BeginnerQuestionnaire } from "./beginner-questionnaire"
import { supabase } from "@/lib/supabase-client"
import { initializeCookieChecker } from "@/lib/utils/cookie-cleaner"

interface FitnessBeginnerOnboardingProps {
  redirectPath?: string
}

export function FitnessBeginnerOnboarding({ redirectPath = "/dashboard" }: FitnessBeginnerOnboardingProps) {
  console.log('🎯 FitnessBeginnerOnboarding - Componente renderizado');

  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<BeginnerOnboardingState>({
    currentScreen: "welcome",
    profile: {},
    sectionsVisited: 0,
    missionsCompleted: []
  })

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        console.log('🔄 Obteniendo usuario para onboarding...')

        // Verificar y limpiar cookies corruptas
        initializeCookieChecker()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('❌ Error al obtener usuario:', userError)
          throw new Error(`Error de autenticación: ${userError.message}`)
        }

        if (user) {
          console.log('✅ Usuario obtenido:', user.id)
          setUserId(user.id)

          // Inicializar el perfil de principiante
          console.log('🔄 Inicializando perfil de principiante...')
          const profile = await initializeBeginnerProfile(user.id)

          if (profile) {
            console.log('✅ Perfil inicializado correctamente:', profile)
            setState(prev => ({
              ...prev,
              profile,
              missionsCompleted: profile.missions_completed || []
            }))
          } else {
            console.warn('⚠️ No se pudo inicializar el perfil, pero continuando...')
            // Continuar sin perfil, se creará durante el proceso
          }
        } else {
          console.log('❌ No hay usuario autenticado, redirigiendo a login')
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("💥 Error al obtener el usuario:", error)

        let errorMessage = "No se pudo cargar la información del usuario"
        if (error instanceof Error) {
          errorMessage = error.message
        }

        toast({
          title: "Error de inicialización",
          description: errorMessage,
          variant: "destructive"
        })

        // En caso de error, redirigir a login después de un momento
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, toast])

  // Manejar la navegación entre pantallas
  const handleNavigate = useCallback((screen: OnboardingScreen) => {
    console.log('🧭 handleNavigate - Navegando a pantalla:', screen)
    console.log('📊 handleNavigate - Estado actual antes del cambio:', state.currentScreen)
    setState(prev => {
      console.log('📝 handleNavigate - Actualizando estado de:', prev.currentScreen, 'a:', screen)
      return {
        ...prev,
        currentScreen: screen
      }
    })
  }, [state.currentScreen])

  // Manejar la finalización de una misión
  const handleMissionComplete = useCallback(async (mission: OnboardingMission) => {
    if (!userId) {
      console.warn('⚠️ No hay userId disponible para completar la misión');
      return;
    }

    try {
      console.log('🎯 Iniciando completar misión:', { mission, userId });

      // Actualizar el estado local primero
      setState(prev => ({
        ...prev,
        missionsCompleted: [...prev.missionsCompleted, mission]
      }));

      // Actualizar en la base de datos
      console.log('📡 Enviando misión a la base de datos...');
      const updatedProfile = await completeMission(userId, mission);

      if (!updatedProfile) {
        throw new Error('No se recibió el perfil actualizado de la base de datos');
      }

      console.log('✅ Misión completada exitosamente en la base de datos');

      // Mostrar notificación
      toast({
        title: "¡Misión completada!",
        description: "Has desbloqueado una nueva insignia",
        variant: "default"
      });
    } catch (error) {
      console.error("💥 Error al completar la misión:", error);

      // Revertir el estado local si hay error
      setState(prev => ({
        ...prev,
        missionsCompleted: prev.missionsCompleted.filter(m => m !== mission)
      }));

      // Mostrar error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al completar misión",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [userId, toast])

  // Manejar la finalización del cuestionario
  const handleQuestionnaireComplete = useCallback(async (data: QuestionnaireData) => {
    if (!userId) return

    try {
      // Actualizar el perfil con los datos del cuestionario
      await updateBeginnerProfile({
        user_id: userId,
        motivation: data.motivation,
        available_time: data.availableTime,
        physical_limitations: data.physicalLimitations,
        exercise_location: data.exerciseLocation,
        basic_equipment: data.basicEquipment,
        initial_feeling: data.initialFeeling
      })

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          motivation: data.motivation,
          available_time: data.availableTime,
          physical_limitations: data.physicalLimitations,
          exercise_location: data.exerciseLocation,
          basic_equipment: data.basicEquipment,
          initial_feeling: data.initialFeeling
        },
        currentScreen: "complete"
      }))

      // Completar el onboarding
      await completeOnboarding(userId)

      // Mostrar notificación
      toast({
        title: "¡Configuración completada!",
        description: "Tu perfil ha sido personalizado correctamente",
        variant: "default"
      })

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push(redirectPath)
      }, 2000)
    } catch (error) {
      console.error("Error al completar el cuestionario:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      })
    }
  }, [userId, router, redirectPath, toast])

  // Manejar la visita a una sección
  const handleSectionVisit = useCallback((count: number) => {
    console.log('📊 Actualizando secciones visitadas en componente padre:', count)
    setState(prev => ({
      ...prev,
      sectionsVisited: count
    }))
  }, [])

  // Renderizar la pantalla actual
  const renderCurrentScreen = () => {
    console.log('🎬 renderCurrentScreen - Renderizando pantalla:', state.currentScreen)
    switch (state.currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen
            onNext={() => handleNavigate("navigation")}
          />
        )
      case "navigation":
        return (
          <NavigationScreen
            onNext={() => handleNavigate("training")}
            onMissionComplete={handleMissionComplete}
            sectionsVisited={state.sectionsVisited}
            onSectionVisit={handleSectionVisit}
          />
        )
      case "training":
        return (
          <TrainingScreen
            onNext={() => handleNavigate("nutrition")}
            onMissionComplete={handleMissionComplete}
          />
        )
      case "nutrition":
        return (
          <NutritionScreen
            onNext={() => handleNavigate("tracking")}
            onMissionComplete={handleMissionComplete}
          />
        )
      case "tracking":
        return (
          <TrackingScreen
            onNext={() => handleNavigate("questionnaire")}
            onMissionComplete={handleMissionComplete}
          />
        )
      case "questionnaire":
        return (
          <BeginnerQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onBack={() => handleNavigate("tracking")}
          />
        )
      case "complete":
        return (
          <div className="flex flex-col items-center justify-center h-full py-8 px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl"
              >
                ✓
              </motion.div>
            </motion.div>
            <h1 className="text-2xl font-bold text-[#573353] mb-4">
              ¡Todo listo!
            </h1>
            <p className="text-[#573353] opacity-80 mb-2">
              Tu perfil ha sido configurado correctamente
            </p>
            <p className="text-sm text-[#573353] opacity-70">
              Redirigiendo al dashboard...
            </p>
          </div>
        )
      default:
        return null
    }
  }

  // Mostrar pantalla de carga mientras se inicializa
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFF3E9]">
        <div className="w-12 h-12 rounded-full border-4 border-[#FDA758] border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-[#FFF3E9] flex flex-col">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#F8D0E0] rounded-full opacity-70 blur-md"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-[#FDA758] rounded-full opacity-70 blur-md"></div>
        <div className="absolute bottom-20 left-10 w-28 h-28 bg-[#9747FF] rounded-full opacity-40 blur-md"></div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col relative z-10 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {renderCurrentScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Barra de progreso inferior (solo para pantallas de onboarding, no para cuestionario) */}
      {state.currentScreen !== "questionnaire" && state.currentScreen !== "complete" && (
        <div className="p-6 flex justify-between items-center relative z-10">
          <div className="flex space-x-2">
            {["welcome", "navigation", "training", "nutrition", "tracking"].map((screen) => (
              <div
                key={screen}
                className={`w-2 h-2 rounded-full ${
                  screen === state.currentScreen ? "bg-[#FDA758]" : "bg-[#EBDCCF]"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
