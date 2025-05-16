"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  Search, 
  Filter, 
  Dumbbell, 
  Play, 
  Bookmark, 
  Share2, 
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Flame,
  BarChart2,
  Target,
  Zap
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface Exercise {
  id: string
  name: string
  description: string
  muscle_group: string
  secondary_muscles: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric'
  video_url: string
  thumbnail_url: string
  instructions: string[]
  tips: string[]
  variations: string[]
  metrics: {
    calories_per_minute?: number
    average_duration?: number
    intensity?: number // 1-10
  }
  tags: string[]
}

interface FilterOptions {
  muscleGroups: string[]
  equipment: string[]
  difficulty: string[]
  category: string[]
}

export default function ExerciseLibrary() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    category: []
  })
  
  // Available filter values
  const muscleGroups = [
    "Chest", "Back", "Shoulders", "Biceps", "Triceps", 
    "Quadriceps", "Hamstrings", "Glutes", "Calves", "Abs", 
    "Forearms", "Neck", "Full Body"
  ]
  
  const equipmentOptions = [
    "Bodyweight", "Dumbbells", "Barbell", "Kettlebell", 
    "Resistance Bands", "Cable Machine", "Smith Machine", 
    "TRX/Suspension", "Medicine Ball", "Stability Ball", 
    "Bench", "Pull-up Bar", "Treadmill", "Stationary Bike", 
    "Rowing Machine", "Elliptical", "No Equipment"
  ]
  
  const difficultyOptions = ["beginner", "intermediate", "advanced", "expert"]
  
  const categoryOptions = ["strength", "cardio", "flexibility", "balance", "plyometric"]
  
  // Load exercises
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)
      
      try {
        // Load exercises from Supabase
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
        
        if (error) {
          throw error
        }
        
        if (data) {
          setExercises(data as Exercise[])
          setFilteredExercises(data as Exercise[])
        } else {
          // If no data, use sample exercises
          generateSampleExercises()
        }
        
        // Load user favorites if logged in
        if (user) {
          const { data: favData, error: favError } = await supabase
            .from('user_favorites')
            .select('exercise_ids')
            .eq('user_id', user.id)
            .single()
          
          if (!favError && favData) {
            setFavorites(favData.exercise_ids || [])
          }
        }
      } catch (error) {
        console.error("Error loading exercises:", error)
        // Generate sample exercises in case of error
        generateSampleExercises()
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExercises()
  }, [user])
  
  // Generate sample exercises for development/testing
  const generateSampleExercises = () => {
    const sampleExercises: Exercise[] = [
      {
        id: "ex1",
        name: "Barbell Bench Press",
        description: "A compound exercise that targets the chest, shoulders, and triceps.",
        muscle_group: "Chest",
        secondary_muscles: ["Shoulders", "Triceps"],
        equipment: ["Barbell", "Bench"],
        difficulty: "intermediate",
        category: "strength",
        video_url: "https://example.com/videos/bench-press.mp4",
        thumbnail_url: "https://example.com/thumbnails/bench-press.jpg",
        instructions: [
          "Lie on a flat bench with your feet flat on the floor.",
          "Grip the barbell slightly wider than shoulder-width apart.",
          "Unrack the barbell and lower it to your mid-chest.",
          "Press the barbell back up to the starting position.",
          "Repeat for the desired number of repetitions."
        ],
        tips: [
          "Keep your wrists straight and elbows at a 45-degree angle.",
          "Maintain a slight arch in your lower back.",
          "Keep your feet flat on the floor for stability."
        ],
        variations: [
          "Incline Bench Press",
          "Decline Bench Press",
          "Close-Grip Bench Press"
        ],
        metrics: {
          calories_per_minute: 8,
          average_duration: 45,
          intensity: 7
        },
        tags: ["compound", "push", "upper body"]
      },
      {
        id: "ex2",
        name: "Pull-up",
        description: "A compound exercise that targets the back, biceps, and shoulders.",
        muscle_group: "Back",
        secondary_muscles: ["Biceps", "Shoulders", "Forearms"],
        equipment: ["Pull-up Bar"],
        difficulty: "intermediate",
        category: "strength",
        video_url: "https://example.com/videos/pull-up.mp4",
        thumbnail_url: "https://example.com/thumbnails/pull-up.jpg",
        instructions: [
          "Hang from a pull-up bar with your hands slightly wider than shoulder-width apart.",
          "Pull yourself up until your chin is above the bar.",
          "Lower yourself back down with control.",
          "Repeat for the desired number of repetitions."
        ],
        tips: [
          "Engage your core throughout the movement.",
          "Avoid swinging or kipping.",
          "Focus on squeezing your shoulder blades together at the top."
        ],
        variations: [
          "Chin-up",
          "Wide-grip Pull-up",
          "Neutral-grip Pull-up"
        ],
        metrics: {
          calories_per_minute: 10,
          average_duration: 30,
          intensity: 8
        },
        tags: ["compound", "pull", "upper body", "bodyweight"]
      },
      {
        id: "ex3",
        name: "Squat",
        description: "A compound exercise that targets the quadriceps, hamstrings, and glutes.",
        muscle_group: "Quadriceps",
        secondary_muscles: ["Hamstrings", "Glutes", "Calves", "Core"],
        equipment: ["Bodyweight"],
        difficulty: "beginner",
        category: "strength",
        video_url: "https://example.com/videos/squat.mp4",
        thumbnail_url: "https://example.com/thumbnails/squat.jpg",
        instructions: [
          "Stand with your feet shoulder-width apart.",
          "Lower your body by bending your knees and hips, as if sitting in a chair.",
          "Keep your chest up and back straight.",
          "Lower until your thighs are parallel to the ground or as low as comfortable.",
          "Push through your heels to return to the starting position.",
          "Repeat for the desired number of repetitions."
        ],
        tips: [
          "Keep your knees in line with your toes.",
          "Maintain a neutral spine throughout the movement.",
          "Push through your heels, not your toes."
        ],
        variations: [
          "Barbell Squat",
          "Front Squat",
          "Goblet Squat",
          "Bulgarian Split Squat"
        ],
        metrics: {
          calories_per_minute: 9,
          average_duration: 40,
          intensity: 7
        },
        tags: ["compound", "lower body", "functional"]
      }
    ]
    
    setExercises(sampleExercises)
    setFilteredExercises(sampleExercises)
  }
  
  // Filter exercises based on search query and filters
  useEffect(() => {
    let filtered = [...exercises]
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(query) ||
        exercise.description.toLowerCase().includes(query) ||
        exercise.muscle_group.toLowerCase().includes(query) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "favorites") {
        filtered = filtered.filter(exercise => favorites.includes(exercise.id))
      } else {
        filtered = filtered.filter(exercise => exercise.muscle_group.toLowerCase() === activeTab)
      }
    }
    
    // Apply additional filters
    if (filterOptions.muscleGroups.length > 0) {
      filtered = filtered.filter(exercise => 
        filterOptions.muscleGroups.includes(exercise.muscle_group) ||
        exercise.secondary_muscles.some(muscle => filterOptions.muscleGroups.includes(muscle))
      )
    }
    
    if (filterOptions.equipment.length > 0) {
      filtered = filtered.filter(exercise => 
        exercise.equipment.some(eq => filterOptions.equipment.includes(eq))
      )
    }
    
    if (filterOptions.difficulty.length > 0) {
      filtered = filtered.filter(exercise => 
        filterOptions.difficulty.includes(exercise.difficulty)
      )
    }
    
    if (filterOptions.category.length > 0) {
      filtered = filtered.filter(exercise => 
        filterOptions.category.includes(exercise.category)
      )
    }
    
    setFilteredExercises(filtered)
  }, [searchQuery, activeTab, filterOptions, exercises, favorites])
  
  // Toggle filter selection
  const toggleFilter = (type: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => {
      const current = [...prev[type]]
      
      if (current.includes(value)) {
        return {
          ...prev,
          [type]: current.filter(item => item !== value)
        }
      } else {
        return {
          ...prev,
          [type]: [...current, value]
        }
      }
    })
  }
  
  // Clear all filters
  const clearFilters = () => {
    setFilterOptions({
      muscleGroups: [],
      equipment: [],
      difficulty: [],
      category: []
    })
    setSearchQuery("")
  }
  
  // Toggle favorite
  const toggleFavorite = async (exerciseId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar ejercicios favoritos",
        variant: "default",
      })
      return
    }
    
    try {
      let newFavorites = [...favorites]
      
      if (favorites.includes(exerciseId)) {
        // Remove from favorites
        newFavorites = favorites.filter(id => id !== exerciseId)
      } else {
        // Add to favorites
        newFavorites = [...favorites, exerciseId]
      }
      
      // Update state
      setFavorites(newFavorites)
      
      // Update in database
      const { error } = await supabase
        .from('user_favorites')
        .upsert({
          user_id: user.id,
          exercise_ids: newFavorites,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
    } catch (error) {
      console.error("Error updating favorites:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tus favoritos",
        variant: "destructive",
      })
    }
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Ejercicios</h2>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Ejercicios</h2>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="search"
          placeholder="Buscar ejercicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {showFilters && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Grupo Muscular</h4>
                <div className="h-40 overflow-y-auto space-y-1 pr-2">
                  {muscleGroups.map((muscle) => (
                    <div key={muscle} className="flex items-center space-x-2">
                      <Checkbox
                        id={`muscle-${muscle}`}
                        checked={filterOptions.muscleGroups.includes(muscle)}
                        onCheckedChange={(checked) => 
                          toggleFilter('muscleGroups', muscle)
                        }
                      />
                      <Label htmlFor={`muscle-${muscle}`}>{muscle}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Equipamiento</h4>
                <div className="h-40 overflow-y-auto space-y-1 pr-2">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${equipment}`}
                        checked={filterOptions.equipment.includes(equipment)}
                        onCheckedChange={(checked) => 
                          toggleFilter('equipment', equipment)
                        }
                      />
                      <Label htmlFor={`equipment-${equipment}`}>{equipment}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Dificultad</h4>
                <div className="space-y-1">
                  {difficultyOptions.map((difficulty) => (
                    <div key={difficulty} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${difficulty}`}
                        checked={filterOptions.difficulty.includes(difficulty)}
                        onCheckedChange={(checked) => 
                          toggleFilter('difficulty', difficulty)
                        }
                      />
                      <Label htmlFor={`difficulty-${difficulty}`} className="capitalize">
                        {difficulty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Categoría</h4>
                <div className="space-y-1">
                  {categoryOptions.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filterOptions.category.includes(category)}
                        onCheckedChange={(checked) => 
                          toggleFilter('category', category)
                        }
                      />
                      <Label htmlFor={`category-${category}`} className="capitalize">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex overflow-x-auto pb-2 mb-2">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="chest">Pecho</TabsTrigger>
          <TabsTrigger value="back">Espalda</TabsTrigger>
          <TabsTrigger value="shoulders">Hombros</TabsTrigger>
          <TabsTrigger value="arms">Brazos</TabsTrigger>
          <TabsTrigger value="legs">Piernas</TabsTrigger>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={exercise.thumbnail_url || "https://via.placeholder.com/400x225?text=Exercise+Thumbnail"}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 rounded-full"
                    onClick={() => toggleFavorite(exercise.id)}
                  >
                    <Bookmark className={`h-5 w-5 ${favorites.includes(exercise.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>
                    {exercise.description.length > 100
                      ? `${exercise.description.substring(0, 100)}...`
                      : exercise.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">{exercise.muscle_group}</Badge>
                    {exercise.secondary_muscles.slice(0, 2).map((muscle) => (
                      <Badge key={muscle} variant="outline">{muscle}</Badge>
                    ))}
                    {exercise.secondary_muscles.length > 2 && (
                      <Badge variant="outline">+{exercise.secondary_muscles.length - 2}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {exercise.equipment.map((eq) => (
                      <Badge key={eq} variant="outline" className="bg-gray-100">{eq}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedExercise(exercise)}>
                        Ver detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      {selectedExercise && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-xl">{selectedExercise.name}</DialogTitle>
                            <DialogDescription>
                              {selectedExercise.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={selectedExercise.thumbnail_url || "https://via.placeholder.com/400x225?text=Exercise+Video"}
                                alt={selectedExercise.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-1">Grupos Musculares</h4>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="secondary">{selectedExercise.muscle_group}</Badge>
                                  {selectedExercise.secondary_muscles.map((muscle) => (
                                    <Badge key={muscle} variant="outline">{muscle}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">Equipamiento</h4>
                                <div className="flex flex-wrap gap-1">
                                  {selectedExercise.equipment.map((eq) => (
                                    <Badge key={eq} variant="outline">{eq}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                  <Flame className="h-5 w-5 text-orange-500 mb-1" />
                                  <span className="text-sm font-medium">
                                    {selectedExercise.metrics.calories_per_minute || "~"} cal/min
                                  </span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                  <Clock className="h-5 w-5 text-blue-500 mb-1" />
                                  <span className="text-sm font-medium">
                                    {selectedExercise.metrics.average_duration || "~"} seg
                                  </span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                  <Zap className="h-5 w-5 text-yellow-500 mb-1" />
                                  <span className="text-sm font-medium">
                                    Intensidad: {selectedExercise.metrics.intensity || "~"}/10
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Instrucciones</h4>
                              <ol className="list-decimal pl-5 space-y-1">
                                {selectedExercise.instructions.map((instruction, index) => (
                                  <li key={index}>{instruction}</li>
                                ))}
                              </ol>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Consejos</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {selectedExercise.tips.map((tip, index) => (
                                  <li key={index}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Variaciones</h4>
                              <div className="flex flex-wrap gap-1">
                                {selectedExercise.variations.map((variation) => (
                                  <Badge key={variation} variant="outline">{variation}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Compartir</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Copiar enlace</DropdownMenuItem>
                      <DropdownMenuItem>Compartir en WhatsApp</DropdownMenuItem>
                      <DropdownMenuItem>Compartir en Twitter</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Info className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">No se encontraron ejercicios</h3>
              <p className="text-gray-500 text-center mb-4">
                No hay ejercicios que coincidan con tus criterios de búsqueda.
              </p>
              <Button onClick={clearFilters}>Limpiar filtros</Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
