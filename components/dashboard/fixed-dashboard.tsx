'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeButton } from '@/components/ui/safe-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dumbbell,
  Utensils,
  Heart,
  Moon,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email?: string;
  first_name?: string;
  full_name?: string;
  avatar_url?: string;
}

interface DashboardStats {
  workoutsThisWeek: number;
  caloriesBurned: number;
  averageSleep: number;
  streakDays: number;
}

interface FixedDashboardProps {
  user: User | null;
  isLoading: boolean;
  stats?: DashboardStats;
  onNavigate: (path: string) => void;
  className?: string;
}

export function FixedDashboard({
  user,
  isLoading,
  stats,
  onNavigate,
  className
}: FixedDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Datos por defecto si no hay stats
  const defaultStats: DashboardStats = {
    workoutsThisWeek: 3,
    caloriesBurned: 1250,
    averageSleep: 7.5,
    streakDays: 5
  };

  const currentStats = stats || defaultStats;

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!user) return 'Usuario';
    return user.first_name || user.full_name?.split(' ')[0] || 'Usuario';
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user) return 'U';
    return user.first_name?.[0] || user.full_name?.[0] || 'U';
  };

  // Renderizar skeleton mientras carga
  if (isLoading || !mounted) {
    return (
      <div className={cn("max-w-4xl mx-auto p-4 pb-20 md:pb-4 space-y-8", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48 md:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto p-4 pb-20 md:pb-4 space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenido, {getUserName()}</p>
        </div>
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.workoutsThisWeek}</p>
              <p className="text-xs text-gray-500">esta semana</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Calorías</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.caloriesBurned}</p>
              <p className="text-xs text-gray-500">quemadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Moon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sueño</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.averageSleep}h</p>
              <p className="text-xs text-gray-500">promedio</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Racha</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.streakDays}</p>
              <p className="text-xs text-gray-500">días</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's Workout */}
        <Card className="md:col-span-2 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Entrenamiento de hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Fuerza - Tren Superior</h3>
                <p className="text-sm text-gray-600">45 min • 6 ejercicios</p>
              </div>
              <SafeButton
                onClick={() => onNavigate('/training')}
                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md hover:shadow-lg"
              >
                Iniciar
              </SafeButton>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progreso del plan</span>
                <span className="font-medium">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Acceso rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SafeButton
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => onNavigate('/nutrition')}
            >
              <Utensils className="h-4 w-4 mr-3 text-green-600" />
              <span>Registrar comida</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </SafeButton>
            
            <SafeButton
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => onNavigate('/sleep')}
            >
              <Moon className="h-4 w-4 mr-3 text-purple-600" />
              <span>Registrar sueño</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </SafeButton>
            
            <SafeButton
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => onNavigate('/wellness')}
            >
              <Heart className="h-4 w-4 mr-3 text-red-600" />
              <span>Estado de ánimo</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </SafeButton>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-50 to-white"
          onClick={() => onNavigate('/training')}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Entrenamiento</h3>
              <p className="text-sm text-gray-600">Rutinas y ejercicios</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-green-200 bg-gradient-to-br from-green-50 to-white"
          onClick={() => onNavigate('/nutrition')}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Utensils className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Nutrición</h3>
              <p className="text-sm text-gray-600">Dieta y alimentación</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-purple-200 bg-gradient-to-br from-purple-50 to-white"
          onClick={() => onNavigate('/sleep')}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Moon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sueño</h3>
              <p className="text-sm text-gray-600">Descanso y recuperación</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-red-200 bg-gradient-to-br from-red-50 to-white"
          onClick={() => onNavigate('/wellness')}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bienestar</h3>
              <p className="text-sm text-gray-600">Salud mental</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
