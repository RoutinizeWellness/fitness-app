"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  Dumbbell, 
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { getActiveWorkoutPlan, getUserWorkoutPlans, activateWorkoutPlan } from "@/lib/workout-plan-service"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WorkoutDay {
  id: string
  name: string
  description: string
  exercises: any[]
  muscleGroups?: string[]
  restDay?: boolean
}

interface WorkoutPlan {
  id: string
  name: string
  description: string
  days: WorkoutDay[]
  level: string
  goal: string
  isActive: boolean
}

interface WorkoutPlanVerificationProps {
  currentDay?: string
  onPlanChange?: (planId: string) => void
}

export function WorkoutPlanVerification({ currentDay, onPlanChange }: WorkoutPlanVerificationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null)
  const [userPlans, setUserPlans] = useState<WorkoutPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isDiscrepancyDialogOpen, setIsDiscrepancyDialogOpen] = useState(false)
  const [isSelectPlanDialogOpen, setIsSelectPlanDialogOpen] = useState(false)
  const [discrepancyReported, setDiscrepancyReported] = useState(false)
  
  // Cargar el plan activo y todos los planes del usuario
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return
      
      setIsLoading(true)
      
      try {
        // Obtener el plan activo
        const active = await getActiveWorkoutPlan(user.id)
        setActivePlan(active)
        
        // Obtener todos los planes del usuario
        const plans = await getUserWorkoutPlans(user.id)
        setUserPlans(plans)
      } catch (error) {
        console.error("Error al cargar los planes de entrenamiento:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes de entrenamiento",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user?.id, toast])
  
  // Manejar el reporte de discrepancia
  const handleReportDiscrepancy = (feedback: "wrong" | "correct") => {
    if (feedback === "wrong") {
      setIsDiscrepancyDialogOpen(true)
    } else {
      toast({
        title: "¡Gracias por tu confirmación!",
        description: "El plan de entrenamiento mostrado es correcto.",
        variant: "default"
      })
    }
    setDiscrepancyReported(true)
  }
  
  // Manejar la selección de un plan diferente
  const handleSelectPlan = async () => {
    if (!selectedPlan || !user?.id) return
    
    setIsLoading(true)
    
    try {
      // Activar el plan seleccionado
      const result = await activateWorkoutPlan(selectedPlan, user.id)
      
      if (result.success) {
        // Actualizar el plan activo
        const active = await getActiveWorkoutPlan(user.id)
        setActivePlan(active)
        
        toast({
          title: "Plan actualizado",
          description: "Se ha cambiado tu plan de entrenamiento activo",
          variant: "default"
        })
        
        // Notificar al componente padre si existe
        if (onPlanChange) {
          onPlanChange(selectedPlan)
        }
        
        setIsSelectPlanDialogOpen(false)
      } else {
        throw new Error("No se pudo activar el plan")
      }
    } catch (error) {
      console.error("Error al cambiar el plan de entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el plan de entrenamiento",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  // Si no hay plan activo
  if (!activePlan) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium">No hay plan activo</h3>
              <p className="text-sm text-muted-foreground">
                No se encontró un plan de entrenamiento activo
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4"
            onClick={() => router.push("/training/generate-plan")}
          >
            Crear plan de entrenamiento
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Encontrar el día actual si se proporciona
  const currentDayData = currentDay 
    ? activePlan.days.find(day => day.id === currentDay) 
    : null
  
  return (
    <>
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Verificación de plan</h3>
              <p className="text-sm text-muted-foreground">
                Confirma que estás siguiendo el plan correcto
              </p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Plan activo:</h4>
              <Badge variant="outline">{activePlan.level}</Badge>
            </div>
            <p className="font-semibold text-lg">{activePlan.name}</p>
            <p className="text-sm text-muted-foreground">{activePlan.description}</p>
            
            {currentDayData && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <h5 className="font-medium">Entrenamiento actual:</h5>
                <p className="text-sm font-semibold mt-1">{currentDayData.name}</p>
                <p className="text-sm text-muted-foreground">{currentDayData.description}</p>
              </div>
            )}
          </div>
          
          {!discrepancyReported ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-center">¿Es este el plan que deberías estar siguiendo?</p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleReportDiscrepancy("wrong")}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No es correcto
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleReportDiscrepancy("correct")}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Sí, es correcto
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsSelectPlanDialogOpen(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cambiar plan activo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo para reportar discrepancia */}
      <Dialog open={isDiscrepancyDialogOpen} onOpenChange={setIsDiscrepancyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar discrepancia en el plan</DialogTitle>
            <DialogDescription>
              Indica qué plan deberías estar siguiendo o selecciona uno diferente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm font-medium mb-2">¿Qué deseas hacer?</p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setIsDiscrepancyDialogOpen(false)
                  setIsSelectPlanDialogOpen(true)
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Seleccionar un plan diferente
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/training/generate-plan")}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Crear un nuevo plan
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="secondary"
              onClick={() => setIsDiscrepancyDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para seleccionar un plan diferente */}
      <Dialog open={isSelectPlanDialogOpen} onOpenChange={setIsSelectPlanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar plan de entrenamiento</DialogTitle>
            <DialogDescription>
              Elige el plan que deseas activar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup value={selectedPlan || ""} onValueChange={setSelectedPlan}>
                {userPlans.length > 0 ? (
                  userPlans.map(plan => (
                    <div key={plan.id} className="mb-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={plan.id} className="font-medium">
                            {plan.name}
                            {plan.isActive && (
                              <Badge className="ml-2" variant="secondary">Activo</Badge>
                            )}
                          </Label>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          <div className="flex space-x-2 mt-1">
                            <Badge variant="outline">{plan.level}</Badge>
                            <Badge variant="outline">{plan.goal}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay planes disponibles
                  </p>
                )}
              </RadioGroup>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button 
              variant="secondary"
              onClick={() => setIsSelectPlanDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSelectPlan}
              disabled={!selectedPlan || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Cambiando...
                </>
              ) : (
                "Activar plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
