export const dynamic = 'force-dynamic';

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatGPTSidebar } from "@/components/ChatGPTSidebar";
import { HistoryTable } from "@/components/HistoryTable";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

type Props = {
  searchParams: { page?: string };
};

export default async function HistoryPage({ searchParams }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const page = Math.max(1, Number(searchParams.page) || 1);

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!user) redirect("/sign-in");

  const [sidebarRows, total, rows] = await Promise.all([
    prisma.recording.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, transcript: true, createdAt: true },
    }),
    prisma.recording.count({ where: { userId: user.id } }),
    prisma.recording.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, transcript: true, createdAt: true },
    }),
  ]);

  const sidebarSerialized = sidebarRows.map((r) => ({
    id: r.id,
    transcript: r.transcript,
    createdAt: r.createdAt.toISOString(),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const serialized = rows.map((r) => ({
    id: r.id,
    transcript: r.transcript,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <ChatGPTSidebar
        recordings={sidebarSerialized}
        selectedRecordingId={null}
        userEmail={user.email}
      />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Full history
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            All transcripts, newest first. Click a row to expand.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-background">
            <HistoryTable rows={serialized} />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <Button variant="outline" className="border-border bg-background" asChild>
              <Link
                href={page <= 1 ? "#" : `/dashboard/history?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                Previous
              </Link>
            </Button>
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" className="border-border bg-background" asChild>
              <Link
                href={
                  page >= totalPages
                    ? "#"
                    : `/dashboard/history?page=${page + 1}`
                }
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
