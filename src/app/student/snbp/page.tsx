"use client";
import { useEffect, useMemo, useState } from "react";
import { AchievementLevel, calculateAdvancedSNBP, getAchievementScore } from "@/lib/snbpEngine";
import { getSupportingSubjects } from "@/lib/supportingSubjects";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Download, CheckCircle, AlertTriangle, TrendingUp, Award, ShieldCheck, Info, Save } from 'lucide-react';
import Select from "react-select";
import { saveSnbpTarget, getSnbpTarget, getLatestTkaScore } from "@/actions/student";

type MajorOption = {
  id: string;
  ptn: string;
  major: string;
  level: string;
  category: string;
  province: string;
  portfolio: string;
  snbp: null | {
    tightnessPct: number | null;
    competitionRatio: string;
    class: string;
    capacity: number;
    applicants: number;
  };
};

type MajorDataset = { majors: MajorOption[] };

type TargetChoice = {
  id: string;
  univ: string;
  major: string;
  level: string;
  competitiveness: number;
  competitionRatio: string;
  tightnessClass: string;
  province: string;
  portfolio: string;
  category: string;
};

const emptyChoice: TargetChoice = {
  id: "", univ: "", major: "", level: "", competitiveness: 0, competitionRatio: "", tightnessClass: "", province: "", portfolio: "Tidak Ada", category: "SAINTEK"
};

