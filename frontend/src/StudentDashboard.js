import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    CheckCircle, FileText, LogOut, BookOpen, X, 
    ChevronLeft, Flag, GraduationCap, Search, Video, 
    LayoutGrid, Award, Zap, Target, Home, ChevronRight, Play, Clock, Link
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

  // Fungsi renderText dipindahkan ke dalam agar bisa diakses secara konsisten
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

  const handleSubmitExam = useCallback(() => { 
    if (!activeExam) return;
    fetch(`${API_URL}/exams/${activeExam}/submit`, { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ username: user.username, answers: answers }) 
    })
    .then(r=>r.json())
    .then(() => { 
        alert(`Ujian Selesai!`); 
        setActiveExam(null); 
        window.location.reload(); 
    }); 
  }, [activeExam, user.username, answers]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) { 
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000); 
        return () => clearInterval(t); 
    } else if (timeLeft === 0 && activeExam) {
        handleSubmitExam();
    }
  }, [timeLeft, activeExam, handleSubmitExam]);

  const filteredMajors = useMemo(() => {
      return majors.filter(m => 
          m.university.toLowerCase().includes(searchMajor.toLowerCase()) || 
          m.name.toLowerCase().includes(searchMajor.toLowerCase())
      ).slice(0, 50); 
  }, [majors, searchMajor]);

  const handleSaveMajor = () => {
      fetch(`${API_URL}/users/select-major`, {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username: user.username, choice1_id: parseInt(selectedChoice1), choice2_id: selectedChoice2 ? parseInt(selectedChoice2) : null })
      }).then(r => r.json()).then(() => { alert("Target Disimpan!"); setShowMajorModal(false); onLogout(); });
  };

  const startExam = (examId) => {
      if(!window.confirm("Mulai ujian sekarang?")) return;
      fetch(`${API_URL}/exams/${examId}`).then(r => r.json()).then(data => {
            setQuestions(data.questions || []); 
            setTimeLeft(data.duration * 60); 
            setAnswers({}); 
            setCurrentQIdx(0); 
            setActiveExam(examId);
      });
  };

  const handleAnswer = (val) => setAnswers(prev => ({ ...prev, [questions[currentQIdx].id]: val }));
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
                  <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-lg flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                      <Clock size={16}/> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <button onClick={()=>setIsNavOpen(!isNavOpen)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><LayoutGrid size={20}/></button>
                  <button onClick={handleSubmitExam} className="hidden lg:block bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Selesai</button>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                  <div className="flex-1 overflow-y-auto p-4 pb-32">
                      <div className="max-w-3xl mx-auto space-y-6">
                          {q.reading_material && <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-400 text-slate-800 leading-relaxed shadow-sm">{renderText(q.reading_material)}</div>}
                          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100">
                              <div className="text-xl font-bold text-slate-800 mb-8 leading-tight">{renderText(q.text)}</div>
                              {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} alt="Soal" className="mb-8 rounded-2xl border max-h-64 object-contain mx-auto shadow-sm"/>}
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mr-4 ${answers[q.id] === opt.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65+i)}</div>
                                          <div className="text-slate-700 font-bold">{renderText(opt.label)}</div>
                                          <input type="radio" className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && <input className="w-full p-5 border-2 rounded-2xl focus:border-blue-500 outline-none bg-slate-50 font-black text-lg" placeholder="Jawaban Anda..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={`fixed inset-y-0 right-0 w-72 bg-white border-l shadow-2xl transform transition-transform z-40 ${isNavOpen?'translate-x-0':'translate-x-full lg:translate-x-0 lg:static'}`}>
                      <div className="p-4 border-b font-bold flex justify-between bg-indigo-900 text-white"><span>Navigasi Soal</span><button onClick={()=>setIsNavOpen(false)}><X size={20}/></button></div>
                      <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto max-h-[70vh]">
                          {questions.map((_, i) => {
                              const isFilled = answers[questions[i].id];
                              return (
                                <button key={i} onClick={()=>{setCurrentQIdx(i);setIsNavOpen(false)}} className={`aspect-square rounded-xl font-black text-xs relative transition-all ${currentQIdx===i?'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2':isFilled?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-400'}`}>
                                    {i+1}{markedQuestions.includes(i)&&<div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
                                </button>
                              )
                          })}
                      </div>
                      <div className="p-4 border-t mt-auto"><button onClick={()=>toggleMark(currentQIdx)} className="w-full py-3 bg-slate-100 rounded-xl font-bold text-slate-600 flex justify-center gap-2 hover:bg-slate-200 transition-colors"><Flag size={16}/> {markedQuestions.includes(currentQIdx)?'Hapus Ragu':'Ragu-ragu'}</button></div>
                  </div>
              </div>
              <div className="h-20 bg-white border-t flex items-center justify-between px-6 z-30">
                   <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="p-3 rounded-full bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200"><ChevronLeft size={28}/></button>
                   <button onClick={handleSubmitExam} className="lg:hidden bg-blue-600 text-white px-8 py-3 rounded-2xl font-black">SELESAI</button>
                   <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="p-3 rounded-full bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-700 shadow-lg"><ChevronRight size={28}/></button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-0">
      <div className="bg-white sticky top-0 z-20 border-b shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="font-black text-2xl text-blue-600 flex items-center gap-2 tracking-tighter"><Zap className="text-yellow-400" fill="currentColor"/> EduPrime</div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                  <div className="text-sm font-black">{user.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{user.username}</div>
              </div>
              <button onClick={onLogout} className="p-2.5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-sm"><LogOut size={20}/></button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">
          {tab === 'home' && (
              <>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/20 mb-4 inline-block uppercase">Premium User</span>
                        <h2 className="text-4xl font-black mb-2 tracking-tight leading-tight">Siap Menghadapi <br/>Ujian Hari Ini? 🚀</h2>
                        <p className="text-blue-100 mb-8 max-w-sm font-medium">Target: <span className="text-white font-black underline decoration-yellow-400 decoration-2">{user.pilihan1 || "Atur Jurusan Impian"}</span></p>
                        <button onClick={()=>setShowMajorModal(true)} className="bg-white text-blue-900 px-8 py-3.5 rounded-2xl font-black hover:bg-blue-50 transition-all flex items-center gap-3 shadow-xl"><GraduationCap size={20}/> Tentukan Target</button>
                    </div>
                    <Award size={220} className="absolute right-[-30px] bottom-[-30px] opacity-10 rotate-12"/>
                </div>

                <div className="space-y-6">
                    <h3 className="font-black text-xl flex items-center gap-3 text-slate-800"><LayoutGrid size={24} className="text-blue-600"/> Paket Ujian</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl font-black text-2xl">{p.name[0]}</div>
                                    <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-tighter">{p.type}</span>
                                </div>
                                <h4 className="font-black text-xl text-slate-800 mb-6">{p.name}</h4>
                                <div className="space-y-3">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                                            <div>
                                                <div className="text-sm font-black text-slate-700">{e.title}</div>
                                                <div className="text-[10px] font-bold text-slate-400">{e.duration} Menit</div>
                                            </div>
                                            {e.is_done ? (
                                                <button onClick={()=>openReview(e.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg hover:bg-emerald-600">REVIEW</button>
                                            ) : (
                                                <button onClick={()=>startExam(e.id)} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all">
                                                    <Play size={16} fill="currentColor" className="ml-1"/>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {periods.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-bold border-2 border-dashed rounded-[2rem]">Belum ada paket ujian aktif</div>}
                    </div>
                </div>
              </>
          )}

          {tab === 'lms' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <h3 className="font-black text-2xl flex items-center gap-4 text-slate-800 tracking-tight"><BookOpen size={32} className="text-blue-600"/> Materi Eksklusif</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {materials.map(m=>(
                          <div key={m.id} onClick={()=>window.open(m.content_url, '_blank')} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:rotate-6 ${m.type==='video'?'bg-rose-50 text-red-500':'bg-blue-50 text-blue-500'}`}>
                                  {m.type==='video' ? <Video size={32}/> : <FileText size={32}/>}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.category}</div>
                              <h4 className="font-black text-slate-800 text-xl leading-tight mb-8 group-hover:text-blue-600 transition-colors flex-1">{m.title}</h4>
                              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                  <span className="text-xs font-black text-blue-600 tracking-tighter uppercase">Buka Materi</span>
                                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                      <Link size={16} strokeWidth={3}/>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-2xl border-t flex justify-around p-4 z-40 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
          <button onClick={()=>setTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${tab==='home'?'text-blue-600 scale-110':'text-slate-300'}`}>
              <Home size={26} strokeWidth={tab==='home'?3.5:2.5}/>
              <span className="text-[9px] font-black uppercase">Home</span>
          </button>
          <button onClick={()=>setTab('lms')} className={`flex flex-col items-center gap-1.5 transition-all ${tab==='lms'?'text-blue-600 scale-110':'text-slate-300'}`}>
              <BookOpen size={26} strokeWidth={tab==='lms'?3.5:2.5}/>
              <span className="text-[9px] font-black uppercase">Modul</span>
          </button>
          <button onClick={()=>setShowMajorModal(true)} className={`flex flex-col items-center gap-1.5 text-slate-300 transition-all hover:text-blue-600`}>
              <Target size={26} strokeWidth={2.5}/>
              <span className="text-[9px] font-black uppercase">Target</span>
          </button>
      </div>

      {showMajorModal && (
          <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] w-full max-w-sm p-8 shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Target size={40} strokeWidth={2.5}/></div>
                      <h3 className="font-black text-2xl text-slate-800 tracking-tight">Atur Impianmu</h3>
                      <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Target Lulus 2026</p>
                  </div>
                  <div className="relative mb-8">
                      <Search className="absolute left-4 top-4 text-slate-400" size={20}/>
                      <input className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold shadow-inner" placeholder="Cari prodi..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                  </div>
                  <div className="space-y-4 mb-10">
                      <select className="w-full p-5 border-2 border-slate-100 rounded-2xl font-black text-slate-700 bg-white shadow-sm" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}>
                          <option value="">Pilihan 1 (Prioritas)</option>
                          {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}
                      </select>
                      <select className="w-full p-5 border-2 border-slate-100 rounded-2xl font-black text-slate-700 bg-white shadow-sm" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}>
                          <option value="">Pilihan 2 (Cadangan)</option>
                          {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}
                      </select>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={()=>setShowMajorModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase">Batal</button>
                      <button onClick={handleSaveMajor} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95 uppercase">Simpan</button>
                  </div>
              </div>
          </div>
      )}

      {reviewExamData && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-bottom duration-700">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10 shadow-sm">
                  <div>
                      <h3 className="font-black text-2xl text-slate-800 tracking-tighter uppercase">Lembar Review</h3>
                      <p className="text-emerald-600 font-black flex items-center gap-2"><Award size={18}/> SKOR AKHIR: {Math.round(reviewExamData.score)}</p>
                  </div>
                  <button onClick={()=>setReviewExamData(null)} className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all"><X size={28}/></button>
              </div>
              <div className="p-6 space-y-10 max-w-4xl mx-auto pb-32">
                  {reviewExamData.questions.map((q,i)=>(
                      <div key={q.id} className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-50 shadow-2xl space-y-8">
                          <div className="flex items-center gap-3">
                              <span className="bg-indigo-900 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-[0.2em] uppercase">Soal No. {i+1}</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-800 leading-snug">{renderText(q.text)}</div>
                          {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} className="max-h-80 rounded-[2.5rem] border shadow-inner mx-auto" alt="Review Soal"/>}
                          <div className="grid gap-4">
                              {q.options.map((o,idx)=>(
                                  <div key={idx} className={`p-6 rounded-[1.8rem] border-2 flex justify-between items-center transition-all ${o.is_correct ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                      <div className="flex gap-5 items-center">
                                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${o.is_correct?'bg-emerald-500 text-white':'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65+idx)}</div>
                                          <span className={`font-bold text-lg ${o.is_correct?'text-emerald-900':'text-slate-600'}`}>{renderText(o.label)}</span>
                                      </div>
                                      {o.is_correct && <CheckCircle className="text-emerald-600" size={32} strokeWidth={3}/>}
                                  </div>
                              ))}
                          </div>
                          <div className="bg-blue-50/80 p-8 rounded-[2rem] border-l-[10px] border-blue-400">
                              <div className="flex items-center gap-3 font-black text-blue-900 mb-3 uppercase tracking-tighter text-lg"><Zap size={24} fill="currentColor"/> Analisis & Pembahasan</div>
                              <div className="text-blue-800 font-bold leading-relaxed text-lg italic">{q.explanation || "Pembahasan eksklusif hanya untuk siswa EduPrime."}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
      <footer className="hidden md:block py-16 text-center text-slate-400 border-t bg-white mt-20">
          <p className="font-black tracking-[0.3em] mb-3 text-sm text-slate-300 uppercase tracking-[0.2em]">EduPrime Assessment Platform v18.0</p>
          <p className="font-bold text-slate-400 italic">Handcrafted with Excellence by Muhamad Fadli Azim</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;