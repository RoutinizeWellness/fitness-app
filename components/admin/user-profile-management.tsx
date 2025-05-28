"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Search, Filter, Edit, Eye, Settings, BarChart3,
  UserCheck, UserX, AlertTriangle, TrendingUp, TrendingDown,
  Calendar, Clock, Dumbbell, Target, Brain, Shield,
  Download, Upload, RefreshCw, MoreVertical, ChevronDown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUserAdaptiveProfile, UserAdaptiveProfile } from "@/lib/adaptive-routine-engine"
import { getRecentFatigueMetrics, analyzeFatigueTrends } from "@/lib/fatigue-detection-system"
import { getActivePeriodizationPlan } from "@/lib/adaptive-periodization-system"
import { useToast } from "@/components/ui/use-toast"

interface UserProfileData {
  id: string
  email: string
  fullName: string
  avatar?: string
  createdAt: string
  lastActive: string
  status: 'active' | 'inactive' | 'suspended'
  adaptiveProfile?: UserAdaptiveProfile
  fatigueData?: any
  periodizationPlan?: any
  progressMetrics?: {
    totalWorkouts: number
    adherenceRate: number
    avgFatigue: number
    progressTrend: 'improving' | 'stable' | 'declining'
  }
}

interface AdminFilters {
  searchTerm: string
  status: string
  experienceLevel: string
  fatigueLevel: string
  adherenceLevel: string
  sortBy: 'name' | 'lastActive' | 'adherence' | 'fatigue' | 'progress'
  sortOrder: 'asc' | 'desc'
}

