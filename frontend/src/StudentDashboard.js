import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    CheckCircle, FileText, LogOut, BookOpen, X, 
    ChevronLeft, Flag, GraduationCap, Search, Video, 
    LayoutGrid, Award, Zap, Target, Home
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

  const handleSubmitExam = useCallback(() => { 
      fetch(`${API_URL}/exams/${activeExam}/submit`, { 
          method: 'POST', 
          headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({ username: user.username, answers: answers }) 
      })
      .then(r=>r.json())
      .then(() => { 
          alert("Ujian Selesai! Hasil Anda telah disimpan."); 
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
      }).then(r => r.json()).then(() => { alert("Target Disimpan!"); setShowMajorModal(false); onLogout(); });
  };

  const startExam = (examId) => {
      if(!window.confirm("Mulai ujian sekarang?")) return;
      fetch(`${API_URL}/exams/${examId}`).then(r => r.json()).then(data => {
            setQuestions(data.questions); setTimeLeft(data.duration * 60); setAnswers({}); setCurrentQIdx(0); setActiveExam(examId);
      });
  };

  const handleAnswer = (val) => setAnswers({ ...answers, [questions[currentQIdx].id]: val });
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
                          {q.reading_material && <div className="bg-orange-50 p-5 rounded-2xl border-l-4 border-orange-400 text-slate-800 leading-relaxed font-medium">{renderText(q.reading_material)}</div>}
                          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                              <div className="text-lg font-medium text-slate-800 mb-6 leading-relaxed">{renderText(q.text)}</div>
                              {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} alt="Materi Visual Soal" className="mb-6 rounded-xl max-h-64 object-contain mx-auto"/>}
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-blue-200'}`}>
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 shrink-0 transition-colors ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65+i)}</div>
                                          <div className="text-slate-700 font-medium">{renderText(opt.label)}</div>
                                          <input type="radio" name="option" className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && <input className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none bg-slate-50 font-bold" placeholder="Ketik jawaban Anda..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={`fixed inset-y-0 right-0 w-72 bg-white border-l shadow-2xl transform transition-transform z-40 ${isNavOpen?'translate-x-0':'translate-x-full lg:translate-x-0 lg:static'}`}>
                      <div className="p-4 border-b font-bold flex justify-between bg-indigo-900 text-white"><span>Daftar Soal</span><button onClick={()=>setIsNavOpen(false)}><X size={20}/></button></div>
                      <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto">
                          {questions.map((_, i) => (
                              <button key={i} onClick={()=>{setCurrentQIdx(i);setIsNavOpen(false)}} className={`aspect-square rounded-xl font-bold text-sm relative transition-all ${currentQIdx===i?'bg-blue-600 text-white ring-2 ring-blue-200 shadow-lg':answers[questions[i].id]?'bg-emerald-500 text-white':'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                  {i+1}{markedQuestions.includes(i)&&<div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                              </button>
                          ))}
                      </div>
                      <div className="p-4 border-t bg-slate-50"><button onClick={()=>toggleMark(currentQIdx)} className={`w-full py-3 rounded-xl font-bold flex justify-center gap-2 transition-all ${markedQuestions.includes(currentQIdx)?'bg-amber-100 text-amber-700 border border-amber-300':'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}><Flag size={18}/> {markedQuestions.includes(currentQIdx)?'Hapus Ragu':'Ragu-ragu'}</button></div>
                  </div>
              </div>
              <div className="h-20 bg-white border-t flex items-center justify-between px-6 z-30">
                   <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="p-4 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-50"><ChevronLeft size={24}/></button>
                   <button onClick={handleSubmitExam} className="lg:hidden bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200">Kirim Jawaban</button>
                   <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="p-4 rounded-2xl bg-blue-600 text-white disabled:opacity-50 shadow-lg shadow-blue-100">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-0">
      <div className="bg-white sticky top-0 z-20 border-b shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="font-extrabold text-2xl text-blue-600 flex items-center gap-2"><Zap className="text-yellow-400" fill="currentColor"/> EduPrime</div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-slate-700">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.username}</div>
              </div>
              <button onClick={onLogout} className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><LogOut size={20}/></button>
          </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10">
          {tab === 'home' && (
              <>
                <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-4xl font-extrabold leading-tight">Halo Pejuang Impian! <br/><span className="text-blue-200">Ayo mulai progresmu hari ini.</span></h2>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">Target Kampus</div>
                                <div className="font-extrabold flex items-center gap-2"><Target size={16} className="text-amber-400"/> {user.pilihan1 || "Belum dipilih"}</div>
                            </div>
                            <button onClick={()=>setShowMajorModal(true)} className="bg-amber-400 text-amber-950 px-6 py-3 rounded-2xl font-bold hover:bg-amber-300 transition-all shadow-xl flex items-center gap-2 border-b-4 border-amber-600"><GraduationCap size={20}/> Pilih Jurusan</button>
                        </div>
                    </div>
                    <div className="absolute right-[-40px] bottom-[-40px] opacity-10 rotate-12 scale-150"><Award size={200}/></div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-extrabold text-2xl flex items-center gap-3 text-slate-800"><LayoutGrid size={24} className="text-blue-600"/> Paket Ujian Aktif</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl font-black text-2xl shadow-inner">{p.name[0]}</div>
                                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100 shadow-sm">{p.type}</span>
                                </div>
                                <h4 className="font-extrabold text-xl text-slate-800 mb-6 group-hover:text-blue-600 transition-colors">{p.name}</h4>
                                <div className="space-y-4">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm">
                                            <div className="font-bold text-slate-700">{e.title}</div>
                                            {e.is_done ? (
                                                <button onClick={()=>openReview(e.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">REVIEW</button>
                                            ) : (
                                                <button onClick={()=>startExam(e.id)} className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-110 hover:bg-blue-700 transition-all">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
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
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <h3 className="font-extrabold text-3xl flex items-center gap-3 text-slate-800"><BookOpen size={32} className="text-blue-600"/> Materi Belajar Eksklusif</h3>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {materials.map(m=>(
                          <div key={m.id} onClick={()=>window.open(m.content_url, '_blank')} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all cursor-pointer group">
                              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:rotate-12 ${m.type==='video'?'bg-red-50 text-red-500 shadow-red-100':'bg-blue-50 text-blue-500 shadow-blue-100'} shadow-lg`}>
                                  {m.type==='video'?<Video size={32}/>:<FileText size={32}/>}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.category}</div>
                              <h4 className="font-black text-slate-800 text-xl leading-snug mb-6 group-hover:text-blue-600 transition-colors">{m.title}</h4>
                              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                  <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">Akses Materi</span>
                                  <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg group-hover:translate-x-2 transition-transform">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {materials.length===0 && <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 font-black text-2xl uppercase tracking-widest">Kosong</div>}
                  </div>
              </div>
          )}
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around p-4 z-40 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button onClick={()=>setTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${tab==='home'?'text-blue-600 scale-110':'text-slate-400'}`}>
              <Home size={26} strokeWidth={tab==='home'?3:2}/>
              <span className="text-[9px] font-black tracking-tighter">HOME</span>
          </button>
          <button onClick={()=>setTab('lms')} className={`flex flex-col items-center gap-1.5 transition-all ${tab==='lms'?'text-blue-600 scale-110':'text-slate-400'}`}>
              <BookOpen size={26} strokeWidth={tab==='lms'?3:2}/>
              <span className="text-[9px] font-black tracking-tighter">BELAJAR</span>
          </button>
          <button onClick={()=>setShowMajorModal(true)} className="flex flex-col items-center gap-1.5 text-slate-400">
              <div className="p-2 rounded-2xl bg-blue-600 text-white -mt-10 shadow-2xl shadow-blue-300 border-4 border-white transform transition-transform active:scale-90"><Target size={28} strokeWidth={3}/></div>
              <span className="text-[9px] font-black tracking-tighter mt-1">TARGET</span>
          </button>
      </div>

      {showMajorModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl relative overflow-hidden">
                  <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner"><Target size={40}/></div>
                      <h3 className="font-black text-3xl text-slate-800 tracking-tight">Pilih Mimpi</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">Tentukan program studi masa depanmu.</p>
                  </div>
                  <div className="mt-8 relative">
                      <Search className="absolute left-4 top-4 text-slate-400" size={20}/>
                      <input className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" placeholder="Cari prodi..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                  </div>
                  <div className="mt-4 space-y-3">
                      <select className="w-full p-4 border-2 border-slate-100 rounded-[1.5rem] font-bold text-slate-700 bg-white" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}>
                          <option value="">Pilihan 1 (Prioritas)</option>
                          {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}
                      </select>
                      <select className="w-full p-4 border-2 border-slate-100 rounded-[1.5rem] font-bold text-slate-700 bg-white" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}>
                          <option value="">Pilihan 2 (Cadangan)</option>
                          {filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}
                      </select>
                  </div>
                  <div className="flex gap-4 mt-10">
                      <button onClick={()=>setShowMajorModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-bold hover:bg-slate-100 transition-all border-2 border-transparent">Tutup</button>
                      <button onClick={handleSaveMajor} className="flex-1 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95 border-b-4 border-blue-800">Simpan</button>
                  </div>
              </div>
          </div>
      )}

      {reviewExamData && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b p-8 flex justify-between items-center z-10 shadow-sm">
                  <div>
                      <h3 className="font-black text-3xl text-slate-800 tracking-tighter">REVIEW JAWABAN</h3>
                      <p className="text-emerald-600 font-black flex items-center gap-2 mt-1"><Award size={20}/> SKOR AKHIR: {Math.round(reviewExamData.score)}</p>
                  </div>
                  <button onClick={()=>setReviewExamData(null)} className="p-4 bg-slate-100 text-slate-600 rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-600 transition-all shadow-md"><X size={28}/></button>
              </div>
              <div className="p-6 md:p-12 space-y-12 max-w-4xl mx-auto pb-32">
                  {reviewExamData.questions.map((q,i)=>(
                      <div key={q.id} className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-2xl space-y-8 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                          <div className="flex items-center gap-4">
                              <span className="bg-indigo-900 text-white px-6 py-2 rounded-2xl text-xs font-black tracking-widest uppercase shadow-lg">SOAL {i+1}</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-800 leading-relaxed text-justify">{renderText(q.text)}</div>
                          {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} alt="Gambar Penjelas Soal" className="max-h-80 rounded-[2.5rem] border-8 border-slate-50 shadow-inner mx-auto"/>}
                          <div className="grid gap-4">
                              {q.options.map((o,idx)=>(
                                  <div key={idx} className={`p-6 rounded-[2rem] border-2 flex justify-between items-center transition-all ${o.is_correct ? 'bg-emerald-50 border-emerald-300 shadow-md scale-[1.02]' : 'bg-slate-50/50 border-transparent opacity-70'}`}>
                                      <div className="flex gap-6 items-center">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${o.is_correct?'bg-emerald-500 text-white':'bg-slate-200 text-slate-400'}`}>{String.fromCharCode(65+idx)}</div>
                                          <span className={`text-lg font-bold ${o.is_correct?'text-emerald-900':'text-slate-500'}`}>{renderText(o.label)}</span>
                                      </div>
                                      {o.is_correct && <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg"><CheckCircle size={24}/></div>}
                                  </div>
                              ))}
                          </div>
                          <div className="bg-indigo-50/80 p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-inner">
                              <div className="flex items-center gap-3 font-black text-indigo-900 mb-4 uppercase tracking-tighter text-sm"><Zap size={22} fill="#4f46e5" className="text-indigo-600"/> Analisis Pembahasan</div>
                              <div className="text-indigo-800 font-bold text-lg leading-relaxed italic">{q.explanation || "Pembahasan eksklusif belum tersedia untuk nomor ini."}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <footer className="hidden md:block py-16 text-center text-slate-400 border-t bg-white">
          <p className="font-black text-sm tracking-widest text-slate-300 uppercase">EDUPRIME CBT PLATFORM</p>
          <p className="mt-2 font-bold">Executive Owner: <span className="text-slate-500 underline decoration-blue-500 underline-offset-4">Muhamad Fadli Azim</span></p>
      </footer>
    </div>
  );
};

export default StudentDashboard;