"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Save, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

export default function NewGoalPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("personal")
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined)
  const [progress, setProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/welcome")
    }
  }, [user, authLoading, router])

  // Guardar objetivo
  const handleSave = async () => {
    if (!user) return
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título del objetivo es obligatorio",
        variant: "destructive"
      })
      return
    }
    
    setIsSaving(true)
    
    const newGoal = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate ? targetDate.toISOString() : undefined,
      progress,
      category,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('goals')
        .insert(newGoal)
      
      if (error) {
        console.error("Error al guardar objetivo:", error)
        throw error
      }
      
      toast({
        title: "Objetivo creado",
        description: "El objetivo se ha creado correctamente",
      })
      
      // Redirigir a la página de productividad
      setTimeout(() => {
        router.push("/productivity")
      }, 500)
    } catch (error: any) {
      console.error("Error al guardar objetivo:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el objetivo",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <RoutinizeLayout activeTab="productivity" title="Nuevo objetivo">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout activeTab="productivity" title="Nuevo objetivo">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Crear nuevo objetivo</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del objetivo *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="¿Qué quieres lograr?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Añade detalles sobre este objetivo"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="trabajo">Trabajo</SelectItem>
                  <SelectItem value="salud">Salud</SelectItem>
                  <SelectItem value="finanzas">Finanzas</SelectItem>
                  <SelectItem value="educación">Educación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha objetivo (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {targetDate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => setTargetDate(undefined)}
                >
                  Eliminar fecha
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Progreso inicial</Label>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setProgress(value[0])}
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.push("/productivity")}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Guardar objetivo
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