export function UserProfileManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserProfileData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfileData[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  const [filters, setFilters] = useState<AdminFilters>({
    searchTerm: '',
    status: 'all',
    experienceLevel: 'all',
    fatigueLevel: 'all',
    adherenceLevel: 'all',
    sortBy: 'lastActive',
    sortOrder: 'desc'
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    highFatigueUsers: 0,
    lowAdherenceUsers: 0,
    avgAdherence: 0,
    avgFatigue: 0
  })

  useEffect(() => {
    loadUserProfiles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const loadUserProfiles = async () => {
    try {
      setIsLoading(true)
      
      // Obtener lista de usuarios (esto requiere permisos de admin)
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_sign_in_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los perfiles de usuario",
          variant: "destructive"
        })
        return
      }

      // Cargar datos adicionales para cada usuario
      const enrichedUsers = await Promise.all(
        usersData.map(async (user) => {
          try {
            const [adaptiveProfile, fatigueMetrics, periodizationPlan] = await Promise.all([
              getUserAdaptiveProfile(user.id),
              getRecentFatigueMetrics(user.id, 7),
              getActivePeriodizationPlan(user.id)
            ])

            // Calcular métricas de progreso
            const progressMetrics = calculateProgressMetrics(fatigueMetrics)

            return {
              id: user.id,
              email: user.email,
              fullName: user.full_name || user.email,
              avatar: user.avatar_url,
              createdAt: user.created_at,
              lastActive: user.last_sign_in_at || user.updated_at,
              status: determineUserStatus(user),
              adaptiveProfile,
              fatigueData: fatigueMetrics,
              periodizationPlan,
              progressMetrics
            } as UserProfileData
          } catch (error) {
            console.error(`Error loading data for user ${user.id}:`, error)
            return {
              id: user.id,
              email: user.email,
              fullName: user.full_name || user.email,
              createdAt: user.created_at,
              lastActive: user.last_sign_in_at || user.updated_at,
              status: 'inactive'
            } as UserProfileData
          }
        })
      )

      setUsers(enrichedUsers)
      calculateStats(enrichedUsers)
      
    } catch (error) {
      console.error('Error in loadUserProfiles:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos de usuarios",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgressMetrics = (fatigueMetrics: any[]) => {
    if (!fatigueMetrics || fatigueMetrics.length === 0) {
      return {
        totalWorkouts: 0,
        adherenceRate: 0,
        avgFatigue: 50,
        progressTrend: 'stable' as const
      }
    }

    const avgFatigue = fatigueMetrics.reduce((sum, m) => sum + m.overallFatigueScore, 0) / fatigueMetrics.length
    const avgAdherence = fatigueMetrics.reduce((sum, m) => sum + (m.volumeCompletion || 0), 0) / fatigueMetrics.length

    // Determinar tendencia
    const recent = fatigueMetrics.slice(0, 3)
    const older = fatigueMetrics.slice(3, 6)
    
    let progressTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((sum, m) => sum + m.overallFatigueScore, 0) / recent.length
      const olderAvg = older.reduce((sum, m) => sum + m.overallFatigueScore, 0) / older.length
      
      if (recentAvg < olderAvg - 5) progressTrend = 'improving'
      else if (recentAvg > olderAvg + 5) progressTrend = 'declining'
    }

    return {
      totalWorkouts: fatigueMetrics.length,
      adherenceRate: avgAdherence,
      avgFatigue,
      progressTrend
    }
  }

  const determineUserStatus = (user: any): 'active' | 'inactive' | 'suspended' => {
    const lastActive = new Date(user.last_sign_in_at || user.updated_at)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceActive > 30) return 'inactive'
    if (user.banned_until) return 'suspended'
    return 'active'
  }

  const calculateStats = (userData: UserProfileData[]) => {
    const totalUsers = userData.length
    const activeUsers = userData.filter(u => u.status === 'active').length
    const highFatigueUsers = userData.filter(u => (u.progressMetrics?.avgFatigue || 0) > 70).length
    const lowAdherenceUsers = userData.filter(u => (u.progressMetrics?.adherenceRate || 0) < 70).length
    
    const avgAdherence = userData.reduce((sum, u) => sum + (u.progressMetrics?.adherenceRate || 0), 0) / totalUsers
    const avgFatigue = userData.reduce((sum, u) => sum + (u.progressMetrics?.avgFatigue || 50), 0) / totalUsers

    setStats({
      totalUsers,
      activeUsers,
      highFatigueUsers,
      lowAdherenceUsers,
      avgAdherence: Math.round(avgAdherence),
      avgFatigue: Math.round(avgFatigue)
    })
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Filtro de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Filtro de estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    // Filtro de nivel de experiencia
    if (filters.experienceLevel !== 'all') {
      filtered = filtered.filter(user => 
        user.adaptiveProfile?.experienceLevel === filters.experienceLevel
      )
    }

    // Filtro de nivel de fatiga
    if (filters.fatigueLevel !== 'all') {
      filtered = filtered.filter(user => {
        const fatigue = user.progressMetrics?.avgFatigue || 50
        switch (filters.fatigueLevel) {
          case 'low': return fatigue <= 40
          case 'moderate': return fatigue > 40 && fatigue <= 70
          case 'high': return fatigue > 70
          default: return true
        }
      })
    }

    // Filtro de adherencia
    if (filters.adherenceLevel !== 'all') {
      filtered = filtered.filter(user => {
        const adherence = user.progressMetrics?.adherenceRate || 0
        switch (filters.adherenceLevel) {
          case 'low': return adherence < 70
          case 'moderate': return adherence >= 70 && adherence < 85
          case 'high': return adherence >= 85
          default: return true
        }
      })
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName)
          break
        case 'lastActive':
          comparison = new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          break
        case 'adherence':
          comparison = (b.progressMetrics?.adherenceRate || 0) - (a.progressMetrics?.adherenceRate || 0)
          break
        case 'fatigue':
          comparison = (a.progressMetrics?.avgFatigue || 50) - (b.progressMetrics?.avgFatigue || 50)
          break
        case 'progress':
          const progressOrder = { improving: 3, stable: 2, declining: 1 }
          comparison = progressOrder[b.progressMetrics?.progressTrend || 'stable'] - 
                      progressOrder[a.progressMetrics?.progressTrend || 'stable']
          break
      }

      return filters.sortOrder === 'desc' ? comparison : -comparison
    })

    setFilteredUsers(filtered)
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleViewUser = (user: UserProfileData) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleEditUser = async (user: UserProfileData) => {
    // Implementar edición de usuario
    console.log('Edit user:', user)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getFatigueColor = (fatigue: number) => {
    if (fatigue <= 40) return 'text-green-600'
    if (fatigue <= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Perfiles de Usuario</h1>
          <p className="text-gray-600">Administra y monitorea todos los perfiles de usuario del sistema</p>
        </div>
        <div className="flex space-x-2">
          <SafeClientButton variant="outline" onClick={() => setShowBulkActions(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Acciones Masivas
          </SafeClientButton>
          <SafeClientButton onClick={loadUserProfiles} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </SafeClientButton>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alta Fatiga</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highFatigueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Baja Adherencia</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowAdherenceUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Adherencia Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgAdherence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fatiga Promedio</p>
                <p className={`text-2xl font-bold ${getFatigueColor(stats.avgFatigue)}`}>
                  {stats.avgFatigue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar Usuario</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nombre o email..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Nivel de Experiencia</label>
              <Select value={filters.experienceLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                  <SelectItem value="expert">Experto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="lastActive">Última actividad</SelectItem>
                  <SelectItem value="adherence">Adherencia</SelectItem>
                  <SelectItem value="fatigue">Fatiga</SelectItem>
                  <SelectItem value="progress">Progreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            {selectedUsers.length > 0 && (
              <Badge variant="secondary">
                {selectedUsers.length} seleccionados
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Experiencia</TableHead>
                  <TableHead>Adherencia</TableHead>
                  <TableHead>Fatiga</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead className="w-20">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === 'active' ? 'Activo' :
                           user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.adaptiveProfile?.experienceLevel || 'No definido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Progress 
                            value={user.progressMetrics?.adherenceRate || 0} 
                            className="w-16 h-2 mr-2" 
                          />
                          <span className="text-sm">
                            {Math.round(user.progressMetrics?.adherenceRate || 0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getFatigueColor(user.progressMetrics?.avgFatigue || 50)}`}>
                          {Math.round(user.progressMetrics?.avgFatigue || 50)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getProgressTrendIcon(user.progressMetrics?.progressTrend || 'stable')}
                          <span className="ml-2 text-sm">
                            {user.progressMetrics?.progressTrend === 'improving' ? 'Mejorando' :
                             user.progressMetrics?.progressTrend === 'declining' ? 'Declinando' : 'Estable'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SafeClientButton variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </SafeClientButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Perfil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
