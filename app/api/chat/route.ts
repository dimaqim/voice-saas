import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "Subscription required" }, { status: 402 });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages?.filter(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string",
  );
  if (!messages?.length) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You help users clean up, summarize, and action voice transcripts. Keep answers concise and practical.",
        },
        ...messages,
      ],
    });
    const text = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Chat error:", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
