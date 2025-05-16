"use client"

import { useState } from "react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { ClientEvaluation, createClientEvaluation } from "@/lib/admin-client-evaluation"
import {
  Star,
  Plus,
  Minus,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Dumbbell,
  Utensils,
  Brain,
  Target,
  TrendingUp
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface ClientEvaluationFormProps {
  userId: string
  onEvaluationCreated?: (evaluation: ClientEvaluation) => void
  previousEvaluation?: ClientEvaluation
}

export function ClientEvaluationForm({
  userId,
  onEvaluationCreated,
  previousEvaluation
}: ClientEvaluationFormProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState<Omit<ClientEvaluation, 'id'>>({
    user_id: userId,
    evaluator_id: "admin_user_id", // Esto debería ser el ID del administrador actual
    evaluation_date: new Date().toISOString(),
    overall_score: previousEvaluation?.overall_score || 7,
    training_score: previousEvaluation?.training_score || 7,
    nutrition_score: previousEvaluation?.nutrition_score || 7,
    adherence_score: previousEvaluation?.adherence_score || 7,
    progress_score: previousEvaluation?.progress_score || 7,
    notes: previousEvaluation?.notes || "",
    goals_achieved: previousEvaluation?.goals_achieved || [],
    areas_to_improve: previousEvaluation?.areas_to_improve || ["Consistencia en entrenamiento", "Nutrición", "Descanso"],
    recommendations: previousEvaluation?.recommendations || ["Aumentar frecuencia de entrenamiento", "Mejorar hidratación"],
    next_evaluation_date: (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date.toISOString();
    })()
  })
  
  // Estado para nuevos elementos
  const [newGoal, setNewGoal] = useState("")
  const [newArea, setNewArea] = useState("")
  const [newRecommendation, setNewRecommendation] = useState("")

  // Manejar cambios en los campos
  const handleScoreChange = (field: keyof ClientEvaluation, value: number) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Añadir nuevo objetivo logrado
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setEvaluation(prev => ({
        ...prev,
        goals_achieved: [...prev.goals_achieved, newGoal.trim()]
      }))
      setNewGoal("")
    }
  }

  // Eliminar objetivo logrado
  const handleRemoveGoal = (index: number) => {
    setEvaluation(prev => ({
      ...prev,
      goals_achieved: prev.goals_achieved.filter((_, i) => i !== index)
    }))
  }

  // Añadir nueva área de mejora
  const handleAddArea = () => {
    if (newArea.trim()) {
      setEvaluation(prev => ({
        ...prev,
        areas_to_improve: [...prev.areas_to_improve, newArea.trim()]
      }))
      setNewArea("")
    }
  }

  // Eliminar área de mejora
  const handleRemoveArea = (index: number) => {
    setEvaluation(prev => ({
      ...prev,
      areas_to_improve: prev.areas_to_improve.filter((_, i) => i !== index)
    }))
  }

  // Añadir nueva recomendación
  const handleAddRecommendation = () => {
    if (newRecommendation.trim()) {
      setEvaluation(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRecommendation.trim()]
      }))
      setNewRecommendation("")
    }
  }

  // Eliminar recomendación
  const handleRemoveRecommendation = (index: number) => {
    setEvaluation(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }))
  }

  // Enviar evaluación
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { data, error } = await createClientEvaluation(evaluation)

      if (error) throw error

      toast({
        title: "Evaluación creada",
        description: "La evaluación del cliente se ha creado correctamente.",
      })

      if (onEvaluationCreated && data) {
        onEvaluationCreated(data)
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al crear evaluación:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la evaluación del cliente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button3D>
          <Star className="h-4 w-4 mr-2" />
          Nueva Evaluación
        </Button3D>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluación del Cliente</DialogTitle>
          <DialogDescription>
            Evalúa el progreso y rendimiento del cliente. Esta evaluación ayudará a personalizar sus planes futuros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Puntuaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Puntuaciones</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Puntuación general
                  </label>
                  <span className="font-bold">{evaluation.overall_score}/10</span>
                </div>
                <Slider
                  value={[evaluation.overall_score]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleScoreChange('overall_score', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-red-500" />
                    Entrenamiento
                  </label>
                  <span className="font-bold">{evaluation.training_score}/10</span>
                </div>
                <Slider
                  value={[evaluation.training_score]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleScoreChange('training_score', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center">
                    <Utensils className="h-4 w-4 mr-2 text-green-500" />
                    Nutrición
                  </label>
                  <span className="font-bold">{evaluation.nutrition_score}/10</span>
                </div>
                <Slider
                  value={[evaluation.nutrition_score]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleScoreChange('nutrition_score', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                    Adherencia
                  </label>
                  <span className="font-bold">{evaluation.adherence_score}/10</span>
                </div>
                <Slider
                  value={[evaluation.adherence_score]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleScoreChange('adherence_score', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2 text-purple-500" />
                    Progreso
                  </label>
                  <span className="font-bold">{evaluation.progress_score}/10</span>
                </div>
                <Slider
                  value={[evaluation.progress_score]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleScoreChange('progress_score', value[0])}
                />
              </div>
            </div>
          </div>

          {/* Objetivos logrados */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Objetivos Logrados</h3>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir objetivo logrado..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button3D onClick={handleAddGoal} size="icon">
                  <Plus className="h-4 w-4" />
                </Button3D>
              </div>
              
              <div className="space-y-2 mt-2">
                {evaluation.goals_achieved.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay objetivos logrados registrados.</p>
                ) : (
                  evaluation.goals_achieved.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{goal}</span>
                      </div>
                      <Button3D variant="ghost" size="icon" onClick={() => handleRemoveGoal(index)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button3D>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Áreas de mejora */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Áreas de Mejora</h3>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir área de mejora..."
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
                />
                <Button3D onClick={handleAddArea} size="icon">
                  <Plus className="h-4 w-4" />
                </Button3D>
              </div>
              
              <div className="space-y-2 mt-2">
                {evaluation.areas_to_improve.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay áreas de mejora registradas.</p>
                ) : (
                  evaluation.areas_to_improve.map((area, index) => (
                    <div key={index} className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 text-amber-500 mr-2" />
                        <span>{area}</span>
                      </div>
                      <Button3D variant="ghost" size="icon" onClick={() => handleRemoveArea(index)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button3D>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recomendaciones</h3>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir recomendación..."
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRecommendation()}
                />
                <Button3D onClick={handleAddRecommendation} size="icon">
                  <Plus className="h-4 w-4" />
                </Button3D>
              </div>
              
              <div className="space-y-2 mt-2">
                {evaluation.recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay recomendaciones registradas.</p>
                ) : (
                  evaluation.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 text-blue-500 mr-2" />
                        <span>{recommendation}</span>
                      </div>
                      <Button3D variant="ghost" size="icon" onClick={() => handleRemoveRecommendation(index)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button3D>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-lg font-medium">Notas</label>
            <Textarea
              placeholder="Añade notas detalladas sobre la evaluación del cliente..."
              value={evaluation.notes}
              onChange={(e) => setEvaluation(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Próxima evaluación */}
          <div className="space-y-2">
            <label className="text-lg font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Fecha de próxima evaluación
            </label>
            <Input
              type="date"
              value={evaluation.next_evaluation_date ? new Date(evaluation.next_evaluation_date).toISOString().split('T')[0] : ''}
              onChange={(e) => setEvaluation(prev => ({ ...prev, next_evaluation_date: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button3D variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button3D>
          <Button3D onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Guardar Evaluación
              </>
            )}
          </Button3D>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
