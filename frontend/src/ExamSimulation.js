import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Grid, Save, Type } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const ExamSimulation = ({ examData, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // FIX 1: SIMPAN JAWABAN DI LOCALSTORAGE AGAR TIDAK HILANG SAAT REFRESH
  const [answers, setAnswers] = useState(() => {
      try { return JSON.parse(localStorage.getItem(`ans_${examData?.id}`)) || {}; } 
      catch { return {}; }
  });

  const [timeLeft, setTimeLeft] = useState(() => {
      const saved = localStorage.getItem(`timer_${examData?.id}`);
      if (saved) return parseInt(saved);
      return (examData?.duration || 60) * 60; 
  });

  useEffect(() => {
    if (!examData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { 
            clearInterval(timer); 
            // AUTO SUBMIT
            handleFinalSubmit();
            return 0; 
        }
        localStorage.setItem(`timer_${examData.id}`, prev - 1);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examData]);

  const handleAnswer = (qid, val, type) => {
      setAnswers(prev => {
          let newAns;
          if (type === 'complex') { 
              const current = prev[qid] || [];
              if (current.includes(val)) newAns = { ...prev, [qid]: current.filter(x => x !== val) };
              else newAns = { ...prev, [qid]: [...current, val] };
          } else if (type === 'table_boolean') {
              const current = prev[qid] || {};
              newAns = { ...prev, [qid]: { ...current, ...val } };
          } else { 
              newAns = { ...prev, [qid]: val };
          }
          localStorage.setItem(`ans_${examData.id}`, JSON.stringify(newAns));
          return newAns;
      });
  };

  const handleFinalSubmit = () => {
      // Hapus data temporary biar tidak nyangkut utk ujian berikutnya
      localStorage.removeItem(`ans_${examData?.id}`);
      localStorage.removeItem(`timer_${examData?.id}`);
      localStorage.removeItem(`active_exam_id`); // PENTING UTK DASHBOARD
      onSubmit(answers);
  };

  const confirmSubmit = () => {
      if(window.confirm("Yakin ingin mengakhiri ujian?")) handleFinalSubmit();
  };

  const renderText = (text) => {
    if (!text || text === 'nan') return "";
    let formatted = text.replace(/\[B\]/gi, '<b>').replace(/\[\/B\]/gi, '</b>').replace(/\[I\]/gi, '<i>').replace(/\[\/I\]/gi, '</i>');
    const parts = formatted.split(/(\$.*?\$)/g);
    return <span className="text-slate-800 leading-relaxed text-lg">{parts.map((p, i) => p.startsWith('$') ? <span key={i} className="mx-1"><InlineMath math={p.replace(/\$/g, '')} /></span> : <span key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br/>') }} />)}</span>;
  };

  if (!examData) return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-400">Memuat Soal...</div>;
  
  const q = examData.questions[currentIndex];
  const isLastQuestion = currentIndex === examData.questions.length - 1;
  const formatTime = (s) => `${Math.floor(s/3600)}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const hasReading = q.reading_material && q.reading_material.trim() !== '' && q.reading_material.toLowerCase() !== 'nan';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans h-screen overflow-hidden select-none text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">{currentIndex + 1}</div>
            <div><h1 className="font-bold text-lg">{examData.title}</h1><p className="text-xs text-slate-500 font-medium">Sisa Soal: {examData.questions.length - Object.keys(answers).length}</p></div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xl flex items-center gap-3 ${timeLeft<300?'bg-red-50 text-red-600 animate-pulse':'bg-slate-100 text-slate-700'}`}><Clock size={22}/> {formatTime(timeLeft)}</div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                {hasReading && <div className="p-6 bg-slate-50/50 border-b border-slate-100 text-slate-700 leading-relaxed text-sm"><div className="prose max-w-none">{renderText(q.reading_material)}</div></div>}
                <div className="p-8">
                    {q.image_url && q.image_url!=='nan' && <div className="mb-6 p-2 bg-slate-50 rounded-xl border border-slate-100 inline-block"><img src={q.image_url} className="max-h-80 rounded-lg" alt="Soal"/></div>}
                    <div className="font-medium text-xl text-slate-800 leading-relaxed">{renderText(q.text)}</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Jawaban Anda</h3>
                {q.type === 'short_answer' ? (
                    <div className="relative"><input type="text" className="w-full p-4 pl-12 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-xl text-slate-700 transition-all placeholder:text-slate-300" placeholder="Ketik jawaban..." value={answers[q.id]||''} onChange={(e)=>handleAnswer(q.id,e.target.value,'short_answer')} autoComplete="off"/><Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24}/></div>
                ) : q.type === 'table_boolean' ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-base"><thead className="bg-slate-50 font-bold border-b"><tr><th className="p-4 text-left">Pernyataan</th><th className="p-4 w-24 text-center">Benar</th><th className="p-4 w-24 text-center">Salah</th></tr></thead><tbody className="divide-y">{q.options.map(opt=>(<tr key={opt.id}><td className="p-4 font-medium">{renderText(opt.text)}</td><td className="text-center p-2"><input type="radio" checked={answers[q.id]?.[opt.id]==='B'} onChange={()=>handleAnswer(q.id,{[opt.id]:'B'},'table_boolean')} className="w-6 h-6 accent-emerald-500"/></td><td className="text-center p-2"><input type="radio" checked={answers[q.id]?.[opt.id]==='S'} onChange={()=>handleAnswer(q.id,{[opt.id]:'S'},'table_boolean')} className="w-6 h-6 accent-red-500"/></td></tr>))}</tbody></table></div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {q.options.map((opt, idx) => {
                            // FIX 1: PAKSA LABEL A, B, C, D, E (JANGAN PAKAI TEXT)
                            const label = ["A", "B", "C", "D", "E"][idx];
                            const isComplex = q.type === 'complex';
                            const isSelected = isComplex ? (answers[q.id]||[]).includes(label) : answers[q.id] === label;
                            return (
                                <button key={opt.id} onClick={()=>handleAnswer(q.id, label, q.type)} className={`group w-full text-left p-4 rounded-2xl border-2 flex items-center gap-5 transition-all duration-200 ${isSelected?'border-indigo-600 bg-indigo-50 shadow-md':'border-slate-100 hover:border-indigo-300 hover:bg-white bg-slate-50'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg transition-colors ${isSelected?'bg-indigo-600 text-white':'bg-white border border-slate-200 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600'}`}>{label}</div>
                                    <div className={`text-lg font-medium ${isSelected?'text-indigo-900':'text-slate-600'}`}>{renderText(opt.text)}</div>
                                    {isSelected && <CheckCircle className="ml-auto text-indigo-600 animate-fade-in" size={24}/>}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
          </div>
          <div className="max-w-5xl mx-auto mt-8 flex justify-between items-center pb-10">
            <button disabled={currentIndex===0} onClick={()=>setCurrentIndex(c=>c-1)} className="px-6 py-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={20}/> Sebelumnya</button>
            {isLastQuestion ? <button onClick={confirmSubmit} className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg flex items-center gap-2 transform hover:scale-105 transition"><Save size={20}/> KUMPULKAN</button> : <button onClick={()=>setCurrentIndex(c=>c+1)} className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2 transform hover:scale-105 transition">Selanjutnya <ChevronRight size={20}/></button>}
          </div>
        </main>
        <aside className="hidden xl:flex w-80 bg-white border-l border-slate-200 flex-col">
            <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Grid size={18}/> Navigasi Soal</h3></div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar"><div className="grid grid-cols-5 gap-3">{examData.questions.map((q, i) => { let filled = false; if(q.type==='complex') filled=(answers[q.id]||[]).length>0; else if(q.type==='table_boolean') filled=Object.keys(answers[q.id]||{}).length>0; else filled=!!answers[q.id]; return (<button key={i} onClick={()=>setCurrentIndex(i)} className={`aspect-square rounded-xl font-bold text-sm flex items-center justify-center border-2 ${i===currentIndex?'bg-indigo-600 text-white border-indigo-600':filled?'bg-emerald-500 text-white border-emerald-500':'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300'}`}>{i+1}</button>)})}</div></div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 text-center"><button onClick={confirmSubmit} className="w-full py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-600 hover:border-red-400 hover:text-red-500 transition">Hentikan Ujian</button></div>
        </aside>
      </div>
    </div>
  );
};
export default ExamSimulation;