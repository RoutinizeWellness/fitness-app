"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Search, Loader2, X, Coffee, Utensils, Moon, Apple, ArrowLeft } from "lucide-react"
import { NutritionEntry, FoodItem, MEAL_TYPES } from "@/lib/types/nutrition"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface FoodEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Partial<NutritionEntry>) => Promise<void>
  initialData?: Partial<NutritionEntry>
  initialMealType?: string
  onSearch: (term: string) => Promise<FoodItem[]>
}

export default function FoodEntryDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialMealType,
  onSearch
}: FoodEntryDialogProps) {
  const [step, setStep] = useState<"search" | "details">("search")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  const [formData, setFormData] = useState<Partial<NutritionEntry>>({
    date: new Date().toISOString().split("T")[0],
    meal_type: initialMealType || "desayuno",
    food_name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: "",
    ...initialData
  })

  // Resetear el estado cuando cambia isOpen
  useEffect(() => {
    if (isOpen) {
      setStep(initialData ? "details" : "search")
      setSearchTerm("")
      setSearchResults([])
      setFormData({
        date: new Date().toISOString().split("T")[0],
        meal_type: initialMealType || "desayuno",
        food_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: "",
        ...initialData
      })
    }
  }, [isOpen, initialData, initialMealType])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "calories" || name === "protein" || name === "carbs" || name === "fat"
        ? parseFloat(value) || 0
        : value,
    })
  }

  // Manejar selección de tipo de comida
  const handleMealTypeSelect = (mealType: string) => {
    setFormData({
      ...formData,
      meal_type: mealType
    })
  }

  // Buscar alimentos
  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    try {
      const results = await onSearch(searchTerm)
      setSearchResults(results)
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Seleccionar alimento de los resultados
  const handleSelectFood = (food: FoodItem) => {
    setFormData({
      ...formData,
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    })
    setStep("details")
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Error al guardar alimento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return <Coffee className="h-5 w-5" />
      case "almuerzo":
        return <Utensils className="h-5 w-5" />
      case "cena":
        return <Moon className="h-5 w-5" />
      case "snack":
        return <Apple className="h-5 w-5" />
      default:
        return <Utensils className="h-5 w-5" />
    }
  }

  // Obtener color según el tipo de comida
  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return "bg-[#FDA758] text-white"
      case "almuerzo":
        return "bg-[#5DE292] text-white"
      case "cena":
        return "bg-[#8C80F8] text-white"
      case "snack":
        return "bg-[#FF7285] text-white"
      default:
        return "bg-[#5DE292] text-white"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            {step === "details" && !initialData && (
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-2 hover:bg-gray-100"
                onClick={() => setStep("search")}
              >
                <ArrowLeft className="h-5 w-5 text-[#573353]" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-[#573353]">
              {initialData ? "Editar alimento" : step === "search" ? "Buscar alimento" : "Detalles del alimento"}
            </h2>
            <button 
              className="ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-[#573353]" />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-4">
          {step === "search" ? (
            <div className="space-y-4">
              {/* Buscador */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Buscar alimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                    className="pr-10 rounded-xl border-[#E0E0E0]"
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4 text-[#573353]/70" />
                    </button>
                  )}
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 text-[#573353]/70 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5 text-[#573353]/70" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Resultados de búsqueda */}
              {searchResults.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-[#573353]/70">Resultados ({searchResults.length})</p>
                  {searchResults.map((food) => (
                    <motion.div
                      key={food.id}
                      className="p-3 bg-[#F9F9F9] rounded-xl cursor-pointer hover:bg-[#F5F5F5]"
                      onClick={() => handleSelectFood(food)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-medium text-[#573353]">{food.name}</p>
                      <div className="flex items-center text-xs text-[#573353]/70 mt-1">
                        <span>{food.calories} kcal</span>
                        <span className="mx-1">•</span>
                        <span>P: {food.protein}g</span>
                        <span className="mx-1">•</span>
                        <span>C: {food.carbs}g</span>
                        <span className="mx-1">•</span>
                        <span>G: {food.fat}g</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : searchTerm && !isSearching ? (
                <div className="text-center py-8">
                  <p className="text-[#573353]/70">No se encontraron resultados</p>
                  <button 
                    className="mt-2 text-[#FDA758] font-medium"
                    onClick={() => setStep("details")}
                  >
                    Añadir manualmente
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#573353]/70">Busca un alimento o</p>
                  <button 
                    className="mt-2 text-[#FDA758] font-medium"
                    onClick={() => setStep("details")}
                  >
                    añádelo manualmente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de tipo de comida */}
              <div className="space-y-2">
                <Label className="text-[#573353]">Tipo de comida</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`p-2 rounded-xl flex flex-col items-center ${
                        formData.meal_type === type.value
                          ? getMealColor(type.value)
                          : "bg-[#F9F9F9] text-[#573353]"
                      }`}
                      onClick={() => handleMealTypeSelect(type.value)}
                    >
                      <div className="mb-1">
                        {renderMealIcon(type.value)}
                      </div>
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Selector de fecha */}
              <div className="space-y-2">
                <Label className="text-[#573353]">Fecha</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal rounded-xl border-[#E0E0E0]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#573353]/70" />
                      {formData.date
                        ? format(new Date(formData.date), "EEEE, d 'de' MMMM", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({
                            ...formData,
                            date: date.toISOString().split("T")[0],
                          })
                          setCalendarOpen(false)
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Nombre del alimento */}
              <div className="space-y-2">
                <Label htmlFor="food_name" className="text-[#573353]">Nombre del alimento</Label>
                <Input
                  id="food_name"
                  name="food_name"
                  value={formData.food_name || ""}
                  onChange={handleInputChange}
                  className="rounded-xl border-[#E0E0E0]"
                  required
                />
              </div>
              
              {/* Información nutricional */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-[#573353]">Calorías (kcal)</Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.calories || 0}
                    onChange={handleInputChange}
                    className="rounded-xl border-[#E0E0E0]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-[#573353]">Proteínas (g)</Label>
                  <Input
                    id="protein"
                    name="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein || 0}
                    onChange={handleInputChange}
                    className="rounded-xl border-[#E0E0E0]"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carbs" className="text-[#573353]">Carbohidratos (g)</Label>
                  <Input
                    id="carbs"
                    name="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs || 0}
                    onChange={handleInputChange}
                    className="rounded-xl border-[#E0E0E0]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat" className="text-[#573353]">Grasas (g)</Label>
                  <Input
                    id="fat"
                    name="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat || 0}
                    onChange={handleInputChange}
                    className="rounded-xl border-[#E0E0E0]"
                    required
                  />
                </div>
              </div>
              
              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#573353]">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Añade notas adicionales..."
                  className="resize-none rounded-xl border-[#E0E0E0]"
                />
              </div>
              
              {/* Botones */}
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
