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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Scale, 
  Ruler, 
  Target, 
  Activity, 
  Apple, 
  Save, 
  Edit, 
  AlertCircle 
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  getNutritionProfile, 
  createNutritionProfile, 
  updateNutritionProfile,
  calculateBMR,
  calculateTDEE,
  calculateMacros
} from "@/lib/nutrition-profile-service"
import { NutritionProfile } from "@/lib/types/nutrition"
import { Progress3D } from "@/components/ui/progress-3d"

interface NutritionProfileProps {
  userId: string
  onProfileUpdate?: (profile: NutritionProfile) => void
}

export function NutritionProfileComponent({
  userId,
  onProfileUpdate
}: NutritionProfileProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<NutritionProfile | null>(null)
  const [formData, setFormData] = useState({
    height: 170,
    current_weight: 70,
    initial_weight: 70,
    target_weight: 70,
    activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'maintain' as 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle',
    diet_type: 'standard' as 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'custom',
    meals_per_day: 3
  })
  
  // Cargar perfil nutricional
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      
      try {
        const { data, error } = await getNutritionProfile(userId)
        
        if (error) {
          console.error("Error al cargar perfil:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar el perfil nutricional",
            variant: "destructive"
          })
        } else if (data) {
          setProfile(data)
          setFormData({
            height: data.height,
            current_weight: data.current_weight,
            initial_weight: data.initial_weight,
            target_weight: data.target_weight,
            activity_level: data.activity_level,
            goal: data.goal,
            diet_type: data.diet_type,
            meals_per_day: data.meals_per_day
          })
        }
      } catch (error) {
        console.error("Error inesperado:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadProfile()
    }
  }, [userId, toast])
  
  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Guardar perfil
  const handleSave = async () => {
    try {
      if (profile) {
        // Actualizar perfil existente
        const { data, error } = await updateNutritionProfile(userId, {
          ...formData,
          user_id: userId
        })
        
        if (error) throw error
        
        setProfile(data)
        if (onProfileUpdate) onProfileUpdate(data)
        
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil nutricional ha sido actualizado correctamente"
        })
      } else {
        // Crear nuevo perfil
        const { data, error } = await createNutritionProfile({
          ...formData,
          user_id: userId
        })
        
        if (error) throw error
        
        setProfile(data)
        if (onProfileUpdate) onProfileUpdate(data)
        
        toast({
          title: "Perfil creado",
          description: "Tu perfil nutricional ha sido creado correctamente"
        })
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error al guardar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil nutricional",
        variant: "destructive"
      })
    }
  }
  
  // Calcular métricas
  const calculateMetrics = () => {
    if (!profile) return null
    
    // Asumimos una edad de 30 años para el cálculo (idealmente obtendríamos la edad real del usuario)
    const age = 30
    const gender = 'male' // Idealmente obtendríamos el género del perfil del usuario
    
    const bmr = calculateBMR(profile.current_weight, profile.height, age, gender)
    const tdee = calculateTDEE(bmr, profile.activity_level)
    const macros = calculateMacros(tdee, profile.goal, profile.current_weight)
    
    const weightProgress = Math.min(100, Math.max(0, 
      profile.initial_weight === profile.target_weight 
        ? 100 
        : Math.abs((profile.current_weight - profile.initial_weight) / 
            (profile.target_weight - profile.initial_weight) * 100)
    ))
    
    return {
      bmr,
      tdee,
      macros,
      weightProgress
    }
  }
  
  const metrics = profile ? calculateMetrics() : null
  
  if (isLoading) {
    return (
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Perfil Nutricional</Card3DTitle>
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
    <Card3D>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Perfil Nutricional</Card3DTitle>
          
          {profile && !isEditing && (
            <Button3D size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button3D>
          )}
        </div>
      </Card3DHeader>
      <Card3DContent>
        {!profile || isEditing ? (
          // Formulario de edición
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current_weight">Peso actual (kg)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  value={formData.current_weight}
                  onChange={(e) => handleChange('current_weight', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initial_weight">Peso inicial (kg)</Label>
                <Input
                  id="initial_weight"
                  type="number"
                  value={formData.initial_weight}
                  onChange={(e) => handleChange('initial_weight', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_weight">Peso objetivo (kg)</Label>
                <Input
                  id="target_weight"
                  type="number"
                  value={formData.target_weight}
                  onChange={(e) => handleChange('target_weight', parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_level">Nivel de actividad</Label>
                <Select
                  value={formData.activity_level}
                  onValueChange={(value) => handleChange('activity_level', value)}
                >
                  <SelectTrigger id="activity_level">
                    <SelectValue placeholder="Selecciona nivel de actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentario</SelectItem>
                    <SelectItem value="light">Ligero</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="very_active">Muy activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => handleChange('goal', value)}
                >
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Selecciona objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Perder peso</SelectItem>
                    <SelectItem value="maintain">Mantener peso</SelectItem>
                    <SelectItem value="gain_weight">Ganar peso</SelectItem>
                    <SelectItem value="gain_muscle">Ganar músculo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diet_type">Tipo de dieta</Label>
                <Select
                  value={formData.diet_type}
                  onValueChange={(value) => handleChange('diet_type', value)}
                >
                  <SelectTrigger id="diet_type">
                    <SelectValue placeholder="Selecciona tipo de dieta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Estándar</SelectItem>
                    <SelectItem value="vegetarian">Vegetariana</SelectItem>
                    <SelectItem value="vegan">Vegana</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="mediterranean">Mediterránea</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meals_per_day">Comidas por día</Label>
                <Select
                  value={formData.meals_per_day.toString()}
                  onValueChange={(value) => handleChange('meals_per_day', parseInt(value))}
                >
                  <SelectTrigger id="meals_per_day">
                    <SelectValue placeholder="Selecciona comidas por día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              {profile && (
                <Button3D variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button3D>
              )}
              
              <Button3D onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button3D>
            </div>
          </div>
        ) : (
          // Vista de perfil
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Ruler className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Altura</span>
                </div>
                <div className="text-xl font-bold">
                  {profile.height} cm
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Scale className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">Peso actual</span>
                </div>
                <div className="text-xl font-bold">
                  {profile.current_weight} kg
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Target className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm font-medium">Objetivo</span>
                </div>
                <div className="text-xl font-bold">
                  {profile.goal === 'lose_weight' && 'Perder peso'}
                  {profile.goal === 'maintain' && 'Mantener peso'}
                  {profile.goal === 'gain_weight' && 'Ganar peso'}
                  {profile.goal === 'gain_muscle' && 'Ganar músculo'}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Apple className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium">Tipo de dieta</span>
                </div>
                <div className="text-xl font-bold">
                  {profile.diet_type === 'standard' && 'Estándar'}
                  {profile.diet_type === 'vegetarian' && 'Vegetariana'}
                  {profile.diet_type === 'vegan' && 'Vegana'}
                  {profile.diet_type === 'keto' && 'Keto'}
                  {profile.diet_type === 'paleo' && 'Paleo'}
                  {profile.diet_type === 'mediterranean' && 'Mediterránea'}
                  {profile.diet_type === 'custom' && 'Personalizada'}
                </div>
              </div>
            </div>
            
            {metrics && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Métricas calculadas</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700 mb-1">Metabolismo basal</div>
                    <div className="text-xl font-bold text-blue-900">{metrics.bmr} kcal</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700 mb-1">Gasto energético</div>
                    <div className="text-xl font-bold text-green-900">{metrics.tdee} kcal</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-700 mb-1">Objetivo calórico</div>
                    <div className="text-xl font-bold text-purple-900">{metrics.macros.calories} kcal</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Progreso hacia el peso objetivo</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{profile.initial_weight} kg</span>
                    <span className="text-sm">{profile.target_weight} kg</span>
                  </div>
                  <Progress3D value={metrics.weightProgress} max={100} />
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium">{profile.current_weight} kg</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Macronutrientes recomendados</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Proteínas</div>
                      <div className="text-lg font-semibold">{metrics.macros.protein}g</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Carbohidratos</div>
                      <div className="text-lg font-semibold">{metrics.macros.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Grasas</div>
                      <div className="text-lg font-semibold">{metrics.macros.fat}g</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card3DContent>
    </Card3D>
  )
}
