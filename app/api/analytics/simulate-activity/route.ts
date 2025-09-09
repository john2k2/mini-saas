import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { trackUserActivity } from '../../../lib/analytics';
import { db } from '../../../lib/db';
import { userActivitySchema, sanitizeIP } from '../../../lib/validation'
import { withRateLimit, getClientIP } from '../../../lib/rate-limit'
import { createAPILogger, measureTime, metrics } from '../../../lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = sanitizeIP(getClientIP(request))
  const logger = createAPILogger('/api/analytics/simulate-activity', ip)
  
  try {
    // Aplicar rate limiting más estricto para simulación
    const rateLimitResponse = await withRateLimit(request, 'activity')
    if (rateLimitResponse) {
      logger.warn('Rate limit exceeded for simulation', { 
        endpoint: '/api/analytics/simulate-activity',
        ip 
      })
      metrics.increment('api.simulate_activity.rate_limited')
      return rateLimitResponse
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn('Unauthorized simulation attempt', { ip })
      metrics.increment('api.simulate_activity.unauthorized')
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          code: 'AUTH_REQUIRED',
          message: 'Authentication required for activity simulation'
        }, 
        { status: 401 }
      );
    }

    logger.setContext({ userEmail: session.user.email })

    // Buscar o crear el usuario con validación
    let user: { id: string; email: string; name: string | null } | null = await measureTime(
      () => db.user.findUnique({ 
        where: { email: session.user.email! } 
      }),
      'api.simulate_activity.user_lookup_duration'
    );
    
    if (!user) {
      logger.info('Creating new user for simulation', { 
        email: session.user.email 
      })
      user = await measureTime(
        () => db.user.create({
          data: {
            email: session.user.email!,
            name: session.user.name || session.user.email!.split('@')[0],
          },
        }),
        'api.simulate_activity.user_create_duration'
      );
      metrics.increment('api.simulate_activity.user_created')
    }

    if (!user) {
      logger.error('Failed to create user')
      return NextResponse.json(
        { 
          error: 'User creation failed',
          code: 'USER_ERROR',
          message: 'Failed to create user for simulation'
        },
        { status: 500 }
      )
    }

    logger.setContext({ userId: user.id })

    // Parsear y validar datos de entrada
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      logger.error('Failed to parse simulation request JSON', parseError)
      metrics.increment('api.simulate_activity.parse_error')
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
      logger.warn('Simulation validation failed', {
        errors: validationResult.error.issues,
        data: requestData,
      })
      metrics.increment('api.simulate_activity.validation_error')
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
    logger.info('Simulating user activity', {
      action,
      hasMetadata: !!metadata,
      userId: user.id,
    })

    // Registrar la actividad simulada con metadatos mejorados
    const enrichedMetadata = {
      timestamp: new Date().toISOString(),
      simulated: true,
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ...metadata
    }

    await measureTime(
      () => trackUserActivity(user.id, action, enrichedMetadata),
      'api.simulate_activity.track_duration'
    )

    // Log de éxito
    const duration = Date.now() - startTime
    logger.info('Activity simulation completed successfully', {
      duration,
      action,
      userId: user.id,
    })
    
    metrics.increment('api.simulate_activity.success')
    metrics.timing('api.simulate_activity.total_duration', duration)

    return NextResponse.json({ 
      success: true,
      message: `Activity "${action}" simulated successfully`,
      data: {
        action,
        userId: user.id,
        timestamp: new Date().toISOString(),
        simulated: true
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Activity simulation failed', error, {
      duration,
      endpoint: '/api/analytics/simulate-activity',
    })
    
    metrics.increment('api.simulate_activity.error')
    metrics.timing('api.simulate_activity.error_duration', duration)

    // No exponer detalles internos del error en producción
    const isDev = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Failed to simulate activity',
        code: 'SIMULATION_ERROR',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    )
  }
}
