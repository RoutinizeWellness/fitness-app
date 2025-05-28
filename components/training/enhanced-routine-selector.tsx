"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Filter, Clock, Target, Dumbbell, Users, Star,
  ChevronDown, ChevronUp, Play, Eye, Heart, Zap,
  Calendar, TrendingUp, Award, CheckCircle, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { WorkoutRoutine, Exercise } from "@/lib/types/training"
import { getUserAdaptiveProfile, adaptRoutineForUser } from "@/lib/adaptive-routine-engine"
import { useToast } from "@/components/ui/use-toast"

interface EnhancedRoutineSelectorProps {
  routines: WorkoutRoutine[]
  userId: string
  onSelectRoutine: (routine: WorkoutRoutine) => void
  onPreviewRoutine: (routine: WorkoutRoutine) => void
  onStartWorkout: (routine: WorkoutRoutine) => void
  className?: string
}

interface RoutineFilters {
  searchTerm: string
  goal: string
  level: string
  duration: [number, number]
  frequency: [number, number]
  equipment: string[]
  muscleGroups: string[]
  timePerSession: [number, number]
  showFavorites: boolean
  sortBy: 'name' | 'difficulty' | 'duration' | 'popularity' | 'recent'
  sortOrder: 'asc' | 'desc'
}

const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'Barra', icon: '🏋️' },
  { value: 'dumbbell', label: 'Mancuernas', icon: '💪' },
  { value: 'bodyweight', label: 'Peso Corporal', icon: '🤸' },
  { value: 'machine', label: 'Máquinas', icon: '⚙️' },
  { value: 'cable', label: 'Poleas', icon: '🔗' },
  { value: 'kettlebell', label: 'Kettlebells', icon: '⚫' },
  { value: 'resistance_band', label: 'Bandas', icon: '🎗️' }
]

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Pecho', icon: '💪' },
  { value: 'back', label: 'Espalda', icon: '🔙' },
  { value: 'shoulders', label: 'Hombros', icon: '🤷' },
  { value: 'arms', label: 'Brazos', icon: '💪' },
  { value: 'legs', label: 'Piernas', icon: '🦵' },
  { value: 'core', label: 'Core', icon: '🎯' },
  { value: 'glutes', label: 'Glúteos', icon: '🍑' }
]

const GOALS = [
  { value: 'strength', label: 'Fuerza', color: 'bg-red-100 text-red-800' },
  { value: 'hypertrophy', label: 'Hipertrofia', color: 'bg-blue-100 text-blue-800' },
  { value: 'endurance', label: 'Resistencia', color: 'bg-green-100 text-green-800' },
  { value: 'power', label: 'Potencia', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'general_fitness', label: 'Fitness General', color: 'bg-purple-100 text-purple-800' }
]

const LEVELS = [
  { value: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Avanzado', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Experto', color: 'bg-red-100 text-red-800' }
]

