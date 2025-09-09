import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const start = Date.now()
  
  // Obtener el token para el userId
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const response = NextResponse.next()
  
  // Solo trackear en producción o si está habilitado
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_ANALYTICS === 'true') {
    const duration = Date.now() - start
    
    // Agregar headers para el tracking
    response.headers.set('x-user-id', token?.sub || '')
    response.headers.set('x-duration', duration.toString())
    response.headers.set('x-pathname', request.nextUrl.pathname)
    response.headers.set('x-user-agent', request.headers.get('user-agent') || '')
    
    // No trackear recursos estáticos
    if (!request.nextUrl.pathname.startsWith('/_next') && 
        !request.nextUrl.pathname.startsWith('/api/auth') &&
        !request.nextUrl.pathname.includes('.')) {
      
      // El tracking real se hará en el layout o página
      response.headers.set('x-track-page', 'true')
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
