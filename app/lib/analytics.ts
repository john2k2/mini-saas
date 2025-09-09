import { db } from './db'
import { cacheHelpers } from './cache'

export async function trackUserActivity(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  try {
    // Validar que el usuario existe
    const userExists = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    
    if (!userExists) {
      console.warn(`User ${userId} not found, skipping activity tracking`)
      return
    }

    await db.userActivity.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    // Invalidar caché de usuario después de nueva actividad
    cacheHelpers.invalidateUser(userId)
  } catch (error) {
    console.error('Error tracking user activity:', error)
  }
}

export async function trackPageView(
  page: string,
  userId?: string,
  userAgent?: string,
  ip?: string
) {
  try {
    // Validar que el usuario existe si se proporciona un userId
    let validUserId = null
    if (userId) {
      const userExists = await db.user.findUnique({
        where: { id: userId },
        select: { id: true }
      })
      if (userExists) {
        validUserId = userId
      }
    }

    await db.pageView.create({
      data: {
        page,
        userId: validUserId,
        userAgent,
        ip,
      },
    })
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

export async function trackApiUsage(
  userId: string,
  endpoint: string,
  method: string,
  status: number,
  duration: number
) {
  try {
    await db.apiUsage.create({
      data: {
        userId,
        endpoint,
        method,
        status,
        duration,
      },
    })
  } catch (error) {
    console.error('Error tracking API usage:', error)
  }
}

// Funciones para obtener analytics con caché
export async function getActivityStats(userId: string) {
  return cacheHelpers.getUserStats(
    userId,
    'activity_stats',
    async () => {
      const stats = await db.userActivity.groupBy({
        by: ['action'],
        where: { userId },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
      })

      return stats.map((stat: { action: string; _count: { action: number } }) => ({
        name: stat.action,
        value: stat._count.action,
      }))
    },
    2 * 60 * 1000 // 2 minutos de caché
  )
}

export async function getPageViewStats(userId?: string) {
  const cacheKey = userId ? `pageview_stats_${userId}` : 'pageview_stats_global'
  
  return cacheHelpers.getUserStats(
    userId || 'global',
    cacheKey,
    async () => {
      const where = userId ? { userId } : {}
      
      const stats = await db.pageView.groupBy({
        by: ['page'],
        where,
        _count: { page: true },
        orderBy: { _count: { page: 'desc' } },
      })

      return stats.map((stat: { page: string; _count: { page: number } }) => ({
        name: stat.page,
        value: stat._count.page,
      }))
    },
    3 * 60 * 1000 // 3 minutos de caché
  )
}

export async function getDailyActivity(userId?: string, days: number = 7) {
  const cacheKey = `daily_activity_${days}days${userId ? `_${userId}` : ''}`
  
  return cacheHelpers.getUserStats(
    userId || 'global',
    cacheKey,
    async () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const where = userId ? { userId, createdAt: { gte: startDate } } : { createdAt: { gte: startDate } }

      const activities = await db.userActivity.findMany({
        where,
        select: {
          createdAt: true,
          action: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      // Agrupar por día
      const dailyStats: { [key: string]: number } = {}
      
      activities.forEach((activity: { createdAt: Date; action: string }) => {
        const day = activity.createdAt.toDateString()
        dailyStats[day] = (dailyStats[day] || 0) + 1
      })

      // Convertir a formato para gráficas
      return Object.entries(dailyStats).map(([date, count]) => ({
        name: new Date(date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: count,
      }))
    },
    1 * 60 * 1000 // 1 minuto de caché para datos más dinámicos
  )
}

export async function getApiPerformanceStats(userId?: string) {
  const cacheKey = `api_performance${userId ? `_${userId}` : ''}`
  
  return cacheHelpers.getUserStats(
    userId || 'global',
    cacheKey,
    async () => {
      const where = userId ? { userId } : {}
      
      const stats = await db.apiUsage.groupBy({
        by: ['endpoint'],
        where,
        _avg: { duration: true },
        _count: { endpoint: true },
        orderBy: { _count: { endpoint: 'desc' } },
      })

      return stats.map((stat: { 
        endpoint: string; 
        _avg: { duration: number | null }; 
        _count: { endpoint: number } 
      }) => ({
        endpoint: stat.endpoint,
        avgDuration: Math.round(stat._avg.duration || 0),
        count: stat._count.endpoint,
      }))
    },
    5 * 60 * 1000 // 5 minutos de caché
  )
}

// Funciones de paginación para analytics
export async function getActivityStatsPaginated(
  userId?: string, 
  page: number = 1, 
  limit: number = 50,
  cursor?: string
) {
  const offset = (page - 1) * limit
  const cacheKey = `activity_stats_page_${page}_limit_${limit}${userId ? `_${userId}` : ''}${cursor ? `_cursor_${cursor}` : ''}`
  
  return cacheHelpers.getUserStats(
    userId || 'global',
    cacheKey,
    async () => {
      const where = userId ? { userId } : {}
      
      // Si hay cursor, usamos cursor-based pagination
      if (cursor) {
        const activities = await db.userActivity.findMany({
          where,
          take: limit,
          cursor: { id: cursor },
          skip: 1, // Skip el cursor
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            createdAt: true,
            metadata: true
          }
        })

        const nextCursor = activities.length === limit ? activities[activities.length - 1].id : null
        
        return {
          data: activities,
          pagination: {
            nextCursor,
            hasMore: activities.length === limit
          }
        }
      }

      // Pagination offset-based tradicional
      const [activities, total] = await Promise.all([
        db.userActivity.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            createdAt: true,
            metadata: true
          }
        }),
        db.userActivity.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      return {
        data: activities,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    },
    1 * 60 * 1000 // 1 minuto de caché para datos paginados
  )
}

export async function getPageViewStatsPaginated(
  userId?: string, 
  page: number = 1, 
  limit: number = 50,
  cursor?: string
) {
  const offset = (page - 1) * limit
  const cacheKey = `pageview_stats_page_${page}_limit_${limit}${userId ? `_${userId}` : ''}${cursor ? `_cursor_${cursor}` : ''}`
  
  return cacheHelpers.getUserStats(
    userId || 'global',
    cacheKey,
    async () => {
      const where = userId ? { userId } : {}
      
      // Si hay cursor, usamos cursor-based pagination
      if (cursor) {
        const pageViews = await db.pageView.findMany({
          where,
          take: limit,
          cursor: { id: cursor },
          skip: 1, // Skip el cursor
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            page: true,
            userAgent: true,
            ip: true,
            createdAt: true
          }
        })

        const nextCursor = pageViews.length === limit ? pageViews[pageViews.length - 1].id : null
        
        return {
          data: pageViews,
          pagination: {
            nextCursor,
            hasMore: pageViews.length === limit
          }
        }
      }

      // Pagination offset-based tradicional
      const [pageViews, total] = await Promise.all([
        db.pageView.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            page: true,
            userAgent: true,
            ip: true,
            createdAt: true
          }
        }),
        db.pageView.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      return {
        data: pageViews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    },
    1 * 60 * 1000 // 1 minuto de caché para datos paginados
  )
}

// Función para batch tracking de page views
export async function trackPageViewsBatch(
  pageViews: Array<{
    page: string;
    userId?: string;
    userAgent?: string;
    ip?: string;
  }>
) {
  try {
    // Validar usuarios en batch si se proporcionan userIds
    const userIds = pageViews
      .map(pv => pv.userId)
      .filter((id): id is string => Boolean(id))
    
    let validUserIds: Set<string> = new Set()
    
    if (userIds.length > 0) {
      const existingUsers = await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true }
      })
      validUserIds = new Set(existingUsers.map((u: { id: string }) => u.id))
    }

    // Preparar datos para inserción batch
    const batchData = pageViews.map(pv => ({
      page: pv.page,
      userId: (pv.userId && validUserIds.has(pv.userId)) ? pv.userId : null,
      userAgent: pv.userAgent,
      ip: pv.ip,
      createdAt: new Date()
    }))

    // Inserción en batch
    const result = await db.pageView.createMany({
      data: batchData,
      skipDuplicates: true
    })

    // Invalidar caché para usuarios afectados
    for (const userId of Array.from(validUserIds)) {
      if (typeof userId === 'string') {
        cacheHelpers.invalidateUser(userId)
      }
    }

    return result
  } catch (error) {
    console.error('Error in batch page view tracking:', error)
    throw error
  }
}

