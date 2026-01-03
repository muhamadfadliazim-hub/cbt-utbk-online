import React, { useState, useEffect, useMemo } from 'react';
import { 
    CheckCircle, FileText, LogOut, BookOpen, X, 
    ChevronLeft, Flag, GraduationCap, Search, Video, 
    LayoutGrid, Award, Zap, Target, Music, User, Home
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('home');
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
      .then(d => { alert(`Ujian Selesai!`); setActiveExam(null); window.location.reload(); }); 
  };
  
  const toggleMark = (idx) => setMarkedQuestions(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx]);
  const openReview = (examId) => { fetch(`${API_URL}/student/exams/${examId}/review?username=${user.username}`).then(r => r.ok?r.json():Promise.reject("Belum selesai")).then(setReviewExamData).catch(e=>alert(e)); };

  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
              <div className="h-16 bg-white border-b flex items-center justify-between px-4 z-30 shadow-sm">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">{currentQIdx + 1}</div>
                      <div className="text-sm font-bold text-slate-600">/ {questions.length}</div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-lg flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <button onClick={()=>setIsNavOpen(!isNavOpen)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><LayoutGrid size={20}/></button>
                  <button onClick={handleSubmitExam} className="hidden lg:block bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Selesai</button>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                  <div className="flex-1 overflow-y-auto p-4 pb-32">
                      <div className="max-w-3xl mx-auto space-y-6">
                          {q.reading_material && <div className="bg-orange-50 p-5 rounded-2xl border-l-4 border-orange-400 text-slate-800 leading-relaxed">{renderText(q.reading_material)}</div>}
                          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                              <div className="text-lg font-medium text-slate-800 mb-6">{renderText(q.text)}</div>
                              {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} alt="Soal" className="mb-6 rounded-xl max-h-64 object-contain"/>}
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-indigo-100'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65+i)}</div>
                                          <div className="text-slate-700 font-medium">{renderText(opt.label)}</div>
                                          <input type="radio" className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && <input className="w-full p-4 border-2 rounded-2xl focus:border-blue-500 outline-none bg-slate-50 font-bold" placeholder="Ketik jawaban..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={`fixed inset-y-0 right-0 w-72 bg-white border-l shadow-2xl transform transition-transform z-40 ${isNavOpen?'translate-x-0':'translate-x-full lg:translate-x-0 lg:static'}`}>
                      <div className="p-4 border-b font-bold flex justify-between bg-indigo-900 text-white"><span>Navigasi</span><button onClick={()=>setIsNavOpen(false)}><X/></button></div>
                      <div className="p-4 grid grid-cols-5 gap-2">
                          {questions.map((_, i) => (
                              <button key={i} onClick={()=>{setCurrentQIdx(i);setIsNavOpen(false)}} className={`aspect-square rounded-lg font-bold text-sm relative ${currentQIdx===i?'bg-blue-600 text-white':answers[questions[i].id]?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'}`}>
                                  {i+1}{markedQuestions.includes(i)&&<div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>}
                              </button>
                          ))}
                      </div>
                      <div className="p-4 border-t"><button onClick={()=>toggleMark(currentQIdx)} className="w-full py-2 bg-slate-100 rounded-lg font-bold text-slate-600 flex justify-center gap-2"><Flag size={16}/> {markedQuestions.includes(currentQIdx)?'Hapus Ragu':'Ragu-ragu'}</button></div>
                  </div>
              </div>
              <div className="h-20 bg-white border-t flex items-center justify-between px-6 z-30">
                   <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="p-3 rounded-full bg-slate-100 text-slate-600 disabled:opacity-50"><ChevronLeft/></button>
                   <button onClick={handleSubmitExam} className="lg:hidden bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Kirim</button>
                   <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="p-3 rounded-full bg-blue-600 text-white disabled:opacity-50">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-0">
      <div className="bg-white sticky top-0 z-20 border-b shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="font-extrabold text-xl text-blue-600 flex items-center gap-2"><Zap className="text-yellow-400" fill="currentColor"/> EduPrime</div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                  <div className="text-sm font-bold">{user.name}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest">{user.username}</div>
              </div>
              <button onClick={onLogout} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all"><LogOut size={18}/></button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          {tab === 'home' && (
              <>
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Semangat Belajar! ✨</h2>
                        <p className="text-blue-100 mb-6 flex items-center gap-2"><Target size={16}/> Target: <span className="font-bold underline">{user.pilihan1 || "Belum dipilih"}</span></p>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={()=>setShowMajorModal(true)} className="bg-white text-blue-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"><GraduationCap size={18}/> Pilih Jurusan</button>
                        </div>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><Award size={200}/></div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800"><LayoutGrid size={20} className="text-blue-600"/> Dashboard Ujian</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl font-bold text-xl">{p.name[0]}</div>
                                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">{p.type}</span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-800 mb-4">{p.name}</h4>
                                <div className="space-y-3">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-200 transition-all group">
                                            <div>
                                                <div className="text-sm font-bold text-slate-700">{e.title}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">Sistem IRT Aktif</div>
                                            </div>
                                            {e.is_done ? (
                                                <button onClick={()=>openReview(e.id)} className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-md hover:bg-emerald-600">Review</button>
                                            ) : (
                                                <button onClick={()=>startExam(e.id)} className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
                                                </button>
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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-xl flex items-center gap-2"><BookOpen className="text-blue-600"/> Materi Eksklusif</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {materials.map(m=>(
                          <div key={m.id} onClick={()=>window.open(m.content_url, '_blank')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${m.type==='video'?'bg-red-50 text-red-500':'bg-blue-50 text-blue-500'}`}>
                                  {m.type==='video'?<Video size={28}/>:<FileText size={28}/>}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{m.category}</div>
                              <h4 className="font-extrabold text-slate-800 text-lg leading-tight mb-4 group-hover:text-blue-600">{m.title}</h4>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                  <span className="text-xs font-bold text-blue-600">Buka Materi</span>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 group-hover:translate-x-1 transition-all"><path d="m9 18 6-6-6-6"/></svg>
                              </div>
                          </div>
                      ))}
                      {materials.length===0 && <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">Belum ada materi</div>}
                  </div>
              </div>
          )}
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t flex justify-around p-3 z-40 pb-8 shadow-2xl">
          <button onClick={()=>setTab('home')} className={`flex flex-col items-center gap-1 ${tab==='home'?'text-blue-600':'text-slate-400'}`}>
              <Home size={24} strokeWidth={tab==='home'?3:2}/>
              <span className="text-[10px] font-extrabold">BERANDA</span>
          </button>
          <button onClick={()=>setTab('lms')} className={`flex flex-col items-center gap-1 ${tab==='lms'?'text-blue-600':'text-slate-400'}`}>
              <BookOpen size={24} strokeWidth={tab==='lms'?3:2}/>
              <span className="text-[10px] font-extrabold">BELAJAR</span>
          </button>
          <button onClick={()=>setShowMajorModal(true)} className={`flex flex-col items-center gap-1 text-slate-400`}>
              <div className="p-1 rounded-full bg-indigo-50 text-indigo-600 -mt-8 shadow-lg border-4 border-white"><Target size={32}/></div>
              <span className="text-[10px] font-extrabold">TARGET</span>
          </button>
      </div>

      {showMajorModal && (
          <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner"><Target size={32}/></div>
                      <h3 className="font-extrabold text-2xl text-slate-800">Target Kampus</h3>
                      <p className="text-sm text-slate-500 font-medium">Tentukan masa depanmu hari ini.</p>
                  </div>
                  <div className="relative mb-6">
                      <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                      <input className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" placeholder="Cari prodi..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                  </div>
                  <div className="space-y-4 mb-8">
                      <select className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 bg-white" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}>
                          <option value="">Pilihan 1 (Prioritas)</option>
                          {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}
                      </select>
                      <select className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 bg-white" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}>
                          <option value="">Pilihan 2 (Cadangan)</option>
                          {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}
                      </select>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={()=>setShowMajorModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all">Batal</button>
                      <button onClick={handleSaveMajor} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95">Simpan</button>
                  </div>
              </div>
          </div>
      )}

      {reviewExamData && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-bottom duration-500">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                  <div>
                      <h3 className="font-extrabold text-2xl text-slate-800">Pembahasan Detail</h3>
                      <p className="text-emerald-600 font-bold flex items-center gap-1"><Award size={16}/> Skor Kamu: {Math.round(reviewExamData.score)}</p>
                  </div>
                  <button onClick={()=>setReviewExamData(null)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"><X size={24}/></button>
              </div>
              <div className="p-6 space-y-8 max-w-4xl mx-auto pb-20">
                  {reviewExamData.questions.map((q,i)=>(
                      <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl space-y-6">
                          <div className="flex items-center gap-3">
                              <span className="bg-indigo-900 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Nomor {i+1}</span>
                          </div>
                          <div className="text-xl font-medium text-slate-800 leading-relaxed">{renderText(q.text)}</div>
                          {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} className="max-h-64 rounded-[2rem] border-4 border-slate-50 shadow-inner mx-auto"/>}
                          <div className="grid gap-3">
                              {q.options.map((o,idx)=>(
                                  <div key={idx} className={`p-5 rounded-[1.5rem] border-2 flex justify-between items-center ${o.is_correct ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                      <div className="flex gap-4 items-center">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${o.is_correct?'bg-emerald-500 text-white':'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65+idx)}</div>
                                          <span className={`font-bold ${o.is_correct?'text-emerald-800':'text-slate-600'}`}>{renderText(o.label)}</span>
                                      </div>
                                      {o.is_correct && <CheckCircle className="text-emerald-600" size={24}/>}
                                  </div>
                              ))}
                          </div>
                          <div className="bg-indigo-50 p-6 rounded-[1.5rem] border-l-8 border-indigo-400">
                              <div className="flex items-center gap-2 font-bold text-indigo-900 mb-2 uppercase tracking-tighter"><Zap size={18} fill="currentColor"/> Solusi Jenius</div>
                              <div className="text-indigo-800 font-medium leading-relaxed italic">{q.explanation || "Pembahasan lengkap tersedia di modul belajar."}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
      <footer className="hidden md:block py-10 text-center text-slate-400 text-xs border-t bg-white">
          <p className="font-bold">EDUPRIME ASSESSMENT PLATFORM v16.0</p>
          <p className="mt-1">Handcrafted with Excellence by <strong>Muhamad Fadli Azim</strong></p>
      </footer>
    </div>
  );
};

export default StudentDashboard;