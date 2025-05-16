"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Play, Dumbbell, Heart, Clock, ArrowLeft, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { addWorkout, searchExercises, getExercises, type Exercise } from "@/lib/supabase"

interface EjerciciosProps {
  userId: string
  onWorkoutAdded: () => void
}

export default function Ejercicios({ userId, onWorkoutAdded }: EjerciciosProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isAddingWorkout, setIsAddingWorkout] = useState(false)
  const [workoutData, setWorkoutData] = useState({
    sets: "3",
    reps: "12",
    weight: "",
    notes: ""
  })

  // Estado para ejercicios favoritos
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([])
  const [isFavoriteLoading, setIsFavoriteLoading] = useState<Record<string, boolean>>({})

  // Cargar favoritos al inicio
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { getUserFavoriteExerciseIds } = await import('../lib/exercise-favorites')
        const { data, error } = await getUserFavoriteExerciseIds()

        if (error) {
          console.error("Error al cargar favoritos:", error)
          // No mostramos toast para no interrumpir la experiencia del usuario
          // cuando no está autenticado
        }

        // data siempre será un array (vacío si hay error o no hay favoritos)
        setFavoriteExercises(data || [])
      } catch (error) {
        console.error("Error al importar funciones de favoritos:", error)
        // Establecer un array vacío para evitar errores
        setFavoriteExercises([])
      }
    }

    loadFavorites()
  }, [])

  // Función para marcar/desmarcar favoritos
  const toggleFavorite = async (exerciseId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    // Evitar múltiples clics
    if (isFavoriteLoading[exerciseId]) return

    try {
      setIsFavoriteLoading(prev => ({ ...prev, [exerciseId]: true }))

      const { toggleExerciseFavorite } = await import('../lib/exercise-favorites')
      const { error, added } = await toggleExerciseFavorite(exerciseId)

      if (error) {
        // Si el error es de autenticación, mostramos un mensaje específico
        if (error.message && error.message.includes('autenticado')) {
          toast({
            title: "Necesitas iniciar sesión",
            description: "Inicia sesión para guardar tus ejercicios favoritos",
            variant: "default",
            duration: 3000
          })
        } else {
          throw error
        }
        return
      }

      // Actualizar estado local
      setFavoriteExercises(prev => {
        if (added) {
          return [...prev, exerciseId]
        } else {
          return prev.filter(id => id !== exerciseId)
        }
      })

      toast({
        title: added ? "Añadido a favoritos" : "Eliminado de favoritos",
        duration: 1500
      })
    } catch (error) {
      console.error("Error al alternar favorito:", error)
      toast({
        title: "Error al actualizar favoritos",
        description: "Por favor, inténtalo de nuevo",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsFavoriteLoading(prev => ({ ...prev, [exerciseId]: false }))
    }
  }

  // Cargar ejercicios
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)
      try {
        // Cargar ejercicios desde Supabase
        const { data, error } = await getExercises()

        if (error) {
          throw error
        }

        if (data) {
          setExercises(data)
          setFilteredExercises(data)
        }
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExercises()
  }, [])

  // Estado para equipamiento seleccionado
  const [selectedEquipment, setSelectedEquipment] = useState("all")
  // Estado para categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState("all")
  // Estado para ordenamiento
  const [sortBy, setSortBy] = useState("popularity")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filtrar ejercicios
  useEffect(() => {
    const filterExercises = async () => {
      try {
        // Usar la función searchExercises para filtrar con parámetros ampliados
        const { data, error } = await searchExercises({
          query: searchQuery,
          muscle_group: selectedMuscleGroup !== "all" ? selectedMuscleGroup : undefined,
          difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
          equipment: selectedEquipment !== "all" ? selectedEquipment : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          sort_by: sortBy,
          sort_direction: sortDirection,
          limit: 200 // Aumentado a 200 resultados para mostrar más ejercicios
        })

        if (error) {
          throw error
        }

        if (data) {
          setFilteredExercises(data)
        }
      } catch (error) {
        console.error("Error al filtrar ejercicios:", error)
        // No mostrar toast para no interrumpir la experiencia del usuario
      }
    }

    filterExercises()
  }, [searchQuery, selectedMuscleGroup, selectedDifficulty, selectedEquipment, selectedCategory, sortBy, sortDirection])

  // Manejar selección de ejercicio
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    // Resetear datos del formulario
    setWorkoutData({
      sets: "3",
      reps: "12",
      weight: "",
      notes: ""
    })
  }

  // Manejar registro de entrenamiento
  const handleAddWorkout = async () => {
    if (!selectedExercise) return

    setIsAddingWorkout(true)

    try {
      const workout = {
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        type: selectedExercise.muscle_group === "cardio" ? "Cardio" : "Fuerza",
        name: selectedExercise.name,
        sets: workoutData.sets,
        reps: workoutData.reps,
        weight: workoutData.weight,
        notes: workoutData.notes,
      }

      const { error } = await addWorkout(workout)

      if (error) {
        throw error
      }

      toast({
        title: "Entrenamiento registrado",
        description: "El ejercicio ha sido añadido a tu registro",
      })

      // Cerrar diálogo y notificar al componente padre
      setSelectedExercise(null)
      onWorkoutAdded()
    } catch (error) {
      console.error("Error al registrar entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setIsAddingWorkout(false)
    }
  }

  // Renderizar badge de dificultad
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "principiante":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Principiante</Badge>
      case "intermedio":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Intermedio</Badge>
      case "avanzado":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Avanzado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ejercicios</h2>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar ejercicios..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              <SelectItem value="pecho">Pecho</SelectItem>
              <SelectItem value="espalda">Espalda</SelectItem>
              <SelectItem value="hombros">Hombros</SelectItem>
              <SelectItem value="biceps">Bíceps</SelectItem>
              <SelectItem value="triceps">Tríceps</SelectItem>
              <SelectItem value="antebrazos">Antebrazos</SelectItem>
              <SelectItem value="cuadriceps">Cuádriceps</SelectItem>
              <SelectItem value="isquiotibiales">Isquiotibiales</SelectItem>
              <SelectItem value="gluteos">Glúteos</SelectItem>
              <SelectItem value="pantorrillas">Pantorrillas</SelectItem>
              <SelectItem value="abdominales">Abdominales</SelectItem>
              <SelectItem value="core">Core</SelectItem>
              <SelectItem value="trapecio">Trapecio</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="principiante">Principiante</SelectItem>
              <SelectItem value="intermedio">Intermedio</SelectItem>
              <SelectItem value="avanzado">Avanzado</SelectItem>
              <SelectItem value="experto">Experto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger>
              <SelectValue placeholder="Equipamiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo equipamiento</SelectItem>
              <SelectItem value="ninguno">Sin equipamiento</SelectItem>
              <SelectItem value="mancuernas">Mancuernas</SelectItem>
              <SelectItem value="barra">Barra</SelectItem>
              <SelectItem value="maquina">Máquina</SelectItem>
              <SelectItem value="polea">Polea</SelectItem>
              <SelectItem value="kettlebell">Kettlebell</SelectItem>
              <SelectItem value="bandas">Bandas elásticas</SelectItem>
              <SelectItem value="trx">TRX</SelectItem>
              <SelectItem value="balon">Balón medicinal</SelectItem>
              <SelectItem value="fitball">Fitball</SelectItem>
              <SelectItem value="banco">Banco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="Fuerza">Fuerza</SelectItem>
              <SelectItem value="Cardio">Cardio</SelectItem>
              <SelectItem value="Flexibilidad">Flexibilidad</SelectItem>
              <SelectItem value="Equilibrio">Equilibrio</SelectItem>
              <SelectItem value="Funcional">Funcional</SelectItem>
              <SelectItem value="Pliometría">Pliometría</SelectItem>
              <SelectItem value="Isométrico">Isométrico</SelectItem>
              <SelectItem value="Rehabilitación">Rehabilitación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Ordenar por:</h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularidad</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="difficulty">Dificultad</SelectItem>
              <SelectItem value="average_rating">Valoración</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="px-2"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
        </div>

        <div className="flex items-center">
          <Badge className="ml-2">
            {filteredExercises.length} ejercicios
          </Badge>
          {filteredExercises.length === 200 && (
            <span className="text-xs text-muted-foreground ml-2">
              (Mostrando los primeros 200 resultados. Usa los filtros para encontrar más ejercicios)
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => {
        if (value === "favoritos") {
          // No cambiar la categoría cuando se selecciona favoritos
          return;
        } else if (value === "all") {
          setSelectedCategory("all");
        } else {
          setSelectedCategory(value.charAt(0).toUpperCase() + value.slice(1));
        }
      }}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="fuerza">Fuerza</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
          <TabsTrigger value="flexibilidad">Flexibilidad</TabsTrigger>
          <TabsTrigger value="favoritos" className="relative">
            Favoritos
            {favoriteExercises.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {favoriteExercises.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-md animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="space-y-4">
              {filteredExercises.map((exercise) => (
                <Dialog key={exercise.id}>
                  <DialogTrigger asChild>
                    <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo estática
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {exercise.video_url && (
                            <div className="bg-black/60 text-white p-1 rounded-full">
                              <Play className="h-3 w-3" />
                            </div>
                          )}
                          <button
                            onClick={(e) => toggleFavorite(exercise.id, e)}
                            className={`bg-black/60 p-1 rounded-full hover:bg-black/80 transition-colors ${
                              favoriteExercises.includes(exercise.id) ? 'text-yellow-400' : 'text-white'
                            }`}
                            disabled={isFavoriteLoading[exercise.id]}
                          >
                            {isFavoriteLoading[exercise.id] ? (
                              <span className="animate-spin h-3 w-3 block border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Heart className="h-3 w-3" fill={favoriteExercises.includes(exercise.id) ? "currentColor" : "none"} />
                            )}
                          </button>
                        </div>
                        {exercise.category && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/60 text-white border-none text-xs">
                              {exercise.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{exercise.name}</h3>
                          {renderDifficultyBadge(exercise.difficulty)}
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span className="capitalize">{exercise.muscle_group}</span>
                          {exercise.equipment && exercise.equipment !== "ninguno" && (
                            <>
                              <span>•</span>
                              <span>{exercise.equipment}</span>
                            </>
                          )}
                          {exercise.is_compound !== undefined && (
                            <>
                              <span>•</span>
                              <span>{exercise.is_compound ? "Compuesto" : "Aislamiento"}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{exercise.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {renderDifficultyBadge(exercise.difficulty)}
                        <Badge variant="outline" className="capitalize">{exercise.muscle_group}</Badge>
                        {exercise.category && (
                          <Badge variant="outline" className="bg-blue-50">{exercise.category}</Badge>
                        )}
                        {exercise.equipment && (
                          <Badge variant="outline" className="bg-gray-50">{exercise.equipment}</Badge>
                        )}
                      </div>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="relative h-60 overflow-hidden rounded-lg">
                        <img
                          src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo estática
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        {exercise.video_url && (
                          <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                            onClick={(e) => {
                              // Verificar que la URL sea válida
                              if (!exercise.video_url.includes('youtube.com') && !exercise.video_url.includes('youtu.be')) {
                                e.preventDefault();
                                window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(exercise.name + ' exercise tutorial'), '_blank');
                              }
                            }}
                          >
                            <Play className="h-5 w-5" />
                          </a>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Descripción</h4>
                        <p className="text-sm">{exercise.description}</p>
                      </div>

                      {exercise.instructions && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Instrucciones</h4>
                          <p className="text-sm whitespace-pre-line">{exercise.instructions}</p>
                        </div>
                      )}

                      {exercise.tips && (
                        <div className="bg-amber-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium mb-2 text-amber-800">Consejos</h4>
                          <p className="text-sm text-amber-700 whitespace-pre-line">{exercise.tips}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {exercise.calories_burned && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <h4 className="text-xs font-medium mb-1 text-blue-800">Calorías</h4>
                            <p className="text-sm text-blue-700">
                              ~{exercise.calories_burned} kcal/min
                            </p>
                          </div>
                        )}

                        {exercise.is_compound !== undefined && (
                          <div className="bg-purple-50 p-3 rounded-md">
                            <h4 className="text-xs font-medium mb-1 text-purple-800">Tipo</h4>
                            <p className="text-sm text-purple-700">
                              {exercise.is_compound ? 'Compuesto' : 'Aislamiento'}
                            </p>
                          </div>
                        )}
                      </div>

                      {exercise.secondary_muscle_groups && exercise.secondary_muscle_groups.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Músculos secundarios</h4>
                          <div className="flex flex-wrap gap-1">
                            {exercise.secondary_muscle_groups.map((muscle, idx) => (
                              <Badge key={idx} variant="outline" className="capitalize bg-gray-50">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {exercise.variations && exercise.variations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Variaciones</h4>
                          <ul className="text-sm list-disc pl-5 space-y-1">
                            {exercise.variations.map((variation, idx) => (
                              <li key={idx}>{variation}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Series</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.sets}
                            onChange={(e) => setWorkoutData({ ...workoutData, sets: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Repeticiones</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.reps}
                            onChange={(e) => setWorkoutData({ ...workoutData, reps: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Peso (kg, opcional)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={workoutData.weight}
                          onChange={(e) => setWorkoutData({ ...workoutData, weight: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Notas</label>
                        <Input
                          value={workoutData.notes}
                          onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                          placeholder="Añade notas sobre tu entrenamiento"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => handleAddWorkout()}
                        disabled={isAddingWorkout}
                        className="w-full"
                      >
                        {isAddingWorkout ? (
                          <>
                            <Play className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Dumbbell className="mr-2 h-4 w-4" />
                            Registrar entrenamiento
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No se encontraron ejercicios con los filtros seleccionados.</p>
                <Button variant="link" onClick={() => {
                  setSearchQuery("")
                  setSelectedMuscleGroup("all")
                  setSelectedDifficulty("all")
                }}>
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fuerza" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-md animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.filter(ex => ex.category === "Fuerza").length > 0 ? (
            <div className="space-y-4">
              {filteredExercises.filter(ex => ex.category === "Fuerza").map((exercise) => (
                <Dialog key={exercise.id}>
                  <DialogTrigger asChild>
                    <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo estática
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {exercise.video_url && (
                            <div className="bg-black/60 text-white p-1 rounded-full">
                              <Play className="h-3 w-3" />
                            </div>
                          )}
                          <button
                            onClick={(e) => toggleFavorite(exercise.id, e)}
                            className={`bg-black/60 p-1 rounded-full hover:bg-black/80 transition-colors ${
                              favoriteExercises.includes(exercise.id) ? 'text-yellow-400' : 'text-white'
                            }`}
                            disabled={isFavoriteLoading[exercise.id]}
                          >
                            {isFavoriteLoading[exercise.id] ? (
                              <span className="animate-spin h-3 w-3 block border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Heart className="h-3 w-3" fill={favoriteExercises.includes(exercise.id) ? "currentColor" : "none"} />
                            )}
                          </button>
                        </div>
                        {exercise.category && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/60 text-white border-none text-xs">
                              {exercise.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{exercise.name}</h3>
                          {renderDifficultyBadge(exercise.difficulty)}
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span className="capitalize">{exercise.muscle_group}</span>
                          {exercise.equipment && exercise.equipment !== "ninguno" && (
                            <>
                              <span>•</span>
                              <span>{exercise.equipment}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{exercise.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {renderDifficultyBadge(exercise.difficulty)}
                        <Badge variant="outline" className="capitalize">{exercise.muscle_group}</Badge>
                        {exercise.category && (
                          <Badge variant="outline" className="bg-blue-50">{exercise.category}</Badge>
                        )}
                        {exercise.equipment && (
                          <Badge variant="outline" className="bg-gray-50">{exercise.equipment}</Badge>
                        )}
                      </div>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="relative h-60 overflow-hidden rounded-lg">
                        <img
                          src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo estática
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        {exercise.video_url && (
                          <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                            onClick={(e) => {
                              // Verificar que la URL sea válida
                              if (!exercise.video_url.includes('youtube.com') && !exercise.video_url.includes('youtu.be')) {
                                e.preventDefault();
                                window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(exercise.name + ' exercise tutorial'), '_blank');
                              }
                            }}
                          >
                            <Play className="h-5 w-5" />
                          </a>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Descripción</h4>
                        <p className="text-sm">{exercise.description}</p>
                      </div>

                      {exercise.instructions && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Instrucciones</h4>
                          <p className="text-sm whitespace-pre-line">{exercise.instructions}</p>
                        </div>
                      )}

                      {exercise.tips && (
                        <div className="bg-amber-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium mb-2 text-amber-800">Consejos</h4>
                          <p className="text-sm text-amber-700 whitespace-pre-line">{exercise.tips}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {exercise.calories_burned && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <h4 className="text-xs font-medium mb-1 text-blue-800">Calorías</h4>
                            <p className="text-sm text-blue-700">
                              ~{exercise.calories_burned} kcal/min
                            </p>
                          </div>
                        )}

                        {exercise.is_compound !== undefined && (
                          <div className="bg-purple-50 p-3 rounded-md">
                            <h4 className="text-xs font-medium mb-1 text-purple-800">Tipo</h4>
                            <p className="text-sm text-purple-700">
                              {exercise.is_compound ? 'Compuesto' : 'Aislamiento'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Series</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.sets}
                            onChange={(e) => setWorkoutData({ ...workoutData, sets: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Repeticiones</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.reps}
                            onChange={(e) => setWorkoutData({ ...workoutData, reps: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Peso (kg, opcional)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={workoutData.weight}
                          onChange={(e) => setWorkoutData({ ...workoutData, weight: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Notas</label>
                        <Input
                          value={workoutData.notes}
                          onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                          placeholder="Añade notas sobre tu entrenamiento"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => handleAddWorkout()}
                        disabled={isAddingWorkout}
                        className="w-full"
                      >
                        {isAddingWorkout ? (
                          <>
                            <Play className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Dumbbell className="mr-2 h-4 w-4" />
                            Registrar entrenamiento
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No se encontraron ejercicios de fuerza con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cardio" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-md animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.filter(ex => ex.category === "Cardio").length > 0 ? (
            <div className="space-y-4">
              {filteredExercises.filter(ex => ex.category === "Cardio").map((exercise) => (
                <Dialog key={exercise.id}>
                  <DialogTrigger asChild>
                    <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                      {/* Contenido similar a la pestaña de fuerza */}
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{exercise.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {renderDifficultyBadge(exercise.difficulty)}
                        <Badge variant="outline" className="capitalize">{exercise.muscle_group}</Badge>
                        {exercise.category && (
                          <Badge variant="outline" className="bg-blue-50">{exercise.category}</Badge>
                        )}
                        {exercise.equipment && (
                          <Badge variant="outline" className="bg-gray-50">{exercise.equipment}</Badge>
                        )}
                      </div>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="relative h-60 overflow-hidden rounded-lg">
                        <img
                          src={exercise.image_url || 'https://source.unsplash.com/featured/800x600?fitness,exercise'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo
                            e.currentTarget.src = 'https://source.unsplash.com/featured/800x600?fitness,exercise';
                          }}
                        />
                        {exercise.video_url && (
                          <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                            onClick={(e) => {
                              // Verificar que la URL sea válida
                              if (!exercise.video_url.includes('youtube.com') && !exercise.video_url.includes('youtu.be')) {
                                e.preventDefault();
                                window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(exercise.name + ' exercise tutorial'), '_blank');
                              }
                            }}
                          >
                            <Play className="h-5 w-5" />
                          </a>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Descripción</h4>
                        <p className="text-sm">{exercise.description}</p>
                      </div>

                      {exercise.instructions && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Instrucciones</h4>
                          <p className="text-sm whitespace-pre-line">{exercise.instructions}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Duración (min)</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.duration || "30"}
                            onChange={(e) => setWorkoutData({ ...workoutData, duration: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Intensidad</label>
                          <Select
                            value={workoutData.intensity || "media"}
                            onValueChange={(value) => setWorkoutData({ ...workoutData, intensity: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona intensidad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baja">Baja</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Notas</label>
                        <Input
                          value={workoutData.notes}
                          onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                          placeholder="Añade notas sobre tu entrenamiento"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => handleAddWorkout()}
                        disabled={isAddingWorkout}
                        className="w-full"
                      >
                        {isAddingWorkout ? (
                          <>
                            <Play className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Dumbbell className="mr-2 h-4 w-4" />
                            Registrar entrenamiento
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No se encontraron ejercicios de cardio con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flexibilidad" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-md animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.filter(ex => ex.category === "Flexibilidad").length > 0 ? (
            <div className="space-y-4">
              {filteredExercises.filter(ex => ex.category === "Flexibilidad").map((exercise) => (
                <Dialog key={exercise.id}>
                  <DialogTrigger asChild>
                    <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo estática
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {exercise.video_url && (
                            <div className="bg-black/60 text-white p-1 rounded-full">
                              <Play className="h-3 w-3" />
                            </div>
                          )}
                          <button
                            onClick={(e) => toggleFavorite(exercise.id, e)}
                            className="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                            disabled={isFavoriteLoading[exercise.id]}
                          >
                            {isFavoriteLoading[exercise.id] ? (
                              <span className="animate-spin h-3 w-3 block border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Heart className="h-3 w-3" fill={favoriteExercises.includes(exercise.id) ? "currentColor" : "none"} />
                            )}
                          </button>
                        </div>
                        {exercise.category && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/60 text-white border-none text-xs">
                              {exercise.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{exercise.name}</h3>
                          {renderDifficultyBadge(exercise.difficulty)}
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span className="capitalize">{exercise.muscle_group}</span>
                          {exercise.equipment && exercise.equipment !== "ninguno" && (
                            <>
                              <span>•</span>
                              <span>{exercise.equipment}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{exercise.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {renderDifficultyBadge(exercise.difficulty)}
                        <Badge variant="outline" className="capitalize">{exercise.muscle_group}</Badge>
                        {exercise.category && (
                          <Badge variant="outline" className="bg-blue-50">{exercise.category}</Badge>
                        )}
                        {exercise.equipment && (
                          <Badge variant="outline" className="bg-gray-50">{exercise.equipment}</Badge>
                        )}
                      </div>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="relative h-60 overflow-hidden rounded-lg">
                        <img
                          src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, usar una imagen de respaldo estática
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        {exercise.video_url && (
                          <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                            onClick={(e) => {
                              // Verificar que la URL sea válida
                              if (!exercise.video_url.includes('youtube.com') && !exercise.video_url.includes('youtu.be')) {
                                e.preventDefault();
                                window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(exercise.name + ' exercise tutorial'), '_blank');
                              }
                            }}
                          >
                            <Play className="h-5 w-5" />
                          </a>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Descripción</h4>
                        <p className="text-sm">{exercise.description}</p>
                      </div>

                      {exercise.instructions && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Instrucciones</h4>
                          <p className="text-sm whitespace-pre-line">{exercise.instructions}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Duración (min)</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.duration || "15"}
                            onChange={(e) => setWorkoutData({ ...workoutData, duration: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Repeticiones</label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutData.reps || "3"}
                            onChange={(e) => setWorkoutData({ ...workoutData, reps: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Notas</label>
                        <Input
                          value={workoutData.notes}
                          onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                          placeholder="Añade notas sobre tu entrenamiento"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => handleAddWorkout()}
                        disabled={isAddingWorkout}
                        className="w-full"
                      >
                        {isAddingWorkout ? (
                          <>
                            <Play className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Dumbbell className="mr-2 h-4 w-4" />
                            Registrar entrenamiento
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No se encontraron ejercicios de flexibilidad con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favoritos" className="mt-0">
          {favoriteExercises.length > 0 ? (
            <div className="space-y-4">
              {filteredExercises
                .filter(ex => favoriteExercises.includes(ex.id))
                .map((exercise) => (
                  <Dialog key={exercise.id}>
                    <DialogTrigger asChild>
                      <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="relative h-40 overflow-hidden rounded-t-lg">
                          <img
                            src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Si la imagen falla, usar una imagen de respaldo estática
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            {exercise.video_url && (
                              <div className="bg-black/60 text-white p-1 rounded-full">
                                <Play className="h-3 w-3" />
                              </div>
                            )}
                            <button
                              onClick={(e) => toggleFavorite(exercise.id, e)}
                              className="bg-black/60 text-yellow-400 p-1 rounded-full hover:bg-black/80 transition-colors"
                              disabled={isFavoriteLoading[exercise.id]}
                            >
                              {isFavoriteLoading[exercise.id] ? (
                                <span className="animate-spin h-3 w-3 block border-2 border-yellow-400 border-t-transparent rounded-full" />
                              ) : (
                                <Heart className="h-3 w-3" fill="currentColor" />
                              )}
                            </button>
                          </div>
                          {exercise.category && (
                            <div className="absolute bottom-2 left-2">
                              <Badge variant="secondary" className="bg-black/60 text-white border-none text-xs">
                                {exercise.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{exercise.name}</h3>
                            {renderDifficultyBadge(exercise.difficulty)}
                          </div>
                          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                            <span className="capitalize">{exercise.muscle_group}</span>
                            {exercise.equipment && exercise.equipment !== "ninguno" && (
                              <>
                                <span>•</span>
                                <span>{exercise.equipment}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{exercise.name}</DialogTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {renderDifficultyBadge(exercise.difficulty)}
                          <Badge variant="outline" className="capitalize">{exercise.muscle_group}</Badge>
                          {exercise.category && (
                            <Badge variant="outline" className="bg-blue-50">{exercise.category}</Badge>
                          )}
                          {exercise.equipment && (
                            <Badge variant="outline" className="bg-gray-50">{exercise.equipment}</Badge>
                          )}
                        </div>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div className="relative h-60 overflow-hidden rounded-lg">
                          <img
                            src={exercise.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Si la imagen falla, usar una imagen de respaldo estática
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          {exercise.video_url && (
                            <a
                              href={exercise.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                              onClick={(e) => {
                                // Verificar que la URL sea válida
                                if (!exercise.video_url.includes('youtube.com') && !exercise.video_url.includes('youtu.be')) {
                                  e.preventDefault();
                                  window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(exercise.name + ' exercise tutorial'), '_blank');
                                }
                              }}
                            >
                              <Play className="h-5 w-5" />
                            </a>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Descripción</h4>
                          <p className="text-sm">{exercise.description}</p>
                        </div>

                        {exercise.instructions && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Instrucciones</h4>
                            <p className="text-sm whitespace-pre-line">{exercise.instructions}</p>
                          </div>
                        )}

                        {exercise.tips && (
                          <div className="bg-amber-50 p-3 rounded-md">
                            <h4 className="text-sm font-medium mb-2 text-amber-800">Consejos</h4>
                            <p className="text-sm text-amber-700 whitespace-pre-line">{exercise.tips}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          {exercise.calories_burned && (
                            <div className="bg-blue-50 p-3 rounded-md">
                              <h4 className="text-xs font-medium mb-1 text-blue-800">Calorías</h4>
                              <p className="text-sm text-blue-700">
                                ~{exercise.calories_burned} kcal/min
                              </p>
                            </div>
                          )}

                          {exercise.is_compound !== undefined && (
                            <div className="bg-purple-50 p-3 rounded-md">
                              <h4 className="text-xs font-medium mb-1 text-purple-800">Tipo</h4>
                              <p className="text-sm text-purple-700">
                                {exercise.is_compound ? 'Compuesto' : 'Aislamiento'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Series</label>
                            <Input
                              type="number"
                              min="1"
                              value={workoutData.sets}
                              onChange={(e) => setWorkoutData({ ...workoutData, sets: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Repeticiones</label>
                            <Input
                              type="number"
                              min="1"
                              value={workoutData.reps}
                              onChange={(e) => setWorkoutData({ ...workoutData, reps: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Peso (kg, opcional)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={workoutData.weight}
                            onChange={(e) => setWorkoutData({ ...workoutData, weight: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Notas</label>
                          <Input
                            value={workoutData.notes}
                            onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                            placeholder="Añade notas sobre tu entrenamiento"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={() => handleAddWorkout()}
                          disabled={isAddingWorkout}
                          className="w-full"
                        >
                          {isAddingWorkout ? (
                            <>
                              <Play className="mr-2 h-4 w-4 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            <>
                              <Dumbbell className="mr-2 h-4 w-4" />
                              Registrar entrenamiento
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No tienes ejercicios favoritos</p>
                <p className="text-sm text-gray-400 mt-1">Marca ejercicios como favoritos para acceder rápidamente a ellos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
