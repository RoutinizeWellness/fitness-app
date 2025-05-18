"use client"

import { useState } from "react"
import { UnifiedNavigation } from "@/components/unified-navigation"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressCircle } from "@/components/ui/progress-circle"
import { BarChart } from "@/components/ui/bar-chart"
import { ActivityCard } from "@/components/ui/activity-card"
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from "@/components/ui/enhanced-card"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Heart, Brain, Utensils, Moon, Activity, Calendar, Clock, Flame, Trophy } from "lucide-react"

export default function DashboardDemo() {
  const [activeTab, setActiveTab] = useState("overview")

  // Datos de ejemplo para las estadísticas
  const statsData = {
    workouts: {
      completed: 24,
      previousCompleted: 18,
      streak: 5,
      previousStreak: 3,
      calories: 12450,
      previousCalories: 10200,
    },
    nutrition: {
      caloriesAvg: 2150,
      previousCaloriesAvg: 2300,
      proteinsAvg: 120,
      previousProteinsAvg: 100,
      waterAvg: 2.4,
      previousWaterAvg: 2.1,
    },
    sleep: {
      avgHours: 7.2,
      previousAvgHours: 6.8,
      quality: 85,
      previousQuality: 75,
    },
    wellness: {
      mindfulMinutes: 240,
      previousMindfulMinutes: 180,
      stressScore: 65,
      previousStressScore: 75,
    }
  }

  // Datos de ejemplo para el gráfico de barras
  const weeklyWorkoutData = [
    { label: "Lun", value: 45 },
    { label: "Mar", value: 60 },
    { label: "Mié", value: 30 },
    { label: "Jue", value: 75 },
    { label: "Vie", value: 50 },
    { label: "Sáb", value: 90 },
    { label: "Dom", value: 0 },
  ]

  const weeklyNutritionData = [
    { label: "Lun", value: 2100 },
    { label: "Mar", value: 2250 },
    { label: "Mié", value: 1950 },
    { label: "Jue", value: 2300 },
    { label: "Vie", value: 2150 },
    { label: "Sáb", value: 2400 },
    { label: "Dom", value: 2500 },
  ]

  const weeklySleepData = [
    { label: "Lun", value: 7.5 },
    { label: "Mar", value: 6.8 },
    { label: "Mié", value: 7.2 },
    { label: "Jue", value: 8.0 },
    { label: "Vie", value: 6.5 },
    { label: "Sáb", value: 8.5 },
    { label: "Dom", value: 7.8 },
  ]

  // Datos de ejemplo para actividades recientes
  const recentActivities = [
    {
      id: "1",
      title: "Entrenamiento completado",
      description: "Rutina de fuerza - Piernas y glúteos",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: <Dumbbell className="h-4 w-4" />,
      status: "completed",
      category: "Entrenamiento"
    },
    {
      id: "2",
      title: "Comida registrada",
      description: "Desayuno: Avena con frutas y proteína",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: <Utensils className="h-4 w-4" />,
      status: "completed",
      category: "Nutrición"
    },
    {
      id: "3",
      title: "Sueño registrado",
      description: "7.5 horas - Calidad: Buena",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      icon: <Moon className="h-4 w-4" />,
      status: "completed",
      category: "Sueño"
    },
    {
      id: "4",
      title: "Sesión de meditación",
      description: "Meditación guiada - 15 minutos",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: <Brain className="h-4 w-4" />,
      status: "completed",
      category: "Bienestar"
    },
    {
      id: "5",
      title: "Objetivo alcanzado",
      description: "5 entrenamientos completados esta semana",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: <Trophy className="h-4 w-4" />,
      status: "completed",
      category: "Logros"
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visualiza tu progreso y actividades recientes</p>
          </div>
          <ThemeSwitcher />
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="training">Entrenamiento</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
            <TabsTrigger value="sleep">Sueño</TabsTrigger>
            <TabsTrigger value="wellness">Bienestar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Entrenamientos"
                value={statsData.workouts.completed}
                previousValue={statsData.workouts.previousCompleted}
                icon={<Dumbbell className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="blue"
              />
              
              <StatCard
                title="Calorías Promedio"
                value={statsData.nutrition.caloriesAvg}
                previousValue={statsData.nutrition.previousCaloriesAvg}
                unit="kcal"
                icon={<Flame className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="orange"
              />
              
              <StatCard
                title="Horas de Sueño"
                value={statsData.sleep.avgHours}
                previousValue={statsData.sleep.previousAvgHours}
                unit="h"
                icon={<Moon className="h-5 w-5" />}
                description="Promedio diario este mes"
                colorScheme="purple"
              />
              
              <StatCard
                title="Minutos Mindfulness"
                value={statsData.wellness.mindfulMinutes}
                previousValue={statsData.wellness.previousMindfulMinutes}
                unit="min"
                icon={<Brain className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="green"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard className="lg:col-span-2">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Actividad Semanal</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <BarChart
                    data={weeklyWorkoutData}
                    height={200}
                    unit="min"
                    colorScheme="blue"
                  />
                </EnhancedCardContent>
              </EnhancedCard>
              
              <ActivityCard
                title="Actividades Recientes"
                items={recentActivities}
                maxItems={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Progreso de Objetivos</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <ProgressCircle
                    value={75}
                    size="lg"
                    colorScheme="gradient"
                    label="Completado"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Objetivo mensual: 30 entrenamientos
                    </p>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
              
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Calidad del Sueño</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <ProgressCircle
                    value={statsData.sleep.quality}
                    size="lg"
                    colorScheme="purple"
                    label="Calidad"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Promedio de este mes
                    </p>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
              
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Nivel de Estrés</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <ProgressCircle
                    value={statsData.wellness.stressScore}
                    size="lg"
                    colorScheme="green"
                    label="Controlado"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Basado en actividades de bienestar
                    </p>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Entrenamientos"
                value={statsData.workouts.completed}
                previousValue={statsData.workouts.previousCompleted}
                icon={<Dumbbell className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="blue"
              />
              
              <StatCard
                title="Racha Actual"
                value={statsData.workouts.streak}
                previousValue={statsData.workouts.previousStreak}
                unit=" días"
                icon={<Activity className="h-5 w-5" />}
                description="Entrenamientos consecutivos"
                colorScheme="blue"
              />
              
              <StatCard
                title="Calorías Quemadas"
                value={statsData.workouts.calories}
                previousValue={statsData.workouts.previousCalories}
                unit="kcal"
                icon={<Flame className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="blue"
              />
              
              <StatCard
                title="Próxima Sesión"
                value="Hoy"
                icon={<Calendar className="h-5 w-5" />}
                description="Entrenamiento de fuerza - 18:00"
                colorScheme="blue"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard className="lg:col-span-2">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Minutos de Entrenamiento</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <BarChart
                    data={weeklyWorkoutData}
                    height={250}
                    unit="min"
                    colorScheme="blue"
                  />
                </EnhancedCardContent>
              </EnhancedCard>
              
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Progreso de Objetivos</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <ProgressCircle
                    value={75}
                    size="lg"
                    colorScheme="blue"
                    label="Completado"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Objetivo mensual: 30 entrenamientos
                    </p>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Calorías Promedio"
                value={statsData.nutrition.caloriesAvg}
                previousValue={statsData.nutrition.previousCaloriesAvg}
                unit="kcal"
                icon={<Flame className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="orange"
              />
              
              <StatCard
                title="Proteínas Promedio"
                value={statsData.nutrition.proteinsAvg}
                previousValue={statsData.nutrition.previousProteinsAvg}
                unit="g"
                icon={<Utensils className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="orange"
              />
              
              <StatCard
                title="Agua Promedio"
                value={statsData.nutrition.waterAvg}
                previousValue={statsData.nutrition.previousWaterAvg}
                unit="L"
                icon={<Utensils className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="orange"
              />
              
              <StatCard
                title="Próxima Comida"
                value="Almuerzo"
                icon={<Clock className="h-5 w-5" />}
                description="Sugerido: Ensalada con pollo"
                colorScheme="orange"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard className="lg:col-span-2">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Calorías Diarias</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <BarChart
                    data={weeklyNutritionData}
                    height={250}
                    unit="kcal"
                    colorScheme="orange"
                  />
                </EnhancedCardContent>
              </EnhancedCard>
              
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Distribución de Macros</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="flex flex-col items-center">
                      <ProgressCircle
                        value={30}
                        size="md"
                        colorScheme="orange"
                        label="Proteínas"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <ProgressCircle
                        value={45}
                        size="md"
                        colorScheme="blue"
                        label="Carbos"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <ProgressCircle
                        value={25}
                        size="md"
                        colorScheme="green"
                        label="Grasas"
                      />
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </TabsContent>
          
          <TabsContent value="sleep" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Horas de Sueño"
                value={statsData.sleep.avgHours}
                previousValue={statsData.sleep.previousAvgHours}
                unit="h"
                icon={<Moon className="h-5 w-5" />}
                description="Promedio diario este mes"
                colorScheme="purple"
              />
              
              <StatCard
                title="Calidad del Sueño"
                value={statsData.sleep.quality}
                previousValue={statsData.sleep.previousQuality}
                unit="%"
                icon={<Activity className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="purple"
              />
              
              <StatCard
                title="Hora de Dormir"
                value="23:15"
                icon={<Clock className="h-5 w-5" />}
                description="Promedio este mes"
                colorScheme="purple"
              />
              
              <StatCard
                title="Hora de Despertar"
                value="6:30"
                icon={<Clock className="h-5 w-5" />}
                description="Promedio este mes"
                colorScheme="purple"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard className="lg:col-span-2">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Horas de Sueño</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <BarChart
                    data={weeklySleepData}
                    height={250}
                    unit="h"
                    colorScheme="purple"
                  />
                </EnhancedCardContent>
              </EnhancedCard>
              
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Calidad del Sueño</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <ProgressCircle
                    value={statsData.sleep.quality}
                    size="lg"
                    colorScheme="purple"
                    label="Calidad"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Basado en tiempo de sueño profundo
                    </p>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </TabsContent>
          
          <TabsContent value="wellness" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Minutos Mindfulness"
                value={statsData.wellness.mindfulMinutes}
                previousValue={statsData.wellness.previousMindfulMinutes}
                unit="min"
                icon={<Brain className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="green"
              />
              
              <StatCard
                title="Nivel de Estrés"
                value={statsData.wellness.stressScore}
                previousValue={statsData.wellness.previousStressScore}
                unit="%"
                icon={<Activity className="h-5 w-5" />}
                description="Este mes (menor es mejor)"
                colorScheme="green"
                trend={statsData.wellness.stressScore < statsData.wellness.previousStressScore ? "up" : "down"}
              />
              
              <StatCard
                title="Sesiones de Meditación"
                value={12}
                previousValue={8}
                icon={<Brain className="h-5 w-5" />}
                description="Este mes vs. mes anterior"
                colorScheme="green"
              />
              
              <StatCard
                title="Próxima Sesión"
                value="Hoy"
                icon={<Calendar className="h-5 w-5" />}
                description="Meditación guiada - 20:00"
                colorScheme="green"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard className="lg:col-span-2">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Actividades de Bienestar</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <ActivityCard
                    title="Actividades Recientes"
                    items={recentActivities.filter(a => a.category === "Bienestar")}
                    maxItems={4}
                    emptyMessage="No hay actividades de bienestar recientes"
                  />
                </EnhancedCardContent>
              </EnhancedCard>
              
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Nivel de Estrés</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="flex flex-col items-center">
                  <ProgressCircle
                    value={statsData.wellness.stressScore}
                    size="lg"
                    colorScheme="green"
                    label="Controlado"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Basado en actividades de bienestar
                    </p>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
