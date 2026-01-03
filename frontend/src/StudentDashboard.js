import React, { useState, useEffect, useCallback } from 'react';
import { Play, Clock, ChevronRight, LogOut, Menu, X, Home, BookOpen } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // --- STATE RESPONSIVE & UJIAN ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeSubtest, setActiveSubtest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [examResult, setExamResult] = useState(null);

    // Load Data Awal
    useEffect(() => {
        fetch(`${API_URL}/periods`).then(r => r.json()).then(data => setPeriods(data)).catch(e => console.error(e));
        fetch(`${API_URL}/lms/materials`).then(r => r.json()).then(data => setMaterials(data)).catch(e => console.error(e));
    }, []);

    // Timer Logic
    const handleNextSubtest = useCallback(() => {
        if (!activePeriod || !activeSubtest) return;
        const currentIdx = activePeriod.exams.findIndex(e => e.id === activeSubtest.id);
        
        if (currentIdx < activePeriod.exams.length - 1) {
            // Lanjut ke subtes berikutnya
            const nextSubtest = activePeriod.exams[currentIdx + 1];
            // Load Manual
            fetch(`${API_URL}/exams/${nextSubtest.id}/questions`)
                .then(r => r.json())
                .then(data => {
                    setQuestions(data);
                    setActiveSubtest(nextSubtest);
                    setTimeLeft(nextSubtest.duration * 60);
                    setIsMobileMenuOpen(false);
                    window.scrollTo(0, 0);
                });
        } else {
            // Selesai semua
            finishExam();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePeriod, activeSubtest]);

    useEffect(() => {
        if (!activeSubtest || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleNextSubtest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, activeSubtest, handleNextSubtest]);

    // Finish Exam Logic
    const finishExam = async () => {
        try {
            const res = await fetch(`${API_URL}/exams/${activePeriod.id}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, answers })
            });
            const result = await res.json();
            setExamResult(result);
            setView('result');
        } catch (error) {
            alert("Gagal mengirim jawaban. Cek koneksi.");
        }
    };

    const startExam = (period) => {
        if (!period.exams || period.exams.length === 0) {
            alert("Paket soal belum siap."); return;
        }
        setActivePeriod(period);
        const subtest = period.exams[0];
        
        fetch(`${API_URL}/exams/${subtest.id}/questions`)
            .then(r => r.json())
            .then(data => {
                setQuestions(data);
                setActiveSubtest(subtest);
                setTimeLeft(subtest.duration * 60);
                setIsMobileMenuOpen(false); 
                setView('exam');
            });
    };

    // --- RENDER HALAMAN HASIL ---
    if (view === 'result' && examResult) {
        const chartData = Object.keys(examResult.detail).map(k => ({ subject: k, A: examResult.detail[k], full: 100 }));
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Hasil Ujian</h2>
                    <div className="text-6xl font-black text-indigo-600 mb-6">{examResult.total}</div>
                    
                    <div className="h-64 w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis />
                                <Radar name="Skor" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <button onClick={()=>window.location.reload()} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-6">Kembali</button>
                </div>
            </div>
        );
    }

    // --- RENDER EXAM (RESPONSIVE) ---
    if (view === 'exam' && activeSubtest) {
        return (
            <div className="h-screen flex flex-col bg-white overflow-hidden">
                <header className="bg-slate-900 text-white p-3 flex justify-between items-center z-20 shadow-md">
                    <div className="flex items-center gap-3">
                        {/* Tombol Menu di HP */}
                        <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 bg-slate-800 rounded text-white">
                            {isMobileMenuOpen ? <X size={18}/> : <Menu size={18}/>}
                        </button>
                        
                        <div className="flex items-center gap-2">
                             <BookOpen size={18} className="text-indigo-400 hidden sm:block"/>
                             <div className="font-bold truncate max-w-[150px] md:max-w-none">{activeSubtest.title}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Clock size={16} className={timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}/>
                        <div className={`font-mono font-bold px-3 py-1 rounded ${timeLeft<300?'bg-red-500':'bg-indigo-600'}`}>
                            {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar Navigasi - Responsive Overlay */}
                    <aside className={`
                        absolute inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-10 transform transition-transform duration-200 ease-in-out
                        md:relative md:translate-x-0
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-500">
                            Nomor Soal
                        </div>
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
                        
                        <div className="flex justify-end pb-10">
                            <button onClick={handleNextSubtest} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                                Selanjutnya <ChevronRight size={18}/>
                            </button>
                        </div>
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
                    <span className="font-extrabold text-slate-800 hidden sm:block">CBT PRO</span>
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
                            <a key={m.id} href={m.content_url} target="_blank" rel="noreferrer" className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
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