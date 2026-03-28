"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

function Inner() {
  const search = useSearchParams();
  useEffect(() => {
    if (search.get("success") === "true") {
      toast({
        title: "You’re subscribed",
        description: "Welcome to VoiceAI Pro. Start recording anytime.",
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [search]);
  return null;
}

export function DashboardSuccessToast() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
