'use client';

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{ 
        background: "#FEE2E2", 
        border: "none", 
        borderRadius: "20px", 
        cursor: "pointer", 
        display: "flex", 
        alignItems: "center", 
        gap: "6px", 
        color: "#DC2626", 
        padding: "6px 14px", 
        fontWeight: "600",
        fontSize: "0.9rem",
        transition: "background 0.2s"
      }} 
      onMouseOver={(e) => e.currentTarget.style.background = "#FECACA"}
      onMouseOut={(e) => e.currentTarget.style.background = "#FEE2E2"}
      title="Keluar"
    >
      <LogOut size={16} />
      Keluar
    </button>
  );
}
