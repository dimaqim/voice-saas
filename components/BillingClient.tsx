"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function BillingClient() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal");
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal");
      }
      toast({ title: "Opening billing portal", description: "Redirecting…" });
      window.location.href = data.url;
    } catch (e) {
      toast({
        title: "Portal unavailable",
        description:
          e instanceof Error ? e.message : "Try again in a few minutes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        className="gap-2"
        disabled={loading}
        onClick={() => void openPortal()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        Manage subscription
      </Button>
      <button
        type="button"
        disabled={loading}
        onClick={() => void openPortal()}
        className="text-left text-sm text-text-secondary underline-offset-4 hover:text-primary hover:underline"
      >
        Cancel subscription
      </button>
      <p className="text-xs text-text-secondary sm:ml-2">
        Cancellation and plan changes are completed in the secure Stripe
        customer portal.
      </p>
    </div>
  );
}
