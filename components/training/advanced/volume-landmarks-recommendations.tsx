"use client"

import { 
  VolumeLandmark, 
  VolumeLandmarkWithStatus,
  MUSCLE_GROUP_DISPLAY_NAMES
} from "@/lib/types/volume-landmarks"
import { 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Info, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  BarChart3
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VolumeLandmarksRecommendationsProps {
  landmark: VolumeLandmark | VolumeLandmarkWithStatus
}

export function VolumeLandmarksRecommendations({
  landmark
}: VolumeLandmarksRecommendationsProps) {
  // Determine status if not provided
  const status = 'status' in landmark 
    ? landmark.status 
    : landmark.current_volume === undefined 
      ? 'unknown'
      : landmark.current_volume < landmark.mev 
        ? 'below_mev' 
        : landmark.current_volume <= landmark.mav 
          ? 'optimal' 
          : landmark.current_volume <= landmark.mrv 
            ? 'approaching_mrv' 
            : 'exceeding_mrv'
  
  // Get recommendation if not provided
  const recommendation = 'recommendation' in landmark 
    ? landmark.recommendation 
    : getRecommendation(landmark, status as any)
  
  // Get status details
  const { icon, color, title } = getStatusDetails(status as any)
  
  // Get action direction
  const actionDirection = getActionDirection(landmark, status as any)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h4 className={`font-medium ${color}`}>{title}</h4>
          <p className="text-sm text-gray-600">{recommendation}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VolumeCard 
          title="Volumen Actual" 
          value={landmark.current_volume !== undefined ? landmark.current_volume : 'N/A'} 
          description="Series por semana" 
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
          actionDirection={actionDirection}
        />
        
        <VolumeCard 
          title="Volumen Óptimo" 
          value={landmark.mav} 
          description="Series por semana (MAV)" 
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        />
        
        <VolumeCard 
          title="Rango Efectivo" 
          value={`${landmark.mev} - ${landmark.mrv}`} 
          description="Series por semana (MEV-MRV)" 
          icon={<Info className="h-5 w-5 text-gray-500" />}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Recomendaciones específicas</h4>
        <ul className="space-y-2">
          {getSpecificRecommendations(landmark, status as any).map((rec, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5">{rec.icon}</span>
              <span className="text-sm">{rec.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Helper component for volume cards
function VolumeCard({ 
  title, 
  value, 
  description, 
  icon,
  actionDirection
}: { 
  title: string; 
  value: number | string; 
  description: string; 
  icon: React.ReactNode;
  actionDirection?: 'up' | 'down' | 'maintain';
}) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="text-sm font-medium">{title}</h5>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-2xl font-bold">{value}</span>
            {actionDirection && (
              <Badge variant={
                actionDirection === 'up' ? 'destructive' : 
                actionDirection === 'down' ? 'default' : 
                'outline'
              }>
                {actionDirection === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                {actionDirection === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                {actionDirection === 'maintain' && <Minus className="h-3 w-3 mr-1" />}
                {actionDirection === 'up' ? 'Aumentar' : 
                 actionDirection === 'down' ? 'Reducir' : 
                 'Mantener'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        {icon}
      </div>
    </Card>
  )
}

// Helper function to get status details
function getStatusDetails(status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv' | 'unknown') {
  switch (status) {
    case 'below_mev':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        color: 'text-yellow-700',
        title: 'Volumen insuficiente'
      }
    case 'optimal':
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        color: 'text-green-700',
        title: 'Volumen óptimo'
      }
    case 'approaching_mrv':
      return {
        icon: <HelpCircle className="h-5 w-5 text-blue-500" />,
        color: 'text-blue-700',
        title: 'Acercándose al límite'
      }
    case 'exceeding_mrv':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        color: 'text-red-700',
        title: 'Volumen excesivo'
      }
    default:
      return {
        icon: <Info className="h-5 w-5 text-gray-500" />,
        color: 'text-gray-700',
        title: 'Estado desconocido'
      }
  }
}

// Helper function to get action direction
function getActionDirection(
  landmark: VolumeLandmark, 
  status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv' | 'unknown'
): 'up' | 'down' | 'maintain' | undefined {
  if (landmark.current_volume === undefined) return undefined
  
  switch (status) {
    case 'below_mev':
      return 'up'
    case 'optimal':
      return 'maintain'
    case 'approaching_mrv':
      return landmark.current_volume > landmark.mav ? 'down' : 'maintain'
    case 'exceeding_mrv':
      return 'down'
    default:
      return undefined
  }
}

// Helper function to get recommendation
function getRecommendation(
  landmark: VolumeLandmark, 
  status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv' | 'unknown'
): string {
  const muscleGroupName = MUSCLE_GROUP_DISPLAY_NAMES[landmark.muscle_group]
  
  switch (status) {
    case 'below_mev':
      return `Aumenta el volumen de entrenamiento para ${muscleGroupName} a al menos ${landmark.mev} series por semana para alcanzar el volumen mínimo efectivo (MEV).`
    case 'optimal':
      return `Tu volumen actual para ${muscleGroupName} está en el rango óptimo. Mantén entre ${landmark.mev}-${landmark.mav} series por semana para maximizar el crecimiento.`
    case 'approaching_mrv':
      return `Tu volumen para ${muscleGroupName} está acercándose al máximo recuperable. Considera reducir a ${landmark.mav} series por semana para optimizar la recuperación.`
    case 'exceeding_mrv':
      return `Estás excediendo el volumen máximo recuperable para ${muscleGroupName}. Reduce a ${landmark.mav} series por semana para evitar sobreentrenamiento.`
    default:
      return `No hay suficientes datos para proporcionar una recomendación para ${muscleGroupName}.`
  }
}

// Helper function to get specific recommendations
function getSpecificRecommendations(
  landmark: VolumeLandmark, 
  status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'exceeding_mrv' | 'unknown'
): Array<{ icon: JSX.Element, text: string }> {
  const muscleGroupName = MUSCLE_GROUP_DISPLAY_NAMES[landmark.muscle_group]
  
  switch (status) {
    case 'below_mev':
      return [
        { 
          icon: <ArrowUp className="h-4 w-4 text-yellow-500" />, 
          text: `Añade ${landmark.mev - (landmark.current_volume || 0)} series más por semana para alcanzar el MEV.` 
        },
        { 
          icon: <Info className="h-4 w-4 text-blue-500" />, 
          text: `Distribuye el volumen en 2-3 sesiones por semana para este grupo muscular.` 
        },
        { 
          icon: <CheckCircle className="h-4 w-4 text-green-500" />, 
          text: `Prioriza ejercicios compuestos que trabajen ${muscleGroupName} eficientemente.` 
        }
      ]
    case 'optimal':
      return [
        { 
          icon: <CheckCircle className="h-4 w-4 text-green-500" />, 
          text: `Mantén el volumen actual, estás en la zona óptima para crecimiento.` 
        },
        { 
          icon: <Info className="h-4 w-4 text-blue-500" />, 
          text: `Considera aumentar progresivamente la intensidad (peso) manteniendo el mismo volumen.` 
        },
        { 
          icon: <HelpCircle className="h-4 w-4 text-purple-500" />, 
          text: `Experimenta con diferentes ejercicios para ${muscleGroupName} para estimular nuevas adaptaciones.` 
        }
      ]
    case 'approaching_mrv':
      return [
        { 
          icon: <AlertTriangle className="h-4 w-4 text-blue-500" />, 
          text: `Estás cerca del límite recuperable. Monitoriza signos de fatiga excesiva.` 
        },
        { 
          icon: <ArrowDown className="h-4 w-4 text-blue-500" />, 
          text: `Considera reducir el volumen a ${landmark.mav} series por semana para optimizar la recuperación.` 
        },
        { 
          icon: <Info className="h-4 w-4 text-blue-500" />, 
          text: `Asegúrate de que tu nutrición y descanso sean óptimos para soportar este volumen.` 
        }
      ]
    case 'exceeding_mrv':
      return [
        { 
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />, 
          text: `Estás excediendo tu capacidad de recuperación para ${muscleGroupName}.` 
        },
        { 
          icon: <ArrowDown className="h-4 w-4 text-red-500" />, 
          text: `Reduce inmediatamente el volumen a ${landmark.mav} series por semana.` 
        },
        { 
          icon: <Info className="h-4 w-4 text-blue-500" />, 
          text: `Considera una semana de descarga (deload) para recuperarte completamente.` 
        }
      ]
    default:
      return [
        { 
          icon: <Info className="h-4 w-4 text-gray-500" />, 
          text: `Registra tu volumen de entrenamiento para obtener recomendaciones personalizadas.` 
        }
      ]
  }
}
