"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus, Loader2, Bookmark, BookmarkCheck, Camera, ScanBarcode, Filter } from "lucide-react"
import { searchFoodDatabase, searchFoodApi, searchByBarcode } from "@/lib/food-database-api"
import { getUserCustomFoods, addCustomFood, deleteCustomFood } from "@/lib/nutrition-service"
import { FoodItem, CustomFood } from "@/lib/types/nutrition"

interface FoodDatabaseProps {
  userId: string
}

export default function FoodDatabase({ userId }: FoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("search")
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false)
  const [barcode, setBarcode] = useState("")
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Omit<CustomFood, "id" | "created_at">>({
    user_id: userId,
    name: "",
    serving_size: "100",
    serving_unit: "g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    is_favorite: false
  })

  // Cargar alimentos personalizados
  useEffect(() => {
    const loadCustomFoods = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getUserCustomFoods(userId)

        if (error) {
          throw error
        }

        if (data) {
          setCustomFoods(data)
        }
      } catch (error) {
        console.error("Error al cargar alimentos personalizados:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los alimentos personalizados",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomFoods()
  }, [userId, toast])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    })
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await addCustomFood(formData)

      if (error) {
        throw error
      }

      toast({
        title: "Alimento añadido",
        description: "El alimento personalizado ha sido añadido correctamente",
      })

      // Actualizar la lista de alimentos personalizados
      if (data) {
        setCustomFoods([data, ...customFoods])
      }

      // Resetear formulario
      setFormData({
        user_id: userId,
        name: "",
        serving_size: "100",
        serving_unit: "g",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        is_favorite: false
      })

      setAddFoodDialogOpen(false)
    } catch (error) {
      console.error("Error al añadir alimento personalizado:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el alimento personalizado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Buscar alimentos
  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      // Primero buscar en la base de datos local
      const { data: localResults, error: localError } = await searchFoodDatabase(searchTerm)

      if (localError) {
        console.error("Error al buscar en la base de datos local:", localError)
      }

      // Luego buscar en la API externa
      const { data: apiResults, error: apiError } = await searchFoodApi({ query: searchTerm })

      if (apiError) {
        console.error("Error al buscar en la API externa:", apiError)
      }

      // Combinar resultados eliminando duplicados por nombre
      const combinedResults = [...(localResults || []), ...(apiResults || [])]
      const uniqueResults = combinedResults.filter((food, index, self) =>
        index === self.findIndex((f) => f.name === food.name)
      )

      setSearchResults(uniqueResults)
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
      toast({
        title: "Error",
        description: "No se pudieron buscar alimentos",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Buscar por código de barras
  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return

    setIsScanningBarcode(true)
    try {
      const { data, error } = await searchByBarcode(barcode)

      if (error) {
        throw error
      }

      if (data) {
        setSearchResults([data])
        setBarcodeDialogOpen(false)
        setBarcode("")
      } else {
        toast({
          title: "No encontrado",
          description: "No se encontró ningún alimento con ese código de barras",
        })
      }
    } catch (error) {
      console.error("Error al buscar por código de barras:", error)
      toast({
        title: "Error",
        description: "No se pudo buscar por código de barras",
        variant: "destructive",
      })
    } finally {
      setIsScanningBarcode(false)
    }
  }

  // Seleccionar alimento para editar
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food)
    setFormData({
      user_id: userId,
      name: food.name,
      serving_size: food.serving_size,
      serving_unit: food.serving_unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      cholesterol: food.cholesterol,
      image_url: food.image_url,
      is_favorite: false
    })
    setAddFoodDialogOpen(true)
  }

  // Marcar/desmarcar como favorito
  const handleToggleFavorite = async (food: CustomFood) => {
    try {
      const { data, error } = await updateCustomFood(food.id, {
        is_favorite: !food.is_favorite
      })

      if (error) {
        throw error
      }

      // Actualizar la lista de alimentos personalizados
      setCustomFoods(customFoods.map(f =>
        f.id === food.id ? { ...f, is_favorite: !f.is_favorite } : f
      ))

      toast({
        title: food.is_favorite ? "Eliminado de favoritos" : "Añadido a favoritos",
        description: `${food.name} ha sido ${food.is_favorite ? "eliminado de" : "añadido a"} favoritos`,
      })
    } catch (error) {
      console.error("Error al actualizar favorito:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive",
      })
    }
  }

  // Función simulada para actualizar alimento personalizado
  const updateCustomFood = async (id: string, updates: Partial<CustomFood>) => {
    // En un entorno real, esto llamaría a la API
    return {
      data: { ...customFoods.find(f => f.id === id), ...updates },
      error: null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="search">Buscar Alimentos</TabsTrigger>
          <TabsTrigger value="my-foods">Mis Alimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-0 space-y-4">
          {/* Buscador de alimentos */}
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="search" className="sr-only">
                Buscar alimento
              </Label>
              <Input
                id="search"
                placeholder="Buscar alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
            </div>
            <Button type="button" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="outline" onClick={() => setBarcodeDialogOpen(true)}>
              <ScanBarcode className="h-4 w-4" />
            </Button>
          </div>

          {/* Resultados de búsqueda */}
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Resultados ({searchResults.length})</h3>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs">Filtrar</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  {searchResults.map((food) => (
                    <Card key={food.id} className="overflow-hidden">
                      <div className="flex">
                        {food.image_url && (
                          <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                            <img
                              src={food.image_url}
                              alt={food.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{food.name}</h3>
                              {food.brand && (
                                <p className="text-xs text-gray-500">{food.brand}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSelectFood(food)}
                              title="Añadir a mis alimentos"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {food.calories} kcal
                            </span>
                            <span className="text-xs bg-blue-50 px-2 py-1 rounded-full">
                              P: {food.protein}g
                            </span>
                            <span className="text-xs bg-green-50 px-2 py-1 rounded-full">
                              C: {food.carbs}g
                            </span>
                            <span className="text-xs bg-yellow-50 px-2 py-1 rounded-full">
                              G: {food.fat}g
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Por {food.serving_size} {food.serving_unit}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>Busca alimentos por nombre o escanea un código de barras</p>
                <p className="text-sm mt-2">Puedes añadir alimentos personalizados desde la pestaña "Mis Alimentos"</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-foods" className="mt-0 space-y-4">
          {/* Botón para añadir alimento personalizado */}
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              setSelectedFood(null)
              setFormData({
                user_id: userId,
                name: "",
                serving_size: "100",
                serving_unit: "g",
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                is_favorite: false
              })
              setAddFoodDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Añadir alimento personalizado</span>
          </Button>

          {/* Lista de alimentos personalizados */}
          <div className="space-y-4">
            {customFoods.length > 0 ? (
              <>
                <h3 className="text-sm font-medium">Mis alimentos ({customFoods.length})</h3>
                <div className="space-y-3">
                  {customFoods.map((food) => (
                    <Card key={food.id} className="overflow-hidden">
                      <div className="flex">
                        {food.image_url && (
                          <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                            <img
                              src={food.image_url}
                              alt={food.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{food.name}</h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleFavorite(food)}
                              title={food.is_favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                            >
                              {food.is_favorite ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {food.calories} kcal
                            </span>
                            <span className="text-xs bg-blue-50 px-2 py-1 rounded-full">
                              P: {food.protein}g
                            </span>
                            <span className="text-xs bg-green-50 px-2 py-1 rounded-full">
                              C: {food.carbs}g
                            </span>
                            <span className="text-xs bg-yellow-50 px-2 py-1 rounded-full">
                              G: {food.fat}g
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Por {food.serving_size} {food.serving_unit}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Bookmark className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No tienes alimentos personalizados</p>
                <p className="text-sm mt-2">Añade alimentos personalizados para acceder a ellos rápidamente</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para añadir alimento personalizado */}
      <Dialog open={addFoodDialogOpen} onOpenChange={setAddFoodDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFood ? "Añadir a mis alimentos" : "Crear alimento personalizado"}
            </DialogTitle>
            <DialogDescription>
              {selectedFood
                ? "Añade este alimento a tu lista personal con los ajustes que necesites."
                : "Crea un alimento personalizado con tus propios valores nutricionales."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del alimento</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serving_size">Tamaño de porción</Label>
                <Input
                  id="serving_size"
                  name="serving_size"
                  value={formData.serving_size}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serving_unit">Unidad</Label>
                <Input
                  id="serving_unit"
                  name="serving_unit"
                  value={formData.serving_unit}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calorías (kcal)</Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.calories}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Proteínas (g)</Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbohidratos (g)</Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Grasas (g)</Label>
                <Input
                  id="fat"
                  name="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fat}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiber">Fibra (g)</Label>
                <Input
                  id="fiber"
                  name="fiber"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fiber || 0}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugar">Azúcares (g)</Label>
                <Input
                  id="sugar"
                  name="sugar"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.sugar || 0}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddFoodDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para escanear código de barras */}
      <Dialog open={barcodeDialogOpen} onOpenChange={setBarcodeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escanear código de barras</DialogTitle>
            <DialogDescription>
              Introduce el código de barras del producto para buscarlo en la base de datos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="barcode">Código de barras</Label>
                <Input
                  id="barcode"
                  placeholder="Ej: 8410376012957"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleBarcodeSearch()
                    }
                  }}
                />
              </div>
              <div className="mt-8">
                <Button type="button" variant="outline" size="icon" disabled>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Nota: La función de escaneo con cámara no está disponible en esta versión.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBarcodeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleBarcodeSearch} disabled={isScanningBarcode || !barcode.trim()}>
                {isScanningBarcode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
