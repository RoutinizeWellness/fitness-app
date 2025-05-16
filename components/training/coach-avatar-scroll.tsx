"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase-client"

interface Coach {
  id: string
  name: string
  avatar_url: string
  specialty?: string
}

interface CoachAvatarScrollProps {
  onCoachSelect?: (coachId: string | null) => void
  className?: string
  showAllOption?: boolean
}

export function CoachAvatarScroll({ 
  onCoachSelect, 
  className,
  showAllOption = true
}: CoachAvatarScrollProps) {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchCoaches() {
      setIsLoading(true)
      try {
        // Intentar cargar entrenadores desde Supabase
        const { data, error } = await supabase
          .from('coaches')
          .select('id, name, avatar_url, specialty')
          .order('name')
        
        if (error) {
          console.error("Error fetching coaches:", error)
          // Cargar datos de ejemplo si hay error
          loadSampleCoaches()
        } else if (data && data.length > 0) {
          setCoaches(data)
        } else {
          // Si no hay datos, cargar ejemplos
          loadSampleCoaches()
        }
      } catch (error) {
        console.error("Error:", error)
        loadSampleCoaches()
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCoaches()
  }, [])
  
  // Cargar datos de ejemplo si no hay datos en Supabase
  const loadSampleCoaches = () => {
    setCoaches([
      { id: 'alexz', name: 'Alexz', avatar_url: '/images/coaches/alexz.jpg', specialty: 'Strength' },
      { id: 'ashley', name: 'Ashley', avatar_url: '/images/coaches/ashley.jpg', specialty: 'Yoga' },
      { id: 'bobby', name: 'Bobby', avatar_url: '/images/coaches/bobby.jpg', specialty: 'HIIT' },
      { id: 'darulk', name: 'Da Rulk', avatar_url: '/images/coaches/darulk.jpg', specialty: 'Functional' },
      { id: 'dan', name: 'Dan', avatar_url: '/images/coaches/dan.jpg', specialty: 'Mobility' },
    ])
  }
  
  const handleCoachSelect = (coachId: string | null) => {
    setSelectedCoach(coachId)
    if (onCoachSelect) {
      onCoachSelect(coachId)
    }
  }
  
  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-2">
          {showAllOption && (
            <div className="flex flex-col items-center">
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCoachSelect(null)}
                className={cn(
                  "relative cursor-pointer",
                  selectedCoach === null && "after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-primary"
                )}
              >
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10",
                  selectedCoach === null ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <svg 
                    viewBox="0 0 24 24" 
                    className="h-8 w-8 text-primary"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M18 20L12 14L6 20" />
                    <path d="M18 14L12 8L6 14" />
                    <path d="M18 8L12 2L6 8" />
                  </svg>
                </div>
                {selectedCoach === null && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white" />
                )}
              </motion.div>
              <span className="mt-1 text-xs font-medium">All</span>
            </div>
          )}
          
          {coaches.map((coach) => (
            <div key={coach.id} className="flex flex-col items-center">
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCoachSelect(coach.id)}
                className={cn(
                  "relative cursor-pointer",
                  selectedCoach === coach.id && "after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-primary"
                )}
              >
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                  <AvatarImage 
                    src={coach.avatar_url} 
                    alt={coach.name}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${coach.name}&background=random`;
                    }}
                  />
                  <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedCoach === coach.id && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white" />
                )}
              </motion.div>
              <span className="mt-1 text-xs font-medium">{coach.name}</span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  )
}
