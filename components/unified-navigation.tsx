"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"
import {
  Home,
  Dumbbell,
  BarChart2,
  Activity,
  Sparkles,
  Calendar,
  Utensils,
  Target,
  Users,
  User,
  Watch,
  Menu,
  Moon,
  Heart,
  LogOut,
  X,
  Brain,
  Settings,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/auth-context"
import { useNotifications } from "@/lib/contexts/notification-context"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NotificationIcon } from "@/components/ui/notification-icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  value: string
  icon: any
  href?: string
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export function UnifiedNavigation() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Detectar scroll para cambiar estilo de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Ya no necesitamos cargar el conteo de notificaciones no leídas
  // porque estamos usando el contexto de notificaciones

  if (!mounted) return null

  const navItems: NavItem[] = [
    {
      title: "Inicio",
      value: "dashboard",
      icon: Home,
      href: "/dashboard"
    },
    {
      title: "Entreno",
      value: "training",
      icon: Dumbbell,
      href: "/training"
    },
    {
      title: "Nutrición",
      value: "nutrition",
      icon: Utensils,
      href: "/nutrition"
    },
    {
      title: "Sueño",
      value: "sleep",
      icon: Moon,
      href: "/sleep"
    },
    {
      title: "Bienestar",
      value: "wellness",
      icon: Heart,
      href: "/wellness"
    },
    {
      title: "Comunidad",
      value: "community",
      icon: Users,
      href: "/community"
    },
    {
      title: "Análisis",
      value: "analytics",
      icon: BarChart2,
      href: "/workout-stats",
      desktopOnly: true
    },
    {
      title: "IA",
      value: "ai",
      icon: Sparkles,
      href: "/ai",
      desktopOnly: true
    },
    {
      title: "Avanzado",
      value: "advanced",
      icon: Brain,
      href: "/advanced-analytics",
      desktopOnly: true
    },
    {
      title: "Perfil",
      value: "profile",
      icon: User,
      href: "/profile"
    },
    {
      title: "Wearables",
      value: "wearables",
      icon: Watch,
      href: "/wearables"
    }
  ]

  // Determinar qué ítem está activo
  const getActiveItem = () => {
    if (!pathname) return "dashboard"

    const path = pathname.split("/")[1]
    const matchingItem = navItems.find(item =>
      item.href && item.href.split("/")[1] === path
    )

    return matchingItem ? matchingItem.value : "dashboard"
  }

  const activeItem = getActiveItem()

  // Navegación inferior para acceso rápido (solo móvil)
  const bottomNavItems = navItems
    .filter(item => !item.desktopOnly)
    .slice(0, 5)

  // Elementos para la navegación de escritorio
  const desktopNavItems = navItems
    .filter(item => !item.mobileOnly)
    .slice(0, 6)

  // Elementos adicionales para el menú desplegable de escritorio
  const desktopDropdownItems = navItems
    .filter(item => !item.mobileOnly)
    .slice(6)

  // Manejar navegación
  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <>
      {/* Barra de navegación superior (escritorio y móvil) */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm border-b"
            : "bg-transparent"
        )}
      >
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-bold">Routinize</span>
            </div>

            {/* Navegación de escritorio */}
            <nav className="hidden md:flex items-center space-x-1">
              {desktopNavItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeItem === item.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => item.href && handleNavigation(item.href)}
                  className={cn(
                    "flex items-center transition-all duration-200",
                    activeItem === item.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  <span>{item.title}</span>
                </Button>
              ))}

              {/* Menú desplegable para opciones adicionales */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4 mr-1" />
                    <span>Más</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {desktopDropdownItems.map((item) => (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => item.href && handleNavigation(item.href)}
                      className={cn(
                        "cursor-pointer",
                        activeItem === item.value && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Perfil y notificaciones */}
            <div className="flex items-center space-x-2">
              {/* Notificaciones */}
              <div className="hidden md:block">
                <NotificationIcon />
              </div>

              {/* Selector de tema */}
              <div className="hidden md:block">
                <ThemeSwitcher />
              </div>

              {/* Perfil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile?.full_name || "Usuario"}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botón de menú móvil */}
              {isMobile && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85%] sm:w-[385px] p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-lg">{profile?.full_name || "Usuario"}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto"
                            onClick={() => setIsOpen(false)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-1 py-2">
                          {navItems.map((item) => (
                            <motion.div
                              key={item.value}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start h-12 px-4",
                                  activeItem === item.value && "bg-primary/10 text-primary font-medium"
                                )}
                                onClick={() => item.href && handleNavigation(item.href)}
                              >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.title}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full h-12"
                          onClick={() => {
                            signOut()
                            setIsOpen(false)
                          }}
                        >
                          <LogOut className="h-5 w-5 mr-2" />
                          Cerrar sesión
                        </Button>

                        <div className="mt-4 flex justify-center">
                          <ThemeSwitcher />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegación inferior móvil con animaciones */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 h-16 shadow-lg">
          <div className="grid grid-cols-5 h-full">
            {bottomNavItems.map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                className={cn(
                  "flex flex-col items-center justify-center rounded-none h-full space-y-1 p-0 relative overflow-hidden",
                  activeItem === item.value ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => item.href && handleNavigation(item.href)}
              >
                {activeItem === item.value && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-200 relative z-10",
                  activeItem === item.value && "scale-110"
                )} />
                <span className="text-xs font-medium relative z-10">{item.title}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Espaciador para evitar que el contenido quede detrás de la navegación */}
      <div className="pt-16" />
      {isMobile && <div className="pb-16" />}
    </>
  )
}
