'use client';

import { useState, useEffect } from 'react';

interface NavigationTestProps {
  onNext: () => void;
}

export function NavigationTest({ onNext }: NavigationTestProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('🧪 NavigationTest - Count:', count);
    
    if (count >= 3) {
      console.log('🚀 NavigationTest - Navegando automáticamente');
      const timer = setTimeout(() => {
        console.log('⏰ NavigationTest - Ejecutando onNext');
        onNext();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [count, onNext]);

  const handleClick = () => {
    console.log('🖱️ NavigationTest - Click, incrementando count');
    setCount(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#573353]">
        Test de Navegación
      </h1>
      
      <p className="text-[#573353] text-center">
        Haz click 3 veces para probar la navegación automática
      </p>
      
      <div className="text-center">
        <div className="text-4xl font-bold text-[#FDA758] mb-4">
          {count}/3
        </div>
        
        <button
          onClick={handleClick}
          className="px-6 py-3 bg-[#FDA758] text-white font-semibold rounded-lg hover:bg-[#E8965A] transition-colors"
        >
          Click aquí ({count})
        </button>
      </div>
      
      {count >= 3 && (
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold">
            ¡Completado! Navegando automáticamente...
          </p>
          
          <button
            onClick={() => {
              console.log('🖱️ NavigationTest - Click manual en continuar');
              onNext();
            }}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            Continuar Manualmente
          </button>
        </div>
      )}
    </div>
  );
}
