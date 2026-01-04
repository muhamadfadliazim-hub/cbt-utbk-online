import React, { useState, useEffect, useCallback } from 'react';
import { Play, LogOut, Home, BookOpen, Clock, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// RENDERER CANGGIH (LaTeX + HTML + Image)
const RenderSoal = ({ text, media }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g); // Deteksi LaTeX inline
    return (
        <div className="space-y-4">
            {media && <img src={media} alt="Soal" className="max-w-full h-auto rounded-lg shadow-sm border mx-auto" />}
            <div className="text-lg text-slate-800 leading-loose font-serif">
                {parts.map((p, i) => {
                    if (p.startsWith('$')) return <InlineMath key={i} math={p.slice(1, -1)} />;
                    return <span key={i} dangerouslySetInnerHTML={{ 
                        __html: p.replace(/\n/g, '<br/>')
                                 .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                                 .replace(/_(.*?)_/g, '<i>$1</i>')
                    }} />;
                })}
            </div>
        </div>
    );
};

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [data, setData] = useState(null);
    const [mode, setMode] = useState(null); // 'exam', 'major_selection'
    const [examData, setExamData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [qIdx, setQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    // Major Selection State
    const [allMajors, setAllMajors] = useState([]);
    const [myChoices, setMyChoices] = useState([null, null, null, null]);

    const refresh = useCallback(() => { 
        fetch(`${API_URL}/student/data?username=${user.username}`).then(r=>r.json()).then(d=>{
            setData(d);
            // Pre-fill choices jika ada
            const initial = [null, null, null, null];
            d.choices?.forEach((c, i) => { if(c && i < 4) initial[i] = c.id; });
            setMyChoices(initial);
        });
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(setAllMajors);
    }, [user.username]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if(timeLeft > 0 && mode==='exam') { const t = setTimeout(()=>setTimeLeft(timeLeft-1), 1000); return ()=>clearTimeout(t); } else if(timeLeft===0 && mode==='exam') submitExam(); }, [timeLeft, mode]);

    const startExam = (eid) => { if(!window.confirm("Mulai Ujian?")) return; fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ setExamData(d); setMode('exam'); setQIdx(0); setTimeLeft(d.duration * 60); setAnswers({}); }); };
    const submitExam = () => { fetch(`${API_URL}/exams/${examData.id}/submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user.username, answers})}).then(r=>r.json()).then(res => { alert(`Skor Akhir: ${res.score}`); setMode(null); refresh(); }); };

    // --- LOGIKA SNBT JURUSAN ---
    const handleMajorChange = (slotIdx, majorId) => {
        const newChoices = [...myChoices];
        newChoices[slotIdx] = majorId ? parseInt(majorId) : null;
        setMyChoices(newChoices);
    };

    const saveMajors = () => {
        // Validasi Frontend Sederhana sebelum kirim
        const filled = myChoices.filter(c => c !== null);
        if (filled.length >= 3) {
            const selectedObjs = allMajors.filter(m => filled.includes(m.id));
            const hasD3 = selectedObjs.some(m => m.program_type === 'D3');
            if (!hasD3) {
                alert("Aturan SNBT 2026: Jika memilih lebih dari 2 prodi, Anda WAJIB memilih minimal satu program D3.");
                return;
            }
        }
        fetch(`${API_URL}/student/majors`, {
            method: 'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ username: user.username, choices: myChoices })
        }).then(async r => {
            const res = await r.json();
            if(!r.ok) alert(res.detail);
            else { alert("Pilihan berhasil disimpan!"); refresh(); setView('home'); }
        });
    };

    // --- VIEW: UJIAN ---
    if(mode === 'exam' && examData) {
        const q = examData.questions[qIdx];
        return (
            <div className="h-screen flex flex-col bg-slate-50 font-sans fixed inset-0 z-50">
                <div className="h-16 bg-white shadow flex items-center justify-between px-6">
                    <h1 className="font-bold text-slate-800 line-clamp-1">{examData.title}</h1>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-mono font-bold flex gap-2"><Clock size={16}/> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full bg-white shadow-sm my-4 rounded-xl">
                        <RenderSoal text={q.text} media={q.media} />
                        <div className="mt-8 space-y-3">
                            {q.options.map(o => (
                                <button key={o.id} onClick={()=>setAnswers({...answers, [q.id]:o.id})} 
                                    className={`w-full p-4 text-left border rounded-xl transition-all ${answers[q.id]===o.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg ring-2 ring-indigo-200' : 'bg-white hover:bg-slate-50 text-slate-700'}`}>
                                    <div className="flex gap-3">
                                        <span className="font-bold">{o.id}.</span>
                                        <RenderSoal text={o.label} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Navigation Bar Bottom */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center px-8">
                        <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} disabled={qIdx===0} className="px-6 py-2 border rounded-xl font-bold hover:bg-slate-50">Sebelumnya</button>
                        <div className="text-sm font-bold text-slate-400">No. {qIdx+1} / {examData.questions.length}</div>
                        {qIdx===examData.questions.length-1 ? <button onClick={submitExam} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">Kumpulkan</button> : <button onClick={()=>setQIdx(qIdx+1)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">Selanjutnya</button>}
                    </div>
                </div>
            </div>
        );
    }

    if(!data) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading EduPrime...</div>;

    // --- VIEW: UTAMA ---
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-32">
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-black text-slate-800">Edu<span className="text-indigo-600">Prime</span></h1>
                <div className="flex gap-4">
                    <button onClick={()=>setView('majors')} className="text-sm font-bold text-indigo-600 flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full"><GraduationCap size={16}/> Jurusan</button>
                    <button onClick={onLogout} className="text-rose-500"><LogOut size={20}/></button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {view === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.periods?.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-lg text-slate-800">{p.name}</h3>
                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">{p.type}</span>
                                </div>
                                <div className="space-y-2">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="p-3 border rounded-xl flex justify-between items-center group hover:border-indigo-200 bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${e.status==='done'?'bg-emerald-100 text-emerald-600':'bg-indigo-100 text-indigo-600'}`}>{e.status==='done'?'✓':(e.id.split('_').pop())}</div>
                                                <p className="font-bold text-sm text-slate-700">{e.title}</p>
                                            </div>
                                            {e.status==='done' ? <span className="font-bold text-emerald-600 text-lg">{e.score}</span> : <button onClick={()=>startExam(e.id)} className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"><Play size={14}/></button>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'majors' && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border max-w-2xl mx-auto">
                        <h2 className="text-2xl font-black mb-2">Pilihan Jurusan SNBT 2026</h2>
                        <p className="text-slate-500 mb-6 text-sm">Ketentuan: Maksimal 4 pilihan. Jika memilih &ge; 3 prodi, <b>wajib</b> menyertakan minimal 1 program D3.</p>
                        
                        <div className="space-y-4">
                            {[0,1,2,3].map((i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Pilihan {i+1}</label>
                                    <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-slate-700" value={myChoices[i] || ""} onChange={(e)=>handleMajorChange(i, e.target.value)}>
                                        <option value="">-- Kosong --</option>
                                        {allMajors.map(m => (
                                            <option key={m.id} value={m.id}>{m.university} - {m.program} ({m.program_type})</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <button onClick={saveMajors} className="mt-8 w-full p-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Simpan Pilihan</button>
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border p-2 rounded-full shadow-2xl flex gap-2 z-40">
                <button onClick={()=>setView('home')} className={`p-4 rounded-full transition-all ${view==='home'?'bg-indigo-600 text-white shadow-lg':'text-slate-400 hover:bg-slate-50'}`}><Home size={24}/></button>
                <button onClick={()=>setView('lms')} className={`p-4 rounded-full transition-all ${view==='lms'?'bg-indigo-600 text-white shadow-lg':'text-slate-400 hover:bg-slate-50'}`}><BookOpen size={24}/></button>
            </div>
        </div>
    );
};
export default StudentDashboard;