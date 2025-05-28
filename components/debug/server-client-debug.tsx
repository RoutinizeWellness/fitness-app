'use client';

import { useEffect, useState } from 'react';

export function ServerClientDebug() {
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);

    // Capturar errores de React de forma más segura
    const originalError = console.error;
    console.error = (...args) => {
      try {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('Event handlers cannot be passed to Client Component props')) {
          setErrors(prev => {
            // Limitar a los últimos 5 errores para evitar acumulación
            const newErrors = [...prev, errorMessage].slice(-5);
            return newErrors;
          });
        }
        originalError(...args);
      } catch (e) {
        // Fallback silencioso si hay problemas con el logging
        originalError(...args);
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // No mostrar el debug en producción
  if (process.env.NODE_ENV === 'production' || !isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md z-50 text-xs">
      <h4 className="font-bold text-sm">Debug Info</h4>
      <p className="text-xs">Client: {isClient ? '✅' : '❌'}</p>
      {errors.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold text-xs">Event Handler Errors: {errors.length}</p>
          <button
            onClick={() => setErrors([])}
            className="text-xs underline hover:no-underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
