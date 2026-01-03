import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Clock, CheckCircle, Play, FileText, LogOut, ChevronRight, BookOpen, X, 
    LayoutGrid, Award, Zap, Target, Home, Menu
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [periods, setPeriods] = useState([]);
  const [majors, setMajors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [reviewData, setReviewData] = useState(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [target1, setTarget1] = useState(user?.choice1_id || '');
  const [target2, setTarget2] = useState(user?.choice2_id || '');
  const [searchJurusan, setSearchJurusan] = useState('');

  useEffect(() => {
    if(user?.username) {
        fetch(`${API_URL}/student/periods?username=${user.username}`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[]));
        fetch(`${API_URL}/majors`).then(r=>r.json()).then(d=>setMajors(Array.isArray(d)?d:[]));
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>setMaterials(Array.isArray(d)?d:[]));
    }
  }, [user]);

  const finishExam = useCallback(() => {
      if(!window.confirm("Kumpulkan Jawaban?")) return;
      fetch(`${API_URL}/exams/${activeExam}/submit`, {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username: user.username, answers: answers })
      }).then(r=>r.json()).then(d => {
          alert(`Selesai! Skor: ${Math.round(d.score)}`);
          setActiveExam(null);
          window.location.reload();
      });
  }, [activeExam, user.username, answers]);

  useEffect(() => {
    if (activeExam && timeLeft > 0) {
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    } else if (activeExam && timeLeft === 0) {
        finishExam();
    }
  }, [activeExam, timeLeft, finishExam]);

  const renderTex = (t) => {
      if(!t) return null;
      return t.split(/(\$.*?\$)/).map((p,i)=>(p.startsWith('$')&&p.endsWith('$')?<InlineMath key={i} math={p.slice(1,-1)}/>:<span key={i} dangerouslySetInnerHTML={{__html:p.replace(/\n/g,'<br/>')}}/>));
  };

  const filteredMajors = useMemo(() => majors.filter(m => m.name.toLowerCase().includes(searchJurusan.toLowerCase())).slice(0, 50), [majors, searchJurusan]);

  const handleStartExam = (examId) => {
      if(!window.confirm("Mulai Ujian?")) return;
      fetch(`${API_URL}/exams/${examId}`).then(r=>r.json()).then(d=>{
          if(!d.questions || d.questions.length===0) return alert("Soal belum tersedia.");
          setQuestions(d.questions);
          setTimeLeft(d.duration * 60);
          setAnswers({});
          setCurrentQIdx(0);
          setActiveExam(examId);
      }).catch(e=>alert("Error: "+e.message));
  };

  const handleAnswer = (val) => setAnswers({...answers, [questions[currentQIdx].id]: val});

  const saveTarget = () => {
      fetch(`${API_URL}/users/select-major`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({username:user.username, choice1_id:parseInt(target1), choice2_id:target2?parseInt(target2):null})
      }).then(()=>{ alert("Tersimpan!"); setShowTargetModal(false); });
  };

  const SidebarItem = ({ id, icon:Icon, label }) => (
      <button onClick={()=>{setTab(id); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${tab===id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <Icon size={20}/> <span>{label}</span>
      </button>
  );

  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="h-screen flex flex-col bg-slate-100 font-sans">
              <div className="h-16 bg-white px-6 flex justify-between items-center shadow-sm z-50">
                  <div className="font-bold text-slate-700">Soal {currentQIdx+1} / {questions.length}</div>
                  <div className={`px-4 py-2 rounded-lg font-mono font-bold text-white ${timeLeft<300?'bg-red-500':'bg-blue-900'}`}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
                  <button onClick={finishExam} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">Selesai</button>
              </div>
              <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6">
                      <div className="max-w-4xl mx-auto space-y-6">
                          {q.reading_material && <div className="bg-white p-6 rounded-xl border-l-4 border-orange-400 shadow-sm">{renderTex(q.reading_material)}</div>}
                          <div className="bg-white p-8 rounded-xl shadow-sm">
                              {q.image_url && <img src={q.image_url.startsWith('http')?q.image_url:`${API_URL}${q.image_url}`} alt="Gambar Soal" className="max-h-64 mb-6 rounded"/>}
                              <div className="text-lg font-medium text-slate-800 mb-6">{renderTex(q.text)}</div>
                              <div className="space-y-3">
                                  {q.type==='multiple_choice' && q.options.map((o,i)=>(<label key={i} className={`flex p-4 border rounded-xl cursor-pointer hover:bg-slate-50 ${answers[q.id]===o.id?'bg-blue-50 border-blue-500':''}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${answers[q.id]===o.id?'bg-blue-600 text-white':'bg-slate-200'}`}>{String.fromCharCode(65+i)}</div><div className="flex-1">{renderTex(o.label)}</div><input type="radio" name="option" className="hidden" checked={answers[q.id]===o.id} onChange={()=>handleAnswer(o.id)}/></label>))}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="w-64 bg-white border-l p-4 hidden md:block overflow-y-auto"><div className="grid grid-cols-4 gap-2">{questions.map((_,i)=>(<button key={i} onClick={()=>setCurrentQIdx(i)} className={`p-2 rounded font-bold text-sm ${currentQIdx===i?'bg-blue-900 text-white':answers[questions[i].id]?'bg-green-100 text-green-700':'bg-slate-100'}`}>{i+1}</button>))}</div></div>
              </div>
              <div className="bg-white p-4 border-t flex justify-between">
                  <button onClick={()=>setCurrentQIdx(Math.max(0,currentQIdx-1))} className="px-6 py-2 bg-slate-200 rounded-lg font-bold">Prev</button>
                  <button onClick={()=>setCurrentQIdx(Math.min(questions.length-1,currentQIdx+1))} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Next</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
        <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white transform transition-transform z-40 ${isMobileMenuOpen?'translate-x-0':'-translate-x-full md:translate-x-0'}`}>
            <div className="p-6 font-bold text-xl flex items-center gap-2"><Zap className="text-yellow-400" fill="currentColor"/> EduPrime</div>
            <nav className="p-4 space-y-2">
                <SidebarItem id="dashboard" icon={Home} label="Dashboard" />
                <SidebarItem id="exam" icon={LayoutGrid} label="Menu Ujian" />
                <SidebarItem id="lms" icon={BookOpen} label="Materi Belajar" />
            </nav>
            <div className="p-4 border-t border-slate-800 absolute bottom-0 w-full">
                <div className="text-xs text-slate-500 mb-2">{user.name}</div>
                <button onClick={onLogout} className="flex items-center gap-2 text-rose-400 font-bold hover:text-white"><LogOut size={16}/> Keluar</button>
            </div>
        </aside>

        <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
            <div className="md:hidden bg-white p-4 border-b flex justify-between items-center">
                <div className="font-bold text-blue-600">EduPrime</div>
                <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu"><Menu/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                {tab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2">Selamat Datang! 👋</h1>
                                <p className="opacity-90 mb-6">Target: <strong>{user.pilihan1 || "Belum dipilih"}</strong></p>
                                <button onClick={()=>setShowTargetModal(true)} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white/30 border border-white/20"><Target size={16}/> Ubah Target</button>
                            </div>
                            <Award className="absolute right-[-20px] bottom-[-20px] opacity-20" size={140}/>
                        </div>
                    </div>
                )}

                {tab === 'exam' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {periods.map(p=>(
                            <div key={p.id} className="bg-white p-5 rounded-2xl border shadow-sm">
                                <h3 className="font-bold text-lg mb-4">{p.name}</h3>
                                {p.exams.map(e=>(
                                    <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-2">
                                        <div className="text-sm font-bold">{e.title}</div>
                                        {e.is_done ? <span className="text-emerald-600 font-bold text-xs">Selesai</span> : <button onClick={()=>handleStartExam(e.id)} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-xs font-bold">KERJAKAN</button>}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'lms' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {materials.map(m=>(
                            <div key={m.id} onClick={()=>window.open(m.content_url,'_blank')} className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:border-blue-400 flex items-center gap-4">
                                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600"><FileText/></div>
                                <div><div className="text-xs font-bold text-slate-400 uppercase">{m.category}</div><div className="font-bold text-slate-800">{m.title}</div></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {showTargetModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                    <h3 className="font-bold text-lg mb-4 text-center">Pilih Jurusan</h3>
                    <input className="w-full p-2 border rounded-lg mb-4" placeholder="Cari..." value={searchJurusan} onChange={e=>setSearchJurusan(e.target.value)}/>
                    <select className="w-full p-2 border rounded-lg mb-2" value={target1} onChange={e=>setTarget1(e.target.value)}><option value="">Pilihan 1</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                    <select className="w-full p-2 border rounded-lg mb-6" value={target2} onChange={e=>setTarget2(e.target.value)}><option value="">Pilihan 2</option>{filteredMajors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select>
                    <div className="flex gap-2">
                        <button onClick={()=>setShowTargetModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                        <button onClick={saveTarget} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {reviewData && (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white"><h3 className="font-bold">Pembahasan</h3><button onClick={()=>setReviewData(null)}><X/></button></div>
                <div className="p-6 max-w-3xl mx-auto space-y-6">
                    <div className="text-center p-6 bg-blue-50 rounded-xl mb-4"><div className="text-4xl font-extrabold text-blue-600">{Math.round(reviewData.score)}</div></div>
                    {reviewData.questions.map((q,i)=>(
                        <div key={q.id} className="pb-6 border-b space-y-3">
                            <div className="font-bold">No. {i+1}</div>
                            {q.image_url && <img src={q.image_url.startsWith('http')?q.image_url:`${API_URL}${q.image_url}`} alt="Preview" className="max-h-40 rounded"/>}
                            <div>{renderTex(q.text)}</div>
                            <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-2">{q.options.map((o,idx)=>(<div key={idx} className={`flex gap-2 ${o.is_correct?'text-green-600 font-bold':''}`}><span>{String.fromCharCode(65+idx)}.</span>{renderTex(o.label)} {o.is_correct&&<CheckCircle size={14}/>}</div>))}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default StudentDashboard;