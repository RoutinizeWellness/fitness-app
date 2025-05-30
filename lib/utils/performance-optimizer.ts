import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

/**
 * Hook para debounce de funciones
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para throttle de funciones
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Hook para memoización de datos costosos
 */
export function useExpensiveComputation<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  return useMemo(computeFn, deps)
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

/**
 * Cache simple para datos
 */
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private ttl: number

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// Instancia global del cache
export const dataCache = new SimpleCache(10) // 10 minutos TTL

/**
 * Hook para usar cache con React
 */
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    // Verificar cache primero
    const cached = dataCache.get(key)
    if (cached) {
      setData(cached)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      dataCache.set(key, result)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [key, fetchFn])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...deps])

  const refetch = useCallback(() => {
    dataCache.clear()
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

/**
 * Optimizador de imágenes
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality = 80
): string {
  if (!url) return ''

  // Si es una URL externa, devolverla tal como está
  if (url.startsWith('http')) return url

  // Para imágenes locales, agregar parámetros de optimización
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())

  return `${url}?${params.toString()}`
}

/**
 * Preloader de recursos
 */
export class ResourcePreloader {
  private static instance: ResourcePreloader
  private preloadedResources = new Set<string>()

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader()
    }
    return ResourcePreloader.instance
  }

  preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.preloadedResources.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  preloadImages(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(src => this.preloadImage(src)))
  }

  preloadScript(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => {
        this.preloadedResources.add(src)
        resolve()
      }
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  }
}

/**
 * Hook para precargar recursos
 */
export function usePreloader() {
  const preloader = ResourcePreloader.getInstance()

  const preloadImages = useCallback((srcs: string[]) => {
    return preloader.preloadImages(srcs)
  }, [preloader])

  const preloadScript = useCallback((src: string) => {
    return preloader.preloadScript(src)
  }, [preloader])

  return { preloadImages, preloadScript }
}

/**
 * Utilidad para batch de operaciones
 */
export class BatchProcessor<T> {
  private batch: T[] = []
  private batchSize: number
  private processFn: (items: T[]) => Promise<void>
  private timeout: NodeJS.Timeout | null = null
  private delay: number

  constructor(
    processFn: (items: T[]) => Promise<void>,
    batchSize = 10,
    delay = 100
  ) {
    this.processFn = processFn
    this.batchSize = batchSize
    this.delay = delay
  }

  add(item: T): void {
    this.batch.push(item)

    if (this.batch.length >= this.batchSize) {
      this.flush()
    } else {
      this.scheduleFlush()
    }
  }

  private scheduleFlush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.batch.length === 0) return

    const items = [...this.batch]
    this.batch = []

    try {
      await this.processFn(items)
    } catch (error) {
      console.error('Error processing batch:', error)
    }
  }

  async forceFlush(): Promise<void> {
    await this.flush()
  }
}

/**
 * Hook para batch processing
 */
export function useBatchProcessor<T>(
  processFn: (items: T[]) => Promise<void>,
  batchSize = 10,
  delay = 100
) {
  const processor = useMemo(
    () => new BatchProcessor(processFn, batchSize, delay),
    [processFn, batchSize, delay]
  )

  const add = useCallback((item: T) => {
    processor.add(item)
  }, [processor])

  const flush = useCallback(() => {
    return processor.forceFlush()
  }, [processor])

  return { add, flush }
}

/**
 * Utilidad para virtual scrolling
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  )

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan)

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    setScrollTop
  }
}

/**
 * Utilidades de performance para desarrollo
 */
export const performanceUtils = {
  // Medir tiempo de ejecución
  time: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label)
    }
  },

  timeEnd: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label)
    }
  },

  // Medir memoria
  memory: () => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      return (performance as any).memory
    }
    return null
  },

  // Log de performance
  logPerformance: (operation: string, startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const duration = performance.now() - startTime
      console.log(`${operation} took ${duration.toFixed(2)}ms`)
    }
  }
}

export default {
  useDebounce,
  useThrottle,
  useExpensiveComputation,
  useLazyLoad,
  useCache,
  usePreloader,
  useBatchProcessor,
  useVirtualScroll,
  dataCache,
  optimizeImageUrl,
  ResourcePreloader,
  BatchProcessor,
  performanceUtils
}
