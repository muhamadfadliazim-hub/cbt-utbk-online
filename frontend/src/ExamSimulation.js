import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const ExamSimulation = ({ onFinish }) => { // Menerima props onFinish dari App.js
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [doubtful, setDoubtful] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16); 

  const timerRef = useRef(null);

  // --- HELPER RENDER TEKS (FIX BOLD/ITALIC/ENTER) ---
  const renderText = (text) => {
    if (!text) return null;
    
    // 1. Ganti baris baru (\n) dengan <br/>
    // 2. Ganti kode Bold/Italic manual [b]..[/b] jika ada
    // 3. Render LaTeX
    
    // Kita pecah dulu berdasarkan LaTeX
    const parts = text.split(/(\$.*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      }
      
      // Proses formatting sederhana HTML-like dan Newline
      return (
        <span key={index} dangerouslySetInnerHTML={{ 
            __html: part
                .replace(/\n/g, '<br/>') // Enter
                .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>') // Bold [b]
                .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>') // Italic [i]
                // Tambahkan support itemize jika perlu (manual logic)
        }} />
      );
    });
  };

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
    
    const user = JSON.parse(localStorage.getItem('utbk_user')); // Pakai key yang konsisten 'utbk_user'
    if (!user) { alert("Sesi habis, login ulang."); navigate('/login'); return; }

    try {
        const res = await fetch(`${API_URL}/exams/${examId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, answers })
        });
        
        if (!res.ok) throw new Error("Gagal submit");
        
        const resultData = await res.json();
        
        // Hapus data lokal
        localStorage.removeItem(`exam_${examId}`);
        
        // Panggil callback ke App.js untuk pindah ke halaman hasil
        if (onFinish) {
            onFinish(resultData);
        } else {
            // Fallback jika props tidak ada
            navigate('/dashboard');
        }
        
    } catch (e) {
        alert("Gagal kirim jawaban. Cek koneksi!");
    }
  }, [answers, examId, navigate, onFinish]);

  // Load Data & Timer (Sama seperti sebelumnya, pastikan key localStorage 'utbk_user')
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
            
            const saved = JSON.parse(localStorage.getItem(`exam_${examId}`)) || {};
            if (saved.answers) setAnswers(saved.answers);
            if (saved.doubtful) setDoubtful(saved.doubtful);
            
            const now = Math.floor(Date.now() / 1000);
            const duration = data.duration || 120; 
            const endTime = saved.endTime || (now + duration * 60);
            localStorage.setItem(`exam_${examId}`, JSON.stringify({ ...saved, endTime }));
            setTimeLeft(Math.max(0, endTime - now));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) navigate('/dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [examId, navigate]);

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
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, handleSubmit]); 

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center gap-2"><Loader2 className="animate-spin"/> Memuat...</div>;
  if (!exam || !questions || questions.length === 0) return <div className="p-4 text-center">Data kosong. <button onClick={() => navigate('/dashboard')} className="text-blue-600 underline">Kembali</button></div>;

  const q = questions[currentIndex];
  if(!q) return null;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
      {/* HEADER */}
      <header className="bg-indigo-900 text-white shrink-0 z-50 shadow-md">
        <div className="flex justify-between items-center p-3">
            <div className="flex flex-col overflow-hidden w-1/3">
                <h1 className="font-bold text-sm md:text-lg truncate">{exam.title}</h1>
                <span className="text-xs md:text-sm text-indigo-200">No. {currentIndex + 1}</span>
            </div>
            <div className="bg-indigo-800 px-3 py-1 rounded-full flex items-center gap-2 border border-indigo-600 shadow-inner">
                <Clock size={16} className="text-yellow-400"/>
                <span className="font-mono font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center bg-indigo-800 rounded border border-indigo-600">
                <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-2 hover:bg-indigo-700"><span className="text-xs">A-</span></button>
                <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-2 hover:bg-indigo-700"><span className="text-sm font-bold">A+</span></button>
            </div>
        </div>
        {/* NAVIGASI NOMOR */}
        <div className="bg-white border-b border-gray-200 p-2 flex gap-2 overflow-x-auto items-center shadow-inner no-scrollbar">
            {questions.map((ques, i) => {
                const qId = ques.id;
                let statusClass = "bg-white border-gray-300 text-gray-700"; 
                if (currentIndex === i) statusClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300"; 
                else if (doubtful[qId]) statusClass = "bg-yellow-400 text-white border-yellow-500"; 
                else if (answers[qId]) statusClass = "bg-green-600 text-white border-green-600"; 
                return (
                    <button key={i} onClick={() => setCurrentIndex(i)} className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${statusClass}`}>{i + 1}</button>
                );
            })}
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {(q.reading_material || q.image_url) && (
            <div className="w-full md:w-1/2 bg-gray-100 border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto p-4" style={{maxHeight: '40vh', minHeight: '20vh'}}>
                <div className="bg-white p-4 rounded shadow-sm border text-justify">
                    {q.image_url && <img src={q.image_url} alt="Soal" className="w-full h-auto mb-4 rounded" />}
                    <div className="prose max-w-none text-gray-800 leading-relaxed">{renderText(q.reading_material)}</div>
                </div>
            </div>
        )}
        <div className={`w-full ${(!q.reading_material && !q.image_url) ? 'md:max-w-3xl mx-auto' : 'md:w-1/2'} bg-white overflow-y-auto p-4 pb-24 md:pb-6`}>
            <div className="mb-6 text-gray-800 leading-relaxed font-medium text-justify">{renderText(q.text)}</div>
            <div className="space-y-3">
                {q.type === 'multiple_choice' && q.options.map((opt) => (
                    <div key={opt.id} onClick={() => handleAnswer(opt.id)} className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 shrink-0 ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{opt.id}</div>
                        <div className="flex-1 mt-1 text-gray-700">{renderText(opt.label)}</div>
                    </div>
                ))}
                {q.type === 'short_answer' && (
                    <input className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none text-lg" placeholder="Jawaban..." value={answers[q.id] || ''} onChange={(e) => handleAnswer(e.target.value)} />
                )}
            </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 p-3 shrink-0 flex justify-between items-center shadow-lg z-50">
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="flex items-center gap-1 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 disabled:opacity-50"><ChevronLeft size={18}/> Prev</button>
          <button onClick={toggleDoubt} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 ${doubtful[q.id] ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-yellow-400 text-yellow-600'}`}><AlertTriangle size={18}/></button>
          {isLast ? (
             <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg">Selesai <CheckCircle size={18}/></button>
          ) : (
             <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} className="flex items-center gap-1 px-4 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg">Next <ChevronRight size={18}/></button>
          )}
      </footer>
    </div>
  );
};

export default ExamSimulation;