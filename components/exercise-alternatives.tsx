"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Search, Check } from "lucide-react"
import { type Exercise } from "@/lib/supabase"
import { getExerciseAlternatives } from "@/lib/supabase-queries"

interface ExerciseAlternativesProps {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  onSelectAlternative: (exercise: Exercise) => void
}

export default function ExerciseAlternatives({
  exerciseId,
  exerciseName,
  muscleGroup,
  onSelectAlternative
}: ExerciseAlternativesProps) {
  const [alternatives, setAlternatives] = useState<Exercise[]>([])
  const [filteredAlternatives, setFilteredAlternatives] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Cargar alternativas cuando se abre el diálogo
  const loadAlternatives = async () => {
    try {
      setIsLoading(true)

      // Obtener alternativas del mismo grupo muscular
      const { data, error } = await getExerciseAlternatives(exerciseId, muscleGroup)

      if (error) {
        throw error
      }

      setAlternatives(data || [])
      setFilteredAlternatives(data || [])
    } catch (error) {
      console.error("Error al cargar alternativas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar alternativas cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAlternatives(alternatives)
      return
    }

    const filtered = alternatives.filter(exercise =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setFilteredAlternatives(filtered)
  }, [searchQuery, alternatives])

  // Manejar selección de alternativa
  const handleSelectAlternative = (exercise: Exercise) => {
    onSelectAlternative(exercise)
  }

  return (
    <Dialog onOpenChange={(open) => open && loadAlternatives()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Shuffle className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Alternativas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ejercicios alternativos</DialogTitle>
          <DialogDescription>
            Selecciona un ejercicio alternativo para reemplazar <strong>{exerciseName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar alternativas..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="bg-primary/5">
            {muscleGroup}
          </Badge>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : filteredAlternatives.length > 0 ? (
            <div className="space-y-2">
              {filteredAlternatives.map(exercise => (
                <div
                  key={exercise.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectAlternative(exercise)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{exercise.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{exercise.difficulty}</span>
                      {exercise.equipment && (
                        <>
                          <span>•</span>
                          <span>{exercise.equipment}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron alternativas</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
