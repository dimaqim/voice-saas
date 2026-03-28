import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email,
    },
    update: {
      email,
    },
  });

  return NextResponse.json(user);
}
