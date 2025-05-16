"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell,
  Info,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  Clock,
  Zap,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Progress3D } from "@/components/ui/progress-3d"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Exercise } from "@/lib/types/training"
import { toast } from "@/components/ui/use-toast"
import { saveExerciseFavorite, getExerciseHistory } from "@/lib/supabase-training"

interface ExerciseDetailProps {
  exercise: Exercise
  userId: string
  onClose?: () => void
  showFullScreen?: boolean
}

export function ExerciseDetail({
  exercise,
  userId,
  onClose,
  showFullScreen = false
}: ExerciseDetailProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  
  // Cargar datos del ejercicio
  useEffect(() => {
    const loadExerciseData = async () => {
      setIsLoading(true)
      
      try {
        // Verificar si el ejercicio está en favoritos
        const { data: favorites, error: favError } = await supabase
          .from('user_favorite_exercises')
          .select('*')
          .eq('user_id', userId)
          .eq('exercise_id', exercise.id)
        
        if (favError) {
          console.error("Error al cargar favoritos:", favError)
        } else {
          setIsFavorite(favorites && favorites.length > 0)
        }
        
        // Cargar historial del ejercicio
        const { data: history, error: historyError } = await getExerciseHistory(userId, exercise.id)
        
        if (historyError) {
          console.error("Error al cargar historial:", historyError)
        } else if (history) {
          setExerciseHistory(history)
        }
      } catch (error) {
        console.error("Error al cargar datos del ejercicio:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId && exercise) {
      loadExerciseData()
    }
  }, [userId, exercise])
  
  // Manejar reproducción de video
  const handleVideoToggle = () => {
    const video = document.getElementById('exercise-video') as HTMLVideoElement
    
    if (video) {
      if (isVideoPlaying) {
        video.pause()
      } else {
        video.play()
      }
      
      setIsVideoPlaying(!isVideoPlaying)
    }
  }
  
  // Manejar favorito
  const handleToggleFavorite = async () => {
    try {
      const { success, error } = await saveExerciseFavorite(userId, exercise.id, !isFavorite)
      
      if (error) {
        throw error
      }
      
      setIsFavorite(!isFavorite)
      
      toast({
        title: isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
        description: isFavorite ? "El ejercicio se ha eliminado de tus favoritos" : "El ejercicio se ha añadido a tus favoritos",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al gestionar favorito:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive"
      })
    }
  }
  
  // Obtener el último peso y repeticiones utilizados
  const getLastPerformance = () => {
    if (exerciseHistory.length === 0) {
      return { weight: null, reps: null, date: null }
    }
    
    // Ordenar por fecha descendente
    const sortedHistory = [...exerciseHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    return {
      weight: sortedHistory[0].weight,
      reps: sortedHistory[0].reps,
      date: new Date(sortedHistory[0].date).toLocaleDateString()
    }
  }
  
  // Obtener el mejor rendimiento (mayor peso)
  const getBestPerformance = () => {
    if (exerciseHistory.length === 0) {
      return { weight: null, reps: null, date: null }
    }
    
    // Ordenar por peso descendente
    const sortedByWeight = [...exerciseHistory].sort((a, b) => b.weight - a.weight)
    
    return {
      weight: sortedByWeight[0].weight,
      reps: sortedByWeight[0].reps,
      date: new Date(sortedByWeight[0].date).toLocaleDateString()
    }
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={showFullScreen ? "h-full" : ""}>
        <Card3DHeader>
          <Card3DTitle>Cargando ejercicio...</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  const lastPerformance = getLastPerformance()
  const bestPerformance = getBestPerformance()
  
  return (
    <Card3D className={showFullScreen ? "h-full overflow-auto" : ""}>
      <Card3DHeader className="p-3 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <Dumbbell className="h-4 w-4 text-primary mr-2" />
              <Card3DTitle className="text-base font-medium">
                {exercise.name}
              </Card3DTitle>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                {exercise.category}
              </Badge>
              {exercise.equipment && exercise.equipment.map(eq => (
                <Badge key={eq} variant="secondary" className="text-xs">
                  {eq}
                </Badge>
              ))}
              <Badge variant={exercise.difficulty === 'beginner' ? 'outline' : 
                            exercise.difficulty === 'intermediate' ? 'default' : 
                            'destructive'} 
                     className="text-xs">
                {exercise.difficulty === 'beginner' ? 'Principiante' : 
                 exercise.difficulty === 'intermediate' ? 'Intermedio' : 
                 'Avanzado'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onClose && (
              <Button3D variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <ChevronDown className="h-4 w-4" />
              </Button3D>
            )}
          </div>
        </div>
      </Card3DHeader>
      
      <Card3DContent className="p-0">
        {/* Video o imagen del ejercicio */}
        <div className="relative">
          {exercise.videoUrl ? (
            <>
              <video
                id="exercise-video"
                src={exercise.videoUrl}
                poster={exercise.imageUrl}
                className="w-full h-48 object-cover"
                loop
                muted
                playsInline
                onClick={handleVideoToggle}
              />
              <Button3D
                variant="glass"
                size="icon"
                className="absolute bottom-2 right-2 bg-black/50 text-white border-white/20"
                onClick={handleVideoToggle}
              >
                {isVideoPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button3D>
            </>
          ) : exercise.imageUrl ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <Dumbbell className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>
        
        {/* Pestañas de información */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-3">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="technique">Técnica</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Descripción</h3>
              <p className="text-sm text-gray-600">
                {exercise.description || "No hay descripción disponible para este ejercicio."}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Músculos trabajados</h3>
              <div className="flex flex-wrap gap-1">
                {exercise.muscleGroup && exercise.muscleGroup.map(muscle => (
                  <Badge key={muscle} variant="outline" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-md p-3">
                <div className="flex items-center mb-1">
                  <Target className="h-4 w-4 text-blue-600 mr-1" />
                  <h4 className="text-xs font-medium">Último entrenamiento</h4>
                </div>
                {lastPerformance.weight ? (
                  <>
                    <p className="text-sm font-semibold">{lastPerformance.weight} kg × {lastPerformance.reps}</p>
                    <p className="text-xs text-gray-500">{lastPerformance.date}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Sin datos</p>
                )}
              </div>
              
              <div className="bg-green-50 rounded-md p-3">
                <div className="flex items-center mb-1">
                  <BarChart3 className="h-4 w-4 text-green-600 mr-1" />
                  <h4 className="text-xs font-medium">Mejor marca</h4>
                </div>
                {bestPerformance.weight ? (
                  <>
                    <p className="text-sm font-semibold">{bestPerformance.weight} kg × {bestPerformance.reps}</p>
                    <p className="text-xs text-gray-500">{bestPerformance.date}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Sin datos</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="technique" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Instrucciones</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
                <li>Colócate en posición inicial con los pies a la anchura de los hombros.</li>
                <li>Mantén la espalda recta y el core activado durante todo el movimiento.</li>
                <li>Realiza el movimiento de forma controlada, evitando impulsos.</li>
                <li>Exhala durante la fase concéntrica (esfuerzo) e inhala en la fase excéntrica (retorno).</li>
                <li>Mantén una técnica adecuada incluso cuando aumentes el peso.</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Consejos</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <Zap className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Concéntrate en la contracción muscular, no solo en mover el peso.</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Controla el tempo: 2 segundos en fase excéntrica, 1 segundo en concéntrica.</span>
                </li>
                <li className="flex items-start">
                  <Heart className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Respira adecuadamente para maximizar el rendimiento y la seguridad.</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {exerciseHistory.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Progreso</h3>
                <div className="space-y-3">
                  {exerciseHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{entry.weight} kg × {entry.reps}</p>
                          <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={
                          index === 0 ? 'default' : 
                          entry.weight > exerciseHistory[index - 1].weight ? 'success' : 
                          entry.weight < exerciseHistory[index - 1].weight ? 'destructive' : 
                          'outline'
                        }>
                          {index === 0 ? 'Último' : 
                           entry.weight > exerciseHistory[index - 1].weight ? '+' + (entry.weight - exerciseHistory[index - 1].weight) + 'kg' : 
                           entry.weight < exerciseHistory[index - 1].weight ? (entry.weight - exerciseHistory[index - 1].weight) + 'kg' : 
                           'Igual'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin historial</h3>
                <p className="text-sm text-gray-500">
                  Aún no has registrado entrenamientos con este ejercicio.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}
