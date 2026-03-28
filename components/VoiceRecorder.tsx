"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2, Mic, Square, Copy, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FREE_USED_KEY = "freeUsed";
const MAX_SECONDS = 300;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

export type VoiceRecorderVariant = "landing" | "dashboard";

type VoiceRecorderProps = {
  variant: VoiceRecorderVariant;
  onFreeTierBlocked?: () => void;
  onFreeRecordingComplete?: () => void;
  /** Dashboard: server subscription flag */
  subscriptionActive?: boolean;
  /** Dashboard: user recorded but is not subscribed */
  onPaymentRequired?: () => void;
  /** Dashboard: hide inline result; parent shows card */
  suppressResultCard?: boolean;
  onTranscribedResult?: (transcript: string, recordingId?: string) => void;
  onTranscribed?: () => void;
  className?: string;
};

export function VoiceRecorder({
  variant,
  onFreeTierBlocked,
  onFreeRecordingComplete,
  subscriptionActive = true,
  onPaymentRequired,
  suppressResultCard = false,
  onTranscribedResult,
  onTranscribed,
  className,
}: VoiceRecorderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeRef = useRef<string>("");
  const secondsRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupStream();
    };
  }, [cleanupStream, stopTimer]);

  const submitAudio = useCallback(
    async (blob: Blob, recordedSeconds: number) => {
      setLoading(true);
      setMicError(null);
      try {
        const fd = new FormData();
        const ext = blob.type.includes("mp4") ? "m4a" : "webm";
        fd.append(
          "audio",
          new File([blob], `recording.${ext}`, { type: blob.type }),
        );
        fd.append("duration", String(recordedSeconds));

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: fd,
        });

        const data = (await res.json().catch(() => ({}))) as {
          transcript?: string;
          recordingId?: string;
          error?: string;
        };

        if (res.status === 401) {
          if (variant === "landing") onFreeTierBlocked?.();
          toast({
            title: "Free recording used",
            description: "Sign up to continue transcribing.",
            variant: "destructive",
          });
          return;
        }

        if (res.status === 402) {
          onPaymentRequired?.();
          toast({
            title: "Subscription required",
            description: "Subscribe to unlock transcriptions.",
            variant: "destructive",
          });
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        if (data.transcript) {
          if (!suppressResultCard) {
            setTranscript(data.transcript);
          }
          if (variant === "landing") {
            try {
              localStorage.setItem(FREE_USED_KEY, "true");
            } catch {
              /* ignore */
            }
            onFreeRecordingComplete?.();
          }
          if (variant === "dashboard" && suppressResultCard) {
            onTranscribedResult?.(data.transcript, data.recordingId);
          }
          onTranscribed?.();
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Network error during transcription.";
        toast({
          title: "Transcription failed",
          description: msg,
          variant: "destructive",
        });
        setMicError(msg);
      } finally {
        setLoading(false);
      }
    },
    [
      onFreeRecordingComplete,
      onFreeTierBlocked,
      onPaymentRequired,
      onTranscribed,
      onTranscribedResult,
      suppressResultCard,
      variant,
    ],
  );

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.stop();
    setRecording(false);
    stopTimer();
  }, [stopTimer]);

  const startRecording = useCallback(async () => {
    setMicError(null);
    if (!suppressResultCard || variant === "landing") {
      setTranscript(null);
    }

    if (!isLoaded) return;

    if (variant === "landing" && !isSignedIn) {
      try {
        if (localStorage.getItem(FREE_USED_KEY) === "true") {
          onFreeTierBlocked?.();
          return;
        }
      } catch {
        /* ignore */
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mimeRef.current = pickMimeType();
      const options = mimeRef.current ? { mimeType: mimeRef.current } : {};
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      secondsRef.current = 0;
      setSeconds(0);

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeRef.current || "audio/webm",
        });
        const elapsed = secondsRef.current;
        cleanupStream();
        mediaRecorderRef.current = null;
        setSeconds(0);
        secondsRef.current = 0;

        if (elapsed > 0 && elapsed < 1) {
          toast({
            title: "Recording too short",
            description: "Speak for at least one second.",
            variant: "destructive",
          });
          return;
        }
        if (blob.size < 200) {
          toast({
            title: "No audio captured",
            description: "Please record something first.",
            variant: "destructive",
          });
          return;
        }

        if (variant === "dashboard" && !subscriptionActive) {
          onPaymentRequired?.();
          toast({
            title: "Subscription required",
            description: "Subscribe to transcribe and save recordings.",
          });
          return;
        }

        void submitAudio(blob, elapsed);
      };

      mr.start(250);
      setRecording(true);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch {
      setMicError(
        "Microphone access was blocked. Enable it in your browser settings for this site, then try again.",
      );
      toast({
        title: "Microphone blocked",
        description:
          "Allow microphone access in your browser settings and reload the page.",
        variant: "destructive",
      });
    }
  }, [
    cleanupStream,
    isLoaded,
    isSignedIn,
    onFreeTierBlocked,
    onPaymentRequired,
    stopRecording,
    submitAudio,
    subscriptionActive,
    suppressResultCard,
    variant,
  ]);

  const onToggle = () => {
    if (loading) return;
    if (recording) stopRecording();
    else void startRecording();
  };

  const copyText = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      toast({ title: "Copied", description: "Transcript copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Select the text and copy manually.",
        variant: "destructive",
      });
    }
  };

  const idlePulse =
    variant === "landing" && !recording && !loading && !transcript;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative flex flex-col items-center gap-6">
        {recording && (
          <div className="flex h-12 items-end justify-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className="w-1.5 origin-bottom rounded-full bg-primary/90 animate-bar"
                style={{
                  height: `${12 + (i % 4) * 4}px`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full border-2 transition-transform active:scale-95",
            recording
              ? "border-primary bg-primary/10 animate-pulse-ring-light"
              : "border-border bg-background shadow-sm hover:border-primary/40 hover:bg-sidebar-hover",
            idlePulse && "animate-pulse-mic-idle",
          )}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : recording ? (
            <Square className="h-9 w-9 text-primary" fill="currentColor" />
          ) : (
            <Mic className="h-10 w-10 text-primary" />
          )}
        </button>

        <div className="font-mono text-lg tabular-nums text-text-secondary">
          {formatTime(seconds)}
          <span className="ml-2 text-sm text-text-secondary/70">
            / {formatTime(MAX_SECONDS)}
          </span>
        </div>
      </div>

      {micError && (
        <Card className="w-full max-w-xl border-destructive/30 bg-red-50">
          <CardContent className="flex flex-col gap-3 p-4">
            <p className="text-sm text-text-primary">{micError}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit gap-2 border-border"
              onClick={() => {
                setMicError(null);
                void startRecording();
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="w-full max-w-2xl space-y-3">
          <Skeleton className="h-4 w-3/5 bg-surface-hover" />
          <Skeleton className="h-4 w-full bg-surface-hover" />
          <Skeleton className="h-4 w-4/5 bg-surface-hover" />
        </div>
      )}

      {transcript && !loading && !suppressResultCard && (
        <Card
          className="w-full max-w-2xl border border-border bg-background shadow-sm animate-fade-up opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <CardContent className="space-y-4 p-6">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-text-primary">
              {transcript}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border"
              onClick={copyText}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
