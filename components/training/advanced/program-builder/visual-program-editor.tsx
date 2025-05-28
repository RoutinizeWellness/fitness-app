"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, useDragControls, AnimatePresence, Reorder, useMotionValue } from "framer-motion"
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Layers,
  BarChart3,
  Dumbbell,
  Zap,
  Target,
  Info,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Move,
  Grid,
  Maximize,
  Minimize
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import {
  PeriodizationProgram,
  Mesocycle,
  Microcycle,
  PeriodizedSession,
  VisualProgramBlock,
  TrainingPhase
} from "@/lib/types/advanced-periodization"
import { PeriodizationService } from "@/lib/services/periodization-service"
import { generateBasicProgramStructure } from "@/lib/config/periodization-configs"

interface VisualProgramEditorProps {
  program: PeriodizationProgram
  onSave: (program: PeriodizationProgram) => void
  onCancel: () => void
}

export function VisualProgramEditor({ program, onSave, onCancel }: VisualProgramEditorProps) {
  const [blocks, setBlocks] = useState<VisualProgramBlock[]>([])
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedProgram, setEditedProgram] = useState<PeriodizationProgram>(program)
  const [isDragging, setIsDragging] = useState(false)
  const [showBlockDetails, setShowBlockDetails] = useState(false)
  const [viewMode, setViewMode] = useState<'blocks' | 'timeline'>('blocks')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [history, setHistory] = useState<VisualProgramBlock[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isMultiSelecting, setIsMultiSelecting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get the primary selected block (first in selection array)
  const selectedBlockId = selectedBlockIds.length > 0 ? selectedBlockIds[0] : null

  // History management functions
  const saveToHistory = useCallback((newBlocks: VisualProgramBlock[]) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1)
    // Add current state to history
    newHistory.push(JSON.parse(JSON.stringify(newBlocks)))
    // Update history state
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setBlocks(JSON.parse(JSON.stringify(history[newIndex])))
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setBlocks(JSON.parse(JSON.stringify(history[newIndex])))
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  // Inicializar bloques visuales a partir del programa
  useEffect(() => {
    if (program && program.mesocycles) {
      const visualBlocks: VisualProgramBlock[] = []

      // Crear bloques para mesociclos
      program.mesocycles.forEach((mesocycle, mIndex) => {
        const mesocycleId = mesocycle.id || `mesocycle-${mIndex}`

        visualBlocks.push({
          id: mesocycleId,
          type: 'mesocycle',
          name: mesocycle.name,
          phase: mesocycle.phase,
          position: {
            x: 50,
            y: mIndex * 150
          },
          width: 800,
          height: 120,
          color: getPhaseColor(mesocycle.phase),
          data: mesocycle,
          childrenIds: []
        })

        // Crear bloques para microciclos
        if (mesocycle.microcycles) {
          mesocycle.microcycles.forEach((microcycle, mcIndex) => {
            const microcycleId = microcycle.id || `microcycle-${mIndex}-${mcIndex}`

            visualBlocks.push({
              id: microcycleId,
              type: 'microcycle',
              name: microcycle.name,
              position: {
                x: 100 + mcIndex * 180,
                y: mIndex * 150 + 30
              },
              width: 160,
              height: 80,
              color: microcycle.is_deload ? '#f87171' : '#60a5fa',
              data: microcycle,
              parentId: mesocycleId,
              childrenIds: []
            })

            // Actualizar childrenIds del mesociclo
            const mesocycleBlock = visualBlocks.find(b => b.id === mesocycleId)
            if (mesocycleBlock && mesocycleBlock.childrenIds) {
              mesocycleBlock.childrenIds.push(microcycleId)
            }
          })
        }
      })

      setBlocks(visualBlocks)
      // Initialize history with initial state
      setHistory([JSON.parse(JSON.stringify(visualBlocks))])
      setHistoryIndex(0)
    }
  }, [program])

  // Manejar selección de bloque
  const handleSelectBlock = (blockId: string, isMultiSelect: boolean = false) => {
    if (isDragging) return

    if (isMultiSelect) {
      // Add or remove from selection
      setSelectedBlockIds(prev => {
        if (prev.includes(blockId)) {
          return prev.filter(id => id !== blockId)
        } else {
          return [...prev, blockId]
        }
      })
    } else {
      // Single select
      setSelectedBlockIds([blockId])
    }

    setShowBlockDetails(true)
  }

  // Snap position to grid if enabled
  const snapToGridPosition = useCallback((position: { x: number, y: number }) => {
    if (!snapToGrid) return position

    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    }
  }, [snapToGrid, gridSize])

  // Manejar arrastre de bloque
  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (blockId: string, newPosition: { x: number, y: number }) => {
    setIsDragging(false)

    // Snap to grid if enabled
    const snappedPosition = snapToGridPosition(newPosition)

    // If multiple blocks are selected, move them all
    if (selectedBlockIds.includes(blockId) && selectedBlockIds.length > 1) {
      // Get the dragged block
      const draggedBlock = blocks.find(b => b.id === blockId)
      if (!draggedBlock) return

      // Calculate offset
      const offsetX = snappedPosition.x - draggedBlock.position.x
      const offsetY = snappedPosition.y - draggedBlock.position.y

      // Update all selected blocks
      const updatedBlocks = blocks.map(block => {
        if (selectedBlockIds.includes(block.id)) {
          return {
            ...block,
            position: {
              x: block.position.x + offsetX,
              y: block.position.y + offsetY
            }
          }
        }
        return block
      })

      // Save to history and update state
      saveToHistory(blocks)
      setBlocks(updatedBlocks)
    } else {
      // Just update the single block
      const updatedBlocks = blocks.map(block =>
        block.id === blockId
          ? { ...block, position: snappedPosition }
          : block
      )

      // Save to history and update state
      saveToHistory(blocks)
      setBlocks(updatedBlocks)
    }
  }

  // Añadir nuevo mesociclo
  const addMesocycle = () => {
    const newMesocycleId = uuidv4()
    const lastMesocycle = blocks.filter(b => b.type === 'mesocycle').sort((a, b) => b.position.y - a.position.y)[0]
    const yPosition = lastMesocycle ? lastMesocycle.position.y + 150 : 0

    const newMesocycle: Mesocycle = {
      id: newMesocycleId,
      program_id: program.id,
      name: `Nuevo Mesociclo`,
      phase: 'hypertrophy',
      duration_weeks: 4,
      position: blocks.filter(b => b.type === 'mesocycle').length + 1,
      includes_deload: false,
      microcycles: []
    }

    const newBlock: VisualProgramBlock = {
      id: newMesocycleId,
      type: 'mesocycle',
      name: newMesocycle.name,
      phase: newMesocycle.phase,
      position: {
        x: 50,
        y: yPosition
      },
      width: 800,
      height: 120,
      color: getPhaseColor(newMesocycle.phase),
      data: newMesocycle,
      childrenIds: []
    }

    setBlocks(prevBlocks => [...prevBlocks, newBlock])
    setSelectedBlockId(newMesocycleId)
    setShowBlockDetails(true)

    // Actualizar programa
    setEditedProgram(prev => ({
      ...prev,
      mesocycles: [...(prev.mesocycles || []), newMesocycle]
    }))
  }

  // Añadir nuevo microciclo a un mesociclo
  const addMicrocycle = (mesocycleId: string) => {
    const mesocycleBlock = blocks.find(b => b.id === mesocycleId)
    if (!mesocycleBlock) return

    const mesocycle = mesocycleBlock.data as Mesocycle
    const existingMicrocycles = blocks.filter(b => b.parentId === mesocycleId)
    const newMicrocycleId = uuidv4()

    const newMicrocycle: Microcycle = {
      id: newMicrocycleId,
      mesocycle_id: mesocycleId,
      week_number: existingMicrocycles.length + 1,
      name: `Semana ${existingMicrocycles.length + 1}`,
      volume_multiplier: 1.0,
      intensity_multiplier: 1.0,
      is_deload: false,
      sessions: []
    }

    const newBlock: VisualProgramBlock = {
      id: newMicrocycleId,
      type: 'microcycle',
      name: newMicrocycle.name,
      position: {
        x: 100 + existingMicrocycles.length * 180,
        y: mesocycleBlock.position.y + 30
      },
      width: 160,
      height: 80,
      color: '#60a5fa',
      data: newMicrocycle,
      parentId: mesocycleId,
      childrenIds: []
    }

    setBlocks(prevBlocks => [...prevBlocks, newBlock])

    // Actualizar childrenIds del mesociclo
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === mesocycleId
          ? { ...block, childrenIds: [...(block.childrenIds || []), newMicrocycleId] }
          : block
      )
    )

    // Actualizar programa
    setEditedProgram(prev => {
      const updatedMesocycles = prev.mesocycles?.map(m => {
        if (m.id === mesocycleId) {
          return {
            ...m,
            microcycles: [...(m.microcycles || []), newMicrocycle]
          }
        }
        return m
      })

      return {
        ...prev,
        mesocycles: updatedMesocycles
      }
    })
  }

  // Eliminar bloque
  const deleteBlock = (blockId: string) => {
    const blockToDelete = blocks.find(b => b.id === blockId)
    if (!blockToDelete) return

    if (blockToDelete.type === 'mesocycle') {
      // Eliminar mesociclo y todos sus microciclos
      const childrenIds = blockToDelete.childrenIds || []

      setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== blockId && !childrenIds.includes(b.id)))

      // Actualizar programa
      setEditedProgram(prev => ({
        ...prev,
        mesocycles: prev.mesocycles?.filter(m => m.id !== blockId)
      }))
    } else if (blockToDelete.type === 'microcycle') {
      // Eliminar microciclo
      setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== blockId))

      // Actualizar childrenIds del mesociclo padre
      if (blockToDelete.parentId) {
        setBlocks(prevBlocks =>
          prevBlocks.map(block =>
            block.id === blockToDelete.parentId
              ? { ...block, childrenIds: block.childrenIds?.filter(id => id !== blockId) }
              : block
          )
        )
      }

      // Actualizar programa
      setEditedProgram(prev => {
        const updatedMesocycles = prev.mesocycles?.map(m => {
          if (m.id === blockToDelete.parentId) {
            return {
              ...m,
              microcycles: m.microcycles?.filter(mc => mc.id !== blockId)
            }
          }
          return m
        })

        return {
          ...prev,
          mesocycles: updatedMesocycles
        }
      })
    }

    setSelectedBlockId(null)
    setShowBlockDetails(false)
  }

  // Actualizar bloque
  const updateBlock = (blockId: string, updatedData: any) => {
    const blockToUpdate = blocks.find(b => b.id === blockId)
    if (!blockToUpdate) return

    // Actualizar bloque visual
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              name: updatedData.name || block.name,
              phase: updatedData.phase || block.phase,
              color: updatedData.phase ? getPhaseColor(updatedData.phase) : block.color,
              data: { ...block.data, ...updatedData }
            }
          : block
      )
    )

    // Actualizar programa
    if (blockToUpdate.type === 'mesocycle') {
      setEditedProgram(prev => ({
        ...prev,
        mesocycles: prev.mesocycles?.map(m =>
          m.id === blockId ? { ...m, ...updatedData } : m
        )
      }))
    } else if (blockToUpdate.type === 'microcycle') {
      setEditedProgram(prev => {
        const updatedMesocycles = prev.mesocycles?.map(m => {
          if (m.id === blockToUpdate.parentId) {
            return {
              ...m,
              microcycles: m.microcycles?.map(mc =>
                mc.id === blockId ? { ...mc, ...updatedData } : mc
              )
            }
          }
          return m
        })

        return {
          ...prev,
          mesocycles: updatedMesocycles
        }
      })
    }
  }

  // Guardar programa
  const handleSave = () => {
    // Actualizar posiciones en el programa basado en la visualización
    const updatedProgram = { ...editedProgram }

    // Ordenar mesociclos por posición vertical
    const mesocycleBlocks = blocks
      .filter(b => b.type === 'mesocycle')
      .sort((a, b) => a.position.y - b.position.y)

    // Actualizar posiciones de mesociclos
    updatedProgram.mesocycles = mesocycleBlocks.map((block, index) => {
      const mesocycle = { ...block.data as Mesocycle, position: index + 1 }

      // Ordenar microciclos por posición horizontal
      const microcycleBlocks = blocks
        .filter(b => b.parentId === block.id)
        .sort((a, b) => a.position.x - b.position.x)

      // Actualizar week_number de microciclos
      mesocycle.microcycles = microcycleBlocks.map((mcBlock, mcIndex) => {
        return { ...mcBlock.data as Microcycle, week_number: mcIndex + 1 }
      })

      return mesocycle
    })

    onSave(updatedProgram)
  }

  // Renderizar bloque
  const renderBlock = (block: VisualProgramBlock) => {
    const dragControls = useDragControls()
    const isSelected = selectedBlockIds.includes(block.id)

    // Apply zoom level to dimensions and position
    const scaledPosition = viewMode === 'timeline'
      ? {
          x: block.position.x * zoomLevel,
          y: block.position.y * zoomLevel
        }
      : block.position

    const scaledWidth = viewMode === 'timeline'
      ? block.width * zoomLevel
      : block.width

    const scaledHeight = viewMode === 'timeline'
      ? block.height * zoomLevel
      : block.height

    return (
      <motion.div
        key={block.id}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={containerRef}
        onDragStart={handleDragStart}
        onDragEnd={(_, info) => handleDragEnd(block.id, {
          x: block.position.x + info.offset.x / (viewMode === 'timeline' ? zoomLevel : 1),
          y: block.position.y + info.offset.y / (viewMode === 'timeline' ? zoomLevel : 1)
        })}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: scaledPosition.x,
          y: scaledPosition.y,
          width: scaledWidth,
          height: scaledHeight
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{
          position: 'absolute',
          backgroundColor: block.color,
          borderRadius: '8px',
          boxShadow: isSelected
            ? '0 0 0 2px white, 0 0 0 4px #3b82f6'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: isSelected ? 10 : 1,
          cursor: 'grab'
        }}
        onClick={(e) => handleSelectBlock(block.id, e.ctrlKey || e.metaKey)}
        onPointerDown={(e) => {
          dragControls.start(e)
          if (!isSelected) {
            handleSelectBlock(block.id, e.ctrlKey || e.metaKey)
          }
        }}
        className="flex flex-col justify-center items-center p-2 text-white"
      >
        <div className="font-medium text-center truncate w-full">
          {block.name}
        </div>

        {block.type === 'mesocycle' && block.phase && (
          <Badge variant="outline" className="bg-white/20 text-white border-white/30 mt-1">
            {getPhaseDisplayName(block.phase)}
          </Badge>
        )}

        {block.type === 'microcycle' && (
          <div className="flex items-center mt-1 text-xs">
            <span>Vol: {(block.data as Microcycle).volume_multiplier.toFixed(1)}x</span>
            <span className="mx-1">•</span>
            <span>Int: {(block.data as Microcycle).intensity_multiplier.toFixed(1)}x</span>
          </div>
        )}

        {/* Resize handles for selected blocks */}
        {isSelected && (
          <>
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full cursor-se-resize"
              onPointerDown={(e) => {
                e.stopPropagation()
                // Resize logic would go here
              }}
            />
          </>
        )}
      </motion.div>
    )
  }

  // Renderizar panel de detalles del bloque seleccionado
  const renderBlockDetails = () => {
    if (!selectedBlockId) return null

    const selectedBlock = blocks.find(b => b.id === selectedBlockId)
    if (!selectedBlock) return null

    if (selectedBlock.type === 'mesocycle') {
      const mesocycle = selectedBlock.data as Mesocycle

      return (
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Detalles del Mesociclo</h3>
            <div className="flex space-x-2">
              <Button3D
                variant="outline"
                size="sm"
                onClick={() => addMicrocycle(selectedBlockId)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir Microciclo
              </Button3D>
              <Button3D
                variant="destructive"
                size="sm"
                onClick={() => deleteBlock(selectedBlockId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button3D>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mesocycle-name">Nombre</Label>
              <Input
                id="mesocycle-name"
                value={mesocycle.name}
                onChange={(e) => updateBlock(selectedBlockId, { name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mesocycle-phase">Fase</Label>
              <select
                id="mesocycle-phase"
                value={mesocycle.phase}
                onChange={(e) => updateBlock(selectedBlockId, { phase: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="hypertrophy">Hipertrofia</option>
                <option value="strength">Fuerza</option>
                <option value="power">Potencia</option>
                <option value="endurance">Resistencia</option>
                <option value="deload">Descarga</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mesocycle-duration">Duración (semanas)</Label>
              <Input
                id="mesocycle-duration"
                type="number"
                min={1}
                max={16}
                value={mesocycle.duration_weeks}
                onChange={(e) => updateBlock(selectedBlockId, { duration_weeks: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mesocycle-deload">Incluye Descarga</Label>
              <div className="flex items-center h-10">
                <input
                  id="mesocycle-deload"
                  type="checkbox"
                  checked={mesocycle.includes_deload}
                  onChange={(e) => updateBlock(selectedBlockId, { includes_deload: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="mesocycle-deload" className="ml-2 text-sm">
                  Semana de descarga al final
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volume-level">Nivel de Volumen (1-10)</Label>
              <Input
                id="volume-level"
                type="number"
                min={1}
                max={10}
                value={mesocycle.volume_level || 5}
                onChange={(e) => updateBlock(selectedBlockId, { volume_level: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity-level">Nivel de Intensidad (1-10)</Label>
              <Input
                id="intensity-level"
                type="number"
                min={1}
                max={10}
                value={mesocycle.intensity_level || 5}
                onChange={(e) => updateBlock(selectedBlockId, { intensity_level: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )
    } else if (selectedBlock.type === 'microcycle') {
      const microcycle = selectedBlock.data as Microcycle

      return (
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Detalles del Microciclo</h3>
            <Button3D
              variant="destructive"
              size="sm"
              onClick={() => deleteBlock(selectedBlockId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button3D>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="microcycle-name">Nombre</Label>
              <Input
                id="microcycle-name"
                value={microcycle.name}
                onChange={(e) => updateBlock(selectedBlockId, { name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microcycle-week">Número de Semana</Label>
              <Input
                id="microcycle-week"
                type="number"
                min={1}
                value={microcycle.week_number}
                onChange={(e) => updateBlock(selectedBlockId, { week_number: parseInt(e.target.value) })}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume-multiplier">Multiplicador de Volumen</Label>
              <Input
                id="volume-multiplier"
                type="number"
                min={0.5}
                max={1.5}
                step={0.1}
                value={microcycle.volume_multiplier}
                onChange={(e) => updateBlock(selectedBlockId, { volume_multiplier: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity-multiplier">Multiplicador de Intensidad</Label>
              <Input
                id="intensity-multiplier"
                type="number"
                min={0.5}
                max={1.5}
                step={0.1}
                value={microcycle.intensity_multiplier}
                onChange={(e) => updateBlock(selectedBlockId, { intensity_multiplier: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="microcycle-deload">Semana de Descarga</Label>
              <div className="flex items-center h-10">
                <input
                  id="microcycle-deload"
                  type="checkbox"
                  checked={microcycle.is_deload}
                  onChange={(e) => updateBlock(selectedBlockId, {
                    is_deload: e.target.checked,
                    volume_multiplier: e.target.checked ? 0.6 : 1.0,
                    intensity_multiplier: e.target.checked ? 0.7 : 1.0
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="microcycle-deload" className="ml-2 text-sm">
                  Marcar como semana de descarga
                </label>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  // Render timeline view
  const renderTimelineView = () => {
    // Calculate total program duration in weeks
    const totalWeeks = blocks
      .filter(b => b.type === 'mesocycle')
      .reduce((sum, block) => sum + (block.data as Mesocycle).duration_weeks, 0)

    // Calculate timeline width based on total weeks
    const timelineWidth = Math.max(1200, totalWeeks * 100 * zoomLevel)

    return (
      <div className="relative w-full h-[520px] overflow-auto">
        {/* Timeline header with week markers */}
        <div className="sticky top-0 h-10 bg-background border-b z-10 flex">
          {Array.from({ length: totalWeeks + 1 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 border-r px-2 flex items-center justify-center"
              style={{ width: 100 * zoomLevel }}
            >
              <span className="text-xs font-medium">Semana {i + 1}</span>
            </div>
          ))}
        </div>

        {/* Timeline content */}
        <div
          ref={containerRef}
          className="relative min-h-[480px]"
          style={{ width: timelineWidth }}
        >
          {/* Grid lines */}
          {snapToGrid && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.ceil(timelineWidth / gridSize) }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-800 opacity-30"
                  style={{ left: i * gridSize }}
                />
              ))}
              {Array.from({ length: Math.ceil(480 / gridSize) }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-800 opacity-30"
                  style={{ top: i * gridSize }}
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {blocks.map(block => renderBlock(block))}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Render editor controls
  const renderEditorControls = () => {
    return (
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button3D
            variant={viewMode === 'blocks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('blocks')}
          >
            <Layers className="h-4 w-4 mr-1" />
            Bloques
          </Button3D>
          <Button3D
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Línea de tiempo
          </Button3D>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <Button3D
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <Undo className="h-4 w-4" />
        </Button3D>

        <Button3D
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <Redo className="h-4 w-4" />
        </Button3D>

        <Separator orientation="vertical" className="h-8" />

        <Button3D
          variant={snapToGrid ? 'default' : 'outline'}
          size="icon"
          onClick={() => setSnapToGrid(!snapToGrid)}
          title="Ajustar a cuadrícula"
        >
          <Grid className="h-4 w-4" />
        </Button3D>

        {viewMode === 'timeline' && (
          <>
            <Button3D
              variant="outline"
              size="icon"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button3D>

            <div className="text-xs font-medium w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </div>

            <Button3D
              variant="outline"
              size="icon"
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
              disabled={zoomLevel >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button3D>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{program.name}</h2>
          <p className="text-muted-foreground">{program.description}</p>
        </div>

        <div className="flex space-x-2">
          <Button3D variant="outline" onClick={onCancel}>
            Cancelar
          </Button3D>
          <Button3D onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Programa
          </Button3D>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Card3D className="h-[600px] overflow-hidden">
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>Editor Visual</Card3DTitle>
                <div className="flex items-center space-x-2">
                  <Button3D size="sm" onClick={addMesocycle}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir Mesociclo
                  </Button3D>
                </div>
              </div>
              {renderEditorControls()}
            </Card3DHeader>
            <Card3DContent>
              {viewMode === 'timeline' ? (
                renderTimelineView()
              ) : (
                <div
                  ref={containerRef}
                  className="relative w-full h-[520px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto"
                >
                  {/* Grid lines */}
                  {snapToGrid && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: Math.ceil(1000 / gridSize) }).map((_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-800 opacity-30"
                          style={{ left: i * gridSize }}
                        />
                      ))}
                      {Array.from({ length: Math.ceil(520 / gridSize) }).map((_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-800 opacity-30"
                          style={{ top: i * gridSize }}
                        />
                      ))}
                    </div>
                  )}

                  <AnimatePresence>
                    {blocks.map(block => renderBlock(block))}
                  </AnimatePresence>
                </div>
              )}
            </Card3DContent>
          </Card3D>
        </div>

        {showBlockDetails && (
          <div className="w-[400px]">
            <Card3D>
              <Card3DContent>
                {renderBlockDetails()}
              </Card3DContent>
            </Card3D>
          </div>
        )}
      </div>
    </div>
  )
}

// Funciones auxiliares

function getPhaseColor(phase?: TrainingPhase): string {
  if (!phase) return '#6366f1'

  switch (phase) {
    case 'hypertrophy': return '#8b5cf6' // Púrpura
    case 'strength': return '#2563eb' // Azul
    case 'power': return '#f59e0b' // Ámbar
    case 'endurance': return '#10b981' // Verde
    case 'deload': return '#f87171' // Rojo claro
    default: return '#6366f1' // Índigo
  }
}

function getPhaseDisplayName(phase: TrainingPhase): string {
  const names: Record<TrainingPhase, string> = {
    hypertrophy: "Hipertrofia",
    strength: "Fuerza",
    power: "Potencia",
    endurance: "Resistencia",
    deload: "Descarga"
  }
  return names[phase] || phase
}
