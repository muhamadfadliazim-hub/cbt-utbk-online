"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, CheckCircle2, GraduationCap, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";

type MajorRecord = {
  id: string;
  ptn: string;
  major: string;
  level: string;
  category: string;
  province: string;
  city: string;
  snbp: null | {
    rank: number | null;
    capacity: number | null;
    applicants: number | null;
    tightnessPct: number | null;
    applicantsPerSeat: number | null;
    class: string;
  };
  snbt: null | {
    target: number | null;
    safeTarget: number | null;
    selectivityIndex: number | null;
    selectivityClass: string;
    confidence: string;
    campusTier: string;
  };
};

type MajorDataset = {
  meta: {
    totalPrograms: number;
    matchedPrograms: number;
    snbpStatus: string;
    snbtStatus: string;
  };
  majors: MajorRecord[];
};

function evaluateScore(score: number, major: MajorRecord) {
  const target = major.snbt?.target;
  const safe = major.snbt?.safeTarget;
  if (target == null || safe == null) return { label: "Data terbatas", color: "#64748B", gap: null };
  const gap = score - safe;
  if (score >= safe) return { label: "Aman", color: "var(--success)", gap };
  if (score >= target) return { label: "Kompetitif", color: "#0EA5E9", gap };
  if (score >= target - 25) return { label: "Menantang", color: "var(--warning)", gap };
  return { label: "Ambisius", color: "var(--danger)", gap };
}

