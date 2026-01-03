import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, Play, FileText, LogOut, BookOpen, X, 
    ChevronLeft, ChevronRight, Flag, Target, Video, 
    CheckCircle, Zap, LayoutGrid, Award, Home
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('home'); // home, exam, lms
  const [periods, setPeriods] = useState([]);
  const [majors, setMajors] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  // State Ujian
  const [isExamMode, setIsExamMode] = useState(false);
  const [activeExamId, setActiveExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState([]);
  
  // State Modal/Review
  const [reviewData, setReviewData] = useState(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [target1, setTarget1] = useState(user?.choice1_id || '');
  const [target2, setTarget2] = useState(user?.choice2_id || '');
  const [searchJurusan, setSearchJurusan] = useState('');

  // --- EFFECT: LOAD DATA ---
  useEffect(() => {
    if(user?.username) {
        fetch(`${API_URL}/student/periods?username=${user.username}`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[]));
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(d=>setMajors(Array.isArray(d)?d:[]));
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>setMaterials(Array.isArray(d)?d:[]));
    }
  }, [user]);

  // --- EFFECT: TIMER UJIAN ---
  useEffect(() => {
    if (isExamMode && timeLeft > 0) {
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    } else if (isExamMode && timeLeft === 0) {
        finishExam();
    }
  }, [isExamMode, timeLeft]);

  // --- HELPERS ---
  const renderTex = (text) => {
      if (!text) return null;
      return text.split(/(\$.*?\$)/).map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
          return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
      });
  };

  const filteredMajors = useMemo(() => {
      return majors.filter(m => m.university.toLowerCase().includes(searchJurusan.toLowerCase()) || m.name.toLowerCase().includes(searchJurusan.toLowerCase())).slice(0, 50);
  }, [majors, searchJurusan]);

  // --- ACTIONS ---
  const handleStartExam = (examId) => {
      if(!window.confirm("Mulai kerjakan soal?")) return;
      fetch(`${API_URL}/exams/${examId}`)
        .then(r => r.json())
        .then(data => {
            if(!data.questions || data.questions.length === 0) return alert("Soal kosong / belum diupload admin.");
            setQuestions(data.questions);
            setTimeLeft(data.duration * 60);
            setAnswers({});
            setCurrentQIdx(0);
            setActiveExamId(examId);
            setIsExamMode(true);
        })
        .catch(err => alert("Gagal mengambil soal: " + err.message));
  };

  const handleAnswer = (val) => {
      setAnswers({...answers, [questions[currentQIdx].id]: val});
  };

  const finishExam = () => {
      if(!window.confirm("Kumpulkan jawaban?")) return;
      fetch(`${API_URL}/exams/${activeExamId}/submit`, {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username: user.username, answers: answers })
      }).then(r=>r.json()).then(d => {
          alert(`Selesai! Skor: ${Math.round(d.score)}`);
          setIsExamMode(false);
          setActiveExamId(null);
          window.location.reload();
      });
  };

  const saveTarget = () => {
      fetch(`${API_URL}/users/select-major`, {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username: user.username, choice1_id: parseInt(target1), choice2_id: target2 ? parseInt(target2) : null })
      }).then(()=>{ alert("Target disimpan!"); setShowTargetModal(false); });
  };

  const openReview = (eid) => {
      fetch(`${API_URL}/student/exams/${eid}/review?username=${user.username}`).then(r=>r.json()).then(setReviewData);
  };

  // --- VIEW: UJIAN (FULLSCREEN) ---
  if (isExamMode && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
              {/* HEADER UJIAN */}
              <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
                  <div className="font-bold text-lg text-slate-700">Soal {currentQIdx + 1} / {questions.length}</div>
                  <div className={`px-4 py-2 rounded-lg font-mono font-bold text-white ${timeLeft<300?'bg-red-500':'bg-blue-600'}`}>
                      {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                  </div>
                  <button onClick={finishExam} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700">Selesai</button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                  {/* MAIN SOAL */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8">
                      <div className="max-w-4xl mx-auto space-y-6">
                          {q.reading_material && <div className="bg-white p-6 rounded-xl border-l-4 border-orange-400 shadow-sm">{renderTex(q.reading_material)}</div>}
                          {q.audio_url && <audio controls src={q.audio_url.startsWith('http')?q.audio_url:`${API_URL}${q.audio_url}`} className="w-full"/>}
                          
                          <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm">
                              {q.image_url && <img src={q.image_url.startsWith('http')?q.image_url:`${API_URL}${q.image_url}`} className="max-h-64 mb-4 rounded border"/>}
                              <div className="text-lg font-medium text-slate-800 mb-6">{renderTex(q.text)}</div>
                              
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, idx) => (
                                      <label key={idx} className={`flex items-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${answers[q.id]===opt.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
                                          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${answers[q.id]===opt.id?'bg-blue-600 text-white':'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65+idx)}</div>
                                          <div className="flex-1">{renderTex(opt.label)}</div>
                                          <input type="radio" name={`q-${q.id}`} className="hidden" checked={answers[q.id]===opt.id} onChange={()=>handleAnswer(opt.id)}/>
                                      </label>
                                  ))}
                                  {q.type === 'complex' && q.options.map((opt, idx) => (
                                      <label key={idx} className="flex items-center gap-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer">
                                          <input type="checkbox" className="w-5 h-5" checked={(answers[q.id]||[]).includes(opt.id)} onChange={e=>{
                                              const curr = answers[q.id] || [];
                                              handleAnswer(e.target.checked ? [...curr, opt.id] : curr.filter(x=>x!==opt.id));
                                          }}/>
                                          <span>{renderTex(opt.label)}</span>
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && (
                                      <input className="w-full p-4 border rounded-xl font-bold" placeholder="Ketik jawaban..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* NAVIGASI NOMOR */}
                  <div className="w-72 bg-white border-l p-4 overflow-y-auto hidden md:block">
                      <div className="font-bold mb-4 text-slate-700">Navigasi</div>
                      <div className="grid grid-cols-5 gap-2">
                          {questions.map((_, i) => (
                              <button key={i} onClick={()=>setCurrentQIdx(i)} className={`p-2 rounded text-sm font-bold ${currentQIdx===i?'bg-blue-600 text-white':answers[questions[i].id]?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>{i+1}</button>
                          ))}
                      </div>
                  </div>
              </div>
              
              {/* FOOTER NAV */}
              <div className="bg-white p-4 border-t flex justify-between sticky bottom-0 z-50">
                  <button onClick={()=>setCurrentQIdx(Math.max(0, currentQIdx-1))} disabled={currentQIdx===0} className="px-6 py-2 bg-slate-200 rounded-lg font-bold disabled:opacity-50">Sebelumnya</button>
                  <button onClick={()=>setCurrentQIdx(Math.min(questions.length-1, currentQIdx+1))} disabled={currentQIdx===questions.length-1} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50">Selanjutnya</button>
              </div>
          </div>
      );
  }

  // --- VIEW: DASHBOARD (NON-UJIAN) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* NAVBAR */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-6">
              <div className="font-extrabold text-xl text-blue-600 flex items-center gap-2"><Zap fill="currentColor" className="text-yellow-400"/> EduPrime</div>
              <div className="hidden md:flex gap-1">
                  <button onClick={()=>setActiveTab('home')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab==='home'?'bg-blue-50 text-blue-600':'text-slate-500 hover:bg-slate-50'}`}>Dashboard</button>
                  <button onClick={()=>setActiveTab('exam')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab==='exam'?'bg-blue-50 text-blue-600':'text-slate-500 hover:bg-slate-50'}`}>Ujian</button>
                  <button onClick={()=>setActiveTab('lms')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab==='lms'?'bg-blue-50 text-blue-600':'text-slate-500 hover:bg-slate-50'}`}>Belajar</button>
              </div>
          </div>
          <button onClick={onLogout} className="bg-rose-50 text-rose-500 p-2 rounded-lg hover:bg-rose-100"><LogOut size={18}/></button>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
          
          {/* TAB: HOME */}
          {activeTab === 'home' && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Halo, {user?.name}! 👋</h1>
                        <p className="opacity-90 mb-6">Siap untuk belajar hari ini?</p>
                        <button onClick={()=>setShowTargetModal(true)} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white/30 transition border border-white/20"><Target size={16}/> {user.pilihan1 || "Set Target Jurusan"}</button>
                    </div>
                    <Award className="absolute right-[-20px] bottom-[-20px] opacity-20" size={140}/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={()=>setActiveTab('exam')} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition text-center group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition"><Play size={24} fill="currentColor"/></div>
                        <div className="font-bold text-slate-800">Mulai Ujian</div>
                    </div>
                    <div onClick={()=>setActiveTab('lms')} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition text-center group">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition"><BookOpen size={24}/></div>
                        <div className="font-bold text-slate-800">Materi Belajar</div>
                    </div>
                </div>
              </>
          )}

          {/* TAB: UJIAN */}
          {activeTab === 'exam' && (
              <div className="space-y-4">
                  <h2 className="font-bold text-xl flex items-center gap-2"><LayoutGrid className="text-blue-600"/> Daftar Tryout</h2>
                  {periods.length === 0 && <div className="p-8 text-center text-slate-400 bg-slate-100 rounded-xl">Belum ada ujian tersedia.</div>}
                  <div className="grid gap-4 md:grid-cols-2">
                      {periods.map(p => (
                          <div key={p.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:border-blue-300 transition">
                              <div className="flex justify-between items-start mb-3">
                                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">{p.type}</span>
                              </div>
                              <h3 className="font-bold text-lg mb-4">{p.name}</h3>
                              <div className="space-y-2">
                                  {p.exams.map(e => (
                                      <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                          <span className="text-sm font-bold text-slate-700">{e.title}</span>
                                          {e.is_done ? (
                                              <button onClick={()=>openReview(e.id)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg">Nilai</button>
                                          ) : (
                                              <button onClick={()=>handleStartExam(e.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-blue-700">MULAI <ChevronRight size={12}/></button>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* TAB: LMS */}
          {activeTab === 'lms' && (
              <div className="space-y-4">
                  <h2 className="font-bold text-xl flex items-center gap-2"><BookOpen className="text-blue-600"/> Pustaka Materi</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                      {materials.map(m => (
                          <div key={m.id} onClick={()=>window.open(m.content_url, '_blank')} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer flex items-center gap-4 transition">
                              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><FileText size={20}/></div>
                              <div className="flex-1">
                                  <div className="text-xs text-slate-400 font-bold uppercase">{m.category}</div>
                                  <div className="font-bold text-slate-800 line-clamp-1">{m.title}</div>
                              </div>
                              <ChevronRight className="text-slate-300"/>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-3 z-40 pb-5 shadow-lg">
          <button onClick={()=>setActiveTab('home')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab==='home'?'text-blue-600':'text-slate-400'}`}><Home size={20}/> Home</button>
          <button onClick={()=>setActiveTab('exam')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab==='exam'?'text-blue-600':'text-slate-400'}`}><LayoutGrid size={20}/> Ujian</button>
          <button onClick={()=>setActiveTab('lms')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab==='lms'?'text-blue-600':'text-slate-400'}`}><BookOpen size={20}/> Belajar</button>
      </div>

      {/* MODAL TARGET */}
      {showTargetModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                  <h3 className="font-bold text-lg mb-4 text-center">Pilih Jurusan</h3>
                  <input className="w-full p-2 border rounded-lg mb-4 text-sm" placeholder="Cari..." value={searchJurusan} onChange={e=>setSearchJurusan(e.target.value)}/>
                  <select className="w-full p-2 border rounded-lg mb-2 text-sm" value={target1} onChange={e=>setTarget1(e.target.value)}><option value="">Pilihan 1</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                  <select className="w-full p-2 border rounded-lg mb-6 text-sm" value={target2} onChange={e=>setTarget2(e.target.value)}><option value="">Pilihan 2</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                  <div className="flex gap-2">
                      <button onClick={()=>setShowTargetModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-sm font-bold">Batal</button>
                      <button onClick={saveTarget} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Simpan</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL REVIEW */}
      {reviewData && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h3 className="font-bold">Pembahasan</h3>
                  <button onClick={()=>setReviewData(null)} className="p-2 bg-slate-100 rounded-full"><X/></button>
              </div>
              <div className="p-4 space-y-6 max-w-3xl mx-auto">
                  <div className="text-center p-6 bg-blue-50 rounded-xl"><div className="text-4xl font-extrabold text-blue-600">{Math.round(reviewData.score)}</div><div className="text-xs font-bold text-blue-400">SKOR ANDA</div></div>
                  {reviewData.questions.map((q,i)=>(
                      <div key={q.id} className="pb-6 border-b space-y-3">
                          <div className="font-bold">No. {i+1}</div>
                          {q.image_url && <img src={q.image_url.startsWith('http')?q.image_url:`${API_URL}${q.image_url}`} className="max-h-40 rounded"/>}
                          <div>{renderTex(q.text)}</div>
                          <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-2">{q.options.map((o,idx)=>(<div key={idx} className={`flex gap-2 ${o.is_correct?'text-green-600 font-bold':''}`}><span>{String.fromCharCode(65+idx)}.</span>{renderTex(o.label)} {o.is_correct&&<CheckCircle size={14}/>}</div>))}</div>
                          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800"><strong>Pembahasan:</strong> {renderTex(q.explanation)}</div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentDashboard;