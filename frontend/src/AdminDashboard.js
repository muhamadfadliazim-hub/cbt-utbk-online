import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, Clock, Search, LayoutDashboard, BarChart3, Settings, RefreshCcw, FileText, Target, Filter } from 'lucide-react';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', school: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('Semua'); // FILTER CABANG
  const [schoolList, setSchoolList] = useState(['Semua']); // LIST CABANG

  const [isReleased, setIsReleased] = useState(false);
  const [loading, setLoading] = useState(false);

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
        setSchoolList(['Semua', ...s]);
        setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchUser.toLowerCase()) && 
    (selectedSchool === 'Semua' || u.school === selectedSchool)
  );

  const handleCreatePeriod = async () => {
    if (!newPeriodName) return;
    await fetch(`${apiUrl}/admin/periods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newPeriodName }) });
    setNewPeriodName(''); fetchData();
  };

  const handleUploadQuestion = async (e, examId) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${apiUrl}/admin/upload-questions/${examId}`, { method: 'POST', body: formData });
      const data = await res.json();
      alert(data.message); fetchData();
    } catch { alert("Gagal upload soal"); }
  };

  const handleAddUser = async () => {
    await fetch(`${apiUrl}/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    setNewUser({ username: '', password: '', full_name: '', school: '' }); fetchData();
  };

  const handleUploadUsers = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${apiUrl}/admin/users/bulk`, { method: 'POST', body: formData });
    const d = await res.json();
    alert(d.message); fetchData();
  };

  const handleDeleteUsers = async () => {
    if (window.confirm(`Hapus ${selectedUsers.length} siswa?`)) {
      await fetch(`${apiUrl}/admin/users/delete-bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_ids: selectedUsers }) });
      setSelectedUsers([]); fetchData();
    }
  };

  const handleUploadMajors = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${apiUrl}/admin/upload-majors`, { method: 'POST', body: formData });
    const d = await res.json();
    alert(d.message);
  };

  const renderRecap = () => {
    const studentWithResults = filteredUsers.filter(u => u.results && u.results.length > 0);
    if (studentWithResults.length === 0) return <div className="p-8 text-center text-slate-400 border-2 border-dashed rounded-xl">Belum ada data nilai masuk untuk filter ini.</div>;

    const subtests = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"];

    return (
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                <tr>
                    <th className="p-4 w-48">Nama Siswa</th>
                    <th className="p-4 w-32">Sekolah</th>
                    {subtests.map(k=><th key={k} className="p-4 text-center w-16 bg-slate-100 border-l border-white">{k}</th>)}
                    <th className="p-4 text-center bg-indigo-50 text-indigo-800 w-20">AVG</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {studentWithResults.map(u => {
                    const scores = {};
                    u.results.forEach(r => {
                        const code = r.exam_id.split('_').pop();
                        scores[code] = Math.round(r.irt_score);
                    });
                    const total = Object.values(scores).reduce((a,b)=>a+b,0);
                    const avg = subtests.length > 0 ? Math.round(total / subtests.length) : 0;
                    return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-700">{u.full_name}</td>
                        <td className="p-4 text-slate-500 text-xs">{u.school}</td>
                        {subtests.map(k => (<td key={k} className={`p-4 text-center border-l ${scores[k] ? 'font-bold text-slate-700' : 'text-slate-300'}`}>{scores[k] || "-"}</td>))}
                        <td className="p-4 text-center font-black text-indigo-600 bg-indigo-50/30 border-l border-indigo-100">{avg}</td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      <aside className="w-64 bg-white border-r flex flex-col fixed h-full z-10 shadow-lg">
        <div className="p-6 border-b"><h1 className="text-2xl font-black text-indigo-600 flex items-center gap-2"><LayoutDashboard/> CBT PRO</h1></div>
        <nav className="flex-1 p-4 space-y-2">
            {[{id:'periods',l:'Bank Soal',i:Clock},{id:'users',l:'Peserta',i:Users},{id:'recap',l:'Rekap Nilai',i:BarChart3},{id:'config',l:'Pengaturan',i:Settings}].map(x=>(
                <button key={x.id} onClick={()=>setTab(x.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${tab===x.id?'bg-indigo-600 text-white shadow-lg shadow-indigo-200':'text-slate-500 hover:bg-slate-50'}`}><x.i size={20}/> {x.l}</button>
            ))}
        </nav>
        <div className="p-4 border-t"><button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100"><LogOut size={20}/> Logout</button></div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">{tab==='periods'?'Bank Soal & Periode':tab==='users'?'Data Peserta':tab==='recap'?'Rekapitulasi Skor':'Pengaturan Sistem'}</h2>
            <button onClick={fetchData} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition text-slate-500"><RefreshCcw size={20} className={loading?"animate-spin":""}/></button>
        </header>

        {tab === 'periods' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex gap-4">
                <input value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)} placeholder="Nama Tryout Baru (Contoh: TO Akbar 2024)" className="flex-1 border-0 bg-slate-50 rounded-xl px-4 font-bold text-lg focus:ring-2 ring-indigo-500"/>
                <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"><Plus size={20} className="inline mr-2"/> Buat</button>
            </div>
            <div className="space-y-4">
              {periods.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="p-5 flex justify-between items-center cursor-pointer bg-gradient-to-r from-white to-slate-50" onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Clock size={24}/></div>
                        <div><div className="font-bold text-lg">{p.name}</div><div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-1">AKTIF</div></div>
                    </div>
                    {expandedPeriod===p.id?<ChevronUp className="text-slate-400"/>:<ChevronDown className="text-slate-400"/>}
                  </div>
                  {expandedPeriod===p.id && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 border-t">
                        {p.exams.map(ex => (
                            <div key={ex.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition text-center group">
                                <div className="font-bold text-slate-800 text-lg mb-1">{ex.code}</div>
                                <div className="text-xs text-slate-500 mb-4">{ex.q_count} Soal • {ex.duration} Menit</div>
                                <label className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-400 cursor-pointer group-hover:border-indigo-500 group-hover:text-indigo-600 transition">
                                    <Upload size={14}/> Upload Excel
                                    <input type="file" hidden onChange={(e)=>handleUploadQuestion(e, ex.id)} accept=".csv,.xlsx"/>
                                </label>
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
            <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
                <Filter className="text-slate-400" size={20}/>
                <span className="font-bold text-slate-700">Filter Cabang:</span>
                <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                    {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {tab === 'recap' && (
                    <a href={`${apiUrl}/admin/recap/download-pdf?school=${selectedSchool}`} target="_blank" rel="noreferrer" className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-red-700 transition flex items-center gap-2"><FileText size={16}/> Download PDF ({selectedSchool})</a>
                )}
            </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between">
                <div className="flex gap-3">
                    <label className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 cursor-pointer shadow-lg shadow-emerald-200 transition"><Upload size={18}/> Import Peserta <input type="file" hidden onChange={handleUploadUsers}/></label>
                    <button onClick={handleDeleteUsers} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg shadow-red-200 transition"><Trash2 size={18}/> Hapus</button>
                </div>
                <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border">
                    <input placeholder="Username" className="bg-transparent px-2 w-32 font-medium outline-none" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/>
                    <input placeholder="Nama" className="bg-transparent px-2 w-48 font-medium outline-none border-l" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/>
                    <button onClick={handleAddUser} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={18}/></button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-50"><div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"><Search size={16} className="text-slate-400"/><input placeholder="Cari nama siswa..." className="outline-none text-sm w-full" value={searchUser} onChange={e=>setSearchUser(e.target.value)}/></div></div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 sticky top-0"><tr><th className="p-4 w-10">#</th><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Sekolah</th></tr></thead>
                        <tbody className="divide-y">
                            {filteredUsers.map(u=>(
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={e=>{if(e.target.checked)setSelectedUsers([...selectedUsers,u.id]); else setSelectedUsers(selectedUsers.filter(id=>id!==u.id))}}/></td>
                                    <td className="p-4 font-bold text-slate-700">{u.full_name}</td><td className="p-4 text-slate-500">{u.username}</td><td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{u.school}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {tab === 'recap' && <div className="space-y-6 animate-fade-in">{renderRecap()}</div>}

        {tab === 'config' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border flex gap-6 items-center">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Target size={32}/></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800">Database Jurusan</h3>
                        <p className="text-sm text-slate-500 mb-4">Upload file Excel daftar jurusan dan passing grade terbaru.</p>
                        <label className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-blue-700 inline-flex items-center gap-2 shadow-lg shadow-blue-200 transition"><Upload size={18}/> Upload File Jurusan <input type="file" hidden onChange={handleUploadMajors}/></label>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border flex gap-6 items-center">
                    <div className={`p-4 rounded-2xl ${isReleased?'bg-emerald-100 text-emerald-600':'bg-slate-100 text-slate-500'}`}><RefreshCcw size={32}/></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800">Pengumuman Nilai</h3>
                        <p className="text-sm text-slate-500 mb-4">Status saat ini: <strong className={isReleased?"text-emerald-600":"text-slate-600"}>{isReleased?"PUBLIK":"PRIVAT"}</strong></p>
                        <button onClick={async()=>{await fetch(`${apiUrl}/config/release`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:(!isReleased).toString()})}); setIsReleased(!isReleased)}} className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition ${isReleased?'bg-red-500 hover:bg-red-600 shadow-red-200':'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}>{isReleased ? "Tutup Akses Nilai" : "Rilis Nilai ke Siswa"}</button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;