export function EnhancedRoutineSelector({
  routines,
  userId,
  onSelectRoutine,
  onPreviewRoutine,
  onStartWorkout,
  className = ""
}: EnhancedRoutineSelectorProps) {
  const { toast } = useToast()
  const [filters, setFilters] = useState<RoutineFilters>({
    searchTerm: '',
    goal: 'all',
    level: 'all',
    duration: [4, 16],
    frequency: [2, 6],
    equipment: [],
    muscleGroups: [],
    timePerSession: [30, 120],
    showFavorites: false,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [adaptiveProfile, setAdaptiveProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // Cargar perfil adaptativo
      const profile = await getUserAdaptiveProfile(userId)
      setAdaptiveProfile(profile)

      // Cargar favoritos del usuario
      // TODO: Implementar carga de favoritos desde Supabase
      setFavorites([])

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar y ordenar rutinas
  const filteredRoutines = useMemo(() => {
    let filtered = routines.filter(routine => {
      // Filtro de búsqueda
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesSearch = 
          routine.name.toLowerCase().includes(searchLower) ||
          routine.description?.toLowerCase().includes(searchLower) ||
          routine.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Filtro de objetivo
      if (filters.goal !== 'all' && routine.goal !== filters.goal) {
        return false
      }

      // Filtro de nivel
      if (filters.level !== 'all' && routine.level !== filters.level) {
        return false
      }

      // Filtro de duración (semanas)
      const routineDuration = routine.duration || 8
      if (routineDuration < filters.duration[0] || routineDuration > filters.duration[1]) {
        return false
      }

      // Filtro de frecuencia
      if (routine.frequency < filters.frequency[0] || routine.frequency > filters.frequency[1]) {
        return false
      }

      // Filtro de favoritos
      if (filters.showFavorites && !favorites.includes(routine.id)) {
        return false
      }

      // Filtro de equipamiento
      if (filters.equipment.length > 0) {
        const routineEquipment = routine.requiredEquipment || []
        const hasRequiredEquipment = filters.equipment.every(eq => 
          routineEquipment.includes(eq)
        )
        if (!hasRequiredEquipment) return false
      }

      return true
    })

    // Ordenar rutinas
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
          comparison = difficultyOrder[a.level] - difficultyOrder[b.level]
          break
        case 'duration':
          comparison = (a.duration || 8) - (b.duration || 8)
          break
        case 'popularity':
          comparison = (b.popularity || 0) - (a.popularity || 0)
          break
        case 'recent':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [routines, filters, favorites])

  const handleFilterChange = (key: keyof RoutineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      goal: 'all',
      level: 'all',
      duration: [4, 16],
      frequency: [2, 6],
      equipment: [],
      muscleGroups: [],
      timePerSession: [30, 120],
      showFavorites: false,
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  const toggleFavorite = (routineId: string) => {
    setFavorites(prev => 
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
    )
    // TODO: Guardar en Supabase
  }

  const getRoutineDifficulty = (routine: WorkoutRoutine) => {
    const level = LEVELS.find(l => l.value === routine.level)
    return level || LEVELS[1] // Default to intermediate
  }

  const getRoutineGoal = (routine: WorkoutRoutine) => {
    const goal = GOALS.find(g => g.value === routine.goal)
    return goal || GOALS[4] // Default to general fitness
  }

  const estimateWorkoutDuration = (routine: WorkoutRoutine) => {
    // Estimación simple basada en número de ejercicios y series
    const avgDay = routine.days[0] || { exerciseSets: [] }
    const totalSets = avgDay.exerciseSets.reduce((sum, ex) => sum + ex.sets.length, 0)
    return Math.round(totalSets * 3 + 15) // 3 min por serie + calentamiento
  }

  const handlePreviewRoutine = async (routine: WorkoutRoutine) => {
    try {
      setIsLoading(true)
      setSelectedRoutine(routine)
      
      // Adaptar rutina para el usuario
      if (adaptiveProfile) {
        const adapted = await adaptRoutineForUser(routine, {
          userId,
          goal: routine.goal as any,
          duration: routine.duration || 8,
          autoAdjust: true,
          considerFatigue: true,
          considerPerformance: true,
          allowEquipmentSubstitutions: true,
          difficultyScaling: 'auto'
        })
        
        setSelectedRoutine(adapted.adaptedRoutine)
      }
      
      setShowPreview(true)
    } catch (error) {
      console.error('Error previewing routine:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la vista previa de la rutina",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda y filtros */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar rutinas por nombre, descripción o etiquetas..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          <SafeClientButton
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
            {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </SafeClientButton>
        </div>

        {/* Panel de filtros expandible */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Filtro de objetivo */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Objetivo</label>
                    <Select value={filters.goal} onValueChange={(value) => handleFilterChange('goal', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los objetivos</SelectItem>
                        {GOALS.map(goal => (
                          <SelectItem key={goal.value} value={goal.value}>
                            {goal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de nivel */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nivel</label>
                    <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        {LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de ordenamiento */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                    <Select value={filters.sortBy} onValueChange={(value: any) => handleFilterChange('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="difficulty">Dificultad</SelectItem>
                        <SelectItem value="duration">Duración</SelectItem>
                        <SelectItem value="popularity">Popularidad</SelectItem>
                        <SelectItem value="recent">Más recientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de duración */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Duración: {filters.duration[0]}-{filters.duration[1]} semanas
                    </label>
                    <Slider
                      value={filters.duration}
                      onValueChange={(value) => handleFilterChange('duration', value)}
                      min={1}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Filtro de frecuencia */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Frecuencia: {filters.frequency[0]}-{filters.frequency[1]} días/semana
                    </label>
                    <Slider
                      value={filters.frequency}
                      onValueChange={(value) => handleFilterChange('frequency', value)}
                      min={1}
                      max={7}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Mostrar solo favoritos */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={filters.showFavorites}
                      onCheckedChange={(checked) => handleFilterChange('showFavorites', checked)}
                    />
                    <label className="text-sm font-medium">Solo favoritos</label>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <SafeClientButton variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </SafeClientButton>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resultados */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredRoutines.length} rutina{filteredRoutines.length !== 1 ? 's' : ''} encontrada{filteredRoutines.length !== 1 ? 's' : ''}
          </p>
          {adaptiveProfile && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Adaptación IA activada
            </Badge>
          )}
        </div>

        {/* Lista de rutinas */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredRoutines.map((routine, index) => {
              const difficulty = getRoutineDifficulty(routine)
              const goal = getRoutineGoal(routine)
              const duration = estimateWorkoutDuration(routine)
              const isFavorite = favorites.includes(routine.id)

              return (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-lg">{routine.name}</h3>
                            <SafeClientButton
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(routine.id)}
                              className="ml-2 p-1"
                            >
                              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </SafeClientButton>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {routine.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={difficulty.color}>
                              {difficulty.label}
                            </Badge>
                            <Badge className={goal.color}>
                              {goal.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {routine.frequency} días/semana
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              ~{duration} min
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {routine.popularity || 0} usuarios
                            </span>
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {routine.rating || 0}/5
                            </span>
                            {routine.source && (
                              <span className="flex items-center">
                                <Award className="h-3 w-3 mr-1" />
                                {routine.source}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <SafeClientButton
                            size="sm"
                            onClick={() => handlePreviewRoutine(routine)}
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Vista Previa
                          </SafeClientButton>
                          <SafeClientButton
                            variant="outline"
                            size="sm"
                            onClick={() => onStartWorkout(routine)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Empezar
                          </SafeClientButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {filteredRoutines.length === 0 && (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron rutinas</h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros o buscar con términos diferentes
            </p>
            <SafeClientButton variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </SafeClientButton>
          </Card>
        )}
      </div>

      {/* Modal de vista previa */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de Rutina</DialogTitle>
            <DialogDescription>
              Revisa los detalles de la rutina antes de comenzar
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoutine && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRoutine.name}</h3>
                <p className="text-gray-600">{selectedRoutine.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Objetivo:</span>
                  <Badge className={getRoutineGoal(selectedRoutine).color} variant="secondary">
                    {getRoutineGoal(selectedRoutine).label}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Nivel:</span>
                  <Badge className={getRoutineDifficulty(selectedRoutine).color} variant="secondary">
                    {getRoutineDifficulty(selectedRoutine).label}
                  </Badge>
                </div>
              </div>

              {/* Días de entrenamiento */}
              <div>
                <h4 className="font-medium mb-2">Días de Entrenamiento</h4>
                <div className="space-y-2">
                  {selectedRoutine.days.map((day, index) => (
                    <Card key={day.id} className="p-3">
                      <h5 className="font-medium">{day.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                      <div className="text-xs text-gray-500">
                        {day.exerciseSets.length} ejercicios • ~{estimateWorkoutDuration(selectedRoutine)} min
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <SafeClientButton variant="outline" onClick={() => setShowPreview(false)}>
                  Cerrar
                </SafeClientButton>
                <SafeClientButton onClick={() => {
                  onSelectRoutine(selectedRoutine)
                  setShowPreview(false)
                }}>
                  Seleccionar Rutina
                </SafeClientButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
