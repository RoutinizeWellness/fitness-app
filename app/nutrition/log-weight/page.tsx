"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function LogWeightPage() {
  const [weight, setWeight] = useState<number>(70)
  const [date, setDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Aquí iría la lógica para guardar el peso en Supabase
      console.log("Guardando peso:", { weight, date, notes })
      
      // Simular una operación asíncrona
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Peso registrado",
        description: `Se ha guardado tu peso de ${weight} kg para el día ${format(date, 'PPP', { locale: es })}`,
      })
      
      // Redirigir a la página de nutrición
      router.push("/nutrition")
    } catch (error) {
      console.error("Error al guardar el peso:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el registro de peso",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RoutinizeLayout>
      <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Registrar Peso</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
            <div className="space-y-6">
              {/* Selector de fecha */}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selector de peso */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <div className="bg-primary/10 text-primary rounded-md px-2 py-1 text-sm font-medium">
                    {weight} kg
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setWeight(prev => Math.max(prev - 0.1, 30))}
                  >
                    -
                  </Button>
                  
                  <Slider
                    id="weight"
                    value={[weight]}
                    min={30}
                    max={150}
                    step={0.1}
                    onValueChange={(value) => setWeight(value[0])}
                    className="flex-1"
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setWeight(prev => Math.min(prev + 0.1, 150))}
                  >
                    +
                  </Button>
                </div>
                
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 30 && value <= 150) {
                      setWeight(value)
                    }
                  }}
                  step="0.1"
                  min="30"
                  max="150"
                  className="mt-2"
                />
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent"
                  placeholder="Añade notas sobre tu peso actual..."
                />
              </div>
            </div>
          </Card>

          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoutinizeLayout>
  )
}
