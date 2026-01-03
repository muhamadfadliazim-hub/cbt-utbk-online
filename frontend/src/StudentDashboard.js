import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Play, BarChart2, BookOpen, LogOut, Award } from 'lucide-react';
import { Radar } from 'recharts'; // Bapak perlu: npm install recharts
import { API_URL } from './config';

// Mockup Radar jika belum install library, ganti dengan library asli nanti
const RadarChartMock = () => <div className="w-full h-40 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-300 font-bold">RADAR CHART VISUALIZATION</div>;

const StudentDashboard = ({ user, onLogout }) => {
    const [data, setData] = useState(null);
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState({ m1: user.choice1, m2: user.choice2 });
    
    // Exam State
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

    // --- MAJOR SELECTION ---
    const saveMajors = () => {
        fetch(`${API_URL}/student/select-major`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, major1_id: selectedMajor.m1, major2_id: selectedMajor.m2})
        }).then(()=>alert("Jurusan Disimpan!"));
    };

    // --- EXAM ENGINE ---
    const startExam = (eid) => {
        if(!window.confirm("Waktu subtes berjalan. Fokus!")) return;
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{
            setExamContent(d); setActiveExamId(eid); setQIdx(0); setTimeLeft(d.duration * 60);
        });
    };

    const submitExam = () => {
        fetch(`${API_URL}/exams/${activeExamId}/submit`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username: user.username, answers})
        }).then(r=>r.json()).then(res => {
            alert(`Selesai! Skor IRT Anda: ${res.score}`);
            setActiveExamId(null); refresh();
        });
    };

    useEffect(() => {
        if(timeLeft > 0 && activeExamId) {
            const t = setInterval(()=>setTimeLeft(p=>p-1), 1000);
            return ()=>clearInterval(t);
        } else if(timeLeft===0 && activeExamId) submitExam();
    }, [timeLeft, activeExamId]);

    // --- RENDER EXAM MODE ---
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
                        {q.media && <img src={q.media} className="max-w-full h-48 object-contain mb-4 border rounded-lg"/>}
                        <p className="text-lg font-medium mb-6">{q.text}</p>
                        {q.type === 'ISIAN' ? (
                            <input className="w-full p-4 border-2 rounded-xl text-lg font-bold" placeholder="Jawaban Singkat..." value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]:e.target.value})}/>
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
                    <button onClick={()=>setQIdx(Math.max(0, qIdx-1))} className="px-4 py-2 border rounded-lg font-bold">Back</button>
                    {qIdx === examContent.questions.length-1 ? 
                        <button onClick={submitExam} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">SUBMIT</button> : 
                        <button onClick={()=>setQIdx(Math.min(examContent.questions.length-1, qIdx+1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Next</button>
                    }
                </div>
            </div>
        )
    }

    if(!data) return <div className="h-screen flex items-center justify-center">Loading Data...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Profile & Major Selection */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between gap-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Halo, {data.user.full_name}</h1>
                        <p className="text-slate-500">Pejuang PTN 2026</p>
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400">Pilihan 1</label>
                            <select className="w-full p-2 border rounded-lg font-bold text-sm" value={selectedMajor.m1||''} onChange={e=>setSelectedMajor({...selectedMajor, m1:e.target.value})}>
                                <option value="">Pilih Jurusan</option>
                                {majors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.program}</option>)}
                            </select>
                        </div>
                        <button onClick={saveMajors} className="bg-indigo-600 text-white p-3 rounded-xl font-bold h-fit">Simpan</button>
                    </div>
                </div>

                {/* Radar Chart Analysis */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl md:col-span-1">
                        <h3 className="font-bold text-indigo-200 mb-4 flex items-center gap-2"><BarChart2/> ANALISIS KEMAMPUAN</h3>
                        <RadarChartMock/>
                        <p className="mt-4 text-xs text-indigo-300 leading-relaxed">Grafik ini menunjukkan peta kekuatan Anda berdasarkan hasil Tryout.</p>
                    </div>

                    {/* Exam Periods */}
                    <div className="md:col-span-2 space-y-6">
                        {data.periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
                                <h3 className="text-xl font-black mb-4">{p.name}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {p.exams.map(e => (
                                        <div key={e.id} className={`p-4 rounded-2xl border-2 transition-all ${e.status==='done'?'bg-emerald-50 border-emerald-200 opacity-80':'bg-white border-slate-100 hover:border-indigo-500'}`}>
                                            <p className="font-bold text-sm truncate">{e.title}</p>
                                            <div className="flex justify-between items-end mt-4">
                                                {e.status==='done' ? (
                                                    <span className="text-emerald-600 font-black text-lg">{e.score}</span>
                                                ) : (
                                                    <button onClick={()=>startExam(e.id)} className="bg-indigo-600 text-white p-2 rounded-lg"><Play size={16}/></button>
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
            <button onClick={onLogout} className="fixed bottom-8 right-8 bg-rose-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"><LogOut/></button>
        </div>
    );
};

export default StudentDashboard;