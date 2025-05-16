/**
 * Servicio para acceder a la ubicación y datos GPS del dispositivo
 * Utiliza la Geolocation API para obtener la posición y calcular distancias
 */

import { supabase } from './supabase-client';

// Tipos para datos de ubicación
export interface LocationData {
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface RoutePoint extends LocationData {
  distance?: number; // Distancia desde el punto anterior en metros
  totalDistance?: number; // Distancia total acumulada en metros
  pace?: number; // Ritmo en minutos por kilómetro
}

export interface Route {
  id?: string;
  userId: string;
  name: string;
  startTime: number;
  endTime?: number;
  totalDistance: number; // En metros
  averagePace?: number; // En minutos por kilómetro
  points: RoutePoint[];
  activityType: 'walking' | 'running' | 'cycling' | 'other';
}

// Clase principal para manejar la ubicación
export class LocationService {
  private static instance: LocationService;
  private isTracking: boolean = false;
  private watchId: number | null = null;
  private currentRoute: Route | null = null;
  private listeners: Array<(location: LocationData) => void> = [];
  private routeListeners: Array<(route: Route) => void> = [];
  private userId: string | null = null;
  private isAvailable: boolean = false;
  private lastLocation: LocationData | null = null;
  
  // Obtener la instancia singleton
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }
  
  // Constructor privado para singleton
  private constructor() {
    // Verificar si la API de geolocalización está disponible
    this.checkAvailability();
  }
  
  // Verificar si la API de geolocalización está disponible
  private checkAvailability(): void {
    this.isAvailable = typeof navigator !== 'undefined' && 
                      navigator.geolocation !== undefined;
    
    console.log(`Geolocation API ${this.isAvailable ? 'disponible' : 'no disponible'}`);
  }
  
  // Establecer el ID de usuario
  public setUserId(userId: string): void {
    this.userId = userId;
  }
  
  // Verificar si la geolocalización está disponible
  public isLocationAvailable(): boolean {
    return this.isAvailable;
  }
  
  // Obtener la ubicación actual una sola vez
  public async getCurrentLocation(): Promise<LocationData> {
    if (!this.isAvailable) {
      throw new Error('Geolocalización no disponible en este dispositivo');
    }
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          };
          
