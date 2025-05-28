"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Clock, 
  Dumbbell, 
  Target, 
  ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeginnerRoutine } from "@/lib/types/beginner-training"
import { getBeginnerExerciseById } from "@/lib/services/beginner-exercise-service"
import { BeginnerExerciseCard } from "./beginner-exercise-card"

interface BeginnerRoutineCardProps {
  routine: BeginnerRoutine
  compact?: boolean
  onStart?: () => void
  className?: string
}

export function BeginnerRoutineCard({
  routine,
  compact = false,
  onStart,
  className = ""
}: BeginnerRoutineCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [activePhase, setActivePhase] = useState<'warm_up' | 'main_workout' | 'cool_down'>('main_workout')
  const [loadingExercises, setLoadingExercises] = useState(false)
  const [exercises, setExercises] = useState<Record<string, any>>({})
  
  // Obtener el color según el tipo de entrenamiento
  const getTrainingTypeColor = () => {
    switch (routine.type) {
      case 'strength':
        return "bg-blue-100 text-blue-700 border-blue-200"
      case 'hypertrophy':
        return "bg-purple-100 text-purple-700 border-purple-200"
      case 'endurance':
        return "bg-green-100 text-green-700 border-green-200"
      case 'power':
        return "bg-amber-100 text-amber-700 border-amber-200"
      case 'flexibility':
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case 'cardio':
        return "bg-red-100 text-red-700 border-red-200"
      case 'recovery':
        return "bg-teal-100 text-teal-700 border-teal-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }
  
  // Obtener el texto del nivel de dificultad
  const getDifficultyText = () => {
    switch (routine.difficulty) {
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
    switch (routine.difficulty) {
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
  
  // Cargar los ejercicios de la rutina
  const loadExercises = async () => {
    if (Object.keys(exercises).length > 0 || loadingExercises) return;
    
    setLoadingExercises(true);
    
    try {
      const exerciseIds = new Set<string>();
      
      // Recopilar todos los IDs de ejercicios de todas las fases
      Object.values(routine.phases).forEach(phase => {
        phase.forEach(item => {
          exerciseIds.add(item.exercise_id);
        });
      });
      
      // Cargar los ejercicios
      const loadedExercises: Record<string, any> = {};
      
      for (const id of exerciseIds) {
        const exercise = await getBeginnerExerciseById(id);
        if (exercise) {
          loadedExercises[id] = exercise;
        }
      }
      
      setExercises(loadedExercises);
    } catch (error) {
      console.error('Error al cargar los ejercicios:', error);
    } finally {
      setLoadingExercises(false);
    }
  };
  
  // Manejar la expansión de la tarjeta
  const handleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    if (newExpanded) {
      loadExercises();
    }
  };
  
  // Renderizar la versión compacta
  if (compact) {
    return (
      <div 
        className={`
          p-4 rounded-lg border transition-all
          border-gray-200 bg-white hover:border-gray-300
          ${className}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Icono */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Dumbbell className="h-6 w-6 text-gray-400" />
          </div>
          
          {/* Información básica */}
          <div className="flex-1">
            <h3 className="font-medium text-[#573353]">{routine.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor()}`}>
                {getDifficultyText()}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getTrainingTypeColor()}`}>
                {routine.type}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {routine.duration} min
              </span>
            </div>
          </div>
          
          {/* Botón de inicio */}
          <Button
            size="sm"
            className="bg-[#FDA758] hover:bg-[#FD9A40]"
            onClick={onStart}
          >
            <Play className="h-4 w-4 mr-1" />
            Iniciar
          </Button>
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
          <h3 className="text-lg font-medium text-[#573353]">{routine.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
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
          <span className={`text-xs px-2 py-1 rounded-full ${getTrainingTypeColor()}`}>
            {routine.type}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {routine.duration} min
          </span>
          {routine.equipment_needed.map((item, index) => (
            <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center">
              <Dumbbell className="h-3 w-3 mr-1" />
              {item}
            </span>
          ))}
        </div>
        
        {/* Descripción */}
        <p className="text-[#573353] opacity-80 mt-2">
          {routine.description}
        </p>
      </div>
      
      {/* Contenido expandible */}
      {expanded && (
        <div className="p-4">
          {/* Adecuado para */}
          <div className="mb-4">
            <h4 className="font-medium text-[#573353] mb-2">Adecuado para</h4>
            
            {/* Limitaciones */}
            {routine.suitable_for.limitations.length > 0 && (
              <div className="mb-2">
                <h5 className="text-sm font-medium text-[#573353] opacity-80 mb-1">Limitaciones:</h5>
                <div className="flex flex-wrap gap-1">
                  {routine.suitable_for.limitations.map((limitation, index) => (
                    <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {limitation}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Objetivos */}
            {routine.suitable_for.goals.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-[#573353] opacity-80 mb-1">Objetivos:</h5>
                <div className="flex flex-wrap gap-1">
                  {routine.suitable_for.goals.map((goal, index) => (
                    <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Pestañas de fases */}
          <div className="border-b mb-4">
            <div className="flex">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activePhase === 'warm_up' 
                    ? "border-b-2 border-[#FDA758] text-[#573353]" 
                    : "text-[#573353] opacity-70"
                }`}
                onClick={() => setActivePhase('warm_up')}
              >
                Calentamiento
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activePhase === 'main_workout' 
                    ? "border-b-2 border-[#FDA758] text-[#573353]" 
                    : "text-[#573353] opacity-70"
                }`}
                onClick={() => setActivePhase('main_workout')}
              >
                Entrenamiento principal
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activePhase === 'cool_down' 
                    ? "border-b-2 border-[#FDA758] text-[#573353]" 
                    : "text-[#573353] opacity-70"
                }`}
                onClick={() => setActivePhase('cool_down')}
              >
                Enfriamiento
              </button>
            </div>
          </div>
          
          {/* Contenido de la fase activa */}
          <div>
            {loadingExercises ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-t-transparent border-[#FDA758] rounded-full animate-spin"></div>
                <span className="ml-2 text-[#573353]">Cargando ejercicios...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {routine.phases[activePhase].map((item, index) => {
                  const exercise = exercises[item.exercise_id];
                  
                  if (!exercise) {
                    return (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <p className="text-[#573353] opacity-70">Cargando ejercicio...</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-[#573353]">{exercise.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              {item.sets.map((set, setIndex) => (
                                <span key={setIndex} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  {set.reps ? `${set.reps} reps` : `${set.duration}s`}
                                  {set.weight ? ` × ${set.weight}kg` : ''}
                                  {set.rir !== undefined ? ` (RIR ${set.rir})` : ''}
                                </span>
                              ))}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                Descanso: {item.sets[0].rest}s
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              // Implementar lógica para mostrar detalles del ejercicio
                            }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Botón de inicio */}
          <div className="mt-6">
            <Button
              className="w-full bg-[#FDA758] hover:bg-[#FD9A40] py-6"
              onClick={onStart}
            >
              Iniciar rutina
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
