"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Target, Droplets, TrendingUp, Calendar, Search, Filter, Utensils, Apple } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useNutrition } from "@/contexts/nutrition-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { FoodCategoriesSection } from "@/components/nutrition/food-categories-section"
import { IntegratedRecipesSection } from "@/components/nutrition/integrated-recipes-section"
import { AlternativeFoodSelector } from "@/components/nutrition/alternative-food-selector"
import { DetailedNutritionCalculator } from "@/components/nutrition/detailed-nutrition-calculator"
import { UnifiedMealPlanner } from "@/components/nutrition/unified-meal-planner"
import { DietaryRestrictionsManager } from "@/components/nutrition/dietary-restrictions-manager"
import { FoodItem } from "@/lib/types/nutrition"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface NutritionDashboardProps {
  className?: string
}

export function NutritionDashboard({ className = "" }: NutritionDashboardProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const {
    nutritionGoals,
    dailyStats,
    waterLogs,
    isLoadingGoals,
    isLoadingDailyStats,
    isLoadingWaterLogs,
    loadNutritionGoals,
    loadDailyStats,
    loadWaterLogs,
    addWaterEntryItem
  } = useNutrition()

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [waterAmount, setWaterAmount] = useState(250)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [isAlternativeSelectorOpen, setIsAlternativeSelectorOpen] = useState(false)
  const [foodForAlternatives, setFoodForAlternatives] = useState<FoodItem | null>(null)
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([])
  const [mealPlans, setMealPlans] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadNutritionGoals()
      loadDailyStats(selectedDate)
      loadWaterLogs(selectedDate)
    }
  }, [user, selectedDate])

  const handleAddWater = async () => {
    if (!user) return

    try {
      await addWaterEntryItem({
        user_id: user.id,
        date: selectedDate,
        amount: waterAmount
      })

      toast({
        title: "Agua registrada",
        description: `Se han añadido ${waterAmount}ml a tu registro diario`,
        variant: "default"
      })

      // Recargar datos
      loadWaterLogs(selectedDate)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el agua",
        variant: "destructive"
      })
    }
  }

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food)
    toast({
      title: "Alimento seleccionado",
      description: `${food.name} - ${food.calories} kcal por ${food.servingSize}${food.servingUnit}`,
      variant: "default"
    })

    // Aquí se podría abrir un modal para configurar la cantidad y añadir al registro
    // Por ahora solo mostramos la selección
  }

  const handleFindAlternatives = (food: FoodItem) => {
    setFoodForAlternatives(food)
    setIsAlternativeSelectorOpen(true)
  }

  const handleAlternativeSelect = (food: FoodItem) => {
    setSelectedFood(food)
    toast({
      title: "Alternativa seleccionada",
      description: `${food.name} - ${food.calories} kcal por ${food.servingSize}${food.servingUnit}`,
      variant: "default"
    })
  }

  const handleRecipeSelect = (recipe: any) => {
    toast({
      title: "Receta seleccionada",
      description: `${recipe.name} - ${recipe.calories} kcal por porción`,
      variant: "default"
    })
  }

  const handleRestrictionsChange = (restrictions: any[]) => {
    setDietaryRestrictions(restrictions)
    toast({
      title: "Restricciones actualizadas",
      description: `${restrictions.length} restricciones dietéticas configuradas`,
      variant: "default"
    })
  }

  const handleMealPlanChange = (plans: any[]) => {
    setMealPlans(plans)
    toast({
      title: "Plan de comidas actualizado",
      description: `${plans.length} comidas planificadas`,
      variant: "default"
    })
  }

  const getTotalWater = () => {
    return waterLogs?.reduce((total, log) => total + log.amount, 0) || 0
  }

  const getWaterProgress = () => {
    const total = getTotalWater()
    const goal = nutritionGoals?.water || 2000
    return Math.min((total / goal) * 100, 100)
  }

  const getCalorieProgress = () => {
    const consumed = dailyStats?.total_calories || 0
    const goal = nutritionGoals?.calories || 2000
    return Math.min((consumed / goal) * 100, 100)
  }

  const getProteinProgress = () => {
    const consumed = dailyStats?.total_protein || 0
    const goal = nutritionGoals?.protein || 150
    return Math.min((consumed / goal) * 100, 100)
  }

  const getCarbsProgress = () => {
    const consumed = dailyStats?.total_carbs || 0
    const goal = nutritionGoals?.carbs || 200
    return Math.min((consumed / goal) * 100, 100)
  }

  const getFatProgress = () => {
    const consumed = dailyStats?.total_fat || 0
    const goal = nutritionGoals?.fat || 70
    return Math.min((consumed / goal) * 100, 100)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header mejorado */}
      <Card className="bg-gradient-to-r from-[#1B237E]/5 to-[#FEA800]/5 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1B237E] font-manrope">
                Dashboard de Nutrición
              </h1>
              <p className="text-sm text-[#573353] mt-1">
                {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto border-[#1B237E]/20"
              />
              <SafeClientButton variant="accent" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Comida
              </SafeClientButton>
            </div>
          </div>

          {/* Resumen rápido de progreso */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-xl border border-[#FEA800]/10">
              <div className="text-lg font-bold text-[#FEA800] mb-1">
                {Math.round(getCalorieProgress())}%
              </div>
              <div className="text-xs text-gray-600">Calorías</div>
              <div className="text-xs text-gray-500">
                {Math.round(dailyStats?.total_calories || 0)} / {nutritionGoals?.calories || 2000}
              </div>
            </div>

            <div className="text-center p-3 bg-white/60 rounded-xl border border-[#FF6767]/10">
              <div className="text-lg font-bold text-[#FF6767] mb-1">
                {Math.round(getProteinProgress())}%
              </div>
              <div className="text-xs text-gray-600">Proteína</div>
              <div className="text-xs text-gray-500">
                {Math.round(dailyStats?.total_protein || 0)}g / {nutritionGoals?.protein || 150}g
              </div>
            </div>

            <div className="text-center p-3 bg-white/60 rounded-xl border border-[#B1AFE9]/10">
              <div className="text-lg font-bold text-[#B1AFE9] mb-1">
                {Math.round(getCarbsProgress())}%
              </div>
              <div className="text-xs text-gray-600">Carbohidratos</div>
              <div className="text-xs text-gray-500">
                {Math.round(dailyStats?.total_carbs || 0)}g / {nutritionGoals?.carbs || 200}g
              </div>
            </div>

            <div className="text-center p-3 bg-white/60 rounded-xl border border-blue-500/10">
              <div className="text-lg font-bold text-blue-600 mb-1">
                {Math.round(getWaterProgress())}%
              </div>
              <div className="text-xs text-gray-600">Hidratación</div>
              <div className="text-xs text-gray-500">
                {getTotalWater()}ml / {nutritionGoals?.water || 2000}ml
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calorías</p>
                <p className="text-2xl font-bold text-[#1B237E]">
                  {dailyStats?.total_calories || 0}
                </p>
                <p className="text-xs text-gray-500">
                  de {nutritionGoals?.calories || 2000}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FEA800]/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-[#FEA800]" />
              </div>
            </div>
            <Progress value={getCalorieProgress()} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Proteína</p>
                <p className="text-2xl font-bold text-[#1B237E]">
                  {Math.round(dailyStats?.total_protein || 0)}g
                </p>
                <p className="text-xs text-gray-500">
                  de {nutritionGoals?.protein || 150}g
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FF6767]/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#FF6767]" />
              </div>
            </div>
            <Progress value={getProteinProgress()} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Carbohidratos</p>
                <p className="text-2xl font-bold text-[#1B237E]">
                  {Math.round(dailyStats?.total_carbs || 0)}g
                </p>
                <p className="text-xs text-gray-500">
                  de {nutritionGoals?.carbs || 200}g
                </p>
              </div>
              <div className="w-12 h-12 bg-[#B1AFE9]/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#B1AFE9]" />
              </div>
            </div>
            <Progress value={getCarbsProgress()} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agua</p>
                <p className="text-2xl font-bold text-[#1B237E]">
                  {getTotalWater()}ml
                </p>
                <p className="text-xs text-gray-500">
                  de {nutritionGoals?.water || 2000}ml
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={getWaterProgress()} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="planner">Planificador</TabsTrigger>
          <TabsTrigger value="restrictions">Restricciones</TabsTrigger>
          <TabsTrigger value="water">Hidratación</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Macronutrientes */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Macronutrientes</CardTitle>
                <CardDescription>
                  Progreso hacia tus objetivos diarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Proteína</span>
                    <span>{Math.round(dailyStats?.total_protein || 0)}g / {nutritionGoals?.protein || 150}g</span>
                  </div>
                  <Progress value={getProteinProgress()} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carbohidratos</span>
                    <span>{Math.round(dailyStats?.total_carbs || 0)}g / {nutritionGoals?.carbs || 200}g</span>
                  </div>
                  <Progress value={getCarbsProgress()} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Grasas</span>
                    <span>{Math.round(dailyStats?.total_fat || 0)}g / {nutritionGoals?.fat || 70}g</span>
                  </div>
                  <Progress value={getFatProgress()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Registro de Agua Rápido */}
            <Card>
              <CardHeader>
                <CardTitle>Registro de Agua</CardTitle>
                <CardDescription>
                  Mantente hidratado durante el día
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(Number(e.target.value))}
                    placeholder="Cantidad en ml"
                    className="flex-1"
                  />
                  <SafeClientButton onClick={handleAddWater} variant="accent">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir
                  </SafeClientButton>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 750].map((amount) => (
                    <SafeClientButton
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterAmount(amount)}
                    >
                      {amount}ml
                    </SafeClientButton>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {getTotalWater()}ml
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.round(getWaterProgress())}% del objetivo diario
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categorías de Alimentos Integradas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Apple className="h-5 w-5 mr-2 text-[#FEA800]" />
                Alimentos Españoles
              </CardTitle>
              <CardDescription>
                Explora nuestra base de datos de alimentos locales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FoodCategoriesSection onFoodSelect={handleFoodSelect} />

              {selectedFood && (
                <div className="mt-4 p-3 bg-[#FEA800]/10 rounded-lg border border-[#FEA800]/20">
                  <h4 className="font-medium text-[#1B237E] text-sm mb-1">
                    Último alimento seleccionado:
                  </h4>
                  <p className="text-sm text-[#573353]">
                    {selectedFood.name} - {selectedFood.calories} kcal
                  </p>
                  <div className="flex gap-2 mt-2">
                    <SafeClientButton variant="accent" size="sm">
                      Añadir al Registro
                    </SafeClientButton>
                    <SafeClientButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleFindAlternatives(selectedFood)}
                    >
                      Buscar Alternativas
                    </SafeClientButton>
                    <SafeClientButton
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFood(null)}
                    >
                      Limpiar
                    </SafeClientButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recetas Saludables Integradas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-[#FF6767]" />
                Recetas Saludables
              </CardTitle>
              <CardDescription>
                Descubre recetas nutritivas y deliciosas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegratedRecipesSection onRecipeSelect={handleRecipeSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planner" className="space-y-4">
          <UnifiedMealPlanner onMealPlanChange={handleMealPlanChange} />
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
          <DietaryRestrictionsManager onRestrictionsChange={handleRestrictionsChange} />
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Hidratación</CardTitle>
              <CardDescription>
                Historial de consumo de agua del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              {waterLogs && waterLogs.length > 0 ? (
                <div className="space-y-2">
                  {waterLogs.map((log, index) => (
                    <div key={log.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {format(new Date(log.created_at), "HH:mm")}
                      </span>
                      <Badge variant="outline">
                        {log.amount}ml
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No hay registros de agua para hoy
                  </p>
                  <SafeClientButton variant="accent" onClick={handleAddWater}>
                    <Droplets className="h-4 w-4 mr-2" />
                    Registrar Primer Vaso
                  </SafeClientButton>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos Nutricionales</CardTitle>
              <CardDescription>
                Configura tus metas diarias de nutrición
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nutritionGoals ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Calorías</label>
                    <Input value={nutritionGoals.calories} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proteína (g)</label>
                    <Input value={nutritionGoals.protein} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Carbohidratos (g)</label>
                    <Input value={nutritionGoals.carbs} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grasas (g)</label>
                    <Input value={nutritionGoals.fat} readOnly />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No tienes objetivos configurados
                  </p>
                  <SafeClientButton variant="accent">
                    <Target className="h-4 w-4 mr-2" />
                    Configurar Objetivos
                  </SafeClientButton>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      {foodForAlternatives && (
        <AlternativeFoodSelector
          originalFood={foodForAlternatives}
          onFoodSelect={handleAlternativeSelect}
          isOpen={isAlternativeSelectorOpen}
          onOpenChange={setIsAlternativeSelectorOpen}
        />
      )}
    </div>
  )
}
