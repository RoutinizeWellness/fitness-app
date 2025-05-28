"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { WorkoutQuestionnaire, WorkoutPreferences } from "@/components/training/workout-questionnaire"
import { WorkoutGenerator, GeneratedWorkout } from "@/components/training/workout-generator"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { Button3D } from "@/components/ui/button-3d"
import { ArrowLeft, Dumbbell } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CreateRoutinePage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<"questionnaire" | "generator" | "complete">("questionnaire")
  const [preferences, setPreferences] = useState<WorkoutPreferences | null>(null)

  // Manejar finalización del cuestionario
  const handleQuestionnaireComplete = (prefs: WorkoutPreferences) => {
    setPreferences(prefs)
    setStep("generator")
  }

  // Manejar edición de preferencias
  const handleEditPreferences = () => {
    setStep("questionnaire")
  }

  // Manejar guardado de rutina
  const handleSaveWorkout = (workout: GeneratedWorkout) => {
    toast({
      title: "Rutina guardada",
      description: "Tu rutina personalizada ha sido guardada correctamente",
    })

    setStep("complete")

    // Redirigir a la página de entrenamiento después de un breve retraso
    setTimeout(() => {
      router.push("/training")
    }, 1500)
  }

  // Manejar cancelación
  const handleCancel = () => {
    router.push("/training")
  }

  // Mostrar loader mientras se carga la autenticación
  if (authLoading) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-md mx-auto p-4 pt-20 pb-24 flex items-center justify-center min-h-screen">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    )
  }

  // Redirigir si no hay usuario autenticado
  if (!user) {
    router.push("/welcome")
    return null
  }

  return (
    <RoutinizeLayout>
      <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button3D
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold">Crear rutina personalizada</h1>
        </div>

        {step === "questionnaire" && (
          <WorkoutQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onCancel={handleCancel}
          />
        )}

        {step === "generator" && preferences && (
          <WorkoutGenerator
            preferences={preferences}
            userId={user.id}
            onSave={handleSaveWorkout}
            onEdit={handleEditPreferences}
            onCancel={handleCancel}
          />
        )}

        {step === "complete" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center mb-6">
              <Dumbbell className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Rutina creada!</h2>
            <p className="text-muted-foreground mb-6">
              Tu rutina personalizada ha sido creada y guardada correctamente.
              Redirigiendo a la página de entrenamiento...
            </p>
            <PulseLoader />
          </div>
        )}
      </div>
    </RoutinizeLayout>
  )
}
