"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowDown, 
  ArrowUp, 
  Filter,
  Calculator,
  Clock,
  BarChart3,
  Dumbbell,
  Zap,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { PeriodizedSession, PeriodizedExercise } from "@/lib/types/advanced-periodization"

interface SpreadsheetEditorProps {
  session: PeriodizedSession
  onSave: (session: PeriodizedSession) => void
  onCancel: () => void
}

// Tipos para la hoja de cálculo
interface SpreadsheetCell {
  value: string
  formula?: string
  isEditing?: boolean
  isSelected?: boolean
  isHeader?: boolean
  type?: 'text' | 'number' | 'select' | 'formula'
  options?: string[]
}

interface SpreadsheetRow {
  id: string
  exerciseId?: string
  cells: SpreadsheetCell[]
  isSelected?: boolean
}

// Columnas de la hoja de cálculo
const COLUMNS = [
  { id: 'exercise', name: 'Ejercicio', type: 'text', width: 200 },
  { id: 'sets', name: 'Series', type: 'number', width: 70 },
  { id: 'reps', name: 'Reps', type: 'text', width: 80 },
  { id: 'weight', name: 'Peso', type: 'text', width: 80 },
  { id: 'rir', name: 'RIR', type: 'number', width: 60 },
  { id: 'rpe', name: 'RPE', type: 'number', width: 60 },
  { id: 'rest', name: 'Descanso', type: 'text', width: 90 },
  { id: 'tempo', name: 'Tempo', type: 'text', width: 80 },
  { id: 'volume', name: 'Volumen', type: 'formula', width: 90 },
  { id: 'intensity', name: 'Intensidad', type: 'formula', width: 90 }
]

