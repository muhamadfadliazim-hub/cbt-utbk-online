import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, CheckCircle, Clock, Search, LayoutDashboard, BarChart3, Settings, RefreshCcw, FileText, Target, Filter, Lock, Unlock, Eye, X } from 'lucide-react';
import 'katex/dist/katex.min.css'; import { InlineMath } from 'react-katex';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  
  // FILTER TARGET PESANTREN
  const [targetSchool, setTargetSchool] = useState('Semua'); 
  const [schoolList, setSchoolList] = useState(['Semua']); 
  
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', school: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('Semua');
  const [isReleased, setIsReleased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
        fetch(`${apiUrl}/admin/periods`).then(r => r.json()),
        fetch(`${apiUrl}/admin/users`).then(r => r.json()),
        fetch(`${apiUrl}/config/release`).then(r => r.json()),
        fetch(`${apiUrl}/admin/schools-list`).then(r => r.json())
    ]).then(([p, u, c, s]) => {
        setPeriods(Array.isArray(p) ? p : []);
        setUsers(Array.isArray(u) ? u : []);
        setIsReleased(c.is_released);
        setSchoolList(s); // List Sekolah dari Backend
        setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreatePeriod = async () => {
    if (!newPeriodName) return;
    await fetch(`${apiUrl}/admin/periods`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPeriodName, target_schools: targetSchool }) 
    });
    setNewPeriodName(''); fetchData();
  };

  const handleDeletePeriod = async (pid) => {
      if(window.confirm("Hapus TO ini beserta seluruh soalnya?")) {
          await fetch(`${apiUrl}/admin/periods/${pid}`, { method: 'DELETE' });
          fetchData();
      }
  };

  const handleTogglePeriod = async (pid) => {
      await fetch(`${apiUrl}/admin/periods/${pid}/toggle`, { method: 'POST' });
      fetchData();
  };

  const handleUploadQuestion = async (e, examId) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await fetch(`${apiUrl}/admin/upload-questions/${examId}`, { method: 'POST', body: formData });
      alert((await res.json()).message); fetchData();
    } catch { alert("Gagal upload"); }
  };

  const handlePreviewExam = async (examId) => {
      try { const res = await fetch(`${apiUrl}/student/review/${examId}`); setPreviewQuestions(await res.json()); } catch { alert("Gagal load preview."); }
  };

  const handleAddUser = async () => { await fetch(`${apiUrl}/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) }); setNewUser({ username: '', password: '', full_name: '', school: '' }); fetchData(); };
  const handleUploadUsers = async (e) => { const file = e.target.files[0]; const formData = new FormData(); formData.append('file', file); await fetch(`${apiUrl}/admin/users/bulk`, { method: 'POST', body: formData }); fetchData(); };
  const handleDeleteUsers = async () => { if (window.confirm(`Hapus ${selectedUsers.length} siswa?`)) { await fetch(`${apiUrl}/admin/users/delete-bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_ids: selectedUsers }) }); setSelectedUsers([]); fetchData(); } };
  const handleUploadMajors = async (e) => { const file = e.target.files[0]; const formData = new FormData(); formData.append('file', file); const res = await fetch(`${apiUrl}/admin/upload-majors`, { method: 'POST', body: formData }); alert((await res.json()).message); };

  const filteredUsers = users.filter(u => u.full_name.toLowerCase().includes(searchUser.toLowerCase()) && (selectedSchoolFilter === 'Semua' || u.school === selectedSchoolFilter));

  const renderRecap = () => {
    const studentWithResults = filteredUsers.filter(u => u.results && u.results.length > 0);
    if (studentWithResults.length === 0) return <div className="p-8 text-center text-slate-400">Belum ada data.</div>;
    return (
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b font-bold"><tr><th className="p-4 w-48 sticky left-0 bg-slate-50 border-r">Nama</th><th className="p-4">Sekolah</th>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=><th key={k} className="p-4 text-center border-l w-16">{k}</th>)}<th className="p-4 text-center bg-indigo-50 border-l">AVG</th></tr></thead>
                <tbody className="divide-y">{studentWithResults.map(u => {
                    const scores = {}; u.results.forEach(r => scores[r.exam_id.split('_').pop()] = Math.round(r.irt_score));
                    const avg = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/7);
                    return (<tr key={u.id} className="hover:bg-slate-50"><td className="p-4 font-bold sticky left-0 bg-white border-r">{u.full_name}</td><td className="p-4">{u.school}</td>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=><td key={k} className="p-4 text-center border-l">{scores[k]||"-"}</td>)}<td className="p-4 text-center font-bold bg-indigo-50 border-l">{avg}</td></tr>);
                })}</tbody>
            </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      <aside className="w-64 bg-white border-r flex flex-col fixed h-full z-10 shadow-lg">
        <div className="p-6 border-b"><h1 className="text-2xl font-black text-indigo-600 flex items-center gap-2"><LayoutDashboard/> CBT PRO</h1></div>
        <nav className="flex-1 p-4 space-y-2">{[{id:'periods',l:'Ujian',i:Clock},{id:'users',l:'Siswa',i:Users},{id:'recap',l:'Rekap',i:BarChart3},{id:'config',l:'Pengaturan',i:Settings}].map(x=><button key={x.id} onClick={()=>setTab(x.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${tab===x.id?'bg-indigo-600 text-white shadow-lg':'text-slate-500 hover:bg-slate-50'}`}><x.i size={20}/> {x.l}</button>)}</nav>
        <div className="p-4 border-t"><button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100"><LogOut size={20}/> Logout</button></div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">{tab==='periods'?'Bank Soal & Periode':tab==='users'?'Data Peserta':tab==='recap'?'Rekapitulasi Skor':'Pengaturan Sistem'}</h2>
            <button onClick={fetchData} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition text-slate-500"><RefreshCcw size={20} className={loading?"animate-spin":""}/></button>
        </header>

        {tab === 'periods' && (
          <div className="space-y-6 animate-fade-in">
            {/* FORM BUAT TO + TARGET SEKOLAH */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex gap-4 items-center">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400">Nama Tryout</label>
                    <input value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)} placeholder="Contoh: TO Akbar 1" className="w-full border-0 bg-slate-50 rounded-xl px-4 py-2 font-bold focus:ring-2 ring-indigo-500"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400">Target Sekolah</label>
                    <select value={targetSchool} onChange={e=>setTargetSchool(e.target.value)} className="w-full bg-slate-50 border-0 rounded-xl px-4 py-2 font-medium outline-none focus:ring-2 ring-indigo-500">
                        {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-6 py-2 h-full rounded-xl font-bold hover:bg-indigo-700 shadow-lg mt-4"><Plus size={20} className="inline mr-2"/> Buat</button>
            </div>
            
            <div className="space-y-4">
              {periods.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 flex justify-between items-center bg-white border-b">
                    <div onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)} className="cursor-pointer flex-1">
                        <div className="font-bold text-lg">{p.name}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1 flex gap-2">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Target: {p.target_schools || "Semua"}</span>
                            <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${p.is_active?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{p.is_active ? "RILIS" : "TERKUNCI"}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={()=>handleTogglePeriod(p.id)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:text-indigo-600" title={p.is_active?"Sembunyikan":"Rilis"}>{p.is_active?<Lock size={18}/>:<Unlock size={18}/>}</button>
                        <button onClick={()=>handleDeletePeriod(p.id)} className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100" title="Hapus TO"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  {expandedPeriod===p.id && (
                    <div className="p-6 grid grid-cols-4 gap-4 bg-slate-50">
                        {p.exams.map(ex => (
                            <div key={ex.id} className="p-4 bg-white border rounded-xl text-center hover:shadow-md transition">
                                <div className="font-bold text-slate-800">{ex.code}</div>
                                <div className="text-xs text-slate-500 mb-2">{ex.q_count} Soal</div>
                                <label className="block w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-indigo-100"><Upload size={12} className="inline mr-1"/> Upload <input type="file" hidden onChange={(e)=>handleUploadQuestion(e, ex.id)}/></label>
                                <button onClick={()=>handlePreviewExam(ex.id)} className="mt-2 text-xs text-slate-400 hover:text-indigo-600 flex items-center justify-center w-full"><Eye size={12} className="mr-1"/> Preview</button>
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'users' || tab === 'recap') && (
            <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm sticky top-0 z-10">
                <Filter className="text-slate-400" size={20}/>
                <span className="font-bold text-slate-700">Filter Cabang:</span>
                <select value={selectedSchoolFilter} onChange={e => setSelectedSchoolFilter(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium outline-none">
                    {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {tab === 'recap' && <a href={`${apiUrl}/admin/recap/download-pdf?school=${selectedSchoolFilter}`} target="_blank" className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex gap-2"><FileText size={16}/> PDF</a>}
            </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between">
                <div className="flex gap-3">
                    <label className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 cursor-pointer shadow-lg transition"><Upload size={18}/> Import <input type="file" hidden onChange={handleUploadUsers}/></label>
                    <button onClick={handleDeleteUsers} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg transition"><Trash2 size={18}/> Hapus</button>
                </div>
                <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border">
                    <input placeholder="User" className="bg-transparent px-2 w-24 outline-none" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/>
                    <input placeholder="Nama" className="bg-transparent px-2 w-32 outline-none border-l" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/>
                    <input placeholder="Sekolah" className="bg-transparent px-2 w-32 outline-none border-l" value={newUser.school} onChange={e=>setNewUser({...newUser, school:e.target.value})}/>
                    <button onClick={handleAddUser} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={18}/></button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-50"><input placeholder="Cari siswa..." className="outline-none text-sm w-full bg-transparent" value={searchUser} onChange={e=>setSearchUser(e.target.value)}/></div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left"><thead className="bg-slate-50 sticky top-0"><tr><th className="p-4 w-10">#</th><th className="p-4">Nama</th><th className="p-4">User</th><th className="p-4">Sekolah</th></tr></thead><tbody className="divide-y">{filteredUsers.map(u=>(<tr key={u.id} className="hover:bg-slate-50"><td className="p-4"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={e=>{if(e.target.checked)setSelectedUsers([...selectedUsers,u.id]); else setSelectedUsers(selectedUsers.filter(id=>id!==u.id))}}/></td><td className="p-4 font-bold">{u.full_name}</td><td className="p-4">{u.username}</td><td className="p-4">{u.school}</td></tr>))}</tbody></table>
                </div>
            </div>
          </div>
        )}

        {tab === 'recap' && renderRecap()}
        
        {tab === 'config' && (
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border flex gap-6 items-center">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">Pengumuman Nilai</h3>
                        <p className="text-sm text-slate-500 mb-4">Status: <strong className={isReleased?"text-emerald-600":"text-slate-600"}>{isReleased?"PUBLIK":"PRIVAT"}</strong></p>
                        <button onClick={async()=>{await fetch(`${apiUrl}/config/release`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:(!isReleased).toString()})}); setIsReleased(!isReleased)}} className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition ${isReleased?'bg-red-500':'bg-emerald-500'}`}>{isReleased ? "Tutup Akses" : "Rilis Nilai"}</button>
                    </div>
                    <div className="flex-1 border-l pl-6">
                        <h3 className="font-bold text-lg mb-2">Upload Jurusan</h3>
                        <label className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-blue-700 inline-flex items-center gap-2 shadow-lg transition"><Upload size={18}/> Pilih File <input type="file" hidden onChange={handleUploadMajors}/></label>
                    </div>
                </div>
            </div>
        )}

        {previewQuestions && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between"><h3 className="font-bold">Preview Soal</h3><button onClick={()=>setPreviewQuestions(null)}><X/></button></div>
                    <div className="p-4 overflow-y-auto space-y-4">{previewQuestions.questions.map((q,i)=>(<div key={i} className="border p-4 rounded-lg bg-slate-50"><p className="font-bold mb-2">No. {i+1}</p><p>{q.text}</p><div className="text-sm text-green-600 mt-2 font-bold">Kunci: {q.correct_answer}</div></div>))}</div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;