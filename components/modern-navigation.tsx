"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Home,
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  User,
  Bell,
  Search,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart,
  Calendar,
  Clock,
  Brain,
  Target,
  Sparkles
} from "lucide-react"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { useFeedback } from "@/components/feedback/action-feedback"
import { Card3D } from "@/components/ui/card-3d"

interface NavigationItem {
  title: string
  value: string
  icon: React.ElementType
  href: string
  badge?: string | number
  color?: string
}

interface ModernNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  notifications?: number
}

export default function ModernNavigation({
  activeTab,
  setActiveTab,
  notifications = 0
}: ModernNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { showFeedback } = useFeedback()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Elementos de navegación principal
  const navigationItems: NavigationItem[] = [
    {
      title: "Inicio",
      value: "dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Entreno",
      value: "training",
      icon: Dumbbell,
      href: "/training",
      badge: "Nuevo",
      color: "bg-blue-500"
    },
    {
      title: "Nutrición",
      value: "nutrition",
      icon: Utensils,
      href: "/nutrition",
    },
    {
      title: "Sueño",
      value: "sleep",
      icon: Moon,
      href: "/sleep",
    },
    {
      title: "Bienestar",
      value: "wellness",
      icon: Heart,
      href: "/wellness",
    },
    {
      title: "Onboarding",
      value: "habit-onboarding",
      icon: Sparkles,
      href: "/habit-onboarding",
      badge: "Demo",
      color: "bg-purple-500"
    },
  ]

  // Elementos de menú adicionales
  const menuItems: NavigationItem[] = [
    {
      title: "Perfil",
      value: "profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "Estadísticas",
      value: "stats",
      icon: BarChart,
      href: "/stats",
    },
    {
      title: "Calendario",
      value: "calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Objetivos",
      value: "goals",
      icon: Target,
      href: "/goals",
    },
    {
      title: "Configuración",
      value: "settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  // Verificar si el usuario es administrador
  const isAdmin = profile?.is_admin || profile?.email === "admin@routinize.com"

  // Acciones rápidas
  const quickActions = [
    {
      title: "Registrar entrenamiento",
      icon: Dumbbell,
      href: "/training/log",
      color: "bg-blue-500"
    },
    {
      title: "Registrar comida",
      icon: Utensils,
      href: "/nutrition/add-meal",
      color: "bg-green-500"
    },
    {
      title: "Registrar sueño",
      icon: Moon,
      href: "/sleep/log",
      color: "bg-purple-500"
    },
    {
      title: "Registrar peso",
      icon: Target,
      href: "/nutrition/log-weight",
      color: "bg-orange-500"
    },
  ]

  // Manejar navegación
  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMenuOpen(false)
    setIsActionsOpen(false)
  }

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut()
        showFeedback({
          message: "Sesión cerrada correctamente",
          type: "success",
          position: "bottom"
        })
        router.push("/login")
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      showFeedback({
        message: "Error al cerrar sesión",
        type: "error",
        position: "bottom"
      })
    }
  }

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
    setIsNotificationsOpen(false)
    setIsSearchOpen(false)
    setIsActionsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Header con efecto de blur al hacer scroll */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm border-b"
            : "bg-transparent"
        )}
      >
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Button3D
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menú</span>
            </Button3D>

            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold gradient-text">Routinize</span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Buscar</span>
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buscar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                        {notifications > 9 ? '9+' : notifications}
                      </span>
                    )}
                    <span className="sr-only">Notificaciones</span>
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notificaciones</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button3D
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push("/profile")}
            >
              <Avatar3D className="h-8 w-8">
                <Avatar3DImage src={profile?.avatar_url || "/placeholder.svg"} />
                <Avatar3DFallback>{profile?.full_name?.charAt(0) || "U"}</Avatar3DFallback>
              </Avatar3D>
            </Button3D>
          </div>
        </div>
      </header>

      {/* Navegación inferior con animaciones */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t">
        <div className="container max-w-md mx-auto">
          <div className="grid grid-cols-5 h-16">
            {navigationItems.map((item) => (
              <button
                key={item.value}
                className="relative flex flex-col items-center justify-center"
                onClick={() => {
                  setActiveTab(item.value)
                  handleNavigation(item.href)
                }}
              >
                <div
                  className={cn(
                    "flex flex-col items-center justify-center transition-all duration-200",
                    activeTab === item.value
                      ? "text-primary scale-110"
                      : "text-muted-foreground"
                  )}
                >
                  {activeTab === item.value && (
                    <motion.div
                      layoutId="navigation-indicator"
                      className="absolute -top-3 w-12 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}

                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.badge && (
                      <span className={`absolute -top-1 -right-1 w-4 h-4 ${item.color || 'bg-primary'} rounded-full flex items-center justify-center text-[8px] text-white font-bold`}>
                        {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-xs mt-1 font-medium">{item.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón flotante de acción con menú desplegable */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="relative group">
          <AnimatePresence>
            {isActionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-full right-0 mb-3"
              >
                <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col space-y-2 border border-gray-100">
                  {quickActions.map((action, index) => (
                    <Button3D
                      key={index}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-colors flex items-center justify-start px-4"
                      onClick={() => handleNavigation(action.href)}
                    >
                      <div className={`${action.color} p-1.5 rounded-lg mr-2 text-white`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{action.title}</span>
                    </Button3D>
                  ))}
                </div>

                {/* Flecha indicadora */}
                <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-100"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button3D
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-xl border-none transition-all duration-300",
              isActionsOpen
                ? "bg-primary/90 hover:bg-primary/80 rotate-45"
                : "bg-gradient-to-br from-primary to-primary/80 hover:shadow-primary/25"
            )}
            onClick={() => setIsActionsOpen(!isActionsOpen)}
          >
            <Plus className="h-6 w-6 text-white" />
          </Button3D>
        </div>
      </div>

      {/* Menú lateral */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[85%] sm:w-[385px] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar3D className="h-10 w-10">
                  <Avatar3DImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <Avatar3DFallback>{profile?.full_name?.charAt(0) || "U"}</Avatar3DFallback>
                </Avatar3D>
                <div>
                  <SheetTitle>{profile?.full_name || "Usuario"}</SheetTitle>
                  <SheetDescription>{user?.email}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Navegación principal</h3>
                  {navigationItems.map((item) => (
                    <Button3D
                      key={item.value}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        activeTab === item.value && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        setActiveTab(item.value)
                        handleNavigation(item.href)
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.title}
                      {item.badge && (
                        <Badge className={`ml-auto ${item.color || 'bg-primary'}`} variant="secondary">
                          {item.badge}
                        </Badge>
                      )}
                    </Button3D>
                  ))}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Más opciones</h3>
                  {menuItems.map((item) => (
                    <Button3D
                      key={item.value}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.href)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.title}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button3D>
                  ))}

                  {isAdmin && (
                    <Button3D
                      variant="ghost"
                      className="w-full justify-start mt-2 bg-amber-50 hover:bg-amber-100 border-amber-200"
                      onClick={() => handleNavigation("/admin")}
                    >
                      <Settings className="h-5 w-5 mr-3 text-amber-600" />
                      Panel de Administración
                      <Badge className="ml-auto" variant="outline">Admin</Badge>
                    </Button3D>
                  )}
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="p-4 border-t">
              <Button3D
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar sesión
              </Button3D>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