// Función para batch tracking de actividades
export async function trackUserActivitiesBatch(
  activities: Array<{
    userId: string;
    action: string;
    metadata?: Record<string, unknown>;
  }>
) {
  try {
    // Validar que todos los usuarios existen
    const userIds = [...new Set(activities.map(a => a.userId))]
    const existingUsers = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    })
    const validUserIds = new Set(existingUsers.map((u: { id: string }) => u.id))

    // Filtrar solo actividades de usuarios válidos
    const validActivities = activities.filter(a => validUserIds.has(a.userId))

    if (validActivities.length === 0) {
      console.warn('No valid users found for batch activity tracking')
      return { count: 0 }
    }

    // Preparar datos para inserción batch
    const batchData = validActivities.map(activity => ({
      userId: activity.userId,
      action: activity.action,
      metadata: activity.metadata ? JSON.stringify(activity.metadata) : null,
      createdAt: new Date()
    }))

    // Inserción en batch
    const result = await db.userActivity.createMany({
      data: batchData,
      skipDuplicates: true
    })

    // Invalidar caché para usuarios afectados
    for (const userId of Array.from(validUserIds)) {
      if (typeof userId === 'string') {
        cacheHelpers.invalidateUser(userId)
      }
    }

    return result
  } catch (error) {
    console.error('Error in batch activity tracking:', error)
    throw error
  }
}
