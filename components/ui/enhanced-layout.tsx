'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SafeButton } from '@/components/ui/safe-button';
import { 
  Home,
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  Settings,
  User,
  Menu,
  X
} from 'lucide-react';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title?: string;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Inicio', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'training', label: 'Entrenamiento', icon: Dumbbell, color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'nutrition', label: 'Nutrición', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'sleep', label: 'Sueño', icon: Moon, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'wellness', label: 'Bienestar', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
];

export function EnhancedLayout({
  children,
  activeTab,
  onTabChange,
  title = 'Routinize',
  className
}: EnhancedLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-[#FFF3E9]", className)}>
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <SafeButton
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </SafeButton>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-white w-64 h-full shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SafeButton
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-12 px-3",
                      isActive 
                        ? `${item.bgColor} ${item.color} font-medium` 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </SafeButton>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow bg-white shadow-lg border-r border-gray-200">
            {/* Logo/Title */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SafeButton
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-12 px-3 transition-all duration-200",
                      isActive 
                        ? `${item.bgColor} ${item.color} font-medium shadow-sm` 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </SafeButton>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <SafeButton
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-gray-600 hover:bg-gray-100"
                onClick={() => handleTabChange('profile')}
              >
                <User className="h-4 w-4 mr-3" />
                Perfil
              </SafeButton>
              <SafeButton
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-gray-600 hover:bg-gray-100"
                onClick={() => handleTabChange('settings')}
              >
                <Settings className="h-4 w-4 mr-3" />
                Configuración
              </SafeButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <SafeButton
                key={item.id}
                variant="ghost"
                className={cn(
                  "flex flex-col items-center justify-center h-16 px-2",
                  isActive 
                    ? `${item.color} font-medium` 
                    : "text-gray-500"
                )}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </SafeButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
