"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Dumbbell, BarChart3, User, Menu, Plus, Apple, Calendar, Users, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Si estamos en una página de autenticación, no mostrar la navegación
  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <>
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-10 transition-all duration-200 px-4 py-3 flex items-center justify-between",
          isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent",
        )}
      >
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-6">
                <SheetTitle>Routinize Wellness</SheetTitle>
                <SheetDescription>Plataforma de bienestar integral</SheetDescription>
              </SheetHeader>

              {profile && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.full_name || "Usuario"}</p>
                    <p className="text-sm text-gray-500">{user?.email || "usuario@ejemplo.com"}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("dashboard")}>
                  <Home className="mr-2 h-5 w-5" />
                  Inicio
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("workout")}>
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Entrenamientos
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("ejercicios")}>
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Ejercicios
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("progress")}>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Progreso
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("plan")}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Plan Semanal
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("nutricion")}>
                  <Apple className="mr-2 h-5 w-5" />
                  Nutrición
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("comunidad")}>
                  <Users className="mr-2 h-5 w-5" />
                  Comunidad
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("goals")}>
                  <Target className="mr-2 h-5 w-5" />
                  Objetivos
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("profile")}>
                  <User className="mr-2 h-5 w-5" />
                  Perfil
                </Button>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <Button variant="outline" className="w-full" onClick={() => signOut()}>
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-bold">
            {activeTab === "dashboard" && "Inicio"}
            {activeTab === "workout" && "Entrenamientos"}
            {activeTab === "ejercicios" && "Ejercicios"}
            {activeTab === "progress" && "Progreso"}
            {activeTab === "profile" && "Perfil"}
            {activeTab === "registro" && "Registro"}
            {activeTab === "plan" && "Plan Semanal"}
            {activeTab === "nutricion" && "Nutrición"}
            {activeTab === "comunidad" && "Comunidad"}
            {activeTab === "goals" && "Objetivos"}
          </h1>
        </div>

        <div>
          {profile && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>

      {/* Botón flotante de acción */}
      <div className="fixed bottom-24 right-4 z-10">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => setActiveTab("registro")}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Registrar actividad</span>
        </Button>
      </div>

      {/* Navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t pt-2 pb-safe">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 h-16 bg-transparent">
            <TabsTrigger
              value="dashboard"
              className="flex flex-col items-center justify-center data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Inicio</span>
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="flex flex-col items-center justify-center data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
            >
              <Target className="h-5 w-5" />
              <span className="text-xs mt-1">Objetivos</span>
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="flex flex-col items-center justify-center data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs mt-1">Plan</span>
            </TabsTrigger>
            <TabsTrigger
              value="nutricion"
              className="flex flex-col items-center justify-center data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
            >
              <Apple className="h-5 w-5" />
              <span className="text-xs mt-1">Nutrición</span>
            </TabsTrigger>
            <TabsTrigger
              value="comunidad"
              className="flex flex-col items-center justify-center data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Social</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}
