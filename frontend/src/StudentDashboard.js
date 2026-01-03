import React, { useState, useEffect, useCallback } from 'react';
import { Play, Clock, ChevronRight } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home'); // home | exam | result | lms
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Exam States
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeSubtest, setActiveSubtest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); 
    const [timeLeft, setTimeLeft] = useState(0);
    const [examResult, setExamResult] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/student/periods?username=${user.username}`).then(r=>r.json()).then(setPeriods);
        fetch(`${API_URL}/lms/materials`).then(r=>r.json()).then(setMaterials);
    }, [user.username]);

    // --- LOGIC PINDAH SUBTES & SELESAI ---
    const finishExam = useCallback(async () => {
        if (!activePeriod) return;
        const res = await fetch(`${API_URL}/exams/${activePeriod.id}/finish`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username:user.username, answers})
        });
        const result = await res.json();
        setExamResult(result);
        setView('result');
    }, [activePeriod, answers, user.username]);

    const enterSubtest = useCallback(async (ex) => {
        const res = await fetch(`${API_URL}/exams/${ex.id}/questions`);
        const data = await res.json();
        setQuestions(data);
        setActiveSubtest(ex);
        setTimeLeft(ex.duration * 60);
    }, []);

    const handleNextSubtest = useCallback(() => {
        if (!activePeriod || !activeSubtest) return;
        const idx = activePeriod.exams.findIndex(e => e.id === activeSubtest.id);
        if(idx < activePeriod.exams.length - 1) {
            alert("Waktu Habis / Lanjut Subtes Berikutnya.");
            enterSubtest(activePeriod.exams[idx+1]);
        } else {
            finishExam();
        }
    }, [activePeriod, activeSubtest, enterSubtest, finishExam]);

    // --- TIMER SYSTEM ---
    useEffect(() => {
        if(!activeSubtest || timeLeft <= 0) return;
        
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) { 
                    handleNextSubtest(); 
                    return 0; 
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(t);
    }, [timeLeft, activeSubtest, handleNextSubtest]);

    const startExam = (p) => {
        setActivePeriod(p);
        enterSubtest(p.exams[0]);
        setView('exam');
    };

    // --- UI RENDER ---
    if(view === 'result' && examResult) {
        const data = Object.keys(examResult.detail).map(k=>({ subj:k, A:examResult.detail[k], full:1000 }));
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-4xl w-full text-center">
                    <h1 className="text-3xl font-black mb-2">Analisis Hasil Ujian</h1>
                    <div className="text-6xl font-black text-indigo-600 mb-6">{examResult.total}</div>
                    <div className="h-96 w-full">
                        <ResponsiveContainer>
                            <RadarChart outerRadius={120} data={data}>
                                <PolarGrid /><PolarAngleAxis dataKey="subj" /><PolarRadiusAxis />
                                <Radar name="Skor" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6}/>
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <button onClick={()=>window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold mt-8">Kembali ke Dashboard</button>
                </div>
            </div>
        );
    }

    if(view === 'exam' && activeSubtest) {
        return (
            <div className="h-screen flex flex-col bg-white overflow-hidden">
                <header className="bg-slate-900 text-white p-4 flex justify-between items-center z-10">
                    <div className="font-bold text-lg">{activeSubtest.title}</div>
                    <div className={`text-xl font-mono font-bold px-4 py-1 rounded ${timeLeft<300?'bg-red-500 animate-pulse':'bg-indigo-600'}`}>
                        {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                    </div>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-64 bg-slate-100 border-r p-4 overflow-y-auto hidden md:block">
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q,i)=>(
                                <div key={q.id} className={`aspect-square flex items-center justify-center rounded font-bold text-sm ${answers[activeSubtest.id]?.[q.id]?'bg-indigo-600 text-white':'bg-white border'}`}>{i+1}</div>
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 p-8 overflow-y-auto">
                        {questions.map((q,i)=>(
                            <div key={q.id} className="max-w-3xl mx-auto mb-12 border-b pb-8">
                                <div className="flex gap-4">
                                    <span className="bg-slate-800 text-white px-3 py-1 rounded font-bold h-fit">#{i+1}</span>
                                    <div className="flex-1">
                                        {q.wacana && <div className="bg-slate-50 p-4 border-l-4 border-indigo-500 text-sm italic mb-4 whitespace-pre-line">{q.wacana}</div>}
                                        <div dangerouslySetInnerHTML={{__html: q.text}} className="text-lg mb-4"/>
                                        
                                        <div className="space-y-2">
                                            {q.q_type === 'ISIAN' ? (
                                                <input className="border-2 p-3 rounded w-full font-bold" placeholder="Ketik jawaban..." onBlur={(e)=>setAnswers({...answers, [activeSubtest.id]:{...answers[activeSubtest.id], [q.id]:e.target.value}})} />
                                            ) : (
                                                q.options_json?.map((opt, idx)=>(
                                                    <div key={idx} onClick={()=>setAnswers({...answers, [activeSubtest.id]:{...answers[activeSubtest.id], [q.id]:opt.label}})} 
                                                        className={`p-3 border rounded cursor-pointer flex items-center gap-3 ${answers[activeSubtest.id]?.[q.id]===opt.label?'bg-blue-100 border-blue-500':'hover:bg-slate-50'}`}>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${answers[activeSubtest.id]?.[q.id]===opt.label?'bg-blue-600 text-white':'bg-slate-200'}`}>{opt.label}</div>
                                                        <div>{opt.text}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleNextSubtest} className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-full shadow-xl font-bold flex items-center gap-2">Selesai Subtes <ChevronRight/></button>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans">
            <header className="bg-white p-6 shadow-sm flex justify-between items-center">
                <h1 className="text-2xl font-black text-indigo-900">Halo, {user.full_name}</h1>
                <div className="flex gap-4">
                    <button onClick={()=>setView('home')} className="font-bold text-slate-600">Tryout</button>
                    <button onClick={()=>setView('lms')} className="font-bold text-slate-600">Materi Belajar</button>
                    <button onClick={onLogout} className="text-red-500 font-bold">Logout</button>
                </div>
            </header>

            <main className="p-8 max-w-6xl mx-auto">
                {view === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition cursor-pointer group relative overflow-hidden" onClick={()=>startExam(p)}>
                                <div className="relative z-10">
                                    <div className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full w-fit mb-3">{p.exam_type}</div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-2">{p.name}</h2>
                                    <p className="text-slate-500">{p.exams.length} Subtes • IRT Scoring • Blocking Time</p>
                                    <div className="mt-6 font-bold text-indigo-600 group-hover:translate-x-2 transition flex items-center gap-2">Mulai Ujian <ChevronRight/></div>
                                </div>
                                <Clock className="absolute right-[-20px] bottom-[-20px] text-slate-100 w-48 h-48 group-hover:scale-110 transition"/>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'lms' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Materi Belajar & Video Pembahasan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {materials.map(m => (
                                <div key={m.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                                    <div className="h-32 bg-slate-800 flex items-center justify-center">
                                        <Play className="text-white w-12 h-12 opacity-80"/>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs font-bold text-indigo-600 mb-1">{m.category} • {m.content_type}</div>
                                        <h3 className="font-bold text-lg leading-tight mb-2">{m.title}</h3>
                                        <a href={m.content_url} target="_blank" rel="noreferrer" className="block w-full text-center bg-slate-100 py-2 rounded font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 mt-4">Buka Materi</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
export default StudentDashboard;