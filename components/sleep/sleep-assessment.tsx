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
  Moon,
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface SleepAssessmentData {
  // Hábitos de sueño
  averageSleepDuration: number
  bedTime: string
  wakeTime: string
  sleepLatency: number // minutos para quedarse dormido

  // Calidad del sueño
  sleepQuality: 'very_poor' | 'poor' | 'fair' | 'good' | 'very_good'
  wakeUpFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'very_often'
  morningFeel: 'very_tired' | 'tired' | 'neutral' | 'rested' | 'very_rested'

  // Factores que afectan al sueño
  caffeineBefore: boolean
  alcoholBefore: boolean
  screenTimeBefore: boolean
  exerciseBefore: boolean
  heavyMealBefore: boolean

  // Ambiente de sueño
  roomTemperature: 'too_cold' | 'cold' | 'comfortable' | 'warm' | 'too_warm'
  noiseLevel: 'very_quiet' | 'quiet' | 'moderate' | 'noisy' | 'very_noisy'
  lightLevel: 'very_dark' | 'dark' | 'dim' | 'bright' | 'very_bright'

  // Trastornos del sueño
  snoring: boolean
  sleepApnea: boolean
  insomnia: boolean
  restlessLegs: boolean
  nightmares: boolean
  sleepwalking: boolean

  // Objetivos de sueño
  sleepGoal: 'fall_asleep_faster' | 'sleep_longer' | 'reduce_wakeups' | 'feel_more_rested' | 'consistent_schedule'

  // Notas adicionales
  additionalNotes: string
}

