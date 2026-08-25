"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { upgradeToPremium } from "@/actions/premium";

export default function PremiumUpgradePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError("");
    const res = await upgradeToPremium();
    setIsLoading(false);
    if (res.success) {
      setSuccess(true);
      // Give time to read success message before reloading
      setTimeout(() => {
        router.push("/student/exams");
        router.refresh(); // Refresh session data
      }, 2000);
    } else {
      setError(res.error || "Gagal memproses simulasi pembayaran.");
    }
  };

  return (
    <div style={{ padding: "40px 20px", display: "grid", placeItems: "center" }}>
      <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", background: "var(--accent)", filter: "blur(100px)", opacity: 0.15, borderRadius: "50%", zIndex: 0 }}></div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "white", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
            <Crown size={40} />
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "10px", color: "var(--text)" }}>Akses Premium AZ Academy</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Buka semua kunci tryout eksklusif, analisis mendalam, dan rasionalisasi tanpa batas.</p>
          
          <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "12px", textAlign: "left", marginBottom: "30px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "15px" }}>Benefit Premium:</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                <CheckCircle2 size={18} color="var(--success)" /> Akses semua Tryout Eksklusif SNBT & TKA
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                <CheckCircle2 size={18} color="var(--success)" /> Pembahasan soal dalam bentuk Video
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                <CheckCircle2 size={18} color="var(--success)" /> Simulasi Rasionalisasi SNBP tanpa batas
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                <CheckCircle2 size={18} color="var(--success)" /> Prioritas sesi Live Class bersama Tutor
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <span style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text)" }}>Rp 99.000</span>
            <span style={{ color: "var(--text-muted)" }}> / selamanya</span>
          </div>

          {error && <div style={{ padding: "10px", background: "var(--danger-light)", color: "var(--danger)", borderRadius: "8px", marginBottom: "20px" }}>{error}</div>}

          {success ? (
            <div style={{ padding: "15px", background: "var(--success-light)", color: "var(--success)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={32} />
              <strong style={{ fontSize: "1.1rem" }}>Pembayaran Berhasil!</strong>
              <span style={{ fontSize: "0.85rem" }}>Mengalihkan kembali ke daftar ujian...</span>
            </div>
          ) : (
            <button 
              className="btn" 
              onClick={handleUpgrade} 
              disabled={isLoading}
              style={{ width: "100%", padding: "15px", fontSize: "1.1rem", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "white", border: "none" }}
            >
              {isLoading ? "Memproses..." : <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>Beli Sekarang (Simulasi) <ArrowRight size={20} /></span>}
            </button>
          )}

          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "15px" }}>
            *Ini adalah halaman simulasi. Tidak ada uang yang ditagihkan.
          </p>
        </div>
      </div>
    </div>
  );
}
