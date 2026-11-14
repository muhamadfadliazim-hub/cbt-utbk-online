"use client";
import { ReactNode } from "react";
import styles from "./cbt.module.css";
import { useSession } from "next-auth/react";

export default function CBTLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className={styles.cbtContainer}>
      <header className={styles.cbtHeader} style={{ background: "var(--utbk-header)" }}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitle} style={{ color: "white" }}>AZ ACADEMY CBT • UTBK-SNBT</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.participantInfo}>
            <div style={{ textTransform: "uppercase" }}><strong>{session?.user?.name || "NAMA PESERTA"}</strong></div>
            <div>{(session?.user as any)?.id?.substring(0, 10).toUpperCase() || "0123456789"} (Nomor Peserta)</div>
          </div>
          <div className={styles.timerContainer} style={{ fontSize: "13px", fontFamily: "Inter, sans-serif", letterSpacing: "0.04em" }}>
            MODE UJIAN TERKUNCI
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
