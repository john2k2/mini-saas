# Setup completo

## 1) Variables de entorno
Copia `.env.example` a `.env` y completa:
- `DATABASE_URL="file:./dev.db"`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=changeme`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`

## 2) NextAuth + Google OAuth
1. Crea credenciales OAuth (Google Cloud) con redirect:
   - `http://localhost:3000/api/auth/callback/google`
2. Coloca `GOOGLE_CLIENT_ID/SECRET` en `.env`.

## 3) Stripe
- Crea producto/price y toma `STRIPE_PRICE_ID`.
- Webhook local:
  ```bash
  npm run stripe:listen
  ```
  Asegúrate de setear `STRIPE_WEBHOOK_SECRET`.

## 4) Prisma y base de datos
```bash
npm run prisma:generate
npm run prisma:push
```

## 5) Deploy (Vercel)
- Setea todas las env vars en Vercel.
- Configura el webhook de Stripe productivo.