export default function SNBPSimulation() {
  const [majors, setMajors] = useState<MajorOption[]>([]);
  const [pilihan1, setPilihan1] = useState<TargetChoice>(emptyChoice);
  const [pilihan2, setPilihan2] = useState<TargetChoice>(emptyChoice);
  const [isEligible, setIsEligible] = useState(true);
  const [tkaScore1, setTkaScore1] = useState(0);
  const [tkaScore2, setTkaScore2] = useState(0);
  const [tkaSubjectsAligned, setTkaSubjectsAligned] = useState(true);
  const [achievementCount, setAchievementCount] = useState(0);
  const [achievementLevel, setAchievementLevel] = useState<AchievementLevel>("NONE");
  const [portfolioScore, setPortfolioScore] = useState(0);
  const [supportingGrades1, setSupportingGrades1] = useState(Array.from({ length: 5 }, () => ({ subject1: 0, subject2: 0 })));
  const [supportingGrades2, setSupportingGrades2] = useState(Array.from({ length: 5 }, () => ({ subject1: 0, subject2: 0 })));
  
  const [semesters, setSemesters] = useState(Array(5).fill(0).map(() => ({ average: 0, supportingSubject1: 0, supportingSubject2: 0 })));

  const [result1, setResult1] = useState<ReturnType<typeof calculateAdvancedSNBP> | null>(null);
  const [result2, setResult2] = useState<ReturnType<typeof calculateAdvancedSNBP> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetch("/data/majors-2027.json")
      .then((response) => response.json() as Promise<MajorDataset>)
      .then((dataset) => {
        const filtered = dataset.majors.filter((item) => (item.snbp?.tightnessPct ?? 0) > 0);
        setMajors(filtered);
      })
      .catch(() => setMajors([]));
      
    getLatestTkaScore().then(res => {
      if (res.success && res.score !== undefined && res.score > 0) {
        setTkaScore1(res.score);
      }
    });
  }, []);

  // Restore saved target when majors load
  useEffect(() => {
    if (majors.length > 0 && pilihan1.id === "") {
      getSnbpTarget().then(res => {
        if (res.success && res.data && res.data.snbpTargetUniv && res.data.snbpTargetMajor) {
          const match = majors.find(m => m.ptn === res.data?.snbpTargetUniv && m.major === res.data?.snbpTargetMajor);
          if (match && match.snbp) {
            setPilihan1({
              id: match.id,
              univ: match.ptn,
              major: match.major,
              level: match.level,
              competitiveness: match.snbp.tightnessPct || 0,
              competitionRatio: match.snbp.competitionRatio,
              tightnessClass: match.snbp.class,
              province: match.province,
              portfolio: match.portfolio,
              category: match.category,
            });
          }
        }
      });
    }
  }, [majors, pilihan1.id]);

  const universities = useMemo(() => Array.from(new Set(majors.map((item) => item.ptn))).sort((a, b) => a.localeCompare(b, "id")), [majors]);
  const univOptions = useMemo(() => universities.map(u => ({ value: u, label: u })), [universities]);

  const majorsByUniversity = (university: string) =>
    majors.filter((item) => item.ptn === university).sort((a, b) => a.major.localeCompare(b.major, "id") || a.level.localeCompare(b.level, "id"));

  const getMajorOptions = (university: string) => 
    majorsByUniversity(university).map(m => ({ value: m.id, label: `${m.major} — ${m.level}` }));

  const selectUniversity = (university: string, setChoice: React.Dispatch<React.SetStateAction<TargetChoice>>) => {
    const firstMajor = majorsByUniversity(university)[0];
    if (!firstMajor || !firstMajor.snbp) return;
    setChoice({
      id: firstMajor.id,
      univ: firstMajor.ptn,
      major: firstMajor.major,
      level: firstMajor.level,
      competitiveness: firstMajor.snbp.tightnessPct || 0,
      competitionRatio: firstMajor.snbp.competitionRatio,
      tightnessClass: firstMajor.snbp.class,
      province: firstMajor.province,
      portfolio: firstMajor.portfolio,
      category: firstMajor.category,
    });
  };

  const selectMajor = (id: string, setChoice: React.Dispatch<React.SetStateAction<TargetChoice>>) => {
    const selected = majors.find((item) => item.id === id);
    if (!selected || !selected.snbp) return;
    setChoice({
      id: selected.id,
      univ: selected.ptn,
      major: selected.major,
      level: selected.level,
      competitiveness: selected.snbp.tightnessPct || 0,
      competitionRatio: selected.snbp.competitionRatio,
      tightnessClass: selected.snbp.class,
      province: selected.province,
      portfolio: selected.portfolio,
      category: selected.category,
    });
  };

  const supportingProfile1 = useMemo(() => pilihan1.id ? getSupportingSubjects(pilihan1.major, pilihan1.category) : { subjects: ["Belum Ada"] }, [pilihan1.major, pilihan1.category, pilihan1.id]);
  const supportingProfile2 = useMemo(() => pilihan2.id ? getSupportingSubjects(pilihan2.major, pilihan2.category) : { subjects: ["Belum Ada"] }, [pilihan2.major, pilihan2.category, pilihan2.id]);

  const handleSimulate = () => {
    if (!pilihan1.id) return;
    setIsLoading(true);
    setTimeout(() => {
      const res1 = calculateAdvancedSNBP({
        targetUniversity: pilihan1.univ,
        targetMajor: pilihan1.major,
        competitiveness: pilihan1.competitiveness,
        choiceOrder: 1,
        isEligible,
        tkaScore: tkaScore1,
        tkaSubjectsAligned,
        achievementCount,
        achievementLevel,
        portfolioRequired: pilihan1.portfolio !== "Tidak Ada",
        portfolioScore,
        supportingSubjectCount: supportingProfile1.subjects.length > 1 ? 2 : 1,
        semesters: semesters.map((semester, index) => ({ ...semester, supportingSubject1: supportingGrades1[index].subject1, supportingSubject2: supportingGrades1[index].subject2 })),
      });
      setResult1(res1);

      if (pilihan2.id) {
        const res2 = calculateAdvancedSNBP({
          targetUniversity: pilihan2.univ,
          targetMajor: pilihan2.major,
          competitiveness: pilihan2.competitiveness,
          choiceOrder: 2,
          isEligible,
          tkaScore: tkaScore1,
          tkaSubjectsAligned,
          achievementCount,
          achievementLevel,
          portfolioRequired: pilihan2.portfolio !== "Tidak Ada",
          portfolioScore,
          supportingSubjectCount: supportingProfile2.subjects.length > 1 ? 2 : 1,
          semesters: semesters.map((semester, index) => ({ ...semester, supportingSubject1: supportingGrades2[index].subject1, supportingSubject2: supportingGrades2[index].subject2 })),
        });
        setResult2(res2);
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSaveTarget = async () => {
    if (!pilihan1.univ || !pilihan1.major) return;
    setIsSaving(true);
    const res = await saveSnbpTarget(pilihan1.univ, pilihan1.major);
    setIsSaving(false);
    if (res.success) {
      setSaveMessage("Target berhasil disimpan! Akan muncul di Dashboard Anda.");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Gagal menyimpan target.");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "TINGGI") return "var(--success)";
    if (status === "SEDANG") return "var(--warning)";
    return "var(--danger)";
  };

  const updateSemester = (index: number, field: keyof (typeof semesters)[number], value: string) => {
    setSemesters((current) => current.map((semester, semesterIndex) => semesterIndex === index ? { ...semester, [field]: Number(value) || 0 } : semester));
  };

  const updateSupportingGrade = (choice: 1 | 2, index: number, field: "subject1" | "subject2", value: string) => {
    const setter = choice === 1 ? setSupportingGrades1 : setSupportingGrades2;
    setter((current) => current.map((semester, semesterIndex) => semesterIndex === index ? { ...semester, [field]: Number(value) || 0 } : semester));
  };

  const needsPortfolio = (pilihan1.id && pilihan1.portfolio !== "Tidak Ada") || (pilihan2.id && pilihan2.portfolio !== "Tidak Ada");

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
            <Target size={36} color="var(--accent)" /> Rasionalisasi SNBP 2027
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>Estimasi berbasis rapor, mapel pendukung spesifik prodi, prestasi, portofolio, dan keketatan SNBP 2027.</p>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left Column: Form */}
        <div className="card" style={{ padding: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>1. Target Akademik</h2>
            {pilihan1.id && (
              <button 
                className="btn btn-outline" 
                style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", fontSize: "0.85rem", background: "white", color: "var(--primary)" }}
                onClick={handleSaveTarget}
                disabled={isSaving}
              >
                <Save size={16} /> {isSaving ? "Menyimpan..." : "Simpan Pilihan 1 ke Dashboard"}
              </button>
            )}
          </div>
          {saveMessage && <div style={{ padding: "10px", background: "var(--surface-hover)", color: "var(--primary)", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>{saveMessage}</div>}
          
          <div style={{ background: "var(--surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--primary)", marginBottom: "1rem" }}>🎓 Pilihan 1 (Prioritas Utama)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span className="field-label">Perguruan Tinggi</span>
                <Select
                  options={univOptions}
                  value={pilihan1.univ ? { value: pilihan1.univ, label: pilihan1.univ } : null}
                  onChange={(val) => val && selectUniversity(val.value, setPilihan1)}
                  placeholder="Ketik PTN..."
                  isDisabled={!majors.length}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span className="field-label">Program Studi</span>
                <Select
                  options={pilihan1.univ ? getMajorOptions(pilihan1.univ) : []}
                  value={pilihan1.id ? { value: pilihan1.id, label: `${pilihan1.major} — ${pilihan1.level}` } : null}
                  onChange={(val) => val && selectMajor(val.value, setPilihan1)}
                  placeholder="Ketik Jurusan..."
                  isDisabled={!pilihan1.univ}
                />
              </div>
            </div>
            {pilihan1.id && (
              <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap", alignItems: "center", fontSize: ".82rem" }}>
                <span className="status-pill">Keketatan {Number(pilihan1.competitiveness).toFixed(2)}%</span>
                <span className="status-pill">{pilihan1.competitionRatio}</span>
                <span style={{ color: "var(--text-muted)" }}>{pilihan1.tightnessClass} • otomatis dari data SNBP</span>
              </div>
            )}
          </div>

          <div style={{ background: "var(--surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "2rem", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--primary)", marginBottom: "1rem" }}>🎓 Pilihan 2 (Alternatif)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span className="field-label">Perguruan Tinggi</span>
                <Select
                  options={univOptions}
                  value={pilihan2.univ ? { value: pilihan2.univ, label: pilihan2.univ } : null}
                  onChange={(val) => val && selectUniversity(val.value, setPilihan2)}
                  placeholder="Ketik PTN..."
                  isDisabled={!majors.length}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span className="field-label">Program Studi</span>
                <Select
                  options={pilihan2.univ ? getMajorOptions(pilihan2.univ) : []}
                  value={pilihan2.id ? { value: pilihan2.id, label: `${pilihan2.major} — ${pilihan2.level}` } : null}
                  onChange={(val) => val && selectMajor(val.value, setPilihan2)}
                  placeholder="Ketik Jurusan..."
                  isDisabled={!pilihan2.univ}
                />
              </div>
            </div>
            {pilihan2.id && (
              <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap", alignItems: "center", fontSize: ".82rem" }}>
                <span className="status-pill">Keketatan {Number(pilihan2.competitiveness).toFixed(2)}%</span>
                <span className="status-pill">{pilihan2.competitionRatio}</span>
                <span style={{ color: "var(--text-muted)" }}>{pilihan2.tightnessClass} • otomatis dari data SNBP</span>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            2. Rekam Jejak Nilai Rapor
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "10px", fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-muted)" }}>
              <div>Semester</div>
              <div>Rata-rata seluruh mata pelajaran</div>
            </div>
            {semesters.map((sem, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "10px", alignItems: "center" }}>
                <div style={{ fontWeight: "500" }}>Sem {idx + 1}</div>
                <input type="number" min="0" max="100" className="field" value={sem.average || ""} onChange={(e) => updateSemester(idx, "average", e.target.value)} placeholder="0" />
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--primary)", marginBottom: "1rem" }}>Mata Pelajaran Pendukung (Pilihan 1 & 2)</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Berdasarkan Kepmendikbudristek No 345/M/2022, nilai rapor mapel pendukung memiliki bobot besar.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {pilihan1.id && (
                <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-hover)" }}>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Pendukung Pilihan 1:</h4>
                  <ul style={{ fontSize: "0.8rem", color: "var(--primary)", paddingLeft: "1.2rem", marginBottom: "1rem" }}>
                    {supportingProfile1.subjects.map(s => <li key={s}>{s}</li>)}
                  </ul>
                  {semesters.map((_, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: supportingProfile1.subjects.length > 1 ? "30px 1fr 1fr" : "30px 1fr", gap: "10px", marginBottom: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>S{idx+1}</span>
                      <input type="number" min="0" max="100" className="field" style={{ padding: "8px", fontSize: "0.9rem" }} value={supportingGrades1[idx].subject1 || ""} onChange={(e) => updateSupportingGrade(1, idx, "subject1", e.target.value)} placeholder="Mapel 1" />
                      {supportingProfile1.subjects.length > 1 && (
                        <input type="number" min="0" max="100" className="field" style={{ padding: "8px", fontSize: "0.9rem" }} value={supportingGrades1[idx].subject2 || ""} onChange={(e) => updateSupportingGrade(1, idx, "subject2", e.target.value)} placeholder="Mapel 2" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pilihan2.id && (
                <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-hover)" }}>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Pendukung Pilihan 2:</h4>
                  <ul style={{ fontSize: "0.8rem", color: "var(--primary)", paddingLeft: "1.2rem", marginBottom: "1rem" }}>
                    {supportingProfile2.subjects.map(s => <li key={s}>{s}</li>)}
                  </ul>
                  {semesters.map((_, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: supportingProfile2.subjects.length > 1 ? "30px 1fr 1fr" : "30px 1fr", gap: "10px", marginBottom: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>S{idx+1}</span>
                      <input type="number" min="0" max="100" className="field" style={{ padding: "8px", fontSize: "0.9rem" }} value={supportingGrades2[idx].subject1 || ""} onChange={(e) => updateSupportingGrade(2, idx, "subject1", e.target.value)} placeholder="Mapel 1" />
                      {supportingProfile2.subjects.length > 1 && (
                        <input type="number" min="0" max="100" className="field" style={{ padding: "8px", fontSize: "0.9rem" }} value={supportingGrades2[idx].subject2 || ""} onChange={(e) => updateSupportingGrade(2, idx, "subject2", e.target.value)} placeholder="Mapel 2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", marginTop: "2.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            3. Variabel Penentu Lainnya
          </h2>
          
          {tkaScore1 > 0 && (
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", color: "var(--primary)", fontWeight: "bold", marginBottom: "5px" }}>
                <ShieldCheck size={18} /> Nilai Tryout TKA Terintegrasi
              </div>
              <p style={{ fontSize: "0.85rem", color: "#1E3A8A" }}>
                Skor <strong>{tkaScore1.toFixed(2)}</strong> ditarik otomatis dari riwayat Tryout TKA SMA terbaik Anda dan digunakan untuk divalidasi silang dengan nilai rapor.
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <label>
              <span className="field-label">Prestasi / Sertifikat</span>
              <select className="field" value={achievementLevel} onChange={(e) => setAchievementLevel(e.target.value as AchievementLevel)}>
                <option value="NONE">Tidak Ada</option>
                <option value="DISTRICT">Juara Tingkat Kab/Kota</option>
                <option value="PROVINCE">Juara Tingkat Provinsi</option>
                <option value="NATIONAL">Juara Tingkat Nasional</option>
                <option value="INTERNATIONAL">Juara Tingkat Internasional</option>
              </select>
            </label>
            {achievementLevel !== "NONE" && (
              <label>
                <span className="field-label">Jumlah Sertifikat (Maks 3)</span>
                <input type="number" min="1" max="3" className="field" value={achievementCount || ""} onChange={(e) => setAchievementCount(Number(e.target.value))} />
              </label>
            )}
          </div>

          {needsPortfolio && (
            <div style={{ marginBottom: "1.5rem", background: "#FEF2F2", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid #FECACA" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", color: "var(--danger)", fontWeight: "bold" }}>
                <AlertTriangle size={20} /> Portofolio Diwajibkan
              </div>
              <p style={{ fontSize: "0.9rem", color: "#991B1B", marginBottom: "15px" }}>Salah satu atau kedua jurusan pilihan Anda mewajibkan portofolio (Seni/Olahraga).</p>
              <label>
                <span className="field-label" style={{ color: "#991B1B" }}>Estimasi Nilai Portofolio (0-100)</span>
                <input type="number" className="field" value={portfolioScore || ""} onChange={(e) => setPortfolioScore(Number(e.target.value))} style={{ borderColor: "#FECACA" }} />
              </label>
            </div>
          )}

          <div style={{ marginBottom: "2rem" }}>
            <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "1rem", background: "var(--surface-hover)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <input type="checkbox" checked={isEligible} onChange={(e) => setIsEligible(e.target.checked)} style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }} />
              <div>
                <strong style={{ display: "block" }}>Siswa Eligible (Kuota Sekolah)</strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Pastikan Anda masuk kuota eligible sekolah (40% Akreditasi A, 25% B, 5% C).</span>
              </div>
            </label>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", boxShadow: "var(--shadow-md)" }}
            onClick={handleSimulate}
            disabled={isLoading || !pilihan1.id}
          >
            {isLoading ? "Menghitung Probabilitas..." : "Simulasikan Peluang Lolos"} <TrendingUp size={20} />
          </button>
        </div>

        {/* Right Column: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {!result1 ? (
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center", minHeight: "500px", background: "var(--surface-hover)", border: "2px dashed var(--border)" }}>
              <Target size={60} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Belum Ada Simulasi</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "80%" }}>Pilih target jurusan, isi nilai rapor, dan klik tombol simulasikan untuk melihat probabilitas Anda diterima di SNBP.</p>
            </div>
          ) : (
            <div style={{ animation: "fadeIn 0.5s ease-out", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Result Card 1 */}
              <div className="card" style={{ borderTop: `5px solid ${getStatusColor(result1.probability)}`, boxShadow: "var(--shadow-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "bold" }}>Pilihan 1</span>
                    <h3 style={{ fontSize: "1.4rem", color: "var(--text)", marginTop: "5px" }}>{pilihan1.major}</h3>
                    <p style={{ color: "var(--primary)" }}>{pilihan1.univ}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: "900", color: getStatusColor(result1.probability), lineHeight: 1, fontFamily: "Outfit, sans-serif" }}>
                      {result1.probability}
                    </div>
                    <span className="status-pill" style={{ background: getStatusColor(result1.probability), color: "white", marginTop: "10px", display: "inline-block" }}>
                      Peluang {result1.probability}
                    </span>
                  </div>
                </div>

                <div style={{ background: "var(--surface-hover)", padding: "1.2rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}><Award size={16} color="var(--primary)"/> Skor Rapor SNBP</span>
                    <strong style={{ fontSize: "1.1rem" }}>{result1.finalScore.toFixed(2)}</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${result1.finalScore}%`, height: "100%", background: "var(--primary)", borderRadius: "4px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "5px" }}>
                    <span>Aman di: {(result1.requiredScore + 2).toFixed(2)}</span>
                    <span>Batas Min: {result1.requiredScore.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "1.5rem", background: "#F8FAFC", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}><Info size={18} color="var(--accent)" /> Insight Akademik</h4>
                  {result1.diagnostic.split(". ").filter(Boolean).map((insight, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", fontSize: "0.9rem", color: "var(--text)" }}>
                      <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{insight}.</span>
                    </div>
                  ))}
                  {!isEligible && (
                    <div style={{ display: "flex", gap: "10px", fontSize: "0.9rem", color: "var(--danger)", marginTop: "5px" }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>Siswa tidak terdaftar sebagai kuota eligible dari sekolah. Peluang lolos otomatis sangat kecil atau ditolak oleh sistem SNPMB.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Result Card 2 */}
              {result2 && pilihan2.id && (
                <div className="card" style={{ borderTop: `5px solid ${getStatusColor(result2.probability)}`, opacity: 0.9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "bold" }}>Pilihan 2</span>
                      <h3 style={{ fontSize: "1.2rem", color: "var(--text)", marginTop: "5px" }}>{pilihan2.major}</h3>
                      <p style={{ color: "var(--primary)", fontSize: "0.9rem" }}>{pilihan2.univ}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "2rem", fontWeight: "900", color: getStatusColor(result2.probability), lineHeight: 1, fontFamily: "Outfit, sans-serif" }}>
                        {result2.probability}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "1rem", background: "#F8FAFC", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    {result2.diagnostic.split(". ").filter(Boolean).slice(0, 2).map((insight, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: "3px" }} />
                        <span>{insight}.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
