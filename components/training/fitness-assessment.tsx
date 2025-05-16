"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OrganicSection } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import {
  Heart,
  Ruler,
  Scale,
  Dumbbell,
  ChevronRight,
  Info,
  BarChart,
  Clipboard
} from "lucide-react"

type AssessmentData = {
  // Datos básicos
  height: number
  weight: number
  age: number
  gender: string
  activityLevel: string

  // Composición corporal
  bodyFatPercentage?: number
  waistCircumference?: number
  hipCircumference?: number
  chestCircumference?: number
  armCircumference?: number
  thighCircumference?: number

  // Pruebas de fuerza
  pushUps: number
  squats: number
  plankTime: number
  pullUps?: number
  benchPressMax?: number
  squatMax?: number
  deadliftMax?: number

  // Métricas cardiovasculares
  restingHeartRate: number
  vo2MaxEstimate?: number

  // Movilidad y flexibilidad
  sitAndReach?: number
  shoulderMobility?: number
  ankleFlexibility?: number

  // Historial médico y lesiones
  injuries?: string[]
  medicalConditions?: string[]

  // Hábitos nutricionales
  mealsPerDay?: number
  waterIntake?: number
  dietType?: string
  foodAllergies?: string[]

  // Estrés y recuperación
  stressLevel?: number
  sleepQuality?: number
  sleepHours?: number

  // Objetivos específicos
  primaryGoal?: string
  secondaryGoal?: string
  timeCommitment?: number
}

