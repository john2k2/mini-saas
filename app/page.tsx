import Container from "@/app/components/container";
import Card from "@/app/components/ui/card";
import Button from "@/app/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      <Container className="py-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 fade-in-up mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 text-sm">
            <span className="w-2 h-2 bg-[color:var(--accent)] rounded-full animate-pulse"></span>
            Nuevo: Analytics dashboard disponible
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[color:var(--accent)] bg-clip-text text-transparent">
            Mini‑SaaS
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-[color:var(--muted)] max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            La plataforma completa de SaaS con <span className="text-[color:var(--accent)] font-semibold">NextAuth</span>,
            <span className="text-[color:var(--accent)] font-semibold"> Prisma</span> y
            <span className="text-[color:var(--accent)] font-semibold"> Stripe</span> para gestionar tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 px-4 sm:px-0">
            {session ? (
              <Button href="/dashboard" className="px-6 sm:px-8 py-3 text-base sm:text-lg">
                Ir al dashboard →
              </Button>
            ) : (
              <>
                <Button href="/login" className="px-6 sm:px-8 py-3 text-base sm:text-lg">
                  Comenzar gratis
                </Button>
                <Button href="/pricing" variant="outline" className="px-6 sm:px-8 py-3 text-base sm:text-lg">
                  Ver precios
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 px-4 sm:px-0">
          <div className="text-center fade-in">
            <div className="text-4xl font-bold text-[color:var(--accent)] mb-2">100%</div>
            <div className="text-sm text-[color:var(--muted)]">Funcional desde día 1</div>
          </div>
          <div className="text-center fade-in">
            <div className="text-4xl font-bold text-[color:var(--accent)] mb-2">5min</div>
            <div className="text-sm text-[color:var(--muted)]">Setup completo</div>
          </div>
          <div className="text-center fade-in">
            <div className="text-4xl font-bold text-[color:var(--accent)] mb-2">0€</div>
            <div className="text-sm text-[color:var(--muted)]">Plan gratuito incluido</div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 px-4 sm:px-0">
          <Card className="fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[color:var(--accent)]/10 rounded-full -translate-y-10 translate-x-10"></div>
            <h3 className="font-semibold mb-3 text-lg">🔐 Auth Completa</h3>
            <p className="text-sm text-[color:var(--muted)] mb-4">
              Google OAuth + Credentials provider con NextAuth. Sesiones seguras y redirects inteligentes.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[color:var(--accent)]/20 text-xs rounded-full">NextAuth</span>
              <span className="px-2 py-1 bg-[color:var(--accent)]/20 text-xs rounded-full">OAuth</span>
            </div>
          </Card>

          <Card className="fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[color:var(--accent)]/10 rounded-full -translate-y-10 translate-x-10"></div>
            <h3 className="font-semibold mb-3 text-lg">💳 Pagos con Stripe</h3>
            <p className="text-sm text-[color:var(--muted)] mb-4">
              Checkout, billing portal y webhooks. Todo configurado y listo para producción.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[color:var(--accent)]/20 text-xs rounded-full">Stripe</span>
              <span className="px-2 py-1 bg-[color:var(--accent)]/20 text-xs rounded-full">Webhooks</span>
            </div>
          </Card>

          <Card className="fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[color:var(--accent)]/10 rounded-full -translate-y-10 translate-x-10"></div>
            <h3 className="font-semibold mb-3 text-lg">📊 Analytics Premium</h3>
            <p className="text-sm text-[color:var(--muted)] mb-4">
              Dashboard con gráficos, métricas en tiempo real y contenido exclusivo para suscriptores.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[color:var(--accent)]/20 text-xs rounded-full">Charts</span>
              <span className="px-2 py-1 bg-[color:var(--accent)]/20 text-xs rounded-full">Premium</span>
            </div>
          </Card>
        </section>

        {/* Tech Stack */}
        <section className="text-center mb-20 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 fade-in">Stack Tecnológico Moderno</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 14", desc: "App Router + RSC" },
              { name: "TypeScript", desc: "Tipado estático" },
              { name: "Tailwind v4", desc: "CSS moderno" },
              { name: "Prisma", desc: "ORM type-safe" }
            ].map((tech, index) => (
              <div key={index} className="fade-in text-center">
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <div className="w-8 h-8 bg-[color:var(--accent)] rounded-lg"></div>
                </div>
                <h4 className="font-semibold text-sm">{tech.name}</h4>
                <p className="text-xs text-[color:var(--muted)]">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center py-12 sm:py-16 bg-gradient-to-r from-[color:var(--accent)]/10 to-[color:var(--accent)]/5 rounded-2xl border border-[color:var(--accent)]/20 fade-in mx-4 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-4">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          <p className="text-[color:var(--muted)] mb-6 max-w-2xl mx-auto px-4">
            Plataforma completa con analytics avanzados, gestión de suscripciones
            y herramientas profesionales para impulsar tu crecimiento.
          </p>
          {!session && (
            <Button href="/login" className="px-6 sm:px-8 py-3 text-base sm:text-lg">
              Comenzar ahora →
            </Button>
          )}
        </section>
      </Container>
    </main>
  );
}

