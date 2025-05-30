"use client"

import { useState, useEffect } from "react"
import {
  Users, UserPlus, Search, Filter, ChevronRight,
  Dumbbell, Utensils, MessageSquare, Eye, Edit,
  Trash, MoreHorizontal, RefreshCw, CheckCircle,
  XCircle, Calendar, Clock, Activity, Zap, Award,
  Heart, Brain, ThumbsUp, Sparkles
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"

// Tipos para el sistema de recomendación
interface Client {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  goals: string[];
  preferences: {
    preferredGender?: 'male' | 'female' | 'any';
    preferredExperienceLevel?: 'beginner' | 'intermediate' | 'expert';
    preferredTrainingStyle?: string[];
    preferredCommunicationFrequency?: 'daily' | 'weekly' | 'monthly';
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
    preferredDietType?: string[];
  };
  healthMetrics?: {
    height?: number;
    weight?: number;
    bodyFat?: number;
    medicalConditions?: string[];
    allergies?: string[];
  };
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  previousExperience?: string;
}

interface Professional {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  type: 'trainer' | 'nutritionist';
  specialties: string[];
  experienceYears: number;
  gender: 'male' | 'female' | 'other';
  rating: number;
  clientCount: number;
  availability: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    weekends: boolean;
  };
  communicationStyle: string[];
  languages: string[];
  matchScore?: number;
  matchReasons?: string[];
}

