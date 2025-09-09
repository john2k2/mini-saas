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

  // Asegurar customer en Stripe
  const sub = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "inactive" },
    update: {},
  });

  let stripeCustomerId = sub.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { stripeCustomerId },
    });
  }

  const priceId = process.env.STRIPE_PRICE_ID!;
  const sessionCheckout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    locale: "es",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId: user.id },
    },
  });

  return NextResponse.redirect(sessionCheckout.url!, { status: 303 });
}
