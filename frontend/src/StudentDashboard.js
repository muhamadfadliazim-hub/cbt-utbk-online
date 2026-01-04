import React, { useState, useEffect, useCallback } from 'react';
import { Play, BarChart2, LogOut, ChevronLeft, ChevronRight, Home, BookOpen, Award, CheckCircle, XCircle, Menu, Video, FileText, Clock, AlertTriangle } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// PARSER TEXT DARI EXCEL (Support [B], **, HTML)
const RenderSoal = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="whitespace-pre-wrap leading-relaxed font-serif text-slate-800 text-lg">
            {parts.map((p, i) => {
                if (p.startsWith('$')) return <InlineMath key={i} math={p.slice(1,-1)}/>;
                // Replace [B]..[/B] or **..** with <b>
                const html = p
                    .replace(/\[B\](.*?)\[\/B\]/g, '<b>$1</b>')
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\[I\](.*?)\[\/I\]/g, '<i>$1</i>')
                    .replace(/\*(.*?)\*/g, '<i>$1</i>')
                    .replace(/\n/g, '<br/>');
                return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            })}
        </span>
    );
};

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home'); // home (TO), lms
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    
    // Filter State
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    const [filterType, setFilterType] = useState('ALL');
    const [lmsTab, setLmsTab] = useState('UTBK');
    
    // Exam State
    const [mode, setMode] = useState(null);
    const [examData, setExamData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showNav, setShowNav] = useState(false);
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
            if(Array.isArray(d)) {
                setMajors(d);
                const unis = [...new Set(d.map(item => item.university))].sort();
                setUniList(unis);
            }
        });
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if(selectedUni1) setProdiList1(majors.filter(m => m.university === selectedUni1)); }, [selectedUni1, majors]);
    useEffect(() => { if(selectedUni2) setProdiList2(majors.filter(m => m.university === selectedUni2)); }, [selectedUni2, majors]);

    const saveMajors = () => { fetch(`${API_URL}/student/majors`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, m1:selectedMajor.m1, m2:selectedMajor.m2})}).then(()=>alert("Target Disimpan!")); };
    
    const startExam = (eid, pid, finish) => { 
        if(!window.confirm("Mulai Ujian?")) return; 
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ 
            setExamData({...d, periodId: pid}); 
            setCanFinish(finish);
            setMode('exam'); setQIdx(0); setTimeLeft(d.duration * 60); setAnswers({}); 
        }); 
    };
    
    const submitExam = useCallback(() => { 
        fetch(`${API_URL}/exams/${examData.id}/submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, answers})})
        .then(r=>r.json()).then(res => { 
            alert(res.score !== null ? `Skor Akhir: ${res.score}` : "Jawaban Tersimpan."); 
            setMode(null); 
            refresh(); 
        }); 
    }, [examData, user.username, answers, refresh]);
    
    const openReview = (eid) => { 
        fetch(`${API_URL}/exams/${eid}/review?username=${user.username}`)
        .then(r=>{if(r.ok) return r.json(); throw new Error("Pembahasan dikunci admin.");})
        .then(d=>{ setExamData(d); setMode('review'); setQIdx(0); })
        .catch(e=>alert(e.message)); 
    };
    
    const handleAnswer = (qid, val) => { if(mode!=='review') setAnswers(p=>({...p, [qid]:val})); };

    useEffect(() => { 
        if(mode === 'exam' && timeLeft > 0) { const t = setInterval(()=>setTimeLeft(p=>p-1), 1000); return ()=>clearInterval(t); } 
        else if(mode === 'exam' && timeLeft === 0) { alert("WAKTU HABIS!"); submitExam(); } 
    }, [timeLeft, mode, submitExam]);

    if(mode && examData) {
        const q = examData.questions[qIdx];
        const isReview = mode === 'review';
        const allowFinish = isReview ? false : (canFinish || timeLeft === 0);

        return (
            <div className="h-screen flex flex-col bg-slate-50 font-sans fixed inset-0 z-50">
                <div className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-3"><button onClick={()=>setShowNav(!showNav)} className="md:hidden p-2"><Menu/></button><div><h1 className="font-bold text-slate-800 truncate max-w-[150px]">{examData.title}</h1><p className="text-xs text-slate-500">Soal {qIdx+1}</p></div></div>
                    {!isReview && <div className={`px-3 py-1 rounded-lg font-mono font-bold ${timeLeft<300?'bg-rose-100 text-rose-600':'bg-slate-100'}`}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
                    {isReview && <button onClick={()=>setMode(null)} className="p-2 hover:bg-slate-100 rounded-full"><XCircle/></button>}
                </div>
                <div className="flex-1 flex overflow-hidden relative">
                    <div className={`absolute md:relative inset-y-0 left-0 w-64 bg-white border-r transform transition-transform z-40 ${showNav?'translate-x-0':'-translate-x-full'} md:translate-x-0 flex flex-col`}>
                        <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto content-start flex-1">{examData.questions.map((_, i) => (<button key={i} onClick={()=>{setQIdx(i); setShowNav(false);}} className={`h-10 rounded font-bold text-sm ${i===qIdx?'bg-indigo-600 text-white': answers[examData.questions[i].id]?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{i+1}</button>))}</div>
                        {!isReview && <div className="p-4 border-t"><button onClick={submitExam} disabled={!allowFinish} className={`w-full py-3 rounded-xl font-bold ${allowFinish?'bg-indigo-600 text-white hover:bg-indigo-700':'bg-slate-200 text-slate-400'}`}>{allowFinish ? 'KUMPULKAN' : 'BELUM BISA SELESAI'}</button></div>}
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC]">
                        {q.passage && <div className="w-full md:w-1/2 h-[30%] md:h-full overflow-y-auto p-6 border-b md:border-r bg-white"><div className="prose max-w-none"><RenderSoal text={q.passage}/></div></div>}
                        <div className="flex-1 h-full overflow-y-auto p-6 md:p-10">
                            {/* GAMBAR DI TENGAH ANTARA WACANA DAN SOAL */}
                            {q.media && <div className="flex justify-center mb-6"><img src={q.media} className="max-h-64 rounded-lg shadow-sm border" alt="Soal"/></div>}
                            <div className="mb-6"><RenderSoal text={q.text}/></div>
                            <div className="space-y-3 max-w-2xl">
                                {q.options.map(o => { 
                                    let style = "bg-white border-slate-200 text-slate-700"; 
                                    if(isReview) { 
                                        if(o.is_correct) style = "bg-emerald-50 border-emerald-500 text-emerald-800"; 
                                        else if(answers[q.id]===o.option_index) style = "bg-rose-50 border-rose-500 text-rose-800"; 
                                    } else if(answers[q.id]===o.option_index) style = "bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500"; 
                                    return (
                                        <button key={o.id} onClick={()=>handleAnswer(q.id, o.option_index)} disabled={isReview} className={`w-full p-4 text-left border rounded-xl flex gap-4 transition-all hover:shadow-sm ${style}`}>
                                            <span className="font-bold">{o.option_index}</span><span><RenderSoal text={o.label}/></span>
                                        </button>
                                    ) 
                                })}
                            </div>
                            {isReview && <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-100"><h4 className="font-bold text-amber-800 mb-2">PEMBAHASAN:</h4><div className="text-slate-700"><RenderSoal text={q.explanation || "-"}/></div></div>}
                        </div>
                    </div>
                </div>
                <div className="h-16 bg-white border-t flex items-center justify-between px-6 md:hidden z-50"><button onClick={()=>setQIdx(Math.max(0, qIdx-1))}><ChevronLeft/></button><span className="font-bold text-slate-600">{qIdx+1} / {examData.questions.length}</span><button onClick={()=>setQIdx(Math.min(examData.questions.length-1, qIdx+1))}><ChevronRight/></button></div>
            </div>
        );
    }

    if(!data) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading V58...</div>;
    const filteredPeriods = filterType === 'ALL' ? (data.periods||[]) : (data.periods||[]).filter(p => p.type === filterType);
    
    const groupedLMS = {};
    if(data.lms) {
        data.lms.filter(f => f.category === lmsTab).forEach(f => {
            const sub = f.subcategory || 'Lainnya';
            if(!groupedLMS[sub]) groupedLMS[sub] = [];
            groupedLMS[sub].push(f);
        });
    }

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans pb-28">
            <div className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center px-6"><h1 className="text-xl font-black text-slate-800">Edu<span className="text-indigo-600">Prime</span></h1><div className="flex gap-3"><span className="hidden md:block font-bold text-sm mt-1">{data.user.full_name}</span><button onClick={onLogout} className="text-rose-500"><LogOut/></button></div></div>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {view === 'home' && (
                    <>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full"><h2 className="font-bold text-lg">Target Kampus</h2><p className="text-xs text-slate-500">Pilih jurusan impianmu.</p></div>
                            <div className="w-full flex gap-2"><select className="p-2 border rounded w-full text-xs" value={selectedUni1} onChange={e=>setSelectedUni1(e.target.value)}><option value="">Universitas 1</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select><select className="p-2 border rounded w-full text-xs" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}><option value="">Prodi 1</option>{prodiList1.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select></div>
                            <div className="w-full flex gap-2"><select className="p-2 border rounded w-full text-xs" value={selectedUni2} onChange={e=>setSelectedUni2(e.target.value)}><option value="">Universitas 2</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select><select className="p-2 border rounded w-full text-xs" value={selectedMajor.m2} onChange={e=>setSelectedMajor({...selectedMajor, m2:e.target.value})}><option value="">Prodi 2</option>{prodiList2.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select></div>
                            <button onClick={saveMajors} className="bg-indigo-600 text-white px-4 rounded text-xs font-bold">SIMPAN</button>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm"><h3 className="font-bold mb-4 flex items-center gap-2"><BarChart2 className="text-indigo-600"/> Statistik</h3><div className="space-y-3">{data.history && data.history.slice(0,3).map((h,i)=>(<div key={i} className="flex justify-between border-b pb-2"><span className="text-sm">{h.exam}</span><span className="font-bold text-indigo-600">{h.score}</span></div>))}</div></div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{['ALL', 'UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (<button key={t} onClick={()=>setFilterType(t)} className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filterType===t?'bg-indigo-600 text-white':'bg-white border'}`}>{t}</button>))}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filteredPeriods.map(p => (<div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border hover:shadow-md transition-all"><div className="flex justify-between mb-4"><h3 className="font-black text-lg">{p.name}</h3><span className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold">{p.type}</span></div><div className="space-y-3">{p.exams.map(e => (<div key={e.id} className="p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50"><div><p className="font-bold text-sm">{e.title}</p><p className="text-[10px] text-slate-400">{e.duration} Menit</p></div>{e.status==='done' ? (p.show_result ? <button onClick={()=>openReview(e.id)} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/>{e.score}</button> : <span className="text-xs font-bold text-slate-400">Menunggu Hasil</span>) : (<button onClick={()=>startExam(e.id, p.id, p.can_finish_early)} className="p-2 bg-indigo-600 text-white rounded-lg"><Play size={14}/></button>)}</div>))}</div></div>))}</div>
                    </>
                )}
                {view === 'lms' && (
                    <div>
                        <div className="flex gap-2 mb-6 overflow-x-auto">{['UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (<button key={t} onClick={()=>setLmsTab(t)} className={`px-6 py-2 rounded-xl text-xs font-bold ${lmsTab===t?'bg-indigo-600 text-white':'bg-white text-slate-500'}`}>{t}</button>))}</div>
                        <div className="space-y-8">
                            {Object.keys(groupedLMS).map(sub => (
                                <div key={sub}>
                                    <h3 className="font-bold text-lg text-slate-700 mb-4 px-2 border-l-4 border-indigo-500">{sub}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{groupedLMS[sub].map(folder => (<div key={folder.id} className="bg-white p-6 rounded-[2rem] shadow-sm border"><div className="flex items-center gap-3 mb-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={20}/></div><h3 className="font-bold">{folder.name}</h3></div><div className="space-y-2">{folder.materials.map(m => (<a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block p-3 border rounded-xl hover:border-indigo-500 text-xs font-bold text-slate-600 flex items-center gap-2">{m.type==='video'?<Video size={14}/>:<FileText size={14}/>} {m.title}</a>))}</div></div>))}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {view === 'ranking' && (<div className="bg-white p-8 rounded-[2rem] shadow-sm border"><h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Award className="text-emerald-500"/> Riwayat & Peringkat</h2><table className="w-full text-left text-sm"><thead className="bg-slate-50 font-bold text-slate-500"><tr><th className="p-4">Ujian</th><th className="p-4">Tanggal</th><th className="p-4">Skor</th></tr></thead><tbody>{data.history?.map((h, i) => (<tr key={i} className="border-b"><td className="p-4 font-bold">{h.exam}</td><td className="p-4 text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</td><td className="p-4 font-black text-emerald-600">{h.score}</td></tr>))}</tbody></table></div>)}
            </div>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border p-2 rounded-full shadow-2xl flex gap-2 z-40"><button onClick={()=>setView('home')} className={`p-3 rounded-full ${view==='home'?'bg-indigo-600 text-white':'text-slate-400'}`}><Home size={24}/></button><button onClick={()=>setView('lms')} className={`p-3 rounded-full ${view==='lms'?'bg-indigo-600 text-white':'text-slate-400'}`}><BookOpen size={24}/></button><button onClick={()=>setView('ranking')} className={`p-3 rounded-full ${view==='ranking'?'bg-indigo-600 text-white':'text-slate-400'}`}><Award size={24}/></button></div>
        </div>
    );
};
export default StudentDashboard;