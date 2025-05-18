/// <reference lib="webworker" />

// Este archivo contiene el service worker para la PWA
// Permite que la aplicación funcione offline y mejora el rendimiento

declare const self: ServiceWorkerGlobalScope;

// Use versioned cache names for better cache management
const STATIC_CACHE_NAME = 'routinize-static-v2';
const DYNAMIC_CACHE_NAME = 'routinize-dynamic-v2';
const IMAGE_CACHE_NAME = 'routinize-images-v2';
const API_CACHE_NAME = 'routinize-api-v2';

// Recursos que se cachearán al instalar el service worker
const PRECACHE_RESOURCES = [
  '/',
  '/dashboard',
  '/workout',
  '/analytics',
  '/ejercicios',
  '/ai',
  '/workout-stats',
  '/progress',
  '/plan',
  '/nutricion',
  '/goals',
  '/comunidad',
  '/my-coach',
  '/coach',
  '/wearables',
  '/coach/branding',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

// Instalar el service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_RESOURCES);
      }),
      // Create other caches
      caches.open(DYNAMIC_CACHE_NAME),
      caches.open(IMAGE_CACHE_NAME),
      caches.open(API_CACHE_NAME)
    ])
  );
  // Activate immediately without waiting for tabs to close
  self.skipWaiting();
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  // List of current cache names
  const currentCaches = [
    STATIC_CACHE_NAME,
    DYNAMIC_CACHE_NAME,
    IMAGE_CACHE_NAME,
    API_CACHE_NAME
  ];

  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Keep only current caches and delete old ones
            return !currentCaches.includes(cacheName);
          })
          .map((cacheName) => {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      console.log('Service Worker activated and controlling the page');
      // Take control of uncontrolled pages
      return self.clients.claim();
    })
  );
});

// Advanced caching strategies for different types of requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Supabase API requests (they handle their own caching)
  if (url.hostname.includes('supabase.co')) return;

  // Skip analytics and tracking requests
  if (url.hostname.includes('analytics') || url.hostname.includes('tracking')) return;

  // 1. Static Assets Strategy (Cache First)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) ||
    url.pathname.includes('/_next/static/')
  ) {
    event.respondWith(cacheFirstStrategy(event.request, STATIC_CACHE_NAME));
    return;
  }

  // 2. Image Strategy (Cache First with timeout fallback)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif)$/) || url.pathname.includes('/images/')) {
    event.respondWith(cacheFirstWithTimeoutStrategy(event.request, IMAGE_CACHE_NAME, 800));
    return;
  }

  // 3. API Requests Strategy (Network First with cache fallback)
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request, API_CACHE_NAME));
    return;
  }

  // 4. Navigation Requests (Network First with offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationStrategy(event.request));
    return;
  }

  // 5. Default Strategy (Network First with cache fallback)
  event.respondWith(networkFirstStrategy(event.request, DYNAMIC_CACHE_NAME));
});

// Cache First Strategy - Good for static assets that rarely change
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached response immediately
    return cachedResponse;
  }

  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    // Clone the response before caching it
    const responseToCache = networkResponse.clone();
    // Cache the fresh response (async, don't await)
    cache.put(request, responseToCache);
    return networkResponse;
  } catch (error) {
    // If fetch fails and no cache, return offline fallback
    return new Response('Resource unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

// Cache First with Timeout - Good for images (fast initial load)
async function cacheFirstWithTimeoutStrategy(request, cacheName, timeoutMs) {
  // Try to get from cache immediately
  const cachedResponse = await caches.match(request);

  // Start network fetch
  const networkPromise = fetch(request).then(async (networkResponse) => {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });

  // If we have a cached version, use it, but still update cache in background
  if (cachedResponse) {
    // Update cache in background
    networkPromise.catch(() => console.log('Background cache update failed'));
    return cachedResponse;
  }

  // If no cached version, race between network and timeout
  try {
    // Use Promise.race to implement timeout
    return await Promise.race([
      networkPromise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
      })
    ]);
  } catch (error) {
    // If network is too slow or fails, return a placeholder or offline image
    return caches.match('/images/offline-placeholder.png') ||
      new Response('Image unavailable offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
  }
}

// Network First Strategy - Good for API and dynamic content
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    // Clone and cache the response
    const responseToCache = networkResponse.clone();
    const cache = await caches.open(cacheName);
    cache.put(request, responseToCache);
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // If nothing in cache, return error
    return new Response('No internet connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

// Navigation Strategy - Special handling for page navigations
async function navigationStrategy(request) {
  try {
    // Try network first for navigation
    return await fetch(request);
  } catch (error) {
    // If offline, show offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback to offline page
    return caches.match('/offline.html');
  }
};

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  } else if (event.tag === 'sync-measurements') {
    event.waitUntil(syncMeasurements());
  }
});

// Notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'Routinize',
    body: 'Tienes una notificación',
    icon: '/icons/icon-192x192.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/icons/badge-72x72.png',
      data: data.data,
    })
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventanas abiertas, abrir una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});

// Función para sincronizar entrenamientos pendientes
async function syncWorkouts() {
  try {
    const db = await openIndexedDB();
    const pendingWorkouts = await db.getAll('pendingWorkouts');

    for (const workout of pendingWorkouts) {
      try {
        const response = await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workout),
        });

        if (response.ok) {
          await db.delete('pendingWorkouts', workout.id);
        }
      } catch (error) {
        console.error('Error al sincronizar entrenamiento:', error);
      }
    }
  } catch (error) {
    console.error('Error al abrir IndexedDB:', error);
  }
}

// Función para sincronizar medidas pendientes
async function syncMeasurements() {
  try {
    const db = await openIndexedDB();
    const pendingMeasurements = await db.getAll('pendingMeasurements');

    for (const measurement of pendingMeasurements) {
      try {
        const response = await fetch('/api/measurements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(measurement),
        });

        if (response.ok) {
          await db.delete('pendingMeasurements', measurement.id);
        }
      } catch (error) {
        console.error('Error al sincronizar medida:', error);
      }
    }
  } catch (error) {
    console.error('Error al abrir IndexedDB:', error);
  }
}

// Función para abrir IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('routinizeDB', 1);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;

      // Añadir métodos para facilitar el uso
      db.getAll = (storeName) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      };

      db.delete = (storeName, key) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(key);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      };

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Crear almacenes de objetos si no existen
      if (!db.objectStoreNames.contains('pendingWorkouts')) {
        db.createObjectStore('pendingWorkouts', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('pendingMeasurements')) {
        db.createObjectStore('pendingMeasurements', { keyPath: 'id' });
      }
    };
  });
}

export {};
