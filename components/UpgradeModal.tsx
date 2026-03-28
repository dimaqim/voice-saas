"use client";

import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpgradeModal({ open, onOpenChange }: Props) {
  const { signUp, isLoaded } = useSignUp();

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  async function signUpWithGoogle() {
    if (!signUp || !isLoaded) return;
    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${appUrl}/dashboard`,
      redirectUrlComplete: `${appUrl}/dashboard`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign up to continue recording</DialogTitle>
          <DialogDescription>
            You&apos;ve used your free recording. Create an account to keep
            going.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-border bg-background"
            disabled={!isLoaded}
            onClick={() => void signUpWithGoogle()}
          >
            Continue with Google
          </Button>
          <Button className="w-full" asChild>
            <Link href="/sign-up">
              <Mail className="h-4 w-4" />
              Continue with Email
            </Link>
          </Button>
          <p className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
