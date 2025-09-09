import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Container from "@/app/components/container";
import Card from "@/app/components/ui/card";
import Button from "@/app/components/ui/button";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      <Container className="py-12 space-y-12">
        {/* Header */}
        <div className="text-center fade-in-up px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Planes y Precios</h1>
          <p className="text-lg sm:text-xl text-[color:var(--muted)] max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. 
            Comienza gratis y actualiza cuando estés listo.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
          {/* Plan Gratuito */}
          <Card className="fade-in relative">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Gratuito</h3>
              <p className="text-[color:var(--muted)] mb-4">
                Perfecto para empezar y probar la plataforma
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-[color:var(--muted)]">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Hasta 3 proyectos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">1GB de almacenamiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Soporte por email</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Dashboard básico</span>
                </li>
              </ul>
              {!session ? (
                <Button href="/login" className="w-full">
                  Comenzar Gratis
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Plan Actual
                </Button>
              )}
            </div>
          </Card>

          {/* Plan Premium */}
          <Card className="fade-in relative border-[color:var(--accent)] border-2">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[color:var(--accent)] text-white px-3 py-1 rounded-full text-sm font-medium">
                Más Popular
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <p className="text-[color:var(--muted)] mb-4">
                Para profesionales que necesitan más funcionalidades
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-[color:var(--muted)]">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Proyectos ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">100GB de almacenamiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Soporte prioritario</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Analytics avanzados</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Exportación de datos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Contenido premium</span>
                </li>
              </ul>
              {session ? (
                <form action="/api/billing/checkout" method="post">
                  <Button type="submit" className="w-full">
                    Suscribirse
                  </Button>
                </form>
              ) : (
                <Button href="/login" className="w-full">
                  Comenzar Premium
                </Button>
              )}
            </div>
          </Card>

          {/* Plan Empresa */}
          <Card className="fade-in relative">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Empresa</h3>
              <p className="text-[color:var(--muted)] mb-4">
                Soluciones personalizadas para equipos grandes
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold">$29.99</span>
                <span className="text-[color:var(--muted)]">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Todo lo de Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">1TB de almacenamiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Soporte dedicado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">Gestión de equipos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">SSO integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[color:var(--accent)]">✓</span>
                  <span className="text-sm">SLA garantizado</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contactar Ventas
              </Button>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 fade-in">
            Preguntas Frecuentes
          </h2>
          <div className="grid gap-6">
            <Card className="fade-in">
              <h3 className="font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-[color:var(--muted)] text-sm">
                Sí, puedes actualizar o degradar tu plan en cualquier momento. 
                Los cambios se aplicarán en tu próximo período de facturación.
              </p>
            </Card>
            <Card className="fade-in">
              <h3 className="font-semibold mb-2">¿Hay compromisos a largo plazo?</h3>
              <p className="text-[color:var(--muted)] text-sm">
                No, todos nuestros planes son de mes a mes. Puedes cancelar cuando quieras sin penalizaciones.
              </p>
            </Card>
            <Card className="fade-in">
              <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-[color:var(--muted)] text-sm">
                Aceptamos todas las tarjetas de crédito principales a través de Stripe, 
                nuestro procesador de pagos seguro.
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
