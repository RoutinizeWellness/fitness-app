"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calculator, Target, TrendingUp, Zap, Scale, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FoodItem } from "@/lib/types/nutrition"

interface DetailedNutritionCalculatorProps {
  foods: Array<FoodItem & { quantity: number }>
  nutritionGoals?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  className?: string
}

interface NutritionBreakdown {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

interface MacroDistribution {
  proteinPercentage: number
  carbsPercentage: number
  fatPercentage: number
}

export function DetailedNutritionCalculator({ 
  foods, 
  nutritionGoals,
  className = "" 
}: DetailedNutritionCalculatorProps) {
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({})
  const [targetWeight, setTargetWeight] = useState<number>(70)
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate')

  // Calcular totales nutricionales
  const calculateTotals = (): NutritionBreakdown => {
    return foods.reduce((totals, food) => {
      const quantity = customQuantities[food.id] || food.quantity || 1
      
      return {
        calories: totals.calories + (food.calories * quantity),
        protein: totals.protein + (food.protein * quantity),
        carbs: totals.carbs + (food.carbs * quantity),
        fat: totals.fat + (food.fat * quantity),
        fiber: totals.fiber + ((food.fiber || 0) * quantity),
        sugar: totals.sugar + ((food.sugar || 0) * quantity),
        sodium: totals.sodium + ((food.sodium || 0) * quantity)
      }
    }, { 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      fiber: 0, 
      sugar: 0, 
      sodium: 0 
    })
  }

  // Calcular distribución de macronutrientes
  const calculateMacroDistribution = (): MacroDistribution => {
    const totals = calculateTotals()
    const totalCaloriesFromMacros = (totals.protein * 4) + (totals.carbs * 4) + (totals.fat * 9)
    
    if (totalCaloriesFromMacros === 0) {
      return { proteinPercentage: 0, carbsPercentage: 0, fatPercentage: 0 }
    }

    return {
      proteinPercentage: (totals.protein * 4 / totalCaloriesFromMacros) * 100,
      carbsPercentage: (totals.carbs * 4 / totalCaloriesFromMacros) * 100,
      fatPercentage: (totals.fat * 9 / totalCaloriesFromMacros) * 100
    }
  }

  // Calcular recomendaciones basadas en peso y actividad
  const calculateRecommendations = () => {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }

    // BMR aproximado (fórmula simplificada)
    const bmr = 88.362 + (13.397 * targetWeight) + (4.799 * 175) - (5.677 * 30) // Asumiendo altura y edad promedio
    const tdee = bmr * activityMultipliers[activityLevel]

    return {
      calories: Math.round(tdee),
      protein: Math.round(targetWeight * 1.6), // 1.6g por kg de peso corporal
      carbs: Math.round(tdee * 0.45 / 4), // 45% de calorías de carbohidratos
      fat: Math.round(tdee * 0.25 / 9) // 25% de calorías de grasas
    }
  }

  const updateQuantity = (foodId: string, quantity: number) => {
    setCustomQuantities(prev => ({
      ...prev,
      [foodId]: Math.max(0, quantity)
    }))
  }

