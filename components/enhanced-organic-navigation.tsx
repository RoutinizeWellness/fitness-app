"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, Dumbbell, Utensils, Moon, Heart, 
  Menu, Bell, Search, X, ChevronLeft, 
  Settings, LogOut, User, Shield, Plus,
  BarChart2, Users, Activity, Calendar, Sparkles,
  Brain, Zap, Target, Clipboard, MessageSquare
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
  description?: string
}

interface EnhancedOrganicNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  notifications?: number
  showBackButton?: boolean
  title?: string
  profile?: any
  showFloatingAction?: boolean
  floatingActionIcon?: React.ReactNode
  onFloatingActionClick?: () => void
  isAdmin?: boolean
  isTrainer?: boolean
  isNutritionist?: boolean
}

export function EnhancedOrganicNavigation({
  activeTab,
  setActiveTab,
  notifications = 0,
  showBackButton = false,
  title = "Routinize",
  profile = null,
  showFloatingAction = false,
  floatingActionIcon = <Plus className="h-6 w-6" />,
  onFloatingActionClick,
  isAdmin = false,
  isTrainer = false,
  isNutritionist = false
}: EnhancedOrganicNavigationProps) {
  const router = useRouter()
  const { isDark, animation } = useOrganicTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  // Detectar scroll
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
      description: "Panel principal con resumen de actividades"
    },
    {
      title: "Entreno",
      value: "training",
      icon: Dumbbell,
      href: "/training",
      badge: "Mejorado",
      color: "bg-blue-500",
      description: "Rutinas personalizadas y seguimiento de progreso"
    },
    {
      title: "Nutrición",
      value: "nutrition",
      icon: Utensils,
      href: "/nutrition",
      description: "Plan nutricional y registro de comidas"
    },
    {
      title: "Sueño",
      value: "sleep",
      icon: Moon,
      href: "/sleep",
      description: "Análisis y optimización del descanso"
    },
    {
      title: "Bienestar",
      value: "wellness",
      icon: Heart,
      href: "/wellness",
      description: "Técnicas de recuperación y mindfulness"
    },
  ]

  // Elementos de navegación secundaria
  const secondaryItems: NavigationItem[] = [
    {
      title: "Ejercicios",
      value: "exercises",
      icon: Activity,
      href: "/exercises",
      description: "Biblioteca completa de ejercicios"
    },
    {
      title: "Estadísticas",
      value: "stats",
      icon: BarChart2,
      href: "/stats",
      description: "Análisis detallado de tu progreso"
    },
    {
      title: "Plan",
      value: "plan",
      icon: Calendar,
      href: "/plan",
      description: "Planificación de entrenamientos y comidas"
    },
    {
      title: "Comunidad",
      value: "community",
      icon: Users,
      href: "/community",
      description: "Conecta con otros usuarios"
    },
    {
      title: "Asistente IA",
      value: "ai",
      icon: Sparkles,
      href: "/ai",
      badge: "Nuevo",
      color: "bg-purple-500",
      description: "Recomendaciones personalizadas con IA"
    },
  ]
  
  // Elementos de navegación para profesionales
  const professionalItems: NavigationItem[] = [
    {
      title: "Mis Clientes",
      value: "clients",
      icon: Users,
      href: "/professional/clients",
      description: "Gestión de clientes y seguimiento"
    },
    {
      title: "Recomendaciones",
      value: "recommendations",
      icon: Brain,
      href: "/professional/recommendations",
      badge: "IA",
      color: "bg-purple-500",
      description: "Recomendaciones generadas por IA"
    },
    {
      title: "Mensajes",
      value: "messages",
      icon: MessageSquare,
      href: "/professional/messages",
      description: "Comunicación con clientes"
    },
    {
      title: "Plantillas",
      value: "templates",
      icon: Clipboard,
      href: "/professional/templates",
      description: "Plantillas de entrenamiento y nutrición"
    },
    {
      title: "Análisis",
      value: "analysis",
      icon: Zap,
      href: "/professional/analysis",
      description: "Análisis avanzado de datos de clientes"
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
  
  // Animaciones
  const menuVariants = {
    hidden: { opacity: 0, x: "-100%" },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: "-100%",
      transition: {
        ease: "easeInOut",
        duration: 0.3
      }
    }
  }
  
  const notificationsVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: "100%",
      transition: {
        ease: "easeInOut",
        duration: 0.3
      }
    }
  }
  
  const searchVariants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: "-100%",
      transition: {
        ease: "easeInOut",
        duration: 0.3
      }
    }
  }
  
  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  }

  return (
    <>
      {/* Barra de navegación superior */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-md shadow-sm" 
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

            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || "/placeholder-avatar.png"} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Perfil</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Menú lateral */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-background z-50 shadow-xl"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <span className="text-xl font-bold">Routinize</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                  </Button>
                </div>

                <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
                  <div className="p-4 space-y-6">
                    {/* Perfil del usuario */}
                    {profile && (
                      <div className="profile-card mb-6">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src={profile.avatar_url || "/placeholder-avatar.png"} />
                            <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{profile.full_name || "Usuario"}</h3>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                        </div>
                        
                        {(isAdmin || isTrainer || isNutritionist) && (
                          <div className="flex mt-3 space-x-2">
                            {isAdmin && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                Admin
                              </Badge>
                            )}
                            {isTrainer && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Entrenador
                              </Badge>
                            )}
                            {isNutritionist && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Nutricionista
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Navegación principal</h3>
                      {navigationItems.map((item, i) => (
                        <motion.div
                          key={item.value}
                          custom={i}
                          variants={navItemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Button
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
                          {item.description && (
                            <p className="text-xs text-muted-foreground ml-10 mt-1 mb-2">{item.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Herramientas</h3>
                      {secondaryItems.map((item, i) => (
                        <motion.div
                          key={item.value}
                          custom={i + navigationItems.length}
                          variants={navItemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-full"
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
                          {item.description && (
                            <p className="text-xs text-muted-foreground ml-10 mt-1 mb-2">{item.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Sección para profesionales */}
                    {(isAdmin || isTrainer || isNutritionist) && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Área profesional</h3>
                        {professionalItems.map((item, i) => (
                          <motion.div
                            key={item.value}
                            custom={i + navigationItems.length + secondaryItems.length}
                            variants={navItemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start rounded-full"
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
                            {item.description && (
                              <p className="text-xs text-muted-foreground ml-10 mt-1 mb-2">{item.description}</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-4 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-full"
                        onClick={() => handleNavigation("/settings")}
                      >
                        <Settings className="h-5 w-5 mr-3" />
                        Configuración
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-full"
                        onClick={() => handleNavigation("/auth/logout")}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barra de navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bottom-nav-organic">
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
