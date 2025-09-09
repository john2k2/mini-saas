import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { trackUserActivity } from '../../../lib/analytics'
import { userActivitySchema, sanitizeIP } from '../../../lib/validation'
import { withRateLimit, getClientIP } from '../../../lib/rate-limit'
import { createAPILogger, measureTime, metrics } from '../../../lib/logger'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const ip = sanitizeIP(getClientIP(req))
  const logger = createAPILogger('/api/analytics/activity', ip)
  
  try {
    // Aplicar rate limiting específico para actividades
    const rateLimitResponse = await withRateLimit(req, 'activity')
    if (rateLimitResponse) {
      logger.warn('Rate limit exceeded', { 
        endpoint: '/api/analytics/activity',
        ip 
      })
      metrics.increment('api.activity.rate_limited')
      return rateLimitResponse
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized activity tracking attempt', { ip })
      metrics.increment('api.activity.unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    logger.setContext({ userId: session.user.id! })

    // Parsear y validar datos de entrada
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      logger.error('Failed to parse request JSON', parseError)
      metrics.increment('api.activity.parse_error')
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      )
    }

    // Validar datos con schema
    const validationResult = userActivitySchema.safeParse(requestData)
    if (!validationResult.success) {
      logger.warn('Validation failed', {
        errors: validationResult.error.issues,
        data: requestData,
      })
      metrics.increment('api.activity.validation_error')
      return NextResponse.json(
        { 
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { action, metadata } = validationResult.data

    // Log de actividad válida
    logger.info('Processing user activity', {
      action,
      hasMetadata: !!metadata,
      userId: session.user.id!,
    })

    // Rastrear actividad con medición de tiempo
    await measureTime(
      () => trackUserActivity(session.user.id!, action, metadata),
      'api.activity.track_duration'
    )

    // Log de éxito
    const duration = Date.now() - startTime
    logger.info('User activity tracked successfully', {
      duration,
      action,
      userId: session.user.id!,
    })
    
    metrics.increment('api.activity.success')
    metrics.timing('api.activity.total_duration', duration)

    return NextResponse.json({ 
      success: true,
      tracked: {
        action,
        timestamp: new Date().toISOString(),
        userId: session.user.id!
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Activity tracking failed', error, {
      duration,
      endpoint: '/api/analytics/activity',
    })
    
    metrics.increment('api.activity.error')
    metrics.timing('api.activity.error_duration', duration)

    // No exponer detalles internos del error en producción
    const isDev = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Failed to track activity',
        code: 'TRACKING_ERROR',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    )
  }
}
