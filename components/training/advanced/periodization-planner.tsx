"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, ChevronDown, ChevronUp, Info, Plus, Trash2 } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { useUserExperience } from "@/contexts/user-experience-context"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

// Tipos para la planificación de periodización
interface MacrocyclePhase {
  id: string
  name: string
  durationWeeks: number
  goal: string
  description: string
  mesocycles: MesocyclePhase[]
}

interface MesocyclePhase {
  id: string
  name: string
  durationWeeks: number
  type: string
  volumeMultiplier: number
  intensityMultiplier: number
  includeDeload: boolean
  microcycles: MicrocyclePhase[]
}

interface MicrocyclePhase {
  id: string
  weekNumber: number
  focus: string
  volumeAdjustment: number
  intensityAdjustment: number
  notes: string
}

interface PeriodizationPlan {
  id: string
  userId: string
  name: string
  description: string
  startDate: string
  endDate: string
  goal: string
  macrocycles: MacrocyclePhase[]
  createdAt: string
  updatedAt: string
}

export function PeriodizationPlanner() {
  const { experienceLevel, interfaceMode } = useUserExperience()
  const [activeTab, setActiveTab] = useState("create")
  const [plans, setPlans] = useState<PeriodizationPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<PeriodizationPlan | null>(null)
  
  // Cargar planes existentes
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('periodization_plans')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setPlans(data || [])
      } catch (error) {
        console.error("Error al cargar planes de periodización:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes de periodización.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPlans()
  }, [])
  
  // Crear un nuevo plan
  const createNewPlan = () => {
    const newPlan: PeriodizationPlan = {
      id: uuidv4(),
      userId: "", // Se asignará al guardar
      name: "Nuevo Plan de Periodización",
      description: "Descripción del plan",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 52 * 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
      goal: "hypertrophy",
      macrocycles: [createDefaultMacrocycle()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCurrentPlan(newPlan)
    setActiveTab("edit")
  }
  
  // Crear un macrociclo por defecto
  const createDefaultMacrocycle = (): MacrocyclePhase => {
    return {
      id: uuidv4(),
      name: "Macrociclo 1",
      durationWeeks: 16,
      goal: "hypertrophy",
      description: "Fase de hipertrofia",
      mesocycles: [createDefaultMesocycle()]
    }
  }
  
  // Crear un mesociclo por defecto
  const createDefaultMesocycle = (): MesocyclePhase => {
    return {
      id: uuidv4(),
      name: "Mesociclo 1",
      durationWeeks: 4,
      type: "volume",
      volumeMultiplier: 1.0,
      intensityMultiplier: 1.0,
      includeDeload: true,
      microcycles: Array.from({ length: 4 }, (_, i) => createDefaultMicrocycle(i + 1))
    }
  }
  
  // Crear un microciclo por defecto
  const createDefaultMicrocycle = (weekNumber: number): MicrocyclePhase => {
    return {
      id: uuidv4(),
      weekNumber,
      focus: weekNumber === 4 ? "deload" : "progressive_overload",
      volumeAdjustment: weekNumber === 4 ? -30 : (weekNumber - 1) * 5,
      intensityAdjustment: weekNumber === 4 ? -20 : (weekNumber - 1) * 5,
      notes: weekNumber === 4 ? "Semana de descarga" : `Semana ${weekNumber}`
    }
  }
  
  // Guardar el plan actual
  const savePlan = async () => {
    if (!currentPlan) return
    
    try {
      // Actualizar fechas
      const updatedPlan = {
        ...currentPlan,
        updatedAt: new Date().toISOString()
      }
      
      // Guardar en Supabase
      const { error } = await supabase
        .from('periodization_plans')
        .upsert(updatedPlan)
      
      if (error) throw error
      
      toast({
        title: "Plan guardado",
        description: "El plan de periodización se ha guardado correctamente."
      })
      
      // Actualizar la lista de planes
      setPlans(prev => {
        const exists = prev.some(p => p.id === updatedPlan.id)
        if (exists) {
          return prev.map(p => p.id === updatedPlan.id ? updatedPlan : p)
        } else {
          return [updatedPlan, ...prev]
        }
      })
    } catch (error) {
      console.error("Error al guardar plan:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el plan de periodización.",
        variant: "destructive"
      })
    }
  }
  
  // Renderizar el componente
  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <Card3DTitle gradient={true}>Planificador de Periodización Avanzado</Card3DTitle>
      </Card3DHeader>
      <Card3DContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="create">Crear Plan</TabsTrigger>
            <TabsTrigger value="view">Mis Planes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Crea un nuevo plan de periodización</h3>
              <p className="text-muted-foreground mb-4">
                Diseña macrociclos, mesociclos y microciclos para optimizar tu progreso
              </p>
              <Button onClick={createNewPlan} className="mx-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Plan
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="view" className="space-y-4">
            {isLoading ? (
              <div className="py-8 text-center">
                <p>Cargando planes...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No tienes planes de periodización</p>
                <Button onClick={createNewPlan} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map(plan => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    onEdit={() => {
                      setCurrentPlan(plan)
                      setActiveTab("edit")
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            {currentPlan && (
              <PlanEditor 
                plan={currentPlan} 
                onChange={setCurrentPlan} 
                onSave={savePlan}
                onCancel={() => setActiveTab("view")}
              />
            )}
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}

// Componente para mostrar un plan en la lista
function PlanCard({ plan, onEdit }: { plan: PeriodizationPlan, onEdit: () => void }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
    </div>
  )
}

// Componente para editar un plan
function PlanEditor({ 
  plan, 
  onChange, 
  onSave,
  onCancel
}: { 
  plan: PeriodizationPlan, 
  onChange: (plan: PeriodizationPlan) => void,
  onSave: () => void,
  onCancel: () => void
}) {
  // Implementación del editor (se completará en la siguiente parte)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plan-name">Nombre del plan</Label>
          <Input
            id="plan-name"
            value={plan.name}
            onChange={(e) => onChange({ ...plan, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-goal">Objetivo principal</Label>
          <Select
            value={plan.goal}
            onValueChange={(value) => onChange({ ...plan, goal: value })}
          >
            <SelectTrigger id="plan-goal">
              <SelectValue placeholder="Selecciona un objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
              <SelectItem value="strength">Fuerza</SelectItem>
              <SelectItem value="power">Potencia</SelectItem>
              <SelectItem value="endurance">Resistencia</SelectItem>
              <SelectItem value="fat_loss">Pérdida de grasa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="plan-description">Descripción</Label>
        <Input
          id="plan-description"
          value={plan.description}
          onChange={(e) => onChange({ ...plan, description: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSave}>
          Guardar Plan
        </Button>
      </div>
    </div>
  )
}
