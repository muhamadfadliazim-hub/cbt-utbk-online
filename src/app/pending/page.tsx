"use client";
import LogoutButton from "@/components/LogoutButton";
import { Clock, ShieldAlert } from "lucide-react";

export default function PendingPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
      padding: "20px"
    }}>
      <div style={{ 
        background: "white", 
        padding: "3rem", 
        borderRadius: "1.5rem", 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        maxWidth: "500px",
        textAlign: "center",
        borderTop: "8px solid #F59E0B"
      }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          background: "#FEF3C7", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 1.5rem" 
        }}>
          <Clock size={40} color="#D97706" strokeWidth={2} />
        </div>
        
        <h1 style={{ fontSize: "1.8rem", color: "#111827", marginBottom: "1rem", fontWeight: "800" }}>
          Menunggu Persetujuan Admin
        </h1>
        
        <p style={{ color: "#4B5563", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "2rem" }}>
          Akun Anda telah berhasil terdaftar melalui Google, namun <strong>memerlukan persetujuan dari Administrator</strong> sebelum Anda dapat mengakses ujian dan materi belajar.
        </p>

        <div style={{ 
          background: "#EFF6FF", 
          borderLeft: "4px solid #3B82F6", 
          padding: "1rem", 
          textAlign: "left",
          borderRadius: "0 0.5rem 0.5rem 0",
          marginBottom: "2rem",
          display: "flex",
          gap: "10px"
        }}>
          <ShieldAlert size={24} color="#2563EB" style={{ flexShrink: 0 }} />
          <span style={{ color: "#1E3A8A", fontSize: "0.95rem" }}>
            Silakan hubungi admin sekolah atau bimbingan belajar Anda untuk mengaktifkan akun ini.
          </span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#FEE2E2", padding: "0.5rem 1.5rem", borderRadius: "1rem" }}>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
