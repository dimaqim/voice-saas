"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  "Unlimited voice recordings & transcriptions",
  "Whisper-1 accuracy with fast turnaround",
  "Full history & export-friendly transcripts",
  "Cancel anytime from the billing portal",
];

export function PricingCard() {
  return (
    <Card className="mx-auto max-w-md border border-border bg-background shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-text-primary">VoiceAI Pro</CardTitle>
        <CardDescription className="text-base leading-relaxed text-text-secondary">
          $1/month · Everything you need to capture ideas by voice.
        </CardDescription>
        <p className="pt-2 text-3xl font-bold tracking-tight text-text-primary">
          $1
          <span className="text-lg font-normal text-text-secondary">/mo</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm text-text-primary">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" asChild>
          <Link href="#recorder">Start for free</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
