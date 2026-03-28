"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-text-primary"
        >
          VoiceAI
        </Link>
        <nav className="flex items-center gap-2">
          <SignedOut>
            <Button variant="ghost" className="text-text-primary" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="#recorder">Start free</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button variant="ghost" className="text-text-primary" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border border-border",
                },
              }}
            />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
