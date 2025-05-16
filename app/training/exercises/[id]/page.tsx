"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OrganicLayout } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { ExerciseTutorial } from "@/components/training/exercise-tutorial"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

// Datos de ejemplo para un ejercicio
const sampleExercise = {
  id: "squat",
  name: "Sentadilla (Squat)",
  description: "La sentadilla es un ejercicio compuesto que trabaja principalmente los músculos de las piernas y glúteos. Es un movimiento funcional que fortalece el tren inferior y mejora la movilidad de caderas, rodillas y tobillos.",
  gifUrl: "/exercises/squat.gif",
  muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
  difficulty: "intermediate" as const,
  equipment: ["Peso corporal", "Barra", "Mancuernas"],
  instructions: [
    "Colócate de pie con los pies separados a la anchura de los hombros o ligeramente más.",
    "Mantén el pecho erguido y la espalda recta durante todo el movimiento.",
    "Inicia el movimiento empujando las caderas hacia atrás, como si fueras a sentarte en una silla.",
    "Flexiona las rodillas y baja hasta que los muslos estén paralelos al suelo o más abajo si tu movilidad lo permite.",
    "Mantén los talones apoyados en el suelo y las rodillas alineadas con los pies.",
    "Empuja a través de los talones para volver a la posición inicial, extendiendo caderas y rodillas."
  ],
  tips: [
    "Mantén una postura neutra de la columna durante todo el movimiento.",
    "Respira profundamente antes de iniciar el descenso y exhala al subir.",
    "Activa el core para estabilizar la columna.",
    "Distribuye el peso uniformemente en ambos pies.",
    "Mira al frente para mantener una buena alineación de la columna."
  ],
  commonMistakes: [
    "Levantar los talones del suelo durante el descenso.",
    "Permitir que las rodillas se colapsen hacia adentro.",
    "Redondear la espalda, especialmente en la parte baja.",
    "No descender lo suficiente (sentadillas parciales).",
    "Desplazar el peso hacia adelante sobre los dedos de los pies."
  ],
  alternatives: [
    {
      id: "goblet-squat",
      name: "Sentadilla Goblet",
      difficulty: "beginner" as const
    },
    {
      id: "bulgarian-split-squat",
      name: "Sentadilla Búlgara",
      difficulty: "advanced" as const
    },
    {
      id: "leg-press",
      name: "Prensa de piernas",
      difficulty: "beginner" as const
    },
    {
      id: "hack-squat",
      name: "Hack Squat",
      difficulty: "intermediate" as const
    }
  ]
}

export default function ExercisePage({ params }: { params: { id: string } }) {
  const [exercise, setExercise] = useState(sampleExercise)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Obtener datos del ejercicio
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        // Aquí iría la lógica para obtener el ejercicio de Supabase
        // Por ahora usamos los datos de ejemplo
        setExercise(sampleExercise)
      } catch (error) {
        console.error("Error al cargar el ejercicio:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExercise()
  }, [params.id])
  
  return (
    <OrganicLayout
      activeTab="training"
      title={isLoading ? "Cargando ejercicio..." : exercise.name}
    >
      <OrganicElement type="fade">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 rounded-full"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalles del ejercicio</h1>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <ExerciseTutorial exercise={exercise} />
        )}
      </OrganicElement>
    </OrganicLayout>
  )
}
