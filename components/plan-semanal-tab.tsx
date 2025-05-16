"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { getPlans, addPlan, updatePlan, deletePlan, type Plan } from "@/lib/supabase"
import { Dumbbell, Edit, Heart, Leaf, Plus, Trash2, Save, X, Activity, Bike } from "lucide-react"

interface PlanSemanalTabProps {
  userId: string
}

export default function PlanSemanalTab({ userId }: PlanSemanalTabProps) {
  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
  const currentDay = diasSemana[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  const [planes, setPlanes] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [diaSeleccionado, setDiaSeleccionado] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nuevaActividad, setNuevaActividad] = useState({
    tipo: "fuerza",
    descripcion: "",
    icono: "dumbbell",
  })

  // Cargar planes desde Supabase
  useEffect(() => {
    const loadPlanes = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getPlans(userId)

        if (error) {
          throw error
        }

        // Inicializar planes vacíos para cada día
        const planesIniciales = diasSemana.reduce((acc, dia) => {
          acc[dia] = []
          return acc
        }, {} as Record<string, any[]>)

        // Llenar con datos de Supabase si existen
        if (data && data.length > 0) {
          data.forEach(plan => {
            if (diasSemana.includes(plan.day)) {
              planesIniciales[plan.day] = plan.activities
            }
          })
        } else {
          // Datos de ejemplo si no hay planes en Supabase
          planesIniciales.lunes = [
            { tipo: "fuerza", descripcion: "Entrenamiento de piernas", icono: "dumbbell" },
            { tipo: "cardio", descripcion: "30 min de bicicleta", icono: "running" }
          ]
          planesIniciales.miércoles = [
            { tipo: "fuerza", descripcion: "Entrenamiento de pecho y espalda", icono: "dumbbell" }
          ]
          planesIniciales.viernes = [
            { tipo: "fuerza", descripcion: "Entrenamiento de brazos y hombros", icono: "dumbbell" }
          ]
          planesIniciales.domingo = [
            { tipo: "descanso", descripcion: "Día de recuperación", icono: "heart" }
          ]
        }

        setPlanes(planesIniciales)
      } catch (error) {
        console.error("Error al cargar planes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes semanales",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPlanes()
  }, [userId])

  // Guardar plan para un día
  const guardarPlan = async (dia: string) => {
    try {
      // Buscar si ya existe un plan para este día
      const { data: planesExistentes, error: errorBusqueda } = await getPlans(userId, {
        filters: { day: dia }
      })

      if (errorBusqueda) {
        throw errorBusqueda
      }

      if (planesExistentes && planesExistentes.length > 0) {
        // Actualizar plan existente
        const { error } = await updatePlan(planesExistentes[0].id, {
          activities: planes[dia]
        })

        if (error) {
          throw error
        }
      } else {
        // Crear nuevo plan
        const { error } = await addPlan({
          user_id: userId,
          day: dia,
          activities: planes[dia]
        })

        if (error) {
          throw error
        }
      }

      toast({
        title: "Plan guardado",
        description: `El plan para el ${dia} ha sido guardado correctamente`,
      })
    } catch (error) {
      console.error(`Error al guardar plan para ${dia}:`, error)
      toast({
        title: "Error",
        description: "No se pudo guardar el plan",
        variant: "destructive",
      })
    }
  }

  // Agregar nueva actividad
  const agregarActividad = () => {
    if (!nuevaActividad.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción de la actividad es obligatoria",
        variant: "destructive",
      })
      return
    }

    const nuevosPlanes = { ...planes }
    nuevosPlanes[diaSeleccionado] = [
      ...nuevosPlanes[diaSeleccionado],
      { ...nuevaActividad }
    ]

    setPlanes(nuevosPlanes)
    setNuevaActividad({
      tipo: "fuerza",
      descripcion: "",
      icono: "dumbbell",
    })
    setDialogOpen(false)

    // Guardar cambios en Supabase
    guardarPlan(diaSeleccionado)
  }

  // Eliminar actividad
  const eliminarActividad = (dia: string, index: number) => {
    const nuevosPlanes = { ...planes }
    nuevosPlanes[dia] = nuevosPlanes[dia].filter((_, i) => i !== index)
    setPlanes(nuevosPlanes)

    // Guardar cambios en Supabase
    guardarPlan(dia)
  }

  // Renderizar icono según el tipo
  const renderIcon = (icono: string) => {
    switch (icono) {
      case "dumbbell":
        return <Dumbbell className="h-4 w-4" />
      case "running":
        return <Activity className="h-4 w-4" />
      case "yoga":
        return <Bike className="h-4 w-4" />
      case "leaf":
        return <Leaf className="h-4 w-4" />
      case "heart":
        return <Heart className="h-4 w-4" />
      default:
        return <Dumbbell className="h-4 w-4" />
    }
  }

  // Actualizar icono según el tipo de actividad
  useEffect(() => {
    switch (nuevaActividad.tipo) {
      case "fuerza":
        setNuevaActividad(prev => ({ ...prev, icono: "dumbbell" }))
        break
      case "cardio":
        setNuevaActividad(prev => ({ ...prev, icono: "running" }))
        break
      case "flexibilidad":
        setNuevaActividad(prev => ({ ...prev, icono: "yoga" }))
        break
      case "mindfulness":
        setNuevaActividad(prev => ({ ...prev, icono: "leaf" }))
        break
      case "descanso":
        setNuevaActividad(prev => ({ ...prev, icono: "heart" }))
        break
    }
  }, [nuevaActividad.tipo])

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Plan Semanal</h2>
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </>
          )}
        </Button>
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
                          <Select
                            value={nuevaActividad.tipo}
                            onValueChange={(value) => setNuevaActividad({ ...nuevaActividad, tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fuerza">Fuerza</SelectItem>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="flexibilidad">Flexibilidad</SelectItem>
                              <SelectItem value="mindfulness">Mindfulness</SelectItem>
                              <SelectItem value="descanso">Descanso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="descripcion">Descripción</Label>
                          <Input
                            id="descripcion"
                            value={nuevaActividad.descripcion}
                            onChange={(e) => setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value })}
                            placeholder="Ej: 30 min de entrenamiento de piernas"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={agregarActividad}>Añadir</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {currentDay === dia && <CardDescription>Hoy</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planes[dia]?.length > 0 ? (
                  planes[dia]?.map((actividad, index) => (
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
                      <div className="flex-1">
                        <p className="font-medium">{actividad.descripcion}</p>
                        <p className="text-xs text-gray-500 capitalize">{actividad.tipo}</p>
                      </div>
                      {editMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarActividad(dia, index)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No hay actividades programadas</p>
                    {editMode && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setDiaSeleccionado(dia)
                          setDialogOpen(true)
                        }}
                        className="mt-2"
                      >
                        Añadir actividad
                      </Button>
                    )}
                  </div>
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
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">2 sesiones de cardio</p>
              </div>
              <div className="flex flex-col items-center p-3 border rounded-lg">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-full mb-2">
                  <Bike className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">1 sesión de flexibilidad</p>
              </div>
              <div className="flex flex-col items-center p-3 border rounded-lg">
                <div className="bg-green-100 text-green-700 p-2 rounded-full mb-2">
                  <Heart className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">1 día de descanso</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