export function SpreadsheetEditor({ session, onSave, onCancel }: SpreadsheetEditorProps) {
  const [rows, setRows] = useState<SpreadsheetRow[]>([])
  const [selectedCells, setSelectedCells] = useState<{ rowIndex: number, colIndex: number }[]>([])
  const [editingCell, setEditingCell] = useState<{ rowIndex: number, colIndex: number } | null>(null)
  const [editedSession, setEditedSession] = useState<PeriodizedSession>(session)
  const [showFormulaDialog, setShowFormulaDialog] = useState(false)
  const [currentFormula, setCurrentFormula] = useState('')
  const [formulaCell, setFormulaCell] = useState<{ rowIndex: number, colIndex: number } | null>(null)
  
  // Inicializar filas a partir de la sesión
  useEffect(() => {
    if (session && session.exercises) {
      const initialRows: SpreadsheetRow[] = session.exercises.map(exercise => {
        return {
          id: exercise.id,
          exerciseId: exercise.id,
          cells: [
            { value: exercise.name, type: 'text' },
            { value: exercise.sets.toString(), type: 'number' },
            { value: exercise.reps, type: 'text' },
            { value: exercise.weight || '', type: 'text' },
            { value: exercise.rir?.toString() || '', type: 'number' },
            { value: exercise.rpe?.toString() || '', type: 'number' },
            { value: exercise.rest_seconds ? `${exercise.rest_seconds}s` : '', type: 'text' },
            { value: exercise.tempo || '', type: 'text' },
            { 
              value: calculateVolume(exercise).toString(), 
              formula: 'sets * reps', 
              type: 'formula' 
            },
            { 
              value: calculateIntensity(exercise).toString(), 
              formula: 'weight * (10 - rir) / 10', 
              type: 'formula' 
            }
          ]
        }
      })
      
      setRows(initialRows)
    }
  }, [session])
  
  // Calcular volumen (series * repeticiones)
  const calculateVolume = (exercise: PeriodizedExercise): number => {
    const sets = exercise.sets
    const reps = parseInt(exercise.reps.split('-')[0]) // Usar el primer número si es un rango
    return sets * reps
  }
  
  // Calcular intensidad relativa
  const calculateIntensity = (exercise: PeriodizedExercise): number => {
    const weight = parseFloat(exercise.weight || '0')
    const rir = exercise.rir || 0
    return weight * (10 - rir) / 10
  }
  
  // Manejar clic en celda
  const handleCellClick = (rowIndex: number, colIndex: number, isShiftKey: boolean = false) => {
    // Si se está editando una celda, guardar cambios primero
    if (editingCell) {
      finishEditing()
    }
    
    // Seleccionar celda
    if (isShiftKey && selectedCells.length > 0) {
      // Selección múltiple con Shift
      const lastSelected = selectedCells[selectedCells.length - 1]
      const startRow = Math.min(lastSelected.rowIndex, rowIndex)
      const endRow = Math.max(lastSelected.rowIndex, rowIndex)
      const startCol = Math.min(lastSelected.colIndex, colIndex)
      const endCol = Math.max(lastSelected.colIndex, colIndex)
      
      const newSelection = []
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          newSelection.push({ rowIndex: r, colIndex: c })
        }
      }
      
      setSelectedCells(newSelection)
    } else if (isShiftKey) {
      // Añadir a la selección existente
      setSelectedCells([...selectedCells, { rowIndex, colIndex }])
    } else {
      // Nueva selección
      setSelectedCells([{ rowIndex, colIndex }])
    }
  }
  
  // Manejar doble clic en celda para editar
  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    // No permitir editar celdas de fórmula con doble clic
    if (COLUMNS[colIndex].type === 'formula') {
      setFormulaCell({ rowIndex, colIndex })
      setCurrentFormula(rows[rowIndex].cells[colIndex].formula || '')
      setShowFormulaDialog(true)
      return
    }
    
    setEditingCell({ rowIndex, colIndex })
    setSelectedCells([{ rowIndex, colIndex }])
  }
  
  // Manejar cambio en celda
  const handleCellChange = (value: string) => {
    if (!editingCell) return
    
    const { rowIndex, colIndex } = editingCell
    
    // Actualizar valor de la celda
    setRows(prevRows => {
      const newRows = [...prevRows]
      newRows[rowIndex].cells[colIndex].value = value
      return newRows
    })
  }
  
  // Finalizar edición
  const finishEditing = () => {
    if (!editingCell) return
    
    // Recalcular fórmulas si es necesario
    recalculateFormulas()
    
    setEditingCell(null)
  }
  
  // Recalcular fórmulas
  const recalculateFormulas = () => {
    setRows(prevRows => {
      const newRows = [...prevRows]
      
      // Para cada fila
      newRows.forEach((row, rowIndex) => {
        // Para cada celda de fórmula
        row.cells.forEach((cell, colIndex) => {
          if (cell.type === 'formula' && cell.formula) {
            try {
              // Obtener valores de las celdas referenciadas
              const sets = parseInt(row.cells[1].value) || 0
              const reps = parseInt(row.cells[2].value.split('-')[0]) || 0
              const weight = parseFloat(row.cells[3].value) || 0
              const rir = parseInt(row.cells[4].value) || 0
              
              // Evaluar fórmula
              let result = 0
              if (cell.formula === 'sets * reps') {
                result = sets * reps
              } else if (cell.formula === 'weight * (10 - rir) / 10') {
                result = weight * (10 - rir) / 10
              }
              
              // Actualizar valor
              newRows[rowIndex].cells[colIndex].value = result.toFixed(1)
            } catch (error) {
              console.error('Error al calcular fórmula:', error)
            }
          }
        })
      })
      
      return newRows
    })
  }
  
  // Añadir nueva fila
  const addRow = () => {
    const newId = `exercise-${Date.now()}`
    const newRow: SpreadsheetRow = {
      id: newId,
      cells: COLUMNS.map(col => {
        if (col.type === 'formula') {
          return { 
            value: '0', 
            formula: col.id === 'volume' ? 'sets * reps' : 'weight * (10 - rir) / 10',
            type: 'formula' 
          }
        }
        return { value: '', type: col.type }
      })
    }
    
    setRows([...rows, newRow])
  }
  
  // Eliminar filas seleccionadas
  const deleteSelectedRows = () => {
    const selectedRowIndices = [...new Set(selectedCells.map(cell => cell.rowIndex))]
    
    if (selectedRowIndices.length === 0) return
    
    // Filtrar filas no seleccionadas
    const newRows = rows.filter((_, index) => !selectedRowIndices.includes(index))
    
    setRows(newRows)
    setSelectedCells([])
  }
  
  // Guardar cambios
  const handleSave = () => {
    // Convertir filas a ejercicios
    const exercises: PeriodizedExercise[] = rows.map(row => {
      return {
        id: row.id,
        name: row.cells[0].value,
        sets: parseInt(row.cells[1].value) || 0,
        reps: row.cells[2].value,
        weight: row.cells[3].value,
        rir: parseInt(row.cells[4].value) || undefined,
        rpe: parseInt(row.cells[5].value) || undefined,
        rest_seconds: parseInt(row.cells[6].value) || undefined,
        tempo: row.cells[7].value
      }
    })
    
    // Actualizar sesión
    const updatedSession: PeriodizedSession = {
      ...editedSession,
      exercises
    }
    
    onSave(updatedSession)
  }
  
  // Renderizar celda
  const renderCell = (cell: SpreadsheetCell, rowIndex: number, colIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex
    const isSelected = selectedCells.some(sc => sc.rowIndex === rowIndex && sc.colIndex === colIndex)
    const column = COLUMNS[colIndex]
    
    return (
      <td 
        key={`${rowIndex}-${colIndex}`}
        className={`border px-2 py-1 ${isSelected ? 'bg-primary/20' : ''} ${cell.type === 'formula' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
        style={{ width: column.width }}
        onClick={(e) => handleCellClick(rowIndex, colIndex, e.shiftKey)}
        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
      >
        {isEditing ? (
          <Input
            value={cell.value}
            onChange={(e) => handleCellChange(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') finishEditing()
              if (e.key === 'Escape') {
                setEditingCell(null)
                setSelectedCells([{ rowIndex, colIndex }])
              }
            }}
            autoFocus
            className="h-7 p-1"
          />
        ) : cell.type === 'formula' ? (
          <div className="flex justify-between items-center">
            <span>{cell.value}</span>
            <Button3D 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setFormulaCell({ rowIndex, colIndex })
                setCurrentFormula(cell.formula || '')
                setShowFormulaDialog(true)
              }}
            >
              <Calculator className="h-3 w-3" />
            </Button3D>
          </div>
        ) : (
          <span>{cell.value}</span>
        )}
      </td>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">{session.name}</h2>
        
        <div className="flex space-x-2">
          <Button3D variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir Ejercicio
          </Button3D>
          
          <Button3D 
            variant="outline" 
            size="sm" 
            onClick={deleteSelectedRows}
            disabled={selectedCells.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button3D>
          
          <Button3D variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button3D>
          
          <Button3D size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </Button3D>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {COLUMNS.map((column, index) => (
                <th 
                  key={column.id}
                  className="border px-2 py-1 text-left font-medium text-sm"
                  style={{ width: column.width }}
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.cells.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Diálogo para editar fórmulas */}
      <Dialog open={showFormulaDialog} onOpenChange={setShowFormulaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fórmula</DialogTitle>
            <DialogDescription>
              Define la fórmula para calcular este valor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formula">Fórmula</Label>
              <Input
                id="formula"
                value={currentFormula}
                onChange={(e) => setCurrentFormula(e.target.value)}
                placeholder="Ej: sets * reps"
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: sets, reps, weight, rir, rpe
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Fórmulas predefinidas</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button3D 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentFormula('sets * reps')}
                >
                  Volumen (sets * reps)
                </Button3D>
                <Button3D 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentFormula('weight * (10 - rir) / 10')}
                >
                  Intensidad relativa
                </Button3D>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowFormulaDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={() => {
              if (formulaCell) {
                // Actualizar fórmula
                setRows(prevRows => {
                  const newRows = [...prevRows]
                  newRows[formulaCell.rowIndex].cells[formulaCell.colIndex].formula = currentFormula
                  return newRows
                })
                
                // Recalcular
                recalculateFormulas()
                
                setShowFormulaDialog(false)
              }
            }}>
              Aplicar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
