"use client"

import { useState } from "react"
import { 
  Moon, 
  Sun, 
  Clock, 
  Calendar, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Heart,
  Activity,
  Thermometer,
  Info,
  Coffee,
  Wine,
  Tv,
  Smartphone
} from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { DialogFooter } from "@/components/ui/dialog"
import { SleepEntry } from "@/lib/types/wellness"

interface AddSleepEntryFormProps {
  userId: string
  onSave: (entry: SleepEntry) => void
  onCancel: () => void
}

export function AddSleepEntryForm({ userId, onSave, onCancel }: AddSleepEntryFormProps) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const [date, setDate] = useState(yesterday.toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('23:00')
  const [endTime, setEndTime] = useState('07:00')
  const [quality, setQuality] = useState(7)
  const [factors, setFactors] = useState({
    alcohol: false,
    caffeine: false,
    screens: false,
    stress: false,
    exercise: false,
    lateMeal: false,
    noise: false,
    temperature: false
  })
  const [notes, setNotes] = useState('')
  
  // Calcular duración en minutos
  const calculateDuration = (): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)
    
    // Si la duración es negativa, significa que el sueño cruza la medianoche
    if (duration < 0) {
      duration += 24 * 60
    }
    
    return duration
  }
  
  const handleSubmit = () => {
    const entry: SleepEntry = {
      userId,
      date,
      startTime,
      endTime,
      duration: calculateDuration(),
      quality,
      factors,
      notes,
      deviceSource: 'manual'
    }
    
    onSave(entry)
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quality">Calidad (1-10)</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="quality"
              min={1}
              max={10}
              step={1}
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
            />
            <span className="w-8 text-center">{quality}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Hora de acostarse</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">Hora de despertar</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Duración</Label>
        <div className="text-lg font-medium">
          {Math.floor(calculateDuration() / 60)}h {calculateDuration() % 60}m
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Factores que afectaron tu sueño</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.alcohol}
              onCheckedChange={(checked) => setFactors({ ...factors, alcohol: checked })}
            />
            <Label>Alcohol</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.caffeine}
              onCheckedChange={(checked) => setFactors({ ...factors, caffeine: checked })}
            />
            <Label>Cafeína</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.screens}
              onCheckedChange={(checked) => setFactors({ ...factors, screens: checked })}
            />
            <Label>Pantallas</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.stress}
              onCheckedChange={(checked) => setFactors({ ...factors, stress: checked })}
            />
            <Label>Estrés</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.exercise}
              onCheckedChange={(checked) => setFactors({ ...factors, exercise: checked })}
            />
            <Label>Ejercicio</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.lateMeal}
              onCheckedChange={(checked) => setFactors({ ...factors, lateMeal: checked })}
            />
            <Label>Comida tardía</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.noise}
              onCheckedChange={(checked) => setFactors({ ...factors, noise: checked })}
            />
            <Label>Ruido</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={factors.temperature}
              onCheckedChange={(checked) => setFactors({ ...factors, temperature: checked })}
            />
            <Label>Temperatura</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          placeholder="Notas sobre tu sueño..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSubmit}>
          Guardar
        </Button3D>
      </DialogFooter>
    </div>
  )
}
