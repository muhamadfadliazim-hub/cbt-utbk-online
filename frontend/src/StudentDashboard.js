import React, { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, LogOut, BookOpen, ChevronLeft, ChevronRight, 
    LayoutGrid, Award, Zap, Target, Home, Video, FileText, Play, Clock, Link 
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
      .then(setPeriods)
      .catch(err => console.error("Error periods:", err));
      
    fetch(`${API_URL}/materials`)
      .then(r => r.json())
      .then(setMaterials)
      .catch(err => console.error("Error materials:", err));
  }, [user.username]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, activeExam]);

  const startExam = (eid) => {
    if(!window.confirm("Mulai ujian sekarang?")) return;
    fetch(`${API_URL}/exams/${eid}`)
      .then(r => r.json())
      .then(d => {
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
        <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
            <div className="h-16 border-b flex items-center justify-between px-6 bg-white z-30 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black">{currentQIdx+1}</div>
                    <span className="font-bold text-slate-400">/ {questions.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-mono font-bold">
                    <Clock size={18}/> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                </div>
                <button onClick={() => window.location.reload()} className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition">KELUAR</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-slate-50">
                <div className="max-w-3xl mx-auto space-y-8">
                    {q?.reading_material && <div className="bg-orange-50 p-6 rounded-3xl border border-orange-200 text-slate-700 italic leading-relaxed shadow-sm">{renderText(q.reading_material)}</div>}
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl">
                        <div className="text-2xl font-bold text-slate-800 mb-8">{renderText(q?.text)}</div>
                        <div className="grid gap-4">
                            {q?.options.map((o, i) => (
                                <label key={i} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${answers[q.id] === o.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <input type="radio" className="hidden" name={`q-${q.id}`} checked={answers[q.id] === o.id} onChange={() => setAnswers({...answers, [q.id]: o.id})}/>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${answers[q.id] === o.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{o.id}</div>
                                    <span className="font-bold text-slate-700">{renderText(o.label)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-20 border-t bg-white flex items-center justify-between px-10 shadow-inner">
                <button onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} disabled={currentQIdx === 0} className="p-4 bg-slate-100 rounded-full hover:bg-slate-200 disabled:opacity-30"><ChevronLeft/></button>
                <button onClick={() => window.location.reload()} className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg">SUBMIT</button>
                <button onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))} disabled={currentQIdx === questions.length - 1} className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-30"><ChevronRight/></button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="text-2xl font-black text-blue-600 flex items-center gap-2 tracking-tighter">
              <Zap fill="currentColor" className="text-yellow-400"/> EduPrime
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-800">{user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.username}</p>
              </div>
              <button onClick={onLogout} className="p-2.5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all"><LogOut size={20}/></button>
          </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
          {tab === 'home' && (
              <div className="space-y-12">
                  <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-4">
                          <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/10 uppercase">Member Eksklusif</span>
                          <h2 className="text-4xl font-black tracking-tight">Siap Menaklukkan <br/>Ujian Hari Ini? 🚀</h2>
                          <p className="text-blue-100 text-lg max-w-md">Kalahkan batasanmu dan raih skor tertinggi dengan EduPrime Intelligence System.</p>
                      </div>
                      <Award size={240} className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"/>
                  </div>
                  
                  <div className="space-y-6">
                      <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                          <LayoutGrid className="text-blue-600"/> Paket Ujian Aktif
                      </h3>
                      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                          {periods.map(p => (
                              <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
                                  <div className="flex justify-between items-center mb-6">
                                      <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl font-black text-2xl">{p.name[0]}</div>
                                      <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md">{p.type}</span>
                                  </div>
                                  <h3 className="text-2xl font-black text-slate-800 mb-6">{p.name}</h3>
                                  <div className="space-y-3">
                                      {p.exams.map(e => (
                                          <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100 group">
                                              <div>
                                                  <p className="font-bold text-slate-700">{e.title}</p>
                                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{e.duration} Menit</p>
                                              </div>
                                              {e.is_done ? (
                                                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><CheckCircle size={20}/></div>
                                              ) : (
                                                  <button onClick={() => startExam(e.id)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                      <Play size={16} fill="currentColor" className="ml-1"/>
                                                  </button>
                                              )}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {tab === 'lms' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                      <BookOpen size={32} className="text-blue-600"/> Materi & Modul Belajar
                  </h3>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {materials.map(m => (
                          <div key={m.id} onClick={() => window.open(m.content_url, '_blank')} className="bg-white p-8 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full border border-slate-50">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:rotate-6 ${m.type === 'video' ? 'bg-rose-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                                  {m.type === 'video' ? <Video size={32}/> : <FileText size={32}/>}
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{m.category}</span>
                              <h4 className="font-black text-slate-800 leading-tight group-hover:text-blue-600 flex-1 mb-6">{m.title}</h4>
                              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                  <span className="text-[10px] font-black text-blue-600 tracking-tighter uppercase">Lihat Materi</span>
                                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                      <Link size={14} strokeWidth={3}/>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-2xl border-t px-10 py-5 flex justify-between items-center z-40 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
          <button onClick={() => setTab('home')} className={`transition-all ${tab === 'home' ? 'text-blue-600 scale-125' : 'text-slate-300'}`}><Home size={28} strokeWidth={3}/></button>
          <button onClick={() => setTab('lms')} className={`transition-all ${tab === 'lms' ? 'text-blue-600 scale-125' : 'text-slate-300'}`}><BookOpen size={28} strokeWidth={3}/></button>
          <button onClick={() => setTab('target')} className={`transition-all ${tab === 'target' ? 'text-blue-600 scale-125' : 'text-slate-300'}`}><Target size={28} strokeWidth={3}/></button>
      </div>

      <footer className="hidden md:block py-16 text-center text-slate-400 border-t bg-white mt-20">
          <p className="font-black text-[10px] tracking-[0.4em] mb-3 uppercase text-slate-300">EduPrime CBT System v20.0</p>
          <p className="font-bold text-slate-400">Handcrafted with Excellence by <span className="text-slate-900 font-black">Muhamad Fadli Azim</span></p>
      </footer>
    </div>
  );
};

export default StudentDashboard; 