          this.lastLocation = locationData;
          resolve(locationData);
        },
        (error) => {
          reject(new Error(`Error al obtener ubicación: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }
  
  // Iniciar seguimiento de ubicación
  public startTracking(activityType: 'walking' | 'running' | 'cycling' | 'other'): boolean {
    if (!this.isAvailable || !this.userId) {
      return false;
    }
    
    if (this.isTracking) {
      return true; // Ya está rastreando
    }
    
    try {
      // Crear nueva ruta
      this.currentRoute = {
        userId: this.userId,
        name: `${activityType} ${new Date().toLocaleString()}`,
        startTime: Date.now(),
        totalDistance: 0,
        points: [],
        activityType
      };
      
      // Iniciar seguimiento
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => {
          console.error('Error en seguimiento de ubicación:', error);
          this.notifyListeners({
            timestamp: Date.now(),
            latitude: 0,
            longitude: 0,
            accuracy: 0,
            error: error.message
          } as any);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      
      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Error al iniciar seguimiento de ubicación:', error);
      return false;
    }
  }
  
  // Detener seguimiento de ubicación
  public stopTracking(): Route | null {
    if (!this.isTracking || this.watchId === null) {
      return null;
    }
    
    // Detener seguimiento
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    this.isTracking = false;
    
    // Finalizar ruta
    if (this.currentRoute) {
      this.currentRoute.endTime = Date.now();
      
      // Calcular ritmo promedio
      if (this.currentRoute.totalDistance > 0) {
        const durationMinutes = (this.currentRoute.endTime - this.currentRoute.startTime) / 60000;
        this.currentRoute.averagePace = durationMinutes / (this.currentRoute.totalDistance / 1000);
      }
      
      // Guardar ruta
      this.saveRoute(this.currentRoute);
      
      // Notificar a los listeners
      this.notifyRouteListeners(this.currentRoute);
      
      const completedRoute = { ...this.currentRoute };
      this.currentRoute = null;
      
      return completedRoute;
    }
    
    return null;
  }
  
  // Manejar actualización de posición
  private handlePositionUpdate(position: GeolocationPosition): void {
    const locationData: LocationData = {
      timestamp: position.timestamp,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined
    };
    
    // Actualizar última ubicación
    this.lastLocation = locationData;
    
    // Notificar a los listeners
    this.notifyListeners(locationData);
    
    // Actualizar ruta actual si existe
    if (this.currentRoute) {
      const routePoint: RoutePoint = { ...locationData };
      
      // Calcular distancia desde el punto anterior
      if (this.currentRoute.points.length > 0) {
        const prevPoint = this.currentRoute.points[this.currentRoute.points.length - 1];
        const distance = this.calculateDistance(
          prevPoint.latitude, prevPoint.longitude,
          locationData.latitude, locationData.longitude
        );
        
        // Solo agregar distancia si es mayor a la precisión del GPS para evitar ruido
        if (distance > locationData.accuracy / 2) {
          routePoint.distance = distance;
          routePoint.totalDistance = (prevPoint.totalDistance || 0) + distance;
          this.currentRoute.totalDistance = routePoint.totalDistance;
          
          // Calcular ritmo si hay velocidad
          if (locationData.speed && locationData.speed > 0) {
            // Convertir m/s a min/km
            routePoint.pace = 16.6667 / locationData.speed;
          } else if (routePoint.distance > 0) {
            // Calcular basado en tiempo entre puntos
            const timeDiff = (locationData.timestamp - prevPoint.timestamp) / 60000; // en minutos
            routePoint.pace = timeDiff / (routePoint.distance / 1000);
          }
        } else {
          // Mantener la distancia total anterior
          routePoint.totalDistance = prevPoint.totalDistance || 0;
          this.currentRoute.totalDistance = routePoint.totalDistance;
        }
      } else {
        // Primer punto
        routePoint.totalDistance = 0;
      }
      
      // Agregar punto a la ruta
      this.currentRoute.points.push(routePoint);
      
      // Notificar actualización de ruta
      this.notifyRouteListeners(this.currentRoute);
    }
  }
  
  // Calcular distancia entre dos puntos usando la fórmula de Haversine
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distancia en metros
  }
  
  // Guardar ruta en Supabase
  private async saveRoute(route: Route): Promise<void> {
    if (!this.userId) return;
    
    try {
      // Insertar ruta
      const { data, error } = await supabase
        .from('routes')
        .insert([{
          user_id: this.userId,
          name: route.name,
          start_time: new Date(route.startTime).toISOString(),
          end_time: route.endTime ? new Date(route.endTime).toISOString() : null,
          total_distance: route.totalDistance,
          average_pace: route.averagePace,
          activity_type: route.activityType,
          points: route.points
        }])
        .select('id');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        route.id = data[0].id;
        console.log(`Ruta guardada con ID: ${route.id}`);
      }
    } catch (error) {
      console.error('Error al guardar ruta:', error);
    }
  }
  
  // Obtener rutas guardadas
  public async getSavedRoutes(limit: number = 10): Promise<Route[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('user_id', this.userId)
        .order('start_time', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      if (data) {
        return data.map(route => ({
          id: route.id,
          userId: route.user_id,
          name: route.name,
          startTime: new Date(route.start_time).getTime(),
          endTime: route.end_time ? new Date(route.end_time).getTime() : undefined,
          totalDistance: route.total_distance,
          averagePace: route.average_pace,
          points: route.points,
          activityType: route.activity_type
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener rutas guardadas:', error);
      return [];
    }
  }
  
  // Agregar listener para actualizaciones de ubicación
  public addLocationListener(listener: (location: LocationData) => void): void {
    this.listeners.push(listener);
    
    // Notificar inmediatamente con la ubicación actual si está disponible
    if (this.lastLocation) {
      listener(this.lastLocation);
    }
  }
  
  // Eliminar listener de ubicación
  public removeLocationListener(listener: (location: LocationData) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  // Agregar listener para actualizaciones de ruta
  public addRouteListener(listener: (route: Route) => void): void {
    this.routeListeners.push(listener);
    
    // Notificar inmediatamente con la ruta actual si está disponible
    if (this.currentRoute) {
      listener(this.currentRoute);
    }
  }
  
  // Eliminar listener de ruta
  public removeRouteListener(listener: (route: Route) => void): void {
    this.routeListeners = this.routeListeners.filter(l => l !== listener);
  }
  
  // Notificar a los listeners de ubicación
  private notifyListeners(location: LocationData): void {
    this.listeners.forEach(listener => listener(location));
  }
  
  // Notificar a los listeners de ruta
  private notifyRouteListeners(route: Route): void {
    this.routeListeners.forEach(listener => listener({ ...route }));
  }
}
