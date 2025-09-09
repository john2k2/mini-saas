import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest } from 'next/server'

// Rate limiters para diferentes endpoints
export const pageViewLimiter = new RateLimiterMemory({
  points: 100, // 100 page views
  duration: 60, // por minuto
  blockDuration: 60, // bloquear por 1 minuto si se excede
})

export const activityLimiter = new RateLimiterMemory({
  points: 50, // 50 actividades
  duration: 60, // por minuto
  blockDuration: 300, // bloquear por 5 minutos si se excede
})

export const apiLimiter = new RateLimiterMemory({
  points: 200, // 200 requests
  duration: 60, // por minuto
  blockDuration: 60, // bloquear por 1 minuto
})

// Función para obtener IP del cliente
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const remoteAddr = req.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

// Función para aplicar rate limiting
export async function applyRateLimit(
  limiter: RateLimiterMemory,
  key: string
) {
  try {
    await limiter.consume(key)
    return null // No hay límite excedido
  } catch (rateLimiterRes: unknown) {
    // Rate limit excedido
    const res = rateLimiterRes as { remainingPoints?: number; msBeforeNext?: number }
    const remainingPoints = res?.remainingPoints ?? 0
    const msBeforeNext = res?.msBeforeNext ?? 60000
    
    return {
      error: 'Rate limit exceeded',
      remainingPoints,
      msBeforeNext,
      retryAfter: Math.round(msBeforeNext / 1000),
    }
  }
}

// Middleware de rate limiting para usar en APIs
export async function withRateLimit(
  req: NextRequest,
  limiterType: 'pageView' | 'activity' | 'api' = 'api'
) {
  const ip = getClientIP(req)
  
  const limiter = {
    pageView: pageViewLimiter,
    activity: activityLimiter,
    api: apiLimiter,
  }[limiterType]
  
  const rateLimitResult = await applyRateLimit(limiter, ip)
  
  if (rateLimitResult) {
    return new Response(
      JSON.stringify({
        error: rateLimitResult.error,
        retryAfter: rateLimitResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retryAfter.toString(),
          'X-RateLimit-Limit': limiter.points.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remainingPoints.toString(),
          'X-RateLimit-Reset': new Date(Date.now() + rateLimitResult.msBeforeNext).toISOString(),
        },
      }
    )
  }
  
  return null // Sin límite, continúa
}
