"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { 
  Clock, 
  Dumbbell, 
  BarChart, 
  Activity, 
  Calendar, 
  Edit, 
  Trash, 
  Save, 
  Plus 
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"

interface WorkoutLog {
  id: string
  date: Date
  duration: number
  muscleGroups: number
  performance: number
  fatigue: number
  notes: string
  muscleGroupFatigue: {
    group: string
    level: number
    status: "Alta" | "Moderada" | "Baja"
  }[]
}

interface WorkoutLogEditorProps {
  workoutLog: WorkoutLog
  onSave: (updatedLog: WorkoutLog) => void
  onCancel: () => void
  isEditing?: boolean
}

export function WorkoutLogEditor({
  workoutLog,
  onSave,
  onCancel,
  isEditing = false
}: WorkoutLogEditorProps) {
  const { toast } = useToast()
  const [log, setLog] = useState<WorkoutLog>(workoutLog)
  const [editing, setEditing] = useState(isEditing)

  // Manejar cambios en los campos
  const handleChange = (field: keyof WorkoutLog, value: any) => {
    setLog(prev => ({ ...prev, [field]: value }))
  }

  // Manejar cambios en la fatiga de grupos musculares
  const handleFatigueChange = (index: number, level: number) => {
    const newFatigue = [...log.muscleGroupFatigue]
    newFatigue[index] = {
      ...newFatigue[index],
      level,
      status: getStatusFromLevel(level)
    }
    setLog(prev => ({ ...prev, muscleGroupFatigue: newFatigue }))
  }

  // Determinar el estado basado en el nivel de fatiga
  const getStatusFromLevel = (level: number): "Alta" | "Moderada" | "Baja" => {
    if (level >= 8) return "Alta"
    if (level >= 5) return "Moderada"
    return "Baja"
  }

  // Añadir un nuevo grupo muscular
  const addMuscleGroup = () => {
    const newGroup = {
      group: "Nuevo grupo",
      level: 5,
      status: "Moderada" as const
    }
    setLog(prev => ({
      ...prev,
      muscleGroupFatigue: [...prev.muscleGroupFatigue, newGroup]
    }))
  }

  // Eliminar un grupo muscular
  const removeMuscleGroup = (index: number) => {
    const newFatigue = log.muscleGroupFatigue.filter((_, i) => i !== index)
    setLog(prev => ({ ...prev, muscleGroupFatigue: newFatigue }))
  }

  // Actualizar el nombre de un grupo muscular
  const updateMuscleGroupName = (index: number, name: string) => {
    const newFatigue = [...log.muscleGroupFatigue]
    newFatigue[index] = {
      ...newFatigue[index],
      group: name
    }
    setLog(prev => ({ ...prev, muscleGroupFatigue: newFatigue }))
  }

  // Guardar cambios
  const saveChanges = () => {
    onSave(log)
    setEditing(false)
    toast({
      title: "Cambios guardados",
      description: "El registro de entrenamiento ha sido actualizado",
    })
  }

  // Cancelar edición
  const cancelEditing = () => {
    setLog(workoutLog)
    setEditing(false)
    onCancel()
  }

  // Iniciar edición
  const startEditing = () => {
    setEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {editing ? "Editar entrenamiento" : "Detalles del entrenamiento"}
        </h2>
        <div className="flex gap-2">
          {!editing ? (
            <Button onClick={startEditing}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                Cancelar
              </Button>
              <Button onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>
              {editing ? (
                <Input
                  value="Entrenamiento sin rutina"
                  onChange={(e) => {}}
                  className="font-bold text-xl"
                />
              ) : (
                "Entrenamiento sin rutina"
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {editing ? (
                <Input
                  type="date"
                  value={format(log.date, "yyyy-MM-dd")}
                  onChange={(e) => handleChange("date", new Date(e.target.value))}
                  className="w-40"
                />
              ) : (
                format(log.date, "d 'de' MMMM, yyyy", { locale: es })
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4 mr-1" />
                Duración
              </div>
              {editing ? (
                <Input
                  type="number"
                  value={log.duration}
                  onChange={(e) => handleChange("duration", parseInt(e.target.value))}
                  className="h-8 text-lg font-medium"
                  suffix="min"
                />
              ) : (
                <p className="text-lg font-medium">{log.duration} min</p>
              )}
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Dumbbell className="h-4 w-4 mr-1" />
                Grupos Musculares
              </div>
              {editing ? (
                <Input
                  type="number"
                  value={log.muscleGroups}
                  onChange={(e) => handleChange("muscleGroups", parseInt(e.target.value))}
                  className="h-8 text-lg font-medium"
                />
              ) : (
                <p className="text-lg font-medium">{log.muscleGroups}</p>
              )}
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <BarChart className="h-4 w-4 mr-1" />
                Rendimiento
              </div>
              {editing ? (
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={log.performance}
                    onChange={(e) => handleChange("performance", parseInt(e.target.value))}
                    className="h-8 text-lg font-medium w-16 mr-1"
                    min={1}
                    max={5}
                  />
                  <span className="text-lg font-medium">/5</span>
                </div>
              ) : (
                <p className="text-lg font-medium">{log.performance}/5</p>
              )}
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Activity className="h-4 w-4 mr-1" />
                Nivel de fatiga
              </div>
              {editing ? (
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={log.fatigue}
                    onChange={(e) => handleChange("fatigue", parseInt(e.target.value))}
                    className="h-8 text-lg font-medium w-16 mr-1"
                    min={1}
                    max={10}
                  />
                  <span className="text-lg font-medium">/10</span>
                </div>
              ) : (
                <p className="text-lg font-medium">{log.fatigue}/10</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Notas</h3>
            {editing ? (
              <Textarea
                value={log.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Añade notas sobre tu entrenamiento..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">{log.notes}</p>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Fatiga por Grupo Muscular</h3>
              {editing && (
                <Button variant="outline" size="sm" onClick={addMuscleGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir grupo
                </Button>
              )}
            </div>
            
            <div className="bg-muted/50 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 text-sm font-medium p-3 border-b">
                <div>Grupo Muscular</div>
                <div>Nivel de Fatiga</div>
                <div>Estado</div>
              </div>
              
              {log.muscleGroupFatigue.map((item, index) => (
                <div key={index} className="grid grid-cols-3 p-3 border-b last:border-0">
                  <div>
                    {editing ? (
                      <Input
                        value={item.group}
                        onChange={(e) => updateMuscleGroupName(index, e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      item.group
                    )}
                  </div>
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[item.level]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) => handleFatigueChange(index, value[0])}
                          className="w-24"
                        />
                        <span>{item.level}/10</span>
                      </div>
                    ) : (
                      `${item.level}/10`
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={
                        item.status === "Alta"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : item.status === "Moderada"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      {item.status}
                    </Badge>
                    
                    {editing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMuscleGroup(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
