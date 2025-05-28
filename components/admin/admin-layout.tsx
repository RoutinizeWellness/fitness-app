"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Button3D } from "@/components/ui/button-3d"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Shield,
  Users,
  Dumbbell,
  Utensils,
  Moon,
  Brain,
  BarChart,
  Settings,
  LogOut,
  Menu,
  Home,
  Bell,
  MessageSquare,
  User,
  ChevronRight,
  Database,
  FileText,
  Calendar,
  Activity,
  PieChart,
  Zap,
  Layers
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Panel de Administración" }: AdminLayoutProps) {
  const router = useRouter()
  const { user, profile, isAdmin, signOut, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeRoute, setActiveRoute] = useState("")

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (!isLoading && !isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder al panel de administración",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Determinar la ruta activa
    const path = window.location.pathname
    setActiveRoute(path)
  }, [user, isAdmin, isLoading, router])

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  // Simular carga de notificaciones
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        title: "Nueva solicitud de verificación",
        message: "Un entrenador ha solicitado verificación",
        time: "Hace 5 minutos",
        read: false
      },
      {
        id: 2,
        title: "Nuevo usuario registrado",
        message: "Se ha registrado un nuevo usuario en la plataforma",
        time: "Hace 30 minutos",
        read: false
      },
      {
        id: 3,
        title: "Reporte semanal disponible",
        message: "El reporte semanal de actividad está disponible",
        time: "Hace 2 horas",
        read: true
      }
    ])
  }, [])

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PulseLoader message="Cargando panel de administración..." />
      </div>
    )
  }

  // Menú de navegación
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Usuarios",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Entrenamiento",
      href: "/admin/training",
      icon: <Dumbbell className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Nutrición",
      href: "/admin/nutrition",
      icon: <Utensils className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Sueño",
      href: "/admin/sleep",
      icon: <Moon className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Productividad",
      href: "/admin/productivity",
      icon: <Brain className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Analíticas",
      href: "/admin/analytics",
      icon: <BarChart className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Contenido",
      href: "/admin/content",
      icon: <FileText className="h-5 w-5" />,
      badge: null
    },
    {
      name: "Configuración",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      badge: null
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">Admin Panel</span>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeRoute === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <div className={`${activeRoute === item.href ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                  {item.icon}
                </div>
                <span className="ml-3">{item.name}</span>
                {item.badge && (
                  <Badge className="ml-auto" variant="outline">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Admin"} />
              <AvatarFallback>{profile?.full_name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{profile?.full_name || "Administrador"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <Button3D variant="ghost" size="icon" className="ml-auto" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button3D>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button3D variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button3D>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-primary mr-2" />
                      Panel de Administración
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          activeRoute === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={`${activeRoute === item.href ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                          {item.icon}
                        </div>
                        <span className="ml-3">{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-auto" variant="outline">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Admin"} />
                      <AvatarFallback>{profile?.full_name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{profile?.full_name || "Administrador"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <Button3D variant="ghost" size="icon" className="ml-auto" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                    </Button3D>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center ml-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold">Admin</span>
            </div>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button3D variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Button3D>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div className={`w-full p-3 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No hay notificaciones
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Link href="/admin/notifications" className="text-primary text-sm">
                    Ver todas las notificaciones
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button3D variant="ghost" size="icon" className="ml-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Admin"} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                </Button3D>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Desktop header */}
        <header className="hidden md:flex sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 items-center px-6">
          <h1 className="text-xl font-bold">{title}</h1>
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button3D variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Button3D>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div className={`w-full p-3 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No hay notificaciones
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Link href="/admin/notifications" className="text-primary text-sm">
                    Ver todas las notificaciones
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button3D variant="outline" size="sm" onClick={() => router.push("/")}>
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button3D>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 pt-20 md:pt-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
