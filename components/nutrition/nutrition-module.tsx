"use client"

import { useState, useEffect } from "react"
import {
  Utensils,
  Apple,
  BarChart3,
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Brain,
  BookOpen
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { MacroTracker } from "@/components/nutrition/macro-tracker"
import DietManager from "@/components/nutrition/diet-manager"
import { supabase } from "@/lib/supabase-client"
import { UserProfile } from "@/lib/types/user"
import { ExperienceConditional, ExperienceContent } from "@/components/ui/experience-conditional"
import { ExperienceModeToggle } from "@/components/ui/experience-mode-toggle"
import { useUserExperience } from "@/contexts/user-experience-context"
import { NutritionBasics } from "@/components/nutrition/beginner/nutrition-basics"

interface NutritionModuleProps {
  profile: UserProfile
}

export function NutritionModule({
  profile
}: NutritionModuleProps) {
  const [activeTab, setActiveTab] = useState('tracker')
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos de nutrición
  useEffect(() => {
    const loadNutritionData = async () => {
      setIsLoading(true)

      try {
        // Aquí cargaríamos datos adicionales si fuera necesario
      } catch (error) {
        console.error("Error al cargar datos de nutrición:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (profile) {
      loadNutritionData()
    }
  }, [profile])

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const { interfaceMode } = useUserExperience()

  return (
    <div className="w-full">
      {/* Encabezado con toggle de modo */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">Nutrición</h2>
        <ExperienceModeToggle variant="button" />
      </div>

      {/* Pestañas de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ExperienceConditional
          beginnerContent={
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="basics">Fundamentos</TabsTrigger>
              <TabsTrigger value="tracker">Diario</TabsTrigger>
              <TabsTrigger value="meals">Comidas</TabsTrigger>
              <TabsTrigger value="plans">Planes</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>
          }
          advancedContent={
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="tracker">Diario</TabsTrigger>
              <TabsTrigger value="meals">Comidas</TabsTrigger>
              <TabsTrigger value="plans">Planes</TabsTrigger>
              <TabsTrigger value="macros">Macros</TabsTrigger>
              <TabsTrigger value="recipes">Recetas</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>
          }
        />

        <TabsContent value="tracker" className="space-y-4">
          {profile && (
            <MacroTracker userId={profile.id} />
          )}
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>Mis comidas guardadas</Card3DTitle>

                <Button3D size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva comida
                </Button3D>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <div className="text-center py-8">
                <Apple className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin comidas guardadas</h3>
                <p className="text-sm text-gray-500">
                  Guarda tus comidas frecuentes para añadirlas rápidamente a tu diario.
                </p>
                <Button3D className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera comida
                </Button3D>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {profile && (
            <DietManager userId={profile.id} />
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Estadísticas de nutrición</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin datos suficientes</h3>
                <p className="text-sm text-gray-500">
                  Registra tu alimentación durante al menos una semana para ver estadísticas.
                </p>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        {/* Pestaña de fundamentos para principiantes */}
        <TabsContent value="basics" className="space-y-4">
          <ExperienceContent interfaceMode="beginner">
            <NutritionBasics />
          </ExperienceContent>
        </TabsContent>

        {/* Pestañas avanzadas */}
        <TabsContent value="macros" className="space-y-4">
          <ExperienceContent interfaceMode="advanced">
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Calculadora de macronutrientes avanzada</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Calculadora de macros personalizada</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Ajusta tus macronutrientes con precisión según tus objetivos específicos.
                  </p>
                  <Button3D>
                    Configurar macros
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
          </ExperienceContent>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <ExperienceContent interfaceMode="advanced">
            <Card3D>
              <Card3DHeader>
                <div className="flex justify-between items-center">
                  <Card3DTitle>Recetas personalizadas</Card3DTitle>
                  <Button3D size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva receta
                  </Button3D>
                </div>
              </Card3DHeader>
              <Card3DContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sin recetas guardadas</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea recetas personalizadas con cálculos precisos de macronutrientes.
                  </p>
                  <Button3D>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primera receta
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
          </ExperienceContent>
        </TabsContent>
      </Tabs>
    </div>
  )
}
