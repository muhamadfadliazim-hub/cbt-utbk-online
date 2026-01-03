import React, { useState, useEffect } from 'react';
import { Layout, FileText, Upload, Users, Video, Plus, Trash2, LogOut } from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('bank'); // bank | lms | users
  const [periods, setPeriods] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  useEffect(() => {
    if(tab==='bank') fetch(`${API_URL}/periods`).then(r=>r.json()).then(setPeriods);
    if(tab==='lms') fetch(`${API_URL}/lms/materials`).then(r=>r.json()).then(setMaterials);
  }, [tab]);

  // UPLOAD SOAL EXCEL
  const handleUploadSoal = async (e, examId) => {
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    fd.append('exam_id', examId);
    await fetch(`${API_URL}/admin/upload/questions`, {method:'POST', body:fd});
    alert("Soal Berhasil Diupload!");
  };

  // BUAT PAKET BARU
  const handleCreatePeriod = async () => {
    const name = prompt("Nama Paket (misal: TO UTBK 1):");
    const type = prompt("Tipe (UTBK/CPNS/TOEFL):").toUpperCase();
    if(name && type) {
        await fetch(`${API_URL}/admin/periods`, {
            method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, exam_type:type})
        });
        window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
            <h1 className="text-2xl font-black text-yellow-400 mb-8 tracking-tighter">CBT PRO ADMIN</h1>
            <nav className="space-y-2">
                <button onClick={()=>setTab('bank')} className={`w-full text-left p-3 rounded ${tab==='bank'?'bg-indigo-600':''}`}><FileText className="inline mr-2"/> Bank Soal</button>
                <button onClick={()=>setTab('lms')} className={`w-full text-left p-3 rounded ${tab==='lms'?'bg-indigo-600':''}`}><Video className="inline mr-2"/> LMS & Materi</button>
                <button onClick={()=>setTab('users')} className={`w-full text-left p-3 rounded ${tab==='users'?'bg-indigo-600':''}`}><Users className="inline mr-2"/> Peserta</button>
            </nav>
        </div>
        <button onClick={onLogout} className="text-red-400"><LogOut className="inline mr-2"/> Logout</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {tab === 'bank' && (
            <div>
                <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">Manajemen Ujian</h2>
                    <button onClick={handleCreatePeriod} className="bg-slate-900 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> Buat Paket</button>
                </div>
                {periods.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-xl shadow mb-4 border">
                        <h3 className="text-lg font-bold mb-3">{p.name} <span className="bg-blue-100 text-blue-600 px-2 text-xs rounded">{p.exam_type}</span></h3>
                        <div className="grid grid-cols-3 gap-3">
                            {p.exams.map(ex => (
                                <div key={ex.id} className="p-3 border rounded bg-slate-50">
                                    <div className="text-sm font-bold mb-2">{ex.title}</div>
                                    <label className="block w-full text-center border-dashed border-2 border-slate-300 p-2 cursor-pointer hover:bg-white transition text-xs font-bold text-slate-500">
                                        Upload Excel
                                        <input type="file" className="hidden" onChange={(e)=>handleUploadSoal(e, ex.id)} />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {tab === 'lms' && (
            <div>
                <h2 className="text-2xl font-bold mb-6">Learning Management System</h2>
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h3 className="font-bold mb-4">Upload Materi Baru</h3>
                    <form className="grid grid-cols-2 gap-4" onSubmit={(e)=>{
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        fetch(`${API_URL}/admin/lms/upload`, {method:'POST', body:fd}).then(()=>alert("Materi Uploaded!"));
                    }}>
                        <input name="title" placeholder="Judul Materi" className="border p-2 rounded"/>
                        <select name="category" className="border p-2 rounded"><option>UTBK</option><option>CPNS</option></select>
                        <select name="content_type" className="border p-2 rounded"><option>VIDEO</option><option>PDF</option></select>
                        <input name="url" placeholder="Link YouTube / Google Drive" className="border p-2 rounded"/>
                        <button className="bg-indigo-600 text-white p-2 rounded font-bold col-span-2">Upload Materi</button>
                    </form>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {materials.map(m => (
                        <div key={m.id} className="bg-white p-4 rounded shadow border">
                            <Video className="mb-2 text-indigo-600"/>
                            <div className="font-bold">{m.title}</div>
                            <div className="text-xs text-slate-500">{m.category} • {m.content_type}</div>
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