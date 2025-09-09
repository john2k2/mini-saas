import { db } from '../app/lib/db'

async function seedAnalytics() {
  console.log('🌱 Seeding analytics data...')

  // Obtener el primer usuario
  const user = await db.user.findFirst()
  
  if (!user) {
    console.log('❌ No users found. Please create a user first.')
    return
  }

  console.log(`📊 Adding analytics data for user: ${user.email}`)

  // Actividades de ejemplo
  const activities = [
    'login',
    'dashboard_view',
    'premium_access',
    'settings_change',
    'data_export',
    'billing_view',
    'account_update',
  ]

  // Páginas de ejemplo
  const pages = [
    '/',
    '/dashboard',
    '/premium',
    '/account',
    '/billing',
    '/settings',
  ]

  // Crear actividades de los últimos 30 días
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // 2-5 actividades por día
    const dailyActivities = Math.floor(Math.random() * 4) + 2
    
    for (let j = 0; j < dailyActivities; j++) {
      const activity = activities[Math.floor(Math.random() * activities.length)]
      
      await db.userActivity.create({
        data: {
          userId: user.id,
          action: activity,
          metadata: JSON.stringify({ day: i, session: j }),
          createdAt: date,
        },
      })
    }
  }

  // Crear page views
  for (let i = 0; i < 50; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    
    const page = pages[Math.floor(Math.random() * pages.length)]
    
    await db.pageView.create({
      data: {
        userId: user.id,
        page,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '127.0.0.1',
        duration: Math.floor(Math.random() * 300) + 30, // 30-330 segundos
        createdAt: date,
      },
    })
  }

  // Crear API usage
  const endpoints = [
    '/api/subscription',
    '/api/billing/checkout',
    '/api/billing/portal',
    '/api/analytics/stats',
    '/api/user/profile',
  ]

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 15))
    
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    
    await db.apiUsage.create({
      data: {
        userId: user.id,
        endpoint,
        method: 'GET',
        status: Math.random() > 0.1 ? 200 : 500, // 90% success rate
        duration: Math.floor(Math.random() * 500) + 50, // 50-550ms
        createdAt: date,
      },
    })
  }

  console.log('✅ Analytics seeding completed!')
}

seedAnalytics()
  .catch((error) => {
    console.error('❌ Error seeding analytics:', error)
  })
  .finally(() => {
    process.exit(0)
  })
