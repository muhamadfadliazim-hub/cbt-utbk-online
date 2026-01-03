import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, CheckCircle, Play, FileText, LogOut, ChevronRight, BookOpen, X, 
    ChevronLeft, Flag, GraduationCap, Search, Video, 
    LayoutGrid, Award, Zap, Target, Music, User, Home, TrendingUp
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
  
  // Exam State
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [isLoadingExam, setIsLoadingExam] = useState(false);

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
      setIsLoadingExam(true);
      fetch(`${API_URL}/exams/${examId}`).then(r => {
          if (!r.ok) throw new Error("Gagal mengambil soal.");
          return r.json();
      }).then(data => {
            console.log("Exam Data:", data); // DEBUG
            if(!data.questions || data.questions.length === 0) {
                alert("Soal belum tersedia untuk paket ini.");
                setIsLoadingExam(false);
                return;
            }
            setQuestions(data.questions); 
            setTimeLeft(data.duration * 60); 
            setAnswers({}); 
            setCurrentQIdx(0); 
            setActiveExam(examId);
            setIsLoadingExam(false);
      }).catch((e) => {
          alert("Error: " + e.message);
          setIsLoadingExam(false);
      });
  };

  const handleAnswer = (val) => setAnswers({ ...answers, [questions[currentQIdx].id]: val });
  const handleSubmitExam = () => { 
      if(!window.confirm("Yakin ingin mengumpulkan jawaban?")) return;
      fetch(`${API_URL}/exams/${activeExam}/submit`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: user.username, answers: answers }) })
      .then(r=>r.json())
      .then(d => { alert(`Ujian Selesai! Skor Anda: ${Math.round(d.score)}`); setActiveExam(null); window.location.reload(); }); 
  };
  
  const toggleMark = (idx) => setMarkedQuestions(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx]);
  const openReview = (examId) => { fetch(`${API_URL}/student/exams/${examId}/review?username=${user.username}`).then(r => r.ok?r.json():Promise.reject("Belum selesai")).then(setReviewExamData).catch(e=>alert(e)); };

  // --- MODE UJIAN ---
  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
              <div className="h-16 bg-white border-b flex items-center justify-between px-4 z-30 shadow-sm">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">{currentQIdx + 1}</div>
                      <div className="text-sm font-bold text-slate-600">/ {questions.length} Soal</div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-lg flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                      <Clock size={16}/> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <button onClick={()=>setIsNavOpen(!isNavOpen)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><LayoutGrid size={20}/></button>
                  <button onClick={handleSubmitExam} className="hidden lg:block bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Selesai</button>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                  <div className="flex-1 overflow-y-auto p-4 pb-32">
                      <div className="max-w-3xl mx-auto space-y-6">
                          {q.reading_material && <div className="bg-orange-50 p-5 rounded-2xl border-l-4 border-orange-400 text-slate-800 leading-relaxed"><div className="font-bold text-orange-600 mb-2 flex items-center gap-2 text-xs uppercase"><BookOpen size={14}/> Bacaan</div>{renderText(q.reading_material)}</div>}
                          {q.audio_url && <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 border border-blue-100"><div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white"><Music size={20}/></div><div className="flex-1"><div className="text-xs font-bold text-blue-700 uppercase mb-1">Audio Listening</div><audio controls src={q.audio_url.startsWith('http') ? q.audio_url : `${API_URL}${q.audio_url}`} className="w-full h-8"/></div></div>}
                          
                          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                              <div className="text-lg font-medium text-slate-800 mb-6">{renderText(q.text)}</div>
                              {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} alt="Soal" className="mb-6 rounded-xl border border-slate-100 max-h-64 object-contain mx-auto"/>}
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${answers[q.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65+i)}</div>
                                          <div className="text-slate-700 font-medium">{renderText(opt.label)}</div>
                                      </label>
                                  ))}
                                  {q.type === 'complex' && q.options.map(opt => (
                                      <label key={opt.id} className="flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer hover:bg-slate-50">
                                          <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={(answers[q.id]||[]).includes(opt.id)} onChange={e=>{const curr=answers[q.id]||[]; handleAnswer(e.target.checked?[...curr,opt.id]:curr.filter(x=>x!==opt.id))}} />
                                          <span className="text-slate-700 font-medium">{renderText(opt.label)}</span>
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && <input className="w-full p-4 border-2 rounded-2xl focus:border-blue-500 outline-none bg-slate-50 font-bold" placeholder="Jawaban..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={`fixed inset-y-0 right-0 w-72 bg-white border-l shadow-2xl transform transition-transform z-40 ${isNavOpen?'translate-x-0':'translate-x-full lg:translate-x-0 lg:static'}`}>
                      <div className="p-4 border-b font-bold flex justify-between lg:hidden"><span>Navigasi</span><button onClick={()=>setIsNavOpen(false)}><X/></button></div>
                      <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto max-h-[80vh]">
                          {questions.map((_, i) => (
                              <button key={i} onClick={()=>{setCurrentQIdx(i);setIsNavOpen(false)}} className={`aspect-square rounded-lg font-bold text-sm relative ${currentQIdx===i?'bg-blue-600 text-white':answers[questions[i].id]?'bg-blue-100 text-blue-700':'bg-slate-100 text-slate-500'}`}>
                                  {i+1}{markedQuestions.includes(i)&&<div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>}
                              </button>
                          ))}
                      </div>
                      <div className="p-4 border-t"><button onClick={()=>toggleMark(currentQIdx)} className="w-full py-2 bg-slate-100 rounded-lg text-slate-600 font-bold flex justify-center gap-2"><Flag size={16}/> Ragu</button></div>
                  </div>
              </div>
              <div className="h-20 bg-white border-t flex items-center justify-between px-6 shrink-0 z-30">
                   <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-50"><ChevronLeft/></button>
                   <button onClick={handleSubmitExam} className="lg:hidden bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Selesai</button>
                   <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50"><ChevronRight/></button>
              </div>
          </div>
      );
  }

  // --- LOBBY UTAMA ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-0">
      {/* HEADER DESKTOP */}
      <div className="bg-white sticky top-0 z-20 border-b shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
              <div className="font-extrabold text-xl text-blue-600 flex items-center gap-2"><Zap className="text-yellow-400" fill="currentColor"/> EduPrime</div>
              {/* DESKTOP NAV TABS */}
              <div className="hidden md:flex gap-1">
                  <button onClick={()=>setTab('home')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab==='home'?'bg-blue-50 text-blue-600':'text-slate-500 hover:bg-slate-50'}`}>Dashboard</button>
                  <button onClick={()=>setTab('lms')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab==='lms'?'bg-blue-50 text-blue-600':'text-slate-500 hover:bg-slate-50'}`}>Belajar</button>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                  <div className="text-sm font-bold">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.username}</div>
              </div>
              <button onClick={onLogout} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100"><LogOut size={18}/></button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          {tab === 'home' && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Halo, {user.name.split(' ')[0]}! 🚀</h2>
                        <p className="text-blue-100 text-sm mb-4">Siap menaklukkan ujian hari ini?</p>
                        <div className="flex gap-3">
                            <button onClick={()=>setShowMajorModal(true)} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30"><Target size={14}/> {user.pilihan1 || "Set Target"}</button>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><TrendingUp size={14}/> Skor: {user.pg1 || 0}</div>
                        </div>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20"><Award size={120}/></div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><LayoutGrid className="text-blue-600"/> Tryout Tersedia</h3>
                    {isLoadingExam && <div className="text-center p-4 bg-blue-50 text-blue-600 rounded-xl mb-4 animate-pulse font-bold">Sedang memuat soal... Mohon tunggu...</div>}
                    <div className="grid gap-4 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${p.type==='UTBK'?'bg-blue-100 text-blue-600':p.type==='CPNS'?'bg-orange-100 text-orange-600':'bg-emerald-100 text-emerald-600'}`}>{p.name[0]}</div>
                                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg uppercase text-slate-500">{p.type}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{p.name}</h4>
                                <p className="text-xs text-slate-400 mb-4">{p.exams.length} Subtes • Sistem IRT</p>
                                <div className="space-y-2">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <div className="text-xs font-bold text-slate-700">{e.title}</div>
                                            {e.is_done ? (
                                                <button onClick={()=>openReview(e.id)} className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-emerald-600 transition">Lihat Nilai</button>
                                            ) : (
                                                <button onClick={()=>startExam(e.id)} className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm"><Play size={12} fill="currentColor"/></button>
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
              <div className="space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen className="text-blue-600"/> Materi & Video</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                      {materials.map(m=>(
                          <div key={m.id} onClick={()=>window.open(m.content_url, '_blank')} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-blue-50 transition">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.type==='video'?'bg-red-100 text-red-600':'bg-blue-100 text-blue-600'}`}>
                                  {m.type==='video'?<Video size={20}/>:<FileText size={20}/>}
                              </div>
                              <div className="flex-1">
                                  <div className="text-xs font-bold text-slate-400 uppercase">{m.category}</div>
                                  <h4 className="font-bold text-slate-800 line-clamp-1">{m.title}</h4>
                              </div>
                              <ChevronRight size={20} className="text-slate-300"/>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* BOTTOM NAV (MOBILE) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-3 z-40 pb-5 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
          {[{id:'home',icon:Home,label:'Home'}, {id:'lms',icon:BookOpen,label:'Belajar'}, {id:'target',icon:Target,label:'Target', action:()=>setShowMajorModal(true)}].map(i => (
              <button key={i.id} onClick={i.action || (()=>setTab(i.id))} className={`flex flex-col items-center gap-1 ${tab===i.id?'text-blue-600':'text-slate-400'}`}>
                  <i.icon size={24} strokeWidth={tab===i.id?2.5:2}/>
                  <span className="text-[10px] font-bold">{i.label}</span>
              </button>
          ))}
      </div>

      {/* MODAL (Target & Review) - Sama seperti sebelumnya */}
      {showMajorModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-in zoom-in-95">
                  <div className="text-center mb-6"><h3 className="font-bold text-lg">Pilih Jurusan</h3><p className="text-xs text-slate-500">Tentukan target kampus impianmu.</p></div>
                  <input className="w-full p-3 bg-slate-100 rounded-xl mb-4 text-sm font-bold" placeholder="Cari..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                  <div className="space-y-3 mb-6">
                      <select className="w-full p-3 border rounded-xl text-sm" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}><option value="">Pilihan 1</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                      <select className="w-full p-3 border rounded-xl text-sm" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}><option value="">Pilihan 2</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={()=>setShowMajorModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-sm text-slate-600">Batal</button>
                      <button onClick={handleSaveMajor} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white">Simpan</button>
                  </div>
              </div>
          </div>
      )}
      {reviewExamData && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center shadow-sm">
                  <h3 className="font-bold text-lg">Review & Pembahasan</h3>
                  <button onClick={()=>setReviewExamData(null)} className="p-2 bg-slate-100 rounded-full"><X/></button>
              </div>
              <div className="p-4 space-y-6 max-w-3xl mx-auto">
                  <div className="text-center p-6 bg-blue-50 rounded-3xl mb-6"><div className="text-4xl font-extrabold text-blue-600">{Math.round(reviewExamData.score)}</div><div className="text-xs font-bold text-blue-400 uppercase">Skor Akhir</div></div>
                  {reviewExamData.questions.map((q,i)=>(
                      <div key={q.id} className="space-y-4 pb-6 border-b">
                          <div className="font-bold text-slate-800">No. {i+1}</div>
                          {q.image_url && <img src={q.image_url.startsWith('http') ? q.image_url : `${API_URL}${q.image_url}`} className="max-h-40 rounded-lg"/>}
                          <div>{renderText(q.text)}</div>
                          <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-2">{q.options.map((o,idx)=>(<div key={idx} className={`flex gap-2 ${o.is_correct?'text-emerald-600 font-bold':''}`}><span>{String.fromCharCode(65+idx)}.</span>{renderText(o.label)} {o.is_correct&&<CheckCircle size={14}/>}</div>))}</div>
                          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 font-medium leading-relaxed">
                              <span className="font-bold block mb-1">💡 Pembahasan:</span>
                              {renderText(q.explanation) || "Pembahasan belum tersedia."}
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