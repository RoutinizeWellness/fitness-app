'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeButton } from '@/components/ui/safe-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Edit, 
  Trash2, 
  PlusCircle, 
  Dumbbell,
  Calendar,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  goal: string;
  frequency: string;
  duration?: number;
  exercises?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  lastCompleted?: Date;
  progress?: number;
}

interface FixedTrainingPlanDisplayProps {
  routines: WorkoutRoutine[];
  isLoading: boolean;
  isAdmin?: boolean;
  onStartWorkout: (routineId: string) => void;
  onEditRoutine: (routineId: string) => void;
  onDeleteRoutine: (routineId: string) => void;
  onCreateRoutine: () => void;
  className?: string;
}

export function FixedTrainingPlanDisplay({
  routines,
  isLoading,
  isAdmin = false,
  onStartWorkout,
  onEditRoutine,
  onDeleteRoutine,
  onCreateRoutine,
  className
}: FixedTrainingPlanDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para obtener el color del objetivo
  const getGoalColor = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'hipertrofia':
        return 'border-l-purple-500 bg-purple-50';
      case 'fuerza':
        return 'border-l-blue-500 bg-blue-50';
      case 'resistencia':
        return 'border-l-green-500 bg-green-50';
      case 'pérdida de peso':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Función para obtener el color del badge
  const getBadgeVariant = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'hipertrofia':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fuerza':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resistencia':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pérdida de peso':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Renderizar skeleton mientras carga
  if (isLoading || !mounted) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Renderizar estado vacío
  if (routines.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Mi Plan de Entrenamiento</h2>
          {isAdmin && (
            <SafeButton
              variant="outline"
              size="sm"
              onClick={onCreateRoutine}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nueva rutina
            </SafeButton>
          )}
        </div>
        
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">No tienes rutinas de entrenamiento</h3>
              <p className="text-gray-500 max-w-md">
                Crea tu primera rutina de entrenamiento para comenzar tu viaje fitness
              </p>
            </div>
            {isAdmin && (
              <SafeButton onClick={onCreateRoutine} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear primera rutina
              </SafeButton>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Renderizar rutinas
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mi Plan de Entrenamiento</h2>
        {isAdmin && (
          <SafeButton
            variant="outline"
            size="sm"
            onClick={onCreateRoutine}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva rutina
          </SafeButton>
        )}
      </div>

      <div className="grid gap-4">
        {routines.map((routine) => (
          <Card 
            key={routine.id} 
            className={cn(
              "border-l-4 transition-all duration-200 hover:shadow-md",
              getGoalColor(routine.goal)
            )}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{routine.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getBadgeVariant(routine.goal)}>
                      <Target className="h-3 w-3 mr-1" />
                      {routine.goal}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {routine.frequency}
                    </Badge>
                    {routine.duration && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {routine.duration} min
                      </Badge>
                    )}
                    {routine.exercises && (
                      <Badge variant="outline">
                        <Dumbbell className="h-3 w-3 mr-1" />
                        {routine.exercises} ejercicios
                      </Badge>
                    )}
                  </div>

                  {routine.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium">{routine.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${routine.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <SafeButton 
                    size="sm" 
                    onClick={() => onStartWorkout(routine.id)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </SafeButton>
                  
                  {isAdmin && (
                    <>
                      <SafeButton 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onEditRoutine(routine.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </SafeButton>
                      <SafeButton 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </SafeButton>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
