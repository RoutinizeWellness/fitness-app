"use client"

import { useState } from "react"
import {
  Dumbbell, Calendar, ChevronRight,
  Clock, Zap, BarChart3, Copy,
  Edit, Trash, MoreVertical
} from "lucide-react"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { WorkoutRoutine } from "@/lib/types/training"
import { motion } from "framer-motion"

interface RoutinesListProps {
  routines: WorkoutRoutine[]
  onStartWorkout: (routine: WorkoutRoutine, day: any) => void
  onCreateRoutine: () => void
  onCreateTemplateRoutine?: () => void
  onEditRoutine?: (routine: WorkoutRoutine) => void
}

export function RoutinesList({
  routines,
  onStartWorkout,
  onCreateRoutine,
  onCreateTemplateRoutine,
  onEditRoutine
}: RoutinesListProps) {
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null)

  // Función para alternar la expansión de una rutina
  const toggleRoutineExpansion = (routineId: string) => {
    if (expandedRoutineId === routineId) {
      setExpandedRoutineId(null)
    } else {
      setExpandedRoutineId(routineId)
    }
  }

  // Función para duplicar una rutina
  const duplicateRoutine = (routineId: string) => {
    // Implementar la duplicación de rutina
    console.log("Duplicar rutina:", routineId)
  }

  // Función para editar una rutina
  const handleEditRoutine = (routineId: string) => {
    if (onEditRoutine) {
      const routine = routines.find(r => r.id === routineId)
      if (routine) {
        onEditRoutine(routine)
      }
    }
  }

  // Función para eliminar una rutina
  const deleteRoutine = (routineId: string) => {
    // Implementar la eliminación de rutina
    console.log("Eliminar rutina:", routineId)
  }

  // Mapear los objetivos a etiquetas legibles
  const goalLabels: Record<string, string> = {
    strength: "Fuerza",
    hypertrophy: "Hipertrofia",
    endurance: "Resistencia",
    weight_loss: "Pérdida de peso",
    general_fitness: "Fitness general"
  }

  // Mapear los niveles a etiquetas legibles
  const levelLabels: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado"
  }

  // Colores para los niveles
  const levelColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-purple-100 text-purple-800"
  }

  // Colores para los objetivos
  const goalColors: Record<string, string> = {
    strength: "bg-red-100 text-red-800",
    hypertrophy: "bg-blue-100 text-blue-800",
    endurance: "bg-green-100 text-green-800",
    weight_loss: "bg-yellow-100 text-yellow-800",
    general_fitness: "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {routines.length === 0 ? (
        <Card3D className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <Dumbbell className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes rutinas</h3>
            <p className="text-gray-500 mb-4">Crea tu primera rutina de entrenamiento</p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button3D onClick={onCreateRoutine}>
                Crear desde cero
              </Button3D>
              {onCreateTemplateRoutine && (
                <Button3D variant="outline" onClick={onCreateTemplateRoutine}>
                  Usar plantilla
                </Button3D>
              )}
            </div>
          </div>
        </Card3D>
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => (
            <Card3D key={routine.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{routine.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge className={levelColors[routine.level]}>
                        {levelLabels[routine.level]}
                      </Badge>
                      <Badge className={goalColors[routine.goal]}>
                        {goalLabels[routine.goal]}
                      </Badge>
                      <Badge variant="outline">
                        {routine.frequency} días/semana
                      </Badge>
                    </div>
                    {routine.description && (
                      <p className="text-sm text-gray-500 mt-2">{routine.description}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <Button3D
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRoutineExpansion(routine.id)}
                    >
                      <ChevronRight
                        className={`h-5 w-5 transition-transform ${expandedRoutineId === routine.id ? 'rotate-90' : ''}`}
                      />
                    </Button3D>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button3D variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button3D>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRoutine(routine.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateRoutine(routine.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteRoutine(routine.id)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Días de entrenamiento (expandibles) */}
                {expandedRoutineId === routine.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    {routine.days.map((day) => (
                      <Card3D key={day.id} className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{day.name}</h4>
                            <p className="text-xs text-gray-500">
                              {day.exerciseSets.length} ejercicios • {day.targetMuscleGroups.join(", ")}
                            </p>
                          </div>
                          <Button3D
                            size="sm"
                            onClick={() => onStartWorkout(routine.id, day.id)}
                          >
                            Entrenar
                          </Button3D>
                        </div>
                      </Card3D>
                    ))}
                  </motion.div>
                )}
              </div>
            </Card3D>
          ))}
        </div>
      )}
    </div>
  )
}
