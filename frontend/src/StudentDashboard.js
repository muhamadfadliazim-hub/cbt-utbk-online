import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, LogOut, BookOpen, ChevronLeft, ChevronRight, LayoutGrid, Award, Zap, Target, Home, Video, FileText, Play, Clock, Star, Book, Search, X } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('home');
  const [periods, setPeriods] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [reviewData, setReviewData] = useState(null); // State untuk Pembahasan
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const renderText = useCallback((text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((p, i) => p.startsWith('$') ? <InlineMath key={i} math={p.slice(1,-1)}/> : <span key={i} dangerouslySetInnerHTML={{__html:p.replace(/\n/g,'<br/>')}}/>);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`).then(r => r.json()).then(setPeriods);
    fetch(`${API_URL}/materials`).then(r => r.json()).then(setMaterials);
  }, [user.username]);

  // --- LOGIKA UJIAN ---
  const startExam = (eid) => {
    fetch(`${API_URL}/exams/${eid}`).then(r => r.json()).then(d => {
        setQuestions(d.questions || []); setTimeLeft(d.duration * 60); setActiveExam(eid); setCurrentQIdx(0);
    });
  };

  const submitExam = () => {
    fetch(`${API_URL}/exams/${activeExam}/submit`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: user.username, answers })
    }).then(() => window.location.reload());
  };

  // --- LOGIKA PEMBAHASAN (LMS) ---
  const openReview = (eid) => {
    fetch(`${API_URL}/student/exams/${eid}/review?username=${user.username}`).then(r => r.json()).then(setReviewData);
  };

  if (activeExam) {
    return (
        <div className="h-screen flex flex-col bg-[#020617] text-white font-sans">
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-10">
                <span className="text-xl font-black">Segment {currentQIdx + 1}</span>
                <div className="bg-white/5 px-6 py-2 rounded-full border border-indigo-500/50 text-indigo-400 font-mono text-2xl">
                    {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                </div>
                <button onClick={submitExam} className="bg-emerald-600 px-8 py-2 rounded-xl font-black">SUBMIT</button>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-3xl font-bold">{renderText(questions[currentQIdx]?.text)}</div>
                    <div className="grid gap-4">
                        {questions[currentQIdx]?.options.map((o, i) => (
                            <button key={i} onClick={() => setAnswers({...answers, [questions[currentQIdx].id]: o.id})} className={`p-6 rounded-[2rem] border-2 text-left transition-all ${answers[questions[currentQIdx].id] === o.id ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-transparent'}`}>
                                <span className="font-black mr-4">{o.id}.</span> {renderText(o.label)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-24 border-t border-white/10 flex items-center justify-between px-10">
                <button onClick={() => setCurrentQIdx(p => Math.max(0, p-1))} className="p-4 bg-white/5 rounded-full"><ChevronLeft/></button>
                <button onClick={() => setCurrentQIdx(p => Math.min(questions.length-1, p+1))} className="p-4 bg-indigo-600 rounded-full"><ChevronRight/></button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-20">
      {/* Royal Header */}
      <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#020617]/80 backdrop-blur-xl z-50">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">EDU<span className="text-indigo-500">PRIME</span></h1>
          <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-white">{user.name}</p>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Premium Member</p>
              </div>
              <button onClick={onLogout} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20"><LogOut/></button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-16">
          {tab === 'home' && (
              <div className="space-y-16 animate-in fade-in duration-700">
                  {/* Hero */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[4rem] p-12 text-white border border-white/10 shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                          <span className="bg-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Academic Elite</span>
                          <h2 className="text-6xl font-black tracking-tight leading-tight">Kejar Skor <br/>Tertinggi Anda.</h2>
                          <p className="text-slate-400 text-xl max-w-lg font-light">Simulasi ujian dengan algoritma IRT standar nasional untuk hasil presisi.</p>
                      </div>
                      <Award size={300} className="absolute right-[-50px] top-[-50px] opacity-10 rotate-12"/>
                  </div>

                  {/* Tryout CPNS & UTBK List */}
                  <div className="grid gap-10 md:grid-cols-2">
                      {periods.map(p => (
                          <div key={p.id} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
                              <div className="flex justify-between items-center mb-8">
                                  <div className="bg-indigo-600/20 text-indigo-400 p-4 rounded-2xl font-black text-2xl">{p.name[0]}</div>
                                  <span className="bg-slate-900 text-indigo-400 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-indigo-500/20">{p.type}</span>
                              </div>
                              <h3 className="text-3xl font-bold text-white mb-8">{p.name}</h3>
                              <div className="space-y-4">
                                  {p.exams.map(e => (
                                      <div key={e.id} className="flex justify-between items-center p-6 bg-white/[0.03] rounded-[2rem] hover:bg-indigo-600 transition-all group">
                                          <div>
                                              <p className="font-black text-white text-lg">{e.title}</p>
                                              <p className="text-[10px] text-slate-500 font-bold uppercase group-hover:text-indigo-200">{e.duration} Mins &bull; IRT Active</p>
                                          </div>
                                          {e.is_done ? (
                                              <button onClick={() => openReview(e.id)} className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2 text-xs font-black">
                                                  <CheckCircle size={18}/> REVIEW
                                              </button>
                                          ) : (
                                              <button onClick={() => startExam(e.id)} className="bg-white text-indigo-900 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
                                                  <Play size={20} fill="currentColor"/>
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
              <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
                  <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Imperial <span className="text-indigo-500">Library</span></h2>
                      <p className="text-slate-500 text-xl">Materi belajar eksklusif untuk persiapan skor 800+.</p>
                  </div>
                  <div className="grid gap-8 md:grid-cols-3">
                      {materials.map(m => (
                          <div key={m.id} onClick={() => window.open(m.content_url, '_blank')} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 hover:-translate-y-4 transition-all duration-500 cursor-pointer group flex flex-col h-full">
                              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 ${m.type==='video'?'bg-rose-500/10 text-rose-500':'bg-indigo-500/10 text-indigo-400'}`}>
                                  {m.type==='video'?<Video size={40}/>:<FileText size={40}/>}
                              </div>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 block">{m.category}</span>
                              <h4 className="text-2xl font-bold text-white leading-tight mb-10 flex-1">{m.title}</h4>
                              <div className="flex items-center justify-between pt-8 border-t border-white/5 group-hover:text-indigo-400 transition-colors">
                                  <span className="text-xs font-black tracking-widest uppercase">Open Module</span>
                                  <ChevronRight/>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* Modal Pembahasan (Review) */}
      {reviewData && (
          <div className="fixed inset-0 bg-[#020617] z-[100] overflow-y-auto p-6 md:p-20 animate-in slide-in-from-bottom duration-700">
              <div className="max-w-4xl mx-auto space-y-12">
                  <div className="flex justify-between items-center border-b border-white/10 pb-8">
                      <div>
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Review & Pembahasan</h2>
                          <p className="text-emerald-400 font-black mt-2">SKOR IRT ANDA: {reviewData.score}</p>
                      </div>
                      <button onClick={() => setReviewData(null)} className="p-4 bg-white/5 rounded-full text-slate-400"><X size={32}/></button>
                  </div>
                  {reviewData.questions.map((q, i) => (
                      <div key={i} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-8 relative overflow-hidden">
                          <span className="bg-indigo-600 text-white px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest">Nomor {i+1}</span>
                          <div className="text-2xl font-bold text-white">{renderText(q.text)}</div>
                          <div className="grid gap-3">
                              {q.options.map((o, idx) => (
                                  <div key={idx} className={`p-6 rounded-2xl border flex justify-between items-center ${o.is_correct ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-black' : 'bg-white/5 border-transparent opacity-60'}`}>
                                      <span>{o.idx}. {renderText(o.label)}</span>
                                      {o.is_correct && <CheckCircle/>}
                                  </div>
                              ))}
                          </div>
                          <div className="bg-indigo-500/10 p-8 rounded-[2rem] border-l-[10px] border-indigo-500 text-indigo-300">
                              <p className="text-xs font-black uppercase tracking-widest mb-4">💡 Analisis Solusi</p>
                              <div className="text-lg leading-relaxed italic">{renderText(q.explanation || "Pembahasan eksklusif tersedia dalam modul LMS.")}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Royal Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#020617]/90 backdrop-blur-2xl border-t border-white/10 p-6 flex justify-around items-center z-50 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pb-12">
          <button onClick={() => setTab('home')} className={`transition-all duration-500 ${tab === 'home' ? 'text-indigo-400 scale-150' : 'text-slate-600'}`}><Home size={28}/></button>
          <button onClick={() => setTab('lms')} className={`transition-all duration-500 ${tab === 'lms' ? 'text-indigo-400 scale-150' : 'text-slate-600'}`}><Book size={28}/></button>
          <button onClick={() => setTab('target')} className={`transition-all duration-500 ${tab === 'target' ? 'text-indigo-400 scale-150' : 'text-slate-600'}`}><Target size={28}/></button>
      </div>

      <footer className="hidden md:block py-20 text-center text-slate-700 border-t border-white/5 bg-[#020617] mt-40">
          <p className="font-black text-[12px] tracking-[1em] mb-8 uppercase text-slate-600">EduPrime Imperial v22.0</p>
          <p className="text-2xl font-black text-white tracking-tighter uppercase opacity-80 italic underline decoration-indigo-500">MUHAMAD FADLI AZIM</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;