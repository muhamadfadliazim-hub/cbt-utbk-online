import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, Play, FileText, LogOut, ChevronRight, BookOpen, X, ChevronLeft, Flag, GraduationCap, Building2, Search, Save, Link, Video } from 'lucide-react';
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
  const [showMajorModal, setShowMajorModal] = useState(false);
  
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
    if (timeLeft > 0 && activeExam) { const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }
    else if (timeLeft === 0 && activeExam) handleSubmitExam();
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
      }).then(r => r.json()).then(d => { alert("Disimpan!"); setShowMajorModal(false); onLogout(); });
  };

  const startExam = (examId) => {
      if(!window.confirm("Mulai ujian?")) return;
      fetch(`${API_URL}/exams/${examId}`).then(r => r.json()).then(data => {
            setQuestions(data.questions); setTimeLeft(data.duration * 60); setAnswers({}); setCurrentQIdx(0); setActiveExam(examId);
      });
  };

  const handleAnswer = (val) => setAnswers({ ...answers, [questions[currentQIdx].id]: val });
  const handleSubmitExam = () => { fetch(`${API_URL}/exams/${activeExam}/submit`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: user.username, answers: answers }) }).then(() => { alert("Selesai!"); setActiveExam(null); window.location.reload(); }); };
  const toggleMark = (idx) => setMarkedQuestions(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx]);
  const openReview = (examId) => { fetch(`${API_URL}/student/exams/${examId}/review?username=${user.username}`).then(r => r.ok?r.json():Promise.reject("Belum selesai")).then(setReviewExamData).catch(e=>alert(e)); };

  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
              <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-20 border-b">
                  <div className="font-bold text-slate-700">No. {currentQIdx + 1} / {questions.length}</div>
                  <div className="font-mono text-xl font-bold text-indigo-700">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                  <button onClick={handleSubmitExam} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold">Selesai</button>
              </div>
              <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                      <div className="max-w-4xl mx-auto space-y-6 pb-20">
                          {q.reading_material && <div className="bg-amber-50 p-6 rounded border-l-4 border-amber-300">{renderText(q.reading_material)}</div>}
                          {q.image_url && <img src={`${API_URL}${q.image_url}`} alt="Soal" className="max-h-64 rounded shadow-sm border"/>}
                          <div className="bg-white p-8 rounded shadow-sm border border-slate-200">
                              <div className="text-xl font-medium mb-8">{renderText(q.text)}</div>
                              <div className="space-y-3">
                                  {q.type === 'multiple_choice' && q.options.map((opt, i) => (
                                      <label key={opt.id} className={`flex items-center p-4 rounded border cursor-pointer hover:bg-slate-50 ${answers[q.id] === opt.id ? 'bg-indigo-50 border-indigo-500' : ''}`}>
                                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold mr-4">{String.fromCharCode(65+i)}</div>
                                          <input type="radio" name={`q-${q.id}`} className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                          <div className="text-lg">{renderText(opt.label)}</div>
                                      </label>
                                  ))}
                                  {q.type === 'complex' && q.options.map(opt => (
                                      <label key={opt.id} className="flex items-center gap-3 p-4 border rounded hover:bg-slate-50">
                                          <input type="checkbox" className="w-5 h-5" checked={(answers[q.id]||[]).includes(opt.id)} onChange={e=>{const curr=answers[q.id]||[]; handleAnswer(e.target.checked?[...curr,opt.id]:curr.filter(x=>x!==opt.id))}} />
                                          <span className="text-lg">{renderText(opt.label)}</span>
                                      </label>
                                  ))}
                                  {q.type === 'short_answer' && <input className="w-full p-4 border rounded" placeholder="Jawaban..." value={answers[q.id]||''} onChange={e=>handleAnswer(e.target.value)}/>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="w-72 bg-white border-l flex flex-col hidden md:flex">
                      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-2 content-start">
                          {questions.map((_, idx) => (
                              <button key={idx} onClick={() => setCurrentQIdx(idx)} className={`h-10 rounded font-bold text-sm ${currentQIdx===idx?'bg-indigo-600 text-white':answers[questions[idx].id]?'bg-indigo-100 text-indigo-700':'bg-slate-100'}`}>{idx + 1}</button>
                          ))}
                      </div>
                      <div className="p-4 border-t flex gap-2">
                          <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} className="flex-1 py-2 border rounded"><ChevronLeft className="mx-auto"/></button>
                          <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx + 1))} className="flex-1 py-2 bg-indigo-600 text-white rounded"><ChevronRight className="mx-auto"/></button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="bg-white border-b sticky top-0 z-10 px-6 h-16 flex items-center justify-between">
          <div className="flex gap-6">
              <div className="font-bold text-xl text-indigo-700">CBT System</div>
              <div className="hidden md:flex gap-1">
                  <button onClick={()=>setTab('exam')} className={`px-4 py-1 rounded-full text-sm font-bold ${tab==='exam'?'bg-indigo-100 text-indigo-700':'text-slate-500 hover:bg-slate-100'}`}>Ujian</button>
                  <button onClick={()=>setTab('lms')} className={`px-4 py-1 rounded-full text-sm font-bold ${tab==='lms'?'bg-indigo-100 text-indigo-700':'text-slate-500 hover:bg-slate-100'}`}>Materi Belajar</button>
              </div>
          </div>
          <button onClick={onLogout} className="text-slate-500 hover:text-rose-600"><LogOut size={20}/></button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
          {tab === 'exam' && (
              <>
                <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="relative z-10 flex justify-between items-center">
                        <div><h2 className="text-2xl font-bold">Halo, {user.name}!</h2><p className="text-indigo-200">Target: {user.pilihan1 || "Belum diset"}</p></div>
                        <button onClick={()=>setShowMajorModal(true)} className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm">Ubah Target</button>
                    </div>
                </div>
                <div className="grid gap-4">
                    {periods.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-xl border shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg">{p.name} <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded ml-2">{p.type}</span></h4>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3">
                                {p.exams.map(e => (
                                    <div key={e.id} className="p-3 border rounded-lg flex justify-between items-center">
                                        <div><div className="font-bold text-sm">{e.title}</div><div className="text-xs text-slate-500">{e.duration}m</div></div>
                                        {e.status === 'done' ? <button onClick={()=>openReview(e.id)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Review</button> : 
                                        e.status === 'locked' ? <Lock size={16} className="text-slate-300"/> : 
                                        <button onClick={() => startExam(e.id)} className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Play size={12}/></button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
              </>
          )}

          {tab === 'lms' && (
              <div className="grid md:grid-cols-3 gap-4">
                  {materials.map(m=>(
                      <div key={m.id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
                          <span className={`text-[10px] px-2 py-1 rounded font-bold mb-2 inline-block ${m.category==='CPNS'?'bg-amber-100 text-amber-800':'bg-indigo-100 text-indigo-800'}`}>{m.category}</span>
                          <h4 className="font-bold flex items-center gap-2 mb-2">{m.type==='pdf'?<FileText size={16}/>:m.type==='video'?<Video size={16}/>:<Link size={16}/>} {m.title}</h4>
                          <p className="text-xs text-slate-500 mb-3">{m.description || "Tidak ada deskripsi"}</p>
                          <a href={m.content_url} target="_blank" rel="noreferrer" className="block w-full text-center bg-slate-50 py-2 rounded text-sm font-bold text-indigo-600 hover:bg-indigo-50">Buka Materi</a>
                      </div>
                  ))}
                  {materials.length===0 && <div className="col-span-3 text-center text-slate-400 py-10">Belum ada materi tersedia.</div>}
              </div>
          )}
      </div>

      {showMajorModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6">
                  <h3 className="font-bold text-lg mb-4">Pilih Jurusan</h3>
                  <input className="w-full p-2 border rounded mb-4" placeholder="Cari..." value={searchMajor} onChange={e=>setSearchMajor(e.target.value)}/>
                  <select className="w-full p-2 border rounded mb-2" value={selectedChoice1} onChange={e=>setSelectedChoice1(e.target.value)}><option value="">Pilihan 1</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                  <select className="w-full p-2 border rounded mb-4" value={selectedChoice2} onChange={e=>setSelectedChoice2(e.target.value)}><option value="">Pilihan 2</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                  <div className="flex justify-end gap-2"><button onClick={()=>setShowMajorModal(false)} className="px-4 py-2 rounded bg-slate-100">Batal</button><button onClick={handleSaveMajor} className="px-4 py-2 rounded bg-indigo-600 text-white">Simpan</button></div>
              </div>
          </div>
      )}

      {reviewExamData && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-emerald-50">
                      <div><h3 className="font-bold text-xl text-emerald-900">Pembahasan</h3><p className="text-emerald-700 text-sm">Skor: {Math.round(reviewExamData.score)}</p></div>
                      <button onClick={()=>setReviewExamData(null)}><X/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                      {reviewExamData.questions.map((q,i)=>(
                          <div key={q.id} className="p-6 border rounded-xl bg-white shadow-sm">
                              <div className="font-bold text-indigo-900 mb-3">No. {i+1}</div>
                              {q.image_url && <img src={`${API_URL}${q.image_url}`} alt="Soal" className="max-h-64 mb-4 rounded border"/>}
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