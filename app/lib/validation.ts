import { z } from 'zod'

// Schema de validación para page view
export const pageViewSchema = z.object({
  page: z.string()
    .min(1, 'Page is required')
    .max(500, 'Page path too long')
    .regex(/^\//, 'Page must start with /')
    .refine((val) => !val.includes('<script'), 'Invalid characters detected'),
  
  userAgent: z.string()
    .max(1000, 'User agent too long')
    .optional()
    .transform((val) => val ? sanitizeUserAgent(val) : undefined),
})

// Schema para actividad de usuario
export const userActivitySchema = z.object({
  action: z.string()
    .min(1, 'Action is required')
    .max(100, 'Action name too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Action contains invalid characters'),
  
  metadata: z.record(z.string(), z.unknown())
    .optional()
    .refine((val) => {
      if (!val) return true
      const str = JSON.stringify(val)
      return str.length <= 5000 // Límite de 5KB para metadata
    }, 'Metadata too large'),
})

// Schema para API usage tracking
export const apiUsageSchema = z.object({
  endpoint: z.string().min(1).max(200),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  status: z.number().int().min(100).max(599),
  duration: z.number().int().min(0).max(60000), // Máximo 60 segundos
})

// Utilidades de sanitización
function sanitizeUserAgent(userAgent: string): string {
  return userAgent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000) // Truncate
}

export function sanitizeIP(ip: string): string {
  // Validar formato IP v4/v6 básico
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
    return ip
  }
  
  return 'unknown'
}

export function sanitizePage(page: string): string {
  return page
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .substring(0, 500)
}

export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
}

// Tipos TypeScript
export type PageViewInput = z.infer<typeof pageViewSchema>
export type UserActivityInput = z.infer<typeof userActivitySchema>
export type ApiUsageInput = z.infer<typeof apiUsageSchema>
