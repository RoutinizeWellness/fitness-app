"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ThumbsUp, ThumbsDown, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, RefreshCw, CheckCircle,
  XCircle, Minus, Plus, RotateCcw, Settings, Brain
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training"
import { calculateProgressiveOverload, applyProgression } from "@/lib/progressive-overload-calculator"
import { useToast } from "@/components/ui/use-toast"

interface RealTimeRoutineModifierProps {
  routine: WorkoutRoutine
  currentDay: WorkoutDay
  userId: string
  onRoutineModified: (modifiedRoutine: WorkoutRoutine) => void
  onDayModified: (modifiedDay: WorkoutDay) => void
  className?: string
}

interface UserFeedback {
  exerciseId: string
  setIndex: number
  difficulty: 'too_easy' | 'perfect' | 'too_hard' | 'impossible'
  fatigue: number // 1-10 scale
  motivation: number // 1-10 scale
  timeConstraint: boolean
  equipmentIssue: boolean
  formConcern: boolean
  notes?: string
  timestamp: string
}

interface ModificationSuggestion {
  id: string
  type: 'weight_adjustment' | 'rep_adjustment' | 'set_adjustment' | 'exercise_substitution' | 'rest_adjustment'
  exerciseId: string
  setIndex?: number
  currentValue: any
  suggestedValue: any
  reason: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  reversible: boolean
}

interface FatigueState {
  overall: number // 1-10
  muscleSpecific: { [muscleGroup: string]: number }
  trend: 'increasing' | 'stable' | 'decreasing'
  lastUpdated: string
}