export function FitnessAssessment({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    // Datos básicos
    height: 170,
    weight: 70,
    age: 30,
    gender: "male",
    activityLevel: "moderate",

    // Composición corporal
    bodyFatPercentage: 20,
    waistCircumference: 80,
    hipCircumference: 95,
    chestCircumference: 90,
    armCircumference: 32,
    thighCircumference: 55,

    // Pruebas de fuerza
    pushUps: 10,
    squats: 15,
    plankTime: 30,
    pullUps: 5,
    benchPressMax: 60,
    squatMax: 80,
    deadliftMax: 100,

    // Métricas cardiovasculares
    restingHeartRate: 70,
    vo2MaxEstimate: 35,

    // Movilidad y flexibilidad
    sitAndReach: 5,
    shoulderMobility: 3,
    ankleFlexibility: 3,

    // Historial médico y lesiones
    injuries: [],
    medicalConditions: [],

    // Hábitos nutricionales
    mealsPerDay: 3,
    waterIntake: 2000,
    dietType: "balanced",
    foodAllergies: [],

    // Estrés y recuperación
    stressLevel: 5,
    sleepQuality: 7,
    sleepHours: 7,

    // Objetivos específicos
    primaryGoal: "lose_weight",
    secondaryGoal: "improve_fitness",
    timeCommitment: 3
  })

  const { toast } = useToast()

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Número total de pasos en la evaluación
  const totalSteps = 8

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      saveAssessment()
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Obtener el título del paso actual
  const getStepTitle = () => {
    switch (step) {
      case 1: return "Datos básicos"
      case 2: return "Composición corporal"
      case 3: return "Pruebas de fuerza"
      case 4: return "Pruebas cardiovasculares"
      case 5: return "Movilidad y flexibilidad"
      case 6: return "Historial médico"
      case 7: return "Hábitos y objetivos"
      case 8: return "Resumen y finalización"
      default: return "Evaluación"
    }
  }

  const saveAssessment = async () => {
    if (!userId) return

    setIsLoading(true)

    try {
      // Calcular BMI
      const heightInMeters = assessmentData.height / 100
      const bmi = assessmentData.weight / (heightInMeters * heightInMeters)

      // Calcular nivel de condición física basado en las pruebas (sistema de puntuación mejorado)
      let fitnessScores = {
        strength: 0,
        cardio: 0,
        mobility: 0,
        bodyComp: 0,
        recovery: 0
      }

      // Puntuación de fuerza (25 puntos posibles)
      // Flexiones
      if (assessmentData.gender === "male") {
        if (assessmentData.pushUps >= 40) fitnessScores.strength += 5
        else if (assessmentData.pushUps >= 30) fitnessScores.strength += 4
        else if (assessmentData.pushUps >= 20) fitnessScores.strength += 3
        else if (assessmentData.pushUps >= 10) fitnessScores.strength += 2
        else fitnessScores.strength += 1
      } else {
        if (assessmentData.pushUps >= 30) fitnessScores.strength += 5
        else if (assessmentData.pushUps >= 20) fitnessScores.strength += 4
        else if (assessmentData.pushUps >= 10) fitnessScores.strength += 3
        else if (assessmentData.pushUps >= 5) fitnessScores.strength += 2
        else fitnessScores.strength += 1
      }

      // Sentadillas
      if (assessmentData.squats >= 50) fitnessScores.strength += 5
      else if (assessmentData.squats >= 40) fitnessScores.strength += 4
      else if (assessmentData.squats >= 30) fitnessScores.strength += 3
      else if (assessmentData.squats >= 20) fitnessScores.strength += 2
      else fitnessScores.strength += 1

      // Plancha
      if (assessmentData.plankTime >= 120) fitnessScores.strength += 5
      else if (assessmentData.plankTime >= 90) fitnessScores.strength += 4
      else if (assessmentData.plankTime >= 60) fitnessScores.strength += 3
      else if (assessmentData.plankTime >= 30) fitnessScores.strength += 2
      else fitnessScores.strength += 1

      // Dominadas
      if (assessmentData.pullUps) {
        if (assessmentData.gender === "male") {
          if (assessmentData.pullUps >= 15) fitnessScores.strength += 5
          else if (assessmentData.pullUps >= 10) fitnessScores.strength += 4
          else if (assessmentData.pullUps >= 5) fitnessScores.strength += 3
          else if (assessmentData.pullUps >= 2) fitnessScores.strength += 2
          else fitnessScores.strength += 1
        } else {
          if (assessmentData.pullUps >= 10) fitnessScores.strength += 5
          else if (assessmentData.pullUps >= 7) fitnessScores.strength += 4
          else if (assessmentData.pullUps >= 3) fitnessScores.strength += 3
          else if (assessmentData.pullUps >= 1) fitnessScores.strength += 2
          else fitnessScores.strength += 1
        }
      }

      // Fuerza relativa (press de banca)
      if (assessmentData.benchPressMax) {
        const benchRatio = assessmentData.benchPressMax / assessmentData.weight
        if (assessmentData.gender === "male") {
          if (benchRatio >= 1.5) fitnessScores.strength += 5
          else if (benchRatio >= 1.25) fitnessScores.strength += 4
          else if (benchRatio >= 1.0) fitnessScores.strength += 3
          else if (benchRatio >= 0.75) fitnessScores.strength += 2
          else fitnessScores.strength += 1
        } else {
          if (benchRatio >= 1.1) fitnessScores.strength += 5
          else if (benchRatio >= 0.9) fitnessScores.strength += 4
          else if (benchRatio >= 0.7) fitnessScores.strength += 3
          else if (benchRatio >= 0.5) fitnessScores.strength += 2
          else fitnessScores.strength += 1
        }
      }

      // Puntuación cardiovascular (10 puntos posibles)
      // Frecuencia cardíaca en reposo
      if (assessmentData.restingHeartRate <= 50) fitnessScores.cardio += 5
      else if (assessmentData.restingHeartRate <= 60) fitnessScores.cardio += 4
      else if (assessmentData.restingHeartRate <= 70) fitnessScores.cardio += 3
      else if (assessmentData.restingHeartRate <= 80) fitnessScores.cardio += 2
      else fitnessScores.cardio += 1

      // VO2 Max estimado
      if (assessmentData.vo2MaxEstimate) {
        if (assessmentData.gender === "male") {
          if (assessmentData.vo2MaxEstimate >= 50) fitnessScores.cardio += 5
          else if (assessmentData.vo2MaxEstimate >= 45) fitnessScores.cardio += 4
          else if (assessmentData.vo2MaxEstimate >= 40) fitnessScores.cardio += 3
          else if (assessmentData.vo2MaxEstimate >= 35) fitnessScores.cardio += 2
          else fitnessScores.cardio += 1
        } else {
          if (assessmentData.vo2MaxEstimate >= 45) fitnessScores.cardio += 5
          else if (assessmentData.vo2MaxEstimate >= 40) fitnessScores.cardio += 4
          else if (assessmentData.vo2MaxEstimate >= 35) fitnessScores.cardio += 3
          else if (assessmentData.vo2MaxEstimate >= 30) fitnessScores.cardio += 2
          else fitnessScores.cardio += 1
        }
      }

      // Puntuación de movilidad (15 puntos posibles)
      if (assessmentData.sitAndReach) {
        if (assessmentData.sitAndReach >= 15) fitnessScores.mobility += 5
        else if (assessmentData.sitAndReach >= 10) fitnessScores.mobility += 4
        else if (assessmentData.sitAndReach >= 5) fitnessScores.mobility += 3
        else if (assessmentData.sitAndReach >= 0) fitnessScores.mobility += 2
        else fitnessScores.mobility += 1
      }

      if (assessmentData.shoulderMobility) {
        if (assessmentData.shoulderMobility >= 5) fitnessScores.mobility += 5
        else if (assessmentData.shoulderMobility >= 4) fitnessScores.mobility += 4
        else if (assessmentData.shoulderMobility >= 3) fitnessScores.mobility += 3
        else if (assessmentData.shoulderMobility >= 2) fitnessScores.mobility += 2
        else fitnessScores.mobility += 1
      }

      if (assessmentData.ankleFlexibility) {
        if (assessmentData.ankleFlexibility >= 5) fitnessScores.mobility += 5
        else if (assessmentData.ankleFlexibility >= 4) fitnessScores.mobility += 4
        else if (assessmentData.ankleFlexibility >= 3) fitnessScores.mobility += 3
        else if (assessmentData.ankleFlexibility >= 2) fitnessScores.mobility += 2
        else fitnessScores.mobility += 1
      }

      // Puntuación de composición corporal (10 puntos posibles)
      if (assessmentData.bodyFatPercentage) {
        if (assessmentData.gender === "male") {
          if (assessmentData.bodyFatPercentage <= 12) fitnessScores.bodyComp += 5
          else if (assessmentData.bodyFatPercentage <= 15) fitnessScores.bodyComp += 4
          else if (assessmentData.bodyFatPercentage <= 20) fitnessScores.bodyComp += 3
          else if (assessmentData.bodyFatPercentage <= 25) fitnessScores.bodyComp += 2
          else fitnessScores.bodyComp += 1
        } else {
          if (assessmentData.bodyFatPercentage <= 18) fitnessScores.bodyComp += 5
          else if (assessmentData.bodyFatPercentage <= 22) fitnessScores.bodyComp += 4
          else if (assessmentData.bodyFatPercentage <= 26) fitnessScores.bodyComp += 3
          else if (assessmentData.bodyFatPercentage <= 30) fitnessScores.bodyComp += 2
          else fitnessScores.bodyComp += 1
        }
      }

      // Índice cintura-cadera
      if (assessmentData.waistCircumference && assessmentData.hipCircumference) {
        const whrRatio = assessmentData.waistCircumference / assessmentData.hipCircumference
        if (assessmentData.gender === "male") {
          if (whrRatio <= 0.85) fitnessScores.bodyComp += 5
          else if (whrRatio <= 0.9) fitnessScores.bodyComp += 4
          else if (whrRatio <= 0.95) fitnessScores.bodyComp += 3
          else if (whrRatio <= 1.0) fitnessScores.bodyComp += 2
          else fitnessScores.bodyComp += 1
        } else {
          if (whrRatio <= 0.75) fitnessScores.bodyComp += 5
          else if (whrRatio <= 0.8) fitnessScores.bodyComp += 4
          else if (whrRatio <= 0.85) fitnessScores.bodyComp += 3
          else if (whrRatio <= 0.9) fitnessScores.bodyComp += 2
          else fitnessScores.bodyComp += 1
        }
      }

      // Puntuación de recuperación (10 puntos posibles)
      if (assessmentData.sleepQuality) {
        if (assessmentData.sleepQuality >= 9) fitnessScores.recovery += 5
        else if (assessmentData.sleepQuality >= 7) fitnessScores.recovery += 4
        else if (assessmentData.sleepQuality >= 5) fitnessScores.recovery += 3
        else if (assessmentData.sleepQuality >= 3) fitnessScores.recovery += 2
        else fitnessScores.recovery += 1
      }

      if (assessmentData.stressLevel) {
        if (assessmentData.stressLevel <= 2) fitnessScores.recovery += 5
        else if (assessmentData.stressLevel <= 4) fitnessScores.recovery += 4
        else if (assessmentData.stressLevel <= 6) fitnessScores.recovery += 3
        else if (assessmentData.stressLevel <= 8) fitnessScores.recovery += 2
        else fitnessScores.recovery += 1
      }

      // Calcular puntuación total y nivel de condición física
      const totalPossiblePoints = 70 // Suma de todos los puntos posibles
      const totalPoints =
        fitnessScores.strength +
        fitnessScores.cardio +
        fitnessScores.mobility +
        fitnessScores.bodyComp +
        fitnessScores.recovery

      // Nivel de condición física (1-5)
      const fitnessLevel = Math.min(5, Math.max(1, Math.round((totalPoints / totalPossiblePoints) * 5)))

      // Guardar en Supabase
      const { error } = await supabase
        .from('fitness_assessments')
        .upsert({
          user_id: userId,
          // Datos básicos
          height: assessmentData.height,
          weight: assessmentData.weight,
          age: assessmentData.age,
          gender: assessmentData.gender,
          activity_level: assessmentData.activityLevel,

          // Composición corporal
          body_fat_percentage: assessmentData.bodyFatPercentage,
          waist_circumference: assessmentData.waistCircumference,
          hip_circumference: assessmentData.hipCircumference,
          chest_circumference: assessmentData.chestCircumference,
          arm_circumference: assessmentData.armCircumference,
          thigh_circumference: assessmentData.thighCircumference,

          // Pruebas de fuerza
          push_ups: assessmentData.pushUps,
          squats: assessmentData.squats,
          plank_time: assessmentData.plankTime,
          pull_ups: assessmentData.pullUps,
          bench_press_max: assessmentData.benchPressMax,
          squat_max: assessmentData.squatMax,
          deadlift_max: assessmentData.deadliftMax,

          // Métricas cardiovasculares
          resting_heart_rate: assessmentData.restingHeartRate,
          vo2_max_estimate: assessmentData.vo2MaxEstimate,

          // Movilidad y flexibilidad
          sit_and_reach: assessmentData.sitAndReach,
          shoulder_mobility: assessmentData.shoulderMobility,
          ankle_flexibility: assessmentData.ankleFlexibility,

          // Historial médico y lesiones
          injuries: assessmentData.injuries,
          medical_conditions: assessmentData.medicalConditions,

          // Hábitos nutricionales
          meals_per_day: assessmentData.mealsPerDay,
          water_intake: assessmentData.waterIntake,
          diet_type: assessmentData.dietType,
          food_allergies: assessmentData.foodAllergies,

          // Estrés y recuperación
          stress_level: assessmentData.stressLevel,
          sleep_quality: assessmentData.sleepQuality,
          sleep_hours: assessmentData.sleepHours,

          // Objetivos específicos
          primary_goal: assessmentData.primaryGoal,
          secondary_goal: assessmentData.secondaryGoal,
          time_commitment: assessmentData.timeCommitment,

          // Métricas calculadas
          bmi: bmi,
          fitness_level: fitnessLevel,
          fitness_scores: fitnessScores,
          assessment_date: new Date().toISOString(),
        })

      if (error) {
        console.error("Error al guardar evaluación:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar la evaluación de condición física",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Evaluación completada",
        description: "Tu evaluación de condición física ha sido guardada correctamente"
      })

      // Llamar a la función de completado
      onComplete()

    } catch (error) {
      console.error("Error al guardar evaluación:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card organic={true} className="p-6">
      <OrganicSection title={`Evaluación de condición física - ${getStepTitle()}`}>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Esta evaluación nos ayudará a personalizar tu plan de entrenamiento y establecer una línea base para medir tu progreso.
        </p>

        {/* Indicador de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Paso 1: Datos básicos */}
        {step === 1 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Altura (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={assessmentData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center">
                    <Scale className="h-4 w-4 mr-2 text-gray-500" />
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={assessmentData.weight}
                    onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-gray-500" />
                    Edad
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={assessmentData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-gray-500" />
                    Género
                  </Label>
                  <RadioGroup
                    value={assessmentData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
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
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                  Nivel de actividad
                </Label>
                <RadioGroup
                  value={assessmentData.activityLevel}
                  onValueChange={(value) => handleInputChange('activityLevel', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="sedentary" id="sedentary" />
                    <Label htmlFor="sedentary" className="flex-1 cursor-pointer">
                      <div className="font-medium">Sedentario</div>
                      <div className="text-sm text-gray-500">Poco o ningún ejercicio</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex-1 cursor-pointer">
                      <div className="font-medium">Ligero</div>
                      <div className="text-sm text-gray-500">Ejercicio ligero 1-3 días/semana</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                      <div className="font-medium">Moderado</div>
                      <div className="text-sm text-gray-500">Ejercicio moderado 3-5 días/semana</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active" className="flex-1 cursor-pointer">
                      <div className="font-medium">Activo</div>
                      <div className="text-sm text-gray-500">Ejercicio intenso 6-7 días/semana</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 2: Composición corporal */}
        {step === 2 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Medidas corporales</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Estas medidas nos ayudarán a personalizar tu plan y hacer un seguimiento preciso de tu progreso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyFatPercentage" className="flex items-center">
                  <Scale className="h-4 w-4 mr-2 text-gray-500" />
                  Porcentaje de grasa corporal (%)
                </Label>
                <Input
                  id="bodyFatPercentage"
                  type="number"
                  value={assessmentData.bodyFatPercentage}
                  onChange={(e) => handleInputChange('bodyFatPercentage', parseFloat(e.target.value))}
                  className="rounded-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si no lo conoces con exactitud, puedes dejar el valor predeterminado o usar una estimación.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waistCircumference" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Circunferencia de cintura (cm)
                  </Label>
                  <Input
                    id="waistCircumference"
                    type="number"
                    value={assessmentData.waistCircumference}
                    onChange={(e) => handleInputChange('waistCircumference', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hipCircumference" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Circunferencia de cadera (cm)
                  </Label>
                  <Input
                    id="hipCircumference"
                    type="number"
                    value={assessmentData.hipCircumference}
                    onChange={(e) => handleInputChange('hipCircumference', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chestCircumference" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Pecho (cm)
                  </Label>
                  <Input
                    id="chestCircumference"
                    type="number"
                    value={assessmentData.chestCircumference}
                    onChange={(e) => handleInputChange('chestCircumference', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="armCircumference" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Brazo (cm)
                  </Label>
                  <Input
                    id="armCircumference"
                    type="number"
                    value={assessmentData.armCircumference}
                    onChange={(e) => handleInputChange('armCircumference', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighCircumference" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Muslo (cm)
                  </Label>
                  <Input
                    id="thighCircumference"
                    type="number"
                    value={assessmentData.thighCircumference}
                    onChange={(e) => handleInputChange('thighCircumference', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Estas medidas nos permitirán calcular índices importantes como la relación cintura-cadera y hacer un seguimiento preciso de los cambios en tu composición corporal a lo largo del tiempo.
                </p>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 3: Pruebas de fuerza */}
        {step === 3 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Pruebas de fuerza y resistencia muscular</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Estas pruebas nos ayudarán a evaluar tu nivel de fuerza actual y diseñar un programa de entrenamiento adecuado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pushUps" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Flexiones (máx. repeticiones)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('pushUps', Math.max(0, assessmentData.pushUps - 1))}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{assessmentData.pushUps}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('pushUps', assessmentData.pushUps + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pullUps" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Dominadas (máx. repeticiones)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('pullUps', Math.max(0, assessmentData.pullUps! - 1))}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{assessmentData.pullUps}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('pullUps', (assessmentData.pullUps || 0) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="squats" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Sentadillas (máx. repeticiones)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('squats', Math.max(0, assessmentData.squats - 1))}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{assessmentData.squats}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('squats', assessmentData.squats + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plankTime" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Plancha (segundos)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('plankTime', Math.max(0, assessmentData.plankTime - 5))}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{assessmentData.plankTime}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('plankTime', assessmentData.plankTime + 5)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Fuerza máxima (opcional)</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Si conoces tus máximos en los siguientes ejercicios, indícalos. Si no, puedes dejar los valores predeterminados o estimarlos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="benchPressMax" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Press banca (kg)
                  </Label>
                  <Input
                    id="benchPressMax"
                    type="number"
                    value={assessmentData.benchPressMax}
                    onChange={(e) => handleInputChange('benchPressMax', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squatMax" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Sentadilla (kg)
                  </Label>
                  <Input
                    id="squatMax"
                    type="number"
                    value={assessmentData.squatMax}
                    onChange={(e) => handleInputChange('squatMax', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadliftMax" className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    Peso muerto (kg)
                  </Label>
                  <Input
                    id="deadliftMax"
                    type="number"
                    value={assessmentData.deadliftMax}
                    onChange={(e) => handleInputChange('deadliftMax', parseFloat(e.target.value))}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Estos datos nos permitirán calcular tu nivel de fuerza relativa y diseñar un programa de entrenamiento progresivo adaptado a tu nivel actual.
                </p>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 4: Pruebas cardiovasculares */}
        {step === 4 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Evaluación cardiovascular</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Estas métricas nos ayudarán a evaluar tu salud cardiovascular y diseñar un programa de entrenamiento cardio adecuado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restingHeartRate" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-gray-500" />
                  Frecuencia cardíaca en reposo (lpm)
                </Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('restingHeartRate', Math.max(40, assessmentData.restingHeartRate - 1))}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{assessmentData.restingHeartRate}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('restingHeartRate', Math.min(120, assessmentData.restingHeartRate + 1))}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mide tu pulso en reposo durante 60 segundos, preferiblemente por la mañana antes de levantarte.
                </p>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="vo2MaxEstimate" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-gray-500" />
                  VO2 Max estimado (ml/kg/min)
                </Label>
                <Input
                  id="vo2MaxEstimate"
                  type="number"
                  value={assessmentData.vo2MaxEstimate}
                  onChange={(e) => handleInputChange('vo2MaxEstimate', parseFloat(e.target.value))}
                  className="rounded-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si no conoces tu VO2 Max, puedes dejar el valor predeterminado o usar una estimación basada en tu nivel de actividad.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mt-6 mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Test de Cooper (opcional)</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Si has realizado el test de Cooper (correr durante 12 minutos la máxima distancia posible), indica la distancia recorrida.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooperTest" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-gray-500" />
                  Distancia recorrida (metros)
                </Label>
                <div className="flex items-center">
                  <Input
                    id="cooperTest"
                    type="number"
                    placeholder="2000"
                    className="rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este campo es opcional. Si no has realizado el test, puedes dejarlo en blanco.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mt-6">
                <p className="text-sm text-green-700 dark:text-green-300">
                  La capacidad cardiovascular es un indicador clave de la salud general y el rendimiento físico. Estos datos nos ayudarán a diseñar un programa de entrenamiento cardio personalizado.
                </p>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 5: Movilidad y flexibilidad */}
        {step === 5 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Evaluación de movilidad y flexibilidad</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Estas pruebas nos ayudarán a identificar limitaciones de movilidad y áreas que requieren trabajo específico.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitAndReach" className="flex items-center">
                  <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                  Test de flexión de tronco (cm)
                </Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('sitAndReach', Math.max(-20, (assessmentData.sitAndReach || 0) - 1))}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{assessmentData.sitAndReach}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('sitAndReach', Math.min(30, (assessmentData.sitAndReach || 0) + 1))}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sentado con las piernas extendidas, alcanza lo más lejos posible. 0 = llegar a los pies, valores positivos = más allá de los pies.
                </p>
              </div>

              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Evaluación de movilidad articular</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Califica tu movilidad en una escala de 1 a 5, donde 1 es muy limitada y 5 es excelente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shoulderMobility" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Movilidad de hombros
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('shoulderMobility', Math.max(1, (assessmentData.shoulderMobility || 3) - 1))}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{assessmentData.shoulderMobility}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('shoulderMobility', Math.min(5, (assessmentData.shoulderMobility || 3) + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ankleFlexibility" className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    Flexibilidad de tobillos
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('ankleFlexibility', Math.max(1, (assessmentData.ankleFlexibility || 3) - 1))}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{assessmentData.ankleFlexibility}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleInputChange('ankleFlexibility', Math.min(5, (assessmentData.ankleFlexibility || 3) + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Áreas con limitación de movilidad (opcional)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="mobility_hip" className="rounded" />
                    <Label htmlFor="mobility_hip" className="cursor-pointer">Cadera</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="mobility_thoracic" className="rounded" />
                    <Label htmlFor="mobility_thoracic" className="cursor-pointer">Columna torácica</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="mobility_hamstring" className="rounded" />
                    <Label htmlFor="mobility_hamstring" className="cursor-pointer">Isquiotibiales</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="mobility_ankle" className="rounded" />
                    <Label htmlFor="mobility_ankle" className="cursor-pointer">Tobillos</Label>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mt-6">
                <p className="text-sm text-green-700 dark:text-green-300">
                  La movilidad y flexibilidad son fundamentales para prevenir lesiones y optimizar el rendimiento. Estos datos nos ayudarán a incluir ejercicios específicos de movilidad en tu programa.
                </p>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 6: Historial médico */}
        {step === 6 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Historial médico</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Esta información es confidencial y nos ayudará a diseñar un programa seguro y efectivo para ti.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Lesiones previas o actuales
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="injury_shoulder" className="rounded" />
                    <Label htmlFor="injury_shoulder" className="cursor-pointer">Hombro</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="injury_knee" className="rounded" />
                    <Label htmlFor="injury_knee" className="cursor-pointer">Rodilla</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="injury_back" className="rounded" />
                    <Label htmlFor="injury_back" className="cursor-pointer">Espalda</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="injury_ankle" className="rounded" />
                    <Label htmlFor="injury_ankle" className="cursor-pointer">Tobillo</Label>
                  </div>
                </div>
                <Input
                  placeholder="Otras lesiones o detalles adicionales"
                  className="mt-2 rounded-full"
                />
              </div>

              <div className="mt-6 space-y-2">
                <Label className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Condiciones médicas
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="condition_hypertension" className="rounded" />
                    <Label htmlFor="condition_hypertension" className="cursor-pointer">Hipertensión</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="condition_diabetes" className="rounded" />
                    <Label htmlFor="condition_diabetes" className="cursor-pointer">Diabetes</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="condition_asthma" className="rounded" />
                    <Label htmlFor="condition_asthma" className="cursor-pointer">Asma</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <input type="checkbox" id="condition_heart" className="rounded" />
                    <Label htmlFor="condition_heart" className="cursor-pointer">Cardiopatía</Label>
                  </div>
                </div>
                <Input
                  placeholder="Otras condiciones o detalles adicionales"
                  className="mt-2 rounded-full"
                />
              </div>

              <div className="mt-6 space-y-2">
                <Label className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  ¿Tomas algún medicamento regularmente?
                </Label>
                <RadioGroup
                  value="no"
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="meds_yes" />
                    <Label htmlFor="meds_yes">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="meds_no" />
                    <Label htmlFor="meds_no">No</Label>
                  </div>
                </RadioGroup>
                <Input
                  placeholder="Si tomas medicamentos, especifica cuáles"
                  className="mt-2 rounded-full"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mt-6">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Importante:</strong> Si tienes alguna condición médica grave, te recomendamos consultar con tu médico antes de comenzar cualquier programa de entrenamiento.
                </p>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 7: Hábitos nutricionales y objetivos */}
        {step === 7 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Hábitos nutricionales</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Esta información nos ayudará a personalizar tus recomendaciones nutricionales.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealsPerDay" className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Comidas por día
                </Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('mealsPerDay', Math.max(1, (assessmentData.mealsPerDay || 3) - 1))}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{assessmentData.mealsPerDay}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('mealsPerDay', Math.min(8, (assessmentData.mealsPerDay || 3) + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="waterIntake" className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Consumo diario de agua (ml)
                </Label>
                <Input
                  id="waterIntake"
                  type="number"
                  value={assessmentData.waterIntake}
                  onChange={(e) => handleInputChange('waterIntake', parseInt(e.target.value))}
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2 mt-6">
                <Label className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Tipo de dieta
                </Label>
                <RadioGroup
                  value={assessmentData.dietType}
                  onValueChange={(value) => handleInputChange('dietType', value)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="balanced" id="diet_balanced" />
                    <Label htmlFor="diet_balanced" className="cursor-pointer">Equilibrada</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="vegetarian" id="diet_vegetarian" />
                    <Label htmlFor="diet_vegetarian" className="cursor-pointer">Vegetariana</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="vegan" id="diet_vegan" />
                    <Label htmlFor="diet_vegan" className="cursor-pointer">Vegana</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="keto" id="diet_keto" />
                    <Label htmlFor="diet_keto" className="cursor-pointer">Keto/Baja en carbos</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Objetivos</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Define tus objetivos principales para personalizar tu plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Objetivo principal
                </Label>
                <RadioGroup
                  value={assessmentData.primaryGoal}
                  onValueChange={(value) => handleInputChange('primaryGoal', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="lose_weight" id="goal_lose_weight" />
                    <Label htmlFor="goal_lose_weight" className="flex-1 cursor-pointer">
                      <div className="font-medium">Pérdida de peso</div>
                      <div className="text-sm text-gray-500">Reducir grasa corporal y mejorar composición corporal</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="gain_muscle" id="goal_gain_muscle" />
                    <Label htmlFor="goal_gain_muscle" className="flex-1 cursor-pointer">
                      <div className="font-medium">Ganancia muscular</div>
                      <div className="text-sm text-gray-500">Aumentar masa muscular y fuerza</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="improve_fitness" id="goal_improve_fitness" />
                    <Label htmlFor="goal_improve_fitness" className="flex-1 cursor-pointer">
                      <div className="font-medium">Mejorar condición física</div>
                      <div className="text-sm text-gray-500">Aumentar resistencia, fuerza y salud general</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="timeCommitment" className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Días por semana disponibles para entrenar
                </Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('timeCommitment', Math.max(1, (assessmentData.timeCommitment || 3) - 1))}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{assessmentData.timeCommitment}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleInputChange('timeCommitment', Math.min(7, (assessmentData.timeCommitment || 3) + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </OrganicElement>
        )}

        {/* Paso 8: Resumen de evaluación */}
        {step === 8 && (
          <OrganicElement type="fade">
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-6">
                <div className="flex">
                  <BarChart className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-700 dark:text-green-300">Resumen de evaluación</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Revisa tus resultados antes de finalizar la evaluación.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Altura</p>
                  <p className="font-medium">{assessmentData.height} cm</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Peso</p>
                  <p className="font-medium">{assessmentData.weight} kg</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">% Grasa corporal</p>
                  <p className="font-medium">{assessmentData.bodyFatPercentage}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Índice cintura-cadera</p>
                  <p className="font-medium">{assessmentData.waistCircumference && assessmentData.hipCircumference ?
                    (assessmentData.waistCircumference / assessmentData.hipCircumference).toFixed(2) : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Flexiones</p>
                  <p className="font-medium">{assessmentData.pushUps}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Sentadillas</p>
                  <p className="font-medium">{assessmentData.squats}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Frecuencia cardíaca</p>
                  <p className="font-medium">{assessmentData.restingHeartRate} lpm</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Objetivo principal</p>
                  <p className="font-medium">{assessmentData.primaryGoal === 'lose_weight' ? 'Pérdida de peso' :
                    assessmentData.primaryGoal === 'gain_muscle' ? 'Ganancia muscular' :
                    assessmentData.primaryGoal === 'improve_fitness' ? 'Mejorar condición física' :
                    assessmentData.primaryGoal}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Basado en tus resultados, crearemos un plan de entrenamiento personalizado adaptado a tu nivel de condición física y objetivos. Esta evaluación completa nos permite ofrecerte un servicio verdaderamente personalizado.
                </p>
              </div>
            </div>
          </OrganicElement>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1 || isLoading}
            className="rounded-full"
          >
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="rounded-full"
          >
            {step < totalSteps ? (
              <>
                Siguiente {step}/{totalSteps}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                Guardando...
              </>
            ) : (
              "Completar evaluación"
            )}
          </Button>
        </div>
      </OrganicSection>
    </Card>
  )
}
