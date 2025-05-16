"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell, Play, Info, Plus, Minus,
  Save, X, RotateCcw, ChevronDown, ChevronUp,
  RefreshCw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ExerciseVariantSelector } from "./exercise-variant-selector"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Exercise, ExerciseSet } from "@/lib/types/training"
import { toast } from "@/components/ui/use-toast"

interface ExerciseEditorProps {
  exerciseId: string
  sets: ExerciseSet[]
  exercise: Exercise | undefined
  availableExercises: Exercise[]
  onSave: (sets: ExerciseSet[]) => void
  onCancel: () => void
  onReplaceExercise: (oldExerciseId: string, newExerciseId: string) => void
}

export function ExerciseEditor({
  exerciseId,
  sets,
  exercise,
  availableExercises,
  onSave,
  onCancel,
  onReplaceExercise
}: ExerciseEditorProps) {
  const [editedSets, setEditedSets] = useState<ExerciseSet[]>([...sets])
  const [activeTab, setActiveTab] = useState("basic")

  // Presets para diferentes objetivos
  const presets = {
    strength: { sets: 5, reps: 5, rir: 1, rest: 180 },
    hypertrophy: { sets: 4, reps: 10, rir: 2, rest: 90 },
    endurance: { sets: 3, reps: 15, rir: 3, rest: 60 },
    power: { sets: 5, reps: 3, rir: 0, rest: 180 },
    metabolic: { sets: 3, reps: 12, rir: 1, rest: 45 }
  }

  if (!exercise) {
    return (
      <div className="p-6 text-center">
        <p>Ejercicio no encontrado</p>
        <Button3D onClick={onCancel} className="mt-4">Volver</Button3D>
      </div>
    )
  }

  // Manejar cambios en un set
  const handleSetChange = (setId: string, field: keyof ExerciseSet, value: any) => {
    setEditedSets(prev => prev.map(set =>
      set.id === setId ? { ...set, [field]: value } : set
    ))
  }

  // Añadir un nuevo set
  const addSet = () => {
    // Copiar valores del último set
    const lastSet = editedSets[editedSets.length - 1]

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      exerciseId,
      targetReps: lastSet?.targetReps || 10,
      targetRir: lastSet?.targetRir || 2,
      restTime: lastSet?.restTime || 90
    }

    setEditedSets([...editedSets, newSet])
  }

  // Eliminar un set
  const removeSet = (setId: string) => {
    if (editedSets.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos un set para este ejercicio",
        variant: "destructive"
      })
      return
    }

    setEditedSets(prev => prev.filter(set => set.id !== setId))
  }

  // Aplicar preset a todos los sets
  const applyPreset = (presetKey: keyof typeof presets) => {
    const preset = presets[presetKey]

    // Ajustar número de sets
    let newSets = [...editedSets]

    // Si necesitamos más sets, añadirlos
    while (newSets.length < preset.sets) {
      newSets.push({
        id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${newSets.length}`,
        exerciseId,
        targetReps: preset.reps,
        targetRir: preset.rir,
        restTime: preset.rest
      })
    }

    // Si necesitamos menos sets, eliminarlos
    if (newSets.length > preset.sets) {
      newSets = newSets.slice(0, preset.sets)
    }

    // Actualizar valores de todos los sets
    newSets = newSets.map(set => ({
      ...set,
      targetReps: preset.reps,
      targetRir: preset.rir,
      restTime: preset.rest
    }))

    setEditedSets(newSets)

    toast({
      title: "Preset aplicado",
      description: `Se ha aplicado el preset de ${presetKey}`,
    })
  }

  // Guardar cambios
  const handleSave = () => {
    onSave(editedSets)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold gradient-text">Editar ejercicio</h2>
        <Button3D variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button3D>
      </div>

      <Card3D className="overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{exercise.name}</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button3D variant="ghost" size="icon" className="h-6 w-6 ml-1">
                      <Play className="h-3 w-3" />
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
                      {exercise.videoUrl ? (
                        <img
                          src={exercise.videoUrl}
                          alt={`Demostración de ${exercise.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Dumbbell className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
            <ExerciseVariantSelector
              exerciseId={exerciseId}
              onSelectVariant={(variantId) => onReplaceExercise(exerciseId, variantId)}
              onClose={() => {}}
            />
          </div>
        </div>
      </Card3D>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-4">
            {editedSets.map((set, index) => (
              <Card3D key={set.id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Serie #{index + 1}</h4>
                  <Button3D
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => removeSet(set.id)}
                    disabled={editedSets.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button3D>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`reps-${set.id}`}>Repeticiones</Label>
                    <Input
                      id={`reps-${set.id}`}
                      type="number"
                      value={set.targetReps}
                      onChange={(e) => handleSetChange(set.id, 'targetReps', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rir-${set.id}`}>RIR</Label>
                    <Input
                      id={`rir-${set.id}`}
                      type="number"
                      value={set.targetRir}
                      onChange={(e) => handleSetChange(set.id, 'targetRir', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rest-${set.id}`}>Descanso (s)</Label>
                    <Input
                      id={`rest-${set.id}`}
                      type="number"
                      value={set.restTime}
                      onChange={(e) => handleSetChange(set.id, 'restTime', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`warmup-${set.id}`}>Tipo</Label>
                    <Select
                      value={set.isWarmup ? "warmup" : "working"}
                      onValueChange={(value) => handleSetChange(set.id, 'isWarmup', value === "warmup")}
                    >
                      <SelectTrigger id={`warmup-${set.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working">Normal</SelectItem>
                        <SelectItem value="warmup">Calentamiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>

          <Button3D onClick={addSet} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Añadir serie
          </Button3D>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card3D className="p-6">
            <Card3DHeader>
              <Card3DTitle>Presets por objetivo</Card3DTitle>
            </Card3DHeader>
            <Card3DContent className="space-y-4 pt-4">
              <p className="text-sm text-gray-500">
                Selecciona un preset para aplicar automáticamente la configuración recomendada
                según el objetivo de entrenamiento.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card3D
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => applyPreset('strength')}
                >
                  <h4 className="font-medium">Fuerza</h4>
                  <p className="text-sm text-gray-500">5 series × 5 reps, RIR 1, 180s</p>
                </Card3D>
                <Card3D
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => applyPreset('hypertrophy')}
                >
                  <h4 className="font-medium">Hipertrofia</h4>
                  <p className="text-sm text-gray-500">4 series × 10 reps, RIR 2, 90s</p>
                </Card3D>
                <Card3D
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => applyPreset('endurance')}
                >
                  <h4 className="font-medium">Resistencia</h4>
                  <p className="text-sm text-gray-500">3 series × 15 reps, RIR 3, 60s</p>
                </Card3D>
                <Card3D
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => applyPreset('power')}
                >
                  <h4 className="font-medium">Potencia</h4>
                  <p className="text-sm text-gray-500">5 series × 3 reps, RIR 0, 180s</p>
                </Card3D>
                <Card3D
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => applyPreset('metabolic')}
                >
                  <h4 className="font-medium">Metabólico</h4>
                  <p className="text-sm text-gray-500">3 series × 12 reps, RIR 1, 45s</p>
                </Card3D>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar cambios
        </Button3D>
      </div>


    </div>
  )
}
