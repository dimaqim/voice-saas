"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Mic, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function LandingInner() {
  const search = useSearchParams();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [showProCta, setShowProCta] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("freeUsed") === "true") setShowProCta(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (search.get("canceled") === "true") {
      toast({
        title: "Checkout canceled",
        description: "No charges were made.",
      });
    }
  }, [search]);

  return (
    <>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <div className="relative min-h-screen bg-background">
        <Navbar />

        <section className="mx-auto max-w-3xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Record your voice. Get instant text.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl">
            One free recording. No signup required.
          </p>

          <div id="recorder" className="mx-auto mt-14 max-w-xl scroll-mt-28">
            <VoiceRecorder
              variant="landing"
              onFreeTierBlocked={() => setUpgradeOpen(true)}
              onFreeRecordingComplete={() => setShowProCta(true)}
            />
          </div>

          {showProCta ? (
            <div className="mx-auto mt-12 max-w-xl rounded-xl border border-border bg-background px-6 py-5 shadow-sm">
              <p className="font-medium text-text-primary">
                Get unlimited recordings for $1/month
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                VoiceAI Pro unlocks unlimited transcriptions and full history.
              </p>
              <Button className="mt-5" asChild>
                <Link href="/sign-up">Upgrade to Pro</Link>
              </Button>
            </div>
          ) : null}
        </section>

        <section className="border-t border-border bg-sidebar py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
            {[
              {
                icon: Zap,
                title: "Instant Transcription",
                body: "Whisper AI, 99% accuracy on clear speech in real-world conditions.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                body: "End-to-end encrypted transport to our processing layer.",
              },
              {
                icon: Mic,
                title: "Unlimited Access",
                body: "$1/month, cancel anytime from your billing portal.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-text-primary">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-text-primary">
            Simple pricing
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center leading-relaxed text-text-secondary">
            One plan with everything you need for voice capture and search-ready
            text.
          </p>
          <div className="mt-10">
            <PricingCard />
          </div>
        </section>

        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <div className="flex gap-6 text-sm text-text-secondary">
              <Link href="/sign-in" className="hover:text-text-primary">
                Sign in
              </Link>
              <Link href="/sign-up" className="hover:text-text-primary">
                Sign up
              </Link>
              <Link href="/dashboard" className="hover:text-text-primary">
                Dashboard
              </Link>
            </div>
            <p className="text-sm text-text-secondary">
              © {new Date().getFullYear()} VoiceAI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export function LandingContent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LandingInner />
    </Suspense>
  );
}
