import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { Clock, ChevronLeft, ChevronRight, Lock, Save } from 'lucide-react'; // Tambah Save

const ExamSimulation = ({ examData, onSubmit, onBack }) => {
  const savedAnswers = JSON.parse(localStorage.getItem('saved_answers')) || {};
  const savedTimer = localStorage.getItem('saved_timer');
  const initialTime = savedTimer ? parseInt(savedTimer, 10) : (examData?.duration || 30) * 60;
  
  // Ambil data user dari localStorage
  const userData = JSON.parse(localStorage.getItem('utbk_user')) || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(savedAnswers);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [fontSize, setFontSize] = useState(16);

  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
    localStorage.setItem('saved_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (!examData || isSubmitting) return;
    if (timeLeft <= 0) {
        setIsSubmitting(true);
        alert("WAKTU HABIS! Jawaban dikirim otomatis.");
        // Kirim jawaban saat waktu habis
        handleFinalSubmit(); 
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

  if (!examData) return <div className="p-10 text-center">Memuat Data Ujian...</div>;
  if (!examData.questions || examData.questions.length === 0) return <div className="p-10 text-center">Soal belum tersedia.</div>;

  const questions = examData.questions;
  const question = questions[currentIdx];
  const hasReading = !!question.reading_material;

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

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const handleFinalSubmit = () => {
      if(!window.confirm("Apakah Anda yakin ingin MENGAKHIRI ujian dan mengirim jawaban? Ujian tidak bisa diulang.")) return;
      setIsSubmitting(true);
      
      // KIRIM TOKEN BERSAMA JAWABAN
      const finalAnswers = {
          answers: answers,
          username: userData.username,
          token: userData.token // Mengirim token sesi
      };

      onSubmit(finalAnswers);
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans select-none text-left">
      {/* HEADER FIXED & STICKY DENGAN NAVIGASI */}
      <header className="bg-indigo-900 text-white p-3 flex flex-col md:flex-row justify-between items-center shadow-md z-50 sticky top-0">
        <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
            <div className="flex items-center gap-4">
                <h1 className="font-bold text-sm md:text-base">{examData.title}</h1>
                <div className="bg-indigo-800 px-3 py-1 rounded text-sm font-mono border border-indigo-600">
                    SOAL <span className="font-bold text-yellow-400">{currentIdx + 1}</span> / {questions.length}
                </div>
            </div>
            
            {/* TIMER & ZOOM */}
            <div className="flex items-center gap-4 ml-4">
                {hasReading && (
                    <div className="flex bg-indigo-800 rounded-lg overflow-hidden border border-indigo-600">
                        <button onClick={()=>setFontSize(s=>Math.max(12, s-2))} className="px-2 py-1 hover:bg-indigo-700 text-xs font-bold text-white">A-</button>
                        <button onClick={()=>setFontSize(s=>Math.min(24, s+2))} className="px-2 py-1 hover:bg-indigo-700 text-xs font-bold border-l border-indigo-600 text-white">A+</button>
                    </div>
                )}
                <div className={`flex items-center gap-2 font-mono text-xl font-bold px-3 py-1 rounded-lg border-2 ${timeLeft < 300 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-indigo-800 border-indigo-600'}`}>
                    <Clock size={20} /> {formatTime(timeLeft)}
                </div>
            </div>
        </div>

        {/* FITUR 1: NAVIGASI PINDAH KE ATAS */}
        <div className="flex overflow-x-auto gap-2 py-1 w-full md:w-auto md:justify-end">
            {questions.map((q, i) => (
                <button 
                    key={i} 
                    onClick={()=>setCurrentIdx(i)} 
                    className={`w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-all shadow-sm ${currentIdx===i ? 'bg-yellow-400 text-indigo-900 ring-2 ring-yellow-200': isAnswered(q.id) ? 'bg-indigo-500 text-white border border-indigo-200' : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}`}
                >
                    {i+1}
                </button>
            ))}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {isSubmitting && (<div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div><h2 className="text-2xl font-bold text-indigo-900">Waktu Habis!</h2><p className="text-gray-600">Sedang mengirim jawaban...</p></div>)}
        
        {/* WACANA (KIRI) */}
        {hasReading && (
            <div className="w-1/2 p-6 overflow-y-auto border-r bg-white scrollbar-thin">
                <div className="prose max-w-none text-gray-800 leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                    <h3 className="font-bold text-gray-500 mb-4 uppercase text-xs border-b pb-2 tracking-wide text-left">
                        {question.reading_label || "Wacana"} 
                    </h3>
                    {question.citation && (
                        <p className="text-gray-400 text-xs italic mb-4 mt-[-8px] text-right">
                            Sumber: {question.citation}
                        </p>
                    )}
                    <div className="text-justify font-serif leading-8" style={{whiteSpace: 'pre-wrap'}}>{question.reading_material}</div>
                </div>
            </div>
        )}

        {/* SOAL (KANAN) */}
        <div className={`flex-1 flex flex-col ${hasReading ? 'w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
            <div className="flex-1 p-6 overflow-y-auto text-left">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                    <div className="mb-8 text-lg text-gray-800 leading-relaxed text-left">
                        {/* GAMBAR DULU, BARU TEKS SOAL (POSISI GAMBAR SUDAH DIATAS TEKS SOAL) */}
                        {question.image_url && <img src={question.image_url} alt="Soal" className="max-w-full h-auto mb-6 rounded-lg border shadow-sm mx-auto block"/>}
                        <div>{question.text.split(/(\$.*?\$)/).map((part, i) => part.startsWith('$') && part.endsWith('$') ? <InlineMath key={i} math={part.slice(1, -1)}/> : <span key={i}>{part}</span>)}</div>
                    </div>

                    <div className="space-y-3 text-left">
                        {question.type === 'short_answer' ? (
                            <input type="text" className="border-2 border-gray-300 p-4 rounded-lg w-full text-lg uppercase focus:border-indigo-500 outline-none transition" placeholder="Ketik jawaban singkat..." value={answers[question.id] || ''} onChange={(e)=>handleAnswer(e.target.value)}/>
                        ) : question.type === 'table_boolean' ? (
                            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50"><tr><th className="p-3 text-left border-b font-bold text-gray-600">Pernyataan</th><th className="p-3 text-center w-24 border-b font-bold text-green-700 bg-green-50">{question.label_true || "Benar"}</th><th className="p-3 text-center w-24 border-b font-bold text-red-700 bg-red-50">{question.label_false || "Salah"}</th></tr></thead>
                                <tbody>{question.options.map(opt => (<tr key={opt.id} className="border-b last:border-0 hover:bg-gray-50"><td className="p-3 border-r">{opt.label}</td><td className="text-center border-r bg-green-50/20"><input type="radio" name={`r-${opt.id}`} className="w-5 h-5 accent-green-600 cursor-pointer" checked={(answers[question.id]||{})[opt.id]==='B'} onChange={()=>handleAnswer('B',opt.id)}/></td><td className="text-center bg-red-50/20"><input type="radio" name={`r-${opt.id}`} className="w-5 h-5 accent-red-600 cursor-pointer" checked={(answers[question.id]||{})[opt.id]==='S'} onChange={()=>handleAnswer('S',opt.id)}/></td></tr>))}</tbody>
                            </table>
                        ) : (
                            question.options.map(opt => {
                                const isComplex = question.type === 'complex';
                                const userVal = answers[question.id];
                                const active = isComplex ? Array.isArray(userVal) && userVal.includes(opt.id) : userVal === opt.id;
                                return (<div key={opt.id} onClick={()=>handleAnswer(opt.id)} className={`p-4 border-2 rounded-xl cursor-pointer flex items-center transition-all duration-200 ${active ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.01]': 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}><div className={`w-8 h-8 flex items-center justify-center mr-4 font-bold text-sm rounded-full transition-colors ${active?'bg-indigo-600 text-white':'bg-gray-200 text-gray-600'}`}>{opt.id}</div><div className="text-sm font-medium text-gray-700 w-full">{opt.label.split(/(\$.*?\$)/).map((part, i) => part.startsWith('$') && part.endsWith('$') ? <InlineMath key={i} math={part.slice(1, -1)}/> : <span key={i}>{part}</span>)}</div>{isComplex && <div className={`w-5 h-5 border-2 rounded ml-auto flex items-center justify-center ${active ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>{active && <span className="text-white text-xs">✓</span>}</div>}</div>)
                            })
                        )}
                    </div>
                </div>
            </div>
            
            {/* FOOTER: Tombol Navigasi Sebelumnya/Berikutnya dan Submit */}
            <div className="bg-white border-t p-4 flex justify-between items-center shadow-lg z-40">
                <button disabled={currentIdx===0} onClick={()=>setCurrentIdx(c=>c-1)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 font-bold transition shadow-sm"><ChevronLeft size={18}/> Sebelumnya</button>
                <button disabled={currentIdx!==questions.length-1 || isSubmitting} onClick={handleFinalSubmit} className={`px-5 py-2.5 rounded-lg shadow-md font-bold transition flex items-center gap-2 ${currentIdx===questions.length-1 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}>
                    <Save size={18}/> {isSubmitting ? 'Mengirim...' : 'AKHIRI & SUBMIT'}
                </button>
                <button disabled={currentIdx===questions.length-1} onClick={()=>setCurrentIdx(c=>c+1)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-bold flex items-center gap-2 transition disabled:opacity-50">Berikutnya <ChevronRight size={18}/></button>
            </div>
        </div>
      </main>
    </div>
  );
};
export default ExamSimulation;