import { supabase } from './supabase-unified';
import { TrainerAvatar, AvatarCustomization } from './types/gamification';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  DEFAULT_AVATAR: 'routinize_default_avatar',
  CONNECTION_STATUS: 'routinize_supabase_connection_status'
};

// Connection status check with caching
let isSupabaseConnected: boolean | null = null;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if Supabase is connected with caching
 * @returns Promise<boolean> indicating if Supabase is connected
 */
async function checkSupabaseConnection(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if available and recent
  if (isSupabaseConnected !== null && (now - lastConnectionCheck) < CONNECTION_CHECK_INTERVAL) {
    return isSupabaseConnected;
  }

  try {
    // Try to get connection status from local storage first
    const storedStatus = typeof window !== 'undefined' ?
      localStorage.getItem(LOCAL_STORAGE_KEYS.CONNECTION_STATUS) : null;

    if (storedStatus) {
      const { status, timestamp } = JSON.parse(storedStatus);
      if ((now - timestamp) < CONNECTION_CHECK_INTERVAL) {
        isSupabaseConnected = status === 'connected';
        return isSupabaseConnected;
      }
    }

    // Check connection using enhanced client
    const connected = await enhancedSupabase.checkConnection();
    isSupabaseConnected = connected;
    lastConnectionCheck = now;

    // Store in local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CONNECTION_STATUS, JSON.stringify({
        status: connected ? 'connected' : 'disconnected',
        timestamp: now
      }));
    }

    return connected;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    isSupabaseConnected = false;
    lastConnectionCheck = now;
    return false;
  }
}

/**
 * Get the user's trainer avatar
 * @param userId The user ID
 * @returns The user's trainer avatar
 */
/**
 * Get cached avatar from local storage
 * @param userId User ID to get avatar for
 * @returns Cached avatar or null if not found
 */
function getCachedAvatar(userId: string): TrainerAvatar | null {
  if (typeof window === 'undefined') return null;

  try {
    const cachedData = localStorage.getItem(`${LOCAL_STORAGE_KEYS.DEFAULT_AVATAR}_${userId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.warn('Error reading cached avatar from localStorage:', error);
  }

  return null;
}

/**
 * Save avatar to local storage cache
 * @param userId User ID to save avatar for
 * @param avatar Avatar data to cache
 */
function cacheAvatar(userId: string, avatar: TrainerAvatar): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEYS.DEFAULT_AVATAR}_${userId}`,
      JSON.stringify(avatar)
    );
  } catch (error) {
    console.warn('Error caching avatar to localStorage:', error);
  }
}

/**
 * Get the user's trainer avatar with enhanced error handling and fallbacks
 * @param userId The user ID
 * @returns The user's trainer avatar or a default one
 */
export async function getUserTrainerAvatar(userId: string): Promise<TrainerAvatar | null> {
  // Use a consistent ID for invalid user IDs
  const safeUserId = userId || 'default-user';

  try {
    // First check if we have a cached version
    const cachedAvatar = getCachedAvatar(safeUserId);
    if (cachedAvatar) {
      console.log('Using cached avatar from localStorage');
      return cachedAvatar;
    }

    // Check if Supabase is connected before attempting to fetch
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('Supabase is not connected. Creating default avatar without database operation.');
      const defaultAvatar = await createDefaultAvatar(safeUserId, false); // false = don't try to save to DB
      return defaultAvatar;
    }

    console.log(`Fetching avatar for user ${safeUserId} from Supabase...`);
    const { data, error } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', safeUserId)
      .single();

    // Log detailed information about the response
    console.log('Supabase response:', {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : null,
      error: error ? JSON.stringify(error) : null,
      errorType: error ? typeof error : null,
      errorKeys: error ? Object.keys(error) : null
    });

    // Handle empty error object case
    if (error && Object.keys(error).length === 0) {
      console.warn('Empty error object received from Supabase. This usually indicates a connection issue.');
      const defaultAvatar = await createDefaultAvatar(safeUserId, false);
      return defaultAvatar;
    }

    if (error) {
      if (error.code === 'PGRST116') {
        // No avatar found, create a default one
        console.log('No avatar found for user, creating default avatar');
        const defaultAvatar = await createDefaultAvatar(safeUserId, true); // true = try to save to DB
        return defaultAvatar;
      }

      console.error('Error fetching user avatar:', error);
      // Return default avatar instead of null to prevent UI errors
      const defaultAvatar = await createDefaultAvatar(safeUserId, false);
      return defaultAvatar;
    }

    if (!data || !data.avatar_data) {
      console.warn('No avatar data found in response. Creating default avatar.');
      const defaultAvatar = await createDefaultAvatar(safeUserId, true);
      return defaultAvatar;
    }

    // Cache the avatar data for future use
    cacheAvatar(safeUserId, data.avatar_data);

    return data.avatar_data;
  } catch (error) {
    console.error('Unexpected error in getUserTrainerAvatar:', error);
    // Return default avatar instead of null to prevent UI errors
    return createDefaultAvatar(safeUserId, false);
  }
}

