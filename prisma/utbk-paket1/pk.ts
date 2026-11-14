import { SeedQuestion } from "./pu";

const SVG_PK_STIMULUS1 = `<svg viewBox="0 0 320 198" width="320" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <line x1="15" y1="172" x2="296" y2="172" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="80" y1="184" x2="80" y2="12" stroke="#0f172a" stroke-width="1.2"/>
  <polygon points="296,172 289,168 289,176" fill="#0f172a"/>
  <polygon points="80,12 76,19 84,19" fill="#0f172a"/>
  <line x1="155" y1="20" x2="155" y2="180" stroke="#475569" stroke-width="1" stroke-dasharray="4 3"/>
  <foreignObject x="158" y="56" width="46" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:46px;height:20px;color:#0f172a;font-size:10.5px;font-weight:700"><span>$x = 2$</span></div></foreignObject>
  <line x1="35" y1="38" x2="262" y2="38" stroke="#475569" stroke-width="1" stroke-dasharray="4 3"/>
  <foreignObject x="265" y="28" width="52" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:52px;height:20px;color:#0f172a;font-size:10.5px;font-weight:700"><span>$y = 10$</span></div></foreignObject>
  <line x1="65" y1="154" x2="230" y2="154" stroke="#475569" stroke-width="1" stroke-dasharray="4 3"/>
  <foreignObject x="22" y="144" width="42" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:42px;height:20px;justify-content:flex-end;color:#0f172a;font-size:10.5px;font-weight:700"><span>$y = 1$</span></div></foreignObject>
  <path d="M 45,14 Q 155,294 265,14" fill="none" stroke="#1d4ed8" stroke-width="2"/>
  <circle cx="57" cy="38" r="3.2" fill="#0f172a"/>
  <foreignObject x="40" y="20" width="16" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:16px;height:18px;color:#0f172a;font-size:11px;font-weight:700"><span>$A$</span></div></foreignObject>
  <circle cx="253" cy="38" r="3.2" fill="#0f172a"/>
  <foreignObject x="256" y="19" width="16" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:16px;height:18px;color:#0f172a;font-size:11px;font-weight:700"><span>$B$</span></div></foreignObject>
  <circle cx="155" cy="154" r="3.2" fill="#0f172a"/>
  <foreignObject x="160" y="154" width="16" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:16px;height:18px;color:#0f172a;font-size:11px;font-weight:700"><span>$V$</span></div></foreignObject>
</svg>`;

const SVG_PK_STIMULUS2 = `<svg viewBox="0 0 290 192" width="290" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <polygon points="100,32 190,32 246,156 44,156" fill="none" stroke="#0f172a" stroke-width="1.8"/>
  <line x1="44" y1="156" x2="190" y2="32" stroke="#334155" stroke-width="1.1"/>
  <line x1="246" y1="156" x2="100" y2="32" stroke="#334155" stroke-width="1.1"/>
  <circle cx="145" cy="94" r="62" fill="none" stroke="#1d4ed8" stroke-width="1.4"/>
  <circle cx="145" cy="70" r="2.8" fill="#0f172a"/>
  <text x="151" y="73" font-size="11" font-weight="700" font-style="italic" fill="#0f172a">O</text>
  <circle cx="145" cy="94" r="2.8" fill="#1d4ed8"/>
  <text x="151" y="98" font-size="11" font-weight="700" font-style="italic" fill="#1d4ed8">I</text>
  <text x="88" y="27" font-size="11.5" font-weight="700" font-style="italic" fill="#0f172a">D</text>
  <text x="145" y="25" text-anchor="middle" font-size="11.5" font-weight="600" fill="#0f172a">8</text>
  <text x="193" y="27" font-size="11.5" font-weight="700" font-style="italic" fill="#0f172a">C</text>
  <text x="58" y="96" font-size="11.5" font-weight="600" fill="#0f172a">13</text>
  <text x="220" y="96" font-size="11.5" font-weight="600" fill="#0f172a">13</text>
  <text x="31" y="168" font-size="11.5" font-weight="700" font-style="italic" fill="#0f172a">A</text>
  <text x="145" y="173" text-anchor="middle" font-size="11.5" font-weight="600" fill="#0f172a">18</text>
  <text x="250" y="168" font-size="11.5" font-weight="700" font-style="italic" fill="#0f172a">B</text>
</svg>`;

