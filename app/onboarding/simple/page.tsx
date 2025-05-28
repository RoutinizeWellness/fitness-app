'use client';

import { useState } from 'react';

export default function SimpleOnboardingPage() {
  const [visitedSections, setVisitedSections] = useState(0);
  const [sectionStates, setSectionStates] = useState<boolean[]>([false, false, false, false, false]);

  console.log('🧪 SimpleOnboarding - Render:', { visitedSections, sectionStates });

  const handleSectionClick = (index: number) => {
    console.log('🖱️ Click en sección:', index);
    
    if (!sectionStates[index]) {
      console.log('✅ Nueva sección visitada:', index);
      
      setSectionStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        console.log('📝 Nuevo sectionStates:', newStates);
        return newStates;
      });

      const newCount = visitedSections + 1;
      setVisitedSections(newCount);
      console.log('📊 Total secciones visitadas:', newCount);
    } else {
      console.log('⚠️ Sección ya visitada:', index);
    }
  };

  const sectionNames = ['Entrenamiento', 'Nutrición', 'Sueño', 'Productividad', 'Bienestar'];

  return (
    <div className="min-h-screen bg-[#FFF3E9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#573353] mb-2">
            Test de Navegación Simple
          </h1>
          <p className="text-[#573353] opacity-80">
            Haz click en cada sección para explorarla
          </p>
        </div>

        {/* Estado de debug */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Estado Debug:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>visitedSections: {visitedSections}</div>
            <div>sectionStates: [{sectionStates.map(s => s ? '✓' : '✗').join(', ')}]</div>
            <div>shouldShowButton: {visitedSections >= 5 ? 'true' : 'false'}</div>
          </div>
        </div>

        {/* Secciones */}
        <div className="space-y-3">
          {sectionNames.map((name, index) => (
            <button
              key={index}
              onClick={() => handleSectionClick(index)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${sectionStates[index] 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {index + 1}. {name}
                </span>
                <span className="text-lg">
                  {sectionStates[index] ? '✅' : '⭕'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Progreso */}
        <div className="w-full">
          <div className="flex items-center justify-between text-sm text-[#573353] mb-2">
            <span>Progreso:</span>
            <span>{visitedSections}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#FDA758] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(visitedSections / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Botón de continuar */}
        {visitedSections >= 5 && (
          <div className="space-y-3">
            <div className="text-center text-green-600 font-semibold">
              ¡Todas las secciones completadas!
            </div>
            
            <button
              onClick={() => {
                console.log('🖱️ Click en botón Continuar');
                alert('¡Navegación exitosa! El botón funciona correctamente.');
              }}
              className="w-full py-3 px-6 bg-[#FDA758] text-white font-semibold rounded-lg shadow-md hover:bg-[#E8965A] transition-colors duration-200"
            >
              Continuar al Entrenamiento →
            </button>
          </div>
        )}

        {/* Botón de debug siempre visible */}
        <div className="w-full">
          <button
            onClick={() => {
              console.log('🧪 DEBUG - Forzando navegación');
              alert('DEBUG: Botón de navegación forzada funciona');
            }}
            className="w-full py-2 px-4 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            DEBUG: Forzar Navegación
          </button>
        </div>

        {/* Información adicional */}
        <div className="text-center text-xs text-gray-500">
          Esta es una página de prueba simplificada para verificar la funcionalidad básica
        </div>
      </div>
    </div>
  );
}
