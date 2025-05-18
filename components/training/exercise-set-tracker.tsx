"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Circle, Edit, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface ExerciseSet {
  id: string
  weight: number
  reps: number
  completed: boolean
  notes?: string
}

interface ExerciseSetTrackerProps {
  sets: ExerciseSet[]
  onChange: (sets: ExerciseSet[]) => void
  onComplete: () => void
  showAddButton?: boolean
}

export default function ExerciseSetTracker({
  sets,
  onChange,
  onComplete,
  showAddButton = true
}: ExerciseSetTrackerProps) {
  const [editingSetId, setEditingSetId] = useState<string | null>(null)

  // Mark a set as completed or not completed
  const toggleSetCompletion = (setId: string) => {
    const updatedSets = sets.map(set => 
      set.id === setId ? { ...set, completed: !set.completed } : set
    )
    onChange(updatedSets)
    
    // Check if all sets are completed
    if (updatedSets.every(set => set.completed)) {
      onComplete()
    }
  }

  // Update set weight
  const updateSetWeight = (setId: string, weight: number) => {
    const updatedSets = sets.map(set => 
      set.id === setId ? { ...set, weight } : set
    )
    onChange(updatedSets)
  }

  // Update set reps
  const updateSetReps = (setId: string, reps: number) => {
    const updatedSets = sets.map(set => 
      set.id === setId ? { ...set, reps } : set
    )
    onChange(updatedSets)
  }

  // Add a new set
  const addSet = () => {
    const lastSet = sets[sets.length - 1]
    const newSet: ExerciseSet = {
      id: crypto.randomUUID(),
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 10,
      completed: false
    }
    onChange([...sets, newSet])
  }

  // Remove a set
  const removeSet = (setId: string) => {
    const updatedSets = sets.filter(set => set.id !== setId)
    onChange(updatedSets)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-[#573353]/70 px-2">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Peso</div>
        <div className="col-span-3">Reps</div>
        <div className="col-span-5 text-right">Estado</div>
      </div>
      
      <AnimatePresence>
        {sets.map((set, index) => (
          <motion.div 
            key={set.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl ${
              set.completed 
                ? 'bg-[#5DE292]/10 border border-[#5DE292]/20' 
                : 'bg-[#F9F9F9] border border-[#F9F9F9]'
            }`}
          >
            <div className="col-span-1 font-medium text-[#573353]">{index + 1}</div>
            
            {editingSetId === set.id ? (
              <>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={set.weight}
                    onChange={(e) => updateSetWeight(set.id, Number(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSetReps(set.id, Number(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div className="col-span-5 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 rounded-lg border-[#573353]/20"
                    onClick={() => setEditingSetId(null)}
                  >
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 rounded-lg border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => removeSet(set.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-3 font-medium text-[#573353]">
                  {set.weight} kg
                </div>
                <div className="col-span-3 font-medium text-[#573353]">
                  {set.reps} reps
                </div>
                <div className="col-span-5 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setEditingSetId(set.id)}
                  >
                    <Edit className="h-4 w-4 text-[#573353]/70" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => toggleSetCompletion(set.id)}
                  >
                    {set.completed ? (
                      <CheckCircle className="h-5 w-5 text-[#5DE292]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#573353]/30" />
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {showAddButton && (
        <Button
          variant="outline"
          className="w-full mt-2 border-dashed border-[#573353]/20 text-[#573353]/70 hover:bg-[#573353]/5 rounded-xl"
          onClick={addSet}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir serie
        </Button>
      )}
    </div>
  )
}
