"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { AIRecommendations } from "@/components/admin/ai-recommendations"
import { generateGlobalRecommendations, AIRecommendation } from "@/lib/admin-ai-recommendations"
import {
  Dumbbell,
  Users,
  Utensils,
  Moon,
  Brain,
  BarChart,
  Settings,
  AlertTriangle,
  Loader2,
  Activity,
  Bell,
  FileText,
  Calendar,
  PieChart,
  Zap,
  Database,
  Shield,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminAdvancedAnalytics } from "@/components/admin/admin-advanced-analytics"
import { supabase } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Card3D, Card3DHeader, Card3DTitle, Card3DContent, Card3DFooter } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("modules")
  const [userCount, setUserCount] = useState<number | null>(null)
  const [routineCount, setRoutineCount] = useState<number | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  // Cargar estadísticas básicas y recomendaciones
  useEffect(() => {
    if (isAdmin) {
      loadBasicStats();
      loadRecommendations();
    }
  }, [isAdmin]);

  // Cargar recomendaciones de IA
  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const { data, error } = await generateGlobalRecommendations();

      if (error) throw error;

      if (data) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones de IA",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const loadBasicStats = async () => {
    setIsLoadingStats(true);
    try {
      // Obtener conteo de usuarios
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (userError) throw userError;
      setUserCount(userData.count || 0);

      // Obtener conteo de rutinas
      const { data: routineData, error: routineError } = await supabase
        .from('workout_routines')
        .select('id', { count: 'exact', head: true });

      if (routineError) throw routineError;
      setRoutineCount(routineData.count || 0);

    } catch (error) {
      console.error("Error al cargar estadísticas básicas:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // No need to check for admin here as the AdminLayout component handles this

  return (
    <AdminLayout title="Panel de Administración">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <Users className="h-4 w-4 mr-2" />
              {isLoadingStats ? "..." : userCount} usuarios
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <Dumbbell className="h-4 w-4 mr-2" />
              {isLoadingStats ? "..." : routineCount} rutinas
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={loadBasicStats} disabled={isLoadingStats}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-4 rounded-full p-1">
            <TabsTrigger value="modules" className="flex items-center justify-center rounded-full">
              <Zap className="h-4 w-4 mr-2" />
              Módulos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center justify-center rounded-full">
              <BarChart className="h-4 w-4 mr-2" />
              Analíticas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center rounded-full">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Módulo de Usuarios */}
              <Card organic={true} hover={true} className="p-6">
                <OrganicSection
                  title="Gestión de Usuarios"
                  icon={
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  }
                >
                  <p className="text-muted-foreground mb-4">
                    Administra usuarios, asigna roles y gestiona permisos.
                  </p>
                  <Button onClick={() => router.push("/admin/users")} className="w-full rounded-full">
                    Administrar Usuarios
                  </Button>
                </OrganicSection>
              </Card>

              {/* Módulo de Entrenamiento */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-3">
                      <Dumbbell className="h-6 w-6 text-green-600" />
                    </div>
                    <Card3DTitle>Gestión de Entrenamiento</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Administra rutinas de entrenamiento, ejercicios y programas.
                  </p>
                  <Button3D onClick={() => router.push("/admin/training")} className="w-full">
                    Administrar Entrenamiento
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Ejercicios */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full mr-3">
                      <Activity className="h-6 w-6 text-yellow-600" />
                    </div>
                    <Card3DTitle>Gestión de Ejercicios</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Administra la biblioteca de ejercicios y sus categorías.
                  </p>
                  <Button3D onClick={() => router.push("/admin/exercises")} className="w-full">
                    Administrar Ejercicios
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de IA */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-3">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <Card3DTitle>Motor de IA</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Sistema de IA progresivo y segmentación inteligente.
                  </p>
                  <Button3D onClick={() => router.push("/admin/ai")} className="w-full">
                    Gestionar IA
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Analíticas */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-3">
                      <BarChart className="h-6 w-6 text-blue-600" />
                    </div>
                    <Card3DTitle>Analíticas Avanzadas</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Dashboards en tiempo real y analíticas predictivas.
                  </p>
                  <Button3D onClick={() => router.push("/admin/analytics")} className="w-full">
                    Ver Analíticas
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Comunicaciones */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-3">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <Card3DTitle>Comunicaciones</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Sistema de mensajería automatizada y notificaciones.
                  </p>
                  <Button3D onClick={() => router.push("/admin/communications")} className="w-full">
                    Gestionar Comunicaciones
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Reportes */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full mr-3">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <Card3DTitle>Inteligencia de Negocio</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Reportes avanzados y KPIs de negocio.
                  </p>
                  <Button3D onClick={() => router.push("/admin/reports")} className="w-full">
                    Ver Reportes
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Analíticas de Entrenamiento */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-red-100 p-3 rounded-full mr-3">
                      <Activity className="h-6 w-6 text-red-600" />
                    </div>
                    <Card3DTitle>Analíticas de Entrenamiento</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Monitoreo en tiempo real del progreso de entrenamiento.
                  </p>
                  <Button3D onClick={() => router.push("/admin/training-analytics")} className="w-full">
                    Ver Analíticas
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Nutrición */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full mr-3">
                      <Utensils className="h-6 w-6 text-orange-600" />
                    </div>
                    <Card3DTitle>Gestión de Nutrición</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Administra planes nutricionales, recetas y seguimiento.
                  </p>
                  <Button3D onClick={() => router.push("/admin/nutrition")} className="w-full">
                    Administrar Nutrición
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Sueño */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full mr-3">
                      <Moon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <Card3DTitle>Gestión de Sueño</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Administra registros de sueño y recomendaciones.
                  </p>
                  <Button3D onClick={() => router.push("/admin/sleep")} className="w-full">
                    Administrar Sueño
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Bienestar */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-3">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <Card3DTitle>Gestión de Bienestar</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Administra técnicas de meditación, respiración y mindfulness.
                  </p>
                  <Button3D onClick={() => router.push("/admin/wellness")} className="w-full">
                    Administrar Bienestar
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Notificaciones */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-red-100 p-3 rounded-full mr-3">
                      <Bell className="h-6 w-6 text-red-600" />
                    </div>
                    <Card3DTitle>Notificaciones</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Gestiona notificaciones y mensajes para los usuarios.
                  </p>
                  <Button3D onClick={() => router.push("/admin/notifications")} className="w-full">
                    Administrar Notificaciones
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Plantillas */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-3 rounded-full mr-3">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <Card3DTitle>Plantillas</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Gestiona plantillas predefinidas para rutinas y planes.
                  </p>
                  <Button3D onClick={() => router.push("/admin/templates")} className="w-full">
                    Administrar Plantillas
                  </Button3D>
                </Card3DContent>
              </Card3D>

              {/* Módulo de Seguridad */}
              <Card3D className="hover:shadow-lg transition-shadow">
                <Card3DHeader>
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-3 rounded-full mr-3">
                      <Shield className="h-6 w-6 text-gray-600" />
                    </div>
                    <Card3DTitle>Seguridad</Card3DTitle>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-muted-foreground mb-4">
                    Gestiona la seguridad y los permisos del sistema.
                  </p>
                  <Button3D onClick={() => router.push("/admin/security")} className="w-full">
                    Administrar Seguridad
                  </Button3D>
                </Card3DContent>
              </Card3D>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AIRecommendations
              recommendations={recommendations}
              isLoading={isLoadingRecommendations}
              onRefresh={loadRecommendations}
              title="Recomendaciones de IA para la plataforma"
              emptyMessage="No hay recomendaciones disponibles en este momento. Intenta actualizar más tarde."
              onApply={(recommendation) => {
                // Actualizar la recomendación en el estado
                setRecommendations(recommendations.map(rec =>
                  rec.id === recommendation.id ? recommendation : rec
                ));

                toast({
                  title: "Recomendación aplicada",
                  description: "La recomendación se ha aplicado correctamente.",
                });
              }}
            />

            <AdminAdvancedAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <Card3D>
              <Card3DHeader>
                <div className="flex items-center">
                  <div className="bg-gray-100 p-3 rounded-full mr-3">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <Card3DTitle>Configuración del Sistema</Card3DTitle>
                </div>
              </Card3DHeader>
              <Card3DContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Configuración General</h3>
                    <p className="text-muted-foreground mb-4">
                      Configura parámetros globales, notificaciones y preferencias del sistema.
                    </p>
                    <Button3D onClick={() => router.push("/admin/settings/general")} className="w-full">
                      Configuración General
                    </Button3D>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Configuración de Base de Datos</h3>
                    <p className="text-muted-foreground mb-4">
                      Gestiona la configuración de la base de datos y las copias de seguridad.
                    </p>
                    <Button3D onClick={() => router.push("/admin/settings/database")} className="w-full mb-2">
                      Configuración de Base de Datos
                    </Button3D>
                    <Button3D onClick={() => router.push("/admin/database")} className="w-full" variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Gestión de Datos
                    </Button3D>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Configuración de Correo</h3>
                    <p className="text-muted-foreground mb-4">
                      Configura las plantillas de correo y las notificaciones por email.
                    </p>
                    <Button3D onClick={() => router.push("/admin/settings/email")} className="w-full">
                      Configuración de Correo
                    </Button3D>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Configuración de API</h3>
                    <p className="text-muted-foreground mb-4">
                      Gestiona las claves de API y las integraciones con servicios externos.
                    </p>
                    <Button3D onClick={() => router.push("/admin/settings/api")} className="w-full">
                      Configuración de API
                    </Button3D>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
