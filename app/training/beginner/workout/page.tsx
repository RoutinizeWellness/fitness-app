"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Info, 
  AlertCircle, 
  Clock, 
  Dumbbell 
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"
import { processSupabaseResponse } from "@/lib/supabase-utils"
import { AnimatedFade, AnimatedSlide } from "@/components/animations/animated-transitions"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Sample beginner workout data
const BEGINNER_WORKOUT = {
  id: "beginner-full-body-1",
  name: "Entrenamiento de Cuerpo Completo para Principiantes",
  description: "Una rutina completa para principiantes que trabaja todos los grupos musculares principales",
  level: "beginner",
  duration: 45,
  exercises: [
    {
      id: "squat",
      name: "Sentadilla",
      description: "Un ejercicio básico para piernas y glúteos",
      muscleGroup: "legs",
      sets: 3,
      reps: "10-12",
      rest: 90,
      image: "/images/exercises/squat.jpg",
      video: "https://www.youtube.com/watch?v=aclHkVaku9U",
      instructions: [
        "Colócate de pie con los pies a la anchura de los hombros",
        "Mantén la espalda recta y el pecho hacia arriba",
        "Baja las caderas como si fueras a sentarte en una silla",
        "Asegúrate de que las rodillas no pasen de la punta de los pies",
        "Baja hasta que los muslos estén paralelos al suelo (o hasta donde puedas)",
        "Empuja a través de los talones para volver a la posición inicial"
      ],
      tips: [
        "Mantén los talones en el suelo durante todo el movimiento",
        "Mantén las rodillas alineadas con los pies, sin que se desvíen hacia adentro",
        "Respira profundamente antes de bajar y exhala al subir"
      ],
      alternatives: [
        {
          name: "Sentadilla con silla",
          description: "Usa una silla como soporte para sentarte y levantarte"
        },
        {
          name: "Sentadilla asistida",
          description: "Usa un soporte como una barra o una pared para ayudarte con el equilibrio"
        }
      ]
    },
    {
      id: "push-up",
      name: "Flexiones",
      description: "Ejercicio para pecho, hombros y tríceps",
      muscleGroup: "chest",
      sets: 3,
      reps: "8-10",
      rest: 90,
      image: "/images/exercises/push-up.jpg",
      video: "https://www.youtube.com/watch?v=IODxDxX7oi4",
      instructions: [
        "Colócate en posición de plancha con las manos un poco más anchas que los hombros",
        "Mantén el cuerpo en línea recta desde la cabeza hasta los talones",
        "Baja el cuerpo doblando los codos hasta que el pecho casi toque el suelo",
        "Empuja con los brazos para volver a la posición inicial"
      ],
      tips: [
        "Mantén el core activado durante todo el movimiento",
        "No dejes que la cadera se hunda o se eleve",
        "Si es demasiado difícil, puedes hacerlas con las rodillas en el suelo"
      ],
      alternatives: [
        {
          name: "Flexiones inclinadas",
          description: "Apoya las manos en una superficie elevada para reducir la dificultad"
        },
        {
          name: "Flexiones de rodillas",
          description: "Apoya las rodillas en el suelo para reducir la carga"
        }
      ]
    },
    {
      id: "row",
      name: "Remo con mancuerna",
      description: "Ejercicio para espalda y bíceps",
      muscleGroup: "back",
      sets: 3,
      reps: "10-12 por lado",
      rest: 60,
      image: "/images/exercises/dumbbell-row.jpg",
      video: "https://www.youtube.com/watch?v=pYcpY20QaE8",
      instructions: [
        "Coloca una mano y una rodilla sobre un banco",
        "Sostén una mancuerna con la otra mano, dejando que cuelgue",
        "Mantén la espalda paralela al suelo",
        "Tira de la mancuerna hacia arriba, llevando el codo hacia atrás",
        "Baja la mancuerna controladamente"
      ],
      tips: [
        "Mantén la espalda recta, no la arquees",
        "Tira con el codo, no con la mano",
        "Mantén el cuello en posición neutral, mirando hacia abajo"
      ],
      alternatives: [
        {
          name: "Remo con banda elástica",
          description: "Usa una banda elástica anclada a un punto fijo"
        },
        {
          name: "Remo invertido",
          description: "Usa una barra o mesa baja y tira del cuerpo hacia arriba"
        }
      ]
    },
    {
      id: "plank",
      name: "Plancha",
      description: "Ejercicio para el core y la estabilidad",
      muscleGroup: "core",
      sets: 3,
      reps: "30 segundos",
      rest: 60,
      image: "/images/exercises/plank.jpg",
      video: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
      instructions: [
        "Apóyate sobre los antebrazos y las puntas de los pies",
        "Mantén el cuerpo en línea recta desde la cabeza hasta los talones",
        "Contrae el abdomen y los glúteos",
        "Mantén la posición durante el tiempo indicado"
      ],
      tips: [
        "No dejes que la cadera se hunda o se eleve",
        "Respira normalmente durante el ejercicio",
        "Mira hacia el suelo para mantener el cuello en posición neutral"
      ],
      alternatives: [
        {
          name: "Plancha de rodillas",
          description: "Apoya las rodillas en el suelo para reducir la dificultad"
        },
        {
          name: "Plancha contra la pared",
          description: "Apóyate contra una pared en lugar del suelo"
        }
      ]
    },
    {
      id: "glute-bridge",
      name: "Puente de glúteos",
      description: "Ejercicio para glúteos y parte baja de la espalda",
      muscleGroup: "glutes",
      sets: 3,
      reps: "12-15",
      rest: 60,
      image: "/images/exercises/glute-bridge.jpg",
      video: "https://www.youtube.com/watch?v=wPM8icPu6H8",
      instructions: [
        "Acuéstate boca arriba con las rodillas dobladas y los pies apoyados en el suelo",
        "Coloca los brazos a los lados con las palmas hacia abajo",
        "Empuja con los talones y levanta las caderas del suelo",
        "Aprieta los glúteos en la parte superior del movimiento",
        "Baja las caderas controladamente"
      ],
      tips: [
        "Mantén los pies a la anchura de las caderas",
        "No arquees excesivamente la espalda",
        "Exhala al subir e inhala al bajar"
      ],
      alternatives: [
        {
          name: "Puente de glúteos con una pierna",
          description: "Realiza el ejercicio con una sola pierna para aumentar la dificultad"
        },
        {
          name: "Puente de glúteos con elevación",
          description: "Coloca los pies en una superficie elevada para aumentar el rango de movimiento"
        }
      ]
    }
  ]
};

