import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function subscriptionStatusFromStripe(
  status: Stripe.Subscription.Status,
): string {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  return "inactive";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerkId;
        if (!clerkId) break;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        await prisma.user.updateMany({
          where: { clerkId },
          data: {
            subscriptionStatus: "active",
            stripeCustomerId: customerId ?? undefined,
            subscriptionId: subId ?? undefined,
          },
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkId = sub.metadata?.clerkId;
        if (!clerkId) break;

        const status =
          event.type === "customer.subscription.deleted"
            ? "inactive"
            : subscriptionStatusFromStripe(sub.status);

        await prisma.user.updateMany({
          where: { clerkId },
          data: {
            subscriptionStatus: status,
            subscriptionId: sub.id,
          },
        });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
