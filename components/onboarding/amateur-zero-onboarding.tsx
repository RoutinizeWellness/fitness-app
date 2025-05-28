"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/contexts/auth-context"
import Image from "next/image"
import { Check, ChevronRight, Clock, Dumbbell, Home, MapPin, Star } from "lucide-react"

// Tipos para las respuestas del onboarding
interface OnboardingResponses {
  motivation: string;
  availableTime: string;
  limitations: string[];
  trainingLocation: string;
  feelingAboutStarting: string;
}

// Componente principal de onboarding para principiantes absolutos
export function AmateurZeroOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [responses, setResponses] = useState<OnboardingResponses>({
    motivation: "",
    availableTime: "",
    limitations: [],
    trainingLocation: "",
    feelingAboutStarting: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Actualizar progreso cuando cambia el paso
  useEffect(() => {
    const totalSteps = 6 // Incluye pantalla de bienvenida y finalización
    const progressValue = (step / (totalSteps - 1)) * 100
    setProgress(progressValue)
  }, [step])

  // Manejar cambios en las respuestas
  const handleResponseChange = (key: keyof OnboardingResponses, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  // Manejar cambios en limitaciones (múltiples selecciones)
  const handleLimitationToggle = (limitation: string) => {
    setResponses(prev => {
      const currentLimitations = [...prev.limitations]
      if (currentLimitations.includes(limitation)) {
        return { ...prev, limitations: currentLimitations.filter(l => l !== limitation) }
      } else {
        return { ...prev, limitations: [...currentLimitations, limitation] }
      }
    })
  }

  // Guardar respuestas en Supabase y actualizar nivel de experiencia
  const saveResponses = async () => {
    if (!user) return

    setIsSubmitting(true)

    try {
      // Guardar respuestas de onboarding
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          experience_level: 'amateur_zero',
          onboarding_completed: true,
          motivation: responses.motivation,
          available_time: responses.availableTime,
          limitations: responses.limitations,
          training_location: responses.trainingLocation,
          feeling_about_starting: responses.feelingAboutStarting,
          onboarding_date: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Crear plan inicial para principiante absoluto
      const { error: planError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: "Tu Primer Plan de Entrenamiento",
          description: "Un plan diseñado especialmente para comenzar tu viaje fitness desde cero.",
          level: "amateur_zero",
          goal: "introduction",
          duration_weeks: 4,
          frequency_per_week: 3,
          is_active: true,
          is_template: false
        })

      if (planError) throw planError

      toast({
        title: "¡Perfil configurado!",
        description: "Hemos personalizado tu experiencia basada en tus respuestas.",
      })

      // Redirigir al dashboard
      router.push('/training/dashboard')
    } catch (error) {
      console.error("Error al guardar respuestas:", error)
      toast({
        title: "Error",
        description: "No pudimos guardar tus respuestas. Por favor, intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      saveResponses()
    }
  }

  // Retroceder al paso anterior
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  // Verificar si se puede avanzar al siguiente paso
  const canProceed = () => {
    switch (step) {
      case 0: return true // Pantalla de bienvenida
      case 1: return !!responses.motivation
      case 2: return !!responses.availableTime
      case 3: return true // Limitaciones (opcional)
      case 4: return !!responses.trainingLocation
      case 5: return !!responses.feelingAboutStarting
      default: return false
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {step === 0 ? "¡Bienvenido!" : 
               step === 5 ? "Último paso" : 
               `Paso ${step} de 4`}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription>
            {step === 0 ? "Comencemos tu viaje fitness" : 
             step === 5 ? "Casi listo para comenzar" : 
             "Personalicemos tu experiencia"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Contenido específico para cada paso */}
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={step === 0}
          >
            Atrás
          </Button>
          <Button 
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Guardando...
              </>
            ) : step === 5 ? (
              "Finalizar"
            ) : (
              "Siguiente"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )

  // Renderizar contenido específico para cada paso
  function renderStepContent() {
    switch (step) {
      case 0:
        return <WelcomeScreen />
      case 1:
        return <MotivationScreen value={responses.motivation} onChange={(value) => handleResponseChange('motivation', value)} />
      case 2:
        return <TimeAvailabilityScreen value={responses.availableTime} onChange={(value) => handleResponseChange('availableTime', value)} />
      case 3:
        return <LimitationsScreen value={responses.limitations} onToggle={handleLimitationToggle} />
      case 4:
        return <TrainingLocationScreen value={responses.trainingLocation} onChange={(value) => handleResponseChange('trainingLocation', value)} />
      case 5:
        return <FeelingScreen value={responses.feelingAboutStarting} onChange={(value) => handleResponseChange('feelingAboutStarting', value)} />
      default:
        return null
    }
  }
}

// Componentes para cada pantalla del onboarding

function WelcomeScreen() {
  return (
    <div className="text-center space-y-6">
      <div className="relative h-40 w-40 mx-auto">
        <Image 
          src="/images/welcome-fitness.png" 
          alt="Bienvenido a tu viaje fitness" 
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold">¡Hola y bienvenido a tu nuevo comienzo!</h3>
      <p className="text-muted-foreground">
        Estamos emocionados de acompañarte en este viaje. No importa si nunca has pisado un gimnasio o si la palabra "proteína" te suena a ciencia ficción - estás exactamente donde debes estar.
      </p>
      <p className="text-muted-foreground">
        Aquí no hay preguntas tontas ni expectativas irreales. Iremos paso a paso, celebrando cada pequeño logro.
      </p>
      <p className="font-medium">
        Tu único trabajo ahora: dar un pequeño paso cada día. Nosotros nos encargamos del resto.
      </p>
    </div>
  )
}

function MotivationScreen({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">¿Cuál es tu principal motivación para comenzar?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Esto nos ayuda a personalizar tu experiencia y recordarte tu "porqué" cuando necesites motivación extra.
      </p>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="energy" id="energy" />
            <Label htmlFor="energy" className="flex-1 cursor-pointer">Para sentirme con más energía en mi día a día</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="health" id="health" />
            <Label htmlFor="health" className="flex-1 cursor-pointer">Para mejorar mi salud general</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="appearance" id="appearance" />
            <Label htmlFor="appearance" className="flex-1 cursor-pointer">Para verme mejor físicamente</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new" className="flex-1 cursor-pointer">Para probar algo nuevo y diferente</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="stress" id="stress" />
            <Label htmlFor="stress" className="flex-1 cursor-pointer">Para reducir el estrés</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}

function TimeAvailabilityScreen({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">¿Cuánto tiempo puedes dedicar al ejercicio cada día?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        No necesitas horas para ver resultados. Adaptaremos todo a tu disponibilidad real para que puedas ser consistente.
      </p>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="10-15" id="time-1" />
            <Label htmlFor="time-1" className="flex-1 cursor-pointer flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              10-15 minutos
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="20-30" id="time-2" />
            <Label htmlFor="time-2" className="flex-1 cursor-pointer flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              20-30 minutos
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="30-45" id="time-3" />
            <Label htmlFor="time-3" className="flex-1 cursor-pointer flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              30-45 minutos
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="varies" id="time-4" />
            <Label htmlFor="time-4" className="flex-1 cursor-pointer flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Varía según el día
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}

function LimitationsScreen({ value, onToggle }: { value: string[], onToggle: (limitation: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">¿Tienes alguna limitación física o de salud?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Tu seguridad es nuestra prioridad. Esta información nos ayuda a recomendarte ejercicios adecuados para ti.
      </p>
      
      <div className="space-y-3">
        <div 
          className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer ${value.includes('none') ? 'bg-accent' : ''}`}
          onClick={() => onToggle('none')}
        >
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${value.includes('none') ? 'bg-primary border-primary' : 'border-input'}`}>
            {value.includes('none') && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="flex-1">No, ninguna que conozca</span>
        </div>
        
        <div 
          className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer ${value.includes('knees') ? 'bg-accent' : ''}`}
          onClick={() => onToggle('knees')}
        >
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${value.includes('knees') ? 'bg-primary border-primary' : 'border-input'}`}>
            {value.includes('knees') && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="flex-1">Molestias en rodillas</span>
        </div>
        
        <div 
          className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer ${value.includes('back') ? 'bg-accent' : ''}`}
          onClick={() => onToggle('back')}
        >
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${value.includes('back') ? 'bg-primary border-primary' : 'border-input'}`}>
            {value.includes('back') && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="flex-1">Molestias en espalda</span>
        </div>
        
        <div 
          className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer ${value.includes('shoulders') ? 'bg-accent' : ''}`}
          onClick={() => onToggle('shoulders')}
        >
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${value.includes('shoulders') ? 'bg-primary border-primary' : 'border-input'}`}>
            {value.includes('shoulders') && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="flex-1">Molestias en hombros</span>
        </div>
        
        <div 
          className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer ${value.includes('medical') ? 'bg-accent' : ''}`}
          onClick={() => onToggle('medical')}
        >
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${value.includes('medical') ? 'bg-primary border-primary' : 'border-input'}`}>
            {value.includes('medical') && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="flex-1">Condición médica diagnosticada</span>
        </div>
      </div>
    </div>
  )
}

function TrainingLocationScreen({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">¿Dónde planeas hacer ejercicio principalmente?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adaptaremos tus rutinas al espacio y recursos que tengas disponibles.
      </p>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="home_no_equipment" id="loc-1" />
            <Label htmlFor="loc-1" className="flex-1 cursor-pointer flex items-center">
              <Home className="h-4 w-4 mr-2 text-primary" />
              En casa sin equipamiento
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="home_basic_equipment" id="loc-2" />
            <Label htmlFor="loc-2" className="flex-1 cursor-pointer flex items-center">
              <Home className="h-4 w-4 mr-2 text-primary" />
              En casa con equipamiento básico
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="gym" id="loc-3" />
            <Label htmlFor="loc-3" className="flex-1 cursor-pointer flex items-center">
              <Dumbbell className="h-4 w-4 mr-2 text-primary" />
              En un gimnasio
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="outdoors" id="loc-4" />
            <Label htmlFor="loc-4" className="flex-1 cursor-pointer flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Al aire libre
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="combination" id="loc-5" />
            <Label htmlFor="loc-5" className="flex-1 cursor-pointer flex items-center">
              <Star className="h-4 w-4 mr-2 text-primary" />
              Combinación de lugares
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}

function FeelingScreen({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">¿Cómo te sientes respecto a comenzar?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ser honesto nos ayuda a darte el apoyo que realmente necesitas en cada momento.
      </p>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="excited_nervous" id="feel-1" />
            <Label htmlFor="feel-1" className="flex-1 cursor-pointer">Emocionado pero un poco nervioso</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="motivated" id="feel-2" />
            <Label htmlFor="feel-2" className="flex-1 cursor-pointer">Motivado y listo para empezar</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="skeptical" id="feel-3" />
            <Label htmlFor="feel-3" className="flex-1 cursor-pointer">Escéptico pero dispuesto a intentarlo</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
            <RadioGroupItem value="overwhelmed" id="feel-4" />
            <Label htmlFor="feel-4" className="flex-1 cursor-pointer">Abrumado, necesito que sea muy simple</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}
