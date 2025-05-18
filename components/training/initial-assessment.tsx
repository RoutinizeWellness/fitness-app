"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Dumbbell,
  Clock,
  Calendar,
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface TrainingAssessmentData {
  // Goals
  primaryGoal: 'fat_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness' | 'athletic_performance' | 'mobility' | 'toning'
  secondaryGoals: string[]
  targetWeight?: number
  targetDate?: string

  // Experience
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  trainingHistory: string
  preferredTrainingStyles: string[]

  // Availability & Resources
  weeklyAvailability: number
  trainingDays: string[] // Días de la semana seleccionados
  sessionDuration: number
  equipment: string[]
  trainingLocation: 'home' | 'gym' | 'outdoors' | 'mixed'

  // Health & Limitations
  injuries: string[]
  painAreas: string[]
  medicalConditions: string[]

  // Preferences
  preferredExercises: string[]
  dislikedExercises: string[]
  priorityMuscleGroups: string[] // Grupos musculares a priorizar

  // Metrics
  gender: 'male' | 'female' | 'other'
  currentWeight: number
  height: number
  bodyFatPercentage?: number

  // Additional Notes
  additionalNotes: string
}

export default function TrainingInitialAssessment() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const totalSteps = 6

  // Initialize assessment data
  const [assessmentData, setAssessmentData] = useState<TrainingAssessmentData>({
    // Goals
    primaryGoal: 'general_fitness',
    secondaryGoals: [],

    // Experience
    experienceLevel: 'intermediate',
    trainingHistory: '',
    preferredTrainingStyles: [],

    // Availability & Resources
    weeklyAvailability: 3,
    trainingDays: [],
    sessionDuration: 60,
    equipment: [],
    trainingLocation: 'gym',

    // Health & Limitations
    injuries: [],
    painAreas: [],
    medicalConditions: [],

    // Preferences
    preferredExercises: [],
    dislikedExercises: [],
    priorityMuscleGroups: [],

    // Metrics
    gender: 'male',
    currentWeight: 70,
    height: 170,

    // Additional Notes
    additionalNotes: ''
  })

  // Update progress when step changes
  const updateProgress = (step: number) => {
    const newProgress = Math.round((step / totalSteps) * 100)
    setProgress(newProgress)
  }

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      updateProgress(nextStep)
    } else {
      handleSubmit()
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      updateProgress(prevStep)
    }
  }

  // Handle form input changes
  const handleChange = (field: keyof TrainingAssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle checkbox arrays
  const handleCheckboxChange = (field: keyof TrainingAssessmentData, value: string, checked: boolean) => {
    setAssessmentData(prev => {
      const currentArray = prev[field] as string[]

      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        }
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        }
      }
    })
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar tu evaluación",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar datos para la tabla initial_assessments según el esquema proporcionado
      const initialAssessmentData = {
        user_id: user.id,
        experience_level: assessmentData.experienceLevel,
        training_goals: assessmentData.primaryGoal,
        injuries: assessmentData.injuries,
        equipment_available: assessmentData.equipment,
        preferred_days: assessmentData.weeklyAvailability,
        preferred_duration: assessmentData.sessionDuration,
        created_at: new Date().toISOString()
      }

      // Guardar en la tabla initial_assessments
      const { error: initialAssessmentError } = await supabase
        .from('initial_assessments')
        .insert([initialAssessmentData])

      if (initialAssessmentError) {
        console.error("Error al guardar en initial_assessments:", initialAssessmentError)
        // Si falla, intentar con la tabla anterior como respaldo
        const { data, error } = await supabase
          .from('training_assessments')
          .insert([
            {
              user_id: user.id,
              assessment_data: assessmentData,
              created_at: new Date().toISOString()
            }
          ])
          .select()

        if (error) {
          throw error
        }
      }

      // Mark assessment as complete
      setAssessmentComplete(true)

      toast({
        title: "Evaluación completada",
        description: "Tus datos han sido guardados. Ahora puedes generar tu plan personalizado.",
      })

      // Redirigir a la página de generación de plan
      window.location.href = "/training/generate-plan?tab=generate"
    } catch (error) {
      console.error("Error al guardar la evaluación:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Objetivos de Entrenamiento</h3>

            <div className="space-y-2">
              <Label>Objetivo principal</Label>
              <RadioGroup
                value={assessmentData.primaryGoal}
                onValueChange={(value: any) => handleChange('primaryGoal', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fat_loss" id="fat_loss" />
                  <Label htmlFor="fat_loss">Pérdida de grasa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muscle_gain" id="muscle_gain" />
                  <Label htmlFor="muscle_gain">Ganancia muscular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strength" id="strength" />
                  <Label htmlFor="strength">Fuerza</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="endurance" id="endurance" />
                  <Label htmlFor="endurance">Resistencia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="toning" id="toning" />
                  <Label htmlFor="toning">Tonificación</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mobility" id="mobility" />
                  <Label htmlFor="mobility">Movilidad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general_fitness" id="general_fitness" />
                  <Label htmlFor="general_fitness">Fitness general</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="athletic_performance" id="athletic_performance" />
                  <Label htmlFor="athletic_performance">Rendimiento atlético</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Objetivos secundarios (opcional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Mejorar flexibilidad', 'Mejorar postura', 'Reducir estrés', 'Mejorar sueño', 'Aumentar energía', 'Mejorar salud cardiovascular'].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal.toLowerCase().replace(/\s/g, '_')}
                      checked={assessmentData.secondaryGoals.includes(goal)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('secondaryGoals', goal, checked as boolean)
                      }
                    />
                    <Label htmlFor={goal.toLowerCase().replace(/\s/g, '_')}>{goal}</Label>
                  </div>
                ))}
              </div>
            </div>

            {(assessmentData.primaryGoal === 'fat_loss' || assessmentData.primaryGoal === 'muscle_gain') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Peso objetivo (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={assessmentData.targetWeight || ''}
                    onChange={(e) => handleChange('targetWeight', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Fecha objetivo</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={assessmentData.targetDate || ''}
                    onChange={(e) => handleChange('targetDate', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Experiencia y Preferencias</h3>

            <div className="space-y-2">
              <Label>Nivel de experiencia</Label>
              <RadioGroup
                value={assessmentData.experienceLevel}
                onValueChange={(value: any) => handleChange('experienceLevel', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Principiante (0-1 año de entrenamiento)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermedio (1-3 años de entrenamiento)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Avanzado (3-5 años de entrenamiento)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <Label htmlFor="expert">Experto (5+ años de entrenamiento)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainingHistory">Historial de entrenamiento</Label>
              <Textarea
                id="trainingHistory"
                placeholder="Describe brevemente tu experiencia previa con el entrenamiento..."
                value={assessmentData.trainingHistory}
                onChange={(e) => handleChange('trainingHistory', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Estilos de entrenamiento preferidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Entrenamiento de fuerza', 'Hipertrofia', 'HIIT', 'Cardio', 'Yoga', 'Pilates', 'Calistenia', 'Crossfit', 'Funcional', 'Deportes'].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox
                      id={style.toLowerCase().replace(/\s/g, '_')}
                      checked={assessmentData.preferredTrainingStyles.includes(style)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('preferredTrainingStyles', style, checked as boolean)
                      }
                    />
                    <Label htmlFor={style.toLowerCase().replace(/\s/g, '_')}>{style}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Disponibilidad y Recursos</h3>

            <div className="space-y-2">
              <Label>Días disponibles por semana</Label>
              <div className="py-4">
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  value={[assessmentData.weeklyAvailability]}
                  onValueChange={(value) => handleChange('weeklyAvailability', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">1 día</span>
                  <span className="text-xs font-medium">{assessmentData.weeklyAvailability} días</span>
                  <span className="text-xs">7 días</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selecciona los días de entrenamiento</Label>
              <div className="grid grid-cols-4 gap-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day_${day.toLowerCase()}`}
                      checked={assessmentData.trainingDays.includes(day)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('trainingDays', day, checked as boolean)
                      }
                      disabled={assessmentData.trainingDays.length >= assessmentData.weeklyAvailability && !assessmentData.trainingDays.includes(day)}
                    />
                    <Label htmlFor={`day_${day.toLowerCase()}`}>{day}</Label>
                  </div>
                ))}
              </div>
              {assessmentData.trainingDays.length > assessmentData.weeklyAvailability && (
                <p className="text-xs text-amber-600">
                  Has seleccionado más días de los disponibles. Por favor, ajusta tu selección.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Duración de sesión (minutos)</Label>
              <div className="py-4">
                <Slider
                  min={15}
                  max={120}
                  step={15}
                  value={[assessmentData.sessionDuration]}
                  onValueChange={(value) => handleChange('sessionDuration', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">15 min</span>
                  <span className="text-xs font-medium">{assessmentData.sessionDuration} min</span>
                  <span className="text-xs">120 min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Equipamiento disponible</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Peso corporal', 'Mancuernas', 'Barras', 'Máquinas', 'Poleas', 'Bandas elásticas', 'TRX/Suspensión', 'Kettlebells', 'Balón medicinal', 'Cinta de correr', 'Bicicleta estática', 'Elíptica', 'Remo'].map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment.toLowerCase().replace(/\s/g, '_')}
                      checked={assessmentData.equipment.includes(equipment)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('equipment', equipment, checked as boolean)
                      }
                    />
                    <Label htmlFor={equipment.toLowerCase().replace(/\s/g, '_')}>{equipment}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lugar de entrenamiento principal</Label>
              <RadioGroup
                value={assessmentData.trainingLocation}
                onValueChange={(value: any) => handleChange('trainingLocation', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home">Casa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gym" id="gym" />
                  <Label htmlFor="gym">Gimnasio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outdoors" id="outdoors" />
                  <Label htmlFor="outdoors">Exteriores</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mixto</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Salud y Limitaciones</h3>

            <div className="space-y-2">
              <Label>Lesiones previas o actuales</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Hombro', 'Codo', 'Muñeca', 'Espalda baja', 'Rodilla', 'Tobillo', 'Cadera', 'Cuello'].map((injury) => (
                  <div key={injury} className="flex items-center space-x-2">
                    <Checkbox
                      id={`injury_${injury.toLowerCase().replace(/\s/g, '_')}`}
                      checked={assessmentData.injuries.includes(injury)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('injuries', injury, checked as boolean)
                      }
                    />
                    <Label htmlFor={`injury_${injury.toLowerCase().replace(/\s/g, '_')}`}>{injury}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Áreas con dolor o molestias</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Hombros', 'Codos', 'Muñecas', 'Espalda baja', 'Rodillas', 'Tobillos', 'Caderas', 'Cuello'].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pain_${area.toLowerCase().replace(/\s/g, '_')}`}
                      checked={assessmentData.painAreas.includes(area)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('painAreas', area, checked as boolean)
                      }
                    />
                    <Label htmlFor={`pain_${area.toLowerCase().replace(/\s/g, '_')}`}>{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Condiciones médicas relevantes</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Hipertensión', 'Diabetes', 'Asma', 'Problemas cardíacos', 'Artritis', 'Osteoporosis', 'Embarazo', 'Otro'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition_${condition.toLowerCase().replace(/\s/g, '_')}`}
                      checked={assessmentData.medicalConditions.includes(condition)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('medicalConditions', condition, checked as boolean)
                      }
                    />
                    <Label htmlFor={`condition_${condition.toLowerCase().replace(/\s/g, '_')}`}>{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Si tienes alguna condición médica grave, consulta con un profesional de la salud antes de comenzar un nuevo programa de entrenamiento.
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferencias de Ejercicios</h3>

            <div className="space-y-2">
              <Label htmlFor="preferredExercises">Ejercicios favoritos</Label>
              <Textarea
                id="preferredExercises"
                placeholder="Ej: sentadillas, press de banca, dominadas..."
                value={assessmentData.preferredExercises.join(', ')}
                onChange={(e) => handleChange('preferredExercises', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los ejercicios con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dislikedExercises">Ejercicios que prefieres evitar</Label>
              <Textarea
                id="dislikedExercises"
                placeholder="Ej: burpees, saltos, peso muerto..."
                value={assessmentData.dislikedExercises.join(', ')}
                onChange={(e) => handleChange('dislikedExercises', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los ejercicios con comas</p>
            </div>

            <div className="space-y-2">
              <Label>Grupos musculares a priorizar</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas', 'Abdominales', 'Core', 'Antebrazos'].map((muscle) => (
                  <div key={muscle} className="flex items-center space-x-2">
                    <Checkbox
                      id={`muscle_${muscle.toLowerCase().replace(/\s/g, '_')}`}
                      checked={assessmentData.priorityMuscleGroups.includes(muscle)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('priorityMuscleGroups', muscle, checked as boolean)
                      }
                    />
                    <Label htmlFor={`muscle_${muscle.toLowerCase().replace(/\s/g, '_')}`}>{muscle}</Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Selecciona los grupos musculares que quieres priorizar en tu entrenamiento</p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Métricas y Notas Adicionales</h3>

            <div className="space-y-2">
              <Label>Género</Label>
              <RadioGroup
                value={assessmentData.gender}
                onValueChange={(value: any) => handleChange('gender', value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="gender_male" />
                  <Label htmlFor="gender_male">Hombre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="gender_female" />
                  <Label htmlFor="gender_female">Mujer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="gender_other" />
                  <Label htmlFor="gender_other">Otro</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Peso actual (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={assessmentData.currentWeight}
                  onChange={(e) => handleChange('currentWeight', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={assessmentData.height}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFatPercentage">Porcentaje de grasa corporal (opcional)</Label>
              <Input
                id="bodyFatPercentage"
                type="number"
                value={assessmentData.bodyFatPercentage || ''}
                onChange={(e) => handleChange('bodyFatPercentage', parseFloat(e.target.value))}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Notas adicionales</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Cualquier información adicional que consideres relevante..."
                value={assessmentData.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return <div>Paso no implementado</div>
    }
  }

  // Render assessment completion
  if (assessmentComplete) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Evaluación Completada
          </CardTitle>
          <CardDescription>
            Gracias por completar la evaluación. Estamos generando tu plan personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">¡Evaluación Exitosa!</h3>
            <p className="text-center text-gray-500 mb-4">
              Hemos recibido tus datos y nuestro sistema de IA está creando un plan personalizado para ti.
            </p>
            <Button onClick={() => window.location.href = "/training"}>
              Ver mi Dashboard de Entrenamiento
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dumbbell className="h-5 w-5 mr-2 text-primary" />
          Evaluación Inicial de Entrenamiento
        </CardTitle>
        <CardDescription>
          Completa esta evaluación para que podamos crear un plan de entrenamiento personalizado para ti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Paso {currentStep} de {totalSteps}</span>
            <span>{progress}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {renderStepContent()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <Button
          onClick={handleNextStep}
          disabled={isSubmitting}
        >
          {currentStep === totalSteps ? (
            isSubmitting ? "Guardando..." : "Completar"
          ) : (
            <>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