export default function SleepAssessment() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const totalSteps = 5

  // Inicializar datos de evaluación
  const [assessmentData, setAssessmentData] = useState<SleepAssessmentData>({
    // Hábitos de sueño
    averageSleepDuration: 7,
    bedTime: "23:00",
    wakeTime: "07:00",
    sleepLatency: 15,

    // Calidad del sueño
    sleepQuality: 'fair',
    wakeUpFrequency: 'sometimes',
    morningFeel: 'neutral',

    // Factores que afectan al sueño
    caffeineBefore: false,
    alcoholBefore: false,
    screenTimeBefore: true,
    exerciseBefore: false,
    heavyMealBefore: false,

    // Ambiente de sueño
    roomTemperature: 'comfortable',
    noiseLevel: 'quiet',
    lightLevel: 'dark',

    // Trastornos del sueño
    snoring: false,
    sleepApnea: false,
    insomnia: false,
    restlessLegs: false,
    nightmares: false,
    sleepwalking: false,

    // Objetivos de sueño
    sleepGoal: 'feel_more_rested',

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
  const handleChange = (field: keyof SleepAssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en checkboxes (booleanos)
  const handleCheckboxChange = (field: keyof SleepAssessmentData, checked: boolean) => {
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
        .from('sleep_assessments')
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
        description: "Tus datos han sido guardados y estamos generando tus recomendaciones de sueño personalizadas",
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
            <h3 className="text-lg font-medium">Hábitos de Sueño</h3>

            <div className="space-y-2">
              <Label>Duración media de sueño (horas)</Label>
              <div className="py-4">
                <Slider
                  min={4}
                  max={12}
                  step={0.5}
                  value={[assessmentData.averageSleepDuration]}
                  onValueChange={(value) => handleChange('averageSleepDuration', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">4 horas</span>
                  <span className="text-xs font-medium">{assessmentData.averageSleepDuration} horas</span>
                  <span className="text-xs">12 horas</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedTime">Hora habitual de acostarse</Label>
                <Input
                  id="bedTime"
                  type="time"
                  value={assessmentData.bedTime}
                  onChange={(e) => handleChange('bedTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wakeTime">Hora habitual de levantarse</Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={assessmentData.wakeTime}
                  onChange={(e) => handleChange('wakeTime', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tiempo para quedarse dormido (minutos)</Label>
              <div className="py-4">
                <Slider
                  min={0}
                  max={120}
                  step={5}
                  value={[assessmentData.sleepLatency]}
                  onValueChange={(value) => handleChange('sleepLatency', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">0 min</span>
                  <span className="text-xs font-medium">{assessmentData.sleepLatency} min</span>
                  <span className="text-xs">120 min</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Calidad del Sueño</h3>

            <div className="space-y-2">
              <Label>Calidad general del sueño</Label>
              <RadioGroup
                value={assessmentData.sleepQuality}
                onValueChange={(value: any) => handleChange('sleepQuality', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_poor" id="very_poor" />
                  <Label htmlFor="very_poor">Muy mala</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor" />
                  <Label htmlFor="poor">Mala</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="fair" />
                  <Label htmlFor="fair">Regular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good">Buena</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_good" id="very_good" />
                  <Label htmlFor="very_good">Muy buena</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Frecuencia con la que te despiertas durante la noche</Label>
              <RadioGroup
                value={assessmentData.wakeUpFrequency}
                onValueChange={(value: any) => handleChange('wakeUpFrequency', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">Nunca</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely" />
                  <Label htmlFor="rarely">Raramente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="sometimes" />
                  <Label htmlFor="sometimes">A veces</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="often" />
                  <Label htmlFor="often">A menudo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_often" id="very_often" />
                  <Label htmlFor="very_often">Muy a menudo</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>¿Cómo te sientes al despertar?</Label>
              <RadioGroup
                value={assessmentData.morningFeel}
                onValueChange={(value: any) => handleChange('morningFeel', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_tired" id="very_tired" />
                  <Label htmlFor="very_tired">Muy cansado/a</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tired" id="tired" />
                  <Label htmlFor="tired">Cansado/a</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral">Neutral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rested" id="rested" />
                  <Label htmlFor="rested">Descansado/a</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_rested" id="very_rested" />
                  <Label htmlFor="very_rested">Muy descansado/a</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Factores que Afectan al Sueño</h3>

            <div className="space-y-2">
              <Label className="text-base">¿Consumes alguno de estos antes de dormir?</Label>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="caffeineBefore"
                  checked={assessmentData.caffeineBefore}
                  onChange={(e) => handleCheckboxChange('caffeineBefore', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="caffeineBefore">Cafeína (café, té, refrescos)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="alcoholBefore"
                  checked={assessmentData.alcoholBefore}
                  onChange={(e) => handleCheckboxChange('alcoholBefore', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="alcoholBefore">Alcohol</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="screenTimeBefore"
                  checked={assessmentData.screenTimeBefore}
                  onChange={(e) => handleCheckboxChange('screenTimeBefore', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="screenTimeBefore">Tiempo de pantalla (móvil, TV, ordenador)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="exerciseBefore"
                  checked={assessmentData.exerciseBefore}
                  onChange={(e) => handleCheckboxChange('exerciseBefore', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="exerciseBefore">Ejercicio intenso</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="heavyMealBefore"
                  checked={assessmentData.heavyMealBefore}
                  onChange={(e) => handleCheckboxChange('heavyMealBefore', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="heavyMealBefore">Comida pesada</Label>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label>Temperatura de la habitación</Label>
              <RadioGroup
                value={assessmentData.roomTemperature}
                onValueChange={(value: any) => handleChange('roomTemperature', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_cold" id="too_cold" />
                  <Label htmlFor="too_cold">Muy fría</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cold" id="cold" />
                  <Label htmlFor="cold">Fría</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <Label htmlFor="comfortable">Confortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="warm" id="warm" />
                  <Label htmlFor="warm">Cálida</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_warm" id="too_warm" />
                  <Label htmlFor="too_warm">Muy cálida</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Nivel de ruido</Label>
              <RadioGroup
                value={assessmentData.noiseLevel}
                onValueChange={(value: any) => handleChange('noiseLevel', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_quiet" id="very_quiet" />
                  <Label htmlFor="very_quiet">Muy silencioso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quiet" id="quiet" />
                  <Label htmlFor="quiet">Silencioso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="noisy" id="noisy" />
                  <Label htmlFor="noisy">Ruidoso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_noisy" id="very_noisy" />
                  <Label htmlFor="very_noisy">Muy ruidoso</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Nivel de luz</Label>
              <RadioGroup
                value={assessmentData.lightLevel}
                onValueChange={(value: any) => handleChange('lightLevel', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_dark" id="very_dark" />
                  <Label htmlFor="very_dark">Muy oscuro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Oscuro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dim" id="dim" />
                  <Label htmlFor="dim">Tenue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bright" id="bright" />
                  <Label htmlFor="bright">Brillante</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_bright" id="very_bright" />
                  <Label htmlFor="very_bright">Muy brillante</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Trastornos del Sueño</h3>

            <div className="space-y-2">
              <Label className="text-base">¿Experimentas alguno de estos trastornos?</Label>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="snoring"
                  checked={assessmentData.snoring}
                  onChange={(e) => handleCheckboxChange('snoring', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="snoring">Ronquidos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sleepApnea"
                  checked={assessmentData.sleepApnea}
                  onChange={(e) => handleCheckboxChange('sleepApnea', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="sleepApnea">Apnea del sueño</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="insomnia"
                  checked={assessmentData.insomnia}
                  onChange={(e) => handleCheckboxChange('insomnia', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="insomnia">Insomnio</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="restlessLegs"
                  checked={assessmentData.restlessLegs}
                  onChange={(e) => handleCheckboxChange('restlessLegs', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="restlessLegs">Síndrome de piernas inquietas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="nightmares"
                  checked={assessmentData.nightmares}
                  onChange={(e) => handleCheckboxChange('nightmares', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="nightmares">Pesadillas frecuentes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sleepwalking"
                  checked={assessmentData.sleepwalking}
                  onChange={(e) => handleCheckboxChange('sleepwalking', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="sleepwalking">Sonambulismo</Label>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Si sospechas que tienes un trastorno del sueño grave, te recomendamos consultar con un profesional de la salud.
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
              <Label>¿Cuál es tu principal objetivo relacionado con el sueño?</Label>
              <RadioGroup
                value={assessmentData.sleepGoal}
                onValueChange={(value: any) => handleChange('sleepGoal', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fall_asleep_faster" id="fall_asleep_faster" />
                  <Label htmlFor="fall_asleep_faster">Dormirme más rápido</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sleep_longer" id="sleep_longer" />
                  <Label htmlFor="sleep_longer">Dormir más tiempo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reduce_wakeups" id="reduce_wakeups" />
                  <Label htmlFor="reduce_wakeups">Reducir los despertares nocturnos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feel_more_rested" id="feel_more_rested" />
                  <Label htmlFor="feel_more_rested">Sentirme más descansado/a al despertar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consistent_schedule" id="consistent_schedule" />
                  <Label htmlFor="consistent_schedule">Mantener un horario de sueño más consistente</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Notas adicionales</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Cualquier información adicional que consideres relevante sobre tu sueño..."
                value={assessmentData.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Recuerda que esta evaluación es el primer paso para mejorar tu sueño. Basándonos en tus respuestas, generaremos recomendaciones personalizadas para ayudarte a descansar mejor.
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
            Gracias por completar la evaluación. Estamos generando tus recomendaciones de sueño personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">¡Evaluación Exitosa!</h3>
            <p className="text-center text-gray-500 mb-4">
              Hemos recibido tus datos y nuestro sistema de IA está creando recomendaciones de sueño personalizadas para ti.
            </p>
            <Button onClick={() => window.location.href = "/sleep"}>
              Ver mi Dashboard de Sueño
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
          <Moon className="h-5 w-5 mr-2 text-primary" />
          Evaluación de Sueño Inicial
        </CardTitle>
        <CardDescription>
          Completa esta evaluación para que podamos crear recomendaciones de sueño personalizadas para ti.
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
