import React, { useState, useEffect, useCallback } from 'react';
import { Play, BarChart2, LogOut, ChevronLeft, ChevronRight, Home, BookOpen, Award, FileText } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Render Soal Helper (Regex Fixed)
const RenderSoal = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^\$]+\$)/g); // Fixed
    return (
        <span className="text-lg leading-loose text-slate-800 font-serif">
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

const RadarChartMock = () => <div className="w-full h-40 bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-200 text-xs font-bold border border-indigo-500/30">ANALISIS KEMAMPUAN</div>;

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    
    // Exam
    const [activeExamId, setActiveExamId] = useState(null);
    const [examContent, setExamContent] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const refresh = useCallback(() => {
        fetch(`${API_URL}/student/data?username=${user.username}`).then(r=>r.json()).then(setData);
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(setMajors);
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);

    const saveMajors = () => {
        fetch(`${API_URL}/student/majors`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, m1: selectedMajor.m1, m2: selectedMajor.m2})
        }).then(()=>alert("Target Disimpan!"));
    };

    const startExam = (eid) => {
        if(!window.confirm("Waktu berjalan. Fokus!")) return;
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
            alert(`Ujian Selesai! Skor: ${res.score}`);
            setActiveExamId(null); refresh();
        });
    }, [activeExamId, user.username, answers, refresh]);

    useEffect(() => {
        if(timeLeft > 0 && activeExamId) {
            const t = setInterval(()=>setTimeLeft(p=>p-1), 1000);
            return ()=>clearInterval(t);
        } else if(timeLeft===0 && activeExamId) {
            alert("WAKTU HABIS! Jawaban tersimpan otomatis.");
            submitExam();
        }
    }, [timeLeft, activeExamId, submitExam]);

    // EXAM MODE
    if(activeExamId && examContent) {
        const q = examContent.questions[qIdx];
        return (
            <div className="h-screen flex flex-col bg-white font-sans">
                <div className="h-14 bg-[#0F172A] text-white flex items-center justify-between px-6 shadow-md z-50">
                    <div className="font-bold text-sm tracking-wider">{examContent.title}</div>
                    <div className="bg-blue-600 px-4 py-1 rounded text-lg font-mono font-bold">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    {q.passage && (
                        <div className="w-1/2 h-full overflow-y-auto p-8 border-r-4 border-slate-200 bg-[#F8FAFC]">
                            <span className="bg-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase mb-4 inline-block">Wacana</span>
                            <div className="prose max-w-none text-slate-800 leading-8 font-serif whitespace-pre-wrap text-justify"><RenderSoal text={q.passage}/></div>
                        </div>
                    )}
                    <div className={`h-full overflow-y-auto p-8 bg-white ${q.passage ? 'w-1/2' : 'w-full max-w-5xl mx-auto'}`}>
                        {q.media && <img src={q.media} alt="Soal" className="max-h-64 object-contain mb-6 border rounded-lg"/>}
                        <div className="mb-8"><RenderSoal text={q.text}/></div>
                        {q.type === 'ISIAN' ? (
                            <input className="w-full p-4 border-2 rounded-xl text-xl font-bold focus:border-blue-600 outline-none" placeholder="Jawaban..." value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]:e.target.value})}/>
                        ) : (
                            <div className="space-y-3">
                                {q.options.map(o=>(
                                    <button key={o.id} onClick={()=>setAnswers({...answers, [q.id]:o.id})} className={`w-full p-4 text-left border-2 rounded-xl flex gap-4 transition-all hover:bg-slate-50 ${answers[q.id]===o.id ? 'border-blue-600 bg-blue-50 ring-2' : 'border-slate-200'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${answers[q.id]===o.id ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>{o.id}</div>
                                        <div className="mt-1"><RenderSoal text={o.label}/></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="h-16 border-t bg-slate-50 flex items-center justify-between px-8 z-50">
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="px-5 py-2 border rounded-lg font-bold hover:bg-slate-100 disabled:opacity-50"><ChevronLeft/></button>
                    {qIdx === examContent.questions.length-1 ? 
                        <button onClick={submitExam} className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-lg hover:bg-emerald-700">SELESAI</button> : 
                        <button onClick={()=>setQIdx(Math.min(examContent.questions.length-1, qIdx+1))} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold"><ChevronRight/></button>
                    }
                </div>
            </div>
        )
    }

    if(!data) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Memuat Data V37...</div>;

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans pb-24">
            <div className="bg-white p-6 shadow-sm mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-black text-slate-800">EduPrime</h1>
                <div className="flex gap-4 items-center">
                    <p className="font-bold text-sm">{data.user.full_name}</p>
                    <button onClick={onLogout} className="bg-rose-50 p-2 rounded-lg text-rose-600"><LogOut size={18}/></button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {view === 'home' && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between gap-4">
                            <div><h2 className="font-bold text-lg">Target Kampus</h2><p className="text-xs text-slate-500">Pilih jurusan impianmu untuk analisis peluang.</p></div>
                            <div className="flex gap-2">
                                <select className="p-2 border rounded-lg text-sm font-bold w-64" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}>
                                    <option value="">Pilihan 1</option>{majors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.program}</option>)}
                                </select>
                                <button onClick={saveMajors} className="bg-indigo-600 text-white px-4 rounded-lg font-bold text-xs">SIMPAN</button>
                            </div>
                        </div>
                        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div><h3 className="font-bold mb-2"><BarChart2 className="inline mr-2"/> Analisis Kemampuan</h3><p className="text-xs text-indigo-300">Grafik perkembangan skor Tryout Anda.</p></div>
                                <RadarChartMock/>
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {data.periods.map(p => (
                                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border">
                                    <h3 className="font-black text-lg mb-4">{p.name} <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-1 rounded ml-2">{p.type}</span></h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {p.exams.map(e => (
                                            <div key={e.id} className={`p-4 rounded-xl border-2 transition-all ${e.status==='done'?'bg-emerald-50 border-emerald-100':'bg-white hover:border-indigo-500'}`}>
                                                <p className="font-bold text-sm truncate mb-2">{e.title}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-400">{e.duration}m</span>
                                                    {e.status==='done' ? <span className="text-emerald-600 font-black">{e.score}</span> : <button onClick={()=>startExam(e.id)} className="bg-indigo-600 text-white p-2 rounded-lg"><Play size={14}/></button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'results' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Award className="text-emerald-500"/> Riwayat Hasil Ujian</h2>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
                                <tr><th className="p-4">Nama Ujian</th><th className="p-4">Tanggal</th><th className="p-4">Benar</th><th className="p-4">Skor IRT</th></tr>
                            </thead>
                            <tbody>
                                {data.history && data.history.length > 0 ? data.history.map((h, i) => (
                                    <tr key={i} className="border-b hover:bg-slate-50">
                                        <td className="p-4 font-bold">{h.exam}</td>
                                        <td className="p-4 text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-mono">{h.correct}</td>
                                        <td className="p-4 font-black text-emerald-600 text-lg">{h.score}</td>
                                    </tr>
                                )) : <tr><td colSpan="4" className="p-8 text-center text-slate-400">Belum ada riwayat ujian.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'lms' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black flex items-center gap-3"><BookOpen className="text-blue-500"/> Materi Belajar</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {data.materials && data.materials.length > 0 ? data.materials.map(m => (
                                <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${m.type==='video'?'bg-rose-50 text-rose-500':'bg-blue-50 text-blue-500'}`}><FileText size={24}/></div>
                                        <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded">{m.category}</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{m.title}</h3>
                                    <button onClick={()=>window.open(m.content_url)} className="w-full mt-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-50">PELAJARI SEKARANG</button>
                                </div>
                            )) : <p className="text-slate-400">Belum ada materi.</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button onClick={()=>setView('home')} className={`flex flex-col items-center gap-1 text-xs font-bold ${view==='home'?'text-indigo-600':'text-slate-400'}`}><Home size={20}/> Beranda</button>
                <button onClick={()=>setView('results')} className={`flex flex-col items-center gap-1 text-xs font-bold ${view==='results'?'text-indigo-600':'text-slate-400'}`}><Award size={20}/> Hasil</button>
                <button onClick={()=>setView('lms')} className={`flex flex-col items-center gap-1 text-xs font-bold ${view==='lms'?'text-indigo-600':'text-slate-400'}`}><BookOpen size={20}/> LMS</button>
            </div>
        </div>
    );
};

export default StudentDashboard;