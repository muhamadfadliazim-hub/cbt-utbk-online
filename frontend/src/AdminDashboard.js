import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Building2 } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [allowedUsers, setAllowedUsers] = useState('');
  
  // Data State
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [majors, setMajors] = useState([]);
  
  // Config State
  const [isReleased, setIsReleased] = useState(false);
  const [isMajorSelectionEnabled, setIsMajorSelectionEnabled] = useState(true);

  // UI State
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewData, setPreviewData] = useState(null); 
  const [showPreview, setShowPreview] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedWhitelist, setSelectedWhitelist] = useState([]);

  // Forms
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedRecapPeriod, setSelectedRecapPeriod] = useState('');

  // --- API CALLS ---
  const fetchPeriods = useCallback(() => {
    fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[]));
  }, []);

  const fetchUsers = useCallback(() => {
    fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[]));
  }, []);

  const fetchConfigs = useCallback(() => {
      fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.is_released));
      fetch(`${API_URL}/config/enable_major_selection`).then(r=>r.json()).then(d=>setIsMajorSelectionEnabled(d.value === 'true'));
  }, []);

  const fetchRecap = useCallback(() => {
      const url = selectedRecapPeriod ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap`;
      fetch(url).then(r=>r.json()).then(d=>setRecap(Array.isArray(d)?d:[]));
  }, [selectedRecapPeriod]);

  // --- EFFECTS ---
  useEffect(() => {
    fetchUsers(); 
    fetchConfigs();
    if (tab === 'periods') fetchPeriods(); 
    if (tab === 'recap') { fetchPeriods(); fetchRecap(); } 
  }, [tab, fetchPeriods, fetchUsers, fetchRecap, fetchConfigs]);

  useEffect(() => { if (tab === 'recap') fetchRecap(); }, [selectedRecapPeriod, fetchRecap]);

  // --- ACTIONS ---
  const toggleConfig = (key, currentVal) => {
      const newVal = !currentVal;
      fetch(`${API_URL}/config/${key}`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({value: newVal ? "true" : "false"})
      }).then(() => {
          if(key === 'release_announcement') setIsReleased(newVal);
          if(key === 'enable_major_selection') setIsMajorSelectionEnabled(newVal);
      });
  };

  const toggleUserWhitelist = (username) => {
      if (selectedWhitelist.includes(username)) {
          setSelectedWhitelist(selectedWhitelist.filter(u => u !== username));
      } else {
          setSelectedWhitelist([...selectedWhitelist, username]);
      }
  };

  const handleCreatePeriod = (e) => { 
      e.preventDefault(); 
      if(!newPeriodName.trim()) return alert("Nama periode wajib diisi");
      let allowed = selectedWhitelist.length > 0 ? selectedWhitelist.join(',') : (allowedUsers.trim() || null);
      fetch(`${API_URL}/admin/periods`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name: newPeriodName, allowed_usernames: allowed})})
      .then(r=>r.json()).then(d=>{ alert(d.message); setNewPeriodName(''); setAllowedUsers(''); setSelectedWhitelist([]); fetchPeriods(); });
  };

  const togglePeriodActive = (id, s) => fetch(`${API_URL}/admin/periods/${id}/toggle`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!s})}).then(()=>fetchPeriods());
  const togglePeriodSubmit = (id, s) => fetch(`${API_URL}/admin/periods/${id}/toggle-submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!s})}).then(()=>fetchPeriods());
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/periods/${id}`, {method:'DELETE'}).then(()=>fetchPeriods()); };
  
  const handleUploadQuestion = (eid, f) => { 
      const d=new FormData(); d.append('file',f); 
      const btn = document.getElementById(`btn-upload-${eid}`);
      if(btn) btn.innerText = "Uploading...";
      fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchPeriods();}).finally(()=>{if(btn) btn.innerText="Upload";}); 
  };
  
  const handleDownloadTemplate = () => window.open(`${API_URL}/admin/download-template`, '_blank');
  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}); };
  const handleResetResult = (uid, eid) => { if(window.confirm("Reset?")) fetch(`${API_URL}/admin/reset-result`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, exam_id:eid})}).then(()=>fetchRecap()); };
  const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>fetchUsers()); };
  const handleBulkDelete = () => { if(selectedIds.length>0 && window.confirm("Hapus?")) fetch(`${API_URL}/admin/users/delete-bulk`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_ids:selectedIds})}).then(()=>fetchUsers()); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}) };
  const handleDownloadExcel = () => { const url = selectedRecapPeriod ? `${API_URL}/admin/recap/download?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap/download`; window.open(url, '_blank'); };
  const handleSelectAll = (e) => setSelectedIds(e.target.checked ? users.map(u=>u.id) : []);
  const handleSelectOne = (id) => setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i=>i!==id) : [...selectedIds, id]);

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800">
      <aside className="w-64 bg-indigo-900 text-white p-6 flex flex-col">
          <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
          <nav className="space-y-4 flex-1">
              <button onClick={()=>setTab('periods')} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='periods'?'bg-indigo-700':''}`}><FileText size={18}/> Soal & Ujian</button>
              <button onClick={()=>setTab('users')} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='users'?'bg-indigo-700':''}`}><Users size={18}/> User & Siswa</button>
              <button onClick={()=>setTab('recap')} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='recap'?'bg-indigo-700':''}`}><FileText size={18}/> Rekap Nilai</button>
          </nav>
          <div className="mt-auto pt-6 border-t border-indigo-700 space-y-3">
              <div className="text-xs font-bold text-indigo-300 uppercase">Pengaturan Sistem</div>
              <button onClick={()=>toggleConfig('enable_major_selection', isMajorSelectionEnabled)} className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold ${isMajorSelectionEnabled ? 'bg-green-600' : 'bg-red-500'}`}>
                  Pilih Jurusan: {isMajorSelectionEnabled ? "ON" : "OFF"} {isMajorSelectionEnabled ? <Unlock size={14}/> : <Lock size={14}/>}
              </button>
              <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold ${isReleased ? 'bg-green-600' : 'bg-orange-500'}`}>
                  Pengumuman: {isReleased ? "RILIS" : "TUTUP"} {isReleased ? <Unlock size={14}/> : <Lock size={14}/>}
              </button>
              <button onClick={onLogout} className="flex items-center gap-3 p-3 rounded hover:bg-red-600 bg-indigo-800 mt-4"><LogOut size={18}/> Keluar</button>
          </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto relative">
        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><div><h3 className="text-xl font-bold">Preview: {previewData.title}</h3></div><button onClick={()=>setShowPreview(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">{previewData.questions.map((q,i)=>(<div key={q.id} className="border p-4 rounded bg-gray-50"><div className="font-bold mb-2">No. {i+1}</div><div>{q.text}</div></div>))}</div>
                </div>
            </div>
        )}

        {showUserModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><h3 className="font-bold">Pilih Peserta</h3><button onClick={()=>setShowUserModal(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {users.filter(u=>u.role==='student').map(u=>(<label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 border rounded cursor-pointer"><input type="checkbox" checked={selectedWhitelist.includes(u.username)} onChange={()=>toggleUserWhitelist(u.username)}/><div><div className="font-bold text-sm">{u.full_name}</div><div className="text-xs text-gray-400">{u.username}</div></div></label>))}
                    </div>
                    <div className="p-4 border-t text-right"><button onClick={()=>setShowUserModal(false)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Selesai</button></div>
                </div>
            </div>
        )}

        {tab === 'periods' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Soal</h2>
            <div className="flex justify-end mb-4"><button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded font-bold shadow"><Download size={18}/> Download Template</button></div>
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1"><label className="text-sm font-bold text-gray-600">Nama Periode</label><input className="w-full p-2 border rounded" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                    <div className="w-1/3"><label className="text-sm font-bold text-gray-600">Akses Peserta</label><div onClick={()=>setShowUserModal(true)} className="w-full p-2 border rounded bg-gray-50 cursor-pointer flex justify-between items-center"><span className="text-sm text-gray-600">{selectedWhitelist.length>0?`${selectedWhitelist.length} Peserta`:"Semua (Public)"}</span><Users size={16}/></div></div>
                    <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold">Buat</button>
                </div>
            </div>
            <div className="space-y-4">{periods.map(p=>(<div key={p.id} className="bg-white rounded shadow border overflow-hidden"><div className="p-4 bg-gray-50 flex justify-between items-center"><div className="flex gap-4"><button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)}>{expandedPeriod===p.id?<ChevronUp/>:<ChevronDown/>}</button><div><h3 className="font-bold">{p.name}</h3><div className="flex gap-2 text-xs"><span className={`px-2 py-0.5 rounded font-bold ${p.is_active?'bg-green-100 text-green-700':'bg-gray-200'}`}>{p.is_active?'PUBLIK':'DRAFT'}</span></div></div></div><div className="flex gap-2"><button onClick={()=>togglePeriodSubmit(p.id, p.allow_submit)} className={`px-3 py-1 rounded text-sm font-bold ${p.allow_submit?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{p.allow_submit?'Submit: ON':'Submit: OFF'}</button><button onClick={()=>togglePeriodActive(p.id, p.is_active)} className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-bold">{p.is_active?'Sembunyikan':'Tampilkan'}</button><button onClick={()=>handleDeletePeriod(p.id)} className="p-2 bg-red-50 text-red-600 rounded border border-red-200"><Trash2 size={16}/></button></div></div>{expandedPeriod===p.id && <div className="p-4 grid gap-3">{p.exams.map(e=>(<div key={e.id} className="border p-3 rounded flex justify-between items-center"><div><div className="font-bold">{e.title}</div><div className="text-xs text-gray-500">{e.questions.length} Soal</div></div><div className="flex gap-2"><button onClick={()=>handlePreviewExam(e.id)} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">Lihat</button><label id={`btn-upload-${e.id}`} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold cursor-pointer hover:bg-blue-700">Upload<input type="file" hidden accept=".xlsx" onChange={ev=>handleUploadQuestion(e.id,ev.target.files[0])}/></label></div></div>))}</div>}</div>))}</div>
            </div>
        )}

        {tab === 'users' && (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">User Management</h2>{selectedIds.length>0&&<button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16}/> Hapus {selectedIds.length}</button>}</div><div className="bg-white p-4 rounded shadow mb-6 flex gap-2"><input className="border p-2 rounded flex-1" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Nama" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Pass" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><button onClick={handleAddUser} className="bg-green-600 text-white px-4 rounded font-bold">+</button></div><div className="mb-4"><label className="text-blue-600 cursor-pointer text-sm hover:underline"><Upload size={14} className="inline mr-1"/>Upload Excel User<input type="file" hidden accept=".xlsx" onChange={handleBulkUpload}/></label></div><div className="bg-white shadow rounded overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={users.length>0&&selectedIds.length===users.length}/></th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Username</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={()=>handleSelectOne(u.id)}/></td><td className="p-3">{u.full_name}</td><td className="p-3">{u.username}</td></tr>))}</tbody></table></div></div>)}
        
        {tab === 'recap' && (
            <div className="overflow-x-auto pb-20">
                <div className="flex justify-between items-end mb-6">
                    <div><h2 className="text-2xl font-bold">Rekap Nilai</h2><select className="p-2 border rounded mt-2" value={selectedRecapPeriod} onChange={e=>setSelectedRecapPeriod(e.target.value)}><option value="">-- Semua Periode --</option>{periods.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow text-sm font-bold"><Download size={16}/> Excel</button>
                        {/* FIX: GUNAKAN toggleConfig DI SINI */}
                        <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`flex items-center gap-2 px-4 py-2 text-white rounded shadow text-sm font-bold ${isReleased?'bg-green-600':'bg-orange-500'}`}>{isReleased?<Unlock size={16}/>:<Lock size={16}/>} {isReleased?'Tutup Pengumuman':'Rilis Pengumuman'}</button>
                    </div>
                </div>
                <div className="bg-white shadow rounded overflow-hidden border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-indigo-900 text-white"><tr><th className="p-3" rowSpan="2">Nama</th><th className="p-2 text-center bg-indigo-800" colSpan="7">Skor IRT</th><th className="p-3 text-center bg-blue-900" rowSpan="2">Avg</th><th className="p-3 bg-indigo-800" rowSpan="2">Ket</th><th className="p-3 bg-red-900" rowSpan="2">Reset</th></tr><tr>{["PU","PBM","PPU","PK","LBI","LBE","PM"].map(s=><th key={s} className="p-1 text-center text-xs bg-indigo-700">{s}</th>)}</tr></thead>
                        <tbody className="divide-y">{recap.map((r,i)=>(<tr key={i} className="hover:bg-gray-50"><td className="p-3 font-bold">{r.full_name}<div className="text-xs text-gray-400">{r.username}</div></td>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=><td key={k} className="p-2 text-center text-gray-600">{r[k]}</td>)}<td className="p-3 text-center font-bold text-blue-700 bg-blue-50">{r.average}</td><td className="p-3">{r.status.includes('LULUS')?<span className="text-green-600 font-bold text-xs"><CheckCircle size={12} className="inline"/> {r.status}</span>:<span className="text-red-600 font-bold text-xs"><XCircle size={12} className="inline"/> TIDAK</span>}</td><td className="p-3 text-center">{r.completed_exams.map(e=><button key={e.exam_id} onClick={()=>handleResetResult(r.id,e.exam_id)} className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded border border-red-200 m-0.5 hover:bg-red-600 hover:text-white">{e.code}×</button>)}</td></tr>))}</tbody>
                    </table>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;