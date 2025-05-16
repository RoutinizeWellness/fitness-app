"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Dumbbell, Heart, Loader2, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function Registro({ addWorkout, addMood, setActiveTab }) {
  const [activeForm, setActiveForm] = useState("workout")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [workoutFormData, setWorkoutFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Fuerza",
    name: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
    distance: "",
    notes: "",
  })

  const [moodFormData, setMoodFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    moodLevel: 3,
    stressLevel: 3,
    sleepHours: 7,
    notes: "",
  })

  // Verificar si hay un formulario activo guardado en localStorage
  useEffect(() => {
    const savedActiveForm = localStorage.getItem("activeForm")
    if (savedActiveForm) {
      setActiveForm(savedActiveForm)
      localStorage.removeItem("activeForm")
    }
  }, [])

  // Validar formulario de entrenamiento
  const validateWorkoutForm = () => {
    const newErrors = {}

    if (!workoutFormData.date) {
      newErrors.date = "La fecha es requerida"
    }

    if (!workoutFormData.type) {
      newErrors.type = "El tipo de entrenamiento es requerido"
    }

    if (!workoutFormData.name) {
      newErrors.name = "El nombre del entrenamiento es requerido"
    }

    if (workoutFormData.type === "Fuerza") {
      if (!workoutFormData.sets) {
        newErrors.sets = "Las series son requeridas para entrenamientos de fuerza"
      }
      if (!workoutFormData.reps) {
        newErrors.reps = "Las repeticiones son requeridas para entrenamientos de fuerza"
      }
    }

    if (workoutFormData.type === "Cardio" && !workoutFormData.duration) {
      newErrors.duration = "La duración es requerida para entrenamientos de cardio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validar formulario de estado de ánimo
  const validateMoodForm = () => {
    const newErrors = {}

    if (!moodFormData.date) {
      newErrors.date = "La fecha es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault()

    if (!validateWorkoutForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await addWorkout(workoutFormData)

      if (success) {
        toast({
          title: "Entrenamiento registrado",
          description: "Tu entrenamiento ha sido registrado correctamente",
        })

        // Resetear formulario
        setWorkoutFormData({
          date: new Date().toISOString().split("T")[0],
          type: "Fuerza",
          name: "",
          sets: "",
          reps: "",
          weight: "",
          duration: "",
          distance: "",
          notes: "",
        })

        // Redirigir al dashboard
        setActiveTab("dashboard")
      } else {
        toast({
          title: "Error",
          description: "No se pudo registrar el entrenamiento. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al registrar entrenamiento:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoodSubmit = async (e) => {
    e.preventDefault()

    if (!validateMoodForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await addMood(moodFormData)

      if (success) {
        toast({
          title: "Estado de ánimo registrado",
          description: "Tu estado de ánimo ha sido registrado correctamente",
        })

        // Resetear formulario
        setMoodFormData({
          date: new Date().toISOString().split("T")[0],
          moodLevel: 3,
          stressLevel: 3,
          sleepHours: 7,
          notes: "",
        })

        // Redirigir al dashboard
        setActiveTab("dashboard")
      } else {
        toast({
          title: "Error",
          description: "No se pudo registrar el estado de ánimo. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al registrar estado de ánimo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el estado de ánimo",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeForm} onValueChange={setActiveForm} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            <span>Registrar Entrenamiento</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span>Registrar Estado de Ánimo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Entrenamiento</CardTitle>
              <CardDescription>Registra los detalles de tu entrenamiento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWorkoutSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-date">Fecha</Label>
                    <div className="flex">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              errors.date ? "border-red-500" : ""
                            }`}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {workoutFormData.date ? (
                              format(new Date(workoutFormData.date), "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={workoutFormData.date ? new Date(workoutFormData.date) : undefined}
                            onSelect={(date) =>
                              setWorkoutFormData({
                                ...workoutFormData,
                                date: date ? date.toISOString().split("T")[0] : "",
                              })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workout-type">Tipo de Entrenamiento</Label>
                    <Select
                      value={workoutFormData.type}
                      onValueChange={(value) => setWorkoutFormData({ ...workoutFormData, type: value })}
                    >
                      <SelectTrigger id="workout-type" className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fuerza">Fuerza</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                        <SelectItem value="Flexibilidad">Flexibilidad</SelectItem>
                        <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workout-name">Nombre/Actividad</Label>
                  <Input
                    id="workout-name"
                    placeholder="Ej: Sentadillas, Carrera, Yoga..."
                    value={workoutFormData.name}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, name: e.target.value })}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {workoutFormData.type === "Fuerza" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workout-sets">Series</Label>
                      <Input
                        id="workout-sets"
                        type="number"
                        min="1"
                        placeholder="Ej: 3"
                        value={workoutFormData.sets}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, sets: e.target.value })}
                        className={errors.sets ? "border-red-500" : ""}
                      />
                      {errors.sets && <p className="text-sm text-red-500">{errors.sets}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workout-reps">Repeticiones</Label>
                      <Input
                        id="workout-reps"
                        placeholder="Ej: 10 o 8-12"
                        value={workoutFormData.reps}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, reps: e.target.value })}
                        className={errors.reps ? "border-red-500" : ""}
                      />
                      {errors.reps && <p className="text-sm text-red-500">{errors.reps}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workout-weight">Peso (kg)</Label>
                      <Input
                        id="workout-weight"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Ej: 60"
                        value={workoutFormData.weight}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, weight: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {workoutFormData.type === "Cardio" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workout-duration">Duración (minutos)</Label>
                      <Input
                        id="workout-duration"
                        type="number"
                        min="1"
                        placeholder="Ej: 30"
                        value={workoutFormData.duration}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, duration: e.target.value })}
                        className={errors.duration ? "border-red-500" : ""}
                      />
                      {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workout-distance">Distancia (km)</Label>
                      <Input
                        id="workout-distance"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 5"
                        value={workoutFormData.distance}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, distance: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="workout-notes">Notas</Label>
                  <Textarea
                    id="workout-notes"
                    placeholder="Añade notas sobre tu entrenamiento..."
                    value={workoutFormData.notes}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("dashboard")}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Entrenamiento"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Estado de Ánimo</CardTitle>
              <CardDescription>Registra tu bienestar mental y emocional</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMoodSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mood-date">Fecha</Label>
                  <div className="flex">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            errors.date ? "border-red-500" : ""
                          }`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {moodFormData.date ? (
                            format(new Date(moodFormData.date), "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={moodFormData.date ? new Date(moodFormData.date) : undefined}
                          onSelect={(date) =>
                            setMoodFormData({
                              ...moodFormData,
                              date: date ? date.toISOString().split("T")[0] : "",
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="mood-level">Nivel de Ánimo</Label>
                      <span className="text-sm">{moodFormData.moodLevel}/5</span>
                    </div>
                    <Slider
                      id="mood-level"
                      min={1}
                      max={5}
                      step={1}
                      value={[moodFormData.moodLevel]}
                      onValueChange={(value) => setMoodFormData({ ...moodFormData, moodLevel: value[0] })}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="stress-level">Nivel de Estrés</Label>
                      <span className="text-sm">{moodFormData.stressLevel}/5</span>
                    </div>
                    <Slider
                      id="stress-level"
                      min={1}
                      max={5}
                      step={1}
                      value={[moodFormData.stressLevel]}
                      onValueChange={(value) => setMoodFormData({ ...moodFormData, stressLevel: value[0] })}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep-hours">Horas de Sueño</Label>
                  <Input
                    id="sleep-hours"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    placeholder="Ej: 7.5"
                    value={moodFormData.sleepHours}
                    onChange={(e) =>
                      setMoodFormData({ ...moodFormData, sleepHours: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mood-notes">Notas</Label>
                  <Textarea
                    id="mood-notes"
                    placeholder="¿Cómo te sientes hoy? ¿Hay algo que quieras registrar?"
                    value={moodFormData.notes}
                    onChange={(e) => setMoodFormData({ ...moodFormData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("dashboard")}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Estado"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
