"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Card3D,
  Card3DContent,
  Card3DHeader,
  Card3DTitle
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dumbbell,
  Calendar,
  Clock,
  Zap,
  Target,
  BarChart,
  Users,
  ChevronRight,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Layers,
  FileText,
  Bookmark,
  Star,
  PlusCircle,
  ListFilter,
  ArrowLeft,
  Edit,
  Play,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useFeedback } from "@/components/feedback/action-feedback"
import {
  FadeInElement,
  StaggeredList,
  CardEntrance
} from "@/components/transitions/page-transition"
import {
  ModuleCardSkeleton,
  ListSkeleton,
  PulseLoader
} from "@/components/ui/enhanced-skeletons"
import { ProgramConfigurator } from "@/components/training/program-configurator"
import {
  TrainingProgram,
  MesoCycle,
  MicroCycle
} from "@/lib/types/training-program"
import { getTrainingProgram, updateTrainingProgram } from "@/lib/training-program-service"

interface ProgramDetailPageProps {
  params: {
    id: string
  }
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()
  const { showFeedback, showLoading, updateToSuccess, updateToError } = useFeedback()
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params)

  const [activeTab, setActiveTab] = useState("overview")
  const [isAdmin, setIsAdmin] = useState(false)
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [isProgramLoading, setIsProgramLoading] = useState(true)
  const [showProgramEditor, setShowProgramEditor] = useState(false)

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user?.email === "admin@routinize.com") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [user])

  // Cargar programa de entrenamiento
  useEffect(() => {
    const loadProgram = async () => {
      if (!unwrappedParams.id) return

      try {
        setIsProgramLoading(true)
        const { data, error } = await getTrainingProgram(unwrappedParams.id)

        if (error) throw error

        if (data) {
          setProgram(data)
        }
      } catch (error) {
        console.error("Error al cargar programa:", error)
        showFeedback({
          message: "Error al cargar programa de entrenamiento",
          type: "error",
          position: "bottom"
        })
        router.push('/dashboard/training')
      } finally {
        setIsProgramLoading(false)
      }
    }

    loadProgram()
  }, [unwrappedParams.id, router, showFeedback])

  // Manejar actualización de programa
  const handleProgramUpdated = (updatedProgram: TrainingProgram) => {
    setProgram(updatedProgram)
    setShowProgramEditor(false)

    showFeedback({
      message: "Programa actualizado correctamente",
      type: "success",
      position: "bottom"
    })
  }

  // Activar/desactivar programa
  const toggleProgramActive = async () => {
    if (!program) return

    const loadingId = showLoading(
      program.isActive
        ? "Desactivando programa..."
        : "Activando programa..."
    )

    try {
      const { data, error } = await updateTrainingProgram(program.id, {
        ...program,
        isActive: !program.isActive
      })

      if (error) throw error

      if (data) {
        setProgram(data)
        updateToSuccess(
          loadingId,
          program.isActive
            ? "Programa desactivado correctamente"
            : "Programa activado correctamente"
        )
      }
    } catch (error) {
      console.error("Error al actualizar programa:", error)
      updateToError(
        loadingId,
        "Error al actualizar el programa"
      )
    }
  }

  // Iniciar entrenamiento
  const startWorkout = () => {
    router.push(`/dashboard/training/workout/new?program=${program?.id}`)
  }

  if (isProgramLoading) {
    return <PulseLoader message="Cargando programa..." />
  }

  if (!program) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-20 pb-24">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Programa no encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            El programa que buscas no existe o no tienes acceso a él
          </p>
          <Button3D onClick={() => router.push('/dashboard/training')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a entrenamientos
          </Button3D>
        </div>
      </div>
    )
  }

  // Renderizar visión general
  const renderOverview = () => (
    <div className="space-y-6">
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Información general</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1 text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Duración
              </div>
              <div className="text-lg font-semibold">{program.duration} semanas</div>
            </div>

            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1 text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Frecuencia
              </div>
              <div className="text-lg font-semibold">{program.frequency} días/sem</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1 text-muted-foreground">
                <Target className="h-4 w-4 mr-2" />
                Objetivo
              </div>
              <div className="text-lg font-semibold capitalize">
                {program.goal === 'strength' ? 'Fuerza' :
                 program.goal === 'hypertrophy' ? 'Hipertrofia' :
                 program.goal === 'endurance' ? 'Resistencia' :
                 program.goal === 'weight_loss' ? 'Pérdida de peso' :
                 program.goal === 'general_fitness' ? 'Fitness general' : program.goal}
              </div>
            </div>

            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1 text-muted-foreground">
                <Layers className="h-4 w-4 mr-2" />
                Tipo
              </div>
              <div className="text-lg font-semibold capitalize">
                {program.type === 'full_body' ? 'Cuerpo completo' :
                 program.type === 'upper_lower' ? 'Superior/Inferior' :
                 program.type === 'push_pull_legs' ? 'Push/Pull/Legs' :
                 program.type === 'body_part_split' ? 'Split por grupos' :
                 program.type === 'custom' ? 'Personalizado' : program.type}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Nivel</h3>
            <div className="flex items-center">
              <div className={`h-2 flex-1 rounded-full ${
                program.level === 'beginner' ? 'bg-green-200' :
                program.level === 'intermediate' ? 'bg-blue-200' :
                'bg-red-200'
              }`}>
                <div className={`h-full rounded-full ${
                  program.level === 'beginner' ? 'bg-green-500 w-1/3' :
                  program.level === 'intermediate' ? 'bg-blue-500 w-2/3' :
                  'bg-red-500 w-full'
                }`}></div>
              </div>
              <span className="ml-3 font-medium">
                {program.level === 'beginner' ? 'Principiante' :
                 program.level === 'intermediate' ? 'Intermedio' :
                 program.level === 'advanced' ? 'Avanzado' : program.level}
              </span>
            </div>
          </div>

          {program.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Descripción</h3>
              <p className="text-sm text-muted-foreground">{program.description}</p>
            </div>
          )}
        </Card3DContent>
      </Card3D>

      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Estructura del programa</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <Badge className="mr-2">
                {program.structure === 'mesocycle' ? 'Mesociclo' :
                 program.structure === 'macrocycle' ? 'Macrociclo' :
                 program.structure === 'simple' ? 'Simple' : program.structure}
              </Badge>

              {program.deloadStrategy && program.deloadStrategy !== 'none' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Incluye deload
                </Badge>
              )}
            </div>

            {program.structure === 'mesocycle' && program.mesoCycles && (
              <div>
                <h3 className="text-sm font-medium mb-2">Mesociclos</h3>
                <div className="space-y-2">
                  {program.mesoCycles.map((mesocycle, index) => (
                    <div
                      key={mesocycle.id}
                      className="bg-accent/5 p-3 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{mesocycle.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {mesocycle.duration} semanas •
                          {mesocycle.focus === 'strength' ? ' Fuerza' :
                           mesocycle.focus === 'hypertrophy' ? ' Hipertrofia' :
                           mesocycle.focus === 'endurance' ? ' Resistencia' :
                           mesocycle.focus === 'power' ? ' Potencia' :
                           mesocycle.focus === 'mixed' ? ' Mixto' : mesocycle.focus}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {index + 1}/{program.mesoCycles.length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {program.targetMuscleGroups && program.targetMuscleGroups.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Grupos musculares prioritarios</h3>
                <div className="flex flex-wrap gap-2">
                  {program.targetMuscleGroups.map(group => (
                    <Badge key={group} variant="outline">
                      {group === 'chest' ? 'Pecho' :
                       group === 'back' ? 'Espalda' :
                       group === 'shoulders' ? 'Hombros' :
                       group === 'arms' ? 'Brazos' :
                       group === 'legs' ? 'Piernas' :
                       group === 'core' ? 'Core' : group}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )

  // Renderizar mesociclos
  const renderMesocycles = () => {
    if (program.structure !== 'mesocycle' || !program.mesoCycles || program.mesoCycles.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No hay mesociclos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este programa no utiliza estructura de mesociclos
          </p>
        </div>
      )
    }

    return (
      <Accordion type="single" collapsible className="w-full">
        {program.mesoCycles.map((mesocycle) => (
          <AccordionItem key={mesocycle.id} value={mesocycle.id}>
            <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 py-3 rounded-md">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                <span>{mesocycle.name}</span>
                {mesocycle.includesDeload && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    Deload
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <div className="flex items-center text-xs font-medium mb-1 text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Duración
                    </div>
                    <div className="text-sm font-semibold">{mesocycle.duration} semanas</div>
                  </div>

                  <div className="bg-accent/10 p-3 rounded-lg">
                    <div className="flex items-center text-xs font-medium mb-1 text-muted-foreground">
                      <Target className="h-3 w-3 mr-1" />
                      Enfoque
                    </div>
                    <div className="text-sm font-semibold capitalize">
                      {mesocycle.focus === 'strength' ? 'Fuerza' :
                       mesocycle.focus === 'hypertrophy' ? 'Hipertrofia' :
                       mesocycle.focus === 'endurance' ? 'Resistencia' :
                       mesocycle.focus === 'power' ? 'Potencia' :
                       mesocycle.focus === 'mixed' ? 'Mixto' : mesocycle.focus}
                    </div>
                  </div>
                </div>

                {mesocycle.description && (
                  <div className="bg-accent/5 p-3 rounded-lg">
                    <div className="flex items-center text-xs font-medium mb-1 text-muted-foreground">
                      <Info className="h-3 w-3 mr-1" />
                      Descripción
                    </div>
                    <p className="text-sm">{mesocycle.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Microciclos</h4>
                  <div className="space-y-2">
                    {mesocycle.microCycles.map((microcycle) => (
                      <div
                        key={microcycle.id}
                        className={`p-3 rounded-lg flex justify-between items-center ${
                          microcycle.isDeload
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-accent/5'
                        }`}
                      >
                        <div>
                          <div className="font-medium flex items-center">
                            {microcycle.name}
                            {microcycle.isDeload && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                Deload
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {microcycle.days.length} días •
                            Intensidad: {microcycle.intensity === 'low' ? 'Baja' :
                                        microcycle.intensity === 'moderate' ? 'Moderada' :
                                        microcycle.intensity === 'high' ? 'Alta' : microcycle.intensity} •
                            Volumen: {microcycle.volume === 'low' ? 'Bajo' :
                                     microcycle.volume === 'moderate' ? 'Moderado' :
                                     microcycle.volume === 'high' ? 'Alto' : microcycle.volume}
                          </div>
                        </div>
                        <Button3D
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/training/programs/${program.id}/microcycle/${microcycle.id}`)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button3D>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-20 pb-24">
      <FadeInElement>
        <div className="flex items-center mb-2">
          <Button3D variant="ghost" size="icon" onClick={() => router.push('/dashboard/training')}>
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold gradient-text ml-2">{program.name}</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Badge className={
            program.level === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
            program.level === 'intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            'bg-red-100 text-red-800 border-red-200'
          }>
            {program.level === 'beginner' ? 'Principiante' :
             program.level === 'intermediate' ? 'Intermedio' :
             program.level === 'advanced' ? 'Avanzado' : program.level}
          </Badge>

          <div className="flex space-x-2">
            {isAdmin && (
              <Button3D variant="outline" size="sm" onClick={() => setShowProgramEditor(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button3D>
            )}

            <Button3D
              variant={program.isActive ? "destructive" : "outline"}
              size="sm"
              onClick={toggleProgramActive}
            >
              {program.isActive ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </Button3D>
          </div>
        </div>
      </FadeInElement>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Info className="h-4 w-4 mr-2" />
            Información
          </TabsTrigger>
          <TabsTrigger value="mesocycles" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Mesociclos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="mesocycles" className="space-y-4">
          {renderMesocycles()}
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
        <Button3D
          className="w-full shadow-lg"
          onClick={startWorkout}
        >
          <Play className="h-4 w-4 mr-2" />
          Iniciar entrenamiento
        </Button3D>
      </div>

      {showProgramEditor && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="container max-w-md mx-auto px-4 py-6">
            <ProgramConfigurator
              userId={user?.id || ''}
              isAdmin={isAdmin}
              onSave={handleProgramUpdated}
              onCancel={() => setShowProgramEditor(false)}
              existingProgram={program}
            />
          </div>
        </div>
      )}
    </div>
  )
}
