"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dumbbell,
  ArrowLeft,
  Play,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { getUserRoutineById } from "@/lib/training-service"
import ImprovedWorkoutExecution from "@/components/training/improved-workout-execution"

export default function StartWorkoutPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const routineId = searchParams.get("routineId")
  const dayId = searchParams.get("dayId")
  
  const [isLoading, setIsLoading] = useState(true)
  const [routine, setRoutine] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [workoutStarted, setWorkoutStarted] = useState(false)
  
  // Load routine data
  useEffect(() => {
    const loadRoutine = async () => {
      if (!routineId || !user) return
      
      try {
        const { data, error } = await getUserRoutineById(routineId)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setRoutine(data)
          
          // If dayId is provided, set it as active tab
          if (dayId) {
            setActiveTab(dayId)
          } else if (data.days && data.days.length > 0) {
            setActiveTab(data.days[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading routine:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina de entrenamiento",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadRoutine()
  }, [routineId, dayId, user, toast])
  
  // Handle workout completion
  const handleWorkoutComplete = () => {
    toast({
      title: "¡Entrenamiento completado!",
      description: "Tu progreso ha sido guardado correctamente",
    })
    
    // Redirect to training page
    router.push("/training")
  }
  
  // Handle workout cancellation
  const handleWorkoutCancel = () => {
    setWorkoutStarted(false)
  }
  
  // If loading or no user, show skeleton
  if (authLoading || isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    )
  }
  
  // If no user, redirect to login
  if (!user) {
    router.push("/auth/login")
    return null
  }
  
  // If no routine found, show error
  if (!routine) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3 rounded-full"
            onClick={() => router.push("/training")}
          >
            <ArrowLeft className="h-5 w-5 text-[#573353]" />
          </Button>
          <h1 className="text-2xl font-bold text-[#573353]">Iniciar Entrenamiento</h1>
        </div>
        
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-[#573353]/30 mb-4" />
              <p className="text-[#573353] mb-4">No se encontró la rutina de entrenamiento</p>
              <Button 
                className="bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
                onClick={() => router.push("/training")}
              >
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // If workout started, show execution component
  if (workoutStarted) {
    const activeDay = routine.days.find((day: any) => day.id === activeTab)
    
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <ImprovedWorkoutExecution
          routine={routine}
          userId={user.uid}
          onComplete={handleWorkoutComplete}
          onCancel={handleWorkoutCancel}
        />
      </div>
    )
  }
  
  // Get active day
  const activeDay = routine.days.find((day: any) => day.id === activeTab)
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3 rounded-full"
          onClick={() => router.push("/training")}
        >
          <ArrowLeft className="h-5 w-5 text-[#573353]" />
        </Button>
        <h1 className="text-2xl font-bold text-[#573353]">Iniciar Entrenamiento</h1>
      </div>
      
      <Card className="bg-white rounded-3xl shadow-sm mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-[#573353]">
                {routine.name}
              </CardTitle>
              <CardDescription>
                {routine.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="capitalize bg-[#FFF3E0] text-[#FDA758] border-[#FDA758]/20 rounded-full px-3">
              {routine.level}
            </Badge>
            <Badge className="bg-[#E8F5E9] text-[#5DE292] border-[#5DE292]/20 rounded-full px-3">
              {routine.frequency || `${routine.days.length} días`}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 bg-[#F9F9F9] rounded-full p-1">
              {routine.days.map((day: any, index: number) => (
                <TabsTrigger 
                  key={day.id} 
                  value={day.id}
                  className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
                >
                  Día {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {routine.days.map((day: any) => (
              <TabsContent key={day.id} value={day.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#573353]">{day.name}</h3>
                  <Badge className="bg-[#FDA758]/10 text-[#FDA758] border-[#FDA758]/20 rounded-full px-3">
                    {day.exercises.length} ejercicios
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {day.exercises.map((exercise: any, index: number) => (
                    <div 
                      key={exercise.id} 
                      className="p-3 bg-[#F9F9F9] rounded-xl flex items-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FDA758] text-white flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#573353]">{exercise.name}</h4>
                        <p className="text-xs text-[#573353]/70">
                          {exercise.sets || 3} series x {exercise.reps || 10} reps
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4 p-3 bg-[#F9F9F9] rounded-xl">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-[#573353]/70 mr-2" />
                    <span className="text-sm text-[#573353]">Duración estimada</span>
                  </div>
                  <span className="font-medium text-[#573353]">
                    {Math.round(day.exercises.length * 5)} min
                  </span>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
            onClick={() => setWorkoutStarted(true)}
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar Entrenamiento
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center text-[#573353]/70 text-sm">
        <p>Recuerda calentar adecuadamente antes de comenzar</p>
        <p>y estirar al finalizar tu entrenamiento.</p>
      </div>
    </div>
  )
}
