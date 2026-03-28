"use client";

import { Loader2, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatAssistant({
  latestTranscript,
}: {
  /** Optional context from the most recent recording */
  latestTranscript: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const context =
        latestTranscript && messages.length === 0
          ? `[Latest transcript for context]\n${latestTranscript}\n\n`
          : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...nextMessages.slice(0, -1).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: "user" as const,
              content: context + text,
            },
          ],
        }),
      });

      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      const reply = data.text ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      toast({
        title: "Assistant unavailable",
        description:
          e instanceof Error ? e.message : "Could not reach the AI assistant.",
        variant: "destructive",
      });
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border bg-surface/60">
      <CardHeader className="cursor-pointer pb-2" onClick={() => setOpen((o) => !o)}>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Ask VoiceAI (GPT-4o)
          <span className="ml-auto text-xs font-normal text-text-secondary">
            {open ? "Hide" : "Show"}
          </span>
        </CardTitle>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-3 border-t border-border pt-4">
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg bg-background/50 p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Ask for a summary, bullet list, translation, or edits. Your
                latest transcript is included as context on the first message.
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-6 bg-primary/15 text-text-primary"
                    : "mr-6 bg-surface-hover text-text-primary",
                )}
              >
                {m.content}
              </div>
            ))}
            {loading ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none ring-primary focus:ring-2"
              placeholder="Ask about your transcripts…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              disabled={loading || !input.trim()}
              onClick={() => void send()}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
