export const dynamic = 'force-dynamic';

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rec = await prisma.recording.findFirst({
    where: { id, userId: user.id },
  });
  if (!rec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recording.delete({ where: { id: rec.id } });
  return NextResponse.json({ ok: true });
}
