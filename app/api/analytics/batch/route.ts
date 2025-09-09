import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { trackPageViewsBatch, trackUserActivitiesBatch } from '../../../lib/analytics'
import { sanitizeIP, sanitizeString } from '../../../lib/validation'
import { withRateLimit, getClientIP } from '../../../lib/rate-limit'
import { createAPILogger, measureTime, metrics } from '../../../lib/logger'
import { z } from 'zod'

// Schema de validación para batch page views
const batchPageViewSchema = z.object({
  type: z.literal('pageviews'),
  data: z.array(z.object({
    page: z.string()
      .min(1, 'Page path is required')
      .max(500, 'Page path too long')
      .transform(val => sanitizeString(val)),
    userId: z.string().optional(),
    userAgent: z.string()
      .max(1000, 'User agent too long')
      .optional()
      .transform(val => val ? sanitizeString(val) : undefined),
    ip: z.string()
      .optional()
      .transform(val => val ? sanitizeIP(val) : undefined)
  }))
    .min(1, 'At least one page view required')
    .max(100, 'Maximum 100 page views per batch request')
})

// Schema de validación para batch activities
const batchActivitySchema = z.object({
  type: z.literal('activities'),
  data: z.array(z.object({
    userId: z.string().min(1, 'User ID is required'),
    action: z.string()
      .min(1, 'Action is required')
      .max(100, 'Action name too long')
      .transform(val => sanitizeString(val)),
    metadata: z.record(z.string(), z.unknown()).optional()
  }))
    .min(1, 'At least one activity required')
    .max(50, 'Maximum 50 activities per batch request')
})

const batchRequestSchema = z.union([batchPageViewSchema, batchActivitySchema])

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const ip = sanitizeIP(getClientIP(req))
  const logger = createAPILogger('/api/analytics/batch', ip)
  let session
  
  try {
    // Aplicar rate limiting más estricto para operaciones batch
    const rateLimitResponse = await withRateLimit(req, 'api')
    if (rateLimitResponse) {
      logger.warn('Rate limit exceeded for batch operations', { 
        endpoint: '/api/analytics/batch',
        ip 
      })
      metrics.increment('api.batch.rate_limited')
      return rateLimitResponse
    }

    // Obtener sesión del usuario
    session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized batch operation attempt', { ip })
      metrics.increment('api.batch.unauthorized')
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          code: 'AUTH_REQUIRED',
          message: 'Authentication required for batch operations'
        },
        { status: 401 }
      )
    }

    logger.setContext({ userId: session.user.id! })

    // Parsear y validar el cuerpo de la petición
    let requestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      logger.warn('Invalid JSON in batch request', { error: error instanceof Error ? error.message : 'Unknown error' })
      metrics.increment('api.batch.invalid_json')
      return NextResponse.json(
        { 
          error: 'Invalid JSON format',
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    const validationResult = batchRequestSchema.safeParse(requestBody)
    if (!validationResult.success) {
      logger.warn('Invalid batch request data', {
        errors: validationResult.error.issues,
        data: requestBody,
      })
      metrics.increment('api.batch.validation_error')
      return NextResponse.json(
        { 
          error: 'Invalid batch request data',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { type, data } = validationResult.data

    logger.info('Processing batch operation', {
      type,
      itemCount: data.length,
      userId: session.user.id!,
    })

    let result
    const metricName = `api.batch.${type}`

    // Ejecutar la operación batch apropiada
    if (type === 'pageviews') {
      result = await measureTime(
        () => trackPageViewsBatch(data),
        `${metricName}.process_duration`
      )
      logger.info('Batch page views processed successfully', {
        processedCount: result.count,
        userId: session.user.id!,
      })
    } else if (type === 'activities') {
      result = await measureTime(
        () => trackUserActivitiesBatch(data),
        `${metricName}.process_duration`
      )
      logger.info('Batch activities processed successfully', {
        processedCount: result.count,
        userId: session.user.id!,
      })
    }

    // Log de éxito
    const duration = Date.now() - startTime
    logger.info('Batch operation completed successfully', {
      duration,
      type,
      processedCount: result.count,
      userId: session.user.id!,
    })
    
    metrics.increment(`${metricName}.success`)

    return NextResponse.json({
      success: true,
      type,
      processed: result.count,
      message: `Successfully processed ${result.count} ${type}`
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Error in batch analytics operation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      userId: session?.user?.id,
    })
    
    metrics.increment('api.batch.error')

    // En producción, no exponer detalles del error
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      { 
        error: 'Batch operation failed',
        code: 'BATCH_ERROR',
        message: 'Failed to process batch operation',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    )
  }
}
