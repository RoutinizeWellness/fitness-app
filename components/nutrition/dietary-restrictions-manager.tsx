"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, AlertTriangle, Check, X, Plus, Edit, Trash2, Heart, Leaf, Fish } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth/auth-context"
import { createClient } from "@/lib/supabase/client"

interface DietaryRestriction {
  id: string
  name: string
  type: 'allergy' | 'religious' | 'lifestyle' | 'medical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  excludedIngredients: string[]
  alternatives?: string[]
  icon: string
  color: string
}

interface UserRestrictionProfile {
  id: string
  userId: string
  restrictions: string[] // IDs de restricciones
  customRestrictions: DietaryRestriction[]
  notes?: string
  lastUpdated: string
}

interface DietaryRestrictionsManagerProps {
  onRestrictionsChange?: (restrictions: DietaryRestriction[]) => void
  className?: string
}

export function DietaryRestrictionsManager({
  onRestrictionsChange,
  className = ""
}: DietaryRestrictionsManagerProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [userProfile, setUserProfile] = useState<UserRestrictionProfile | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isAddRestrictionDialogOpen, setIsAddRestrictionDialogOpen] = useState(false)
  const [editingRestriction, setEditingRestriction] = useState<DietaryRestriction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restricciones predefinidas
  const predefinedRestrictions: DietaryRestriction[] = [
    // ALERGIAS
    {
      id: 'allergy-nuts',
      name: 'Alergia a Frutos Secos',
      type: 'allergy',
      severity: 'critical',
      description: 'Alergia severa a todos los frutos secos',
      excludedIngredients: ['almendras', 'nueces', 'avellanas', 'pistachos', 'anacardos', 'piñones'],
      alternatives: ['semillas de girasol', 'semillas de calabaza'],
      icon: '🥜',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'allergy-dairy',
      name: 'Intolerancia a la Lactosa',
      type: 'allergy',
      severity: 'high',
      description: 'Intolerancia a productos lácteos',
      excludedIngredients: ['leche', 'queso', 'yogur', 'mantequilla', 'nata', 'crema'],
      alternatives: ['leche de almendras', 'leche de avena', 'queso vegano'],
      icon: '🥛',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'allergy-gluten',
      name: 'Celiaquía (Sin Gluten)',
      type: 'allergy',
      severity: 'critical',
      description: 'Enfermedad celíaca - sin gluten',
      excludedIngredients: ['trigo', 'cebada', 'centeno', 'avena', 'pan', 'pasta'],
      alternatives: ['arroz', 'quinoa', 'pan sin gluten', 'pasta de arroz'],
      icon: '🌾',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'allergy-shellfish',
      name: 'Alergia a Mariscos',
      type: 'allergy',
      severity: 'critical',
      description: 'Alergia a crustáceos y moluscos',
      excludedIngredients: ['gambas', 'langostinos', 'cangrejos', 'mejillones', 'almejas', 'pulpo'],
      alternatives: ['pescado blanco', 'pollo', 'tofu'],
      icon: '🦐',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'allergy-eggs',
      name: 'Alergia al Huevo',
      type: 'allergy',
      severity: 'high',
      description: 'Alergia a huevos y derivados',
      excludedIngredients: ['huevos', 'mayonesa', 'merengue', 'clara de huevo', 'yema'],
      alternatives: ['sustituto de huevo', 'aquafaba', 'linaza molida'],
      icon: '🥚',
      color: 'bg-orange-100 text-orange-800'
    },

    // RELIGIOSAS
    {
      id: 'religious-halal',
      name: 'Halal',
      type: 'religious',
      severity: 'high',
      description: 'Alimentación según preceptos islámicos',
      excludedIngredients: ['cerdo', 'jamón', 'chorizo', 'morcilla', 'alcohol', 'vino'],
      alternatives: ['pollo halal', 'cordero halal', 'ternera halal'],
      icon: '☪️',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'religious-kosher',
      name: 'Kosher',
      type: 'religious',
      severity: 'high',
      description: 'Alimentación según preceptos judíos',
      excludedIngredients: ['cerdo', 'mariscos', 'mezcla carne-lácteos'],
      alternatives: ['pollo kosher', 'pescado con escamas', 'carne kosher'],
      icon: '✡️',
      color: 'bg-blue-100 text-blue-800'
    },

    // ESTILO DE VIDA
    {
      id: 'lifestyle-vegetarian',
      name: 'Vegetariano',
      type: 'lifestyle',
      severity: 'medium',
      description: 'Sin carne ni pescado',
      excludedIngredients: ['carne', 'pollo', 'pescado', 'mariscos', 'gelatina'],
      alternatives: ['tofu', 'tempeh', 'legumbres', 'quinoa'],
      icon: '🥬',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'lifestyle-vegan',
      name: 'Vegano',
      type: 'lifestyle',
      severity: 'medium',
      description: 'Sin productos de origen animal',
      excludedIngredients: ['carne', 'pescado', 'lácteos', 'huevos', 'miel', 'gelatina'],
      alternatives: ['proteínas vegetales', 'leches vegetales', 'nutritional yeast'],
      icon: '🌱',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'lifestyle-pescetarian',
      name: 'Pescetariano',
      type: 'lifestyle',
      severity: 'low',
      description: 'Sin carne, pero sí pescado',
      excludedIngredients: ['carne roja', 'pollo', 'cerdo', 'cordero'],
      alternatives: ['pescado', 'mariscos', 'proteínas vegetales'],
      icon: '🐟',
      color: 'bg-blue-100 text-blue-800'
    },

    // MÉDICAS
    {
      id: 'medical-diabetes',
      name: 'Diabetes',
      type: 'medical',
      severity: 'high',
      description: 'Control de glucosa en sangre',
      excludedIngredients: ['azúcar refinado', 'dulces', 'refrescos', 'harinas refinadas'],
      alternatives: ['edulcorantes naturales', 'harinas integrales', 'frutas con moderación'],
      icon: '💉',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'medical-hypertension',
      name: 'Hipertensión',
      type: 'medical',
      severity: 'high',
      description: 'Bajo contenido en sodio',
      excludedIngredients: ['sal en exceso', 'embutidos', 'conservas', 'snacks salados'],
      alternatives: ['hierbas aromáticas', 'especias', 'limón', 'vinagre'],
      icon: '❤️',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'medical-kidney',
      name: 'Enfermedad Renal',
      type: 'medical',
      severity: 'critical',
      description: 'Restricción de proteínas y fósforo',
      excludedIngredients: ['proteínas en exceso', 'fósforo', 'potasio alto'],
      alternatives: ['proteínas controladas', 'frutas bajas en potasio'],
      icon: '🫘',
      color: 'bg-purple-100 text-purple-800'
    }
  ]

  // Cargar perfil del usuario
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('dietary_restrictions_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading dietary restrictions profile:', error)
        return
      }

      if (data) {
        setUserProfile(data)
      } else {
        // Crear perfil por defecto
        const defaultProfile: UserRestrictionProfile = {
          id: '',
          userId: user.id,
          restrictions: [],
          customRestrictions: [],
          lastUpdated: new Date().toISOString()
        }
        setUserProfile(defaultProfile)
      }
    } catch (error) {
      console.error('Error loading dietary restrictions profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar perfil del usuario
  const saveUserProfile = async (profile: UserRestrictionProfile) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('dietary_restrictions_profiles')
        .upsert({
          user_id: user.id,
          restrictions: profile.restrictions,
          custom_restrictions: profile.customRestrictions,
          notes: profile.notes,
          last_updated: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving dietary restrictions profile:', error)
        return
      }

      setUserProfile(profile)

      // Notificar cambios
      if (onRestrictionsChange) {
        const activeRestrictions = [
          ...predefinedRestrictions.filter(r => profile.restrictions.includes(r.id)),
          ...profile.customRestrictions
        ]
        onRestrictionsChange(activeRestrictions)
      }
    } catch (error) {
      console.error('Error saving dietary restrictions profile:', error)
    }
  }

  // Alternar restricción
  const toggleRestriction = (restrictionId: string) => {
    if (!userProfile) return

    const updatedRestrictions = userProfile.restrictions.includes(restrictionId)
      ? userProfile.restrictions.filter(id => id !== restrictionId)
      : [...userProfile.restrictions, restrictionId]

    const updatedProfile = {
      ...userProfile,
      restrictions: updatedRestrictions,
      lastUpdated: new Date().toISOString()
    }

    saveUserProfile(updatedProfile)
  }

  // Obtener restricciones activas
  const getActiveRestrictions = () => {
    if (!userProfile) return []

    return [
      ...predefinedRestrictions.filter(r => userProfile.restrictions.includes(r.id)),
      ...userProfile.customRestrictions
    ]
  }

  // Verificar si un alimento es compatible
  const isIngredientCompatible = (ingredient: string) => {
    const activeRestrictions = getActiveRestrictions()

    return !activeRestrictions.some(restriction =>
      restriction.excludedIngredients.some(excluded =>
        ingredient.toLowerCase().includes(excluded.toLowerCase()) ||
        excluded.toLowerCase().includes(ingredient.toLowerCase())
      )
    )
  }

  // Obtener alternativas para un ingrediente
  const getIngredientAlternatives = (ingredient: string) => {
    const activeRestrictions = getActiveRestrictions()
    const alternatives: string[] = []

    activeRestrictions.forEach(restriction => {
      if (restriction.excludedIngredients.some(excluded =>
        ingredient.toLowerCase().includes(excluded.toLowerCase())
      )) {
        if (restriction.alternatives) {
          alternatives.push(...restriction.alternatives)
        }
      }
    })

    return [...new Set(alternatives)] // Eliminar duplicados
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'allergy': return <AlertTriangle className="h-4 w-4" />
      case 'religious': return <Heart className="h-4 w-4" />
      case 'lifestyle': return <Leaf className="h-4 w-4" />
      case 'medical': return <Shield className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B237E] mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Cargando restricciones dietéticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#1B237E]">
            <Shield className="h-5 w-5 mr-2" />
            Restricciones Dietéticas
          </CardTitle>
          <CardDescription>
            Gestiona tus alergias, preferencias religiosas, estilo de vida y condiciones médicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {getActiveRestrictions().length} restricciones activas
              </span>
              {getActiveRestrictions().some(r => r.severity === 'critical') && (
                <Badge variant="destructive" className="text-xs">
                  ⚠️ Críticas
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <SafeClientButton
                variant="outline"
                size="sm"
                onClick={() => setIsAddRestrictionDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Personalizada
              </SafeClientButton>

              <SafeClientButton
                variant="accent"
                size="sm"
                onClick={() => setIsProfileDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Gestionar
              </SafeClientButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restricciones Activas */}
      {getActiveRestrictions().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Restricciones Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getActiveRestrictions().map(restriction => (
                <div key={restriction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(restriction.type)}
                      <span className="text-lg">{restriction.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{restriction.name}</h4>
                      <p className="text-xs text-gray-600">{restriction.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(restriction.severity)}`}></div>
                    <SafeClientButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (predefinedRestrictions.find(r => r.id === restriction.id)) {
                          toggleRestriction(restriction.id)
                        } else {
                          // Eliminar restricción personalizada
                          if (userProfile) {
                            const updatedProfile = {
                              ...userProfile,
                              customRestrictions: userProfile.customRestrictions.filter(r => r.id !== restriction.id),
                              lastUpdated: new Date().toISOString()
                            }
                            saveUserProfile(updatedProfile)
                          }
                        }
                      }}
                      className="text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </SafeClientButton>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de gestión de restricciones */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Gestionar Restricciones Dietéticas</DialogTitle>
            <DialogDescription>
              Selecciona todas las restricciones que se aplican a tu dieta
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="allergies" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="allergies">Alergias</TabsTrigger>
              <TabsTrigger value="religious">Religiosas</TabsTrigger>
              <TabsTrigger value="lifestyle">Estilo de Vida</TabsTrigger>
              <TabsTrigger value="medical">Médicas</TabsTrigger>
            </TabsList>

            {['allergies', 'religious', 'lifestyle', 'medical'].map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {predefinedRestrictions
                    .filter(restriction => {
                      const typeMap = {
                        allergies: 'allergy',
                        religious: 'religious',
                        lifestyle: 'lifestyle',
                        medical: 'medical'
                      }
                      return restriction.type === typeMap[category as keyof typeof typeMap]
                    })
                    .map(restriction => (
                    <div key={restriction.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={userProfile?.restrictions.includes(restriction.id) || false}
                          onCheckedChange={() => toggleRestriction(restriction.id)}
                        />

                        <div className="flex items-center gap-2">
                          <span className="text-lg">{restriction.icon}</span>
                          {getTypeIcon(restriction.type)}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{restriction.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{restriction.description}</p>

                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Ingredientes excluidos:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {restriction.excludedIngredients.slice(0, 5).map(ingredient => (
                                <Badge key={ingredient} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                              {restriction.excludedIngredients.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{restriction.excludedIngredients.length - 5} más
                                </Badge>
                              )}
                            </div>
                          </div>

                          {restriction.alternatives && restriction.alternatives.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-green-700">Alternativas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {restriction.alternatives.slice(0, 3).map(alternative => (
                                  <Badge key={alternative} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    {alternative}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-3">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(restriction.severity)}`}></div>
                        <span className="text-xs text-gray-500 capitalize">{restriction.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {getActiveRestrictions().length} restricciones seleccionadas
            </div>

            <div className="flex gap-2">
              <SafeClientButton
                variant="outline"
                onClick={() => setIsProfileDialogOpen(false)}
              >
                Cerrar
              </SafeClientButton>

              <SafeClientButton
                variant="accent"
                onClick={() => {
                  setIsProfileDialogOpen(false)
                  // Aquí se podría mostrar un mensaje de confirmación
                }}
              >
                Guardar Cambios
              </SafeClientButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar restricción personalizada */}
      <Dialog open={isAddRestrictionDialogOpen} onOpenChange={setIsAddRestrictionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Añadir Restricción Personalizada</DialogTitle>
            <DialogDescription>
              Crea una restricción dietética personalizada según tus necesidades específicas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la restricción</Label>
                <Input placeholder="Ej: Alergia al apio" />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="allergy">Alergia</option>
                  <option value="religious">Religiosa</option>
                  <option value="lifestyle">Estilo de vida</option>
                  <option value="medical">Médica</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Severidad</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Emoji/Icono</Label>
                <Input placeholder="🚫" maxLength={2} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea placeholder="Describe brevemente esta restricción dietética..." />
            </div>

            <div className="space-y-2">
              <Label>Ingredientes a excluir (separados por comas)</Label>
              <Textarea placeholder="apio, apio en rama, sal de apio..." />
            </div>

            <div className="space-y-2">
              <Label>Alternativas recomendadas (separadas por comas)</Label>
              <Textarea placeholder="perejil, cilantro, cebollino..." />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <SafeClientButton
                variant="outline"
                onClick={() => setIsAddRestrictionDialogOpen(false)}
              >
                Cancelar
              </SafeClientButton>

              <SafeClientButton
                variant="accent"
                onClick={() => {
                  // Aquí se implementaría la lógica para crear la restricción personalizada
                  setIsAddRestrictionDialogOpen(false)
                }}
              >
                Crear Restricción
              </SafeClientButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