/**
 * Create a default avatar for a user
 * @param userId The user ID
 * @param saveToDatabase Whether to try saving to the database
 * @returns The default avatar
 */
async function createDefaultAvatar(userId: string, saveToDatabase: boolean = true): Promise<TrainerAvatar> {
  // Generate a unique ID that's consistent for the same user
  const avatarId = `default-${userId.substring(0, 8)}-${new Date().getFullYear()}`;

  // Create default avatar object
  const defaultAvatar: TrainerAvatar = {
    id: avatarId,
    name: 'Coach',
    customization: {
      bodyType: 'athletic',
      hairStyle: 'short',
      hairColor: 'brown',
      skinTone: 'medium',
      facialFeatures: 'neutral',
      outfit: 'athletic',
      accessories: []
    },
    personality: 'motivational',
    specialization: 'general',
    phrases: {
      greeting: [
        '¡Hola! Soy tu entrenador personal. ¿Listo para entrenar?',
        '¡Bienvenido de nuevo! ¿Preparado para sudar?',
        '¡Es un gran día para entrenar! Vamos a por ello.'
      ],
      encouragement: [
        '¡Sigue así! Lo estás haciendo genial.',
        'Un poco más, ¡puedes hacerlo!',
        'Recuerda respirar y mantener la forma correcta.',
        '¡Estás superándote a ti mismo hoy!'
      ],
      milestone: [
        '¡Felicidades por alcanzar este hito!',
        '¡Impresionante progreso! Sigue así.',
        'Has recorrido un largo camino. ¡Estoy orgulloso de ti!'
      ],
      workout: [
        'Recuerda mantener la tensión en los músculos objetivo.',
        'Controla el movimiento, no dejes que la gravedad haga el trabajo.',
        'Concéntrate en la conexión mente-músculo.',
        'Mantén una buena postura durante todo el ejercicio.'
      ]
    },
    animation: {
      idle: 'avatar_idle',
      demonstrating: 'avatar_demo',
      celebrating: 'avatar_celebrate',
      guiding: 'avatar_guide'
    }
  };

  // Always cache the default avatar
  cacheAvatar(userId, defaultAvatar);

  // Only try to save to database if requested and Supabase is connected
  if (saveToDatabase) {
    try {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.warn('Skipping database save for default avatar due to connection issues');
        return defaultAvatar;
      }

      console.log(`Saving default avatar for user ${userId} to database...`);
      const { error } = await supabase
        .from('user_avatars')
        .insert([{
          user_id: userId,
          avatar_data: defaultAvatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        // Log detailed error information
        console.error('Error creating default avatar in database:', {
          error: JSON.stringify(error),
          errorType: typeof error,
          errorKeys: Object.keys(error),
          userId
        });
      } else {
        console.log(`Successfully saved default avatar for user ${userId} to database`);
      }
    } catch (error) {
      console.error('Unexpected error in database operation for createDefaultAvatar:', error);
    }
  }

  return defaultAvatar;
}

/**
 * Update the user's trainer avatar with offline support
 * @param userId The user ID
 * @param avatarData The updated avatar data
 * @returns Success status
 */
export async function updateUserTrainerAvatar(
  userId: string,
  avatarData: Partial<TrainerAvatar>
): Promise<boolean> {
  if (!userId) {
    console.error('updateUserTrainerAvatar called with invalid userId');
    return false;
  }

  try {
    // Check connection first
    const isConnected = await checkSupabaseConnection();

    // Get current avatar (try local cache first)
    let currentAvatar = getCachedAvatar(userId);

    // If not in cache and connected, try to fetch from database
    if (!currentAvatar && isConnected) {
      console.log(`Fetching current avatar for user ${userId} from database...`);
      const { data, error: fetchError } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user avatar for update:', {
          error: JSON.stringify(fetchError),
          errorType: typeof fetchError,
          errorKeys: Object.keys(fetchError),
          userId
        });

        // If we can't fetch, create a new default avatar
        currentAvatar = await createDefaultAvatar(userId, false);
      } else if (data && data.avatar_data) {
        currentAvatar = data.avatar_data;
      } else {
        console.warn('No avatar data found in database for update. Creating default.');
        currentAvatar = await createDefaultAvatar(userId, false);
      }
    }

    // If we still don't have an avatar, create a default one
    if (!currentAvatar) {
      console.warn('No avatar found in cache or database. Creating default for update.');
      currentAvatar = await createDefaultAvatar(userId, false);
    }

    // Update avatar with new data
    const updatedAvatar = {
      ...currentAvatar,
      ...avatarData,
      updatedAt: new Date().toISOString()
    };

    // Always update the local cache
    cacheAvatar(userId, updatedAvatar);

    // If connected, try to save to database
    if (isConnected) {
      console.log(`Saving updated avatar for user ${userId} to database...`);

      // Check if the avatar exists in the database
      const { data: existingData, error: checkError } = await supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let saveResult;

      if (checkError || !existingData) {
        // Insert new record if it doesn't exist
        saveResult = await supabase
          .from('user_avatars')
          .insert([{
            user_id: userId,
            avatar_data: updatedAvatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      } else {
        // Update existing record
        saveResult = await supabase
          .from('user_avatars')
          .update({
            avatar_data: updatedAvatar,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

      const { error: saveError } = saveResult;

      if (saveError) {
        console.error('Error saving updated avatar to database:', {
          error: JSON.stringify(saveError),
          errorType: typeof saveError,
          errorKeys: Object.keys(saveError),
          userId
        });
        // We still return true because the local cache was updated successfully
        console.log('Avatar updated in local cache only due to database error');
        return true;
      }

      console.log(`Successfully saved updated avatar for user ${userId} to database`);
    } else {
      console.log('Avatar updated in local cache only (offline mode)');
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateUserTrainerAvatar:', error);
    return false;
  }
}

/**
 * Train the avatar with new phrases or behaviors with offline support
 * @param userId The user ID
 * @param category The category of phrases to train
 * @param phrases The new phrases to add
 * @returns Success status
 */
export async function trainAvatarPhrases(
  userId: string,
  category: keyof TrainerAvatar['phrases'],
  phrases: string[]
): Promise<boolean> {
  if (!userId) {
    console.error('trainAvatarPhrases called with invalid userId');
    return false;
  }

  if (!phrases || phrases.length === 0) {
    console.warn('trainAvatarPhrases called with empty phrases array');
    return false;
  }

  try {
    // Check connection first
    const isConnected = await checkSupabaseConnection();

    // Get current avatar (try local cache first)
    let currentAvatar = getCachedAvatar(userId);

    // If not in cache and connected, try to fetch from database
    if (!currentAvatar && isConnected) {
      console.log(`Fetching current avatar for user ${userId} for phrase training...`);
      const { data, error: fetchError } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user avatar for phrase training:', {
          error: JSON.stringify(fetchError),
          errorType: typeof fetchError,
          errorKeys: Object.keys(fetchError),
          userId
        });

        // If we can't fetch, create a new default avatar
        currentAvatar = await createDefaultAvatar(userId, false);
      } else if (data && data.avatar_data) {
        currentAvatar = data.avatar_data;
      } else {
        console.warn('No avatar data found in database for phrase training. Creating default.');
        currentAvatar = await createDefaultAvatar(userId, false);
      }
    }

    // If we still don't have an avatar, create a default one
    if (!currentAvatar) {
      console.warn('No avatar found in cache or database. Creating default for phrase training.');
      currentAvatar = await createDefaultAvatar(userId, false);
    }

    // Update phrases
    const updatedPhrases = {
      ...currentAvatar.phrases,
      [category]: [
        ...currentAvatar.phrases[category],
        ...phrases
      ]
    };

    // Create updated avatar
    const updatedAvatar = {
      ...currentAvatar,
      phrases: updatedPhrases,
      updatedAt: new Date().toISOString()
    };

    // Always update the local cache
    cacheAvatar(userId, updatedAvatar);

    // If connected, try to save to database
    if (isConnected) {
      console.log(`Saving trained avatar phrases for user ${userId} to database...`);

      // Check if the avatar exists in the database
      const { data: existingData, error: checkError } = await supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let saveResult;

      if (checkError || !existingData) {
        // Insert new record if it doesn't exist
        saveResult = await supabase
          .from('user_avatars')
          .insert([{
            user_id: userId,
            avatar_data: updatedAvatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      } else {
        // Update existing record
        saveResult = await supabase
          .from('user_avatars')
          .update({
            avatar_data: updatedAvatar,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

      const { error: saveError } = saveResult;

      if (saveError) {
        console.error('Error saving trained avatar phrases to database:', {
          error: JSON.stringify(saveError),
          errorType: typeof saveError,
          errorKeys: Object.keys(saveError),
          userId,
          category,
          phraseCount: phrases.length
        });
        // We still return true because the local cache was updated successfully
        console.log('Avatar phrases updated in local cache only due to database error');
        return true;
      }

      console.log(`Successfully saved trained avatar phrases for user ${userId} to database`);
    } else {
      console.log('Avatar phrases updated in local cache only (offline mode)');
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in trainAvatarPhrases:', error);
    return false;
  }
}
