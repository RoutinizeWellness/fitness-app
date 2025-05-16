"use client"

import { useState } from "react"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Button } from "@/components/ui/button"
import { OrganicThemeConfigurator, useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { StatCardOrganic } from "@/components/ui/stat-card-organic"
import {
  Sun, Moon, Dumbbell, Heart, Utensils, Brain,
  ChevronRight, Settings, Bell, User, Home, Calendar, Plus, Activity, BarChart3, TrendingUp
} from "lucide-react"

export default function ThemeShowcasePage() {
  const { isDark, setTheme } = useOrganicTheme()
  const [activeTab, setActiveTab] = useState("buttons")

  return (
    <RoutinizeLayout>
      <div className="container mx-auto p-4 pb-24">
        <OrganicElement type="fade">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Tema Orgánico</h1>
            <Button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              variant="outline"
              className="rounded-full"
            >
              {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {isDark ? "Modo Claro" : "Modo Oscuro"}
            </Button>
          </div>
        </OrganicElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <OrganicElement type="fade" delay={0.1}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid grid-cols-5 mb-4 rounded-full p-1">
                  <TabsTrigger value="buttons" className="rounded-full">Botones</TabsTrigger>
                  <TabsTrigger value="cards" className="rounded-full">Tarjetas</TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-full">Estadísticas</TabsTrigger>
                  <TabsTrigger value="forms" className="rounded-full">Formularios</TabsTrigger>
                  <TabsTrigger value="navigation" className="rounded-full">Navegación</TabsTrigger>
                </TabsList>

                <TabsContent value="buttons" className="space-y-8">
                  <OrganicElement type="fade" delay={0.2}>
                    <Card className="p-6 rounded-3xl shadow-soft">
                      <h2 className="text-xl font-semibold mb-4">Variantes de Botones</h2>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="default" className="rounded-full">Default</Button>
                        <Button variant="destructive" className="rounded-full">Destructive</Button>
                        <Button variant="outline" className="rounded-full">Outline</Button>
                        <Button variant="secondary" className="rounded-full">Secondary</Button>
                        <Button variant="ghost" className="rounded-full">Ghost</Button>
                        <Button variant="link">Link</Button>
                      </div>
                    </Card>
                  </OrganicElement>

                  <OrganicElement type="fade" delay={0.3}>
                    <Card className="p-6 rounded-3xl shadow-soft">
                      <h2 className="text-xl font-semibold mb-4">Botones con Iconos</h2>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="default" className="rounded-full">
                          <Dumbbell className="mr-2 h-4 w-4" />
                          Entrenar
                        </Button>
                        <Button variant="outline" className="rounded-full">
                          <Heart className="mr-2 h-4 w-4" />
                          Favorito
                        </Button>
                        <Button variant="secondary" className="rounded-full">
                          <Utensils className="mr-2 h-4 w-4" />
                          Nutrición
                        </Button>
                        <Button variant="ghost" className="rounded-full">
                          <Brain className="mr-2 h-4 w-4" />
                          Meditación
                        </Button>
                        <Button variant="default" size="icon" className="rounded-full">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </OrganicElement>
                </TabsContent>

                <TabsContent value="cards" className="space-y-8">
                  <OrganicStaggeredList
                    staggerDelay={0.1}
                    direction="up"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {[
                      <Card key="card1" className="p-6 rounded-3xl shadow-soft hover:shadow-soft-md transition-all duration-300 hover:-translate-y-2">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Entrenamiento de Fuerza</h3>
                            <p className="text-sm text-muted-foreground">30 minutos · Intermedio</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Rutina completa para desarrollar fuerza y resistencia muscular.
                        </p>
                        <Button variant="default" className="w-full rounded-full">
                          Comenzar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Card>,

                      <Card key="card2" className="p-6 rounded-3xl shadow-soft hover:shadow-soft-md transition-all duration-300 hover:-translate-y-2">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                            <Utensils className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Plan Nutricional</h3>
                            <p className="text-sm text-muted-foreground">Personalizado · Semanal</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Plan de alimentación adaptado a tus objetivos y preferencias.
                        </p>
                        <Button variant="outline" className="w-full rounded-full">
                          Ver detalles <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Card>,

                      <Card key="card3" className="p-6 rounded-3xl shadow-soft hover:shadow-soft-md transition-all duration-300 hover:-translate-y-2">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                            <Brain className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Meditación Guiada</h3>
                            <p className="text-sm text-muted-foreground">15 minutos · Relajación</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sesión de meditación para reducir el estrés y mejorar el enfoque.
                        </p>
                        <Button variant="default" className="w-full rounded-full">
                          Comenzar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Card>,

                      <Card key="card4" className="p-6 rounded-3xl shadow-soft hover:shadow-soft-md transition-all duration-300 hover:-translate-y-2">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mr-3">
                            <Heart className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Seguimiento de Salud</h3>
                            <p className="text-sm text-muted-foreground">Diario · Automático</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Monitoreo de métricas de salud y bienestar general.
                        </p>
                        <Button variant="outline" className="w-full rounded-full">
                          Ver estadísticas <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Card>
                    ]}
                  </OrganicStaggeredList>
                </TabsContent>

                <TabsContent value="forms" className="space-y-8">
                  <OrganicElement type="fade" delay={0.2}>
                    <Card className="p-6 rounded-3xl shadow-soft">
                      <h2 className="text-xl font-semibold mb-4">Elementos de Formulario</h2>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input id="name" placeholder="Introduce tu nombre" className="rounded-xl" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="ejemplo@correo.com" className="rounded-xl" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="notifications" />
                          <Label htmlFor="notifications">Recibir notificaciones</Label>
                        </div>
                        <Button className="w-full rounded-full mt-2">Guardar Cambios</Button>
                      </div>
                    </Card>
                  </OrganicElement>
                </TabsContent>

                <TabsContent value="stats" className="space-y-8">
                  <OrganicStaggeredList
                    staggerDelay={0.1}
                    direction="up"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {[
                      <StatCardOrganic
                        key="stat1"
                        title="Pasos Diarios"
                        value={8432}
                        formatter={(value) => value.toLocaleString()}
                        icon={<Activity />}
                        iconColor="text-blue-500"
                        iconBgColor="bg-blue-100"
                        trend={{ value: 12, isPositive: true, label: "vs. ayer" }}
                        animationDelay={0}
                      />,

                      <StatCardOrganic
                        key="stat2"
                        title="Calorías Quemadas"
                        value={1250}
                        formatter={(value) => `${value.toLocaleString()} kcal`}
                        icon={<Dumbbell />}
                        iconColor="text-amber-500"
                        iconBgColor="bg-amber-100"
                        trend={{ value: 8, isPositive: true, label: "vs. media" }}
                        animationDelay={0.1}
                      />,

                      <StatCardOrganic
                        key="stat3"
                        title="Minutos Activos"
                        value={78}
                        formatter={(value) => `${value} min`}
                        icon={<BarChart3 />}
                        iconColor="text-green-500"
                        iconBgColor="bg-green-100"
                        trend={{ value: 5, isPositive: false, label: "vs. objetivo" }}
                        animationDelay={0.2}
                        variant="glass"
                      />,

                      <StatCardOrganic
                        key="stat4"
                        title="Progreso Semanal"
                        value={67}
                        formatter={(value) => `${value}%`}
                        icon={<TrendingUp />}
                        iconColor="text-purple-500"
                        iconBgColor="bg-purple-100"
                        trend={{ value: 15, isPositive: true, label: "vs. semana pasada" }}
                        animationDelay={0.3}
                        variant="outline"
                      />
                    ]}
                  </OrganicStaggeredList>
                </TabsContent>

                <TabsContent value="navigation" className="space-y-8">
                  <OrganicElement type="fade" delay={0.2}>
                    <Card className="p-6 rounded-3xl shadow-soft">
                      <h2 className="text-xl font-semibold mb-4">Navegación</h2>
                      <div className="flex justify-between p-4 bg-muted rounded-2xl mb-4">
                        {['Inicio', 'Entreno', 'Nutrición', 'Bienestar'].map((item, index) => (
                          <Button
                            key={index}
                            variant={index === 0 ? "default" : "ghost"}
                            className="rounded-full"
                          >
                            {index === 0 && <Home className="mr-2 h-4 w-4" />}
                            {index === 1 && <Dumbbell className="mr-2 h-4 w-4" />}
                            {index === 2 && <Utensils className="mr-2 h-4 w-4" />}
                            {index === 3 && <Heart className="mr-2 h-4 w-4" />}
                            {item}
                          </Button>
                        ))}
                      </div>
                      <div className="flex justify-between p-4 bg-muted rounded-2xl">
                        {['Hoy', 'Semana', 'Mes', 'Año'].map((item, index) => (
                          <Button
                            key={index}
                            variant={index === 0 ? "default" : "ghost"}
                            size="sm"
                            className="rounded-full"
                          >
                            {index === 0 && <Calendar className="mr-2 h-3 w-3" />}
                            {item}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  </OrganicElement>
                </TabsContent>
              </Tabs>
            </OrganicElement>
          </div>

          <div>
            <OrganicElement type="fade" delay={0.2}>
              <OrganicThemeConfigurator />
            </OrganicElement>

            <OrganicElement type="fade" delay={0.3} className="mt-6">
              <Card className="p-6 rounded-3xl shadow-soft">
                <h3 className="text-lg font-semibold mb-4">Perfil de Usuario</h3>
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16 mr-4 border-4 border-background">
                    <AvatarImage src="https://ui-avatars.com/api/?name=User&background=random" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">Usuario Demo</h4>
                    <p className="text-sm text-muted-foreground">usuario@ejemplo.com</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-full">
                  <User className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              </Card>
            </OrganicElement>
          </div>
        </div>
      </div>

      {/* Botón de acción flotante */}
      <FloatingActionButton
        icon={<Plus className="h-6 w-6" />}
        position="bottom-right"
        offset={6}
        variant="gradient"
        animation="float"
        showLabel={true}
        label="Nueva acción"
        aria-label="Nueva acción"
      />
    </RoutinizeLayout>
  )
}
