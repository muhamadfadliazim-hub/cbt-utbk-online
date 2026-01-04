import React, { useState, useEffect, useCallback } from 'react';
import { Play, BarChart2, LogOut, ChevronLeft, ChevronRight, Home, BookOpen, Award, FileText, XCircle, CheckCircle, Video, File } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// --- PERBAIKAN 1: SOAL TIDAK MENJADI PARAGRAF (whitespace-pre-wrap) ---
const RenderSoal = ({ text }) => {
    if (!text) return null;
    // Regex memisahkan LaTeX ($...$) dan Teks biasa
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="whitespace-pre-wrap leading-relaxed"> 
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
    
    // Filter State
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    const [filterType, setFilterType] = useState('ALL'); // Filter Ujian
    const [lmsTab, setLmsTab] = useState('UTBK'); // Filter LMS (UTBK, CPNS, TKA, MANDIRI)

    const [uniList, setUniList] = useState([]);
    const [prodiList1, setProdiList1] = useState([]);
    const [prodiList2, setProdiList2] = useState([]);
    const [selectedUni1, setSelectedUni1] = useState('');
    const [selectedUni2, setSelectedUni2] = useState('');

    // Exam State
    const [mode, setMode] = useState(null);
    const [examData, setExamData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const refresh = useCallback(() => {
        fetch(`${API_URL}/student/data?username=${user.username}`).then(r=>r.json()).then(setData);
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(d => {
            setMajors(d);
            const unis = [...new Set(d.map(item => item.university))].sort();
            setUniList(unis);
        });
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if(selectedUni1) setProdiList1(majors.filter(m => m.university === selectedUni1)); }, [selectedUni1, majors]);
    useEffect(() => { if(selectedUni2) setProdiList2(majors.filter(m => m.university === selectedUni2)); }, [selectedUni2, majors]);

    const saveMajors = () => { fetch(`${API_URL}/student/majors`, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: user.username, m1: selectedMajor.m1, m2: selectedMajor.m2})}).then(()=>alert("Target Disimpan!")); };
    
    const startExam = (eid) => { if(!window.confirm("Mulai ujian?")) return; fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ setExamData(d); setMode('exam'); setQIdx(0); setTimeLeft(d.duration * 60); setAnswers({}); }); };
    const submitExam = useCallback(() => { fetch(`${API_URL}/exams/${examData.id}/submit`, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: user.username, answers})}).then(r=>r.json()).then(res => { alert(`Selesai! Skor: ${res.score}`); setMode(null); refresh(); }); }, [examData, user.username, answers, refresh]);
    const openReview = (eid) => { fetch(`${API_URL}/exams/${eid}/review?username=${user.username}`).then(r=>r.json()).then(d=>{ setExamData(d); setMode('review'); setQIdx(0); }); };

    useEffect(() => { if(mode === 'exam' && timeLeft > 0) { const t = setInterval(()=>setTimeLeft(p=>p-1), 1000); return ()=>clearInterval(t); } else if(mode === 'exam' && timeLeft === 0) { alert("WAKTU HABIS!"); submitExam(); } }, [timeLeft, mode, submitExam]);

    const handleAnswer = (qid, val, type, optId=null) => {
        if(mode === 'review') return;
        setAnswers(prev => {
            if (type === 'PG_KOMPLEKS') {
                const current = prev[qid] || [];
                if (current.includes(val)) return {...prev, [qid]: current.filter(x => x !== val)};
                return {...prev, [qid]: [...current, val]};
            }
            if (type === 'BOOLEAN') {
                const current = prev[qid] || {};
                return {...prev, [qid]: {...current, [optId]: val}};
            }
            return {...prev, [qid]: val};
        });
    };

    if(mode && examData) {
        const q = examData.questions[qIdx];
        const isReview = mode === 'review';
        return (
            <div className="h-screen flex flex-col bg-white font-sans fixed inset-0 z-50">
                <div className={`h-16 ${isReview?'bg-emerald-900':'bg-[#0F172A]'} text-white flex items-center justify-between px-6 shadow-md`}>
                    <div className="font-bold text-sm tracking-wider truncate max-w-[60%]">{examData.title} {isReview ? '(PEMBAHASAN)' : ''}</div>
                    {!isReview && <div className="bg-blue-600 px-4 py-2 rounded-xl font-mono font-bold text-lg">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
                    {isReview && <button onClick={()=>setMode(null)} className="bg-white/10 p-2 rounded-full hover:bg-rose-500"><XCircle/></button>}
                </div>
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {q.passage && <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto p-6 border-b lg:border-r border-slate-200 bg-[#F8FAFC]"><span className="bg-slate-200 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">WACANA</span><div className="prose max-w-none text-slate-800 leading-relaxed font-serif text-justify"><RenderSoal text={q.passage}/></div></div>}
                    <div className={`h-full overflow-y-auto p-6 bg-white ${q.passage ? 'w-full lg:w-1/2' : 'w-full max-w-5xl mx-auto'}`}>
                        {q.media && <img src={q.media} alt="Soal" className="max-h-48 object-contain mb-4 border rounded"/>}
                        <div className="mb-6 text-lg font-medium text-slate-900"><RenderSoal text={q.text}/></div>
                        
                        <div className="space-y-3">
                            {q.type === 'ISIAN' ? (
                                <div className="space-y-2">
                                    <input className="w-full p-4 border-2 rounded-xl text-xl font-bold" placeholder="Ketik Jawaban..." value={isReview ? q.user_answer : (answers[q.id]||'')} onChange={e=>handleAnswer(q.id, e.target.value, 'ISIAN')} disabled={isReview}/>
                                    {isReview && <div className="text-emerald-600 font-bold p-3 bg-emerald-50 rounded-lg">Kunci: {q.correct_isian}</div>}
                                </div>
                            ) : q.type === 'BOOLEAN' ? (
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100"><tr><th className="p-3 text-left">Pernyataan</th><th className="p-3 text-center w-16">Benar</th><th className="p-3 text-center w-16">Salah</th></tr></thead>
                                        <tbody>
                                            {q.options.map(o => (
                                                <tr key={o.id} className="border-t">
                                                    <td className="p-3"><RenderSoal text={o.label}/></td>
                                                    <td className="p-3 text-center"><input type="radio" className="w-5 h-5" name={`bool-${q.id}-${o.id}`} checked={isReview ? (q.user_answer?.[o.id] === 'B') : (answers[q.id]?.[o.id] === 'B')} onChange={()=>handleAnswer(q.id, 'B', 'BOOLEAN', o.id)} disabled={isReview}/></td>
                                                    <td className="p-3 text-center"><input type="radio" className="w-5 h-5" name={`bool-${q.id}-${o.id}`} checked={isReview ? (q.user_answer?.[o.id] === 'S') : (answers[q.id]?.[o.id] === 'S')} onChange={()=>handleAnswer(q.id, 'S', 'BOOLEAN', o.id)} disabled={isReview}/></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                q.options?.map(o => {
                                    let style = "border-slate-200 bg-white hover:border-blue-300";
                                    const isSel = q.type==='PG_KOMPLEKS' ? (answers[q.id]||[]).includes(o.id) : (answers[q.id] === o.id);
                                    if(isReview) {
                                        if(o.is_correct) style = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
                                        else if(q.type==='PG' && q.user_answer === o.id && !o.is_correct) style = "border-rose-500 bg-rose-50";
                                        else style = "opacity-60 border-slate-100";
                                    } else if(isSel) style = "border-blue-600 bg-blue-50 ring-2 ring-blue-200";
                                    
                                    return (
                                        <button key={o.id} onClick={()=>handleAnswer(q.id, o.id, q.type)} disabled={isReview} className={`w-full p-4 text-left border-2 rounded-xl flex gap-4 transition-all items-start ${style}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSel?'bg-blue-600 text-white':'bg-slate-200 text-slate-600'}`}>{q.type==='PG_KOMPLEKS' && isSel ? '✓' : o.id}</div>
                                            <div className="pt-1 text-base"><RenderSoal text={o.label}/></div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* FITUR PEMBAHASAN */}
                        {isReview && (
                            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                                <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-lg"><BookOpen size={24}/> PEMBAHASAN:</h4>
                                <div className="text-slate-800 leading-relaxed font-serif text-justify"><RenderSoal text={q.explanation || "Pembahasan belum tersedia untuk soal ini."}/></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="h-20 border-t bg-slate-50 flex items-center justify-between px-6">
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="px-6 py-3 border-2 rounded-xl font-bold text-slate-500 disabled:opacity-30"><ChevronLeft/></button>
                    {qIdx === examData.questions.length-1 ? 
                        (!isReview && <button onClick={submitExam} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all">SELESAI & KUMPULKAN</button>) : 
                        <button onClick={()=>setQIdx(Math.min(examData.questions.length-1, qIdx+1))} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"><ChevronRight/></button>
                    }
                </div>
            </div>
        );
    }

    if(!data) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading V42...</div>;
    
    // Filter Data
    const filteredPeriods = filterType === 'ALL' ? data.periods : data.periods.filter(p => p.type === filterType);
    const lmsMaterials = data.materials ? data.materials.filter(m => m.category === lmsTab) : [];

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans pb-28">
            {/* Header */}
            <div className="bg-white p-5 shadow-sm mb-6 flex justify-between items-center sticky top-0 z-30">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Edu<span className="text-indigo-600">Prime</span></h1>
                <div className="flex gap-3 items-center">
                    <div className="text-right hidden md:block">
                        <p className="font-bold text-sm text-slate-800">{data.user.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pejuang {lmsTab}</p>
                    </div>
                    <button onClick={onLogout} className="bg-rose-50 p-3 rounded-xl text-rose-600 hover:bg-rose-100 transition-all"><LogOut size={20}/></button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 space-y-8">
                {view === 'home' && (
                    <>
                        {/* 1. Target Jurusan (2 Pilihan) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-1/3">
                                <h2 className="font-bold text-xl text-slate-800 mb-1">Target Kampus</h2>
                                <p className="text-xs text-slate-500">Tentukan strategi pilihan jurusanmu.</p>
                            </div>
                            <div className="w-full md:w-2/3 grid gap-3">
                                <div className="flex gap-2">
                                    <select className="w-1/3 p-3 bg-slate-50 border rounded-xl font-bold text-xs" value={selectedUni1} onChange={e=>setSelectedUni1(e.target.value)}><option value="">Universitas 1</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select>
                                    <select className="w-2/3 p-3 bg-slate-50 border rounded-xl text-xs" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}><option value="">Jurusan Pilihan 1</option>{prodiList1.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select>
                                </div>
                                <div className="flex gap-2">
                                    <select className="w-1/3 p-3 bg-slate-50 border rounded-xl font-bold text-xs" value={selectedUni2} onChange={e=>setSelectedUni2(e.target.value)}><option value="">Universitas 2</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select>
                                    <select className="w-2/3 p-3 bg-slate-50 border rounded-xl text-xs" value={selectedMajor.m2} onChange={e=>setSelectedMajor({...selectedMajor, m2:e.target.value})}><option value="">Jurusan Pilihan 2</option>{prodiList2.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select>
                                </div>
                                <button onClick={saveMajors} className="bg-slate-800 text-white p-3 rounded-xl font-bold text-xs hover:bg-slate-900 transition-all">SIMPAN TARGET</button>
                            </div>
                        </div>

                        {/* 2. Statistik */}
                        <div className="bg-[#1E293B] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10">
                                <h3 className="font-bold text-2xl mb-2 flex items-center gap-3"><BarChart2 className="text-indigo-400"/> Peta Kekuatan</h3>
                                <p className="text-slate-400 text-sm">Analisis performa berdasarkan Tryout yang telah dikerjakan.</p>
                            </div>
                            <div className="w-full md:w-1/2"><RadarChartMock/></div>
                        </div>

                        {/* 3. Daftar Ujian (Tab Filter) */}
                        <div>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                {['ALL', 'UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (
                                    <button key={t} onClick={()=>setFilterType(t)} className={`px-6 py-3 rounded-full text-xs font-black whitespace-nowrap transition-all ${filterType===t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                                        {t === 'ALL' ? 'SEMUA UJIAN' : t}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-6">
                                {filteredPeriods.map(p => (
                                    <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-black text-xl text-slate-800">{p.name}</h3>
                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest">{p.type}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {p.exams.map(e => (
                                                <div key={e.id} className={`p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${e.status==='done'?'bg-emerald-50 border-emerald-100':'bg-white border-slate-100 hover:border-indigo-500 hover:shadow-lg'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`p-3 rounded-xl ${e.status==='done'?'bg-emerald-200 text-emerald-700':'bg-indigo-50 text-indigo-600'}`}>{e.status==='done'?<CheckCircle size={20}/>:<Play size={20}/>}</div>
                                                        <span className="text-xs font-bold text-slate-400">{e.duration} Menit</span>
                                                    </div>
                                                    <p className="font-bold text-slate-700 mb-4 text-lg">{e.title}</p>
                                                    {e.status==='done' ? (
                                                        <button onClick={()=>openReview(e.id)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-emerald-700">LIHAT PEMBAHASAN</button>
                                                    ) : (
                                                        <button onClick={()=>startExam(e.id)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700">KERJAKAN SEKARANG</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* VIEW LMS (MATERI BELAJAR) */}
                {view === 'lms' && (
                    <div className="space-y-8">
                        {/* LMS CATEGORY TABS */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex w-full md:w-auto">
                            {['UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(tab => (
                                <button key={tab} onClick={()=>setLmsTab(tab)} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all ${lmsTab===tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lmsMaterials.length > 0 ? lmsMaterials.map(m => (
                                <div key={m.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group cursor-pointer" onClick={()=>window.open(m.content_url)}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${m.type==='video'?'bg-rose-50 text-rose-500':'bg-blue-50 text-blue-500'}`}>
                                            {m.type==='video' ? <Video size={24}/> : <File size={24}/>}
                                        </div>
                                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{m.category}</span>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                                    <p className="text-xs text-slate-400 font-medium">Klik untuk akses materi</p>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                    <BookOpen size={48} className="mx-auto mb-4 opacity-20"/>
                                    <p className="font-bold">Belum ada materi untuk kategori {lmsTab}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW RESULTS */}
                {view === 'results' && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-4"><Award className="text-emerald-500" size={32}/> Riwayat & Hasil Ujian</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr><th className="p-5 rounded-l-xl">Nama Ujian</th><th className="p-5">Tanggal</th><th className="p-5 text-center">Benar</th><th className="p-5 rounded-r-xl text-right">Skor IRT</th></tr>
                                </thead>
                                <tbody className="text-sm font-medium text-slate-700">
                                    {data.history?.map((h, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                                            <td className="p-5 font-bold">{h.exam}</td>
                                            <td className="p-5 text-xs text-slate-400">{new Date(h.date).toLocaleDateString()}</td>
                                            <td className="p-5 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">{h.correct}</span></td>
                                            <td className="p-5 text-right font-black text-lg text-indigo-600">{h.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation (Mobile Friendly) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-2xl z-40 flex items-center gap-8">
                <button onClick={()=>setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view==='home'?'text-indigo-600 scale-110':'text-slate-400 hover:text-indigo-400'}`}><Home size={22}/></button>
                <button onClick={()=>setView('lms')} className={`flex flex-col items-center gap-1 transition-all ${view==='lms'?'text-indigo-600 scale-110':'text-slate-400 hover:text-indigo-400'}`}><BookOpen size={22}/></button>
                <button onClick={()=>setView('results')} className={`flex flex-col items-center gap-1 transition-all ${view==='results'?'text-indigo-600 scale-110':'text-slate-400 hover:text-indigo-400'}`}><Award size={22}/></button>
            </div>
        </div>
    );
};

export default StudentDashboard;