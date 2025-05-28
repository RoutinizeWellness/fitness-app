"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ArrowRight, Dumbbell, Info, Sparkles, Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { ExerciseRecommendationService } from "@/lib/exercise-recommendation-service"
import { Badge } from "@/components/ui/badge"

// Tipo para ejercicios
export interface Exercise {
  id: string
  name: string
  spanishName: string
  description?: string
  muscleGroup: string[]
  equipment?: string[]
  difficulty: string
  category?: string
  videoUrl?: string
  imageUrl?: string
  pattern?: string
  alternatives?: string[]
}

interface ExerciseAlternativeSelectorProps {
  currentExerciseId: string
  onSelectAlternative: (exercise: Exercise) => void
  onCancel: () => void
}

export function ExerciseAlternativeSelectorFixed({
  currentExerciseId,
  onSelectAlternative,
  onCancel
}: ExerciseAlternativeSelectorProps) {
  const [alternatives, setAlternatives] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"alternatives" | "all" | "search" | "ai">("alternatives")
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<{exercise: Exercise, matchScore: number, matchReason: string}[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const { toast } = useToast()

  // Cargar ejercicios al montar el componente
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)
      try {
        console.log("Intentando cargar ejercicios desde Supabase...");

        // Intentar cargar desde Supabase
        const { data: exercisesData, error } = await supabase
          .from('exercises')
          .select('*')

        if (error) {
          console.error("Error al cargar ejercicios desde Supabase:", error)
          toast({
            title: "Error de conexión",
            description: "No se pudieron cargar los ejercicios desde la base de datos. Usando datos de ejemplo.",
            variant: "destructive"
          });
          // Usar datos de ejemplo si hay error
          loadSampleExercises()
          return
        }

        if (!exercisesData || exercisesData.length === 0) {
          console.warn("No se encontraron ejercicios en la base de datos de Supabase")
          toast({
            title: "Sin datos",
            description: "No hay ejercicios disponibles en la base de datos. Usando datos de ejemplo.",
          });
          loadSampleExercises()
          return
        }

        // Cargar recomendaciones de IA
        loadAiRecommendations()

        console.log(`Cargados ${exercisesData.length} ejercicios desde Supabase`)

        // Transformar datos de Supabase al formato de Exercise
        const formattedExercises: Exercise[] = exercisesData.map(ex => ({
          id: ex.id,
          name: ex.name || "",
          spanishName: ex.spanish_name || ex.name || "",
          description: ex.description || "",
          muscleGroup: ex.muscle_group ? (Array.isArray(ex.muscle_group) ? ex.muscle_group : [ex.muscle_group]) : [],
          equipment: ex.equipment ? (Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment]) : [],
          difficulty: ex.difficulty || "intermediate",
          category: ex.category || "",
          videoUrl: ex.video_url || "",
          imageUrl: ex.image_url || "",
          pattern: ex.movement_pattern || "",
          alternatives: ex.alternatives || []
        }))

        setAllExercises(formattedExercises)

        // Encontrar el ejercicio actual
        const current = formattedExercises.find(ex => ex.id === currentExerciseId)
        setCurrentExercise(current || null)

        // Filtrar alternativas con criterios más flexibles
        if (current) {
          // Primero intentamos encontrar alternativas con el mismo patrón de movimiento
          let alts = formattedExercises.filter(ex =>
            ex.id !== currentExerciseId &&
            current.pattern && ex.pattern === current.pattern
          );

          // Si no hay suficientes alternativas con el mismo patrón, buscamos por grupo muscular
          if (alts.length < 3) {
            const muscleGroupAlts = formattedExercises.filter(ex =>
              ex.id !== currentExerciseId &&
              !alts.some(a => a.id === ex.id) && // Evitar duplicados
              current.muscleGroup.some(m => ex.muscleGroup.includes(m))
            );
            alts = [...alts, ...muscleGroupAlts];
          }

          // Si aún no hay suficientes, incluimos ejercicios con equipamiento similar
          if (alts.length < 5 && current.equipment && current.equipment.length > 0) {
            const equipmentAlts = formattedExercises.filter(ex =>
              ex.id !== currentExerciseId &&
              !alts.some(a => a.id === ex.id) && // Evitar duplicados
              ex.equipment && current.equipment.some(e => ex.equipment.includes(e))
            );
            alts = [...alts, ...equipmentAlts].slice(0, 10); // Limitar a 10 alternativas
          }

          console.log(`Encontradas ${alts.length} alternativas para ${current.name}`);
          setAlternatives(alts);
        }
      } catch (error) {
        console.error("Error al procesar ejercicios:", error)
        loadSampleExercises()
      } finally {
        setIsLoading(false)
      }
    }

    // Cargar datos de ejemplo si hay problemas con Supabase
    const loadSampleExercises = () => {
      // Datos de ejemplo ampliados
      const sampleExercises: Exercise[] = [
        {
          id: "1",
          name: "Barbell Squat",
          spanishName: "Sentadilla con Barra",
          description: "Ejercicio compuesto para piernas",
          muscleGroup: ["quadriceps", "glutes", "hamstrings"],
          equipment: ["barbell"],
          difficulty: "intermediate",
          category: "compound",
          pattern: "squat"
        },
        {
          id: "2",
          name: "Leg Press",
          spanishName: "Prensa de Piernas",
          description: "Ejercicio para cuádriceps en máquina",
          muscleGroup: ["quadriceps", "glutes"],
          equipment: ["machine"],
          difficulty: "beginner",
          category: "compound",
          pattern: "squat"
        },
        {
          id: "3",
          name: "Dumbbell Lunges",
          spanishName: "Zancadas con Mancuernas",
          description: "Ejercicio unilateral para piernas",
          muscleGroup: ["quadriceps", "glutes", "hamstrings"],
          equipment: ["dumbbell"],
          difficulty: "intermediate",
          category: "unilateral",
          pattern: "lunge"
        },
        {
          id: "4",
          name: "Bench Press",
          spanishName: "Press de Banca",
          description: "Ejercicio compuesto para pecho",
          muscleGroup: ["chest", "triceps", "shoulders"],
          equipment: ["barbell"],
          difficulty: "intermediate",
          category: "compound",
          pattern: "push"
        },
        {
          id: "5",
          name: "Pull-up",
          spanishName: "Dominadas",
          description: "Ejercicio compuesto para espalda",
          muscleGroup: ["back", "biceps"],
          equipment: ["bodyweight"],
          difficulty: "advanced",
          category: "compound",
          pattern: "pull"
        },
        {
          id: "6",
          name: "Goblet Squat",
          spanishName: "Sentadilla Goblet",
          description: "Variante de sentadilla con mancuerna",
          muscleGroup: ["quadriceps", "glutes", "core"],
          equipment: ["dumbbell", "kettlebell"],
          difficulty: "beginner",
          category: "compound",
          pattern: "squat"
        },
        {
          id: "7",
          name: "Bulgarian Split Squat",
          spanishName: "Sentadilla Búlgara",
          description: "Ejercicio unilateral para piernas",
          muscleGroup: ["quadriceps", "glutes", "hamstrings"],
          equipment: ["bodyweight", "dumbbell"],
          difficulty: "intermediate",
          category: "unilateral",
          pattern: "squat"
        },
        {
          id: "8",
          name: "Dumbbell Bench Press",
          spanishName: "Press de Banca con Mancuernas",
          description: "Variante del press de banca con mancuernas",
          muscleGroup: ["chest", "triceps", "shoulders"],
          equipment: ["dumbbell"],
          difficulty: "intermediate",
          category: "compound",
          pattern: "push"
        },
        {
          id: "9",
          name: "Incline Bench Press",
          spanishName: "Press de Banca Inclinado",
          description: "Variante del press de banca en banco inclinado",
          muscleGroup: ["chest", "triceps", "shoulders"],
          equipment: ["barbell"],
          difficulty: "intermediate",
          category: "compound",
          pattern: "push"
        },
        {
          id: "10",
          name: "Lat Pulldown",
          spanishName: "Jalón al Pecho",
          description: "Ejercicio para espalda en máquina",
          muscleGroup: ["back", "biceps"],
          equipment: ["machine", "cable"],
          difficulty: "beginner",
          category: "compound",
          pattern: "pull"
        },
        {
          id: "11",
          name: "Seated Row",
          spanishName: "Remo Sentado",
          description: "Ejercicio para espalda en máquina",
          muscleGroup: ["back", "biceps"],
          equipment: ["machine", "cable"],
          difficulty: "beginner",
          category: "compound",
          pattern: "pull"
        },
        {
          id: "12",
          name: "Hack Squat",
          spanishName: "Sentadilla Hack",
          description: "Variante de sentadilla en máquina",
          muscleGroup: ["quadriceps", "glutes"],
          equipment: ["machine"],
          difficulty: "intermediate",
          category: "compound",
          pattern: "squat"
        }
      ]

      setAllExercises(sampleExercises)

      // Encontrar el ejercicio actual (o usar el primero como ejemplo)
      const current = sampleExercises.find(ex => ex.id === currentExerciseId) || sampleExercises[0]
      setCurrentExercise(current)

      // Filtrar alternativas con criterios más flexibles (igual que arriba)
      let alts = sampleExercises.filter(ex =>
        ex.id !== current.id &&
        current.pattern && ex.pattern === current.pattern
      );

      // Si no hay suficientes alternativas con el mismo patrón, buscamos por grupo muscular
      if (alts.length < 3) {
        const muscleGroupAlts = sampleExercises.filter(ex =>
          ex.id !== current.id &&
          !alts.some(a => a.id === ex.id) && // Evitar duplicados
          current.muscleGroup.some(m => ex.muscleGroup.includes(m))
        );
        alts = [...alts, ...muscleGroupAlts];
      }

      // Si aún no hay suficientes, incluimos todos los demás ejercicios como posibles alternativas
      if (alts.length < 3) {
        const otherAlts = sampleExercises.filter(ex =>
          ex.id !== current.id &&
          !alts.some(a => a.id === ex.id) // Evitar duplicados
        );
        alts = [...alts, ...otherAlts];
      }

      console.log(`Encontradas ${alts.length} alternativas de ejemplo para ${current.name}`);
      setAlternatives(alts)
    }

    loadExercises()
  }, [currentExerciseId])

  // Cargar recomendaciones de ejercicios alternativos usando IA
  const loadAiRecommendations = async () => {
    if (!currentExercise) return;

    try {
      setIsLoadingRecommendations(true)
      setActiveTab("ai") // Asegurar que la pestaña de IA esté activa

      // Obtener recomendaciones del servicio de IA
      const recommendations = await ExerciseRecommendationService.getAlternativeExercises(
        currentExercise,
        {
          preferSamePattern: true,
          preferSameEquipment: true,
          maxResults: 8,
          excludeIds: [currentExerciseId],
          userEquipment: currentExercise.equipment || []
        }
      )

      // Si no hay recomendaciones, usar alternativas como fallback
      if (recommendations.length === 0) {
        // Convertir alternativas a formato de recomendación
        const fallbackRecommendations = alternatives.map(alt => ({
          exercise: alt,
          matchScore: 50, // Puntuación predeterminada
          matchReason: "Alternativa basada en criterios similares"
        }));

        setAiRecommendations(fallbackRecommendations)
        console.log("Usando alternativas como recomendaciones:", fallbackRecommendations.length)
      } else {
        setAiRecommendations(recommendations)
        console.log("Recomendaciones de IA cargadas:", recommendations.length)
      }
    } catch (error) {
      console.error("Error al cargar recomendaciones de IA:", error)

      // Usar alternativas como fallback
      const fallbackRecommendations = alternatives.map(alt => ({
        exercise: alt,
        matchScore: 50,
        matchReason: "Alternativa basada en criterios similares"
      }));

      setAiRecommendations(fallbackRecommendations)
      toast({
        title: "Usando alternativas",
        description: "Se están mostrando alternativas basadas en criterios similares",
        variant: "default"
      })
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Filtrar ejercicios por búsqueda
  const filteredExercises = searchQuery.trim() === ""
    ? allExercises
    : allExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.spanishName.toLowerCase().includes(searchQuery.toLowerCase())
      )

  // Manejar selección de ejercicio
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
  }

  // Confirmar selección
  const handleConfirmSelection = () => {
    if (selectedExercise) {
      onSelectAlternative(selectedExercise)
    } else {
      toast({
        title: "Selección requerida",
        description: "Por favor, selecciona un ejercicio alternativo",
        variant: "destructive"
      })
    }
  }

  // Renderizar lista de ejercicios
  const renderExerciseList = (exercises: Exercise[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {exercises.length === 0 ? (
          <div className="text-center py-4 text-gray-700 dark:text-gray-300">
            <div className="flex flex-col items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <p className="font-medium">No se encontraron ejercicios alternativos</p>
              <p className="text-xs">Prueba con la pestaña "Todos" para ver todos los ejercicios disponibles</p>
            </div>
          </div>
        ) : (
          exercises.map(exercise => (
            <div
              key={exercise.id}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                selectedExercise?.id === exercise.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted/50 border border-transparent'
              }`}
              onClick={() => handleSelectExercise(exercise)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-black dark:text-white">{exercise.spanishName}</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{exercise.name}</p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.muscleGroup.map(muscle => (
                      <span
                        key={muscle}
                        className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.difficulty && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    exercise.difficulty === 'beginner'
                      ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100'
                      : exercise.difficulty === 'advanced'
                        ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
                        : 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100'
                  }`}>
                    {exercise.difficulty === 'beginner'
                      ? 'Principiante'
                      : exercise.difficulty === 'advanced'
                        ? 'Avanzado'
                        : 'Intermedio'
                    }
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Alternativas para ejercicio</h2>
          {currentExercise && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Selecciona una alternativa para <span className="font-medium text-black dark:text-white">{currentExercise.spanishName}</span>
            </p>
          )}
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium">
          <Dumbbell className="h-4 w-4 mr-1" />
          <span>{alternatives.length} alternativas disponibles</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="alternatives">Alternativas</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
            IA
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
        </TabsList>

        <TabsContent value="alternatives">
          <ScrollArea className="h-[400px] pr-4">
            {renderExerciseList(alternatives)}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ai">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
              <Brain className="h-4 w-4 mr-1 text-primary" />
              <span>Recomendaciones inteligentes basadas en patrones de movimiento</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAiRecommendations}
              disabled={isLoadingRecommendations}
            >
              {isLoadingRecommendations ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              ) : null}
              Actualizar
            </Button>
          </div>

          <ScrollArea className="h-[370px] pr-4">
            {isLoadingRecommendations ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="space-y-3">
                {aiRecommendations.map(rec => (
                  <div
                    key={rec.exercise.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedExercise?.id === rec.exercise.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                    onClick={() => handleSelectExercise(rec.exercise)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-black dark:text-white">{rec.exercise.spanishName}</h3>
                          <Badge className="ml-2 text-xs font-medium" variant="secondary">
                            {Math.round(rec.matchScore)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{rec.exercise.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">{rec.matchReason}</p>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.exercise.muscleGroup.map(muscle => (
                            <span
                              key={muscle}
                              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>

                      {rec.exercise.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          rec.exercise.difficulty === 'beginner'
                            ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100'
                            : rec.exercise.difficulty === 'advanced'
                              ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
                              : 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100'
                        }`}>
                          {rec.exercise.difficulty === 'beginner'
                            ? 'Principiante'
                            : rec.exercise.difficulty === 'advanced'
                              ? 'Avanzado'
                              : 'Intermedio'
                          }
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-700 dark:text-gray-300">
                <div className="flex flex-col items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <p className="font-medium">No se encontraron recomendaciones de IA</p>
                  <p className="text-xs">Intenta actualizar o seleccionar otra pestaña</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="all">
          <ScrollArea className="h-[400px] pr-4">
            {renderExerciseList(allExercises.filter(ex => ex.id !== currentExerciseId))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Input
                placeholder="Buscar ejercicio..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[350px] pr-4">
              {renderExerciseList(filteredExercises.filter(ex => ex.id !== currentExerciseId))}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleConfirmSelection} disabled={!selectedExercise}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Seleccionar
        </Button>
      </div>
    </div>
  )
}
