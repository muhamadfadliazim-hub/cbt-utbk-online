"use client";

import { useState } from "react";
import { Megaphone, Send, CheckCircle } from "lucide-react";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    setStatus("");

    try {
      const res = await fetch("/api/live/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, channel: "global", event: "broadcast" })
      });

      if (res.ok) {
        setStatus("Pengumuman berhasil disiarkan secara langsung!");
        setMessage("");
      } else {
        setStatus("Gagal menyiarkan pesan.");
      }
    } catch (e) {
      setStatus("Terjadi kesalahan jaringan.");
    }
    setIsSending(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "1.8rem", color: "white", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Megaphone color="white" /> Live Broadcast (Pusher)
      </h1>
      <p style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: "30px" }}>
        Kirimkan pesan pengumuman secara langsung ke layar semua siswa yang sedang login. Pesan akan muncul secara real-time tanpa perlu refresh halaman.
      </p>

      <div style={{ background: "white", padding: "30px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {status && (
          <div style={{ padding: "12px 20px", background: "var(--success-light)", color: "var(--success)", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={18} /> {status}
          </div>
        )}

        <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>Pesan Pengumuman:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pengumuman penting di sini..."
          style={{ width: "100%", height: "150px", padding: "15px", borderRadius: "8px", border: "1px solid var(--border)", resize: "vertical", fontSize: "1rem", marginBottom: "20px", outline: "none" }}
        />

        <button 
          onClick={handleBroadcast}
          disabled={!message.trim() || isSending}
          style={{ padding: "12px 25px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", cursor: !message.trim() || isSending ? "not-allowed" : "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px", fontSize: "1rem" }}>
          <Send size={18} />
          {isSending ? "Menyiarkan..." : "Siarkan Sekarang"}
        </button>
      </div>
    </div>
  );
}
