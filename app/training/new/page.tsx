"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Save, ArrowLeft, Dumbbell, Calendar, Clock, Target, User } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from 'uuid'

export default function NewTrainingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "strength",
    goal: "strength",
    level: "beginner",
    duration: "4",
    frequency: "3",
    equipment: "minimal"
  })

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Create new workout routine
      const routineId = uuidv4()
      const { error: routineError } = await supabase
        .from('workout_routines')
        .insert({
          id: routineId,
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          type: formData.type,
          goal: formData.goal,
          level: formData.level,
          duration_weeks: parseInt(formData.duration),
          frequency_per_week: parseInt(formData.frequency),
          equipment_needed: formData.equipment,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (routineError) throw routineError

      toast({
        title: "Rutina creada",
        description: "Tu nueva rutina de entrenamiento ha sido creada correctamente."
      })

      // Redirect to edit page
      router.push(`/training/edit?id=${routineId}`)
    } catch (error) {
      console.error("Error al crear rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina de entrenamiento.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nueva Rutina de Entrenamiento</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Define los detalles principales de tu rutina de entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la rutina</Label>
              <Input
                id="name"
                placeholder="Ej: Rutina de fuerza para principiantes"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el objetivo y características de esta rutina"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de entrenamiento</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Fuerza</SelectItem>
                    <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                    <SelectItem value="endurance">Resistencia</SelectItem>
                    <SelectItem value="power">Potencia</SelectItem>
                    <SelectItem value="functional">Funcional</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="mixed">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo principal</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => handleChange("goal", value)}
                >
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Selecciona un objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Aumentar fuerza</SelectItem>
                    <SelectItem value="muscle_gain">Ganar músculo</SelectItem>
                    <SelectItem value="fat_loss">Perder grasa</SelectItem>
                    <SelectItem value="endurance">Mejorar resistencia</SelectItem>
                    <SelectItem value="athletic">Rendimiento atlético</SelectItem>
                    <SelectItem value="health">Salud general</SelectItem>
                    <SelectItem value="rehabilitation">Rehabilitación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nivel de dificultad</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleChange("level", value)}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                    <SelectItem value="expert">Experto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Equipamiento necesario</Label>
                <Select
                  value={formData.equipment}
                  onValueChange={(value) => handleChange("equipment", value)}
                >
                  <SelectTrigger id="equipment">
                    <SelectValue placeholder="Selecciona equipamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin equipamiento</SelectItem>
                    <SelectItem value="minimal">Mínimo (bandas, mancuernas)</SelectItem>
                    <SelectItem value="home_gym">Gimnasio en casa</SelectItem>
                    <SelectItem value="full_gym">Gimnasio completo</SelectItem>
                    <SelectItem value="specialized">Equipamiento especializado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (semanas)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleChange("duration", value)}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Selecciona duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 semana</SelectItem>
                    <SelectItem value="2">2 semanas</SelectItem>
                    <SelectItem value="4">4 semanas</SelectItem>
                    <SelectItem value="6">6 semanas</SelectItem>
                    <SelectItem value="8">8 semanas</SelectItem>
                    <SelectItem value="12">12 semanas</SelectItem>
                    <SelectItem value="16">16 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia (días/semana)</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleChange("frequency", value)}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 días/semana</SelectItem>
                    <SelectItem value="3">3 días/semana</SelectItem>
                    <SelectItem value="4">4 días/semana</SelectItem>
                    <SelectItem value="5">5 días/semana</SelectItem>
                    <SelectItem value="6">6 días/semana</SelectItem>
                    <SelectItem value="7">7 días/semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Crear Rutina
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
