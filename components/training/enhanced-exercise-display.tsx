"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Info, 
  Dumbbell, 
  Target, 
  RotateCcw,
  Star,
  Heart
} from "lucide-react"
import { Exercise } from "@/lib/types/training"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Imágenes de alta calidad para ejercicios comunes
const HIGH_QUALITY_IMAGES: Record<string, string[]> = {
  "bench-press": [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534368786749-b63e05c92462?q=80&w=1740&auto=format&fit=crop"
  ],
  "squat": [
    "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=1576&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=1740&auto=format&fit=crop"
  ],
  "deadlift": [
    "https://images.unsplash.com/photo-1598575468023-7e55a5c05e7c?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1738&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598575212896-f8c61e2e9a22?q=80&w=1740&auto=format&fit=crop"
  ],
  "pull-up": [
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=1738&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598266663439-2056e6900338?q=80&w=1740&auto=format&fit=crop"
  ],
  "shoulder-press": [
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1738&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1740&auto=format&fit=crop"
  ],
  "default": [
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1740&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1740&auto=format&fit=crop"
  ]
}

// Función para obtener imágenes de alta calidad para un ejercicio
const getHighQualityImages = (exerciseId: string): string[] => {
  return HIGH_QUALITY_IMAGES[exerciseId] || HIGH_QUALITY_IMAGES.default
}

interface EnhancedExerciseDisplayProps {
  exercise: Exercise
  onAddToFavorites?: () => void
  onAddToRoutine?: () => void
  showActions?: boolean
}

export function EnhancedExerciseDisplay({
  exercise,
  onAddToFavorites,
  onAddToRoutine,
  showActions = true
}: EnhancedExerciseDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Obtener imágenes de alta calidad
  const images = exercise.imageUrl 
    ? [exercise.imageUrl, ...getHighQualityImages(exercise.id).slice(0, 2)]
    : getHighQualityImages(exercise.id)
  
  // Manejar añadir a favoritos
  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite)
    if (onAddToFavorites) {
      onAddToFavorites()
    }
  }
  
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{exercise.name}</CardTitle>
            <CardDescription className="mt-1">
              {exercise.category} • {exercise.difficulty}
            </CardDescription>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className={isFavorite ? "text-red-500" : "text-muted-foreground"}
              onClick={handleAddToFavorites}
            >
              <Heart className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Carrusel de imágenes */}
        <div className="relative w-full h-64 bg-muted">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-64">
                    <Image
                      src={image}
                      alt={`${exercise.name} - vista ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
        
        {/* Pestañas de información */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">General</TabsTrigger>
              <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
              <TabsTrigger value="muscles">Músculos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {exercise.description || "No hay descripción disponible para este ejercicio."}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Equipamiento</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(exercise.equipment) ? (
                    exercise.equipment.map((eq) => (
                      <Badge key={eq} variant="outline">
                        {eq}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">{exercise.equipment}</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Tipo</h3>
                  <Badge variant={exercise.isCompound ? "default" : "secondary"}>
                    {exercise.isCompound ? "Compuesto" : "Aislamiento"}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Dificultad</h3>
                  <Badge 
                    variant="outline" 
                    className={
                      exercise.difficulty === "beginner" 
                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                        : exercise.difficulty === "intermediate" 
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {exercise.difficulty === "beginner" && "Principiante"}
                    {exercise.difficulty === "intermediate" && "Intermedio"}
                    {exercise.difficulty === "advanced" && "Avanzado"}
                  </Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="space-y-4">
              {exercise.instructions ? (
                <ol className="list-decimal list-inside space-y-2">
                  {Array.isArray(exercise.instructions) ? (
                    exercise.instructions.map((step, index) => (
                      <li key={index} className="text-sm">
                        {step}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm">{exercise.instructions}</li>
                  )}
                </ol>
              ) : (
                <div className="text-center py-6">
                  <Info className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No hay instrucciones disponibles para este ejercicio.
                  </p>
                </div>
              )}
              
              {exercise.tips && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Consejos</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {Array.isArray(exercise.tips) ? (
                      exercise.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {tip}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">{exercise.tips}</li>
                    )}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="muscles" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Músculos principales</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(exercise.muscleGroup) ? (
                    exercise.muscleGroup.map((muscle) => (
                      <Badge key={muscle} className="bg-primary/10 text-primary hover:bg-primary/20">
                        {muscle}
                      </Badge>
                    ))
                  ) : (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {exercise.muscleGroup}
                    </Badge>
                  )}
                </div>
              </div>
              
              {exercise.secondary_muscle_groups && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Músculos secundarios</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(exercise.secondary_muscle_groups) ? (
                      exercise.secondary_muscle_groups.map((muscle) => (
                        <Badge key={muscle} variant="outline">
                          {muscle}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">
                        {exercise.secondary_muscle_groups}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Visualización muscular</h3>
                <div className="bg-muted rounded-lg p-4 flex justify-center">
                  <div className="relative w-48 h-64">
                    <Image
                      src={`/images/muscle-maps/${Array.isArray(exercise.muscleGroup) ? exercise.muscleGroup[0].toLowerCase() : exercise.muscleGroup.toLowerCase()}.png`}
                      alt="Mapa muscular"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // Fallback a imagen genérica si no existe
                        (e.target as HTMLImageElement).src = "/images/muscle-maps/default.png"
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between p-4 bg-muted/50">
          <Button variant="outline" onClick={() => window.open(exercise.videoUrl || "https://www.youtube.com/results?search_query=" + exercise.name + " exercise tutorial", "_blank")}>
            <Play className="h-4 w-4 mr-2" />
            Ver tutorial
          </Button>
          
          {onAddToRoutine && (
            <Button onClick={onAddToRoutine}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Añadir a rutina
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
