import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.stripeCustomerId) return NextResponse.json({ error: "No customer" }, { status: 400 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });
  return NextResponse.redirect(portal.url, { status: 303 });
}
