"use client"

import { useState, useEffect } from "react"
import { 
  Dumbbell, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Loader2,
  Info,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getExercises, Exercise } from "@/lib/supabase"

interface ExerciseVariantsProps {
  exerciseId: string
  onSelectVariant: (variantId: string) => void
  onClose: () => void
}

export function ExerciseVariants({
  exerciseId,
  onSelectVariant,
  onClose
}: ExerciseVariantsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [variants, setVariants] = useState<Exercise[]>([])
  const [filteredVariants, setFilteredVariants] = useState<Exercise[]>([])
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [showExerciseDetails, setShowExerciseDetails] = useState<string | null>(null)

  // Cargar ejercicio actual y sus variantes
  useEffect(() => {
    const loadExerciseAndVariants = async () => {
      setIsLoading(true)
      try {
        // Obtener todos los ejercicios
        const { data, error } = await getExercises()
        
        if (error) {
          throw error
        }
        
        if (!data || data.length === 0) {
          throw new Error("No se encontraron ejercicios")
        }
        
        // Encontrar el ejercicio actual
        const exercise = data.find(ex => ex.id === exerciseId)
        
        if (!exercise) {
          throw new Error("No se encontró el ejercicio seleccionado")
        }
        
        setCurrentExercise(exercise)
        
        // Encontrar variantes (ejercicios que trabajan los mismos músculos)
        const exerciseVariants = data.filter(ex => 
          ex.id !== exerciseId && 
          (
            ex.primary_muscle_group === exercise.primary_muscle_group ||
            (ex.secondary_muscle_groups && 
             exercise.secondary_muscle_groups && 
             ex.secondary_muscle_groups.some(m => 
               exercise.secondary_muscle_groups.includes(m)
             ))
          )
        )
        
        setVariants(exerciseVariants)
        setFilteredVariants(exerciseVariants)
        
      } catch (error) {
        console.error("Error al cargar ejercicio y variantes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las variantes del ejercicio",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExerciseAndVariants()
  }, [exerciseId, toast])

  // Filtrar variantes
  useEffect(() => {
    if (!currentExercise || variants.length === 0) return
    
    let filtered = [...variants]
    
    switch (filterType) {
      case "same_equipment":
        filtered = variants.filter(v => 
          v.equipment && 
          currentExercise.equipment && 
          v.equipment.some(eq => currentExercise.equipment.includes(eq))
        )
        break
      case "same_difficulty":
        filtered = variants.filter(v => v.difficulty === currentExercise.difficulty)
        break
      case "easier":
        filtered = variants.filter(v => {
          const difficultyLevels = ["beginner", "intermediate", "advanced"]
          const currentIndex = difficultyLevels.indexOf(currentExercise.difficulty)
          const variantIndex = difficultyLevels.indexOf(v.difficulty)
          return variantIndex < currentIndex
        })
        break
      case "harder":
        filtered = variants.filter(v => {
          const difficultyLevels = ["beginner", "intermediate", "advanced"]
          const currentIndex = difficultyLevels.indexOf(currentExercise.difficulty)
          const variantIndex = difficultyLevels.indexOf(v.difficulty)
          return variantIndex > currentIndex
        })
        break
      case "compound":
        filtered = variants.filter(v => v.is_compound)
        break
      case "isolation":
        filtered = variants.filter(v => !v.is_compound)
        break
      default:
        // "all" - no filtering needed
        break
    }
    
    setFilteredVariants(filtered)
  }, [filterType, currentExercise, variants])

  // Manejar selección de variante
  const handleSelectVariant = () => {
    if (!selectedVariant) {
      toast({
        title: "Selección requerida",
        description: "Selecciona una variante para continuar",
        variant: "destructive"
      })
      return
    }
    
    onSelectVariant(selectedVariant)
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className="w-full">
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Cargando variantes...</p>
        </Card3DContent>
      </Card3D>
    )
  }

  // Renderizar error si no hay ejercicio actual
  if (!currentExercise) {
    return (
      <Card3D className="w-full">
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium text-destructive">
            No se pudo cargar el ejercicio
          </p>
          <Button3D className="mt-4" onClick={onClose}>
            Volver
          </Button3D>
        </Card3DContent>
      </Card3D>
    )
  }

  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <div className="flex items-center justify-between">
          <Card3DTitle>Variantes de ejercicio</Card3DTitle>
          <Badge variant="outline">
            {filteredVariants.length} alternativas
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Selecciona una variante para reemplazar el ejercicio actual
        </p>
      </Card3DHeader>
      <Card3DContent>
        <div className="space-y-4">
          {/* Ejercicio actual */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Ejercicio actual</h3>
                  <p className="text-sm text-muted-foreground">{currentExercise.name}</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button3D variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button3D>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{currentExercise.name}</DialogTitle>
                    <DialogDescription>
                      Detalles del ejercicio actual
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Músculo principal</p>
                        <p className="text-sm text-muted-foreground">
                          {currentExercise.primary_muscle_group}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Dificultad</p>
                        <p className="text-sm text-muted-foreground">
                          {currentExercise.difficulty}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tipo</p>
                        <p className="text-sm text-muted-foreground">
                          {currentExercise.is_compound ? "Compuesto" : "Aislamiento"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Equipamiento</p>
                        <p className="text-sm text-muted-foreground">
                          {currentExercise.equipment?.join(", ") || "No especificado"}
                        </p>
                      </div>
                    </div>
                    {currentExercise.description && (
                      <div>
                        <p className="text-sm font-medium">Descripción</p>
                        <p className="text-sm text-muted-foreground">
                          {currentExercise.description}
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filtrar por:</p>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las variantes</SelectItem>
                <SelectItem value="same_equipment">Mismo equipamiento</SelectItem>
                <SelectItem value="same_difficulty">Misma dificultad</SelectItem>
                <SelectItem value="easier">Más fáciles</SelectItem>
                <SelectItem value="harder">Más difíciles</SelectItem>
                <SelectItem value="compound">Ejercicios compuestos</SelectItem>
                <SelectItem value="isolation">Ejercicios de aislamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Lista de variantes */}
          {filteredVariants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron variantes con los filtros seleccionados</p>
              <Button3D variant="outline" className="mt-4" onClick={() => setFilterType("all")}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Mostrar todas las variantes
              </Button3D>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedVariant === variant.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                          selectedVariant === variant.id
                            ? "bg-primary text-white"
                            : "border border-muted-foreground"
                        }`}>
                          {selectedVariant === variant.id && <Check className="h-3 w-3" />}
                        </div>
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {variant.difficulty}
                            </Badge>
                            <span>•</span>
                            <span>{variant.is_compound ? "Compuesto" : "Aislamiento"}</span>
                          </div>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button3D
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowExerciseDetails(
                                  showExerciseDetails === variant.id ? null : variant.id
                                )
                              }}
                            >
                              {showExerciseDetails === variant.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button3D>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver detalles</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {showExerciseDetails === variant.id && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium">Músculo principal</p>
                            <p className="text-muted-foreground">
                              {variant.primary_muscle_group}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Equipamiento</p>
                            <p className="text-muted-foreground">
                              {variant.equipment?.join(", ") || "No especificado"}
                            </p>
                          </div>
                        </div>
                        {variant.description && (
                          <div className="mt-2">
                            <p className="font-medium">Descripción</p>
                            <p className="text-muted-foreground">{variant.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between pt-4">
            <Button3D variant="outline" onClick={onClose}>
              Cancelar
            </Button3D>
            <Button3D
              onClick={handleSelectVariant}
              disabled={!selectedVariant}
            >
              Seleccionar variante
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button3D>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}
