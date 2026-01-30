import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Grid, AlertTriangle, Flag, Save } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath, BlockMath } from 'react-katex';

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

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- TIMER ---
  useEffect(() => {
    if (!examData) return; 
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto submit jika waktu habis
          return 0;
        }
        localStorage.setItem('saved_timer', prev - 1);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examData]);

  // --- SAVE ANSWER ---
  const handleAnswer = (val) => {
      setAnswers(prev => {
          const newAns = { ...prev, [examData.questions[currentIndex].id]: val };
          localStorage.setItem('saved_answers', JSON.stringify(newAns));
          return newAns;
      });
  };

  const handleSubmit = () => {
      if(window.confirm("Yakin ingin mengumpulkan ujian? Waktu akan berhenti.")) {
          onSubmit(answers);
      }
  };

  // --- FORMATTER TEKS (TEBAL, MIRING, MATEMATIKA) ---
  const renderText = (text) => {
    if (!text) return "";
    
    // 1. Ganti baris baru jadi <br>
    // 2. Ganti [B] jadi <b>, [I] jadi <i>
    // 3. Pisahkan LaTeX ($...$)
    
    const parts = text.split(/(\$.*?\$)/g); // Pisahkan rumus matematika

    return (
      <span className="text-gray-800 leading-relaxed text-lg">
        {parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            // Ini Rumus Matematika
            return <span key={index} className="mx-1"><InlineMath math={part.replace(/\$/g, '')} /></span>;
          } else {
            // Ini Teks Biasa (Parse HTML Tag Manual)
            let cleanPart = part
                .replace(/\[B\]/g, '<strong>').replace(/\[\/B\]/g, '</strong>')
                .replace(/\[I\]/g, '<em>').replace(/\[\/I\]/g, '</em>')
                .replace(/\n/g, '<br/>');
            
            return <span key={index} dangerouslySetInnerHTML={{ __html: cleanPart }} />;
          }
        })}
      </span>
    );
  };

  if (!examData || !examData.questions || examData.questions.length === 0) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Memuat Soal...</p>
              </div>
          </div>
      );
  }

  const questions = examData.questions;
  const currentQ = questions[currentIndex];
  
  // Format Waktu
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans h-screen overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center z-20 border-b border-slate-200">
        <div>
            <h1 className="text-lg font-bold text-slate-800">{examData.title}</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">SOAL NO {currentIndex + 1} DARI {questions.length}</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl font-mono font-bold text-xl border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
            <Clock size={20}/> {formatTime(timeLeft)}
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* MAIN QUESTION AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Kartu Soal */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Bacaan (Jika Ada) */}
                {currentQ.reading_material && (
                    <div className="p-6 bg-slate-50 border-b border-slate-100">
                        <div className="prose prose-sm max-w-none text-slate-600 italic leading-loose">
                            {renderText(currentQ.reading_material)}
                        </div>
                    </div>
                )}

                <div className="p-6 md:p-8">
                    {/* Gambar Soal */}
                    {currentQ.image_url && (
                        <div className="mb-6 flex justify-center">
                            <img src={currentQ.image_url} alt="Soal" className="max-h-64 rounded-lg border border-slate-200 shadow-sm"/>
                        </div>
                    )}

                    {/* Teks Soal */}
                    <div className="mb-8 text-slate-800 font-medium text-lg leading-relaxed">
                        {renderText(currentQ.text)}
                    </div>

                    {/* Pilihan Jawaban */}
                    <div className="space-y-3">
                        {currentQ.options.map((opt) => {
                            const isSelected = answers[currentQ.id] === opt.id; // opt.id biasanya A, B, C...
                            return (
                                <button 
                                    key={opt.id}
                                    onClick={() => handleAnswer(opt.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 group ${
                                        isSelected 
                                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' 
                                        : 'border-slate-100 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors flex-shrink-0 ${
                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                    }`}>
                                        {opt.id}
                                    </div>
                                    <div className={`mt-1 text-base ${isSelected ? 'font-bold text-indigo-900' : 'text-slate-600'}`}>
                                        {renderText(opt.label)}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Navigasi Bawah */}
            <div className="flex justify-between items-center pb-8">
                <button 
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(c => c - 1)}
                    className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition"
                >
                    <ChevronLeft size={20}/> Sebelumnya
                </button>

                {currentIndex === questions.length - 1 ? (
                    <button 
                        onClick={handleSubmit}
                        className="px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Save size={20}/> Kumpulkan Ujian
                    </button>
                ) : (
                    <button 
                        onClick={() => setCurrentIndex(c => c + 1)}
                        className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition transform hover:scale-105"
                    >
                        Selanjutnya <ChevronRight size={20}/>
                    </button>
                )}
            </div>

          </div>
        </main>

        {/* SIDEBAR NAVIGASI SOAL (DESKTOP) */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-l border-slate-200 z-10">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Grid size={18}/> Navigasi Soal</h3>
                <p className="text-xs text-slate-400 mt-1">Klik nomor untuk melompat.</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrent = idx === currentIndex;
                        return (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentIndex(idx)}
                                className={`aspect-square rounded-lg font-bold text-sm transition relative ${
                                    isCurrent 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110 z-10' 
                                    : isAnswered 
                                        ? 'bg-emerald-500 text-white border border-emerald-600' 
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                            >
                                {idx + 1}
                                {isAnswered && !isCurrent && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Terjawab: {Object.keys(answers).length}</span>
                    <span>Sisa: {questions.length - Object.keys(answers).length}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </aside>

      </div>
    </div>
  );
};

export default ExamSimulation;