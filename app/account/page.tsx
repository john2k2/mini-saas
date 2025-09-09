import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Container from "@/app/components/container";
import Card from "@/app/components/ui/card";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

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

  return (
    <main>
      <Container className="py-8 space-y-4">
        <div className="fade-in-up">
          <h1 className="text-3xl font-bold">Mi Cuenta</h1>
          <p className="text-[color:var(--muted)]">Gestiona tu información personal</p>
        </div>
        <Card className="fade-in">
          <h2 className="text-xl font-semibold mb-4">Información del usuario</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">Nombre</label>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">Miembro desde</label>
              <p className="text-lg">{new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}