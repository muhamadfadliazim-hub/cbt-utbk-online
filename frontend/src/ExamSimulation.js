import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, Lock } from 'lucide-react';

const ExamSimulation = ({ examData, onSubmit }) => {
  // --- STATE ---
  const savedAnswers = JSON.parse(localStorage.getItem('saved_answers')) || {};
  const savedTimer = localStorage.getItem('saved_timer');
  
  // Hitung durasi (dalam detik)
  const initialTime = savedTimer ? parseInt(savedTimer, 10) : (examData?.duration || 30) * 60;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(savedAnswers);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
    localStorage.setItem('saved_answers', JSON.stringify(answers));
  }, [answers]);

  // --- TIMER & AUTO SUBMIT ---
  useEffect(() => {
    if (!examData || isSubmitting) return;

    if (timeLeft <= 0) {
        setIsSubmitting(true);
        alert("WAKTU HABIS! Jawaban Anda sedang dikirim ke server...");
        onSubmit(answersRef.current);
        return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newVal = prev - 1;
        localStorage.setItem('saved_timer', newVal);
        return newVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examData, onSubmit, isSubmitting]);

  // --- PENGAMAN DATA KOSONG ---
  if (!examData) return <div className="p-10 text-center">Memuat Data Ujian...</div>;

  if (!examData.questions || examData.questions.length === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <AlertTriangle className="mx-auto text-orange-500 mb-4" size={48}/>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Soal Belum Tersedia</h2>
                <p className="text-gray-500 mb-6">Admin belum mengupload soal untuk subtes ini.</p>
            </div>
        </div>
      );
  }

  const questions = examData.questions;
  const question = questions[currentIdx];
  
  if (!question) return <div>Loading question...</div>;

  const hasReading = !!question.reading_material;

  // Handler Jawaban
  const handleAnswer = (val, subId = null) => {
    if (timeLeft <= 0) return; 

    if (question.type === 'table_boolean') {
        const curr = answers[question.id] || {};
        setAnswers({ ...answers, [question.id]: { ...curr, [subId]: val } });
    } else if (question.type === 'complex') {
        const curr = answers[question.id] || [];
        const newAns = curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val];
        setAnswers({ ...answers, [question.id]: newAns });
    } else {
        setAnswers({ ...answers, [question.id]: val });
    }
  };

  const isAnswered = (id) => {
      const val = answers[id];
      if(!val) return false;
      if(typeof val === 'object' && !Array.isArray(val)) return Object.keys(val).length > 0;
      if(Array.isArray(val)) return val.length > 0;
      return true;
  };

  const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans select-none text-left">
      {/* --- HEADER (JUDUL, TIMER, NAVIGASI NO SOAL) --- */}
      <header className="bg-indigo-900 text-white p-3 shadow-md z-50 flex flex-col gap-3">
        {/* Baris 1: Judul & Timer */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="font-bold text-lg leading-tight">{examData.title}</h1>
                <div className="flex items-center gap-1 text-[10px] text-indigo-200 mt-0.5 opacity-80">
                    <Lock size={10}/> Mode Terkunci
                </div>
            </div>
            <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-4 py-2 rounded-lg border-2 ${timeLeft < 300 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-indigo-800 border-indigo-600'}`}>
              <Clock size={24} />
              {formatTime(timeLeft)}
            </div>
        </div>

        {/* Baris 2: Navigasi Nomor Soal (DIPINDAHKAN KE SINI) */}
        <div className="bg-indigo-800/50 p-2 rounded-lg overflow-x-auto scrollbar-hide flex gap-2">
            {questions.map((q, i) => (
                <button key={i} onClick={()=>setCurrentIdx(i)} 
                    className={`w-9 h-9 rounded-md text-sm font-bold shrink-0 transition-all ${currentIdx===i ? 'bg-white text-indigo-900 shadow-md transform scale-110': isAnswered(q.id) ? 'bg-indigo-400 text-white border border-indigo-300' : 'bg-indigo-700/50 text-indigo-200 hover:bg-indigo-600 hover:text-white border border-indigo-800'}`}>
                    {i+1}
                </button>
            ))}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex flex-1 overflow-hidden relative">
        {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                <h2 className="text-2xl font-bold text-indigo-900">Waktu Habis!</h2>
                <p className="text-gray-600">Sedang mengirim jawaban...</p>
            </div>
        )}

        {/* PANEL KIRI: WACANA & GAMBAR (Jika Ada) */}
        {hasReading && (
            <div className="w-1/2 p-6 overflow-y-auto border-r bg-white scrollbar-thin">
                <div className="prose max-w-none text-gray-800 text-sm leading-relaxed">
                    <h3 className="font-bold text-gray-500 mb-4 uppercase text-xs border-b pb-2 tracking-wide">Wacana / Literasi</h3>
                    
                    {/* TEKS WACANA */}
                    <div style={{whiteSpace: 'pre-wrap'}}>{question.reading_material}</div>
                    
                    {/* GAMBAR WACANA (Dipindah ke Bawah Teks) */}
                    {question.image_url && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                             <img src={question.image_url} alt="Ilustrasi Soal" className="max-w-full h-auto rounded-lg border shadow-sm mx-auto"/>
                             <p className="text-center text-gray-500 text-xs mt-2 italic">Gambar terkait wacana di atas.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* PANEL KANAN: SOAL & OPSI */}
        <div className={`flex-1 flex flex-col ${hasReading ? 'w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
            <div className="flex-1 p-6 overflow-y-auto text-left">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                    {/* Header Soal */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <span className="font-bold text-indigo-600 text-lg">Soal No. {currentIdx+1}</span>
                        <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">{question.type.replace('_', ' ')}</span>
                    </div>

                    {/* Teks Soal */}
                    <div className="mb-8 text-lg text-gray-800 leading-relaxed">
                        {question.text.split(/(\$.*?\$)/).map((part, i) => 
                            part.startsWith('$') && part.endsWith('$') 
                            ? <InlineMath key={i} math={part.slice(1, -1)}/> 
                            : <span key={i}>{part}</span>
                        )}
                    </div>

                    {/* Pilihan Jawaban */}
                    <div className="space-y-3 text-left">
                        {question.type === 'short_answer' ? (
                            <input type="text" className="border-2 border-gray-300 p-4 rounded-lg w-full text-lg uppercase focus:border-indigo-500 outline-none transition" placeholder="Ketik jawaban singkat..." 
                                value={answers[question.id] || ''} onChange={(e)=>handleAnswer(e.target.value)}/>
                        ) : question.type === 'table_boolean' ? (
                            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left border-b font-bold text-gray-600">Pernyataan</th>
                                        <th className="p-3 text-center w-24 border-b font-bold text-green-700 bg-green-50">Benar</th>
                                        <th className="p-3 text-center w-24 border-b font-bold text-red-700 bg-red-50">Salah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {question.options.map(opt => (
                                        <tr key={opt.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3 border-r">{opt.label}</td>
                                            <td className="text-center border-r bg-green-50/20"><input type="radio" name={`r-${opt.id}`} className="w-5 h-5 accent-green-600 cursor-pointer" checked={(answers[question.id]||{})[opt.id]==='B'} onChange={()=>handleAnswer('B',opt.id)}/></td>
                                            <td className="text-center bg-red-50/20"><input type="radio" name={`r-${opt.id}`} className="w-5 h-5 accent-red-600 cursor-pointer" checked={(answers[question.id]||{})[opt.id]==='S'} onChange={()=>handleAnswer('S',opt.id)}/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            question.options.map(opt => {
                                const isComplex = question.type === 'complex';
                                const userVal = answers[question.id];
                                const active = isComplex ? Array.isArray(userVal) && userVal.includes(opt.id) : userVal === opt.id;
                                return (
                                    <div key={opt.id} onClick={()=>handleAnswer(opt.id)} 
                                        className={`p-4 border-2 rounded-xl cursor-pointer flex items-center transition-all duration-200 ${active ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.01]': 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}>
                                        <div className={`w-8 h-8 flex items-center justify-center mr-4 font-bold text-sm rounded-full transition-colors ${active?'bg-indigo-600 text-white':'bg-gray-200 text-gray-600'}`}>{opt.id}</div>
                                        <div className="text-sm font-medium text-gray-700 w-full">
                                            {opt.label.split(/(\$.*?\$)/).map((part, i) => part.startsWith('$') && part.endsWith('$') ? <InlineMath key={i} math={part.slice(1, -1)}/> : <span key={i}>{part}</span>)}
                                        </div>
                                        {isComplex && <div className={`w-5 h-5 border-2 rounded ml-auto flex items-center justify-center ${active ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>{active && <span className="text-white text-xs">✓</span>}</div>}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* --- FOOTER (NAVIGASI PREV/NEXT) --- */}
            <div className="bg-white border-t p-4 flex justify-center items-center gap-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <button disabled={currentIdx===0} onClick={()=>setCurrentIdx(c=>c-1)} className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 font-bold transition shadow-sm">
                    <ChevronLeft size={20}/> Sebelumnya
                </button>
                
                <button disabled={currentIdx===questions.length-1} onClick={()=>setCurrentIdx(c=>c+1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md font-bold flex items-center gap-2 transition disabled:opacity-50">
                    Selanjutnya <ChevronRight size={20}/>
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ExamSimulation;