const SVG_PK_Q11 = `<svg viewBox="0 0 245 170" width="245" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <rect x="46" y="46" width="105" height="105" fill="none" stroke="#0f172a" stroke-width="1.6"/>
  <polyline points="46,46 86,21 191,21 151,46" fill="none" stroke="#0f172a" stroke-width="1.6"/>
  <polyline points="191,21 191,126 151,151" fill="none" stroke="#0f172a" stroke-width="1.6"/>
  <line x1="86" y1="21" x2="86" y2="126" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="46" y1="151" x2="86" y2="126" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="86" y1="126" x2="191" y2="126" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/>
  <circle cx="118.5" cy="86" r="52" fill="none" stroke="#1d4ed8" stroke-width="1.5"/>
  <ellipse cx="118.5" cy="86" rx="52" ry="14" fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="4 3"/>
  <circle cx="118.5" cy="86" r="2.2" fill="#0f172a"/>
  <text x="125" y="90" font-size="11" font-weight="700" font-style="italic" fill="#0f172a">O</text>
</svg>`;

const SVG_PK_Q12 = `<svg viewBox="0 0 310 155" width="310" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <polygon points="72,118 258,118 36,46" fill="none" stroke="#0f172a" stroke-width="1.8"/>
  <foreignObject x="60" y="121" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$A$</span></div></foreignObject>
  <foreignObject x="256" y="121" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$B$</span></div></foreignObject>
  <foreignObject x="20" y="25" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$C$</span></div></foreignObject>
  <text x="41" y="90" font-size="11.5" font-weight="600" fill="#0f172a">6</text>
  <text x="165" y="136" text-anchor="middle" font-size="11.5" font-weight="600" fill="#0f172a">10</text>
  <foreignObject x="164" y="60" width="76" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:76px;height:20px;color:#334155;font-size:11px;font-weight:600"><span>$BC &gt; 12$</span></div></foreignObject>
  <foreignObject x="95" y="12" width="120" height="24" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:120px;height:24px;justify-content:center;color:#1e3a8a;font-size:11.5px;font-weight:700"><span>$L = 15\\sqrt{3}$</span></div></foreignObject>
</svg>`;

const SVG_PK_Q14 = `<svg viewBox="0 0 290 155" width="290" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <circle cx="82" cy="78" r="46" fill="none" stroke="#0f172a" stroke-width="1.6"/>
  <line x1="96" y1="34" x2="242" y2="78" stroke="#0f172a" stroke-width="1.6"/>
  <line x1="96" y1="122" x2="242" y2="78" stroke="#0f172a" stroke-width="1.6"/>
  <line x1="82" y1="78" x2="96" y2="34" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="82" y1="78" x2="96" y2="122" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="82" y1="78" x2="242" y2="78" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>
  <circle cx="82" cy="78" r="2.5" fill="#0f172a"/>
  <foreignObject x="62" y="69" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$O$</span></div></foreignObject>
  <foreignObject x="90" y="12" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$A$</span></div></foreignObject>
  <foreignObject x="90" y="126" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$B$</span></div></foreignObject>
  <foreignObject x="247" y="69" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$T$</span></div></foreignObject>
</svg>`;

const SVG_PK_Q15 = `<svg viewBox="0 0 310 148" width="310" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <line x1="30" y1="118" x2="262" y2="118" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="140" y1="130" x2="140" y2="14" stroke="#0f172a" stroke-width="1.2"/>
  <polygon points="262,118 255,114 255,122" fill="#0f172a"/>
  <polygon points="140,14 136,21 144,21" fill="#0f172a"/>
  <path d="M 48,28 Q 140,140 232,28" fill="none" stroke="#0f172a" stroke-width="1.8"/>
  <line x1="42" y1="68" x2="246" y2="68" stroke="#2563eb" stroke-width="1.2" stroke-dasharray="4 3"/>
  <foreignObject x="248" y="54" width="56" height="28" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:56px;height:28px;color:#1d4ed8;font-size:10.5px;font-weight:700"><span>$y = \\frac{5}{2}$</span></div></foreignObject>
  <circle cx="80" cy="68" r="2.8" fill="#0f172a"/>
  <foreignObject x="70" y="48" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11px;font-weight:700"><span>$p$</span></div></foreignObject>
  <circle cx="200" cy="68" r="2.8" fill="#0f172a"/>
  <foreignObject x="199" y="48" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11px;font-weight:700"><span>$q$</span></div></foreignObject>
  <foreignObject x="216" y="21" width="18" height="18" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:18px;height:18px;color:#0f172a;font-size:11.5px;font-weight:700"><span>$F$</span></div></foreignObject>
</svg>`;

