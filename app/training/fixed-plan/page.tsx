'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeButton } from '@/components/ui/safe-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Edit, 
  Trash2, 
  PlusCircle, 
  Dumbbell,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Award,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

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

// Mock data for demonstration
const mockRoutines: WorkoutRoutine[] = [
  {
    id: '1',
    name: 'Fuerza - Tren Superior',
    description: 'Rutina enfocada en el desarrollo de fuerza en el tren superior con ejercicios compuestos',
    goal: 'fuerza',
    frequency: '3x semana',
    duration: 45,
    exercises: 6,
    difficulty: 'intermediate',
    progress: 65,
    lastCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: '2',
    name: 'Hipertrofia - Cuerpo Completo',
    description: 'Rutina de hipertrofia para todo el cuerpo con enfoque en volumen muscular',
    goal: 'hipertrofia',
    frequency: '4x semana',
    duration: 60,
    exercises: 8,
    difficulty: 'advanced',
    progress: 40,
    lastCompleted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: '3',
    name: 'Cardio - Resistencia',
    description: 'Entrenamiento cardiovascular para mejorar resistencia y salud cardiovascular',
    goal: 'resistencia',
    frequency: '5x semana',
    duration: 30,
    exercises: 4,
    difficulty: 'beginner',
    progress: 80,
    lastCompleted: new Date() // Today
  },
  {
    id: '4',
    name: 'Pérdida de Peso - HIIT',
    description: 'Entrenamiento de alta intensidad para quemar grasa y perder peso',
    goal: 'pérdida de peso',
    frequency: '4x semana',
    duration: 25,
    exercises: 5,
    difficulty: 'intermediate',
    progress: 25
  }
];

export default function FixedTrainingPlanPage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate loading
    const timer = setTimeout(() => {
      setRoutines(mockRoutines);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Function to get goal color
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

  // Function to get badge variant
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

  // Function to get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Event handlers
  const handleStartWorkout = (routineId: string) => {
    toast({
      title: "Iniciando entrenamiento",
      description: "Redirigiendo a la rutina seleccionada...",
    });
    router.push(`/training/execute-workout?routineId=${routineId}`);
  };

  const handleEditRoutine = (routineId: string) => {
    toast({
      title: "Editando rutina",
      description: "Redirigiendo al editor de rutinas...",
    });
    router.push(`/training/edit/${routineId}`);
  };

  const handleDeleteRoutine = (routineId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      setRoutines(prev => prev.filter(r => r.id !== routineId));
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente.",
      });
    }
  };

  const handleCreateRoutine = () => {
    toast({
      title: "Crear rutina",
      description: "Redirigiendo al creador de rutinas...",
    });
    router.push('/training/create');
  };

  const handleGoBack = () => {
    router.push('/training');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <SafeButton
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </SafeButton>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Plan de Entrenamiento</h1>
              <p className="text-gray-600 mt-1">Gestiona y ejecuta tus rutinas de entrenamiento</p>
            </div>
          </div>
          <SafeButton
            onClick={handleCreateRoutine}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva rutina
          </SafeButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rutinas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{routines.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(routines.reduce((acc, r) => acc + (r.progress || 0), 0) / routines.length)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routines.reduce((acc, r) => acc + (r.duration || 0), 0)} min
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ejercicios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routines.reduce((acc, r) => acc + (r.exercises || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Routines List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : routines.length === 0 ? (
          <Card className="p-12 text-center">
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
              <SafeButton onClick={handleCreateRoutine} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear primera rutina
              </SafeButton>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {routines.map((routine) => (
              <Card 
                key={routine.id} 
                className={cn(
                  "border-l-4 transition-all duration-200 hover:shadow-lg",
                  getGoalColor(routine.goal)
                )}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{routine.name}</h3>
                        <p className="text-gray-600 mt-1">{routine.description}</p>
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
                        {routine.difficulty && (
                          <Badge className={getDifficultyColor(routine.difficulty)}>
                            <Award className="h-3 w-3 mr-1" />
                            {routine.difficulty}
                          </Badge>
                        )}
                      </div>

                      {routine.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-medium">{routine.progress}%</span>
                          </div>
                          <Progress value={routine.progress} className="h-2" />
                        </div>
                      )}

                      {routine.lastCompleted && (
                        <p className="text-sm text-gray-500">
                          Última vez: {routine.lastCompleted.toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <SafeButton 
                        onClick={() => handleStartWorkout(routine.id)}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Iniciar
                      </SafeButton>
                      
                      <SafeButton 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditRoutine(routine.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </SafeButton>
                      
                      <SafeButton 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </SafeButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
