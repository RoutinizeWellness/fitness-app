"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Dumbbell,
  Utensils,
  BarChart2,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true)

      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          throw new Error("Usuario no autenticado")
        }

        if (user.email !== "admin@routinize.com") {
          toast({
            title: "Acceso denegado",
            description: "Solo el administrador puede acceder a esta sección",
            variant: "destructive"
          })
          router.push("/")
          return
        }

        setUser(user)
      } catch (error) {
        console.error("Error al verificar usuario:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router, toast])

  const handleLogout = async () => {
    try {
      // Use the unified authentication system
      const { supabaseAuth } = await import('@/lib/auth/supabase-auth')
      await supabaseAuth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/admin" },
    { label: "Clientes", icon: Users, href: "/admin/clients" },
    { label: "Entrenamientos", icon: Dumbbell, href: "/admin/training" },
    { label: "Nutrición", icon: Utensils, href: "/admin/nutrition" },
    { label: "Estadísticas", icon: BarChart2, href: "/admin/stats" },
    { label: "Mensajes", icon: MessageSquare, href: "/admin/messages" },
    { label: "Contenido", icon: FileText, href: "/admin/content" },
    { label: "Configuración", icon: Settings, href: "/admin/settings" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Routinize Admin</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Administrador</p>
              <p className="text-sm text-gray-500">admin@routinize.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">Routinize Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push(item.href)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              )
            })}
            <Separator className="my-4" />
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Administrador</p>
                <p className="text-sm text-gray-500">admin@routinize.com</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
