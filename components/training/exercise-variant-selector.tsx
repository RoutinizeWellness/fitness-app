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
  RefreshCw,
  X
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getExercises, Exercise } from "@/lib/supabase"
import { ExerciseVariants } from "./exercise-variants"

interface ExerciseVariantSelectorProps {
  exerciseId: string
  onSelectVariant: (variantId: string) => void
  onClose: () => void
}

export function ExerciseVariantSelector({
  exerciseId,
  onSelectVariant,
  onClose
}: ExerciseVariantSelectorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [variants, setVariants] = useState<Exercise[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  // Cargar ejercicio actual
  useEffect(() => {
    const loadExercise = async () => {
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
    
    loadExercise()
  }, [exerciseId, toast])

  // Manejar selección de variante
  const handleSelectVariant = (variantId: string) => {
    setSelectedVariant(variantId)
    onSelectVariant(variantId)
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Renderizar error si no hay ejercicio actual
  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive mb-4">No se pudo cargar el ejercicio</p>
        <Button3D onClick={onClose}>
          Volver
        </Button3D>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button3D variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Cambiar ejercicio
        </Button3D>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar variante</DialogTitle>
          <DialogDescription>
            Elige una variante para reemplazar {currentExercise.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ExerciseVariants
            exerciseId={exerciseId}
            onSelectVariant={handleSelectVariant}
            onClose={() => {}}
          />
        </div>
        
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button3D variant="secondary">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button3D>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
