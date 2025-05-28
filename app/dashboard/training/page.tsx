"use client"

import { useState, useEffect } from "react"
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
  ListFilter
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useFeedback } from "@/components/feedback/action-feedback"
import {
  FadeInElement,
  StaggeredList,
  CardEntrance
} from "@/components/transitions/page-transition"
import {
  ModuleCardSkeleton,
  ListSkeleton
} from "@/components/ui/enhanced-skeletons"
import { ProgramConfigurator } from "@/components/training/program-configurator"
import { TrainingProgram } from "@/lib/types/training-program"
import { getTrainingPrograms } from "@/lib/training-program-service"

export default function TrainingPage() {
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()
  const { showFeedback } = useFeedback()

  const [activeTab, setActiveTab] = useState("programs")
  const [isAdmin, setIsAdmin] = useState(false)
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [isProgramsLoading, setIsProgramsLoading] = useState(true)
  const [showProgramCreator, setShowProgramCreator] = useState(false)

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user?.email === "admin@routinize.com") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [user])

  // Cargar programas de entrenamiento
  useEffect(() => {
    const loadPrograms = async () => {
      if (!user?.id) return

      try {
        setIsProgramsLoading(true)
        const { data, error } = await getTrainingPrograms(user.id)

        if (error) throw error

        if (data) {
          setPrograms(data)
        }
      } catch (error) {
        console.error("Error al cargar programas:", error)
        showFeedback({
          message: "Error al cargar programas de entrenamiento",
          type: "error",
          position: "bottom"
        })
      } finally {
        setIsProgramsLoading(false)
      }
    }

    if (user?.id) {
      loadPrograms()
    }
  }, [user, showFeedback])

  // Manejar creación de programa
  const handleProgramCreated = (program: TrainingProgram) => {
    setPrograms(prev => [...prev, program])
    setShowProgramCreator(false)

    showFeedback({
      message: "Programa creado correctamente",
      type: "success",
      position: "bottom"
    })
  }

  // Renderizar programas de entrenamiento
  const renderPrograms = () => {
    if (isProgramsLoading) {
      return (
        <div className="space-y-4">
          <ModuleCardSkeleton />
          <ModuleCardSkeleton />
        </div>
      )
    }

    if (programs.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No hay programas de entrenamiento</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isAdmin
              ? "Crea tu primer programa de entrenamiento para tus clientes"
              : "No tienes programas de entrenamiento asignados"}
          </p>
          {isAdmin && (
            <Button3D onClick={() => setShowProgramCreator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear programa
            </Button3D>
          )}
        </div>
      )
    }

    return (
      <StaggeredList staggerDelay={0.1} className="space-y-4">
        {programs.map((program) => (
          <Card3D
            key={program.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/dashboard/training/programs/${program.id}`)}
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{program.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                </div>
                <Badge className={
                  program.level === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                  program.level === 'intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }>
                  {program.level === 'beginner' ? 'Principiante' :
                   program.level === 'intermediate' ? 'Intermedio' :
                   program.level === 'advanced' ? 'Avanzado' : program.level}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-center text-xs font-medium mb-1 text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Duración
                  </div>
                  <div className="text-sm font-semibold">{program.duration} semanas</div>
                </div>

                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-center text-xs font-medium mb-1 text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Frecuencia
                  </div>
                  <div className="text-sm font-semibold">{program.frequency} días/sem</div>
                </div>

                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-center text-xs font-medium mb-1 text-muted-foreground">
                    <Target className="h-3 w-3 mr-1" />
                    Objetivo
                  </div>
                  <div className="text-sm font-semibold capitalize">
                    {program.goal === 'strength' ? 'Fuerza' :
                     program.goal === 'hypertrophy' ? 'Hipertrofia' :
                     program.goal === 'endurance' ? 'Resistencia' :
                     program.goal === 'weight_loss' ? 'Pérdida de peso' :
                     program.goal === 'general_fitness' ? 'Fitness general' : program.goal}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {program.type === 'full_body' ? 'Cuerpo completo' :
                     program.type === 'upper_lower' ? 'Superior/Inferior' :
                     program.type === 'push_pull_legs' ? 'Push/Pull/Legs' :
                     program.type === 'body_part_split' ? 'Split por grupos' :
                     program.type === 'custom' ? 'Personalizado' : program.type}
                  </Badge>

                  {program.isActive && (
                    <Badge variant="default" className="bg-green-500">
                      Activo
                    </Badge>
                  )}
                </div>

                <Button3D variant="ghost" size="icon" className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button3D>
              </div>
            </div>
          </Card3D>
        ))}
      </StaggeredList>
    )
  }

  // Renderizar entrenamientos recientes
  const renderRecentWorkouts = () => {
    if (isProgramsLoading) {
      return <ListSkeleton count={3} />
    }

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No hay entrenamientos recientes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comienza a entrenar para ver tu historial aquí
        </p>
        <Button3D onClick={() => router.push('/dashboard/training/workout')}>
          <Dumbbell className="h-4 w-4 mr-2" />
          Iniciar entrenamiento
        </Button3D>
      </div>
    )
  }

  // Renderizar estadísticas
  const renderStats = () => {
    if (isProgramsLoading) {
      return <ModuleCardSkeleton />
    }

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No hay estadísticas disponibles</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Completa algunos entrenamientos para ver tus estadísticas
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-20 pb-24">
      <FadeInElement>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-text">Entrenamiento</h1>

          <div className="flex space-x-2">
            <Button3D variant="outline" size="icon" onClick={() => router.push('/dashboard/training/search')}>
              <Search className="h-4 w-4" />
            </Button3D>

            <Button3D variant="outline" size="icon" onClick={() => router.push('/dashboard/training/filter')}>
              <ListFilter className="h-4 w-4" />
            </Button3D>

            {isAdmin && (
              <Button3D onClick={() => setShowProgramCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear
              </Button3D>
            )}
          </div>
        </div>
      </FadeInElement>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="programs" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Layers className="h-4 w-4 mr-2" />
            Programas
          </TabsTrigger>
          <TabsTrigger value="workouts" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Dumbbell className="h-4 w-4 mr-2" />
            Recientes
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <BarChart className="h-4 w-4 mr-2" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          {renderPrograms()}
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          {renderRecentWorkouts()}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {renderStats()}
        </TabsContent>
      </Tabs>

      {showProgramCreator && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="container max-w-md mx-auto px-4 py-6">
            <ProgramConfigurator
              userId={user?.id || ''}
              isAdmin={isAdmin}
              onSave={handleProgramCreated}
              onCancel={() => setShowProgramCreator(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
