"use client"

import { useState } from "react"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DialogFooter } from "@/components/ui/dialog"
import { 
  VolumeLandmark, 
  MUSCLE_GROUP_DISPLAY_NAMES 
} from "@/lib/types/volume-landmarks"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface VolumeLandmarksEditorProps {
  landmark: VolumeLandmark
  onSave: (landmark: VolumeLandmark) => void
  onCancel: () => void
}

export function VolumeLandmarksEditor({
  landmark,
  onSave,
  onCancel
}: VolumeLandmarksEditorProps) {
  const [values, setValues] = useState({
    mev: landmark.mev,
    mav: landmark.mav,
    mrv: landmark.mrv
  })
  const [errors, setErrors] = useState<string[]>([])

  // Handle input change
  const handleChange = (field: 'mev' | 'mav' | 'mrv', value: number) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Validate values
  const validateValues = (): boolean => {
    const newErrors: string[] = []
    
    if (values.mev <= 0) {
      newErrors.push("El MEV debe ser mayor que 0")
    }
    
    if (values.mav <= values.mev) {
      newErrors.push("El MAV debe ser mayor que el MEV")
    }
    
    if (values.mrv <= values.mav) {
      newErrors.push("El MRV debe ser mayor que el MAV")
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle save
  const handleSave = () => {
    if (validateValues()) {
      onSave({
        ...landmark,
        mev: values.mev,
        mav: values.mav,
        mrv: values.mrv
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mev">
          MEV (Volumen Mínimo Efectivo)
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="mev-slider"
            min={1}
            max={30}
            step={1}
            value={[values.mev]}
            onValueChange={(value) => handleChange('mev', value[0])}
          />
          <Input
            id="mev"
            type="number"
            min={1}
            max={30}
            value={values.mev}
            onChange={(e) => handleChange('mev', parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
        <p className="text-xs text-gray-500">
          Mínimo número de series semanales para estimular crecimiento muscular
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mav">
          MAV (Volumen Adaptativo Máximo)
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="mav-slider"
            min={1}
            max={30}
            step={1}
            value={[values.mav]}
            onValueChange={(value) => handleChange('mav', value[0])}
          />
          <Input
            id="mav"
            type="number"
            min={1}
            max={30}
            value={values.mav}
            onChange={(e) => handleChange('mav', parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
        <p className="text-xs text-gray-500">
          Volumen óptimo para máximo crecimiento muscular
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mrv">
          MRV (Volumen Máximo Recuperable)
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="mrv-slider"
            min={1}
            max={30}
            step={1}
            value={[values.mrv]}
            onValueChange={(value) => handleChange('mrv', value[0])}
          />
          <Input
            id="mrv"
            type="number"
            min={1}
            max={30}
            value={values.mrv}
            onChange={(e) => handleChange('mrv', parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
        <p className="text-xs text-gray-500">
          Máximo volumen que puedes recuperar sin sobreentrenamiento
        </p>
      </div>
      
      {/* Visual representation */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">
          Visualización de volumen para {MUSCLE_GROUP_DISPLAY_NAMES[landmark.muscle_group]}
        </h4>
        <div className="relative h-8 bg-gray-100 rounded-md">
          {/* MEV marker */}
          <div 
            className="absolute h-full w-1 bg-yellow-500"
            style={{ left: `${(values.mev / 30) * 100}%` }}
          />
          <div 
            className="absolute text-xs text-yellow-700"
            style={{ left: `${(values.mev / 30) * 100}%`, transform: 'translateX(-50%)' }}
          >
            MEV
          </div>
          
          {/* MAV marker */}
          <div 
            className="absolute h-full w-1 bg-green-500"
            style={{ left: `${(values.mav / 30) * 100}%` }}
          />
          <div 
            className="absolute text-xs text-green-700"
            style={{ left: `${(values.mav / 30) * 100}%`, transform: 'translateX(-50%)' }}
          >
            MAV
          </div>
          
          {/* MRV marker */}
          <div 
            className="absolute h-full w-1 bg-red-500"
            style={{ left: `${(values.mrv / 30) * 100}%` }}
          />
          <div 
            className="absolute text-xs text-red-700"
            style={{ left: `${(values.mrv / 30) * 100}%`, transform: 'translateX(-50%)' }}
          >
            MRV
          </div>
          
          {/* Current volume indicator */}
          {landmark.current_volume !== undefined && (
            <div 
              className="absolute h-full w-2 bg-blue-500"
              style={{ left: `${(landmark.current_volume / 30) * 100}%` }}
            />
          )}
          
          {/* Optimal zone */}
          <div 
            className="absolute h-full bg-green-100"
            style={{ 
              left: `${(values.mev / 30) * 100}%`, 
              width: `${((values.mav - values.mev) / 30) * 100}%` 
            }}
          />
          
          {/* Approaching MRV zone */}
          <div 
            className="absolute h-full bg-blue-100"
            style={{ 
              left: `${(values.mav / 30) * 100}%`, 
              width: `${((values.mrv - values.mav) / 30) * 100}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
          <span>25</span>
          <span>30</span>
        </div>
      </div>
      
      {/* Validation errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSave}>
          Guardar cambios
        </Button3D>
      </DialogFooter>
    </div>
  )
}
