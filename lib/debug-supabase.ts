import { createClient } from '@supabase/supabase-js';

// Función para verificar la conexión a Supabase
export const checkSupabaseConnection = async () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        connected: false,
        error: 'Faltan variables de entorno para Supabase',
        details: { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey }
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Intentar una consulta simple
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      return {
        connected: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      connected: true,
      data
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    };
  }
};

// Función para verificar las políticas de seguridad de una tabla
export const checkTablePolicies = async (tableName: string) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Faltan variables de entorno para Supabase'
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Consultar las políticas de la tabla
    const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: tableName });
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      success: true,
      policies: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    };
  }
};

// Función para verificar si una tabla tiene RLS habilitado
export const checkRlsEnabled = async (tableName: string) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Faltan variables de entorno para Supabase'
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Consultar si la tabla tiene RLS habilitado
    const { data, error } = await supabase.rpc('check_rls_enabled', { table_name: tableName });
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      success: true,
      rlsEnabled: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    };
  }
};

// Función para verificar los permisos de un usuario en una tabla
export const checkUserPermissions = async (userId: string, tableName: string) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Faltan variables de entorno para Supabase'
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Intentar operaciones CRUD básicas
    const testData = {
      user_id: userId,
      test_field: 'test_value',
      created_at: new Date().toISOString()
    };
    
    // Intentar insertar
    const insertResult = await supabase.from(tableName).insert([testData]).select();
    
    if (insertResult.error) {
      return {
        success: false,
        operation: 'insert',
        error: insertResult.error.message,
        details: insertResult.error
      };
    }
    
    const insertedId = insertResult.data?.[0]?.id;
    
    if (!insertedId) {
      return {
        success: false,
        operation: 'insert',
        error: 'No se pudo obtener el ID del registro insertado'
      };
    }
    
    // Intentar seleccionar
    const selectResult = await supabase.from(tableName).select('*').eq('id', insertedId);
    
    if (selectResult.error) {
      return {
        success: false,
        operation: 'select',
        error: selectResult.error.message,
        details: selectResult.error
      };
    }
    
    // Intentar actualizar
    const updateResult = await supabase
      .from(tableName)
      .update({ test_field: 'updated_value' })
      .eq('id', insertedId)
      .select();
    
    if (updateResult.error) {
      return {
        success: false,
        operation: 'update',
        error: updateResult.error.message,
        details: updateResult.error
      };
    }
    
    // Intentar eliminar
    const deleteResult = await supabase.from(tableName).delete().eq('id', insertedId);
    
    if (deleteResult.error) {
      return {
        success: false,
        operation: 'delete',
        error: deleteResult.error.message,
        details: deleteResult.error
      };
    }
    
    return {
      success: true,
      permissions: {
        insert: true,
        select: true,
        update: true,
        delete: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    };
  }
};
