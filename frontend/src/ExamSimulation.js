import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Grid, AlertTriangle, Save } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const ExamSimulation = ({ examData, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
      try { return JSON.parse(localStorage.getItem(`ans_${examData?.id}`)) || {}; } 
      catch { return {}; }
  });
  
  // FIX TIMER: Pastikan durasi dikali 60 (menit -> detik)
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
            alert("Waktu Habis! Ujian akan dikumpulkan.");
            onSubmit(answers); 
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
          if (type === 'complex') { // Checkbox
              const current = prev[qid] || [];
              if (current.includes(val)) newAns = { ...prev, [qid]: current.filter(x => x !== val) };
              else newAns = { ...prev, [qid]: [...current, val] };
          } else if (type === 'table_boolean') { // Table
              const current = prev[qid] || {};
              newAns = { ...prev, [qid]: { ...current, ...val } };
          } else { // Standard & Short
              newAns = { ...prev, [qid]: val };
          }
          localStorage.setItem(`ans_${examData.id}`, JSON.stringify(newAns));
          return newAns;
      });
  };

  const handleSubmit = () => { if(window.confirm("Kumpulkan jawaban sekarang?")) onSubmit(answers); };

  const renderText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\$.*?\$)/g);
    return <span className="text-gray-800 leading-relaxed text-lg">{parts.map((p, i) => p.startsWith('$') ? <span key={i} className="mx-1"><InlineMath math={p.replace(/\$/g, '')} /></span> : <span key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br/>').replace(/\[B\]/g,'<b>').replace(/\[\/B\]/g,'</b>') }} />)}</span>;
  };

  if (!examData) return <div className="text-center p-10">Memuat Soal...</div>;
  const q = examData.questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans h-screen overflow-hidden">
      <header className="bg-white shadow px-6 py-3 flex justify-between items-center z-20">
        <div><h1 className="font-bold text-slate-800">{examData.title}</h1><p className="text-xs text-slate-500">Soal {currentIndex + 1} / {examData.questions.length}</p></div>
        <div className={`px-4 py-2 rounded-xl font-mono font-bold flex gap-2 ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}><Clock size={20}/> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {q.reading_material && <div className="p-6 bg-slate-50 border-b italic text-slate-600">{renderText(q.reading_material)}</div>}
            <div className="p-8">
                {q.image_url && <img src={q.image_url} className="max-h-64 rounded mb-6 mx-auto"/>}
                <div className="mb-6 font-medium text-lg">{renderText(q.text)}</div>

                {q.type === 'short_answer' ? (
                    <input type="text" className="w-full p-3 border-2 border-slate-300 rounded-xl focus:border-indigo-500 outline-none font-bold text-lg" placeholder="Ketik jawaban..." value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value, 'short_answer')}/>
                ) : q.type === 'table_boolean' ? (
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-slate-100"><tr><th className="p-3 text-left">Pernyataan</th><th className="p-3 w-16 text-center">Benar</th><th className="p-3 w-16 text-center">Salah</th></tr></thead>
                        <tbody>
                            {q.options.map((opt) => (
                                <tr key={opt.id} className="border-b">
                                    <td className="p-3">{opt.text}</td>
                                    <td className="text-center"><input type="radio" name={`row_${opt.id}`} checked={answers[q.id]?.[opt.id] === 'B'} onChange={() => handleAnswer(q.id, {[opt.id]: 'B'}, 'table_boolean')} className="w-5 h-5 accent-indigo-600"/></td>
                                    <td className="text-center"><input type="radio" name={`row_${opt.id}`} checked={answers[q.id]?.[opt.id] === 'S'} onChange={() => handleAnswer(q.id, {[opt.id]: 'S'}, 'table_boolean')} className="w-5 h-5 accent-indigo-600"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="space-y-3">
                        {q.options.map(opt => {
                            const isSel = q.type === 'complex' ? (answers[q.id]||[]).includes(opt.index) : answers[q.id] === opt.index;
                            return (
                                <button key={opt.id} onClick={() => handleAnswer(q.id, opt.index, q.type)} className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 transition ${isSel ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}>
                                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold ${isSel ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{opt.index}</div>
                                    <div className="text-base">{renderText(opt.text)}</div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-6 flex justify-between">
            <button disabled={currentIndex===0} onClick={()=>setCurrentIndex(c=>c-1)} className="px-6 py-3 rounded-xl bg-white border font-bold text-slate-600 disabled:opacity-50">Sebelumnya</button>
            {currentIndex === examData.questions.length -1 ? 
                <button onClick={handleSubmit} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">Selesai</button> :
                <button onClick={()=>setCurrentIndex(c=>c+1)} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">Selanjutnya</button>
            }
          </div>
        </main>
        
        <aside className="hidden lg:block w-80 bg-white border-l p-6 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((q, i) => {
                    let filled = false;
                    if(q.type==='complex') filled = (answers[q.id]||[]).length > 0;
                    else if(q.type==='table_boolean') filled = Object.keys(answers[q.id]||{}).length > 0;
                    else filled = !!answers[q.id];
                    
                    return <button key={i} onClick={()=>setCurrentIndex(i)} className={`aspect-square rounded-lg font-bold text-sm ${i===currentIndex?'bg-indigo-600 text-white':filled?'bg-emerald-100 text-emerald-800':'bg-slate-100 text-slate-500'}`}>{i+1}</button>
                })}
            </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamSimulation;