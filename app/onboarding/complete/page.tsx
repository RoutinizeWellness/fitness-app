'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { completeOnboarding } from '@/lib/services/beginner-profile-service';

export default function CompleteOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [sectionsVisited, setSectionsVisited] = useState(0);
  const [sectionStates, setSectionStates] = useState<boolean[]>([false, false, false, false, false]);

  console.log('🚀 CompleteOnboarding - Render:', { step, sectionsVisited, sectionStates });

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.error('❌ Error al obtener usuario:', error);
          router.push('/auth/login');
          return;
        }

        console.log('✅ Usuario obtenido:', user.id);
        setUserId(user.id);
        setLoading(false);
      } catch (error) {
        console.error('💥 Error al inicializar:', error);
        router.push('/auth/login');
      }
    };

    initializeUser();
  }, [router]);

  const handleSectionClick = (index: number) => {
    console.log('🖱️ Click en sección:', index);

    if (!sectionStates[index]) {
      console.log('✅ Nueva sección visitada:', index);

      setSectionStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });

      const newCount = sectionsVisited + 1;
      setSectionsVisited(newCount);
      console.log('📊 Total secciones visitadas:', newCount);

      if (newCount >= 5) {
        console.log('🎯 Todas las secciones completadas, avanzando al siguiente paso');
        setTimeout(() => setStep(2), 1000);
      }
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!userId) return;

    try {
      console.log('🏁 Completando onboarding para usuario:', userId);
      setLoading(true);

      // Método 1: Intentar completar usando el servicio
      try {
        await completeOnboarding(userId);
        console.log('✅ Onboarding completado exitosamente con servicio');
      } catch (serviceError) {
        console.warn('⚠️ Error con servicio, intentando método directo:', serviceError);

        // Método 2: Actualización directa usando Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.warn('⚠️ Error con upsert, intentando método API:', updateError);

          // Método 3: Usar API como último recurso
          const response = await fetch('/api/profile/complete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });

          if (!response.ok) {
            throw new Error('Todos los métodos de completar onboarding fallaron');
          }
        }
      }

      console.log('✅ Onboarding completado exitosamente');
      setStep(3);

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        console.log('🚀 Redirigiendo al dashboard...');
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('💥 Error al completar onboarding:', error);

      // Mostrar opción manual al usuario
      const forceComplete = confirm(
        'Hubo un problema al completar el onboarding automáticamente. ¿Deseas forzar la finalización y ir al dashboard?'
      );

      if (forceComplete) {
        console.log('🔧 Usuario forzó la finalización del onboarding');
        setStep(3);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const sectionNames = ['Entrenamiento', 'Nutrición', 'Sueño', 'Productividad', 'Bienestar'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#FDA758] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-[#573353]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {step === 1 && (
          <>
            {/* Paso 1: Explorar secciones */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#573353] mb-2">
                Descubre tu nueva app de fitness
              </h1>
              <p className="text-[#573353] opacity-80">
                Explora cada sección para conocer todas las funcionalidades
              </p>
            </div>

            {/* Estado de debug */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Progreso:</h3>
              <div className="text-sm text-blue-700">
                Secciones visitadas: {sectionsVisited}/5
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

            {/* Progreso visual */}
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#FDA758] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(sectionsVisited / 5) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Paso 2: Confirmar finalización */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
                  ✓
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#573353] mb-2">
                  ¡Excelente exploración!
                </h1>
                <p className="text-[#573353] opacity-80">
                  Has conocido todas las secciones de la app. ¿Estás listo para comenzar tu viaje de fitness?
                </p>
              </div>

              <button
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="w-full py-3 px-6 bg-[#FDA758] text-white font-semibold rounded-lg shadow-md hover:bg-[#E8965A] transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Finalizando...' : 'Comenzar mi viaje de fitness →'}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Paso 3: Completado */}
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
                  ✓
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#573353] mb-2">
                  ¡Todo listo!
                </h1>
                <p className="text-[#573353] opacity-80 mb-2">
                  Tu perfil ha sido configurado correctamente
                </p>
                <p className="text-sm text-[#573353] opacity-70">
                  Redirigiendo al dashboard...
                </p>
              </div>
            </div>
          </>
        )}

        {/* Información adicional */}
        <div className="text-center text-xs text-gray-500">
          Onboarding completo y funcional - Paso {step}/3
        </div>
      </div>
    </div>
  );
}
