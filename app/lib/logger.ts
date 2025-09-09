// Sistema de logging estructurado simple (sin dependencias externas)
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  duration?: number
  [key: string]: unknown
}

class Logger {
  private context: LogContext = {}

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  private log(level: LogLevel, message: string, data?: LogContext) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      context: { ...this.context, ...data },
    }

    // En desarrollo, usar console
    if (process.env.NODE_ENV === 'development') {
      const colorMap = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      }
      const reset = '\x1b[0m'
      
      console.log(
        `${colorMap[level]}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      )
    } else {
      // En producción, JSON estructurado
      console.log(JSON.stringify(logData))
    }
  }

  debug(message: string, data?: LogContext) {
    this.log('debug', message, data)
  }

  info(message: string, data?: LogContext) {
    this.log('info', message, data)
  }

  warn(message: string, data?: LogContext) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | unknown, data?: LogContext) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }
    this.log('error', message, errorData)
  }

  // Método para crear un logger con contexto específico
  child(context: LogContext): Logger {
    const childLogger = new Logger()
    childLogger.setContext({ ...this.context, ...context })
    return childLogger
  }
}

// Instancia global del logger
export const logger = new Logger()

// Helper para logging de API requests
export function createAPILogger(endpoint: string, ip: string, userId?: string) {
  return logger.child({
    endpoint,
    ip,
    userId,
    requestId: generateRequestId(),
  })
}

// Helper para logging de analytics
export function createAnalyticsLogger(userId?: string, ip?: string) {
  return logger.child({
    service: 'analytics',
    userId,
    ip,
  })
}

// Helper para generar ID de request único
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Métricas simples en memoria (para desarrollo)
class SimpleMetrics {
  private metrics: Map<string, number> = new Map()
  private counters: Map<string, number> = new Map()

  increment(name: string, value = 1) {
    const current = this.counters.get(name) || 0
    this.counters.set(name, current + value)
  }

  gauge(name: string, value: number) {
    this.metrics.set(name, value)
  }

  timing(name: string, duration: number) {
    this.gauge(`${name}_duration`, duration)
    this.increment(`${name}_count`)
  }

  getMetrics() {
    return {
      metrics: Object.fromEntries(this.metrics),
      counters: Object.fromEntries(this.counters),
    }
  }
}

export const metrics = new SimpleMetrics()

// Helper para medir duración de operaciones
export function measureTime<T>(
  operation: () => Promise<T>,
  metricName: string
): Promise<T> {
  const start = Date.now()
  
  return operation().finally(() => {
    const duration = Date.now() - start
    metrics.timing(metricName, duration)
  })
}
