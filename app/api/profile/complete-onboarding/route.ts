import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Completando onboarding...');
    
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    console.log('👤 API: Completando onboarding para usuario:', userId);

    // Intentar actualizar el perfil para marcar onboarding como completado
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('❌ API: Error al completar onboarding:', error);
      return NextResponse.json(
        { error: 'Error al completar onboarding', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ API: Onboarding completado exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding completado exitosamente',
      data
    });

  } catch (error) {
    console.error('💥 API: Error inesperado:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
