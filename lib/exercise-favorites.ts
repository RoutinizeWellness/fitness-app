import { supabase } from './supabase-client';
import { getCurrentUser } from './supabase-auth';

// Tipo para favoritos de ejercicios
export type ExerciseFavorite = {
  id: string;
  user_id: string;
  exercise_id: string;
  created_at: string;
};

// Obtener todos los ejercicios favoritos del usuario actual
export async function getUserFavoriteExercises() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: new Error('Usuario no autenticado') };
    }

    const { data, error } = await supabase
      .from('exercise_favorites')
      .select('*, exercises(*)')
      .eq('user_id', user.id);

    return { data, error };
  } catch (error) {
    console.error('Error al obtener ejercicios favoritos:', error);
    return { data: null, error };
  }
}

// Obtener IDs de ejercicios favoritos del usuario actual
export async function getUserFavoriteExerciseIds() {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      console.log('No hay usuario autenticado o error:', userError);
      return { data: [], error: null }; // Devolvemos un array vacío en lugar de null
    }

    const { data, error } = await supabase
      .from('exercise_favorites')
      .select('exercise_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al consultar favoritos:', error);
      return { data: [], error: null }; // Devolvemos un array vacío en lugar de null
    }

    // Extraer solo los IDs
    const favoriteIds = data.map(item => item.exercise_id);
    return { data: favoriteIds, error: null };
  } catch (error) {
    console.error('Error al obtener IDs de ejercicios favoritos:', error);
    return { data: [], error: null }; // Devolvemos un array vacío en lugar de null
  }
}

// Añadir un ejercicio a favoritos
export async function addExerciseToFavorites(exerciseId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: new Error('Usuario no autenticado') };
    }

    // Verificar si ya existe
    const { data: existingFavorite } = await supabase
      .from('exercise_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('exercise_id', exerciseId)
      .single();

    if (existingFavorite) {
      return { data: existingFavorite, error: null };
    }

    // Añadir a favoritos
    const { data, error } = await supabase
      .from('exercise_favorites')
      .insert({
        user_id: user.id,
        exercise_id: exerciseId
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error al añadir ejercicio a favoritos:', error);
    return { data: null, error };
  }
}

// Eliminar un ejercicio de favoritos
export async function removeExerciseFromFavorites(exerciseId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    const { error } = await supabase
      .from('exercise_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('exercise_id', exerciseId);

    return { error };
  } catch (error) {
    console.error('Error al eliminar ejercicio de favoritos:', error);
    return { error };
  }
}

// Alternar estado de favorito (añadir si no existe, eliminar si existe)
export async function toggleExerciseFavorite(exerciseId: string) {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      console.log('No hay usuario autenticado o error:', userError);
      return { data: null, error: new Error('Usuario no autenticado. Por favor, inicia sesión para guardar favoritos.'), added: false };
    }

    // Verificar si ya existe
    try {
      const { data: existingFavorite, error: checkError } = await supabase
        .from('exercise_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 es el código para "no se encontró ningún registro"
        console.error('Error al verificar favorito existente:', checkError);
        return { data: null, error: checkError, added: false };
      }

      if (existingFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('exercise_favorites')
          .delete()
          .eq('id', existingFavorite.id);

        return { data: null, error, added: false };
      } else {
        // Añadir a favoritos
        const { data, error } = await supabase
          .from('exercise_favorites')
          .insert({
            user_id: user.id,
            exercise_id: exerciseId
          })
          .select()
          .single();

        return { data, error, added: true };
      }
    } catch (checkError) {
      console.error('Error al verificar o modificar favorito:', checkError);
      return { data: null, error: new Error('Error al procesar la solicitud de favorito'), added: false };
    }
  } catch (error) {
    console.error('Error al alternar estado de favorito:', error);
    return { data: null, error, added: false };
  }
}
