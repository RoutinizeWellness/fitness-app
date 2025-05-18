"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  Home,
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  Users,
  User,
  Watch,
  Menu,
  LogOut,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"

interface NavItem {
  title: string
  value: string
  icon: any
  href?: string
}

export function ImprovedMobileNavigation() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
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
      {/* Navegación inferior fija con animaciones */}
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

      {/* Botón de menú con animación */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-4 right-4 z-50"
        >
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-md bg-background/80 backdrop-blur-sm border-primary/20"
                aria-label="Menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-[385px] p-0 border-l-primary/20">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center space-x-4">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "Usuario"}
                        className="h-12 w-12 rounded-full border-2 border-primary/20"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-lg">{user?.displayName || "Usuario"}</p>
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </AnimatePresence>

      {/* Espaciador para evitar que el contenido quede detrás de la navegación inferior */}
      <div className="pb-16" />
    </>
  )
}
