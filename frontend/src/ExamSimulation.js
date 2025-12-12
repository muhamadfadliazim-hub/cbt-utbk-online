import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const ExamSimulation = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [doubtful, setDoubtful] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16); 

  const timerRef = useRef(null);

  // --- HELPER RENDER ---
  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // --- ACTIONS ---
  const saveLocal = useCallback((ans, dbt) => {
    const saved = JSON.parse(localStorage.getItem(`exam_${examId}`)) || {};
    localStorage.setItem(`exam_${examId}`, JSON.stringify({ ...saved, answers: ans, doubtful: dbt }));
  }, [examId]);

  const handleAnswer = (val) => {
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    const newAns = { ...answers, [qId]: val };
    setAnswers(newAns);
    saveLocal(newAns, doubtful);
  };

  const toggleDoubt = () => {
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    const newDoubt = { ...doubtful, [qId]: !doubtful[qId] };
    setDoubtful(newDoubt);
    saveLocal(answers, newDoubt);
  };

  const handleSubmit = useCallback(async () => {
    if (!window.confirm("Yakin ingin menyelesaikan ujian?")) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        await fetch(`${API_URL}/exams/${examId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user?.username, answers })
        });
        localStorage.removeItem(`exam_${examId}`);
        alert("Ujian Selesai! Terima kasih.");
        navigate('/dashboard');
    } catch (e) {
        alert("Gagal kirim jawaban. Cek koneksi!");
    }
  }, [answers, examId, navigate]);

  // --- LOAD DATA ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/exams/${examId}`);
        if (!res.ok) throw new Error("Gagal memuat ujian");
        const data = await res.json();
        
        if (isMounted) {
            setExam(data);
            setQuestions(data.questions || []);
            
            // Cek Local Storage (Resume Ujian)
            const saved = JSON.parse(localStorage.getItem(`exam_${examId}`)) || {};
            if (saved.answers) setAnswers(saved.answers);
            if (saved.doubtful) setDoubtful(saved.doubtful);
            
            // Timer Logic
            const now = Math.floor(Date.now() / 1000);
            const endTime = saved.endTime || (now + (data.duration || 120) * 60);
            localStorage.setItem(`exam_${examId}`, JSON.stringify({ ...saved, endTime }));
            setTimeLeft(Math.max(0, endTime - now));
        }
      } catch (err) {
        // Jangan alert jika unmount, cukup log
        console.error(err);
        if (isMounted) navigate('/dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [examId, navigate]);

  // --- TIMER ---
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, handleSubmit]); 

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // --- RENDER LOADING / ERROR (PENTING AGAR TIDAK WHITE SCREEN) ---
  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-700 font-bold gap-2"><Loader2 className="animate-spin"/> Memuat Soal...</div>;
  
  if (!exam || !questions || questions.length === 0) {
      return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <p className="text-red-500 font-bold">Data ujian tidak ditemukan atau kosong.</p>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-indigo-600 text-white rounded">Kembali ke Dashboard</button>
        </div>
      );
  }

  const q = questions[currentIndex];
  if (!q) return <div className="p-4">Menyiapkan soal...</div>; // Safety check

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
      
      {/* 1. HEADER */}
      <header className="bg-indigo-900 text-white shrink-0 z-50 shadow-md">
        <div className="flex justify-between items-center p-3">
            <div className="flex flex-col overflow-hidden">
                <h1 className="font-bold text-sm md:text-lg truncate max-w-[150px] md:max-w-none">{exam.title}</h1>
                <span className="text-xs md:text-sm text-indigo-200">Soal {currentIndex + 1} / {questions.length}</span>
            </div>

            <div className="bg-indigo-800 px-3 md:px-4 py-1 rounded-full flex items-center gap-2 border border-indigo-600 shadow-inner">
                <Clock size={16} className="animate-pulse text-yellow-400"/>
                <span className="font-mono font-bold text-lg md:text-xl tracking-wider">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center bg-indigo-800 rounded overflow-hidden border border-indigo-600">
                <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-2 hover:bg-indigo-700 transition" title="Kecil"><span className="text-xs">A-</span></button>
                <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-2 hover:bg-indigo-700 transition" title="Besar"><span className="text-sm font-bold">A+</span></button>
            </div>
        </div>

        {/* 2. NAVIGASI NOMOR */}
        <div className="bg-white border-b border-gray-200 p-2 flex gap-2 overflow-x-auto items-center shadow-inner scrollbar-hide" style={{scrollbarWidth: 'none'}}>
            {questions.map((ques, i) => {
                const qId = ques.id;
                let statusClass = "bg-white border-gray-300 text-gray-700"; 
                if (currentIndex === i) statusClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300"; 
                else if (doubtful[qId]) statusClass = "bg-yellow-400 text-white border-yellow-500"; 
                else if (answers[qId]) statusClass = "bg-green-600 text-white border-green-600"; 

                return (
                    <button 
                        key={i} 
                        onClick={() => setCurrentIndex(i)}
                        className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 ${statusClass}`}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
      </header>

      {/* 3. MAIN CONTENT (TAMPILAN MOBILE VIDEO STYLE) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* PANEL ATAS (MOBILE) / KIRI (DESKTOP): WACANA */}
        {(q.reading_material || q.image_url) && (
            <div className="w-full md:w-1/2 bg-gray-100 border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto p-4 md:p-6" style={{maxHeight: '40vh', minHeight: '20vh'}}>
                <div className="bg-white p-4 rounded shadow-sm border">
                    {q.reading_label && <div className="font-bold text-indigo-900 mb-2 uppercase text-xs tracking-wider">{q.reading_label}</div>}
                    {q.image_url && <img src={q.image_url} alt="Soal" className="w-full h-auto mb-4 rounded border" />}
                    <div className="prose max-w-none text-gray-800 leading-relaxed text-justify">
                        {renderText(q.reading_material)}
                    </div>
                    {q.citation && <div className="mt-4 text-xs text-gray-500 italic text-right">Sumber: {q.citation}</div>}
                </div>
            </div>
        )}

        {/* PANEL BAWAH (MOBILE) / KANAN (DESKTOP): SOAL & OPSI */}
        <div className={`w-full ${(!q.reading_material && !q.image_url) ? 'md:max-w-3xl mx-auto' : 'md:w-1/2'} bg-white overflow-y-auto p-4 md:p-6 pb-24 md:pb-6`}>
            
            {/* Teks Soal */}
            <div className="mb-6">
                <div className="text-gray-800 leading-relaxed font-medium">{renderText(q.text)}</div>
            </div>

            {/* Pilihan Ganda */}
            <div className="space-y-3">
                {q.type === 'multiple_choice' && q.options.map((opt) => (
                    <div 
                        key={opt.id} 
                        onClick={() => handleAnswer(opt.id)}
                        className={`
                            flex items-start p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 group hover:shadow-md
                            ${answers[q.id] === opt.id 
                                ? 'border-blue-600 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300 bg-white'}
                        `}
                    >
                        <div className={`
                            w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold mr-3 md:mr-4 shrink-0 transition-colors
                            ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}
                        `}>
                            {opt.id}
                        </div>
                        <div className="flex-1 mt-1 md:mt-2 text-gray-700">{renderText(opt.label)}</div>
                    </div>
                ))}

                {/* Isian Singkat */}
                {q.type === 'short_answer' && (
                    <input 
                        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
                        placeholder="Ketik jawaban Anda..."
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                    />
                )}
            </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-white border-t border-gray-200 p-3 md:p-4 shrink-0 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          
          <button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={18}/> <span className="hidden md:inline">Sebelumnya</span>
          </button>

          <button 
            onClick={toggleDoubt}
            className={`
                flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold border-2 transition
                ${doubtful[q.id] ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-yellow-400 text-yellow-600'}
            `}
          >
            <AlertTriangle size={18}/> <span className="hidden md:inline">Ragu</span>
          </button>

          {isLast ? (
             <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200/50 transition transform active:scale-95"
             >
                Selesai <CheckCircle size={18}/>
             </button>
          ) : (
             <button 
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-200/50 transition"
             >
                <span className="hidden md:inline">Lanjut</span> <ChevronRight size={18}/>
             </button>
          )}
      </footer>
    </div>
  );
};

export default ExamSimulation;