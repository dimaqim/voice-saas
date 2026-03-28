"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Mic, Trash2, Copy } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { PaymentModal } from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import type { SidebarRecording } from "@/components/ChatGPTSidebar";

export function DashboardWorkspace({
  recordings,
  subscriptionActive,
}: {
  recordings: SidebarRecording[];
  subscriptionActive: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordingParam = searchParams.get("recording");
  const selectedRecordingId = recordingParam || null;

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [liveResult, setLiveResult] = useState<{
    transcript: string;
    id?: string;
  } | null>(null);

  const selected = useMemo(
    () => recordings.find((r) => r.id === selectedRecordingId) ?? null,
    [recordings, selectedRecordingId],
  );

  useEffect(() => {
    if (!selectedRecordingId) {
      setLiveResult(null);
    }
  }, [selectedRecordingId]);

  useEffect(() => {
    if (selected && liveResult?.id === selected.id) {
      setLiveResult(null);
    }
  }, [selected, liveResult]);

  const recorderKey = selectedRecordingId ?? "new";

  const onTranscribed = useCallback(
    (transcript: string, recordingId?: string) => {
      setLiveResult({ transcript, id: recordingId });
      if (recordingId) {
        router.replace(`/dashboard?recording=${recordingId}`);
      }
      router.refresh();
      toast({
        title: "Transcription ready",
        description: "Your recording was saved.",
      });
    },
    [router],
  );

  const displayTranscript =
    selected?.transcript ?? liveResult?.transcript ?? null;
  const displayId = selected?.id ?? liveResult?.id;

  async function copyDisplayed() {
    if (!displayTranscript) return;
    try {
      await navigator.clipboard.writeText(displayTranscript);
      toast({ title: "Copied", description: "Transcript copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Try selecting the text manually.",
        variant: "destructive",
      });
    }
  }

  async function deleteDisplayed() {
    if (!displayId) return;
    try {
      const res = await fetch(`/api/recordings/${displayId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: "Deleted", description: "Recording removed." });
      setLiveResult(null);
      router.replace("/dashboard");
      router.refresh();
    } catch {
      toast({
        title: "Could not delete",
        variant: "destructive",
      });
    }
  }

  const showFirstRunHint =
    subscriptionActive &&
    recordings.length === 0 &&
    !selectedRecordingId &&
    !liveResult;

  const showSubscribeHint =
    !subscriptionActive &&
    recordings.length === 0 &&
    !selectedRecordingId;

  return (
    <>
      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />

      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[768px] flex-col px-4 py-8 md:min-h-screen">
        <div className="flex w-full flex-col items-center">
          <VoiceRecorder
            key={recorderKey}
            variant="dashboard"
            subscriptionActive={subscriptionActive}
            onPaymentRequired={() => {
              setPaymentOpen(true);
              toast({
                title: "Subscription required",
                description: "Subscribe to unlock transcriptions.",
              });
            }}
            suppressResultCard
            onTranscribedResult={onTranscribed}
          />
        </div>

        {showFirstRunHint ? (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Mic className="h-14 w-14 text-text-secondary/35" />
            <p className="text-base leading-relaxed text-text-secondary">
              Click the microphone to start your first recording.
            </p>
          </div>
        ) : null}

        {showSubscribeHint ? (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Mic className="h-14 w-14 text-text-secondary/35" />
            <p className="max-w-md text-base leading-relaxed text-text-secondary">
              Subscribe for $1/month to transcribe and save unlimited
              recordings.
            </p>
          </div>
        ) : null}

        {displayTranscript ? (
          <Card
            className="mt-8 w-full animate-fade-up border border-border bg-background opacity-0 shadow-sm"
            style={{ animationFillMode: "forwards" }}
          >
            <CardContent className="space-y-4 p-6">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-text-primary">
                {displayTranscript}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border bg-background"
                  onClick={() => void copyDisplayed()}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                {displayId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-destructive hover:bg-red-50"
                    onClick={() => void deleteDisplayed()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
