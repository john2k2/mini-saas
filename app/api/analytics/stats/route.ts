import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { 
  getActivityStats, 
  getPageViewStats, 
  getDailyActivity, 
  getApiPerformanceStats,
  getActivityStatsPaginated,
  getPageViewStatsPaginated
} from '../../../lib/analytics'
import { sanitizeIP } from '../../../lib/validation'
import { withRateLimit, getClientIP } from '../../../lib/rate-limit'
import { createAPILogger, measureTime, metrics } from '../../../lib/logger'
import { z } from 'zod'

// Schema de validación para parámetros de stats con paginación
const statsQuerySchema = z.object({
  type: z.enum(['activity', 'pageviews', 'daily', 'performance'])
    .optional()
    .refine((val) => val !== null, 'Analytics type is required'),
  days: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 7)
    .refine((val) => val >= 1 && val <= 365, 'Days must be between 1 and 365'),
  page: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 1)
    .refine((val) => val >= 1, 'Page must be 1 or greater'),
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 50)
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
  cursor: z.string().optional() // Para cursor-based pagination
})

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const ip = sanitizeIP(getClientIP(req))
  const logger = createAPILogger('/api/analytics/stats', ip)
  
  try {
    // Aplicar rate limiting para consultas de stats
    const rateLimitResponse = await withRateLimit(req, 'api')
    if (rateLimitResponse) {
      logger.warn('Rate limit exceeded', { 
        endpoint: '/api/analytics/stats',
        ip 
      })
      metrics.increment('api.stats.rate_limited')
      return rateLimitResponse
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized stats access attempt', { ip })
      metrics.increment('api.stats.unauthorized')
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          code: 'AUTH_REQUIRED',
          message: 'Authentication required to access analytics stats'
        },
        { status: 401 }
      )
    }

    logger.setContext({ userId: session.user.id! })

    // Parsear y validar query parameters con paginación
    const { searchParams } = new URL(req.url)
    const queryData = {
      type: searchParams.get('type'),
      days: searchParams.get('days'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor')
    }

    const validationResult = statsQuerySchema.safeParse(queryData)
    if (!validationResult.success) {
      logger.warn('Invalid query parameters', {
        errors: validationResult.error.issues,
        query: queryData,
      })
      metrics.increment('api.stats.validation_error')
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { type, days, page, limit, cursor } = validationResult.data

    logger.info('Fetching analytics stats with pagination', {
      type,
      days: type === 'daily' ? days : undefined,
      page,
      limit,
      cursor,
      userId: session.user.id!,
    })

    let result
    const metricName = `api.stats.${type}`

    // Ejecutar la consulta apropiada con medición de tiempo y paginación
    switch (type) {
      case 'activity':
        // Usar paginación si se especifican parámetros
        if (page > 1 || limit !== 50 || cursor) {
          result = await measureTime(
            () => getActivityStatsPaginated(session.user.id!, page, limit, cursor),
            `${metricName}.paginated.fetch_duration`
          )
        } else {
          result = await measureTime(
            () => getActivityStats(session.user.id!),
            `${metricName}.fetch_duration`
          )
        }
        break

      case 'pageviews':
        // Usar paginación si se especifican parámetros
        if (page > 1 || limit !== 50 || cursor) {
          result = await measureTime(
            () => getPageViewStatsPaginated(session.user.id!, page, limit, cursor),
            `${metricName}.paginated.fetch_duration`
          )
        } else {
          result = await measureTime(
            () => getPageViewStats(session.user.id!),
            `${metricName}.fetch_duration`
          )
        }
        break

      case 'daily':
        result = await measureTime(
          () => getDailyActivity(session.user.id!, days),
          `${metricName}.fetch_duration`
        )
        break

      case 'performance':
        result = await measureTime(
          () => getApiPerformanceStats(session.user.id!),
          `${metricName}.fetch_duration`
        )
        break
    }

    // Log de éxito
    const duration = Date.now() - startTime
    logger.info('Analytics stats fetched successfully', {
      duration,
      type,
      resultCount: Array.isArray(result) ? result.length : 'object',
      userId: session.user.id!,
    })
    
    metrics.increment('api.stats.success')
    metrics.increment(`${metricName}.success`)
    metrics.timing('api.stats.total_duration', duration)

    return NextResponse.json({
      success: true,
      type,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        userId: session.user.id!,
        ...(type === 'daily' && { days })
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Analytics stats fetch failed', error, {
      duration,
      endpoint: '/api/analytics/stats',
    })
    
    metrics.increment('api.stats.error')
    metrics.timing('api.stats.error_duration', duration)

    // No exponer detalles internos del error en producción
    const isDev = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics stats',
        code: 'FETCH_ERROR',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    )
  }
}
