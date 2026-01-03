import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, BarChart2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from './config';

const RadarChartMock = () => <div className="w-full h-40 bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-200 text-xs font-bold border border-indigo-500/30">ANALISIS PETA KEKUATAN</div>;

const StudentDashboard = ({ user, onLogout }) => {
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.c1||'', m2: user.c2||'' });
    
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
        }).then(()=>alert("Jurusan Disimpan!"));
    };

    const startExam = (eid) => {
        if(!window.confirm("Waktu subtes berjalan. Fokus!")) return;
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
            alert(`Selesai! Skor: ${res.score}`);
            setActiveExamId(null); refresh();
        });
    }, [activeExamId, user.username, answers, refresh]);

    useEffect(() => {
        if(timeLeft > 0 && activeExamId) {
            const t = setInterval(()=>setTimeLeft(p=>p-1), 1000);
            return ()=>clearInterval(t);
        } else if(timeLeft===0 && activeExamId) submitExam();
    }, [timeLeft, activeExamId, submitExam]);

    if(activeExamId && examContent) {
        const q = examContent.questions[qIdx];
        return (
            <div className="h-screen flex flex-col bg-slate-50 font-sans">
                <div className="h-16 bg-[#0F172A] text-white flex items-center justify-between px-6">
                    <span className="font-bold">{examContent.title}</span>
                    <span className="bg-blue-600 px-3 py-1 rounded font-mono font-bold">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    {q.passage && <div className="w-1/2 p-8 bg-white overflow-y-auto border-r prose max-w-none">{q.passage}</div>}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {q.media && <img src={q.media} alt="Media" className="max-w-full h-48 object-contain mb-4 border rounded-lg"/>}
                        <p className="text-lg font-medium mb-6">{q.text}</p>
                        {q.type === 'ISIAN' ? (
                            <input className="w-full p-4 border-2 rounded-xl text-lg font-bold" placeholder="Jawaban..." value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]:e.target.value})}/>
                        ) : (
                            <div className="space-y-3">
                                {q.options.map(o=>(
                                    <button key={o.id} onClick={()=>setAnswers({...answers, [q.id]:o.id})} className={`w-full p-4 text-left border-2 rounded-xl font-medium ${answers[q.id]===o.id?'border-blue-600 bg-blue-50':'border-slate-200 bg-white'}`}>{o.id}. {o.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="h-16 border-t bg-white flex items-center justify-between px-6">
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} className="px-4 py-2 border rounded-lg font-bold"><ChevronLeft/></button>
                    {qIdx === examContent.questions.length-1 ? 
                        <button onClick={submitExam} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">SUBMIT</button> : 
                        <button onClick={()=>setQIdx(Math.min(examContent.questions.length-1, qIdx+1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"><ChevronRight/></button>
                    }
                </div>
            </div>
        )
    }

    if(!data) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between gap-8">
                    <div><h1 className="text-3xl font-black text-slate-800">Halo, {data.user.full_name}</h1></div>
                    <div className="flex gap-4 items-end">
                        <select className="p-3 border rounded-xl font-bold text-sm" value={selectedMajor.m1} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}>
                            <option value="">Pilih Jurusan 1</option>
                            {majors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.program}</option>)}
                        </select>
                        <button onClick={saveMajors} className="bg-indigo-600 text-white p-3 rounded-xl font-bold">Simpan</button>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl md:col-span-1"><RadarChartMock/></div>
                    <div className="md:col-span-2 space-y-6">
                        {data.periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
                                <h3 className="text-xl font-black mb-4">{p.name}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {p.exams.map(e => (
                                        <div key={e.id} className={`p-4 rounded-2xl border-2 transition-all ${e.status==='done'?'bg-emerald-50 border-emerald-200':'bg-white hover:border-indigo-500'}`}>
                                            <p className="font-bold text-sm truncate">{e.title}</p>
                                            <div className="flex justify-between items-end mt-4">
                                                {e.status==='done' ? <span className="text-emerald-600 font-black text-lg">{e.score}</span> : <button onClick={()=>startExam(e.id)} className="bg-indigo-600 text-white p-2 rounded-lg"><Play size={16}/></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={onLogout} className="fixed bottom-8 right-8 bg-rose-600 text-white p-4 rounded-full shadow-2xl"><LogOut/></button>
        </div>
    );
};
export default StudentDashboard;