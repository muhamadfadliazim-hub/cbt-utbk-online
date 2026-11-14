"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const CBT_ACTIVE_LOCK_KEY = "az_active_cbt_lock";

export default function CbtActiveLockGuard({ userId }: { userId?: string }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CBT_ACTIVE_LOCK_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { examId?: string; userId?: string; expiresAt?: number };
      if (!parsed?.examId) return;
      if (parsed.userId && userId && parsed.userId !== userId) return;
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(CBT_ACTIVE_LOCK_KEY);
        return;
      }
      router.replace(`/cbt/${parsed.examId}`);
    } catch {
      // Ignore storage errors
    }
  }, [router, userId]);

  return null;
}

