"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Heart, Clock, Calendar, Filter,
  ChevronRight, Play, Bookmark, Share2,
  Utensils, Moon, Activity, Droplet, Apple
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import type { NutritionEntry } from "@/lib/supabase-client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useHealthData } from "@/hooks/use-health-data"

interface HolisticHealthProps {
  profile: User | null
  nutritionLog?: NutritionEntry[]
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function HolisticHealth({
  profile,
  nutritionLog = [],
  isLoading: initialLoading = false,
  onNavigate
}: HolisticHealthProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const { healthStats, isLoading: healthLoading } = useHealthData()

  // Categorías de salud
  const categories = [
    { id: "all", name: "Todos" },
    { id: "nutrition", name: "Nutrición" },
    { id: "sleep", name: "Sueño" },
    { id: "hydration", name: "Hidratación" },
    { id: "vitals", name: "Vitales" }
  ]

  // Combinar estado de carga
  const isLoading = initialLoading || healthLoading

  // Datos para las métricas de salud (usando datos reales si están disponibles)
  const healthMetrics = {
    calories: {
      consumed: healthStats?.calories.burned || 1850,
      goal: healthStats?.calories.goal || 2200,
      unit: "kcal"
    },
    water: {
      consumed: healthStats?.water.intake || 1.6,
      goal: healthStats?.water.goal || 2.5,
      unit: "L"
    },
    sleep: {
      duration: healthStats?.sleep.duration || 7.2,
      goal: healthStats?.sleep.goal || 8,
      unit: "h"
    },
    steps: {
      count: healthStats?.steps.current || 8450,
      goal: healthStats?.steps.goal || 10000,
      unit: "pasos"
    }
  }

  // Datos para los artículos de salud
  const healthArticles = [
    {
      id: "article1",
      title: "Alimentación consciente: cómo mejorar tu relación con la comida",
      category: "Nutrición",
      readTime: "5 min",
      image: "/images/health/mindful-eating.jpg",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "article2",
      title: "Mejora la calidad de tu sueño con estos 5 hábitos",
      category: "Sueño",
      readTime: "4 min",
      image: "/images/health/sleep.jpg",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "article3",
      title: "La importancia de la hidratación para tu rendimiento",
      category: "Hidratación",
      readTime: "3 min",
      image: "/images/health/hydration.jpg",
      color: "from-cyan-500 to-blue-600"
    }
  ]

  // Datos para las recetas saludables
  const healthyRecipes = [
    {
      id: "recipe1",
      title: "Bowl de proteínas con quinoa",
      category: "Almuerzo",
      prepTime: "15 min",
      calories: 450,
      image: "/images/recipes/protein-bowl.jpg"
    },
    {
      id: "recipe2",
      title: "Batido verde energizante",
      category: "Desayuno",
      prepTime: "5 min",
      calories: 220,
      image: "/images/recipes/green-smoothie.jpg"
    },
    {
      id: "recipe3",
      title: "Ensalada mediterránea",
      category: "Cena",
      prepTime: "10 min",
      calories: 320,
      image: "/images/recipes/mediterranean-salad.jpg"
    }
  ]

  // Función para manejar la navegación
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">Salud</h1>
        <p className="text-gray-500">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Filtros de categoría */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((category) => (
            <Button3D
              key={category.id}
              variant={activeCategory === category.id ? "gradient" : "outline"}
              size="sm"
              className={activeCategory === category.id ? "text-white" : ""}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button3D>
          ))}
        </div>

        <Button3D variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button3D>
      </div>

