"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, FileSpreadsheet, Search, ShieldCheck } from "lucide-react";

type Row = { id: string; ptn: string; major: string; level: string; category: string; snbp: null | { tightnessPct: number | null; class: string }; snbt: null | { target: number | null; safeTarget: number | null; selectivityClass: string } };
type Dataset = { meta: { totalPrograms: number; matchedPrograms: number; snbpSource: string; snbtSource: string; snbpStatus: string; snbtStatus: string }; majors: Row[] };

export default function PassingGradeDatasetPage() {
  const [data, setData] = useState<Dataset | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => { fetch("/data/majors-2027.json").then((response) => response.json()).then(setData); }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const tokens = query.trim().toUpperCase().split(/\s+/).filter(Boolean);
    return data.majors.filter((row) => {
      const haystack = `${row.ptn} ${row.major}`.toUpperCase();
      return tokens.every((token) => haystack.includes(token));
    }).slice(0, 20);
  }, [data, query]);

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}><div><h1 style={{ fontSize: "2rem", color: "white", display: "flex", alignItems: "center", gap: 8 }}><Database size={31} color="var(--accent)" /> Dataset Passing Grade</h1><p style={{ color: "rgba(255,255,255,.8)" }}>Hasil integrasi dua workbook yang diberikan ke mesin pemilihan jurusan.</p></div><span className="status-pill" style={{ background: "rgba(255,255,255,.18)", color: "white" }}><CheckCircle2 size={14} /> Aktif</span></div>

      <div className="stat-grid">
        {[[data?.meta.totalPrograms?.toLocaleString("id-ID") ?? "—", "Total prodi"], ["146", "PTN SNBP"], [data?.meta.matchedPrograms?.toLocaleString("id-ID") ?? "—", "Data terhubung"], ["2027", "Tahun dataset"]].map(([value, label]) => <div className="card" key={label} style={{ padding: "1.35rem" }}><strong style={{ display: "block", color: "var(--primary)", fontSize: "1.8rem" }}>{value}</strong><span style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>{label}</span></div>)}
      </div>

      <section className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {[{ icon: FileSpreadsheet, title: "Sumber SNBP", file: data?.meta.snbpSource, status: data?.meta.snbpStatus }, { icon: FileSpreadsheet, title: "Sumber SNBT", file: data?.meta.snbtSource, status: data?.meta.snbtStatus }].map((source) => <div key={source.title} style={{ border: "1px solid var(--border)", borderRadius: ".9rem", padding: "1rem", display: "flex", gap: 12 }}><source.icon size={26} color="var(--primary)" /><div><strong style={{ display: "block" }}>{source.title}</strong><span style={{ color: "var(--text-muted)", fontSize: ".76rem", display: "block", overflowWrap: "anywhere" }}>{source.file ?? "Memuat…"}</span><span style={{ color: "var(--primary)", fontSize: ".76rem" }}>{source.status}</span></div></div>)}
      </section>

      <section className="card" style={{ padding: 0 }}>
        <div style={{ padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--border)" }}><div><h2 className="card-title" style={{ margin: 0 }}>Audit Cepat Program Studi</h2><span style={{ color: "var(--text-muted)", fontSize: ".78rem" }}>Cari PTN/prodi untuk memeriksa hasil penggabungan.</span></div><span style={{ position: "relative", width: 330 }}><Search size={17} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} /><input className="field" value={query} onChange={(event) => setQuery(event.target.value.toUpperCase())} placeholder="Cari PTN atau program studi" style={{ paddingLeft: 38 }} /></span></div>
        <div style={{ overflowX: "auto" }}><table className="data-table"><thead><tr><th>PTN</th><th>Program Studi</th><th>Rumpun</th><th>Keketatan SNBP</th><th>Target / Aman SNBT</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{row.ptn}</strong></td><td>{row.major}<span style={{ display: "block", color: "var(--text-muted)", fontSize: ".74rem" }}>{row.level}</span></td><td>{row.category}</td><td>{row.snbp?.tightnessPct != null ? `${row.snbp.tightnessPct}%` : "—"}<span style={{ display: "block", color: "var(--text-muted)", fontSize: ".74rem" }}>{row.snbp?.class}</span></td><td><strong style={{ color: "var(--primary)" }}>{row.snbt?.target ?? "—"}</strong> / {row.snbt?.safeTarget ?? "—"}<span style={{ display: "block", color: "var(--text-muted)", fontSize: ".74rem" }}>{row.snbt?.selectivityClass}</span></td></tr>)}</tbody></table></div>
      </section>

      <div className="card" style={{ background: "#FFFBEB", borderColor: "#FDE68A", display: "flex", gap: 10 }}><ShieldCheck size={22} color="#B45309" /><p style={{ color: "#92400E", fontSize: ".84rem" }}><strong>Catatan model:</strong> target SNBT adalah prediksi internal, bukan passing grade resmi SNPMB. Label ini juga ditampilkan pada halaman siswa untuk mencegah interpretasi sebagai jaminan kelulusan.</p></div>
    </div>
  );
}
