"use client"

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Exercise } from "@/lib/types/training"
import { useTraining } from "@/lib/contexts/training-context"
import { searchExercises } from "@/lib/services/exercise-service"
import { Search, Filter, Dumbbell, Loader2 } from "lucide-react"
import { ExerciseCard } from "./exercise-card"
import { useToast } from "@/components/ui/use-toast"

const muscleGroups = [
  "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", 
  "Cuádriceps", "Isquiotibiales", "Glúteos", "Abdominales", "Pantorrillas"
]

const categories = [
  "Fuerza", "Cardio", "Flexibilidad", "Equilibrio", "Funcional"
]

const difficulties = [
  "principiante", "intermedio", "avanzado"
]

export function ExerciseLibraryEnhanced() {
  const { exercises, isLoadingExercises, refreshExercises } = useTraining()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // Cargar ejercicios cuando cambie el contexto
  useEffect(() => {
    if (exercises) {
      applyFilters()
    }
  }, [exercises, selectedMuscleGroup, selectedCategory, selectedDifficulty, activeTab])

  // Función para aplicar filtros
  const applyFilters = () => {
    if (!exercises) return

    let filtered = [...exercises]

    // Filtrar por grupo muscular
    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter(ex => 
        ex.muscleGroup.some(group => 
          group.toLowerCase().includes(selectedMuscleGroup.toLowerCase())
        )
      )
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(ex => 
        ex.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    // Filtrar por dificultad
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(ex => 
        ex.difficulty === selectedDifficulty
      )
    }

    // Filtrar por tipo (pestaña activa)
    if (activeTab === "compound") {
      filtered = filtered.filter(ex => ex.isCompound)
    } else if (activeTab === "isolation") {
      filtered = filtered.filter(ex => !ex.isCompound)
    }

    setFilteredExercises(filtered)
  }

  // Función para buscar ejercicios
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      applyFilters()
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await searchExercises(searchQuery)
      
      if (error) {
        console.error("Error al buscar ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudieron buscar ejercicios",
          variant: "destructive"
        })
        return
      }
      
      setFilteredExercises(data || [])
    } catch (error) {
      console.error("Error inesperado al buscar ejercicios:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al buscar ejercicios",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value === "") {
      applyFilters()
    }
  }

  // Manejar tecla Enter en el campo de búsqueda
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Manejar selección de ejercicio
  const handleSelectExercise = (exercise: Exercise) => {
    toast({
      title: "Ejercicio seleccionado",
      description: `Has seleccionado ${exercise.name}`,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Dumbbell className="h-5 w-5 mr-2" />
          Biblioteca de Ejercicios
        </CardTitle>
        <CardDescription>
          Explora y busca ejercicios para tus rutinas de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Barra de búsqueda */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar ejercicios..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos musculares</SelectItem>
              {muscleGroups.map(group => (
                <SelectItem key={group} value={group.toLowerCase()}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las dificultades</SelectItem>
              <SelectItem value="principiante">Principiante</SelectItem>
              <SelectItem value="intermedio">Intermedio</SelectItem>
              <SelectItem value="avanzado">Avanzado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="compound">Compuestos</TabsTrigger>
            <TabsTrigger value="isolation">Aislamiento</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de ejercicios */}
        {isLoadingExercises ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onAddToWorkout={handleSelectExercise}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No se encontraron ejercicios con los filtros seleccionados</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchQuery("")
                setSelectedMuscleGroup("all")
                setSelectedCategory("all")
                setSelectedDifficulty("all")
                setActiveTab("all")
                refreshExercises()
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
