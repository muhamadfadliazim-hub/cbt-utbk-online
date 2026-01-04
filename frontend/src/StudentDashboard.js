import React, { useState, useEffect, useCallback } from 'react';
import { Play, BarChart2, LogOut, ChevronLeft, ChevronRight, Home, BookOpen, Award, FileText, XCircle } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Render Math & Text
const RenderSoal = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span>
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
    
    // State Jurusan & Filter
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    const [uniList, setUniList] = useState([]);
    const [prodiList1, setProdiList1] = useState([]);
    const [prodiList2, setProdiList2] = useState([]); // Variabel ini sekarang AKAN DIPAKAI di JSX
    const [selectedUni1, setSelectedUni1] = useState('');
    const [selectedUni2, setSelectedUni2] = useState(''); // Variabel ini sekarang AKAN DIPAKAI di JSX

    const [filterType, setFilterType] = useState('ALL');
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

    // Filter Logic
    useEffect(() => { if(selectedUni1) setProdiList1(majors.filter(m => m.university === selectedUni1)); }, [selectedUni1, majors]);
    useEffect(() => { if(selectedUni2) setProdiList2(majors.filter(m => m.university === selectedUni2)); }, [selectedUni2, majors]);

    const saveMajors = () => {
        fetch(`${API_URL}/student/majors`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, m1: selectedMajor.m1, m2: selectedMajor.m2})
        }).then(()=>alert("Target Disimpan!"));
    };

    const startExam = (eid) => {
        if(!window.confirm("Mulai ujian?")) return;
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{
            setExamData(d); setMode('exam'); setQIdx(0); setTimeLeft(d.duration * 60); setAnswers({});
        });
    };

    const submitExam = useCallback(() => {
        fetch(`${API_URL}/exams/${examData.id}/submit`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, answers})
        }).then(r=>r.json()).then(res => {
            alert(`Selesai! Skor: ${res.score}`);
            setMode(null); refresh();
        });
    }, [examData, user.username, answers, refresh]);

    const openReview = (eid) => {
        fetch(`${API_URL}/exams/${eid}/review?username=${user.username}`).then(r=>r.json()).then(d=>{
            setExamData(d); setMode('review'); setQIdx(0);
        });
    };

    useEffect(() => {
        if(mode === 'exam' && timeLeft > 0) {
            const t = setInterval(()=>setTimeLeft(p=>p-1), 1000);
            return ()=>clearInterval(t);
        } else if(mode === 'exam' && timeLeft === 0) {
            alert("WAKTU HABIS!"); submitExam();
        }
    }, [timeLeft, mode, submitExam]);

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

    // MODE UJIAN / REVIEW
    if(mode && examData) {
        const q = examData.questions[qIdx];
        const isReview = mode === 'review';
        return (
            <div className="h-screen flex flex-col bg-white font-sans fixed inset-0 z-50">
                <div className={`h-14 ${isReview?'bg-emerald-900':'bg-[#0F172A]'} text-white flex items-center justify-between px-6 shadow-md`}>
                    <div className="font-bold text-sm tracking-wider">{examData.title} {isReview ? '(PEMBAHASAN)' : ''}</div>
                    {!isReview && <div className="bg-blue-600 px-4 py-1 rounded font-mono font-bold">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
                    {isReview && <button onClick={()=>setMode(null)} className="bg-white/10 p-2 rounded hover:bg-rose-500"><XCircle/></button>}
                </div>
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {q.passage && (
                        <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto p-6 border-b lg:border-r border-slate-200 bg-[#F8FAFC]">
                            <span className="bg-slate-200 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">WACANA</span>
                            <div className="prose max-w-none text-slate-800 leading-relaxed"><RenderSoal text={q.passage}/></div>
                        </div>
                    )}
                    <div className={`h-full overflow-y-auto p-6 bg-white ${q.passage ? 'w-full lg:w-1/2' : 'w-full max-w-5xl mx-auto'}`}>
                        {q.media && <img src={q.media} alt="Soal" className="max-h-48 object-contain mb-4 border rounded"/>}
                        <div className="mb-6"><RenderSoal text={q.text}/></div>
                        
                        {q.type === 'ISIAN' ? (
                            <div className="space-y-2">
                                <input className="w-full p-4 border-2 rounded-xl text-xl font-bold" placeholder="Jawaban..." value={isReview ? q.user_answer : (answers[q.id]||'')} onChange={e=>handleAnswer(q.id, e.target.value, 'ISIAN')} disabled={isReview}/>
                                {isReview && <div className="text-emerald-600 font-bold">Kunci: {q.correct_isian}</div>}
                            </div>
                        ) : q.type === 'BOOLEAN' ? (
                            <div className="border rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100"><tr><th className="p-3 text-left">Pernyataan</th><th className="p-3 text-center">B</th><th className="p-3 text-center">S</th></tr></thead>
                                    <tbody>
                                        {q.options.map(o => (
                                            <tr key={o.id} className="border-t">
                                                <td className="p-3"><RenderSoal text={o.label}/></td>
                                                <td className="p-3 text-center"><input type="radio" name={`bool-${q.id}-${o.id}`} checked={isReview ? (q.user_answer?.[o.id] === 'B') : (answers[q.id]?.[o.id] === 'B')} onChange={()=>handleAnswer(q.id, 'B', 'BOOLEAN', o.id)} disabled={isReview}/></td>
                                                <td className="p-3 text-center"><input type="radio" name={`bool-${q.id}-${o.id}`} checked={isReview ? (q.user_answer?.[o.id] === 'S') : (answers[q.id]?.[o.id] === 'S')} onChange={()=>handleAnswer(q.id, 'S', 'BOOLEAN', o.id)} disabled={isReview}/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {q.options?.map(o => {
                                    let style = "border-slate-200 bg-white";
                                    const isSel = q.type==='PG_KOMPLEKS' ? (answers[q.id]||[]).includes(o.id) : (answers[q.id] === o.id);
                                    if(isReview) {
                                        if(o.is_correct) style = "border-emerald-500 bg-emerald-50";
                                        else if(q.type==='PG' && q.user_answer === o.id && !o.is_correct) style = "border-rose-500 bg-rose-50";
                                    } else {
                                        if(isSel) style = "border-blue-600 bg-blue-50 ring-1 ring-blue-400";
                                    }
                                    return (
                                        <button key={o.id} onClick={()=>handleAnswer(q.id, o.id, q.type)} disabled={isReview} className={`w-full p-4 text-left border-2 rounded-xl flex gap-4 transition-all ${style}`}>
                                            <div className="font-bold">{o.id}</div><div><RenderSoal text={o.label}/></div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {isReview && <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl"><h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><BookOpen size={18}/> PEMBAHASAN:</h4><div className="text-slate-700 leading-relaxed"><RenderSoal text={q.explanation || "-"}/></div></div>}
                    </div>
                </div>
                <div className="h-16 border-t bg-slate-50 flex items-center justify-between px-8">
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="px-4 py-2 border rounded-lg font-bold"><ChevronLeft/></button>
                    {qIdx === examData.questions.length-1 ? (!isReview && <button onClick={submitExam} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">SELESAI</button>) : <button onClick={()=>setQIdx(Math.min(examData.questions.length-1, qIdx+1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"><ChevronRight/></button>}
                </div>
            </div>
        );
    }

    if(!data) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading V41.1...</div>;
    const filteredPeriods = filterType === 'ALL' ? data.periods : data.periods.filter(p => p.type === filterType);

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans pb-24">
            <div className="bg-white p-4 shadow-sm mb-6 flex justify-between items-center sticky top-0 z-30">
                <h1 className="text-xl font-black text-slate-800">EduPrime</h1>
                <div className="flex gap-3 items-center"><p className="font-bold text-sm hidden md:block">{data.user.full_name}</p><button onClick={onLogout} className="bg-rose-50 p-2 rounded-lg text-rose-600"><LogOut size={18}/></button></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 space-y-6">
                {view === 'home' && (
                    <>
                        {/* UI PEMILIHAN JURUSAN YANG BENAR (MENGGUNAKAN prodiList2 dan setSelectedUni2) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between gap-4">
                            <div><h2 className="font-bold text-lg">Target Kampus</h2><p className="text-xs text-slate-500">Pilih jurusan impianmu.</p></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full md:w-2/3">
                                {/* Pilihan 1 */}
                                <div className="space-y-1">
                                    <select className="w-full p-2 border rounded font-bold text-xs" value={selectedUni1} onChange={e=>setSelectedUni1(e.target.value)}>
                                        <option value="">Univ 1</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <select className="w-full p-2 border rounded text-xs" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}>
                                        <option value="">Prodi 1</option>{prodiList1.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}
                                    </select>
                                </div>
                                {/* Pilihan 2 - INI YANG KEMARIN HILANG */}
                                <div className="space-y-1">
                                    <select className="w-full p-2 border rounded font-bold text-xs" value={selectedUni2} onChange={e=>setSelectedUni2(e.target.value)}>
                                        <option value="">Univ 2</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <select className="w-full p-2 border rounded text-xs" value={selectedMajor.m2} onChange={e=>setSelectedMajor({...selectedMajor, m2:e.target.value})}>
                                        <option value="">Prodi 2</option>{prodiList2.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}
                                    </select>
                                </div>
                                <button onClick={saveMajors} className="bg-indigo-600 text-white p-2 rounded font-bold text-xs md:col-span-2">SIMPAN TARGET</button>
                            </div>
                        </div>

                        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between"><div className="mb-4 md:mb-0"><h3 className="font-bold mb-1 flex items-center gap-2"><BarChart2/> Peta Kekuatan</h3><p className="text-xs text-indigo-300">Analisis performa real-time.</p></div><RadarChartMock/></div>
                        <div className="flex gap-2 overflow-x-auto pb-2">{['ALL', 'UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (<button key={t} onClick={()=>setFilterType(t)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterType===t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}`}>{t === 'ALL' ? 'SEMUA UJIAN' : t}</button>))}</div>
                        <div className="space-y-6">{filteredPeriods.map(p => (<div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="font-black text-lg mb-4">{p.name} <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs ml-2">{p.type}</span></h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{p.exams.map(e => (<div key={e.id} className={`p-4 rounded-xl border-2 transition-all ${e.status==='done'?'bg-emerald-50 border-emerald-100':'bg-white hover:border-indigo-500'}`}><p className="font-bold text-sm truncate mb-2">{e.title}</p><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">{e.duration}m</span>{e.status==='done' ? (<button onClick={()=>openReview(e.id)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-emerald-200 shadow-lg hover:scale-105 transition-all">LIHAT PEMBAHASAN</button>) : (<button onClick={()=>startExam(e.id)} className="bg-indigo-600 text-white p-2 rounded-lg"><Play size={14}/></button>)}</div></div>))}</div></div>))}</div>
                    </>
                )}
                {view === 'results' && (<div className="bg-white p-8 rounded-3xl shadow-sm border"><h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Award className="text-emerald-500"/> Riwayat Hasil</h2><table className="w-full text-left"><thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase"><tr><th className="p-4">Ujian</th><th className="p-4">Tanggal</th><th className="p-4">Benar</th><th className="p-4">Skor</th></tr></thead><tbody>{data.history?.map((h, i) => (<tr key={i} className="border-b hover:bg-slate-50"><td className="p-4 font-bold">{h.exam}</td><td className="p-4 text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</td><td className="p-4 font-mono">{h.correct}</td><td className="p-4 font-black text-emerald-600">{h.score}</td></tr>))}</tbody></table></div>)}
                {view === 'lms' && (<div className="space-y-6"><h2 className="text-xl font-black flex items-center gap-3"><BookOpen className="text-blue-500"/> Materi Belajar</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{data.materials?.map(m => (<div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all"><div className="flex justify-between items-start mb-4"><div className={`p-3 rounded-xl ${m.type==='video'?'bg-rose-50 text-rose-500':'bg-blue-50 text-blue-500'}`}><FileText size={24}/></div><span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded">{m.category}</span></div><h3 className="font-bold text-sm mb-2">{m.title}</h3><button onClick={()=>window.open(m.content_url)} className="w-full mt-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-50">BUKA</button></div>))}</div></div>)}
            </div>
            
            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] text-xs">
                <button onClick={()=>setView('home')} className={`flex flex-col items-center gap-1 font-bold ${view==='home'?'text-indigo-600':'text-slate-400'}`}><Home size={20}/> Beranda</button>
                <button onClick={()=>setView('results')} className={`flex flex-col items-center gap-1 font-bold ${view==='results'?'text-indigo-600':'text-slate-400'}`}><Award size={20}/> Hasil</button>
                <button onClick={()=>setView('lms')} className={`flex flex-col items-center gap-1 font-bold ${view==='lms'?'text-indigo-600':'text-slate-400'}`}><BookOpen size={20}/> LMS</button>
            </div>
        </div>
    );
};

export default StudentDashboard;