export default function PassingGradePage() {
  const [dataset, setDataset] = useState<MajorDataset | null>(null);
  const [queryPtn, setQueryPtn] = useState("SEMUA");
  const [queryProdi, setQueryProdi] = useState("SEMUA");
  const [category, setCategory] = useState("SEMUA");
  const [score, setScore] = useState(650);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/data/majors-2027.json")
      .then((response) => {
        if (!response.ok) throw new Error("Dataset tidak dapat dimuat");
        return response.json();
      })
      .then((data: MajorDataset) => setDataset(data))
      .catch(() => setError("Data prodi belum dapat dimuat. Coba muat ulang halaman."));
  }, []);

  const categories = useMemo(() => {
    if (!dataset) return [];
    return Array.from(new Set(dataset.majors.map((major) => major.category).filter(Boolean))).sort();
  }, [dataset]);

  const universities = useMemo(() => {
    if (!dataset) return [];
    return Array.from(new Set(dataset.majors.map((major) => major.ptn))).sort((a, b) => a.localeCompare(b, "id"));
  }, [dataset]);

  const majorsInPtn = useMemo(() => {
    if (!dataset || queryPtn === "SEMUA") return [];
    return dataset.majors.filter((major) => major.ptn === queryPtn).sort((a, b) => a.major.localeCompare(b.major, "id"));
  }, [dataset, queryPtn]);

  const results = useMemo(() => {
    if (!dataset) return [];
    
    return dataset.majors
      .filter((major) => category === "SEMUA" || major.category === category)
      .filter((major) => queryPtn === "SEMUA" || major.ptn === queryPtn)
      .filter((major) => queryProdi === "SEMUA" || major.id === queryProdi)
      .sort((a, b) => {
        // If a specific PTN is selected, sort alphabetically by major name
        if (queryPtn !== "SEMUA") return a.major.localeCompare(b.major, "id");
        // Otherwise, sort by safe target score
        return (b.snbt?.safeTarget ?? 0) - (a.snbt?.safeTarget ?? 0);
      })
      .slice(0, queryPtn !== "SEMUA" ? 200 : 24); // Show more results if a PTN is selected
  }, [dataset, queryPtn, queryProdi, category]);

  const selected = useMemo(() => {
    if (!dataset) return [];
    return selectedIds.map((id) => dataset.majors.find((major) => major.id === id)).filter(Boolean) as MajorRecord[];
  }, [dataset, selectedIds]);

  const addChoice = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current;
      if (current.length >= 3) return [...current.slice(1), id];
      return [...current, id];
    });
  };

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "2.15rem", color: "white", display: "flex", gap: "10px", alignItems: "center" }}>
            <GraduationCap size={36} color="var(--accent)" /> Passing Grade Jurusan
          </h1>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1.02rem" }}>Bandingkan target skor SNBT dan keketatan SNBP hingga 3 program studi.</p>
        </div>
        <div className="status-pill" style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.28)" }}>
          <ShieldCheck size={15} /> Dataset 2027 terintegrasi
        </div>
      </div>

      <div className="stat-grid">
        {[
          [dataset?.meta.totalPrograms?.toLocaleString("id-ID") ?? "—", "Prodi dalam pencarian"],
          ["146", "PTN SNBP"],
          [dataset?.meta.matchedPrograms?.toLocaleString("id-ID") ?? "—", "Prodi terhubung SNBP–SNBT"],
          [String(score), "Skor SNBT simulasi Anda"],
        ].map(([value, label]) => (
          <div className="card" key={label} style={{ padding: "1.35rem" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", fontFamily: "Outfit, sans-serif" }}>{value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="workspace-grid">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "1.4rem", display: "grid", gridTemplateColumns: "1fr 1fr 140px 140px", gap: "0.8rem", borderBottom: "1px solid var(--border)" }}>
            <label>
              <span className="field-label">Perguruan Tinggi</span>
              <select className="field" value={queryPtn} onChange={(e) => { setQueryPtn(e.target.value); setQueryProdi("SEMUA"); }}>
                <option value="SEMUA">Semua PTN</option>
                {universities.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Program Studi</span>
              <select className="field" value={queryProdi} onChange={(e) => setQueryProdi(e.target.value)} disabled={queryPtn === "SEMUA"}>
                <option value="SEMUA">{queryPtn === "SEMUA" ? "Pilih PTN terlebih dahulu" : "Semua Program Studi"}</option>
                {majorsInPtn.map((m) => <option key={m.id} value={m.id}>{m.major} ({m.level})</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Rumpun</span>
              <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="SEMUA">Semua</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Skor SNBT Anda</span>
              <input className="field" type="number" min={200} max={1000} value={score} onChange={(event) => setScore(Number(event.target.value) || 0)} />
            </label>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>PTN & Program Studi</th>
                  <th>SNBP 2027</th>
                  <th>Target SNBT*</th>
                  <th>Status skor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!dataset && !error && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>Memuat 5.000+ program studi…</td></tr>
                )}
                {error && (
                  <tr><td colSpan={5} style={{ color: "var(--danger)", textAlign: "center", padding: "2rem" }}>{error}</td></tr>
                )}
                {dataset && results.map((major) => {
                  const evaluation = evaluateScore(score, major);
                  const picked = selectedIds.includes(major.id);
                  return (
                    <tr key={major.id}>
                      <td>
                        <strong style={{ display: "block", color: "var(--text)" }}>{major.major}</strong>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{major.ptn} • {major.level}</span>
                      </td>
                      <td>
                        <strong>{major.snbp?.tightnessPct != null ? `${major.snbp.tightnessPct}%` : "—"}</strong>
                        <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.76rem" }}>{major.snbp?.class || "Tanpa data"}</span>
                      </td>
                      <td>
                        <strong style={{ color: "var(--primary)" }}>{major.snbt?.target ?? "—"}</strong>
                        <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.76rem" }}>aman {major.snbt?.safeTarget ?? "—"}</span>
                      </td>
                      <td>
                        <span className="status-pill" style={{ background: `${evaluation.color}18`, color: evaluation.color }}>{evaluation.label}</span>
                      </td>
                      <td>
                        <button className="btn" disabled={picked} onClick={() => addChoice(major.id)} style={{ padding: "0.55rem 0.75rem", background: picked ? "#ECFDF5" : "var(--surface-hover)", color: picked ? "var(--success)" : "var(--primary)" }}>
                          {picked ? <CheckCircle2 size={17} /> : <Plus size={17} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "0.9rem 1.4rem", color: "var(--text-muted)", fontSize: "0.78rem", background: "#F8FAFC" }}>
            {queryPtn !== "SEMUA" ? "Menampilkan seluruh program studi untuk PTN yang dipilih." : "Menampilkan maksimal 24 hasil. Pilih PTN untuk melihat jurusan spesifik."}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><BarChart3 size={20} /> Perbandingan Pilihan</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", marginBottom: "1.1rem" }}>Tambahkan maksimal 3 jurusan. Pilihan keempat menggantikan pilihan pertama.</p>
            {selected.length === 0 ? (
              <div style={{ border: "1px dashed #94A3B8", borderRadius: "0.9rem", padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>Klik tombol + pada tabel untuk mulai membandingkan.</div>
            ) : selected.map((major, index) => {
              const evaluation = evaluateScore(score, major);
              return (
                <div key={major.id} style={{ border: "1px solid var(--border)", borderRadius: "0.9rem", padding: "1rem", marginBottom: "0.8rem", background: "#F8FAFC" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 800 }}>PILIHAN {index + 1}</span>
                      <h3 style={{ color: "var(--text)", fontSize: "1rem", lineHeight: 1.35 }}>{major.major}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.76rem" }}>{major.ptn}</p>
                    </div>
                    <button onClick={() => setSelectedIds((current) => current.filter((id) => id !== major.id))} aria-label={`Hapus ${major.major}`} style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={18} /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "0.9rem" }}>
                    <div><span className="field-label">Target / Aman</span><strong>{major.snbt?.target ?? "—"} / {major.snbt?.safeTarget ?? "—"}</strong></div>
                    <div><span className="field-label">Posisi Anda</span><strong style={{ color: evaluation.color }}>{evaluation.gap == null ? "—" : `${evaluation.gap >= 0 ? "+" : ""}${evaluation.gap} poin`}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <h3 style={{ color: "#92400E", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}><AlertCircle size={18} /> Transparansi Data</h3>
            <p style={{ fontSize: "0.8rem", color: "#92400E", marginTop: "0.6rem", lineHeight: 1.55 }}>
              Keketatan SNBP memakai daya tampung 2026 ÷ peminat 2025. Target SNBT adalah prediksi model selektivitas v3.0, bukan passing grade resmi atau jaminan kelulusan.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