export function ProfessionalRecommendationSystem() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [recommendedProfessionals, setRecommendedProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [professionalType, setProfessionalType] = useState<'all' | 'trainer' | 'nutritionist'>('all')
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Cargar clientes y profesionales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // En un entorno real, aquí se cargarían los datos desde Supabase
      // Para este ejemplo, generamos datos simulados
      const mockClients = generateMockClients(20)
      const mockProfessionals = generateMockProfessionals(30)

      setClients(mockClients)
      setProfessionals(mockProfessionals)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generar clientes simulados
  const generateMockClients = (count: number): Client[] => {
    const goals = [
      'Pérdida de peso', 'Ganancia muscular', 'Mejora de resistencia',
      'Tonificación', 'Rehabilitación', 'Mejora de rendimiento deportivo',
      'Nutrición saludable', 'Dieta específica', 'Bienestar general'
    ]

    const trainingStyles = [
      'HIIT', 'Entrenamiento de fuerza', 'Cardio', 'Funcional',
      'Yoga', 'Pilates', 'CrossFit', 'Calistenia'
    ]

    const dietTypes = [
      'Omnívora', 'Vegetariana', 'Vegana', 'Paleo', 'Keto',
      'Mediterránea', 'Sin gluten', 'Sin lácteos', 'Baja en carbohidratos'
    ]

    const medicalConditions = [
      'Diabetes', 'Hipertensión', 'Problemas articulares',
      'Lesiones de espalda', 'Asma', 'Ninguna'
    ]

    const allergies = [
      'Frutos secos', 'Lácteos', 'Gluten', 'Mariscos', 'Ninguna'
    ]

    return Array.from({ length: count }, (_, i) => {
      // Seleccionar aleatoriamente 1-3 objetivos
      const clientGoals = [...goals].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)

      // Seleccionar aleatoriamente 1-2 estilos de entrenamiento
      const clientTrainingStyles = [...trainingStyles].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1)

      // Seleccionar aleatoriamente 1-2 tipos de dieta
      const clientDietTypes = [...dietTypes].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1)

      // Seleccionar aleatoriamente 0-2 condiciones médicas
      const clientMedicalConditions = [...medicalConditions].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2))

      // Seleccionar aleatoriamente 0-1 alergias
      const clientAllergies = [...allergies].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 1))

      return {
        id: `client-${i + 1}`,
        userId: `user-${i + 1}`,
        fullName: `Cliente ${i + 1}`,
        email: `cliente${i + 1}@example.com`,
        avatarUrl: i % 3 === 0 ? `https://i.pravatar.cc/150?u=client-${i + 1}` : undefined,
        goals: clientGoals,
        preferences: {
          preferredGender: ['male', 'female', 'any'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'any',
          preferredExperienceLevel: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'expert',
          preferredTrainingStyle: clientTrainingStyles,
          preferredCommunicationFrequency: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)] as 'daily' | 'weekly' | 'monthly',
          preferredTimeOfDay: ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)] as 'morning' | 'afternoon' | 'evening',
          preferredDietType: clientDietTypes
        },
        healthMetrics: {
          height: 160 + Math.floor(Math.random() * 40),
          weight: 50 + Math.floor(Math.random() * 50),
          bodyFat: 10 + Math.floor(Math.random() * 20),
          medicalConditions: clientMedicalConditions,
          allergies: clientAllergies
        },
        activityLevel: ['sedentary', 'light', 'moderate', 'active', 'very_active'][Math.floor(Math.random() * 5)] as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        previousExperience: ['Ninguna', 'Poca', 'Moderada', 'Avanzada'][Math.floor(Math.random() * 4)]
      }
    })
  }

  // Generar profesionales simulados
  const generateMockProfessionals = (count: number): Professional[] => {
    const trainerSpecialties = [
      'Pérdida de peso', 'Hipertrofia', 'Entrenamiento funcional',
      'Rehabilitación', 'Entrenamiento deportivo', 'HIIT',
      'Entrenamiento de fuerza', 'Yoga', 'Pilates'
    ]

    const nutritionistSpecialties = [
      'Pérdida de peso', 'Nutrición deportiva', 'Dietas vegetarianas/veganas',
      'Alergias alimentarias', 'Trastornos alimentarios', 'Nutrición clínica',
      'Dietas terapéuticas', 'Nutrición para enfermedades crónicas'
    ]

    const communicationStyles = [
      'Motivador', 'Analítico', 'Detallista', 'Directo',
      'Empático', 'Paciente', 'Exigente', 'Flexible'
    ]

    const languages = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano']

    return Array.from({ length: count }, (_, i) => {
      const isTrainer = i % 3 !== 2 // 2/3 entrenadores, 1/3 nutricionistas
      const type = isTrainer ? 'trainer' : 'nutritionist'

      // Seleccionar especialidades según el tipo de profesional
      const specialtiesPool = isTrainer ? trainerSpecialties : nutritionistSpecialties
      const professionalSpecialties = [...specialtiesPool].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2)

      // Seleccionar estilos de comunicación
      const professionalCommunicationStyles = [...communicationStyles].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)

      // Seleccionar idiomas
      const professionalLanguages = ['Español', ...languages.slice(1).sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2))]

      return {
        id: `professional-${i + 1}`,
        userId: `user-pro-${i + 1}`,
        fullName: `${isTrainer ? 'Entrenador' : 'Nutricionista'} ${i + 1}`,
        email: `${isTrainer ? 'trainer' : 'nutritionist'}${i + 1}@example.com`,
        avatarUrl: i % 2 === 0 ? `https://i.pravatar.cc/150?u=pro-${i + 1}` : undefined,
        type: type as 'trainer' | 'nutritionist',
        specialties: professionalSpecialties,
        experienceYears: 1 + Math.floor(Math.random() * 15),
        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'other',
        rating: 3 + Math.random() * 2,
        clientCount: Math.floor(Math.random() * 20),
        availability: {
          morning: Math.random() > 0.3,
          afternoon: Math.random() > 0.3,
          evening: Math.random() > 0.3,
          weekends: Math.random() > 0.5
        },
        communicationStyle: professionalCommunicationStyles,
        languages: professionalLanguages
      }
    })
  }

  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generar recomendaciones para un cliente
  const generateRecommendations = (client: Client) => {
    setSelectedClient(client)

    // Filtrar profesionales por tipo
    let filteredProfessionals = [...professionals]
    if (professionalType !== 'all') {
      filteredProfessionals = filteredProfessionals.filter(pro => pro.type === professionalType)
    }

    // Calcular puntuación de coincidencia para cada profesional
    const professionalMatches = filteredProfessionals.map(professional => {
      let score = 0
      const matchReasons: string[] = []

      // 1. Coincidencia de objetivos con especialidades
      const goalMatches = client.goals.filter(goal =>
        professional.specialties.some(specialty =>
          specialty.toLowerCase().includes(goal.toLowerCase()) ||
          goal.toLowerCase().includes(specialty.toLowerCase())
        )
      )

      if (goalMatches.length > 0) {
        score += goalMatches.length * 10
        matchReasons.push(`Coincide con ${goalMatches.length} de tus objetivos`)
      }

      // 2. Preferencia de género
      if (client.preferences.preferredGender === 'any' || client.preferences.preferredGender === professional.gender) {
        score += 5
        if (client.preferences.preferredGender !== 'any') {
          matchReasons.push('Coincide con tu preferencia de género')
        }
      }

      // 3. Nivel de experiencia
      if (client.preferences.preferredExperienceLevel === 'beginner' && professional.experienceYears >= 1 && professional.experienceYears <= 3) {
        score += 5
        matchReasons.push('Experiencia adecuada para principiantes')
      } else if (client.preferences.preferredExperienceLevel === 'intermediate' && professional.experienceYears >= 3 && professional.experienceYears <= 8) {
        score += 5
        matchReasons.push('Experiencia adecuada para nivel intermedio')
      } else if (client.preferences.preferredExperienceLevel === 'expert' && professional.experienceYears > 8) {
        score += 5
        matchReasons.push('Alta experiencia para nivel avanzado')
      }

      // 4. Disponibilidad horaria
      if (
        (client.preferences.preferredTimeOfDay === 'morning' && professional.availability.morning) ||
        (client.preferences.preferredTimeOfDay === 'afternoon' && professional.availability.afternoon) ||
        (client.preferences.preferredTimeOfDay === 'evening' && professional.availability.evening)
      ) {
        score += 8
        matchReasons.push(`Disponible en tu horario preferido (${client.preferences.preferredTimeOfDay})`)
      }

      // 5. Valoración
      if (professional.rating >= 4.5) {
        score += 10
        matchReasons.push('Excelente valoración por otros clientes')
      } else if (professional.rating >= 4.0) {
        score += 7
        matchReasons.push('Muy buena valoración por otros clientes')
      }

      // 6. Carga de clientes (disponibilidad)
      if (professional.clientCount < 5) {
        score += 8
        matchReasons.push('Alta disponibilidad para nuevos clientes')
      } else if (professional.clientCount < 10) {
        score += 5
        matchReasons.push('Disponibilidad moderada para nuevos clientes')
      }

      // Ajustar puntuación final (máximo 100)
      score = Math.min(Math.round(score), 100)

      return {
        ...professional,
        matchScore: score,
        matchReasons: matchReasons
      }
    })

    // Ordenar por puntuación de coincidencia
    const sortedRecommendations = professionalMatches
      .sort((a, b) => b.matchScore! - a.matchScore!)
      .slice(0, 5) // Mostrar solo los 5 mejores

    setRecommendedProfessionals(sortedRecommendations)
    setShowRecommendationDialog(true)
  }

  // Refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)

    toast({
      title: "Datos actualizados",
      description: "Los datos se han actualizado correctamente",
    })
  }

  // Renderizar estado de carga
  if (isLoading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando sistema de recomendación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sistema de Recomendación de Profesionales</h2>
        <div className="flex items-center space-x-2">
          <Select value={professionalType} onValueChange={(value) => setProfessionalType(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de profesional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los profesionales</SelectItem>
              <SelectItem value="trainer">Solo entrenadores</SelectItem>
              <SelectItem value="nutritionist">Solo nutricionistas</SelectItem>
            </SelectContent>
          </Select>

          <Button3D variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button3D>
        </div>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar clientes..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Clientes para recomendación</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          {filteredClients.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={client.avatarUrl || undefined} />
                          <AvatarFallback>{client.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{client.fullName}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>

                      <Button3D onClick={() => generateRecommendations(client)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Recomendar profesionales
                      </Button3D>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {client.goals.map((goal, index) => (
                          <Badge key={index} variant="outline">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Prefiere: {client.preferences.preferredTimeOfDay === 'morning' ? 'Mañana' : client.preferences.preferredTimeOfDay === 'afternoon' ? 'Tarde' : 'Noche'}</span>
                        <span className="mx-2">•</span>
                        <Activity className="h-3 w-3 mr-1" />
                        <span>Nivel: {client.activityLevel === 'sedentary' ? 'Sedentario' :
                                      client.activityLevel === 'light' ? 'Ligero' :
                                      client.activityLevel === 'moderate' ? 'Moderado' :
                                      client.activityLevel === 'active' ? 'Activo' : 'Muy activo'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron clientes</p>
            </div>
          )}
        </Card3DContent>
      </Card3D>

      {/* Diálogo de recomendaciones */}
      {showRecommendationDialog && selectedClient && (
        <Dialog open={showRecommendationDialog} onOpenChange={setShowRecommendationDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Profesionales recomendados para {selectedClient.fullName}</DialogTitle>
              <DialogDescription>
                Basado en objetivos, preferencias y compatibilidad
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={selectedClient.avatarUrl || undefined} />
                  <AvatarFallback>{selectedClient.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedClient.fullName}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedClient.goals.map((goal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Mejores coincidencias</h4>

                {recommendedProfessionals.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedProfessionals.map((professional) => (
                      <div key={professional.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={professional.avatarUrl || undefined} />
                              <AvatarFallback>{professional.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium">{professional.fullName}</h3>
                                <Badge className="ml-2" variant={professional.type === 'trainer' ? 'default' : 'secondary'}>
                                  {professional.type === 'trainer' ? 'Entrenador' : 'Nutricionista'}
                                </Badge>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Award className="h-3 w-3 mr-1" />
                                <span>{professional.experienceYears} años de experiencia</span>
                                <span className="mx-2">•</span>
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                <span>{professional.rating.toFixed(1)}</span>
                                <span className="mx-2">•</span>
                                <Users className="h-3 w-3 mr-1" />
                                <span>{professional.clientCount} clientes</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">Compatibilidad</span>
                              <Badge variant={
                                professional.matchScore! >= 80 ? 'default' :
                                professional.matchScore! >= 60 ? 'secondary' : 'outline'
                              }>
                                {professional.matchScore}%
                              </Badge>
                            </div>
                            <Button3D size="sm" className="mt-2">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Asignar
                            </Button3D>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {professional.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium">Razones para esta recomendación:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {professional.matchReasons?.map((reason, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No se encontraron profesionales compatibles</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button3D>Cerrar</Button3D>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
