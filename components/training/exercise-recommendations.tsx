"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dumbbell, 
  Zap, 
  TrendingUp, 
  BarChart, 
  ThumbsUp, 
  ThumbsDown, 
  Info,
  ArrowRight,
  Star,
  Flame,
  RefreshCw
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Exercise } from "@/lib/types/training"
import { useToast } from "@/components/ui/use-toast"

interface ExerciseRecommendationsProps {
  userId: string
  className?: string
}

export function ExerciseRecommendations({ userId, className = "" }: ExerciseRecommendationsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("recommended")
  const [recommendations, setRecommendations] = useState<Exercise[]>([])
  const [alternatives, setAlternatives] = useState<Record<string, Exercise[]>>({})
  const [userFeedback, setUserFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({})

  // Datos simulados para recomendaciones
  const mockRecommendations: Exercise[] = [
    {
      id: "ex-1",
      name: "Sentadilla Búlgara",
      category: "compound",
      muscleGroup: ["Piernas", "Glúteos"],
      equipment: ["dumbbell"],
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      rest: 90,
      pattern: "squat",
      instructions: "Mantén el pie trasero elevado sobre un banco y desciende con el pie delantero.",
      difficulty: "intermediate",
      isCompound: true,
      videoUrl: "https://example.com/bulgarian-squat.mp4",
      imageUrl: "https://example.com/bulgarian-squat.jpg",
      reason: "Basado en tu progreso con sentadillas tradicionales"
    },
    {
      id: "ex-2",
      name: "Press Inclinado con Mancuernas",
      category: "compound",
      muscleGroup: ["Pecho", "Hombros", "Tríceps"],
      equipment: ["dumbbell", "bench"],
      sets: 4,
      repsMin: 8,
      repsMax: 10,
      rest: 90,
      pattern: "push",
      instructions: "Mantén los codos a 45 grados del cuerpo durante el movimiento.",
      difficulty: "intermediate",
      isCompound: true,
      videoUrl: "https://example.com/incline-press.mp4",
      imageUrl: "https://example.com/incline-press.jpg",
      reason: "Complementa tu entrenamiento de pecho actual"
    },
    {
      id: "ex-3",
      name: "Remo con Barra T",
      category: "compound",
      muscleGroup: ["Espalda", "Bíceps"],
      equipment: ["barbell"],
      sets: 3,
      repsMin: 10,
      repsMax: 12,
      rest: 90,
      pattern: "pull",
      instructions: "Mantén la espalda recta y tira de la barra hacia el abdomen.",
      difficulty: "intermediate",
      isCompound: true,
      videoUrl: "https://example.com/t-bar-row.mp4",
      imageUrl: "https://example.com/t-bar-row.jpg",
      reason: "Para mejorar el desarrollo de espalda"
    },
    {
      id: "ex-4",
      name: "Hip Thrust",
      category: "compound",
      muscleGroup: ["Glúteos", "Isquiotibiales"],
      equipment: ["barbell", "bench"],
      sets: 4,
      repsMin: 10,
      repsMax: 15,
      rest: 90,
      pattern: "hinge",
      instructions: "Apoya la espalda en un banco y eleva las caderas con la barra sobre ellas.",
      difficulty: "intermediate",
      isCompound: true,
      videoUrl: "https://example.com/hip-thrust.mp4",
      imageUrl: "https://example.com/hip-thrust.jpg",
      reason: "Ideal para fortalecer glúteos"
    }
  ]

  // Datos simulados para alternativas
  const mockAlternatives: Record<string, Exercise[]> = {
    "ex-1": [
      {
        id: "alt-1-1",
        name: "Zancada con Mancuernas",
        category: "compound",
        muscleGroup: ["Piernas", "Glúteos"],
        equipment: ["dumbbell"],
        sets: 3,
        repsMin: 10,
        repsMax: 12,
        rest: 60,
        pattern: "lunge",
        instructions: "Da un paso adelante y flexiona ambas rodillas hasta 90 grados.",
        difficulty: "beginner",
        isCompound: true,
        videoUrl: "https://example.com/dumbbell-lunge.mp4",
        imageUrl: "https://example.com/dumbbell-lunge.jpg"
      },
      {
        id: "alt-1-2",
        name: "Sentadilla con Mancuerna Goblet",
        category: "compound",
        muscleGroup: ["Piernas", "Glúteos"],
        equipment: ["dumbbell"],
        sets: 3,
        repsMin: 10,
        repsMax: 15,
        rest: 60,
        pattern: "squat",
        instructions: "Sostén una mancuerna frente al pecho y realiza una sentadilla profunda.",
        difficulty: "beginner",
        isCompound: true,
        videoUrl: "https://example.com/goblet-squat.mp4",
        imageUrl: "https://example.com/goblet-squat.jpg"
      }
    ],
    "ex-2": [
      {
        id: "alt-2-1",
        name: "Flexiones Inclinadas",
        category: "compound",
        muscleGroup: ["Pecho", "Hombros", "Tríceps"],
        equipment: ["bodyweight", "bench"],
        sets: 3,
        repsMin: 10,
        repsMax: 15,
        rest: 60,
        pattern: "push",
        instructions: "Coloca las manos en un banco y realiza flexiones con el cuerpo inclinado.",
        difficulty: "beginner",
        isCompound: true,
        videoUrl: "https://example.com/incline-pushup.mp4",
        imageUrl: "https://example.com/incline-pushup.jpg"
      }
    ]
  }

  // Cargar recomendaciones
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!userId) return
      
      setIsLoading(true)
      try {
        // En un entorno real, aquí cargaríamos las recomendaciones de Supabase
        // Por ahora, usamos datos simulados
        setTimeout(() => {
          setRecommendations(mockRecommendations)
          setAlternatives(mockAlternatives)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error al cargar recomendaciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las recomendaciones de ejercicios",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }
    
    loadRecommendations()
  }, [userId, toast])

  // Manejar feedback del usuario
  const handleFeedback = (exerciseId: string, feedback: 'like' | 'dislike') => {
    setUserFeedback(prev => ({
      ...prev,
      [exerciseId]: feedback
    }))
    
    toast({
      title: feedback === 'like' ? "Ejercicio guardado" : "Preferencia guardada",
      description: feedback === 'like' 
        ? "Se tendrá en cuenta para futuras recomendaciones" 
        : "No se recomendará este ejercicio en el futuro",
      variant: feedback === 'like' ? "default" : "destructive"
    })
    
    // En un entorno real, aquí enviaríamos el feedback a Supabase
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-xl font-bold">Recomendaciones de Ejercicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recomendaciones de Ejercicios</h2>
        <Button variant="outline" size="sm" onClick={() => setActiveTab("recommended")}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="recommended">Recomendados</TabsTrigger>
          <TabsTrigger value="alternatives">Alternativas</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(exercise => (
              <Card key={exercise.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{exercise.name}</CardTitle>
                    <Badge variant={
                      exercise.difficulty === "beginner" ? "secondary" :
                      exercise.difficulty === "intermediate" ? "default" :
                      "destructive"
                    }>
                      {exercise.difficulty === "beginner" ? "Principiante" :
                       exercise.difficulty === "intermediate" ? "Intermedio" :
                       "Avanzado"}
                    </Badge>
                  </div>
                  <CardDescription className="flex flex-wrap gap-1 mt-1">
                    {exercise.muscleGroup.map(group => (
                      <Badge key={group} variant="outline" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-start text-sm">
                    <Zap className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{exercise.reason}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Dumbbell className="h-3.5 w-3.5 mr-1" />
                      <span>{exercise.sets} series</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      <span>{exercise.repsMin}-{exercise.repsMax} reps</span>
                    </div>
                    <div className="flex items-center">
                      <Flame className="h-3.5 w-3.5 mr-1" />
                      <span>{exercise.rest}s descanso</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full">
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={userFeedback[exercise.id] === 'like' ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleFeedback(exercise.id, 'like')}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Me gusta este ejercicio</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={userFeedback[exercise.id] === 'dislike' ? "destructive" : "outline"} 
                              size="sm"
                              onClick={() => handleFeedback(exercise.id, 'dislike')}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>No me interesa este ejercicio</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Ver detalles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alternatives" className="space-y-4">
          {Object.keys(alternatives).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(alternatives).map(([exerciseId, alts]) => {
                const originalExercise = recommendations.find(ex => ex.id === exerciseId)
                
                return (
                  <div key={exerciseId} className="space-y-3">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">Alternativas para {originalExercise?.name}</h3>
                      <Badge variant="outline" className="ml-2">
                        {originalExercise?.muscleGroup.join(', ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alts.map(alt => (
                        <Card key={alt.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-medium">{alt.name}</CardTitle>
                              <Badge variant={
                                alt.difficulty === "beginner" ? "secondary" :
                                alt.difficulty === "intermediate" ? "default" :
                                "destructive"
                              }>
                                {alt.difficulty === "beginner" ? "Principiante" :
                                 alt.difficulty === "intermediate" ? "Intermedio" :
                                 "Avanzado"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{alt.instructions}</p>
                            
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Dumbbell className="h-3.5 w-3.5 mr-1" />
                                <span>{alt.sets} series</span>
                              </div>
                              <div className="flex items-center">
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                <span>{alt.repsMin}-{alt.repsMax} reps</span>
                              </div>
                              <div className="flex items-center">
                                <Flame className="h-3.5 w-3.5 mr-1" />
                                <span>{alt.rest}s descanso</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                              Usar esta alternativa
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                    
                    <Separator />
                  </div>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay alternativas disponibles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Interactúa con más ejercicios para recibir alternativas personalizadas.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("recommended")}>
                  Ver ejercicios recomendados
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
