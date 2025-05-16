import { supabase } from './supabase-client';
import { StorageError } from '@supabase/storage-js';

// Tipos para Storage
export type StorageResponse<T> = {
  data: T | null;
  error: StorageError | Error | null;
};

export type FileInfo = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export type UploadOptions = {
  bucket: string;
  path: string;
  file: File;
  cacheControl?: string;
  upsert?: boolean;
};

export type DownloadOptions = {
  bucket: string;
  path: string;
  transform?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    format?: 'origin' | 'webp' | 'avif' | 'jpeg';
    quality?: number;
  };
};

export type ListOptions = {
  bucket: string;
  path?: string;
  limit?: number;
  offset?: number;
  sortBy?: {
    column: 'name' | 'updated_at' | 'created_at' | 'last_accessed_at';
    order: 'asc' | 'desc';
  };
};

// Funciones para Storage
export const uploadFile = async (options: UploadOptions): Promise<StorageResponse<string>> => {
  try {
    const { bucket, path, file, cacheControl = '3600', upsert = false } = options;

    // Crear el bucket si no existe
    await createBucketIfNotExists(bucket);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl,
        upsert,
      });

    if (error) {
      throw error;
    }

    // Obtener la URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { data: publicUrlData.publicUrl, error: null };
  } catch (e) {
    console.error('Error en uploadFile:', e);
    return {
      data: null,
      error: e instanceof StorageError ? e : new Error('Error desconocido en uploadFile'),
    };
  }
};

export const downloadFile = async (options: DownloadOptions): Promise<StorageResponse<Blob>> => {
  try {
    const { bucket, path, transform } = options;

    let downloadResponse;

    if (transform) {
      downloadResponse = await supabase.storage
        .from(bucket)
        .download(path, {
          transform: {
            width: transform.width,
            height: transform.height,
            resize: transform.resize,
            format: transform.format,
            quality: transform.quality,
          },
        });
    } else {
      downloadResponse = await supabase.storage
        .from(bucket)
        .download(path);
    }

    const { data, error } = downloadResponse;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (e) {
    console.error('Error en downloadFile:', e);
    return {
      data: null,
      error: e instanceof StorageError ? e : new Error('Error desconocido en downloadFile'),
    };
  }
};

export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

export const listFiles = async (options: ListOptions): Promise<StorageResponse<any[]>> => {
  try {
    const { bucket, path = '', limit, offset, sortBy } = options;

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit,
        offset,
        sortBy: sortBy ? { column: sortBy.column, order: sortBy.order } : undefined,
      });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (e) {
    console.error('Error en listFiles:', e);
    return {
      data: null,
      error: e instanceof StorageError ? e : new Error('Error desconocido en listFiles'),
    };
  }
};

export const removeFile = async (bucket: string, paths: string[]): Promise<StorageResponse<void>> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw error;
    }

    return { data: undefined, error: null };
  } catch (e) {
    console.error('Error en removeFile:', e);
    return {
      data: null,
      error: e instanceof StorageError ? e : new Error('Error desconocido en removeFile'),
    };
  }
};

export const createBucketIfNotExists = async (bucket: string): Promise<StorageResponse<void>> => {
  try {
    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const bucketExists = buckets.some(b => b.name === bucket);

    if (!bucketExists) {
      // Crear el bucket si no existe
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true, // Hacer el bucket público
      });

      if (createError) {
        throw createError;
      }
    }

    return { data: undefined, error: null };
  } catch (e) {
    console.error(`Error en createBucketIfNotExists (${bucket}):`, e);
    return {
      data: null,
      error: e instanceof StorageError ? e : new Error(`Error desconocido en createBucketIfNotExists (${bucket})`),
    };
  }
};

// Funciones específicas para la aplicación
export const uploadProfileImage = async (userId: string, file: File): Promise<StorageResponse<string>> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  return uploadFile({
    bucket: 'profile-images',
    path: filePath,
    file,
    upsert: true,
  });
};

export const uploadWorkoutImage = async (userId: string, workoutId: string, file: File): Promise<StorageResponse<string>> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${workoutId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  return uploadFile({
    bucket: 'workout-images',
    path: filePath,
    file,
    upsert: true,
  });
};

export const uploadNutritionImage = async (userId: string, entryId: string, file: File): Promise<StorageResponse<string>> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${entryId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  return uploadFile({
    bucket: 'nutrition-images',
    path: filePath,
    file,
    upsert: true,
  });
};

export const getUserFiles = async (userId: string, bucket: string): Promise<StorageResponse<any[]>> => {
  return listFiles({
    bucket,
    path: userId,
  });
};

export const removeUserFile = async (bucket: string, path: string): Promise<StorageResponse<void>> => {
  return removeFile(bucket, [path]);
};

export const uploadCommunityImage = async (userId: string, activityId: string, file: File): Promise<StorageResponse<string>> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${activityId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  return uploadFile({
    bucket: 'community-images',
    path: filePath,
    file,
    upsert: true,
  });
};
