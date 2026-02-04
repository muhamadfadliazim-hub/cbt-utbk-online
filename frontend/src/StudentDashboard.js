import React, { useState, useEffect } from 'react';
import { LogOut, Clock, PlayCircle, BarChart3, ChevronRight, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import ExamSimulation from './ExamSimulation';

const StudentDashboard = ({ user, onLogout, apiUrl }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  const [majors, setMajors] = useState([]);
  const [showMajorSelector, setShowMajorSelector] = useState(!user.choice1_id);
  const [selectedMajors, setSelectedMajors] = useState({ c1: '', c2: '' });

  // AUTO RESUME (CEK LOCALSTORAGE)
  const [activeExamId, setActiveExamId] = useState(localStorage.getItem('active_exam_id'));
  const [activeExamData, setActiveExamData] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    if (activeExamId) fetchExam(activeExamId);
    fetchData();
    fetchMajors();
  }, [activeExamId]);

  const fetchData = async () => {
    try {
        const [resP, resS] = await Promise.all([
            fetch(`${apiUrl}/student/periods?username=${user.username}`),
            fetch(`${apiUrl}/student/dashboard-stats?username=${user.username}`)
        ]);
        setPeriods(await resP.json());
        setStats(await resS.json());
    } catch(e) { console.error(e); }
  };
  
  const fetchMajors = async () => { const res = await fetch(`${apiUrl}/majors`); setMajors(await res.json()); };

  const handleSaveMajors = async () => {
      if(!selectedMajors.c1 || !selectedMajors.c2) return alert("Pilih 2 Jurusan!");
      await fetch(`${apiUrl}/users/select-major`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ username: user.username, choice1_id: parseInt(selectedMajors.c1), choice2_id: parseInt(selectedMajors.c2) })
      });
      setShowMajorSelector(false); alert("Jurusan tersimpan!");
  };

  const fetchExam = async (examId) => {
      try {
          const res = await fetch(`${apiUrl}/exams/${examId}`);
          if(!res.ok) throw new Error();
          const data = await res.json();
          setActiveExamData(data);
          localStorage.setItem('active_exam_id', examId);
      } catch (err) {
          setActiveExamId(null);
          localStorage.removeItem('active_exam_id');
      }
  };

  const handleStartExam = (examId) => {
      if(showMajorSelector) return alert("Pilih jurusan dulu!");
      if (window.confirm("Mulai ujian sekarang?")) setActiveExamId(examId);
  };

  const handleReview = async (examId) => {
      const res = await fetch(`${apiUrl}/student/review/${examId}`);
      setReviewData(await res.json());
  };

  const handleSubmitExam = async (answers) => {
      try {
          const res = await fetch(`${apiUrl}/exams/${activeExamData.id}/submit`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user.username, answers })
          });
          if (!res.ok) throw new Error();
          alert("Jawaban tersimpan!");
          setActiveExamId(null);
          setActiveExamData(null);
          localStorage.removeItem('active_exam_id');
          fetchData(); 
      } catch (err) { alert("Gagal kirim jawaban. Coba lagi."); }
  };

  if (activeExamData) return <ExamSimulation examData={activeExamData} onSubmit={handleSubmitExam} />;

  // MODE PEMBAHASAN
  if (reviewData) return (
      <div className="min-h-screen bg-white p-8">
          <div className="max-w-4xl mx-auto">
              <button onClick={()=>setReviewData(null)} className="mb-4 px-4 py-2 bg-slate-100 rounded">Kembali</button>
              <h1 className="text-2xl font-bold mb-6">Pembahasan: {reviewData.title}</h1>
              {reviewData.questions.map((q, i) => (
                  <div key={i} className="mb-8 p-6 border rounded-xl bg-slate-50">
                      <div className="font-bold mb-2">Soal {i+1}</div>
                      <div className="mb-4" dangerouslySetInnerHTML={{__html: q.text}} />
                      <div className="text-sm font-bold text-green-600 mb-2">Jawaban Benar: {q.correct_answer}</div>
                      <div className="bg-white p-4 rounded border text-sm text-slate-600">
                          <strong>Pembahasan:</strong><br/>
                          {q.explanation || "Tidak ada pembahasan."}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  // POPUP JURUSAN
  if (showMajorSelector) {
      return (
          <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl">
                  <h2 className="text-2xl font-bold mb-4 text-center">Pilih Target Jurusan</h2>
                  <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">Pilihan 1</label><select className="w-full p-3 border rounded-xl bg-slate-50" onChange={e=>setSelectedMajors({...selectedMajors, c1:e.target.value})}><option value="">-- Pilih --</option>{majors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">Pilihan 2</label><select className="w-full p-3 border rounded-xl bg-slate-50" onChange={e=>setSelectedMajors({...selectedMajors, c2:e.target.value})}><option value="">-- Pilih --</option>{majors.map(m=><option key={m.id} value={m.id}>{m.university} - {m.name}</option>)}</select></div>
                      <button onClick={handleSaveMajors} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Simpan & Lanjutkan</button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">S</div>
            <div><h1 className="font-bold text-lg leading-tight">Halo, {user.username}</h1><p className="text-xs text-slate-500">{user.school || "Siswa Umum"}</p></div>
        </div>
        <button onClick={onLogout} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"><LogOut size={20}/></button>
      </nav>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border-2 ${stats.is_released ? (stats.status.includes('LULUS')?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200') : 'bg-white border-slate-200'}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status Kelulusan</h3>
                    <div className="text-2xl font-black">{stats.is_released ? stats.status : "MENUNGGU"}</div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Rata-rata Nilai IRT</h3>
                    <div className="flex items-end gap-2"><span className="text-4xl font-black text-indigo-600">{stats.is_released ? stats.average : "---"}</span><span className="text-sm text-slate-400 mb-1">/ 1000</span></div>
                </div>
            </div>
        )}

        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={24} className="text-indigo-600"/> Jadwal Ujian</h2>
            {periods.length === 0 ? <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">Belum ada ujian aktif.</div> : (
                periods.map(p => (
                    <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-800">{p.name}</h3><span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">UTBK SNBT</span></div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {p.exams.map(ex => (
                                <div key={ex.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 transition group relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold text-slate-400 mb-1">{ex.code}</div>
                                        <div className="font-bold text-slate-800 mb-3">{ex.title}</div>
                                        {ex.is_done ? (
                                            <div className="flex gap-2">
                                                <button disabled className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 cursor-default"><CheckCircle size={14}/> Selesai</button>
                                                {/* TOMBOL REVIEW PEMBAHASAN */}
                                                <button onClick={() => handleReview(ex.id)} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100" title="Lihat Pembahasan"><BookOpen size={14}/></button>
                                            </div>
                                        ) : ex.q_count === 0 ? (
                                            <button disabled className="w-full py-2 rounded-lg bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed">Belum Tersedia</button>
                                        ) : (
                                            <button onClick={() => handleStartExam(ex.id)} className="w-full py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group-hover:scale-105 transition"><PlayCircle size={14}/> Kerjakan</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;