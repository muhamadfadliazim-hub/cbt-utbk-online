import React, { useState, useEffect, useCallback } from 'react';
import { Play, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from './config';

// Mock Radar Chart (Pengganti BarChart2 yang error)
const RadarChartMock = () => (
    <div className="w-full h-40 bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-200 text-xs font-bold border border-indigo-500/30">
        ANALISIS KEMAMPUAN (RADAR CHART)
    </div>
);

const StudentDashboard = ({ user, onLogout }) => {
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    
    // Exam State
    const [activeExamId, setActiveExamId] = useState(null);
    const [examContent, setExamContent] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const refresh = useCallback(() => {
        fetch(`${API_URL}/student/data?username=${user.username}`)
            .then(r => r.json())
            .then(setData)
            .catch(() => setData(null));
            
        fetch(`${API_URL}/majors`)
            .then(r => r.json())
            .then(setMajors)
            .catch(() => setMajors([]));
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);

    const saveMajors = () => {
        fetch(`${API_URL}/student/majors`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, m1: selectedMajor.m1, m2: selectedMajor.m2})
        }).then(()=>alert("Jurusan Disimpan!"));
    };

    const startExam = (eid) => {
        if(!window.confirm("Mulai subtes berjalan. Fokus!")) return;
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{
            setExamContent(d); setActiveExamId(eid); setQIdx(0); setTimeLeft(d.duration * 60);
        });
    };

    const submitExam = useCallback(() => {
        if (!activeExamId) return;
        fetch(`${API_URL}/exams/${activeExamId}/submit`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, answers})
        }).then(r=>r.json()).then(res => {
            alert(`Selesai! Skor IRT: ${res.score}`);
            setActiveExamId(null); 
            refresh();
        });
    }, [activeExamId, user.username, answers, refresh]);

    useEffect(() => {
        if(timeLeft > 0 && activeExamId) {
            const t = setInterval(()=>setTimeLeft(p=>p-1), 1000);
            return ()=>clearInterval(t);
        } else if(timeLeft===0 && activeExamId) submitExam();
    }, [timeLeft, activeExamId, submitExam]);

    // --- MODE UJIAN ---
    if(activeExamId && examContent) {
        const q = examContent.questions[qIdx];
        return (
            <div className="h-screen flex flex-col bg-slate-50 font-sans">
                {/* Header Ujian */}
                <div className="h-16 bg-[#0F172A] text-white flex items-center justify-between px-6 shadow-md">
                    <span className="font-bold tracking-wide">{examContent.title}</span>
                    <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded font-mono font-bold text-sm">
                        {/* Clock variable removed, using inline display */}
                        <span>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Panel Kiri: Wacana */}
                    {q.passage && (
                        <div className="w-1/2 p-8 bg-white border-r border-slate-300 overflow-y-auto">
                            <h4 className="font-bold text-slate-400 text-xs mb-4 uppercase tracking-widest">Wacana / Bacaan</h4>
                            <div className="prose max-w-none text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">{q.passage}</div>
                        </div>
                    )}

                    {/* Panel Kanan: Soal */}
                    <div className={`flex-1 p-8 overflow-y-auto bg-[#F8FAFC] ${!q.passage?'max-w-4xl mx-auto':''}`}>
                        {q.media && <img src={q.media} alt="Soal Media" className="max-w-full h-48 object-contain mb-4 border rounded-lg"/>}
                        <p className="text-lg font-medium text-slate-900 mb-6 leading-relaxed">{q.text}</p>
                        
                        {q.type === 'ISIAN' ? (
                            <input className="w-full p-4 border-2 border-slate-300 rounded-xl text-lg font-bold focus:border-indigo-600 outline-none" placeholder="Ketik jawaban singkat..." value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]:e.target.value})}/>
                        ) : (
                            <div className="space-y-3">
                                {q.options.map(o=>(
                                    <button key={o.id} onClick={()=>setAnswers({...answers, [q.id]:o.id})} className={`w-full p-4 text-left border-2 rounded-xl font-medium transition-all ${answers[q.id]===o.id?'border-blue-600 bg-blue-50 text-blue-800':'border-slate-200 bg-white hover:border-blue-300'}`}>
                                        <span className={`inline-block w-6 h-6 text-center rounded-full mr-3 text-xs leading-6 ${answers[q.id]===o.id?'bg-blue-600 text-white':'bg-slate-200 text-slate-600'}`}>{o.id}</span>
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Navigasi */}
                <div className="h-16 bg-white border-t flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="px-4 py-2 border rounded-lg font-bold text-slate-600 flex gap-2 disabled:opacity-50 hover:bg-slate-50"><ChevronLeft size={18}/> Sebelumnya</button>
                    
                    {qIdx === examContent.questions.length-1 ? 
                        <button onClick={submitExam} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition-all">SELESAI UJIAN</button> : 
                        <button onClick={()=>setQIdx(Math.min(examContent.questions.length-1, qIdx+1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex gap-2 hover:bg-blue-700 transition-all">Selanjutnya <ChevronRight size={18}/></button>
                    }
                </div>
            </div>
        )
    }

    if(!data) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Memuat Data...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Profile */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between gap-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Halo, {data.user.full_name}</h1>
                        <p className="text-slate-500 font-medium">Pejuang PTN 2026</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-1/3">
                        <label className="text-xs font-bold text-slate-400 uppercase">Pilihan Jurusan</label>
                        <select className="p-3 border rounded-xl font-bold text-sm bg-slate-50 outline-none focus:border-indigo-500" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}>
                            <option value="">Pilih Jurusan 1</option>
                            {majors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.program} ({m.passing_grade})</option>)}
                        </select>
                        <button onClick={saveMajors} className="bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all">Simpan Pilihan</button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Kiri: Statistik */}
                    <div className="bg-[#0F172A] text-white p-8 rounded-[2.5rem] shadow-xl md:col-span-1 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                        <h3 className="font-bold text-indigo-400 mb-6 flex items-center gap-2">ANALISIS KEMAMPUAN</h3>
                        <RadarChartMock/>
                        <p className="mt-6 text-xs text-slate-400 leading-relaxed border-t border-white/10 pt-4">Grafik ini menunjukkan peta kekuatan Anda berdasarkan hasil Tryout.</p>
                    </div>

                    {/* Kanan: Daftar Ujian */}
                    <div className="md:col-span-2 space-y-6">
                        {data.periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-800">{p.name}</h3>
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold">{p.type}</span>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {p.exams.map(e => (
                                        <div key={e.id} className={`p-5 rounded-2xl border-2 transition-all group ${e.status==='done'?'bg-emerald-50 border-emerald-200 opacity-70':'bg-white border-slate-100 hover:border-indigo-500 hover:shadow-md'}`}>
                                            <p className="font-bold text-sm text-slate-700 mb-4 truncate">{e.title}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-400 font-bold">{e.duration} m</span>
                                                {e.status==='done' ? (
                                                    <span className="text-emerald-600 font-black text-lg">{e.score}</span>
                                                ) : (
                                                    <button onClick={()=>startExam(e.id)} className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg hover:scale-110 transition-all"><Play size={14}/></button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={onLogout} className="fixed bottom-8 right-8 bg-rose-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50"><LogOut/></button>
        </div>
    );
};

export default StudentDashboard;