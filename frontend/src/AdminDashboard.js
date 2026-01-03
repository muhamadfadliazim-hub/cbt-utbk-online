import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, Video, Plus, LogOut, 
  Upload, Shield 
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('bank'); // bank | lms | users
  const [periods, setPeriods] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // FETCH DATA
  useEffect(() => {
    if(activeTab==='bank') fetch(`${API_URL}/periods`).then(r=>r.json()).then(setPeriods).catch(console.error);
    if(activeTab==='lms') fetch(`${API_URL}/lms/materials`).then(r=>r.json()).then(setMaterials).catch(console.error);
  }, [activeTab]);

  // HANDLERS
  const handleCreatePeriod = async () => {
    const name = prompt("Nama Paket Ujian Baru:");
    const type = prompt("Tipe (UTBK/CPNS/TOEFL):")?.toUpperCase();
    if(name && type) {
        setLoading(true);
        await fetch(`${API_URL}/admin/periods`, {
            method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, exam_type:type})
        });
        fetch(`${API_URL}/periods`).then(r=>r.json()).then(setPeriods);
        setLoading(false);
    }
  };

  const handleUploadSoal = async (e, examId) => {
    if(!e.target.files[0]) return;
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    fd.append('exam_id', examId);
    setLoading(true);
    await fetch(`${API_URL}/admin/upload/questions`, {method:'POST', body:fd});
    alert("Soal berhasil diupload!");
    setLoading(false);
  };

  const handleUploadMateri = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await fetch(`${API_URL}/admin/lms/upload`, {method:'POST', body:fd});
      alert("Materi tersimpan!");
      fetch(`${API_URL}/lms/materials`).then(r=>r.json()).then(setMaterials);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 text-white font-black text-xl tracking-tight">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Shield size={18}/></div>
                ADMIN PANEL
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={()=>setActiveTab('bank')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab==='bank'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50':'hover:bg-white/5 hover:text-white'}`}>
                <FileText size={20}/> Bank Soal
            </button>
            <button onClick={()=>setActiveTab('lms')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab==='lms'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50':'hover:bg-white/5 hover:text-white'}`}>
                <Video size={20}/> LMS & Materi
            </button>
            <button onClick={()=>setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab==='users'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50':'hover:bg-white/5 hover:text-white'}`}>
                <Users size={20}/> Data Peserta
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold transition">
                <LogOut size={18}/> Keluar
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8 lg:p-12">
        {activeTab === 'bank' && (
            <div className="max-w-5xl mx-auto animate-fade-in">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Bank Soal & Ujian</h1>
                        <p className="text-slate-500 mt-1">Kelola paket ujian dan upload soal Excel di sini.</p>
                    </div>
                    <button onClick={handleCreatePeriod} disabled={loading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-xl flex items-center gap-2">
                        <Plus size={20}/> Buat Paket Baru
                    </button>
                </div>

                <div className="grid gap-6">
                    {periods.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${p.exam_type==='UTBK'?'bg-blue-100 text-blue-600':'bg-orange-100 text-orange-600'}`}>
                                    {p.exam_type[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{p.exam_type}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {p.exams.map(ex => (
                                    <div key={ex.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-indigo-300 transition group">
                                        <div className="font-bold text-sm text-slate-700 mb-2 truncate">{ex.title}</div>
                                        <label className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition">
                                            <Upload size={14}/> Upload Excel
                                            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={(e)=>handleUploadSoal(e, ex.id)}/>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'lms' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Manajemen Materi (LMS)</h1>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus className="text-indigo-600"/> Upload Materi Baru</h3>
                    <form onSubmit={handleUploadMateri} className="grid grid-cols-2 gap-4">
                        <input name="title" required placeholder="Judul Materi (Misal: Trik Cepat PU)" className="col-span-2 p-3 border rounded-xl font-medium outline-none focus:border-indigo-500"/>
                        <select name="category" className="p-3 border rounded-xl font-bold bg-slate-50"><option>UTBK</option><option>CPNS</option></select>
                        <select name="content_type" className="p-3 border rounded-xl font-bold bg-slate-50"><option>VIDEO</option><option>PDF</option></select>
                        <input name="url" required placeholder="Link Materi (YouTube / GDrive)" className="col-span-2 p-3 border rounded-xl font-medium outline-none focus:border-indigo-500"/>
                        <button className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Simpan Materi</button>
                    </form>
                </div>

                <div className="space-y-4">
                    {materials.map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Video size={20}/></div>
                                <div>
                                    <div className="font-bold text-slate-800">{m.title}</div>
                                    <div className="text-xs text-slate-500 uppercase">{m.category} • {m.content_type}</div>
                                </div>
                            </div>
                            <a href={m.content_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-sm hover:underline">Lihat</a>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;