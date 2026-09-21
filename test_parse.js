const fs = require('fs');
const bulkText = fs.readFileSync('soal_format_baru.txt', 'utf8');
const blocks = bulkText.split(/\n\s*---+\s*\n/g).filter(b => b.trim());

const parsedBulkRecords = blocks.map((block) => {
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
       text: line.replace(/^\s*\[(B|S)\]\s+/i, "").trim(),
       answer: isBenar ? "BENAR" : "SALAH"
     };
  });
  
  const keyLine = (rawLines.find((line) => /^KUNCI\s*:/i.test(line))?.replace(/^KUNCI\s*:\s*/i, "") ?? "").trim();
  const keyLetters = keyLine.split(/[,;\s]+/).filter(Boolean);
  const keyValues = keyLetters.map((letter) => parsedOptions[letter.toUpperCase().charCodeAt(0) - 65]).filter(Boolean);
  
  if (!questionText) return null;

  let type = "PILIHAN_GANDA";
  let answerKey = "";
  
  if (statements.length > 0) {
    type = "BENAR_SALAH";
    answerKey = statements.map(s => s.answer);
  } else if (parsedOptions.length > 0) {
    type = keyValues.length > 1 ? "PG_KOMPLEKS" : "PILIHAN_GANDA";
    answerKey = keyValues.length > 1 ? keyValues : (keyValues[0] || "");
    if (!answerKey || answerKey.length === 0) {
        console.log("Failed due to invalid PG answer key", { keyValues, keyLine, parsedOptions });
        return null;
    }
  } else {
    if (!keyLine) return null; // Isian but no key
    type = "ISIAN_SINGKAT";
    answerKey = keyLine;
  }

  return { type, content: questionText, options: parsedOptions, statements, answerKey };
}).filter(Boolean);

console.log("Successfully parsed:", parsedBulkRecords.length);
