"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell,
  RotateCcw,
  Check,
  Search,
  Filter,
  Play,
  Info
} from "lucide-react"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Exercise } from "@/lib/types/training"
import { toast } from "@/components/ui/use-toast"

// Extender la interfaz Exercise para incluir targetRir
interface ExerciseWithRir extends Exercise {
  targetRir?: number;
  recommendedRir?: number;
}

interface ExerciseAlternativesProps {
  exercise: ExerciseWithRir
  availableExercises: Exercise[]
  onSelectAlternative: (alternativeId: string) => void
  currentExerciseId: string
}

export function ExerciseAlternatives({
  exercise,
  availableExercises,
  onSelectAlternative,
  currentExerciseId
}: ExerciseAlternativesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterEquipment, setFilterEquipment] = useState<string>("all")

  // Obtener categorías únicas
  const categories = Array.from(new Set(availableExercises.map(ex => ex.category)))

  // Obtener equipamiento único
  const equipmentTypes = Array.from(
    new Set(availableExercises.flatMap(ex => ex.equipment || []))
  )

  // Filtrar ejercicios alternativos
  const getFilteredAlternatives = () => {
    return availableExercises.filter(ex => {
      // No mostrar el ejercicio actual como alternativa
      if (ex.id === currentExerciseId) return false

      // Filtrar por término de búsqueda
      if (searchTerm && !ex.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filtrar por categoría
      if (filterCategory !== "all" && ex.category !== filterCategory) {
        return false
      }

      // Filtrar por equipamiento
      if (filterEquipment !== "all" &&
          (!ex.equipment || !ex.equipment.includes(filterEquipment))) {
        return false
      }

      return true
    })
  }

  // Obtener alternativas recomendadas (misma categoría o grupos musculares)
  const getRecommendedAlternatives = () => {
    return availableExercises.filter(ex =>
      ex.id !== currentExerciseId &&
      (ex.category === exercise.category ||
       (ex.muscleGroup && exercise.muscleGroup &&
        ex.muscleGroup.some(m => exercise.muscleGroup?.includes(m))))
    )
    .map(ex => ({
      ...ex,
      recommendedRir: calculateRecommendedRir(ex)
    }))
    .slice(0, 6) // Limitar a 6 recomendaciones
  }

  // Calcular RiR recomendado basado en características del ejercicio
  const calculateRecommendedRir = (alternativeExercise: Exercise): number => {
    // Si el ejercicio original no tiene RiR definido, usar un valor por defecto
    if (!exercise.targetRir) return 2;

    // Determinar si el ejercicio alternativo es más difícil o más fácil
    const difficultyAdjustment = getDifficultyAdjustment(alternativeExercise);

    // Ajustar el RiR basado en la dificultad relativa
    const adjustedRir = Math.max(0, Math.min(4, exercise.targetRir + difficultyAdjustment));

    return adjustedRir;
  }

  // Determinar el ajuste de dificultad para un ejercicio alternativo
  const getDifficultyAdjustment = (alternativeExercise: Exercise): number => {
    // Comparar categorías de ejercicios
    if (alternativeExercise.category === 'compound' && exercise.category === 'isolation') {
      return -1; // Ejercicio compuesto es más difícil que aislamiento, reducir RiR
    } else if (alternativeExercise.category === 'isolation' && exercise.category === 'compound') {
      return 1; // Ejercicio de aislamiento es más fácil que compuesto, aumentar RiR
    }

    // Comparar equipamiento
    const originalHasBarbell = exercise.equipment?.includes('barbell');
    const alternativeHasBarbell = alternativeExercise.equipment?.includes('barbell');

    if (!originalHasBarbell && alternativeHasBarbell) {
      return -1; // Cambiar a barra es más difícil, reducir RiR
    } else if (originalHasBarbell && !alternativeHasBarbell) {
      return 1; // Quitar barra es más fácil, aumentar RiR
    }

    // Por defecto, mantener el mismo RiR
    return 0;
  }

  // Alternativas filtradas con RiR recomendado
  const filteredAlternatives = getFilteredAlternatives().map(ex => ({
    ...ex,
    recommendedRir: calculateRecommendedRir(ex)
  }))

  // Alternativas recomendadas
  const recommendedAlternatives = getRecommendedAlternatives()

  // Manejar selección de alternativa
  const handleSelectAlternative = (alternativeId: string) => {
    onSelectAlternative(alternativeId)
    toast({
      title: "Ejercicio cambiado",
      description: "Se ha cambiado el ejercicio correctamente",
      variant: "default"
    })
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Alternativas para {exercise.name}</DialogTitle>
        <DialogDescription>
          Selecciona un ejercicio alternativo que trabaje los mismos grupos musculares
        </DialogDescription>
      </DialogHeader>

      {/* Filtros */}
      <div className="space-y-3">
        <Input
          placeholder="Buscar ejercicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
          prefix={<Search className="h-4 w-4 text-gray-400" />}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterEquipment} onValueChange={setFilterEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Equipamiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el equipamiento</SelectItem>
                {equipmentTypes.map(equipment => (
                  <SelectItem key={equipment} value={equipment}>
                    {equipment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ejercicio actual */}
      <div>
        <h4 className="text-sm font-medium mb-2">Ejercicio actual</h4>
        <Card3D className="p-3 bg-primary/5">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{exercise.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {exercise.category}
                </Badge>
                {exercise.equipment && exercise.equipment.map(eq => (
                  <Badge key={eq} variant="secondary" className="text-xs">
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge variant="secondary">Actual</Badge>
          </div>
        </Card3D>
      </div>

      {/* Alternativas recomendadas */}
      {recommendedAlternatives.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Alternativas recomendadas</h4>
          <div className="space-y-2">
            {recommendedAlternatives.map(alt => (
              <Card3D key={alt.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleSelectAlternative(alt.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{alt.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {alt.category}
                      </Badge>
                      {alt.equipment && alt.equipment.map(eq => (
                        <Badge key={eq} variant="secondary" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                      {alt.recommendedRir !== undefined && (
                        <Badge variant="default" className="text-xs">
                          RIR {alt.recommendedRir}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button3D variant="ghost" size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    Seleccionar
                  </Button3D>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      )}

      {/* Todas las alternativas */}
      <div>
        <h4 className="text-sm font-medium mb-2">Todos los ejercicios ({filteredAlternatives.length})</h4>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {filteredAlternatives.length > 0 ? (
              filteredAlternatives.map(alt => (
                <Card3D key={alt.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectAlternative(alt.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{alt.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {alt.category}
                        </Badge>
                        {alt.equipment && alt.equipment.map(eq => (
                          <Badge key={eq} variant="secondary" className="text-xs">
                            {eq}
                          </Badge>
                        ))}
                        {alt.recommendedRir !== undefined && (
                          <Badge variant="default" className="text-xs">
                            RIR {alt.recommendedRir}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button3D variant="ghost" size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      Seleccionar
                    </Button3D>
                  </div>
                </Card3D>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se encontraron ejercicios con los filtros actuales
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button3D variant="outline">Cancelar</Button3D>
        </DialogClose>
      </DialogFooter>
    </div>
  )
}
