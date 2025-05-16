"use client"

import { useState } from "react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { AIRecommendation, applyRecommendation } from "@/lib/admin-ai-recommendations"
import {
  Lightbulb,
  Brain,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Utensils,
  Moon,
  Info,
  AlertTriangle,
  Zap,
  RefreshCw
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface AIRecommendationsProps {
  recommendations: AIRecommendation[]
  isLoading?: boolean
  onRefresh?: () => void
  onApply?: (recommendation: AIRecommendation) => void
  title?: string
  emptyMessage?: string
  showCategory?: boolean
}

export function AIRecommendations({
  recommendations,
  isLoading = false,
  onRefresh,
  onApply,
  title = "Recomendaciones de IA",
  emptyMessage = "No hay recomendaciones disponibles en este momento.",
  showCategory = true
}: AIRecommendationsProps) {
  const { toast } = useToast()
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isApplying, setIsApplying] = useState(false)

  // Agrupar recomendaciones por categoría
  const groupedRecommendations = recommendations.reduce((acc, recommendation) => {
    if (!acc[recommendation.category]) {
      acc[recommendation.category] = []
    }
    acc[recommendation.category].push(recommendation)
    return acc
  }, {} as Record<string, AIRecommendation[]>)

  // Obtener icono según la categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training':
        return <Dumbbell className="h-4 w-4" />
      case 'nutrition':
        return <Utensils className="h-4 w-4" />
      case 'sleep':
        return <Moon className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Obtener color según el nivel de impacto
  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high':
        return "bg-red-500"
      case 'medium':
        return "bg-amber-500"
      case 'low':
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Manejar aplicación de recomendación
  const handleApplyRecommendation = async () => {
    if (!selectedRecommendation) return

    setIsApplying(true)
    try {
      const { data, error } = await applyRecommendation(selectedRecommendation.id, notes)

      if (error) throw error

      toast({
        title: "Recomendación aplicada",
        description: "La recomendación se ha aplicado correctamente.",
      })

      // Llamar al callback si existe
      if (onApply) {
        onApply({
          ...selectedRecommendation,
          applied: true,
          applied_at: new Date().toISOString()
        })
      }

      setIsApplyDialogOpen(false)
      setNotes("")
    } catch (error) {
      console.error("Error al aplicar recomendación:", error)
      toast({
        title: "Error",
        description: "No se pudo aplicar la recomendación.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <>
      <Card3D>
        <Card3DHeader className="flex flex-row items-center justify-between">
          <Card3DTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            {title}
          </Card3DTitle>
          {onRefresh && (
            <Button3D variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button3D>
          )}
        </Card3DHeader>
        <Card3DContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <PulseLoader message="Generando recomendaciones..." />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : showCategory ? (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedRecommendations).map(([category, recs]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="flex items-center">
                    <div className="flex items-center">
                      {getCategoryIcon(category)}
                      <span className="ml-2 capitalize">{category}</span>
                      <Badge className="ml-2">{recs.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {recs.map((recommendation) => (
                        <RecommendationCard
                          key={recommendation.id}
                          recommendation={recommendation}
                          onApply={() => {
                            setSelectedRecommendation(recommendation)
                            setIsApplyDialogOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="space-y-3">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onApply={() => {
                    setSelectedRecommendation(recommendation)
                    setIsApplyDialogOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </Card3DContent>
      </Card3D>

      {/* Diálogo para aplicar recomendación */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar recomendación</DialogTitle>
            <DialogDescription>
              Añade notas sobre cómo aplicarás esta recomendación y los resultados esperados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRecommendation && (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center mb-2">
                    <Badge className={`mr-2 ${getImpactColor(selectedRecommendation.impact_level)}`}>
                      {selectedRecommendation.impact_level === 'high' ? 'Alto impacto' :
                       selectedRecommendation.impact_level === 'medium' ? 'Impacto medio' : 'Bajo impacto'}
                    </Badge>
                    <Badge variant="outline">
                      {selectedRecommendation.confidence}% confianza
                    </Badge>
                  </div>
                  <h3 className="font-medium">{selectedRecommendation.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRecommendation.description}</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notas de implementación
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Describe cómo implementarás esta recomendación..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setIsApplyDialogOpen(false)} disabled={isApplying}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleApplyRecommendation} disabled={isApplying}>
              {isApplying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aplicar recomendación
                </>
              )}
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface RecommendationCardProps {
  recommendation: AIRecommendation
  onApply: () => void
}

function RecommendationCard({ recommendation, onApply }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Obtener icono según la categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training':
        return <Dumbbell className="h-4 w-4 text-red-500" />
      case 'nutrition':
        return <Utensils className="h-4 w-4 text-green-500" />
      case 'sleep':
        return <Moon className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-purple-500" />
    }
  }

  // Obtener color según el nivel de impacto
  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high':
        return "bg-red-500"
      case 'medium':
        return "bg-amber-500"
      case 'low':
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className={`border rounded-md p-3 ${recommendation.applied ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            {getCategoryIcon(recommendation.category)}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <Badge className={getImpactColor(recommendation.impact_level)}>
                {recommendation.impact_level === 'high' ? 'Alto impacto' :
                 recommendation.impact_level === 'medium' ? 'Impacto medio' : 'Bajo impacto'}
              </Badge>
              <Badge variant="outline">
                {recommendation.confidence}% confianza
              </Badge>
              {recommendation.applied && (
                <Badge variant="outline" className="bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aplicada
                </Badge>
              )}
            </div>
            <h3 className="font-medium">{recommendation.title}</h3>
            <p className={`text-sm text-muted-foreground mt-1 ${!expanded && 'line-clamp-2'}`}>
              {recommendation.description}
            </p>
            {recommendation.description.length > 100 && (
              <button
                className="text-xs text-primary flex items-center mt-1"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Mostrar más
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {!recommendation.applied && (
          <Button3D size="sm" className="ml-2 flex-shrink-0" onClick={onApply}>
            <Zap className="h-4 w-4 mr-2" />
            Aplicar
          </Button3D>
        )}
      </div>
    </div>
  )
}
