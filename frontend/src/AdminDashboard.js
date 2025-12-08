import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Search, X, Filter, Clock, RefreshCcw } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  
  const [previewData, setPreviewData] = useState(null); 
  const [showPreview, setShowPreview] = useState(false);

  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [isReleased, setIsReleased] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedRecapPeriod, setSelectedRecapPeriod] = useState('');

  // --- API CALLS ---
  const fetchPeriods = () => {
    fetch(`${API_URL}/admin/periods`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPeriods(data); else setPeriods([]); })
      .catch(() => setPeriods([]));
  };

  const fetchUsers = () => {
    fetch(`${API_URL}/admin/users`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) { setUsers(data); setSelectedIds([]); } else setUsers([]); })
        .catch(() => setUsers([]));
  };
  
  const fetchRecap = () => {
      const url = selectedRecapPeriod 
        ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}`
        : `${API_URL}/admin/recap`;
      fetch(url)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setRecap(data); else setRecap([]); })
        .catch(() => setRecap([]));
  };
  
  const fetchReleaseStatus = () => fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.is_released));

  useEffect(() => {
    if (tab === 'periods') fetchPeriods();
    if (tab === 'users') fetchUsers();
    if (tab === 'recap') { fetchPeriods(); fetchRecap(); fetchReleaseStatus(); }
    // eslint-disable-next-line
  }, [tab]);

  useEffect(() => {
      if (tab === 'recap') fetchRecap();
      // eslint-disable-next-line
  }, [selectedRecapPeriod]);

  // --- ACTIONS ---
  const handleCreatePeriod = (e) => { 
      e.preventDefault(); 
      fetch(`${API_URL}/admin/periods`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newPeriodName})})
      .then(r=>r.json()).then(d=>{alert(d.message); setNewPeriodName(''); fetchPeriods();}); 
  };

  const togglePeriodActive = (id, s) => fetch(`${API_URL}/admin/periods/${id}/toggle`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!s})}).then(()=>fetchPeriods());
  
  // ACTION BARU: Toggle Tombol Submit
  const togglePeriodSubmit = (id, currentStatus) => {
      fetch(`${API_URL}/admin/periods/${id}/toggle-submit`, {
          method: 'POST', 
          headers:{'Content-Type':'application/json'}, 
          body:JSON.stringify({is_active: !currentStatus}) // Kita reuse schema toggle
      }).then(() => fetchPeriods());
  };

  const handleDeletePeriod = (id) => { 
      if(window.confirm("Hapus Periode?")) fetch(`${API_URL}/admin/periods/${id}`, {method:'DELETE'}).then(()=>fetchPeriods()); 
  };
  
  const handleUploadQuestion = (eid, f) => { 
      const d=new FormData(); d.append('file',f); 
      fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d})
      .then(r=>r.json()).then(d=>{ alert(d.message); fetchPeriods(); }); 
  };
  
  const handleDownloadTemplate = () => window.open(`${API_URL}/admin/download-template`, '_blank');

  const handlePreviewExam = (examId) => {
      fetch(`${API_URL}/admin/exams/${examId}/preview`)
        .then(res => { if(!res.ok) throw new Error("Gagal"); return res.json(); })
        .then(data => { setPreviewData(data); setShowPreview(true); })
        .catch(err => alert("Belum ada soal."));
  };

  const handleSelectAll = (e) => setSelectedIds(e.target.checked ? users.map(u=>u.id) : []);
  const handleSelectOne = (id) => setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i=>i!==id) : [...selectedIds, id]);
  
  const handleBulkDelete = () => { 
      if(selectedIds.length>0 && window.confirm("Hapus?")) 
      fetch(`${API_URL}/admin/users/delete-bulk`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_ids:selectedIds})})
      .then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}); 
  };

  const handleAddUser = (e) => { 
      e.preventDefault(); 
      fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)})
      .then(r=>{if(!r.ok) throw new Error("Gagal"); return r.json()}).then(()=>{alert("Sukses"); fetchUsers(); setNewUser({username:'',password:'',full_name:'', role:'student'})}).catch(e=>alert(e.message)); 
  };
  
  const handleBulkUpload = (e) => { 
      const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); 
      fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d})
      .then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}) 
  };
  
  const toggleRelease = () => { 
      const n=!isReleased; 
      if(window.confirm(n?"Buka Pengumuman?":"Tutup Pengumuman?")) 
      fetch(`${API_URL}/config/release`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({value:n?"true":"false"})})
      .then(r=>r.json()).then(d=>{setIsReleased(d.is_released); alert(d.message)}); 
  };
  
  const handleDownloadExcel = () => {
      const url = selectedRecapPeriod 
        ? `${API_URL}/admin/recap/download?period_id=${selectedRecapPeriod}`
        : `${API_URL}/admin/recap/download`;
      window.open(url, '_blank');
  };

  // ACTION BARU: RESET NILAI SISWA
  const handleResetResult = (userId, examId) => {
      if(window.confirm("Yakin reset nilai siswa ini? Siswa harus mengerjakan ulang.")) {
          fetch(`${API_URL}/admin/reset-result`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ user_id: userId, exam_id: examId })
          })
          .then(r => r.json())
          .then(d => { alert(d.message); fetchRecap(); })
          .catch(() => alert("Gagal reset."));
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800">
      <aside className="w-64 bg-indigo-900 text-white p-6 flex flex-col"><h1 className="text-2xl font-bold mb-8">Admin Panel</h1><nav className="space-y-4 flex-1"><button onClick={()=>setTab('periods')} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='periods'?'bg-indigo-700':''}`}><FileText size={18}/> Manajemen Soal</button><button onClick={()=>setTab('users')} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='users'?'bg-indigo-700':''}`}><Users size={18}/> User & Siswa</button><button onClick={()=>setTab('recap')} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='recap'?'bg-indigo-700':''}`}><FileText size={18}/> Rekap Nilai</button></nav><button onClick={onLogout} className="flex items-center gap-3 p-3 rounded hover:bg-red-600 bg-indigo-800 mt-auto"><LogOut size={18}/> Keluar</button></aside>
      
      <main className="flex-1 p-8 overflow-y-auto relative">
        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><div><h3 className="text-xl font-bold text-gray-800">Preview: {previewData.title}</h3><p className="text-sm text-gray-500">Total: {previewData.questions.length} Soal</p></div><button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-200 rounded-full"><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {(!previewData.questions || previewData.questions.length === 0) ? (<div className="text-center text-gray-400 py-10">Belum ada soal.</div>) : (previewData.questions.map((q, idx) => (<div key={q.id} className="border p-4 rounded-lg bg-gray-50 relative"><div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">Bobot: {q.difficulty}</div><div className="mb-4"><span className="font-bold text-indigo-600 mr-2">No. {idx + 1}</span><div className="text-gray-800 mt-1">{q.reading_material && <div className="p-3 bg-white border mb-2 text-sm italic whitespace-pre-wrap">{q.reading_material}</div>}{q.image_url && <img src={q.image_url} alt="soal" className="max-h-48 mb-2 rounded border"/>}{q.text.split(/(\$.*?\$)/).map((part, i) => part.startsWith('$') && part.endsWith('$') ? <InlineMath key={i} math={part.slice(1, -1)}/> : <span key={i}>{part}</span>)}</div></div><div className="space-y-2 pl-4">{q.type === 'short_answer' ? (<div className="p-2 bg-green-100 border border-green-300 rounded text-green-800 font-mono text-sm"><strong>Kunci Jawaban:</strong> {q.options[0]?.label}</div>) : (q.options.map(opt => (<div key={opt.id} className={`p-2 rounded text-sm border flex items-center gap-2 ${opt.is_correct ? 'bg-green-100 border-green-300 ring-1 ring-green-500' : 'bg-white border-gray-300'}`}><span className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${opt.is_correct ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{opt.id}</span><span className={opt.is_correct ? 'font-bold text-green-900' : 'text-gray-700'}>{opt.label}</span>{opt.is_correct && <CheckCircle size={14} className="text-green-600 ml-auto"/>}</div>)))}</div></div>)))}
                    </div>
                    <div className="p-4 border-t bg-gray-50 rounded-b-xl text-right"><button onClick={() => setShowPreview(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">Tutup</button></div>
                </div>
            </div>
        )}

        {tab === 'periods' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Paket UTBK</h2>
                <div className="flex justify-end mb-4"><button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700"><Download size={18}/> Download Template Soal</button></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 flex gap-4 items-end"><div className="flex-1"><label className="block text-sm font-bold text-gray-600 mb-1">Nama Periode Baru</label><input className="w-full p-2 border rounded" placeholder="Contoh: Tryout Akbar Batch 1" value={newPeriodName} onChange={(e)=>setNewPeriodName(e.target.value)}/></div><button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 h-10">+ Buat Periode</button></div>
                
                <div className="space-y-6">
                    {Array.isArray(periods) && periods.map(period => (
                        <div key={period.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                            <div className="p-5 bg-gray-50 flex items-center justify-between border-b">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)} className="text-gray-500 hover:text-indigo-600">{expandedPeriod === period.id ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}</button>
                                    <div><h3 className="font-bold text-xl text-gray-800">{period.name}</h3><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${period.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{period.is_active ? "PUBLIK" : "DRAFT"}</span></div></div>
                                </div>
                                <div className="flex gap-3">
                                    {/* TOMBOL TOGGLE SUBMIT */}
                                    <button onClick={() => togglePeriodSubmit(period.id, period.allow_submit)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow transition ${period.allow_submit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'}`}>{period.allow_submit ? <><Unlock size={16}/> Submit: ON</> : <><Lock size={16}/> Submit: OFF</>}</button>

                                    <button onClick={() => togglePeriodActive(period.id, period.is_active)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow transition ${period.is_active ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>{period.is_active ? <><EyeOff size={16}/> Sembunyikan</> : <><Eye size={16}/> Tampilkan</>}</button>
                                    <button onClick={() => handleDeletePeriod(period.id)} className="bg-red-50 text-red-600 p-2.5 rounded-lg hover:bg-red-100 border border-red-200"><Trash2 size={18}/></button>
                                </div>
                            </div>
                            {expandedPeriod === period.id && (
                                <div className="p-6 bg-white"><h4 className="font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><FileText size={18}/> Daftar Subtes UTBK</h4><div className="grid gap-3">{period.exams.map(exam => (<div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-indigo-50/30 transition"><div className="flex-1"><div className="font-bold text-gray-900 text-lg">{exam.title}</div><div className="text-sm text-gray-500 flex gap-4 mt-1"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">Kode: {exam.code}</span><span className="flex items-center gap-1"><Clock size={14} className="inline"/> {exam.duration} Menit</span>{exam.questions && exam.questions.length > 0 ? <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> {exam.questions.length} Soal</span> : <span className="text-red-500 font-bold flex items-center gap-1"><XCircle size={14}/> 0 Soal</span>}</div></div><div className="flex items-center gap-2"><button onClick={() => handlePreviewExam(exam.id)} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 transition font-bold text-sm flex items-center gap-1"><Search size={14}/> Lihat</button><label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow flex items-center gap-2 transition"><Upload size={16}/> Upload<input type="file" accept=".xlsx" className="hidden" onChange={(e) => { if(e.target.files[0]) handleUploadQuestion(exam.id, e.target.files[0]); }}/></label></div></div>))}</div></div>
                            )}
                        </div>
                    ))}
                    {(!Array.isArray(periods) || periods.length === 0) && <div className="text-center p-8 bg-white border rounded text-gray-400">Belum ada periode.</div>}
                </div>
            </div>
        )}
        
        {/* USERS TAB TETAP SAMA */}
        {tab === 'users' && (<div><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Manajemen User</h2>{selectedIds.length > 0 && <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16}/> Hapus {selectedIds.length}</button>}</div><div className="bg-white p-5 rounded-lg shadow mb-6 flex gap-3 flex-wrap"><input placeholder="Username" className="border p-2 rounded flex-1" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input placeholder="Nama Lengkap" className="border p-2 rounded flex-1" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input placeholder="Password" type="password" className="border p-2 rounded flex-1" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><select className="border p-2 rounded bg-gray-50" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}><option value="student">Siswa</option><option value="admin">Admin</option></select><button onClick={handleAddUser} className="bg-green-600 text-white px-4 py-2 rounded font-bold"><Plus size={16}/></button><div className="w-full h-px bg-gray-200 my-2"></div><label className="text-blue-600 cursor-pointer text-sm flex items-center gap-2 hover:underline"><Upload size={14}/> Upload Excel User (.xlsx)<input type="file" className="hidden" accept=".xlsx" onChange={handleBulkUpload}/></label></div><div className="bg-white shadow rounded overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedIds.length === users.length}/></th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Role</th></tr></thead><tbody>{Array.isArray(users) && users.map(u => (<tr key={u.id} className="border-b hover:bg-gray-50"><td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => handleSelectOne(u.id)}/></td><td className="p-3">{u.full_name}</td><td className="p-3 font-mono">{u.username}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-green-100 text-green-700'}`}>{u.role.toUpperCase()}</span></td></tr>))}</tbody></table></div></div>)}
        
        {/* RECAP TAB DENGAN TOMBOL RESET */}
        {tab === 'recap' && (
            <div className="overflow-x-auto pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div className="flex-1"><h2 className="text-2xl font-bold mb-1 text-gray-800">Rekapitulasi Nilai</h2><div className="flex items-center gap-2 mt-2"><Filter size={16} className="text-gray-500"/><span className="text-sm font-bold text-gray-600">Filter Paket:</span><select className="p-2 border border-gray-300 rounded-lg bg-white text-sm shadow-sm min-w-[250px] focus:ring-2 focus:ring-indigo-500 outline-none" value={selectedRecapPeriod} onChange={(e) => setSelectedRecapPeriod(e.target.value)}><option value="">-- Tampilkan Semua Periode --</option>{Array.isArray(periods) && periods.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div></div>
                    <div className="flex gap-3"><button onClick={handleDownloadExcel} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition"><Download size={18}/> Download Excel</button><button onClick={toggleRelease} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition ${isReleased ? 'bg-orange-500' : 'bg-green-600'}`}>{isReleased ? <><Unlock size={18}/> Tutup Pengumuman</> : <><Lock size={18}/> Rilis Pengumuman</>}</button></div>
                </div>
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full text-sm text-left border-collapse">
                        <thead className="bg-indigo-900 text-white"><tr><th className="p-4 border-r border-indigo-800 w-64" rowSpan="2">Nama Siswa</th><th className="p-2 text-center border-b border-indigo-800 bg-indigo-800" colSpan="7">Skor 7 Subtes (IRT)</th><th className="p-4 text-center border-l border-indigo-800 bg-blue-900 w-24" rowSpan="2">Skor Akhir</th><th className="p-4 border-l border-indigo-800 bg-indigo-800" rowSpan="2">Keterangan</th><th className="p-4 border-l border-indigo-800 w-24 bg-red-900" rowSpan="2">Reset</th></tr><tr>{["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"].map(sub => (<th key={sub} className="p-2 text-center border-r border-indigo-700 bg-indigo-700 text-xs font-bold w-16">{sub}</th>))}</tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.isArray(recap) && recap.map((r, i) => (
                                <tr key={i} className={`hover:bg-gray-50 transition-colors ${r.status.startsWith('LULUS') ? 'bg-green-50/30' : ''}`}>
                                    <td className="p-4 border-r border-gray-100"><div className="font-bold text-gray-800">{r.full_name}</div><div className="text-xs text-gray-400 font-mono mt-0.5">{r.username}</div></td>
                                    <td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.PU}</td><td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.PPU}</td><td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.PBM}</td><td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.PK}</td><td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.LBI}</td><td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.LBE}</td><td className="p-2 text-center border-r border-gray-100 text-gray-600">{r.PM}</td>
                                    <td className="p-4 text-center border-l border-gray-100 font-extrabold text-blue-700 text-lg bg-blue-50/50">{r.average}</td>
                                    <td className="p-4 border-l border-gray-100 align-middle">{r.status.startsWith('LULUS') ? (<div><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-green-100 text-green-700 mb-1"><CheckCircle size={12}/> LULUS</span></div>) : (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-600"><XCircle size={12}/> TIDAK LULUS</span>)}</td>
                                    {/* KOLOM RESET */}
                                    <td className="p-4 border-l border-gray-100 text-center">
                                        <div className="relative group">
                                            <button className="text-gray-400 hover:text-red-600 transition"><RefreshCcw size={16}/></button>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border shadow-lg rounded-lg z-10 hidden group-hover:block p-1">
                                                <div className="text-xs font-bold text-gray-500 px-3 py-2 border-b">Pilih Subtes utk Reset:</div>
                                                {r.completed_exams && r.completed_exams.map(exam => (
                                                    <button key={exam.exam_id} onClick={() => handleResetResult(r.id, exam.exam_id)} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex justify-between">
                                                        <span>{exam.code}</span> <Trash2 size={12}/>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!Array.isArray(recap) || recap.length === 0) && <tr><td colSpan="12" className="p-8 text-center text-gray-400 italic">Belum ada data nilai.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;