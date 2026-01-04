import React, { useState, useEffect, useCallback } from 'react';
import { Play, LogOut, ChevronLeft, ChevronRight, Home, BookOpen, Award, CheckCircle, XCircle, Menu, Clock, AlertTriangle } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// RENDERER CANGGIH (LaTeX + Tebal + Miring + Gambar)
const RenderSoal = ({ text }) => {
    if (!text) return null;
    // Split LaTeX
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="text-slate-800 text-lg leading-relaxed font-medium">
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                }
                // Handle Bold (**text**) & Italic (*text*) manually or use HTML logic if input supports it
                // Sederhana: Render HTML tags jika ada, atau text biasa
                return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>').replace(/\n/g, '<br/>') }} />;
            })}
        </span>
    );
};

const LoadingScreen = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 animate-pulse">Memuat Data EduPrime...</p>
    </div>
);

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    
    // Filter & UI State
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    const [filterType, setFilterType] = useState('ALL');
    const [lmsTab, setLmsTab] = useState('UTBK');
    const [uniList, setUniList] = useState([]);
    const [prodiList1, setProdiList1] = useState([]);
    const [prodiList2, setProdiList2] = useState([]);
    const [selectedUni1, setSelectedUni1] = useState('');
    const [selectedUni2, setSelectedUni2] = useState('');

    // Exam Engine State
    const [mode, setMode] = useState(null);
    const [examData, setExamData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showNav, setShowNav] = useState(false);
    const [canFinish, setCanFinish] = useState(true); // Logic Finish

    const refresh = useCallback(() => {
        fetch(`${API_URL}/student/data?username=${user.username}`).then(r=>r.json()).then(setData);
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(d => { 
            if(Array.isArray(d)){ setMajors(d); const unis = [...new Set(d.map(item => item.university))].sort(); setUniList(unis); }
        });
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if(selectedUni1) setProdiList1(majors.filter(m => m.university === selectedUni1)); }, [selectedUni1, majors]);
    useEffect(() => { if(selectedUni2) setProdiList2(majors.filter(m => m.university === selectedUni2)); }, [selectedUni2, majors]);

    const saveMajors = () => { fetch(`${API_URL}/student/majors`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, m1:selectedMajor.m1, m2:selectedMajor.m2})}).then(()=>alert("Target Tersimpan!")); };
    
    // START EXAM
    const startExam = (eid, p_can_finish) => { 
        if(!window.confirm("Mulai Ujian? Waktu akan berjalan.")) return; 
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ 
            setExamData(d); setCanFinish(p_can_finish); 
            setMode('exam'); setQIdx(0); setTimeLeft(d.duration * 60); setAnswers({}); 
        }); 
    };
    
    // SUBMIT EXAM
    const submitExam = useCallback(() => { 
        fetch(`${API_URL}/exams/${examData.id}/submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, answers})})
        .then(r=>r.json()).then(res => {
            alert(res.score !== null ? `Skor Anda: ${res.score}` : "Jawaban dikumpulkan. Nilai disembunyikan admin.");
            setMode(null); refresh();
        }); 
    }, [examData, user.username, answers, refresh]);
    
    // REVIEW
    const openReview = (eid) => { 
        fetch(`${API_URL}/exams/${eid}/review?username=${user.username}`).then(r=>{
            if(!r.ok) throw new Error("Pembahasan belum dibuka oleh Admin."); 
            return r.json();
        }).then(d=>{ setExamData(d); setMode('review'); setQIdx(0); }).catch(e=>alert(e.message)); 
    };

    // TIMER LOGIC
    useEffect(() => { 
        if(mode === 'exam' && timeLeft > 0) { const t = setInterval(()=>setTimeLeft(p=>p-1), 1000); return ()=>clearInterval(t); } 
        else if(mode === 'exam' && timeLeft === 0) { alert("WAKTU HABIS!"); submitExam(); } 
    }, [timeLeft, mode, submitExam]);

    // INPUT HANDLER (Complex Logic)
    const handleAnswer = (qid, val, type, optId=null) => {
        if(mode === 'review') return;
        setAnswers(prev => {
            if (type === 'PG_KOMPLEKS') {
                const cur = prev[qid] || [];
                return cur.includes(val) ? {...prev, [qid]: cur.filter(x=>x!==val)} : {...prev, [qid]: [...cur, val]};
            }
            if (type === 'BOOLEAN') {
                const cur = prev[qid] || {};
                return {...prev, [qid]: {...cur, [optId]: val}};
            }
            return {...prev, [qid]: val};
        });
    };

    if(mode && examData) {
        const q = examData.questions[qIdx];
        const isReview = mode === 'review';
        const finishAllowed = isReview || canFinish || timeLeft === 0;

        return (
            <div className="h-screen flex flex-col bg-slate-50 font-sans fixed inset-0 z-50">
                {/* HEADER UJIAN */}
                <div className="h-16 bg-white shadow-md flex items-center justify-between px-6 z-50">
                    <div className="flex items-center gap-4">
                        <button onClick={()=>setShowNav(!showNav)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg"><Menu/></button>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg truncate max-w-[200px]">{examData.title} {isReview && "(PEMBAHASAN)"}</h1>
                            <p className="text-xs text-slate-500 font-semibold">Soal No. {qIdx+1}</p>
                        </div>
                    </div>
                    {!isReview && (
                        <div className={`px-4 py-2 rounded-xl font-mono font-bold text-lg flex items-center gap-2 shadow-inner ${timeLeft<300?'bg-rose-100 text-rose-600 animate-pulse':'bg-indigo-50 text-indigo-700'}`}>
                            <Clock size={20}/> {Math.floor(timeLeft/3600).toString().padStart(2,'0')}:{Math.floor((timeLeft%3600)/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}
                        </div>
                    )}
                    {isReview && <button onClick={()=>setMode(null)} className="p-2 hover:bg-rose-100 text-rose-500 rounded-full transition-all"><XCircle/></button>}
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* SIDEBAR NAVIGATION */}
                    <div className={`absolute md:relative inset-y-0 left-0 w-72 bg-white border-r transform transition-transform z-40 ${showNav?'translate-x-0':'-translate-x-full'} md:translate-x-0 flex flex-col shadow-lg`}>
                        <div className="p-4 bg-indigo-600 text-white font-bold text-center text-sm shadow-md">NAVIGASI SOAL</div>
                        <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto content-start flex-1 bg-slate-50">
                            {examData.questions.map((_, i) => {
                                const isAns = answers[examData.questions[i].id];
                                let color = isAns ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400';
                                if(i===qIdx) color = 'bg-indigo-600 text-white ring-2 ring-indigo-300 border-indigo-600 scale-110';
                                return <button key={i} onClick={()=>{setQIdx(i); setShowNav(false);}} className={`h-10 rounded-lg font-bold text-sm border transition-all shadow-sm ${color}`}>{i+1}</button>;
                            })}
                        </div>
                        {!isReview && (
                            <div className="p-4 border-t bg-white">
                                <button onClick={submitExam} disabled={!finishAllowed} className={`w-full py-4 rounded-xl font-bold shadow-lg text-sm flex items-center justify-center gap-2 transition-all ${finishAllowed ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                    {finishAllowed ? <><CheckCircle size={18}/> SELESAIKAN UJIAN</> : <><AlertTriangle size={18}/> WAKTU BELUM HABIS</>}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC]">
                        {q.passage && (
                            <div className="w-full md:w-1/2 h-[35%] md:h-full overflow-y-auto p-8 border-b md:border-r bg-white shadow-inner">
                                <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full mb-4 tracking-widest border">BACAAN</span>
                                <div className="prose max-w-none text-slate-800 leading-relaxed text-justify"><RenderSoal text={q.passage}/></div>
                            </div>
                        )}
                        
                        <div className="flex-1 h-full overflow-y-auto p-6 md:p-10 relative">
                            {/* GAMBAR SOAL */}
                            {q.media && (
                                <div className="mb-6 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white flex justify-center">
                                    <img src={q.media} className="max-h-64 object-contain rounded-lg shadow-sm" alt="Soal" onError={(e)=>e.target.style.display='none'}/>
                                </div>
                            )}
                            
                            {/* TEKS SOAL */}
                            <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <RenderSoal text={q.text}/>
                            </div>

                            {/* AREA JAWABAN BERDASARKAN TIPE */}
                            <div className="space-y-4 max-w-4xl">
                                {q.type === 'ISIAN' ? (
                                    <div className="space-y-2">
                                        <input className="w-full p-5 border-2 border-slate-300 rounded-2xl text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none" placeholder="Ketik jawaban singkat..." value={isReview ? q.user_answer : (answers[q.id]||'')} onChange={e=>handleAnswer(q.id, e.target.value, 'ISIAN')} disabled={isReview}/>
                                        {isReview && <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold border border-emerald-200">Kunci: {q.correct_isian}</div>}
                                    </div>
                                ) : q.type === 'BOOLEAN' ? (
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b"><tr><th className="p-4 text-left font-bold text-slate-500">Pernyataan</th><th className="p-4 text-center w-20">Benar</th><th className="p-4 text-center w-20">Salah</th></tr></thead>
                                            <tbody>
                                                {q.options.map((o, idx) => (
                                                    <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                        <td className="p-4 font-medium"><RenderSoal text={o.label}/></td>
                                                        <td className="p-4 text-center"><input type="radio" className="w-5 h-5 accent-indigo-600" name={`b-${q.id}-${o.id}`} checked={isReview?(q.user_answer?.[o.id]==='B'):(answers[q.id]?.[o.id]==='B')} onChange={()=>handleAnswer(q.id,'B','BOOLEAN',o.id)} disabled={isReview}/></td>
                                                        <td className="p-4 text-center"><input type="radio" className="w-5 h-5 accent-indigo-600" name={`b-${q.id}-${o.id}`} checked={isReview?(q.user_answer?.[o.id]==='S'):(answers[q.id]?.[o.id]==='S')} onChange={()=>handleAnswer(q.id,'S','BOOLEAN',o.id)} disabled={isReview}/></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    q.options.map(o => {
                                        const isMulti = q.type === 'PG_KOMPLEKS';
                                        const isSel = isMulti ? (answers[q.id]||[]).includes(o.option_index) : (answers[q.id] === o.option_index);
                                        let style = "bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
                                        
                                        if (isReview) {
                                            if (o.is_correct) style = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500";
                                            else if (isMulti ? (q.user_answer||[]).includes(o.option_index) : q.user_answer === o.option_index) style = "bg-rose-50 border-rose-500 text-rose-800";
                                        } else if (isSel) {
                                            style = "bg-indigo-600 border-indigo-600 text-white shadow-lg transform scale-[1.01]";
                                        }

                                        return (
                                            <button key={o.id} onClick={()=>handleAnswer(q.id, o.option_index, q.type)} disabled={isReview} className={`w-full p-5 text-left rounded-2xl flex gap-5 transition-all items-center group ${style}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border-2 ${isSel ? 'bg-white text-indigo-600 border-white' : 'bg-slate-100 text-slate-500 border-slate-200 group-hover:border-indigo-300'}`}>
                                                    {isMulti ? (isSel?'✓':o.option_index) : o.option_index}
                                                </div>
                                                <div className="text-lg font-medium"><RenderSoal text={o.label}/></div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* PEMBAHASAN */}
                            {isReview && (
                                <div className="mt-10 p-8 bg-amber-50 rounded-[2rem] border border-amber-200 shadow-sm animate-in slide-in-from-bottom-10">
                                    <h4 className="font-black text-amber-800 mb-4 flex items-center gap-3 text-lg"><BookOpen size={24}/> PEMBAHASAN LENGKAP:</h4>
                                    <div className="text-slate-800 text-lg leading-loose font-serif text-justify"><RenderSoal text={q.explanation || "Tidak ada pembahasan."}/></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* FOOTER NAVIGASI */}
                <div className="h-20 bg-white border-t flex items-center justify-between px-8 md:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="p-3 border-2 rounded-xl disabled:opacity-30"><ChevronLeft/></button>
                    <span className="font-black text-slate-700">No. {qIdx+1}</span>
                    <button onClick={()=>setQIdx(Math.min(examData.questions.length-1, qIdx+1))} disabled={qIdx===examData.questions.length-1} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg disabled:opacity-30"><ChevronRight/></button>
                </div>
            </div>
        );
    }

    if(!data) return <LoadingScreen/>;

    const filteredPeriods = filterType === 'ALL' ? (data.periods||[]) : (data.periods||[]).filter(p => p.type === filterType);
    const filteredLMS = data.lms ? data.lms.filter(f => f.category === lmsTab) : [];

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans pb-32">
            {/* HEADER DASHBOARD */}
            <div className="bg-white/80 backdrop-blur-xl p-5 sticky top-0 z-30 shadow-sm flex justify-between items-center px-6 md:px-10 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Edu<span className="text-indigo-600">Prime</span></h1>
                <div className="flex gap-4 items-center">
                    <div className="hidden md:block text-right">
                        <p className="font-bold text-slate-800 text-sm">{data.user.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.user.role}</p>
                    </div>
                    <button onClick={onLogout} className="bg-rose-50 text-rose-600 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><LogOut size={20}/></button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                {view === 'home' && (
                    <>
                        {/* JURUSAN SELECTOR */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                            <div className="w-full md:w-1/3 relative z-10">
                                <h2 className="font-black text-2xl text-slate-800 mb-2">Target Kampus</h2>
                                <p className="text-slate-500 font-medium">Atur strategi masa depanmu.</p>
                            </div>
                            <div className="w-full md:w-2/3 grid gap-4 relative z-10">
                                <div className="flex gap-3">
                                    <select className="w-1/3 p-4 bg-slate-50 border-0 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-indigo-500" value={selectedUni1} onChange={e=>setSelectedUni1(e.target.value)}><option value="">Universitas 1</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select>
                                    <select className="w-2/3 p-4 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}><option value="">Pilihan Prodi 1</option>{prodiList1.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select>
                                </div>
                                <div className="flex gap-3">
                                    <select className="w-1/3 p-4 bg-slate-50 border-0 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-indigo-500" value={selectedUni2} onChange={e=>setSelectedUni2(e.target.value)}><option value="">Universitas 2</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}</select>
                                    <select className="w-2/3 p-4 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500" value={selectedMajor.m2} onChange={e=>setSelectedMajor({...selectedMajor, m2:e.target.value})}><option value="">Pilihan Prodi 2</option>{prodiList2.map(m=><option key={m.id} value={m.id}>{m.program} (PG: {m.passing_grade})</option>)}</select>
                                </div>
                                <button onClick={saveMajors} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.01] transition-all">SIMPAN TARGET</button>
                            </div>
                        </div>

                        {/* FILTER & EXAMS */}
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {['ALL', 'UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (
                                <button key={t} onClick={()=>setFilterType(t)} className={`px-8 py-3 rounded-full text-xs font-black whitespace-nowrap transition-all ${filterType===t ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>{t}</button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {filteredPeriods.map(p => (
                                <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="font-black text-2xl text-slate-800">{p.name}</h3>
                                            <div className="flex gap-2 mt-2">
                                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest border border-indigo-100">{p.type}</span>
                                                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200">{p.exams.length} Subtes</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {p.exams.map(e => (
                                            <div key={e.id} className={`p-6 rounded-[1.5rem] border-2 transition-all relative overflow-hidden ${e.status==='done'?'bg-emerald-50 border-emerald-100':'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg'}`}>
                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div className={`p-3 rounded-2xl ${e.status==='done'?'bg-emerald-200 text-emerald-800':'bg-slate-100 text-slate-600'}`}>
                                                        {e.status==='done' ? <CheckCircle size={20}/> : <Play size={20} className="ml-1"/>}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{e.duration} Menit</span>
                                                </div>
                                                <h4 className="font-bold text-lg text-slate-800 mb-6 leading-tight relative z-10">{e.title}</h4>
                                                
                                                {e.status==='done' ? (
                                                    p.show_result ? (
                                                        <button onClick={()=>openReview(e.id)} className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all">
                                                            NILAI: {e.score}
                                                        </button>
                                                    ) : (
                                                        <div className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs text-center border border-slate-200">Menunggu Hasil</div>
                                                    )
                                                ) : (
                                                    <button onClick={()=>startExam(e.id, p.can_finish_early)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition-all">
                                                        KERJAKAN
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {view === 'lms' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
                        <div className="bg-white p-2 rounded-2xl border border-slate-100 inline-flex shadow-sm">
                            {['UTBK', 'CPNS', 'TKA', 'MANDIRI'].map(t => (
                                <button key={t} onClick={()=>setLmsTab(t)} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${lmsTab===t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLMS.map(folder => (
                                <div key={folder.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><BookOpen size={24}/></div>
                                        <h3 className="font-black text-xl text-slate-800">{folder.name}</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {folder.materials.map(m => (
                                            <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block p-4 rounded-2xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center gap-3 group">
                                                <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">{m.type==='video'?<Video size={16}/>:<FileText size={16}/>}</div>
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-900">{m.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'ranking' && (
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8">
                        <h2 className="text-3xl font-black mb-8 flex items-center gap-4"><Award className="text-yellow-500" size={40}/> Riwayat & Peringkat</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black tracking-wider">
                                    <tr><th className="p-6 rounded-l-2xl">Ujian</th><th className="p-6">Tanggal</th><th className="p-6 rounded-r-2xl text-right">Skor Akhir</th></tr>
                                </thead>
                                <tbody className="text-slate-700 font-bold">
                                    {data.history?.map((h, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                                            <td className="p-6">{h.exam}</td>
                                            <td className="p-6 text-sm text-slate-400">{new Date(h.date).toLocaleDateString()}</td>
                                            <td className="p-6 text-right font-black text-xl text-indigo-600">{h.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* FLOATING NAVBAR */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl border border-white/50 p-2 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] flex gap-4 z-40 px-6">
                <button onClick={()=>setView('home')} className={`p-4 rounded-full transition-all duration-300 ${view==='home'?'bg-slate-800 text-white shadow-lg scale-110':'-translate-y-0 text-slate-400 hover:text-slate-600'}`}><Home size={24}/></button>
                <button onClick={()=>setView('lms')} className={`p-4 rounded-full transition-all duration-300 ${view==='lms'?'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110':'-translate-y-0 text-slate-400 hover:text-slate-600'}`}><BookOpen size={24}/></button>
                <button onClick={()=>setView('ranking')} className={`p-4 rounded-full transition-all duration-300 ${view==='ranking'?'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110':'-translate-y-0 text-slate-400 hover:text-slate-600'}`}><Award size={24}/></button>
            </div>
        </div>
    );
};

export default StudentDashboard;