# 🚀 Mini-SaaS - Plataforma de Analytics y Gestión

Una plataforma SaaS completa construida con **Next.js 14**, **NextAuth**, **Prisma**, y **Stripe** que ofrece analytics en tiempo real, gestión de usuarios y sistema de suscripciones premium.

![Mini-SaaS Dashboard](https://via.placeholder.com/800x400/1e1b4b/ffffff?text=Analytics+Dashboard)

## ✨ Características Principales

### 🔐 **Sistema de Usuarios Completo**
- **Google OAuth** y login con email
- **Gestión de sesiones** segura
- **Perfiles de usuario** con configuraciones
- **Notificaciones** en tiempo real

### 💳 **Suscripciones Premium**
- **Planes flexibles** con Stripe
- **Billing portal** automático
- **Webhooks** para sincronización
- **Prueba gratuita** incluida

### 📊 **Analytics en Tiempo Real**
- **Dashboard interactivo** con gráficos
- **Métricas de uso** personalizadas
- **Reportes exportables** para usuarios premium
- **Visualizaciones** responsivas

### � **Funcionalidades Premium**
- **Analytics avanzados** con múltiples vistas
- **Exportación de datos** en CSV/JSON
- **API access** con rate limiting
- **Soporte prioritario**

## 🛠️ Stack Tecnológico

| Tecnología | Propósito | Version |
|------------|-----------|---------|
| **Next.js** | Framework React con App Router | 14.x |
| **TypeScript** | Tipado estático | 5.x |
| **NextAuth.js** | Autenticación | 4.x |
| **Prisma** | ORM y manejo de base de datos | 5.x |
| **Stripe** | Procesamiento de pagos | Latest |
| **Tailwind CSS** | Styling y diseño | 4.x |
| **SQLite** | Base de datos (desarrollo) | - |

## 🚀 Instalación y Configuración

### 1. **Clonar el repositorio**
```bash
git clone [tu-repo-url]
cd mini-saas
npm install
```

### 2. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-super-seguro

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret
STRIPE_PRICE_ID=price_tu-price-id
```

### 3. **Configurar la base de datos**
```bash
npx prisma generate
npx prisma db push
```

### 4. **Configurar Stripe**
```bash
# Instalar Stripe CLI
# Escuchar webhooks localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## ⚙️ Configuración Detallada

### 🔑 **Google OAuth Setup**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/auth/callback/google` a URIs autorizadas

### 💳 **Stripe Setup**
1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves de API en modo test
3. Crea un producto y precio en el dashboard
4. Configura webhooks para `customer.subscription.updated`

## 📁 Estructura del Proyecto

```
mini-saas/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/             # Componentes base (Button, Card, etc.)
│   │   ├── container.tsx   # Layout container
│   │   └── navbar.tsx      # Navegación principal
│   ├── hooks/              # Custom hooks
│   │   └── useSubscription.ts
│   ├── lib/                # Utilidades y configuración
│   │   ├── auth.ts         # NextAuth config
│   │   ├── prisma.ts       # Prisma client
│   │   └── stripe.ts       # Stripe client
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── billing/        # Stripe checkout y portal
│   │   ├── subscription/   # Estado de suscripción
│   │   └── webhooks/       # Stripe webhooks
│   ├── dashboard/          # Dashboard principal
│   ├── premium/            # Contenido premium
│   ├── pricing/            # Página de precios
│   ├── account/            # Perfil de usuario
│   └── login/              # Página de login
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
└── public/                 # Archivos estáticos
```

## 🎯 Flujos de Usuario Principales

### 1. **Registro y Login**
```
Usuario visita / → Ve landing → Click "Iniciar sesión" → 
Página /login → Elige Google/Email → Autenticación → 
Redirección a /dashboard
```

### 2. **Suscripción Premium**
```
Usuario en dashboard → Click "Actualizar a Premium" → 
Stripe Checkout → Pago exitoso → Webhook actualiza DB → 
Usuario ve contenido premium
```

### 3. **Gestión de Suscripción**
```
Usuario premium → Click "Gestionar suscripción" → 
Stripe Billing Portal → Modificar/cancelar → 
Webhook sincroniza cambios
```

## 🔒 Seguridad y Protección

- **Rutas protegidas** con middleware de NextAuth
- **Validación de sesiones** en server-side
- **Verificación de suscripción** antes de mostrar contenido premium
- **Webhooks seguros** con verificación de signature
- **Variables de entorno** para datos sensibles

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel dashboard
# Actualizar NEXTAUTH_URL a tu dominio de producción
```

### Variables de Producción
```env
NEXTAUTH_URL=https://tu-dominio.vercel.app
DATABASE_URL="postgresql://..." # Base de datos en la nube
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook de producción
```

## 📊 Métricas y Analytics

El proyecto incluye tracking básico de:
- **Estados de suscripción** por usuario
- **Conversión de checkout** via Stripe
- **Uso de contenido premium**
- **Retención de usuarios**

## 🎨 Customización

### Colores y Tema
Edita las variables CSS en `app/globals.css`:
```css
:root {
  --background: 220 20% 10%;
  --foreground: 220 20% 98%;
  --accent: 239 84% 67%;
  --muted: 220 20% 70%;
}
```

### Componentes
Todos los componentes están en `app/components/` y usan Tailwind para styling consistente.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙋‍♂️ Soporte

Si tienes preguntas o problemas:
- Abre un **Issue** en GitHub
- Revisa la **documentación** de las dependencias
- Consulta los **logs** de Stripe webhooks

---

⭐ **¡Si este proyecto te ayudó, no olvides darle una estrella en GitHub!**