export function RealTimeRoutineModifier({
  routine,
  currentDay,
  userId,
  onRoutineModified,
  onDayModified,
  className = ""
}: RealTimeRoutineModifierProps) {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [suggestions, setSuggestions] = useState<ModificationSuggestion[]>([])
  const [fatigueState, setFatigueState] = useState<FatigueState>({
    overall: 5,
    muscleSpecific: {},
    trend: 'stable',
    lastUpdated: new Date().toISOString()
  })
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<{ exerciseId: string; setIndex: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true)

  useEffect(() => {
    // Procesar feedback y generar sugerencias cuando cambie
    if (feedback.length > 0) {
      processFeedbackAndGenerateSuggestions()
    }
  }, [feedback])

  const handleFeedback = async (
    exerciseId: string,
    setIndex: number,
    feedbackData: Partial<UserFeedback>
  ) => {
    const newFeedback: UserFeedback = {
      exerciseId,
      setIndex,
      difficulty: feedbackData.difficulty || 'perfect',
      fatigue: feedbackData.fatigue || 5,
      motivation: feedbackData.motivation || 7,
      timeConstraint: feedbackData.timeConstraint || false,
      equipmentIssue: feedbackData.equipmentIssue || false,
      formConcern: feedbackData.formConcern || false,
      notes: feedbackData.notes,
      timestamp: new Date().toISOString()
    }

    setFeedback(prev => [...prev, newFeedback])
    
    // Actualizar estado de fatiga
    updateFatigueState(newFeedback)

    // Si el auto-ajuste está habilitado, aplicar cambios inmediatamente
    if (autoAdjustEnabled && (feedbackData.difficulty === 'too_hard' || feedbackData.difficulty === 'too_easy')) {
      await applyImmediateAdjustment(exerciseId, setIndex, feedbackData.difficulty)
    }

    toast({
      title: "Feedback Registrado",
      description: "La rutina se está adaptando a tu rendimiento",
    })
  }

  const updateFatigueState = (newFeedback: UserFeedback) => {
    setFatigueState(prev => {
      const updatedFatigue = { ...prev }
      
      // Actualizar fatiga general
      const fatigueWeight = 0.3
      updatedFatigue.overall = prev.overall * (1 - fatigueWeight) + newFeedback.fatigue * fatigueWeight
      
      // Determinar tendencia
      const recentFeedback = feedback.slice(-3)
      if (recentFeedback.length >= 2) {
        const avgRecent = recentFeedback.reduce((sum, f) => sum + f.fatigue, 0) / recentFeedback.length
        const avgPrevious = feedback.slice(-6, -3).reduce((sum, f) => sum + f.fatigue, 0) / Math.max(1, feedback.slice(-6, -3).length)
        
        if (avgRecent > avgPrevious + 1) {
          updatedFatigue.trend = 'increasing'
        } else if (avgRecent < avgPrevious - 1) {
          updatedFatigue.trend = 'decreasing'
        } else {
          updatedFatigue.trend = 'stable'
        }
      }
      
      updatedFatigue.lastUpdated = new Date().toISOString()
      return updatedFatigue
    })
  }

  const processFeedbackAndGenerateSuggestions = async () => {
    setIsProcessing(true)
    
    try {
      const newSuggestions: ModificationSuggestion[] = []
      
      // Analizar feedback reciente
      const recentFeedback = feedback.slice(-5)
      
      for (const fb of recentFeedback) {
        const exerciseSet = findExerciseSet(fb.exerciseId, fb.setIndex)
        if (!exerciseSet) continue

        // Sugerencias basadas en dificultad
        if (fb.difficulty === 'too_hard') {
          newSuggestions.push({
            id: `reduce_${fb.exerciseId}_${fb.setIndex}_${Date.now()}`,
            type: 'weight_adjustment',
            exerciseId: fb.exerciseId,
            setIndex: fb.setIndex,
            currentValue: exerciseSet.targetWeight,
            suggestedValue: Math.max(0, (exerciseSet.targetWeight || 0) * 0.9),
            reason: 'Usuario reportó dificultad excesiva',
            confidence: 0.8,
            impact: 'medium',
            reversible: true
          })
        } else if (fb.difficulty === 'too_easy') {
          // Calcular progresión inteligente
          const progression = await calculateProgressiveOverload(userId, fb.exerciseId, exerciseSet)
          
          newSuggestions.push({
            id: `increase_${fb.exerciseId}_${fb.setIndex}_${Date.now()}`,
            type: 'weight_adjustment',
            exerciseId: fb.exerciseId,
            setIndex: fb.setIndex,
            currentValue: exerciseSet.targetWeight,
            suggestedValue: (exerciseSet.targetWeight || 0) + progression.value,
            reason: 'Usuario reportó facilidad excesiva - progresión disponible',
            confidence: progression.confidence,
            impact: 'medium',
            reversible: true
          })
        }

        // Sugerencias basadas en fatiga
        if (fb.fatigue >= 8) {
          newSuggestions.push({
            id: `rest_${fb.exerciseId}_${Date.now()}`,
            type: 'rest_adjustment',
            exerciseId: fb.exerciseId,
            currentValue: exerciseSet.restTime || 120,
            suggestedValue: Math.min(300, (exerciseSet.restTime || 120) + 30),
            reason: 'Alta fatiga detectada - aumentar descanso',
            confidence: 0.9,
            impact: 'low',
            reversible: true
          })
        }

        // Sugerencias basadas en limitaciones de tiempo
        if (fb.timeConstraint) {
          newSuggestions.push({
            id: `time_${fb.exerciseId}_${Date.now()}`,
            type: 'set_adjustment',
            exerciseId: fb.exerciseId,
            currentValue: getCurrentSetCount(fb.exerciseId),
            suggestedValue: Math.max(1, getCurrentSetCount(fb.exerciseId) - 1),
            reason: 'Limitación de tiempo reportada',
            confidence: 0.7,
            impact: 'medium',
            reversible: true
          })
        }
      }

      // Filtrar sugerencias duplicadas y de baja confianza
      const filteredSuggestions = newSuggestions.filter(s => s.confidence >= 0.6)
      setSuggestions(filteredSuggestions)

    } catch (error) {
      console.error('Error processing feedback:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const applyImmediateAdjustment = async (
    exerciseId: string,
    setIndex: number,
    difficulty: 'too_easy' | 'too_hard'
  ) => {
    const exerciseSet = findExerciseSet(exerciseId, setIndex)
    if (!exerciseSet) return

    let adjustmentFactor = 1
    if (difficulty === 'too_hard') {
      adjustmentFactor = 0.9 // Reducir 10%
    } else if (difficulty === 'too_easy') {
      adjustmentFactor = 1.05 // Aumentar 5%
    }

    const newWeight = Math.max(0, (exerciseSet.targetWeight || 0) * adjustmentFactor)
    
    // Aplicar cambio
    const modifiedDay = { ...currentDay }
    const exerciseSetIndex = modifiedDay.exerciseSets.findIndex(es => 
      es.exerciseId === exerciseId
    )
    
    if (exerciseSetIndex !== -1 && modifiedDay.exerciseSets[exerciseSetIndex].sets[setIndex]) {
      modifiedDay.exerciseSets[exerciseSetIndex].sets[setIndex].targetWeight = newWeight
      onDayModified(modifiedDay)
    }
  }

  const applySuggestion = (suggestion: ModificationSuggestion) => {
    const modifiedDay = { ...currentDay }
    const exerciseSetIndex = modifiedDay.exerciseSets.findIndex(es => 
      es.exerciseId === suggestion.exerciseId
    )

    if (exerciseSetIndex === -1) return

    const exerciseSet = modifiedDay.exerciseSets[exerciseSetIndex]

    switch (suggestion.type) {
      case 'weight_adjustment':
        if (suggestion.setIndex !== undefined && exerciseSet.sets[suggestion.setIndex]) {
          exerciseSet.sets[suggestion.setIndex].targetWeight = suggestion.suggestedValue
        } else {
          // Aplicar a todas las series
          exerciseSet.sets.forEach(set => {
            set.targetWeight = suggestion.suggestedValue
          })
        }
        break

      case 'rep_adjustment':
        if (suggestion.setIndex !== undefined && exerciseSet.sets[suggestion.setIndex]) {
          exerciseSet.sets[suggestion.setIndex].targetReps = suggestion.suggestedValue
        } else {
          exerciseSet.sets.forEach(set => {
            set.targetReps = suggestion.suggestedValue
          })
        }
        break

      case 'set_adjustment':
        const currentSets = exerciseSet.sets.length
        const targetSets = suggestion.suggestedValue
        
        if (targetSets > currentSets) {
          // Agregar series
          const lastSet = exerciseSet.sets[exerciseSet.sets.length - 1]
          for (let i = currentSets; i < targetSets; i++) {
            exerciseSet.sets.push({ ...lastSet })
          }
        } else if (targetSets < currentSets) {
          // Remover series
          exerciseSet.sets = exerciseSet.sets.slice(0, targetSets)
        }
        break

      case 'rest_adjustment':
        exerciseSet.sets.forEach(set => {
          set.restTime = suggestion.suggestedValue
        })
        break
    }

    onDayModified(modifiedDay)
    
    // Remover sugerencia aplicada
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))

    toast({
      title: "Modificación Aplicada",
      description: `${suggestion.reason}`,
    })
  }

  const findExerciseSet = (exerciseId: string, setIndex: number) => {
    const exerciseSet = currentDay.exerciseSets.find(es => es.exerciseId === exerciseId)
    return exerciseSet?.sets[setIndex] || null
  }

  const getCurrentSetCount = (exerciseId: string) => {
    const exerciseSet = currentDay.exerciseSets.find(es => es.exerciseId === exerciseId)
    return exerciseSet?.sets.length || 0
  }

  const getFatigueColor = (level: number) => {
    if (level <= 3) return 'text-green-600'
    if (level <= 6) return 'text-yellow-600'
    if (level <= 8) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'weight_adjustment': return TrendingUp
      case 'rep_adjustment': return RefreshCw
      case 'set_adjustment': return Plus
      case 'rest_adjustment': return Clock
      case 'exercise_substitution': return RotateCcw
      default: return Settings
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Estado de fatiga y controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-[#1B237E]" />
              <CardTitle>Adaptación en Tiempo Real</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Auto-ajuste:</span>
              <SafeClientButton
                variant={autoAdjustEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoAdjustEnabled(!autoAdjustEnabled)}
              >
                {autoAdjustEnabled ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </SafeClientButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fatiga general */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fatiga General</span>
                <span className={`text-sm font-bold ${getFatigueColor(fatigueState.overall)}`}>
                  {fatigueState.overall.toFixed(1)}/10
                </span>
              </div>
              <Progress value={fatigueState.overall * 10} className="h-2" />
            </div>

            {/* Tendencia */}
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Tendencia:</span>
              <Badge className={
                fatigueState.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                fatigueState.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }>
                {fatigueState.trend === 'increasing' ? 'Aumentando' :
                 fatigueState.trend === 'decreasing' ? 'Disminuyendo' : 'Estable'}
              </Badge>
            </div>

            {/* Feedback reciente */}
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Feedback:</span>
              <span className="text-sm text-gray-600">{feedback.length} registros</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias de modificación */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-[#FEA800]" />
              Sugerencias de Ajuste
              {isProcessing && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Modificaciones recomendadas basadas en tu feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {suggestions.map((suggestion, index) => {
                  const Icon = getSuggestionIcon(suggestion.type)
                  
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start flex-1">
                        <Icon className="h-4 w-4 mr-2 mt-0.5 text-[#1B237E]" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{suggestion.reason}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-600">
                              {suggestion.currentValue} → {suggestion.suggestedValue}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Confianza: {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                            <Badge className={
                              suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {suggestion.impact}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <SafeClientButton
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aplicar
                        </SafeClientButton>
                        <SafeClientButton
                          variant="outline"
                          size="sm"
                          onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                        >
                          <XCircle className="h-4 w-4" />
                        </SafeClientButton>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de feedback rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Rápido</CardTitle>
          <CardDescription>
            Indica cómo te sientes durante el entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SafeClientButton
              variant="outline"
              className="h-16 flex-col"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <ThumbsUp className="h-5 w-5 mb-1 text-green-600" />
              <span className="text-xs">Muy Fácil</span>
            </SafeClientButton>
            
            <SafeClientButton
              variant="outline"
              className="h-16 flex-col"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <CheckCircle className="h-5 w-5 mb-1 text-blue-600" />
              <span className="text-xs">Perfecto</span>
            </SafeClientButton>
            
            <SafeClientButton
              variant="outline"
              className="h-16 flex-col"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <ThumbsDown className="h-5 w-5 mb-1 text-orange-600" />
              <span className="text-xs">Muy Difícil</span>
            </SafeClientButton>
            
            <SafeClientButton
              variant="outline"
              className="h-16 flex-col"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <AlertTriangle className="h-5 w-5 mb-1 text-red-600" />
              <span className="text-xs">Imposible</span>
            </SafeClientButton>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de feedback detallado */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback Detallado</DialogTitle>
            <DialogDescription>
              Ayúdanos a ajustar tu rutina en tiempo real
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nivel de Fatiga (1-10)</label>
              <Slider
                value={[fatigueState.overall]}
                onValueChange={([value]) => setFatigueState(prev => ({ ...prev, overall: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Muy fresco</span>
                <span>Agotado</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="timeConstraint" className="rounded" />
                <label htmlFor="timeConstraint" className="text-sm">Falta de tiempo</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="equipmentIssue" className="rounded" />
                <label htmlFor="equipmentIssue" className="text-sm">Problema equipamiento</label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <SafeClientButton variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancelar
              </SafeClientButton>
              <SafeClientButton onClick={() => setShowFeedbackDialog(false)}>
                Enviar Feedback
              </SafeClientButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
