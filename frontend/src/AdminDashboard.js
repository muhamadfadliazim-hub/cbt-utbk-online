import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Clock, Search, X, Filter, LayoutDashboard, BarChart3, Edit3, Save, FileText, School, Target, Settings, RefreshCcw, Eye, EyeOff, Lock, Unlock, RotateCcw } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  
  const [targetSchools, setTargetSchools] = useState(''); 
  const [availableSchools, setAvailableSchools] = useState([]);
  const [examMode, setExamMode] = useState('standard');

  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewData, setPreviewData] = useState(null); 
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({ name: '', city: '', signer_name: '', signer_jabatan: '', signer_nip: '' });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({ text: '', explanation: '', key: '', reading: '', label1:'', label2:'' });
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [isReleased, setIsReleased] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student', school: '' });
  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedRecapPeriod, setSelectedRecapPeriod] = useState('');

  // API Calls
  const fetchPeriods = useCallback(() => fetch(`${apiUrl}/admin/periods`).then(r=>r.json()).then(setPeriods), [apiUrl]);
  const fetchUsers = useCallback(() => fetch(`${apiUrl}/admin/users`).then(r=>r.json()).then(d=>{setUsers(d); setSelectedIds([])}), [apiUrl]);
  const fetchRecap = useCallback(() => fetch(selectedRecapPeriod ? `${apiUrl}/admin/recap?period_id=${selectedRecapPeriod}` : `${apiUrl}/admin/recap`).then(r=>r.json()).then(setRecap).catch(console.error), [apiUrl, selectedRecapPeriod]);
  const fetchReleaseStatus = useCallback(() => fetch(`${apiUrl}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.is_released)), [apiUrl]);
  const fetchConfig = useCallback(() => fetch(`${apiUrl}/admin/config/institute`).then(r=>r.json()).then(data => setConfig({
      name: data.institute_name || '', city: data.institute_city || '', 
      signer_name: data.signer_name || '', signer_jabatan: data.signer_jabatan || '', signer_nip: data.signer_nip || ''
  })), [apiUrl]);
  const fetchSchools = useCallback(() => fetch(`${apiUrl}/admin/schools-list`).then(r=>r.json()).then(setAvailableSchools), [apiUrl]);

  useEffect(() => {
    if (tab === 'periods') { fetchPeriods(); fetchSchools(); }
    if (tab === 'users') fetchUsers();
    if (tab === 'recap') { fetchPeriods(); fetchRecap(); fetchReleaseStatus(); fetchConfig(); }
  }, [tab, fetchPeriods, fetchUsers, fetchRecap, fetchReleaseStatus, fetchConfig, fetchSchools]);

  // Helpers & Handlers
  const handleSelectAll = (e) => setSelectedIds(e.target.checked ? users.map(u=>u.id) : []);
  const handleSelectOne = (id) => setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i=>i!==id) : [...selectedIds, id]);
  
  const downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal download");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = downloadUrl; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(downloadUrl);
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleCreatePeriod = (e) => { 
      e.preventDefault(); 
      fetch(`${apiUrl}/admin/periods`, {
          method:'POST', headers:{'Content-Type':'application/json'}, 
          body:JSON.stringify({name:newPeriodName, target_schools: targetSchools, mode: examMode})
      }).then(r=>r.json()).then(()=>{ setNewPeriodName(''); setTargetSchools(''); setExamMode('standard'); fetchPeriods(); }); 
  };
  
  const handleResetExam = (examId) => {
      if(window.confirm("Yakin ingin MENGHAPUS SEMUA SOAL pada ujian ini?")) {
          fetch(`${apiUrl}/admin/exams/${examId}/reset`, {method:'DELETE'}).then(r=>r.json()).then(d=>{ alert(d.message); fetchPeriods(); });
      }
  };

  const handleResetStudentResult = (userId) => {
      if(!selectedRecapPeriod) { alert("Pilih Periode Ujian terlebih dahulu di dropdown atas!"); return; }
      if(window.confirm("RESET nilai siswa ini? Siswa bisa ujian ulang dari awal.")) {
          fetch(`${apiUrl}/admin/results/reset?user_id=${userId}&period_id=${selectedRecapPeriod}`, {method:'DELETE'})
          .then(r=>r.json())
          .then(d=>{ alert(d.message); fetchRecap(); });
      }
  };

  const handleSaveEdit = async () => {
    if(!editingQuestion) return;
    const res = await fetch(`${apiUrl}/admin/questions/${editingQuestion.id}`, { 
        method:'PUT', headers:{'Content-Type':'application/json'}, 
        body:JSON.stringify({ text: editForm.text, explanation: editForm.explanation, reading_material: editForm.reading, key: editForm.key, label1: editForm.label1, label2: editForm.label2 }) 
    });
    if(res.ok) { alert("Tersimpan!"); setEditingQuestion(null); handlePreviewExam(previewData.id); } 
  };
  const handleSaveConfig = async () => { await fetch(`${apiUrl}/admin/config/institute`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(config) }); alert("Disimpan!"); setShowConfig(false); };
  const togglePeriodActive = (id, s) => fetch(`${apiUrl}/admin/periods/${id}/toggle`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!s})}).then(()=>fetchPeriods());
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) fetch(`${apiUrl}/admin/periods/${id}`, {method:'DELETE'}).then(()=>fetchPeriods()); };
  const handleUploadQuestion = (eid, f) => { const d=new FormData(); d.append('file',f); fetch(`${apiUrl}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{ alert(d.message); fetchPeriods(); }); };
  const handleBulkDelete = () => { if(window.confirm("Hapus terpilih?")) fetch(`${apiUrl}/admin/users/delete-bulk`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_ids:selectedIds})}).then(r=>r.json()).then(()=>{fetchUsers();}); };
  const handleAddUser = () => { fetch(`${apiUrl}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(r=>r.json()).then(()=>{alert("Sukses"); fetchUsers();}); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${apiUrl}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}) };
  const toggleRelease = () => { const n=!isReleased; if(window.confirm(n?"Buka?":"Tutup?")) fetch(`${apiUrl}/config/release`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({value:n?"true":"false"})}).then(r=>r.json()).then(d=>setIsReleased(d.is_released)); };
  
  const handlePreviewExam = (examId) => fetch(`${apiUrl}/admin/exams/${examId}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true)});
  const handleEditClick = (q) => { setEditForm({ text: q.text, explanation: q.explanation||'', reading: q.reading_material||'', key: q.options.find(o => o.is_correct)?.id || 'A', label1: q.label1||'Benar', label2: q.label2||'Salah' }); setEditingQuestion(q); };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-800">
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-20 shrink-0">
          <div className="p-8 border-b border-gray-800"><h1 className="text-2xl font-extrabold">Admin<span className="text-indigo-500">Panel</span></h1></div>
          <nav className="flex-1 p-4 space-y-2">
            <button onClick={()=>setTab('periods')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${tab==='periods'?'bg-indigo-600':'hover:bg-gray-800'}`}><LayoutDashboard size={20}/> Soal & Jadwal</button>
            <button onClick={()=>setTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${tab==='users'?'bg-indigo-600':'hover:bg-gray-800'}`}><Users size={20}/> User & Siswa</button>
            <button onClick={()=>setTab('recap')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${tab==='recap'?'bg-indigo-600':'hover:bg-gray-800'}`}><BarChart3 size={20}/> Rekap Nilai</button>
          </nav>
          <div className="p-4 border-t border-gray-800"><button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 font-bold"><LogOut size={20}/> Keluar</button></div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto relative bg-slate-50">
        {/* MODALS */}
        {showConfig && (<div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"><h3 className="text-xl font-bold mb-4">Pengaturan Kop</h3><div className="space-y-3"><div><label className="text-xs font-bold text-gray-500">Nama Sekolah</label><input className="w-full p-2 border rounded" value={config.name} onChange={e=>setConfig({...config, name:e.target.value})}/></div><div><label className="text-xs font-bold text-gray-500">Kota</label><input className="w-full p-2 border rounded" value={config.city} onChange={e=>setConfig({...config, city:e.target.value})}/></div><hr/><div><label className="text-xs font-bold text-gray-500">Penanda Tangan</label><input className="w-full p-2 border rounded" value={config.signer_name} onChange={e=>setConfig({...config, signer_name:e.target.value})}/></div><div><label className="text-xs font-bold text-gray-500">Jabatan</label><input className="w-full p-2 border rounded" value={config.signer_jabatan} onChange={e=>setConfig({...config, signer_jabatan:e.target.value})}/></div><div><label className="text-xs font-bold text-gray-500">NIP</label><input className="w-full p-2 border rounded" value={config.signer_nip} onChange={e=>setConfig({...config, signer_nip:e.target.value})}/></div></div><div className="flex justify-end gap-3 mt-6"><button onClick={()=>setShowConfig(false)} className="px-4 py-2 font-bold text-gray-500">Batal</button><button onClick={handleSaveConfig} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded">Simpan</button></div></div></div>)}
        {showPreview && previewData && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"><div className="p-5 border-b flex justify-between items-center bg-gray-50"><div><h3 className="text-xl font-bold">{previewData.title}</h3><p className="text-sm text-gray-500">{previewData.questions.length} Soal</p></div><button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-200 rounded-full"><X/></button></div><div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">{previewData.questions.map((q, idx) => (<div key={q.id} className="bg-white border p-6 rounded-2xl shadow-sm relative group"><div className="absolute top-4 right-4 flex gap-2"><div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 border shadow-sm"><div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Benar: {q.stats?.correct || 0}</div><div className="w-px h-4 bg-gray-300"></div><div className="flex items-center gap-1"><XCircle size={14} className="text-red-500"/> Salah: {(q.stats?.total||0)-(q.stats?.correct||0)}</div></div><button onClick={() => handleEditClick(q)} className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><Edit3 size={12}/> Edit</button></div><div className="flex gap-4 mb-4"><div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center rounded-lg font-bold shrink-0">{idx + 1}</div><div className="flex-1">{q.reading_material && <div className="p-4 bg-gray-50 border-l-4 border-indigo-500 mb-4 rounded text-sm font-serif">{q.reading_material}</div>}{q.image_url && <img src={q.image_url} alt="soal" className="max-h-52 mb-4 rounded border"/>}<div className="text-lg font-medium">{q.text.split(/(\$.*?\$)/).map((p,i)=>p.startsWith('$')?<InlineMath key={i} math={p.slice(1,-1)}/>:<span key={i}>{p}</span>)}</div>{q.explanation && <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm border border-blue-200"><strong>Pembahasan:</strong> {q.explanation}</div>}</div></div></div>))}</div></div></div>)}
        {editingQuestion && (<div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"><h3 className="text-lg font-bold mb-4">Edit Soal</h3><div className="space-y-4"><textarea className="w-full p-3 border rounded-xl text-sm" rows={2} value={editForm.reading} onChange={e=>setEditForm({...editForm, reading:e.target.value})} placeholder="Wacana..."/><textarea className="w-full p-3 border rounded-xl font-medium" rows={3} value={editForm.text} onChange={e=>setEditForm({...editForm, text:e.target.value})}/>{editingQuestion.type === 'table_boolean' && (<div className="grid grid-cols-2 gap-4"><input className="p-2 border rounded" placeholder="Label 1" value={editForm.label1} onChange={e=>setEditForm({...editForm, label1:e.target.value})}/><input className="p-2 border rounded" placeholder="Label 2" value={editForm.label2} onChange={e=>setEditForm({...editForm, label2:e.target.value})}/></div>)}<textarea className="w-full p-3 border rounded-xl bg-blue-50" rows={3} value={editForm.explanation} onChange={e=>setEditForm({...editForm, explanation:e.target.value})} placeholder="Pembahasan..."/>{editingQuestion.type === 'multiple_choice' && (<select className="w-full p-3 border rounded-xl" value={editForm.key} onChange={e=>setEditForm({...editForm, key:e.target.value})}>{['A','B','C','D','E'].map(k=><option key={k} value={k}>Kunci: {k}</option>)}</select>)}</div><div className="flex justify-end gap-3 mt-6"><button onClick={()=>setEditingQuestion(null)} className="px-4 py-2 font-bold text-gray-500">Batal</button><button onClick={handleSaveEdit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2"><Save size={16}/> Simpan</button></div></div></div>)}

        {/* TAB PERIODS */}
        {tab === 'periods' && (
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-8"><div><h2 className="text-3xl font-bold">Manajemen Soal</h2><p className="text-gray-500">Atur jadwal dan distribusi soal</p></div><button onClick={()=>downloadFile(`${apiUrl}/admin/download-template`, "Template_Soal.xlsx")} className="flex gap-2 bg-white border px-4 py-2 rounded-xl font-bold shadow-sm text-sm"><Download size={16}/> Template Excel</button></div>
                
                {/* FORM BUAT PERIOD (YANG DIPERBAIKI) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full"><label className="text-xs font-bold text-gray-500 uppercase">Nama Periode</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={newPeriodName} onChange={(e)=>setNewPeriodName(e.target.value)}/></div>
                    
                    {/* INPUT SEKOLAH DENGAN SARAN (DATALIST) */}
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase">Target Cabang (Opsional)</label>
                        <input list="school-list" className="w-full p-3 bg-gray-50 border rounded-xl" placeholder="Ketik atau Pilih..." value={targetSchools} onChange={(e)=>setTargetSchools(e.target.value)}/>
                        <datalist id="school-list">
                            {availableSchools.map(s => <option key={s} value={s}/>)}
                        </datalist>
                    </div>

                    <div className="flex-1 w-full"><label className="text-xs font-bold text-gray-500 uppercase">Mode Ujian</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={examMode} onChange={(e)=>setExamMode(e.target.value)}><option value="standard">Per Subtes (Bebas)</option><option value="full">Maraton (Otomatis)</option></select></div>
                    <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex gap-2"><Plus size={18}/> Buat</button>
                </div>

                <div className="space-y-4">
                    {periods.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="p-5 flex justify-between cursor-pointer bg-gray-50/50" onClick={() => setExpandedPeriod(expandedPeriod === p.id ? null : p.id)}>
                                <div className="flex gap-4"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">{expandedPeriod === p.id ? <ChevronUp/>:<ChevronDown/>}</div><div><h3 className="font-bold text-xl">{p.name}</h3><div className="flex gap-2 mt-1"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.is_active ? 'bg-green-100 text-green-700':'bg-gray-200'}`}>{p.is_active ? "PUBLIK":"DRAFT"}</span>{p.target_schools && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><Target size={10}/> {p.target_schools}</span>}{p.type && p.type.includes('FULL') && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">MARATON</span>}</div></div></div>
                                <div className="flex gap-2" onClick={e=>e.stopPropagation()}><button onClick={() => togglePeriodActive(p.id, p.is_active)} className={`flex gap-1 items-center px-4 py-2 rounded-lg text-xs font-bold text-white ${p.is_active ? 'bg-amber-500':'bg-green-600'}`}>{p.is_active ? <><EyeOff size={14}/> Sembunyikan</>:<><Eye size={14}/> Terbitkan</>}</button><button onClick={() => handleDeletePeriod(p.id)} className="bg-red-50 text-red-600 p-2 rounded-lg"><Trash2 size={18}/></button></div>
                            </div>
                            {expandedPeriod === p.id && (<div className="p-6 border-t bg-white grid grid-cols-1 md:grid-cols-2 gap-4">{p.exams.map(e => (<div key={e.id} className="p-5 border rounded-xl hover:border-indigo-300 transition group"><div className="flex justify-between font-bold text-lg"><div>{e.title}</div><span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{e.code}</span></div><div className="text-sm text-gray-500 mt-2 flex gap-4"><span className="flex gap-1"><Clock size={14}/> {e.duration}m</span><span className="flex gap-1"><CheckCircle size={14}/> {e.q_count} Soal</span></div><div className="flex gap-2 mt-4 pt-4 border-t"><button onClick={() => handlePreviewExam(e.id)} className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold flex justify-center gap-2"><Search size={14}/> Preview & Edit</button><button onClick={() => handleResetExam(e.id)} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 hover:bg-red-100" title="Reset Soal"><RefreshCcw size={14}/></button><label className="flex-1 cursor-pointer bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold flex justify-center gap-2 shadow"><Upload size={14}/> Upload<input type="file" className="hidden" onChange={(ev)=>handleUploadQuestion(e.id, ev.target.files[0])}/></label></div></div>))}</div>)}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB USERS */}
        {tab === 'users' && (
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold">User & Data</h2><p className="text-gray-500">Kelola siswa dan database</p></div>{selectedIds.length > 0 && (<button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Trash2 size={16}/> Hapus {selectedIds.length}</button>)}</div>
                <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 mb-8 flex justify-between items-center"><div><h3 className="font-bold text-indigo-900 text-lg">Database Jurusan</h3><p className="text-xs text-indigo-600">Upload <code>passing_grade.xlsx</code></p></div><label className="cursor-pointer bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow flex gap-2"><Upload size={18}/> Upload PTN<input type="file" className="hidden" accept=".csv,.xlsx" onChange={(e) => { const f=e.target.files[0]; if(!f) return; const d=new FormData(); d.append('file',f); fetch(`${apiUrl}/admin/upload-majors`,{method:'POST',body:d}).then(r=>r.json()).then(d=>alert(d.message)); }}/></label></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"><input placeholder="Username" className="p-3 bg-gray-50 border rounded-xl" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input placeholder="Nama" className="p-3 bg-gray-50 border rounded-xl" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input placeholder="Pass" type="password" className="p-3 bg-gray-50 border rounded-xl" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><input placeholder="Sekolah" className="p-3 bg-gray-50 border rounded-xl" value={newUser.school} onChange={e=>setNewUser({...newUser, school:e.target.value})}/><select className="p-3 bg-gray-50 border rounded-xl" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}><option value="student">Siswa</option><option value="admin">Admin</option></select><button onClick={handleAddUser} className="bg-emerald-600 text-white p-3 rounded-xl font-bold"><Plus size={18}/></button></div>
                <div className="flex justify-end mb-4 gap-3">
                    <button onClick={()=>downloadFile(`${apiUrl}/admin/download-user-template`, "Template_Peserta.xlsx")} className="flex gap-2 bg-white border px-4 py-2 rounded-xl font-bold shadow-sm text-sm"><Download size={16}/> Template Peserta</button>
                    <label className="cursor-pointer text-gray-600 text-sm font-bold flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg border"><Upload size={16}/> Import Siswa<input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleBulkUpload}/></label>
                </div>
                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border"><table className="w-full text-sm text-left"><thead className="bg-gray-50 font-bold text-xs uppercase"><tr><th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll}/></th><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4"><span className="flex items-center gap-1"><School size={14}/> Sekolah</span></th><th className="p-4">Role</th></tr></thead><tbody className="divide-y">{users.map(u => (<tr key={u.id} className="hover:bg-gray-50"><td className="p-4"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={()=>handleSelectOne(u.id)}/></td><td className="p-4 font-bold">{u.full_name}</td><td className="p-4 text-gray-500">{u.username}</td><td className="p-4">{u.school||"-"}</td><td className="p-4">{u.role}</td></tr>))}</tbody></table></div>
            </div>
        )}
        
        {/* TAB RECAP */}
        {tab === 'recap' && (
             <div className="max-w-full">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div><h2 className="text-3xl font-bold text-gray-900">Rekapitulasi Nilai</h2><div className="flex items-center gap-3 mt-4"><div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm"><Filter size={16} className="text-gray-400"/><select className="bg-transparent outline-none text-sm font-bold text-gray-700 min-w-[200px]" value={selectedRecapPeriod} onChange={(e) => setSelectedRecapPeriod(e.target.value)}><option value="">-- Pilih Periode --</option>{periods.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div></div></div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfig(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"><Settings size={18}/> Atur Kop & TTD</button>
                        <button onClick={()=>downloadFile(selectedRecapPeriod ? `${apiUrl}/admin/recap/download-pdf?period_id=${selectedRecapPeriod}` : `${apiUrl}/admin/recap/download-pdf`, "Laporan.pdf")} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-red-600 shadow hover:bg-red-700 transition"><FileText size={18}/> PDF</button>
                        <button onClick={()=>downloadFile(selectedRecapPeriod ? `${apiUrl}/admin/recap/download?period_id=${selectedRecapPeriod}` : `${apiUrl}/admin/recap/download`, "Rekap.xlsx")} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 shadow hover:bg-gray-50 transition"><Download size={18}/> Excel</button>
                        <button onClick={toggleRelease} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow transition ${isReleased ? 'bg-amber-500':'bg-green-600'}`}>{isReleased ? <><Unlock size={18}/> Tutup</> : <><Lock size={18}/> Rilis</>}</button>
                    </div>
                </div>
                <div className="bg-white shadow-xl rounded-2xl overflow-x-auto border"><table className="min-w-full text-sm"><thead className="bg-[#1e293b] text-white"><tr><th className="p-4 text-left border-r border-slate-700 sticky left-0 bg-[#1e293b] z-10 w-64">Siswa</th><th className="p-2 text-center border-r" colSpan="7">Skor</th><th className="p-4 text-center bg-indigo-900 w-24">Total</th><th className="p-4 text-left bg-[#0f172a]">Status</th><th className="p-4 bg-[#0f172a]">Aksi</th></tr><tr className="text-xs text-slate-400"><th className="p-2 border-r sticky left-0 bg-[#1e293b]"></th>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(s=><th key={s} className="p-2 text-center border-r w-16">{s}</th>)}<th className="bg-indigo-900"></th><th className="bg-[#0f172a]"></th><th className="bg-[#0f172a]"></th></tr></thead><tbody className="divide-y">{recap.map((r,i)=>(<tr key={i} className="hover:bg-gray-50"><td className="p-4 border-r sticky left-0 bg-white font-bold">{r.full_name}<div className="text-xs text-gray-400 font-normal">{r.username}</div></td>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=><td key={k} className="p-3 text-center border-r">{r[k]}</td>)}<td className="p-4 text-center font-bold text-indigo-700 bg-indigo-50">{r.average}</td><td className="p-4">{r.status.startsWith('LULUS')?<span className="text-green-600 font-bold flex gap-1"><CheckCircle size={12}/> Lulus</span>:<span className="text-red-600 font-bold flex gap-1"><XCircle size={12}/> Gagal</span>}</td><td className="p-4 text-center"><button onClick={() => handleResetStudentResult(r.id)} className="text-red-500 hover:text-red-700" title="Reset Siswa"><RotateCcw size={18}/></button></td></tr>))}</tbody></table></div>
             </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;