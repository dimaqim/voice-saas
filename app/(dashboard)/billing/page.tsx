import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { BillingClient } from "@/components/BillingClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BillingPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  let nextBilling: string | null = null;
  let displayActive = user.subscriptionStatus === "active";

  if (user.subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.subscriptionId);
      displayActive = sub.status === "active" || sub.status === "trialing";
      const periodEnd = sub.items?.data?.[0]?.current_period_end;
      if (periodEnd) {
        nextBilling = new Date(periodEnd * 1000).toLocaleDateString(
          undefined,
          { dateStyle: "long" },
        );
      }
    } catch {
      /* subscription may have been deleted in Stripe */
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          ← Back to dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-text-secondary">
          Manage your VoiceAI Pro subscription securely through Stripe.
        </p>
      </div>

      <Card className="border-border bg-background shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">VoiceAI Pro</CardTitle>
            {displayActive ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          <CardDescription>
            $1/month · Unlimited transcriptions and full history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {displayActive && nextBilling ? (
            <p className="text-sm text-text-primary">
              <span className="text-text-secondary">Next billing date: </span>
              {nextBilling}
            </p>
          ) : null}

          {displayActive && user.stripeCustomerId ? (
            <BillingClient />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                You don&apos;t have an active subscription yet. Start checkout
                to unlock unlimited recordings.
              </p>
              <Button asChild>
                <Link href="/api/stripe/checkout">Subscribe with Stripe</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
