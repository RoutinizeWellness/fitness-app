"use client"

import { useState, useEffect } from "react"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Info, 
  BarChart3, 
  Settings, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { 
  VolumeLandmark, 
  MuscleGroupType, 
  MUSCLE_GROUP_DISPLAY_NAMES,
  MuscleGroupVolumeSummary
} from "@/lib/types/volume-landmarks"
import { 
  getVolumeLandmarks, 
  updateVolumeLandmark, 
  calculateCurrentVolume, 
  getVolumeStatusAndRecommendations,
  getAllMuscleGroupVolumeSummaries,
  initializeVolumeLandmarks
} from "@/lib/volume-landmarks"
import { VolumeLandmarksChart } from "./volume-landmarks-chart"
import { VolumeLandmarksEditor } from "./volume-landmarks-editor"
import { VolumeLandmarksRecommendations } from "./volume-landmarks-recommendations"

interface VolumeLandmarksTrackerProps {
  userId?: string
  trainingLevel?: 'beginner' | 'intermediate' | 'advanced'
}

export function VolumeLandmarksTracker({ 
  userId,
  trainingLevel = 'advanced'
}: VolumeLandmarksTrackerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [volumeSummaries, setVolumeSummaries] = useState<MuscleGroupVolumeSummary[]>([])
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroupType>('chest')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [currentLandmark, setCurrentLandmark] = useState<VolumeLandmark | null>(null)
  const [viewMode, setViewMode] = useState<'all' | 'main' | 'detailed'>('main')

  const effectiveUserId = userId || user?.id

  // Load volume landmarks data
  useEffect(() => {
    if (!effectiveUserId) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Get all volume summaries
        const summaries = await getAllMuscleGroupVolumeSummaries(effectiveUserId)
        
        // If no summaries, initialize with defaults
        if (summaries.length === 0) {
          await initializeVolumeLandmarks(effectiveUserId, trainingLevel)
          const newSummaries = await getAllMuscleGroupVolumeSummaries(effectiveUserId)
          setVolumeSummaries(newSummaries)
        } else {
          setVolumeSummaries(summaries)
        }
        
        // Load selected muscle group data
        const landmarkData = await getVolumeStatusAndRecommendations(effectiveUserId, selectedMuscleGroup)
        if (landmarkData) {
          setCurrentLandmark(landmarkData)
        }
      } catch (error) {
        console.error("Error loading volume landmarks:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de volumen de entrenamiento",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [effectiveUserId, selectedMuscleGroup, trainingLevel, toast])

  // Refresh volume data
  const handleRefresh = async () => {
    if (!effectiveUserId) return
    
    setRefreshing(true)
    try {
      // Recalculate current volume for all muscle groups
      for (const summary of volumeSummaries) {
        await calculateCurrentVolume(effectiveUserId, summary.muscle_group)
      }
      
      // Reload data
      const summaries = await getAllMuscleGroupVolumeSummaries(effectiveUserId)
      setVolumeSummaries(summaries)
      
      // Reload selected muscle group data
      const landmarkData = await getVolumeStatusAndRecommendations(effectiveUserId, selectedMuscleGroup)
      if (landmarkData) {
        setCurrentLandmark(landmarkData)
      }
      
      toast({
        title: "Actualizado",
        description: "Datos de volumen actualizados correctamente",
      })
    } catch (error) {
      console.error("Error refreshing volume data:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos de volumen",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Handle saving edited landmark
  const handleSaveLandmark = async (landmark: VolumeLandmark) => {
    if (!effectiveUserId) return
    
    try {
      const updated = await updateVolumeLandmark(effectiveUserId, landmark)
      if (updated) {
        setCurrentLandmark(updated)
        
        // Update summaries
        const summaries = await getAllMuscleGroupVolumeSummaries(effectiveUserId)
        setVolumeSummaries(summaries)
        
        toast({
          title: "Guardado",
          description: `Valores de volumen para ${MUSCLE_GROUP_DISPLAY_NAMES[landmark.muscle_group]} actualizados`,
        })
      }
    } catch (error) {
      console.error("Error saving landmark:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setEditDialogOpen(false)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'below_mev':
        return "text-yellow-500"
      case 'optimal':
        return "text-green-500"
      case 'approaching_mrv':
        return "text-blue-500"
      case 'exceeding_mrv':
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'below_mev':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'approaching_mrv':
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      case 'exceeding_mrv':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'below_mev':
        return "Por debajo del MEV"
      case 'optimal':
        return "Volumen óptimo"
      case 'approaching_mrv':
        return "Acercándose al MRV"
      case 'exceeding_mrv':
        return "Excediendo el MRV"
      default:
        return "Desconocido"
    }
  }

  // Filter muscle groups based on view mode
  const filteredSummaries = volumeSummaries.filter(summary => {
    if (viewMode === 'all') return true
    if (viewMode === 'main') {
      return ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'].includes(summary.muscle_group)
    }
    return true
  })

  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <div className="flex items-center justify-between">
          <Card3DTitle gradient={true}>Seguimiento de Volumen de Entrenamiento</Card3DTitle>
          <div className="flex items-center space-x-2">
            <Select value={viewMode} onValueChange={(value: 'all' | 'main' | 'detailed') => setViewMode(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ver grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Grupos principales</SelectItem>
                <SelectItem value="all">Todos los grupos</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actualizar datos de volumen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D variant="outline" size="icon" onClick={() => setInfoDialogOpen(true)}>
                    <Info className="h-4 w-4" />
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Información sobre volumen de entrenamiento</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card3DHeader>
      <Card3DContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Volume landmarks chart */}
            <VolumeLandmarksChart 
              summaries={volumeSummaries} 
              selectedMuscleGroup={selectedMuscleGroup}
              onSelectMuscleGroup={setSelectedMuscleGroup}
            />
            
            {/* Muscle group volume cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSummaries.map((summary) => (
                <div 
                  key={summary.muscle_group}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedMuscleGroup === summary.muscle_group ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedMuscleGroup(summary.muscle_group)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">{summary.display_name}</h3>
                    <Badge variant="outline" className={getStatusColor(summary.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(summary.status)}
                        {getStatusText(summary.status)}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Actual: {summary.current_volume} series/semana</span>
                    <span>Óptimo: {summary.mav} series/semana</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        summary.status === 'below_mev' ? 'bg-yellow-500' :
                        summary.status === 'optimal' ? 'bg-green-500' :
                        summary.status === 'approaching_mrv' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (summary.current_volume / summary.mrv) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>MEV: {summary.mev}</span>
                    <span>MAV: {summary.mav}</span>
                    <span>MRV: {summary.mrv}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Selected muscle group details */}
            {currentLandmark && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {MUSCLE_GROUP_DISPLAY_NAMES[currentLandmark.muscle_group]}
                  </h3>
                  <Button3D variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar valores
                  </Button3D>
                </div>
                
                <VolumeLandmarksRecommendations landmark={currentLandmark} />
              </div>
            )}
          </div>
        )}
        
        {/* Edit dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar valores de volumen</DialogTitle>
              <DialogDescription>
                Ajusta los valores de volumen para {currentLandmark ? MUSCLE_GROUP_DISPLAY_NAMES[currentLandmark.muscle_group] : ''}
              </DialogDescription>
            </DialogHeader>
            
            {currentLandmark && (
              <VolumeLandmarksEditor 
                landmark={currentLandmark} 
                onSave={handleSaveLandmark}
                onCancel={() => setEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Info dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Volumen de Entrenamiento: MEV, MAV y MRV</DialogTitle>
              <DialogDescription>
                Información sobre los puntos de referencia de volumen de entrenamiento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">MEV (Volumen Mínimo Efectivo)</h4>
                <p className="text-sm text-gray-500">
                  Es el volumen mínimo de entrenamiento que produce ganancias musculares. Por debajo de este punto, 
                  el estímulo es insuficiente para generar hipertrofia significativa.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">MAV (Volumen Adaptativo Máximo)</h4>
                <p className="text-sm text-gray-500">
                  Es el volumen de entrenamiento que produce las máximas ganancias musculares. Este es el punto 
                  óptimo donde obtienes el mayor beneficio con el menor esfuerzo.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">MRV (Volumen Máximo Recuperable)</h4>
                <p className="text-sm text-gray-500">
                  Es el volumen máximo de entrenamiento que puedes realizar mientras sigues recuperándote adecuadamente. 
                  Superar este punto puede llevar al sobreentrenamiento y disminuir los resultados.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">¿Cómo usar estos valores?</h4>
                <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                  <li>Mantén el volumen entre el MEV y el MRV para cada grupo muscular</li>
                  <li>Apunta al MAV para un crecimiento óptimo</li>
                  <li>Aumenta gradualmente el volumen a lo largo de un mesociclo</li>
                  <li>Reduce el volumen durante las semanas de descarga (deload)</li>
                  <li>Ajusta estos valores según tu respuesta individual al entrenamiento</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter>
              <Button3D onClick={() => setInfoDialogOpen(false)}>Entendido</Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card3DContent>
    </Card3D>
  )
}
