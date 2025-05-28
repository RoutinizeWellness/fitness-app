"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Info, 
  AlertTriangle, 
  Check, 
  Dumbbell 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeginnerExercise } from "@/lib/types/beginner-training"

interface BeginnerExerciseCardProps {
  exercise: BeginnerExercise
  compact?: boolean
  onSelect?: () => void
  selected?: boolean
  className?: string
}

export function BeginnerExerciseCard({
  exercise,
  compact = false,
  onSelect,
  selected = false,
  className = ""
}: BeginnerExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'instructions' | 'tips' | 'mistakes'>('instructions')
  
  // Obtener el color según el tipo de ejercicio
  const getExerciseTypeColor = () => {
    switch (exercise.type) {
      case 'compound':
        return "bg-blue-100 text-blue-700 border-blue-200"
      case 'isolation':
        return "bg-purple-100 text-purple-700 border-purple-200"
      case 'functional':
        return "bg-green-100 text-green-700 border-green-200"
      case 'mobility':
        return "bg-amber-100 text-amber-700 border-amber-200"
      case 'stability':
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case 'cardio':
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }
  
  // Obtener el texto del nivel de dificultad
  const getDifficultyText = () => {
    switch (exercise.difficulty) {
      case 'level_0':
        return "Absoluto principiante"
      case 'level_1':
        return "Principiante"
      case 'level_2':
        return "Principiante avanzado"
      case 'level_3':
        return "Intermedio"
      case 'level_4':
        return "Intermedio avanzado"
      case 'level_5':
        return "Avanzado"
      default:
        return "Desconocido"
    }
  }
  
  // Obtener el color según el nivel de dificultad
  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case 'level_0':
        return "bg-green-100 text-green-700 border-green-200"
      case 'level_1':
        return "bg-green-100 text-green-700 border-green-200"
      case 'level_2':
        return "bg-blue-100 text-blue-700 border-blue-200"
      case 'level_3':
        return "bg-amber-100 text-amber-700 border-amber-200"
      case 'level_4':
        return "bg-orange-100 text-orange-700 border-orange-200"
      case 'level_5':
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }
  
  // Renderizar la versión compacta
  if (compact) {
    return (
      <div 
        className={`
          relative p-4 rounded-lg border transition-all
          ${selected 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-200 bg-white hover:border-gray-300"
          }
          ${className}
        `}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          {/* Imagen o icono */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {exercise.image_url ? (
              <Image
                src={exercise.image_url}
                alt={exercise.name}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <Dumbbell className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          {/* Información básica */}
          <div className="flex-1">
            <h3 className="font-medium text-[#573353]">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor()}`}>
                {getDifficultyText()}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getExerciseTypeColor()}`}>
                {exercise.type}
              </span>
            </div>
          </div>
          
          {/* Indicador de selección */}
          {selected && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Renderizar la versión completa
  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Encabezado */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#573353]">{exercise.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Etiquetas */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor()}`}>
            {getDifficultyText()}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getExerciseTypeColor()}`}>
            {exercise.type}
          </span>
          {exercise.equipment.map((item, index) => (
            <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {item}
            </span>
          ))}
        </div>
      </div>
      
      {/* Contenido expandible */}
      {expanded && (
        <div className="p-4">
          {/* Imagen o video */}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {exercise.image_url ? (
              <Image
                src={exercise.image_url}
                alt={exercise.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Dumbbell className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {exercise.video_url && (
              <Button
                className="absolute bottom-2 right-2 bg-[#FDA758] hover:bg-[#FD9A40]"
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Ver video
              </Button>
            )}
          </div>
          
          {/* Descripción */}
          <p className="text-[#573353] opacity-80 mb-4">
            {exercise.description}
          </p>
          
          {/* Músculos trabajados */}
          <div className="mb-4">
            <h4 className="font-medium text-[#573353] mb-2">Músculos trabajados</h4>
            <div className="flex flex-wrap gap-2">
              {exercise.muscles.primary.map((muscle, index) => (
                <span key={index} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {muscle} (primario)
                </span>
              ))}
              {exercise.muscles.secondary.map((muscle, index) => (
                <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {muscle} (secundario)
                </span>
              ))}
            </div>
          </div>
          
          {/* Pestañas */}
          <div className="border-b mb-4">
            <div className="flex">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'instructions' 
                    ? "border-b-2 border-[#FDA758] text-[#573353]" 
                    : "text-[#573353] opacity-70"
                }`}
                onClick={() => setActiveTab('instructions')}
              >
                Instrucciones
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'tips' 
                    ? "border-b-2 border-[#FDA758] text-[#573353]" 
                    : "text-[#573353] opacity-70"
                }`}
                onClick={() => setActiveTab('tips')}
              >
                Consejos
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'mistakes' 
                    ? "border-b-2 border-[#FDA758] text-[#573353]" 
                    : "text-[#573353] opacity-70"
                }`}
                onClick={() => setActiveTab('mistakes')}
              >
                Errores comunes
              </button>
            </div>
          </div>
          
          {/* Contenido de la pestaña activa */}
          <div>
            {activeTab === 'instructions' && (
              <div className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-[#573353]">{instruction}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'tips' && (
              <div className="space-y-2">
                {exercise.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#573353]">{tip}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'mistakes' && (
              <div className="space-y-2">
                {exercise.common_mistakes.map((mistake, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#573353]">{mistake}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Variaciones */}
          <div className="mt-4">
            <h4 className="font-medium text-[#573353] mb-2">Variaciones</h4>
            
            {/* Más fáciles */}
            {exercise.variations.easier.length > 0 && (
              <div className="mb-2">
                <h5 className="text-sm font-medium text-[#573353] opacity-80 mb-1">Más fáciles:</h5>
                <ul className="list-disc list-inside text-sm text-[#573353] opacity-80">
                  {exercise.variations.easier.map((variation, index) => (
                    <li key={index}>{variation}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Más difíciles */}
            {exercise.variations.harder.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-[#573353] opacity-80 mb-1">Más difíciles:</h5>
                <ul className="list-disc list-inside text-sm text-[#573353] opacity-80">
                  {exercise.variations.harder.map((variation, index) => (
                    <li key={index}>{variation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
