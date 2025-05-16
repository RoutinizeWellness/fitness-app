"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dumbbell,
  Target,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Info
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

// Tipos para el cuestionario
export interface WorkoutPreferences {
  goal: string
  experience: string
  frequency: number
  duration: number
  focusAreas: string[]
  equipment: string[]
  limitations: string[]
  timeOfDay: string
  age: number
  gender: string
  height: number
  weight: number
  bodyType: string
  sleepQuality: string
  stressLevel: string
  nutritionPreference: string
  recoveryCapacity: string
  previousInjuries: string[]
  trainingPreference: string
  cardioPreference: string
  strengthFocus: string
  preferredExercises: string[]
  avoidedExercises: string[]
  weeklySchedule: string[]
  trainingEnvironment: string
  fitnessAssessment: {
    pushups: number
    pullups: number
    squats: number
    plank: number
  }
}

interface WorkoutQuestionnaireProps {
  onComplete: (preferences: WorkoutPreferences) => void
  onCancel?: () => void
}

export function WorkoutQuestionnaire({ onComplete, onCancel }: WorkoutQuestionnaireProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goal: "hypertrophy",
    experience: "intermediate",
    frequency: 4,
    duration: 60,
    focusAreas: ["chest", "back", "legs"],
    equipment: ["barbell", "dumbbell", "machine"],
    limitations: [],
    timeOfDay: "evening",
    age: 30,
    gender: "male",
    height: 175,
    weight: 75,
    bodyType: "mesomorph",
    sleepQuality: "good",
    stressLevel: "moderate",
    nutritionPreference: "balanced",
    recoveryCapacity: "average",
    previousInjuries: [],
    trainingPreference: "traditional",
    cardioPreference: "moderate",
    strengthFocus: "compound",
    preferredExercises: [],
    avoidedExercises: [],
    weeklySchedule: ["monday", "tuesday", "thursday", "friday"],
    trainingEnvironment: "gym",
    fitnessAssessment: {
      pushups: 20,
      pullups: 8,
      squats: 25,
      plank: 60
    }
  })

  // Opciones para cada campo
  const goalOptions = [
    { value: "strength", label: "Fuerza", description: "Aumentar tu fuerza máxima" },
    { value: "hypertrophy", label: "Hipertrofia", description: "Aumentar el tamaño muscular" },
    { value: "endurance", label: "Resistencia", description: "Mejorar la resistencia muscular" },
    { value: "weight_loss", label: "Pérdida de peso", description: "Reducir grasa corporal" },
    { value: "general_fitness", label: "Fitness general", description: "Mejorar la condición física" },
    { value: "athletic", label: "Rendimiento atlético", description: "Mejorar capacidades atléticas" }
  ]

  const experienceOptions = [
    { value: "beginner", label: "Principiante", description: "Menos de 1 año de entrenamiento" },
    { value: "intermediate", label: "Intermedio", description: "1-3 años de entrenamiento" },
    { value: "advanced", label: "Avanzado", description: "Más de 3 años de entrenamiento" }
  ]

  const muscleGroups = [
    { value: "chest", label: "Pecho" },
    { value: "back", label: "Espalda" },
    { value: "shoulders", label: "Hombros" },
    { value: "arms", label: "Brazos" },
    { value: "legs", label: "Piernas" },
    { value: "glutes", label: "Glúteos" },
    { value: "core", label: "Core/Abdominales" },
    { value: "full_body", label: "Cuerpo completo" }
  ]

  const equipmentOptions = [
    { value: "bodyweight", label: "Peso corporal" },
    { value: "dumbbell", label: "Mancuernas" },
    { value: "barbell", label: "Barra" },
    { value: "machine", label: "Máquinas" },
    { value: "cable", label: "Poleas" },
    { value: "kettlebell", label: "Kettlebells" },
    { value: "resistance_band", label: "Bandas elásticas" },
    { value: "suspension", label: "TRX/Suspensión" }
  ]

  const limitationOptions = [
    { value: "shoulder", label: "Problemas de hombro" },
    { value: "knee", label: "Problemas de rodilla" },
    { value: "back", label: "Problemas de espalda" },
    { value: "wrist", label: "Problemas de muñeca" },
    { value: "hip", label: "Problemas de cadera" },
    { value: "ankle", label: "Problemas de tobillo" },
    { value: "none", label: "Sin limitaciones" }
  ]

  const timeOptions = [
    { value: "morning", label: "Mañana" },
    { value: "afternoon", label: "Tarde" },
    { value: "evening", label: "Noche" },
    { value: "variable", label: "Variable" }
  ]

  const genderOptions = [
    { value: "male", label: "Hombre" },
    { value: "female", label: "Mujer" },
    { value: "other", label: "Otro" }
  ]

  const bodyTypeOptions = [
    { value: "ectomorph", label: "Ectomorfo", description: "Cuerpo delgado, dificultad para ganar peso" },
    { value: "mesomorph", label: "Mesomorfo", description: "Cuerpo atlético, facilidad para ganar músculo" },
    { value: "endomorph", label: "Endomorfo", description: "Cuerpo más ancho, tendencia a acumular grasa" }
  ]

  const sleepQualityOptions = [
    { value: "poor", label: "Mala", description: "Menos de 6 horas o sueño interrumpido" },
    { value: "average", label: "Regular", description: "6-7 horas con calidad variable" },
    { value: "good", label: "Buena", description: "7-8 horas de sueño continuo" },
    { value: "excellent", label: "Excelente", description: "Más de 8 horas de sueño profundo" }
  ]

  const stressLevelOptions = [
    { value: "low", label: "Bajo", description: "Poco estrés diario" },
    { value: "moderate", label: "Moderado", description: "Estrés manejable" },
    { value: "high", label: "Alto", description: "Estrés significativo" },
    { value: "severe", label: "Severo", description: "Estrés constante y difícil de manejar" }
  ]

  const nutritionOptions = [
    { value: "balanced", label: "Equilibrada", description: "Dieta variada y balanceada" },
    { value: "high_protein", label: "Alta en proteínas", description: "Enfoque en proteínas" },
    { value: "low_carb", label: "Baja en carbohidratos", description: "Restricción de carbohidratos" },
    { value: "vegetarian", label: "Vegetariana", description: "Sin carne" },
    { value: "vegan", label: "Vegana", description: "Sin productos animales" },
    { value: "keto", label: "Cetogénica", description: "Alta en grasas, muy baja en carbohidratos" }
  ]

  const recoveryOptions = [
    { value: "fast", label: "Rápida", description: "Recuperación en menos de 24 horas" },
    { value: "average", label: "Normal", description: "Recuperación en 24-48 horas" },
    { value: "slow", label: "Lenta", description: "Recuperación en más de 48 horas" }
  ]

  const injuryOptions = [
    { value: "shoulder", label: "Hombro" },
    { value: "knee", label: "Rodilla" },
    { value: "back", label: "Espalda" },
    { value: "hip", label: "Cadera" },
    { value: "ankle", label: "Tobillo" },
    { value: "wrist", label: "Muñeca" },
    { value: "elbow", label: "Codo" },
    { value: "neck", label: "Cuello" }
  ]

  const trainingPreferenceOptions = [
    { value: "traditional", label: "Tradicional", description: "Series y repeticiones estándar" },
    { value: "circuit", label: "Circuito", description: "Ejercicios consecutivos con poco descanso" },
    { value: "superset", label: "Superseries", description: "Pares de ejercicios sin descanso entre ellos" },
    { value: "hiit", label: "HIIT", description: "Entrenamiento de alta intensidad por intervalos" },
    { value: "pyramid", label: "Pirámide", description: "Aumento/disminución progresiva de peso" }
  ]

  const cardioOptions = [
    { value: "none", label: "Ninguno", description: "Sin entrenamiento cardiovascular" },
    { value: "light", label: "Ligero", description: "1-2 sesiones semanales de baja intensidad" },
    { value: "moderate", label: "Moderado", description: "2-3 sesiones semanales de intensidad media" },
    { value: "intense", label: "Intenso", description: "3+ sesiones semanales de alta intensidad" }
  ]

  const strengthFocusOptions = [
    { value: "compound", label: "Ejercicios compuestos", description: "Enfoque en movimientos multiarticulares" },
    { value: "isolation", label: "Ejercicios de aislamiento", description: "Enfoque en músculos específicos" },
    { value: "balanced", label: "Equilibrado", description: "Combinación de ambos tipos" }
  ]

  const weekdayOptions = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" }
  ]

  const environmentOptions = [
    { value: "gym", label: "Gimnasio comercial", description: "Acceso a equipamiento completo" },
    { value: "home", label: "Casa", description: "Equipamiento limitado en casa" },
    { value: "outdoor", label: "Exterior", description: "Entrenamiento al aire libre" },
    { value: "hybrid", label: "Híbrido", description: "Combinación de diferentes entornos" }
  ]

  // Pasos del cuestionario
  const steps = [
    {
      title: "Objetivo principal",
      description: "¿Cuál es tu objetivo principal de entrenamiento?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={preferences.goal}
            onValueChange={(value) => updatePreference("goal", value)}
            className="space-y-3"
          >
            {goalOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem value={option.value} id={`goal-${option.value}`} />
                <div className="grid gap-1">
                  <Label htmlFor={`goal-${option.value}`} className="font-medium">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    },
    {
      title: "Nivel de experiencia",
      description: "¿Cuál es tu nivel de experiencia en el entrenamiento?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={preferences.experience}
            onValueChange={(value) => updatePreference("experience", value)}
            className="space-y-3"
          >
            {experienceOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem value={option.value} id={`experience-${option.value}`} />
                <div className="grid gap-1">
                  <Label htmlFor={`experience-${option.value}`} className="font-medium">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    },
    {
      title: "Frecuencia y duración",
      description: "¿Con qué frecuencia y duración quieres entrenar?",
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Días por semana</Label>
              <span className="font-medium text-primary">{preferences.frequency} días</span>
            </div>
            <Slider
              value={[preferences.frequency]}
              min={2}
              max={6}
              step={1}
              onValueChange={(value) => updatePreference("frequency", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Duración por sesión</Label>
              <span className="font-medium text-primary">{preferences.duration} min</span>
            </div>
            <Slider
              value={[preferences.duration]}
              min={30}
              max={120}
              step={15}
              onValueChange={(value) => updatePreference("duration", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30m</span>
              <span>45m</span>
              <span>60m</span>
              <span>75m</span>
              <span>90m</span>
              <span>105m</span>
              <span>120m</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Áreas de enfoque",
      description: "¿Qué grupos musculares quieres priorizar?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {muscleGroups.map((group) => (
              <div key={group.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`muscle-${group.value}`}
                  checked={preferences.focusAreas.includes(group.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreference("focusAreas", [...preferences.focusAreas, group.value])
                    } else {
                      updatePreference(
                        "focusAreas",
                        preferences.focusAreas.filter((area) => area !== group.value)
                      )
                    }
                  }}
                />
                <Label htmlFor={`muscle-${group.value}`}>{group.label}</Label>
              </div>
            ))}
          </div>
          {preferences.focusAreas.length === 0 && (
            <p className="text-sm text-amber-500">Selecciona al menos un grupo muscular</p>
          )}
        </div>
      )
    },
    {
      title: "Equipamiento disponible",
      description: "¿Qué equipamiento tienes disponible para entrenar?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {equipmentOptions.map((equipment) => (
              <div key={equipment.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`equipment-${equipment.value}`}
                  checked={preferences.equipment.includes(equipment.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreference("equipment", [...preferences.equipment, equipment.value])
                    } else {
                      updatePreference(
                        "equipment",
                        preferences.equipment.filter((item) => item !== equipment.value)
                      )
                    }
                  }}
                />
                <Label htmlFor={`equipment-${equipment.value}`}>{equipment.label}</Label>
              </div>
            ))}
          </div>
          {preferences.equipment.length === 0 && (
            <p className="text-sm text-amber-500">Selecciona al menos un tipo de equipamiento</p>
          )}
        </div>
      )
    },
    {
      title: "Limitaciones físicas",
      description: "¿Tienes alguna limitación física que debamos considerar?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {limitationOptions.map((limitation) => (
              <div key={limitation.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`limitation-${limitation.value}`}
                  checked={
                    limitation.value === "none"
                      ? preferences.limitations.length === 0
                      : preferences.limitations.includes(limitation.value)
                  }
                  onCheckedChange={(checked) => {
                    if (limitation.value === "none") {
                      updatePreference("limitations", checked ? [] : [])
                    } else {
                      if (checked) {
                        updatePreference("limitations", [...preferences.limitations, limitation.value])
                      } else {
                        updatePreference(
                          "limitations",
                          preferences.limitations.filter((item) => item !== limitation.value)
                        )
                      }
                    }
                  }}
                />
                <Label htmlFor={`limitation-${limitation.value}`}>{limitation.label}</Label>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Hora del día",
      description: "¿A qué hora del día prefieres entrenar?",
      component: (
        <div className="space-y-4">
          <Select
            value={preferences.timeOfDay}
            onValueChange={(value) => updatePreference("timeOfDay", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la hora del día" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }
  ]

  // Actualizar preferencias
  const updatePreference = (key: keyof WorkoutPreferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  // Navegar entre pasos
  const nextStep = () => {
    // Validar el paso actual
    if (currentStep === 3 && preferences.focusAreas.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Selecciona al menos un grupo muscular",
        variant: "destructive"
      })
      return
    }

    if (currentStep === 4 && preferences.equipment.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Selecciona al menos un tipo de equipamiento",
        variant: "destructive"
      })
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Completar cuestionario
      onComplete(preferences)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (onCancel) {
      onCancel()
    }
  }

  return (
    <Card3D className="w-full max-w-md mx-auto">
      <Card3DHeader>
        <div className="flex items-center justify-between">
          <Card3DTitle>{steps[currentStep].title}</Card3DTitle>
          <span className="text-sm text-muted-foreground">
            Paso {currentStep + 1} de {steps.length}
          </span>
        </div>
        <p className="text-muted-foreground">{steps[currentStep].description}</p>
      </Card3DHeader>
      <Card3DContent>
        <div className="space-y-6">
          {steps[currentStep].component}

          <div className="flex justify-between pt-4">
            <Button3D variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 && onCancel ? "Cancelar" : "Anterior"}
            </Button3D>
            <Button3D onClick={nextStep}>
              {currentStep === steps.length - 1 ? (
                <>
                  Finalizar
                  <Check className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button3D>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}
