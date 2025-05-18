"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { NutritionEntry, FoodItem, MEAL_TYPES } from "@/lib/types/nutrition"
import { getNutritionEntries, addNutritionEntry, updateNutritionEntry, deleteNutritionEntry } from "@/lib/nutrition-service"
import { searchFoodDatabase, searchFoodApi } from "@/lib/food-database-api"
import DailyNutritionSummary from "./daily-nutrition-summary"
import MealSection from "./meal-section"
import FoodEntryDialog from "./food-entry-dialog"

interface ImprovedFoodDiaryProps {
  userId: string
}

export default function ImprovedFoodDiary({ userId }: ImprovedFoodDiaryProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [nutritionLog, setNutritionLog] = useState<NutritionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null)
  const { toast } = useToast()

  // Cargar entradas de nutrición
  useEffect(() => {
    const loadNutritionEntries = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getNutritionEntries(userId, { date: selectedDate })

        if (error) {
          throw error
        }

        if (data) {
          setNutritionLog(data)
        }
      } catch (error) {
        console.error("Error al cargar entradas de nutrición:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las entradas de nutrición",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionEntries()
  }, [userId, selectedDate, toast])

  // Cambiar a día anterior
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = subDays(currentDate, 1)
    setSelectedDate(previousDay.toISOString().split("T")[0])
  }

  // Cambiar a día siguiente
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = new Date(currentDate)
    nextDay.setDate(currentDate.getDate() + 1)
    
    // No permitir seleccionar fechas futuras
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay.toISOString().split("T")[0])
    }
  }

  // Abrir diálogo para añadir alimento
  const handleAddFood = (mealType: string) => {
    setSelectedMealType(mealType)
    setEditingEntry(null)
    setDialogOpen(true)
  }

  // Abrir diálogo para editar alimento
  const handleEditFood = (entry: NutritionEntry) => {
    setEditingEntry(entry)
    setSelectedMealType(null)
    setDialogOpen(true)
  }

  // Buscar alimentos
  const handleSearchFood = async (term: string): Promise<FoodItem[]> => {
    try {
      // Primero buscar en la base de datos local
      const { data: localResults, error: localError } = await searchFoodDatabase(term)

      if (localError) {
        console.error("Error al buscar en la base de datos local:", localError)
      }

      // Luego buscar en la API externa
      const { data: apiResults, error: apiError } = await searchFoodApi({ query: term })

      if (apiError) {
        console.error("Error al buscar en la API externa:", apiError)
      }

      // Combinar resultados eliminando duplicados por nombre
      const combinedResults = [...(localResults || []), ...(apiResults || [])]
      const uniqueResults = combinedResults.filter((food, index, self) =>
        index === self.findIndex((f) => f.name === food.name)
      )

      return uniqueResults
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
      toast({
        title: "Error",
        description: "No se pudieron buscar alimentos",
        variant: "destructive",
      })
      return []
    }
  }

  // Guardar entrada de alimento
  const handleSaveFood = async (formData: Partial<NutritionEntry>) => {
    try {
      if (editingEntry) {
        // Actualizar entrada existente
        const { data, error } = await updateNutritionEntry(editingEntry.id, {
          ...formData,
          user_id: userId
        })

        if (error) {
          throw error
        }

        toast({
          title: "Actualización exitosa",
          description: "El alimento ha sido actualizado correctamente",
        })

        // Actualizar la lista de entradas
        if (data) {
          setNutritionLog(nutritionLog.map(entry => 
            entry.id === editingEntry.id ? data : entry
          ))
        }
      } else {
        // Añadir nueva entrada
        const { data, error } = await addNutritionEntry({
          ...formData,
          user_id: userId
        })

        if (error) {
          throw error
        }

        toast({
          title: "Registro exitoso",
          description: "El alimento ha sido registrado correctamente",
        })

        // Actualizar la lista de entradas
        if (data && formData.date === selectedDate) {
          setNutritionLog([...nutritionLog, data])
        }
      }
    } catch (error) {
      console.error("Error al guardar alimento:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el alimento",
        variant: "destructive",
      })
      throw error
    }
  }

  // Eliminar entrada de alimento
  const handleDeleteFood = async (id: string) => {
    try {
      const { error } = await deleteNutritionEntry(id)

      if (error) {
        throw error
      }

      toast({
        title: "Eliminación exitosa",
        description: "El alimento ha sido eliminado correctamente",
      })

      // Actualizar la lista de entradas
      setNutritionLog(nutritionLog.filter((entry) => entry.id !== id))
    } catch (error) {
      console.error("Error al eliminar alimento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el alimento",
        variant: "destructive",
      })
    }
  }

  // Agrupar entradas por tipo de comida
  const entriesByMealType = MEAL_TYPES.reduce((acc, mealType) => {
    acc[mealType.value] = nutritionLog.filter(entry => entry.meal_type === mealType.value)
    return acc
  }, {} as Record<string, NutritionEntry[]>)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <Skeleton className="h-[150px] w-full rounded-3xl" />
        <Skeleton className="h-[150px] w-full rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de fecha */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousDay}
          className="rounded-full h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5 text-[#573353]" />
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center rounded-full px-4 py-2 bg-white shadow-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-[#573353]/70" />
              <span className="text-sm font-medium text-[#573353]">
                {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={new Date(selectedDate)}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date.toISOString().split("T")[0])
                  setCalendarOpen(false)
                }
              }}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextDay}
          disabled={new Date(selectedDate).toDateString() === new Date().toDateString()}
          className="rounded-full h-10 w-10"
        >
          <ChevronRight className="h-5 w-5 text-[#573353]" />
        </Button>
      </div>

      {/* Resumen nutricional */}
      <DailyNutritionSummary entries={nutritionLog} />

      {/* Botón para añadir alimento */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          className="w-full flex items-center justify-center gap-2 bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-xl py-6"
          onClick={() => {
            setSelectedMealType(null)
            setEditingEntry(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Añadir alimento</span>
        </Button>
      </motion.div>

      {/* Secciones de comidas */}
      <div className="space-y-4">
        {MEAL_TYPES.map((mealType) => (
          <MealSection
            key={mealType.value}
            mealType={mealType.value}
            mealLabel={mealType.label}
            entries={entriesByMealType[mealType.value] || []}
            onAddFood={handleAddFood}
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
          />
        ))}
      </div>

      {/* Diálogo para añadir/editar alimento */}
      <FoodEntryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveFood}
        initialData={editingEntry || undefined}
        initialMealType={selectedMealType || undefined}
        onSearch={handleSearchFood}
      />
    </div>
  )
}
