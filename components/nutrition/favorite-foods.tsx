"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  Heart,
  RefreshCw,
  Plus,
  Minus,
  Info,
  AlertTriangle,
  Apple,
  ShoppingCart
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { FoodItem } from "@/lib/types/nutrition"
import { getFavoriteFoods, toggleFavoriteFood } from "@/lib/favorite-foods-service"
import { useNutritionContext } from "@/lib/contexts/nutrition-context"

interface FavoriteFoodsProps {
  onSelectFood?: (food: FoodItem) => void;
  className?: string;
}

export function FavoriteFoods({ onSelectFood, className }: FavoriteFoodsProps) {
  // Using auth context instead of next-auth
  const session = { user: { id: "current-user" } } // Placeholder - replace with actual auth context
  const { toast } = useToast()
  const { addFoodToLog } = useNutritionContext()

  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([])

  // Cargar alimentos favoritos
  const loadFavoriteFoods = async () => {
    if (!session?.user?.id) {
      setError("Debes iniciar sesión para ver tus alimentos favoritos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await getFavoriteFoods(session.user.id)

      if (error) {
        throw new Error(error)
      }

      setFavoriteFoods(data)
      setFilteredFoods(data)
    } catch (error) {
      console.error("Error al cargar alimentos favoritos:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      toast({
        title: "Error",
        description: "No se pudieron cargar tus alimentos favoritos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar favoritos al montar el componente
  useEffect(() => {
    if (session?.user?.id) {
      loadFavoriteFoods()
    }
  }, [session])

  // Filtrar alimentos según el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFoods(favoriteFoods)
      return
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    const filtered = favoriteFoods.filter(food =>
      food.name.toLowerCase().includes(normalizedSearchTerm) ||
      (food.brand && food.brand.toLowerCase().includes(normalizedSearchTerm)) ||
      (food.category && food.category.toLowerCase().includes(normalizedSearchTerm))
    )

    setFilteredFoods(filtered)
  }, [searchTerm, favoriteFoods])

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  // Eliminar un alimento de favoritos
  const handleRemoveFromFavorites = async (food: FoodItem) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para eliminar favoritos",
        variant: "destructive",
      })
      return
    }

    try {
      const { success, error } = await toggleFavoriteFood(food.id, false, session.user.id)

      if (!success) {
        throw new Error(error || "Error al eliminar de favoritos")
      }

      // Actualizar la lista de favoritos
      setFavoriteFoods(prev => prev.filter(item => item.id !== food.id))
      setFilteredFoods(prev => prev.filter(item => item.id !== food.id))

      toast({
        title: "Eliminado de favoritos",
        description: `"${food.name}" ha sido eliminado de tus favoritos`,
      })
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error)

      toast({
        title: "Error",
        description: "No se pudo eliminar el alimento de favoritos",
        variant: "destructive",
      })
    }
  }

  // Añadir alimento al registro de comidas
  const handleAddToLog = (food: FoodItem) => {
    addFoodToLog(food)

    toast({
      title: "Alimento añadido",
      description: `"${food.name}" ha sido añadido a tu registro`,
    })
  }

  // Seleccionar un alimento
  const handleSelectFood = (food: FoodItem) => {
    if (onSelectFood) {
      onSelectFood(food)
    }
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Alimentos Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-center">
            <div>
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadFavoriteFoods} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Alimentos Favoritos
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFavoriteFoods}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Tus alimentos favoritos para acceso rápido
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar en favoritos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Lista de alimentos favoritos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? (
              <p>No se encontraron alimentos que coincidan con "{searchTerm}"</p>
            ) : (
              <div>
                <p className="mb-2">No tienes alimentos favoritos</p>
                <p className="text-sm">Añade alimentos a favoritos para acceder rápidamente a ellos</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4" onClick={() => handleSelectFood(food)}>
                  <div className="flex items-center">
                    <h4 className="font-medium truncate">{food.name}</h4>
                    {food.brand && (
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        {food.brand}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="truncate">
                      {food.calories} kcal | {food.protein}g P | {food.carbs}g C | {food.fat}g G
                    </span>
                  </div>
                  <div className="flex items-center mt-1 space-x-2">
                    {food.category && (
                      <Badge variant="outline" className="text-xs">
                        {food.category}
                      </Badge>
                    )}
                    {food.supermarket && (
                      <Badge variant="outline" className="text-xs flex items-center">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {food.supermarket}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddToLog(food)}
                    title="Añadir al registro"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFromFavorites(food)}
                    title="Eliminar de favoritos"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
