"use client"

import { useState, useEffect } from "react"
import { 
  Dumbbell, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Info, 
  ArrowRight,
  RotateCcw,
  Search
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Exercise, 
  getAlternativesForExercise, 
  getAlternativesByPattern,
  getAlternativesByMuscle,
  ALTERNATIVE_GROUPS
} from "@/lib/exercise-alternatives"
import { toast } from "@/components/ui/use-toast"

interface ExerciseAlternativeSelectorProps {
  currentExerciseId: string
  onSelectAlternative: (exercise: Exercise) => void
  onCancel: () => void
}

export function ExerciseAlternativeSelector({
  currentExerciseId,
  onSelectAlternative,
  onCancel
}: ExerciseAlternativeSelectorProps) {
  const [alternatives, setAlternatives] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"alternatives" | "all" | "search">("alternatives")
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  
  // Cargar alternativas al iniciar
  useEffect(() => {
    // Obtener alternativas para el ejercicio actual
    const exerciseAlternatives = getAlternativesForExercise(currentExerciseId)
    setAlternatives(exerciseAlternatives)
    
    // Obtener todos los ejercicios disponibles
    const all: Exercise[] = []
    ALTERNATIVE_GROUPS.forEach(group => {
      group.exercises.forEach(exercise => {
        if (exercise.id !== currentExerciseId && !all.some(e => e.id === exercise.id)) {
          all.push(exercise)
        }
      })
    })
    setAllExercises(all)
  }, [currentExerciseId])
  
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
    return (
      <div className="space-y-2">
        {exercises.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No se encontraron ejercicios
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
                  <h3 className="font-medium">{exercise.spanishName}</h3>
                  <p className="text-xs text-muted-foreground">{exercise.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.equipment.map(eq => (
                      <Badge key={eq} variant="outline" className="text-xs">
                        {eq === "barbell" ? "Barra" :
                         eq === "dumbbell" ? "Mancuernas" :
                         eq === "machine" ? "Máquina" :
                         eq === "cable" ? "Cable" :
                         eq === "bodyweight" ? "Peso corporal" :
                         eq === "kettlebell" ? "Kettlebell" :
                         eq === "bands" ? "Bandas" :
                         eq === "smith_machine" ? "Máquina Smith" :
                         "Otro"}
                      </Badge>
                    ))}
                    <Badge variant="outline" className={`text-xs ${
                      exercise.difficulty === "beginner" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500" :
                      exercise.difficulty === "intermediate" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                    }`}>
                      {exercise.difficulty === "beginner" ? "Principiante" :
                       exercise.difficulty === "intermediate" ? "Intermedio" :
                       "Avanzado"}
                    </Badge>
                  </div>
                </div>
                
                {selectedExercise?.id === exercise.id && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              
              {exercise.description && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button3D variant="ghost" size="sm" className="mt-2 w-full justify-start">
                      <Info className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Button3D>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">{exercise.spanishName}</h4>
                      <p className="text-sm">{exercise.description}</p>
                      {exercise.tips && exercise.tips.length > 0 && (
                        <div className="mt-2">
                          <h5 className="text-sm font-medium">Consejos:</h5>
                          <ul className="text-xs space-y-1 mt-1">
                            {exercise.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Seleccionar Alternativa</h2>
        <Button3D variant="ghost" size="sm" onClick={onCancel}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Cancelar
        </Button3D>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="alternatives">Alternativas</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alternatives">
          <ScrollArea className="h-[400px] pr-4">
            {renderExerciseList(alternatives)}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="all">
          <ScrollArea className="h-[400px] pr-4">
            {renderExerciseList(allExercises)}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="search">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ejercicio..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <ScrollArea className="h-[350px] pr-4">
              {renderExerciseList(filteredExercises)}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleConfirmSelection} disabled={!selectedExercise}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Seleccionar
        </Button3D>
      </div>
    </div>
  )
}
