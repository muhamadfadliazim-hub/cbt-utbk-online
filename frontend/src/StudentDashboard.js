import React, { useState, useEffect, useCallback } from 'react';
import { Play, Clock, Menu, LayoutDashboard, BookOpen, LogOut, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
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
        fetch(`${API_URL}/periods`).then(r => r.json()).then(setPeriods).catch(()=>{});
        fetch(`${API_URL}/lms/materials`).then(r => r.json()).then(setMaterials).catch(()=>{});
    }, []);

    const handleNextSubtest = useCallback(() => {
        if (!activePeriod || !activeSubtest) return;
        const idx = activePeriod.exams.findIndex(e => e.id === activeSubtest.id);
        if (idx < activePeriod.exams.length - 1) {
            const next = activePeriod.exams[idx + 1];
            fetch(`${API_URL}/exams/${next.id}/questions`).then(r=>r.json()).then(d=>{
                setQuestions(d); setActiveSubtest(next); setTimeLeft(next.duration * 60); window.scrollTo(0,0);
            });
        } else {
            finishExam();
        }
        // eslint-disable-next-line
    }, [activePeriod, activeSubtest]);

    const finishExam = async () => {
        try {
            const res = await fetch(`${API_URL}/exams/${activePeriod.id}/finish`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, answers })
            });
            const result = await res.json();
            setExamResult(result); setView('result');
        } catch(e){ alert("Gagal kirim jawaban"); }
    };

    useEffect(() => {
        if (!activeSubtest || timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(p => p<=1 ? (handleNextSubtest(),0) : p-1), 1000);
        return () => clearInterval(t);
    }, [timeLeft, activeSubtest, handleNextSubtest]);

    const startExam = (p) => {
        if(!p.exams.length) return alert("Belum ada soal");
        setActivePeriod(p);
        const sub = p.exams[0];
        fetch(`${API_URL}/exams/${sub.id}/questions`).then(r=>r.json()).then(d=>{
            setQuestions(d); setActiveSubtest(sub); setTimeLeft(sub.duration*60); setView('exam');
        });
    };

    // --- HASIL UJIAN (Premium Chart) ---
    if (view === 'result' && examResult) {
        const data = Object.keys(examResult.detail).map(k => ({ subj: k, A: examResult.detail[k], full: 100 }));
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
                <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4 shadow-lg shadow-emerald-200">
                            <GraduationCap size={40}/>
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Hasil Analisis Kemampuan</h2>
                        <p className="text-slate-500">Laporan performa berbasis Item Response Theory (IRT)</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 h-80 w-full">
                            <ResponsiveContainer><RadarChart outerRadius={110} data={data}><PolarGrid stroke="#e2e8f0"/><PolarAngleAxis dataKey="subj" tick={{fontSize:11, fontWeight:'bold', fill:'#64748b'}}/><PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1"/><Radar name="Skor" dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#6366f1" fillOpacity={0.3}/></RadarChart></ResponsiveContainer>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Skor Prediksi</div>
                                 <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{examResult.total}</div>
                             </div>
                             <button onClick={()=>window.location.reload()} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-xl transform active:scale-95">Kembali ke Dashboard</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MODE UJIAN (Focus Mode) ---
    if (view === 'exam' && activeSubtest) {
        return (
            <div className="h-screen flex flex-col bg-[#f8fafc] font-sans">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex justify-between items-center z-30 fixed top-0 w-full">
                    <div className="flex items-center gap-4">
                        <button onClick={()=>setSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 bg-slate-100 rounded-lg"><Menu size={20}/></button>
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg leading-none">{activeSubtest.title}</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{activePeriod.name}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg shadow-sm border ${timeLeft<300?'bg-red-50 text-red-600 border-red-200 animate-pulse':'bg-white text-indigo-600 border-indigo-100'}`}>
                        <Clock size={20}/>
                        {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                    </div>
                </header>

                <div className="flex-1 flex pt-20 h-full">
                    {/* Sidebar Navigasi */}
                    <aside className={`
                        fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-200 z-20 transform transition-transform duration-300 ease-in-out pt-24 shadow-2xl md:shadow-none
                        md:relative md:translate-x-0 md:pt-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Navigasi Soal</h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {questions.map((q,i)=>(
                                        <button key={q.id} onClick={()=>{
                                            document.getElementById(`q-${i}`)?.scrollIntoView({behavior:'smooth'});
                                            setSidebarOpen(false);
                                        }} className={`aspect-square rounded-xl font-bold text-sm border-2 transition-all ${answers[activeSubtest.id]?.[q.id]?'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200':'bg-white text-slate-500 border-slate-100 hover:border-indigo-300'}`}>
                                            {i+1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <button onClick={handleNextSubtest} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition shadow-xl shadow-emerald-200 flex justify-center items-center gap-2">
                                    Selesai Bagian Ini <ArrowRight size={18}/>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Area Soal */}
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth pb-32">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {questions.map((q,i)=>(
                                <div key={q.id} id={`q-${i}`} className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex gap-6">
                                        <span className="shrink-0 bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold shadow-lg shadow-slate-200">{i+1}</span>
                                        <div className="flex-1">
                                            {q.wacana && <div className="bg-blue-50/50 p-6 rounded-2xl text-sm leading-7 text-slate-700 border border-blue-100 mb-6 whitespace-pre-line font-medium">{q.wacana}</div>}
                                            <div dangerouslySetInnerHTML={{__html: q.text}} className="text-xl text-slate-800 font-medium mb-8 leading-relaxed"/>
                                            
                                            <div className="space-y-3">
                                                {q.q_type==='ISIAN'?(
                                                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-lg focus:bg-white focus:border-indigo-500 outline-none transition-colors" placeholder="Ketik jawaban Anda..." onBlur={e=>setAnswers({...answers,[activeSubtest.id]:{...answers[activeSubtest.id],[q.id]:e.target.value}})}/>
                                                ):(
                                                    q.options_json?.map((opt,idx)=>(
                                                        <div key={idx} onClick={()=>setAnswers({...answers,[activeSubtest.id]:{...answers[activeSubtest.id],[q.id]:opt.label}})}
                                                            className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all group ${answers[activeSubtest.id]?.[q.id]===opt.label?'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20':'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-transform duration-300 ${answers[activeSubtest.id]?.[q.id]===opt.label?'bg-indigo-600 text-white scale-110':'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>{opt.label}</div>
                                                            <div className={`text-base font-medium ${answers[activeSubtest.id]?.[q.id]===opt.label?'text-indigo-900':'text-slate-600'}`}>{opt.text}</div>
                                                            {answers[activeSubtest.id]?.[q.id]===opt.label && <CheckCircle className="ml-auto text-indigo-600" size={20}/>}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // --- DASHBOARD UTAMA (Grid Mewah) ---
    return (
        <div className="min-h-screen flex text-slate-800">
            {/* Sidebar Dark Glass */}
            <aside className="hidden md:flex w-72 glass-dark flex-col fixed h-full z-20 text-white">
                <div className="p-8">
                    <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <BookOpen size={20} className="text-white"/>
                        </div>
                        CBT PRO
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button onClick={()=>setView('home')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${view==='home'?'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 translate-x-2':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <LayoutDashboard size={22}/> Dashboard
                    </button>
                    <button onClick={()=>setView('lms')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${view==='lms'?'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 translate-x-2':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <Play size={22}/> Materi Belajar
                    </button>
                </nav>
                <div className="p-6 border-t border-white/10">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md mb-4 flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                            {user.username.substring(0,2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-sm truncate">{user.full_name}</div>
                            <div className="text-xs text-slate-400">Peserta Ujian</div>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl transition font-bold text-sm"><LogOut size={16}/> Sign Out</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900/90 backdrop-blur-md text-white z-40 p-4 flex justify-between items-center shadow-2xl">
                 <div className="font-black text-xl tracking-tight">CBT PRO</div>
                 <div className="flex gap-4">
                    <button onClick={onLogout}><LogOut size={20} className="text-red-400"/></button>
                 </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 p-6 md:p-12 pt-24 md:pt-12 overflow-x-hidden">
                {view === 'home' && (
                    <div className="max-w-6xl mx-auto fade-in-up">
                        <div className="glass p-10 rounded-3xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                            <div className="relative z-10">
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Halo, {user.full_name} 👋</h1>
                                <p className="text-slate-500 text-lg">Siap untuk menguji kemampuanmu hari ini?</p>
                            </div>
                            <div className="relative z-10 hidden md:block">
                                <span className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-full font-bold text-sm">Status: Aktif</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen size={20} className="text-indigo-600"/> Paket Ujian Tersedia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {periods.map(p => (
                                <div key={p.id} onClick={()=>startExam(p)} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                        <BookOpen size={120} className="text-indigo-600"/>
                                    </div>
                                    <div className="relative z-10">
                                        <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase mb-6 ${p.exam_type==='UTBK'?'bg-blue-100 text-blue-700':p.exam_type==='CPNS'?'bg-orange-100 text-orange-700':'bg-purple-100 text-purple-700'}`}>
                                            {p.exam_type}
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{p.name}</h3>
                                        <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mb-8">
                                            <span className="flex items-center gap-1"><LayoutDashboard size={14}/> {p.exams.length} Subtes</span>
                                            <span className="flex items-center gap-1"><Clock size={14}/> {p.exams.reduce((a,b)=>a+b.duration,0)} Menit</span>
                                        </div>
                                        <button className="w-full py-4 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl font-bold text-slate-700 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                                            Mulai Sekarang <ArrowRight size={18}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {view === 'lms' && (
                    <div className="max-w-6xl mx-auto fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-900 mb-8">Pustaka Materi</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map(m => (
                                <a key={m.id} href={m.content_url} target="_blank" rel="noreferrer" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 shadow-inner">
                                        <Play size={24} className="text-indigo-600 group-hover:text-white transition-colors" fill="currentColor"/>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{m.category}</div>
                                        <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors mb-2">{m.title}</h3>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-sm font-bold text-indigo-600">
                                        <span>Tonton Video</span>
                                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
export default StudentDashboard;