"use client"

import { useState, useEffect } from "react"
import { Exercise } from "@/lib/types/training"
import { getExercises } from "@/lib/training-service"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import {
  Search,
  Filter,
  Dumbbell,
  ChevronRight,
  Info,
  Play,
  Plus,
  Check,
  X,
  ArrowUpDown,
  RotateCcw
} from "lucide-react"

// Categorías de ejercicios
const CATEGORIES = [
  { id: "all", name: "Todos" },
  { id: "chest", name: "Pecho" },
  { id: "back", name: "Espalda" },
  { id: "legs", name: "Piernas" },
  { id: "shoulders", name: "Hombros" },
  { id: "arms", name: "Brazos" },
  { id: "abs", name: "Abdominales" },
  { id: "compound", name: "Compuestos" },
  { id: "isolation", name: "Aislamiento" }
]

// Equipamiento
const EQUIPMENT = [
  { id: "barbell", name: "Barra" },
  { id: "dumbbell", name: "Mancuernas" },
  { id: "machine", name: "Máquinas" },
  { id: "cable", name: "Poleas" },
  { id: "bodyweight", name: "Peso corporal" },
  { id: "kettlebell", name: "Kettlebell" },
  { id: "bands", name: "Bandas elásticas" },
  { id: "smith", name: "Máquina Smith" },
  { id: "other", name: "Otros" }
]

// Niveles de dificultad
const DIFFICULTY_LEVELS = [
  { id: "beginner", name: "Principiante" },
  { id: "intermediate", name: "Intermedio" },
  { id: "advanced", name: "Avanzado" }
]

interface ExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void
  showAddButton?: boolean
  initialFilters?: {
    category?: string
    equipment?: string[]
    difficulty?: string
    muscleGroup?: string[]
  }
}

export function ExerciseLibrary({
  onSelectExercise,
  showAddButton = false,
  initialFilters
}: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || "all")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialFilters?.equipment || [])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(initialFilters?.difficulty || "")
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(initialFilters?.muscleGroup || [])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showExerciseDetails, setShowExerciseDetails] = useState(false)

  // Cargar ejercicios
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getExercises()
        if (error) {
          console.error("Error al cargar ejercicios:", error)
          return
        }

        if (data) {
          setExercises(data)
          setFilteredExercises(data)
        }
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExercises()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let result = [...exercises]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        exercise =>
          exercise.name.toLowerCase().includes(term) ||
          exercise.description?.toLowerCase().includes(term) ||
          exercise.muscleGroup.some(muscle => muscle.toLowerCase().includes(term))
      )
    }

    // Filtrar por categoría
    if (selectedCategory && selectedCategory !== "all") {
      if (selectedCategory === "compound") {
        result = result.filter(exercise => exercise.isCompound)
      } else if (selectedCategory === "isolation") {
        result = result.filter(exercise => !exercise.isCompound)
      } else {
        result = result.filter(exercise => exercise.category === selectedCategory)
      }
    }

    // Filtrar por equipamiento
    if (selectedEquipment.length > 0) {
      result = result.filter(exercise =>
        exercise.equipment.some(eq => selectedEquipment.includes(eq))
      )
    }

    // Filtrar por dificultad
    if (selectedDifficulty) {
      result = result.filter(exercise => exercise.difficulty === selectedDifficulty)
    }

    // Filtrar por grupos musculares
    if (selectedMuscleGroups.length > 0) {
      result = result.filter(exercise =>
        exercise.muscleGroup.some(muscle => selectedMuscleGroups.includes(muscle))
      )
    }

    setFilteredExercises(result)
  }, [exercises, searchTerm, selectedCategory, selectedEquipment, selectedDifficulty, selectedMuscleGroups])

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedEquipment([])
    setSelectedDifficulty("")
    setSelectedMuscleGroups([])
  }

  // Manejar selección de ejercicio
  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise)
    } else {
      setSelectedExercise(exercise)
      setShowExerciseDetails(true)
    }
  }

  // Renderizar ejercicios alternativos
  const renderAlternatives = (exercise: Exercise) => {
    if (!exercise.alternatives || exercise.alternatives.length === 0) {
      return <p className="text-sm text-gray-500">No hay alternativas disponibles</p>
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Ejercicios alternativos:</h4>
        <div className="grid grid-cols-1 gap-2">
          {exercise.alternatives.map(altId => {
            const alt = exercises.find(ex => ex.id === altId)
            if (!alt) return null
            
            return (
              <div key={altId} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center mr-2">
                    <Dumbbell className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{alt.name}</p>
                    <p className="text-xs text-gray-500">{alt.equipment.join(", ")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectExercise(alt)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar ejercicios..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <OrganicElement type="fade">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Categoría</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Equipamiento</h3>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map(equipment => (
                    <Badge
                      key={equipment.id}
                      variant={selectedEquipment.includes(equipment.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedEquipment.includes(equipment.id)) {
                          setSelectedEquipment(selectedEquipment.filter(eq => eq !== equipment.id))
                        } else {
                          setSelectedEquipment([...selectedEquipment, equipment.id])
                        }
                      }}
                    >
                      {equipment.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Dificultad</h3>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map(level => (
                    <Badge
                      key={level.id}
                      variant={selectedDifficulty === level.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedDifficulty === level.id) {
                          setSelectedDifficulty("")
                        } else {
                          setSelectedDifficulty(level.id)
                        }
                      }}
                    >
                      {level.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Resetear filtros
                </Button>
              </div>
            </div>
          </Card>
        </OrganicElement>
      )}

      {/* Lista de ejercicios */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron ejercicios</h3>
          <p className="text-gray-500 mb-4">Prueba con otros filtros o términos de búsqueda</p>
          <Button variant="outline" onClick={resetFilters}>
            Resetear filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredExercises.map(exercise => (
            <Card key={exercise.id} className="p-3 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{exercise.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                      {exercise.isCompound ? (
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          Compuesto
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-purple-50">
                          Aislamiento
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {exercise.equipment.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{exercise.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        {exercise.imageUrl && (
                          <div className="rounded-md overflow-hidden">
                            <img
                              src={exercise.imageUrl}
                              alt={exercise.name}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium">Descripción</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {exercise.description || "No hay descripción disponible"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Grupos musculares</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exercise.muscleGroup.map(muscle => (
                              <Badge key={muscle} variant="outline" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {renderAlternatives(exercise)}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {showAddButton && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectExercise && onSelectExercise(exercise)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
