"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, Search } from "lucide-react"
import { UnifiedBottomNav } from "@/components/navigation/unified-bottom-nav"
import { useAuth } from "@/lib/contexts/auth-context"
import { NotificationProvider } from "@/lib/contexts/notification-context"
import { Avatar } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface UnifiedLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  showHeader?: boolean
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function UnifiedLayout({
  children,
  title = "Routinize",
  showBackButton = false,
  showHeader = true,
  activeTab = "dashboard",
  onTabChange
}: UnifiedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  // Update active tab when prop changes
  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  // Simular notificaciones no leídas
  useEffect(() => {
    // En una implementación real, esto vendría de un contexto o API
    setUnreadCount(Math.floor(Math.random() * 5))
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF3E9]">
      {/* Header */}
        {showHeader && (
          <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md shadow-sm safe-top">
            <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold font-klasik text-[#1B237E]">{title}</h1>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="relative focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FEA800] rounded-full p-1"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5 text-[#573353]" />
                </button>

                <button
                  className="relative focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FEA800] rounded-full p-1"
                  onClick={() => {
                    if (pathname !== "/notifications") {
                      router.push("/notifications")
                    }
                  }}
                  aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} no leídas` : ''}`}
                >
                  <Bell className="h-5 w-5 text-[#573353]" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 h-4 w-4 bg-[#FF6767] rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                      aria-hidden="true"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (pathname !== "/profile") {
                      router.push("/profile")
                    }
                  }}
                  aria-label="Perfil de usuario"
                  className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FEA800] rounded-full"
                >
                  <Avatar className="h-8 w-8 border-2 border-[#B1AFE9]">
                    <img
                      src={profile?.avatar_url || "/placeholder.svg"}
                      alt={`Foto de perfil de ${profile?.full_name || 'usuario'}`}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </Avatar>
                </button>
              </div>
            </div>
          </header>
        )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 container max-w-md mx-auto px-4 pb-20",
        showHeader ? "pt-20" : "pt-4"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <UnifiedBottomNav
        activeTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B237E] font-klasik">Buscar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar entrenamientos, comidas, ejercicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-[#B1AFE9] focus:ring-[#1B237E]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
                    setIsSearchOpen(false)
                  }
                }}
              />
              <button
                className="px-4 py-2 bg-[#FEA800] text-white rounded-md hover:bg-[#FEA800]/90 transition-colors font-medium"
                onClick={() => {
                  if (searchTerm.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
                    setIsSearchOpen(false)
                  }
                }}
              >
                Buscar
              </button>
            </div>
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2 text-[#573353]">Búsquedas populares:</h4>
              <div className="flex flex-wrap gap-2">
                {["Rutina de fuerza", "Recetas proteicas", "Ejercicios de espalda", "Plan de nutrición"].map((term) => (
                  <button
                    key={term}
                    className="px-3 py-1 bg-[#DDDCFE] text-[#1B237E] rounded-full text-sm hover:bg-[#B1AFE9] transition-colors"
                    onClick={() => {
                      setSearchTerm(term)
                      router.push(`/search?q=${encodeURIComponent(term)}`)
                      setIsSearchOpen(false)
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
