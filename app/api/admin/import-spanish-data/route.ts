import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import spanishFoods from '@/lib/data/spanish-foods-database';
import spanishRecipes from '@/lib/data/spanish-recipes-database';
import { extractAuthToken } from '@/lib/auth-token-helper';

// Función para verificar si el usuario es administrador
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al verificar rol de usuario:', error);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    console.error('Error al verificar si el usuario es administrador:', error);
    return false;
  }
}

// Función para importar alimentos españoles
async function importSpanishFoods() {
  try {
    console.log(`Importando ${spanishFoods.length} alimentos españoles...`);

    // Importar en lotes de 50 para evitar límites de tamaño de solicitud
    const batchSize = 50;
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < spanishFoods.length; i += batchSize) {
      const batch = spanishFoods.slice(i, i + batchSize);

      // Procesar los alimentos para asegurar compatibilidad con Supabase
      const processedBatch = batch.map(food => {
        const processedFood = { ...food };

        // Convertir arrays a JSON si existen
        if (Array.isArray(processedFood.alternativeFoods)) {
          processedFood.alternativeFoods = JSON.stringify(processedFood.alternativeFoods);
        }

        return processedFood;
      });

      const { error } = await supabase
        .from('spanish_foods')
        .upsert(processedBatch, { onConflict: 'id' });

      if (error) {
        console.error(`Error al importar lote de alimentos:`, error);
        failed += batch.length;
      } else {
        imported += batch.length;
      }
    }

    return { imported, failed };
  } catch (error) {
    console.error('Error al importar alimentos españoles:', error);
    throw error;
  }
}

// Función para importar recetas españolas
async function importSpanishRecipes() {
  try {
    console.log(`Importando ${spanishRecipes.length} recetas españolas...`);

    // Importar en lotes de 20 para evitar límites de tamaño de solicitud
    const batchSize = 20;
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < spanishRecipes.length; i += batchSize) {
      const batch = spanishRecipes.slice(i, i + batchSize);

      // Procesar las recetas para asegurar compatibilidad con Supabase
      const processedBatch = batch.map(recipe => {
        return {
          ...recipe,
          ingredients: JSON.stringify(recipe.ingredients),
          steps: JSON.stringify(recipe.steps),
          category: JSON.stringify(recipe.category)
        };
      });

      const { error } = await supabase
        .from('spanish_recipes')
        .upsert(processedBatch, { onConflict: 'id' });

      if (error) {
        console.error(`Error al importar lote de recetas:`, error);
        failed += batch.length;
      } else {
        imported += batch.length;
      }
    }

    return { imported, failed };
  } catch (error) {
    console.error('Error al importar recetas españolas:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar si el usuario es administrador
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    // Obtener datos de la solicitud
    const { type } = await request.json();

    if (type === 'foods') {
      // Importar alimentos españoles
      const result = await importSpanishFoods();

      return NextResponse.json({
        success: result.failed === 0,
        imported: result.imported,
        failed: result.failed,
        message: `Se importaron ${result.imported} alimentos españoles. ${result.failed > 0 ? `Fallaron ${result.failed} alimentos.` : ''}`
      });
    } else if (type === 'recipes') {
      // Importar recetas españolas
      const result = await importSpanishRecipes();

      return NextResponse.json({
        success: result.failed === 0,
        imported: result.imported,
        failed: result.failed,
        message: `Se importaron ${result.imported} recetas españolas. ${result.failed > 0 ? `Fallaron ${result.failed} recetas.` : ''}`
      });
    } else if (type === 'all') {
      // Importar ambos
      const foodsResult = await importSpanishFoods();
      const recipesResult = await importSpanishRecipes();

      return NextResponse.json({
        success: foodsResult.failed === 0 && recipesResult.failed === 0,
        foods: {
          imported: foodsResult.imported,
          failed: foodsResult.failed
        },
        recipes: {
          imported: recipesResult.imported,
          failed: recipesResult.failed
        },
        message: `Se importaron ${foodsResult.imported} alimentos y ${recipesResult.imported} recetas. ${foodsResult.failed + recipesResult.failed > 0 ? `Fallaron ${foodsResult.failed} alimentos y ${recipesResult.failed} recetas.` : ''}`
      });
    } else {
      return NextResponse.json(
        { error: 'Tipo de importación no válido. Debe ser "foods", "recipes" o "all".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error en la API de importación:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
