"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock unlimited recordings</DialogTitle>
          <DialogDescription>
            Get unlimited access for just $1/month. Cancel anytime from
            billing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button className="w-full" asChild>
            <Link href="/api/stripe/checkout">Subscribe for $1/month</Link>
          </Button>
          <button
            type="button"
            className="text-center text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
