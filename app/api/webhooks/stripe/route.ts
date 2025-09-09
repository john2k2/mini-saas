import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any; // Stripe types are complex, using any for webhooks is acceptable
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId as string | undefined;
        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: sub.customer,
              stripeSubscriptionId: sub.id,
              status: sub.status,
              currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
            update: {
              stripeCustomerId: sub.customer,
              stripeSubscriptionId: sub.id,
              status: sub.status,
              currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId as string | undefined;
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: { status: "canceled" },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Handler Error: ${errorMessage}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