  const totals = calculateTotals()
  const macroDistribution = calculateMacroDistribution()
  const recommendations = calculateRecommendations()
  const goals = nutritionGoals || recommendations

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage < 80) return 'bg-red-500'
    if (percentage < 95) return 'bg-yellow-500'
    if (percentage <= 110) return 'bg-green-500'
    return 'bg-orange-500'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#1B237E]">
            <Calculator className="h-5 w-5 mr-2" />
            Calculadora Nutricional Detallada
          </CardTitle>
          <CardDescription>
            Análisis completo de macronutrientes y micronutrientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="macros">Macros</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="goals">Objetivos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Resumen principal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FEA800]">
                      {Math.round(totals.calories)}
                    </div>
                    <div className="text-sm text-gray-600">Calorías</div>
                    <Progress 
                      value={(totals.calories / goals.calories) * 100} 
                      className="h-2 mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((totals.calories / goals.calories) * 100)}% del objetivo
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6767]">
                      {Math.round(totals.protein)}g
                    </div>
                    <div className="text-sm text-gray-600">Proteína</div>
                    <Progress 
                      value={(totals.protein / goals.protein) * 100} 
                      className="h-2 mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((totals.protein / goals.protein) * 100)}% del objetivo
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#B1AFE9]">
                      {Math.round(totals.carbs)}g
                    </div>
                    <div className="text-sm text-gray-600">Carbohidratos</div>
                    <Progress 
                      value={(totals.carbs / goals.carbs) * 100} 
                      className="h-2 mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((totals.carbs / goals.carbs) * 100)}% del objetivo
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#573353]">
                      {Math.round(totals.fat)}g
                    </div>
                    <div className="text-sm text-gray-600">Grasas</div>
                    <Progress 
                      value={(totals.fat / goals.fat) * 100} 
                      className="h-2 mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((totals.fat / goals.fat) * 100)}% del objetivo
                    </div>
                  </div>
                </Card>
              </div>

              {/* Distribución de macronutrientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribución de Macronutrientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Proteína</span>
                      <span className="text-sm font-medium">{Math.round(macroDistribution.proteinPercentage)}%</span>
                    </div>
                    <Progress value={macroDistribution.proteinPercentage} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carbohidratos</span>
                      <span className="text-sm font-medium">{Math.round(macroDistribution.carbsPercentage)}%</span>
                    </div>
                    <Progress value={macroDistribution.carbsPercentage} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grasas</span>
                      <span className="text-sm font-medium">{Math.round(macroDistribution.fatPercentage)}%</span>
                    </div>
                    <Progress value={macroDistribution.fatPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="macros" className="space-y-4">
              {/* Análisis detallado de macronutrientes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-[#FF6767]">Proteína</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{Math.round(totals.protein)}g</div>
                      <div className="text-sm text-gray-600">
                        {Math.round(totals.protein * 4)} kcal ({Math.round(macroDistribution.proteinPercentage)}%)
                      </div>
                      <Progress 
                        value={(totals.protein / goals.protein) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Objetivo: {goals.protein}g
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-[#B1AFE9]">Carbohidratos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{Math.round(totals.carbs)}g</div>
                      <div className="text-sm text-gray-600">
                        {Math.round(totals.carbs * 4)} kcal ({Math.round(macroDistribution.carbsPercentage)}%)
                      </div>
                      <Progress 
                        value={(totals.carbs / goals.carbs) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Objetivo: {goals.carbs}g
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-[#573353]">Grasas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{Math.round(totals.fat)}g</div>
                      <div className="text-sm text-gray-600">
                        {Math.round(totals.fat * 9)} kcal ({Math.round(macroDistribution.fatPercentage)}%)
                      </div>
                      <Progress 
                        value={(totals.fat / goals.fat) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Objetivo: {goals.fat}g
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Ajuste de cantidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ajustar Cantidades</CardTitle>
                  <CardDescription>
                    Modifica las cantidades para ver cómo afectan los totales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {foods.map(food => (
                      <div key={food.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{food.name}</h4>
                          <p className="text-xs text-gray-500">
                            {food.calories} kcal por {food.servingSize}{food.servingUnit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`quantity-${food.id}`} className="text-xs">
                            Cantidad:
                          </Label>
                          <Input
                            id={`quantity-${food.id}`}
                            type="number"
                            min="0"
                            step="0.1"
                            value={customQuantities[food.id] || food.quantity || 1}
                            onChange={(e) => updateQuantity(food.id, parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-xs text-gray-500">
                            {food.servingUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Micronutrientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Micronutrientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#1B237E]">
                        {Math.round(totals.fiber)}g
                      </div>
                      <div className="text-xs text-gray-600">Fibra</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#FEA800]">
                        {Math.round(totals.sugar)}g
                      </div>
                      <div className="text-xs text-gray-600">Azúcar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#FF6767]">
                        {Math.round(totals.sodium)}mg
                      </div>
                      <div className="text-xs text-gray-600">Sodio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              {/* Configuración de objetivos personalizados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Configuración Personal</CardTitle>
                  <CardDescription>
                    Ajusta tus datos para obtener recomendaciones personalizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso objetivo (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 70)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity">Nivel de actividad</Label>
                      <select
                        id="activity"
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value as any)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="sedentary">Sedentario</option>
                        <option value="light">Actividad ligera</option>
                        <option value="moderate">Actividad moderada</option>
                        <option value="active">Activo</option>
                        <option value="very_active">Muy activo</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendaciones calculadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recomendaciones Calculadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#FEA800]">
                        {recommendations.calories}
                      </div>
                      <div className="text-xs text-gray-600">Calorías/día</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#FF6767]">
                        {recommendations.protein}g
                      </div>
                      <div className="text-xs text-gray-600">Proteína/día</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#B1AFE9]">
                        {recommendations.carbs}g
                      </div>
                      <div className="text-xs text-gray-600">Carbos/día</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#573353]">
                        {recommendations.fat}g
                      </div>
                      <div className="text-xs text-gray-600">Grasas/día</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
