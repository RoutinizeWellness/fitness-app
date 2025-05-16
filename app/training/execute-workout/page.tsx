"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Dumbbell, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Datos simulados para los días de entrenamiento
const workoutDays = [
  {
    id: "day-1",
    name: "Lunes: Piernas",
    description: "Entrenamiento enfocado en piernas con énfasis en cuádriceps y glúteos",
    muscleGroups: ["Piernas", "Glúteos"],
    exerciseCount: 5,
    duration: "60-75 min",
    difficulty: "Intermedio"
  },
  {
    id: "day-2",
    name: "Martes: Pecho y Espalda",
    description: "Entrenamiento de empuje y tracción para el tren superior",
    muscleGroups: ["Pecho", "Espalda"],
    exerciseCount: 6,
    duration: "70-80 min",
    difficulty: "Avanzado"
  },
  {
    id: "day-3",
    name: "Jueves: Hombros y Brazos",
    description: "Entrenamiento de hombros, bíceps y tríceps",
    muscleGroups: ["Hombros", "Brazos"],
    exerciseCount: 5,
    duration: "50-60 min",
    difficulty: "Intermedio"
  },
  {
    id: "day-4",
    name: "Viernes: Piernas",
    description: "Segundo entrenamiento de piernas con énfasis en isquiotibiales y glúteos",
    muscleGroups: ["Piernas"],
    exerciseCount: 4,
    duration: "55-65 min",
    difficulty: "Intermedio"
  }
]

export default function ExecuteWorkoutIndexPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Manejar la selección de un día
  const handleSelectDay = (dayId: string) => {
    setSelectedDay(dayId)
  }

  // Iniciar el entrenamiento seleccionado
  const handleStartWorkout = () => {
    if (!selectedDay) {
      toast({
        title: "Selecciona un día",
        description: "Por favor, selecciona un día de entrenamiento para continuar.",
        variant: "destructive"
      })
      return
    }

    router.push(`/training/execute-workout/${selectedDay}`)
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm"
            onClick={() => router.push('/training')}
          >
            <ChevronLeft className="h-5 w-5 text-[#573353]" />
          </button>
          <h1 className="text-xl font-bold text-[#573353]">Ejecutar Entrenamiento</h1>
          <div className="w-10"></div> {/* Spacer para centrar el título */}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 pb-20 overflow-y-auto h-[calc(896px-140px)]">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-[#573353] mb-2">Selecciona un día de entrenamiento</h2>
          <p className="text-sm text-muted-foreground">
            Elige el día de entrenamiento que deseas realizar hoy.
          </p>
        </div>

        <div className="space-y-4">
          {workoutDays.map(day => (
            <Card
              key={day.id}
              className={`cursor-pointer transition-all ${
                selectedDay === day.id
                  ? 'border-primary border-2 shadow-md'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectDay(day.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-base">{day.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{day.description}</p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {day.muscleGroups.map(group => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedDay === day.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Dumbbell className="h-3.5 w-3.5 mr-1" />
                    <span>{day.exerciseCount} ejercicios</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{day.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={
                      day.difficulty === "Principiante" ? "secondary" :
                      day.difficulty === "Intermedio" ? "default" :
                      "destructive"
                    } className="text-[10px] h-5">
                      {day.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            onClick={handleStartWorkout}
            disabled={!selectedDay}
          >
            Iniciar Entrenamiento
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/training/execute-workout/day-1')}
            >
              Día 1 (Directo)
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/training/execute-workout/day-2')}
            >
              Día 2 (Directo)
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground mt-2">
            Botones de acceso directo para depuración
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 w-[414px] h-[80px] bg-white border-t border-gray-100 flex justify-around items-center py-3 px-2 z-10 shadow-md">
        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Home</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/training')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10M12 20V4M6 20V14"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Training</span>
        </button>

        <button
          className="flex flex-col items-center relative w-[20%]"
          onClick={() => router.push('/training/log-workout')}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FDA758] to-[#FE9870] flex items-center justify-center absolute -top-[26px] shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-7 h-7 mt-8"></div>
          <span className="text-xs font-medium text-[#573353]/70">Log</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/training/calendar')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
              <path d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Calendar</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/profile')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Profile</span>
        </button>
      </div>
    </div>
  )
}
