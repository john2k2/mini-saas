// Sistema de caché en memoria simple para desarrollo
// En producción se recomienda usar Redis

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutos por defecto

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory: process.memoryUsage()
    }
  }

  // Helper para cachear resultados de funciones async
  async remember<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    // Intentar obtener del caché primero
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Si no está en caché, ejecutar la función y cachear el resultado
    const result = await fetchFn()
    this.set(key, result, ttl)
    
    return result
  }

  // Helper para cachear por usuario
  userKey(userId: string, suffix: string): string {
    return `user:${userId}:${suffix}`
  }

  // Helper para cachear analytics
  analyticsKey(userId: string, type: string, params?: Record<string, unknown>): string {
    const paramStr = params ? `:${JSON.stringify(params)}` : ''
    return `analytics:${userId}:${type}${paramStr}`
  }
}

// Instancia global del caché
export const cache = new MemoryCache()

// Limpiar caché cada 10 minutos
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000)

// Helper functions para casos comunes
export const cacheHelpers = {
  // Cachear stats de usuario
  async getUserStats<T>(
    userId: string,
    type: string,
    fetchFn: () => Promise<T>,
    ttl = 2 * 60 * 1000 // 2 minutos para stats
  ): Promise<T> {
    const key = cache.analyticsKey(userId, type)
    return cache.remember(key, fetchFn, ttl)
  },

  // Cachear datos de usuario
  async getUserData<T>(
    userId: string,
    suffix: string,
    fetchFn: () => Promise<T>,
    ttl = 5 * 60 * 1000 // 5 minutos para datos de usuario
  ): Promise<T> {
    const key = cache.userKey(userId, suffix)
    return cache.remember(key, fetchFn, ttl)
  },

  // Invalidar caché de usuario
  invalidateUser(userId: string): void {
    const keysToDelete: string[] = []
    
    for (const key of cache.getStats().keys) {
      if (key.startsWith(`user:${userId}:`) || key.startsWith(`analytics:${userId}:`)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => cache.delete(key))
  },

  // Caché de página views por IP (para rate limiting mejorado)
  async getPageViewsByIP(
    ip: string,
    timeWindow: number,
    fetchFn: () => Promise<number>
  ): Promise<number> {
    const key = `rate_limit:pageviews:${ip}:${Math.floor(Date.now() / timeWindow)}`
    return cache.remember(key, fetchFn, timeWindow)
  }
}

// Middleware para logging del caché
export function logCacheHit(key: string, hit: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CACHE] ${hit ? 'HIT' : 'MISS'} - ${key}`)
  }
}

// Función para warming up el caché con datos comunes
export async function warmupCache(userId: string) {
  try {
    // Aquí se pueden agregar calls para precalentar datos comunes
    // por ejemplo: stats básicos, configuración de usuario, etc.
    console.log(`[CACHE] Warming up cache for user ${userId}`)
  } catch (error) {
    console.error(`[CACHE] Error warming up cache for user ${userId}:`, error)
  }
}
