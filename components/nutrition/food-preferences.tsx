"use client"

import { useState, useEffect } from "react"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Apple, 
  Plus, 
  Trash2, 
  Edit, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  getFoodPreferences, 
  addFoodPreference, 
  updateFoodPreference, 
  deleteFoodPreference 
} from "@/lib/nutrition-profile-service"
import { FoodPreference } from "@/lib/types/nutrition"

interface FoodPreferencesProps {
  userId: string
}

// Categorías de alimentos predefinidas
const FOOD_CATEGORIES = [
  { value: 'dairy', label: 'Lácteos' },
  { value: 'meat', label: 'Carnes' },
  { value: 'poultry', label: 'Aves' },
  { value: 'fish', label: 'Pescados' },
  { value: 'seafood', label: 'Mariscos' },
  { value: 'eggs', label: 'Huevos' },
  { value: 'vegetables', label: 'Verduras' },
  { value: 'fruits', label: 'Frutas' },
  { value: 'grains', label: 'Granos y cereales' },
  { value: 'legumes', label: 'Legumbres' },
  { value: 'nuts', label: 'Frutos secos' },
  { value: 'seeds', label: 'Semillas' },
  { value: 'sweets', label: 'Dulces' },
  { value: 'beverages', label: 'Bebidas' },
  { value: 'spices', label: 'Especias' },
  { value: 'oils', label: 'Aceites' },
  { value: 'processed', label: 'Alimentos procesados' },
  { value: 'other', label: 'Otros' }
]

