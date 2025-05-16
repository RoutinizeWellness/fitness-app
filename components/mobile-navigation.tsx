"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
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
  Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"

interface NavItem {
  title: string
  value: string
  icon: any
  href?: string
}

export function MobileNavigation() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isMobile) return null

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

  // Navegación inferior para acceso rápido
  const bottomNavItems = navItems.slice(0, 5)

  // Manejar navegación
  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <>
      {/* Navegación inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 h-16">
        <div className="grid grid-cols-5 h-full">
          {bottomNavItems.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center rounded-none h-full space-y-1 p-0",
                activeItem === item.value && "bg-primary/10 text-primary"
              )}
              onClick={() => item.href && handleNavigation(item.href)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Menú completo */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 right-4 z-50"
            aria-label="Menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85%] sm:w-[385px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Usuario"}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{user?.displayName || "Usuario"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.value}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      activeItem === item.value && "bg-primary/10 text-primary"
                    )}
                    onClick={() => item.href && handleNavigation(item.href)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Implementar cierre de sesión
                  setIsOpen(false)
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Espaciador para evitar que el contenido quede detrás de la navegación inferior */}
      <div className="pb-16" />
    </>
  )
}
