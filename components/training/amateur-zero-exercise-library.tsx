"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import Image from "next/image"
import {
  Search,
  Filter,
  ChevronRight,
  Play,
  Info,
  AlertTriangle,
  CheckCircle,
  Dumbbell,
  Home,
  User
} from "lucide-react"

// Tipos para ejercicios
interface Exercise {
  id: string;
  name: string;
  technical_name: string;
  description: string;
  difficulty_level: string;
  equipment_needed: string[];
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
  video_url: string;
  image_url: string;
  instructions: string[];
  common_errors: {
    error: string;
    correction: string;
  }[];
  variations: {
    name: string;
    difficulty: string;
    description: string;
  }[];
}

export function AmateurZeroExerciseLibrary() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [equipmentFilter, setEquipmentFilter] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Cargar ejercicios para principiantes absolutos
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('difficulty_level', 'amateur_zero')
          .order('name')

        if (error) throw error

        if (data) {
          setExercises(data)
          setFilteredExercises(data)
        }
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
        toast({
          title: "Error",
          description: "No pudimos cargar los ejercicios. Por favor, intenta de nuevo.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercises()
  }, [toast])

  // Filtrar ejercicios cuando cambia la búsqueda o filtros
  useEffect(() => {
    let result = [...exercises]

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        exercise =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.technical_name.toLowerCase().includes(query) ||
          exercise.primary_muscle_group.toLowerCase().includes(query)
      )
    }

    // Filtrar por equipamiento
    if (equipmentFilter.length > 0) {
      result = result.filter(exercise =>
        equipmentFilter.some(eq => exercise.equipment_needed.includes(eq))
      )
    }

    setFilteredExercises(result)
  }, [searchQuery, equipmentFilter, exercises])

  // Manejar selección de ejercicio
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
  }

  // Manejar cambio en filtro de equipamiento
  const handleEquipmentFilterChange = (equipment: string) => {
    setEquipmentFilter(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(eq => eq !== equipment)
      } else {
        return [...prev, equipment]
      }
    })
  }

  // Volver a la lista de ejercicios
  const handleBackToList = () => {
    setSelectedExercise(null)
  }

  return (
    <div className="container mx-auto py-6">
      {selectedExercise ? (
        <ExerciseDetail
          exercise={selectedExercise}
          onBack={handleBackToList}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              Ejercicios para Principiantes
            </CardTitle>
            <CardDescription>
              Biblioteca de ejercicios diseñados especialmente para quienes comienzan desde cero
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ejercicio..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

            {showFilters && (
              <div className="mb-4 p-4 border rounded-md bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Filtrar por equipamiento:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={equipmentFilter.includes('none') ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleEquipmentFilterChange('none')}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Sin equipamiento
                  </Badge>
                  <Badge
                    variant={equipmentFilter.includes('basic') ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleEquipmentFilterChange('basic')}
                  >
                    <Home className="h-3 w-3 mr-1" />
                    Equipamiento básico
                  </Badge>
                  <Badge
                    variant={equipmentFilter.includes('gym') ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleEquipmentFilterChange('gym')}
                  >
                    <Dumbbell className="h-3 w-3 mr-1" />
                    Gimnasio
                  </Badge>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={handleSelectExercise}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium">No se encontraron ejercicios</h3>
                <p className="text-muted-foreground">
                  Intenta con otra búsqueda o ajusta los filtros
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredExercises.length} ejercicios encontrados
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

// Componente para tarjeta de ejercicio
function ExerciseCard({ exercise, onSelect }: { exercise: Exercise, onSelect: (exercise: Exercise) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(exercise)}>
      <div className="relative h-48 w-full">
        <Image
          src={exercise.image_url || "/images/exercise-placeholder.jpg"}
          alt={exercise.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg">{exercise.name}</h3>
        <p className="text-sm text-muted-foreground">{exercise.technical_name}</p>
        <div className="flex items-center mt-2 space-x-2">
          <Badge variant="secondary">{exercise.primary_muscle_group}</Badge>
          {exercise.equipment_needed.includes('none') && (
            <Badge variant="outline" className="bg-green-50">Sin equipamiento</Badge>
          )}
        </div>
        <p className="text-sm mt-2 line-clamp-2">{exercise.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button variant="ghost" size="sm" className="gap-1">
          Ver detalles
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Componente para detalles de ejercicio
function ExerciseDetail({ exercise, onBack }: { exercise: Exercise, onBack: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Volver a ejercicios
          </Button>
          <Badge>{exercise.primary_muscle_group}</Badge>
        </div>
        <CardTitle className="text-2xl mt-2">{exercise.name}</CardTitle>
        <CardDescription>{exercise.technical_name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative h-64 w-full rounded-lg overflow-hidden">
          {exercise.video_url ? (
            <div className="relative h-full w-full">
              <Image
                src={exercise.image_url || "/images/exercise-placeholder.jpg"}
                alt={exercise.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="outline" size="icon" className="rounded-full bg-background/80 h-12 w-12">
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <Image
              src={exercise.image_url || "/images/exercise-placeholder.jpg"}
              alt={exercise.name}
              fill
              className="object-cover"
            />
          )}
        </div>

        <Tabs defaultValue="instructions">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
            <TabsTrigger value="errors">Errores comunes</TabsTrigger>
            <TabsTrigger value="variations">Variantes</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Cómo realizar el ejercicio</h3>
              <ol className="space-y-2 ml-5 list-decimal">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm">{instruction}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Músculos trabajados</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary">{exercise.primary_muscle_group}</Badge>
                {exercise.secondary_muscle_groups.map((muscle, index) => (
                  <Badge key={index} variant="outline">{muscle}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Sensaciones correctas</h3>
              <div className="p-3 bg-blue-50 rounded-md text-sm">
                <Info className="h-4 w-4 inline-block mr-2 text-blue-500" />
                Deberías sentir tensión principalmente en {exercise.primary_muscle_group.toLowerCase()}.
                La técnica correcta es más importante que el peso utilizado.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Errores comunes y cómo corregirlos</h3>
            {exercise.common_errors.map((item, index) => (
              <div key={index} className="border rounded-md p-4 space-y-2">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Error: {item.error}</h4>
                  </div>
                </div>
                <div className="flex items-start ml-7">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Corrección:</h4>
                    <p className="text-sm">{item.correction}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="variations" className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Variantes del ejercicio</h3>
            {exercise.variations.length > 0 ? (
              <div className="space-y-3">
                {exercise.variations.map((variation, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">{variation.name}</h4>
                      <Badge variant={
                        variation.difficulty === 'easier' ? 'outline' :
                        variation.difficulty === 'similar' ? 'secondary' :
                        'default'
                      }>
                        {variation.difficulty === 'easier' ? 'Más fácil' :
                         variation.difficulty === 'similar' ? 'Similar' :
                         'Más difícil'}
                      </Badge>
                    </div>
                    <p className="text-sm">{variation.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No hay variantes disponibles para este ejercicio
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver a ejercicios
        </Button>
        <Button>
          Añadir a mi rutina
        </Button>
      </CardFooter>
    </Card>
  )
}
