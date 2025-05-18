"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WorkoutRoutine, WorkoutDay } from "@/lib/types/training"
import { Dumbbell, Calendar, Clock, Edit, Trash2, Play, ChevronRight, MoreHorizontal, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface WorkoutRoutineCardProps {
  routine: WorkoutRoutine
  onEdit?: (routineId: string) => void
  onDelete?: (routineId: string) => void
  onStart?: (routineId: string, dayId?: string) => void
  onDuplicate?: (routineId: string) => void
  compact?: boolean
}

export function WorkoutRoutineCard({
  routine,
  onEdit,
  onDelete,
  onStart,
  onDuplicate,
  compact = false
}: WorkoutRoutineCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = () => {
    if (onEdit) {
      onEdit(routine.id)
    } else {
      router.push(`/training/edit/${routine.id}`)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(routine.id)
    }
  }

  const handleStart = (dayId?: string) => {
    if (onStart) {
      onStart(routine.id, dayId)
    } else {
      router.push(`/training/execute-workout?routineId=${routine.id}${dayId ? `&dayId=${dayId}` : ''}`)
    }
    setIsDialogOpen(false)
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(routine.id)
    } else {
      toast({
        title: "Función no disponible",
        description: "La función de duplicar rutina no está implementada",
        variant: "destructive"
      })
    }
  }

  // Calcular estadísticas de la rutina
  const totalDays = routine.days?.length || 0
  const totalExercises = routine.days?.reduce((acc, day) => acc + (day.exercises?.length || 0), 0) || 0

  // Renderizar versión compacta
  if (compact) {
    return (
      <Card className="w-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium">{routine.name}</CardTitle>
          <CardDescription className="text-xs">
            {routine.level} • {routine.goal}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{totalDays} {totalDays === 1 ? 'día' : 'días'}</span>
            <span className="mx-2">•</span>
            <Dumbbell className="h-3 w-3 mr-1" />
            <span>{totalExercises} {totalExercises === 1 ? 'ejercicio' : 'ejercicios'}</span>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsDialogOpen(true)}>
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardFooter>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Iniciar entrenamiento</DialogTitle>
              <DialogDescription>
                Selecciona el día que quieres entrenar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 my-4">
              {routine.days?.map((day) => (
                <Button
                  key={day.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleStart(day.id)}
                >
                  <span>{day.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="default" onClick={() => handleStart()}>
                Iniciar rutina completa
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
          <CardTitle className="text-lg font-medium">{routine.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" /> Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm">
          {routine.description || `Rutina de entrenamiento ${routine.level}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline">{routine.level}</Badge>
          <Badge variant="secondary">{routine.goal}</Badge>
          <Badge variant="outline">{routine.frequency}</Badge>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{totalDays} {totalDays === 1 ? 'día' : 'días'}</span>
          <span className="mx-2">•</span>
          <Dumbbell className="h-4 w-4 mr-1" />
          <span>{totalExercises} {totalExercises === 1 ? 'ejercicio' : 'ejercicios'}</span>
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>Actualizada {new Date(routine.updatedAt).toLocaleDateString()}</span>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {routine.days?.map((day, index) => (
            <AccordionItem key={day.id} value={day.id}>
              <AccordionTrigger className="text-sm font-medium">
                {day.name} ({day.exercises?.length || 0} ejercicios)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {day.exercises?.map((exercise, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Dumbbell className="h-3 w-3 mr-2 text-muted-foreground" />
                        <span>{exercise.exerciseId}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {exercise.targetSets || 3} × {exercise.targetReps}
                      </span>
                    </div>
                  ))}
                  {(!day.exercises || day.exercises.length === 0) && (
                    <p className="text-sm text-muted-foreground">No hay ejercicios en este día</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <Play className="h-4 w-4 mr-1" /> Iniciar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Iniciar entrenamiento</DialogTitle>
              <DialogDescription>
                Selecciona el día que quieres entrenar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 my-4">
              {routine.days?.map((day) => (
                <Button
                  key={day.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleStart(day.id)}
                >
                  <span>{day.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="default" onClick={() => handleStart()}>
                Iniciar rutina completa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
