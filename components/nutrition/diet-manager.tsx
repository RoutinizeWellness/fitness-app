"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  Utensils,
  Plus,
  Trash2,
  Edit,
  Copy,
  Loader2
} from "lucide-react"
import {
  getUserPersonalizedDiets,
  generatePersonalizedDiet,
  DietType
} from "@/lib/diet-ai-service"
import { PersonalizedDiet } from "@/lib/diet-ai-service"
import { getUserDiets } from "@/lib/personalized-diet-service"
import NutritionPlanViewer from "./nutrition-plan-viewer"

interface DietManagerProps {
  userId: string
}

export default function DietManager({ userId }: DietManagerProps) {
  const [diets, setDiets] = useState<PersonalizedDiet[]>([])
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dietType: "standard" as DietType,
    durationDays: "7"
  })
  const { toast } = useToast()

  // Cargar dietas del usuario
  useEffect(() => {
    const loadDiets = async () => {
      setIsLoading(true)
      try {
        // Intentar primero con la nueva API
        const { data: newData, error: newError } = await getUserDiets(userId)

        if (!newError && newData && newData.length > 0) {
          // Transformar datos al formato esperado por el componente
          const formattedDiets = newData.map(diet => ({
            id: diet.id,
            userId: diet.user_id,
            name: diet.name,
            description: diet.description || "",
            dietType: diet.diet_type,
            startDate: diet.start_date,
            endDate: diet.end_date || "",
            calorieTarget: diet.calorie_target || diet.calories_target,
            proteinTarget: diet.protein_target,
            carbsTarget: diet.carbs_target,
            fatTarget: diet.fat_target,
            mealsPerDay: diet.meals_per_day,
            isActive: diet.is_active,
            createdAt: diet.created_at,
            updatedAt: diet.updated_at
          }));
          setDiets(formattedDiets)
        } else {
          // Fallback a la API anterior
          const { data, error } = await getUserPersonalizedDiets(userId)
          if (error) throw error
          setDiets(data || [])
        }
      } catch (error) {
        console.error("Error al cargar dietas personalizadas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las dietas personalizadas",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDiets()
  }, [userId, toast])

  // Función para generar una nueva dieta personalizada
  const handleCreateDiet = async () => {
    setIsGenerating(true)
    try {
      // Mostrar toast de proceso
      toast({
        title: "Generando dieta",
        description: "Estamos creando tu dieta personalizada...",
      })

      // Intentar generar la dieta personalizada
      const { data, error } = await generatePersonalizedDiet(userId, {
        name: formData.name,
        description: formData.description,
        dietType: formData.dietType,
        durationDays: parseInt(formData.durationDays)
      })

      // Verificar si hay error
      if (error) {
        console.error("Error detallado:", error)
        throw error
      }

      // Verificar si tenemos datos
      if (data) {
        // Añadir la nueva dieta a la lista
        setDiets([data, ...diets])

        // Seleccionar la nueva dieta
        setSelectedDiet(data.id)

        // Mostrar mensaje de éxito
        toast({
          title: "Dieta creada",
          description: "La dieta personalizada ha sido creada correctamente"
        })

        // Cerrar el diálogo y resetear el formulario
        setShowCreateDialog(false)
        resetForm()
      } else {
        // Si no hay datos pero tampoco error, mostrar un mensaje genérico
        throw new Error("No se recibieron datos de la dieta")
      }
    } catch (error) {
      console.error("Error al crear dieta personalizada:", error)

      // Mostrar mensaje de error más específico si está disponible
      let errorMessage = "No se pudo crear la dieta personalizada"

      if (error instanceof Error) {
        if (error.message.includes("nutrition_profiles")) {
          errorMessage = "Error con el perfil nutricional. Por favor, completa tu perfil nutricional primero."
        } else if (error.message.includes("permission denied")) {
          errorMessage = "No tienes permisos para crear dietas. Por favor, contacta al soporte."
        } else if (error.message.includes("not found")) {
          errorMessage = "No se encontró alguna tabla necesaria. La aplicación podría necesitar actualizarse."
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })

      // Mantener el diálogo abierto para que el usuario pueda intentarlo de nuevo
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dietType: "standard",
      durationDays: "7"
    })
  }

  // Función para manejar cambios en el formulario
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[50px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    )
  }

  // Si hay una dieta seleccionada, mostrar su detalle
  if (selectedDiet) {
    return (
      <NutritionPlanViewer
        userId={userId}
        dietId={selectedDiet}
        onBack={() => setSelectedDiet(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Dietas Personalizadas</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Dieta
        </Button>
      </div>

      {diets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diets.map((diet) => (
            <Card key={diet.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{diet.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDiet(diet.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {format(new Date(diet.startDate), "dd/MM/yyyy", { locale: es })} -
                  {format(new Date(diet.endDate), "dd/MM/yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {diet.dietType.charAt(0).toUpperCase() + diet.dietType.slice(1)}
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {diet.calorieTarget} kcal
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {diet.mealsPerDay} comidas
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{diet.description}</p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedDiet(diet.id)}
                >
                  Ver detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No tienes dietas personalizadas</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera dieta
          </Button>
        </div>
      )}

      {/* Diálogo para crear nueva dieta */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Dieta Personalizada</DialogTitle>
            <DialogDescription>
              Configura los parámetros para generar una dieta personalizada adaptada a tus necesidades.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la dieta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Dieta equilibrada de verano"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Ej: Dieta equilibrada para mantener peso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietType">Tipo de dieta</Label>
              <Select
                value={formData.dietType}
                onValueChange={(value) => handleChange("dietType", value)}
              >
                <SelectTrigger id="dietType">
                  <SelectValue placeholder="Selecciona tipo de dieta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="vegetarian">Vegetariana</SelectItem>
                  <SelectItem value="vegan">Vegana</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="mediterranean">Mediterránea</SelectItem>
                  <SelectItem value="low_carb">Baja en carbohidratos</SelectItem>
                  <SelectItem value="high_protein">Alta en proteínas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays">Duración (días)</Label>
              <Select
                value={formData.durationDays}
                onValueChange={(value) => handleChange("durationDays", value)}
              >
                <SelectTrigger id="durationDays">
                  <SelectValue placeholder="Selecciona duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 días</SelectItem>
                  <SelectItem value="5">5 días</SelectItem>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="28">28 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDiet}
              disabled={isGenerating || !formData.name}
            >
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generar Dieta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
