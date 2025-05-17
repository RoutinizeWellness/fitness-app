"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WorkoutLog, CompletedSet } from "@/lib/types/training"
import { Calendar, Clock, BarChart, Trash2, FileText, MoreHorizontal, Dumbbell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface WorkoutLogCardProps {
  log: WorkoutLog
  onDelete?: (logId: string) => void
  onViewDetails?: (log: WorkoutLog) => void
  compact?: boolean
}

export function WorkoutLogCard({
  log,
  onDelete,
  onViewDetails,
  compact = false
}: WorkoutLogCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    if (onDelete) {
      onDelete(log.id)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(log)
    } else {
      setIsDialogOpen(true)
    }
  }

  // Calcular estadísticas del registro
  const totalSets = log.completedSets?.length || 0
  const totalExercises = new Set(log.completedSets?.map(set => set.exerciseId) || []).size
  const formattedDate = format(new Date(log.date), 'PPP', { locale: es })
  const timeAgo = formatDistanceToNow(new Date(log.date), { addSuffix: true, locale: es })
  
  // Agrupar sets por ejercicio
  const exerciseSets: Record<string, CompletedSet[]> = {}
  log.completedSets?.forEach(set => {
    if (!exerciseSets[set.exerciseId]) {
      exerciseSets[set.exerciseId] = []
    }
    exerciseSets[set.exerciseId].push(set)
  })

  // Renderizar versión compacta
  if (compact) {
    return (
      <Card className="w-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium">
            {log.routineName || "Entrenamiento"} - {log.dayName || "Sesión"}
          </CardTitle>
          <CardDescription className="text-xs">
            {formattedDate} ({timeAgo})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{log.duration} min</span>
            <span className="mx-2">•</span>
            <Dumbbell className="h-3 w-3 mr-1" />
            <span>{totalExercises} {totalExercises === 1 ? 'ejercicio' : 'ejercicios'}</span>
            <span className="mx-2">•</span>
            <BarChart className="h-3 w-3 mr-1" />
            <span>{totalSets} {totalSets === 1 ? 'set' : 'sets'}</span>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleViewDetails}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalles del entrenamiento</DialogTitle>
              <DialogDescription>
                {formattedDate} • {log.duration} minutos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Rutina</h4>
                <p className="text-sm">{log.routineName || "Entrenamiento personalizado"}</p>
                {log.dayName && <p className="text-sm text-muted-foreground">{log.dayName}</p>}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Ejercicios realizados</h4>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(exerciseSets).map(([exerciseId, sets]) => (
                    <AccordionItem key={exerciseId} value={exerciseId}>
                      <AccordionTrigger className="text-sm">
                        {sets[0].exerciseName || exerciseId} ({sets.length} sets)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1">
                          {sets.map((set, index) => (
                            <div key={index} className="grid grid-cols-3 text-sm">
                              <span>Set {set.setNumber}</span>
                              <span>{set.reps} reps</span>
                              <span>{set.weight ? `${set.weight} kg` : 'Peso corporal'}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              
              {log.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notas</h4>
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    )
  }

  // Renderizar versión completa
  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg font-medium">
            {log.routineName || "Entrenamiento"} - {log.dayName || "Sesión"}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                <FileText className="h-4 w-4 mr-2" /> Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm">
          {formattedDate} ({timeAgo})
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline">{log.duration} minutos</Badge>
          <Badge variant="secondary">{totalExercises} ejercicios</Badge>
          <Badge variant="outline">{totalSets} sets</Badge>
          {log.fatigue && (
            <Badge variant={log.fatigue > 7 ? "destructive" : log.fatigue > 4 ? "secondary" : "outline"}>
              Fatiga: {log.fatigue}/10
            </Badge>
          )}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>{log.duration} minutos</span>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(exerciseSets).map(([exerciseId, sets]) => (
            <AccordionItem key={exerciseId} value={exerciseId}>
              <AccordionTrigger className="text-sm font-medium">
                {sets[0].exerciseName || exerciseId} ({sets.length} sets)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {sets.map((set, index) => (
                    <div key={index} className="grid grid-cols-4 text-sm">
                      <span>Set {set.setNumber}</span>
                      <span>{set.reps} reps</span>
                      <span>{set.weight ? `${set.weight} kg` : 'Peso corporal'}</span>
                      {set.rir !== undefined && <span>RIR: {set.rir}</span>}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {log.notes && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Notas</h4>
            <p className="text-sm text-muted-foreground">{log.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
        </Button>
        
        <Button variant="default" onClick={handleViewDetails}>
          <FileText className="h-4 w-4 mr-1" /> Ver detalles
        </Button>
      </CardFooter>
    </Card>
  )
}
