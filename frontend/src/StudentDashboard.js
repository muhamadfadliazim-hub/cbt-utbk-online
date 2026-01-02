import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, CheckCircle, Play, FileText, LogOut, ChevronRight, BookOpen, X, 
    ChevronLeft, Flag, GraduationCap, Building2, Search, Save, Link, Video, 
    Menu, LayoutGrid, Award, BarChart2, Zap 
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('exam');
  const [periods, setPeriods] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [reviewExamData, setReviewExamData] = useState(null);
  const [majors, setMajors] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  // Modal & UI States
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false); // Untuk navigasi soal di mobile
  
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
      if(!window.confirm("Mulai ujian sekarang? Waktu akan berjalan.")) return;
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

  // --- MODE UJIAN (FULL SCREEN & FOKUS) ---
  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
              {/* HEADER UJIAN */}
              <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm">
                  <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">{currentQIdx + 1}</div>
                      <div className="hidden lg:block text-sm font-medium text-slate-500">Soal {currentQIdx + 1} dari {questions.length}</div>
                  </div>
                  
                  <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-lg tracking-wider flex items-center gap-2 ${timeLeft < 300 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                      <Clock size={18}/>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>

                  <div className="flex gap-2">
                       <button onClick={()=>setIsNavOpen(!isNavOpen)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><LayoutGrid size={20}/></button>
                       <button onClick={handleSubmitExam} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 transition">Selesai</button>
                  </div>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                  {/* MAIN QUESTION AREA */}
                  <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth pb-32 lg:pb-10">
                      <div className="max-w-4xl mx-auto space-y-6">
                          
                          {/* Wacana / Bacaan */}
                          {q.reading_material && (
                              <div className="bg-amber-50 p-6 rounded-2xl border-l-4 border-amber-400 text-slate-800 leading-relaxed text-base lg:text-lg shadow-sm">
                                  <div className="font-bold text-amber-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide"><BookOpen size={16}/> Bacaan</div>
                                  {renderText(q.reading_material)}
                              </div>
                          )}

                          {/* Audio Player (TOEFL) */}
                          {q.audio_url && (
                              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Video size={20}/></div>
                                  <audio controls src={`${API_URL}${q.audio_url}`} className="w-full h-10"/>
                              </div>
                          )}

                          {/* Gambar Soal */}
                          {q.image_url && (
                              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                  <img src={`${API_URL}${q.image_url}`} alt="Soal" className="w-full object-contain max-h-[400px] bg-slate-50"/>
                              </div>
                          )}

                          {/* Teks Soal & Jawaban */}
                          <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
                              <div className="text-lg lg:text-xl font-medium text-slate-800 mb-8 leading-relaxed">{renderText(q.text)}</div>
                              
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${answers[q.id] === opt.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 shrink-0 transition-colors ${answers[q.id] === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>{String.fromCharCode(65+i)}</div>
                                          <input type="radio" name={`q-${q.id}`} className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                          <div className="text-base lg:text-lg text-slate-700">{renderText(opt.label)}</div>
                                      </label>
                                  ))}
                                  {q.type === 'complex' && q.options.map(opt => (
                                      <label key={opt.id} className="flex items-center gap-3 p-4 border-2 rounded-xl hover:bg-slate-50 cursor-pointer border-slate-100">
                                          <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={(answers[q.id]||[]).includes(opt.id)} onChange={e=>{const curr=answers[q.id]||[]; handleAnswer(e.target.checked?[...curr,opt.id]:curr.filter(x=>x!==opt.id))}} />
                                          <span className="text-lg">{renderText(opt.label)}</span>
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && (
                                      <input className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition" placeholder="Ketik jawaban Anda di sini..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* NAVIGATION SIDEBAR (Desktop: Sidebar, Mobile: Overlay/Drawer) */}
                  <div className={`fixed lg:static inset-y-0 right-0 w-80 bg-white border-l border-slate-200 transform transition-transform duration-300 z-40 lg:transform-none flex flex-col ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                      <div className="p-4 border-b font-bold text-slate-700 flex justify-between items-center lg:hidden">
                          <span>Navigasi Soal</span>
                          <button onClick={()=>setIsNavOpen(false)}><X/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                          <div className="grid grid-cols-5 gap-2">
                              {questions.map((_, idx) => {
                                  const isAns = answers[questions[idx].id];
                                  const isMarked = markedQuestions.includes(idx);
                                  const isCurrent = currentQIdx === idx;
                                  return (
                                      <button key={idx} onClick={() => {setCurrentQIdx(idx); setIsNavOpen(false);}} 
                                          className={`aspect-square rounded-lg font-bold text-sm relative transition-all ${isCurrent ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-600' : isAns ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                          {idx + 1}{isMarked && <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></div>}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                      <div className="p-4 border-t bg-slate-50">
                          <button onClick={()=>toggleMark(currentQIdx)} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-2 ${markedQuestions.includes(currentQIdx)?'bg-amber-100 text-amber-700 border border-amber-200':'bg-white text-slate-600 border border-slate-200'}`}><Flag size={18}/> Ragu-ragu</button>
                      </div>
                  </div>
                  
                  {/* OVERLAY FOR MOBILE NAV */}
                  {isNavOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={()=>setIsNavOpen(false)}></div>}
              </div>
              
              {/* BOTTOM BAR NAV (Mobile & Desktop) */}
              <div className="h-16 bg-white border-t border-slate-200 shrink-0 flex items-center px-4 lg:px-8 justify-between z-30">
                   <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"><ChevronLeft size={18}/> <span className="hidden lg:inline">Sebelumnya</span></button>
                   <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"><span className="hidden lg:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
              </div>
          </div>
      );
  }

  // --- DASHBOARD UTAMA (LOBBY) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 lg:pb-0">
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white border-b p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
          <div className="font-bold text-lg text-indigo-700 flex items-center gap-2"><Hexagon fill="currentColor" size={20}/> EduPrime</div>
          <button onClick={onLogout}><LogOut size={20} className="text-slate-400"/></button>
      </div>

      {/* DESKTOP SIDEBAR (Optional if needed, but lets keep it top nav for student simplicity like Ruangguru web) */}
      <div className="hidden lg:block bg-white border-b sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                  <div className="font-bold text-xl text-indigo-700 flex items-center gap-2"><Hexagon fill="currentColor"/> EduPrime CBT</div>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                      <button onClick={()=>setTab('exam')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${tab==='exam'?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>Ujian</button>
                      <button onClick={()=>setTab('lms')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${tab==='lms'?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>Materi Belajar</button>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-right">
                      <div className="text-sm font-bold text-slate-700">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.username}</div>
                  </div>
                  <button onClick={onLogout} className="bg-slate-100 p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition"><LogOut size={18}/></button>
              </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
          {tab === 'exam' && (
              <>
                {/* HERO CARD - TARGET */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 mb-3 border border-white/10"><Award size={14}/> Sistem IRT Aktif</div>
                            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Halo, Pejuang {user.pilihan1 ? "Kampus" : "Masa Depan"}!</h2>
                            <p className="text-indigo-200 text-sm lg:text-base max-w-xl">Target utama kamu adalah <strong>{user.pilihan1 || "Belum dipilih"}</strong>. Pertahankan konsistensi latihan untuk mencapai Passing Grade.</p>
                            <div className="flex gap-3 mt-6">
                                <button onClick={()=>setShowMajorModal(true)} className="bg-white text-indigo-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition shadow-lg flex items-center gap-2"><GraduationCap size={18}/> Atur Target Jurusan</button>
                            </div>
                        </div>
                        {/* STATS MINI */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[150px] text-center">
                            <div className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-1">Rata-Rata Skor</div>
                            <div className="text-3xl font-extrabold">{user.pg1 ? "---" : "0"}</div>
                        </div>
                    </div>
                </div>

                {/* LIST PAKET UJIAN */}
                <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Zap className="text-amber-500" fill="currentColor"/> Paket Tersedia</h3>
                    </div>
                    
                    {periods.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">Belum ada paket ujian yang aktif saat ini.</div>
                    )}

                    {periods.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden group">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800">{p.name}</h4>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1 ${p.type==='CPNS'?'bg-amber-100 text-amber-700':p.type==='UTBK'?'bg-indigo-100 text-indigo-700':'bg-emerald-100 text-emerald-700'}`}>{p.type}</span>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200 group-hover:border-indigo-200 group-hover:text-indigo-600 transition"><ChevronRight/></div>
                            </div>
                            <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {p.exams.map(e => (
                                    <div key={e.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-slate-700 mb-1">{e.title}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-2"><Clock size={12}/> {e.duration} Menit</div>
                                        </div>
                                        {e.is_done ? (
                                            <button onClick={()=>openReview(e.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition">Nilai & Bahas</button>
                                        ) : (
                                            <button onClick={() => startExam(e.id)} className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:scale-110 transition"><Play size={12} fill="currentColor"/></button>
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
              <div className="space-y-6">
                   <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><BookOpen className="text-indigo-600"/> Materi & Pembelajaran</h3>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {materials.map(m=>(
                          <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group" onClick={()=>window.open(m.content_url, '_blank')}>
                              <div className="flex items-start justify-between mb-4">
                                  <div className={`p-3 rounded-xl ${m.type==='pdf'?'bg-rose-50 text-rose-600':m.type==='video'?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}`}>
                                      {m.type==='pdf'?<FileText size={24}/>:m.type==='video'?<Video size={24}/>:<Link size={24}/>}
                                  </div>
                                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase">{m.category}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition">{m.title}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2">{m.description || "Pelajari materi ini untuk meningkatkan pemahamanmu."}</p>
                              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs font-bold text-indigo-600">
                                  Buka Materi <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition"/>
                              </div>
                          </div>
                      ))}
                      {materials.length===0 && <div className="col-span-3 text-center py-20 text-slate-400">Belum ada materi yang diunggah.</div>}
                  </div>
              </div>
          )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <button onClick={()=>setTab('exam')} className={`flex flex-col items-center gap-1 text-xs font-bold ${tab==='exam'?'text-indigo-600':'text-slate-400'}`}>
              <LayoutGrid size={20}/> Ujian
          </button>
          <button onClick={()=>setTab('lms')} className={`flex flex-col items-center gap-1 text-xs font-bold ${tab==='lms'?'text-indigo-600':'text-slate-400'}`}>
              <BookOpen size={20}/> Belajar
          </button>
          <button onClick={()=>setShowMajorModal(true)} className={`flex flex-col items-center gap-1 text-xs font-bold text-slate-400`}>
              <GraduationCap size={20}/> Target
          </button>
      </div>

      {/* MODAL PILIH JURUSAN */}
      {showMajorModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <h3 className="font-bold text-xl mb-1">Atur Target Kamu</h3>
                  <p className="text-sm text-slate-500 mb-6">Pilih jurusan impian untuk melihat peluang kelulusan.</p>
                  
                  <div className="space-y-4">
                      <div className="relative">
                          <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                          <input className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Cari Universitas / Prodi..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Pilihan 1 (Prioritas)</label>
                          <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}>
                              <option value="">-- Pilih Jurusan --</option>
                              {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name} ({m.passing_grade})</option>)}
                          </select>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Pilihan 2 (Cadangan)</label>
                          <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}>
                              <option value="">-- Tidak Memilih --</option>
                              {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name} ({m.passing_grade})</option>)}
                          </select>
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                      <button onClick={()=>setShowMajorModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Batal</button>
                      <button onClick={handleSaveMajor} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Simpan Target</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL REVIEW */}
      {reviewExamData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                      <div><h3 className="font-bold text-xl text-slate-800">Pembahasan & Hasil</h3><p className="text-indigo-600 font-bold">Skor Akhir: {Math.round(reviewExamData.score)}</p></div>
                      <button onClick={()=>setReviewExamData(null)} className="p-2 bg-white rounded-full hover:bg-rose-50 hover:text-rose-600 transition"><X/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                      {reviewExamData.questions.map((q,i)=>(
                          <div key={q.id} className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                  <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">No. {i+1}</span>
                                  {q.type && <span className="text-xs uppercase font-bold text-slate-400 border px-2 py-0.5 rounded">{q.type}</span>}
                              </div>
                              
                              {q.image_url && <img src={`${API_URL}${q.image_url}`} alt="Soal" className="max-h-64 mb-6 rounded-lg border"/>}
                              <div className="mb-6 text-lg text-slate-800 leading-relaxed">{renderText(q.text)}</div>
                              
                              <div className="space-y-3 pl-4 border-l-4 border-slate-100">
                                  {q.options.map((o,idx)=>(
                                      <div key={idx} className={`p-3 rounded-lg flex items-center gap-3 ${o.is_correct ? 'bg-emerald-50 border border-emerald-100 text-emerald-800 font-medium' : 'text-slate-500'}`}>
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${o.is_correct?'bg-emerald-600 text-white':'bg-slate-200'}`}>{String.fromCharCode(65+idx)}</div>
                                          {renderText(o.label)} {o.is_correct && <CheckCircle size={16} className="text-emerald-600"/>}
                                      </div>
                                  ))}
                              </div>

                              <div className="mt-8 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                  <div className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><BookOpen size={18}/> Kunci & Pembahasan:</div>
                                  <div className="text-sm text-slate-700 leading-relaxed">{q.explanation ? renderText(q.explanation) : "Pembahasan detail belum tersedia untuk soal ini."}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// HELPER COMPONENT: ArrowRight is needed in imports above if not present
const ArrowRight = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default StudentDashboard;