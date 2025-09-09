import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { trackPageView } from '../../../lib/analytics'
import { pageViewSchema, sanitizeIP } from '../../../lib/validation'
import { withRateLimit, getClientIP } from '../../../lib/rate-limit'
import { createAPILogger, measureTime, metrics } from '../../../lib/logger'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const ip = sanitizeIP(getClientIP(req))
  const logger = createAPILogger('/api/analytics/page-view', ip)
  
  try {
    // Aplicar rate limiting específico para page views
    const rateLimitResponse = await withRateLimit(req, 'pageView')
    if (rateLimitResponse) {
      logger.warn('Rate limit exceeded', { 
        endpoint: '/api/analytics/page-view',
        ip 
      })
      metrics.increment('api.page_view.rate_limited')
      return rateLimitResponse
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions)
    logger.setContext({ userId: session?.user?.id })

    // Parsear y validar datos de entrada
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      logger.error('Failed to parse request JSON', parseError, {
        contentType: req.headers.get('content-type'),
      })
      metrics.increment('api.page_view.parse_error')
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      )
    }

    // Validar datos con schema
    const validationResult = pageViewSchema.safeParse(requestData)
    if (!validationResult.success) {
      logger.warn('Validation failed', {
        errors: validationResult.error.issues,
        data: requestData,
      })
      metrics.increment('api.page_view.validation_error')
      return NextResponse.json(
        { 
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { page, userAgent } = validationResult.data

    // Log de actividad válida
    logger.info('Processing page view', {
      page,
      hasUserAgent: !!userAgent,
      isAuthenticated: !!session?.user,
    })

    // Rastrear page view con medición de tiempo
    await measureTime(
      () => trackPageView(page, session?.user?.id, userAgent, ip),
      'api.page_view.track_duration'
    )

    // Log de éxito
    const duration = Date.now() - startTime
    logger.info('Page view tracked successfully', {
      duration,
      page,
    })
    
    metrics.increment('api.page_view.success')
    metrics.timing('api.page_view.total_duration', duration)

    return NextResponse.json({ 
      success: true,
      tracked: {
        page,
        timestamp: new Date().toISOString(),
        authenticated: !!session?.user
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Page view tracking failed', error, {
      duration,
      endpoint: '/api/analytics/page-view',
    })
    
    metrics.increment('api.page_view.error')
    metrics.timing('api.page_view.error_duration', duration)

    // No exponer detalles internos del error en producción
    const isDev = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Failed to track page view',
        code: 'TRACKING_ERROR',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    )
  }
}
