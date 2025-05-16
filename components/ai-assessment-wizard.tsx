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
  Utensils, 
  Brain, 
  Heart, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface AssessmentData {
  // Personal Information
  age: number
  gender: string
  height: number
  weight: number
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  
  // Goals
  primaryGoal: 'fat_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness' | 'athletic_performance'
  secondaryGoals: string[]
  targetWeight?: number
  targetDate?: string
  
  // Training Experience
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  trainingHistory: string
  preferredTrainingStyle: string[]
  
  // Availability & Resources
  weeklyAvailability: number
  sessionDuration: number
  equipment: string[]
  trainingLocation: 'home' | 'gym' | 'outdoors' | 'mixed'
  
  // Health & Limitations
  injuries: string[]
  medicalConditions: string[]
  medications: string[]
  painAreas: string[]
  
  // Nutrition
  dietType: string
  allergies: string[]
  mealPreferences: string
  supplementsUsed: string[]
  
  // Sleep & Recovery
  averageSleep: number
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent'
  stressLevel: 'low' | 'moderate' | 'high' | 'very_high'
  recoveryMethods: string[]
  
  // Measurements (optional)
  bodyFatPercentage?: number
  waistCircumference?: number
  hipCircumference?: number
  chestCircumference?: number
  
  // Preferences
  preferredExercises: string[]
  dislikedExercises: string[]
  musicPreference?: string
  outdoorActivities?: string[]
  
  // Wearables & Tracking
  usesWearables: boolean
  wearableDevices?: string[]
  tracksNutrition: boolean
  nutritionTrackingMethod?: string
}

export default function AIAssessmentWizard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const totalSteps = 8
  
  // Initialize assessment data
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    // Personal Information
    age: 30,
    gender: 'male',
    height: 175,
    weight: 75,
    activityLevel: 'moderately_active',
    
    // Goals
    primaryGoal: 'general_fitness',
    secondaryGoals: [],
    
    // Training Experience
    experienceLevel: 'intermediate',
    trainingHistory: '',
    preferredTrainingStyle: [],
    
    // Availability & Resources
    weeklyAvailability: 4,
    sessionDuration: 60,
    equipment: [],
    trainingLocation: 'gym',
    
    // Health & Limitations
    injuries: [],
    medicalConditions: [],
    medications: [],
    painAreas: [],
    
    // Nutrition
    dietType: 'balanced',
    allergies: [],
    mealPreferences: '',
    supplementsUsed: [],
    
    // Sleep & Recovery
    averageSleep: 7,
    sleepQuality: 'good',
    stressLevel: 'moderate',
    recoveryMethods: [],
    
    // Preferences
    preferredExercises: [],
    dislikedExercises: [],
    
    // Wearables & Tracking
    usesWearables: false,
    tracksNutrition: false
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
  const handleChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Handle checkbox arrays
  const handleCheckboxChange = (field: keyof AssessmentData, value: string, checked: boolean) => {
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
      // Save assessment data to Supabase
      const { data, error } = await supabase
        .from('user_assessments')
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
      
      // Mark assessment as complete
      setAssessmentComplete(true)
      
      toast({
        title: "Evaluación completada",
        description: "Tus datos han sido guardados y estamos generando tu plan personalizado",
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
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Personal</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={assessmentData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Género</Label>
                <RadioGroup
                  value={assessmentData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Femenino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Otro</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={assessmentData.height}
                  onChange={(e) => handleChange('height', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={assessmentData.weight}
                  onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nivel de actividad diaria</Label>
              <RadioGroup
                value={assessmentData.activityLevel}
                onValueChange={(value: any) => handleChange('activityLevel', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentario (poco o nada de ejercicio)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lightly_active" id="lightly_active" />
                  <Label htmlFor="lightly_active">Ligeramente activo (ejercicio ligero 1-3 días/semana)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderately_active" id="moderately_active" />
                  <Label htmlFor="moderately_active">Moderadamente activo (ejercicio moderado 3-5 días/semana)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_active" id="very_active" />
                  <Label htmlFor="very_active">Muy activo (ejercicio intenso 6-7 días/semana)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extremely_active" id="extremely_active" />
                  <Label htmlFor="extremely_active">Extremadamente activo (ejercicio muy intenso, trabajo físico)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Objetivos</h3>
            
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
      
      // Additional steps will be implemented in the next section
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
            <Button onClick={() => window.location.href = "/ai-personalization"}>
              Ver mi Dashboard de IA
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
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Evaluación Inicial de IA
        </CardTitle>
        <CardDescription>
          Completa esta evaluación para que nuestra IA pueda crear un plan personalizado para ti.
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
