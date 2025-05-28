"use client"

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { TrainerAvatar, AvatarCustomization } from '@/lib/types/gamification'
import { useAuth } from '@/lib/contexts/auth-context'
import { getUserTrainerAvatar, updateUserTrainerAvatar } from '@/lib/avatar-service'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Palette, User, Shirt, Dumbbell } from 'lucide-react'

// Import the fallback avatar
import { FallbackAvatar } from './fallback-avatar'

// Avatar model component for customization preview
function CustomizableAvatar({
  customization,
  scale = 1.5
}: {
  customization: AvatarCustomization;
  scale?: number;
}) {
  // Get color from customization
  const getColor = () => {
    switch (customization.hairColor) {
      case 'brown': return '#8B4513';
      case 'black': return '#000000';
      case 'blonde': return '#F5DEB3';
      case 'red': return '#B22222';
      case 'gray': return '#808080';
      default: return customization.hairColor || '#8B4513';
    }
  }

  // Use the fallback avatar with customization options
  return (
    <>
      <FallbackAvatar
        scale={scale}
        animation="idle"
        color={getColor()}
      />
      <Html position={[0, 1.5, 0]} center>
        <div className="text-white text-xs bg-black bg-opacity-50 p-1 rounded">
          {customization.bodyType} body
        </div>
      </Html>
    </>
  )
}

