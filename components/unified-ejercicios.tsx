"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Play, Dumbbell, Heart, Clock, ArrowLeft, ArrowRight, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { addWorkout, searchExercises, getExercises, type Exercise } from "@/lib/supabase"
import { getUserFavoriteExerciseIds, toggleExerciseFavorite } from "@/lib/exercise-favorites"
import { Skeleton } from "@/components/ui/skeleton"

interface UnifiedEjerciciosProps {
  userId: string
  onWorkoutAdded?: () => void
  isStandalone?: boolean
  isOrganic?: boolean
}

export default function UnifiedEjercicios({ userId, onWorkoutAdded, isStandalone = false, isOrganic = false }: UnifiedEjerciciosProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isAddingWorkout, setIsAddingWorkout] = useState(false)
  const [workoutData, setWorkoutData] = useState({
    sets: "3",
    reps: "12",
    weight: "",
    notes: ""
  })
  const [favoriteExerciseIds, setFavoriteExerciseIds] = useState<string[]>([])
  const [favoriteExercises, setFavoriteExercises] = useState<Exercise[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [exercisesPerPage] = useState(12)
  const [activeTab, setActiveTab] = useState("all")

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
          setTotalPages(Math.ceil(data.length / exercisesPerPage))
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
  }, [exercisesPerPage])

  // Cargar favoritos
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { data, error } = await getUserFavoriteExerciseIds()

        if (error) {
          throw error
        }

        if (data) {
          setFavoriteExerciseIds(data)
        }
      } catch (error) {
        console.error("Error al cargar favoritos:", error)
      }
    }

    if (userId) {
      loadFavorites()
    }
  }, [userId])

  // Actualizar ejercicios favoritos cuando cambian los IDs o los ejercicios
  useEffect(() => {
    const favExercises = exercises.filter(ex => favoriteExerciseIds.includes(ex.id))
    setFavoriteExercises(favExercises)
  }, [favoriteExerciseIds, exercises])

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
          setTotalPages(Math.ceil(data.length / exercisesPerPage))
          setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
        }
      } catch (error) {
        console.error("Error al filtrar ejercicios:", error)
        // No mostrar toast para no interrumpir la experiencia del usuario
      }
    }

    filterExercises()
  }, [searchQuery, selectedMuscleGroup, selectedDifficulty, selectedEquipment, selectedCategory, sortBy, sortDirection, exercisesPerPage])

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
      if (onWorkoutAdded) {
        onWorkoutAdded()
      }
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

  // Manejar favoritos
  const handleToggleFavorite = async (exerciseId: string) => {
    try {
      const { error } = await toggleExerciseFavorite(exerciseId)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setFavoriteExerciseIds(prev => {
        if (prev.includes(exerciseId)) {
          return prev.filter(id => id !== exerciseId)
        } else {
          return [...prev, exerciseId]
        }
      })

      toast({
        title: favoriteExerciseIds.includes(exerciseId)
          ? "Eliminado de favoritos"
          : "Añadido a favoritos",
        description: "Tu lista de favoritos ha sido actualizada",
      })
    } catch (error) {
      console.error("Error al actualizar favorito:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la lista de favoritos",
        variant: "destructive",
      })
    }
  }

  // Renderizar badge de dificultad
  const renderDifficultyBadge = (difficulty: string) => {
    let color = "bg-gray-100"

    switch (difficulty?.toLowerCase()) {
      case "principiante":
      case "beginner":
        color = "bg-green-100 text-green-800"
        break
      case "intermedio":
      case "intermediate":
        color = "bg-yellow-100 text-yellow-800"
        break
      case "avanzado":
      case "advanced":
        color = "bg-red-100 text-red-800"
        break
    }

    return (
      <Badge variant="outline" className={`${color} border-0`}>
        {difficulty}
      </Badge>
    )
  }

  // Obtener ejercicios para la página actual
  const getCurrentPageExercises = () => {
    const startIndex = (currentPage - 1) * exercisesPerPage
    const endIndex = startIndex + exercisesPerPage

    if (activeTab === "favoritos") {
      return favoriteExercises.slice(startIndex, endIndex)
    }

    if (activeTab === "fuerza") {
      return filteredExercises
        .filter(ex => ex.category === "Fuerza" || ex.category === "Strength")
        .slice(startIndex, endIndex)
    }

    if (activeTab === "cardio") {
      return filteredExercises
        .filter(ex => ex.category === "Cardio")
        .slice(startIndex, endIndex)
    }

    if (activeTab === "flexibilidad") {
      return filteredExercises
        .filter(ex => ex.category === "Flexibilidad" || ex.category === "Flexibility")
        .slice(startIndex, endIndex)
    }

    return filteredExercises.slice(startIndex, endIndex)
  }

  // Renderizar tarjeta de ejercicio
  const renderExerciseCard = (exercise: Exercise) => (
    <Dialog key={exercise.id}>
      <DialogTrigger asChild>
        <Card
          className={`cursor-pointer ${isOrganic ? 'hover:shadow-lg transition-shadow' : 'border-none shadow-md hover:shadow-lg transition-shadow'}`}
          organic={isOrganic}
          hover={isOrganic}
        >
          <div className={`relative h-40 bg-gray-100 ${isOrganic ? 'rounded-xl' : 'rounded-t-lg'} overflow-hidden`}>
            <img
              src={exercise.image_url || "/placeholder.svg"}
              alt={exercise.name}
              className="h-full w-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite(exercise.id)
              }}
            >
              <Heart
                className={`h-4 w-4 ${favoriteExerciseIds.includes(exercise.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
              />
            </Button>
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

        <div className="space-y-4">
          {exercise.image_url && (
            <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Descripción</h4>
            <p className="text-sm text-gray-600">{exercise.description}</p>
          </div>

          {exercise.instructions && (
            <div>
              <h4 className="font-medium mb-2">Instrucciones</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {typeof exercise.instructions === 'string'
                  ? exercise.instructions.split('\n').map((line, i) => <p key={i}>{line}</p>)
                  : Object.entries(exercise.instructions).map(([key, value]) => (
                      <p key={key}>{key}: {value}</p>
                    ))
                }
              </div>
            </div>
          )}

          {userId && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Registrar entrenamiento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Series</label>
                    <Input
                      type="number"
                      value={workoutData.sets}
                      onChange={(e) => setWorkoutData({...workoutData, sets: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Repeticiones</label>
                    <Input
                      value={workoutData.reps}
                      onChange={(e) => setWorkoutData({...workoutData, reps: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Peso (kg)</label>
                    <Input
                      value={workoutData.weight}
                      onChange={(e) => setWorkoutData({...workoutData, weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notas</label>
                    <Input
                      value={workoutData.notes}
                      onChange={(e) => setWorkoutData({...workoutData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className={isOrganic ? "rounded-full" : ""}
                  onClick={() => handleToggleFavorite(exercise.id)}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${favoriteExerciseIds.includes(exercise.id) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  {favoriteExerciseIds.includes(exercise.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                </Button>
                <Button
                  className={isOrganic ? "rounded-full" : ""}
                  onClick={handleAddWorkout}
                  disabled={isAddingWorkout}
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  {isAddingWorkout ? 'Registrando...' : 'Registrar entrenamiento'}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  // Renderizar contenido principal
  return (
    <div className="space-y-6 py-4">
      {!isOrganic && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{isStandalone ? "Biblioteca de Ejercicios" : "Ejercicios"}</h2>
          {isStandalone && (
            <p className="text-muted-foreground">
              Explora nuestra colección de ejercicios con instrucciones detalladas
            </p>
          )}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar ejercicios..."
          className={`pl-10 ${isOrganic ? 'rounded-full' : ''}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
          <SelectTrigger className={`w-full sm:w-[180px] ${isOrganic ? 'rounded-full' : ''}`}>
            <SelectValue placeholder="Grupo muscular" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grupos</SelectItem>
            <SelectItem value="chest">Pecho</SelectItem>
            <SelectItem value="back">Espalda</SelectItem>
            <SelectItem value="shoulders">Hombros</SelectItem>
            <SelectItem value="arms">Brazos</SelectItem>
            <SelectItem value="legs">Piernas</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="full_body">Cuerpo completo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className={`w-full sm:w-[180px] ${isOrganic ? 'rounded-full' : ''}`}>
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="beginner">Principiante</SelectItem>
            <SelectItem value="intermediate">Intermedio</SelectItem>
            <SelectItem value="advanced">Avanzado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
          <SelectTrigger className={`w-full sm:w-[180px] ${isOrganic ? 'rounded-full' : ''}`}>
            <SelectValue placeholder="Equipamiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="none">Sin equipamiento</SelectItem>
            <SelectItem value="dumbbells">Mancuernas</SelectItem>
            <SelectItem value="barbell">Barra</SelectItem>
            <SelectItem value="kettlebell">Kettlebell</SelectItem>
            <SelectItem value="resistance_bands">Bandas elásticas</SelectItem>
            <SelectItem value="machine">Máquina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid grid-cols-5 mb-4 ${isOrganic ? 'rounded-full p-1' : ''}`}>
          <TabsTrigger value="all" className={isOrganic ? "rounded-full" : ""}>Todos</TabsTrigger>
          <TabsTrigger value="fuerza" className={isOrganic ? "rounded-full" : ""}>Fuerza</TabsTrigger>
          <TabsTrigger value="cardio" className={isOrganic ? "rounded-full" : ""}>Cardio</TabsTrigger>
          <TabsTrigger value="flexibilidad" className={isOrganic ? "rounded-full" : ""}>Flexibilidad</TabsTrigger>
          <TabsTrigger value="favoritos" className={`relative ${isOrganic ? "rounded-full" : ""}`}>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : getCurrentPageExercises().length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getCurrentPageExercises().map(exercise => renderExerciseCard(exercise))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Filter className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No se encontraron ejercicios</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No hay ejercicios que coincidan con tus criterios de búsqueda. Intenta ajustar los filtros.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fuerza" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : filteredExercises.filter(ex => ex.category === "Fuerza" || ex.category === "Strength").length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getCurrentPageExercises().map(exercise => renderExerciseCard(exercise))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Info className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No hay ejercicios de fuerza</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No se encontraron ejercicios de fuerza con los filtros actuales.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cardio" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : filteredExercises.filter(ex => ex.category === "Cardio").length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getCurrentPageExercises().map(exercise => renderExerciseCard(exercise))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Info className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No hay ejercicios de cardio</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No se encontraron ejercicios de cardio con los filtros actuales.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="flexibilidad" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : filteredExercises.filter(ex => ex.category === "Flexibilidad" || ex.category === "Flexibility").length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getCurrentPageExercises().map(exercise => renderExerciseCard(exercise))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Info className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No hay ejercicios de flexibilidad</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No se encontraron ejercicios de flexibilidad con los filtros actuales.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favoritos" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : favoriteExercises.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getCurrentPageExercises().map(exercise => renderExerciseCard(exercise))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Heart className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No tienes favoritos</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Marca ejercicios como favoritos para acceder a ellos rápidamente.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
