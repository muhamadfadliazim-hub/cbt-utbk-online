"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, Info } from "lucide-react";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";

// Configure marked to use Katex for math parsing in the preview
marked.use(markedKatex({
  throwOnError: false,
  displayMode: true
}));

export default function BulkImportQuestions({ sections }: { sections: any[] }) {
  const [rawText, setRawText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState(sections[0]?.id || "");
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const parseText = () => {
    setIsParsing(true);
    try {
      // Split by newline but DO NOT filter out empty lines to preserve markdown formatting
      const lines = rawText.split('\n');
      const questions: any[] = [];
      let currentQuestion: any = null;

      const questionRegex = /^(\d+)[\.\)]\s+(.*)/;
      const optionRegex = /^([A-E])[\.\)]\s+(.*)/i;

      lines.forEach(line => {
        const qMatch = line.match(questionRegex);
        const oMatch = line.match(optionRegex);

        if (qMatch) {
          if (currentQuestion) {
            // Trim trailing newlines before pushing
            currentQuestion.content = currentQuestion.content.trim();
            questions.push(currentQuestion);
          }
          currentQuestion = {
            content: qMatch[2],
            options: [],
            answerKey: ""
          };
        } else if (oMatch && currentQuestion) {
          let optText = oMatch[2];
          let isCorrect = false;
          
          if (optText.toLowerCase().includes("(benar)") || optText.endsWith("*")) {
            isCorrect = true;
            optText = optText.replace(/\(benar\)/i, "").replace(/\*$/, "").trim();
            currentQuestion.answerKey = optText;
          }
          
          currentQuestion.options.push(optText);
        } else if (currentQuestion) {
          // If it's not a new question and not an option, append to the question content.
          // This allows multi-paragraph discourses (wacana) and Markdown tables to be attached to the current question.
          currentQuestion.content += "\n" + line;
        }
      });

      if (currentQuestion) {
        currentQuestion.content = currentQuestion.content.trim();
        questions.push(currentQuestion);
      }
      setParsedQuestions(questions);
    } catch (e) {
      console.error(e);
      setMessage("Gagal memproses teks.");
    }
    setIsParsing(false);
  };

  const submitQuestions = async () => {
    if (!selectedSection) return alert("Pilih section/bagian ujian terlebih dahulu.");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: selectedSection, questions: parsedQuestions })
      });
      if (res.ok) {
        setMessage("Soal berhasil diimpor!");
        setParsedQuestions([]);
        setRawText("");
      } else {
        setMessage("Terjadi kesalahan saat menyimpan soal.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Gagal menghubungi server.");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <h3 style={{ marginBottom: "15px" }}>Paste Teks Soal</h3>
        
        <div style={{ padding: "15px", background: "var(--surface-hover)", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "15px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: "10px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }}>
            <Info size={16} /> Panduan Format Penulisan:
          </p>
          <ul style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "20px", lineHeight: "1.6" }}>
            <li>Gunakan angka diikuti titik (misal: <code>1. </code>) untuk memulai soal baru.</li>
            <li>Gunakan huruf diikuti titik (misal: <code>A. </code>) untuk opsi jawaban.</li>
            <li>Tandai jawaban benar dengan kata <code>(benar)</code> atau bintang <code>*</code> di akhir baris opsi.</li>
            <li><b>Mendukung Markdown!</b> Anda bebas menempelkan wacana paragraf ganda, cetak **tebal**, atau _miring_.</li>
            <li><b>Mendukung Matematika (LaTeX)!</b> Gunakan <code>$$...$$</code> untuk blok rumus, dan <code>$...$</code> untuk rumus sebaris.</li>
          </ul>
        </div>

        <textarea 
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`1. Perhatikan gambar dan rumus berikut:

![Grafik Fungsi](https://link-gambar.com/grafik.png)

Hitunglah akar-akar persamaan dari $$ f(x) = x^2 - 4x + 4 $$ jika diketahui $x > 0$.

A. 1
B. 2 (benar)
C. 3
D. 4
E. 5`}
          style={{ width: "100%", height: "350px", padding: "15px", borderRadius: "8px", border: "1px solid var(--border)", resize: "vertical", fontFamily: "monospace", fontSize: "0.9rem" }}
        />
        <button 
          onClick={parseText}
          style={{ marginTop: "15px", padding: "10px 20px", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          {isParsing ? "Memproses..." : "Parse Teks"}
        </button>
      </div>

      <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <h3 style={{ marginBottom: "15px" }}>Preview ({parsedQuestions.length} Soal)</h3>
        {message && (
          <div style={{ padding: "10px", background: "var(--success-light)", color: "var(--success)", borderRadius: "8px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={18} /> {message}
          </div>
        )}
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Masukkan ke Bagian (Section):</label>
          <select 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <option value="">-- Pilih Section --</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.exam.title} - {s.title}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px", padding: "15px", background: "#f8fafc", marginBottom: "15px" }}>
          {parsedQuestions.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "50px" }}>Belum ada soal diparse.</div>
          ) : (
            parsedQuestions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: "20px", background: "white", padding: "15px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "0.95rem" }} className="markdown-body">
                  <span style={{ float: "left", marginRight: "5px" }}>{idx + 1}. </span>
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(q.content) as string }} />
                </div>
                {q.options.map((opt: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0", color: opt === q.answerKey ? "var(--success)" : "var(--text)", fontSize: "0.9rem" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `1px solid ${opt === q.answerKey ? "var(--success)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {opt === q.answerKey && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--success)" }} />}
                    </div>
                    <span>{String.fromCharCode(65 + i)}.</span>
                    <div className="markdown-body inline" dangerouslySetInnerHTML={{ __html: marked.parseInline(opt) as string }} />
                  </div>
                ))}
                {!q.answerKey && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "10px", display: "flex", alignItems: "center", gap: "5px" }}><AlertCircle size={14}/> Kunci jawaban tidak terdeteksi</div>}
              </div>
            ))
          )}
        </div>

        <button 
          onClick={submitQuestions}
          disabled={parsedQuestions.length === 0 || isSubmitting}
          style={{ padding: "12px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", cursor: parsedQuestions.length === 0 ? "not-allowed" : "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
          <UploadCloud size={20} />
          {isSubmitting ? "Menyimpan..." : "Simpan ke Database"}
        </button>
      </div>
    </div>
  );
}
