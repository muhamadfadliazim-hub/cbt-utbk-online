"use client";

import { useMemo, useState } from "react";
import { Check, CheckCircle2, ClipboardPaste, FilePlus2, Plus, Save, Sparkles, Trash2, X, AlertCircle } from "lucide-react";
import { QuestionKind, useAcademyHub, EXAM_TEMPLATES } from "@/lib/academyHub";


import { renderMarkdownWithMath } from "@/lib/renderMath";

type StatementDraft = { id: string; text: string; answer: "BENAR" | "SALAH" };

const labels: Record<QuestionKind, string> = {
  PILIHAN_GANDA: "Pilihan Ganda",
  PG_KOMPLEKS: "PG Kompleks",
  BENAR_SALAH: "Benar / Salah",
  ISIAN_SINGKAT: "Isian Singkat",
};
const BULK_EXAMPLE = `SOAL: Perhatikan persamaan lingkaran berikut!
Diberikan persamaan $$ x^2 + y^2 - 4x + 6y - 12 = 0 $$.
Manakah dari pernyataan berikut yang merupakan jari-jari lingkaran tersebut?

A. 2
B. 3
C. 4
D. 5
KUNCI: D
PEMBAHASAN: Persamaan lingkaran $x^2+y^2+Ax+By+C=0$ memiliki jari-jari $r = \\sqrt{\\frac{A^2}{4} + \\frac{B^2}{4} - C}$.
Maka $r = \\sqrt{4 + 9 + 12} = \\sqrt{25} = 5$.
---
SOAL: Perhatikan gambar berikut:
![Sel Hewan](https://placehold.co/400x300.png?text=Gambar+Sel+Hewan)

Organel mana saja yang berperan aktif dalam sintesis protein dan modifikasinya? (PG Kompleks)
A. Nukleus
B. Ribosom
C. Retikulum Endoplasma Kasar
D. Lisosom
E. Badan Golgi
KUNCI: B, C, E
---
SOAL: Berapakah nilai dari $\\int_0^2 (3x^2) dx$?
KUNCI: 8
PEMBAHASAN: Hasil integralnya adalah $x^3$. Jika dievaluasi dari 0 hingga 2, maka $2^3 - 0 = 8$.
---
SOAL: Tentukan kebenaran dari pernyataan-pernyataan berikut mengenai fotosintesis!
[B] Reaksi terang terjadi di membran tilakoid.
[S] Siklus Calvin menghasilkan ATP dan NADPH.
[B] Oksigen dihasilkan dari proses fotolisis air.
---
SOAL: Tentukan determinan dari matriks $A$ berikut!
$$
A = \\begin{pmatrix}
1 & 2 & 3 \\\\
0 & 1 & 4 \\\\
5 & 6 & 0
\\end{pmatrix}
$$
A. 1
B. 2
C. 3
D. 4
KUNCI: 1
PEMBAHASAN: Determinan dihitung dengan metode Sarrus atau ekspansi kofaktor.`;

