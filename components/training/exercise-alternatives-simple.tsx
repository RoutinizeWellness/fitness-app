"use client"

import { useState } from "react"
import {
  Dumbbell,
  Check,
  Search,
  Filter
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from "@/components/ui/use-toast"

interface ExerciseAlternativesProps {
  exercise: Exercise
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
  const { toast } = useToast()
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
    ).slice(0, 6) // Limitar a 6 recomendaciones
  }

  // Alternativas filtradas
  const filteredAlternatives = getFilteredAlternatives()

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
        <Card className="p-3 bg-primary/5">
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
        </Card>
      </div>

      {/* Alternativas recomendadas */}
      {recommendedAlternatives.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Alternativas recomendadas</h4>
          <div className="space-y-2">
            {recommendedAlternatives.map(alt => (
              <Card key={alt.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
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
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    Seleccionar
                  </Button>
                </div>
              </Card>
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
                <Card key={alt.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
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
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      Seleccionar
                    </Button>
                  </div>
                </Card>
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
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  )
}
