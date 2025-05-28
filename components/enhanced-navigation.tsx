"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Definir el tipo para los elementos de navegación
interface NavItem {
  title: string;
  value: string;
  icon: any;
  href?: string;
}
import { useAuth } from "@/lib/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Home,
  BarChart2,
  Calendar,
  Activity,
  Utensils,
  Users,
  User,
  Menu,
  X,
  Target,
  LogOut,
  Dumbbell,
  Sparkles,
  Briefcase,
  Watch,
  Palette,
  Link as LinkIcon,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function EnhancedNavigation({ activeTab, setActiveTab }: NavigationProps) {
  const { user, profile, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Detectar scroll para cambiar estilo de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems: NavItem[] = [
    {
      title: "Inicio",
      value: "dashboard",
      icon: Home,
    },
    {
      title: "Entrenamientos",
      value: "workout",
      icon: Dumbbell,
    },
    {
      title: "Análisis",
      value: "analytics",
      icon: BarChart2,
    },
    {
      title: "Ejercicios",
      value: "ejercicios",
      icon: Activity,
    },
    {
      title: "IA",
      value: "ai",
      icon: Sparkles,
    },
    {
      title: "Estadísticas",
      value: "stats",
      icon: BarChart2,
      href: "/workout-stats",
    },
    {
      title: "Análisis Avanzado",
      value: "advanced-analytics",
      icon: Brain,
      href: "/advanced-analytics",
    },
    {
      title: "Progreso",
      value: "progress",
      icon: BarChart2,
    },
    {
      title: "Plan",
      value: "plan",
      icon: Calendar,
    },
    {
      title: "Nutrición",
      value: "nutricion",
      icon: Utensils,
      href: "/nutrition",
    },
    {
      title: "Objetivos",
      value: "goals",
      icon: Target,
    },
    {
      title: "Comunidad",
      value: "comunidad",
      icon: Users,
    },
    {
      title: "Mi Entrenador",
      value: "coach",
      icon: User,
      href: "/my-coach",
    },
    {
      title: "Panel Entrenador",
      value: "coach-dashboard",
      icon: Users,
      href: "/coach",
    },
    {
      title: "Wearables",
      value: "wearables",
      icon: Watch,
      href: "/wearables",
    },
    {
      title: "Integraciones",
      value: "integrations",
      icon: LinkIcon,
      href: "/integrations",
    },
    {
      title: "Personalización",
      value: "branding",
      icon: Palette,
      href: "/coach/branding",
    },
  ]

  return (
    <>
      {/* Barra de navegación superior */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        )}
      >
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-bold">Routinize</span>
            </div>

            {/* Navegación de escritorio */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.slice(0, 5).map((item) => (
                item.href ? (
                  <Button
                    key={item.value}
                    variant={activeTab === item.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => window.location.href = item.href!}
                    className={cn(
                      "flex items-center",
                      activeTab === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    <span className="hidden lg:inline">{item.title}</span>
                  </Button>
                ) : (
                  <Button
                    key={item.value}
                    variant={activeTab === item.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      "flex items-center",
                      activeTab === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    <span className="hidden lg:inline">{item.title}</span>
                  </Button>
                )
              ))}

              {/* Menú desplegable para opciones adicionales */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                    <span className="ml-1 hidden lg:inline">Más</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navItems.slice(5).map((item) => (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={cn(
                        "cursor-pointer",
                        activeTab === item.value && "bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Perfil y menú móvil */}
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile?.full_name || "Usuario"}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("goals")}>
                    <Target className="h-4 w-4 mr-2" />
                    Mis objetivos
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/trainer">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Panel del Entrenador
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botón de menú móvil */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className="text-lg font-bold">Routinize</span>
                      </div>
                    </div>

                    <div className="flex-1 py-4">
                      <nav className="space-y-1 px-2">
                        {navItems.map((item) => (
                          item.href ? (
                            <Button
                              key={item.value}
                              variant={activeTab === item.value ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-start",
                                activeTab === item.value ? "bg-primary text-primary-foreground" : ""
                              )}
                              onClick={() => window.location.href = item.href!}
                            >
                              <item.icon className="h-4 w-4 mr-2" />
                              {item.title}
                            </Button>
                          ) : (
                            <Button
                              key={item.value}
                              variant={activeTab === item.value ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-start",
                                activeTab === item.value ? "bg-primary text-primary-foreground" : ""
                              )}
                              onClick={() => setActiveTab(item.value)}
                            >
                              <item.icon className="h-4 w-4 mr-2" />
                              {item.title}
                            </Button>
                          )
                        ))}
                      </nav>
                    </div>

                    <div className="p-4 border-t">
                      {profile && (
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{profile.full_name || "Usuario"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("profile")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Mi perfil
                      </Button>

                      {profile?.is_admin && (
                        <Link href="/trainer" className="block mt-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Briefcase className="h-4 w-4 mr-2" />
                            Panel del Entrenador
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start mt-2"
                        onClick={() => signOut()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación inferior móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
        <div className="grid grid-cols-5 h-16">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.value}
              className={cn(
                "flex flex-col items-center justify-center space-y-1",
                activeTab === item.value ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => item.href ? window.location.href = item.href! : setActiveTab(item.value)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
