import React, { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, LogOut, BookOpen, 
    ChevronLeft, Flag, Award, Zap, Target, Home
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('home');
  const [periods, setPeriods] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`).then(r => r.json()).then(setPeriods);
  }, [user.username]);

  const handleSubmitExam = useCallback(() => { 
    fetch(`${API_URL}/exams/${activeExam}/submit`, { 
        method: 'POST', headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ username: user.username, answers: answers }) 
    }).then(() => { alert("Ujian Selesai!"); setActiveExam(null); window.location.reload(); }); 
  }, [activeExam, user.username, answers]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) {
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0 && activeExam) {
      handleSubmitExam();
    }
  }, [timeLeft, activeExam, handleSubmitExam]);

  const renderText = (t) => t && t.split(/(\$.*?\$)/).map((p, i) => p.startsWith('$') ? <InlineMath key={i} math={p.slice(1,-1)}/> : <span key={i} dangerouslySetInnerHTML={{__html: p.replace(/\n/g, '<br/>')}}/>);

  if (activeExam && questions.length > 0) {
    const q = questions[currentQIdx];
    return (
      <div className="h-screen flex flex-col bg-white font-sans overflow-hidden">
        <div className="h-16 bg-indigo-900 text-white flex items-center justify-between px-6 shadow-xl">
          <div className="font-black uppercase tracking-tighter">SOAL {currentQIdx + 1} / {questions.length}</div>
          <div className="bg-white/20 px-4 py-1 rounded-full font-mono font-bold tracking-widest">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
          <button onClick={handleSubmitExam} className="bg-rose-500 px-6 py-1 rounded-lg font-black text-xs">SELESAI</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-2xl font-medium leading-relaxed text-slate-800">{renderText(q.text)}</div>
            {q.image_url && <img src={q.image_url} alt="konten visual soal" className="max-h-80 mx-auto rounded-3xl shadow-lg border-8 border-slate-50"/>}
            <div className="grid gap-4">
              {q.options?.map((o, i) => (
                <button key={i} onClick={() => setAnswers({...answers, [q.id]: o.label})} 
                  className={`p-6 rounded-[2rem] border-2 text-left font-bold transition-all duration-300 ${answers[q.id] === o.label ? 'bg-indigo-900 text-white border-indigo-900 scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'}`}>
                  {String.fromCharCode(65+i)}. {renderText(o.label)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="h-20 bg-white border-t flex items-center justify-between px-8">
          <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx-1))} className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><ChevronLeft size={24}/></button>
          <button onClick={() => setMarkedQuestions(markedQuestions.includes(currentQIdx) ? markedQuestions.filter(x=>x!==currentQIdx) : [...markedQuestions, currentQIdx])} className={`px-8 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${markedQuestions.includes(currentQIdx)?'bg-amber-400 text-amber-900':'bg-slate-100 text-slate-400'}`}><Flag size={18} className="inline mr-2"/> RAGU</button>
          <button onClick={() => setCurrentQIdx(Math.min(questions.length-1, currentQIdx+1))} className="p-4 bg-indigo-900 text-white rounded-2xl hover:bg-black transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="bg-white border-b px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="font-black text-2xl text-indigo-900 flex items-center gap-2 tracking-tighter"><Zap className="text-amber-400" fill="currentColor"/> EDUPRIME</div>
        <button onClick={onLogout} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all"><LogOut size={20}/></button>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 pb-32 animate-in fade-in duration-700">
        {tab === 'home' && (
          <div className="space-y-10">
            <div className="bg-indigo-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-4xl font-black mb-4 leading-tight">Selamat Datang, <br/>{user.name}</h2>
                 <p className="text-indigo-200 font-bold flex items-center gap-2 mb-8"><Target className="text-amber-400"/> Fokus Hari Ini: <span className="underline italic">Latihan Soal TKA & UTBK</span></p>
                 <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 inline-block">
                   <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-300 font-bold mb-2">Executive Owner</p>
                   <p className="text-xl font-serif italic tracking-wide">Muhamad Fadli Azim</p>
                 </div>
               </div>
               <Award size={250} className="absolute right-[-40px] bottom-[-40px] opacity-10 rotate-12"/>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {periods.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group">
                  <div className="flex justify-between items-center mb-8">
                    <div className="bg-indigo-50 text-indigo-900 p-4 rounded-3xl font-black text-2xl shadow-inner">{p.name[0]}</div>
                    <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-200">{p.type}</span>
                  </div>
                  <h4 className="text-2xl font-black mb-6 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                  <div className="space-y-3">
                    {p.exams?.map(e => (
                      <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100">
                        <span className="font-bold text-slate-700">{e.title}</span>
                        {e.is_done ? <CheckCircle className="text-emerald-500" size={24}/> : <button onClick={()=>{ fetch(`${API_URL}/exams/${e.id}`).then(r=>r.json()).then(d=>{setQuestions(d.questions); setTimeLeft(d.duration*60); setActiveExam(e.id);})}} className="p-2 bg-indigo-900 text-white rounded-xl shadow-lg hover:bg-black transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg></button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab !== 'home' && <div className="bg-white p-20 rounded-[3rem] text-center text-slate-300 font-black text-3xl uppercase tracking-widest border-4 border-dashed">Fitur Segera Hadir</div>}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl p-2 rounded-full shadow-2xl flex gap-2 z-50 border border-white/10">
        <button onClick={()=>setTab('home')} className={`p-5 rounded-full transition-all ${tab==='home'?'bg-blue-600 text-white shadow-lg':'text-slate-400 hover:bg-white/10'}`}><Home size={24}/></button>
        <button onClick={()=>setTab('lms')} className={`p-5 rounded-full transition-all ${tab==='lms'?'bg-blue-600 text-white shadow-lg':'text-slate-400 hover:bg-white/10'}`}><BookOpen size={24}/></button>
        <button onClick={()=>setTab('profile')} className={`p-5 rounded-full transition-all ${tab==='profile'?'bg-blue-600 text-white shadow-lg':'text-slate-400 hover:bg-white/10'}`}><Target size={24}/></button>
      </div>
    </div>
  );
};
export default StudentDashboard;