"use client";

import { formatDistanceToNow } from "date-fns";
import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  transcript: string;
  createdAt: Date | string;
  onDeleted?: () => void;
  className?: string;
};

export function TranscriptCard({
  id,
  transcript,
  createdAt,
  onDeleted,
  className,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const when = typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  async function copy() {
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
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/recordings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: "Recording removed." });
      onDeleted?.();
    } catch {
      toast({
        title: "Could not delete",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "group rounded-xl border border-border bg-surface-hover/40 px-4 py-3 transition-colors hover:border-border hover:bg-surface-hover/70 animate-fade-up opacity-0",
          className,
        )}
        style={{ animationFillMode: "forwards" }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">
            {formatDistanceToNow(when, { addSuffix: true })}
          </span>
          <div className="flex gap-1 opacity-80 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => void copy()}
              aria-label="Copy transcript"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete recording"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
          {transcript}
        </p>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this recording?</DialogTitle>
            <DialogDescription>
              This removes the transcript from your history. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void remove()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
