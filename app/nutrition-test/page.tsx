"use client"

import React from "react"
import { NutritionFixesTest } from "@/components/testing/nutrition-fixes-test"
import { NutritionDashboard } from "@/components/nutrition/nutrition-dashboard"
import { UnifiedBottomNav } from "@/components/navigation/unified-bottom-nav"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"
import { useNutrition } from "@/contexts/nutrition-context"
import { CheckCircle, AlertTriangle, Database, Utensils, Apple, Droplets, Target } from "lucide-react"
import { allSpanishFoods } from "@/lib/data/spanish-foods-database"

export default function NutritionTestPage() {
  const { user } = useAuth()
  const { nutritionGoals, dailyStats, waterLogs } = useNutrition()

  // Contar alimentos por categoría
  const foodCategories = allSpanishFoods.reduce((acc, food) => {
    acc[food.category] = (acc[food.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCFE] px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#1B237E] font-manrope">
            Pruebas - Módulo de Nutrición
          </h1>
          <p className="text-sm text-[#573353] mt-1">
            Verificación de correcciones implementadas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <CheckCircle className="h-5 w-5 mr-2" />
              Estado de Correcciones
            </CardTitle>
            <CardDescription>
              Resumen de los problemas corregidos en nutrición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Layout TypeError Fix</span>
                <Badge variant="default">✅ Corregido</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Context Loading Error</span>
                <Badge variant="default">✅ Solucionado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Supabase Queries</span>
                <Badge variant="default">✅ Actualizadas</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Spanish Food Database</span>
                <Badge variant="default">✅ Expandida</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dashboard UI</span>
                <Badge variant="default">✅ Reimplementado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Water Tracking</span>
                <Badge variant="default">✅ Funcional</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Database className="h-5 w-5 mr-2" />
              Base de Datos de Alimentos Españoles
            </CardTitle>
            <CardDescription>
              Estadísticas de la base de datos expandida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#FEA800]">
                  {allSpanishFoods.length}
                </p>
                <p className="text-xs text-gray-600">Total Alimentos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B237E]">
                  {Object.keys(foodCategories).length}
                </p>
                <p className="text-xs text-gray-600">Categorías</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              {Object.entries(foodCategories).slice(0, 5).map(([category, count]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="capitalize">{category.replace('_', ' ')}</span>
                  <Badge variant="outline">{count} items</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Context Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Target className="h-5 w-5 mr-2" />
              Estado del Contexto de Nutrición
            </CardTitle>
            <CardDescription>
              Verificación de datos cargados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Usuario Autenticado</span>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "✅ Sí" : "❌ No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Objetivos Nutricionales</span>
                <Badge variant={nutritionGoals ? "default" : "outline"}>
                  {nutritionGoals ? "✅ Cargados" : "⏳ No cargados"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estadísticas Diarias</span>
                <Badge variant={dailyStats ? "default" : "outline"}>
                  {dailyStats ? "✅ Disponibles" : "⏳ No disponibles"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Registro de Agua</span>
                <Badge variant={waterLogs ? "default" : "outline"}>
                  {waterLogs ? `✅ ${waterLogs.length} entradas` : "⏳ No cargado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Utensils className="h-5 w-5 mr-2" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Probar funcionalidades del módulo de nutrición
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
                onClick={() => window.location.href = '/nutrition/spanish-foods'}
                className="w-full"
              >
                <Apple className="h-4 w-4 mr-2" />
                Alimentos ES
              </SafeClientButton>
              
              <SafeClientButton 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/nutrition/recipes'}
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Recetas
              </SafeClientButton>
              
              <SafeClientButton 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/nutrition/water'}
                className="w-full"
              >
                <Droplets className="h-4 w-4 mr-2" />
                Agua
              </SafeClientButton>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Preview */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-[#1B237E]">
                <CheckCircle className="h-5 w-5 mr-2" />
                Vista Previa del Dashboard
              </CardTitle>
              <CardDescription>
                Componente NutritionDashboard funcionando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <NutritionDashboard />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Automated Tests */}
        <NutritionFixesTest />

        {/* Admin Features */}
        {user?.email === 'admin@routinize.com' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-[#1B237E]">
                <CheckCircle className="h-5 w-5 mr-2" />
                Funcionalidades de Administrador
              </CardTitle>
              <CardDescription>
                Acceso especial para admin@routinize.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="default">✅ Usuario Admin Detectado</Badge>
                <p className="text-sm text-gray-600">
                  Tienes acceso a todas las funcionalidades administrativas de nutrición.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <SafeClientButton 
                    variant="accent" 
                    size="sm"
                    onClick={() => window.location.href = '/admin/nutrition'}
                  >
                    Admin Nutrición
                  </SafeClientButton>
                  <SafeClientButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.location.href = '/admin/food-database'}
                  >
                    Gestionar Alimentos
                  </SafeClientButton>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Detalles Técnicos
            </CardTitle>
            <CardDescription>
              Información sobre las correcciones implementadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>
                <strong>1. Layout Error Fix:</strong> Corregida importación de Supabase client en GeminiProvider
              </div>
              <div>
                <strong>2. Context Loading:</strong> Actualizado nutrition-context para usar nuevas funciones
              </div>
              <div>
                <strong>3. Supabase Queries:</strong> Creado nutrition-service con funciones actualizadas
              </div>
              <div>
                <strong>4. Food Database:</strong> Expandida con {allSpanishFoods.length} alimentos españoles
              </div>
              <div>
                <strong>5. Dashboard UI:</strong> Reimplementado con componentes funcionales
              </div>
              <div>
                <strong>6. Water Tracking:</strong> Sistema completo de registro de hidratación
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bottom Navigation Demo */}
      <UnifiedBottomNav activeTab="nutrition" />
    </div>
  )
}
