"use client"

import { useState } from "react"
import {
  TrendingUp, ChevronDown, ChevronUp, 
  Check, X, Info, ArrowUpRight,
  BarChart3, Calendar, Repeat, Clock
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  ProgressionMethod,
  PROGRESSION_METHODS,
  TrainingGoal
} from "@/lib/bodybuilding-science"

interface ProgressionMethodsProps {
  goal: TrainingGoal
  selectedMethod: string
  onSelectMethod: (method: string) => void
}

export function ProgressionMethods({
  goal,
  selectedMethod,
  onSelectMethod
}: ProgressionMethodsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMethodDialog, setShowMethodDialog] = useState(false)
  const [methodToView, setMethodToView] = useState<ProgressionMethod | null>(null)
  
  // Filtrar métodos aplicables al objetivo
  const applicableMethods = PROGRESSION_METHODS.filter(method => 
    method.applicableGoals.includes(goal)
  )
  
  // Mostrar detalles de un método
  const viewMethodDetails = (method: ProgressionMethod) => {
    setMethodToView(method)
    setShowMethodDialog(true)
  }
  
  // Renderizar ejemplos visuales de progresión
  const renderProgressionExample = (method: ProgressionMethod) => {
    switch (method.name) {
      case 'Doble Progresión':
        return (
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex flex-col items-center">
              <span>Semana 1</span>
              <Badge variant="outline">3×8</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3" />
            <div className="flex flex-col items-center">
              <span>Semana 2</span>
              <Badge variant="outline">3×10</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3" />
            <div className="flex flex-col items-center">
              <span>Semana 3</span>
              <Badge variant="outline">3×12</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3" />
            <div className="flex flex-col items-center">
              <span>Semana 4</span>
              <Badge variant="outline">3×8 (+peso)</Badge>
            </div>
          </div>
        )
      case 'Periodización Lineal':
        return (
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex flex-col items-center">
              <span>Semana 1</span>
              <Badge variant="outline">3×12 (70%)</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3" />
            <div className="flex flex-col items-center">
              <span>Semana 2</span>
              <Badge variant="outline">4×8 (75%)</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3" />
            <div className="flex flex-col items-center">
              <span>Semana 3</span>
              <Badge variant="outline">5×5 (80%)</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3" />
            <div className="flex flex-col items-center">
              <span>Semana 4</span>
              <Badge variant="outline">6×3 (85%)</Badge>
            </div>
          </div>
        )
      case 'Periodización Ondulada':
        return (
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex flex-col items-center">
              <span>Lunes</span>
              <Badge variant="outline">3×12 (70%)</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3 rotate-90" />
            <div className="flex flex-col items-center">
              <span>Miércoles</span>
              <Badge variant="outline">4×8 (75%)</Badge>
            </div>
            <ArrowUpRight className="h-3 w-3 rotate-90" />
            <div className="flex flex-col items-center">
              <span>Viernes</span>
              <Badge variant="outline">5×5 (80%)</Badge>
            </div>
          </div>
        )
      default:
        return null
    }
  }
  
  return (
    <>
      <Card3D>
        <Card3DHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              <Card3DTitle>Método de Progresión</Card3DTitle>
            </div>
            <Button3D 
              variant="ghost" 
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button3D>
          </div>
        </Card3DHeader>
        
        {!isExpanded && (
          <Card3DContent className="pt-0">
            <div className="flex justify-between items-center">
              <div className="font-medium">{selectedMethod}</div>
              <Button3D 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const method = PROGRESSION_METHODS.find(m => m.name === selectedMethod)
                  if (method) {
                    viewMethodDetails(method)
                  }
                }}
              >
                Ver detalles
              </Button3D>
            </div>
          </Card3DContent>
        )}
        
        {isExpanded && (
          <Card3DContent className="pt-0">
            <div className="text-sm text-muted-foreground mb-4">
              Selecciona el método de progresión que quieres aplicar a tu entrenamiento.
              El método de progresión determina cómo aumentarás la carga a lo largo del tiempo.
            </div>
            
            <RadioGroup 
              value={selectedMethod} 
              onValueChange={onSelectMethod}
              className="space-y-3"
            >
              {PROGRESSION_METHODS.map((method) => {
                const isApplicable = method.applicableGoals.includes(goal)
                
                return (
                  <div 
                    key={method.name}
                    className={`flex items-start p-3 rounded-md border ${
                      selectedMethod === method.name 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                        : !isApplicable
                          ? 'bg-muted/30 border-muted'
                          : 'bg-card/50 border-border'
                    }`}
                  >
                    <RadioGroupItem 
                      value={method.name} 
                      id={`method-${method.name}`}
                      className="mt-1"
                      disabled={!isApplicable && selectedMethod !== method.name}
                    />
                    <div className="ml-3 flex-1">
                      <Label 
                        htmlFor={`method-${method.name}`}
                        className="font-medium flex items-center"
                      >
                        {method.name}
                        {!isApplicable && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            No ideal para {goal}
                          </Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                      
                      <div className="mt-3 mb-1">
                        {renderProgressionExample(method)}
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <Button3D 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            viewMethodDetails(method)
                          }}
                        >
                          Ver detalles
                        </Button3D>
                      </div>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </Card3DContent>
        )}
      </Card3D>
      
      <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Método de Progresión</DialogTitle>
            <DialogDescription>
              Detalles sobre cómo implementar este método de progresión.
            </DialogDescription>
          </DialogHeader>
          
          {methodToView && (
            <div className="py-4">
              <div className="font-medium text-lg">{methodToView.name}</div>
              <p className="text-muted-foreground mt-1">{methodToView.description}</p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Objetivos recomendados:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {methodToView.applicableGoals.map((g, i) => (
                      <Badge key={i} variant={g === goal ? 'default' : 'outline'}>
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="implementation">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-500" />
                        <span className="font-medium">Implementación</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 bg-muted rounded-md">
                        {methodToView.implementation}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="example">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center">
                        <Repeat className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-medium">Ejemplo Práctico</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 bg-muted rounded-md">
                        {methodToView.name === 'Doble Progresión' && (
                          <div className="space-y-2">
                            <p>Ejemplo con Press de Banca:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Semana 1: 3 series × 8 reps con 80kg</li>
                              <li>Semana 2: 3 series × 9 reps con 80kg</li>
                              <li>Semana 3: 3 series × 10 reps con 80kg</li>
                              <li>Semana 4: 3 series × 11 reps con 80kg</li>
                              <li>Semana 5: 3 series × 12 reps con 80kg</li>
                              <li>Semana 6: 3 series × 8 reps con 85kg (aumento de peso)</li>
                              <li>Repetir el ciclo</li>
                            </ul>
                          </div>
                        )}
                        
                        {methodToView.name === 'Periodización Lineal' && (
                          <div className="space-y-2">
                            <p>Ejemplo con Sentadilla:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Semana 1 (Fase de volumen): 3 series × 12 reps con 70% 1RM</li>
                              <li>Semana 2 (Fase de volumen): 3 series × 10 reps con 75% 1RM</li>
                              <li>Semana 3 (Fase de fuerza): 4 series × 8 reps con 80% 1RM</li>
                              <li>Semana 4 (Fase de fuerza): 4 series × 6 reps con 85% 1RM</li>
                              <li>Semana 5 (Fase de potencia): 5 series × 3 reps con 90% 1RM</li>
                              <li>Semana 6 (Deload): 2 series × 8 reps con 65% 1RM</li>
                              <li>Repetir con pesos incrementados</li>
                            </ul>
                          </div>
                        )}
                        
                        {methodToView.name === 'Periodización Ondulada' && (
                          <div className="space-y-2">
                            <p>Ejemplo con Peso Muerto:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Lunes (Día de volumen): 3 series × 12 reps con 70% 1RM</li>
                              <li>Miércoles (Día de hipertrofia): 4 series × 8 reps con 75% 1RM</li>
                              <li>Viernes (Día de fuerza): 5 series × 5 reps con 80% 1RM</li>
                              <li>Siguiente semana: Aumentar ligeramente los pesos y repetir</li>
                            </ul>
                          </div>
                        )}
                        
                        {methodToView.name === 'Periodización por Bloques' && (
                          <div className="space-y-2">
                            <p>Ejemplo de programa completo:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Bloque 1 (Hipertrofia, 4 semanas): 3-4 series × 8-12 reps, RIR 2-3</li>
                              <li>Bloque 2 (Fuerza, 4 semanas): 4-5 series × 4-6 reps, RIR 1-2</li>
                              <li>Bloque 3 (Potencia, 2 semanas): 3-4 series × 2-3 reps, RIR 0-1</li>
                              <li>Bloque 4 (Deload, 1 semana): 2 series × 8 reps, RIR 4</li>
                              <li>Repetir ciclo con mayor intensidad</li>
                            </ul>
                          </div>
                        )}
                        
                        {methodToView.name === 'Progresión por RIR' && (
                          <div className="space-y-2">
                            <p>Ejemplo con Curl de Bíceps:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Semana 1: 3 series × 10 reps con 15kg, RIR=3</li>
                              <li>Semana 2: 3 series × 10 reps con 15kg, RIR=2</li>
                              <li>Semana 3: 3 series × 10 reps con 15kg, RIR=1</li>
                              <li>Semana 4: 3 series × 10 reps con 17.5kg, RIR=3</li>
                              <li>Repetir el ciclo</li>
                            </ul>
                          </div>
                        )}
                        
                        {methodToView.name === 'Progresión por Volumen' && (
                          <div className="space-y-2">
                            <p>Ejemplo con Elevaciones Laterales:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Semana 1: 3 series × 12 reps con 10kg</li>
                              <li>Semana 2: 4 series × 12 reps con 10kg</li>
                              <li>Semana 3: 5 series × 12 reps con 10kg</li>
                              <li>Semana 4: 3 series × 12 reps con 12.5kg</li>
                              <li>Repetir el ciclo</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="tips">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="font-medium">Consejos y Consideraciones</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 bg-muted rounded-md">
                        {methodToView.name === 'Doble Progresión' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Ideal para principiantes e intermedios</li>
                            <li>Funciona mejor con ejercicios de aislamiento</li>
                            <li>Aumenta el peso en incrementos pequeños (2.5-5%)</li>
                            <li>Mantén la técnica correcta al aumentar repeticiones</li>
                            <li>Registra tus progresos para seguir la progresión</li>
                          </ul>
                        )}
                        
                        {methodToView.name === 'Periodización Lineal' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Mejor para objetivos de fuerza y potencia</li>
                            <li>Ideal para ejercicios compuestos principales</li>
                            <li>Requiere conocer tu 1RM o estimarlo</li>
                            <li>Incluye una semana de descarga cada 4-6 semanas</li>
                            <li>Permite una recuperación adecuada entre fases</li>
                          </ul>
                        )}
                        
                        {methodToView.name === 'Periodización Ondulada' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Ideal para atletas intermedios y avanzados</li>
                            <li>Permite trabajar múltiples cualidades a la vez</li>
                            <li>Reduce el riesgo de sobreentrenamiento</li>
                            <li>Requiere buena planificación y seguimiento</li>
                            <li>Puede ser diaria (DUP) o semanal (WUP)</li>
                          </ul>
                        )}
                        
                        {methodToView.name === 'Periodización por Bloques' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Mejor para atletas avanzados con objetivos específicos</li>
                            <li>Requiere planificación a largo plazo (3-6 meses)</li>
                            <li>Cada bloque construye sobre el anterior</li>
                            <li>Incluye deloads planificados entre bloques</li>
                            <li>Permite máxima adaptación a cada cualidad física</li>
                          </ul>
                        )}
                        
                        {methodToView.name === 'Progresión por RIR' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Requiere buena percepción del esfuerzo</li>
                            <li>Ideal para autorregulación del entrenamiento</li>
                            <li>Permite ajustes según tu estado diario</li>
                            <li>Evita el fallo muscular constante</li>
                            <li>Mejora la recuperación entre sesiones</li>
                          </ul>
                        )}
                        
                        {methodToView.name === 'Progresión por Volumen' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Ideal para hipertrofia y resistencia muscular</li>
                            <li>Funciona bien con grupos musculares pequeños</li>
                            <li>Permite acumular volumen sin aumentar intensidad</li>
                            <li>Reduce el riesgo de lesiones por sobrecarga</li>
                            <li>Ideal para periodos de mantenimiento o recuperación</li>
                          </ul>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowMethodDialog(false)}>
              Cerrar
            </Button3D>
            {methodToView && methodToView.name !== selectedMethod && (
              <Button3D 
                onClick={() => {
                  if (methodToView) {
                    onSelectMethod(methodToView.name)
                    setShowMethodDialog(false)
                  }
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Seleccionar este método
              </Button3D>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
