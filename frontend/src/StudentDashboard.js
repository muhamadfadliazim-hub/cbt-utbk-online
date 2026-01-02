import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Play, FileText, BarChart2, LogOut, ChevronRight, BookOpen, X } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const StudentDashboard = ({ user, onLogout }) => {
  const [periods, setPeriods] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [reviewExamData, setReviewExamData] = useState(null); // State untuk Review Pembahasan
  
  // --- EXAM LOGIC STATES ---
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`)
      .then(r => r.json())
      .then(d => setPeriods(d));
  }, [user.username]);

  useEffect(() => {
    if (timeLeft > 0 && activeExam) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && activeExam) {
      handleSubmitExam();
    }
  }, [timeLeft, activeExam]);

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
        return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const startExam = (examId) => {
      if(!window.confirm("Mulai ujian? Waktu akan berjalan.")) return;
      fetch(`${API_URL}/exams/${examId}`)
        .then(r => r.json())
        .then(data => {
            setQuestions(data.questions);
            setTimeLeft(data.duration * 60);
            setAnswers({});
            setCurrentQIdx(0);
            setActiveExam(examId);
        });
  };

  const handleAnswer = (val) => {
      setAnswers({ ...answers, [questions[currentQIdx].id]: val });
  };

  const handleSubmitExam = () => {
      fetch(`${API_URL}/exams/${activeExam}/submit`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ username: user.username, answers: answers })
      }).then(() => {
          alert("Ujian Selesai!");
          setActiveExam(null);
          window.location.reload();
      });
  };

  // --- REVIEW MODE (PEMBAHASAN) ---
  const openReview = (examId) => {
      fetch(`${API_URL}/student/exams/${examId}/review?username=${user.username}`)
        .then(r => {
            if(!r.ok) throw new Error("Selesaikan ujian dulu.");
            return r.json();
        })
        .then(data => setReviewExamData(data))
        .catch(err => alert(err.message));
  };
  // --------------------------------

  if (activeExam && questions.length > 0) {
      const q = questions[currentQIdx];
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
              <div className="bg-white p-4 shadow flex justify-between items-center sticky top-0 z-10">
                  <div className="font-bold text-lg">Soal {currentQIdx + 1} / {questions.length}</div>
                  <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
              </div>
              <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
                  {q.reading_material && (
                      <div className="bg-white p-4 rounded shadow mb-4 border-l-4 border-yellow-400 text-sm leading-relaxed">
                          <h4 className="font-bold text-gray-500 mb-2 flex items-center gap-2"><BookOpen size={16}/> Bacaan</h4>
                          {renderText(q.reading_material)}
                      </div>
                  )}
                  <div className="bg-white p-6 rounded shadow mb-6">
                      <div className="text-lg mb-4">{renderText(q.text)}</div>
                      
                      {/* RENDER INPUT BERDASARKAN TIPE */}
                      {q.type === 'multiple_choice' && (
                          <div className="space-y-3">
                              {q.options.map(opt => (
                                  <label key={opt.id} className={`flex items-center p-3 rounded border cursor-pointer hover:bg-indigo-50 transition ${answers[q.id] === opt.id ? 'bg-indigo-100 border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${answers[q.id] === opt.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-400 text-gray-500'}`}>{opt.id}</div>
                                      <input type="radio" name={`q-${q.id}`} className="hidden" checked={answers[q.id] === opt.id} onChange={() => handleAnswer(opt.id)} />
                                      <div className="text-sm">{renderText(opt.label)}</div>
                                  </label>
                              ))}
                          </div>
                      )}

                      {q.type === 'complex' && (
                          <div className="space-y-2">
                              <div className="text-xs text-gray-500 mb-2">*Pilih satu atau lebih jawaban</div>
                              {q.options.map(opt => {
                                  const currentAns = answers[q.id] || [];
                                  const isSelected = currentAns.includes(opt.id);
                                  return (
                                      <label key={opt.id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                          <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={isSelected} 
                                              onChange={(e) => {
                                                  const newAns = e.target.checked ? [...currentAns, opt.id] : currentAns.filter(x => x !== opt.id);
                                                  handleAnswer(newAns);
                                              }} 
                                          />
                                          <span>{renderText(opt.label)}</span>
                                      </label>
                                  );
                              })}
                          </div>
                      )}

                      {q.type === 'table_boolean' && (
                          <table className="w-full text-sm border mt-4">
                              <thead>
                                  <tr className="bg-gray-100">
                                      <th className="p-2 text-left">Pernyataan</th>
                                      <th className="p-2 w-20 text-center">{q.label_true || 'Benar'}</th>
                                      <th className="p-2 w-20 text-center">{q.label_false || 'Salah'}</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {q.options.map(opt => (
                                      <tr key={opt.id} className="border-t">
                                          <td className="p-3">{renderText(opt.label)}</td>
                                          <td className="text-center"><input type="radio" name={`row-${q.id}-${opt.id}`} checked={(answers[q.id] || {})[opt.id] === 'B'} onChange={() => handleAnswer({ ...(answers[q.id] || {}), [opt.id]: 'B' })} className="w-4 h-4"/></td>
                                          <td className="text-center"><input type="radio" name={`row-${q.id}-${opt.id}`} checked={(answers[q.id] || {})[opt.id] === 'S'} onChange={() => handleAnswer({ ...(answers[q.id] || {}), [opt.id]: 'S' })} className="w-4 h-4"/></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}

                      {q.type === 'short_answer' && (
                          <input className="w-full border p-3 rounded mt-2" placeholder="Ketik jawaban Anda..." value={answers[q.id] || ''} onChange={(e) => handleAnswer(e.target.value)} />
                      )}
                  </div>
              </div>
              <div className="bg-white p-4 shadow border-t flex justify-between">
                  <button onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx === 0} className="px-4 py-2 border rounded disabled:opacity-50">Sebelumnya</button>
                  {currentQIdx === questions.length - 1 ? (
                      <button onClick={handleSubmitExam} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Selesai & Kumpulkan</button>
                  ) : (
                      <button onClick={() => setCurrentQIdx(Math.min(questions.length - 1, currentQIdx + 1))} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Selanjutnya</button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* REVIEW MODAL */}
      {reviewExamData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                  <div className="p-4 border-b flex justify-between bg-green-50">
                      <div>
                          <h3 className="text-xl font-bold text-green-900">Pembahasan: {reviewExamData.title}</h3>
                          <p className="text-sm text-green-700">Skor: {Math.round(reviewExamData.score)} | Benar: {reviewExamData.correct}</p>
                      </div>
                      <button onClick={()=>setReviewExamData(null)}><X/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                      {reviewExamData.questions.map((q, i) => (
                          <div key={q.id} className="border p-4 rounded bg-gray-50">
                              <div className="font-bold text-indigo-800 mb-2">Soal No. {i+1}</div>
                              {q.reading_material && <div className="bg-white p-3 border-l-4 border-yellow-400 text-sm mb-3 italic">{renderText(q.reading_material)}</div>}
                              <div className="mb-3">{renderText(q.text)}</div>
                              
                              {/* OPSI + KUNCI */}
                              <div className="pl-4 border-l-2 border-gray-300 space-y-1 mb-4">
                                  {q.type === 'multiple_choice' && q.options.map((o, idx) => (
                                      <div key={idx} className={o.is_correct ? 'text-green-700 font-bold bg-green-50 p-1 rounded' : 'text-gray-500'}>
                                          {String.fromCharCode(65+idx)}. {renderText(o.label)} {o.is_correct && "✅"}
                                      </div>
                                  ))}
                                  {q.type === 'short_answer' && <div className="font-bold text-green-700">Jawaban: {q.options[0].label}</div>}
                              </div>

                              {/* PEMBAHASAN */}
                              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                  <div className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2"><BookOpen size={16}/> Pembahasan:</div>
                                  <div className="text-sm text-blue-800 leading-relaxed">{q.explanation ? renderText(q.explanation) : <span className="italic text-gray-400">Belum ada pembahasan.</span>}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-bold text-xl text-indigo-700 flex items-center gap-2"><div className="w-8 h-8 bg-indigo-600 rounded text-white flex items-center justify-center">S</div> Simulasi CBT</div>
          <div className="flex items-center gap-4">
              <span className="hidden md:inline font-bold text-gray-600">{user.name}</span>
              <button onClick={onLogout} className="bg-gray-100 p-2 rounded hover:bg-red-50 hover:text-red-600"><LogOut size={20}/></button>
          </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
          {periods.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="bg-indigo-900 text-white p-4 flex justify-between items-center">
                      <h2 className="font-bold text-lg">{p.name}</h2>
                      <span className="text-xs bg-indigo-700 px-2 py-1 rounded">{p.type}</span>
                  </div>
                  <div className="p-4 grid gap-3">
                      {p.exams.map(e => (
                          <div key={e.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                              <div>
                                  <div className="font-bold text-gray-800">{e.title}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2">
                                      <Clock size={12}/> {e.duration} Menit
                                      {e.status === 'done' && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selesai</span>}
                                  </div>
                              </div>
                              <div>
                                  {e.status === 'done' ? (
                                      <button onClick={()=>openReview(e.id)} className="bg-green-100 text-green-700 px-4 py-2 rounded font-bold text-sm hover:bg-green-200">Pembahasan</button>
                                  ) : e.status === 'locked' ? (
                                      <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded font-bold text-sm cursor-not-allowed">Terkunci</button>
                                  ) : (
                                      <button onClick={() => startExam(e.id)} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-indigo-700 flex items-center gap-2">Mulai <ChevronRight size={16}/></button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </main>
    </div>
  );
};

export default StudentDashboard;