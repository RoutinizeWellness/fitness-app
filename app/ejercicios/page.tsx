"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { OrganicLayout, OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import UnifiedEjercicios from "@/components/unified-ejercicios"
import {
  Dumbbell,
  Search,
  Filter,
  ChevronRight,
  Heart,
  BarChart,
  Play,
  Plus,
  Info,
  ArrowUpDown,
  ListFilter
} from "lucide-react"

export default function EjerciciosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("ejercicios")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || authLoading) {
    return (
      <OrganicLayout activeTab="training" title="Ejercicios">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </OrganicLayout>
    )
  }

  return (
    <OrganicLayout
      activeTab="training"
      title="Ejercicios"
      profile={user}
      showFloatingAction={true}
      floatingActionIcon={<Plus className="h-6 w-6" />}
      onFloatingActionClick={() => router.push('/ejercicios/new')}
    >
      <OrganicElement type="fade">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Biblioteca de Ejercicios</h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => router.push('/ejercicios/categories')}
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Categorías
          </Button>
        </div>

        <Card organic={true} className="p-6">
          <UnifiedEjercicios
            userId={user?.id || ""}
            isStandalone={true}
            isOrganic={true}
          />
        </Card>
      </OrganicElement>
    </OrganicLayout>
  )
}
