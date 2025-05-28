"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { CalendarIcon, ArrowLeft, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

export default function NewTaskPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<string>("medium")
  const [category, setCategory] = useState<string>("personal")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
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

  // Guardar tarea
  const handleSave = async () => {
    if (!user) return

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título de la tarea es obligatorio",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      completed: false,
      priority: priority as 'low' | 'medium' | 'high',
      category,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('tasks')
        .insert(newTask)

      if (error) {
        console.error("Error al guardar tarea:", error)
        throw error
      }

      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado correctamente",
      })

      // Redirigir a la página de productividad
      setTimeout(() => {
        router.push("/productivity")
      }, 500)
    } catch (error: any) {
      console.error("Error al guardar tarea:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la tarea",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <RoutinizeLayout activeTab="productivity" title="Nueva tarea">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout activeTab="productivity" title="Nueva tarea">
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
          <h1 className="text-2xl font-bold">Crear nueva tarea</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la tarea *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="¿Qué necesitas hacer?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Añade detalles sobre esta tarea"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div className="space-y-2">
              <Label>Fecha límite (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => setDueDate(undefined)}
                >
                  Eliminar fecha
                </Button>
              )}
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
                <Save className="mr-2 h-4 w-4" />
                Guardar tarea
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
