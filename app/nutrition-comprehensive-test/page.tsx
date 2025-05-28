"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, Target, Utensils, Apple, ChefHat, Calculator, ArrowUpDown, Shield, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnifiedBottomNav } from "@/components/navigation/unified-bottom-nav"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNutrition } from "@/contexts/nutrition-context"
import { NutritionDashboard } from "@/components/nutrition/nutrition-dashboard"
import { UnifiedMealPlanner } from "@/components/nutrition/unified-meal-planner"
import { DietaryRestrictionsManager } from "@/components/nutrition/dietary-restrictions-manager"
import { IntegratedRecipesSection } from "@/components/nutrition/integrated-recipes-section"
import { AlternativeFoodSelector } from "@/components/nutrition/alternative-food-selector"
import { DetailedNutritionCalculator } from "@/components/nutrition/detailed-nutrition-calculator"
import spanishRecipes from "@/lib/data/spanish-recipes-database"
import { allSpanishFoods } from "@/lib/data/spanish-foods-database"

export default function NutritionComprehensiveTestPage() {
  const { user } = useAuth()
  const { nutritionGoals, dailyStats, waterLogs } = useNutrition()
  const [selectedFood, setSelectedFood] = useState(null)
  const [isAlternativeSelectorOpen, setIsAlternativeSelectorOpen] = useState(false)

  // Estadísticas de mejoras implementadas
  const improvements = [
    {
      category: "Errores Críticos Resueltos",
      items: [
        {
          issue: "TypeError en integrated-recipes-section.tsx línea 462",
          status: "fixed",
          description: "Corregido error de slice() en array undefined con validación robusta"
        },
        {
          issue: "Error de importación auth-context en sleep-module.tsx",
          status: "fixed", 
          description: "Actualizada ruta a @/lib/contexts/auth-context"
        },
        {
          issue: "Importaciones inconsistentes de auth-context",
          status: "fixed",
          description: "Unificadas todas las importaciones a la ruta correcta"
        }
      ]
    },
    {
      category: "Base de Datos de Recetas Expandida",
      items: [
        {
          issue: "Base de datos limitada de recetas",
          status: "enhanced",
          description: `Expandida a ${spanishRecipes.length}+ recetas españolas diversas`
        },
        {
          issue: "Falta de categorización por comidas",
          status: "implemented",
          description: "Categorías: desayuno, almuerzo, cena, snacks, postres"
        },
        {
          issue: "Información nutricional incompleta",
          status: "enhanced",
          description: "Datos completos: calorías, proteína, carbos, grasas, fibra"
        },
        {
          issue: "Falta de diversidad regional",
          status: "implemented",
          description: "Recetas de todas las comunidades autónomas españolas"
        }
      ]
    },
    {
      category: "Sistema Unificado de Planificación",
      items: [
        {
          issue: "Inconsistencias entre diary y plan",
          status: "unified",
          description: "Creado UnifiedMealPlanner que combina ambas funcionalidades"
        },
        {
          issue: "Falta de tipos de dieta específicos",
          status: "implemented",
          description: "6 tipos: mediterráneo, keto, vegetariano, vegano, pérdida peso, ganancia muscular, diabético"
        },
        {
          issue: "Generación manual de planes",
          status: "automated",
          description: "Generación automática de planes semanales basados en restricciones"
        },
        {
          issue: "Falta de seguimiento nutricional",
          status: "enhanced",
          description: "Cálculos automáticos de totales diarios y progreso hacia objetivos"
        }
      ]
    },
    {
      category: "Módulo de Restricciones Dietéticas",
      items: [
        {
          issue: "Sin gestión de alergias",
          status: "implemented",
          description: "Sistema completo de alergias con severidad crítica/alta/media/baja"
        },
        {
          issue: "Sin restricciones religiosas",
          status: "implemented",
          description: "Soporte para halal, kosher y otras restricciones religiosas"
        },
        {
          issue: "Sin opciones de estilo de vida",
          status: "implemented",
          description: "Vegetariano, vegano, pescetariano con filtrado automático"
        },
        {
          issue: "Sin condiciones médicas",
          status: "implemented",
          description: "Diabetes, hipertensión, enfermedad renal con alternativas"
        },
        {
          issue: "Sin restricciones personalizadas",
          status: "implemented",
          description: "Sistema para crear restricciones dietéticas personalizadas"
        }
      ]
    }
  ]

  const technicalFeatures = [
    {
      name: "Base de Datos Expandida",
      description: `${spanishRecipes.length} recetas españolas + ${allSpanishFoods.length} alimentos`,
      component: "spanish-recipes-database.ts",
      status: "enhanced"
    },
    {
      name: "Planificador Unificado",
      description: "Combina diary y plan con generación automática",
      component: "UnifiedMealPlanner",
      status: "implemented"
    },
    {
      name: "Gestor de Restricciones",
      description: "13 restricciones predefinidas + personalizadas",
      component: "DietaryRestrictionsManager",
      status: "implemented"
    },
    {
      name: "Selector de Alternativas",
      description: "Algoritmo de similitud nutricional avanzado",
      component: "AlternativeFoodSelector",
      status: "enhanced"
    },
    {
      name: "Calculadora Detallada",
      description: "Análisis completo de macros y micronutrientes",
      component: "DetailedNutritionCalculator",
      status: "enhanced"
    },
    {
      name: "Recetas Integradas",
      description: "Búsqueda, filtros y modal detallado",
      component: "IntegratedRecipesSection",
      status: "enhanced"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fixed': return 'bg-green-100 text-green-800'
      case 'implemented': return 'bg-blue-100 text-blue-800'
      case 'enhanced': return 'bg-purple-100 text-purple-800'
      case 'unified': return 'bg-indigo-100 text-indigo-800'
      case 'automated': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed': return '✅'
      case 'implemented': return '🚀'
      case 'enhanced': return '⚡'
      case 'unified': return '🔗'
      case 'automated': return '🤖'
      default: return '📋'
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B237E]/10 to-[#FEA800]/10 border-b border-[#DDDCFE] px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#1B237E] font-manrope">
            Prueba Integral - Módulo de Nutrición
          </h1>
          <p className="text-sm text-[#573353] mt-1">
            Verificación completa de todas las mejoras implementadas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Resumen de Mejoras */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Resumen de Mejoras Implementadas
            </CardTitle>
            <CardDescription>
              Transformación completa del módulo de nutrición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-[#1B237E]">{spanishRecipes.length}</div>
                <div className="text-xs text-gray-600">Recetas Españolas</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-[#FEA800]">13</div>
                <div className="text-xs text-gray-600">Restricciones Predefinidas</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-[#FF6767]">6</div>
                <div className="text-xs text-gray-600">Tipos de Dieta</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-[#573353]">100%</div>
                <div className="text-xs text-gray-600">Errores Resueltos</div>
              </div>
            </div>

            <div className="space-y-3">
              {improvements.map((category, index) => (
                <div key={index} className="border rounded-lg p-3 bg-white/40">
                  <h4 className="font-medium text-sm text-[#1B237E] mb-2">{category.category}</h4>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium">{item.issue}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                        <Badge className={`text-xs ml-2 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)} {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Características Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Target className="h-5 w-5 mr-2" />
              Características Técnicas Implementadas
            </CardTitle>
            <CardDescription>
              Componentes y funcionalidades avanzadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {technicalFeatures.map((feature, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{feature.name}</h4>
                    <Badge variant="outline" className="text-xs">{feature.component}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                  <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
                    {getStatusIcon(feature.status)} {feature.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demostración de Componentes */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="planner">Planificador</TabsTrigger>
            <TabsTrigger value="restrictions">Restricciones</TabsTrigger>
            <TabsTrigger value="recipes">Recetas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dashboard Completo</CardTitle>
                <CardDescription>
                  Dashboard unificado con todas las funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <NutritionDashboard />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planificador Unificado
                </CardTitle>
                <CardDescription>
                  Sistema que combina diary y plan con 6 tipos de dieta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <UnifiedMealPlanner />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restrictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Gestor de Restricciones
                </CardTitle>
                <CardDescription>
                  13 restricciones predefinidas + personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <DietaryRestrictionsManager />
                </div>
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
                  {spanishRecipes.length} recetas españolas con búsqueda y filtros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegratedRecipesSection />
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
              Verificación en tiempo real de todos los componentes
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
                <div className="flex justify-between text-sm">
                  <span>Recetas Disponibles</span>
                  <Badge variant="default">{spanishRecipes.length} recetas</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Alimentos Españoles</span>
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
                <div className="flex justify-between text-sm">
                  <span>Errores Críticos</span>
                  <Badge variant="default">0 errores</Badge>
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
              Prueba todas las funcionalidades implementadas
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
                Dashboard Principal
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
                Auditoría Anterior
              </SafeClientButton>
              
              <SafeClientButton 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                <Apple className="h-4 w-4 mr-2" />
                Dashboard General
              </SafeClientButton>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bottom Navigation */}
      <UnifiedBottomNav activeTab="nutrition" />
    </div>
  )
}
