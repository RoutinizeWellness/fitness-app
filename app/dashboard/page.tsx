"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dumbbell,
  Utensils,
  Heart,
  Moon,
  ChevronRight,
  LogOut
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { user, isLoading, profile } = useAuth()
  const router = useRouter()

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No hay usuario autenticado, redirigiendo a login")
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // No mostrar nada si no hay usuario (redirigiendo)
  if (!user) {
    return null
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Bienvenido, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'Usuario'}</p>
        </div>
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{profile?.first_name?.[0] || profile?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4 cursor-pointer" onClick={() => router.push('/training')}>
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <Dumbbell className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium">Entrenamiento</h3>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer" onClick={() => router.push('/nutrition')}>
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <Utensils className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium">Nutrición</h3>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer" onClick={() => router.push('/sleep')}>
          <div className="flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <Moon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Sueño</h3>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer" onClick={() => router.push('/wellness')}>
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-2">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-medium">Bienestar</h3>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Entrenamiento de hoy</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Fuerza - Tren Superior</h3>
            <p className="text-sm text-gray-500">45 min • 6 ejercicios</p>
          </div>
          <Button onClick={() => router.push('/training')}>
            Iniciar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Perfil</h2>
          <Button variant="outline" size="icon" onClick={() => router.push('/profile')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-500"
          onClick={() => {
            // Cerrar sesión
            const { signOut } = useAuth();
            signOut?.();
            router.push('/auth/login');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </Card>
    </div>
  )
}

function HomeTab({ isAdmin, profile }) {
  const router = useRouter()
  const userName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Usuario'

  // Obtener saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "¡Buenos días"
    if (hour >= 12 && hour < 18) return "¡Buenas tardes"
    return "¡Buenas noches"
  }

  // Citas motivacionales
  const motivationalQuotes = [
    "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje para continuar.",
    "La disciplina es el puente entre metas y logros.",
    "Cada día es una nueva oportunidad para cambiar tu vida.",
    "No cuentes los días, haz que los días cuenten.",
    "El único mal entrenamiento es el que no hiciste."
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <div className="space-y-6 py-4">
      <OrganicElement type="fade">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {userName}!</h1>
            <p className="text-gray-500 italic text-sm mt-1">{randomQuote}</p>
          </div>
          <Avatar className="h-12 w-12" bordered={true} size="lg">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback colorful={true}>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </OrganicElement>

      {/* Tarjeta de recompensas estilo Wolt */}
      <RewardsCard className="w-full" />

      <OrganicElement type="fade" delay={0.1}>
        <Card organic={true} hover={true} className="p-6 overflow-hidden">
          <OrganicSection title="Entrenamiento de hoy" action={
            <Badge variant="soft" size="sm" className="bg-emerald-100 text-emerald-800">
              Recomendado
            </Badge>
          }>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Fuerza - Tren Superior</h3>
                  <p className="text-sm text-muted-foreground">45 min · 6 ejercicios</p>
                </div>
                <Button size="sm" variant="pill" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-none shadow-md">
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar
                </Button>
              </div>
              <Progress value={0} className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full" />
            </div>
          </OrganicSection>
        </Card>
      </OrganicElement>

      {/* Estadísticas */}
      <OrganicElement type="fade" delay={0.2}>
        <OrganicSection title="Tu progreso" action={
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => router.push("/progress")}>
            Ver más
          </Button>
        }>
          <div className="grid grid-cols-2 gap-4">
            <StatCardOrganic
              title="Entrenamientos"
              value={isAdmin ? "3/4" : "75%"}
              description={isAdmin ? "Esta semana" : "3 de 4 completados"}
              icon={<Dumbbell />}
              iconColor="text-blue-500"
              iconBgColor="bg-blue-100"
              trend={isAdmin ? { value: 20, isPositive: true, label: "vs. semana pasada" } : undefined}
            />

            <StatCardOrganic
              title="Racha actual"
              value={12}
              description="Días consecutivos"
              icon={<LineChart />}
              iconColor="text-green-500"
              iconBgColor="bg-green-100"
              trend={{ value: 5, isPositive: true, label: "nuevo récord" }}
            />
          </div>
        </OrganicSection>
      </OrganicElement>

      {/* Tarjeta de membresía estilo Wolt */}
      <MembershipCard
        membershipType={isAdmin ? "premium" : "basic"}
        nextPaymentDate="02/04/2025"
        amountSaved={4.17}
      />

      {/* Módulos principales - Versión mejorada para todos los usuarios */}
      <OrganicElement type="fade" delay={0.3}>
        <OrganicSection title="Módulos" action={
          <Button variant="ghost" size="sm" className="rounded-full text-xs text-gray-500">
            Personalizar
          </Button>
        }>
          <OrganicList className="grid grid-cols-2 gap-4">
            {[
              { name: "Entrenamiento", icon: Dumbbell, color: "text-emerald-500", bgColor: "bg-emerald-100", tab: "training" },
              { name: "Nutrición", icon: Utensils, color: "text-green-500", bgColor: "bg-green-100", tab: "nutrition" },
              { name: "Sueño", icon: Moon, color: "text-teal-500", bgColor: "bg-teal-100", tab: "sleep" },
              { name: "Bienestar", icon: Heart, color: "text-cyan-500", bgColor: "bg-cyan-100", tab: "wellness" }
            ].map((module) => (
              <Card
                key={module.name}
                organic={true}
                hover={true}
                className="overflow-hidden cursor-pointer"
                onClick={() => {
                  router.push(`/${module.tab}`);
                }}
              >
                <div className="p-5 flex flex-col items-center justify-center aspect-square">
                  <div className={`${module.bgColor} rounded-full p-4 mb-3 ${module.color} shadow-sm`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">{module.name}</span>
                  <div className="absolute bottom-3 right-3">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Card>
            ))}
          </OrganicList>
        </OrganicSection>
      </OrganicElement>

      {/* Sección de favoritos estilo Wolt */}
      <FavoritesSection />

      {/* Datos de salud en tiempo real para todos los usuarios */}
      <OrganicElement type="fade" delay={0.4}>
        <OrganicSection title="Datos de Salud" action={
          <Button variant="ghost" size="sm" className="rounded-full text-xs text-gray-500" onClick={() => router.push("/health-data/new")}>
            Ver todos
          </Button>
        }>
          <Card organic={true} className="p-4">
            <HealthDataDisplay compact={true} />
          </Card>
        </OrganicSection>
      </OrganicElement>

      {/* Próximos eventos */}
      <OrganicElement type="fade" delay={0.5}>
        <OrganicSection title="Próximos eventos" action={
          <Button variant="ghost" size="sm" className="rounded-full text-xs text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Ver todos
          </Button>
        }>
          <Card organic={true} className="p-5 overflow-hidden">
            <div className="space-y-5">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4 shadow-sm">
                  <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Entrenamiento de fuerza</p>
                  <p className="text-xs text-gray-500">Hoy, 18:00 - 19:30</p>
                </div>
                <Badge variant="soft" className="bg-purple-100 text-purple-600">
                  Hoy
                </Badge>
              </div>

              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4 shadow-sm">
                  <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sesión de meditación</p>
                  <p className="text-xs text-gray-500">Mañana, 08:00 - 08:30</p>
                </div>
                <Badge variant="soft" className="bg-blue-100 text-blue-600">
                  Mañana
                </Badge>
              </div>

              <div className="flex items-center">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full mr-4 shadow-sm">
                  <Utensils className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Plan nutricional semanal</p>
                  <p className="text-xs text-gray-500">Miércoles, 12:00 - 13:00</p>
                </div>
                <Badge variant="soft" className="bg-teal-100 text-teal-600">
                  2 días
                </Badge>
              </div>
            </div>
          </Card>
        </OrganicSection>
      </OrganicElement>
    </div>
  )
}

function WorkoutTab({ isAdmin }) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Today's Workout</h1>
        {isAdmin && (
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Upper Body Strength</CardTitle>
            {isAdmin && <Badge>AI Generated</Badge>}
          </div>
          <p className="text-sm text-gray-500">45 min · 6 exercises</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Workout
            </Button>

            {isAdmin ? (
              // Versión detallada para administradores
              <div className="space-y-3">
                <div className="flex items-center border rounded-lg p-3">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">1</div>
                  <div className="flex-1">
                    <h3 className="font-medium">Bench Press</h3>
                    <div className="flex text-sm text-gray-500">
                      <span>4 sets × 8-10 reps</span>
                      <span className="mx-2">•</span>
                      <span>135 lbs</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center border rounded-lg p-3">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">2</div>
                  <div className="flex-1">
                    <h3 className="font-medium">Seated Rows</h3>
                    <div className="flex text-sm text-gray-500">
                      <span>3 sets × 10-12 reps</span>
                      <span className="mx-2">•</span>
                      <span>120 lbs</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center border rounded-lg p-3">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">3</div>
                  <div className="flex-1">
                    <h3 className="font-medium">Shoulder Press</h3>
                    <div className="flex text-sm text-gray-500">
                      <span>3 sets × 8-10 reps</span>
                      <span className="mx-2">•</span>
                      <span>95 lbs</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              // Versión simplificada para usuarios estándar
              <div className="space-y-3">
                <div className="flex items-center border rounded-lg p-3">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">1</div>
                  <div className="flex-1">
                    <h3 className="font-medium">Bench Press</h3>
                    <div className="flex text-sm text-gray-500">
                      <span>4 sets × 8-10 reps</span>
                      <span className="mx-2">•</span>
                      <span>135 lbs</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-center py-2 text-gray-500 text-sm">
                  <p>+ 5 more exercises</p>
                  <Button variant="link" className="mt-1">
                    Show All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        // Notas detalladas para administradores
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Rest 60-90 seconds between sets</p>
              <p>• Focus on controlled eccentric (lowering) phase</p>
              <p>• Increase weight if you can do more than the target reps</p>
              <p>• Rate each exercise after completion to help the AI adjust</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Notas simplificadas para usuarios estándar
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Rest 60-90 seconds between sets</p>
              <p>• Focus on controlled movements</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProgressTab({ isAdmin }) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your Progress</h1>
        <Button variant="outline" size="icon">
          <Calendar className="h-5 w-5" />
        </Button>
      </div>

      {isAdmin ? (
        // Versión completa para administradores
        <Tabs defaultValue="history">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-sm">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Upper Body Strength</h3>
                      <div className="flex text-sm text-gray-500">
                        <span>Today</span>
                        <span className="mx-2">•</span>
                        <span>45 min</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-sm">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Lower Body Focus</h3>
                      <div className="flex text-sm text-gray-500">
                        <span>2 days ago</span>
                        <span className="mx-2">•</span>
                        <span>60 min</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card organic={true} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Strength Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-3">
                      <LineChart className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-500">Strength chart visualization</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Bench Press</div>
                    <div className="text-sm font-medium">135 lbs (+10)</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Squat</div>
                    <div className="text-sm font-medium">225 lbs (+15)</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Deadlift</div>
                    <div className="text-sm font-medium">275 lbs (+20)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            <Card organic={true} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Body Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-2">
                        <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="text-sm text-gray-500">Weight</div>
                    </div>
                    <div className="text-xl font-bold">175 lbs</div>
                    <div className="text-xs text-green-600">-2.5 lbs this month</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-2">
                        <Heart className="h-4 w-4 text-green-500 dark:text-green-400" />
                      </div>
                      <div className="text-sm text-gray-500">Body Fat</div>
                    </div>
                    <div className="text-xl font-bold">15.2%</div>
                    <div className="text-xs text-green-600">-0.8% this month</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-full">
                  Update Measurements
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Versión simplificada para usuarios estándar
        <div className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center border rounded-lg p-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Upper Body Strength</h3>
                    <div className="flex text-sm text-gray-500">
                      <span>Today</span>
                      <span className="mx-2">•</span>
                      <span>45 min</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center border rounded-lg p-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Lower Body Focus</h3>
                    <div className="flex text-sm text-gray-500">
                      <span>2 days ago</span>
                      <span className="mx-2">•</span>
                      <span>60 min</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Workouts
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 rounded-md p-3 text-center">
                  <div className="text-sm text-gray-500">Workouts</div>
                  <div className="text-xl font-bold">12</div>
                  <div className="text-xs text-green-600">This Month</div>
                </div>
                <div className="bg-gray-100 rounded-md p-3 text-center">
                  <div className="text-sm text-gray-500">Streak</div>
                  <div className="text-xl font-bold">3</div>
                  <div className="text-xs text-green-600">Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProfileTab({ isAdmin, profile }) {
  const router = useRouter()
  const { signOut } = useAuth()
  const userName = profile?.full_name || 'Usuario'
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder.svg" alt="@user" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <h2 className="mt-4 text-xl font-bold">{userName}</h2>
        <p className="text-gray-500">Premium Member</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Build Muscle</h3>
                <p className="text-sm text-gray-500">Primary goal</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Strength: Intermediate</h3>
                <p className="text-sm text-gray-500">Current level</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Personal Information
            </Button>

            {/* Opciones simplificadas para usuarios estándar */}
            {!isAdmin ? (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-500" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-500" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/connect-device")}>
        <Watch className="mr-2 h-4 w-4" />
        Connect Devices
      </Button>
    </div>
  )
}





function AdminTab() {
  const router = useRouter()

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/users")}>
              <User className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/trainers")}>
              <Dumbbell className="mr-2 h-4 w-4" />
              Manage Trainers
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/exercises")}>
              <Dumbbell className="mr-2 h-4 w-4" />
              Exercise Library
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/workouts")}>
              <Activity className="mr-2 h-4 w-4" />
              Workout Templates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/plans")}>
              <Calendar className="mr-2 h-4 w-4" />
              Training Plans
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              App Settings
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
