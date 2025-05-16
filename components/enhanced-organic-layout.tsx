"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedOrganicNavigation } from "@/components/enhanced-organic-navigation"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Plus } from "lucide-react"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface EnhancedOrganicLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  showHeader?: boolean
  profile?: User | null
  activeTab?: string
  onTabChange?: (tab: string) => void
  showFloatingAction?: boolean
  floatingActionIcon?: React.ReactNode
  onFloatingActionClick?: () => void
  notifications?: number
  isAdmin?: boolean
  isTrainer?: boolean
  isNutritionist?: boolean
  className?: string
  fullWidth?: boolean
}

export function EnhancedOrganicLayout({
  children,
  title = "Routinize",
  showBackButton = false,
  showHeader = true,
  profile = null,
  activeTab = "dashboard",
  onTabChange,
  showFloatingAction = false,
  floatingActionIcon = <Plus className="h-6 w-6" />,
  onFloatingActionClick,
  notifications = 0,
  isAdmin = false,
  isTrainer = false,
  isNutritionist = false,
  className,
  fullWidth = false
}: EnhancedOrganicLayoutProps) {
  const router = useRouter()
  const { isDark, animation } = useOrganicTheme()
  const [currentTab, setCurrentTab] = useState(activeTab)
  
  // Actualizar el tab activo cuando cambia la prop
  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])
  
  // Manejar cambio de tab
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }
  
  // Determinar si se deben usar animaciones
  const shouldAnimate = animation !== "none"
  
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <EnhancedOrganicNavigation
          activeTab={currentTab}
          setActiveTab={handleTabChange}
          notifications={notifications}
          showBackButton={showBackButton}
          title={title}
          profile={profile}
          showFloatingAction={showFloatingAction}
          floatingActionIcon={floatingActionIcon}
          onFloatingActionClick={onFloatingActionClick}
          isAdmin={isAdmin}
          isTrainer={isTrainer}
          isNutritionist={isNutritionist}
        />
      )}
      
      <main className={cn(
        "pt-20 pb-20",
        fullWidth ? "px-4" : "container px-4 max-w-md mx-auto",
        className
      )}>
        {shouldAnimate ? (
          <OrganicElement type="fade">
            {children}
          </OrganicElement>
        ) : (
          children
        )}
      </main>
      
      {/* Indicador de modo admin */}
      {isAdmin && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-center py-1 text-xs font-medium">
          Modo Administrador
        </div>
      )}
      
      {/* Indicador de modo entrenador */}
      {isTrainer && !isAdmin && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-1 text-xs font-medium">
          Modo Entrenador
        </div>
      )}
      
      {/* Indicador de modo nutricionista */}
      {isNutritionist && !isAdmin && !isTrainer && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-1 text-xs font-medium">
          Modo Nutricionista
        </div>
      )}
    </div>
  )
}
