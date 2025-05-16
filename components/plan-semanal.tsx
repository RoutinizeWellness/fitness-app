"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Heart, Brain, Flame, SpaceIcon as Yoga, AlertCircle, Plus, Edit, Save, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addPlan, updatePlan, type Plan } from "@/lib/supabase-client"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Datos de ejemplo para el plan semanal
const samplePlan = {
  lunes: [
    { tipo: "fuerza", descripcion: "Entrenamiento de fuerza - Tren superior", icono: "dumbbell" },
    { tipo: "mindfulness", descripcion: "Meditación - 10 minutos", icono: "brain" },
  ],
  martes: [
    { tipo: "cardio", descripcion: "Cardio - 30 minutos", icono: "flame" },
    { tipo: "mindfulness", descripcion: "Respiración consciente - 5 minutos", icono: "brain" },
  ],
  miercoles: [
    { tipo: "fuerza", descripcion: "Entrenamiento de fuerza - Tren inferior", icono: "dumbbell" },
    { tipo: "mindfulness", descripcion: "Meditación - 10 minutos", icono: "brain" },
  ],
  jueves: [
    { tipo: "descanso", descripcion: "Día de descanso activo", icono: "heart" },
    { tipo: "mindfulness", descripcion: "Yoga - 20 minutos", icono: "yoga" },
  ],
  viernes: [
    { tipo: "fuerza", descripcion: "Entrenamiento de fuerza - Cuerpo completo", icono: "dumbbell" },
    { tipo: "mindfulness", descripcion: "Meditación - 10 minutos", icono: "brain" },
  ],
  sabado: [{ tipo: "cardio", descripcion: "Cardio - 45 minutos", icono: "flame" }],
  domingo: [
    { tipo: "descanso", descripcion: "Descanso completo", icono: "heart" },
    { tipo: "mindfulness", descripcion: "Meditación - 15 minutos", icono: "brain" },
  ],
}

// Días de la semana en orden
const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

// Tipos de actividades disponibles
const tiposActividad = [
  { valor: "fuerza", nombre: "Fuerza", icono: "dumbbell" },
  { valor: "cardio", nombre: "Cardio", icono: "flame" },
  { valor: "flexibilidad", nombre: "Flexibilidad", icono: "yoga" },
  { valor: "mindfulness", nombre: "Mindfulness", icono: "brain" },
  { valor: "descanso", nombre: "Descanso", icono: "heart" },
]

interface PlanSemanalProps {
  planData: Plan[]
  userId: string
}

