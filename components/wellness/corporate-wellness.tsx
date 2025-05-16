"use client"

import { useState, useEffect } from "react"
import {
  Building,
  Users,
  Trophy,
  BarChart3,
  Heart,
  Clock,
  Footprints,
  Moon,
  Brain,
  Shield,
  Plus,
  ChevronRight,
  CheckCircle,
  Calendar
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  CorporateWellnessProgram,
  CorporateChallenge,
  ChallengeParticipant,
  getCorporateWellnessPrograms,
  getCorporateChallenges,
  joinCorporateChallenge,
  updateChallengeProgress,
  getCorporateWellnessStats
} from "@/lib/corporate-wellness-service"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

interface CorporateWellnessProps {
  userId: string
  companyId: string
  className?: string
}

export function CorporateWellness({
  userId,
  companyId,
  className
}: CorporateWellnessProps) {
  const [activeTab, setActiveTab] = useState("programs")
  const [programs, setPrograms] = useState<CorporateWellnessProgram[]>([])
  const [challenges, setChallenges] = useState<CorporateChallenge[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChallengeDialog, setShowChallengeDialog] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<CorporateChallenge | null>(null)
  const [challengeProgress, setChallengeProgress] = useState<number>(0)
  const [myParticipations, setMyParticipations] = useState<Record<string, boolean>>({})
  const [anonymousStats, setAnonymousStats] = useState<any>(null)
  const { toast } = useToast()

  // Cargar programas
  useEffect(() => {
    if (companyId) {
      loadPrograms()
      loadAnonymousStats()
    }
  }, [companyId])

  // Cargar retos cuando se selecciona un programa
  useEffect(() => {
    if (selectedProgram) {
      loadChallenges(selectedProgram)
    }
  }, [selectedProgram])

  const loadPrograms = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getCorporateWellnessPrograms(companyId, { isActive: true })

      if (error) {
        console.error("Error al cargar programas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los programas de bienestar",
          variant: "destructive"
        })
        return
      }

      if (data && data.length > 0) {
        setPrograms(data)
        setSelectedProgram(data[0].id)
      }
    } catch (error) {
      console.error("Error al cargar programas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChallenges = async (programId: string) => {
    try {
      const { data, error } = await getCorporateChallenges(programId, { isActive: true })

      if (error) {
        console.error("Error al cargar retos:", error)
        return
      }

      if (data) {
        setChallenges(data)

        // Verificar participaciones
        const participations: Record<string, boolean> = {}

        for (const challenge of data) {
          try {
            // Verificar si el usuario ya está participando
            const { data: participants } = await supabase
              .from('challenge_participants')
              .select('id, completed')
              .eq('challenge_id', challenge.id)
              .eq('user_id', userId)
              .single()

            participations[challenge.id] = !!participants
          } catch (error) {
            console.error("Error al verificar participación:", error)
          }
        }

        setMyParticipations(participations)
      }
    } catch (error) {
      console.error("Error al cargar retos:", error)
    }
  }

  const loadAnonymousStats = async () => {
    try {
      const { data, error } = await getCorporateWellnessStats(companyId, {
        limit: 1,
        statsType: 'summary'
      })

      if (error) {
        console.error("Error al cargar estadísticas:", error)
        return
      }

      if (data && data.length > 0) {
        setAnonymousStats(data[0].statsData)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  // Unirse a un reto
  const handleJoinChallenge = async (challenge: CorporateChallenge) => {
    try {
      const { data, error } = await joinCorporateChallenge(challenge.id, userId)

      if (error) {
        console.error("Error al unirse al reto:", error)
        toast({
          title: "Error",
          description: "No se pudo unir al reto",
          variant: "destructive"
        })
        return
      }

      // Actualizar participaciones
      setMyParticipations(prev => ({
        ...prev,
        [challenge.id]: true
      }))

      toast({
        title: "Éxito",
        description: "Te has unido al reto correctamente"
      })
    } catch (error) {
      console.error("Error al unirse al reto:", error)
    }
  }

  // Actualizar progreso en un reto
  const handleUpdateProgress = async () => {
    if (!selectedChallenge) return

    try {
      const { success, completed, error } = await updateChallengeProgress(
        selectedChallenge.id,
        userId,
        challengeProgress
      )

      if (error) {
        console.error("Error al actualizar progreso:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el progreso",
          variant: "destructive"
        })
        return
      }

      toast({
        title: completed ? "¡Reto completado!" : "Progreso actualizado",
        description: completed
          ? "¡Felicidades! Has completado el reto"
          : "Tu progreso se ha actualizado correctamente"
      })

      setShowChallengeDialog(false)

      // Recargar retos para actualizar la vista
      if (selectedProgram) {
        loadChallenges(selectedProgram)
      }
    } catch (error) {
      console.error("Error al actualizar progreso:", error)
    }
  }

  // Renderizar icono según tipo de reto
  const renderChallengeIcon = (type: string) => {
    switch (type) {
      case 'steps':
        return <Footprints className="h-5 w-5 text-green-500" />
      case 'sleep':
        return <Moon className="h-5 w-5 text-indigo-500" />
      case 'stress':
        return <Brain className="h-5 w-5 text-purple-500" />
      case 'activity':
        return <Heart className="h-5 w-5 text-red-500" />
      default:
        return <Trophy className="h-5 w-5 text-amber-500" />
    }
  }

  // Formatear fecha
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <PulseLoader message="Cargando programas de bienestar..." />
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className={className}>
        <Card3D className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay programas disponibles</h3>
            <p className="text-gray-500 mb-4">Tu empresa aún no ha configurado programas de bienestar corporativo</p>
          </div>
        </Card3D>
      </div>
    )
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="programs" className="flex items-center">
            <Trophy className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Retos</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Estadísticas</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Privacidad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <div className="space-y-4">
            {/* Selector de programa */}
            {programs.length > 1 && (
              <div className="mb-4">
                <Label htmlFor="program">Programa</Label>
                <Select
                  value={selectedProgram || undefined}
                  onValueChange={setSelectedProgram}
                >
                  <SelectTrigger id="program">
                    <SelectValue placeholder="Selecciona un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Información del programa */}
            {selectedProgram && (
              <Card3D className="p-4">
                <div className="flex items-start">
                  <Building className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <h3 className="font-medium">
                      {programs.find(p => p.id === selectedProgram)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {programs.find(p => p.id === selectedProgram)?.description}
                    </p>

                    {programs.find(p => p.id === selectedProgram)?.startDate && (
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {formatDate(programs.find(p => p.id === selectedProgram)?.startDate)} -
                          {programs.find(p => p.id === selectedProgram)?.endDate
                            ? formatDate(programs.find(p => p.id === selectedProgram)?.endDate)
                            : 'En curso'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {programs.find(p => p.id === selectedProgram)?.participantsCount} participantes
                      </span>
                    </div>
                  </div>
                </div>
              </Card3D>
            )}

            {/* Lista de retos */}
            <div className="space-y-4">
              <h3 className="font-medium">Retos activos</h3>

              {challenges.length === 0 ? (
                <Card3D className="p-4 text-center">
                  <p className="text-gray-500">No hay retos activos en este momento</p>
                </Card3D>
              ) : (
                challenges.map(challenge => (
                  <Card3D key={challenge.id} className="p-4">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {renderChallengeIcon(challenge.challengeType)}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{challenge.title}</h3>
                          <Badge variant={myParticipations[challenge.id] ? "default" : "outline"}>
                            {myParticipations[challenge.id] ? "Participando" : "Disponible"}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {challenge.description}
                        </p>

                        {challenge.startDate && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {formatDate(challenge.startDate)} -
                              {challenge.endDate
                                ? formatDate(challenge.endDate)
                                : 'En curso'}
                            </span>
                          </div>
                        )}

                        {challenge.targetValue && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Trophy className="h-3.5 w-3.5 mr-1" />
                            <span>
                              Objetivo: {challenge.targetValue} {
                                challenge.challengeType === 'steps' ? 'pasos' :
                                challenge.challengeType === 'sleep' ? 'horas' :
                                challenge.challengeType === 'stress' ? 'sesiones' :
                                challenge.challengeType === 'activity' ? 'minutos' :
                                'unidades'
                              }
                            </span>
                          </div>
                        )}

                        {challenge.reward && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Trophy className="h-3.5 w-3.5 text-amber-500 mr-1" />
                            <span>
                              Recompensa: {challenge.reward}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-end mt-3">
                          {myParticipations[challenge.id] ? (
                            <Button3D
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedChallenge(challenge)
                                setShowChallengeDialog(true)
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Actualizar progreso
                            </Button3D>
                          ) : (
                            <Button3D
                              variant="outline"
                              size="sm"
                              onClick={() => handleJoinChallenge(challenge)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Unirse
                            </Button3D>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card3D>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="space-y-4">
            <h3 className="font-medium">Estadísticas anónimas de la empresa</h3>

            {!anonymousStats ? (
              <Card3D className="p-4 text-center">
                <p className="text-gray-500">No hay estadísticas disponibles</p>
              </Card3D>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card3D className="p-4">
                    <div className="flex flex-col items-center">
                      <Moon className="h-8 w-8 text-indigo-500 mb-2" />
                      <span className="text-sm text-gray-500">Sueño óptimo</span>
                      <span className="text-xl font-bold">{anonymousStats.sleep_optimal_percentage}%</span>
                      <span className="text-xs text-gray-500">de empleados</span>
                    </div>
                  </Card3D>

                  <Card3D className="p-4">
                    <div className="flex flex-col items-center">
                      <Brain className="h-8 w-8 text-purple-500 mb-2" />
                      <span className="text-sm text-gray-500">Estrés reducido</span>
                      <span className="text-xl font-bold">{anonymousStats.stress_reduction}%</span>
                      <span className="text-xs text-gray-500">vs. mes anterior</span>
                    </div>
                  </Card3D>
                </div>

                <Card3D className="p-4">
                  <div className="flex flex-col items-center">
                    <Shield className="h-8 w-8 text-green-500 mb-2" />
                    <span className="text-sm text-gray-500">Ausencias por estrés</span>
                    <span className="text-xl font-bold">-{anonymousStats.stress_absences_reduction}%</span>
                    <span className="text-xs text-gray-500">vs. mismo periodo año anterior</span>
                  </div>
                </Card3D>

                <div className="space-y-2">
                  <h3 className="font-medium">Retos más populares</h3>

                  {anonymousStats.popular_challenges.map((challenge: any, index: number) => (
                    <Card3D key={index} className="p-3">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {renderChallengeIcon(challenge.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{challenge.title}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {challenge.participants} participantes
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {challenge.completion_rate}% completado
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card3D>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="info">
          <Card3D className="p-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium">Privacidad y anonimato</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Todos los datos compartidos con tu empresa son completamente anónimos.
                    Tu identidad está protegida mediante un ID anónimo que no puede ser
                    vinculado a tu cuenta personal.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <p className="text-sm text-gray-600">
                  Tu empresa solo puede ver estadísticas agregadas, nunca datos individuales.
                </p>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <p className="text-sm text-gray-600">
                  Puedes participar en retos y contribuir a las estadísticas de bienestar sin revelar tu identidad.
                </p>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <p className="text-sm text-gray-600">
                  Tus datos personales de salud y bienestar nunca se comparten con tu empresa.
                </p>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Si tienes preocupaciones sobre la privacidad, puedes optar por no participar
                  en los programas de bienestar corporativo sin ninguna consecuencia.
                </p>
              </div>
            </div>
          </Card3D>
        </TabsContent>
      </Tabs>

      {/* Diálogo para actualizar progreso */}
      <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Actualizar progreso</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <h3 className="font-medium">{selectedChallenge?.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedChallenge?.description}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="progress">
                Tu progreso actual ({
                  selectedChallenge?.challengeType === 'steps' ? 'pasos' :
                  selectedChallenge?.challengeType === 'sleep' ? 'horas' :
                  selectedChallenge?.challengeType === 'stress' ? 'sesiones' :
                  selectedChallenge?.challengeType === 'activity' ? 'minutos' :
                  'unidades'
                })
              </Label>
              <Input
                id="progress"
                type="number"
                min={0}
                value={challengeProgress}
                onChange={(e) => setChallengeProgress(parseInt(e.target.value) || 0)}
              />

              {selectedChallenge?.targetValue && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{Math.min(100, Math.round((challengeProgress / (selectedChallenge.targetValue || 1)) * 100))}%</span>
                  </div>
                  <Progress3D
                    value={Math.min(100, Math.round((challengeProgress / (selectedChallenge.targetValue || 1)) * 100))}
                    max={100}
                    className="w-full"
                    height="8px"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Objetivo: {selectedChallenge.targetValue} {
                      selectedChallenge.challengeType === 'steps' ? 'pasos' :
                      selectedChallenge.challengeType === 'sleep' ? 'horas' :
                      selectedChallenge.challengeType === 'stress' ? 'sesiones' :
                      selectedChallenge.challengeType === 'activity' ? 'minutos' :
                      'unidades'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowChallengeDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleUpdateProgress}>
              Guardar progreso
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
