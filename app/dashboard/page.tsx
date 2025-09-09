import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Container from "@/app/components/container";
import Card from "@/app/components/ui/card";
import Button from "@/app/components/ui/button";
import { Suspense } from "react";
import DashboardSkeleton from "@/app/components/dashboard-skeleton";

async function DashboardContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  // Simulamos un pequeño delay para mostrar el loading (remover en producción)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Buscar o crear el usuario
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  if (!user) {
    // Crear el usuario si no existe
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || session.user.email.split('@')[0],
      },
    });
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const isActive = sub?.status === "active";

  return (
    <main>
      <Container className="py-6 sm:py-8 space-y-6 px-4 sm:px-0">
        <div className="fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-[color:var(--muted)]">Hola {session.user.name ?? session.user.email}</p>
        </div>

        {/* Estado de suscripción */}
        <Card className="fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Estado de Suscripción</h2>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <span className="w-3 h-3 bg-[color:var(--accent)] rounded-full"></span>
                    <span className="font-medium text-[color:var(--accent)]">Premium Activo</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="font-medium text-gray-400">Plan Gratuito</span>
                  </>
                )}
              </div>
              <p className="text-sm text-[color:var(--muted)] mt-1">
                {isActive ? (
                  "Tienes acceso completo a todas las funcionalidades premium"
                ) : (
                  "Actualiza a Premium para desbloquear todas las funcionalidades"
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {isActive ? (
                <form action="/api/billing/portal" method="post">
                  <Button type="submit" variant="outline">Gestionar suscripción</Button>
                </form>
              ) : (
                <>
                  <Button href="/pricing" variant="outline">Ver planes</Button>
                  <form action="/api/billing/checkout" method="post">
                    <Button type="submit">Actualizar a Premium</Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="fade-in">
            <h3 className="font-semibold mb-2">Proyectos</h3>
            <div className="text-2xl font-bold mb-1">
              {isActive ? "∞" : "3"}
            </div>
            <p className="text-sm text-[color:var(--muted)]">
              {isActive ? "Proyectos ilimitados" : "Hasta 3 proyectos"}
            </p>
          </Card>
          
          <Card className="fade-in">
            <h3 className="font-semibold mb-2">Almacenamiento</h3>
            <div className="text-2xl font-bold mb-1">
              {isActive ? "100GB" : "1GB"}
            </div>
            <p className="text-sm text-[color:var(--muted)]">
              {isActive ? "15GB utilizados" : "0.5GB utilizados"}
            </p>
          </Card>
          
          <Card className="fade-in">
            <h3 className="font-semibold mb-2">API Calls</h3>
            <div className="text-2xl font-bold mb-1">
              {isActive ? "10K/hora" : "100/día"}
            </div>
            <p className="text-sm text-[color:var(--muted)]">
              {isActive ? "Rate limit premium" : "Rate limit básico"}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="fade-in">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button href="/account" variant="outline" className="justify-start">
              👤 Ver perfil
            </Button>
            {isActive && (
              <Button href="/premium" variant="outline" className="justify-start">
                ✨ Contenido Premium
              </Button>
            )}
            <Button href="/pricing" variant="outline" className="justify-start">
              💳 Ver planes
            </Button>
            {!isActive && (
              <form action="/api/billing/checkout" method="post">
                <Button type="submit" variant="outline" className="w-full justify-start">
                  🚀 Actualizar a Premium
                </Button>
              </form>
            )}
          </div>
        </Card>
      </Container>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
