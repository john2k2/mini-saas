import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log('🔍 Session email:', session.user.email);
    console.log('🔍 Session name:', session.user.name);
    
    // Buscar el usuario
    let user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    console.log('👤 User found:', user?.email, user?.name);
    
    if (!user) {
      // Crear el usuario si no existe
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
        },
      });
      console.log('✅ User created:', user.email);
    }

    // Buscar la suscripción
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });
    
    console.log('💳 Subscription found:', subscription?.status);

    const hasActiveSubscription = subscription?.status === "active";

    return NextResponse.json({
      hasActiveSubscription,
      status: subscription?.status || "inactive",
      subscriptionId: subscription?.id || null,
      stripeCustomerId: subscription?.stripeCustomerId || null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
