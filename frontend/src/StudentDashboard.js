import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, LogOut, ChevronLeft, ChevronRight, Home, Play, Clock, Trophy, BookOpen } from 'lucide-react';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [tab, setTab] = useState('home');
    const [periods, setPeriods] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const loadPeriods = useCallback(() => {
        fetch(`${API_URL}/student/periods?username=${user.username}`)
            .then(r => r.json())
            .then(data => setPeriods(Array.isArray(data) ? data : []))
            .catch(() => setPeriods([]));
    }, [user.username]);

    useEffect(() => { loadPeriods(); }, [loadPeriods]);

    const submitJawaban = useCallback(() => {
        if (!activeExam) return;
        fetch(`${API_URL}/exams/${activeExam}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, answers })
        }).then(() => {
            alert("Ujian Selesai!");
            setActiveExam(null);
            loadPeriods();
        });
    }, [activeExam, user.username, answers, loadPeriods]);

    useEffect(() => {
        if (timeLeft > 0 && activeExam) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && activeExam) {
            submitJawaban();
        }
    }, [timeLeft, activeExam, submitJawaban]);

    const startExam = (eid) => {
        if (!window.confirm("Mulai ujian sekarang?")) return;
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

    if (activeExam) {
        const q = questions[currentQIdx];
        return (
            <div className="h-screen flex flex-col bg-[#020617] text-white font-sans">
                <div className="h-20 border-b border-white/10 flex justify-between items-center px-10 bg-[#0F172A]">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 px-4 py-2 rounded-xl font-black text-xl">{currentQIdx + 1}</div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-[2rem] border border-indigo-500/30 text-indigo-400">
                        <Clock size={20}/><span className="font-mono text-2xl font-black">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
                    </div>
                    <button onClick={submitJawaban} className="bg-emerald-600 px-8 py-2 rounded-xl font-black">SUBMIT</button>
                </div>
                <div className="flex-1 p-8 md:p-16 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-10">
                        <h2 className="text-3xl font-bold leading-snug">{q?.text}</h2>
                        <div className="grid gap-4">
                            {q?.options?.map((o, i) => (
                                <button key={i} onClick={() => setAnswers({...answers, [q.id]: o.id})} className={`p-6 rounded-[2rem] border-2 text-left flex items-center gap-6 ${answers[q.id] === o.id ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-white/5 border-transparent'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${answers[q.id] === o.id ? 'bg-white text-indigo-600' : 'bg-white/10'}`}>{o.id}</div>
                                    <span className="text-xl font-medium">{o.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="h-24 border-t border-white/10 flex justify-between items-center px-12">
                    <button onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} className="p-5 bg-white/5 rounded-full"><ChevronLeft size={32}/></button>
                    <button onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))} className="p-5 bg-indigo-600 rounded-full shadow-lg"><ChevronRight size={32}/></button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-24 md:pb-0">
            <div className="bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 px-10 py-6 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">EduPrime</h1>
                <button onClick={onLogout} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all"><LogOut/></button>
            </div>
            <main className="max-w-7xl mx-auto p-8 space-y-16">
                <div className="bg-gradient-to-br from-indigo-900 to-[#020617] rounded-[4rem] p-12 text-white border border-white/10 shadow-2xl relative overflow-hidden">
                    <h2 className="text-6xl font-black tracking-tighter leading-none mb-4">Ready for <br/><span className="text-indigo-400 italic">Imperial Exam?</span></h2>
                    <p className="text-slate-400 text-lg max-w-md font-light">Sistem Simulasi Ujian Standar Nasional dengan Algoritma Penilaian IRT.</p>
                    <Trophy size={300} className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"/>
                </div>
                <div className="grid gap-10 md:grid-cols-2">
                    {periods.map(p => (
                        <div key={p.id} className="bg-[#0F172A] p-10 rounded-[3.5rem] border border-white/5">
                            <h3 className="text-3xl font-bold text-white mb-8">{p.name}</h3>
                            <div className="space-y-4">
                                {p.exams?.map(e => (
                                    <div key={e.id} className="flex justify-between items-center p-8 bg-white/[0.03] rounded-[2.5rem] hover:bg-indigo-600 transition-all group">
                                        <p className="font-black text-white text-xl tracking-tight">{e.title}</p>
                                        {e.is_done ? (
                                            <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-full border border-emerald-500/30"><CheckCircle size={24}/></div>
                                        ) : (
                                            <button onClick={() => startExam(e.id)} className="bg-white text-indigo-950 p-5 rounded-full shadow-2xl"><Play size={24} fill="currentColor" className="ml-1"/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;