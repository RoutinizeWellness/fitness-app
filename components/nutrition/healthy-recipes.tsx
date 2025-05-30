"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Clock, Utensils, ChevronRight, Heart, MapPin, RefreshCw } from "lucide-react"
import spanishRecipes, { Recipe } from "@/lib/data/spanish-recipes-database"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

// Tipos de datos ya importados desde spanish-recipes-database.ts

// Datos de ejemplo
const sampleRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Bowl de proteínas con quinoa",
    description: "Un nutritivo bowl con quinoa, pollo y vegetales",
    prepTime: 15,
    cookTime: 20,
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 12,
    ingredients: [
      "150g de pechuga de pollo",
      "100g de quinoa",
      "50g de espinacas",
      "1/2 aguacate",
      "1 cucharada de aceite de oliva",
      "Sal y pimienta al gusto"
    ],
    steps: [
      "Cocinar la quinoa según las instrucciones del paquete.",
      "Sazonar el pollo con sal y pimienta, y cocinarlo en una sartén.",
      "Cortar el pollo en trozos y el aguacate en rodajas.",
      "Montar el bowl con la quinoa como base, añadir las espinacas, el pollo y el aguacate.",
      "Aliñar con aceite de oliva y servir."
    ],
    image: "/images/protein-bowl.jpg",
    category: ["almuerzo", "alto en proteínas", "saludable"],
    difficulty: "fácil",
    isFavorite: true
  },
  {
    id: "r2",
    title: "Batido verde energético",
    description: "Batido de espinacas, plátano y proteína para empezar el día",
    prepTime: 5,
    cookTime: 0,
    calories: 280,
    protein: 20,
    carbs: 35,
    fat: 5,
    ingredients: [
      "1 plátano maduro",
      "1 puñado de espinacas",
      "1 cucharada de proteína en polvo",
      "200ml de leche de almendras",
      "1 cucharadita de miel (opcional)"
    ],
    steps: [
      "Añadir todos los ingredientes a la batidora.",
      "Batir hasta conseguir una textura suave.",
      "Servir inmediatamente."
    ],
    image: "/images/green-smoothie.jpg",
    category: ["desayuno", "bebida", "rápido"],
    difficulty: "fácil"
  },
  {
    id: "r3",
    title: "Salmón al horno con verduras",
    description: "Salmón horneado con verduras de temporada",
    prepTime: 10,
    cookTime: 25,
    calories: 380,
    protein: 32,
    carbs: 15,
    fat: 20,
    ingredients: [
      "150g de filete de salmón",
      "1 calabacín",
      "1 pimiento rojo",
      "1 cebolla",
      "2 cucharadas de aceite de oliva",
      "Zumo de 1/2 limón",
      "Hierbas aromáticas",
      "Sal y pimienta"
    ],
    steps: [
      "Precalentar el horno a 180°C.",
      "Cortar las verduras en trozos y colocarlas en una bandeja de horno.",
      "Colocar el salmón sobre las verduras.",
      "Aliñar con aceite, limón, hierbas, sal y pimienta.",
      "Hornear durante 20-25 minutos."
    ],
    image: "/images/salmon-vegetables.jpg",
    category: ["cena", "pescado", "bajo en carbohidratos"],
    difficulty: "media",
    isFavorite: true
  },
  {
    id: "r4",
    title: "Ensalada mediterránea",
    description: "Ensalada fresca con ingredientes mediterráneos",
    prepTime: 15,
    cookTime: 0,
    calories: 320,
    protein: 12,
    carbs: 18,
    fat: 22,
    ingredients: [
      "100g de lechuga mixta",
      "50g de queso feta",
      "10 aceitunas negras",
      "1 tomate",
      "1/2 pepino",
      "1/4 de cebolla roja",
      "2 cucharadas de aceite de oliva",
      "1 cucharada de vinagre balsámico",
      "Orégano, sal y pimienta"
    ],
    steps: [
      "Lavar y cortar todas las verduras.",
      "Desmigar el queso feta.",
      "Mezclar todos los ingredientes en un bol.",
      "Aliñar con aceite, vinagre, orégano, sal y pimienta.",
      "Servir inmediatamente."
    ],
    image: "/images/mediterranean-salad.jpg",
    category: ["almuerzo", "ensalada", "vegetariano"],
    difficulty: "fácil"
  },
  {
    id: "r5",
    title: "Tortilla de espinacas y champiñones",
    description: "Tortilla saludable rica en proteínas y vegetales",
    prepTime: 10,
    cookTime: 15,
    calories: 280,
    protein: 22,
    carbs: 8,
    fat: 18,
    ingredients: [
      "4 huevos",
      "100g de espinacas frescas",
      "100g de champiñones",
      "1 diente de ajo",
      "1 cucharada de aceite de oliva",
      "Sal y pimienta al gusto"
    ],
    steps: [
      "Lavar y picar las espinacas y los champiñones.",
      "Saltear el ajo picado, los champiñones y las espinacas en una sartén con aceite.",
      "Batir los huevos en un recipiente, añadir sal y pimienta.",
      "Añadir las verduras salteadas a los huevos batidos y mezclar.",
      "Verter la mezcla en la sartén y cocinar a fuego medio-bajo hasta que cuaje.",
      "Dar la vuelta y cocinar por el otro lado."
    ],
    image: "/images/spinach-mushroom-omelette.jpg",
    category: ["desayuno", "alto en proteínas", "bajo en carbohidratos", "vegetariano"],
    difficulty: "fácil"
  },
  {
    id: "r6",
    title: "Gachas de avena con frutas",
    description: "Desayuno nutritivo y energético con avena y frutas frescas",
    prepTime: 5,
    cookTime: 10,
    calories: 350,
    protein: 12,
    carbs: 60,
    fat: 8,
    ingredients: [
      "50g de copos de avena",
      "250ml de leche (o bebida vegetal)",
      "1 plátano",
      "Un puñado de frutos rojos",
      "1 cucharada de miel o sirope de arce",
      "1 cucharadita de canela",
      "1 cucharada de semillas de chía (opcional)"
    ],
    steps: [
      "Poner la leche y la avena en un cazo a fuego medio.",
      "Cocinar durante 5-7 minutos, removiendo frecuentemente.",
      "Añadir la canela y la miel, mezclar bien.",
      "Servir en un bowl y decorar con el plátano cortado, los frutos rojos y las semillas de chía."
    ],
    image: "/images/oatmeal-fruits.jpg",
    category: ["desayuno", "vegetariano", "alto en fibra"],
    difficulty: "fácil",
    isFavorite: true
  },
  {
    id: "r7",
    title: "Gazpacho andaluz",
    description: "Sopa fría tradicional española, perfecta para el verano",
    prepTime: 15,
    cookTime: 0,
    calories: 120,
    protein: 3,
    carbs: 15,
    fat: 7,
    ingredients: [
      "6 tomates maduros",
      "1 pepino",
      "1 pimiento verde",
      "1 diente de ajo",
      "100ml de aceite de oliva virgen extra",
      "2 cucharadas de vinagre de Jerez",
      "Sal al gusto",
      "200ml de agua fría"
    ],
    steps: [
      "Lavar y trocear todas las verduras.",
      "Introducir todos los ingredientes en la batidora.",
      "Batir hasta conseguir una textura homogénea.",
      "Colar para eliminar posibles pieles o semillas.",
      "Refrigerar al menos 2 horas antes de servir.",
      "Servir frío con guarnición de verduras picadas."
    ],
    image: "/images/gazpacho.jpg",
    category: ["almuerzo", "cena", "vegetariano", "bajo en calorías", "español"],
    difficulty: "fácil"
  },
  {
    id: "r8",
    title: "Lentejas con verduras",
    description: "Plato tradicional español rico en proteínas vegetales y fibra",
    prepTime: 15,
    cookTime: 40,
    calories: 380,
    protein: 22,
    carbs: 60,
    fat: 5,
    ingredients: [
      "250g de lentejas",
      "1 cebolla",
      "2 zanahorias",
      "1 pimiento rojo",
      "2 dientes de ajo",
      "1 hoja de laurel",
      "1 cucharadita de pimentón dulce",
      "2 cucharadas de aceite de oliva",
      "Sal y pimienta al gusto"
    ],
    steps: [
      "Lavar las lentejas y escurrirlas.",
      "Picar todas las verduras en dados pequeños.",
      "En una olla, calentar el aceite y sofreír la cebolla y el ajo.",
      "Añadir el resto de verduras y sofreír 5 minutos más.",
      "Incorporar las lentejas, el pimentón, el laurel y cubrir con agua.",
      "Cocer a fuego medio durante 30-40 minutos hasta que estén tiernas.",
      "Sazonar con sal y pimienta al final de la cocción."
    ],
    image: "/images/lentils-vegetables.jpg",
    category: ["almuerzo", "cena", "vegetariano", "alto en proteínas", "alto en fibra", "español"],
    difficulty: "media"
  }
]

