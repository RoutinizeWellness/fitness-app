import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { profileData } = requestData;

    if (!profileData || !profileData.user_id) {
      return NextResponse.json(
        { error: 'Se requiere user_id en los datos del perfil' },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // No podemos verificar la autenticación en este contexto, confiamos en el user_id

    // Verificar si el perfil existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', profileData.user_id)
      .single();

    let result;

    // Preparar datos para la operación
    const dataToSave = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    if (checkError || !existingProfile) {
      // Si no existe, crear un nuevo perfil
      result = await supabase
        .from('profiles')
        .insert([dataToSave])
        .select();
    } else {
      // Si existe, actualizar el perfil existente
      result = await supabase
        .from('profiles')
        .update(dataToSave)
        .eq('user_id', profileData.user_id)
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error al actualizar perfil en la API:', error);
      return NextResponse.json(
        { error: error.message || 'Error al actualizar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data[0] || dataToSave });
  } catch (error) {
    console.error('Error en la API de perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere userId como parámetro' },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // No podemos verificar la autenticación en este contexto, confiamos en el user_id

    // Obtener el perfil
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener perfil en la API:', error);

      // Si el error es que no se encontró el perfil, devolver un perfil vacío
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          data: {
            user_id: userId,
            full_name: 'Usuario',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      }

      return NextResponse.json(
        { error: error.message || 'Error al obtener perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error en la API de perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
