import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, BarChart2, Home } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home'); // home | exam | result
    const [periods, setPeriods] = useState([]);
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeSubtest, setActiveSubtest] = useState(null);
    
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { "P1_PU": { 1: "A" } }
    const [timeLeft, setTimeLeft] = useState(0);
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/student/periods?username=${user.username}`).then(r=>r.json()).then(setPeriods);
    }, []);

    // --- TIMER SYSTEM ---
    useEffect(() => {
        if(!activeSubtest || timeLeft <= 0) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) { handleNextSubtest(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [timeLeft, activeSubtest]);

    const startExam = (p) => {
        setActivePeriod(p);
        enterSubtest(p.exams[0]);
        setView('exam');
    };

    const enterSubtest = async (ex) => {
        const res = await fetch(`${API_URL}/exams/${ex.id}/questions`);
        const data = await res.json();
        setQuestions(data);
        setActiveSubtest(ex);
        setTimeLeft(ex.duration * 60);
    };

    const handleNextSubtest = () => {
        const idx = activePeriod.exams.findIndex(e => e.id === activeSubtest.id);
        if(idx < activePeriod.exams.length - 1) {
            alert("Waktu Habis / Subtes Selesai. Lanjut ke tes berikutnya.");
            enterSubtest(activePeriod.exams[idx+1]);
        } else {
            finishExam();
        }
    };

    const finishExam = async () => {
        const res = await fetch(`${API_URL}/exams/${activePeriod.id}/finish`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ username: user.username, answers: answers })
        });
        const data = await res.json();
        setResultData(data);
        setView('result');
    };

    const setAns = (qId, val) => {
        setAnswers(prev => ({
            ...prev,
            [activeSubtest.id]: { ...(prev[activeSubtest.id]||{}), [qId]: val }
        }));
    };

    // --- RENDER FUNCTIONS ---
    if(view === 'result' && resultData) {
        const chartData = Object.keys(resultData.detail).map(k => ({ subject: k, A: resultData.detail[k], full: 1000 }));
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-4xl text-center">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">Hasil Analisis Kemampuan</h1>
                    <div className="text-6xl font-black text-indigo-600 mb-8">{resultData.total}</div>
                    <div className="h-96 w-full">
                        <ResponsiveContainer>
                            <RadarChart outerRadius={120} data={chartData}>
                                <PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis />
                                <Radar name="Skor" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <button onClick={()=>window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold mt-8">Kembali ke Dashboard</button>
                </div>
            </div>
        );
    }

    if(view === 'exam' && activeSubtest) {
        return (
            <div className="h-screen flex flex-col bg-white">
                <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow z-20">
                    <div className="font-bold text-lg">{activeSubtest.title}</div>
                    <div className={`font-mono text-xl font-bold px-4 py-1 rounded ${timeLeft<300?'bg-red-500 animate-pulse':'bg-indigo-600'}`}>
                        {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                    </div>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-20 md:w-64 bg-slate-100 border-r p-4 overflow-y-auto hidden md:block">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q,i) => (
                                <div key={q.id} className={`aspect-square flex items-center justify-center rounded font-bold text-sm ${answers[activeSubtest.id]?.[q.id] ? 'bg-indigo-600 text-white':'bg-white border text-slate-500'}`}>{i+1}</div>
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 p-8 overflow-y-auto">
                        {questions.map((q,i) => (
                            <div key={q.id} className="max-w-3xl mx-auto mb-16 border-b pb-8">
                                <div className="flex gap-4 mb-4">
                                    <span className="bg-slate-800 text-white px-3 py-1 rounded font-bold h-fit">#{i+1}</span>
                                    <div className="flex-1">
                                        {q.wacana && <div className="bg-slate-50 p-4 rounded border-l-4 border-indigo-500 text-sm italic mb-4 whitespace-pre-line">{q.wacana}</div>}
                                        <div className="text-lg text-slate-800 mb-4">{q.text}</div>
                                        <div className="space-y-2 pl-4">
                                            {q.options_json?.map((opt, idx) => (
                                                <div key={idx} onClick={()=>setAns(q.id, opt.label)} 
                                                    className={`p-3 border rounded cursor-pointer flex items-center gap-3 transition ${answers[activeSubtest.id]?.[q.id]===opt.label ? 'bg-blue-100 border-blue-500 ring-1 ring-blue-500':'hover:bg-slate-50'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${answers[activeSubtest.id]?.[q.id]===opt.label ? 'bg-blue-600 text-white':'bg-slate-200 text-slate-600'}`}>{opt.label}</div>
                                                    <div>{opt.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleNextSubtest} className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-full shadow-xl font-bold hover:bg-emerald-600 flex items-center gap-2">
                            Selesai Subtes <ChevronRight/>
                        </button>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800">Halo, {user.full_name}</h1>
                    <button onClick={onLogout} className="text-red-500 font-bold">Logout</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {periods.map(p => (
                        <div key={p.id} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition cursor-pointer group" onClick={()=>startExam(p)}>
                            <div className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full w-fit mb-3">{p.exam_type}</div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition">{p.name}</h2>
                            <p className="text-slate-500 mb-4">{p.exams.length} Subtes Ujian • IRT Scoring</p>
                            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold group-hover:bg-indigo-600 transition">Mulai Ujian</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default StudentDashboard;