export default function HealthyRecipes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cargar recetas de Supabase y combinarlas con las recetas locales
  const loadRecipes = async () => {
    setIsLoading(true)

    try {
      // Primero cargar las recetas locales
      const localRecipes = [...sampleRecipes, ...spanishRecipes]

      // Intentar cargar recetas de Supabase
      const { data: supabaseRecipes, error } = await fetch('/api/recipes').then(res => res.json())

      if (error) {
        console.warn('Error al cargar recetas de Supabase:', error)
        // Si hay error, usar solo las recetas locales
        setAllRecipes(localRecipes)
        setFilteredRecipes(localRecipes)
        return
      }

      // Si hay recetas en Supabase, combinarlas con las locales
      if (supabaseRecipes && Array.isArray(supabaseRecipes)) {
        // Crear un Set con los IDs de las recetas de Supabase para evitar duplicados
        const supabaseIds = new Set(supabaseRecipes.map(recipe => recipe.id))

        // Filtrar recetas locales que no estén en Supabase
        const uniqueLocalRecipes = localRecipes.filter(recipe => !supabaseIds.has(recipe.id))

        // Combinar recetas
        const combinedRecipes = [...supabaseRecipes, ...uniqueLocalRecipes]
        setAllRecipes(combinedRecipes)
        setFilteredRecipes(combinedRecipes)
      } else {
        // Si no hay recetas en Supabase, usar solo las recetas locales
        setAllRecipes(localRecipes)
        setFilteredRecipes(localRecipes)
      }
    } catch (error) {
      console.error('Error al cargar recetas:', error)
      // En caso de error, usar solo las recetas locales
      const localRecipes = [...sampleRecipes, ...spanishRecipes]
      setAllRecipes(localRecipes)
      setFilteredRecipes(localRecipes)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar recetas al montar el componente
  useEffect(() => {
    loadRecipes()
  }, [])

  // Filtrar recetas según el término de búsqueda y la categoría seleccionada
  const filterRecipes = (term: string, category: string) => {
    let filtered = allRecipes

    // Filtrar por término de búsqueda
    if (term.trim() !== "") {
      filtered = filtered.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(term.toLowerCase())
        const descriptionMatch = recipe.description.toLowerCase().includes(term.toLowerCase())
        const regionMatch = recipe.region && recipe.region.toLowerCase().includes(term.toLowerCase())

        // Manejar category como array o string
        let categoryMatch = false
        if (Array.isArray(recipe.category)) {
          categoryMatch = recipe.category.some(cat => cat.toLowerCase().includes(term.toLowerCase()))
        } else if (typeof recipe.category === 'string') {
          categoryMatch = recipe.category.toLowerCase().includes(term.toLowerCase())
        }

        return titleMatch || descriptionMatch || categoryMatch || regionMatch
      })
    }

    // Filtrar por categoría
    if (category !== "all") {
      if (category === "favorites") {
        filtered = filtered.filter(recipe => recipe.isFavorite)
      } else if (category === "spanish") {
        filtered = filtered.filter(recipe => recipe.isSpanish)
      } else {
        filtered = filtered.filter(recipe => {
          if (Array.isArray(recipe.category)) {
            return recipe.category.some(cat => cat.toLowerCase() === category.toLowerCase())
          } else if (typeof recipe.category === 'string') {
            return recipe.category.toLowerCase() === category.toLowerCase()
          }
          return false
        })
      }
    }

    setFilteredRecipes(filtered)
  }

  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    filterRecipes(searchTerm, value)
  }

  // Manejar cambio en la búsqueda
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    filterRecipes(term, activeTab)
  }

  // Manejar selección de receta
  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }

  // Manejar cierre de detalle de receta
  const handleCloseRecipeDetail = () => {
    setSelectedRecipe(null)
  }

  // Renderizar detalle de receta
  const renderRecipeDetail = () => {
    if (!selectedRecipe) return null

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={handleCloseRecipeDetail}
          >
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Volver
          </Button>

          <div className="aspect-video bg-gray-200 rounded-lg mb-4">
            {/* Aquí iría la imagen de la receta */}
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Imagen de {selectedRecipe.title}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">{selectedRecipe.title}</h1>
                <p className="text-gray-600">{selectedRecipe.description}</p>
                {selectedRecipe.region && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Región: {selectedRecipe.region}</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <Heart className={`h-5 w-5 ${selectedRecipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedRecipe.category.map((cat, index) => (
                <Badge key={index} variant="secondary">{cat}</Badge>
              ))}
              <Badge variant={selectedRecipe.difficulty === 'fácil' ? 'outline' :
                      selectedRecipe.difficulty === 'media' ? 'secondary' : 'destructive'}>
                {selectedRecipe.difficulty}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-500">Tiempo total</p>
                <p className="font-semibold">{selectedRecipe.prepTime + selectedRecipe.cookTime} min</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Calorías</p>
                <p className="font-semibold">{selectedRecipe.calories} kcal</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Proteínas</p>
                <p className="font-semibold">{selectedRecipe.protein}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Carbos</p>
                <p className="font-semibold">{selectedRecipe.carbs}g</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Ingredientes</h2>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preparación</h2>
              <ol className="space-y-3">
                {selectedRecipe.steps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar recetas..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadRecipes}
          disabled={isLoading}
          title="Actualizar recetas"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Pestañas de categorías */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="desayuno">Desayuno</TabsTrigger>
          <TabsTrigger value="almuerzo">Almuerzo</TabsTrigger>
          <TabsTrigger value="spanish">Españolas</TabsTrigger>
          <TabsTrigger value="favorites">Favoritas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron recetas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRecipes.map(recipe => (
                <Card
                  key={recipe.id}
                  className="bg-white shadow-sm border-none cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleRecipeSelect(recipe)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{recipe.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(recipe.category) ? (
                            <>
                              {recipe.category.slice(0, 2).map((cat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{cat}</Badge>
                              ))}
                              {recipe.category.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{recipe.category.length - 2}</Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <Heart className={`h-5 w-5 mb-2 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {recipe.prepTime + recipe.cookTime} min
                        </div>
                        {recipe.region && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {recipe.region}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
                      <div>
                        <span className="text-gray-500">Calorías:</span> {recipe.calories} kcal
                      </div>
                      <div>
                        <span className="text-gray-500">Proteínas:</span> {recipe.protein}g
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detalle de receta */}
      {selectedRecipe && renderRecipeDetail()}
    </div>
  )
}
