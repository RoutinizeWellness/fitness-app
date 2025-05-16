"use client"

import { useState } from "react"
import { EnhancedOrganicLayout } from "@/components/enhanced-organic-layout"
import { PersonalizedDataCard } from "@/components/ui/personalized-data-card"
import { PersonalizedRecommendationCard } from "@/components/ui/personalized-recommendation-card"
import { PersonalizedProgressChart } from "@/components/ui/personalized-progress-chart"
import { OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dumbbell, 
  Apple, 
  Heart, 
  Moon, 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart2,
  Plus,
  Calendar,
  Clock,
  Activity
} from "lucide-react"

export default function DesignExamplePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Datos de ejemplo para gráficos
  const progressData = [
    { date: "01/01", strength: 100, endurance: 80, recovery: 90 },
    { date: "01/08", strength: 105, endurance: 82, recovery: 85 },
    { date: "01/15", strength: 110, endurance: 85, recovery: 88 },
    { date: "01/22", strength: 108, endurance: 90, recovery: 92 },
    { date: "01/29", strength: 115, endurance: 88, recovery: 90 },
    { date: "02/05", strength: 120, endurance: 92, recovery: 93 },
    { date: "02/12", strength: 125, endurance: 95, recovery: 91 },
  ]
  
  const bodyCompositionData = [
    { date: "01/01", weight: 80, bodyFat: 18, muscleMass: 65 },
    { date: "01/15", weight: 79, bodyFat: 17.5, muscleMass: 65.5 },
    { date: "02/01", weight: 78.5, bodyFat: 17, muscleMass: 66 },
    { date: "02/15", weight: 78, bodyFat: 16.5, muscleMass: 66.5 },
    { date: "03/01", weight: 77.5, bodyFat: 16, muscleMass: 67 },
  ]
  
  const timeRanges = [
    { label: "1 mes", value: "1m" },
    { label: "3 meses", value: "3m" },
    { label: "6 meses", value: "6m" },
    { label: "1 año", value: "1y" },
    { label: "Todo", value: "all" },
  ]
  
  return (
    <EnhancedOrganicLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="Diseño Mejorado"
      showFloatingAction={true}
      floatingActionIcon={<Plus className="h-6 w-6" />}
      onFloatingActionClick={() => alert("Acción flotante")}
      notifications={3}
      isTrainer={true}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Diseño Mejorado</h1>
        <p className="text-muted-foreground">
          Este es un ejemplo de cómo se vería la aplicación con el diseño mejorado para hiperpersonalización.
        </p>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard Personalizado</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <PersonalizedDataCard
                title="Fuerza"
                value={125}
                formatter={(value) => `${value} kg`}
                icon={<Dumbbell className="h-5 w-5" />}
                description="Peso máximo en press de banca"
                trend={{ value: 5, isPositive: true }}
                category="training"
                animationDelay={0.1}
              />
              
              <PersonalizedDataCard
                title="Calorías"
                value={2450}
                formatter={(value) => `${value} kcal`}
                icon={<Apple className="h-5 w-5" />}
                description="Consumo diario promedio"
                trend={{ value: 3, isPositive: true }}
                category="nutrition"
                animationDelay={0.2}
              />
              
              <PersonalizedDataCard
                title="Recuperación"
                value={85}
                formatter={(value) => `${value}%`}
                icon={<Heart className="h-5 w-5" />}
                description="Índice de recuperación"
                trend={{ value: 2, isPositive: false }}
                category="wellness"
                priority="medium"
                animationDelay={0.3}
              />
              
              <PersonalizedDataCard
                title="Sueño"
                value={7.5}
                formatter={(value) => `${value} h`}
                icon={<Moon className="h-5 w-5" />}
                description="Promedio últimos 7 días"
                trend={{ value: 8, isPositive: true }}
                category="sleep"
                animationDelay={0.4}
              />
            </div>
            
            <PersonalizedProgressChart
              title="Progreso de Entrenamiento"
              description="Evolución de tus métricas principales"
              data={progressData}
              dataKeys={["strength", "endurance", "recovery"]}
              timeRanges={timeRanges}
              defaultTimeRange="3m"
              onRefresh={() => console.log("Refrescando datos")}
              onExport={() => console.log("Exportando datos")}
              animationDelay={0.5}
            />
            
            <Card className="card-organic">
              <CardHeader>
                <CardTitle>Próximos Entrenamientos</CardTitle>
                <CardDescription>Tus sesiones programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <OrganicStaggeredList>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Entrenamiento de {i === 1 ? 'Pecho' : i === 2 ? 'Espalda' : 'Piernas'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {i === 1 ? 'Hoy' : i === 2 ? 'Mañana' : 'En 2 días'} · {i === 1 ? '60' : i === 2 ? '45' : '75'} min
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                  ))}
                </OrganicStaggeredList>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver todos los entrenamientos</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Visualización de Datos</h2>
            
            <PersonalizedProgressChart
              title="Composición Corporal"
              description="Seguimiento de peso y composición"
              data={bodyCompositionData}
              dataKeys={["weight", "bodyFat", "muscleMass"]}
              chartType="area"
              timeRanges={timeRanges}
              defaultTimeRange="3m"
              onRefresh={() => console.log("Refrescando datos")}
              onExport={() => console.log("Exportando datos")}
              animationDelay={0.1}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <PersonalizedDataCard
                title="Volumen de entrenamiento"
                value={12500}
                formatter={(value) => `${value.toLocaleString()} kg`}
                icon={<Activity className="h-5 w-5" />}
                description="Volumen total semanal"
                trend={{ value: 12, isPositive: true }}
                category="training"
                variant="glass"
                animationDelay={0.2}
              />
              
              <PersonalizedDataCard
                title="Tiempo de entrenamiento"
                value={240}
                formatter={(value) => `${value} min`}
                icon={<Clock className="h-5 w-5" />}
                description="Tiempo total semanal"
                trend={{ value: 5, isPositive: true }}
                category="training"
                variant="glass"
                animationDelay={0.3}
              />
            </div>
            
            <PersonalizedProgressChart
              title="Métricas de Rendimiento"
              description="Comparación de diferentes métricas"
              data={progressData}
              dataKeys={["strength", "endurance", "recovery"]}
              chartType="radar"
              timeRanges={timeRanges}
              defaultTimeRange="3m"
              onRefresh={() => console.log("Refrescando datos")}
              onExport={() => console.log("Exportando datos")}
              animationDelay={0.4}
            />
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Recomendaciones Personalizadas</h2>
            
            <OrganicStaggeredList>
              <PersonalizedRecommendationCard
                title="Aumentar volumen de entrenamiento"
                description="Tus resultados muestran una excelente respuesta al volumen alto. Considera aumentar el número de series por grupo muscular en un 15-20%."
                type="training"
                priority="high"
                dataPoints={{
                  responseToVolume: 8.5,
                  currentFatigue: 65
                }}
                created={new Date().toISOString()}
                onImplement={() => console.log("Implementando recomendación")}
                animationDelay={0.1}
              />
              
              <PersonalizedRecommendationCard
                title="Ajustar distribución de macronutrientes"
                description="Basado en tu perfil metabólico y objetivos, recomendamos aumentar la ingesta de proteínas a 2.2g por kg de peso corporal y reducir ligeramente los carbohidratos."
                type="nutrition"
                priority="medium"
                dataPoints={{
                  proteinIntake: 1.8,
                  carbIntake: 3.5,
                  metabolicRate: 2450
                }}
                created={new Date(Date.now() - 86400000).toISOString()}
                implemented={true}
                result="Se ha ajustado el plan nutricional con la nueva distribución de macronutrientes"
                animationDelay={0.2}
              />
              
              <PersonalizedRecommendationCard
                title="Mejorar estrategias de recuperación"
                description="Tu capacidad de recuperación es baja y tu fatiga actual es alta. Considera implementar técnicas de recuperación activa como yoga, estiramientos o baños de contraste."
                type="recovery"
                priority="high"
                dataPoints={{
                  recoveryCapacity: 3.5,
                  currentFatigue: 85
                }}
                created={new Date(Date.now() - 172800000).toISOString()}
                onImplement={() => console.log("Implementando recomendación")}
                animationDelay={0.3}
              />
            </OrganicStaggeredList>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedOrganicLayout>
  )
}
