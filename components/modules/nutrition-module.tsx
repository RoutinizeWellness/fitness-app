"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Utensils, Clock, Calendar, Filter,
  ChevronRight, Plus, Bookmark, Share2,
  BarChart3, Apple, Flame, Coffee, Pizza,
  Salad, Beef, Egg, Carrot, Banana,
  Scale, User as UserIcon, Heart, Target,
  ChevronDown, ChevronUp, ThumbsUp, ThumbsDown,
  AlertTriangle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NutritionProfileComponent } from "@/components/nutrition/nutrition-profile"
import { WeightTracker } from "@/components/nutrition/weight-tracker"
import { FoodPreferences } from "@/components/nutrition/food-preferences"
import {
  getNutritionProfile,
  calculateBMR,
  calculateTDEE,
  calculateMacros
} from "@/lib/nutrition-profile-service"
import { NutritionProfile } from "@/lib/types/nutrition"

interface NutritionModuleProps {
  profile: User | null
  isAdmin: boolean
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function NutritionModule({
  profile,
  isAdmin,
  isLoading = false,
  onNavigate
}: NutritionModuleProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("daily")
  const [nutritionProfile, setNutritionProfile] = useState<NutritionProfile | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Cargar perfil nutricional
  useEffect(() => {
    const loadNutritionProfile = async () => {
      if (!profile?.id) return

      try {
        const { data, error } = await getNutritionProfile(profile.id)

        if (!error && data) {
          setNutritionProfile(data)
        }
      } catch (error) {
        console.error("Error al cargar perfil nutricional:", error)
      }
    }

    if (profile) {
      loadNutritionProfile()
    }
  }, [profile])

  // Categorías de nutrición
  const categories = [
    { id: "all", name: "Todos" },
    { id: "breakfast", name: "Desayuno" },
    { id: "lunch", name: "Almuerzo" },
    { id: "dinner", name: "Cena" },
    { id: "snacks", name: "Snacks" }
  ]

  // Datos para las comidas del día
  const meals = [
    {
      id: "meal1",
      title: "Desayuno",
      time: "08:30",
      calories: 420,
      icon: Coffee,
      color: "bg-amber-100 text-amber-600",
      items: [
        { name: "Avena con frutas", calories: 280 },
        { name: "Café con leche", calories: 140 }
      ]
    },
    {
      id: "meal2",
      title: "Almuerzo",
      time: "13:00",
      calories: 650,
      icon: Salad,
      color: "bg-green-100 text-green-600",
      items: [
        { name: "Ensalada de quinoa", calories: 320 },
        { name: "Pechuga de pollo", calories: 250 },
        { name: "Fruta", calories: 80 }
      ]
    },
    {
      id: "meal3",
      title: "Merienda",
      time: "17:00",
      calories: 180,
      icon: Apple,
      color: "bg-red-100 text-red-600",
      items: [
        { name: "Yogur con nueces", calories: 180 }
      ]
    },
    {
      id: "meal4",
      title: "Cena",
      time: "20:30",
      calories: 520,
      icon: Pizza,
      color: "bg-blue-100 text-blue-600",
      items: [
        { name: "Salmón al horno", calories: 320 },
        { name: "Verduras asadas", calories: 120 },
        { name: "Arroz integral", calories: 80 }
      ]
    }
  ]

  // Datos para las recetas recomendadas
  const recommendedRecipes = [
    {
      id: "recipe1",
      title: "Bowl de proteínas con quinoa",
      category: "Almuerzo",
      prepTime: "15 min",
      calories: 450,
      color: "from-green-500 to-teal-600"
    },
    {
      id: "recipe2",
      title: "Batido verde energizante",
      category: "Desayuno",
      prepTime: "5 min",
      calories: 220,
      color: "from-emerald-500 to-green-600"
    },
    {
      id: "recipe3",
      title: "Ensalada mediterránea",
      category: "Cena",
      prepTime: "10 min",
      calories: 320,
      color: "from-blue-500 to-indigo-600"
    }
  ]

  // Las métricas de nutrición se calculan dinámicamente a partir del perfil del usuario

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

  // Función para alternar secciones expandidas
  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  // Calcular métricas si hay perfil nutricional
  const calculateNutritionMetrics = () => {
    if (!nutritionProfile) return null

    // Asumimos una edad de 30 años para el cálculo (idealmente obtendríamos la edad real del usuario)
    const age = 30
    const gender = 'male' // Idealmente obtendríamos el género del perfil del usuario

    const bmr = calculateBMR(nutritionProfile.current_weight, nutritionProfile.height, age, gender)
    const tdee = calculateTDEE(bmr, nutritionProfile.activity_level)
    const macros = calculateMacros(tdee, nutritionProfile.goal, nutritionProfile.current_weight)

    return {
      bmr,
      tdee,
      macros
    }
  }

  const nutritionMetrics = nutritionProfile ? calculateNutritionMetrics() : null

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Nutrición</h1>
        <div className="flex items-center">
          <div className="h-1 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-3"></div>
          <p className="text-gray-500">
            Gestiona tu alimentación y descubre recetas saludables
          </p>
        </div>
      </div>

      {/* Pestañas de navegación con diseño mejorado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl h-16"></div>
          <TabsList className="relative z-10 grid grid-cols-4 bg-transparent border-0 p-1">
            <TabsTrigger
              value="daily"
              className="flex flex-col items-center py-3 px-1 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:rounded-xl data-[state=active]:text-green-600 transition-all duration-300"
            >
              <div className="relative">
                <Utensils className="h-5 w-5 mb-1 transition-transform duration-300 data-[state=active]:scale-110" />
                {activeTab === 'daily' && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </div>
              <span className="text-xs font-medium">Diario</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex flex-col items-center py-3 px-1 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:rounded-xl data-[state=active]:text-blue-600 transition-all duration-300"
            >
              <UserIcon className="h-5 w-5 mb-1 transition-transform duration-300 data-[state=active]:scale-110" />
              <span className="text-xs font-medium">Perfil</span>
            </TabsTrigger>
            <TabsTrigger
              value="weight"
              className="flex flex-col items-center py-3 px-1 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:rounded-xl data-[state=active]:text-purple-600 transition-all duration-300"
            >
              <Scale className="h-5 w-5 mb-1 transition-transform duration-300 data-[state=active]:scale-110" />
              <span className="text-xs font-medium">Peso</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex flex-col items-center py-3 px-1 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:rounded-xl data-[state=active]:text-red-600 transition-all duration-300"
            >
              <Heart className="h-5 w-5 mb-1 transition-transform duration-300 data-[state=active]:scale-110" />
              <span className="text-xs font-medium">Preferencias</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily" className="space-y-6">
          {/* Resumen de calorías con diseño mejorado */}
          <Card3D className="overflow-hidden border-0 shadow-xl rounded-2xl transform hover:scale-[1.01] transition-all duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 opacity-95"></div>
              <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative p-7 text-white">
                <div className="flex justify-between items-start mb-7">
                  <div>
                    <div className="flex items-center">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg mr-3">
                        <Flame className="h-5 w-5" />
                      </div>
                      <h2 className="text-2xl font-bold">Resumen de hoy</h2>
                    </div>
                    <p className="text-white/70 text-sm mt-2 ml-10">Seguimiento de macronutrientes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 shadow-lg">
                    <span className="text-2xl font-bold">{nutritionMetrics?.macros?.calories || 0}</span>
                    <span className="text-sm font-medium ml-1">kcal objetivo</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl mb-6 shadow-inner border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="bg-white/20 p-1.5 rounded-lg mr-2">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Consumido hoy</span>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">{nutritionMetrics?.macros ? Math.round(nutritionMetrics.macros.calories * 0.8) : 0} / {nutritionMetrics?.macros?.calories || 0} kcal</span>
                    </div>
                  </div>

                  <div className="relative h-4 bg-white/10 rounded-full mb-2 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-300 to-emerald-400 rounded-full"
                      style={{ width: `${nutritionMetrics?.macros ? Math.min(100, (nutritionMetrics.macros.calories * 0.8 / nutritionMetrics.macros.calories) * 100) : 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </div>

                    {/* Marcadores de progreso */}
                    <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/20"></div>
                    <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/20"></div>
                    <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/20"></div>
                  </div>

                  <div className="flex justify-between text-xs text-white/70">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>

                  <div className="text-sm text-white/90 text-center mt-3 font-medium">
                    {nutritionMetrics?.macros ? Math.round((nutritionMetrics.macros.calories * 0.8 / nutritionMetrics.macros.calories) * 100) : 0}% del objetivo diario completado
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-inner hover:bg-white/15 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-400/30 p-1.5 rounded-lg mr-2">
                        <Beef className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">Proteínas</p>
                    </div>
                    <p className="text-lg font-bold ml-8">{nutritionMetrics?.macros ? Math.round(nutritionMetrics.macros.protein * 0.8) : 0}g</p>
                    <p className="text-xs text-white/70 ml-8">de {nutritionMetrics?.macros?.protein || 0}g</p>
                    <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-300 to-blue-400 rounded-full"
                        style={{ width: `${nutritionMetrics?.macros ? Math.min(100, (nutritionMetrics.macros.protein * 0.8 / nutritionMetrics.macros.protein) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-inner hover:bg-white/15 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-orange-400/30 p-1.5 rounded-lg mr-2">
                        <Carrot className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">Carbos</p>
                    </div>
                    <p className="text-lg font-bold ml-8">{nutritionMetrics?.macros ? Math.round(nutritionMetrics.macros.carbs * 0.8) : 0}g</p>
                    <p className="text-xs text-white/70 ml-8">de {nutritionMetrics?.macros?.carbs || 0}g</p>
                    <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-full"
                        style={{ width: `${nutritionMetrics?.macros ? Math.min(100, (nutritionMetrics.macros.carbs * 0.8 / nutritionMetrics.macros.carbs) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-inner hover:bg-white/15 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-yellow-400/30 p-1.5 rounded-lg mr-2">
                        <Egg className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">Grasas</p>
                    </div>
                    <p className="text-lg font-bold ml-8">{nutritionMetrics?.macros ? Math.round(nutritionMetrics.macros.fat * 0.8) : 0}g</p>
                    <p className="text-xs text-white/70 ml-8">de {nutritionMetrics?.macros?.fat || 0}g</p>
                    <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
                        style={{ width: `${nutritionMetrics?.macros ? Math.min(100, (nutritionMetrics.macros.fat * 0.8 / nutritionMetrics.macros.fat) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card3D>

          {/* Comidas del día con diseño mejorado */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-lg mr-3 shadow-md">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Comidas de hoy</h2>
                  <p className="text-sm text-gray-500">Registro de alimentación diaria</p>
                </div>
              </div>
              <Button3D
                variant="gradient"
                size="sm"
                className="rounded-xl shadow-sm"
                onClick={() => handleNavigate("/nutrition/add-meal")}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="font-medium">Añadir comida</span>
              </Button3D>
            </div>

            <div className="relative">
              {/* Línea de tiempo vertical */}
              <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-300 via-emerald-300 to-teal-300 rounded-full"></div>

              <div className="space-y-6">
                {meals.map((meal, index) => (
                  <Card3D
                    key={meal.id}
                    className="p-0 border-0 shadow-lg overflow-hidden group relative transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl"
                  >
                    <div className="flex">
                      {/* Indicador de tiempo con icono */}
                      <div className="relative w-14 bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col items-center justify-start pt-5 border-r border-gray-100">
                        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-green-400 z-10"></div>
                        <div className="text-xs font-bold text-gray-500 mt-6 -rotate-90 origin-center whitespace-nowrap">
                          {meal.time}
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Encabezado de la comida */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className={`rounded-full ${meal.color} p-3 mr-3 shadow-sm group-hover:scale-110 transition-transform`}>
                              <meal.icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-800">{meal.title}</h3>
                            <div className="ml-auto flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                              <Flame className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-sm font-bold text-gray-700">{meal.calories} kcal</span>
                            </div>
                          </div>
                        </div>

                        {/* Contenido de la comida */}
                        <div className="p-4">
                          <div className="space-y-3">
                            {meal.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-50"
                              >
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-green-400 mr-3"></div>
                                  <span className="text-gray-800 font-medium">{item.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 font-medium">{item.calories} kcal</span>
                                  <div className="ml-3 w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                      style={{ width: `${(item.calories / meal.calories) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end mt-4">
                            <Button3D
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors"
                              onClick={() => handleNavigate(`/nutrition/meals/${meal.id}`)}
                            >
                              <span className="text-sm flex items-center font-medium text-green-700">
                                Ver detalles
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </span>
                            </Button3D>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>

            {/* Botón para ver historial completo */}
            <div className="flex justify-center mt-6">
              <Button3D
                variant="outline"
                className="rounded-xl border-gray-200 hover:border-green-300 transition-colors"
                onClick={() => handleNavigate("/nutrition/history")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="font-medium">Ver historial completo</span>
              </Button3D>
            </div>
          </div>

          {/* Recetas recomendadas con diseño mejorado */}
          <div className="mt-10">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-md">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recetas recomendadas</h2>
                <p className="text-sm text-gray-500">Personalizadas según tus preferencias</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {recommendedRecipes.map((recipe) => (
                <Card3D
                  key={recipe.id}
                  className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]"
                >
                  <div className="relative">
                    {/* Imagen de fondo con gradiente */}
                    <div className="relative h-32">
                      <div className={`absolute inset-0 bg-gradient-to-br ${recipe.color} opacity-95`}></div>
                      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      {/* Etiqueta de categoría */}
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-flex items-center shadow-sm">
                          <Utensils className="h-3 w-3 mr-1" />
                          {recipe.category}
                        </span>
                      </div>

                      {/* Botón de guardar */}
                      <div className="absolute top-3 right-3">
                        <Button3D
                          variant="glass"
                          size="icon"
                          className="h-8 w-8 text-white border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button3D>
                      </div>

                      {/* Título de la receta */}
                      <div className="absolute bottom-3 left-3 right-12">
                        <h3 className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform line-clamp-1">{recipe.title}</h3>
                      </div>
                    </div>

                    {/* Información nutricional */}
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5 text-blue-600 mr-1" />
                            <span className="text-xs font-medium text-blue-700">{recipe.prepTime}</span>
                          </div>
                          <div className="flex items-center bg-orange-50 px-2 py-1 rounded-lg">
                            <Flame className="h-3.5 w-3.5 text-orange-600 mr-1" />
                            <span className="text-xs font-medium text-orange-700">{recipe.calories} kcal</span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Macronutrientes */}
                      <div className="mt-3 grid grid-cols-3 gap-1">
                        <div className="bg-gray-50 rounded-lg p-1.5 text-center">
                          <div className="text-[10px] text-gray-500">Proteínas</div>
                          <div className="text-xs font-bold text-gray-700">{Math.round(recipe.calories * 0.3 / 4)}g</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-1.5 text-center">
                          <div className="text-[10px] text-gray-500">Carbos</div>
                          <div className="text-xs font-bold text-gray-700">{Math.round(recipe.calories * 0.4 / 4)}g</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-1.5 text-center">
                          <div className="text-[10px] text-gray-500">Grasas</div>
                          <div className="text-xs font-bold text-gray-700">{Math.round(recipe.calories * 0.3 / 9)}g</div>
                        </div>
                      </div>

                      {/* Botón de ver receta */}
                      <Button3D
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 rounded-lg border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        onClick={() => handleNavigate(`/nutrition/recipes/${recipe.id}`)}
                      >
                        <span className="text-xs flex items-center justify-center font-medium text-blue-700">
                          Ver receta
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </span>
                      </Button3D>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>

            {/* Botón para ver todas las recetas */}
            <div className="flex justify-center mt-6">
              <Button3D
                variant="gradient"
                className="rounded-xl shadow-sm"
                onClick={() => handleNavigate("/nutrition/recipes")}
              >
                <Utensils className="h-4 w-4 mr-2" />
                <span className="font-medium">Explorar todas las recetas</span>
              </Button3D>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          {profile && (
            <NutritionProfileComponent
              userId={profile.id}
              onProfileUpdate={setNutritionProfile}
            />
          )}
        </TabsContent>

        <TabsContent value="weight">
          {profile && (
            <WeightTracker
              userId={profile.id}
              initialWeight={nutritionProfile?.initial_weight}
              targetWeight={nutritionProfile?.target_weight}
            />
          )}
        </TabsContent>

        <TabsContent value="preferences">
          {profile && (
            <FoodPreferences userId={profile.id} />
          )}
        </TabsContent>
      </Tabs>

      {/* Análisis nutricional - Solo para admin */}
      {isAdmin && (
        <Card3D className="border-0 shadow-xl overflow-hidden rounded-2xl transform hover:scale-[1.01] transition-all duration-300">
          <Card3DHeader className="border-b border-indigo-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 backdrop-blur-md p-2 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <Card3DTitle className="text-xl text-white">Panel de Nutrición</Card3DTitle>
                <p className="text-xs text-white/70">Análisis y gestión de dietas</p>
              </div>
              <Badge variant="outline" className="ml-2 bg-white/20 text-white border-white/30 backdrop-blur-md">
                Admin
              </Badge>
            </div>
          </Card3DHeader>
          <Card3DContent className="p-0">
            {/* Resumen de estadísticas */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50">
              <h3 className="text-sm font-semibold mb-3 text-indigo-800 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-indigo-600" />
                Estadísticas generales
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                    <span className="text-sm font-medium text-indigo-700">Este mes</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-800">
                    2,150
                  </div>
                  <p className="text-xs text-indigo-600 mt-1">Promedio kcal/día</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-purple-700">Adherencia</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    78%
                  </div>
                  <p className="text-xs text-purple-600 mt-1">A planes nutricionales</p>
                </div>
              </div>

              {/* Distribución de macronutrientes */}
              <h3 className="text-sm font-semibold mb-3 text-indigo-800 flex items-center">
                <Flame className="h-4 w-4 mr-2 text-indigo-600" />
                Distribución de macronutrientes
              </h3>

              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-xs font-medium text-gray-700">Proteínas</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">22%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '22%' }}></div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs font-medium text-gray-700">Carbohidratos</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">48%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '48%' }}></div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span className="text-xs font-medium text-gray-700">Grasas</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">30%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>

            {/* Preferencias alimentarias */}
            <div className="p-5 border-t border-indigo-100">
              <h3 className="text-sm font-semibold mb-3 text-gray-700 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-pink-500" />
                Preferencias alimentarias de los usuarios
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center bg-green-50 p-2 rounded-lg border border-green-100">
                  <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                  <div>
                    <div className="text-xs font-medium text-green-700">Vegetales</div>
                    <div className="text-xs text-green-600">78% de usuarios</div>
                  </div>
                </div>

                <div className="flex items-center bg-green-50 p-2 rounded-lg border border-green-100">
                  <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                  <div>
                    <div className="text-xs font-medium text-green-700">Frutas</div>
                    <div className="text-xs text-green-600">72% de usuarios</div>
                  </div>
                </div>

                <div className="flex items-center bg-red-50 p-2 rounded-lg border border-red-100">
                  <ThumbsDown className="h-4 w-4 text-red-500 mr-2" />
                  <div>
                    <div className="text-xs font-medium text-red-700">Lácteos</div>
                    <div className="text-xs text-red-600">45% de usuarios</div>
                  </div>
                </div>

                <div className="flex items-center bg-purple-50 p-2 rounded-lg border border-purple-100">
                  <AlertTriangle className="h-4 w-4 text-purple-500 mr-2" />
                  <div>
                    <div className="text-xs font-medium text-purple-700">Gluten</div>
                    <div className="text-xs text-purple-600">23% de usuarios</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button3D
                  variant="outline"
                  className="flex-1 rounded-xl border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  onClick={() => handleNavigate("/admin/nutrition-clients")}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Gestionar clientes</span>
                </Button3D>

                <Button3D
                  variant="gradient"
                  className="flex-1 rounded-xl shadow-sm"
                  onClick={() => handleNavigate("/admin/nutrition-stats")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="font-medium">Análisis detallado</span>
                </Button3D>
              </div>
            </div>
          </Card3DContent>
        </Card3D>
      )}

      {/* Botón flotante para añadir comida con menú desplegable */}
      <div className="fixed bottom-20 right-4 z-50">
        <div className="relative group">
          {/* Menú flotante que aparece al hacer hover */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col space-y-2 border border-gray-100">
              <Button3D
                variant="outline"
                size="sm"
                className="rounded-xl border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-start px-4"
                onClick={() => handleNavigate("/nutrition/add-meal")}
              >
                <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
                  <Utensils className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Añadir comida</span>
              </Button3D>

              <Button3D
                variant="outline"
                size="sm"
                className="rounded-xl border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-start px-4"
                onClick={() => handleNavigate("/nutrition/add-recipe")}
              >
                <div className="bg-purple-100 p-1.5 rounded-lg mr-2">
                  <Bookmark className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Guardar receta</span>
              </Button3D>

              <Button3D
                variant="outline"
                size="sm"
                className="rounded-xl border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-start px-4"
                onClick={() => handleNavigate("/nutrition/log-weight")}
              >
                <div className="bg-orange-100 p-1.5 rounded-lg mr-2">
                  <Scale className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium">Registrar peso</span>
              </Button3D>
            </div>

            {/* Flecha indicadora */}
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-100"></div>
          </div>

          {/* Botón principal */}
          <Button3D
            size="icon"
            className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-green-600 to-emerald-600 border-none hover:shadow-green-200 hover:scale-105 transition-all duration-300"
            onClick={() => handleNavigate("/nutrition/add-food")}
          >
            <Plus className="h-7 w-7 text-white" />
          </Button3D>
        </div>
      </div>
    </div>
  )
}