const SVG_PK_Q19 = `<svg viewBox="0 0 340 296" width="340" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="fa-pk-q19" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#0f172a"/>
    </marker>
  </defs>
  <rect x="120" y="10" width="100" height="26" rx="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="120" y="12" width="100" height="22" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:100px;height:22px;justify-content:center;color:#0f172a;font-size:11px;font-weight:600"><span>Input $n$</span></div></foreignObject>
  <line x1="170" y1="36" x2="170" y2="50" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <polygon points="170,52 226,75 170,98 114,75" fill="#fff" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="128" y="64" width="84" height="22" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:84px;height:22px;justify-content:center;color:#0f172a;font-size:10.5px"><span>$n$ genap?</span></div></foreignObject>
  <polyline points="114,75 62,75 62,102" fill="none" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <text x="86" y="69" font-size="10" font-weight="600" fill="#0f172a">ya</text>
  <polyline points="226,75 278,75 278,102" fill="none" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <text x="249" y="69" font-size="10" font-weight="600" fill="#0f172a">tidak</text>
  <rect x="14" y="104" width="96" height="30" rx="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="14" y="105" width="96" height="28" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:96px;height:28px;justify-content:center;color:#0f172a;font-size:10.5px"><span>$p = \\tfrac{n}{2} + 3$</span></div></foreignObject>
  <rect x="230" y="104" width="96" height="30" rx="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="230" y="105" width="96" height="28" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:96px;height:28px;justify-content:center;color:#0f172a;font-size:10.5px"><span>$p = 2n - 1$</span></div></foreignObject>
  <polyline points="62,134 62,148 170,148 170,161" fill="none" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <polyline points="278,134 278,148 170,148" fill="none" stroke="#0f172a"/>
  <polygon points="170,163 236,188 170,213 104,188" fill="#fff" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="116" y="170" width="108" height="36" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:108px;height:36px;justify-content:center;text-align:center;color:#0f172a;font-size:9.5px;line-height:1.2"><span>Apakah $p$ habis<br/>dibagi $3$?</span></div></foreignObject>
  <polyline points="104,188 62,188 62,215" fill="none" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <text x="80" y="182" font-size="10" font-weight="600" fill="#0f172a">ya</text>
  <polyline points="236,188 278,188 278,215" fill="none" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <text x="255" y="182" font-size="10" font-weight="600" fill="#0f172a">tidak</text>
  <rect x="14" y="217" width="96" height="30" rx="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="14" y="218" width="96" height="28" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:96px;height:28px;justify-content:center;color:#0f172a;font-size:10.5px"><span>$q = \\tfrac{p}{3} + 4$</span></div></foreignObject>
  <rect x="230" y="217" width="96" height="30" rx="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <foreignObject x="230" y="218" width="96" height="28" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:96px;height:28px;justify-content:center;color:#0f172a;font-size:10.5px"><span>$q = 2p - 5$</span></div></foreignObject>
  <polyline points="62,247 62,258 170,258 170,264" fill="none" stroke="#0f172a" marker-end="url(#fa-pk-q19)"/>
  <polyline points="278,247 278,258 170,258" fill="none" stroke="#0f172a"/>
  <rect x="120" y="266" width="100" height="24" rx="5" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.2"/>
  <foreignObject x="120" y="267" width="100" height="22" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:100px;height:22px;justify-content:center;color:#1e3a8a;font-size:11px;font-weight:700"><span>Output $q$</span></div></foreignObject>
</svg>`;

const PK_STIM_1_TEXT = `Grafik $y = f(x)$ berupa parabola yang terbuka ke atas. Parabola menyinggung garis $y = 1$ di titik puncak $V$. Garis $y = 10$ memotong parabola di titik $A$ dan $B$. Sumbu simetri parabola adalah $x = 2$ dan panjang $AB = 6$ satuan.\n\n${SVG_PK_STIMULUS1}`;

const PK_STIM_2_TEXT = `$ABCD$ adalah trapesium sama kaki dengan $AB \\parallel CD$, $AB = 18$, $CD = 8$, serta $AD = BC = 13$. Diagonal $AC$ dan $BD$ berpotongan di $O$. Sebuah lingkaran menyinggung keempat sisi trapesium dan berpusat di $I$.\n\n${SVG_PK_STIMULUS2}`;

