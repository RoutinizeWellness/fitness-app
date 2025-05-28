"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { RefreshCw, AlertTriangle, Database, Apple, ShoppingCart, MapPin, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FoodDatabaseStatsProps {
  className?: string
}

export function FoodDatabaseStats({ className }: FoodDatabaseStatsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalFoods: 0,
    categoryCounts: [] as { category: string; count: number }[],
    supermarketCounts: [] as { supermarket: string; count: number }[],
    regionalCount: 0,
    verifiedCount: 0,
    source: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")
  
  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  
  // Cargar estadísticas
  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/foods/stats')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar estadísticas')
      }
      
      const data = await response.json()
      setStats({
        totalFoods: data.totalFoods || 0,
        categoryCounts: data.categoryCounts || [],
        supermarketCounts: data.supermarketCounts || [],
        regionalCount: data.regionalCount || 0,
        verifiedCount: data.verifiedCount || 0,
        source: data.source || 'unknown'
      })
      
      if (data.source === 'local') {
        toast({
          title: "Información",
          description: "Mostrando estadísticas de la base de datos local debido a un error en Supabase",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de la base de datos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats()
  }, [])
  
  // Preparar datos para el gráfico de categorías
  const categoryChartData = stats.categoryCounts
    .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor
    .map((item, index) => ({
      name: item.category,
      value: item.count,
      fill: COLORS[index % COLORS.length]
    }))
  
  // Preparar datos para el gráfico de supermercados
  const supermarketChartData = stats.supermarketCounts
    .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor
    .map((item, index) => ({
      name: item.supermarket,
      value: item.count,
      fill: COLORS[index % COLORS.length]
    }))
  
  // Renderizar mensaje de error
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudieron cargar las estadísticas: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={loadStats}
          >
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  
  // Renderizar componente de carga
  if (isLoading && stats.totalFoods === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Cargando Estadísticas...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={50} className="h-2 mb-4" />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Estadísticas de la Base de Datos de Alimentos
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadStats} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        <CardDescription>
          Fuente de datos: {stats.source === 'supabase' ? 'Supabase' : 'Base de datos local'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Alimentos</p>
                  <p className="text-2xl font-bold">{stats.totalFoods}</p>
                </div>
                <Apple className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alimentos de Supermercado</p>
                  <p className="text-2xl font-bold">{stats.supermarketCounts.reduce((sum, item) => sum + item.count, 0)}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platos Regionales</p>
                  <p className="text-2xl font-bold">{stats.regionalCount}</p>
                </div>
                <MapPin className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alimentos Verificados</p>
                  <p className="text-2xl font-bold">{stats.verifiedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="supermarkets">Supermercados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <div className="h-[300px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de categorías disponibles
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="supermarkets">
            <div className="h-[300px]">
              {supermarketChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={supermarketChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {supermarketChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} alimentos`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de supermercados disponibles
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
