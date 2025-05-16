"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, Dumbbell, Utensils, Moon, Heart, 
  Menu, Bell, Search, X, ChevronLeft, 
  Settings, LogOut, User, Shield, Plus,
  BarChart2, Users, Activity, Calendar, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { OrganicElement } from "@/components/transitions/organic-transitions"

interface NavigationItem {
  title: string
  value: string
  icon: React.ElementType
  href: string
  badge?: string
  color?: string
}

interface OrganicNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  notifications?: number
  showBackButton?: boolean
  title?: string
  profile?: any
  showFloatingAction?: boolean
  floatingActionIcon?: React.ReactNode
  onFloatingActionClick?: () => void
}

export function OrganicNavigation({
  activeTab,
  setActiveTab,
  notifications = 0,
  showBackButton = false,
  title = "Routinize",
  profile = null,
  showFloatingAction = false,
  floatingActionIcon = <Plus className="h-6 w-6" />,
  onFloatingActionClick
}: OrganicNavigationProps) {
  const router = useRouter()
  const { isDark } = useOrganicTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar si el usuario es admin
  useEffect(() => {
    if (profile?.email === "admin@routinize.com") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [profile])

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
  ]

  // Elementos de navegación secundaria
  const secondaryItems: NavigationItem[] = [
    {
      title: "Ejercicios",
      value: "ejercicios",
      icon: Activity,
      href: "/ejercicios",
    },
    {
      title: "Estadísticas",
      value: "stats",
      icon: BarChart2,
      href: "/workout-stats",
    },
    {
      title: "Plan",
      value: "plan",
      icon: Calendar,
      href: "/plan",
    },
    {
      title: "Comunidad",
      value: "comunidad",
      icon: Users,
      href: "/comunidad",
    },
    {
      title: "IA",
      value: "ai",
      icon: Sparkles,
      href: "/ai",
    },
  ]

  // Manejar navegación
  const handleNavigation = (href: string) => {
    setIsMenuOpen(false)
    router.push(href)
  }

  // Manejar botón de retroceso
  const handleBack = () => {
    router.back()
  }

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
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 rounded-full"
                onClick={handleBack}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Atrás</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 rounded-full"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            )}

            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">{title}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push("/profile")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      {/* Menú lateral */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 h-full w-[280px] bg-background shadow-lg"
            >
              <div className="flex h-16 items-center justify-between px-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="text-lg font-bold">Routinize</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Cerrar menú</span>
                </Button>
              </div>

              <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
                <div className="p-4 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Navegación principal</h3>
                    {navigationItems.map((item) => (
                      <Button
                        key={item.value}
                        variant={activeTab === item.value ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start rounded-full",
                          activeTab === item.value && "bg-primary/90 text-primary-foreground"
                        )}
                        onClick={() => {
                          setActiveTab(item.value)
                          handleNavigation(item.href)
                        }}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.title}
                        {item.badge && (
                          <Badge className={`ml-auto ${item.color || 'bg-primary'}`} variant="soft" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Más opciones</h3>
                    {secondaryItems.map((item) => (
                      <Button
                        key={item.value}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start rounded-full",
                          activeTab === item.value && "bg-primary/10 text-primary"
                        )}
                        onClick={() => {
                          setActiveTab(item.value)
                          handleNavigation(item.href)
                        }}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.title}
                      </Button>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Administración</h3>
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-full"
                        onClick={() => {
                          setActiveTab("admin")
                          handleNavigation("/admin")
                        }}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Panel de Admin
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-full"
                      onClick={() => {
                        setActiveTab("settings")
                        handleNavigation("/settings")
                      }}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Configuración
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barra de navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="container max-w-md mx-auto">
          <div className="flex justify-around items-center h-16">
            {navigationItems.slice(0, 5).map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                size="icon"
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full rounded-none",
                  activeTab === item.value && "text-primary"
                )}
                onClick={() => {
                  setActiveTab(item.value)
                  handleNavigation(item.href)
                }}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de acción flotante */}
      {showFloatingAction && (
        <FloatingActionButton
          icon={floatingActionIcon}
          position="bottom-center"
          offset={20}
          variant="gradient"
          animation="float"
          onClick={onFloatingActionClick}
          aria-label="Nueva acción"
        />
      )}
    </>
  )
}
