"use client";

import { useRouter } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface TenantItem {
  id: string;
  namaPesantren: string;
}

export default function TenantSwitcher({
  isSuperAdmin,
  activePesantrenId,
  pesantrenList,
}: {
  isSuperAdmin: boolean;
  activePesantrenId: string | null;
  pesantrenList: TenantItem[];
}) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const activeName =
    pesantrenList.find((p) => p.id === activePesantrenId)?.namaPesantren ||
    pesantrenList[0]?.namaPesantren ||
    "Pesantren";

  const handleChange = async (value: string) => {
    setSwitching(true);
    try {
      await fetch("/api/admin/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesantrenId: value }),
      });
      router.refresh();
    } finally {
      setSwitching(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#ECFDF5",
          color: "#065F46",
          border: "1px solid #A7F3D0",
          padding: "7px 14px",
          borderRadius: "20px",
          fontSize: "0.84rem",
          fontWeight: 700,
        }}
        title="Akun Admin terkunci pada pesantren ini"
      >
        <Building2 size={16} color="#059669" />
        <span>{activeName}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "white",
        border: "1px solid #BFDBFE",
        padding: "5px 12px",
        borderRadius: "20px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <ShieldCheck size={16} color="#0284C7" />
      <select
        value={activePesantrenId || "ALL"}
        onChange={(e) => handleChange(e.target.value)}
        disabled={switching}
        aria-label="Pilih Pesantren Aktif"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "0.84rem",
          fontWeight: 700,
          color: "#0F172A",
          cursor: "pointer",
          maxWidth: "250px",
        }}
      >
        <option value="ALL">Semua Pesantren (Super Admin)</option>
        {pesantrenList.map((p) => (
          <option key={p.id} value={p.id}>
            {p.namaPesantren}
          </option>
        ))}
      </select>
    </div>
  );
}

