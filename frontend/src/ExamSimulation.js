import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const ExamSimulation = ({ onFinish }) => {
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
  const [allowSubmit, setAllowSubmit] = useState(true);

  const timerRef = useRef(null);

  // FIX: Regex [\s\S]*? supports multiline match for [b] and [i]
  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\$.*?\$)/);
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      }
      return (
        <span key={index} dangerouslySetInnerHTML={{ 
            __html: part
                .replace(/\n/g, '<br/>')
                .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
                .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
        }} />
      );
    });
  };

  const saveLocal = useCallback((ans, dbt) => {
    const saved = JSON.parse(localStorage.getItem(`exam_${examId}`)) || {};
    localStorage.setItem(`exam_${examId}`, JSON.stringify({ ...saved, answers: ans, doubtful: dbt }));
  }, [examId]);

  const handleAnswer = (val, subKey = null) => {
    const q = questions[currentIndex];
    if (!q) return;

    let newAns = { ...answers };
    
    if (q.type === 'complex') {
        const currentArr = newAns[q.id] || [];
        if (currentArr.includes(val)) {
            newAns[q.id] = currentArr.filter(v => v !== val);
        } else {
            newAns[q.id] = [...currentArr, val];
        }
    } else if (q.type === 'table_boolean') {
        const currentObj = newAns[q.id] || {};
        newAns[q.id] = { ...currentObj, [subKey]: val };
    } else {
        newAns[q.id] = val;
    }

    setAnswers(newAns);
    saveLocal(newAns, doubtful);
  };

  const toggleDoubt = () => {
    const q = questions[currentIndex];
    if (!q) return;
    const newDoubt = { ...doubtful, [q.id]: !doubtful[q.id] };
    setDoubtful(newDoubt);
    saveLocal(answers, newDoubt);
  };

  const handleSubmit = useCallback(async () => {
    if (!window.confirm("Yakin ingin menyelesaikan ujian?")) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const user = JSON.parse(localStorage.getItem('utbk_user'));
    
    try {
        const res = await fetch(`${API_URL}/exams/${examId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user?.username, answers })
        });
        if (!res.ok) throw new Error("Gagal submit");
        const resultData = await res.json();
        localStorage.removeItem(`exam_${examId}`);
        if (onFinish) onFinish(resultData);
        else navigate('/dashboard');
    } catch (e) {
        alert("Gagal kirim jawaban. Cek koneksi!");
    }
  }, [answers, examId, navigate, onFinish]);

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
            setAllowSubmit(data.allow_submit); // Set status tombol selesai
            
            const saved = JSON.parse(localStorage.getItem(`exam_${examId}`)) || {};
            if (saved.answers) setAnswers(saved.answers);
            if (saved.doubtful) setDoubtful(saved.doubtful);
            
            const now = Math.floor(Date.now() / 1000);
            const endTime = saved.endTime || (now + (data.duration || 120) * 60);
            localStorage.setItem(`exam_${examId}`, JSON.stringify({ ...saved, endTime }));
            setTimeLeft(Math.max(0, endTime - now));
        }
      } catch (err) {
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
  if (!exam || !questions || questions.length === 0) return <div className="p-4 text-center">Data kosong.</div>;

  const q = questions[currentIndex];
  if(!q) return null;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
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

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {(q.reading_material || q.image_url) && (
            <div className="w-full md:w-1/2 bg-gray-100 border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto p-4" style={{maxHeight: '40vh', minHeight: '20vh'}}>
                <div className="bg-white p-4 rounded shadow-sm border text-justify">
                    {q.reading_label && <div className="font-bold text-indigo-900 mb-2 uppercase text-xs tracking-wider">{q.reading_label}</div>}
                    <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">{renderText(q.reading_material)}</div>
                    {q.image_url && <img src={q.image_url} alt="Soal" className="w-full h-auto mt-4 rounded border shadow-sm" />}
                    {q.citation && <div className="mt-4 text-xs text-gray-500 italic text-right">Sumber: {q.citation}</div>}
                </div>
            </div>
        )}

        <div className={`w-full ${(!q.reading_material && !q.image_url) ? 'md:max-w-3xl mx-auto' : 'md:w-1/2'} bg-white overflow-y-auto p-4 pb-24 md:pb-6`}>
            <div className="mb-6 text-gray-800 leading-relaxed font-medium text-justify whitespace-pre-wrap">{renderText(q.text)}</div>
            <div className="space-y-3">
                {q.type === 'multiple_choice' && q.options.map((opt) => (
                    <div key={opt.id} onClick={() => handleAnswer(opt.id)} className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 shrink-0 ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{opt.id}</div>
                        <div className="flex-1 mt-1 text-gray-700">{renderText(opt.label)}</div>
                    </div>
                ))}
                {q.type === 'complex' && q.options.map((opt) => {
                    const isSelected = (answers[q.id] || []).includes(opt.id);
                    return (
                        <div key={opt.id} onClick={() => handleAnswer(opt.id)} className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                            <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'}`}>
                                {isSelected && <CheckCircle size={14} className="text-white"/>}
                            </div>
                            <div className="flex-1 text-gray-700">{renderText(opt.label)}</div>
                        </div>
                    )
                })}
                {q.type === 'table_boolean' && (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-3">Pernyataan</th>
                                    <th className="p-3 text-center w-20">Benar</th>
                                    <th className="p-3 text-center w-20">Salah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {q.options.map((opt) => (
                                    <tr key={opt.id} className="bg-white">
                                        <td className="p-3">{renderText(opt.label)}</td>
                                        <td className="p-3 text-center"><input type="radio" name={`q_${q.id}_${opt.id}`} checked={answers[q.id]?.[opt.id] === 'B'} onChange={() => handleAnswer('B', opt.id)} className="w-5 h-5 cursor-pointer"/></td>
                                        <td className="p-3 text-center"><input type="radio" name={`q_${q.id}_${opt.id}`} checked={answers[q.id]?.[opt.id] === 'S'} onChange={() => handleAnswer('S', opt.id)} className="w-5 h-5 cursor-pointer"/></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {q.type === 'short_answer' && (
                    <input className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none text-lg" placeholder="Ketik jawaban Anda..." value={answers[q.id] || ''} onChange={(e) => handleAnswer(e.target.value)} />
                )}
            </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-3 shrink-0 flex justify-between items-center shadow-lg z-50">
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="flex items-center gap-1 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 disabled:opacity-50"><ChevronLeft size={18}/> Prev</button>
          <button onClick={toggleDoubt} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 ${doubtful[q.id] ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-yellow-400 text-yellow-600'}`}><AlertTriangle size={18}/></button>
          {isLast && allowSubmit ? (
             <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg">Selesai <CheckCircle size={18}/></button>
          ) : (
             <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} className="flex items-center gap-1 px-4 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg">Next <ChevronRight size={18}/></button>
          )}
      </footer>
    </div>
  );
};

export default ExamSimulation;