export function FoodPreferences({
  userId
}: FoodPreferencesProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<FoodPreference[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedPreference, setSelectedPreference] = useState<FoodPreference | null>(null)
  const [formData, setFormData] = useState({
    food_category: 'vegetables',
    preference: 'like' as 'like' | 'dislike' | 'allergic' | 'intolerant',
    specific_foods: '',
    notes: ''
  })
  
  // Cargar preferencias alimentarias
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true)
      
      try {
        const { data, error } = await getFoodPreferences(userId)
        
        if (error) {
          console.error("Error al cargar preferencias:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las preferencias alimentarias",
            variant: "destructive"
          })
        } else if (data) {
          setPreferences(data)
        }
      } catch (error) {
        console.error("Error inesperado:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadPreferences()
    }
  }, [userId, toast])
  
  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Abrir diálogo de edición
  const handleEdit = (preference: FoodPreference) => {
    setSelectedPreference(preference)
    setFormData({
      food_category: preference.food_category,
      preference: preference.preference,
      specific_foods: preference.specific_foods ? preference.specific_foods.join(', ') : '',
      notes: preference.notes || ''
    })
    setShowEditDialog(true)
  }
  
  // Guardar nueva preferencia
  const handleSave = async () => {
    try {
      const specificFoods = formData.specific_foods
        ? formData.specific_foods.split(',').map(food => food.trim()).filter(Boolean)
        : undefined
      
      const { data, error } = await addFoodPreference({
        user_id: userId,
        food_category: formData.food_category,
        preference: formData.preference,
        specific_foods: specificFoods,
        notes: formData.notes
      })
      
      if (error) throw error
      
      setPreferences(prev => [...prev, data])
      setShowAddDialog(false)
      
      toast({
        title: "Preferencia guardada",
        description: "Tu preferencia alimentaria ha sido guardada correctamente"
      })
    } catch (error) {
      console.error("Error al guardar preferencia:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la preferencia alimentaria",
        variant: "destructive"
      })
    }
  }
  
  // Actualizar preferencia existente
  const handleUpdate = async () => {
    if (!selectedPreference) return
    
    try {
      const specificFoods = formData.specific_foods
        ? formData.specific_foods.split(',').map(food => food.trim()).filter(Boolean)
        : undefined
      
      const { data, error } = await updateFoodPreference(selectedPreference.id, {
        food_category: formData.food_category,
        preference: formData.preference,
        specific_foods: specificFoods,
        notes: formData.notes
      })
      
      if (error) throw error
      
      setPreferences(prev => prev.map(pref => 
        pref.id === selectedPreference.id ? data : pref
      ))
      setShowEditDialog(false)
      
      toast({
        title: "Preferencia actualizada",
        description: "Tu preferencia alimentaria ha sido actualizada correctamente"
      })
    } catch (error) {
      console.error("Error al actualizar preferencia:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la preferencia alimentaria",
        variant: "destructive"
      })
    }
  }
  
  // Eliminar preferencia
  const handleDelete = async () => {
    if (!selectedPreference) return
    
    try {
      const { error } = await deleteFoodPreference(selectedPreference.id)
      
      if (error) throw error
      
      setPreferences(prev => prev.filter(pref => pref.id !== selectedPreference.id))
      setShowEditDialog(false)
      
      toast({
        title: "Preferencia eliminada",
        description: "Tu preferencia alimentaria ha sido eliminada correctamente"
      })
    } catch (error) {
      console.error("Error al eliminar preferencia:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la preferencia alimentaria",
        variant: "destructive"
      })
    }
  }
  
  // Obtener etiqueta de categoría
  const getCategoryLabel = (value: string) => {
    const category = FOOD_CATEGORIES.find(cat => cat.value === value)
    return category ? category.label : value
  }
  
  // Obtener icono y color según preferencia
  const getPreferenceIcon = (preference: 'like' | 'dislike' | 'allergic' | 'intolerant') => {
    switch (preference) {
      case 'like':
        return { icon: ThumbsUp, color: 'bg-green-100 text-green-600' }
      case 'dislike':
        return { icon: ThumbsDown, color: 'bg-orange-100 text-orange-600' }
      case 'allergic':
        return { icon: AlertTriangle, color: 'bg-red-100 text-red-600' }
      case 'intolerant':
        return { icon: X, color: 'bg-purple-100 text-purple-600' }
    }
  }
  
  if (isLoading) {
    return (
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Preferencias Alimentarias</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <>
      <Card3D>
        <Card3DHeader>
          <div className="flex justify-between items-center">
            <Card3DTitle>Preferencias Alimentarias</Card3DTitle>
            
            <Button3D size="sm" onClick={() => {
              setFormData({
                food_category: 'vegetables',
                preference: 'like',
                specific_foods: '',
                notes: ''
              })
              setShowAddDialog(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir
            </Button3D>
          </div>
        </Card3DHeader>
        <Card3DContent>
          {preferences.length > 0 ? (
            <div className="space-y-3">
              {preferences.map(pref => {
                const { icon: Icon, color } = getPreferenceIcon(pref.preference)
                
                return (
                  <div 
                    key={pref.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => handleEdit(pref)}
                  >
                    <div className="flex items-center">
                      <div className={`${color} p-2 rounded-full mr-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{getCategoryLabel(pref.food_category)}</div>
                        <div className="text-sm text-gray-500">
                          {pref.preference === 'like' && 'Me gusta'}
                          {pref.preference === 'dislike' && 'No me gusta'}
                          {pref.preference === 'allergic' && 'Alérgico/a'}
                          {pref.preference === 'intolerant' && 'Intolerante'}
                          
                          {pref.specific_foods && pref.specific_foods.length > 0 && (
                            <>: <span className="italic">{pref.specific_foods.join(', ')}</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button3D variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button3D>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Apple className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin preferencias alimentarias</h3>
              <p className="text-sm text-gray-500 mb-4">
                Añade tus preferencias alimentarias para personalizar tus recomendaciones
              </p>
              <Button3D onClick={() => {
                setFormData({
                  food_category: 'vegetables',
                  preference: 'like',
                  specific_foods: '',
                  notes: ''
                })
                setShowAddDialog(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir preferencia
              </Button3D>
            </div>
          )}
          
          {/* Resumen de preferencias */}
          {preferences.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium mb-3">Resumen de preferencias</h3>
              
              <div className="flex flex-wrap gap-2">
                {preferences.filter(p => p.preference === 'like').length > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {preferences.filter(p => p.preference === 'like').length} gustos
                  </Badge>
                )}
                
                {preferences.filter(p => p.preference === 'dislike').length > 0 && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    {preferences.filter(p => p.preference === 'dislike').length} disgustos
                  </Badge>
                )}
                
                {preferences.filter(p => p.preference === 'allergic').length > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {preferences.filter(p => p.preference === 'allergic').length} alergias
                  </Badge>
                )}
                
                {preferences.filter(p => p.preference === 'intolerant').length > 0 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <X className="h-3 w-3 mr-1" />
                    {preferences.filter(p => p.preference === 'intolerant').length} intolerancias
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card3DContent>
      </Card3D>
      
      {/* Diálogo para añadir preferencia */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir preferencia alimentaria</DialogTitle>
            <DialogDescription>
              Registra tus gustos, disgustos, alergias e intolerancias alimentarias
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="food_category">Categoría de alimento</Label>
              <Select
                value={formData.food_category}
                onValueChange={(value) => handleChange('food_category', value)}
              >
                <SelectTrigger id="food_category">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preference">Preferencia</Label>
              <Select
                value={formData.preference}
                onValueChange={(value) => handleChange('preference', value)}
              >
                <SelectTrigger id="preference">
                  <SelectValue placeholder="Selecciona preferencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="like">Me gusta</SelectItem>
                  <SelectItem value="dislike">No me gusta</SelectItem>
                  <SelectItem value="allergic">Alérgico/a</SelectItem>
                  <SelectItem value="intolerant">Intolerante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specific_foods">
                Alimentos específicos (opcional, separados por comas)
              </Label>
              <Input
                id="specific_foods"
                value={formData.specific_foods}
                onChange={(e) => handleChange('specific_foods', e.target.value)}
                placeholder="Ej: tomate, cebolla, ajo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Añade notas sobre esta preferencia"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSave}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar preferencia */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar preferencia alimentaria</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu preferencia alimentaria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-food_category">Categoría de alimento</Label>
              <Select
                value={formData.food_category}
                onValueChange={(value) => handleChange('food_category', value)}
              >
                <SelectTrigger id="edit-food_category">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-preference">Preferencia</Label>
              <Select
                value={formData.preference}
                onValueChange={(value) => handleChange('preference', value)}
              >
                <SelectTrigger id="edit-preference">
                  <SelectValue placeholder="Selecciona preferencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="like">Me gusta</SelectItem>
                  <SelectItem value="dislike">No me gusta</SelectItem>
                  <SelectItem value="allergic">Alérgico/a</SelectItem>
                  <SelectItem value="intolerant">Intolerante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-specific_foods">
                Alimentos específicos (opcional, separados por comas)
              </Label>
              <Input
                id="edit-specific_foods"
                value={formData.specific_foods}
                onChange={(e) => handleChange('specific_foods', e.target.value)}
                placeholder="Ej: tomate, cebolla, ajo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas (opcional)</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Añade notas sobre esta preferencia"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button3D variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button3D>
            <div className="space-x-2">
              <Button3D variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button3D>
              <Button3D onClick={handleUpdate}>
                Guardar cambios
              </Button3D>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
