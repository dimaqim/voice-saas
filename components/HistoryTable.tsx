"use client";

import { format } from "date-fns";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
export type HistoryRow = {
  id: string;
  transcript: string;
  createdAt: string;
};

function preview(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= 50 ? t : `${t.slice(0, 50)}…`;
}

export function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/recordings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      toast({ title: "Deleted", description: "Recording removed." });
      router.refresh();
    } catch {
      toast({
        title: "Could not delete",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-text-secondary">
        No recordings yet. Start from the dashboard.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10" />
          <TableHead>Date</TableHead>
          <TableHead>Preview</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const expanded = openId === r.id;
          return (
            <Fragment key={r.id}>
              <TableRow
                className="cursor-pointer"
                onClick={() => setOpenId(expanded ? null : r.id)}
              >
                <TableCell>
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-text-secondary">
                  {format(new Date(r.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="max-w-[min(40vw,24rem)] truncate text-sm">
                  {preview(r.transcript)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={deletingId === r.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      void remove(r.id);
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              {expanded ? (
                <TableRow key={`${r.id}-detail`} className="hover:bg-transparent">
                  <TableCell colSpan={4} className="bg-sidebar">
                    <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-text-primary">
                      {r.transcript}
                    </p>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
