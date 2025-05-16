"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Edit, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface FitnessPlanCardProps {
  title: string
  description: string
  level: string
  daysPerWeek: number
  duration: number
  days: {
    id: string
    name: string
    description: string
    isRestDay?: boolean
    muscleGroups?: string[]
  }[]
  onEdit?: () => void
  onGenerateNew?: () => void
}

export default function FitnessPlanCard({
  title,
  description,
  level,
  daysPerWeek,
  duration,
  days,
  onEdit,
  onGenerateNew
}: FitnessPlanCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeDay, setActiveDay] = useState<string>(days[0]?.id || "")

  // Manejar el inicio de un entrenamiento
  const handleStartWorkout = (dayId: string) => {
    try {
      // Navegar a la página de entrenamiento con el día seleccionado
      router.push(`/training/workout/${dayId}`)
    } catch (error) {
      console.error("Error al iniciar el entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Manejar la edición del plan
  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      toast({
        title: "Función no disponible",
        description: "La edición de planes no está disponible en este momento.",
        variant: "destructive"
      })
    }
  }

  // Manejar la generación de un nuevo plan
  const handleGenerateNew = () => {
    if (onGenerateNew) {
      onGenerateNew()
    } else {
      toast({
        title: "Función no disponible",
        description: "La generación de nuevos planes no está disponible en este momento.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Editar plan" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Generar nuevo plan" onClick={handleGenerateNew}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="capitalize">
            {level}
          </Badge>
          <Badge variant="outline">
            {daysPerWeek} días/semana
          </Badge>
          <Badge variant="outline">
            {duration} semanas
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            {days.map((day, index) => (
              <TabsTrigger key={day.id} value={day.id} disabled={day.isRestDay}>
                {`Día ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map(day => (
            <TabsContent key={day.id} value={day.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{day.name}</h3>
                {!day.isRestDay && (
                  <Button onClick={() => handleStartWorkout(day.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Entrenamiento
                  </Button>
                )}
              </div>

              <p className="text-gray-500">{day.description}</p>

              {day.muscleGroups && day.muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {day.muscleGroups.map(muscle => (
                    <Badge key={muscle} variant="secondary">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
