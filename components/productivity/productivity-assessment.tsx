"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Clock,
  AlertTriangle,
  Sparkles,
  ListTodo
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface ProductivityAssessmentData {
  // Hábitos de trabajo
  workStartTime: string
  workEndTime: string
  breaksFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'very_often'
  breakDuration: number // minutos

  // Gestión del tiempo
  planningHabit: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily'
  taskPrioritization: 'never' | 'rarely' | 'sometimes' | 'often' | 'always'
  deadlineManagement: 'very_poor' | 'poor' | 'fair' | 'good' | 'very_good'

  // Distracciones
  phoneDistraction: boolean
  socialMediaDistraction: boolean
  emailDistraction: boolean
  colleaguesDistraction: boolean
  noiseDistraction: boolean

  // Energía y concentración
  energyMorning: number // 1-5
  energyAfternoon: number // 1-5
  energyEvening: number // 1-5
  concentrationDuration: number // minutos

  // Herramientas y métodos
  usesToDoList: boolean
  usesCalendar: boolean
  usesTimeBlocking: boolean
  usesPomodoro: boolean
  usesDigitalTools: boolean

  // Objetivos de productividad
  productivityGoal: 'better_focus' | 'time_management' | 'work_life_balance' | 'reduce_procrastination' | 'increase_energy'

  // Notas adicionales
  additionalNotes: string
}

