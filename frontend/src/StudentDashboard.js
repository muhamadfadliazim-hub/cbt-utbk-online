import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Play, FileText, BarChart2, LogOut, ChevronRight, BookOpen, X, ChevronLeft, Flag } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [periods, setPeriods] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [reviewExamData, setReviewExamData] = useState(null);
  
  // Exam State
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState([]);

  useEffect(() => { fetch(`${API_URL}/student/periods?username=${user.username}`).then(r => r.json()).then(setPeriods); }, [user.username]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) { const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }
    else if (timeLeft === 0 && activeExam) handleSubmitExam();
  }, [timeLeft, activeExam]);

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
        return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const startExam = (examId) => {
      if(!window.confirm("Mulai ujian sekarang? Waktu akan berjalan.")) return;
      fetch(`${API_URL}/exams/${examId}`).then(r => r.json()).then(data => {
            setQuestions(data.questions); setTimeLeft(data.duration * 60); setAnswers({}); setCurrentQIdx(0); setActiveExam(examId);
      });
  };

  const handleAnswer = (val) => setAnswers({ ...answers, [questions[currentQIdx].id]: val });
  const handleSubmitExam = () => { fetch(`${API_URL}/exams/${activeExam}/submit`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: user.username, answers: answers }) }).then(() => { alert("Ujian Selesai!"); setActiveExam(null); window.location.reload(); }); };
  const toggleMark = (idx) => setMarkedQuestions(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx]);

  const openReview = (examId) => { fetch(`${API_URL}/student/exams/${examId}/review?username=${user.username}`).then(r => r.ok?r.json():Promise.reject("Selesaikan dulu.")).then(setReviewExamData).catch(e=>alert(e)); };

  // --- MODE UJIAN (FULLSCREEN LOOK) ---
  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
              {/* HEADER UJIAN */}
              <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-20 border-b">
                  <div className="font-bold text-slate-700 text-lg">Soal No. {currentQIdx + 1} <span className="text-slate-400 font-normal">/ {questions.length}</span></div>
                  <div className={`px-4 py-2 rounded-lg font-mono font-bold text-xl tracking-wider ${timeLeft < 300 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-100 text-indigo-700'}`}>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <button onClick={handleSubmitExam} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-200 transition">Selesai Ujian</button>
              </div>

              {/* CONTENT AREA */}
              <div className="flex-1 flex overflow-hidden">
                  {/* MAIN QUESTION AREA */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                      <div className="max-w-4xl mx-auto space-y-6 pb-20">
                          {q.reading_material && (
                              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm text-slate-800 leading-relaxed text-lg">
                                  <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"><BookOpen size={16}/> Bacaan</h4>
                                  {renderText(q.reading_material)}
                              </div>
                          )}
                          
                          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                              <div className="text-xl font-medium text-slate-800 mb-8 leading-relaxed">{renderText(q.text)}</div>
                              
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${answers[q.id] === opt.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-white'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 transition-colors ${answers[q.id] === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>{String.fromCharCode(65+i)}</div>
                                          <input type="radio" name={`q-${q.id}`} className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                          <div className="text-lg text-slate-700">{renderText(opt.label)}</div>
                                      </label>
                                  ))}
                                  {/* TIPE LAIN (COMPLEX, TABLE, SHORT) BISA DITAMBAHKAN DISINI DENGAN STYLING SERUPA */}
                                  {q.type === 'short_answer' && <input className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="Ketik jawaban Anda..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* NAVIGATION SIDEBAR */}
                  <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 hidden md:flex">
                      <div className="p-4 border-b font-bold text-slate-700">Navigasi Soal</div>
                      <div className="flex-1 overflow-y-auto p-4">
                          <div className="grid grid-cols-5 gap-2">
                              {questions.map((_, idx) => {
                                  const isAns = answers[questions[idx].id];
                                  const isMarked = markedQuestions.includes(idx);
                                  const isCurrent = currentQIdx === idx;
                                  return (
                                      <button key={idx} onClick={() => setCurrentQIdx(idx)} 
                                          className={`aspect-square rounded-lg font-bold text-sm relative transition-all
                                          ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-600 bg-indigo-600 text-white' : 
                                            isAns ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                                          `}>
                                          {idx + 1}
                                          {isMarked && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full m-1"></div>}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                      <div className="p-4 border-t space-y-2">
                          <button onClick={()=>toggleMark(currentQIdx)} className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${markedQuestions.includes(currentQIdx)?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}><Flag size={18}/> Ragu-ragu</button>
                          <div className="flex gap-2">
                              <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx===0} className="flex-1 py-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft className="mx-auto"/></button>
                              <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} disabled={currentQIdx===questions.length-1} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"><ChevronRight className="mx-auto"/></button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- DASHBOARD UTAMA SISWA ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">S</div>
                  <div><h1 className="font-bold text-xl leading-none">Simulasi UTBK</h1><span className="text-xs text-slate-400">Student Area</span></div>
              </div>
              <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right"><div className="font-bold text-slate-700">{user.name}</div><div className="text-xs text-slate-400">{user.username}</div></div>
                  <button onClick={onLogout} className="bg-slate-100 p-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition"><LogOut size={20}/></button>
              </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
          {/* HERO SECTION */}
          <div className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Halo, Pejuang PTN! 🚀</h2>
                  <p className="text-indigo-200 text-lg max-w-xl">Sudah siap untuk latihan hari ini? Konsistensi adalah kunci. Kerjakan tryout terbaru untuk mengukur kemampuanmu.</p>
              </div>
          </div>

          {/* LIST PAKET UJIAN */}
          <div>
              <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2"><FileText className="text-indigo-600"/> Paket Ujian Tersedia</h3>
              <div className="grid gap-6">
                  {periods.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-6">
                              <div><h4 className="font-bold text-lg text-slate-800">{p.name}</h4><span className="text-sm text-slate-500">{p.type} &bull; {p.exams.length} Subtes</span></div>
                              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">{p.exams.filter(e=>e.status==='done').length}/{p.exams.length}</div>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {p.exams.map(e => (
                                  <div key={e.id} className={`p-4 rounded-xl border flex items-center justify-between transition ${e.status==='done'?'bg-emerald-50 border-emerald-100':e.status==='locked'?'bg-slate-50 border-slate-100 opacity-60':'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                      <div>
                                          <div className={`font-bold text-sm ${e.status==='done'?'text-emerald-800':'text-slate-700'}`}>{e.title}</div>
                                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock size={12}/> {e.duration} Menit</div>
                                      </div>
                                      {e.status === 'done' ? (
                                          <button onClick={()=>openReview(e.id)} className="px-3 py-1.5 bg-white text-emerald-600 text-xs font-bold rounded-lg shadow-sm border border-emerald-200 hover:bg-emerald-50">Pembahasan</button>
                                      ) : e.status === 'locked' ? (
                                          <Lock size={18} className="text-slate-300"/>
                                      ) : (
                                          <button onClick={() => startExam(e.id)} className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:scale-110 transition"><Play size={14} fill="currentColor"/></button>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* REVIEW MODAL */}
      {reviewExamData && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                  <div className="p-5 border-b flex justify-between items-center bg-emerald-50">
                      <div><h3 className="font-bold text-xl text-emerald-900">Pembahasan Soal</h3><p className="text-emerald-700 text-sm">Skor IRT: {Math.round(reviewExamData.score)}</p></div>
                      <button onClick={()=>setReviewExamData(null)} className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><X/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                      {reviewExamData.questions.map((q,i)=>(
                          <div key={q.id} className="p-6 border rounded-xl bg-white shadow-sm">
                              <div className="font-bold text-indigo-900 mb-3">No. {i+1}</div>
                              {q.reading_material && <div className="p-4 bg-amber-50 rounded-lg text-sm mb-4 italic text-slate-700 border-l-4 border-amber-300">{renderText(q.reading_material)}</div>}
                              <div className="mb-4 text-lg">{renderText(q.text)}</div>
                              <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                                  {q.options.map((o,idx)=>(<div key={idx} className={`p-2 rounded ${o.is_correct?'bg-emerald-100 text-emerald-900 font-bold':'text-slate-500'}`}>{String.fromCharCode(65+idx)}. {renderText(o.label)} {o.is_correct&&'✅'}</div>))}
                              </div>
                              <div className="mt-6 p-5 bg-blue-50 text-blue-900 rounded-xl text-sm leading-relaxed border border-blue-100">
                                  <div className="font-bold mb-2 flex items-center gap-2"><BookOpen size={16}/> Pembahasan:</div>
                                  {q.explanation?renderText(q.explanation):"Belum ada pembahasan."}
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

export default StudentDashboard;