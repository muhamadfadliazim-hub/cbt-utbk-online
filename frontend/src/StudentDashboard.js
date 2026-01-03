import React, { useState, useEffect, useCallback } from 'react';
import { Play, Clock, ChevronRight, LogOut, BookOpen, Menu, X, Home } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // STATE BARU UNTUK RESPONSIVE
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
        fetch(`${API_URL}/periods?active_only=true`).then(r=>r.json()).then(setPeriods);
        fetch(`${API_URL}/lms/materials`).then(r=>r.json()).then(setMaterials);
    }, []);

    // ... (LOGIC UJIAN SAMA SEPERTI SEBELUMNYA, DIPERSINGKAT AGAR MUAT) ...
    const finishExam = useCallback(async () => {
        const res = await fetch(`${API_URL}/exams/${activePeriod.id}/finish`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username:user.username, answers})
        });
        setExamResult(await res.json()); setView('result');
    }, [activePeriod, answers, user.username]);

    const handleNextSubtest = useCallback(() => {
        const idx = activePeriod.exams.findIndex(e => e.id === activeSubtest.id);
        if(idx < activePeriod.exams.length - 1) {
            alert("Lanjut Subtes Berikutnya");
            const next = activePeriod.exams[idx+1];
            fetch(`${API_URL}/exams/${next.id}/questions`).then(r=>r.json()).then(d=>{
                setQuestions(d); setActiveSubtest(next); setTimeLeft(next.duration*60);
            });
        } else finishExam();
    }, [activePeriod, activeSubtest, finishExam]);

    useEffect(() => {
        if(!activeSubtest || timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(p => p<=1 ? (handleNextSubtest(), 0) : p-1), 1000);
        return () => clearInterval(t);
    }, [timeLeft, activeSubtest, handleNextSubtest]);

    const startExam = (p) => {
        setActivePeriod(p);
        const first = p.exams[0];
        fetch(`${API_URL}/exams/${first.id}/questions`).then(r=>r.json()).then(d=>{
            setQuestions(d); setActiveSubtest(first); setTimeLeft(first.duration*60); setView('exam');
        });
    };

    // --- RENDER RESULT ---
    if(view === 'result' && examResult) {
        const data = Object.keys(examResult.detail).map(k=>({ subj:k, A:examResult.detail[k], full:1000 }));
        return (
            <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
                <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-2xl text-center">
                    <h1 className="text-2xl font-black mb-2">Hasil Ujian</h1>
                    <div className="text-5xl font-black text-indigo-600 mb-6">{examResult.total}</div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer><RadarChart outerRadius={90} data={data}><PolarGrid/><PolarAngleAxis dataKey="subj"/><PolarRadiusAxis/><Radar name="Skor" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6}/></RadarChart></ResponsiveContainer>
                    </div>
                    <button onClick={()=>window.location.reload()} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-6">Kembali</button>
                </div>
            </div>
        );
    }

    // --- RENDER EXAM (RESPONSIVE) ---
    if(view === 'exam' && activeSubtest) {
        return (
            <div className="h-screen flex flex-col bg-white overflow-hidden">
                <header className="bg-slate-900 text-white p-3 flex justify-between items-center z-20 shadow-md">
                    <div className="flex items-center gap-2">
                        {/* Tombol Menu di HP */}
                        <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 bg-slate-800 rounded">
                            {isMobileMenuOpen ? <X size={18}/> : <Menu size={18}/>}
                        </button>
                        <div className="font-bold truncate max-w-[150px] md:max-w-none">{activeSubtest.title}</div>
                    </div>
                    <div className={`font-mono font-bold px-3 py-1 rounded ${timeLeft<300?'bg-red-500':'bg-indigo-600'}`}>
                        {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar Navigasi - Responsive Overlay */}
                    <aside className={`
                        absolute inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-10 transform transition-transform duration-200 ease-in-out
                        md:relative md:translate-x-0
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto h-full pb-20">
                            {questions.map((q,i)=>(
                                <button key={q.id} onClick={()=>{
                                    document.getElementById(`q-${i}`)?.scrollIntoView({behavior:'smooth'});
                                    setIsMobileMenuOpen(false); // Tutup menu di HP setelah klik
                                }} className={`aspect-square rounded border font-bold text-sm ${answers[activeSubtest.id]?.[q.id]?'bg-indigo-600 text-white':'bg-white text-slate-600'}`}>
                                    {i+1}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Area Soal */}
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
                        {questions.map((q,i)=>(
                            <div key={q.id} id={`q-${i}`} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border mb-6">
                                <div className="flex gap-3">
                                    <span className="bg-slate-900 text-white px-2 py-1 rounded text-xs font-bold h-fit">#{i+1}</span>
                                    <div className="flex-1">
                                        {q.wacana && <div className="bg-blue-50 p-3 rounded text-sm italic mb-3 border-l-4 border-blue-500 whitespace-pre-line">{q.wacana}</div>}
                                        <div dangerouslySetInnerHTML={{__html: q.text}} className="text-slate-800 font-medium mb-4"/>
                                        <div className="space-y-2">
                                            {q.q_type==='ISIAN' ? (
                                                <input className="w-full border p-2 rounded" placeholder="Jawaban..." onBlur={e=>setAnswers({...answers,[activeSubtest.id]:{...answers[activeSubtest.id],[q.id]:e.target.value}})}/>
                                            ):(
                                                q.options_json?.map((opt,idx)=>(
                                                    <div key={idx} onClick={()=>setAnswers({...answers,[activeSubtest.id]:{...answers[activeSubtest.id],[q.id]:opt.label}})}
                                                        className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${answers[activeSubtest.id]?.[q.id]===opt.label?'bg-indigo-50 border-indigo-500':'hover:bg-slate-50'}`}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${answers[activeSubtest.id]?.[q.id]===opt.label?'bg-indigo-600 text-white':'bg-slate-200'}`}>{opt.label}</div>
                                                        <div className="text-sm">{opt.text}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleNextSubtest} className="w-full md:w-auto bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg mb-10">Selesai Subtes</button>
                    </main>
                </div>
            </div>
        );
    }

    // --- DASHBOARD HOME ---
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
            {/* Navbar Mobile Friendly */}
            <nav className="bg-white p-4 sticky top-0 z-30 border-b shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg text-white flex items-center justify-center font-bold">C</div>
                    <span className="font-extrabold text-slate-800">CBT PRO</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={()=>setView('home')} className={`p-2 rounded-lg ${view==='home'?'bg-indigo-50 text-indigo-600':''}`}><Home size={20}/></button>
                    <button onClick={()=>setView('lms')} className={`p-2 rounded-lg ${view==='lms'?'bg-indigo-50 text-indigo-600':''}`}><Play size={20}/></button>
                    <button onClick={onLogout} className="text-red-500"><LogOut size={20}/></button>
                </div>
            </nav>

            <main className="p-4 md:p-8 max-w-5xl mx-auto">
                {view === 'home' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-6 rounded-3xl">
                            <h2 className="text-xl font-bold">Halo, {user.full_name}</h2>
                            <p className="text-slate-400 text-sm">Siap ujian hari ini?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {periods.map(p => (
                                <div key={p.id} onClick={()=>startExam(p)} className="bg-white p-6 rounded-2xl shadow-sm border hover:border-indigo-500 cursor-pointer transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-slate-800">{p.name}</h3>
                                        <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded font-bold">{p.exam_type}</span>
                                    </div>
                                    <button className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm mt-2">Mulai Ujian</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {view === 'lms' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {materials.map(m => (
                            <a key={m.id} href={m.content_url} target="_blank" className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"><Play size={20} className="text-indigo-600"/></div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{m.title}</div>
                                    <div className="text-xs text-slate-500">{m.category}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
export default StudentDashboard;