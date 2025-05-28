"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  BarChart3,
  Dumbbell,
  Layers,
  Target,
  Info,
  Clock,
  ChevronRight
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import {
  PeriodizationProgram,
  Mesocycle,
  Microcycle,
  PeriodizedSession,
  TrainingObjective,
  ObjectiveAssociation
} from "@/lib/types/advanced-periodization"
import { PeriodizationService } from "@/lib/services/periodization-service"
import { AdvancedProgramBuilder } from "./program-builder/advanced-program-builder"

export function AdvancedPeriodizationModule() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<PeriodizationProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<PeriodizationProgram | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)

  // Cargar programas del usuario
  useEffect(() => {
    const loadPrograms = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        const userPrograms = await PeriodizationService.getUserPrograms(user.id)
        setPrograms(userPrograms)
      } catch (error) {
        console.error('Error al cargar programas:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los programas",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPrograms()
  }, [user])

  // Filtrar programas
  const filteredPrograms = programs.filter(program => {
    // Filtrar por búsqueda
    const matchesSearch = searchQuery
      ? program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      : true

    // Filtrar por tipo
    const matchesType = filterType
      ? program.periodization_type === filterType
      : true

    return matchesSearch && matchesType
  })

  // Crear nuevo programa
  const handleCreateProgram = async (program: PeriodizationProgram) => {
    if (!user) return

    setIsLoading(true)

    try {
      // Asignar ID de usuario
      program.user_id = user.id

      // Guardar programa en Supabase
      const createdProgram = await PeriodizationService.createProgram(program)

      // Guardar mesociclos
      if (program.mesocycles) {
        for (const mesocycle of program.mesocycles) {
          mesocycle.program_id = createdProgram.id
          const createdMesocycle = await PeriodizationService.createMesocycle(mesocycle)

          // Guardar microciclos
          if (mesocycle.microcycles) {
            for (const microcycle of mesocycle.microcycles) {
              microcycle.mesocycle_id = createdMesocycle.id
              const createdMicrocycle = await PeriodizationService.createMicrocycle(microcycle)

              // Guardar sesiones
              if (microcycle.sessions) {
                for (const session of microcycle.sessions) {
                  session.microcycle_id = createdMicrocycle.id
                  await PeriodizationService.createSession(session)
                }
              }
            }
          }
        }
      }

      // Guardar objetivos
      if (program.objectives) {
        for (const objective of program.objectives) {
          if (!objective.id?.startsWith('temp-')) continue

          objective.user_id = user.id
          const createdObjective = await PeriodizationService.createObjective(objective)

          // Actualizar ID en asociaciones
          if (program.associations) {
            program.associations = program.associations.map(assoc =>
              assoc.objective_id === objective.id
                ? { ...assoc, objective_id: createdObjective.id! }
                : assoc
            )
          }
        }
      }

      // Guardar asociaciones
      if (program.associations) {
        for (const association of program.associations) {
          // Actualizar IDs de entidades si son temporales
          if (association.entity_id.startsWith('temp-')) {
            if (association.entity_type === 'program') {
              association.entity_id = createdProgram.id!
            }
            // Para mesociclos y microciclos, necesitaríamos un mapeo de IDs temporales a reales
          }

          await PeriodizationService.associateObjective(association)
        }
      }

      // Actualizar lista de programas
      setPrograms(prev => [...prev, createdProgram])

      // Cerrar diálogo
      setIsCreating(false)

      toast({
        title: "Programa creado",
        description: "El programa ha sido creado correctamente"
      })
    } catch (error) {
      console.error('Error al crear programa:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el programa",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar programa
  const handleUpdateProgram = async (program: PeriodizationProgram) => {
    if (!user || !program.id) return

    setIsLoading(true)

    try {
      // Actualizar programa en Supabase
      await PeriodizationService.updateProgram(program)

      // Actualizar lista de programas
      setPrograms(prev =>
        prev.map(p => p.id === program.id ? program : p)
      )

      // Cerrar diálogo
      setIsEditing(false)
      setSelectedProgram(null)

      toast({
        title: "Programa actualizado",
        description: "El programa ha sido actualizado correctamente"
      })
    } catch (error) {
      console.error('Error al actualizar programa:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el programa",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar programa
  const handleDeleteProgram = async (programId: string) => {
    if (!user) return

    setIsLoading(true)

    try {
      // Eliminar programa en Supabase
      await PeriodizationService.deleteProgram(programId)

      // Actualizar lista de programas
      setPrograms(prev => prev.filter(p => p.id !== programId))

      toast({
        title: "Programa eliminado",
        description: "El programa ha sido eliminado correctamente"
      })
    } catch (error) {
      console.error('Error al eliminar programa:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el programa",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar tarjeta de programa
  const renderProgramCard = (program: PeriodizationProgram) => {
    return (
      <div
        key={program.id}
        className="border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
        onClick={() => setSelectedProgram(program)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{program.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
          </div>

          <Badge variant="outline" className="bg-primary/10 text-primary">
            {getPeriodizationTypeName(program.periodization_type)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Dumbbell className="h-3 w-3 mr-1" />
            {getTrainingLevelName(program.training_level)}
          </Badge>

          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Target className="h-3 w-3 mr-1" />
            {getTrainingGoalName(program.goal)}
          </Badge>

          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Calendar className="h-3 w-3 mr-1" />
            {program.frequency} días/semana
          </Badge>

          {program.mesocycles && (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              <Layers className="h-3 w-3 mr-1" />
              {program.mesocycles.length} mesociclos
            </Badge>
          )}
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Creado: {new Date(program.created_at || '').toLocaleDateString()}
          </div>

          <Button3D
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedProgram(program)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button3D>
        </div>
      </div>
    )
  }

  // Renderizar detalles del programa seleccionado
  const renderProgramDetails = () => {
    if (!selectedProgram) return null

    return (
      <Dialog open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedProgram.name}</DialogTitle>
            <DialogDescription>{selectedProgram.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {getPeriodizationTypeName(selectedProgram.periodization_type)}
              </Badge>

              <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                <Dumbbell className="h-3 w-3 mr-1" />
                {getTrainingLevelName(selectedProgram.training_level)}
              </Badge>

              <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                <Target className="h-3 w-3 mr-1" />
                {getTrainingGoalName(selectedProgram.goal)}
              </Badge>

              <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedProgram.frequency} días/semana
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Mesociclos</h3>

              {selectedProgram.mesocycles && selectedProgram.mesocycles.length > 0 ? (
                <div className="space-y-2">
                  {selectedProgram.mesocycles.map((mesocycle, index) => (
                    <div key={mesocycle.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{mesocycle.name}</h4>
                          <p className="text-sm text-muted-foreground">{mesocycle.description}</p>
                        </div>

                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {getPhaseDisplayName(mesocycle.phase)}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{mesocycle.duration_weeks} semanas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay mesociclos definidos</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button3D
              variant="destructive"
              onClick={() => {
                if (selectedProgram.id) {
                  handleDeleteProgram(selectedProgram.id)
                  setSelectedProgram(null)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button3D>
            <Button3D
              variant="outline"
              onClick={() => {
                setSelectedProgram(null)
              }}
            >
              Cerrar
            </Button3D>
            <Button3D
              onClick={() => {
                setIsEditing(true)
                setSelectedProgram(null)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Si está creando o editando, mostrar el constructor de programas
  if (isCreating) {
    return (
      <AdvancedProgramBuilder
        userId={user?.id || ''}
        onSave={handleCreateProgram}
        onCancel={() => setIsCreating(false)}
      />
    )
  }

  if (isEditing && selectedProgram) {
    return (
      <AdvancedProgramBuilder
        userId={user?.id || ''}
        onSave={handleUpdateProgram}
        onCancel={() => setIsEditing(false)}
        existingProgram={selectedProgram}
      />
    )
  }

  // Mostrar lista de programas
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Programas de Periodización</h2>
        <Button3D onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Programa
        </Button3D>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar programas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todos los tipos</option>
          <option value="linear">Periodización Lineal</option>
          <option value="undulating">Periodización Ondulante</option>
          <option value="block">Periodización por Bloques</option>
          <option value="conjugate">Periodización Conjugada</option>
          <option value="dup">DUP</option>
          <option value="wup">WUP</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground animate-pulse mb-4" />
          <p className="text-muted-foreground">Cargando programas...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No hay programas disponibles</p>
          <Button3D
            variant="outline"
            className="mt-4"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Programa
          </Button3D>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map(program => renderProgramCard(program))}
        </div>
      )}

      {renderProgramDetails()}
    </div>
  )
}

// Funciones auxiliares

function getPeriodizationTypeName(type: string): string {
  switch (type) {
    case 'linear': return 'Periodización Lineal'
    case 'undulating': return 'Periodización Ondulante'
    case 'block': return 'Periodización por Bloques'
    case 'conjugate': return 'Periodización Conjugada'
    case 'dup': return 'DUP'
    case 'wup': return 'WUP'
    default: return type
  }
}

function getTrainingLevelName(level: string): string {
  switch (level) {
    case 'intermediate': return 'Intermedio'
    case 'advanced': return 'Avanzado'
    case 'elite': return 'Elite'
    default: return level
  }
}

function getTrainingGoalName(goal: string): string {
  switch (goal) {
    case 'hypertrophy': return 'Hipertrofia'
    case 'strength': return 'Fuerza'
    case 'power': return 'Potencia'
    case 'endurance': return 'Resistencia'
    case 'fat_loss': return 'Pérdida de Grasa'
    case 'maintenance': return 'Mantenimiento'
    case 'general_fitness': return 'Fitness General'
    default: return goal
  }
}

function getPhaseDisplayName(phase: string): string {
  switch (phase) {
    case 'hypertrophy': return 'Hipertrofia'
    case 'strength': return 'Fuerza'
    case 'power': return 'Potencia'
    case 'endurance': return 'Resistencia'
    case 'deload': return 'Descarga'
    default: return phase
  }
}
