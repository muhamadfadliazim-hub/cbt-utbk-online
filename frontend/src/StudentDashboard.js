import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    CheckCircle, LogOut, BookOpen, X, ChevronLeft, GraduationCap, 
    LayoutGrid, Award, Zap, Target, Home, ChevronRight, Play, Clock, Link, FileText, Search
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('home');
  const [periods, setPeriods] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [majors, setMajors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const renderText = useCallback((text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
        return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`).then(r => r.json()).then(setPeriods);
    fetch(`${API_URL}/majors`).then(r => r.json()).then(d => setMajors(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/materials`).then(r => r.json()).then(d => setMaterials(Array.isArray(d) ? d : []));
  }, [user.username]);

  const startExam = (eid) => {
      fetch(`${API_URL}/exams/${eid}`).then(r => r.json()).then(data => {
            setQuestions(data.questions || []); 
            setTimeLeft(data.duration * 60); 
            setAnswers({}); 
            setCurrentQIdx(0); 
            setActiveExam(eid);
      });
  };

  const handleAnswer = (val) => setAnswers(prev => ({ ...prev, [questions[currentQIdx].id]: val }));

  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-white font-sans overflow-hidden">
              <div className="h-16 border-b px-6 flex items-center justify-between bg-white z-30 shadow-sm">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">{currentQIdx + 1}</div>
                      <span className="text-sm font-bold text-slate-400">/ {questions.length} Soal</span>
                  </div>
                  <div className="px-6 py-2 bg-slate-900 text-white rounded-full font-mono font-bold text-xl">
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <button onClick={() => window.location.reload()} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black">SELESAI</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                  <div className="max-w-4xl mx-auto space-y-8">
                      {q.reading_material && <div className="bg-slate-50 p-8 rounded-[2rem] border italic leading-relaxed text-slate-700">{renderText(q.reading_material)}</div>}
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-slate-50">
                          <div className="text-2xl font-bold text-slate-800 mb-8">{renderText(q.text)}</div>
                          {q.image_url && <img src={q.image_url} className="mb-8 rounded-3xl max-h-80 mx-auto" alt="Soal" />}
                          <div className="grid gap-4">
                              {q.options.map((opt, i) => (
                                  <label key={i} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${answers[q.id] === opt.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{opt.id}</div>
                                      <span className="font-bold text-slate-700">{renderText(opt.label)}</span>
                                      <input type="radio" className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                  </label>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
              <div className="h-20 border-t flex items-center justify-between px-10">
                  <button onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} className="p-4 bg-slate-100 rounded-full hover:bg-slate-200"><ChevronLeft /></button>
                  <button onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))} className="p-4 bg-blue-600 text-white rounded-full hover:bg-black shadow-xl"><ChevronRight /></button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="text-2xl font-black text-indigo-900 flex items-center gap-2 tracking-tighter"><Zap className="text-yellow-400" fill="currentColor"/> EduPrime</div>
          <button onClick={onLogout} className="p-2 bg-rose-50 text-rose-500 rounded-full"><LogOut size={20}/></button>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
          {tab === 'home' && (
              <>
                <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest border border-white/10 uppercase">Premium Member</div>
                        <h2 className="text-4xl font-black">Halo, Pejuang Sukses! 🚀</h2>
                        <p className="text-indigo-200 text-lg italic">"Master Your Future"</p>
                    </div>
                    <Award size={200} className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"/>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {periods.map(p => (
                        <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl font-black text-2xl">{p.name[0]}</div>
                                <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1 rounded-full uppercase tracking-widest">{p.type}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-6">{p.name}</h3>
                            <div className="space-y-3">
                                {p.exams.map(e => (
                                    <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                                        <span className="font-bold text-slate-600">{e.title}</span>
                                        {e.is_done ? (
                                            <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-lg text-[10px] font-black">SELESAI</span>
                                        ) : (
                                            <button onClick={()=>startExam(e.id)} className="w-10 h-10 bg-indigo-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Play size={16} fill="currentColor" className="ml-1"/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
              </>
          )}

          {tab === 'lms' && (
              <div className="grid gap-8 md:grid-cols-3">
                  {materials.map(m => (
                      <div key={m.id} onClick={()=>window.open(m.content_url,'_blank')} className="bg-white p-8 rounded-[2.5rem] border shadow-xl hover:shadow-indigo-200 transition-all cursor-pointer group flex flex-col h-full">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${m.type==='video'?'bg-rose-50 text-rose-500':'bg-sky-50 text-sky-600'}`}>
                              {m.type==='video' ? <Video size={32}/> : <FileText size={32}/>}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 block">{m.category}</span>
                          <h4 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-600 flex-1">{m.title}</h4>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-6">
                              <span className="text-xs font-black text-blue-600">BUKA MATERI</span>
                              <ChevronRight size={18} className="text-blue-600 group-hover:translate-x-1 transition-transform"/>
                          </div>
                      </div>
                  ))}
                  {materials.length === 0 && <div className="col-span-full py-24 text-center text-slate-400 font-black border-4 border-dashed rounded-[3rem]">KONTEN BELUM TERSEDIA</div>}
              </div>
          )}
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t px-8 py-4 flex justify-between items-center z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] pb-10">
          <button onClick={()=>setTab('home')} className={`flex flex-col items-center gap-1 ${tab==='home'?'text-indigo-900':'text-slate-300'}`}><Home size={28} strokeWidth={tab==='home'?3:2}/><span className="text-[9px] font-black uppercase tracking-tighter">Home</span></button>
          <button onClick={()=>setTab('lms')} className={`flex flex-col items-center gap-1 ${tab==='lms'?'text-indigo-900':'text-slate-300'}`}><BookOpen size={28} strokeWidth={tab==='lms'?3:2}/><span className="text-[9px] font-black uppercase tracking-tighter">Modul</span></button>
          <button onClick={() => setShowMajorModal(true)} className={`flex flex-col items-center gap-1 text-slate-300`}><Target size={28} strokeWidth={2}/><span className="text-[9px] font-black uppercase tracking-tighter">Target</span></button>
      </div>

      <footer className="hidden md:block py-16 text-center text-slate-400 border-t bg-white mt-20">
          <p className="text-xs font-black tracking-[0.2em] mb-2 uppercase">EduPrime Assessment Platform</p>
          <p className="font-bold text-sm">Developed with Excellence for <span className="text-slate-900 font-black">Muhamad Fadli Azim</span></p>
      </footer>
    </div>
  );
};

export default StudentDashboard;