export default function ProductivityAssessment() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const totalSteps = 5

  // Inicializar datos de evaluación
  const [assessmentData, setAssessmentData] = useState<ProductivityAssessmentData>({
    // Hábitos de trabajo
    workStartTime: "09:00",
    workEndTime: "17:00",
    breaksFrequency: 'sometimes',
    breakDuration: 15,

    // Gestión del tiempo
    planningHabit: 'sometimes',
    taskPrioritization: 'sometimes',
    deadlineManagement: 'fair',

    // Distracciones
    phoneDistraction: true,
    socialMediaDistraction: true,
    emailDistraction: false,
    colleaguesDistraction: false,
    noiseDistraction: false,

    // Energía y concentración
    energyMorning: 4,
    energyAfternoon: 3,
    energyEvening: 2,
    concentrationDuration: 45,

    // Herramientas y métodos
    usesToDoList: true,
    usesCalendar: true,
    usesTimeBlocking: false,
    usesPomodoro: false,
    usesDigitalTools: true,

    // Objetivos de productividad
    productivityGoal: 'better_focus',

    // Notas adicionales
    additionalNotes: ''
  })

  // Actualizar progreso cuando cambia el paso
  const updateProgress = (step: number) => {
    const newProgress = Math.round((step / totalSteps) * 100)
    setProgress(newProgress)
  }

  // Manejar siguiente paso
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      updateProgress(nextStep)
    } else {
      handleSubmit()
    }
  }

  // Manejar paso anterior
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      updateProgress(prevStep)
    }
  }

  // Manejar cambios en el formulario
  const handleChange = (field: keyof ProductivityAssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en checkboxes (booleanos)
  const handleCheckboxChange = (field: keyof ProductivityAssessmentData, checked: boolean) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  // Manejar envío del formulario
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
      // Guardar datos de evaluación en Supabase
      const { data, error } = await supabase
        .from('productivity_assessments')
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

      // Marcar evaluación como completada
      setAssessmentComplete(true)

      toast({
        title: "Evaluación completada",
        description: "Tus datos han sido guardados y estamos generando tus recomendaciones de productividad personalizadas",
      })
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

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hábitos de Trabajo</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStartTime">Hora habitual de inicio de trabajo</Label>
                <Input
                  id="workStartTime"
                  type="time"
                  value={assessmentData.workStartTime}
                  onChange={(e) => handleChange('workStartTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEndTime">Hora habitual de fin de trabajo</Label>
                <Input
                  id="workEndTime"
                  type="time"
                  value={assessmentData.workEndTime}
                  onChange={(e) => handleChange('workEndTime', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Frecuencia con la que tomas descansos</Label>
              <RadioGroup
                value={assessmentData.breaksFrequency}
                onValueChange={(value: any) => handleChange('breaksFrequency', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never_breaks" />
                  <Label htmlFor="never_breaks">Nunca</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely_breaks" />
                  <Label htmlFor="rarely_breaks">Raramente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="sometimes_breaks" />
                  <Label htmlFor="sometimes_breaks">A veces</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="often_breaks" />
                  <Label htmlFor="often_breaks">A menudo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_often" id="very_often_breaks" />
                  <Label htmlFor="very_often_breaks">Muy a menudo</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Duración habitual de los descansos (minutos)</Label>
              <div className="py-4">
                <Slider
                  min={5}
                  max={60}
                  step={5}
                  value={[assessmentData.breakDuration]}
                  onValueChange={(value) => handleChange('breakDuration', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">5 min</span>
                  <span className="text-xs font-medium">{assessmentData.breakDuration} min</span>
                  <span className="text-xs">60 min</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Gestión del Tiempo</h3>

            <div className="space-y-2">
              <Label>¿Con qué frecuencia planificas tu día o semana?</Label>
              <RadioGroup
                value={assessmentData.planningHabit}
                onValueChange={(value: any) => handleChange('planningHabit', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never_planning" />
                  <Label htmlFor="never_planning">Nunca</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely_planning" />
                  <Label htmlFor="rarely_planning">Raramente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="sometimes_planning" />
                  <Label htmlFor="sometimes_planning">A veces</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="often_planning" />
                  <Label htmlFor="often_planning">A menudo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily_planning" />
                  <Label htmlFor="daily_planning">Diariamente</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>¿Con qué frecuencia priorizas tus tareas?</Label>
              <RadioGroup
                value={assessmentData.taskPrioritization}
                onValueChange={(value: any) => handleChange('taskPrioritization', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never_prioritization" />
                  <Label htmlFor="never_prioritization">Nunca</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely_prioritization" />
                  <Label htmlFor="rarely_prioritization">Raramente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="sometimes_prioritization" />
                  <Label htmlFor="sometimes_prioritization">A veces</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="often_prioritization" />
                  <Label htmlFor="often_prioritization">A menudo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="always" id="always_prioritization" />
                  <Label htmlFor="always_prioritization">Siempre</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>¿Cómo gestionas los plazos y fechas límite?</Label>
              <RadioGroup
                value={assessmentData.deadlineManagement}
                onValueChange={(value: any) => handleChange('deadlineManagement', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_poor" id="very_poor_deadlines" />
                  <Label htmlFor="very_poor_deadlines">Muy mal (suelo incumplirlos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor_deadlines" />
                  <Label htmlFor="poor_deadlines">Mal (a menudo los incumplo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="fair_deadlines" />
                  <Label htmlFor="fair_deadlines">Regular (a veces los cumplo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good_deadlines" />
                  <Label htmlFor="good_deadlines">Bien (normalmente los cumplo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_good" id="very_good_deadlines" />
                  <Label htmlFor="very_good_deadlines">Muy bien (casi siempre los cumplo)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Distracciones y Concentración</h3>

            <div className="space-y-2">
              <Label className="text-base">¿Qué te distrae habitualmente durante el trabajo?</Label>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="phoneDistraction"
                  checked={assessmentData.phoneDistraction}
                  onChange={(e) => handleCheckboxChange('phoneDistraction', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="phoneDistraction">Teléfono móvil</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="socialMediaDistraction"
                  checked={assessmentData.socialMediaDistraction}
                  onChange={(e) => handleCheckboxChange('socialMediaDistraction', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="socialMediaDistraction">Redes sociales</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailDistraction"
                  checked={assessmentData.emailDistraction}
                  onChange={(e) => handleCheckboxChange('emailDistraction', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="emailDistraction">Email y mensajería</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="colleaguesDistraction"
                  checked={assessmentData.colleaguesDistraction}
                  onChange={(e) => handleCheckboxChange('colleaguesDistraction', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="colleaguesDistraction">Compañeros de trabajo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="noiseDistraction"
                  checked={assessmentData.noiseDistraction}
                  onChange={(e) => handleCheckboxChange('noiseDistraction', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="noiseDistraction">Ruido ambiental</Label>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label>Nivel de energía por la mañana (1-5)</Label>
              <div className="py-4">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[assessmentData.energyMorning]}
                  onValueChange={(value) => handleChange('energyMorning', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">Muy bajo</span>
                  <span className="text-xs font-medium">{assessmentData.energyMorning}</span>
                  <span className="text-xs">Muy alto</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nivel de energía por la tarde (1-5)</Label>
              <div className="py-4">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[assessmentData.energyAfternoon]}
                  onValueChange={(value) => handleChange('energyAfternoon', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">Muy bajo</span>
                  <span className="text-xs font-medium">{assessmentData.energyAfternoon}</span>
                  <span className="text-xs">Muy alto</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nivel de energía por la noche (1-5)</Label>
              <div className="py-4">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[assessmentData.energyEvening]}
                  onValueChange={(value) => handleChange('energyEvening', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">Muy bajo</span>
                  <span className="text-xs font-medium">{assessmentData.energyEvening}</span>
                  <span className="text-xs">Muy alto</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>¿Cuánto tiempo puedes mantener la concentración sin distraerte? (minutos)</Label>
              <div className="py-4">
                <Slider
                  min={5}
                  max={120}
                  step={5}
                  value={[assessmentData.concentrationDuration]}
                  onValueChange={(value) => handleChange('concentrationDuration', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">5 min</span>
                  <span className="text-xs font-medium">{assessmentData.concentrationDuration} min</span>
                  <span className="text-xs">120 min</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Herramientas y Métodos</h3>

            <div className="space-y-2">
              <Label className="text-base">¿Qué herramientas o métodos utilizas para gestionar tu productividad?</Label>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="usesToDoList"
                  checked={assessmentData.usesToDoList}
                  onChange={(e) => handleCheckboxChange('usesToDoList', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="usesToDoList">Listas de tareas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usesCalendar"
                  checked={assessmentData.usesCalendar}
                  onChange={(e) => handleCheckboxChange('usesCalendar', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="usesCalendar">Calendario</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usesTimeBlocking"
                  checked={assessmentData.usesTimeBlocking}
                  onChange={(e) => handleCheckboxChange('usesTimeBlocking', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="usesTimeBlocking">Bloqueo de tiempo (time blocking)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usesPomodoro"
                  checked={assessmentData.usesPomodoro}
                  onChange={(e) => handleCheckboxChange('usesPomodoro', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="usesPomodoro">Técnica Pomodoro</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usesDigitalTools"
                  checked={assessmentData.usesDigitalTools}
                  onChange={(e) => handleCheckboxChange('usesDigitalTools', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="usesDigitalTools">Herramientas digitales (apps, software)</Label>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Conocer tus herramientas actuales nos ayuda a recomendarte mejoras o alternativas que se adapten a tu estilo de trabajo.
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Objetivos y Notas Adicionales</h3>

            <div className="space-y-2">
              <Label>¿Cuál es tu principal objetivo relacionado con la productividad?</Label>
              <RadioGroup
                value={assessmentData.productivityGoal}
                onValueChange={(value: any) => handleChange('productivityGoal', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="better_focus" id="better_focus" />
                  <Label htmlFor="better_focus">Mejorar mi concentración</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="time_management" id="time_management" />
                  <Label htmlFor="time_management">Gestionar mejor mi tiempo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work_life_balance" id="work_life_balance" />
                  <Label htmlFor="work_life_balance">Mejorar mi equilibrio trabajo-vida</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reduce_procrastination" id="reduce_procrastination" />
                  <Label htmlFor="reduce_procrastination">Reducir la procrastinación</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increase_energy" id="increase_energy" />
                  <Label htmlFor="increase_energy">Aumentar mi energía y motivación</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Notas adicionales</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Cualquier información adicional que consideres relevante sobre tu productividad..."
                value={assessmentData.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Recuerda que esta evaluación es el primer paso para mejorar tu productividad. Basándonos en tus respuestas, generaremos recomendaciones personalizadas para ayudarte a ser más productivo.
              </p>
            </div>
          </div>
        )

      default:
        return <div>Paso no implementado</div>
    }
  }

  // Renderizar evaluación completada
  if (assessmentComplete) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Evaluación Completada
          </CardTitle>
          <CardDescription>
            Gracias por completar la evaluación. Estamos generando tus recomendaciones de productividad personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">¡Evaluación Exitosa!</h3>
            <p className="text-center text-gray-500 mb-4">
              Hemos recibido tus datos y nuestro sistema de IA está creando recomendaciones de productividad personalizadas para ti.
            </p>
            <Button onClick={() => window.location.href = "/productivity"}>
              Ver mi Dashboard de Productividad
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
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Evaluación de Productividad Inicial
        </CardTitle>
        <CardDescription>
          Completa esta evaluación para que podamos crear recomendaciones de productividad personalizadas para ti.
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
