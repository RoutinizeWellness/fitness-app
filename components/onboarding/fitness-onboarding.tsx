"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import {
  Dumbbell,
  Apple,
  Moon,
  Brain,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react"

// Tipos para el onboarding
type OnboardingStep = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

type FitnessLevel = "beginner" | "intermediate" | "advanced"
type FitnessGoal = "lose_weight" | "build_muscle" | "improve_fitness" | "maintain"
type DietPreference = "no_preference" | "vegetarian" | "vegan" | "keto" | "paleo"

export function FitnessOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Preferencias del usuario
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner")
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("improve_fitness")
  const [dietPreference, setDietPreference] = useState<DietPreference>("no_preference")
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        // Verificar si el usuario ya completó el onboarding
        const { data, error } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()
        
        if (data && data.onboarding_completed) {
          router.push('/dashboard')
        }
      } else {
        router.push('/auth/login')
      }
    }
    
    fetchUser()
  }, [router])
  
  // Pasos del onboarding
  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Bienvenido a tu viaje fitness",
      description: "Vamos a personalizar tu experiencia",
      icon: <Info className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">¡Bienvenido a Routinize!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Estamos emocionados de acompañarte en tu viaje fitness. Vamos a personalizar la aplicación según tus necesidades y objetivos.
          </p>
          <div className="py-4">
            <img 
              src="/images/onboarding-welcome.svg" 
              alt="Bienvenida" 
              className="mx-auto h-40"
            />
          </div>
          <p className="text-sm text-gray-500">
            Este proceso tomará solo unos minutos y nos ayudará a ofrecerte la mejor experiencia posible.
          </p>
        </div>
      )
    },
    {
      id: "fitness-level",
      title: "Nivel de condición física",
      description: "Cuéntanos sobre tu experiencia",
      icon: <Dumbbell className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">¿Cuál es tu nivel de experiencia?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Selecciona la opción que mejor describa tu nivel actual de condición física.
          </p>
          
          <div className="grid gap-3">
            {[
              { value: "beginner", label: "Principiante", description: "Nuevo en el fitness o retomando después de un largo descanso" },
              { value: "intermediate", label: "Intermedio", description: "Entrenas regularmente desde hace algunos meses" },
              { value: "advanced", label: "Avanzado", description: "Entrenas consistentemente durante años" }
            ].map((level) => (
              <Card 
                key={level.value}
                organic={true}
                hover={true}
                className={`p-4 cursor-pointer ${fitnessLevel === level.value ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setFitnessLevel(level.value as FitnessLevel)}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-3 ${fitnessLevel === level.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {fitnessLevel === level.value ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Dumbbell className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{level.label}</h3>
                    <p className="text-sm text-gray-500">{level.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "fitness-goals",
      title: "Objetivos fitness",
      description: "¿Qué quieres lograr?",
      icon: <Dumbbell className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">¿Cuál es tu objetivo principal?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Selecciona el objetivo que más te interesa alcanzar.
          </p>
          
          <div className="grid gap-3">
            {[
              { value: "lose_weight", label: "Perder peso", description: "Reducir grasa corporal y mejorar la composición corporal" },
              { value: "build_muscle", label: "Ganar músculo", description: "Aumentar masa muscular y fuerza" },
              { value: "improve_fitness", label: "Mejorar condición", description: "Aumentar resistencia, flexibilidad y salud general" },
              { value: "maintain", label: "Mantener", description: "Mantener tu condición física actual" }
            ].map((goal) => (
              <Card 
                key={goal.value}
                organic={true}
                hover={true}
                className={`p-4 cursor-pointer ${fitnessGoal === goal.value ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setFitnessGoal(goal.value as FitnessGoal)}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-3 ${fitnessGoal === goal.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {fitnessGoal === goal.value ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Dumbbell className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{goal.label}</h3>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "diet-preferences",
      title: "Preferencias alimenticias",
      description: "Personaliza tu plan nutricional",
      icon: <Apple className="h-6 w-6 text-red-500" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">¿Tienes alguna preferencia dietética?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Selecciona la opción que mejor se adapte a tus hábitos alimenticios.
          </p>
          
          <div className="grid gap-3">
            {[
              { value: "no_preference", label: "Sin preferencia", description: "Sin restricciones dietéticas específicas" },
              { value: "vegetarian", label: "Vegetariano", description: "Sin carne, pero incluye lácteos y huevos" },
              { value: "vegan", label: "Vegano", description: "Sin productos de origen animal" },
              { value: "keto", label: "Keto", description: "Alta en grasas, baja en carbohidratos" },
              { value: "paleo", label: "Paleo", description: "Basada en alimentos no procesados" }
            ].map((diet) => (
              <Card 
                key={diet.value}
                organic={true}
                hover={true}
                className={`p-4 cursor-pointer ${dietPreference === diet.value ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setDietPreference(diet.value as DietPreference)}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-3 ${dietPreference === diet.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {dietPreference === diet.value ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Apple className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{diet.label}</h3>
                    <p className="text-sm text-gray-500">{diet.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "training-frequency",
      title: "Frecuencia de entrenamiento",
      description: "¿Cuánto tiempo puedes dedicar?",
      icon: <Dumbbell className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">¿Cuántos días a la semana puedes entrenar?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Selecciona la cantidad de días que puedes dedicar al entrenamiento cada semana.
          </p>
          
          <div className="flex justify-between items-center py-4">
            <span className="text-sm font-medium">1 día</span>
            <div className="flex-1 mx-4">
              <input
                type="range"
                min="1"
                max="7"
                value={workoutsPerWeek}
                onChange={(e) => setWorkoutsPerWeek(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <span className="text-sm font-medium">7 días</span>
          </div>
          
          <div className="text-center">
            <span className="text-3xl font-bold">{workoutsPerWeek}</span>
            <span className="text-lg ml-2">días por semana</span>
          </div>
          
          <Card organic={true} className="p-4 mt-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {workoutsPerWeek <= 2 
                  ? "Incluso con pocos días, puedes lograr buenos resultados con entrenamientos efectivos."
                  : workoutsPerWeek <= 4
                  ? "Esta frecuencia es ideal para la mayoría de las personas, permitiendo un buen equilibrio entre entrenamiento y recuperación."
                  : "Asegúrate de incluir días de recuperación adecuados para evitar el sobreentrenamiento."}
              </p>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: "sleep-habits",
      title: "Hábitos de sueño",
      description: "La recuperación es clave",
      icon: <Moon className="h-6 w-6 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">¿Cuántas horas duermes normalmente?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            El sueño es fundamental para la recuperación y el progreso en tu entrenamiento.
          </p>
          
          <div className="flex justify-between items-center py-4">
            <span className="text-sm font-medium">4 horas</span>
            <div className="flex-1 mx-4">
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <span className="text-sm font-medium">10 horas</span>
          </div>
          
          <div className="text-center">
            <span className="text-3xl font-bold">{sleepHours}</span>
            <span className="text-lg ml-2">horas por noche</span>
          </div>
          
          <Card organic={true} className="p-4 mt-4 bg-indigo-50 dark:bg-indigo-900/20">
            <div className="flex">
              <Info className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                {sleepHours < 6 
                  ? "Dormir menos de 6 horas puede afectar negativamente tu recuperación y rendimiento. Intenta aumentar gradualmente tus horas de sueño."
                  : sleepHours < 8
                  ? "Entre 7-8 horas es lo recomendado para la mayoría de los adultos activos."
                  : "¡Excelente! Dormir 8 o más horas favorece una óptima recuperación muscular y hormonal."}
              </p>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: "complete",
      title: "¡Todo listo!",
      description: "Comienza tu viaje fitness",
      icon: <Check className="h-6 w-6 text-green-500" />,
      content: (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold">¡Configuración completada!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Hemos personalizado la aplicación según tus preferencias. Estás listo para comenzar tu viaje fitness.
          </p>
          
          <div className="py-4">
            <img 
              src="/images/onboarding-complete.svg" 
              alt="Configuración completada" 
              className="mx-auto h-40"
            />
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">Lo que te espera:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Rutinas de entrenamiento personalizadas
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Planes de nutrición adaptados a tus objetivos
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Seguimiento de progreso y análisis detallados
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Recomendaciones para mejorar tu sueño y recuperación
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ]
  
  // Guardar las preferencias del usuario
  const saveUserPreferences = async () => {
    if (!userId) return
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          fitness_level: fitnessLevel,
          fitness_goal: fitnessGoal,
          diet_preference: dietPreference,
          workouts_per_week: workoutsPerWeek,
          sleep_hours: sleepHours,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error("Error al guardar preferencias:", error)
        toast({
          title: "Error",
          description: "No se pudieron guardar tus preferencias",
          variant: "destructive"
        })
        return
      }
      
      setCompleted(true)
      toast({
        title: "¡Configuración completada!",
        description: "Tus preferencias han sido guardadas correctamente"
      })
      
      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error("Error al guardar preferencias:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Manejar el avance al siguiente paso
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      saveUserPreferences()
    }
  }
  
  // Manejar el retroceso al paso anterior
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card organic={true} className="w-full max-w-2xl shadow-xl">
        <div className="p-6">
          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Paso {currentStep + 1} de {steps.length}</span>
              <span className="text-sm font-medium">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2 rounded-full" />
          </div>
          
          {/* Contenido del paso actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
                  <p className="text-sm text-gray-500">{steps[currentStep].description}</p>
                </div>
              </div>
              
              <div className="py-4">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Botones de navegación */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isLoading}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="rounded-full"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  Comenzar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
