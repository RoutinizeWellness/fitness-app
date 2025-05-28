"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users, UserPlus, BarChart2, MessageSquare, ClipboardList,
  Shield, Settings, Bell, Search, Filter, RefreshCw,
  ArrowUpRight, ArrowDownRight, CheckCircle, XCircle,
  Dumbbell, Utensils, Calendar, Activity, PieChart
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { getGlobalStats, GlobalStats, getAllUsers, UserWithDetails } from "@/lib/admin-dashboard-service"
import { AdminUsersList } from "@/components/admin/admin-users-list"
import { AdminProfessionalVerification } from "@/components/admin/admin-professional-verification"
import { AdminMassMessaging } from "@/components/admin/admin-mass-messaging"
import { AdminStatsOverview } from "@/components/admin/admin-stats-overview"
import { AdminClientManagement } from "@/components/admin/admin-client-management"
import { AdminAdvancedAnalytics } from "@/components/admin/admin-advanced-analytics"

export function AdminDashboard() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder al panel de administración",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    loadDashboardData()
  }, [user, isAdmin, router])

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Cargar estadísticas globales
      const { data: statsData, error: statsError } = await getGlobalStats()

      if (statsError) {
        console.error("Error al cargar estadísticas globales:", statsError)
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas globales",
          variant: "destructive",
        })
      } else {
        setStats(statsData)
      }

      // Cargar usuarios
      const { data: usersData, error: usersError } = await getAllUsers({
        limit: 10,
        offset: (currentPage - 1) * 10
      })

      if (usersError) {
        console.error("Error al cargar usuarios:", usersError)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } else if (usersData) {
        setUsers(usersData.users)
        setTotalUsers(usersData.total)
      }
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDashboardData()
    setIsRefreshing(false)

    toast({
      title: "Datos actualizados",
      description: "Los datos del dashboard se han actualizado correctamente",
    })
  }

  // Buscar usuarios
  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const { data: usersData, error: usersError } = await getAllUsers({
        search: searchTerm,
        limit: 10,
        offset: 0
      })

      if (usersError) {
        console.error("Error al buscar usuarios:", usersError)
        toast({
          title: "Error",
          description: "No se pudieron buscar los usuarios",
          variant: "destructive",
        })
      } else if (usersData) {
        setUsers(usersData.users)
        setTotalUsers(usersData.total)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al buscar usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar página
  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    setIsLoading(true)
    try {
      const { data: usersData, error: usersError } = await getAllUsers({
        search: searchTerm,
        limit: 10,
        offset: (page - 1) * 10
      })

      if (usersError) {
        console.error("Error al cambiar página:", usersError)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } else if (usersData) {
        setUsers(usersData.users)
        setTotalUsers(usersData.total)
      }
    } catch (error) {
      console.error("Error al cambiar página:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cambiar de página",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar estado de carga
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Shield className="h-6 w-6 mr-2 text-primary" />
          <h2 className="text-2xl font-bold gradient-text">Panel de Administración</h2>
        </div>
        <Button3D variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar datos
            </>
          )}
        </Button3D>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="verification">Verificación</TabsTrigger>
          <TabsTrigger value="messaging">Mensajes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && <AdminStatsOverview stats={stats} />}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminUsersList
            users={users}
            totalUsers={totalUsers}
            currentPage={currentPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <AdminClientManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdminAdvancedAnalytics />
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <AdminProfessionalVerification />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <AdminMassMessaging />
        </TabsContent>
      </Tabs>
    </div>
  )
}
