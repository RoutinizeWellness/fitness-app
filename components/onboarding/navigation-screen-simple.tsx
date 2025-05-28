'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { OnboardingMission } from '@/lib/types/beginner-onboarding';

interface NavigationScreenProps {
  onNext: () => void;
  onMissionComplete: (mission: OnboardingMission) => void;
  sectionsVisited: number;
}

export function NavigationScreenSimple({
  onNext,
  onMissionComplete,
  sectionsVisited = 0
}: NavigationScreenProps) {
  const [visitedSections, setVisitedSections] = useState(sectionsVisited);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [sectionStates, setSectionStates] = useState<boolean[]>([false, false, false, false, false]);
  const missionCompletedRef = useRef(false);

  console.log('🗺️ NavigationScreenSimple - Render:', { visitedSections, selectedSection, sectionsVisited });

  // Actualizar el estado cuando cambia la prop sectionsVisited
  useEffect(() => {
    setVisitedSections(sectionsVisited);
  }, [sectionsVisited]);

  // Verificar si se han visitado todas las secciones (solo una vez)
  useEffect(() => {
    if (visitedSections >= 5 && !missionCompletedRef.current) {
      console.log('🎯 NavigationScreenSimple - Completando misión explore_sections');
      missionCompletedRef.current = true;
      onMissionComplete('explore_sections');

      // Avanzar automáticamente después de 2 segundos
      const timer = setTimeout(() => {
        onNext();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visitedSections, onMissionComplete, onNext]);

  // Simular visita a una sección
  const handleSectionClick = useCallback((index: number) => {
    console.log('🖱️ NavigationScreenSimple - Click en sección:', index);
    setSelectedSection(index);

    // Simular tiempo de visualización
    setTimeout(() => {
      setSelectedSection(null);

      // Incrementar contador de secciones visitadas si es una nueva
      if (!sectionStates[index]) {
        console.log('✅ NavigationScreenSimple - Nueva sección visitada:', index);
        setSectionStates(prev => {
          const newStates = [...prev];
          newStates[index] = true;
          return newStates;
        });

        setVisitedSections(prev => prev + 1);
      }
    }, 1500);
  }, [sectionStates]);

  const sectionNames = ['Entrenamiento', 'Nutrición', 'Sueño', 'Productividad', 'Bienestar'];

  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6">
      {/* Título y descripción */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-[#573353]">
          Descubre todo lo que puedes hacer
        </h1>
        <p className="text-[#573353] opacity-80">
          Toca para explorar cada sección
        </p>
      </div>

      {/* Secciones simplificadas */}
      <div className="w-full space-y-4 mb-6">
        {sectionNames.map((name, index) => (
          <div
            key={index}
            className={`
              w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
              ${selectedSection === index 
                ? 'bg-blue-100 border-blue-300 shadow-md' 
                : sectionStates[index]
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleSectionClick(index)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#573353]">
                {index + 1}. {name}
              </span>
              <div className="flex items-center space-x-2">
                {sectionStates[index] && (
                  <span className="text-green-600 text-sm">✓ Visitado</span>
                )}
                {selectedSection === index && (
                  <span className="text-blue-600 text-sm">Explorando...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progreso */}
      <div className="w-full">
        <div className="bg-white/50 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#573353]">
              Progreso de exploración
            </span>
            <span className="text-sm text-[#573353]">
              {visitedSections}/5
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#FDA758] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(visitedSections / 5) * 100}%` }}
            />
          </div>
          
          {visitedSections >= 5 && (
            <div className="mt-2 text-center">
              <span className="text-green-600 font-medium">
                ¡Misión completada! Avanzando...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
