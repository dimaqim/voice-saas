"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Mic, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SidebarRecording = {
  id: string;
  transcript: string;
  createdAt: string;
};

function truncate30(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= 30) return t;
  return `${t.slice(0, 30)}...`;
}

export function ChatGPTSidebar({
  recordings,
  selectedRecordingId,
  userEmail,
}: {
  recordings: SidebarRecording[];
  selectedRecordingId: string | null;
  userEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, selectedRecordingId]);

  const initial = userEmail?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="shrink-0 md:flex md:w-[260px] md:flex-col">
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 shrink-0 items-center border-b border-border bg-sidebar px-3 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-text-primary"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href="/dashboard"
          className="ml-2 flex items-center gap-2 text-base font-semibold text-text-primary"
        >
          <Mic className="h-4 w-4 text-primary" />
          VoiceAI
        </Link>
      </div>

      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-14 z-50 flex h-[calc(100dvh-3.5rem)] w-[260px] -translate-x-full flex-col border-r border-border bg-sidebar transition-transform duration-200 ease-out md:relative md:top-0 md:z-0 md:h-screen md:shrink-0 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-sidebar-hover"
            onClick={() => setMobileOpen(false)}
          >
            New Recording
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <nav className="flex flex-col gap-0.5">
            {recordings.length === 0 ? (
              <p className="px-2 py-3 text-sm text-text-secondary">
                No recordings yet
              </p>
            ) : (
              recordings.map((r) => {
                const active = selectedRecordingId === r.id;
                return (
                  <Link
                    key={r.id}
                    href={`/dashboard?recording=${r.id}`}
                    className={cn(
                      "block rounded-lg px-2 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-sidebar-active text-text-primary"
                        : "text-text-primary hover:bg-sidebar-hover",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="line-clamp-2 block leading-snug">
                      {truncate30(r.transcript)}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-secondary">
                      {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </span>
                  </Link>
                );
              })
            )}
          </nav>

          <Link
            href="/dashboard/history"
            className={cn(
              "mt-3 block rounded-lg px-2 py-2 text-sm transition-colors hover:bg-sidebar-hover",
              pathname.startsWith("/dashboard/history")
                ? "bg-sidebar-active text-text-primary"
                : "text-text-secondary",
            )}
            onClick={() => setMobileOpen(false)}
          >
            Full history
          </Link>
        </div>

        <div className="mt-auto border-t border-border p-3">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-medium text-text-primary">
              {initial}
            </div>
            <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
              {userEmail}
            </span>
            <Link
              href="/billing"
              className="shrink-0 rounded-md p-1.5 text-text-secondary transition-colors hover:bg-sidebar-hover hover:text-text-primary"
              aria-label="Settings"
              title="Settings"
              onClick={() => setMobileOpen(false)}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href="/billing"
              className="rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-sidebar-hover hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Billing
            </Link>
            <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-sidebar-hover hover:text-text-primary"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </div>
  );
}
