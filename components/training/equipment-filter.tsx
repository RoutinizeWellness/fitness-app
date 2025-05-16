"use client"

import { useState } from "react"
import { ChevronDown, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface EquipmentOption {
  id: string
  label: string
}

interface EquipmentFilterProps {
  onFilterChange?: (selectedEquipment: string[]) => void
  className?: string
  showQuickFilter?: boolean
}

export function EquipmentFilter({
  onFilterChange,
  className,
  showQuickFilter = true
}: EquipmentFilterProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [quickFilter, setQuickFilter] = useState<string | null>(null)

  const equipmentOptions: EquipmentOption[] = [
    { id: 'none', label: 'No equipment' },
    { id: 'dumbbells', label: 'Dumbbells' },
    { id: 'barbell', label: 'Barbell' },
    { id: 'kettlebell', label: 'Kettlebell' },
    { id: 'resistance_bands', label: 'Resistance bands' },
    { id: 'bench', label: 'Bench' },
    { id: 'pull_up_bar', label: 'Pull-up bar' },
    { id: 'yoga_mat', label: 'Yoga mat' },
    { id: 'foam_roller', label: 'Foam roller' },
    { id: 'medicine_ball', label: 'Medicine ball' },
  ]

  const handleEquipmentToggle = (equipmentId: string) => {
    let newSelection: string[]

    if (selectedEquipment.includes(equipmentId)) {
      newSelection = selectedEquipment.filter(id => id !== equipmentId)
    } else {
      newSelection = [...selectedEquipment, equipmentId]
    }

    setSelectedEquipment(newSelection)

    if (onFilterChange) {
      onFilterChange(newSelection)
    }
  }

  const handleQuickFilter = (filter: string | null) => {
    setQuickFilter(filter)

    if (filter === 'bodyweight') {
      setSelectedEquipment(['none'])
      if (onFilterChange) {
        onFilterChange(['none'])
      }
    } else if (filter === 'saved') {
      // Aquí podrías cargar los entrenamientos guardados
      // Por ahora solo cambiamos el filtro visual
    } else {
      setSelectedEquipment([])
      if (onFilterChange) {
        onFilterChange([])
      }
    }
  }

  return (
    <div className={`flex gap-3 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 justify-between rounded-full shadow-sm border-gray-200"
          >
            <span className="truncate">
              {selectedEquipment.length === 0
                ? "My equipment"
                : `${selectedEquipment.length} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl">
          <DropdownMenuLabel>Available Equipment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {equipmentOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={selectedEquipment.includes(option.id)}
              onCheckedChange={() => handleEquipmentToggle(option.id)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {showQuickFilter && (
        <>
          <Button
            variant={quickFilter === 'bodyweight' ? "pill" : "outline"}
            size="pill"
            className={quickFilter === 'bodyweight'
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "border-gray-200 shadow-sm"
            }
            onClick={() => handleQuickFilter(quickFilter === 'bodyweight' ? null : 'bodyweight')}
          >
            Bodyweight
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`rounded-full shadow-sm border-gray-200 ${quickFilter === 'saved' ? "bg-primary/10" : ""}`}
            onClick={() => handleQuickFilter(quickFilter === 'saved' ? null : 'saved')}
          >
            <Bookmark className={`h-4 w-4 ${quickFilter === 'saved' ? "fill-primary" : ""}`} />
          </Button>
        </>
      )}
    </div>
  )
}
