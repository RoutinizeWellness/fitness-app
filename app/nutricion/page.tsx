"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: string
  image_url?: string
}

interface MealEntry {
  id: string
  user_id: string
  date: string
  meal_type: "desayuno" | "almuerzo" | "cena" | "snack"
  food_items: FoodItem[]
  notes?: string
}

const MEAL_TYPES = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

export default function NutricionPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [filteredFoodItems, setFilteredFoodItems] = useState<FoodItem[]>([])
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('desayuno')
  const [selectedFoodItems, setSelectedFoodItems] = useState<FoodItem[]>([])
  const [notes, setNotes] = useState('')
  
  const { toast } = useToast()
  const { user } = useAuth()

  // Datos nutricionales para el día
  const dailyNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  // Calcular totales de nutrientes para el día
  mealEntries.forEach(entry => {
    entry.food_items.forEach(item => {
      dailyNutrition.calories += item.calories
      dailyNutrition.protein += item.protein
      dailyNutrition.carbs += item.carbs
      dailyNutrition.fat += item.fat
    })
  })

  // Datos para el gráfico de macronutrientes
  const macroData = [
    { name: 'Proteínas', value: dailyNutrition.protein * 4 }, // 4 calorías por gramo
    { name: 'Carbohidratos', value: dailyNutrition.carbs * 4 }, // 4 calorías por gramo
    { name: 'Grasas', value: dailyNutrition.fat * 9 }, // 9 calorías por gramo
  ]

  useEffect(() => {
    async function fetchFoodItems() {
      try {
        setLoading(true)
        // En un entorno real, esto obtendría datos de Supabase
        // Por ahora, usaremos datos de ejemplo
        const mockFoodItems: FoodItem[] = [
          {
            id: '1',
            name: 'Pollo a la parrilla',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            serving_size: '100g',
            image_url: '/placeholder.svg?height=80&width=80'
          },
          {
            id: '2',
            name: 'Arroz integral',
            calories: 112,
            protein: 2.3,
            carbs: 23.5,
            fat: 0.8,
            serving_size: '100g',
            image_url: '/placeholder.svg?height=80&width=80'
          },
          {
            id: '3',
            name: 'Aguacate',
            calories: 160,
            protein: 2,
            carbs: 8.5,
            fat: 14.7,
            serving_size: '100g',
            image_url: '/placeholder.svg?height=80&width=80'
          },
          {
            id: '4',
            name: 'Huevo entero',
            calories: 155,
            protein: 12.6,
            carbs: 0.6,
            fat: 10.6,
            serving_size: '100g (2 huevos)',
            image_url: '/placeholder.svg?height=80&width=80'
          },
          {
            id: '5',
            name: 'Salmón',
            calories: 206,
            protein: 22.1,
            carbs: 0,
            fat: 12.4,
            serving_size: '100g',
            image_url: '/placeholder.svg?height=80&width=80'
          },
          {
            id: '6',
            name: 'Brócoli',
            calories: 34,
            protein: 2.8,
            carbs: 6.6,
            fat: 0.4,
            serving_size: '100g',
            image_url: '/placeholder.svg?height=80&width=80'
          },
        ]
        
        setFoodItems(mockFoodItems)
        setFilteredFoodItems(mockFoodItems)
        
        // Ejemplo de entradas de comidas
        const mockMealEntries: MealEntry[] = [
          {
            id: '1',
            user_id: user?.id || '',
            date: selectedDate,
            meal_type: 'desayuno',
            food_items: [mockFoodItems[3], mockFoodItems[2]],
            notes: 'Desayuno saludable'
          },
          {
            id: '2',
            user_id: user?.id || '',
            date: selectedDate,
            meal_type: 'almuerzo',
            food_items: [mockFoodItems[0], mockFoodItems[1], mockFoodItems[5]],
            notes: 'Almuerzo balanceado'
          }
        ]
        
        setMealEntries(mockMealEntries)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching food items:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los alimentos',
          variant: 'destructive',
        })
        setLoading(false)
      }
    }

    fetchFoodItems()
  }, [selectedDate, toast, user])

  useEffect(() => {
    if (searchTerm) {
      setFilteredFoodItems(
        foodItems.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredFoodItems(foodItems)
    }
  }, [searchTerm, foodItems])

  const handleAddMeal = () => {
    if (selectedFoodItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un alimento',
        variant: 'destructive',
      })
      return
    }

    // En un entorno real, esto guardaría en Supabase
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      date: selectedDate,
      meal_type: selectedMealType,
      food_items: selectedFoodItems,
      notes: notes
    }

    setMealEntries([...mealEntries, newMeal])
    setDialogOpen(false)
    setSelectedFoodItems([])
    setNotes('')
    
    toast({
      title: 'Comida registrada',
      description: `Se ha registrado tu ${MEAL_TYPES.find(t => t.value === selectedMealType)?.label.toLowerCase()}`,
    })
  }

  const toggleFoodItemSelection = (item: FoodItem) => {
    if (selectedFoodItems.some(i => i.id === item.id)) {
      setSelectedFoodItems(selectedFoodItems.filter(i => i.id !== item.id))
    } else {
      setSelectedFoodItems([...selectedFoodItems, item])
    }
  }

  const getMealEntriesByType = (type: 'desayuno' | 'almuerzo' | 'cena' | 'snack') => {
    return mealEntries.filter(entry => entry.\
