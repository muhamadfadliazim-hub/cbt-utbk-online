import React, { useEffect, useState } from 'react';
import { BookOpen, Calculator, PenTool, BrainCircuit, ChevronRight, Loader2, Clock, FileText, LogOut, FileBarChart, Folder, CheckCircle } from 'lucide-react';
import { API_URL } from './config';

const Dashboard = ({ onSelectExam, userName, username, onLogout, onGoToRecap }) => {
  const [periods, setPeriods] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [expandedPeriod, setExpandedPeriod] = useState(null);

  useEffect(() => {
    // Kirim username agar backend bisa cek status is_done
    fetch(`${API_URL}/student/periods?username=${username}`)
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) setPeriods(data);
        else setPeriods([]); 
        setLoading(false); 
      })
      .catch(err => { setPeriods([]); setLoading(false); });
  }, [username]);

  const getIcon = (title) => {
    if (title.includes('Kuantitatif') || title.includes('Matematika')) return <Calculator className="text-blue-500" />;
    if (title.includes('Inggris') || title.includes('Indonesia')) return <BookOpen className="text-green-500" />;
    if (title.includes('Penalaran')) return <BrainCircuit className="text-purple-500" />;
    return <PenTool className="text-orange-500" />;
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600"><Loader2 className="animate-spin mr-2"/> Memuat Paket Tryout...</div>;

  const safePeriods = periods || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm p-6 mb-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-gray-800">Halo, {userName}! 👋</h1><p className="text-gray-500 text-sm mt-1">Pilih paket tryout yang tersedia.</p></div>
          <div className="flex items-center gap-3"><button onClick={onGoToRecap} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-sm"><FileBarChart size={16}/> Rekap Hasil</button><button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-bold"><LogOut size={16}/> Keluar</button></div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 pb-12">
        {safePeriods.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-xl shadow border border-gray-200"><Folder size={48} className="mx-auto text-gray-300 mb-4"/><h3 className="text-xl font-bold text-gray-600">Belum ada Tryout Aktif</h3><p className="text-gray-400 mt-2">Silakan tunggu informasi selanjutnya.</p></div>
        ) : (
            <div className="space-y-6">
                {safePeriods.map(period => (
                    <div key={period.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white cursor-pointer flex justify-between items-center hover:opacity-95 transition" onClick={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)}>
                            <h2 className="text-xl font-bold flex items-center gap-2"><Folder className="text-blue-200"/> {period.name}</h2>
                            <div className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">{expandedPeriod === period.id ? "Tutup" : "Buka Soal"}</div>
                        </div>
                        {expandedPeriod === period.id && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border-t border-gray-200">
                                {period.exams.map(exam => (
                                    <div key={exam.id} onClick={() => !exam.is_done && onSelectExam(exam.id)} className={`p-4 rounded-lg border transition flex items-center gap-4 group relative ${exam.is_done ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-75' : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-400 cursor-pointer'}`}>
                                        <div className={`p-3 rounded-lg transition-colors ${exam.is_done ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-blue-50'}`}>{exam.is_done ? <CheckCircle className="text-green-600"/> : getIcon(exam.title)}</div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${exam.is_done ? 'text-gray-500' : 'text-gray-800 group-hover:text-blue-700'}`}>{exam.title}</h4>
                                            <div className="text-xs text-gray-500 mt-1 flex gap-3"><span className="flex items-center gap-1"><Clock size={12}/> {exam.duration}m</span><span className="flex items-center gap-1"><FileText size={12}/> {exam.q_count} Soal</span></div>
                                        </div>
                                        {exam.is_done ? (<div className="ml-auto bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-200">SELESAI</div>) : (<ChevronRight className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" size={18}/>)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};
export default Dashboard;