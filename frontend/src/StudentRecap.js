import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Activity, Loader2, Lock, ChevronDown, ChevronUp, Trophy, Target } from 'lucide-react';
import { API_URL } from './config';

const StudentRecap = ({ username, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReport, setExpandedReport] = useState(null); 

  useEffect(() => {
    // PERBAIKAN: Menggunakan Backtick (`)
    fetch(`${API_URL}/student/recap/${username}`)
      .then(res => {
        if (!res.ok) {
            if (res.status === 404) throw new Error("Data nilai belum tersedia. Pastikan Anda sudah mengerjakan ujian.");
            throw new Error("Gagal mengambil data dari server.");
        }
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  // ... (Sisa kode tampilan sama persis seperti sebelumnya, tidak ada fetch lain)
  // Copy paste sisa kode dari jawaban sebelumnya (mulai dari if loading...)

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>;

  // --- CEK PENGUMUMAN DARI ADMIN ---
  if (data && !data.is_released) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg text-center border-t-8 border-indigo-600">
                <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-indigo-600" size={48} /></div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Pengumuman Belum Dibuka</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">Hasil seleksi sedang dalam proses rekapitulasi.<br/>Silakan cek kembali nanti.</p>
                <button onClick={onBack} className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-900 transition">Kembali</button>
            </div>
            <div className="mt-8 text-gray-400 text-xs">Dibuat oleh Muhamad Fadli Azim</div>
        </div>
      );
  }

  if (error) return <div className="p-10 text-center text-red-500">{error} <button onClick={onBack} className="block mt-4 mx-auto underline">Kembali</button></div>;
  if (!data) return null;

  const reports = data.reports || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-indigo-600 font-bold"><ArrowLeft size={20}/> Kembali ke Dashboard</button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Riwayat Hasil Tryout</h1>

        {/* INFO TARGET */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-3 md:w-1/3 border-r border-gray-100 pr-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Target size={24}/></div>
                <div>
                    <h3 className="font-bold text-gray-800">Target Siswa</h3>
                    <p className="text-xs text-gray-500">{data.full_name}</p>
                </div>
            </div>
            <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-[10px] px-2 py-1 rounded-bl-lg font-bold">PILIHAN 1</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{data.choice1_label}</div>
                <div className="text-xs text-gray-600">Passing Grade: <span className="font-bold text-blue-700">{data.choice1_pg}</span></div>
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] px-2 py-1 rounded-bl-lg font-bold">PILIHAN 2</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{data.choice2_label}</div>
                <div className="text-xs text-gray-500">Passing Grade: <span className="font-bold text-gray-700">{data.choice2_pg}</span></div>
            </div>
        </div>

        {/* LIST PERIODE */}
        <div className="space-y-4">
            {reports.length === 0 ? (
                <div className="text-center p-10 text-gray-400 border-2 border-dashed rounded-xl">Belum ada tryout yang dikerjakan.</div>
            ) : (
                reports.map((report) => {
                    const isLulus = report.status.startsWith("LULUS");
                    const isOpen = expandedReport === report.period_id;

                    return (
                        <div key={report.period_id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
                            <div 
                                className={`p-5 cursor-pointer flex justify-between items-center ${isLulus ? 'bg-gradient-to-r from-emerald-50 to-white' : 'bg-white'}`}
                                onClick={() => setExpandedReport(isOpen ? null : report.period_id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full flex-shrink-0 ${isLulus ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {isLulus ? <Trophy size={24}/> : <Activity size={24}/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{report.period_name}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                            <span className="text-gray-500">Skor Akhir: <strong className="text-indigo-600 text-base">{report.average}</strong></span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isLulus ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}>
                                                {isLulus ? "LULUS" : "TIDAK LULUS"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {isOpen ? <ChevronUp/> : <ChevronDown/>}
                                </div>
                            </div>

                            {isOpen && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50">
                                    {isLulus ? (
                                        <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg text-green-800 flex items-center gap-3 animate-pulse">
                                            <CheckCircle size={24}/>
                                            <div><div className="font-bold">Selamat! Anda Memenuhi Passing Grade.</div><div className="text-sm">Diterima di: <strong>{report.accepted_major}</strong></div></div>
                                        </div>
                                    ) : (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 flex items-center gap-3">
                                            <XCircle size={24}/>
                                            <div><div className="font-bold">Mohon Maaf, Nilai Belum Mencukupi.</div><div className="text-sm">Tetap semangat dan coba lagi di tryout berikutnya!</div></div>
                                        </div>
                                    )}
                                    <h4 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wide flex items-center gap-2"><Activity size={14}/> Rincian Nilai Subtes</h4>
                                    <div className="grid gap-2">
                                        {report.details.map(item => (
                                            <div key={item.code} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-600 w-12">{item.code}</span>
                                                    <div className="text-xs text-gray-400 flex gap-2 border-l pl-3">
                                                        <span className="flex items-center gap-1 text-green-600"><CheckCircle size={10}/> {item.correct}</span>
                                                        <span className="flex items-center gap-1 text-red-500"><XCircle size={10}/> {item.wrong}</span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-indigo-600 text-lg">{item.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
      </div>
      <footer className="mt-12 text-center text-gray-400 text-xs py-4 border-t border-gray-200">
        Dibuat oleh Muhamad Fadli Azim
      </footer>
    </div>
  );
};

export default StudentRecap;