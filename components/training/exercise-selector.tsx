"use client"

import { useState, useEffect } from "react"
import { 
  Search, Filter, X, Info, 
  ChevronDown, ChevronUp, Check,
  Play, Plus, Dumbbell
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Exercise } from "@/lib/types/training"

interface ExerciseSelectorProps {
  availableExercises: Exercise[]
  selectedExercises: string[]
  onSelect: (exerciseIds: string[]) => void
  onCancel: () => void
  maxSelections?: number
  title?: string
  description?: string
  showSelectedOnly?: boolean
}

export function ExerciseSelector({
  availableExercises,
  selectedExercises,
  onSelect,
  onCancel,
  maxSelections = 0,
  title = "Seleccionar ejercicios",
  description = "Elige los ejercicios para tu entrenamiento",
  showSelectedOnly = false
}: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedExercises)
  const [showSelected, setShowSelected] = useState(showSelectedOnly)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  
  // Agrupar ejercicios por categoría
  const exercisesByCategory: Record<string, Exercise[]> = {}
  
  availableExercises.forEach(exercise => {
    if (!exercisesByCategory[exercise.category]) {
      exercisesByCategory[exercise.category] = []
    }
    exercisesByCategory[exercise.category].push(exercise)
  })
  
  // Categorías disponibles
  const categories = Object.keys(exercisesByCategory).sort()
  
  // Traducción de categorías
  const categoryTranslations: Record<string, string> = {
    chest: "Pecho",
    back: "Espalda",
    legs: "Piernas",
    shoulders: "Hombros",
    arms: "Brazos",
    abs: "Abdominales",
    cardio: "Cardio",
    other: "Otros"
  }
  
  // Filtrar ejercicios según búsqueda y pestaña activa
  const getFilteredExercises = () => {
    let filtered = [...availableExercises]
    
    // Filtrar por categoría si no es "all"
    if (activeTab !== "all") {
      filtered = filtered.filter(ex => ex.category === activeTab)
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(term) || 
        ex.category.toLowerCase().includes(term) ||
        (ex.equipment && ex.equipment.some(eq => eq.toLowerCase().includes(term)))
      )
    }
    
    // Mostrar solo seleccionados si está activado
    if (showSelected) {
      filtered = filtered.filter(ex => selectedIds.includes(ex.id))
    }
    
    return filtered
  }
  
  const filteredExercises = getFilteredExercises()
  
  // Manejar selección de ejercicio
  const toggleExercise = (exerciseId: string) => {
    if (selectedIds.includes(exerciseId)) {
      setSelectedIds(selectedIds.filter(id => id !== exerciseId))
    } else {
      // Verificar si se ha alcanzado el máximo de selecciones
      if (maxSelections > 0 && selectedIds.length >= maxSelections) {
        return
      }
      setSelectedIds([...selectedIds, exerciseId])
    }
  }
  
  // Manejar confirmación
  const handleConfirm = () => {
    onSelect(selectedIds)
  }
  
  // Renderizar ejercicio
  const renderExercise = (exercise: Exercise) => {
    const isSelected = selectedIds.includes(exercise.id)
    const isExpanded = expandedExercise === exercise.id
    
    return (
      <Card3D 
        key={exercise.id} 
        className={`overflow-hidden transition-all duration-200 ${isSelected ? 'border-primary border-2' : ''}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-medium">{exercise.name}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button3D variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <Info className="h-3 w-3" />
                      </Button3D>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{exercise.description || "Sin descripción disponible"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {categoryTranslations[exercise.category] || exercise.category}
                </Badge>
                {exercise.equipment && exercise.equipment.map(eq => (
                  <Badge key={eq} variant="secondary" className="text-xs">
                    {eq}
                  </Badge>
                ))}
                {exercise.difficulty && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      exercise.difficulty === 'beginner' ? 'bg-green-50 text-green-700' :
                      exercise.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}
                  >
                    {exercise.difficulty === 'beginner' ? 'Principiante' :
                     exercise.difficulty === 'intermediate' ? 'Intermedio' :
                     'Avanzado'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Button3D 
                variant={isSelected ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleExercise(exercise.id)}
                disabled={maxSelections > 0 && selectedIds.length >= maxSelections && !isSelected}
              >
                {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button3D>
              <Button3D 
                variant="ghost" 
                size="icon"
                className="ml-1"
                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button3D>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-center mb-4">
                    {exercise.imageUrl ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={exercise.imageUrl} 
                          alt={exercise.name} 
                          className="w-full h-full object-cover"
                        />
                        {exercise.videoUrl && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button3D 
                                className="absolute bottom-2 right-2"
                                size="sm"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Ver demostración
                              </Button3D>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>{exercise.name}</DialogTitle>
                                <DialogDescription>
                                  Demostración del ejercicio
                                </DialogDescription>
                              </DialogHeader>
                              <div className="aspect-video overflow-hidden rounded-lg">
                                <img 
                                  src={exercise.videoUrl} 
                                  alt={`Demostración de ${exercise.name}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button3D>Cerrar</Button3D>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Dumbbell className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {exercise.description || "No hay descripción disponible para este ejercicio."}
                  </p>
                  
                  {exercise.muscleGroup && exercise.muscleGroup.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Grupos musculares:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.muscleGroup.map(muscle => (
                          <Badge key={muscle} variant="outline" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {exercise.alternatives && exercise.alternatives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Alternativas:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.alternatives.map(alt => (
                          <Badge key={alt} variant="secondary" className="text-xs">
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card3D>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">{title}</h2>
          <p className="text-gray-500">{description}</p>
        </div>
        <Button3D variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button3D>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar ejercicios..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button3D 
          variant={showSelected ? "default" : "outline"}
          size="icon"
          onClick={() => setShowSelected(!showSelected)}
          title={showSelected ? "Mostrar todos" : "Mostrar seleccionados"}
        >
          <Filter className="h-4 w-4" />
        </Button3D>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {selectedIds.length} {selectedIds.length === 1 ? 'ejercicio seleccionado' : 'ejercicios seleccionados'}
          {maxSelections > 0 && ` (máximo ${maxSelections})`}
        </p>
        {selectedIds.length > 0 && (
          <Button3D 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedIds([])}
          >
            Limpiar selección
          </Button3D>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 overflow-auto flex w-full justify-start pb-1">
          <TabsTrigger value="all" className="flex-shrink-0">
            Todos
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="flex-shrink-0">
              {categoryTranslations[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <ScrollArea className="h-[60vh]">
          <div className="space-y-3 pr-4">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(exercise => renderExercise(exercise))
            ) : (
              <Card3D className="p-6 text-center">
                <p className="text-gray-500">No se encontraron ejercicios</p>
                {searchTerm && (
                  <Button3D 
                    variant="link" 
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Limpiar búsqueda
                  </Button3D>
                )}
              </Card3D>
            )}
          </div>
        </ScrollArea>
      </Tabs>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleConfirm} disabled={selectedIds.length === 0}>
          Confirmar selección
        </Button3D>
      </div>
    </div>
  )
}
