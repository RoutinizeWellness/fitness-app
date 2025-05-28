"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WorkoutStartButtonProps {
  dayId: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
  showIcon?: boolean
  text?: string
}

export function WorkoutStartButton({
  dayId,
  className = "",
  variant = "default",
  size = "default",
  fullWidth = false,
  showIcon = true,
  text = "Iniciar Entrenamiento"
}: WorkoutStartButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartWorkout = async () => {
    setIsLoading(true)

    try {
      // Validar que el ID del día sea válido
      if (!dayId) {
        throw new Error("ID de día no válido")
      }

      // Redirigir a la página de inicio de entrenamiento
      router.push(`/training/start-workout/${dayId}`)
    } catch (error) {
      console.error("Error al iniciar entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      onClick={handleStartWorkout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : showIcon ? (
        <Play className="h-4 w-4 mr-2" />
      ) : null}
      {text}
    </Button>
  )
}
