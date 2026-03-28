export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSuccessToast } from "@/components/DashboardSuccessToast";
import { ChatGPTSidebar } from "@/components/ChatGPTSidebar";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

type Props = {
  searchParams: { recording?: string };
};

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const recordings = await prisma.recording.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      transcript: true,
      createdAt: true,
    },
  });

  const serialized = recordings.map((r) => ({
    id: r.id,
    transcript: r.transcript,
    createdAt: r.createdAt.toISOString(),
  }));

  const subscriptionActive = user.subscriptionStatus === "active";
  const selectedId = searchParams.recording ?? null;

  return (
    <>
      <DashboardSuccessToast />
      <div className="flex min-h-screen bg-background">
        <ChatGPTSidebar
          recordings={serialized}
          selectedRecordingId={selectedId}
          userEmail={user.email}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">
          <Suspense
            fallback={
              <div className="min-h-[50vh] bg-background" aria-hidden />
            }
          >
            <DashboardWorkspace
              recordings={serialized}
              subscriptionActive={subscriptionActive}
            />
          </Suspense>
        </main>
      </div>
    </>
  );
}