export const PK_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "ISIAN_SINGKAT",
    prompt: "Diketahui $x \\ne 0$ dan\n$$2^x + 2^{-x} = 3.$$\nNilai\n$$8^x + 8^{-x}$$\nadalah .... *(isi bilangan bulat)*",
    options: [],
    answerKey: "18",
    explanation:
      "Gunakan identitas $a^3 + b^3 = (a+b)^3 - 3ab(a+b)$ dengan $a = 2^x$ dan $b = 2^{-x}$ (sehingga $ab = 1$): $8^x + 8^{-x} = (2^x + 2^{-x})^3 - 3(2^x + 2^{-x}) = 3^3 - 3(3) = 27 - 9 = 18$.",
  },
  {
    orderIndex: 2,
    type: "ISIAN_SINGKAT",
    prompt:
      "Bilangan $2^a, 2^b, 2^c$ merupakan tiga suku berurutan suatu barisan geometri, dengan $a < b < c$ bilangan bulat positif. Jika\n$$2^a + 2^b + 2^c = 84,$$\nnilai $a + b + c$ adalah .... *(isi bilangan bulat)*",
    options: [],
    answerKey: "12",
    explanation:
      "Karena $2^a, 2^b, 2^c$ membentuk barisan geometri, selisih pangkatnya sama: $b - a = c - b = d > 0$. Faktorkan: $2^a(1 + 2^d + 2^{2d}) = 84 = 4 \\times 21 = 2^2(1 + 4 + 16)$. Diperoleh $a = 2$ dan $d = 2$, sehingga $b = 4, c = 6$. Maka $a + b + c = 2 + 4 + 6 = 12$.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 3–5",
    stimulus: PK_STIM_1_TEXT,
    prompt: "Garis yang melalui $A$ dan $V$ memotong sumbu-$x$ di titik $(t, 0)$. Nilai $t$ adalah ....",
    options: ["$\\frac{7}{3}$", "$2$", "$\\frac{5}{2}$", "$3$", "$\\frac{10}{3}$"],
    answerKey: "A",
    explanation:
      "Puncak $V(2,1)$ dan $AB=6$ simetris terhadap $x=2$, sehingga $A(-1,10)$ dan $B(5,10)$. Garis melalui $A(-1,10)$ dan $V(2,1)$ bergradien $m = \\frac{1-10}{2-(-1)} = -3$, persamaannya $y - 1 = -3(x - 2)$. Saat $y = 0$: $-1 = -3(t - 2) \\Rightarrow t = 2 + \\frac{1}{3} = \\frac{7}{3}$.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 3–5",
    stimulus: PK_STIM_1_TEXT,
    prompt:
      "Titik $O$ adalah titik asal koordinat. Manakah hubungan yang benar antara kuantitas $P$ dan $Q$ berikut?\n\n| $P$ | $Q$ |\n|---|---|\n| Luas $\\triangle OAV$ | $\\frac{21}{2}$ |",
    options: ["$P > Q$", "$P < Q$", "$P = Q$", "Hubungan $P$ dan $Q$ tidak dapat ditentukan"],
    answerKey: "C",
    explanation:
      "Dengan $O(0,0), A(-1,10), V(2,1)$, luas $\\triangle OAV = \\frac{1}{2}|(-1)(1) - (10)(2)| = \\frac{1}{2}|-21| = \\frac{21}{2}$. Maka $P = Q$.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 3–5",
    stimulus: PK_STIM_1_TEXT,
    prompt:
      "Perhatikan pernyataan berikut.\n(1) $f(0) = 5$.\n(2) Persamaan $f(x) = 5$ mempunyai dua solusi real yang jumlahnya 4.\n(3) Untuk setiap $-1 < x < 5$, berlaku $f(x) < 10$.\n(4) Persamaan $f(x) = 2x - 4$ mempunyai tepat satu solusi real.\n\nBanyak pernyataan yang benar adalah ....",
    options: ["0", "1", "2", "3", "4"],
    answerKey: "E",
    explanation:
      "Persamaan parabola $f(x) = a(x-2)^2 + 1$; karena melalui $(5,10) \\Rightarrow a = 1$, jadi $f(x) = (x-2)^2 + 1$.\n(1) $f(0) = 4 + 1 = 5$ (Benar).\n(2) $(x-2)^2+1=5 \\Rightarrow x = 0$ atau $x = 4$, jumlah $= 4$ (Benar).\n(3) Untuk $-1 < x < 5$, $|x-2| < 3 \\Rightarrow f(x) < 10$ (Benar).\n(4) $(x-2)^2 + 1 = 2x - 4 \\Rightarrow x^2 - 6x + 9 = (x-3)^2 = 0$, tepat 1 solusi (Benar).\nSemua 4 pernyataan benar.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    prompt:
      "Fungsi linear $f(x) = ax + b$ dengan $a \\ne 0$ merupakan fungsi bijektif. Berapakah nilai $f^{-1}(7)$?\n\nPutuskan apakah pernyataan (1) dan (2) berikut cukup untuk menjawab pertanyaan tersebut.\n(1) $f(1) = 3$.\n(2) $f(f(1)) = 7$.",
    options: [
      "Pernyataan (1) SAJA cukup, tetapi pernyataan (2) SAJA tidak cukup.",
      "Pernyataan (2) SAJA cukup, tetapi pernyataan (1) SAJA tidak cukup.",
      "DUA pernyataan BERSAMA-SAMA cukup, tetapi SATU pernyataan SAJA tidak cukup.",
      "Pernyataan (1) SAJA cukup dan pernyataan (2) SAJA cukup.",
      "Pernyataan (1) dan pernyataan (2) tidak cukup.",
    ],
    answerKey: "C",
    explanation:
      "Dari (1) saja: $a+b=3$ tidak cukup menentukan $f^{-1}(7)$. Dari (2) saja: $f(f(1))=7 \\Rightarrow f^{-1}(7) = f(1)$, namun nilai $f(1)$ tidak diketahui. Jika (1) dan (2) digabung: $f(f(1))=7$ dengan $f(1)=3$ memberi $f(3)=7$, sehingga $f^{-1}(7) = 3$.",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    prompt:
      "Diberikan fungsi\n$$f(x) = \\frac{x - 1}{x}, \\quad x \\ne 0.$$\nNotasi $f^{(n)}$ menyatakan komposisi $f$ sebanyak $n$ kali. Nilai\n$$f^{(2027)}(2)$$\nadalah ....",
    options: ["$-2$", "$-\\frac{1}{2}$", "$\\frac{1}{2}$", "$-1$", "$2$"],
    answerKey: "D",
    explanation:
      "$f^{(1)}(2) = \\frac{1}{2}$, $f^{(2)}(2) = f(\\frac{1}{2}) = -1$, $f^{(3)}(2) = f(-1) = 2$ (berulang periodik tiap 3 langkah). Karena $2027 = 3 \\times 675 + 2$, maka $f^{(2027)}(2) = f^{(2)}(2) = -1$.",
  },
  {
    orderIndex: 8,
    type: "ISIAN_SINGKAT",
    stimulusTitle: "Stimulus 2 untuk nomor 8–10",
    stimulus: PK_STIM_2_TEXT,
    prompt: "Nilai dari $13 \\times OI$ adalah .... *(isi bilangan bulat positif)*",
    options: [],
    answerKey: "30",
    explanation:
      "Tinggi trapesium $h = \\sqrt{13^2 - ((18-8)/2)^2} = \\sqrt{169-25} = 12$. Pusat lingkaran singgung $I$ berada di tengah ketinggian ($y_I = 6$ dari $AB$). Karena $\\triangle AOB \\sim \\triangle COD$ dengan rasio $18:8 = 9:4$, jarak $O$ dari $AB$ adalah $y_O = \\frac{9}{9+4} \\cdot 12 = \\frac{108}{13}$. Karena keduanya berada di sumbu simetri, $OI = |\\frac{108}{13} - 6| = \\frac{30}{13}$, sehingga $13 \\times OI = 30$.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 2 untuk nomor 8–10",
    stimulus: PK_STIM_2_TEXT,
    prompt:
      "Perhatikan pernyataan berikut.\n(1) Tinggi trapesium $ABCD$ adalah $12$.\n(2) Luas trapesium $ABCD$ adalah $160$.\n(3) Panjang diagonal $AC$ adalah $17$.\n(4) $AO : OC = 4 : 9$.\n\nBanyak pernyataan yang benar adalah ....",
    options: ["0", "1", "2", "3", "4"],
    answerKey: "B",
    explanation:
      "(1) Tinggi $= \\sqrt{13^2 - 5^2} = 12$ (**Benar**).\n(2) Luas $= \\frac{18+8}{2} \\times 12 = 156 \\ne 160$ (Salah).\n(3) Proyeksi $C$ pada $AB$ berjarak $13$ dari $A$, maka $AC = \\sqrt{13^2 + 12^2} = \\sqrt{313} \\ne 17$ (Salah).\n(4) $AO : OC = AB : CD = 18 : 8 = 9 : 4 \\ne 4 : 9$ (Salah).\nHanya **1** pernyataan yang benar.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 2 untuk nomor 8–10",
    stimulus: PK_STIM_2_TEXT,
    prompt:
      "Manakah hubungan yang benar antara kuantitas $P$ dan $Q$ berikut?\n\n| $P$ | $Q$ |\n|---|---|\n| Luas $\\triangle AOB$ | $75$ |",
    options: ["$P > Q$", "$P < Q$", "$P = Q$", "Hubungan $P$ dan $Q$ tidak dapat ditentukan"],
    answerKey: "B",
    explanation:
      "Alas $AB = 18$ dan tinggi $O$ terhadap $AB$ adalah $y_O = \\frac{108}{13}$. Jadi $P = \\frac{1}{2} \\times 18 \\times \\frac{108}{13} = \\frac{972}{13} \\approx 74{,}77 < 75 = Q$.",
  },
  {
    orderIndex: 11,
    type: "PILIHAN_GANDA",
    prompt:
      `Sebuah bola berada tepat di dalam sebuah kubus dan menyinggung keenam sisi kubus. Diagonal ruang kubus adalah $6\\sqrt{3}\\text{ cm}$.\n\n${SVG_PK_Q11}\n\nManakah hubungan yang benar antara kuantitas $P$ dan $Q$ berikut?\n\n| $P$ | $Q$ |\n|---|---|\n| Volume bola | $\\frac{1}{2}$ volume kubus |`,
    options: ["$P > Q$", "$P < Q$", "$P = Q$", "Hubungan $P$ dan $Q$ tidak dapat ditentukan"],
    answerKey: "A",
    explanation:
      "Rusuk kubus $s = 6\\text{ cm}$, volume kubus $= 6^3 = 216\\text{ cm}^3$, sehingga $Q = \\frac{1}{2}(216) = 108$. Bola dalam kubus memiliki $r = 3\\text{ cm}$, maka $P = \\frac{4}{3}\\pi(3)^3 = 36\\pi \\approx 113{,}1 > 108$. Jadi $P > Q$.",
  },
  {
    orderIndex: 12,
    type: "PILIHAN_GANDA",
    prompt:
      `Pada segitiga $ABC$ diketahui $AB = 10$, $AC = 6$, luas $\\triangle ABC = 15\\sqrt{3}$, dan $BC > 12$.\n\n${SVG_PK_Q12}\n\nPerhatikan pernyataan berikut.\n(1) $\\cos A = -\\frac{1}{2}$.\n(2) $BC = 14$.\n(3) Jari-jari lingkaran dalam segitiga adalah $\\sqrt{3}$.\n(4) Jari-jari lingkaran luar segitiga adalah $\\frac{14\\sqrt{3}}{3}$.\n\nBanyak pernyataan yang benar adalah ....`,
    options: ["0", "1", "2", "3", "4"],
    answerKey: "E",
    explanation:
      "Luas $= \\frac{1}{2}(10)(6)\\sin A = 15\\sqrt{3} \\Rightarrow \\sin A = \\frac{\\sqrt{3}}{2}$. Karena $BC > 12$, sudut $A$ tumpul ($120^\\circ$), jadi $\\cos A = -\\frac{1}{2}$ (1 Benar). Aturan kosinus: $BC^2 = 100+36-2(60)(-\\frac{1}{2}) = 196 \\Rightarrow BC = 14$ (2 Benar). Semiperimeter $s = \\frac{10+6+14}{2} = 15$, jadi $r = L/s = \\sqrt{3}$ (3 Benar). Jari-jari luar $R = \\frac{BC}{2\\sin A} = \\frac{14}{\\sqrt{3}} = \\frac{14\\sqrt{3}}{3}$ (4 Benar).",
  },
  {
    orderIndex: 13,
    type: "ISIAN_SINGKAT",
    prompt:
      "Diketahui $0 < \\alpha, \\beta < 90^\\circ$ serta\n$$\\tan\\alpha + \\tan\\beta = 3, \\qquad \\tan\\alpha\\tan\\beta = \\frac{1}{2}.$$\nNilai dari\n$$37(\\sin 2\\alpha + \\sin 2\\beta)$$\nadalah .... *(isi bilangan bulat positif)*",
    options: [],
    answerKey: "36",
    explanation:
      "Misalkan $u = \\tan\\alpha, v = \\tan\\beta$. Gunakan $\\sin 2\\theta = \\frac{2\\tan\\theta}{1+\\tan^2\\theta}$: $\\frac{2u}{1+u^2} + \\frac{2v}{1+v^2} = \\frac{2[(u+v) + uv(u+v)]}{1 + (u^2+v^2) + u^2v^2}$. Dengan $u+v=3$, $uv=1/2$, $u^2+v^2 = 9-1 = 8$, pembilang $= 2(3 + \\frac{3}{2}) = 9$ dan penyebut $= 1 + 8 + \\frac{1}{4} = \\frac{37}{4}$. Jadi $\\sin 2\\alpha + \\sin 2\\beta = \\frac{36}{37}$, sehingga $37(\\sin 2\\alpha + \\sin 2\\beta) = 36$.",
  },
  {
    orderIndex: 14,
    type: "PILIHAN_GANDA",
    prompt:
      `Pada gambar berikut, dari titik $T$ di luar lingkaran ditarik dua garis singgung $TA$ dan $TB$. Lingkaran berpusat di $O$.\n\n${SVG_PK_Q14}\n\nBerapakah besar $\\angle ATB$?\n(1) $OT = 2\\,OA$.\n(2) $TA = 5\\sqrt{3}$.\n\nPutuskan apakah pernyataan (1) dan (2) berikut cukup untuk menjawab pertanyaan tersebut.`,
    options: [
      "Pernyataan (1) SAJA cukup, tetapi pernyataan (2) SAJA tidak cukup.",
      "Pernyataan (2) SAJA cukup, tetapi pernyataan (1) SAJA tidak cukup.",
      "DUA pernyataan BERSAMA-SAMA cukup, tetapi SATU pernyataan SAJA tidak cukup.",
      "Pernyataan (1) SAJA cukup dan pernyataan (2) SAJA cukup.",
      "Pernyataan (1) dan pernyataan (2) tidak cukup.",
    ],
    answerKey: "A",
    explanation:
      "Karena $OA \\perp TA$, dari (1) $OT = 2\\,OA$ diperoleh $\\sin(\\angle ATO) = \\frac{OA}{OT} = \\frac{1}{2} \\Rightarrow \\angle ATO = 30^\\circ$, sehingga $\\angle ATB = 60^\\circ$ (cukup). Pernyataan (2) hanya memberi panjang $TA$ tanpa jari-jari $OA$ (tidak cukup).",
  },
  {
    orderIndex: 15,
    type: "PILIHAN_GANDA",
    prompt:
      `Diberikan fungsi\n$$F(x) = 2^x + 2^{-x}.$$\nGaris $y = \\frac{5}{2}$ memotong grafik $F$ pada absis $p$ dan $q$, dengan $p < q$.\n\n${SVG_PK_Q15}\n\nPerhatikan pernyataan berikut.\n(1) $p + q = 1$.\n(2) $pq = 1$.\n(3) $F(p + q) = 3$.\n(4) $F(3q) = 8$.\n\nBanyak pernyataan yang benar adalah ....`,
    options: ["0", "1", "2", "3", "4"],
    answerKey: "A",
    explanation:
      "$2^x + 2^{-x} = \\frac{5}{2} \\Rightarrow 2^x = \\frac{1}{2}$ atau $2$, maka $p = -1$ dan $q = 1$.\n(1) $p+q = 0 \\ne 1$ (Salah).\n(2) $pq = -1 \\ne 1$ (Salah).\n(3) $F(0) = 1 + 1 = 2 \\ne 3$ (Salah).\n(4) $F(3) = 8 + \\frac{1}{8} = 8{,}125 \\ne 8$ (Salah).\nJadi **0** pernyataan benar.",
  },
  {
    orderIndex: 16,
    type: "BENAR_SALAH",
    prompt:
      "Enam bilangan bulat positif $4, 7, 8, 11, a, b$ dengan $a \\le b$ mempunyai rata-rata $10$, median $9{,}5$, dan jangkauan $15$.\n\nBeri tanda centang pada kolom **BENAR** atau **SALAH** untuk setiap pernyataan berikut.",
    options: [
      { id: "st1", text: "Modus data tersebut adalah $11$." },
      { id: "st2", text: "Jika data terbesar dihapus, rata-rata lima data sisanya adalah $8{,}2$." },
      { id: "st3", text: "Jika data $4$ diganti menjadi $10$, median data menjadi $11$." },
      { id: "st4", text: "Jika satu data bernilai $7$ ditambahkan, rata-rata data menjadi $9{,}5$." },
    ],
    answerKey: ["BENAR", "BENAR", "SALAH", "SALAH"],
    explanation:
      "Total $= 6 \\times 10 = 60 \\Rightarrow a + b = 30$. Agar jangkauan $15$ (min $= 4$), maksimum $b = 4 + 15 = 19$ sehingga $a = 11$. Data terurut: $4, 7, 8, 11, 11, 19$ (median $(8+11)/2 = 9{,}5$, tepat!).\n1. Modus $= 11$ (Benar).\n2. $(60-19)/5 = 41/5 = 8{,}2$ (Benar).\n3. Data baru $7,8,10,11,11,19 \\Rightarrow$ median $(10+11)/2 = 10{,}5 \\ne 11$ (Salah).\n4. $(60+7)/7 = 67/7 \\approx 9{,}57 \\ne 9{,}5$ (Salah).",
  },
  {
    orderIndex: 17,
    type: "PILIHAN_GANDA",
    prompt:
      "Diberikan sistem persamaan\n$$\\begin{cases} x + y + z = 4, \\\\ x + ay + z = 6, \\\\ x + y + bz = 7. \\end{cases}$$\nApakah sistem tersebut mempunyai tepat satu solusi?\n(1) $a + b = 1$.\n(2) $ab \\le 0$.",
    options: [
      "Pernyataan (1) SAJA cukup, tetapi pernyataan (2) SAJA tidak cukup.",
      "Pernyataan (2) SAJA cukup, tetapi pernyataan (1) SAJA tidak cukup.",
      "DUA pernyataan BERSAMA-SAMA cukup, tetapi SATU pernyataan SAJA tidak cukup.",
      "Pernyataan (1) SAJA cukup dan pernyataan (2) SAJA cukup.",
      "Pernyataan (1) dan pernyataan (2) tidak cukup.",
    ],
    answerKey: "E",
    explanation:
      "Kurangkan persamaan pertama dari kedua dan ketiga: $(a-1)y = 2$ dan $(b-1)z = 3$. Solusi tunggal ada jika dan hanya jika $a \\ne 1$ dan $b \\ne 1$. Pasangan $(a,b) = (1, 0)$ memenuhi syarat (1) $a+b=1$ sekaligus syarat (2) $ab=0 \\le 0$ (tidak punya solusi), sedangkan $(a,b) = (2,-1)$ juga memenuhi keduanya (punya solusi tunggal). Maka (1) dan (2) **tidak cukup**.",
  },
  {
    orderIndex: 18,
    type: "PILIHAN_GANDA",
    prompt:
      "Bilangan lima angka dibentuk dari digit $0, 1, 2, 3, 4, 5, 6, 7$ tanpa pengulangan. Bilangan tersebut harus lebih besar dari $40.000$, habis dibagi $6$, dan tepat dua dari lima digit yang digunakan merupakan digit genap.\n\nBanyak bilangan yang dapat dibentuk adalah ....",
    options: ["144", "168", "180", "192", "216"],
    answerKey: "D",
    explanation:
      "Digit awal $\\ge 4$ (dari $4,5,6,7$), digit akhir genap ($0,2,4,6$), tepat 2 digit genap (3 digit ganjil), dan jumlah 5 digit habis dibagi 3. Dari seluruh kombinasi yang memenuhi syarat tersebut, terdapat tepat **192** bilangan.",
  },
  {
    orderIndex: 19,
    type: "PILIHAN_GANDA",
    prompt:
      `Suatu bilangan bulat positif $n \\le 30$ diproses menurut diagram berikut.\n\n${SVG_PK_Q19}\n\nJika output yang dihasilkan adalah $q = 9$, jumlah seluruh nilai $n$ yang mungkin adalah ....`,
    options: ["24", "28", "30", "32", "36"],
    answerKey: "D",
    explanation:
      "Untuk $q=9$: jika $p$ habis dibagi $3$, $p/3 + 4 = 9 \\Rightarrow p = 15$; jika tidak, $2p - 5 = 9 \\Rightarrow p = 7$. Menelusuri ke atas: jika $n$ genap, $n/2 + 3 = 15 \\Rightarrow n = 24$ atau $n/2 + 3 = 7 \\Rightarrow n = 8$ (keduanya genap $\\le 30$). Jika $n$ ganjil, $2n-1=15 \\Rightarrow n=8$ (bukan ganjil) dan $2n-1=7 \\Rightarrow n=4$ (bukan ganjil). Jadi $n \\in \\{8, 24\\}$, jumlahnya $= 8 + 24 = 32$.",
  },
  {
    orderIndex: 20,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah kotak berisi $6$ bola merah, $5$ bola biru, dan $4$ bola kuning. Dua bola diambil sekaligus secara acak. Diketahui kedua bola yang terambil memiliki warna berbeda.\n\nPeluang tepat satu dari kedua bola tersebut berwarna biru adalah ....",
    options: ["$\\frac{20}{37}$", "$\\frac{25}{37}$", "$\\frac{30}{37}$", "$\\frac{1}{2}$", "$\\frac{5}{7}$"],
    answerKey: "B",
    explanation:
      "Banyak cara terambil 2 bola berbeda warna $= (6\\times 5) + (6\\times 4) + (5\\times 4) = 30 + 24 + 20 = 74$. Yang memiliki tepat satu bola biru $= (6\\times 5) + (5\\times 4) = 50$. Peluang bersyarat $= \\frac{50}{74} = \\frac{25}{37}$.",
  },
];

