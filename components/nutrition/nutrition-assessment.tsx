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
  Utensils,
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface NutritionAssessmentData {
  // Objetivos
  primaryGoal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'health_improvement'
  targetWeight?: number
  targetDate?: string

  // Información dietética
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'other'
  otherDietType?: string
  mealFrequency: number
  typicalMealTimes: string[]

  // Preferencias alimentarias
  favoriteProteinSources: string[]
  favoriteCarbohydrateSources: string[]
  favoriteFatSources: string[]
  favoriteVegetables: string[]
  favoriteFruits: string[]

  // Restricciones
  allergies: string[]
  intolerances: string[]
  dislikedFoods: string[]

  // Hábitos alimentarios
  typicalBreakfast: string
  typicalLunch: string
  typicalDinner: string
  typicalSnacks: string
  weekendDifferences: string

  // Métricas
  currentWeight: number
  height: number
  age: number
  gender: 'male' | 'female' | 'other'
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'

  // Suplementos
  currentSupplements: string[]

  // Notas adicionales
  additionalNotes: string
}

export default function NutritionAssessment() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const totalSteps = 6

  // Inicializar datos de evaluación
  const [assessmentData, setAssessmentData] = useState<NutritionAssessmentData>({
    // Objetivos
    primaryGoal: 'weight_loss',

    // Información dietética
    dietType: 'omnivore',
    mealFrequency: 3,
    typicalMealTimes: ['08:00', '13:00', '20:00'],

    // Preferencias alimentarias
    favoriteProteinSources: [],
    favoriteCarbohydrateSources: [],
    favoriteFatSources: [],
    favoriteVegetables: [],
    favoriteFruits: [],

    // Restricciones
    allergies: [],
    intolerances: [],
    dislikedFoods: [],

    // Hábitos alimentarios
    typicalBreakfast: '',
    typicalLunch: '',
    typicalDinner: '',
    typicalSnacks: '',
    weekendDifferences: '',

    // Métricas
    currentWeight: 70,
    height: 170,
    age: 30,
    gender: 'male',
    activityLevel: 'moderately_active',

    // Suplementos
    currentSupplements: [],

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
  const handleChange = (field: keyof NutritionAssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en checkboxes (arrays)
  const handleCheckboxChange = (field: keyof NutritionAssessmentData, value: string, checked: boolean) => {
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
        .from('nutrition_assessments')
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
        description: "Tus datos han sido guardados y estamos generando tu plan nutricional personalizado",
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
            <h3 className="text-lg font-medium">Objetivos Nutricionales</h3>

            <div className="space-y-2">
              <Label>Objetivo principal</Label>
              <RadioGroup
                value={assessmentData.primaryGoal}
                onValueChange={(value: any) => handleChange('primaryGoal', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weight_loss" id="weight_loss" />
                  <Label htmlFor="weight_loss">Pérdida de peso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muscle_gain" id="muscle_gain" />
                  <Label htmlFor="muscle_gain">Ganancia muscular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance">Mantenimiento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="performance" />
                  <Label htmlFor="performance">Rendimiento deportivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="health_improvement" id="health_improvement" />
                  <Label htmlFor="health_improvement">Mejora de la salud</Label>
                </div>
              </RadioGroup>
            </div>

            {(assessmentData.primaryGoal === 'weight_loss' || assessmentData.primaryGoal === 'muscle_gain') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Peso objetivo (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={assessmentData.targetWeight || ''}
                    onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value))}
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
                  onValueChange={(value: any) => handleChange('gender', value)}
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
                    <RadioGroupItem value="other" id="other_gender" />
                    <Label htmlFor="other_gender">Otro</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nivel de actividad física</Label>
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
            <h3 className="text-lg font-medium">Información Dietética</h3>

            <div className="space-y-2">
              <Label>Tipo de dieta actual</Label>
              <RadioGroup
                value={assessmentData.dietType}
                onValueChange={(value: any) => handleChange('dietType', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="omnivore" id="omnivore" />
                  <Label htmlFor="omnivore">Omnívora (come de todo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegetarian" id="vegetarian" />
                  <Label htmlFor="vegetarian">Vegetariana</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegan" id="vegan" />
                  <Label htmlFor="vegan">Vegana</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pescatarian" id="pescatarian" />
                  <Label htmlFor="pescatarian">Pescetariana</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="keto" id="keto" />
                  <Label htmlFor="keto">Cetogénica</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paleo" id="paleo" />
                  <Label htmlFor="paleo">Paleo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mediterranean" id="mediterranean" />
                  <Label htmlFor="mediterranean">Mediterránea</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other_diet" />
                  <Label htmlFor="other_diet">Otra</Label>
                </div>
              </RadioGroup>
            </div>

            {assessmentData.dietType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherDietType">Especifica tu tipo de dieta</Label>
                <Input
                  id="otherDietType"
                  value={assessmentData.otherDietType || ''}
                  onChange={(e) => handleChange('otherDietType', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Número de comidas al día</Label>
              <div className="py-4">
                <Slider
                  min={1}
                  max={6}
                  step={1}
                  value={[assessmentData.mealFrequency]}
                  onValueChange={(value) => handleChange('mealFrequency', value[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs">1 comida</span>
                  <span className="text-xs font-medium">{assessmentData.mealFrequency} comidas</span>
                  <span className="text-xs">6 comidas</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typicalMealTimes">Horarios típicos de comidas</Label>
              <Input
                id="typicalMealTimes"
                placeholder="Ej: 08:00, 13:00, 20:00"
                value={assessmentData.typicalMealTimes.join(', ')}
                onChange={(e) => handleChange('typicalMealTimes', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los horarios con comas</p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferencias Alimentarias</h3>

            <div className="space-y-2">
              <Label htmlFor="favoriteProteinSources">Fuentes de proteína preferidas</Label>
              <Textarea
                id="favoriteProteinSources"
                placeholder="Ej: pollo, huevos, atún, tofu, lentejas..."
                value={assessmentData.favoriteProteinSources.join(', ')}
                onChange={(e) => handleChange('favoriteProteinSources', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteCarbohydrateSources">Fuentes de carbohidratos preferidas</Label>
              <Textarea
                id="favoriteCarbohydrateSources"
                placeholder="Ej: arroz, patatas, pan integral, avena..."
                value={assessmentData.favoriteCarbohydrateSources.join(', ')}
                onChange={(e) => handleChange('favoriteCarbohydrateSources', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteFatSources">Fuentes de grasas preferidas</Label>
              <Textarea
                id="favoriteFatSources"
                placeholder="Ej: aceite de oliva, aguacate, frutos secos..."
                value={assessmentData.favoriteFatSources.join(', ')}
                onChange={(e) => handleChange('favoriteFatSources', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteVegetables">Verduras preferidas</Label>
              <Textarea
                id="favoriteVegetables"
                placeholder="Ej: brócoli, espinacas, zanahorias..."
                value={assessmentData.favoriteVegetables.join(', ')}
                onChange={(e) => handleChange('favoriteVegetables', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteFruits">Frutas preferidas</Label>
              <Textarea
                id="favoriteFruits"
                placeholder="Ej: plátano, manzana, fresas..."
                value={assessmentData.favoriteFruits.join(', ')}
                onChange={(e) => handleChange('favoriteFruits', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Restricciones Alimentarias</h3>

            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias alimentarias</Label>
              <Textarea
                id="allergies"
                placeholder="Ej: frutos secos, mariscos, lácteos..."
                value={assessmentData.allergies.join(', ')}
                onChange={(e) => handleChange('allergies', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intolerances">Intolerancias alimentarias</Label>
              <Textarea
                id="intolerances"
                placeholder="Ej: gluten, lactosa, fructosa..."
                value={assessmentData.intolerances.join(', ')}
                onChange={(e) => handleChange('intolerances', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dislikedFoods">Alimentos que no te gustan</Label>
              <Textarea
                id="dislikedFoods"
                placeholder="Ej: coliflor, hígado, aceitunas..."
                value={assessmentData.dislikedFoods.join(', ')}
                onChange={(e) => handleChange('dislikedFoods', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los alimentos con comas</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Si tienes alergias graves, consulta siempre con un profesional de la salud antes de realizar cambios en tu dieta.
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hábitos Alimentarios</h3>

            <div className="space-y-2">
              <Label htmlFor="typicalBreakfast">Desayuno típico</Label>
              <Textarea
                id="typicalBreakfast"
                placeholder="Describe tu desayuno habitual..."
                value={assessmentData.typicalBreakfast}
                onChange={(e) => handleChange('typicalBreakfast', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typicalLunch">Almuerzo típico</Label>
              <Textarea
                id="typicalLunch"
                placeholder="Describe tu almuerzo habitual..."
                value={assessmentData.typicalLunch}
                onChange={(e) => handleChange('typicalLunch', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typicalDinner">Cena típica</Label>
              <Textarea
                id="typicalDinner"
                placeholder="Describe tu cena habitual..."
                value={assessmentData.typicalDinner}
                onChange={(e) => handleChange('typicalDinner', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typicalSnacks">Snacks típicos</Label>
              <Textarea
                id="typicalSnacks"
                placeholder="Describe tus snacks habituales..."
                value={assessmentData.typicalSnacks}
                onChange={(e) => handleChange('typicalSnacks', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekendDifferences">¿Cómo cambia tu alimentación los fines de semana?</Label>
              <Textarea
                id="weekendDifferences"
                placeholder="Describe las diferencias en tu alimentación durante los fines de semana..."
                value={assessmentData.weekendDifferences}
                onChange={(e) => handleChange('weekendDifferences', e.target.value)}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Suplementos y Notas Adicionales</h3>

            <div className="space-y-2">
              <Label htmlFor="currentSupplements">Suplementos actuales</Label>
              <Textarea
                id="currentSupplements"
                placeholder="Ej: proteína en polvo, creatina, vitamina D..."
                value={assessmentData.currentSupplements.join(', ')}
                onChange={(e) => handleChange('currentSupplements', e.target.value.split(', ').filter(Boolean))}
              />
              <p className="text-xs text-gray-500">Separa los suplementos con comas</p>
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

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Recuerda que esta evaluación es el primer paso para crear un plan nutricional personalizado. Podrás ajustar y refinar tu plan a medida que avances.
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
            Gracias por completar la evaluación. Estamos generando tu plan nutricional personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">¡Evaluación Exitosa!</h3>
            <p className="text-center text-gray-500 mb-4">
              Hemos recibido tus datos y nuestro sistema de IA está creando un plan nutricional personalizado para ti.
            </p>
            <Button onClick={() => window.location.href = "/nutrition"}>
              Ver mi Dashboard de Nutrición
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
          <Utensils className="h-5 w-5 mr-2 text-primary" />
          Evaluación Nutricional Inicial
        </CardTitle>
        <CardDescription>
          Completa esta evaluación para que podamos crear un plan nutricional personalizado para ti.
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
