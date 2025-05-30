"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  Edit,
  User,
  Dumbbell,
  Calendar,
  Clock,
  Ruler,
  Scale,
  Heart,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"
import { processSupabaseResponse } from "@/lib/supabase-utils"
import { AnimatedFade, AnimatedSlide } from "@/components/animations/animated-transitions"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function TrainingProfilePage() {
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  // Load profile data when component mounts
  useEffect(() => {
    if (user) {
      loadProfileData()
    } else {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [user, router])

  // Load profile data from Supabase
  const loadProfileData = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('training_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        null,
        "Carga de perfil de entrenamiento"
      )

      if (error) {
        console.error("Error loading profile data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar tu perfil de entrenamiento. Por favor, inténtalo de nuevo.",
          variant: "destructive"
        })
        return
      }

      if (data) {
        setProfileData(data)
      } else {
        // If no profile data exists, redirect to onboarding
        toast({
          title: "Perfil no encontrado",
          description: "No se encontró tu perfil de entrenamiento. Serás redirigido al proceso de onboarding.",
        })

        setTimeout(() => {
          router.push("/training/onboarding")
        }, 2000)
      }
    } catch (error) {
      console.error("Error in loadProfileData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle back button
  const handleBack = () => {
    router.push("/training")
  }

  // Handle edit profile
  const handleEditProfile = () => {
    router.push("/training/onboarding")
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil de Entrenamiento</h1>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render profile not found
  if (!profileData) {
    return (
      <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil de Entrenamiento</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perfil no encontrado</CardTitle>
            <CardDescription>
              No se encontró tu perfil de entrenamiento. Serás redirigido al proceso de onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Button onClick={() => router.push("/training/onboarding")}>
              Ir al Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Perfil de Entrenamiento</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnimatedFade>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Perfil de Entrenamiento</CardTitle>
                  <CardDescription>
                    Información sobre tus preferencias y objetivos de entrenamiento
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user?.email}</h2>
                    <div className="flex items-center mt-1">
                      <Badge className="mr-2">
                        {profileData.experience_level === "beginner" && "Principiante"}
                        {profileData.experience_level === "intermediate" && "Intermedio"}
                        {profileData.experience_level === "advanced" && "Avanzado"}
                        {profileData.experience_level === "elite" && "Elite"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Desde {new Date(profileData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Objetivo principal</h3>
                    </div>
                    <p>
                      {profileData.primary_goal === "strength" && "Fuerza"}
                      {profileData.primary_goal === "hypertrophy" && "Hipertrofia"}
                      {profileData.primary_goal === "endurance" && "Resistencia"}
                      {profileData.primary_goal === "weight_loss" && "Pérdida de peso"}
                      {profileData.primary_goal === "general_fitness" && "Fitness general"}
                      {profileData.primary_goal === "health" && "Salud"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Frecuencia</h3>
                    </div>
                    <p>{profileData.days_per_week} días por semana</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Duración</h3>
                    </div>
                    <p>{profileData.time_per_session} minutos por sesión</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Objetivos de entrenamiento</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.training_goals && profileData.training_goals.map((goal: string) => (
                      <Badge key={goal} variant="secondary">
                        {goal === "strength" && "Fuerza"}
                        {goal === "hypertrophy" && "Hipertrofia"}
                        {goal === "endurance" && "Resistencia"}
                        {goal === "weight_loss" && "Pérdida de peso"}
                        {goal === "general_fitness" && "Fitness general"}
                        {goal === "health" && "Salud"}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Equipo disponible</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.available_equipment && profileData.available_equipment.map((equipment: string) => (
                      <Badge key={equipment} variant="outline">
                        {equipment === "gym" && "Gimnasio completo"}
                        {equipment === "dumbbells" && "Mancuernas"}
                        {equipment === "barbell" && "Barra y discos"}
                        {equipment === "machines" && "Máquinas"}
                        {equipment === "bodyweight" && "Peso corporal"}
                        {equipment === "bands" && "Bandas elásticas"}
                      </Badge>
                    ))}
                  </div>
                </div>

                {(profileData.medical_conditions?.length > 0 || profileData.injuries?.length > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      <h3 className="font-medium">Consideraciones médicas</h3>
                    </div>

                    {profileData.medical_conditions?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profileData.medical_conditions.map((condition: string) => (
                          <Badge key={condition} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {condition === "back_pain" && "Dolor de espalda"}
                            {condition === "knee_pain" && "Dolor de rodilla"}
                            {condition === "shoulder_pain" && "Dolor de hombro"}
                            {condition === "hypertension" && "Hipertensión"}
                            {condition === "diabetes" && "Diabetes"}
                            {condition === "asthma" && "Asma"}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {profileData.injuries?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profileData.injuries.map((injury: string) => (
                          <Badge key={injury} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {injury === "acl" && "Ligamento cruzado"}
                            {injury === "disc_herniation" && "Hernia discal"}
                            {injury === "rotator_cuff" && "Manguito rotador"}
                            {injury === "ankle_sprain" && "Esguince de tobillo"}
                            {injury === "tendonitis" && "Tendinitis"}
                            {injury === "fracture" && "Fractura previa"}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
                <Button onClick={handleEditProfile}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              </CardFooter>
            </Card>
          </AnimatedFade>
        </TabsContent>

        <TabsContent value="details">
          <AnimatedSlide>
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Perfil</CardTitle>
                <CardDescription>
                  Información detallada sobre tus preferencias y medidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Medidas corporales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Ruler className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Altura</p>
                        <p className="font-medium">{profileData.height_cm} cm</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Scale className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peso</p>
                        <p className="font-medium">{profileData.weight_kg} kg</p>
                      </div>
                    </div>

                    {profileData.body_fat_percentage !== null && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">% Grasa corporal</p>
                          <p className="font-medium">{profileData.body_fat_percentage}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Preferencias de ejercicios</h3>

                  {profileData.preferred_exercises?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ejercicios preferidos:</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.preferred_exercises.map((exercise: string) => (
                          <Badge key={exercise} variant="secondary">
                            {exercise === "squat" && "Sentadillas"}
                            {exercise === "deadlift" && "Peso muerto"}
                            {exercise === "bench_press" && "Press de banca"}
                            {exercise === "pull_up" && "Dominadas"}
                            {exercise === "overhead_press" && "Press militar"}
                            {exercise === "row" && "Remo"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.disliked_exercises?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ejercicios que prefieres evitar:</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.disliked_exercises.map((exercise: string) => (
                          <Badge key={exercise} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {exercise === "squat" && "Sentadillas"}
                            {exercise === "deadlift" && "Peso muerto"}
                            {exercise === "bench_press" && "Press de banca"}
                            {exercise === "pull_up" && "Dominadas"}
                            {exercise === "overhead_press" && "Press militar"}
                            {exercise === "row" && "Remo"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Disponibilidad</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Días por semana:</p>
                      <p className="font-medium">{profileData.days_per_week}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo por sesión:</p>
                      <p className="font-medium">{profileData.time_per_session} minutos</p>
                    </div>
                  </div>

                  {profileData.preferred_days && profileData.preferred_days.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Días preferidos:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileData.preferred_days.map((day: number) => (
                          <Badge key={day} variant="outline">
                            {day === 0 && "Lunes"}
                            {day === 1 && "Martes"}
                            {day === 2 && "Miércoles"}
                            {day === 3 && "Jueves"}
                            {day === 4 && "Viernes"}
                            {day === 5 && "Sábado"}
                            {day === 6 && "Domingo"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("overview")}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Resumen
                </Button>
                <Button onClick={handleEditProfile}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              </CardFooter>
            </Card>
          </AnimatedSlide>
        </TabsContent>
      </Tabs>
    </div>
  )
}
