'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { EnhancedLayout } from '@/components/ui/enhanced-layout';
import { FixedDashboard } from '@/components/dashboard/fixed-dashboard';
import { FixedTrainingPlanDisplay } from '@/components/training/fixed-training-plan-display';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/use-toast';

// Mock data para demostración
const mockRoutines = [
  {
    id: '1',
    name: 'Fuerza - Tren Superior',
    description: 'Rutina enfocada en el desarrollo de fuerza en el tren superior',
    goal: 'fuerza',
    frequency: '3x semana',
    duration: 45,
    exercises: 6,
    difficulty: 'intermediate' as const,
    progress: 65
  },
  {
    id: '2',
    name: 'Hipertrofia - Cuerpo Completo',
    description: 'Rutina de hipertrofia para todo el cuerpo',
    goal: 'hipertrofia',
    frequency: '4x semana',
    duration: 60,
    exercises: 8,
    difficulty: 'advanced' as const,
    progress: 40
  },
  {
    id: '3',
    name: 'Cardio - Resistencia',
    description: 'Entrenamiento cardiovascular para mejorar resistencia',
    goal: 'resistencia',
    frequency: '5x semana',
    duration: 30,
    exercises: 4,
    difficulty: 'beginner' as const,
    progress: 80
  }
];

const mockStats = {
  workoutsThisWeek: 4,
  caloriesBurned: 1850,
  averageSleep: 7.8,
  streakDays: 12
};

export default function FixedDashboardPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [routines, setRoutines] = useState(mockRoutines);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Navegar a las rutas correspondientes
    switch (tab) {
      case 'dashboard':
        // Ya estamos en dashboard
        break;
      case 'training':
        router.push('/training');
        break;
      case 'nutrition':
        router.push('/nutrition');
        break;
      case 'sleep':
        router.push('/sleep');
        break;
      case 'wellness':
        router.push('/wellness');
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

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

  // Mostrar spinner mientras se autentica
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Cargando tu perfil..." />
      </div>
    );
  }

  // Redirigir si no hay usuario
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <EnhancedLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      title="Routinize"
    >
      <div className="min-h-screen">
        {activeTab === 'dashboard' && (
          <FixedDashboard
            user={user}
            isLoading={isLoading}
            stats={mockStats}
            onNavigate={handleNavigate}
          />
        )}
        
        {activeTab === 'training' && (
          <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
            <FixedTrainingPlanDisplay
              routines={routines}
              isLoading={isLoading}
              isAdmin={user.email === 'admin@routinize.com'}
              onStartWorkout={handleStartWorkout}
              onEditRoutine={handleEditRoutine}
              onDeleteRoutine={handleDeleteRoutine}
              onCreateRoutine={handleCreateRoutine}
            />
          </div>
        )}
        
        {/* Placeholder para otros módulos */}
        {activeTab === 'nutrition' && (
          <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulo de Nutrición</h2>
              <p className="text-gray-600">Próximamente disponible con diseño mejorado</p>
            </div>
          </div>
        )}
        
        {activeTab === 'sleep' && (
          <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulo de Sueño</h2>
              <p className="text-gray-600">Próximamente disponible con diseño mejorado</p>
            </div>
          </div>
        )}
        
        {activeTab === 'wellness' && (
          <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulo de Bienestar</h2>
              <p className="text-gray-600">Próximamente disponible con diseño mejorado</p>
            </div>
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
}
