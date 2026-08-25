"use client";
import { ReactNode, useState, useEffect } from "react";
import styles from "./cbt.module.css";

import { useSession } from "next-auth/react";

export default function CBTLayout({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(5385); // 1h 29m 45s in seconds
  const { data: session } = useSession();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.cbtContainer}>
      <header className={styles.cbtHeader} style={{ background: "var(--utbk-header)" }}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitle} style={{ color: "white" }}>AZ ACADEMY CBT</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.participantInfo}>
            <div style={{ textTransform: "uppercase" }}><strong>{session?.user?.name || "NAMA PESERTA"}</strong></div>
            <div>{(session?.user as any)?.id?.substring(0, 10).toUpperCase() || "0123456789"} (Nomor Peserta)</div>
          </div>
          <div className={styles.timerContainer}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