      {/* Métricas de salud */}
      <div className="grid grid-cols-2 gap-4">
        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="rounded-full bg-red-100 text-red-600 p-1.5 mr-2">
                <Utensils className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Calorías</span>
            </div>
            <div className="text-xl font-bold gradient-text mb-1">
              {healthMetrics.calories.consumed} <span className="text-sm font-normal text-gray-500">{healthMetrics.calories.unit}</span>
            </div>
            <Progress3D
              value={healthMetrics.calories.consumed}
              max={healthMetrics.calories.goal}
              className="mb-1"
              height="4px"
            />
            <p className="text-xs text-gray-500 mt-auto">
              Meta: {healthMetrics.calories.goal} {healthMetrics.calories.unit}
            </p>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="rounded-full bg-blue-100 text-blue-600 p-1.5 mr-2">
                <Droplet className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Agua</span>
            </div>
            <div className="text-xl font-bold gradient-text mb-1">
              {healthMetrics.water.consumed} <span className="text-sm font-normal text-gray-500">{healthMetrics.water.unit}</span>
            </div>
            <Progress3D
              value={healthMetrics.water.consumed}
              max={healthMetrics.water.goal}
              className="mb-1"
              height="4px"
            />
            <p className="text-xs text-gray-500 mt-auto">
              Meta: {healthMetrics.water.goal} {healthMetrics.water.unit}
            </p>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="rounded-full bg-indigo-100 text-indigo-600 p-1.5 mr-2">
                <Moon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Sueño</span>
            </div>
            <div className="text-xl font-bold gradient-text mb-1">
              {healthMetrics.sleep.duration} <span className="text-sm font-normal text-gray-500">{healthMetrics.sleep.unit}</span>
            </div>
            <Progress3D
              value={healthMetrics.sleep.duration}
              max={healthMetrics.sleep.goal}
              className="mb-1"
              height="4px"
            />
            <p className="text-xs text-gray-500 mt-auto">
              Meta: {healthMetrics.sleep.goal} {healthMetrics.sleep.unit}
            </p>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="rounded-full bg-green-100 text-green-600 p-1.5 mr-2">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Pasos</span>
            </div>
            <div className="text-xl font-bold gradient-text mb-1">
              {healthMetrics.steps.count.toLocaleString()} <span className="text-sm font-normal text-gray-500">{healthMetrics.steps.unit}</span>
            </div>
            <Progress3D
              value={healthMetrics.steps.count}
              max={healthMetrics.steps.goal}
              className="mb-1"
              height="4px"
            />
            <p className="text-xs text-gray-500 mt-auto">
              Meta: {healthMetrics.steps.goal.toLocaleString()} {healthMetrics.steps.unit}
            </p>
          </div>
        </Card3D>
      </div>

      {/* Artículos de salud */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Artículos para ti</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/health/articles")}>
            Ver todos
          </Button3D>
        </div>

        <div className="space-y-4">
          {healthArticles.map((article) => (
            <Card3D key={article.id} className="overflow-hidden">
              <div className="relative h-32">
                <div className={`absolute inset-0 bg-gradient-to-r ${article.color} opacity-90`}></div>
                <div className="relative p-4 text-white h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-semibold mt-1">{article.title}</h3>
                    </div>

                    <Button3D
                      variant="glass"
                      size="icon"
                      className="h-8 w-8 text-white border-white/30"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button3D>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Lectura: {article.readTime}</span>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Recetas saludables */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recetas saludables</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/health/recipes")}>
            Ver todas
          </Button3D>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
          {healthyRecipes.map((recipe) => (
            <Card3D key={recipe.id} className="min-w-[200px] flex-shrink-0 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    {recipe.category}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Utensils className="h-3 w-3 mr-1" />
                    {recipe.calories} kcal
                  </div>
                </div>

                <h3 className="font-medium text-sm mb-2">{recipe.title}</h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {recipe.prepTime}
                  </div>

                  <Button3D
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => handleNavigate(`/health/recipes/${recipe.id}`)}
                  >
                    Ver receta
                  </Button3D>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Registro de comidas */}
      <Card3D>
        <Card3DHeader>
          <div className="flex justify-between items-center">
            <Card3DTitle gradient={true}>Registro de hoy</Card3DTitle>
            <Button3D
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("/health/food-log")}
            >
              Ver todo
            </Button3D>
          </div>
        </Card3DHeader>
        <Card3DContent>
          {nutritionLog.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 text-green-600 p-2 mr-3">
                    <Apple className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Desayuno</h3>
                    <p className="text-xs text-gray-500">Avena con frutas</p>
                  </div>
                </div>
                <span className="text-sm font-medium">320 kcal</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="rounded-full bg-amber-100 text-amber-600 p-2 mr-3">
                    <Utensils className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Almuerzo</h3>
                    <p className="text-xs text-gray-500">Ensalada de quinoa</p>
                  </div>
                </div>
                <span className="text-sm font-medium">450 kcal</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Utensils className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">No hay comidas registradas hoy</p>
              <Button3D
                variant="outline"
                className="mt-3"
                onClick={() => handleNavigate("/health/add-food")}
              >
                Registrar comida
              </Button3D>
            </div>
          )}
        </Card3DContent>
      </Card3D>
    </div>
  )
}
