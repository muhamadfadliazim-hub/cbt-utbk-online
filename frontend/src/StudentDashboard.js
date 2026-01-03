import React, { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, LogOut, ChevronLeft, ChevronRight, 
    Home, Play, Clock, Trophy, BookOpen
} from 'lucide-react';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [tab, setTab] = useState('home');
    const [periods, setPeriods] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    // Load Data Periods Ujian
    const loadPeriods = useCallback(() => {
        fetch(`${API_URL}/student/periods?username=${user.username}`)
            .then(r => r.json())
            .then(data => setPeriods(Array.isArray(data) ? data : []))
            .catch(() => setPeriods([]));
    }, [user.username]);

    useEffect(() => {
        loadPeriods();
    }, [loadPeriods]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft > 0 && activeExam) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && activeExam) {
            submitJawaban();
        }
    }, [timeLeft, activeExam]);

    // Fungsi Mulai Ujian
    const startExam = (eid) => {
        if (!window.confirm("Mulai ujian sekarang? Waktu akan otomatis berjalan.")) return;
        fetch(`${API_URL}/exams/${eid}`)
            .then(r => r.json())
            .then(d => {
                setQuestions(d.questions || []);
                setTimeLeft((d.duration || 60) * 60);
                setActiveExam(eid);
                setCurrentQIdx(0);
                setAnswers({});
            });
    };

    // Fungsi Submit Jawaban Akhir
    const submitJawaban = () => {
        fetch(`${API_URL}/exams/${activeExam}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, answers })
        }).then(() => {
            alert("Ujian Selesai! Hasil Anda sedang diproses.");
            setActiveExam(null);
            loadPeriods();
        });
    };

    // TAMPILAN SAAT SEDANG UJIAN (CBT MODE)
    if (activeExam) {
        const q = questions[currentQIdx];
        return (
            <div className="h-screen flex flex-col bg-[#020617] text-white font-sans">
                {/* Header Ujian */}
                <div className="h-20 border-b border-white/10 flex justify-between items-center px-10 bg-[#0F172A]">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 px-4 py-2 rounded-xl font-black text-xl">{currentQIdx + 1}</div>
                        <span className="text-slate-400 font-bold hidden md:block">DARI {questions.length} SOAL</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-[2rem] border border-indigo-500/30 text-indigo-400">
                        <Clock size={20} className="animate-pulse"/>
                        <span className="font-mono text-2xl font-black">
                            {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                        </span>
                    </div>
                    <button onClick={submitJawaban} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-2 rounded-xl font-black transition-all shadow-lg shadow-emerald-900/20">SUBMIT</button>
                </div>

                {/* Area Soal */}
                <div className="flex-1 p-8 md:p-16 overflow-y-auto bg-[#020617]">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {q?.reading_material && (
                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-slate-300 italic leading-relaxed shadow-inner">
                                {q.reading_material}
                            </div>
                        )}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold leading-snug">{q?.text}</h2>
                            <div className="grid gap-4">
                                {q?.options?.map((o, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setAnswers({...answers, [q.id]: o.id})}
                                        className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center gap-6 ${answers[q.id] === o.id ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-white/5 border-transparent hover:border-white/20'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${answers[q.id] === o.id ? 'bg-white text-indigo-600' : 'bg-white/10 text-slate-400'}`}>{o.id}</div>
                                        <span className="text-xl font-medium">{o.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Navigasi Ujian */}
                <div className="h-24 border-t border-white/10 bg-[#0F172A] flex justify-between items-center px-12">
                    <button 
                        onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} 
                        disabled={currentQIdx === 0}
                        className="p-5 bg-white/5 rounded-full disabled:opacity-20 hover:bg-white/10 transition-all"
                    >
                        <ChevronLeft size={32}/>
                    </button>
                    <div className="flex gap-2 overflow-x-auto max-w-md hidden md:flex">
                        {questions.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${answers[questions[i].id] ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))}
                        disabled={currentQIdx === questions.length - 1}
                        className="p-5 bg-indigo-600 rounded-full disabled:opacity-20 hover:bg-indigo-500 transition-all shadow-lg"
                    >
                        <ChevronRight size={32}/>
                    </button>
                </div>
            </div>
        );
    }

    // TAMPILAN DASHBOARD UTAMA
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-24 md:pb-0">
            {/* Header Dashboard */}
            <div className="bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 px-10 py-6 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-3xl font-black text-white tracking-tighter italic">EDU<span className="text-indigo-400">PRIME</span></h1>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white">{user.name}</p>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Student Portal</p>
                    </div>
                    <button onClick={onLogout} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all"><LogOut/></button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8 space-y-16">
                {tab === 'home' && (
                    <div className="space-y-16 animate-in fade-in duration-700">
                        {/* Welcome Card */}
                        <div className="bg-gradient-to-br from-indigo-900 to-[#020617] rounded-[4rem] p-12 text-white border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <span className="bg-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Academic Excellence</span>
                                <h2 className="text-6xl font-black tracking-tighter leading-none">Ready for your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-serif italic">Final Exam?</span></h2>
                                <p className="text-slate-400 text-lg max-w-md font-light">Sistem Simulasi Ujian Standar Nasional dengan Algoritma Penilaian IRT.</p>
                            </div>
                            <Trophy size={300} className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"/>
                        </div>

                        {/* Daftar Paket Ujian */}
                        <div className="grid gap-10 md:grid-cols-2">
                            {periods.map(p => (
                                <div key={p.id} className="bg-[#0F172A] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="bg-indigo-600/20 text-indigo-400 p-4 rounded-2xl font-black text-2xl">{p.name[0]}</div>
                                        <span className="bg-slate-900 text-indigo-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">{p.type} SYSTEM</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">{p.name}</h3>
                                    <div className="space-y-4">
                                        {p.exams?.map(e => (
                                            <div key={e.id} className="flex justify-between items-center p-8 bg-white/[0.03] rounded-[2.5rem] hover:bg-indigo-600 transition-all duration-300 group">
                                                <div>
                                                    <p className="font-black text-white text-xl tracking-tight">{e.title}</p>
                                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-indigo-200">{e.duration} MENIT &bull; IRT ACTIVE</p>
                                                </div>
                                                {e.is_done ? (
                                                    <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-full border border-emerald-500/30"><CheckCircle size={24}/></div>
                                                ) : (
                                                    <button onClick={() => startExam(e.id)} className="bg-white text-indigo-950 p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                                        <Play size={24} fill="currentColor" className="ml-1"/>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Nav */}
            <div className="md:hidden fixed bottom-0 w-full bg-[#020617]/90 backdrop-blur-3xl border-t border-white/10 p-8 flex justify-around items-center z-50 rounded-t-[3rem]">
                <button onClick={() => setTab('home')} className={`transition-all ${tab === 'home' ? 'text-indigo-400 scale-150' : 'text-slate-600'}`}><Home/></button>
                <button onClick={() => setTab('lms')} className={`transition-all ${tab === 'lms' ? 'text-indigo-400 scale-150' : 'text-slate-600'}`}><BookOpen/></button>
            </div>

            <footer className="hidden md:block py-20 text-center text-slate-700 border-t border-white/5 bg-[#020617] mt-40">
                <p className="font-black text-[12px] tracking-[1em] uppercase text-slate-600 mb-6">EduPrime Imperial Assessment</p>
                <p className="text-2xl font-black text-white tracking-tighter uppercase opacity-80">MUHAMAD FADLI AZIM</p>
            </footer>
        </div>
    );
};

export default StudentDashboard;