export default function QuestionBuilder() {
  const { state, addQuestion, addQuestions } = useAcademyHub();
  const packages = state.exams;
  const [mode, setMode] = useState<"SINGLE" | "BULK">("SINGLE");
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const selectedPackage = packages.find((p) => p.id === packageId);
  const availableSections = selectedPackage ? EXAM_TEMPLATES[selectedPackage.category] : [];
  const [section, setSection] = useState(availableSections[0]?.title ?? "");
  const [type, setType] = useState<QuestionKind>("PILIHAN_GANDA");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answerIndexes, setAnswerIndexes] = useState<number[]>([]);
  const [shortAnswer, setShortAnswer] = useState("");
  const [statements, setStatements] = useState<StatementDraft[]>([
    { id: "st-1", text: "", answer: "BENAR" }, { id: "st-2", text: "", answer: "SALAH" }, { id: "st-3", text: "", answer: "BENAR" },
  ]);
  const [explanation, setExplanation] = useState("");
  const [bulkText, setBulkText] = useState(BULK_EXAMPLE);
  const [toast, setToast] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  const previewCount = useMemo(() => bulkText.split(/\n\s*---+\s*\n/g).filter((block) => block.trim()).length, [bulkText]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const toggleAnswerIndex = (index: number) => {
    setAnswerIndexes((current) => type === "PILIHAN_GANDA" ? [index] : current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  };

  const resetQuestion = () => {
    setContent(""); setOptions(["", "", "", ""]); setAnswerIndexes([]); setShortAnswer(""); setExplanation("");
    setStatements([{ id: `st-${Date.now()}-1`, text: "", answer: "BENAR" }, { id: `st-${Date.now()}-2`, text: "", answer: "SALAH" }]);
  };

  const saveSingle = () => {
    if (!packageId || !content.trim()) return flash("Pilih paket dan isi pertanyaan terlebih dahulu.");
    const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);
    const cleanedStatements = statements.filter((statement) => statement.text.trim()).map(({ text, answer }) => ({ text: text.trim(), answer }));
    if ((type === "PILIHAN_GANDA" || type === "PG_KOMPLEKS") && (cleanedOptions.length < 2 || answerIndexes.length === 0)) return flash("Lengkapi opsi dan pilih kunci jawaban.");
    if (type === "BENAR_SALAH" && cleanedStatements.length === 0) return flash("Tambahkan minimal satu pernyataan Benar/Salah.");
    if (type === "ISIAN_SINGKAT" && !shortAnswer.trim()) return flash("Isi kunci jawaban eksak.");

    const keyedAnswers = answerIndexes.map((index) => options[index]?.trim()).filter(Boolean);
    addQuestion({
      packageId, section, type, content: content.trim(), options: cleanedOptions,
      answerKey: type === "ISIAN_SINGKAT" ? shortAnswer.trim() : type === "BENAR_SALAH" ? cleanedStatements.map((statement) => statement.answer) : type === "PILIHAN_GANDA" ? keyedAnswers[0] ?? "" : keyedAnswers,
      statements: type === "BENAR_SALAH" ? cleanedStatements : undefined,
      explanation: explanation.trim(),
    });
    resetQuestion();
    flash("Soal tersimpan ke bank soal dan terhubung ke paket.");
  };

  const parsedBulkRecords = useMemo(() => {
    return bulkText.split(/\n\s*---+\s*\n/g).map((block) => {
      const rawLines = block.split(/\r?\n/);
      
      const optionsStartIndex = rawLines.findIndex(line => /^[A-H][.)]\s+/i.test(line) || /^\s*\[(B|S)\]\s+/i.test(line));
      const kunciIndex = rawLines.findIndex(line => /^KUNCI\s*:/i.test(line));
      const pembahasanIndex = rawLines.findIndex(line => /^PEMBAHASAN\s*:/i.test(line));
      
      const endOfQuestion = optionsStartIndex !== -1 ? optionsStartIndex 
        : (kunciIndex !== -1 ? kunciIndex : (pembahasanIndex !== -1 ? pembahasanIndex : rawLines.length));
        
      const questionText = rawLines.slice(0, endOfQuestion).join('\n')
        .replace(/^SOAL\s*:\s*/i, "").trim();
        
      const optionLines = rawLines.filter((line) => /^[A-H][.)]\s+/i.test(line));
      const parsedOptions = optionLines.map((line) => line.replace(/^[A-H][.)]\s+/i, ""));
      
      const bsLines = rawLines.filter((line) => /^\s*\[(B|S)\]\s+/i.test(line));
      const statements = bsLines.map(line => {
         const isBenar = /^\s*\[B\]\s+/i.test(line);
         return {
           id: Math.random().toString(36).substring(2, 10),
           text: line.replace(/^\s*\[(B|S)\]\s+/i, "").trim(),
           answer: isBenar ? "BENAR" : "SALAH" as "BENAR" | "SALAH"
         };
      });
      
      const keyLine = (rawLines.find((line) => /^KUNCI\s*:/i.test(line))?.replace(/^KUNCI\s*:\s*/i, "") ?? "").trim();
      const keyLetters = keyLine.split(/[,;\s]+/).filter(Boolean);
      const keyValues = keyLetters.map((letter) => parsedOptions[letter.toUpperCase().charCodeAt(0) - 65]).filter(Boolean);
      
      const parsedExplanation = (pembahasanIndex !== -1 ? rawLines.slice(pembahasanIndex).join('\n') : "")
        .replace(/^PEMBAHASAN\s*:\s*/i, "").trim();
        
      if (!questionText) return null;

      let type: QuestionKind = "PILIHAN_GANDA";
      let answerKey: any = "";
      
      if (statements.length > 0) {
        type = "BENAR_SALAH";
        answerKey = statements.map(s => s.answer);
      } else if (parsedOptions.length > 0) {
        type = keyValues.length > 1 ? "PG_KOMPLEKS" : "PILIHAN_GANDA";
        answerKey = keyValues.length > 1 ? keyValues : (keyValues[0] || "");
        if (!answerKey || answerKey.length === 0) return null; // Invalid PG
      } else {
        if (!keyLine) return null; // Isian but no key
        type = "ISIAN_SINGKAT";
        answerKey = keyLine;
      }

      return { packageId, section, type, content: questionText, options: parsedOptions, statements: statements.length > 0 ? statements : undefined, answerKey, explanation: parsedExplanation };
    }).filter(Boolean);
  }, [bulkText, packageId, section]);

  const importBulk = () => {
    if (!packageId) return flash("Pilih paket ujian terlebih dahulu.");
    if (parsedBulkRecords.length === 0) return flash("Format belum terbaca. Gunakan pola SOAL, A., B., dan KUNCI seperti contoh.");
    addQuestions(parsedBulkRecords as Parameters<typeof addQuestions>[0]);
    flash(`${parsedBulkRecords.length} soal berhasil diimpor sekaligus.`);
    setBulkText("");
  };

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "2rem", color: "white" }}>Studio Bank Soal</h1><p style={{ color: "rgba(255,255,255,0.8)" }}>Tulis satu soal dengan editor visual atau tempel banyak soal sekaligus.</p></div>
        <div className="exam-tabs"><button className={`exam-tab ${mode === "SINGLE" ? "active" : ""}`} onClick={() => setMode("SINGLE")}><FilePlus2 size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Editor Visual</button><button className={`exam-tab ${mode === "BULK" ? "active" : ""}`} onClick={() => setMode("BULK")}><ClipboardPaste size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Tempel Massal</button></div>
      </div>

      <section className="card" style={{ display: "grid", gridTemplateColumns: "minmax(280px,1fr) minmax(220px,.7fr)", gap: "1rem" }}>
        <label>
          <span className="field-label">Paket tryout</span>
          <select 
            className="field" 
            value={packageId} 
            onChange={(event) => {
              const newPackageId = event.target.value;
              setPackageId(newPackageId);
              const pkg = packages.find((p) => p.id === newPackageId);
              if (pkg) {
                setSection(EXAM_TEMPLATES[pkg.category][0]?.title ?? "");
              }
            }}
          >
            <option value="">Pilih paket…</option>
            {packages.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label>
          <span className="field-label">Subtes / kelompok soal</span>
          <select className="field" value={section} onChange={(event) => setSection(event.target.value)}>
            {availableSections.map((sec) => (
              <option key={sec.id} value={sec.title}>{sec.title}</option>
            ))}
          </select>
        </label>
      </section>

      {mode === "BULK" ? (
        <div className="workspace-grid">
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Tempel Soal dari Word / Spreadsheet</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Pisahkan antarsoal dengan tiga tanda minus (---).</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button 
                  onClick={() => setShowPreview(!showPreview)} 
                  style={{ padding: "6px 12px", borderRadius: "20px", background: showPreview ? "var(--primary)" : "var(--surface-hover)", color: showPreview ? "white" : "var(--primary)", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
                  {showPreview ? "Kembali ke Editor" : "Lihat Preview"}
                </button>
                <span className="status-pill" style={{ background: "var(--surface-hover)", color: "var(--primary)" }}>{previewCount} blok</span>
              </div>
            </div>
            
            {showPreview ? (
              <div style={{ flex: 1, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px", padding: "15px", background: "#f8fafc", marginBottom: "15px", maxHeight: "500px" }}>
                {parsedBulkRecords.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "50px" }}>Format tidak valid atau kosong.</div>
                ) : (
                  parsedBulkRecords.map((q: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: "20px", background: "white", padding: "15px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "0.95rem" }} className="markdown-body">
                        <span style={{ float: "left", marginRight: "5px" }}>{idx + 1}. </span>
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(q.content) as string }} />
                      </div>
                      {q.type === "BENAR_SALAH" && q.statements ? (
                        <div style={{ marginTop: "15px", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                            <thead>
                              <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ textAlign: "left", padding: "10px 15px", fontWeight: 600, color: "var(--text-muted)" }}>PERNYATAAN</th>
                                <th style={{ textAlign: "center", padding: "10px 15px", fontWeight: 600, color: "var(--text-muted)", width: "80px" }}>BENAR</th>
                                <th style={{ textAlign: "center", padding: "10px 15px", fontWeight: 600, color: "var(--text-muted)", width: "80px" }}>SALAH</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.statements.map((stmt: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                  <td style={{ padding: "12px 15px" }} dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(stmt.text, true) as string }} />
                                  <td style={{ padding: "12px 15px", textAlign: "center" }}>
                                    <div style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "6px", background: stmt.answer === "BENAR" ? "var(--success)" : "transparent", border: `1px solid ${stmt.answer === "BENAR" ? "var(--success)" : "var(--border)"}`, alignItems: "center", justifyContent: "center", color: "white" }}>
                                      {stmt.answer === "BENAR" && <Check size={14} strokeWidth={3} />}
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 15px", textAlign: "center" }}>
                                    <div style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "6px", background: stmt.answer === "SALAH" ? "var(--danger)" : "transparent", border: `1px solid ${stmt.answer === "SALAH" ? "var(--danger)" : "var(--border)"}`, alignItems: "center", justifyContent: "center", color: "white" }}>
                                      {stmt.answer === "SALAH" && <X size={14} strokeWidth={3} />}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : q.type === "ISIAN_SINGKAT" ? (
                        <div style={{ marginTop: "15px" }}>
                          <div style={{ padding: "10px 15px", border: "1px dashed var(--success)", background: "#ECFDF5", borderRadius: "8px", color: "var(--text)", fontSize: "0.95rem", display: "flex", gap: "10px", alignItems: "center" }}>
                            <strong style={{ color: "var(--success)" }}>Kunci Jawaban:</strong>
                            <div className="markdown-body inline" dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(q.answerKey, true) as string }} />
                          </div>
                        </div>
                      ) : (
                        q.options.map((opt: string, i: number) => {
                          const isCorrect = Array.isArray(q.answerKey) ? q.answerKey.includes(opt) : opt === q.answerKey;
                          const isComplex = q.type === "PG_KOMPLEKS";
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", color: isCorrect ? "var(--success)" : "var(--text)", fontSize: "0.9rem" }}>
                              <div style={{ width: "20px", height: "20px", borderRadius: isComplex ? "4px" : "50%", border: `1px solid ${isCorrect ? "var(--success)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isCorrect ? "var(--success)" : "transparent" }}>
                                {isCorrect && <Check size={12} color="white" strokeWidth={3} />}
                              </div>
                              <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + i)}.</span>
                              <div className="markdown-body inline" dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(opt, true) as string }} />
                            </div>
                          );
                        })
                      )}
                      {!q.answerKey && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "10px", display: "flex", alignItems: "center", gap: "5px" }}><AlertCircle size={14}/> Kunci jawaban tidak terdeteksi</div>}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <textarea className="field" value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={20} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.86rem", lineHeight: 1.65 }} />
            )}
            
            <button className="btn btn-primary" onClick={importBulk} style={{ width: "100%", marginTop: "1rem", gap: 8 }}><Sparkles size={18} /> Parse & Simpan {parsedBulkRecords.length} Soal</button>
          </section>
          <aside className="card" style={{ height: "fit-content" }}>
            <h3 className="card-title">Format Cepat</h3>
            <ol style={{ paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.86rem", display: "grid", gap: "0.6rem" }}>
              <li>Awali dengan <strong>SOAL:</strong></li>
              <li>Pisahkan antarsoal dengan <strong>---</strong> (tiga minus)</li>
              <li>Opsi PG memakai A. sampai H.</li>
              <li>Untuk <strong>PG Kompleks</strong>, tulis kunci jamak: <strong>KUNCI: A, C</strong></li>
              <li>Untuk <strong>Isian Singkat</strong>, abaikan opsi dan langsung <strong>KUNCI: 8</strong></li>
              <li>Untuk <strong>Benar/Salah</strong>, gunakan <strong>[B]</strong> atau <strong>[S]</strong> di awal pernyataan.</li>
              <li>Dukung <strong>Markdown</strong> dan <strong>LaTeX</strong> <code>$$...$$</code></li>
            </ol>
            <div style={{ marginTop: "1rem", background: "#ECFDF5", color: "#065F46", borderRadius: "0.8rem", padding: "0.9rem", fontSize: "0.8rem" }}>
              Parser otomatis membedakan semua tipe soal (PG, Kompleks, Isian, Benar/Salah) berdasarkan format input.
            </div>
          </aside>
        </div>
      ) : (
        <div className="workspace-grid">
          <section className="card" style={{ display: "grid", gap: "1.2rem" }}>
            <div><span className="field-label">Jenis soal</span><div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>{(Object.keys(labels) as QuestionKind[]).map((kind) => <button key={kind} onClick={() => { setType(kind); setAnswerIndexes([]); }} style={{ borderRadius: "0.75rem", padding: "0.65rem 0.85rem", border: `2px solid ${type === kind ? "var(--primary)" : "var(--border)"}`, background: type === kind ? "var(--surface-hover)" : "white", color: type === kind ? "var(--primary)" : "var(--text-muted)", fontWeight: 800, cursor: "pointer" }}>{labels[kind]}</button>)}</div></div>
            <label><span className="field-label">Pertanyaan / stimulus</span><textarea className="field" rows={6} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Ketik stimulus dan instruksi soal di sini…" /></label>

            {(type === "PILIHAN_GANDA" || type === "PG_KOMPLEKS") && <div><span className="field-label">Opsi & kunci jawaban</span><div style={{ display: "grid", gap: "0.65rem" }}>{options.map((option, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "36px minmax(0,1fr) 36px", gap: "0.6rem", alignItems: "center" }}><button aria-label={`Jadikan opsi ${index + 1} sebagai kunci`} onClick={() => toggleAnswerIndex(index)} style={{ width: 34, height: 34, borderRadius: type === "PILIHAN_GANDA" ? "50%" : 8, border: `2px solid ${answerIndexes.includes(index) ? "var(--success)" : "#94A3B8"}`, background: answerIndexes.includes(index) ? "var(--success)" : "white", color: "white", display: "grid", placeItems: "center", cursor: "pointer" }}>{answerIndexes.includes(index) && <Check size={17} />}</button><input className="field" value={option} onChange={(event) => setOptions((current) => current.map((item, optionIndex) => optionIndex === index ? event.target.value : item))} placeholder={`Opsi ${String.fromCharCode(65 + index)}`} /><button onClick={() => { setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index)); setAnswerIndexes([]); }} disabled={options.length <= 2} style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={18} /></button></div>)}</div><button className="btn" onClick={() => setOptions((current) => [...current, ""])} style={{ marginTop: "0.7rem", background: "#F8FAFC", color: "var(--primary)", gap: 7 }}><Plus size={16} /> Tambah Opsi</button></div>}

            {type === "ISIAN_SINGKAT" && <label><span className="field-label">Kunci jawaban eksak</span><input className="field" value={shortAnswer} onChange={(event) => setShortAnswer(event.target.value)} placeholder="Contoh: 144" /></label>}

            {type === "BENAR_SALAH" && <div><span className="field-label">Pernyataan & kunci (klik Benar/Salah)</span><div className="matrix-table"><div className="matrix-row matrix-header"><div className="matrix-cell matrix-statement">Pernyataan</div><div className="matrix-cell">Benar</div><div className="matrix-cell">Salah</div></div>{statements.map((statement, index) => <div className="matrix-row" key={statement.id}><div className="matrix-cell matrix-statement" style={{ gap: 8 }}><span style={{ fontWeight: 800 }}>{index + 1}.</span><input value={statement.text} onChange={(event) => setStatements((current) => current.map((item) => item.id === statement.id ? { ...item, text: event.target.value } : item))} placeholder={`Pernyataan ${index + 1}`} style={{ width: "100%", border: 0, outline: 0, background: "transparent" }} /></div><div className="matrix-cell"><button className={`matrix-choice ${statement.answer === "BENAR" ? "selected-true" : ""}`} onClick={() => setStatements((current) => current.map((item) => item.id === statement.id ? { ...item, answer: "BENAR" } : item))}><Check size={18} /></button></div><div className="matrix-cell"><button className={`matrix-choice ${statement.answer === "SALAH" ? "selected-false" : ""}`} onClick={() => setStatements((current) => current.map((item) => item.id === statement.id ? { ...item, answer: "SALAH" } : item))}><X size={18} /></button></div></div>)}</div><button className="btn" onClick={() => setStatements((current) => [...current, { id: `st-${Date.now()}`, text: "", answer: "BENAR" }])} style={{ marginTop: "0.7rem", background: "#F8FAFC", color: "var(--primary)", gap: 7 }}><Plus size={16} /> Tambah Pernyataan</button></div>}

            <label><span className="field-label">Pembahasan (opsional)</span><textarea className="field" rows={4} value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Tulis pembahasan singkat agar mudah dipahami siswa…" /></label>
            <button className="btn btn-primary" onClick={saveSingle} style={{ gap: 8 }}><Save size={18} /> Simpan & Buat Soal Berikutnya</button>
          </section>
          <aside className="card" style={{ height: "fit-content" }}><h3 className="card-title">Ringkasan Bank Soal</h3><div style={{ display: "grid", gap: "0.85rem" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span>Total soal</span><strong>{state.questions.length}</strong></div>{(Object.keys(labels) as QuestionKind[]).map((kind) => <div key={kind} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.84rem" }}><span>{labels[kind]}</span><strong>{state.questions.filter((item) => item.type === kind).length}</strong></div>)}</div></aside>
        </div>
      )}
      {toast && <div className="toast-message"><CheckCircle2 size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />{toast}</div>}
    </div>
  );
}
