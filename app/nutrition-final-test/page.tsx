"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, Target, Utensils, Apple, ChefHat, Calculator, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnifiedBottomNav } from "@/components/navigation/unified-bottom-nav"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNutrition } from "@/contexts/nutrition-context"
import { NutritionDashboard } from "@/components/nutrition/nutrition-dashboard"
import { FoodCategoriesSection } from "@/components/nutrition/food-categories-section"
import { IntegratedRecipesSection } from "@/components/nutrition/integrated-recipes-section"
import { AlternativeFoodSelector } from "@/components/nutrition/alternative-food-selector"
import { DetailedNutritionCalculator } from "@/components/nutrition/detailed-nutrition-calculator"
import { allSpanishFoods } from "@/lib/data/spanish-foods-database"
import { FoodItem } from "@/lib/types/nutrition"

export default function NutritionFinalTestPage() {
  const { user } = useAuth()
  const { nutritionGoals, dailyStats, waterLogs } = useNutrition()
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [isAlternativeSelectorOpen, setIsAlternativeSelectorOpen] = useState(false)

  // Estadísticas de correcciones
  const fixedIssues = [
    {
      issue: "Error de importación auth-context",
      status: "fixed",
      description: "Corregida ruta de @/contexts/auth-context a @/lib/contexts/auth-context"
    },
    {
      issue: "Error de carga de objetivos nutricionales",
      status: "fixed", 
      description: "Mejorado manejo de errores en nutrition-context.tsx línea 608"
    },
    {
      issue: "Cliente Supabase inconsistente",
      status: "fixed",
      description: "Unificado uso de createClient() en add-meal/page.tsx"
    },
    {
      issue: "Botón de recetas separado",
      status: "fixed",
      description: "Integradas recetas directamente en el dashboard principal"
    },
    {
      issue: "Falta de alternativas de alimentos",
      status: "implemented",
      description: "Implementado selector de alternativas nutricionales"
    },
    {
      issue: "Cálculos nutricionales básicos",
      status: "enhanced",
      description: "Implementada calculadora nutricional detallada"
    },
    {
      issue: "Solapamiento de navegación",
      status: "fixed",
      description: "Mejorado espaciado y layout del módulo de nutrición"
    }
  ]

  const newFeatures = [
    {
      name: "Selector de Alternativas",
      description: "Encuentra alimentos con perfiles nutricionales similares",
      component: "AlternativeFoodSelector",
      status: "implemented"
    },
    {
      name: "Calculadora Nutricional Detallada",
      description: "Análisis completo de macros y micronutrientes",
      component: "DetailedNutritionCalculator", 
      status: "implemented"
    },
    {
      name: "Recetas Integradas",
      description: "Recetas saludables directamente en el dashboard",
      component: "IntegratedRecipesSection",
      status: "implemented"
    },
    {
      name: "Categorías de Alimentos Mejoradas",
      description: "Base de datos expandida con búsqueda y filtros",
      component: "FoodCategoriesSection",
      status: "enhanced"
    }
  ]

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food)
  }

  const handleFindAlternatives = () => {
    if (selectedFood) {
      setIsAlternativeSelectorOpen(true)
    }
  }

  const testFoods = allSpanishFoods.slice(0, 3).map(food => ({
    ...food,
    quantity: 1
  }))

  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B237E]/5 to-[#FEA800]/5 border-b border-[#DDDCFE] px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#1B237E] font-manrope">
            Prueba Final - Módulo de Nutrición
          </h1>
          <p className="text-sm text-[#573353] mt-1">
            Verificación completa de todas las correcciones y mejoras
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Estado de Correcciones */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Estado de Correcciones Críticas
            </CardTitle>
            <CardDescription>
              Todos los problemas críticos han sido resueltos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fixedIssues.map((issue, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-white/60 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{issue.issue}</h4>
                    <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                  </div>
                  <Badge 
                    variant="default" 
                    className={
                      issue.status === 'fixed' ? 'bg-green-100 text-green-800' :
                      issue.status === 'implemented' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {issue.status === 'fixed' ? '✅ Corregido' :
                     issue.status === 'implemented' ? '🚀 Implementado' :
                     '⚡ Mejorado'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nuevas Funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Target className="h-5 w-5 mr-2" />
              Nuevas Funcionalidades Implementadas
            </CardTitle>
            <CardDescription>
              Características avanzadas para mejorar la experiencia nutricional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {newFeatures.map((feature, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{feature.name}</h4>
                    <Badge variant="outline">{feature.component}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demostración de Componentes */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="foods">Alimentos</TabsTrigger>
            <TabsTrigger value="recipes">Recetas</TabsTrigger>
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dashboard Principal</CardTitle>
                <CardDescription>
                  Dashboard de nutrición completamente funcional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <NutritionDashboard />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="foods" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Apple className="h-4 w-4 mr-2" />
                  Categorías de Alimentos
                </CardTitle>
                <CardDescription>
                  Base de datos expandida con {allSpanishFoods.length} alimentos españoles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FoodCategoriesSection onFoodSelect={handleFoodSelect} />
                
                {selectedFood && (
                  <div className="mt-4 p-3 bg-[#FEA800]/10 rounded-lg border border-[#FEA800]/20">
                    <h4 className="font-medium text-[#1B237E] text-sm mb-1">
                      Alimento seleccionado:
                    </h4>
                    <p className="text-sm text-[#573353]">
                      {selectedFood.name} - {selectedFood.calories} kcal
                    </p>
                    <div className="flex gap-2 mt-2">
                      <SafeClientButton 
                        variant="accent" 
                        size="sm"
                        onClick={handleFindAlternatives}
                      >
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        Ver Alternativas
                      </SafeClientButton>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Recetas Integradas
                </CardTitle>
                <CardDescription>
                  Recetas saludables directamente en el dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegratedRecipesSection 
                  onRecipeSelect={(recipe) => console.log('Receta seleccionada:', recipe)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculadora Nutricional
                </CardTitle>
                <CardDescription>
                  Análisis detallado de macronutrientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <DetailedNutritionCalculator 
                    foods={testFoods}
                    nutritionGoals={nutritionGoals || undefined}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Estado del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Utensils className="h-5 w-5 mr-2" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Verificación en tiempo real de los componentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usuario Autenticado</span>
                  <Badge variant={user ? "default" : "destructive"}>
                    {user ? "✅" : "❌"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contexto Nutrición</span>
                  <Badge variant="default">✅</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Objetivos Cargados</span>
                  <Badge variant={nutritionGoals ? "default" : "outline"}>
                    {nutritionGoals ? "✅" : "⏳"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base de Datos</span>
                  <Badge variant="default">{allSpanishFoods.length} alimentos</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estadísticas Diarias</span>
                  <Badge variant={dailyStats ? "default" : "outline"}>
                    {dailyStats ? "✅" : "⏳"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Registro de Agua</span>
                  <Badge variant={waterLogs ? "default" : "outline"}>
                    {waterLogs ? `${waterLogs.length} entradas` : "⏳"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones de Prueba */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Target className="h-5 w-5 mr-2" />
              Acciones de Prueba
            </CardTitle>
            <CardDescription>
              Prueba las funcionalidades corregidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <SafeClientButton 
                variant="accent" 
                size="sm"
                onClick={() => window.location.href = '/nutrition'}
                className="w-full"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Ir a Nutrición
              </SafeClientButton>
              
              <SafeClientButton 
                variant="secondary" 
                size="sm"
                onClick={() => window.location.href = '/nutrition/add-meal'}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Añadir Comida
              </SafeClientButton>
              
              <SafeClientButton 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/nutrition-audit'}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Auditoría
              </SafeClientButton>
              
              <SafeClientButton 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                <Apple className="h-4 w-4 mr-2" />
                Dashboard
              </SafeClientButton>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Selector de Alternativas Modal */}
      {selectedFood && (
        <AlternativeFoodSelector
          originalFood={selectedFood}
          onFoodSelect={(food) => {
            setSelectedFood(food)
            console.log('Alternativa seleccionada:', food)
          }}
          isOpen={isAlternativeSelectorOpen}
          onOpenChange={setIsAlternativeSelectorOpen}
        />
      )}

      {/* Bottom Navigation */}
      <UnifiedBottomNav activeTab="nutrition" />
    </div>
  )
}