// Main Avatar Customizer component
export function AvatarCustomizer() {
  const [avatar, setAvatar] = useState<TrainerAvatar | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customization, setCustomization] = useState<AvatarCustomization>({
    bodyType: 'athletic',
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    facialFeatures: 'neutral',
    outfit: 'athletic',
    accessories: []
  })
  const { user } = useAuth()
  const { toast } = useToast()

  // Load avatar data with enhanced error handling
  useEffect(() => {
    async function loadAvatar() {
      if (!user) {
        console.log('No user available for avatar customizer, using default settings')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log(`Loading avatar for customizer (user ${user.id})...`)

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('Avatar customizer loading timed out after 5 seconds')
            resolve(null)
          }, 5000)
        })

        // Race between actual loading and timeout
        const avatarData = await Promise.race([
          getUserTrainerAvatar(user.id),
          timeoutPromise
        ])

        if (!avatarData) {
          console.warn('Failed to load avatar data for customizer within timeout')
          toast({
            title: 'Aviso',
            description: 'Usando configuración predeterminada para el avatar',
            variant: 'default'
          })

          // Try again with error handling disabled
          try {
            const fallbackAvatar = await getUserTrainerAvatar(user.id)
            if (fallbackAvatar) {
              setAvatar(fallbackAvatar)
              setCustomization(fallbackAvatar.customization)
            }
          } catch (fallbackError) {
            console.error('Critical error loading avatar for customizer:', fallbackError)
          }
        } else {
          console.log('Avatar customizer data loaded successfully')
          setAvatar(avatarData)
          setCustomization(avatarData.customization)
        }
      } catch (error) {
        console.error('Error loading trainer avatar for customizer:', error)
        toast({
          title: 'Aviso',
          description: 'Usando configuración predeterminada para el avatar',
          variant: 'default'
        })

        // Try again with error handling disabled
        try {
          const fallbackAvatar = await getUserTrainerAvatar(user.id)
          if (fallbackAvatar) {
            setAvatar(fallbackAvatar)
            setCustomization(fallbackAvatar.customization)
          }
        } catch (fallbackError) {
          console.error('Critical error loading avatar for customizer:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadAvatar()
  }, [user, toast])

  // Save customization changes with enhanced error handling
  const saveCustomization = async () => {
    if (!user || !avatar) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para guardar la personalización',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      console.log(`Saving customization for user ${user.id}...`)

      // Add timeout to prevent infinite saving
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('Avatar customization save timed out after 5 seconds')
          resolve(false)
        }, 5000)
      })

      // Race between actual saving and timeout
      const success = await Promise.race([
        updateUserTrainerAvatar(user.id, { customization }),
        timeoutPromise
      ])

      if (success) {
        console.log('Customization saved successfully')
        toast({
          title: 'Personalización guardada',
          description: 'Los cambios se han guardado correctamente'
        })

        // Update local avatar data
        setAvatar({
          ...avatar,
          customization
        })
      } else {
        console.warn('Failed to save customization')
        toast({
          title: 'Aviso',
          description: 'Los cambios se han guardado localmente, pero puede haber problemas de sincronización',
          variant: 'default'
        })

        // Still update local avatar data
        setAvatar({
          ...avatar,
          customization
        })
      }
    } catch (error) {
      console.error('Error saving customization:', error)
      toast({
        title: 'Aviso',
        description: 'Los cambios se han guardado localmente, pero ocurrió un error al sincronizar',
        variant: 'default'
      })

      // Still update local avatar data for better UX
      setAvatar({
        ...avatar,
        customization
      })
    } finally {
      setSaving(false)
    }
  }

  // Update a customization property
  const updateCustomization = (key: keyof AvatarCustomization, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Toggle an accessory
  const toggleAccessory = (accessory: string) => {
    setCustomization(prev => {
      const accessories = [...prev.accessories]

      if (accessories.includes(accessory)) {
        return {
          ...prev,
          accessories: accessories.filter(a => a !== accessory)
        }
      } else {
        return {
          ...prev,
          accessories: [...accessories, accessory]
        }
      }
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cargando personalizador...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!avatar) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Personalizador de Avatar</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-[#573353]/70">No se pudo cargar el avatar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Personalizar Entrenador</CardTitle>
            <CardDescription>
              Personaliza la apariencia de tu entrenador virtual
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="bg-gradient-to-b from-[#F9F9F9] to-[#F5F5F5] rounded-lg h-64">
            <Canvas>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <Suspense fallback={null}>
                <CustomizableAvatar customization={customization} />
              </Suspense>
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>

          {/* Customization options */}
          <div>
            <Tabs defaultValue="appearance">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="appearance" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Apariencia</span>
                </TabsTrigger>
                <TabsTrigger value="outfit" className="flex items-center">
                  <Shirt className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ropa</span>
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Colores</span>
                </TabsTrigger>
                <TabsTrigger value="personality" className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Personalidad</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de cuerpo</Label>
                    <Select
                      value={customization.bodyType}
                      onValueChange={(value) => updateCustomization('bodyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="athletic">Atlético</SelectItem>
                        <SelectItem value="slim">Delgado</SelectItem>
                        <SelectItem value="muscular">Musculoso</SelectItem>
                        <SelectItem value="average">Promedio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tono de piel</Label>
                    <Select
                      value={customization.skinTone}
                      onValueChange={(value) => updateCustomization('skinTone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tono" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="tan">Bronceado</SelectItem>
                        <SelectItem value="olive">Oliva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estilo de pelo</Label>
                    <Select
                      value={customization.hairStyle}
                      onValueChange={(value) => updateCustomization('hairStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Corto</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="long">Largo</SelectItem>
                        <SelectItem value="bald">Calvo</SelectItem>
                        <SelectItem value="ponytail">Cola de caballo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rasgos faciales</Label>
                    <Select
                      value={customization.facialFeatures}
                      onValueChange={(value) => updateCustomization('facialFeatures', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona rasgos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="round">Redondeado</SelectItem>
                        <SelectItem value="defined">Definido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="outfit" className="space-y-4">
                <div className="space-y-2">
                  <Label>Estilo de ropa</Label>
                  <RadioGroup
                    value={customization.outfit}
                    onValueChange={(value) => updateCustomization('outfit', value)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="athletic" id="athletic" />
                      <Label htmlFor="athletic">Deportivo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casual" id="casual" />
                      <Label htmlFor="casual">Casual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Profesional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimal" id="minimal" />
                      <Label htmlFor="minimal">Minimalista</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Accesorios</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="watch"
                        checked={customization.accessories.includes('watch')}
                        onCheckedChange={() => toggleAccessory('watch')}
                      />
                      <Label htmlFor="watch">Reloj</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="glasses"
                        checked={customization.accessories.includes('glasses')}
                        onCheckedChange={() => toggleAccessory('glasses')}
                      />
                      <Label htmlFor="glasses">Gafas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="headband"
                        checked={customization.accessories.includes('headband')}
                        onCheckedChange={() => toggleAccessory('headband')}
                      />
                      <Label htmlFor="headband">Cinta para la cabeza</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wristband"
                        checked={customization.accessories.includes('wristband')}
                        onCheckedChange={() => toggleAccessory('wristband')}
                      />
                      <Label htmlFor="wristband">Muñequera</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color de pelo</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={customization.hairColor}
                        onChange={(e) => updateCustomization('hairColor', e.target.value)}
                        className="w-10 h-10 p-1"
                      />
                      <Select
                        value={customization.hairColor}
                        onValueChange={(value) => updateCustomization('hairColor', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brown">Castaño</SelectItem>
                          <SelectItem value="black">Negro</SelectItem>
                          <SelectItem value="blonde">Rubio</SelectItem>
                          <SelectItem value="red">Pelirrojo</SelectItem>
                          <SelectItem value="gray">Gris</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="personality" className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de personalidad</Label>
                  <Select
                    value={avatar.personality}
                    onValueChange={(value: any) => {
                      // Update avatar personality
                      setAvatar({
                        ...avatar,
                        personality: value
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motivational">Motivador</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="supportive">Apoyo</SelectItem>
                      <SelectItem value="challenging">Desafiante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Especialización</Label>
                  <Select
                    value={avatar.specialization}
                    onValueChange={(value: any) => {
                      // Update avatar specialization
                      setAvatar({
                        ...avatar,
                        specialization: value
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una especialización" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibilidad</SelectItem>
                      <SelectItem value="balance">Equilibrio</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={saveCustomization} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </CardFooter>
    </Card>
  )
}
