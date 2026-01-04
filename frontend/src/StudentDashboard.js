import React, { useState, useEffect, useCallback } from 'react';
import { Play, BarChart2, LogOut, ChevronLeft, ChevronRight, Home, BookOpen, Award, CheckCircle, XCircle, Menu, Video, FileText, Clock, AlertTriangle } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Renderer Teks & Gambar Canggih
const RenderSoal = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="whitespace-pre-wrap leading-relaxed font-serif text-slate-800 text-base md:text-lg">
            {parts.map((p, i) => {
                if (p.startsWith('$') && p.endsWith('$')) return <InlineMath key={i} math={p.slice(1,-1)}/>;
                // Parse Bold, Italic, Newline
                const html = p
                    .replace(/\[B\](.*?)\[\/B\]/g, '<b>$1</b>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\[I\](.*?)\[\/I\]/g, '<i>$1</i>').replace(/\*(.*?)\*/g, '<i>$1</i>')
                    .replace(/\n/g, '<br/>');
                return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            })}
        </span>
    );
};

const LoadingScreen = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <p className="font-bold text-slate-400 text-xs animate-pulse">Memuat...</p>
    </div>
);

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    const [filterType, setFilterType] = useState('ALL');
    const [lmsTab, setLmsTab] = useState('UTBK');
    
    // Exam & UI State
    const [mode, setMode] = useState(null);
    const [examData, setExamData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showNav, setShowNav] = useState(false); // Sidebar Toggle
    const [canFinish, setCanFinish] = useState(true);
    const [periodSettings, setPeriodSettings] = useState({});
    
    const [uniList, setUniList] = useState([]);
    const [prodiList1, setProdiList1] = useState([]);
    const [prodiList2, setProdiList2] = useState([]);
    const [selectedUni1, setSelectedUni1] = useState('');
    const [selectedUni2, setSelectedUni2] = useState('');

    const refresh = useCallback(() => {
        fetch(`${API_URL}/student/data?username=${user.username}`).then(r=>r.json()).then(d => {
            setData(d);
            const settings = {};
            if(d.periods) d.periods.forEach(p => { settings[p.id] = {show_result: p.show_result, can_finish: p.can_finish_early}; });
            setPeriodSettings(settings);
        });
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(d => { 
            if(Array.isArray(d)) { setMajors(d); const unis = [...new Set(d.map(item => item.university))].sort(); setUniList(unis); } 
        });
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if(selectedUni1) setProdiList1(majors.filter(m => m.university === selectedUni1)); }, [selectedUni1, majors]);
    useEffect(() => { if(selectedUni2) setProdiList2(majors.filter(m => m.university === selectedUni2)); }, [selectedUni2, majors]);

    const saveMajors = () => { fetch(`${API_URL}/student/majors`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, m1:selectedMajor.m1, m2:selectedMajor.m2})}).then(()=>alert("Target Disimpan!")); };
    
    const startExam = (eid, pid) => { 
        const settings = periodSettings[pid] || {can_finish: true};
        if(!window.confirm("Mulai Ujian? Waktu berjalan.")) return; 
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ 
            setExamData({...d, periodId: pid}); setCanFinish(settings.can_finish); 
            setMode('exam'); setQIdx(0); setTimeLeft(d.duration * 60); setAnswers({}); 
        }); 
    };
    
    const submitExam = useCallback(() => { 
        fetch(`${API_URL}/exams/${examData.id}/submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, answers})})
        .then(r=>r.json()).then(res => { 
            alert(res.score !== null ? `Skor Akhir: ${res.score}` : "Jawaban Tersimpan."); 
            setMode(null); refresh(); 
        }); 
    }, [examData, user.username, answers, refresh]);
    
    const openReview = (eid) => { 
        fetch(`${API_URL}/exams/${eid}/review?username=${user.username}`)
        .then(r=>{if(r.ok) return r.json(); throw new Error("Pembahasan dikunci admin.");})
        .then(d=>{ setExamData(d); setMode('review'); setQIdx(0); })
        .catch(e=>alert(e.message)); 
    };

    const handleAnswer = (qid, val, type, optId=null) => {
        if(mode === 'review') return;
        setAnswers(prev => {
            if (type === 'PG_KOMPLEKS') {
                const cur = prev[qid] || [];
                return cur.includes(val) ? {...prev, [qid]: cur.filter(x=>x!==val)} : {...prev, [qid]: [...cur, val]};
            }
            if (type === 'BOOLEAN') { const cur = prev[qid] || {}; return {...prev, [qid]: {...cur, [optId]: val}}; }
            return {...prev, [qid]: val};
        });
    };

    useEffect(() => { if(mode === 'exam' && timeLeft > 0) { const t = setInterval(()=>setTimeLeft(p=>p-1), 1000); return ()=>clearInterval(t); } else if(mode === 'exam' && timeLeft === 0) { alert("WAKTU HABIS!"); submitExam(); } }, [timeLeft, mode, submitExam]);

    // RENDER EXAM MODE (RESPONSIVE)
    if(mode && examData) {
        const q = examData.questions[qIdx];
        const isReview = mode === 'review';
        const allowFinish = isReview ? false : (canFinish || timeLeft === 0);

        return (
            <div className="h-screen flex flex-col bg-slate-50 font-sans fixed inset-0 z-50">
                {/* HEADER */}
                <div className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 z-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={()=>setShowNav(!showNav)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg"><Menu size={20}/></button>
                        <div><h1 className="font-bold text-slate-800 text-sm md:text-lg truncate max-w-[150px] md:max-w-md">{examData.title}</h1></div>
                    </div>
                    {!isReview && <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-sm md:text-base flex items-center gap-2 ${timeLeft<300?'bg-rose-100 text-rose-600 animate-pulse':'bg-indigo-50 text-indigo-700'}`}><Clock size={16}/> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
                    {isReview && <button onClick={()=>setMode(null)} className="p-2 hover:bg-slate-100 rounded-full"><XCircle/></button>}
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* SIDEBAR (Drawer on Mobile, Static on PC) */}
                    <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r shadow-xl transform transition-transform duration-300 md:static md:transform-none md:shadow-none ${showNav ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                        <div className="p-4 border-b font-bold text-slate-700 flex justify-between md:justify-center"><span>Navigasi Soal</span><button onClick={()=>setShowNav(false)} className="md:hidden"><XCircle size={20}/></button></div>
                        <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto content-start flex-1 bg-slate-50">
                            {examData.questions.map((_, i) => {
                                const isAns = answers[examData.questions[i].id];
                                let color = "bg-white border-slate-200 text-slate-600";
                                if(i===qIdx) color = "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200";
                                else if(isAns) color = "bg-emerald-500 text-white border-emerald-500";
                                return <button key={i} onClick={()=>{setQIdx(i); setShowNav(false);}} className={`h-10 rounded-lg font-bold text-xs border ${color}`}>{i+1}</button>;
                            })}
                        </div>
                        {!isReview && <div className="p-4 border-t"><button onClick={submitExam} disabled={!allowFinish} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm ${allowFinish?'bg-indigo-600 text-white':'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>{allowFinish ? <><CheckCircle size={16}/> SELESAI</> : <><AlertTriangle size={16}/> BELUM BISA</>}</button></div>}
                    </div>
                    {showNav && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={()=>setShowNav(false)}></div>}

                    {/* CONTENT AREA (Split View) */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC]">
                        {q.passage && (
                            <div className="w-full md:w-1/2 h-[35%] md:h-full overflow-y-auto p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 bg-white shadow-sm md:shadow-none">
                                <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full mb-3 tracking-widest border">WACANA</span>
                                <div className="prose max-w-none text-slate-800 text-sm md:text-base leading-relaxed text-justify"><RenderSoal text={q.passage}/></div>
                            </div>
                        )}
                        <div className="flex-1 h-full overflow-y-auto p-5 md:p-8">
                            {q.media && <div className="mb-6 flex justify-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm"><img src={q.media} className="max-w-full h-auto max-h-[300px] object-contain rounded-lg" alt="Soal"/></div>}
                            <div className="mb-6 md:mb-8"><RenderSoal text={q.text}/></div>
                            <div className="space-y-3 max-w-3xl">
                                {q.type === 'ISIAN' ? <input className="w-full p-4 border-2 rounded-xl font-bold text-lg" placeholder="Jawaban..." value={isReview?q.user_answer:(answers[q.id]||'')} onChange={e=>handleAnswer(q.id,e.target.value,'ISIAN')} disabled={isReview}/> : 
                                q.type === 'BOOLEAN' ? <div className="border rounded-xl bg-white overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Pernyataan</th><th className="p-3 w-16 text-center">B</th><th className="p-3 w-16 text-center">S</th></tr></thead><tbody>{q.options.map(o=>(<tr key={o.id} className="border-t"><td className="p-3"><RenderSoal text={o.label}/></td><td className="p-3 text-center"><input type="radio" name={`b-${q.id}-${o.id}`} checked={isReview?(q.user_answer?.[o.id]==='B'):(answers[q.id]?.[o.id]==='B')} onChange={()=>handleAnswer(q.id,'B','BOOLEAN',o.id)} disabled={isReview}/></td><td className="p-3 text-center"><input type="radio" name={`b-${q.id}-${o.id}`} checked={isReview?(q.user_answer?.[o.id]==='S'):(answers[q.id]?.[o.id]==='S')} onChange={()=>handleAnswer(q.id,'S','BOOLEAN',o.id)} disabled={isReview}/></td></tr>))}</tbody></table></div> :
                                q.options.map(o => { 
                                    const isMulti = q.type === 'PG_KOMPLEKS'; const isSel = isMulti ? (answers[q.id]||[]).includes(o.option_index) : (answers[q.id]===o.option_index);
                                    let style = "bg-white border-slate-200 text-slate-600"; 
                                    if(isReview) { if(o.is_correct) style="bg-emerald-50 border-emerald-500 text-emerald-800"; else if(isMulti?(q.user_answer||[]).includes(o.option_index):q.user_answer===o.option_index) style="bg-rose-50 border-rose-500 text-rose-800"; } 
                                    else if(isSel) style="bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200"; 
                                    return (<button key={o.id} onClick={()=>handleAnswer(q.id, o.option_index, q.type)} disabled={isReview} className={`w-full p-4 rounded-xl flex gap-4 items-center text-left group border ${style}`}><span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${isSel?'bg-white text-indigo-600 border-white':'bg-slate-100 text-slate-400 border-slate-200'}`}>{isMulti&&isSel?'✓':o.option_index}</span><span className="text-sm md:text-base font-medium leading-snug"><RenderSoal text={o.label}/></span></button>) 
                                })}
                            </div>
                            {isReview && <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm animate-in fade-in"><h4 className="font-black text-amber-800 mb-3 flex items-center gap-2 text-sm"><BookOpen size={18}/> PEMBAHASAN:</h4><div className="text-slate-800 text-sm leading-relaxed font-serif text-justify"><RenderSoal text={q.explanation || "-"}/></div></div>}
                        </div>
                    </div>
                </div>
                {/* FOOTER MOBILE */}
                <div className="h-16 bg-white border-t flex items-center justify-between px-6 md:hidden z-50"><button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft/></button><span className="font-bold text-slate-600 text-sm">No. {qIdx+1}</span><button onClick={()=>setQIdx(Math.min(examData.questions.length-1, qIdx+1))} disabled={qIdx===examData.questions.length-1} className="p-2 border rounded-lg bg-slate-800 text-white disabled:opacity-30"><ChevronRight/></button></div>
            </div>
        );
    }

    if(!data) return <LoadingScreen/>;
    const filteredPeriods = filterType === 'ALL' ? (data.periods||[]) : (data.periods||[]).filter(p => p.type === filterType);
    const groupedLMS = {};
    if(data.lms) { data.lms.filter(f => f.category === lmsTab).forEach(f => { const sub = f.subcategory || 'Lainnya'; if(!groupedLMS[sub]) groupedLMS[sub] = []; groupedLMS[sub].push(f); }); }

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans pb-28">
            <div className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center px-4 md:px-10"><h1 className="text-lg md:text-xl font-black text-slate-800">Edu<span className="text-indigo-600">Prime</span></h1><div className="flex gap-3 items-center"><span className="hidden md:block font-bold text-sm text-slate-600">{data.user.full_name}</span><button onClick={onLogout} className="text-rose-500 hover:bg-rose-50 p-2 rounded-full"><LogOut size={20}/></button></div></div>
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
                {view === 'home' && (
                    <>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 items-center border border-slate-100">
                            <div className="w-full md:w-1/3"><h2 className="font-bold text-lg">Target Kampus</h2><p className="text-xs text-slate-500">Pilih jurusan impianmu.</p></div>
                            <div className="w-full md:w-2/3 grid gap-3"><div className="flex gap-2"><select className="w-1/3 p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold" value={selectedUni1} onChange={e=>setSelectedUni1(e.target.value)}><option value="">Universitas 1</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select><select className="w-2/3 p-3 bg-slate-50 border-0 rounded-xl text-xs" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}><option value="">Prodi 1</option>{prodiList1.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select></div><div className="flex gap-2"><select className="w-1/3 p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold" value={selectedUni2} onChange={e=>setSelectedUni2(e.target.value)}><option value="">Universitas 2</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select><select className="w-2/3 p-3 bg-slate-50 border-0 rounded-xl text-xs" value={selectedMajor.m2} onChange={e=>setSelectedMajor({...selectedMajor, m2:e.target.value})}><option value="">Prodi 2</option>{prodiList2.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select></div><button onClick={saveMajors} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:scale-[1.02] transition-all">SIMPAN TARGET</button></div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{['ALL', 'UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (<button key={t} onClick={()=>setFilterType(t)} className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${filterType===t?'bg-slate-900 text-white shadow-lg':'bg-white text-slate-500 border border-slate-200'}`}>{t}</button>))}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredPeriods.map(p => (<div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group"><div className="flex justify-between items-center mb-6"><h3 className="font-black text-lg text-slate-800">{p.name}</h3><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-indigo-100">{p.type}</span></div><div className="space-y-3">{p.exams.map(e => (<div key={e.id} className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${e.status==='done'?'bg-emerald-50 border-emerald-100':'bg-white border-slate-100 hover:border-indigo-300'}`}><div className="flex justify-between items-center relative z-10"><div><p className="font-bold text-xs text-slate-700 mb-1">{e.title}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{e.duration} MENIT</p></div>{e.status==='done' ? (p.show_result ? <button onClick={()=>openReview(e.id)} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-bold shadow-sm hover:bg-emerald-500 hover:text-white transition-all">{e.score}</button> : <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">DISIMPAN</span>) : (<button onClick={()=>startExam(e.id, p.id)} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"><Play size={16}/></button>)}</div></div>))}</div></div>))}</div>
                    </>
                )}
                {view === 'lms' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4"><div className="flex gap-2 mb-8 overflow-x-auto">{['UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (<button key={t} onClick={()=>setLmsTab(t)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${lmsTab===t?'bg-indigo-600 text-white shadow-lg':'bg-white text-slate-500 border border-slate-200'}`}>{t}</button>))}</div><div className="space-y-10">{Object.keys(groupedLMS).length>0 ? Object.keys(groupedLMS).map(sub => (<div key={sub}><h3 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2"><span className="w-1 h-6 bg-indigo-500 rounded-full"></span> {sub}</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{groupedLMS[sub].map(folder => (<div key={folder.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all"><div className="flex items-center gap-3 mb-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={20}/></div><h3 className="font-bold text-slate-700 text-sm">{folder.name}</h3></div><div className="space-y-2">{folder.materials.map(m => (<a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-xs font-bold text-slate-600 flex items-center gap-2 transition-all group"><div className="text-slate-400 group-hover:text-indigo-600">{m.type==='video'?<Video size={14}/>:<FileText size={14}/>}</div>{m.title}</a>))}</div></div>))}</div></div>)) : <div className="text-center py-20 text-slate-400 font-bold">Belum ada materi.</div>}</div></div>
                )}
                {view === 'ranking' && (
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4"><h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Award className="text-yellow-500" size={32}/> Riwayat Hasil</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 font-black text-slate-400 uppercase text-xs tracking-wider"><tr><th className="p-4 rounded-l-xl">Nama Ujian</th><th className="p-4">Tanggal</th><th className="p-4 rounded-r-xl text-right">Skor Akhir</th></tr></thead><tbody className="text-slate-700 font-medium">{data.history?.map((h, i) => (<tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-all"><td className="p-4 font-bold">{h.exam}</td><td className="p-4 text-xs text-slate-400">{new Date(h.date).toLocaleDateString()}</td><td className="p-4 text-right font-black text-lg text-indigo-600">{h.score}</td></tr>))}</tbody></table></div></div>
                )}
            </div>
            {/* FLOATING NAV */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-2xl flex gap-4 z-40 px-6"><button onClick={()=>setView('home')} className={`p-3 rounded-full transition-all duration-300 ${view==='home'?'bg-slate-900 text-white shadow-lg scale-110':'-translate-y-0 text-slate-400 hover:text-slate-600'}`}><Home size={24}/></button><button onClick={()=>setView('lms')} className={`p-3 rounded-full transition-all duration-300 ${view==='lms'?'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110':'-translate-y-0 text-slate-400 hover:text-slate-600'}`}><BookOpen size={24}/></button><button onClick={()=>setView('ranking')} className={`p-3 rounded-full transition-all duration-300 ${view==='ranking'?'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110':'-translate-y-0 text-slate-400 hover:text-slate-600'}`}><Award size={24}/></button></div>
        </div>
    );
};
export default StudentDashboard;