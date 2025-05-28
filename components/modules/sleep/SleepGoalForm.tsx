"use client"

import { useState } from "react"
import { 
  Moon, 
  Sun, 
  Clock, 
  Calendar, 
  Heart,
  Activity,
  Target,
  Info
} from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DialogFooter } from "@/components/ui/dialog"
import { SleepGoal } from "@/lib/types/wellness"

interface SleepGoalFormProps {
  userId: string
  currentGoal: SleepGoal | null
  onSave: (goal: SleepGoal) => void
  onCancel: () => void
}

export function SleepGoalForm({ 
  userId, 
  currentGoal, 
  onSave, 
  onCancel 
}: SleepGoalFormProps) {
  const [targetDuration, setTargetDuration] = useState(currentGoal?.targetDuration || 480)
  const [targetBedtime, setTargetBedtime] = useState(currentGoal?.targetBedtime || '23:00')
  const [targetWakeTime, setTargetWakeTime] = useState(currentGoal?.targetWakeTime || '07:00')
  const [targetDeepSleepPercentage, setTargetDeepSleepPercentage] = useState(
    currentGoal?.targetDeepSleepPercentage || 20
  )
  const [targetRemSleepPercentage, setTargetRemSleepPercentage] = useState(
    currentGoal?.targetRemSleepPercentage || 25
  )
  const [targetHrv, setTargetHrv] = useState(currentGoal?.targetHrv || 65)
  
  const handleSubmit = () => {
    const goal: SleepGoal = {
      id: currentGoal?.id,
      userId,
      targetDuration,
      targetBedtime,
      targetWakeTime,
      targetDeepSleepPercentage,
      targetRemSleepPercentage,
      targetHrv,
      isActive: true
    }
    
    onSave(goal)
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="targetDuration">Duración objetivo (horas)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="targetDuration"
            min={360}
            max={600}
            step={15}
            value={[targetDuration]}
            onValueChange={(value) => setTargetDuration(value[0])}
          />
          <span className="w-12 text-center">{Math.floor(targetDuration / 60)}h {targetDuration % 60}m</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetBedtime">Hora de acostarse objetivo</Label>
          <Input
            id="targetBedtime"
            type="time"
            value={targetBedtime}
            onChange={(e) => setTargetBedtime(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetWakeTime">Hora de despertar objetivo</Label>
          <Input
            id="targetWakeTime"
            type="time"
            value={targetWakeTime}
            onChange={(e) => setTargetWakeTime(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="targetDeepSleepPercentage">Sueño profundo objetivo (%)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="targetDeepSleepPercentage"
            min={10}
            max={30}
            step={1}
            value={[targetDeepSleepPercentage]}
            onValueChange={(value) => setTargetDeepSleepPercentage(value[0])}
          />
          <span className="w-8 text-center">{targetDeepSleepPercentage}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="targetRemSleepPercentage">Sueño REM objetivo (%)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="targetRemSleepPercentage"
            min={15}
            max={35}
            step={1}
            value={[targetRemSleepPercentage]}
            onValueChange={(value) => setTargetRemSleepPercentage(value[0])}
          />
          <span className="w-8 text-center">{targetRemSleepPercentage}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="targetHrv">HRV objetivo (ms)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="targetHrv"
            min={30}
            max={100}
            step={1}
            value={[targetHrv]}
            onValueChange={(value) => setTargetHrv(value[0])}
          />
          <span className="w-8 text-center">{targetHrv}</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-700">Recomendaciones para adultos</h4>
            <ul className="text-xs text-blue-600 mt-1 space-y-1 list-disc list-inside">
              <li>Duración: 7-9 horas</li>
              <li>Sueño profundo: 15-25% del tiempo total</li>
              <li>Sueño REM: 20-25% del tiempo total</li>
              <li>HRV: Valores más altos indican mejor recuperación</li>
            </ul>
          </div>
        </div>
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
