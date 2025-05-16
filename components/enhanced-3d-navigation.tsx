"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Dumbbell,
  BarChart,
  User,
  Utensils,
  Settings,
  Menu,
  X,
  Heart,
  Moon
} from "lucide-react"

interface NavigationItem {
  title: string
  value: string
  icon: React.ElementType
  href: string
}

interface EnhancedNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Enhanced3DNavigation({ activeTab, setActiveTab }: EnhancedNavigationProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    },
    {
      title: "Coached",
      value: "coached",
      icon: Dumbbell,
      href: "/training/coached",
    },
    {
      title: "Mi Plan",
      value: "my-plan",
      icon: BarChart,
      href: "/training/my-plan",
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

  // Cerrar menú al cambiar de ruta en móvil
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Determinar el tab activo basado en la ruta
  useEffect(() => {
    const currentPath = pathname.split("/")[1]
    const matchedItem = navigationItems.find(
      (item) => item.href.includes(`/${currentPath}`)
    )
    if (matchedItem) {
      setActiveTab(matchedItem.value)
    }
  }, [pathname, setActiveTab])

  return (
    <>
      {/* Navegación de escritorio */}
      {!isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="container flex h-16 items-center">
            <div className="mr-4">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-xl font-bold gradient-text">Routinize</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
              {navigationItems.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  onClick={() => {
                    setActiveTab(item.value);
                    window.location.href = item.href;
                  }}
                  className={cn(
                    "h-9 px-4 text-sm font-medium transition-colors flex items-center gap-2",
                    activeTab === item.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>
              ))}
            </nav>
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Configuración</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navegación móvil */}
      {isMobile && (
        <>
          {/* Botón de menú */}
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 right-4 z-50 rounded-full shadow-md glass-effect"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Menú desplegable */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-background/80 backdrop-blur-md transition-transform duration-300 ease-in-out",
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold gradient-text">Routinize</h2>
                <p className="text-muted-foreground">Tu asistente de fitness</p>
              </div>

              <nav className="flex-1 space-y-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setActiveTab(item.value);
                      setIsMenuOpen(false);
                      window.location.href = item.href;
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full",
                      activeTab === item.value
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Configuración</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Barra de navegación inferior */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-t">
            <div className="grid grid-cols-5 h-16">
              {navigationItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setActiveTab(item.value);
                    window.location.href = item.href;
                  }}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center",
                      activeTab === item.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
