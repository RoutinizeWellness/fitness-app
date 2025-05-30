"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, MapPin, ShoppingCart, Utensils, Loader2, Heart, Plus } from "lucide-react"
import { searchSpanishFoods, getSpanishFoodCategories, getSpanishFoodRegions, initializeSpanishFoodDatabase } from "@/lib/services/spanish-food-service"
import { spanishFoodDatabase } from "@/data/spanish-food-database"
import { useNutrition } from "@/contexts/nutrition-context"
import { useAuth } from "@/lib/auth/auth-context"
import { toggleFavoriteFood } from "@/lib/favorite-foods-service"
import { FavoriteFoods } from "@/components/nutrition/favorite-foods"

export default function SpanishFoodDatabase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>()
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | undefined>()
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { addFoodToLog } = useNutrition()

  // Cargar categorías y regiones al montar el componente
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Intentar cargar categorías desde Supabase
        const { data: categoriesData, error: categoriesError } = await getSpanishFoodCategories()

        if (categoriesError || !categoriesData || categoriesData.length === 0) {
          // Si hay error o no hay datos, usar los datos locales
          const localCategories = [...new Set(spanishFoodDatabase.map(item => item.category))]
            .filter(category => category) // Filtrar valores nulos o vacíos
            .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
          setCategories(localCategories)
        } else {
          setCategories(categoriesData)
        }

        // Intentar cargar regiones desde Supabase
        const { data: regionsData, error: regionsError } = await getSpanishFoodRegions()

        if (regionsError || !regionsData || regionsData.length === 0) {
          // Si hay error o no hay datos, usar los datos locales
          const localRegions = [...new Set(spanishFoodDatabase
            .filter(item => item.region)
            .map(item => item.region as string))]
            .filter(region => region) // Filtrar valores nulos o vacíos
            .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
          setRegions(localRegions)
        } else {
          setRegions(regionsData)
        }
      } catch (error) {
        console.error("Error al cargar filtros:", error)
        // Usar datos locales como fallback
        const localCategories = [...new Set(spanishFoodDatabase.map(item => item.category))]
          .filter(category => category) // Filtrar valores nulos o vacíos
          .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
        setCategories(localCategories)

        const localRegions = [...new Set(spanishFoodDatabase
          .filter(item => item.region)
          .map(item => item.region as string))]
          .filter(region => region) // Filtrar valores nulos o vacíos
          .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
        setRegions(localRegions)
      }
    }

    loadFilters()
    // Cargar resultados iniciales
    handleSearch("")
  }, [])

  // Inicializar la base de datos
  const handleInitializeDatabase = async () => {
    setIsInitializing(true)

    try {
      const { success, error } = await initializeSpanishFoodDatabase()

      if (success) {
        toast({
          title: "Base de datos inicializada",
          description: "Los alimentos españoles se han cargado correctamente",
          variant: "default",
        })
        setIsInitialized(true)
        // Recargar los resultados
        handleSearch(searchTerm)
      } else {
        toast({
          title: "Error",
          description: "No se pudo inicializar la base de datos: " + (error?.message || "Error desconocido"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al inicializar la base de datos",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  // Buscar alimentos
  const handleSearch = async (term: string) => {
    setIsSearching(true)

    try {
      const { data, error } = await searchSpanishFoods(term, {
        category: selectedCategory,
        region: selectedRegion,
        supermarket: selectedSupermarket,
        limit: 50
      })

      if (error) {
        console.error("Error al buscar alimentos:", error)
        // Usar datos locales como fallback
        let filteredResults = spanishFoodDatabase

        if (term) {
          filteredResults = filteredResults.filter(item =>
            item.name.toLowerCase().includes(term.toLowerCase()) ||
            (item.brand && item.brand.toLowerCase().includes(term.toLowerCase())) ||
            item.category.toLowerCase().includes(term.toLowerCase()) ||
            (item.region && item.region.toLowerCase().includes(term.toLowerCase()))
          )
        }

        if (selectedCategory) {
          filteredResults = filteredResults.filter(item => item.category === selectedCategory)
        }

        if (selectedRegion) {
          filteredResults = filteredResults.filter(item => item.region === selectedRegion)
        }

        if (selectedSupermarket) {
          filteredResults = filteredResults.filter(item =>
            item.supermarket && item.supermarket.includes(selectedSupermarket)
          )
        }

        setSearchResults(filteredResults)
      } else {
        setSearchResults(data || [])
      }
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
      toast({
        title: "Error",
        description: "No se pudieron buscar alimentos",
        variant: "destructive",
      })

      // Usar datos locales como fallback
      setSearchResults(spanishFoodDatabase)
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar cambio en la búsqueda
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    handleSearch(term)
  }

  // Manejar cambio de filtros
  const handleFilterChange = (type: 'category' | 'region' | 'supermarket', value: string | undefined) => {
    // Convertir "all" a undefined para mantener la lógica de filtrado existente
    const processedValue = value === "all" ? undefined : value;

    if (type === 'category') {
      setSelectedCategory(processedValue)
    } else if (type === 'region') {
      setSelectedRegion(processedValue)
    } else if (type === 'supermarket') {
      setSelectedSupermarket(processedValue)
    }

    // Recargar resultados con los nuevos filtros
    handleSearch(searchTerm)
  }

  // Añadir alimento al registro de comidas
  const handleAddToLog = (food: any) => {
    addFoodToLog(food)

    toast({
      title: "Alimento añadido",
      description: `"${food.name}" ha sido añadido a tu registro`,
    })
  }

  // Marcar/desmarcar alimento como favorito
  const handleToggleFavorite = async (food: any) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "default",
      })
      return
    }

    try {
      const isFavorite = !food.isFavorite
      const { success, error } = await toggleFavoriteFood(food.id, isFavorite)

      if (!success) {
        throw new Error(error || "Error al actualizar favorito")
      }

      // Actualizar estado local
      setSearchResults(prev =>
        prev.map(item =>
          item.id === food.id ? { ...item, isFavorite } : item
        )
      )

      toast({
        title: isFavorite ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: `"${food.name}" ha sido ${isFavorite ? 'añadido a' : 'eliminado de'} tus favoritos`,
      })
    } catch (error) {
      console.error("Error al actualizar favorito:", error)

      toast({
        title: "Error",
        description: "No se pudo actualizar el favorito",
        variant: "destructive",
      })
    }
  }

  // Renderizar un elemento de alimento
  const renderFoodItem = (food: any) => {
    return (
      <Card key={food.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{food.name}</h3>
              {food.brand && (
                <p className="text-sm text-muted-foreground">{food.brand}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline">{food.category}</Badge>
                {food.region && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {food.region}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{food.calories} kcal</p>
              <p className="text-xs text-muted-foreground">
                por {food.serving_size || food.servingSize} {food.serving_unit || food.servingUnit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
            <div>
              <p className="font-semibold">{food.protein}g</p>
              <p className="text-xs text-muted-foreground">Proteínas</p>
            </div>
            <div>
              <p className="font-semibold">{food.carbs}g</p>
              <p className="text-xs text-muted-foreground">Carbohidratos</p>
            </div>
            <div>
              <p className="font-semibold">{food.fat}g</p>
              <p className="text-xs text-muted-foreground">Grasas</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            {food.supermarket && food.supermarket.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Disponible en: {food.supermarket.join(", ")}
              </p>
            )}

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleFavorite(food)}
                title={food.isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
              >
                <Heart className={`h-4 w-4 ${food.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddToLog(food)}
                title="Añadir al registro"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Alimentos Españoles</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleInitializeDatabase}
                disabled={isInitializing || isInitialized}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inicializando...
                  </>
                ) : isInitialized ? (
                  "Base de datos inicializada"
                ) : (
                  "Inicializar base de datos"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Buscador */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar alimentos españoles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSearch(searchTerm)}
                disabled={isSearching}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category || "unknown"}>{category || "Sin categoría"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedRegion}
                onValueChange={(value) => handleFilterChange('region', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las regiones</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region || "unknown"}>{region || "Sin región"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSupermarket}
                onValueChange={(value) => handleFilterChange('supermarket', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Supermercado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los supermercados</SelectItem>
                  <SelectItem value="Mercadona">Mercadona</SelectItem>
                  <SelectItem value="Carrefour">Carrefour</SelectItem>
                  <SelectItem value="Dia">Dia</SelectItem>
                  <SelectItem value="Lidl">Lidl</SelectItem>
                  <SelectItem value="Alcampo">Alcampo</SelectItem>
                  <SelectItem value="El Corte Inglés">El Corte Inglés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <FavoriteFoods
          onSelectFood={(food) => {
            setSearchTerm(food.name);
            handleSearch(food.name);
          }}
          className="col-span-1"
        />
      </div>

      {/* Resultados */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resultados ({searchResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Buscando alimentos...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron alimentos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((food) => renderFoodItem(food))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
