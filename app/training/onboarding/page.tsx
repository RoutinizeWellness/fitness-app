"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Calendar,
  Clock,
  Target,
  Flame,
  Award,
  Heart,
  Scale,
  Ruler,
  Sparkles
} from "lucide-react"
import { AnimatedFade, AnimatedSlide } from "@/components/animations/animated-transitions"
import { useAuth } from "@/lib/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"
import { processSupabaseResponse } from "@/lib/supabase-utils"

// Define the onboarding steps
const STEPS = [
  "welcome",
  "experience",
  "goals",
  "availability",
  "preferences",
  "measurements",
  "complete"
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    experienceLevel: "",
    trainingGoals: [] as string[],
    primaryGoal: "",
    daysPerWeek: 3,
    timePerSession: 60,
    preferredDays: [] as number[],
    preferredExercises: [] as string[],
    dislikedExercises: [] as string[],
    equipment: [] as string[],
    height: 170,
    weight: 70,
    bodyFatPercentage: null as number | null,
    medicalConditions: [] as string[],
    injuries: [] as string[]
  })

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[field as keyof typeof prev] as string[]
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] }
      } else {
        return { ...prev, [field]: currentValues.filter(v => v !== value) }
      }
    })
  }

  // Navigate to the next step
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  // Navigate to the previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Complete the onboarding process
  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para completar el proceso de onboarding",
        variant: "destructive"
      })
      return
    }

    try {
      // Save the onboarding data to Supabase
      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('training_profiles')
          .upsert({
            user_id: user.id,
            experience_level: formData.experienceLevel,
            training_goals: formData.trainingGoals,
            primary_goal: formData.primaryGoal,
            days_per_week: formData.daysPerWeek,
            time_per_session: formData.timePerSession,
            preferred_days: formData.preferredDays,
            preferred_exercises: formData.preferredExercises,
            disliked_exercises: formData.dislikedExercises,
            available_equipment: formData.equipment,
            height_cm: formData.height,
            weight_kg: formData.weight,
            body_fat_percentage: formData.bodyFatPercentage,
            medical_conditions: formData.medicalConditions,
            injuries: formData.injuries,
            onboarding_completed: true,
            onboarding_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
      )

      if (error) {
        console.error("Error saving onboarding data:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar la información de onboarding. Por favor, inténtalo de nuevo.",
          variant: "destructive"
        })
        return
      }

      // Update the user profile to mark onboarding as complete
      await supabase
        .from('profiles')
        .update({
          training_onboarding_completed: true
        })
        .eq('user_id', user.id)

      toast({
        title: "¡Perfil completado!",
        description: "Tu perfil de entrenamiento ha sido creado correctamente."
      })

      // Redirect to the training page
      router.push('/training')
    } catch (error) {
      console.error("Error in onboarding completion:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al completar el proceso de onboarding. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Render the current step
  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case "welcome":
        return (
          <AnimatedFade>
            <Card className="p-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-4">¡Bienvenido a tu experiencia de entrenamiento!</h1>
                <p className="text-muted-foreground">
                  Vamos a personalizar tu experiencia de entrenamiento para ayudarte a alcanzar tus objetivos fitness.
                  Este proceso solo tomará unos minutos.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} className="w-full sm:w-auto">
                  Comenzar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </AnimatedFade>
        )

      case "experience":
        return (
          <AnimatedSlide>
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">¿Cuál es tu nivel de experiencia?</h2>

              <RadioGroup
                value={formData.experienceLevel}
                onValueChange={(value) => handleChange("experienceLevel", value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                    <div className="font-medium">Principiante</div>
                    <div className="text-sm text-muted-foreground">
                      Nuevo en el entrenamiento o con menos de 6 meses de experiencia consistente
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                    <div className="font-medium">Intermedio</div>
                    <div className="text-sm text-muted-foreground">
                      6 meses a 2 años de experiencia con entrenamiento regular
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                    <div className="font-medium">Avanzado</div>
                    <div className="text-sm text-muted-foreground">
                      Más de 2 años de experiencia con entrenamiento consistente
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="elite" id="elite" />
                  <Label htmlFor="elite" className="flex-1 cursor-pointer">
                    <div className="font-medium">Elite</div>
                    <div className="text-sm text-muted-foreground">
                      Atleta experimentado o competidor con años de entrenamiento especializado
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!formData.experienceLevel}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </AnimatedSlide>
        )

      case "goals":
        return (
          <AnimatedSlide>
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">¿Cuáles son tus objetivos de entrenamiento?</h2>
              <p className="text-muted-foreground mb-6">
                Selecciona todos los objetivos que te interesen. Luego elige tu objetivo principal.
              </p>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Objetivos (selecciona todos los que apliquen)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="goal-strength"
                        checked={formData.trainingGoals.includes("strength")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("trainingGoals", "strength", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="goal-strength" className="font-medium">Fuerza</Label>
                        <p className="text-sm text-muted-foreground">
                          Aumentar tu fuerza máxima
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="goal-hypertrophy"
                        checked={formData.trainingGoals.includes("hypertrophy")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("trainingGoals", "hypertrophy", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="goal-hypertrophy" className="font-medium">Hipertrofia</Label>
                        <p className="text-sm text-muted-foreground">
                          Aumentar el tamaño muscular
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="goal-endurance"
                        checked={formData.trainingGoals.includes("endurance")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("trainingGoals", "endurance", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="goal-endurance" className="font-medium">Resistencia</Label>
                        <p className="text-sm text-muted-foreground">
                          Mejorar tu resistencia muscular
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="goal-weight-loss"
                        checked={formData.trainingGoals.includes("weight_loss")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("trainingGoals", "weight_loss", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="goal-weight-loss" className="font-medium">Pérdida de peso</Label>
                        <p className="text-sm text-muted-foreground">
                          Reducir grasa corporal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="goal-general-fitness"
                        checked={formData.trainingGoals.includes("general_fitness")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("trainingGoals", "general_fitness", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="goal-general-fitness" className="font-medium">Fitness general</Label>
                        <p className="text-sm text-muted-foreground">
                          Mejorar tu condición física general
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="goal-health"
                        checked={formData.trainingGoals.includes("health")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("trainingGoals", "health", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="goal-health" className="font-medium">Salud</Label>
                        <p className="text-sm text-muted-foreground">
                          Mejorar indicadores de salud
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Objetivo principal</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el objetivo más importante para ti en este momento
                  </p>

                  <RadioGroup
                    value={formData.primaryGoal}
                    onValueChange={(value) => handleChange("primaryGoal", value)}
                    className="space-y-3"
                  >
                    {formData.trainingGoals.includes("strength") && (
                      <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="strength" id="primary-strength" />
                        <Label htmlFor="primary-strength" className="flex-1 cursor-pointer">
                          <div className="font-medium">Fuerza</div>
                        </Label>
                      </div>
                    )}

                    {formData.trainingGoals.includes("hypertrophy") && (
                      <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="hypertrophy" id="primary-hypertrophy" />
                        <Label htmlFor="primary-hypertrophy" className="flex-1 cursor-pointer">
                          <div className="font-medium">Hipertrofia</div>
                        </Label>
                      </div>
                    )}

                    {formData.trainingGoals.includes("endurance") && (
                      <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="endurance" id="primary-endurance" />
                        <Label htmlFor="primary-endurance" className="flex-1 cursor-pointer">
                          <div className="font-medium">Resistencia</div>
                        </Label>
                      </div>
                    )}

                    {formData.trainingGoals.includes("weight_loss") && (
                      <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="weight_loss" id="primary-weight-loss" />
                        <Label htmlFor="primary-weight-loss" className="flex-1 cursor-pointer">
                          <div className="font-medium">Pérdida de peso</div>
                        </Label>
                      </div>
                    )}

                    {formData.trainingGoals.includes("general_fitness") && (
                      <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="general_fitness" id="primary-general-fitness" />
                        <Label htmlFor="primary-general-fitness" className="flex-1 cursor-pointer">
                          <div className="font-medium">Fitness general</div>
                        </Label>
                      </div>
                    )}

                    {formData.trainingGoals.includes("health") && (
                      <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="health" id="primary-health" />
                        <Label htmlFor="primary-health" className="flex-1 cursor-pointer">
                          <div className="font-medium">Salud</div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={formData.trainingGoals.length === 0 || !formData.primaryGoal}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </AnimatedSlide>
        )

      case "availability":
        return (
          <AnimatedSlide>
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Disponibilidad para entrenar</h2>
              <p className="text-muted-foreground mb-6">
                Indícanos cuánto tiempo puedes dedicar al entrenamiento para personalizar tu plan.
              </p>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium">¿Cuántos días a la semana puedes entrenar?</h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={formData.daysPerWeek === day ? "default" : "outline"}
                        className="h-12 w-12"
                        onClick={() => handleChange("daysPerWeek", day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recomendación: 3-4 días para principiantes, 4-6 días para intermedios/avanzados
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">¿Cuánto tiempo por sesión? (minutos)</h3>
                    <span className="font-medium">{formData.timePerSession} min</span>
                  </div>

                  <Slider
                    value={[formData.timePerSession]}
                    min={15}
                    max={120}
                    step={5}
                    onValueChange={(value) => handleChange("timePerSession", value[0])}
                    className="py-4"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>15 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">
                    Recomendación: 45-60 minutos para sesiones efectivas
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">¿Qué días de la semana prefieres entrenar?</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => (
                      <div key={day} className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-12 w-12",
                            formData.preferredDays?.includes(index) && "bg-primary/20 border-primary"
                          )}
                          onClick={() => {
                            const currentDays = formData.preferredDays || [];
                            if (currentDays.includes(index)) {
                              handleChange("preferredDays", currentDays.filter(d => d !== index));
                            } else {
                              handleChange("preferredDays", [...currentDays, index]);
                            }
                          }}
                        >
                          {day}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Opcional: selecciona los días que prefieres entrenar
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={formData.daysPerWeek < 1 || formData.timePerSession < 15}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </AnimatedSlide>
        )

      case "preferences":
        return (
          <AnimatedSlide>
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Preferencias de entrenamiento</h2>
              <p className="text-muted-foreground mb-6">
                Cuéntanos sobre tus preferencias para personalizar mejor tu experiencia.
              </p>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium">Equipo disponible</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el equipo al que tienes acceso para entrenar
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="equipment-gym"
                        checked={formData.equipment.includes("gym")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("equipment", "gym", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="equipment-gym" className="font-medium">Gimnasio completo</Label>
                        <p className="text-sm text-muted-foreground">
                          Acceso a un gimnasio con equipo completo
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="equipment-dumbbells"
                        checked={formData.equipment.includes("dumbbells")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("equipment", "dumbbells", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="equipment-dumbbells" className="font-medium">Mancuernas</Label>
                        <p className="text-sm text-muted-foreground">
                          Acceso a mancuernas ajustables o de varios pesos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="equipment-barbell"
                        checked={formData.equipment.includes("barbell")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("equipment", "barbell", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="equipment-barbell" className="font-medium">Barra y discos</Label>
                        <p className="text-sm text-muted-foreground">
                          Acceso a barra olímpica o estándar con discos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="equipment-machines"
                        checked={formData.equipment.includes("machines")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("equipment", "machines", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="equipment-machines" className="font-medium">Máquinas</Label>
                        <p className="text-sm text-muted-foreground">
                          Acceso a máquinas de entrenamiento
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="equipment-bodyweight"
                        checked={formData.equipment.includes("bodyweight")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("equipment", "bodyweight", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="equipment-bodyweight" className="font-medium">Solo peso corporal</Label>
                        <p className="text-sm text-muted-foreground">
                          Ejercicios que utilizan solo tu peso corporal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="equipment-bands"
                        checked={formData.equipment.includes("bands")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("equipment", "bands", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="equipment-bands" className="font-medium">Bandas elásticas</Label>
                        <p className="text-sm text-muted-foreground">
                          Acceso a bandas de resistencia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Ejercicios preferidos</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los ejercicios que disfrutas hacer (opcional)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="exercise-squat"
                        checked={formData.preferredExercises.includes("squat")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferredExercises", "squat", checked as boolean)
                        }
                      />
                      <Label htmlFor="exercise-squat">Sentadillas</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="exercise-deadlift"
                        checked={formData.preferredExercises.includes("deadlift")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferredExercises", "deadlift", checked as boolean)
                        }
                      />
                      <Label htmlFor="exercise-deadlift">Peso muerto</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="exercise-bench"
                        checked={formData.preferredExercises.includes("bench_press")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferredExercises", "bench_press", checked as boolean)
                        }
                      />
                      <Label htmlFor="exercise-bench">Press de banca</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="exercise-pullup"
                        checked={formData.preferredExercises.includes("pull_up")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferredExercises", "pull_up", checked as boolean)
                        }
                      />
                      <Label htmlFor="exercise-pullup">Dominadas</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="exercise-overhead"
                        checked={formData.preferredExercises.includes("overhead_press")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferredExercises", "overhead_press", checked as boolean)
                        }
                      />
                      <Label htmlFor="exercise-overhead">Press militar</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="exercise-row"
                        checked={formData.preferredExercises.includes("row")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferredExercises", "row", checked as boolean)
                        }
                      />
                      <Label htmlFor="exercise-row">Remo</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Ejercicios que prefieres evitar</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los ejercicios que prefieres no hacer (opcional)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="dislike-squat"
                        checked={formData.dislikedExercises.includes("squat")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("dislikedExercises", "squat", checked as boolean)
                        }
                      />
                      <Label htmlFor="dislike-squat">Sentadillas</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="dislike-deadlift"
                        checked={formData.dislikedExercises.includes("deadlift")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("dislikedExercises", "deadlift", checked as boolean)
                        }
                      />
                      <Label htmlFor="dislike-deadlift">Peso muerto</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="dislike-bench"
                        checked={formData.dislikedExercises.includes("bench_press")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("dislikedExercises", "bench_press", checked as boolean)
                        }
                      />
                      <Label htmlFor="dislike-bench">Press de banca</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="dislike-pullup"
                        checked={formData.dislikedExercises.includes("pull_up")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("dislikedExercises", "pull_up", checked as boolean)
                        }
                      />
                      <Label htmlFor="dislike-pullup">Dominadas</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="dislike-overhead"
                        checked={formData.dislikedExercises.includes("overhead_press")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("dislikedExercises", "overhead_press", checked as boolean)
                        }
                      />
                      <Label htmlFor="dislike-overhead">Press militar</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="dislike-row"
                        checked={formData.dislikedExercises.includes("row")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("dislikedExercises", "row", checked as boolean)
                        }
                      />
                      <Label htmlFor="dislike-row">Remo</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={formData.equipment.length === 0}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </AnimatedSlide>
        )

      case "measurements":
        return (
          <AnimatedSlide>
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Medidas corporales</h2>
              <p className="text-muted-foreground mb-6">
                Esta información nos ayuda a personalizar mejor tus recomendaciones de entrenamiento y nutrición.
                Todos los datos son opcionales pero recomendados.
              </p>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Altura (cm)</h3>
                      <span className="font-medium">{formData.height} cm</span>
                    </div>

                    <Slider
                      value={[formData.height]}
                      min={140}
                      max={220}
                      step={1}
                      onValueChange={(value) => handleChange("height", value[0])}
                      className="py-4"
                    />

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>140 cm</span>
                      <span>180 cm</span>
                      <span>220 cm</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Peso (kg)</h3>
                      <span className="font-medium">{formData.weight} kg</span>
                    </div>

                    <Slider
                      value={[formData.weight]}
                      min={40}
                      max={150}
                      step={1}
                      onValueChange={(value) => handleChange("weight", value[0])}
                      className="py-4"
                    />

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>40 kg</span>
                      <span>95 kg</span>
                      <span>150 kg</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Porcentaje de grasa corporal (opcional)</h3>
                    <span className="font-medium">
                      {formData.bodyFatPercentage !== null ? `${formData.bodyFatPercentage}%` : "No especificado"}
                    </span>
                  </div>

                  <Slider
                    value={[formData.bodyFatPercentage !== null ? formData.bodyFatPercentage : 20]}
                    min={5}
                    max={40}
                    step={1}
                    onValueChange={(value) => handleChange("bodyFatPercentage", value[0])}
                    className="py-4"
                    disabled={formData.bodyFatPercentage === null}
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5%</span>
                    <span>20%</span>
                    <span>40%</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-body-fat"
                      checked={formData.bodyFatPercentage !== null}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleChange("bodyFatPercentage", 20)
                        } else {
                          handleChange("bodyFatPercentage", null)
                        }
                      }}
                    />
                    <Label htmlFor="use-body-fat">Especificar porcentaje de grasa corporal</Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Condiciones médicas (opcional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona cualquier condición médica que debamos tener en cuenta
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="condition-back"
                        checked={formData.medicalConditions.includes("back_pain")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medicalConditions", "back_pain", checked as boolean)
                        }
                      />
                      <Label htmlFor="condition-back">Dolor de espalda</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="condition-knee"
                        checked={formData.medicalConditions.includes("knee_pain")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medicalConditions", "knee_pain", checked as boolean)
                        }
                      />
                      <Label htmlFor="condition-knee">Dolor de rodilla</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="condition-shoulder"
                        checked={formData.medicalConditions.includes("shoulder_pain")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medicalConditions", "shoulder_pain", checked as boolean)
                        }
                      />
                      <Label htmlFor="condition-shoulder">Dolor de hombro</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="condition-hypertension"
                        checked={formData.medicalConditions.includes("hypertension")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medicalConditions", "hypertension", checked as boolean)
                        }
                      />
                      <Label htmlFor="condition-hypertension">Hipertensión</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="condition-diabetes"
                        checked={formData.medicalConditions.includes("diabetes")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medicalConditions", "diabetes", checked as boolean)
                        }
                      />
                      <Label htmlFor="condition-diabetes">Diabetes</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="condition-asthma"
                        checked={formData.medicalConditions.includes("asthma")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medicalConditions", "asthma", checked as boolean)
                        }
                      />
                      <Label htmlFor="condition-asthma">Asma</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Lesiones previas (opcional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona cualquier lesión previa que debamos tener en cuenta
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="injury-acl"
                        checked={formData.injuries.includes("acl")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("injuries", "acl", checked as boolean)
                        }
                      />
                      <Label htmlFor="injury-acl">Lesión de ligamento cruzado</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="injury-disc"
                        checked={formData.injuries.includes("disc_herniation")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("injuries", "disc_herniation", checked as boolean)
                        }
                      />
                      <Label htmlFor="injury-disc">Hernia discal</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="injury-rotator"
                        checked={formData.injuries.includes("rotator_cuff")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("injuries", "rotator_cuff", checked as boolean)
                        }
                      />
                      <Label htmlFor="injury-rotator">Lesión de manguito rotador</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="injury-ankle"
                        checked={formData.injuries.includes("ankle_sprain")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("injuries", "ankle_sprain", checked as boolean)
                        }
                      />
                      <Label htmlFor="injury-ankle">Esguince de tobillo</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="injury-tendonitis"
                        checked={formData.injuries.includes("tendonitis")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("injuries", "tendonitis", checked as boolean)
                        }
                      />
                      <Label htmlFor="injury-tendonitis">Tendinitis</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="injury-fracture"
                        checked={formData.injuries.includes("fracture")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("injuries", "fracture", checked as boolean)
                        }
                      />
                      <Label htmlFor="injury-fracture">Fractura previa</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button onClick={handleNext}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </AnimatedSlide>
        )

      case "complete":
        return (
          <AnimatedFade>
            <Card className="p-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-4">¡Perfil completado!</h1>
                <p className="text-muted-foreground mb-6">
                  Hemos recopilado toda la información necesaria para personalizar tu experiencia de entrenamiento.
                  A continuación puedes revisar tu información antes de comenzar.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Resumen de tu perfil</h2>

                  <div className="border rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="font-medium">Nivel de experiencia</h3>
                      <p className="text-muted-foreground">
                        {formData.experienceLevel === "beginner" && "Principiante"}
                        {formData.experienceLevel === "intermediate" && "Intermedio"}
                        {formData.experienceLevel === "advanced" && "Avanzado"}
                        {formData.experienceLevel === "elite" && "Elite"}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">Objetivos de entrenamiento</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.trainingGoals.map(goal => (
                          <Badge key={goal} variant="secondary">
                            {goal === "strength" && "Fuerza"}
                            {goal === "hypertrophy" && "Hipertrofia"}
                            {goal === "endurance" && "Resistencia"}
                            {goal === "weight_loss" && "Pérdida de peso"}
                            {goal === "general_fitness" && "Fitness general"}
                            {goal === "health" && "Salud"}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">Objetivo principal: </span>
                        {formData.primaryGoal === "strength" && "Fuerza"}
                        {formData.primaryGoal === "hypertrophy" && "Hipertrofia"}
                        {formData.primaryGoal === "endurance" && "Resistencia"}
                        {formData.primaryGoal === "weight_loss" && "Pérdida de peso"}
                        {formData.primaryGoal === "general_fitness" && "Fitness general"}
                        {formData.primaryGoal === "health" && "Salud"}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">Disponibilidad</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Días por semana:</p>
                          <p>{formData.daysPerWeek}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tiempo por sesión:</p>
                          <p>{formData.timePerSession} minutos</p>
                        </div>
                      </div>

                      {formData.preferredDays && formData.preferredDays.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">Días preferidos:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.preferredDays.map(day => (
                              <Badge key={day} variant="outline">
                                {day === 0 && "Lunes"}
                                {day === 1 && "Martes"}
                                {day === 2 && "Miércoles"}
                                {day === 3 && "Jueves"}
                                {day === 4 && "Viernes"}
                                {day === 5 && "Sábado"}
                                {day === 6 && "Domingo"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">Equipo disponible</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.equipment.map(equipment => (
                          <Badge key={equipment} variant="secondary">
                            {equipment === "gym" && "Gimnasio completo"}
                            {equipment === "dumbbells" && "Mancuernas"}
                            {equipment === "barbell" && "Barra y discos"}
                            {equipment === "machines" && "Máquinas"}
                            {equipment === "bodyweight" && "Peso corporal"}
                            {equipment === "bands" && "Bandas elásticas"}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">Medidas corporales</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Altura:</p>
                          <p>{formData.height} cm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Peso:</p>
                          <p>{formData.weight} kg</p>
                        </div>
                        {formData.bodyFatPercentage !== null && (
                          <div>
                            <p className="text-sm text-muted-foreground">% Grasa corporal:</p>
                            <p>{formData.bodyFatPercentage}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {(formData.medicalConditions.length > 0 || formData.injuries.length > 0) && (
                      <>
                        <Separator />

                        <div>
                          <h3 className="font-medium">Información médica</h3>

                          {formData.medicalConditions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Condiciones médicas:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {formData.medicalConditions.map(condition => (
                                  <Badge key={condition} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {condition === "back_pain" && "Dolor de espalda"}
                                    {condition === "knee_pain" && "Dolor de rodilla"}
                                    {condition === "shoulder_pain" && "Dolor de hombro"}
                                    {condition === "hypertension" && "Hipertensión"}
                                    {condition === "diabetes" && "Diabetes"}
                                    {condition === "asthma" && "Asma"}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.injuries.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Lesiones previas:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {formData.injuries.map(injury => (
                                  <Badge key={injury} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    {injury === "acl" && "Ligamento cruzado"}
                                    {injury === "disc_herniation" && "Hernia discal"}
                                    {injury === "rotator_cuff" && "Manguito rotador"}
                                    {injury === "ankle_sprain" && "Esguince de tobillo"}
                                    {injury === "tendonitis" && "Tendinitis"}
                                    {injury === "fracture" && "Fractura previa"}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Editar información
                </Button>
                <Button onClick={handleComplete} className="sm:w-auto">
                  Comenzar a entrenar
                </Button>
              </div>
            </Card>
          </AnimatedFade>
        )

      default:
        return (
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Paso en desarrollo</h2>
            <p className="text-muted-foreground mb-6">
              Este paso está en desarrollo. Por favor, continúa al siguiente paso.
            </p>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={handleNext}>
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Paso {currentStep + 1} de {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% completado
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {renderStep()}
    </div>
  )
}
