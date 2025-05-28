"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dumbbell, Brain, Info } from "lucide-react"
import { useUserExperience } from "@/contexts/user-experience-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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

interface ExperienceModeToggleProps {
  variant?: "switch" | "button" | "icon"
  className?: string
}

export function ExperienceModeToggle({
  variant = "switch",
  className = ""
}: ExperienceModeToggleProps) {
  const {
    interfaceMode,
    updateInterfaceMode,
    experienceLevel,
    isAdvancedUser,
    isBeginnerUser
  } = useUserExperience()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleToggle = async () => {
    // Si el usuario es principiante y quiere cambiar a modo avanzado, mostrar diálogo
    if (interfaceMode === 'beginner' && isBeginnerUser()) {
      setIsDialogOpen(true)
      return
    }
    
    // En otros casos, cambiar directamente
    await toggleMode()
  }
  
  const toggleMode = async () => {
    setIsLoading(true)
    
    try {
      const newMode = interfaceMode === 'beginner' ? 'advanced' : 'beginner'
      const success = await updateInterfaceMode(newMode)
      
      if (success) {
        toast({
          title: `Modo ${newMode === 'beginner' ? 'principiante' : 'avanzado'} activado`,
          description: newMode === 'beginner' 
            ? "Interfaz simplificada con guías y tutoriales." 
            : "Interfaz avanzada con métricas detalladas y herramientas de periodización.",
        })
      } else {
        toast({
          title: "Error al cambiar el modo",
          description: "No se pudo actualizar el modo de interfaz.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error al cambiar modo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cambiar el modo de interfaz.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }
  
  // Renderizar según la variante
  if (variant === "switch") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Switch
          id="experience-mode"
          checked={interfaceMode === 'advanced'}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <Label htmlFor="experience-mode" className="cursor-pointer">
          {interfaceMode === 'advanced' ? 'Modo avanzado' : 'Modo principiante'}
        </Label>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Cambia entre la interfaz para principiantes y avanzados</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={toggleMode}
        />
      </div>
    )
  }
  
  if (variant === "button") {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {interfaceMode === 'advanced' ? (
            <>
              <Brain className="h-4 w-4 mr-2" />
              <span>Modo avanzado</span>
            </>
          ) : (
            <>
              <Dumbbell className="h-4 w-4 mr-2" />
              <span>Modo principiante</span>
            </>
          )}
        </Button>
        
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={toggleMode}
        />
      </div>
    )
  }
  
  // Variante de icono
  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              disabled={isLoading}
            >
              {interfaceMode === 'advanced' ? (
                <Brain className="h-5 w-5" />
              ) : (
                <Dumbbell className="h-5 w-5" />
              )}
              <span className="sr-only">
                {interfaceMode === 'advanced' ? 'Modo avanzado' : 'Modo principiante'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{interfaceMode === 'advanced' ? 'Cambiar a modo principiante' : 'Cambiar a modo avanzado'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={toggleMode}
      />
    </div>
  )
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function ConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cambiar a modo avanzado?</DialogTitle>
          <DialogDescription>
            El modo avanzado muestra métricas detalladas, herramientas de periodización y explicaciones científicas.
            Está diseñado para atletas con experiencia que entienden conceptos avanzados de entrenamiento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Puedes volver al modo principiante en cualquier momento desde la configuración.
          </p>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onConfirm}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
