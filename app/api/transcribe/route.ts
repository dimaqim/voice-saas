export const dynamic = 'force-dynamic';

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 120;

const FREE_COOKIE = "voiceai_free_used";

export async function POST(req: NextRequest) {
  const { userId } = auth();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json(
      { error: "Please record something first" },
      { status: 400 },
    );
  }

  const durationSec = Number(formData.get("duration") ?? 0);
  if (durationSec > 0 && durationSec < 1) {
    return NextResponse.json(
      { error: "Recording too short" },
      { status: 400 },
    );
  }
  if (durationSec > 300) {
    return NextResponse.json(
      { error: "Recording must be 5 minutes or less" },
      { status: 400 },
    );
  }

  let dbUser = null;
  if (userId) {
    const prisma = getPrisma();
    dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser || dbUser.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 402 },
      );
    }
  } else {
    const used = req.cookies.get(FREE_COOKIE)?.value === "true";
    if (used) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename =
    file instanceof File && file.name ? file.name : "recording.webm";

  // Whisper auto-detects language (Russian, Ukrainian, English, etc.).
  // Do not pass `language` — return transcript in the spoken language.
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let transcript: string;
  try {
    const result = await openai.audio.transcriptions.create({
      file: await toFile(buffer, filename),
      model: "whisper-1",
    });
    transcript = result.text?.trim() ?? "";
  } catch (e) {
    console.error("Whisper error:", e);
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 },
    );
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "No speech detected. Please record again." },
      { status: 400 },
    );
  }

  const durationRounded = durationSec || 0;
  const durationMs =
    durationRounded > 0 ? Math.round(durationRounded * 1000) : null;

  let recordingId: string | undefined;
  if (userId && dbUser) {
    const prisma = getPrisma();
    const rec = await prisma.recording.create({
      data: {
        userId: dbUser.id,
        transcript,
        duration: durationMs,
      },
    });
    recordingId = rec.id;
  }

  const res = NextResponse.json({
    transcript,
    duration: durationRounded,
    recordingId,
  });

  if (!userId) {
    res.cookies.set(FREE_COOKIE, "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 400,
    });
  }

  return res;
}
