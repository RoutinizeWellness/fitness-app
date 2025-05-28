"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StaticNavigation } from "@/components/static-navigation"
import {
  StaticElement as OrganicElement,
  StaticStaggeredList as OrganicStaggeredList
} from "@/components/transitions/static-transitions"
import { Plus } from "lucide-react"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { User } from "@supabase/supabase-js"

interface OrganicLayoutProps {
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
}

export function OrganicLayout({
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
  notifications = 0
}: OrganicLayoutProps) {
  const router = useRouter()
  const { isDark } = useOrganicTheme()
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navegación (usando la versión estática) */}
      <StaticNavigation
        activeTab={currentTab}
        setActiveTab={handleTabChange}
        showBackButton={showBackButton}
        title={title}
        profile={profile}
        showFloatingAction={showFloatingAction}
        floatingActionIcon={floatingActionIcon}
        onFloatingActionClick={onFloatingActionClick}
        notifications={notifications}
      />

      {/* Contenido principal */}
      <main className="flex-1 container max-w-md mx-auto px-4 pt-20 pb-24">
        <OrganicElement type="fade" className="h-full">
          {children}
        </OrganicElement>
      </main>
    </div>
  )
}

// Componente para mostrar una lista de elementos con animación escalonada
interface OrganicListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  direction?: "up" | "down" | "left" | "right"
}

export function OrganicList({
  children,
  className,
  itemClassName,
  direction = "up"
}: OrganicListProps) {
  return (
    <OrganicStaggeredList
      staggerDelay={0.05}
      direction={direction}
      className={className}
      itemClassName={itemClassName}
    >
      {children}
    </OrganicStaggeredList>
  )
}

// Componente para mostrar una sección con título y contenido
interface OrganicSectionProps {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function OrganicSection({
  title,
  children,
  className,
  action
}: OrganicSectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// Componente para mostrar una página vacía con mensaje y acción
interface OrganicEmptyStateProps {
  title: string
  description: string
  icon: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function OrganicEmptyState({
  title,
  description,
  icon,
  action,
  className
}: OrganicEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action}
    </div>
  )
}
