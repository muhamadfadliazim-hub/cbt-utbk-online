import React, { useState, useEffect } from 'react';
import { FileText, Upload, Users, LogOut, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
  const [periods, setPeriods] = useState([]);
  const [newP, setNewP] = useState({ name: '', exam_type: 'UTBK' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPeriods(); }, []);
  const fetchPeriods = () => fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(setPeriods);

  const createPeriod = async () => {
    if(!newP.name) return;
    setLoading(true);
    await fetch(`${API_URL}/admin/periods`, {
       method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newP)
    });
    setLoading(false); fetchPeriods();
  };

  const handleUploadSoal = async (e, examId) => {
    if(!e.target.files[0]) return;
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    fd.append('exam_id', examId);
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/admin/upload/questions`, {method:'POST', body:fd});
        const d = await res.json();
        alert(d.message);
    } catch(e){ alert("Gagal Upload"); }
    setLoading(false);
  };

  const handleUploadUsers = async (e) => {
    const fd = new FormData(); fd.append('file', e.target.files[0]);
    await fetch(`${API_URL}/admin/upload/users`, {method:'POST', body:fd});
    alert("Peserta Berhasil Diupload!");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
            <h1 className="text-2xl font-black text-yellow-400 mb-10">CBT ADMIN</h1>
            <div className="space-y-4">
                <div className="font-bold text-slate-400 text-xs uppercase">Menu Utama</div>
                <button className="flex items-center gap-3 w-full p-3 bg-indigo-600 rounded-xl font-bold"><FileText size={18}/> Bank Soal</button>
                <label className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl cursor-pointer transition">
                    <Users size={18}/> Upload Peserta
                    <input type="file" className="hidden" onChange={handleUploadUsers} accept=".csv,.xlsx"/>
                </label>
            </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-400 font-bold"><LogOut size={18}/> Logout</button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <h2 className="font-bold text-lg mb-4">Buat Paket Ujian Baru</h2>
            <div className="flex gap-4">
                <input className="flex-1 p-3 border rounded-xl" placeholder="Nama Paket (Misal: TO Akbar 1)" value={newP.name} onChange={e=>setNewP({...newP, name:e.target.value})}/>
                <select className="p-3 border rounded-xl font-bold" value={newP.exam_type} onChange={e=>setNewP({...newP, exam_type:e.target.value})}>
                    <option value="UTBK">UTBK SNBT</option>
                    <option value="CPNS">CPNS / Kedinasan</option>
                    <option value="TKA_SMA">TKA Saintek</option>
                </select>
                <button onClick={createPeriod} disabled={loading} className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-black transition">
                    {loading ? <Loader2 className="animate-spin"/> : <Plus/>}
                </button>
            </div>
        </div>

        <div className="space-y-6">
            {periods.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-black text-slate-800">{p.name} <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded ml-2">{p.exam_type}</span></h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {p.exams.map(ex => (
                            <div key={ex.id} className="p-4 border rounded-xl bg-slate-50 hover:border-indigo-500 transition group">
                                <div className="font-bold text-slate-700 text-sm mb-2">{ex.title}</div>
                                <label className="block w-full bg-white border border-dashed border-slate-300 rounded-lg p-2 text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition">
                                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600">
                                        <Upload size={14}/> Upload Excel
                                    </div>
                                    <input type="file" className="hidden" accept=".csv,.xlsx" onChange={(e)=>handleUploadSoal(e, ex.id)}/>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};
export default AdminDashboard;