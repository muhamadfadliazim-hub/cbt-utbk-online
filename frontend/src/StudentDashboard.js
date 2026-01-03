import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, CheckCircle, Play, FileText, LogOut, ChevronRight, BookOpen, X, 
    ChevronLeft, Flag, GraduationCap, Search, Video, 
    LayoutGrid, Award, Zap, Target, Music, User, Home
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('home'); // home, lms, profile
  const [periods, setPeriods] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [reviewExamData, setReviewExamData] = useState(null);
  const [majors, setMajors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedChoice1, setSelectedChoice1] = useState(user.choice1_id || '');
  const [selectedChoice2, setSelectedChoice2] = useState(user.choice2_id || '');
  const [searchMajor, setSearchMajor] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`).then(r => r.json()).then(setPeriods);
    fetch(`${API_URL}/majors`).then(r => r.json()).then(d => setMajors(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/materials`).then(r => r.json()).then(d => setMaterials(Array.isArray(d) ? d : []));
  }, [user.username]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) { 
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000); 
        return () => clearInterval(t); 
    } else if (timeLeft === 0 && activeExam) {
        handleSubmitExam();
    }
  }, [timeLeft, activeExam]);

  const filteredMajors = useMemo(() => {
      return majors.filter(m => 
          m.university.toLowerCase().includes(searchMajor.toLowerCase()) || 
          m.name.toLowerCase().includes(searchMajor.toLowerCase())
      ).slice(0, 50); 
  }, [majors, searchMajor]);

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
        return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const handleSaveMajor = () => {
      fetch(`${API_URL}/users/select-major`, {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username: user.username, choice1_id: parseInt(selectedChoice1), choice2_id: selectedChoice2 ? parseInt(selectedChoice2) : null })
      }).then(r => r.json()).then(d => { alert("Target Disimpan!"); setShowMajorModal(false); onLogout(); });
  };

  const startExam = (examId) => {
      if(!window.confirm("Mulai ujian sekarang?")) return;
      fetch(`${API_URL}/exams/${examId}`).then(r => r.json()).then(data => {
            setQuestions(data.questions); setTimeLeft(data.duration * 60); setAnswers({}); setCurrentQIdx(0); setActiveExam(examId);
      });
  };

  const handleAnswer = (val) => setAnswers({ ...answers, [questions[currentQIdx].id]: val });
  const handleSubmitExam = () => { 
      fetch(`${API_URL}/exams/${activeExam}/submit`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: user.username, answers: answers }) })
      .then(r=>r.json())
      .then(d => { alert(`Ujian Selesai! Skor Anda: ${Math.round(d.score)}`); setActiveExam(null); window.location.reload(); }); 
  };
  
  const toggleMark = (idx) => setMarkedQuestions(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx]);
  const openReview = (examId) => { fetch(`${API_URL}/student/exams/${examId}/review?username=${user.username}`).then(r => r.ok?r.json():Promise.reject("Belum selesai")).then(setReviewExamData).catch(e=>alert(e)); };

  // --- MODE UJIAN (FULLSCREEN) ---
  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
              {/* HEADER UJIAN */}
              <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-30">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-900 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">
                          {currentQIdx + 1}
                      </div>
                      <div className="hidden md:block">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nomor Soal</p>
                          <p className="text-sm font-bold text-slate-700">dari {questions.length} Soal</p>
                      </div>
                  </div>
                  
                  <div className={`px-6 py-2 rounded-full font-mono font-bold text-xl tracking-widest flex items-center gap-3 border ${timeLeft < 300 ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-900 text-white border-slate-900 shadow-lg'}`}>
                      <Clock size={20}/>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>

                  <div className="flex gap-2">
                       <button onClick={()=>setIsNavOpen(!isNavOpen)} className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"><LayoutGrid size={20}/></button>
                       <button onClick={handleSubmitExam} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-emerald-200 transition transform hover:-translate-y-0.5">Selesai</button>
                  </div>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                  {/* AREA SOAL */}
                  <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth pb-32">
                      <div className="max-w-5xl mx-auto space-y-8">
                          
                          {/* Wacana */}
                          {q.reading_material && (
                              <div className="bg-white p-6 lg:p-8 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                                  <div className="font-bold text-amber-600 mb-3 flex items-center gap-2 text-xs uppercase tracking-widest"><BookOpen size={16}/> Bacaan Pendukung</div>
                                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg text-justify">{renderText(q.reading_material)}</div>
                              </div>
                          )}

                          {/* Audio Player */}
                          {q.audio_url && (
                              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex items-center gap-4 shadow-inner">
                                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0"><Music size={24}/></div>
                                  <div className="flex-1">
                                      <div className="text-xs font-bold text-indigo-800 uppercase mb-1">Listening Section</div>
                                      <audio controls src={`${API_URL}${q.audio_url}`} className="w-full h-8"/>
                                  </div>
                              </div>
                          )}

                          {/* Pertanyaan */}
                          <div className="bg-white p-6 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-white">
                              <div className="text-xl lg:text-2xl font-medium text-slate-800 mb-8 leading-relaxed">{renderText(q.text)}</div>
                              
                              {q.image_url && (
                                  <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center p-4">
                                      <img src={`${API_URL}${q.image_url}`} alt="Soal" className="max-h-[500px] object-contain"/>
                                  </div>
                              )}

                              <div className="space-y-4">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group relative ${answers[q.id] === opt.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-5 shrink-0 transition-colors text-lg ${answers[q.id] === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>{String.fromCharCode(65+i)}</div>
                                          <input type="radio" name={`q-${q.id}`} className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                          <div className="text-lg text-slate-700 font-medium w-full">{renderText(opt.label)}</div>
                                          {answers[q.id] === opt.id && <div className="absolute right-4 text-indigo-600"><CheckCircle size={24} fill="currentColor" className="text-indigo-100"/></div>}
                                      </label>
                                  ))}
                                  {q.type === 'complex' && q.options.map(opt => (
                                      <label key={opt.id} className="flex items-center gap-4 p-5 border-2 rounded-2xl hover:bg-slate-50 cursor-pointer border-slate-100 transition-all">
                                          <input type="checkbox" className="w-6 h-6 accent-indigo-600 rounded-md" checked={(answers[q.id]||[]).includes(opt.id)} onChange={e=>{const curr=answers[q.id]||[]; handleAnswer(e.target.checked?[...curr,opt.id]:curr.filter(x=>x!==opt.id))}} />
                                          <span className="text-lg text-slate-700 font-medium">{renderText(opt.label)}</span>
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && (
                                      <input className="w-full p-5 text-xl border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white focus:shadow-lg" placeholder="Ketik jawaban Anda di sini..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* NAVIGATION DRAWER */}
                  <div className={`fixed lg:static inset-y-0 right-0 w-80 bg-white border-l border-slate-200 transform transition-transform duration-300 z-40 lg:transform-none flex flex-col ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                      <div className="p-5 border-b flex justify-between items-center lg:hidden bg-indigo-900 text-white">
                          <span className="font-bold">Navigasi Soal</span>
                          <button onClick={()=>setIsNavOpen(false)} className="p-1 hover:bg-white/20 rounded"><X size={20}/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                          <div className="grid grid-cols-5 gap-3">
                              {questions.map((_, idx) => {
                                  const isAns = answers[questions[idx].id];
                                  const isMarked = markedQuestions.includes(idx);
                                  const isCurrent = currentQIdx === idx;
                                  return (
                                      <button key={idx} onClick={() => {setCurrentQIdx(idx); setIsNavOpen(false);}} 
                                          className={`aspect-square rounded-xl font-bold text-sm relative transition-all shadow-sm flex items-center justify-center
                                          ${isCurrent ? 'bg-indigo-900 text-white ring-2 ring-indigo-400 scale-110' : 
                                            isAns ? 'bg-emerald-500 text-white border-transparent' : 
                                            'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'}`}>
                                          {idx + 1}
                                          {isMarked && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm"></div>}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                      <div className="p-5 border-t bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                          <button onClick={()=>toggleMark(currentQIdx)} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${markedQuestions.includes(currentQIdx)?'bg-amber-100 text-amber-700 border border-amber-200':'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'}`}><Flag size={18}/> {markedQuestions.includes(currentQIdx)?'Hilangkan Tanda':'Tandai Ragu'}</button>
                      </div>
                  </div>
                  {isNavOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={()=>setIsNavOpen(false)}></div>}
              </div>
              
              {/* BOTTOM CONTROL */}
              <div className="h-20 bg-white border-t border-slate-200 shrink-0 flex items-center px-6 lg:px-10 justify-between z-30">
                   <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2 transition"><ChevronLeft size={20}/> <span className="hidden lg:inline">Sebelumnya</span></button>
                   <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="px-6 py-3 rounded-xl bg-indigo-900 text-white font-bold hover:bg-indigo-800 disabled:opacity-50 flex items-center gap-2 transition shadow-lg shadow-indigo-200"><span className="hidden lg:inline">Selanjutnya</span> <ChevronRight size={20}/></button>
              </div>
          </div>
      );
  }

  // --- LOBBY UTAMA ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-0">
      {/* HEADER DESKTOP */}
      <div className="hidden lg:block bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-12">
                  <div className="font-extrabold text-2xl text-indigo-900 flex items-center gap-3"><Zap fill="#f59e0b" className="text-amber-500"/> EduPrime <span className="text-slate-400 font-light text-lg">| Premium CBT</span></div>
                  <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
                      {['exam', 'lms'].map(t => (
                          <button key={t} onClick={()=>setTab(t)} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab===t?'bg-white text-indigo-900 shadow-md':'text-slate-500 hover:text-slate-700'}`}>
                              {t === 'exam' ? 'Ujian Online' : 'E-Learning'}
                          </button>
                      ))}
                  </div>
              </div>
              <div className="flex items-center gap-6">
                  <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded inline-block mt-0.5">{user.username}</div>
                  </div>
                  <button onClick={onLogout} className="bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition shadow-sm"><LogOut size={20}/></button>
              </div>
          </div>
      </div>

      {/* HEADER MOBILE */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b p-5 sticky top-0 z-20 flex justify-between items-center">
          <div className="font-extrabold text-xl text-indigo-900 flex items-center gap-2"><Zap fill="#f59e0b" className="text-amber-500" size={20}/> EduPrime</div>
          <button onClick={onLogout} className="p-2 bg-slate-50 rounded-full text-slate-600"><LogOut size={20}/></button>
      </div>

      <div className="max-w-7xl mx-auto p-5 lg:p-10 space-y-10">
          {tab === 'exam' && (
              <>
                {/* HERO CARD */}
                <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 rounded-[2rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 border border-white/10 mb-2"><Award size={14}/> Official Partner of Muhamad Fadli Azim</div>
                            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Raih PTN Impian.</h2>
                            <p className="text-indigo-200 text-lg">Target Kamu: <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">{user.pilihan1 || "Belum diset"}</span></p>
                            <div className="pt-4">
                                <button onClick={()=>setShowMajorModal(true)} className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 mx-auto md:mx-0"><Target size={18}/> Atur Target Jurusan</button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[140px]">
                                 <div className="text-4xl font-extrabold text-amber-400">{user.pg1 ? "---" : "0"}</div>
                                 <div className="text-xs text-indigo-100 font-bold uppercase mt-2 tracking-wider">Skor Rata-rata</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* EXAM LIST */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><LayoutGrid className="text-indigo-600"/> Paket Ujian Tersedia</h3>
                    </div>
                    
                    {periods.length === 0 && (
                        <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300 text-slate-400">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" alt="Empty" className="h-40 mx-auto opacity-50 mb-4"/>
                            <p>Belum ada paket ujian yang aktif saat ini.</p>
                        </div>
                    )}

                    <div className="grid gap-6">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden group">
                                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 font-bold text-xl">{p.name.charAt(0)}</div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-800">{p.name}</h4>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.type}</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition"><ChevronRight size={20}/></div>
                                </div>
                                <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 transition flex items-center justify-between group/item">
                                            <div>
                                                <div className="font-bold text-slate-700 mb-1">{e.title}</div>
                                                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> {e.duration} Menit</div>
                                            </div>
                                            {e.is_done ? (
                                                <button onClick={()=>openReview(e.id)} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-200 transition flex items-center gap-2"><Award size={14}/> Nilai</button>
                                            ) : (
                                                <button onClick={() => startExam(e.id)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition shadow-sm"><Play size={16} fill="currentColor" className="ml-0.5"/></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </>
          )}

          {tab === 'lms' && (
              <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl"><BookOpen size={32}/></div>
                      <div>
                          <h3 className="text-2xl font-bold text-slate-800">Materi Pembelajaran</h3>
                          <p className="text-slate-500">Akses modul, video, dan referensi belajar eksklusif.</p>
                      </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {materials.map(m=>(
                          <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition duration-300 cursor-pointer group flex flex-col h-full" onClick={()=>window.open(m.content_url, '_blank')}>
                              <div className="flex justify-between items-start mb-6">
                                  <div className={`p-4 rounded-2xl ${m.type==='pdf'?'bg-rose-50 text-rose-600':m.type==='video'?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}`}>
                                      {m.type==='pdf'?<FileText size={28}/>:m.type==='video'?<Video size={28}/>:<Link size={28}/>}
                                  </div>
                                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wide">{m.category}</span>
                              </div>
                              <h4 className="font-bold text-xl text-slate-800 mb-3 group-hover:text-indigo-700 transition line-clamp-2 leading-tight">{m.title}</h4>
                              <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1 leading-relaxed">{m.description || "Pelajari materi ini untuk memperdalam pemahamanmu."}</p>
                              <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-indigo-600 group-hover:text-indigo-800">
                                  <span>Buka Materi</span>
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition"><ChevronRight size={16}/></div>
                              </div>
                          </div>
                      ))}
                      {materials.length===0 && <div className="col-span-3 text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-300 text-slate-400">Belum ada materi yang diunggah oleh admin.</div>}
                  </div>
              </div>
          )}
      </div>

      {/* MOBILE BOTTOM MENU */}
      <div className="lg:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-3 pb-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <button onClick={()=>setTab('exam')} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${tab==='exam'?'text-indigo-600':'text-slate-400'}`}>
              <div className={`p-1.5 rounded-xl ${tab==='exam'?'bg-indigo-100':''}`}><LayoutGrid size={24}/></div>
              Ujian
          </button>
          <button onClick={()=>setTab('lms')} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${tab==='lms'?'text-indigo-600':'text-slate-400'}`}>
              <div className={`p-1.5 rounded-xl ${tab==='lms'?'bg-indigo-100':''}`}><BookOpen size={24}/></div>
              Belajar
          </button>
          <button onClick={()=>setShowMajorModal(true)} className={`flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400`}>
              <div className="p-1.5"><Target size={24}/></div>
              Target
          </button>
      </div>

      {/* MODAL (Target & Review) - Sama seperti sebelumnya, hanya styling modal diperhalus */}
      {showMajorModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
              <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                  <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><GraduationCap size={28}/></div>
                      <h3 className="font-bold text-xl text-slate-800">Tentukan Masa Depanmu</h3>
                      <p className="text-sm text-slate-500">Pilih program studi tujuan untuk analisis kelulusan.</p>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="relative">
                          <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                          <input className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-sm" placeholder="Cari Jurusan / Kampus..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Pilihan 1 (Utama)</label>
                          <select className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-sm" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}>
                              <option value="">-- Pilih Jurusan --</option>
                              {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name} ({m.passing_grade})</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Pilihan 2 (Cadangan)</label>
                          <select className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-sm" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}>
                              <option value="">-- Tidak Memilih --</option>
                              {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name} ({m.passing_grade})</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                      <button onClick={()=>setShowMajorModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">Batal</button>
                      <button onClick={handleSaveMajor} className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Simpan</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL REVIEW */}
      {reviewExamData && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center shadow-sm z-10">
                  <h3 className="font-bold text-lg text-slate-800">Hasil & Pembahasan</h3>
                  <button onClick={()=>setReviewExamData(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-8 max-w-3xl mx-auto pb-20">
                  <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
                      <div className="text-5xl font-extrabold text-indigo-600 mb-2">{Math.round(reviewExamData.score)}</div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Skor Akhir Kamu</div>
                  </div>
                  
                  {reviewExamData.questions.map((q,i)=>(
                      <div key={q.id} className="space-y-4 pb-8 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                              <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-lg">No. {i+1}</span>
                              {q.type && <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">{q.type}</span>}
                          </div>
                          
                          {q.image_url && <img src={`${API_URL}${q.image_url}`} className="max-h-56 rounded-xl border border-slate-200 bg-slate-50"/>}
                          
                          <div className="text-lg text-slate-800 leading-relaxed font-medium">{renderText(q.text)}</div>
                          
                          <div className="space-y-3 pl-4 border-l-4 border-slate-100">
                              {q.options.map((o,idx)=>(
                                  <div key={idx} className={`p-3 rounded-lg flex items-center gap-3 ${o.is_correct ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' : 'text-slate-500'}`}>
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${o.is_correct?'bg-emerald-500 text-white':'bg-slate-200'}`}>{String.fromCharCode(65+idx)}</div>
                                      {renderText(o.label)} {o.is_correct && <CheckCircle size={16} className="text-emerald-500"/>}
                                  </div>
                              ))}
                          </div>
                          
                          <div className="bg-indigo-50 p-5 rounded-2xl text-sm text-indigo-900 leading-relaxed border border-indigo-100">
                              <strong className="block mb-2 text-indigo-700 flex items-center gap-2"><BookOpen size={16}/> Pembahasan:</strong> 
                              {renderText(q.explanation) || "Pembahasan belum tersedia untuk soal ini."}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentDashboard;