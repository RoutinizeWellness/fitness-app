"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  Clock, 
  BarChart, 
  Heart, 
  Zap, 
  Play 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BeginnerExerciseCard } from "@/components/training/beginner-exercise-card"
import { BeginnerRoutineCard } from "@/components/training/beginner-routine-card"
import { BeginnerTrainingProgressCard } from "@/components/training/beginner-training-progress"
import { getRecommendedExercisesForBeginners } from "@/lib/services/beginner-exercise-service"
import { getRecommendedRoutinesForBeginners } from "@/lib/services/beginner-routine-service"
import { supabase } from "@/lib/supabase-client"

export default function TrainingFundamentalsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedExercises, setRecommendedExercises] = useState<any[]>([])
  const [recommendedRoutines, setRecommendedRoutines] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  
  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserId(user.id)
          
          // Cargar ejercicios y rutinas recomendadas
          const exercises = await getRecommendedExercisesForBeginners()
          if (exercises) {
            setRecommendedExercises(exercises.slice(0, 5))
          }
          
          const routines = await getRecommendedRoutinesForBeginners()
          if (routines) {
            setRecommendedRoutines(routines.slice(0, 3))
          }
        } else {
          // Redirigir a la página de inicio de sesión si no hay usuario
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [router])
  
  // Renderizar el estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF3E9]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#FDA758] animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      {/* Encabezado */}
      <div className="bg-[#1B237E] text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Volver
          </Button>
          
          <h1 className="text-xl font-bold">Fundamentos del Entrenamiento</h1>
          
          <div className="w-8"></div> {/* Espaciador para centrar el título */}
        </div>
        
        <p className="text-white/80 text-center mb-6">
          Aprende los conceptos básicos para comenzar tu viaje fitness
        </p>
        
        <div className="flex justify-center">
          <TabsList className="bg-[#2A3190]">
            <TabsTrigger 
              value="overview" 
              className={`text-white ${activeTab === "overview" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
              onClick={() => setActiveTab("overview")}
            >
              Visión general
            </TabsTrigger>
            <TabsTrigger 
              value="exercises" 
              className={`text-white ${activeTab === "exercises" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
              onClick={() => setActiveTab("exercises")}
            >
              Ejercicios
            </TabsTrigger>
            <TabsTrigger 
              value="routines" 
              className={`text-white ${activeTab === "routines" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
              onClick={() => setActiveTab("routines")}
            >
              Rutinas
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className={`text-white ${activeTab === "progress" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
              onClick={() => setActiveTab("progress")}
            >
              Progreso
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Pestaña de visión general */}
          <TabsContent value="overview" className="space-y-6">
            {/* Introducción */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#573353] mb-4">
                Bienvenido a los fundamentos del entrenamiento
              </h2>
              <p className="text-[#573353] opacity-80 mb-4">
                Aquí aprenderás los conceptos básicos que necesitas para comenzar a entrenar de forma efectiva y segura. 
                Hemos diseñado este módulo especialmente para principiantes absolutos, sin usar jerga técnica y con explicaciones claras.
              </p>
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/onboarding/beginner-training.svg"
                  alt="Fundamentos del entrenamiento"
                  fill
                  className="object-contain"
                />
              </div>
              <Button className="bg-[#FDA758] hover:bg-[#FD9A40] w-full">
                <Play className="h-4 w-4 mr-2" />
                Ver video introductorio (2 min)
              </Button>
            </div>
            
            {/* Conceptos clave */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#573353] mb-4">
                Conceptos clave
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Series y repeticiones */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Series y repeticiones</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    Una <strong>serie</strong> es un conjunto de repeticiones realizadas sin descanso. 
                    Una <strong>repetición</strong> es un ciclo completo de un ejercicio.
                  </p>
                  <Button variant="link" className="text-[#FDA758] p-0 h-auto mt-2">
                    Aprender más
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                {/* Descanso */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Descanso</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    El <strong>descanso</strong> entre series es crucial para recuperarse y mantener la calidad del ejercicio. 
                    Para principiantes, 60-90 segundos es ideal.
                  </p>
                  <Button variant="link" className="text-[#FDA758] p-0 h-auto mt-2">
                    Aprender más
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                {/* Intensidad */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Intensidad</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    La <strong>intensidad</strong> se refiere al esfuerzo que realizas. 
                    Como principiante, mantén un nivel moderado donde puedas hablar pero con cierta dificultad.
                  </p>
                  <Button variant="link" className="text-[#FDA758] p-0 h-auto mt-2">
                    Aprender más
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                {/* Progresión */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Heart className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Progresión</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    La <strong>progresión</strong> es aumentar gradualmente la dificultad para seguir mejorando. 
                    Puede ser añadiendo repeticiones, series o peso.
                  </p>
                  <Button variant="link" className="text-[#FDA758] p-0 h-auto mt-2">
                    Aprender más
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Rutinas recomendadas */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#573353]">
                  Rutinas recomendadas
                </h2>
                <Button variant="link" className="text-[#FDA758]" onClick={() => setActiveTab("routines")}>
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {recommendedRoutines.map((routine, index) => (
                  <BeginnerRoutineCard
                    key={index}
                    routine={routine}
                    compact={true}
                    onStart={() => router.push(`/training/routine/${routine.id}`)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Pestaña de ejercicios */}
          <TabsContent value="exercises" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#573353] mb-4">
                Biblioteca de ejercicios para principiantes
              </h2>
              <p className="text-[#573353] opacity-80 mb-4">
                Aquí encontrarás una selección de ejercicios ideales para principiantes, con instrucciones detalladas y consejos para realizarlos correctamente.
              </p>
              
              <div className="space-y-4 mt-6">
                {recommendedExercises.map((exercise, index) => (
                  <BeginnerExerciseCard
                    key={index}
                    exercise={exercise}
                  />
                ))}
              </div>
              
              <Button className="w-full mt-6 bg-[#FDA758] hover:bg-[#FD9A40]">
                Explorar más ejercicios
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
          
          {/* Pestaña de rutinas */}
          <TabsContent value="routines" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#573353] mb-4">
                Rutinas para principiantes
              </h2>
              <p className="text-[#573353] opacity-80 mb-4">
                Estas rutinas están diseñadas específicamente para principiantes, con ejercicios seguros y efectivos para ayudarte a comenzar tu viaje fitness.
              </p>
              
              <div className="space-y-4 mt-6">
                {recommendedRoutines.map((routine, index) => (
                  <BeginnerRoutineCard
                    key={index}
                    routine={routine}
                    onStart={() => router.push(`/training/routine/${routine.id}`)}
                  />
                ))}
              </div>
              
              <Button className="w-full mt-6 bg-[#FDA758] hover:bg-[#FD9A40]">
                Explorar más rutinas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
          
          {/* Pestaña de progreso */}
          <TabsContent value="progress" className="space-y-6">
            {userId && (
              <BeginnerTrainingProgressCard userId={userId} />
            )}
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#573353] mb-4">
                Consejos para tu progreso
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <span className="font-bold">1</span>
                    </div>
                    <h3 className="font-medium text-[#573353]">Consistencia sobre intensidad</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    Es mejor entrenar 3 veces por semana de forma moderada que 1 vez a máxima intensidad. La consistencia es la clave del progreso.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <span className="font-bold">2</span>
                    </div>
                    <h3 className="font-medium text-[#573353]">Progresión gradual</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    Aumenta la dificultad poco a poco. Añade 1-2 repeticiones cada semana o un poco más de peso cuando las repeticiones se vuelvan fáciles.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <span className="font-bold">3</span>
                    </div>
                    <h3 className="font-medium text-[#573353]">Escucha a tu cuerpo</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    Diferencia entre el dolor muscular normal (agujetas) y el dolor de lesión. Si algo duele de forma aguda o punzante, detente y consulta.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <span className="font-bold">4</span>
                    </div>
                    <h3 className="font-medium text-[#573353]">Celebra cada logro</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80">
                    Reconoce y celebra tus pequeños avances. Completar una rutina, aumentar repeticiones o sentirte con más energía son victorias importantes.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
