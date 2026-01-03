import React, { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, LogOut, ChevronLeft, ChevronRight, 
    Target, Home, Video, FileText, Play, Link, Trophy
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('home');
  const [periods, setPeriods] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const renderText = useCallback((text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((p, i) => 
        p.startsWith('$') ? <InlineMath key={i} math={p.slice(1, -1)}/> : 
        <span key={i} dangerouslySetInnerHTML={{__html: p.replace(/\n/g, '<br/>')}}/>
    );
  }, []);

useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`)
        .then(r => r.json())
        .then(data => {
            setPeriods(Array.isArray(data) ? data : []);
        })
        .catch(() => setPeriods([]));

    fetch(`${API_URL}/materials`)
        .then(r => r.json())
        .then(data => {
            setMaterials(Array.isArray(data) ? data : []);
        })
        .catch(() => setMaterials([]));
}, [user.username]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, activeExam]);

  const startExam = (eid) => {
    fetch(`${API_URL}/exams/${eid}`).then(r => r.json()).then(d => {
        setQuestions(d.questions || []);
        setTimeLeft((d.duration || 60) * 60);
        setActiveExam(eid);
        setCurrentQIdx(0);
        setAnswers({});
    });
  };

  if (activeExam && questions.length > 0) {
    const q = questions[currentQIdx];
    return (
        <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden font-sans">
            <div className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#020617] z-30">
                <div className="flex items-center gap-5">
                    <div className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">{currentQIdx+1}</div>
                    <p className="text-lg font-bold text-indigo-300 tracking-tight">{currentQIdx+1} of {questions.length}</p>
                </div>
                <div className="bg-white/5 px-8 py-4 rounded-[2rem] border border-white/10 font-mono font-black text-3xl">
                    {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                </div>
                <button onClick={() => window.location.reload()} className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-10 py-4 rounded-2xl font-black">EXIT</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 md:p-16">
                <div className="max-w-5xl mx-auto space-y-12">
                    {q?.reading_material && <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/10 text-slate-300 italic text-xl shadow-inner">{renderText(q.reading_material)}</div>}
                    <div className="bg-white/[0.02] p-10 rounded-[4rem] border border-white/5 shadow-2xl">
                        <div className="text-3xl font-bold text-white mb-16 leading-snug">{renderText(q?.text)}</div>
                        <div className="grid gap-6">
                            {q?.options.map((o, i) => (
                                <label key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-8 cursor-pointer ${answers[q.id] === o.id ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-transparent hover:border-white/20'}`}>
                                    <input type="radio" className="hidden" checked={answers[q.id] === o.id} onChange={() => setAnswers({...answers, [q.id]: o.id})}/>
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl ${answers[q.id] === o.id ? 'bg-white text-indigo-900 shadow-2xl' : 'bg-white/10 text-slate-400'}`}>{o.id}</div>
                                    <span className="font-bold text-2xl">{renderText(o.label)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-28 border-t border-white/5 bg-[#020617] flex items-center justify-between px-16">
                <button onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} className="p-6 rounded-full bg-white/5 border border-white/10"><ChevronLeft size={40}/></button>
                <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-20 py-5 rounded-[2rem] font-black text-2xl uppercase tracking-widest">Submit</button>
                <button onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))} className="p-6 rounded-full bg-indigo-600"><ChevronRight size={40}/></button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] font-sans pb-24 text-slate-300">
      <div className="bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 px-12 py-8 flex justify-between items-center sticky top-0 z-20">
          <div className="text-4xl font-black text-white tracking-tighter italic">
              EDU<span className="text-indigo-400">PRIME</span>
          </div>
          <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white">{user.name}</p>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Platinum Account</p>
              </div>
              <button onClick={onLogout} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shadow-xl"><LogOut size={28}/></button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto p-10 space-y-24">
          {tab === 'home' && (
              <div className="space-y-24">
                  <div className="relative bg-[#0F172A] rounded-[5rem] p-16 md:p-24 text-white shadow-2xl flex flex-col md:row items-center justify-between border border-white/10 overflow-hidden">
                        <div className="space-y-8 z-10">
                            <h2 className="text-7xl font-black tracking-tight leading-[1.1]">Unlock Your <br/><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Potential.</span></h2>
                            <p className="text-slate-400 text-2xl font-light italic">Simulasi ujian nasional standar IRT 2026.</p>
                        </div>
                        <Trophy size={300} className="absolute right-[-40px] opacity-5 rotate-12"/>
                  </div>
                  
                  <div className="grid gap-12 md:grid-cols-2">
                      {periods.map(p => (
                          <div key={p.id} className="bg-[#0F172A] p-12 rounded-[4rem] shadow-2xl border border-white/5">
                                  <div className="flex justify-between items-center mb-12">
                                      <div className="bg-indigo-600/20 text-indigo-400 p-6 rounded-[2rem] font-black text-4xl">{p.name[0]}</div>
                                      <span className="px-8 py-2.5 rounded-full bg-slate-950 text-indigo-400 text-xs font-black tracking-[0.2em] uppercase border border-indigo-500/20">{p.type}</span>
                                  </div>
                                  <h3 className="text-4xl font-bold text-white mb-10 tracking-tight">{p.name}</h3>
                                  <div className="grid grid-cols-1 gap-5">
                                      {p.exams.map(e => (
                                          <div key={e.id} className="flex justify-between items-center p-8 bg-white/[0.03] rounded-[2.5rem] hover:bg-indigo-600 transition-all">
                                              <div className="flex flex-col gap-1">
                                                  <p className="font-black text-white text-xl tracking-tight">{e.title}</p>
                                                  <p className="text-[11px] text-slate-500 font-bold uppercase">{e.duration} MINS</p>
                                              </div>
                                              {e.is_done ? (
                                                  <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-[1.5rem]"><CheckCircle size={28}/></div>
                                              ) : (
                                                  <button onClick={() => startExam(e.id)} className="bg-white text-indigo-950 p-5 rounded-full shadow-2xl">
                                                      <Play size={28} fill="currentColor" className="ml-1"/>
                                                  </button>
                                              )}
                                          </div>
                                      ))}
                                  </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {tab === 'lms' && (
              <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                  {materials.map(m => (
                      <div key={m.id} onClick={() => window.open(m.content_url, '_blank')} className="bg-[#0F172A] p-12 rounded-[4rem] shadow-2xl hover:-translate-y-4 transition-all duration-700 cursor-pointer flex flex-col border border-white/5 relative overflow-hidden">
                              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-2xl ${m.type === 'video' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                                  {m.type === 'video' ? <Video size={48}/> : <FileText size={48}/>}
                              </div>
                              <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Premium Module</span>
                              <h4 className="text-3xl font-bold text-white leading-tight flex-1 mb-12 tracking-tight">{m.title}</h4>
                              <div className="flex items-center justify-between pt-10 border-t border-white/5 text-indigo-400">
                                  <span className="text-xs font-black uppercase tracking-[0.2em]">Open Link</span>
                                  <Link size={20}/>
                              </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-[#020617]/90 backdrop-blur-3xl border-t border-white/10 px-12 py-8 flex justify-between items-center z-40 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pb-12">
          <button onClick={() => setTab('home')} className={`transition-all duration-500 ${tab === 'home' ? 'text-indigo-400 scale-[1.7]' : 'text-slate-700'}`}><Home size={32} strokeWidth={3}/></button>
          <button onClick={() => setTab('lms')} className={`transition-all duration-500 ${tab === 'lms' ? 'text-indigo-400 scale-[1.7]' : 'text-slate-700'}`}><FileText size={32} strokeWidth={3}/></button>
          <button onClick={() => setTab('target')} className={`transition-all duration-500 ${tab === 'target' ? 'text-indigo-400 scale-[1.7]' : 'text-slate-700'}`}><Target size={32} strokeWidth={3}/></button>
      </div>

      <footer className="hidden md:block py-24 text-center text-slate-700 border-t border-white/5 bg-[#020617] mt-40">
          <div className="max-w-2xl mx-auto space-y-8">
              <p className="font-black text-[12px] tracking-[1em] uppercase text-slate-600">EduPrime Imperial Assessment</p>
              <p className="font-serif italic text-2xl text-slate-500">"Engineered for the academic elite"</p>
              <p className="text-4xl font-black text-white tracking-tighter uppercase opacity-80">MUHAMAD FADLI AZIM</p>
          </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;