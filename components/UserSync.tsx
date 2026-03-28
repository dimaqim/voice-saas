"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/** Upserts the signed-in Clerk user into Postgres once per session. */
export function UserSync() {
  const { isLoaded, userId } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !userId || synced.current) return;
    synced.current = true;

    void fetch("/api/user/sync", { method: "POST" }).catch(() => {
      synced.current = false;
    });
  }, [isLoaded, userId]);

  return null;
}
