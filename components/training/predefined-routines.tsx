"use client"

import { useState } from "react"
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  ChevronRight,
  Star,
  Filter,
  Check
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// Tipos para rutinas predefinidas
interface PredefinedRoutine {
  id: string
  name: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  goal: string
  frequency: number
  duration: number
  type: string
  imageUrl: string
}

// Rutinas predefinidas
const PREDEFINED_ROUTINES: PredefinedRoutine[] = [
  {
    id: "ppl-routine",
    name: "Push Pull Legs (PPL)",
    description: "Rutina dividida en empuje, tirón y piernas para un desarrollo muscular completo.",
    level: "intermediate",
    goal: "hypertrophy",
    frequency: 6,
    duration: 60,
    type: "split",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1740&auto=format&fit=crop"
  },
  {
    id: "full-body-3day",
    name: "Full Body 3 días",
    description: "Rutina de cuerpo completo ideal para principiantes o personas con poco tiempo.",
    level: "beginner",
    goal: "strength",
    frequency: 3,
    duration: 45,
    type: "fullbody",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1740&auto=format&fit=crop"
  },
  {
    id: "upper-lower-4day",
    name: "Upper/Lower 4 días",
    description: "Rutina dividida en tren superior e inferior para un buen equilibrio entre frecuencia y volumen.",
    level: "intermediate",
    goal: "strength",
    frequency: 4,
    duration: 60,
    type: "split",
    imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1740&auto=format&fit=crop"
  },
  {
    id: "bodyweight-routine",
    name: "Rutina con peso corporal",
    description: "Rutina completa utilizando solo el peso corporal, ideal para entrenar en casa.",
    level: "beginner",
    goal: "general_fitness",
    frequency: 3,
    duration: 30,
    type: "fullbody",
    imageUrl: "https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=1740&auto=format&fit=crop"
  },
  {
    id: "strength-5x5",
    name: "Programa de Fuerza 5x5",
    description: "Programa clásico de fuerza basado en 5 series de 5 repeticiones con ejercicios compuestos.",
    level: "intermediate",
    goal: "strength",
    frequency: 3,
    duration: 60,
    type: "fullbody",
    imageUrl: "https://images.unsplash.com/photo-1598575468023-7e55a5c05e7c?q=80&w=1740&auto=format&fit=crop"
  },
  {
    id: "hiit-cardio",
    name: "HIIT para pérdida de peso",
    description: "Entrenamiento de alta intensidad por intervalos para maximizar la quema de calorías.",
    level: "intermediate",
    goal: "weight_loss",
    frequency: 4,
    duration: 30,
    type: "cardio",
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1774&auto=format&fit=crop"
  }
]

interface PredefinedRoutinesProps {
  onSelectRoutine: (routine: PredefinedRoutine) => void
}

export function PredefinedRoutines({ onSelectRoutine }: PredefinedRoutinesProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  
  // Filtrar rutinas según los criterios seleccionados
  const filteredRoutines = PREDEFINED_ROUTINES.filter(routine => {
    // Filtrar por tipo (pestaña)
    if (activeTab !== "all" && routine.type !== activeTab) {
      return false
    }
    
    // Filtrar por nivel
    if (selectedLevel && routine.level !== selectedLevel) {
      return false
    }
    
    // Filtrar por objetivo
    if (selectedGoal && routine.goal !== selectedGoal) {
      return false
    }
    
    return true
  })
  
  // Resetear filtros
  const resetFilters = () => {
    setSelectedLevel(null)
    setSelectedGoal(null)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Rutinas Predefinidas</h2>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div>
          <span className="text-sm font-medium mr-2">Nivel:</span>
          <Badge 
            variant={selectedLevel === "beginner" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedLevel(selectedLevel === "beginner" ? null : "beginner")}
          >
            Principiante
          </Badge>{" "}
          <Badge 
            variant={selectedLevel === "intermediate" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedLevel(selectedLevel === "intermediate" ? null : "intermediate")}
          >
            Intermedio
          </Badge>{" "}
          <Badge 
            variant={selectedLevel === "advanced" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedLevel(selectedLevel === "advanced" ? null : "advanced")}
          >
            Avanzado
          </Badge>
        </div>
        
        <div>
          <span className="text-sm font-medium mr-2">Objetivo:</span>
          <Badge 
            variant={selectedGoal === "strength" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGoal(selectedGoal === "strength" ? null : "strength")}
          >
            Fuerza
          </Badge>{" "}
          <Badge 
            variant={selectedGoal === "hypertrophy" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGoal(selectedGoal === "hypertrophy" ? null : "hypertrophy")}
          >
            Hipertrofia
          </Badge>{" "}
          <Badge 
            variant={selectedGoal === "weight_loss" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGoal(selectedGoal === "weight_loss" ? null : "weight_loss")}
          >
            Pérdida de peso
          </Badge>{" "}
          <Badge 
            variant={selectedGoal === "general_fitness" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGoal(selectedGoal === "general_fitness" ? null : "general_fitness")}
          >
            Fitness general
          </Badge>
        </div>
      </div>
      
      {/* Pestañas por tipo de rutina */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="fullbody">Full Body</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredRoutines.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron rutinas</h3>
              <p className="text-muted-foreground mb-4">No hay rutinas que coincidan con los filtros seleccionados</p>
              <Button variant="outline" onClick={resetFilters}>
                Resetear filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoutines.map(routine => (
                <Card key={routine.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-40 w-full">
                    <img 
                      src={routine.imageUrl} 
                      alt={routine.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <Badge className="mb-2">
                        {routine.level === "beginner" && "Principiante"}
                        {routine.level === "intermediate" && "Intermedio"}
                        {routine.level === "advanced" && "Avanzado"}
                      </Badge>
                      <h3 className="text-white text-lg font-bold">{routine.name}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{routine.frequency} días/sem</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>~{routine.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-amber-500" />
                        <span>
                          {routine.goal === "strength" && "Fuerza"}
                          {routine.goal === "hypertrophy" && "Hipertrofia"}
                          {routine.goal === "weight_loss" && "Pérdida de peso"}
                          {routine.goal === "general_fitness" && "Fitness"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => onSelectRoutine(routine)}
                    >
                      Seleccionar rutina
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
