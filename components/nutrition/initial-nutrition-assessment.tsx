"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Calculator, User, Target, Activity, Utensils, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"

interface NutritionAssessmentData {
  // Datos personales
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  
  // Nivel de actividad
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  
  // Objetivos
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'gain_muscle' | 'improve_health'
  targetWeight?: number
  timeframe: '1_month' | '3_months' | '6_months' | '1_year' | 'no_rush'
  
  // Preferencias dietéticas
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'mediterranean' | 'other'
  allergies: string[]
  dislikes: string[]
  
  // Estilo de vida
  mealsPerDay: number
  cookingSkill: 'beginner' | 'intermediate' | 'advanced'
  timeForCooking: 'minimal' | 'moderate' | 'plenty'
  budget: 'low' | 'medium' | 'high'
  
  // Información médica
  medicalConditions: string[]
  medications: string
  notes: string
}

interface InitialNutritionAssessmentProps {
  onComplete: (data: NutritionAssessmentData & { maintenanceCalories: number }) => void
  onSkip?: () => void
}

export default function InitialNutritionAssessment({ onComplete, onSkip }: InitialNutritionAssessmentProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 6

  const [formData, setFormData] = useState<Partial<NutritionAssessmentData>>({
    age: undefined,
    gender: undefined,
    height: undefined,
    weight: undefined,
    activityLevel: undefined,
    goal: undefined,
    targetWeight: undefined,
    timeframe: undefined,
    dietType: undefined,
    allergies: [],
    dislikes: [],
    mealsPerDay: 3,
    cookingSkill: undefined,
    timeForCooking: undefined,
    budget: undefined,
    medicalConditions: [],
    medications: '',
    notes: ''
  })

  // Calcular calorías de mantenimiento usando la fórmula de Mifflin-St Jeor
  const calculateMaintenanceCalories = (data: NutritionAssessmentData): number => {
    let bmr: number

    if (data.gender === 'male') {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    } else {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161
    }

    // Factores de actividad
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }

    return Math.round(bmr * activityFactors[data.activityLevel])
  }

  // Ajustar calorías según el objetivo
  const adjustCaloriesForGoal = (maintenanceCalories: number, goal: string): number => {
    switch (goal) {
      case 'lose_weight':
        return maintenanceCalories - 500 // Déficit de 500 cal para perder ~0.5kg/semana
      case 'gain_weight':
      case 'gain_muscle':
        return maintenanceCalories + 300 // Superávit de 300 cal
      case 'maintain_weight':
      case 'improve_health':
      default:
        return maintenanceCalories
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user || !isFormValid()) return

    setIsSubmitting(true)
    try {
      const completeData = formData as NutritionAssessmentData
      const maintenanceCalories = calculateMaintenanceCalories(completeData)
      const targetCalories = adjustCaloriesForGoal(maintenanceCalories, completeData.goal)

      // Guardar en Supabase
      const { error } = await supabase
        .from('nutrition_assessments')
        .insert({
          user_id: user.id,
          ...completeData,
          maintenance_calories: maintenanceCalories,
          target_calories: targetCalories,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // También crear objetivos nutricionales iniciales
      const proteinPercentage = completeData.goal === 'gain_muscle' ? 30 : 25
      const carbPercentage = completeData.dietType === 'keto' ? 10 : 45
      const fatPercentage = 100 - proteinPercentage - carbPercentage

      await supabase
        .from('nutrition_goals')
        .insert({
          user_id: user.id,
          daily_calories: targetCalories,
          protein_grams: Math.round((targetCalories * proteinPercentage / 100) / 4),
          carbs_grams: Math.round((targetCalories * carbPercentage / 100) / 4),
          fat_grams: Math.round((targetCalories * fatPercentage / 100) / 9),
          created_at: new Date().toISOString()
        })

      toast({
        title: "¡Evaluación completada!",
        description: `Tus calorías de mantenimiento son ${maintenanceCalories} kcal/día`,
      })

      onComplete({ ...completeData, maintenanceCalories })
    } catch (error) {
      console.error('Error al guardar evaluación nutricional:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = (): boolean => {
    const required = ['age', 'gender', 'height', 'weight', 'activityLevel', 'goal', 'dietType', 'cookingSkill', 'timeForCooking', 'budget']
    return required.every(field => formData[field as keyof NutritionAssessmentData] !== undefined)
  }

  const updateFormData = (field: keyof NutritionAssessmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Información Personal</h3>
              <p className="text-gray-600">Necesitamos algunos datos básicos para calcular tus necesidades nutricionales</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age || ''}
                  onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Género</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => updateFormData('gender', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Hombre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Mujer</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={formData.height || ''}
                  onChange={(e) => updateFormData('height', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData('weight', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Nivel de Actividad</h3>
              <p className="text-gray-600">¿Qué tan activo eres en tu día a día?</p>
            </div>

            <RadioGroup
              value={formData.activityLevel}
              onValueChange={(value) => updateFormData('activityLevel', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <div>
                    <Label htmlFor="sedentary" className="font-medium">Sedentario</Label>
                    <p className="text-sm text-gray-600">Poco o ningún ejercicio, trabajo de oficina</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="light" id="light" />
                  <div>
                    <Label htmlFor="light" className="font-medium">Ligeramente activo</Label>
                    <p className="text-sm text-gray-600">Ejercicio ligero 1-3 días/semana</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <div>
                    <Label htmlFor="moderate" className="font-medium">Moderadamente activo</Label>
                    <p className="text-sm text-gray-600">Ejercicio moderado 3-5 días/semana</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="active" id="active" />
                  <div>
                    <Label htmlFor="active" className="font-medium">Muy activo</Label>
                    <p className="text-sm text-gray-600">Ejercicio intenso 6-7 días/semana</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="very_active" id="very_active" />
                  <div>
                    <Label htmlFor="very_active" className="font-medium">Extremadamente activo</Label>
                    <p className="text-sm text-gray-600">Ejercicio muy intenso, trabajo físico</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Objetivos</h3>
              <p className="text-gray-600">¿Cuál es tu objetivo principal?</p>
            </div>

            <RadioGroup
              value={formData.goal}
              onValueChange={(value) => updateFormData('goal', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="lose_weight" id="lose_weight" />
                  <Label htmlFor="lose_weight" className="font-medium">Perder peso</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="maintain_weight" id="maintain_weight" />
                  <Label htmlFor="maintain_weight" className="font-medium">Mantener peso</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="gain_weight" id="gain_weight" />
                  <Label htmlFor="gain_weight" className="font-medium">Ganar peso</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="gain_muscle" id="gain_muscle" />
                  <Label htmlFor="gain_muscle" className="font-medium">Ganar músculo</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="improve_health" id="improve_health" />
                  <Label htmlFor="improve_health" className="font-medium">Mejorar salud general</Label>
                </div>
              </div>
            </RadioGroup>

            {(formData.goal === 'lose_weight' || formData.goal === 'gain_weight') && (
              <div>
                <Label htmlFor="targetWeight">Peso objetivo (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="65"
                  value={formData.targetWeight || ''}
                  onChange={(e) => updateFormData('targetWeight', parseInt(e.target.value))}
                />
              </div>
            )}

            <div>
              <Label>¿En qué tiempo quieres lograr tu objetivo?</Label>
              <Select value={formData.timeframe} onValueChange={(value) => updateFormData('timeframe', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 mes</SelectItem>
                  <SelectItem value="3_months">3 meses</SelectItem>
                  <SelectItem value="6_months">6 meses</SelectItem>
                  <SelectItem value="1_year">1 año</SelectItem>
                  <SelectItem value="no_rush">Sin prisa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Utensils className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Preferencias Dietéticas</h3>
              <p className="text-gray-600">Cuéntanos sobre tu estilo de alimentación</p>
            </div>

            <div>
              <Label>Tipo de dieta</Label>
              <Select value={formData.dietType} onValueChange={(value) => updateFormData('dietType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu tipo de dieta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnivore">Omnívora</SelectItem>
                  <SelectItem value="vegetarian">Vegetariana</SelectItem>
                  <SelectItem value="vegan">Vegana</SelectItem>
                  <SelectItem value="pescatarian">Pescetariana</SelectItem>
                  <SelectItem value="keto">Cetogénica</SelectItem>
                  <SelectItem value="mediterranean">Mediterránea</SelectItem>
                  <SelectItem value="other">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mealsPerDay">Comidas por día</Label>
              <Select value={formData.mealsPerDay?.toString()} onValueChange={(value) => updateFormData('mealsPerDay', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Número de comidas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 comidas</SelectItem>
                  <SelectItem value="3">3 comidas</SelectItem>
                  <SelectItem value="4">4 comidas</SelectItem>
                  <SelectItem value="5">5 comidas</SelectItem>
                  <SelectItem value="6">6 comidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alergias alimentarias (selecciona todas las que apliquen)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Gluten', 'Lácteos', 'Frutos secos', 'Mariscos', 'Huevos', 'Soja'].map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={formData.allergies?.includes(allergy)}
                      onCheckedChange={(checked) => {
                        const current = formData.allergies || []
                        if (checked) {
                          updateFormData('allergies', [...current, allergy])
                        } else {
                          updateFormData('allergies', current.filter(a => a !== allergy))
                        }
                      }}
                    />
                    <Label htmlFor={allergy}>{allergy}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Estilo de Vida</h3>
              <p className="text-gray-600">Información sobre tu rutina y preferencias</p>
            </div>

            <div>
              <Label>Nivel de habilidad culinaria</Label>
              <RadioGroup
                value={formData.cookingSkill}
                onValueChange={(value) => updateFormData('cookingSkill', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Principiante</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermedio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Avanzado</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Tiempo disponible para cocinar</Label>
              <RadioGroup
                value={formData.timeForCooking}
                onValueChange={(value) => updateFormData('timeForCooking', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" />
                  <Label htmlFor="minimal">Mínimo (15-30 min/día)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderado (30-60 min/día)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plenty" id="plenty" />
                  <Label htmlFor="plenty">Mucho (1+ horas/día)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Presupuesto para alimentación</Label>
              <RadioGroup
                value={formData.budget}
                onValueChange={(value) => updateFormData('budget', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Bajo (económico)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">Alto (sin restricciones)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Información Médica</h3>
              <p className="text-gray-600">Información adicional importante (opcional)</p>
            </div>

            <div>
              <Label>Condiciones médicas (selecciona todas las que apliquen)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {['Diabetes', 'Hipertensión', 'Colesterol alto', 'Problemas tiroideos', 'Problemas digestivos', 'Ninguna'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.medicalConditions?.includes(condition)}
                      onCheckedChange={(checked) => {
                        const current = formData.medicalConditions || []
                        if (checked) {
                          updateFormData('medicalConditions', [...current, condition])
                        } else {
                          updateFormData('medicalConditions', current.filter(c => c !== condition))
                        }
                      }}
                    />
                    <Label htmlFor={condition}>{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Medicamentos actuales</Label>
              <Textarea
                id="medications"
                placeholder="Lista cualquier medicamento que tomes regularmente..."
                value={formData.medications}
                onChange={(e) => updateFormData('medications', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Cualquier información adicional que consideres importante..."
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return <div>Paso {currentStep}</div>
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-6 w-6 mr-2" />
          Evaluación Nutricional Inicial
        </CardTitle>
        <CardDescription>
          Paso {currentStep} de {totalSteps}
        </CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
      </CardHeader>
      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <div className="flex space-x-2">
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Omitir por ahora
              </Button>
            )}
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Completar Evaluación'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
