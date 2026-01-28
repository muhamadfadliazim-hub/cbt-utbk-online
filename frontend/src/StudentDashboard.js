import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, BarChart3, Lock, Trophy, PlayCircle, Eye, CheckCircle, XCircle, X } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const StudentDashboard = ({ user, onLogout, onSelectExam, apiUrl }) => {
  const [tab, setTab] = useState('exams');
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewData, setReviewData] = useState(null); // Data pembahasan

  useEffect(() => {
    if (!user || !user.username) return;
    if (tab === 'exams') fetch(`${apiUrl}/student/periods?username=${user.username}`).then(r => r.json()).then(setPeriods).catch(console.error);
    if (tab === 'stats') fetch(`${apiUrl}/student/dashboard-stats?username=${user.username}`).then(r => r.json()).then(setStats).catch(console.error);
  }, [tab, user, apiUrl]);

  // Fungsi ambil pembahasan
  const handleViewReview = (examId) => {
      fetch(`${apiUrl}/student/review/${examId}`)
        .then(r => r.json())
        .then(setReviewData)
        .catch(() => alert("Gagal memuat pembahasan."));
  };

  const renderText = (text) => {
      if(!text) return "";
      let formatted = text
          .replace(/\[P\]/g, '<br/><br/>').replace(/\[\/P\]/g, '')
          .replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>')
          .replace(/\[I\]/g, '<i>').replace(/\[\/I\]/g, '</i>');
      return formatted.split(/(\$.*?\$)/).map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={index} math={part.slice(1, -1)} />;
          }
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      });
  };

  if (!user || !user.username) return <div className="p-10 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {/* MODAL PEMBAHASAN */}
      {reviewData && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-indigo-900 text-white">
                    <h3 className="font-bold text-lg">Pembahasan: {reviewData.title}</h3>
                    <button onClick={()=>setReviewData(null)}><X/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
                    {reviewData.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex gap-3 mb-4">
                                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold shrink-0">{idx+1}</div>
                                <div className="flex-1">
                                    {q.reading_material && <div className="p-4 bg-gray-50 text-sm mb-4 rounded border font-serif">{renderText(q.reading_material)}</div>}
                                    {q.image_url && <img src={q.image_url} alt="Soal" className="max-h-48 mb-4 rounded border"/>}
                                    <div className="font-medium text-gray-800">{renderText(q.text)}</div>
                                </div>
                            </div>
                            <div className="ml-11 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-800 space-y-2">
                                <div><strong>Kunci Jawaban:</strong> {q.correct_answer}</div>
                                {q.explanation && <div><strong>Pembahasan:</strong><br/>{renderText(q.explanation)}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <header className="bg-indigo-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div><h1 className="text-2xl font-extrabold">Halo, {user.name}</h1><p className="text-indigo-200 text-sm mt-1">{user.display1 ? `Target: ${user.display1}` : 'Pejuang PTN'}</p></div>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-bold flex gap-2 text-sm"><LogOut size={16}/> Keluar</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto mt-6 px-4">
        <div className="flex gap-4 border-b border-gray-200 pb-1">
          <button onClick={() => setTab('exams')} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition ${tab==='exams'?'bg-white text-indigo-600 border-x border-t':'text-gray-500 hover:text-indigo-500'}`}><BookOpen size={18}/> Ujian</button>
          <button onClick={() => setTab('stats')} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition ${tab==='stats'?'bg-white text-indigo-600 border-x border-t':'text-gray-500 hover:text-indigo-500'}`}><BarChart3 size={18}/> Hasil & Pembahasan</button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {tab === 'exams' && (
          <div className="space-y-8">
            {periods.length === 0 && <div className="p-10 text-center text-gray-400">Belum ada ujian.</div>}
            {periods.map(p => {
                const isFullMode = p.type && p.type.includes('FULL');
                const activeIndex = p.exams.findIndex(e => !e.is_done);
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-lg">{p.name}</h3><span className={`text-xs font-bold px-3 py-1 rounded-full ${isFullMode ? 'bg-purple-100 text-purple-700':'bg-indigo-100 text-indigo-700'}`}>{isFullMode ? 'MODE MARATON' : 'MODE BEBAS'}</span></div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {p.exams.map((e, idx) => {
                            const isLocked = isFullMode && activeIndex !== -1 && idx > activeIndex;
                            const isNext = isFullMode && idx === activeIndex;
                            return (<div key={e.id} className={`border rounded-xl p-5 transition relative bg-white ${isLocked ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}><div className="flex justify-between items-start"><h4 className="font-bold text-gray-800">{e.title}</h4>{isLocked && <Lock size={16} className="text-gray-400"/>}</div><div className="text-xs text-gray-500 mt-2 flex gap-3"><span>⏱ {e.duration}m</span><span>📝 {e.q_count} Soal</span></div><button onClick={() => { if (isFullMode && !isNext && !e.is_done) return; if (!e.is_done) onSelectExam(isFullMode ? p : e); }} disabled={e.is_done || isLocked} className={`mt-4 w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${e.is_done ? 'bg-emerald-100 text-emerald-700 cursor-default' : isLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'}`}>{e.is_done ? 'Selesai' : isLocked ? 'Terkunci' : 'Kerjakan'}</button></div>);
                        })}
                    </div>
                  </div>
                );
            })}
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-6">
            {!stats ? <div className="text-center p-10">Memuat...</div> : !stats.is_released ? (
              <div className="bg-white rounded-2xl shadow-lg border p-12 text-center"><Lock size={40} className="mx-auto text-amber-500 mb-4"/><h2 className="text-2xl font-bold">Hasil Belum Dirilis</h2><p className="text-gray-500">Silakan cek kembali nanti.</p></div>
            ) : (
              <div className="space-y-6">
                  {/* KARTU STATUS KELULUSAN */}
                  <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden`}>
                      <div className={`p-6 text-white text-center ${stats.status_color === 'green' ? 'bg-emerald-600' : stats.status_color === 'blue' ? 'bg-blue-600' : 'bg-red-600'}`}>
                          <h2 className="text-3xl font-extrabold mb-2">{stats.average}</h2>
                          <p className="font-bold opacity-90">RATA-RATA SKOR UTBK</p>
                          <div className="mt-4 inline-block bg-white/20 px-6 py-2 rounded-full text-sm font-bold backdrop-blur-sm">{stats.status}</div>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="p-4 bg-gray-50 rounded-xl border"><div className="text-gray-500">Pilihan 1</div><div className="font-bold">{stats.choice1}</div></div>
                          <div className="p-4 bg-gray-50 rounded-xl border"><div className="text-gray-500">Pilihan 2</div><div className="font-bold">{stats.choice2}</div></div>
                      </div>
                  </div>

                  {/* TABEL RINCIAN & PEMBAHASAN */}
                  <div className="bg-white rounded-2xl shadow border overflow-hidden">
                      <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Rincian Hasil & Pembahasan</div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-100 text-gray-600"><tr><th className="p-4">Subtes</th><th className="p-4 text-center">Benar</th><th className="p-4 text-center">Salah</th><th className="p-4 text-center">Skor</th><th className="p-4 text-center">Aksi</th></tr></thead>
                              <tbody className="divide-y">
                                  {stats.details.map((item, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                          <td className="p-4 font-bold">{item.subject}</td>
                                          <td className="p-4 text-center text-green-600 font-bold">{item.correct}</td>
                                          <td className="p-4 text-center text-red-600 font-bold">{item.wrong}</td>
                                          <td className="p-4 text-center font-bold text-indigo-700">{item.score}</td>
                                          <td className="p-4 text-center">
                                              <button onClick={() => handleViewReview(item.id)} className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 mx-auto transition shadow-sm">
                                                  <Eye size={14}/> Lihat Pembahasan
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;