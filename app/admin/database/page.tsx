"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Utensils,
  Apple,
  FileText,
  ShoppingCart,
  MapPin,
  PlusCircle,
  BarChart
} from "lucide-react"
import spanishFoodService from "@/lib/spanish-food-service"
import spanishRecipeService from "@/lib/spanish-recipes-service"
import { supabase } from "@/lib/supabase-client"
import { FoodDatabaseStats } from "@/components/admin/food-database-stats"
import { AddFoodForm } from "@/components/admin/add-food-form"

export default function AdminDatabasePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Estado para la importación de alimentos
  const [isImportingFoods, setIsImportingFoods] = useState(false)
  const [foodImportProgress, setFoodImportProgress] = useState(0)
  const [foodImportResult, setFoodImportResult] = useState<{
    success?: boolean;
    imported?: number;
    failed?: number;
    error?: string;
  } | null>(null)

  // Estado para la importación de recetas
  const [isImportingRecipes, setIsImportingRecipes] = useState(false)
  const [recipeImportProgress, setRecipeImportProgress] = useState(0)
  const [recipeImportResult, setRecipeImportResult] = useState<{
    success?: boolean;
    imported?: number;
    failed?: number;
    error?: string;
  } | null>(null)

  // Estado para la importación de todos los datos
  const [isImportingAll, setIsImportingAll] = useState(false)
  const [allImportProgress, setAllImportProgress] = useState(0)
  const [allImportResult, setAllImportResult] = useState<{
    success?: boolean;
    foods?: { imported: number; failed: number };
    recipes?: { imported: number; failed: number };
    error?: string;
  } | null>(null)

  // Estado para las estadísticas de la base de datos
  const [dbStats, setDbStats] = useState({
    foodCount: 0,
    recipeCount: 0,
    isLoading: false
  })

  // Cargar estadísticas de la base de datos
  const loadDatabaseStats = async () => {
    setDbStats(prev => ({ ...prev, isLoading: true }))

    try {
      // Obtener conteo de alimentos
      const { count: foodCount, error: foodError } = await supabase
        .from('food_database')
        .select('*', { count: 'exact', head: true })

      if (foodError) throw foodError

      // Obtener conteo de recetas
      const { count: recipeCount, error: recipeError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })

      if (recipeError) throw recipeError

      setDbStats({
        foodCount: foodCount || 0,
        recipeCount: recipeCount || 0,
        isLoading: false
      })
    } catch (error) {
      console.error("Error al cargar estadísticas de la base de datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de la base de datos",
        variant: "destructive",
      })
      setDbStats(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Importar alimentos españoles a Supabase
  const importSpanishFoods = async () => {
    setIsImportingFoods(true)
    setFoodImportProgress(10)
    setFoodImportResult(null)

    try {
      setFoodImportProgress(30)

      // Importar alimentos usando la API
      const response = await fetch('/api/admin/import-spanish-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'foods' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al importar alimentos')
      }

      const result = await response.json()

      setFoodImportProgress(90)

      setFoodImportResult({
        success: result.success,
        imported: result.imported,
        failed: result.failed
      })

      toast({
        title: result.success ? "Importación completada" : "Importación parcial",
        description: result.message || `Se importaron ${result.imported} alimentos. ${result.failed > 0 ? `Fallaron ${result.failed} alimentos.` : ''}`,
        variant: result.success ? "default" : "destructive",
      })

      // Actualizar estadísticas
      loadDatabaseStats()
    } catch (error) {
      console.error("Error al importar alimentos:", error)
      setFoodImportResult({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      })

      toast({
        title: "Error",
        description: "No se pudieron importar los alimentos españoles",
        variant: "destructive",
      })
    } finally {
      setFoodImportProgress(100)
      setIsImportingFoods(false)
    }
  }

  // Importar recetas españolas a Supabase
  const importSpanishRecipes = async () => {
    setIsImportingRecipes(true)
    setRecipeImportProgress(10)
    setRecipeImportResult(null)

    try {
      setRecipeImportProgress(30)

      // Importar recetas usando la API
      const response = await fetch('/api/admin/import-spanish-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'recipes' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al importar recetas')
      }

      const result = await response.json()

      setRecipeImportProgress(90)

      setRecipeImportResult({
        success: result.success,
        imported: result.imported,
        failed: result.failed
      })

      toast({
        title: result.success ? "Importación completada" : "Importación parcial",
        description: result.message || `Se importaron ${result.imported} recetas. ${result.failed > 0 ? `Fallaron ${result.failed} recetas.` : ''}`,
        variant: result.success ? "default" : "destructive",
      })

      // Actualizar estadísticas
      loadDatabaseStats()
    } catch (error) {
      console.error("Error al importar recetas:", error)
      setRecipeImportResult({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      })

      toast({
        title: "Error",
        description: "No se pudieron importar las recetas españolas",
        variant: "destructive",
      })
    } finally {
      setRecipeImportProgress(100)
      setIsImportingRecipes(false)
    }
  }

  // Importar todos los datos españoles a Supabase
  const importAllSpanishData = async () => {
    setIsImportingAll(true)
    setAllImportProgress(10)
    setAllImportResult(null)

    try {
      setAllImportProgress(30)

      // Importar todos los datos usando la API
      const response = await fetch('/api/admin/import-spanish-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'all' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al importar datos')
      }

      const result = await response.json()

      setAllImportProgress(90)

      setAllImportResult({
        success: result.success,
        foods: result.foods,
        recipes: result.recipes
      })

      toast({
        title: result.success ? "Importación completada" : "Importación parcial",
        description: result.message || "Se importaron los datos españoles",
        variant: result.success ? "default" : "destructive",
      })

      // Actualizar estadísticas
      loadDatabaseStats()
    } catch (error) {
      console.error("Error al importar todos los datos:", error)
      setAllImportResult({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      })

      toast({
        title: "Error",
        description: "No se pudieron importar los datos españoles",
        variant: "destructive",
      })
    } finally {
      setAllImportProgress(100)
      setIsImportingAll(false)
    }
  }

  // Cargar estadísticas al montar el componente
  useState(() => {
    loadDatabaseStats()
  })

  return (
    <AdminLayout title="Administración de Base de Datos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <Apple className="h-4 w-4 mr-2" />
              {dbStats.isLoading ? "..." : dbStats.foodCount} alimentos
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <FileText className="h-4 w-4 mr-2" />
              {dbStats.isLoading ? "..." : dbStats.recipeCount} recetas
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={importAllSpanishData}
              disabled={isImportingAll || isImportingFoods || isImportingRecipes}
              className="rounded-full"
            >
              {isImportingAll ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Importar Todo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={loadDatabaseStats}
              disabled={dbStats.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${dbStats.isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="foods" className="space-y-6">
          <TabsList className="grid grid-cols-4 mb-4 rounded-full p-1">
            <TabsTrigger value="foods" className="flex items-center justify-center rounded-full">
              <Apple className="h-4 w-4 mr-2" />
              Alimentos
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center justify-center rounded-full">
              <Utensils className="h-4 w-4 mr-2" />
              Recetas
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center justify-center rounded-full">
              <BarChart className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center justify-center rounded-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-orange-500" />
                  Importar Alimentos Españoles
                </CardTitle>
                <CardDescription>
                  Importa alimentos españoles a la base de datos de Supabase, incluyendo productos de supermercados y platos regionales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {foodImportResult && (
                  <Alert className="mb-4" variant={foodImportResult.success ? "default" : "destructive"}>
                    <div className="flex items-center">
                      {foodImportResult.success ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      <AlertTitle>
                        {foodImportResult.success ? "Importación completada" : "Error en la importación"}
                      </AlertTitle>
                    </div>
                    <AlertDescription>
                      {foodImportResult.imported !== undefined && (
                        <p>Se importaron {foodImportResult.imported} alimentos.</p>
                      )}
                      {foodImportResult.failed !== undefined && foodImportResult.failed > 0 && (
                        <p>Fallaron {foodImportResult.failed} alimentos.</p>
                      )}
                      {foodImportResult.error && (
                        <p>Error: {foodImportResult.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {isImportingFoods && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Importando alimentos...</p>
                    <Progress value={foodImportProgress} className="h-2" />
                  </div>
                )}

                {allImportResult && (
                  <Alert className="mb-4" variant={allImportResult.success ? "default" : "destructive"}>
                    <div className="flex items-center">
                      {allImportResult.success ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      <AlertTitle>
                        {allImportResult.success ? "Importación completa" : "Importación parcial"}
                      </AlertTitle>
                    </div>
                    <AlertDescription>
                      {allImportResult.foods && (
                        <p>Se importaron {allImportResult.foods.imported} alimentos. {allImportResult.foods.failed > 0 ? `Fallaron ${allImportResult.foods.failed} alimentos.` : ''}</p>
                      )}
                      {allImportResult.error && (
                        <p>Error: {allImportResult.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {isImportingAll && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Importando todos los datos...</p>
                    <Progress value={allImportProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Alimentos incluidos:</h3>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li className="flex items-center">
                        <Apple className="h-4 w-4 mr-1 text-green-500" />
                        Frutas y verduras españolas
                      </li>
                      <li className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-1 text-orange-500" />
                        Productos de Mercadona y Carrefour
                      </li>
                      <li className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />
                        Platos regionales españoles
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-end justify-end">
                    <Button
                      onClick={importSpanishFoods}
                      disabled={isImportingFoods || isImportingAll}
                      className="w-full md:w-auto"
                    >
                      {isImportingFoods && (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Importar Alimentos Españoles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-blue-500" />
                  Importar Recetas Españolas
                </CardTitle>
                <CardDescription>
                  Importa recetas españolas tradicionales a la base de datos de Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recipeImportResult && (
                  <Alert className="mb-4" variant={recipeImportResult.success ? "default" : "destructive"}>
                    <div className="flex items-center">
                      {recipeImportResult.success ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      <AlertTitle>
                        {recipeImportResult.success ? "Importación completada" : "Error en la importación"}
                      </AlertTitle>
                    </div>
                    <AlertDescription>
                      {recipeImportResult.imported !== undefined && (
                        <p>Se importaron {recipeImportResult.imported} recetas.</p>
                      )}
                      {recipeImportResult.failed !== undefined && recipeImportResult.failed > 0 && (
                        <p>Fallaron {recipeImportResult.failed} recetas.</p>
                      )}
                      {recipeImportResult.error && (
                        <p>Error: {recipeImportResult.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {isImportingRecipes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Importando recetas...</p>
                    <Progress value={recipeImportProgress} className="h-2" />
                  </div>
                )}

                {allImportResult && (
                  <Alert className="mb-4" variant={allImportResult.success ? "default" : "destructive"}>
                    <div className="flex items-center">
                      {allImportResult.success ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      <AlertTitle>
                        {allImportResult.success ? "Importación completa" : "Importación parcial"}
                      </AlertTitle>
                    </div>
                    <AlertDescription>
                      {allImportResult.recipes && (
                        <p>Se importaron {allImportResult.recipes.imported} recetas. {allImportResult.recipes.failed > 0 ? `Fallaron ${allImportResult.recipes.failed} recetas.` : ''}</p>
                      )}
                      {allImportResult.error && (
                        <p>Error: {allImportResult.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {isImportingAll && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Importando todos los datos...</p>
                    <Progress value={allImportProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Recetas incluidas:</h3>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />
                        Recetas tradicionales de diferentes regiones
                      </li>
                      <li className="flex items-center">
                        <Utensils className="h-4 w-4 mr-1 text-blue-500" />
                        Versiones saludables de platos clásicos
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-end justify-end">
                    <Button
                      onClick={importSpanishRecipes}
                      disabled={isImportingRecipes || isImportingAll}
                      className="w-full md:w-auto"
                    >
                      {isImportingRecipes && (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Importar Recetas Españolas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <FoodDatabaseStats />
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <AddFoodForm onSuccess={loadDatabaseStats} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