export default function PlanSemanal({ planData, userId }: PlanSemanalProps) {
  const [planes, setPlanes] = useState<Record<string, any[]>>(samplePlan)
  const [editMode, setEditMode] = useState(false)
  const [diaSeleccionado, setDiaSeleccionado] = useState("")
  const [nuevaActividad, setNuevaActividad] = useState({
    tipo: "fuerza",
    descripcion: "",
    icono: "dumbbell",
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  // Cargar planes desde Supabase
  useEffect(() => {
    if (planData.length > 0) {
      const planesFormateados = diasSemana.reduce(
        (acc, dia) => {
          const planDia = planData.find((p) => p.day === dia)
          acc[dia] = planDia ? planDia.activities : samplePlan[dia]
          return acc
        },
        {} as Record<string, any[]>,
      )

      setPlanes(planesFormateados)
    }
  }, [planData])

  // Renderizar icono según el tipo
  const renderIcon = (iconName) => {
    switch (iconName) {
      case "dumbbell":
        return <Dumbbell className="h-5 w-5" />
      case "brain":
        return <Brain className="h-5 w-5" />
      case "flame":
        return <Flame className="h-5 w-5" />
      case "heart":
        return <Heart className="h-5 w-5" />
      case "yoga":
        return <Yoga className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  // Obtener el día actual
  const today = new Date()
  const currentDay = diasSemana[today.getDay() === 0 ? 6 : today.getDay() - 1]

  // Manejar cambio de tipo de actividad
  const handleTipoChange = (value) => {
    const tipoSeleccionado = tiposActividad.find((t) => t.valor === value)
    setNuevaActividad({
      ...nuevaActividad,
      tipo: value,
      icono: tipoSeleccionado?.icono || "dumbbell",
    })
  }

  // Añadir nueva actividad
  const handleAddActividad = async () => {
    if (!diaSeleccionado || !nuevaActividad.descripcion) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const nuevasActividades = [...planes[diaSeleccionado], nuevaActividad]

    // Actualizar estado local
    setPlanes({
      ...planes,
      [diaSeleccionado]: nuevasActividades,
    })

    // Guardar en Supabase
    const planExistente = planData.find((p) => p.day === diaSeleccionado)

    try {
      if (planExistente) {
        await updatePlan(planExistente.id, nuevasActividades)
      } else {
        await addPlan({
          user_id: userId,
          day: diaSeleccionado,
          activities: nuevasActividades,
        })
      }

      toast({
        title: "Éxito",
        description: "Actividad añadida correctamente",
      })

      // Resetear formulario
      setNuevaActividad({
        tipo: "fuerza",
        descripcion: "",
        icono: "dumbbell",
      })
      setDialogOpen(false)
    } catch (error) {
      console.error("Error al guardar actividad:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad",
        variant: "destructive",
        action: <ToastAction altText="Intentar de nuevo">Intentar de nuevo</ToastAction>,
      })
    }
  }

  // Guardar plan personalizado
  const handleSavePlan = async () => {
    try {
      // Guardar cada día en Supabase
      for (const dia of diasSemana) {
        const planExistente = planData.find((p) => p.day === dia)

        if (planExistente) {
          await updatePlan(planExistente.id, planes[dia])
        } else {
          await addPlan({
            user_id: userId,
            day: dia,
            activities: planes[dia],
          })
        }
      }

      toast({
        title: "Éxito",
        description: "Plan guardado correctamente",
      })

      setEditMode(false)
    } catch (error) {
      console.error("Error al guardar plan:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el plan",
        variant: "destructive",
        action: <ToastAction altText="Intentar de nuevo">Intentar de nuevo</ToastAction>,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plan Semanal</h2>
        {editMode ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditMode(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Plan
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setEditMode(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Personalizar Plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diasSemana.map((dia) => (
          <Card key={dia} className={currentDay === dia ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="capitalize">{dia}</CardTitle>
                {editMode && (
                  <Dialog
                    open={dialogOpen && diaSeleccionado === dia}
                    onOpenChange={(open) => {
                      setDialogOpen(open)
                      if (open) setDiaSeleccionado(dia)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Actividad</DialogTitle>
                        <DialogDescription>Añade una nueva actividad para el {dia}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Tipo de Actividad</Label>
                          <Select value={nuevaActividad.tipo} onValueChange={handleTipoChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposActividad.map((tipo) => (
                                <SelectItem key={tipo.valor} value={tipo.valor}>
                                  <div className="flex items-center">
                                    <div className="mr-2">{renderIcon(tipo.icono)}</div>
                                    <span>{tipo.nombre}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="descripcion">Descripción</Label>
                          <Input
                            id="descripcion"
                            value={nuevaActividad.descripcion}
                            onChange={(e) => setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value })}
                            placeholder="Ej: Entrenamiento de fuerza - Tren superior"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddActividad}>Añadir</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {currentDay === dia && <CardDescription>Hoy</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planes[dia]?.map((actividad, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div
                      className={`
                      p-2 rounded-full mr-3
                      ${actividad.tipo === "fuerza" ? "bg-blue-100 text-blue-700" : ""}
                      ${actividad.tipo === "cardio" ? "bg-red-100 text-red-700" : ""}
                      ${actividad.tipo === "mindfulness" ? "bg-purple-100 text-purple-700" : ""}
                      ${actividad.tipo === "descanso" ? "bg-green-100 text-green-700" : ""}
                      ${actividad.tipo === "flexibilidad" ? "bg-yellow-100 text-yellow-700" : ""}
                    `}
                    >
                      {renderIcon(actividad.icono)}
                    </div>
                    <div>
                      <p className="font-medium">{actividad.descripcion}</p>
                      <p className="text-sm text-gray-500 capitalize">{actividad.tipo}</p>
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => {
                          const nuevasActividades = planes[dia].filter((_, i) => i !== index)
                          setPlanes({
                            ...planes,
                            [dia]: nuevasActividades,
                          })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {planes[dia]?.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No hay actividades planificadas</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre tu Plan</CardTitle>
          <CardDescription>Información sobre tu plan de entrenamiento holístico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Este plan semanal está diseñado para equilibrar tu bienestar físico y mental. Incluye una combinación de
              entrenamientos de fuerza, cardio, y prácticas de mindfulness.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center p-3 border rounded-lg">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-full mb-2">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">3 sesiones de fuerza</p>
              </div>
              <div className="flex flex-col items-center p-3 border rounded-lg">
                <div className="bg-red-100 text-red-700 p-2 rounded-full mb-2">
                  <Flame className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">2 sesiones de cardio</p>
              </div>
              <div className="flex flex-col items-center p-3 border rounded-lg">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-full mb-2">
                  <Brain className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">7 prácticas de mindfulness</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Personaliza tu plan según tus objetivos, disponibilidad y preferencias utilizando el botón "Personalizar
              Plan".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
