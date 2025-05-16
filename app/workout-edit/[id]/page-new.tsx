// Componente de servidor
export default function WorkoutEditPageServer({ params }: { params: { id: string } }) {
  // Este componente se ejecuta en el servidor
  const { use } = require('react');
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params);
  const workoutId = unwrappedParams.id;
  
  // Renderizar el componente cliente pasando el ID como prop
  return <WorkoutEditClient workoutId={workoutId} />;
}

// Componente cliente
"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save } from "lucide-react"
import { getWorkoutById, updateWorkout } from "@/lib/supabase-queries"
import { Workout } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

function WorkoutEditClient({ workoutId }: { workoutId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
    distance: "",
    notes: ""
  })
  
  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getWorkoutById(workoutId)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setWorkout(data)
          setFormData({
            name: data.name,
            type: data.type,
            date: data.date,
            sets: data.sets || "",
            reps: data.reps || "",
            weight: data.weight || "",
            duration: data.duration || "",
            distance: data.distance || "",
            notes: data.notes || ""
          })
        } else {
          toast({
            title: "Error",
            description: "No se encontró el entrenamiento",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el entrenamiento",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkout()
  }, [workoutId, router, toast])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const { error } = await updateWorkout(workoutId, {
        name: formData.name,
        type: formData.type,
        date: formData.date,
        sets: formData.sets || null,
        reps: formData.reps || null,
        weight: formData.weight || null,
        duration: formData.duration || null,
        distance: formData.distance || null,
        notes: formData.notes || null
      })
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Entrenamiento actualizado",
        description: "El entrenamiento ha sido actualizado correctamente",
      })
      
      router.push(`/workout-detail/${workoutId}`)
    } catch (error) {
      console.error("Error al actualizar el entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">Editar Entrenamiento</h1>
          <div className="w-9"></div> {/* Spacer para centrar el título */}
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : workout ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contenido del formulario */}
                {/* ... */}
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontró el entrenamiento</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
