import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Grid, AlertTriangle } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const ExamSimulation = ({ examData, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
      try { return JSON.parse(localStorage.getItem('saved_answers')) || {}; } 
      catch { return {}; }
  });

  const [timeLeft, setTimeLeft] = useState(() => {
      const saved = localStorage.getItem('saved_timer');
      if (saved) return parseInt(saved);
      return (examData && examData.duration) ? examData.duration * 60 : 0;
  });

  useEffect(() => {
    if (!examData) return; 
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        localStorage.setItem('saved_timer', prev - 1);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examData]);

  useEffect(() => {
    localStorage.setItem('saved_answers', JSON.stringify(answers));
  }, [answers]);

  if (!examData || !examData.questions || examData.questions.length === 0) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Soal Belum Tersedia</h2>
                  <p className="text-gray-500 mb-6">Admin belum mengupload butir soal untuk ujian ini.</p>
                  <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Kembali</button>
              </div>
          </div>
      );
  }

  const questions = examData.questions;
  const question = questions[currentIndex]; 

  const handleAnswer = (val) => setAnswers({ ...answers, [question.id]: val });
  const handleComplexAnswer = (val) => {
    const current = answers[question.id] || [];
    const newAns = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
    setAnswers({ ...answers, [question.id]: newAns });
  };
  const handleTableAnswer = (rowIdx, val) => {
    const current = answers[question.id] || {};
    setAnswers({ ...answers, [question.id]: { ...current, [rowIdx]: val } });
  };
  const handleSubmit = () => {
    if (window.confirm("Yakin ingin mengakhiri ujian ini?")) onSubmit(answers);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // --- PERBAIKAN RENDER TEKS (BOLD, ITALIC, PARAGRAPH) ---
  const renderText = (text) => {
      if(!text) return "";
      // 1. Ganti tag manual [B], [I], [P] menjadi HTML tag
      let formatted = text
          .replace(/\[P\]/g, '<br/><br/>') // Pindah baris ganda
          .replace(/\[\/P\]/g, '')
          .replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>')
          .replace(/\[I\]/g, '<i>').replace(/\[\/I\]/g, '</i>');

      // 2. Render LaTeX
      return formatted.split(/(\$.*?\$)/).map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={index} math={part.slice(1, -1)} />;
          }
          // 3. Render HTML (Bold/Italic tadi)
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div>
            <h1 className="font-bold text-lg text-indigo-900 line-clamp-1">{examData.title}</h1>
            <p className="text-xs text-gray-500">Soal {currentIndex + 1} dari {questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}>
          <Clock size={20}/> {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* KOLOM KIRI: SOAL */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
            {question.reading_material && (
                <div className="p-6 bg-slate-50 border-b border-gray-100 text-sm leading-relaxed text-justify font-serif text-gray-700 max-h-60 overflow-y-auto resize-y">
                    <strong className="block mb-2 text-indigo-600 font-sans">Wacana:</strong>
                    {renderText(question.reading_material)}
                </div>
            )}
            <div className="p-6 md:p-8 flex-1">
                {question.image_url && (<img src={question.image_url} alt="Soal" className="max-h-64 mx-auto mb-6 rounded-lg border shadow-sm" />)}
                <div className="text-lg font-medium mb-8 leading-relaxed">{renderText(question.text)}</div>

                {question.type === 'multiple_choice' && (
                    <div className="space-y-3">
                        {question.options.map((opt) => (
                            <button key={opt.id} onClick={() => handleAnswer(opt.id)} className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-4 group ${answers[question.id] === opt.id ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs shrink-0 ${answers[question.id] === opt.id ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>{opt.id}</span>
                                <span className="pt-0.5">{renderText(opt.label)}</span>
                            </button>
                        ))}
                    </div>
                )}
                {question.type === 'complex' && (
                    <div className="space-y-3"><p className="text-xs text-gray-500 font-bold uppercase mb-2">Pilih lebih dari satu:</p>{question.options.map((opt) => {
                            const isSelected = (answers[question.id] || []).includes(opt.id);
                            return (<button key={opt.id} onClick={() => handleComplexAnswer(opt.id)} className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-4 ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-900' : 'bg-white border-gray-200'}`}><div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>{isSelected && <CheckCircle size={12} className="text-white"/>}</div><span>{renderText(opt.label)}</span></button>);
                        })}</div>
                )}
                {question.type === 'short_answer' && (<div><p className="text-xs text-gray-500 font-bold uppercase mb-2">Jawaban Singkat:</p><input type="text" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-lg font-bold outline-none transition" placeholder="Ketik jawaban..." value={answers[question.id] || ''} onChange={(e) => handleAnswer(e.target.value)}/></div>)}
                {question.type === 'table_boolean' && (<div className="overflow-x-auto rounded-xl border border-gray-200"><table className="w-full text-sm text-left"><thead className="bg-gray-100 font-bold text-gray-700"><tr><th className="p-4">Pernyataan</th><th className="p-4 text-center w-24">{question.label1 || 'Benar'}</th><th className="p-4 text-center w-24">{question.label2 || 'Salah'}</th></tr></thead><tbody className="divide-y divide-gray-100">{question.options.map((opt) => (<tr key={opt.id} className="hover:bg-gray-50"><td className="p-4">{renderText(opt.label)}</td><td className="p-4 text-center"><input type="radio" name={`q_${question.id}_${opt.id}`} checked={(answers[question.id] || {})[opt.id] === 'B'} onChange={() => handleTableAnswer(opt.id, 'B')} className="w-5 h-5 text-indigo-600 cursor-pointer"/></td><td className="p-4 text-center"><input type="radio" name={`q_${question.id}_${opt.id}`} checked={(answers[question.id] || {})[opt.id] === 'S'} onChange={() => handleTableAnswer(opt.id, 'S')} className="w-5 h-5 text-indigo-600 cursor-pointer"/></td></tr>))}</tbody></table></div>)}
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center">
            <button onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"><ChevronLeft size={20}/> Sebelumnya</button>
            {currentIndex === questions.length - 1 ? (<button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-lg shadow-emerald-200"><CheckCircle size={20}/> Selesai Ujian</button>) : (<button onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Selanjutnya <ChevronRight size={20}/></button>)}
          </div>
        </main>

        {/* KOLOM KANAN: NAVIGASI NOMOR SOAL */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-l p-6 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Grid size={18}/> Navigasi Soal</h3>
            <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "" && (typeof answers[q.id] !== 'object' || Object.keys(answers[q.id]).length > 0);
                    return (<button key={idx} onClick={() => setCurrentIndex(idx)} className={`aspect-square rounded-lg font-bold text-sm transition border ${idx === currentIndex ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200' : isAnswered ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>{idx + 1}</button>);
                })}
            </div>
            <div className="mt-auto pt-6 border-t">
                <div className="text-xs text-gray-500 flex gap-4"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div> Dijawab</div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded"></div> Aktif</div></div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamSimulation;