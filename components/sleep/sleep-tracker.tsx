"use client"

import { useState, useEffect } from "react"
import {
  Moon,
  Plus,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Trash,
  Zap,
  Heart,
  Brain,
  Sparkles,
  AlertTriangle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { format, addDays, subDays, startOfDay, endOfDay, parseISO, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"

interface SleepTrackerProps {
  userId: string
  className?: string
}

interface SleepEntry {
  id: string
  userId: string
  date: string
  bedTime: string
  wakeTime: string
  duration: number
  quality: number
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

interface SleepGoals {
  targetDuration: number
  targetBedTime: string
  targetWakeTime: string
}

export function SleepTracker({
  userId,
  className
}: SleepTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [goals, setGoals] = useState<SleepGoals>({
    targetDuration: 480, // 8 horas en minutos
    targetBedTime: '23:00',
    targetWakeTime: '07:00'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<SleepEntry>>({
    bedTime: '23:00',
    wakeTime: '07:00',
    quality: 3,
    notes: '',
    tags: []
  })
  const [sleepStats, setSleepStats] = useState({
    averageDuration: 0,
    averageQuality: 0,
    consistencyScore: 0,
    weeklyTrend: 'stable'
  })
  
  // Cargar datos de sueño
  useEffect(() => {
    const loadSleepData = async () => {
      setIsLoading(true)
      
      try {
        // Cargar objetivos de sueño
        const { data: goalsData, error: goalsError } = await supabase
          .from('sleep_goals')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (goalsError) {
          if (goalsError.code !== 'PGRST116') { // No data found
            console.error("Error al cargar objetivos:", goalsError)
          }
        } else if (goalsData) {
          setGoals({
            targetDuration: goalsData.target_duration,
            targetBedTime: goalsData.target_bed_time,
            targetWakeTime: goalsData.target_wake_time
          })
        }
        
        // Cargar entradas de sueño para la fecha seleccionada
        const startDate = startOfDay(selectedDate).toISOString()
        const endDate = endOfDay(selectedDate).toISOString()
        
        const { data: entriesData, error: entriesError } = await supabase
          .from('sleep_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('created_at', { ascending: true })
        
        if (entriesError) {
          console.error("Error al cargar entradas:", entriesError)
        } else {
          // Transformar los datos al formato esperado
          const transformedEntries: SleepEntry[] = entriesData ? entriesData.map(entry => ({
            id: entry.id,
            userId: entry.user_id,
            date: entry.date,
            bedTime: entry.bed_time,
            wakeTime: entry.wake_time,
            duration: entry.duration,
            quality: entry.quality,
            notes: entry.notes,
            tags: entry.tags,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at
          })) : []
          
          setEntries(transformedEntries)
        }
        
        // Cargar estadísticas de sueño
        await loadSleepStats()
      } catch (error) {
        console.error("Error al cargar datos de sueño:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadSleepData()
    }
  }, [userId, selectedDate])
  
  // Cargar estadísticas de sueño
  const loadSleepStats = async () => {
    try {
      // Obtener entradas de la última semana
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { data: weekEntries, error: weekError } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', oneWeekAgo.toISOString())
        .order('date', { ascending: false })
      
      if (weekError) {
        throw weekError
      }
      
      if (!weekEntries || weekEntries.length === 0) {
        return
      }
      
      // Calcular duración media
      const totalDuration = weekEntries.reduce((acc, entry) => acc + entry.duration, 0)
      const averageDuration = totalDuration / weekEntries.length
      
      // Calcular calidad media
      const totalQuality = weekEntries.reduce((acc, entry) => acc + entry.quality, 0)
      const averageQuality = totalQuality / weekEntries.length
      
      // Calcular consistencia
      const bedTimes = weekEntries.map(entry => {
        const [hours, minutes] = entry.bed_time.split(':').map(Number)
        return hours * 60 + minutes
      })
      
      const maxBedTime = Math.max(...bedTimes)
      const minBedTime = Math.min(...bedTimes)
      const bedTimeVariance = maxBedTime - minBedTime
      
      // Menor varianza = mayor consistencia
      const consistencyScore = Math.max(0, 100 - (bedTimeVariance / 3))
      
      // Calcular tendencia
      const firstHalf = weekEntries.slice(weekEntries.length / 2).reverse()
      const secondHalf = weekEntries.slice(0, weekEntries.length / 2)
      
      const firstHalfAvg = firstHalf.reduce((acc, entry) => acc + entry.duration, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((acc, entry) => acc + entry.duration, 0) / secondHalf.length
      
      let trend = 'stable'
      if (secondHalfAvg > firstHalfAvg + 30) {
        trend = 'improving'
      } else if (secondHalfAvg < firstHalfAvg - 30) {
        trend = 'declining'
      }
      
      setSleepStats({
        averageDuration,
        averageQuality,
        consistencyScore,
        weeklyTrend: trend
      })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }
  
  // Cambiar fecha
  const changeDate = (days: number) => {
    setSelectedDate(prevDate => days > 0 ? addDays(prevDate, days) : subDays(prevDate, Math.abs(days)))
  }
  
  // Calcular duración del sueño
  const calculateDuration = (bedTime: string, wakeTime: string) => {
    const [bedHours, bedMinutes] = bedTime.split(':').map(Number)
    const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number)
    
    let bedTimeDate = new Date()
    bedTimeDate.setHours(bedHours, bedMinutes, 0, 0)
    
    let wakeTimeDate = new Date()
    wakeTimeDate.setHours(wakeHours, wakeMinutes, 0, 0)
    
    // Si la hora de despertar es anterior a la hora de acostarse, asumimos que es del día siguiente
    if (wakeTimeDate < bedTimeDate) {
      wakeTimeDate.setDate(wakeTimeDate.getDate() + 1)
    }
    
    return differenceInMinutes(wakeTimeDate, bedTimeDate)
  }
  
  // Guardar nueva entrada
  const saveEntry = async () => {
    if (!newEntry.bedTime || !newEntry.wakeTime || newEntry.quality === undefined) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }
    
    try {
      const duration = calculateDuration(newEntry.bedTime, newEntry.wakeTime)
      
      const entryData = {
        user_id: userId,
        date: selectedDate.toISOString(),
        bed_time: newEntry.bedTime,
        wake_time: newEntry.wakeTime,
        duration,
        quality: newEntry.quality,
        notes: newEntry.notes,
        tags: newEntry.tags
      }
      
      const { data, error } = await supabase
        .from('sleep_entries')
        .insert(entryData)
        .select()
      
      if (error) {
        throw error
      }
      
      // Transformar la entrada guardada
      const savedEntry: SleepEntry = {
        id: data[0].id,
        userId: data[0].user_id,
        date: data[0].date,
        bedTime: data[0].bed_time,
        wakeTime: data[0].wake_time,
        duration: data[0].duration,
        quality: data[0].quality,
        notes: data[0].notes,
        tags: data[0].tags,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
      }
      
      // Actualizar la lista de entradas
      setEntries([...entries, savedEntry])
      
      // Limpiar el formulario
      setNewEntry({
        bedTime: '23:00',
        wakeTime: '07:00',
        quality: 3,
        notes: '',
        tags: []
      })
      
      // Cerrar el diálogo
      setShowAddDialog(false)
      
      toast({
        title: "Registro añadido",
        description: "El registro de sueño se ha añadido correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al guardar entrada:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el registro",
        variant: "destructive"
      })
    }
  }
  
  // Eliminar entrada
  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('sleep_entries')
        .delete()
        .eq('id', entryId)
      
      if (error) {
        throw error
      }
      
      // Actualizar la lista de entradas
      setEntries(entries.filter(entry => entry.id !== entryId))
      
      toast({
        title: "Entrada eliminada",
        description: "La entrada se ha eliminado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al eliminar entrada:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la entrada",
        variant: "destructive"
      })
    }
  }
  
  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  // Obtener color según calidad
  const getQualityColor = (quality: number) => {
    switch (quality) {
      case 1: return 'bg-red-100 text-red-600'
      case 2: return 'bg-orange-100 text-orange-600'
      case 3: return 'bg-yellow-100 text-yellow-600'
      case 4: return 'bg-green-100 text-green-600'
      case 5: return 'bg-emerald-100 text-emerald-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }
  
  // Obtener texto según calidad
  const getQualityText = (quality: number) => {
    switch (quality) {
      case 1: return 'Muy mala'
      case 2: return 'Mala'
      case 3: return 'Regular'
      case 4: return 'Buena'
      case 5: return 'Excelente'
      default: return 'Desconocida'
    }
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Seguimiento del sueño</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Seguimiento del sueño</Card3DTitle>
          
          <Button3D size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir registro
          </Button3D>
        </div>
      </Card3DHeader>
      
      <Card3DContent>
        {/* Selector de fecha */}
        <div className="flex justify-between items-center mb-4">
          <Button3D variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button3D>
          
          <div className="text-center">
            <h3 className="font-medium">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedDate.toDateString() === new Date().toDateString() ? 'Hoy' : ''}
            </p>
          </div>
          
          <Button3D variant="outline" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button3D>
        </div>
        
        {/* Estadísticas de sueño */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 rounded-md p-3">
            <div className="flex items-center mb-1">
              <Clock className="h-4 w-4 text-blue-600 mr-1" />
              <h4 className="text-xs font-medium">Duración media</h4>
            </div>
            <p className="text-sm font-semibold">{formatDuration(sleepStats.averageDuration)}</p>
            <p className="text-xs text-gray-500">Últimos 7 días</p>
          </div>
          
          <div className="bg-purple-50 rounded-md p-3">
            <div className="flex items-center mb-1">
              <Sparkles className="h-4 w-4 text-purple-600 mr-1" />
              <h4 className="text-xs font-medium">Calidad media</h4>
            </div>
            <p className="text-sm font-semibold">{sleepStats.averageQuality.toFixed(1)}/5</p>
            <p className="text-xs text-gray-500">Últimos 7 días</p>
          </div>
          
          <div className="bg-green-50 rounded-md p-3">
            <div className="flex items-center mb-1">
              <Heart className="h-4 w-4 text-green-600 mr-1" />
              <h4 className="text-xs font-medium">Consistencia</h4>
            </div>
            <p className="text-sm font-semibold">{sleepStats.consistencyScore.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Horario regular</p>
          </div>
          
          <div className="bg-amber-50 rounded-md p-3">
            <div className="flex items-center mb-1">
              <BarChart3 className="h-4 w-4 text-amber-600 mr-1" />
              <h4 className="text-xs font-medium">Tendencia</h4>
            </div>
            <p className="text-sm font-semibold">
              {sleepStats.weeklyTrend === 'improving' ? 'Mejorando' :
               sleepStats.weeklyTrend === 'declining' ? 'Empeorando' : 'Estable'}
            </p>
            <p className="text-xs text-gray-500">Últimos 7 días</p>
          </div>
        </div>
        
        {/* Registros de sueño */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Registros del día</h3>
          
          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map(entry => (
                <div key={entry.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium">
                        {entry.bedTime} - {entry.wakeTime}
                      </span>
                    </div>
                    
                    <Button3D
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash className="h-3 w-3 text-red-500" />
                    </Button3D>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">Duración: {formatDuration(entry.duration)}</p>
                      <div className="flex items-center mt-1">
                        <div className={`px-2 py-0.5 rounded text-xs ${getQualityColor(entry.quality)}`}>
                          Calidad: {getQualityText(entry.quality)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {entry.duration < goals.targetDuration ? (
                        <div className="flex items-center text-xs text-red-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>{formatDuration(goals.targetDuration - entry.duration)} menos</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Objetivo cumplido</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-2 border-t pt-2">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Moon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin registros</h3>
              <p className="text-sm text-gray-500">
                No hay registros de sueño para este día.
              </p>
            </div>
          )}
        </div>
      </Card3DContent>
      
      {/* Diálogo para añadir registro */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir registro de sueño</DialogTitle>
            <DialogDescription>
              Registra tu sueño para hacer seguimiento de tus patrones.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Hora de acostarse</label>
                <Input
                  type="time"
                  value={newEntry.bedTime}
                  onChange={(e) => setNewEntry({ ...newEntry, bedTime: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Hora de despertar</label>
                <Input
                  type="time"
                  value={newEntry.wakeTime}
                  onChange={(e) => setNewEntry({ ...newEntry, wakeTime: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Calidad del sueño</label>
              <Select
                value={newEntry.quality?.toString()}
                onValueChange={(value) => setNewEntry({ ...newEntry, quality: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Muy mala</SelectItem>
                  <SelectItem value="2">2 - Mala</SelectItem>
                  <SelectItem value="3">3 - Regular</SelectItem>
                  <SelectItem value="4">4 - Buena</SelectItem>
                  <SelectItem value="5">5 - Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Notas</label>
              <Textarea
                value={newEntry.notes || ''}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="Factores que afectaron tu sueño..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={saveEntry}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card3D>
  )
}
