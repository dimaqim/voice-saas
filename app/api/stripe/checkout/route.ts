import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

async function createCheckoutSession(clerkUserId: string, email: string) {
  const base = appBaseUrl();
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${base}/dashboard?success=true`,
    cancel_url: `${base}/?canceled=true`,
    metadata: { clerkId: clerkUserId },
    subscription_data: {
      metadata: { clerkId: clerkUserId },
    },
    customer_email: email,
    allow_promotion_codes: true,
    billing_address_collection: "required",
  });
}

/** Clerk redirects here after sign-up (browser GET). */
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-up", appBaseUrl()));
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.redirect(new URL("/sign-up", appBaseUrl()));
  }

  const session = await createCheckoutSession(userId, email);
  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }
  return NextResponse.redirect(session.url);
}

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  const session = await createCheckoutSession(userId, email);
  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }
  return NextResponse.json({ url: session.url });
}