export default function BeginnerWorkoutPage() {
  const [currentExercise, setCurrentExercise] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("workout")
  
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Handle rest timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isResting && restTime > 0) {
      timer = setInterval(() => {
        setRestTime(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      // Play sound or notification
      toast({
        title: "¡Descanso completado!",
        description: "Es hora de comenzar el siguiente set.",
      });
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isResting, restTime, toast]);
  
  // Handle back button
  const handleBack = () => {
    router.push("/training/beginner")
  }
  
  // Start rest timer
  const startRest = () => {
    const exercise = BEGINNER_WORKOUT.exercises[currentExercise];
    setRestTime(exercise.rest);
    setIsResting(true);
  }
  
  // Complete current set
  const completeSet = () => {
    const exercise = BEGINNER_WORKOUT.exercises[currentExercise];
    
    if (currentSet < exercise.sets) {
      // Move to next set
      setCurrentSet(prev => prev + 1);
      startRest();
    } else {
      // Complete exercise
      setCompletedExercises(prev => [...prev, exercise.id]);
      
      if (currentExercise < BEGINNER_WORKOUT.exercises.length - 1) {
        // Move to next exercise
        setCurrentExercise(prev => prev + 1);
        setCurrentSet(1);
        toast({
          title: "¡Ejercicio completado!",
          description: "Pasando al siguiente ejercicio.",
        });
      } else {
        // Workout completed
        toast({
          title: "¡Entrenamiento completado!",
          description: "¡Felicidades! Has completado tu entrenamiento.",
          variant: "success"
        });
        
        // Save workout log
        if (user) {
          saveWorkoutLog();
        }
      }
    }
  }
  
  // Skip rest
  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  }
  
  // Reset current exercise
  const resetExercise = () => {
    setCurrentSet(1);
    setIsResting(false);
    setRestTime(0);
    
    // Remove from completed if it was completed
    const exercise = BEGINNER_WORKOUT.exercises[currentExercise];
    setCompletedExercises(prev => prev.filter(id => id !== exercise.id));
  }
  
  // Save workout log to Supabase
  const saveWorkoutLog = async () => {
    if (!user) return;
    
    try {
      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('workout_logs')
          .insert({
            user_id: user.id,
            workout_id: BEGINNER_WORKOUT.id,
            workout_name: BEGINNER_WORKOUT.name,
            completed_at: new Date().toISOString(),
            duration_minutes: BEGINNER_WORKOUT.duration,
            exercises_completed: BEGINNER_WORKOUT.exercises.map(ex => ex.id),
            created_at: new Date().toISOString()
          })
          .select(),
        null,
        "Guardado de registro de entrenamiento"
      )
      
      if (error) {
        console.error("Error saving workout log:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar el registro de entrenamiento.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in saveWorkoutLog:", error);
    }
  }
  
  // Calculate overall progress
  const calculateProgress = () => {
    const totalSets = BEGINNER_WORKOUT.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedSets = completedExercises.length * BEGINNER_WORKOUT.exercises[0].sets + 
                          (currentSet - 1);
    
    return (completedSets / totalSets) * 100;
  }
  
  // Current exercise
  const exercise = BEGINNER_WORKOUT.exercises[currentExercise];
  
  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{BEGINNER_WORKOUT.name}</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="workout">Entrenamiento</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workout">
          <AnimatedFade>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{exercise.name}</CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {exercise.muscleGroup === "legs" && "Piernas"}
                      {exercise.muscleGroup === "chest" && "Pecho"}
                      {exercise.muscleGroup === "back" && "Espalda"}
                      {exercise.muscleGroup === "core" && "Core"}
                      {exercise.muscleGroup === "glutes" && "Glúteos"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                    <Image 
                      src={exercise.image || "/images/exercise-placeholder.jpg"} 
                      alt={exercise.name} 
                      fill 
                      style={{ objectFit: "cover" }}
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="absolute bottom-4 right-4"
                          variant="secondary"
                        >
                          Ver vídeo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <div className="aspect-video">
                          <iframe
                            width="100%"
                            height="100%"
                            src={exercise.video?.replace("watch?v=", "embed/")}
                            title={`Vídeo de ${exercise.name}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="font-medium">Series y repeticiones</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{currentSet}</span>
                        <span className="text-muted-foreground">de</span>
                        <span className="font-medium">{exercise.sets}</span>
                        <span className="text-muted-foreground">series</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">Series</p>
                        <p className="font-medium text-lg">{exercise.sets}</p>
                      </div>
                      
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">Repeticiones</p>
                        <p className="font-medium text-lg">{exercise.reps}</p>
                      </div>
                      
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">Descanso</p>
                        <p className="font-medium text-lg">{exercise.rest} seg</p>
                      </div>
                    </div>
                    
                    {isResting ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Tiempo de descanso</h3>
                          <span className="font-medium">{restTime} segundos</span>
                        </div>
                        
                        <Progress value={(exercise.rest - restTime) / exercise.rest * 100} />
                        
                        <div className="flex justify-center">
                          <Button onClick={skipRest} variant="outline">
                            Saltar descanso
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <Button 
                          onClick={completeSet} 
                          className="w-full md:w-auto"
                          size="lg"
                        >
                          <CheckCircle className="mr-2 h-5 w-5" />
                          {currentSet < exercise.sets ? `Completar serie ${currentSet}` : "Completar ejercicio"}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Instrucciones</h3>
                    </div>
                    
                    <ul className="space-y-2 pl-8 list-decimal">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                      <h3 className="font-medium">Consejos</h3>
                    </div>
                    
                    <ul className="space-y-2 pl-8 list-disc">
                      {exercise.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={resetExercise}
                    disabled={isResting}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {currentExercise > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentExercise(prev => prev - 1);
                          setCurrentSet(1);
                          setIsResting(false);
                        }}
                        disabled={isResting}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Anterior
                      </Button>
                    )}
                    
                    {currentExercise < BEGINNER_WORKOUT.exercises.length - 1 && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentExercise(prev => prev + 1);
                          setCurrentSet(1);
                          setIsResting(false);
                        }}
                        disabled={isResting}
                      >
                        Siguiente
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Progreso del entrenamiento</h3>
                  <span className="text-sm text-muted-foreground">
                    {completedExercises.length} de {BEGINNER_WORKOUT.exercises.length} ejercicios
                  </span>
                </div>
                
                <Progress value={calculateProgress()} />
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {BEGINNER_WORKOUT.exercises.map((ex, index) => (
                    <Button
                      key={ex.id}
                      variant="outline"
                      className={cn(
                        "h-auto py-2 px-3 flex flex-col items-center text-center",
                        completedExercises.includes(ex.id) && "bg-primary/10 border-primary",
                        index === currentExercise && !completedExercises.includes(ex.id) && "border-primary"
                      )}
                      onClick={() => {
                        setCurrentExercise(index);
                        setCurrentSet(1);
                        setIsResting(false);
                      }}
                      disabled={isResting}
                    >
                      <span className="text-xs">{index + 1}</span>
                      <span className="text-sm truncate w-full">{ex.name}</span>
                      {completedExercises.includes(ex.id) && (
                        <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedFade>
        </TabsContent>
        
        <TabsContent value="info">
          <AnimatedSlide>
            <Card>
              <CardHeader>
                <CardTitle>Información del Entrenamiento</CardTitle>
                <CardDescription>
                  Detalles sobre este entrenamiento para principiantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Descripción</h3>
                  <p>{BEGINNER_WORKOUT.description}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                      <Dumbbell className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nivel</p>
                    <p className="font-medium">Principiante</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="font-medium">{BEGINNER_WORKOUT.duration} minutos</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                      <Dumbbell className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Ejercicios</p>
                    <p className="font-medium">{BEGINNER_WORKOUT.exercises.length}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Ejercicios incluidos</h3>
                  
                  <div className="space-y-3">
                    {BEGINNER_WORKOUT.exercises.map((ex, index) => (
                      <div 
                        key={ex.id}
                        className="border rounded-lg p-3 flex items-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="font-medium text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{ex.name}</h4>
                          <p className="text-sm text-muted-foreground">{ex.sets} series × {ex.reps}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {ex.muscleGroup === "legs" && "Piernas"}
                          {ex.muscleGroup === "chest" && "Pecho"}
                          {ex.muscleGroup === "back" && "Espalda"}
                          {ex.muscleGroup === "core" && "Core"}
                          {ex.muscleGroup === "glutes" && "Glúteos"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Consejos para principiantes</h3>
                  
                  <ul className="space-y-2 pl-5 list-disc">
                    <li>Concéntrate en la técnica correcta antes que en el peso o las repeticiones</li>
                    <li>Respira de manera constante durante los ejercicios, exhalando en el esfuerzo</li>
                    <li>Mantén una hidratación adecuada antes, durante y después del entrenamiento</li>
                    <li>Escucha a tu cuerpo y descansa si sientes dolor agudo (diferente a la fatiga muscular)</li>
                    <li>Sé consistente con tus entrenamientos para ver resultados</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("workout")}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Volver al entrenamiento
                </Button>
                
                <Button onClick={() => setActiveTab("workout")}>
                  <Play className="mr-2 h-4 w-4" />
                  Comenzar entrenamiento
                </Button>
              </CardFooter>
            </Card>
          </AnimatedSlide>
        </TabsContent>
      </Tabs>
    </div>
  )
}
