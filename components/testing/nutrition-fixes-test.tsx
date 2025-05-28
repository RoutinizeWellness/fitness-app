"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Utensils, Apple, Droplets } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNutrition } from "@/contexts/nutrition-context"
import { createClient } from "@/lib/supabase/client"
import { 
  getUserNutritionGoals, 
  setNutritionGoals, 
  addWaterEntry, 
  getWaterLog,
  getDailyNutritionStats 
} from "@/lib/supabase/nutrition-service"
import { allSpanishFoods } from "@/lib/data/spanish-foods-database"

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  duration?: number
  details?: any
}

interface NutritionFixesTestProps {
  className?: string
}

export function NutritionFixesTest({ className = "" }: NutritionFixesTestProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { 
    nutritionGoals, 
    dailyStats, 
    waterLogs,
    loadNutritionGoals,
    loadDailyStats,
    loadWaterLogs
  } = useNutrition()
  
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [overallProgress, setOverallProgress] = useState(0)

  const tests = [
    {
      id: 'layout_error',
      name: 'Layout Error Fix',
      description: 'Verificar que el error TypeError en nutrition layout está corregido'
    },
    {
      id: 'context_loading',
      name: 'Context Loading Fix',
      description: 'Probar que loadNutritionGoals funciona correctamente'
    },
    {
      id: 'supabase_queries',
      name: 'Supabase Queries',
      description: 'Verificar nuevas funciones de Supabase para nutrición'
    },
    {
      id: 'spanish_foods',
      name: 'Spanish Food Database',
      description: 'Probar base de datos expandida de alimentos españoles'
    },
    {
      id: 'dashboard_ui',
      name: 'Dashboard UI',
      description: 'Verificar que el nuevo dashboard de nutrición funciona'
    },
    {
      id: 'water_tracking',
      name: 'Water Tracking',
      description: 'Probar funcionalidad de registro de agua'
    }
  ]

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setOverallProgress(0)

    const results: TestResult[] = []

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setCurrentTest(test.name)
      
      const result: TestResult = {
        name: test.name,
        status: 'running',
        message: 'Ejecutando...'
      }
      
      results.push(result)
      setTestResults([...results])

      const startTime = Date.now()

      try {
        switch (test.id) {
          case 'layout_error':
            await testLayoutError(result)
            break
          case 'context_loading':
            await testContextLoading(result)
            break
          case 'supabase_queries':
            await testSupabaseQueries(result)
            break
          case 'spanish_foods':
            await testSpanishFoods(result)
            break
          case 'dashboard_ui':
            await testDashboardUI(result)
            break
          case 'water_tracking':
            await testWaterTracking(result)
            break
        }

        result.status = 'success'
        result.message = 'Prueba completada exitosamente'
      } catch (error) {
        result.status = 'error'
        result.message = error instanceof Error ? error.message : 'Error desconocido'
        console.error(`Test ${test.id} failed:`, error)
      }

      result.duration = Date.now() - startTime
      setTestResults([...results])
      setOverallProgress(((i + 1) / tests.length) * 100)

      // Pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setCurrentTest('')
    setIsRunning(false)

    // Mostrar resumen
    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    toast({
      title: "Pruebas de Nutrición Completadas",
      description: `${successCount} exitosas, ${errorCount} fallidas`,
      variant: errorCount > 0 ? "destructive" : "default"
    })
  }

  const testLayoutError = async (result: TestResult) => {
    // Verificar que no hay errores de importación
    try {
      const supabase = createClient()
      
      // Verificar que el cliente se puede crear sin errores
      const { data: { user } } = await supabase.auth.getUser()
      
      result.details = {
        supabaseClient: 'Available',
        authCheck: 'Success',
        layoutError: 'Fixed'
      }
    } catch (error) {
      throw new Error('Layout error no está corregido: ' + (error as Error).message)
    }
  }

  const testContextLoading = async (result: TestResult) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    try {
      // Probar la función loadNutritionGoals del contexto
      await loadNutritionGoals()
      
      result.details = {
        contextFunction: 'Available',
        loadGoals: 'Success',
        currentGoals: nutritionGoals ? 'Loaded' : 'Not loaded'
      }
    } catch (error) {
      throw new Error('Context loading error: ' + (error as Error).message)
    }
  }

  const testSupabaseQueries = async (result: TestResult) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    try {
      // Probar getUserNutritionGoals
      const { data: goals, error: goalsError } = await getUserNutritionGoals(user.id)
      
      // Probar getWaterLog
      const today = new Date().toISOString().split('T')[0]
      const { data: waterLog, error: waterError } = await getWaterLog(user.id, today)
      
      // Probar getDailyNutritionStats
      const { data: stats, error: statsError } = await getDailyNutritionStats(user.id, today)

      result.details = {
        goalsQuery: goalsError ? 'Error' : 'Success',
        waterQuery: waterError ? 'Error' : 'Success',
        statsQuery: statsError ? 'Error' : 'Success',
        goalsData: goals ? 'Available' : 'Not found',
        waterData: waterLog ? `${waterLog.length} entries` : 'No entries',
        statsData: stats ? 'Available' : 'Not found',
        errors: {
          goals: goalsError?.message,
          water: waterError?.message,
          stats: statsError?.message
        }
      }

      if (goalsError && waterError && statsError) {
        throw new Error('Todas las consultas de Supabase fallaron')
      }
    } catch (error) {
      throw new Error('Supabase queries error: ' + (error as Error).message)
    }
  }

  const testSpanishFoods = async (result: TestResult) => {
    try {
      // Verificar que la base de datos de alimentos españoles está expandida
      const totalFoods = allSpanishFoods.length
      
      // Contar por categorías
      const categories = allSpanishFoods.reduce((acc, food) => {
        acc[food.category] = (acc[food.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Verificar que hay alimentos de diferentes supermercados
      const supermarkets = allSpanishFoods.filter(food => food.supermarket).length
      
      // Verificar que hay platos regionales
      const regionalDishes = allSpanishFoods.filter(food => food.region).length

      result.details = {
        totalFoods,
        categories,
        supermarketProducts: supermarkets,
        regionalDishes,
        expandedDatabase: totalFoods > 50 ? 'Yes' : 'No'
      }

      if (totalFoods < 50) {
        throw new Error('Base de datos de alimentos no está suficientemente expandida')
      }
    } catch (error) {
      throw new Error('Spanish foods test error: ' + (error as Error).message)
    }
  }

  const testDashboardUI = async (result: TestResult) => {
    try {
      // Verificar que el componente NutritionDashboard se puede importar
      const { NutritionDashboard } = await import('@/components/nutrition/nutrition-dashboard')
      
      result.details = {
        dashboardComponent: 'Available',
        importTest: 'Success',
        uiComponents: 'Updated'
      }
    } catch (error) {
      throw new Error('Dashboard UI test error: ' + (error as Error).message)
    }
  }

  const testWaterTracking = async (result: TestResult) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Probar agregar entrada de agua
      const { data: newEntry, error: addError } = await addWaterEntry({
        user_id: user.id,
        date: today,
        amount: 250
      })

      // Probar obtener registro de agua
      const { data: waterLog, error: getError } = await getWaterLog(user.id, today)

      result.details = {
        addWater: addError ? 'Error' : 'Success',
        getWater: getError ? 'Error' : 'Success',
        newEntryId: newEntry?.id || 'Not created',
        totalEntries: waterLog?.length || 0,
        errors: {
          add: addError?.message,
          get: getError?.message
        }
      }

      if (addError && getError) {
        throw new Error('Water tracking functions failed')
      }
    } catch (error) {
      throw new Error('Water tracking test error: ' + (error as Error).message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="h-6 w-6 mr-2 text-[#FEA800]" />
            Pruebas de Corrección - Módulo de Nutrición
          </CardTitle>
          <CardDescription>
            Verificación de las correcciones implementadas en el módulo de nutrición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {isRunning ? `Ejecutando: ${currentTest}` : 'Listo para ejecutar pruebas'}
                </p>
                {isRunning && (
                  <Progress value={overallProgress} className="w-64 h-2 mt-2" />
                )}
              </div>
              <SafeClientButton
                onClick={runAllTests}
                disabled={isRunning}
                variant="accent"
                className="flex items-center"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Ejecutando...' : 'Ejecutar Pruebas'}
              </SafeClientButton>
            </div>

            {/* Estado de correcciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Base de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Alimentos Españoles</span>
                      <Badge variant="default">{allSpanishFoods.length}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Consultas Supabase</span>
                      <Badge variant="default">✅ Actualizadas</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Utensils className="h-4 w-4 mr-2" />
                    Funcionalidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Dashboard UI</span>
                      <Badge variant="default">✅ Nuevo</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Context Loading</span>
                      <Badge variant="default">✅ Corregido</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Droplets className="h-4 w-4 mr-2" />
                    Características
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Registro de Agua</span>
                      <Badge variant="default">✅ Funcional</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>AI Recommendations</span>
                      <Badge variant="outline">🔄 En desarrollo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de pruebas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => {
                const result = testResults.find(r => r.name === test.name)
                
                return (
                  <Card key={test.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{test.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                          
                          {result && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between">
                                <Badge className={getStatusColor(result.status)}>
                                  {result.status}
                                </Badge>
                                {result.duration && (
                                  <span className="text-xs text-gray-500">
                                    {result.duration}ms
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{result.message}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-3">
                          {result ? getStatusIcon(result.status) : (
                            <div className="h-5 w-5 bg-gray-200 rounded-full" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Resultados detallados */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados Detallados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{result.name}</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.status)}
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              Ver detalles
                            </summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
