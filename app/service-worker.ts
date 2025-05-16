/// <reference lib="webworker" />

// Este archivo contiene el service worker para la PWA
// Permite que la aplicación funcione offline y mejora el rendimiento

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'routinize-cache-v1';

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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
  // Activar inmediatamente sin esperar a que se cierren las pestañas
  self.skipWaiting();
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  // Eliminar caches antiguas
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Tomar el control de las páginas no controladas
  self.clients.claim();
});

// Estrategia de caché: Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;

  // Ignorar solicitudes a la API de Supabase
  if (event.request.url.includes('supabase.co')) return;

  // Estrategia para recursos de la aplicación
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar una copia de la respuesta en caché
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si la red falla, intentar desde caché
        return caches.match(event.request).then((cachedResponse) => {
          // Si hay una respuesta en caché, devolverla
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si es una solicitud de navegación, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          
          // Si no hay respuesta en caché, devolver un error
          return new Response('Sin conexión a Internet', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

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
