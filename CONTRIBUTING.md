# Contribuir

## Flujo
1. Fork y branch desde `main` (ej: `feat/...`, `fix/...`, `chore/...`).
2. Ejecuta `npm i && npm run dev`.
3. Formato y lint:
    - Ejecuta `npm run format`
    - Ejecuta `npm run lint`
4. Commits claros; abre un PR con descripción (qué cambia y por qué).

## Estilo
- TypeScript estricto cuando sea posible.
- UI con Tailwind; reutiliza componentes en `app/components/ui` cuando aplique.
- No subir secretos (usar `.env`).

## Tests
- Si aún no hay tests, deja una nota para futuro y sugiere pruebas unitarias o e2e.
