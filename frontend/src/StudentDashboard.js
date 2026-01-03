import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, LogOut, ChevronLeft, ChevronRight, Clock, Volume2 } from 'lucide-react';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [periods, setPeriods] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const loadPeriods = useCallback(() => {
        fetch(`${API_URL}/student/periods?username=${user.username}`)
            .then(r => r.json())
            .then(d => setPeriods(Array.isArray(d) ? d : []))
            .catch(() => setPeriods([]));
    }, [user.username]);

    useEffect(() => { loadPeriods(); }, [loadPeriods]);

    const submitJawaban = useCallback(() => {
        if (!activeExam) return;
        fetch(`${API_URL}/exams/${activeExam}/submit`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, answers })
        }).then(() => { alert("Subtes Selesai! Skor IRT Dihitung."); setActiveExam(null); loadPeriods(); });
    }, [activeExam, user.username, answers, loadPeriods]);

    useEffect(() => {
        if (timeLeft > 0 && activeExam) {
            const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && activeExam) { submitJawaban(); }
    }, [timeLeft, activeExam, submitJawaban]);

    const startExam = (eid) => {
        if (!window.confirm("Mulai subtes ini? Waktu akan dikunci.")) return;
        fetch(`${API_URL}/exams/${eid}`).then(r => r.json()).then(d => {
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
            <div className="h-screen flex flex-col bg-slate-100 font-sans">
                {/* Header SNBT Style */}
                <div className="bg-[#0F172A] text-white h-16 flex items-center justify-between px-6 shadow-md z-20">
                    <div className="font-bold text-lg tracking-wide">EDUPRIME CBT SYSTEM</div>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 px-4 py-1 rounded text-sm font-bold flex items-center gap-2">
                            <Clock size={16}/> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                        </div>
                    </div>
                </div>

                {/* Main Exam Area: Split View for Passage */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Panel Kiri: Wacana (Jika Ada) */}
                    {q?.passage && (
                        <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-300 bg-white">
                            <h3 className="font-bold text-slate-500 mb-4 uppercase text-xs tracking-widest">Wacana / Bacaan</h3>
                            <div className="prose max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                                {q.passage}
                            </div>
                        </div>
                    )}

                    {/* Panel Kanan: Soal & Opsi */}
                    <div className={`flex-1 p-8 overflow-y-auto bg-[#F8FAFC] ${!q?.passage ? 'max-w-4xl mx-auto' : ''}`}>
                        <div className="mb-6 flex justify-between">
                            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded text-xs font-bold">SOAL NO {currentQIdx + 1}</span>
                        </div>

                        {/* Media Support */}
                        {q?.media_type === 'image' && q.media_url && (
                            <img src={q.media_url} alt="Soal" className="max-w-full h-auto rounded-lg mb-6 shadow-sm border"/>
                        )}
                        {q?.media_type === 'audio' && q.media_url && (
                            <div className="bg-indigo-50 p-4 rounded-xl mb-6 flex items-center gap-4 border border-indigo-100">
                                <Volume2 className="text-indigo-600"/>
                                <audio controls src={q.media_url} className="w-full"/>
                            </div>
                        )}

                        <div className="text-xl font-medium text-slate-900 mb-8 leading-relaxed">{q?.text}</div>

                        <div className="space-y-3">
                            {q?.options?.map((o, i) => (
                                <button key={i} onClick={() => setAnswers({...answers, [q.id]: o.id})} 
                                    className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${answers[q.id]===o.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${answers[q.id]===o.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{o.id}</div>
                                    <span className="mt-1 text-slate-700 font-medium">{o.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <button onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} disabled={currentQIdx === 0} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 font-bold text-sm flex items-center gap-2"><ChevronLeft size={16}/> SEBELUMNYA</button>
                    
                    <div className="hidden md:flex gap-1">
                        {questions.map((_, i) => (
                            <div key={i} className={`w-8 h-2 rounded-full cursor-pointer ${i === currentQIdx ? 'bg-blue-600' : answers[questions[i].id] ? 'bg-emerald-400' : 'bg-slate-200'}`} onClick={() => setCurrentQIdx(i)}></div>
                        ))}
                    </div>

                    {currentQIdx === questions.length - 1 ? (
                        <button onClick={submitJawaban} className="px-8 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm shadow-lg shadow-emerald-200">SELESAI UJIAN</button>
                    ) : (
                        <button onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm flex items-center gap-2">SELANJUTNYA <ChevronRight size={16}/></button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-[#0F172A] text-white py-6 px-8 flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-2xl font-black italic">EDUPRIME</h1>
                    <p className="text-[10px] uppercase tracking-widest text-indigo-400">Computer Based Test</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right"><p className="font-bold text-sm">{user.name}</p><p className="text-xs text-slate-400">Peserta Ujian</p></div>
                    <button onClick={onLogout} className="bg-white/10 p-3 rounded-xl hover:bg-rose-600 transition-all"><LogOut size={18}/></button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-8 space-y-10">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {periods.map(p => (
                        <div key={p.id} className="col-span-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                            <div className="bg-slate-900 p-6 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                                <span className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold">{p.type}</span>
                            </div>
                            <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {p.exams?.map(e => (
                                    <div key={e.id} className={`border rounded-2xl p-6 relative overflow-hidden transition-all ${e.is_done ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:border-blue-400 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{e.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{e.duration} Menit &bull; {p.type === 'UTBK' ? 'IRT Scoring' : 'Standard'}</p>
                                            </div>
                                            {e.is_done ? <CheckCircle className="text-emerald-500"/> : <Clock className="text-blue-500"/>}
                                        </div>
                                        {e.is_done ? (
                                            <div className="w-full py-3 bg-emerald-100 text-emerald-700 text-center rounded-xl font-bold text-sm cursor-not-allowed">SELESAI</div>
                                        ) : (
                                            <button onClick={() => startExam(e.id)} className="w-full py-3 bg-blue-600 text-white text-center rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">KERJAKAN</button>
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