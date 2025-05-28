"use client"

import { useState, useEffect } from "react"
import { OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Moon,
  Calendar,
  BarChart,
  PlusCircle,
  Clock,
  ChevronRight,
  Bed,
  Sunrise,
  Sunset,
  AlarmClock,
  BarChart2,
  Zap,
  Lightbulb,
  Smartphone,
  Target,
  Plus
} from "lucide-react"
import { SleepModule } from "@/components/modules/sleep-module"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

export default function SleepPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const { toast } = useToast()

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)

        // Obtener perfil del usuario
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
    }

    fetchUser()
  }, [])

  return (
    <OrganicElement type="fade">
      <SleepModule
        profile={profile}
        isAdmin={false}
        onNavigate={(path) => console.log(`Navegando a: ${path}`)}
      />
    </OrganicElement>
  )
}
