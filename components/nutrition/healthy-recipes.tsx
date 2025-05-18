"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Clock, Utensils, ChevronRight, Heart } from "lucide-react"

// Tipos de datos
interface Recipe {
  id: string
  title: string
  description: string
  prepTime: number
  cookTime: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  steps: string[]
  image: string
  category: string[]
  difficulty: "fácil" | "media" | "difícil"
  isFavorite?: boolean
}

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
  }
]

export default function HealthyRecipes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(sampleRecipes)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Filtrar recetas según el término de búsqueda y la categoría seleccionada
  const filterRecipes = (term: string, category: string) => {
    let filtered = sampleRecipes

    // Filtrar por término de búsqueda
    if (term.trim() !== "") {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(term.toLowerCase()) ||
        recipe.description.toLowerCase().includes(term.toLowerCase()) ||
        recipe.category.some(cat => cat.toLowerCase().includes(term.toLowerCase()))
      )
    }

    // Filtrar por categoría
    if (category !== "all") {
      if (category === "favorites") {
        filtered = filtered.filter(recipe => recipe.isFavorite)
      } else {
        filtered = filtered.filter(recipe => 
          recipe.category.some(cat => cat.toLowerCase() === category.toLowerCase())
        )
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar recetas..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Pestañas de categorías */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="desayuno">Desayuno</TabsTrigger>
          <TabsTrigger value="almuerzo">Almuerzo</TabsTrigger>
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
                          {recipe.category.slice(0, 2).map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{cat}</Badge>
                          ))}
                          {recipe.category.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{recipe.category.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <Heart className={`h-5 w-5 mb-2 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {recipe.prepTime + recipe.cookTime} min
                        </div>
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
