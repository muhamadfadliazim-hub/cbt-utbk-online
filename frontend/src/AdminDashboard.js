import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, 
  CheckCircle, XCircle, Download, Clock, Search, X, Filter, 
  LayoutDashboard, BarChart3, Edit3, Save, FileText, School, 
  Target, Settings, RefreshCcw 
} from 'lucide-react';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  
  // STATE UJIAN
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  
  // STATE SISWA
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', school: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  
  // STATE CONFIG
  const [isReleased, setIsReleased] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
        fetch(`${apiUrl}/admin/periods`).then(r => r.json()),
        fetch(`${apiUrl}/admin/users`).then(r => r.json()),
        fetch(`${apiUrl}/config/release`).then(r => r.json())
    ]).then(([periodsData, usersData, configData]) => {
        setPeriods(Array.isArray(periodsData) ? periodsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setIsReleased(configData.is_released);
        setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HANDLERS (FUNGSI TETAP SAMA, TAMPILAN BEDA) ---
  const handleCreatePeriod = async () => {
    if (!newPeriodName) return;
    await fetch(`${apiUrl}/admin/periods`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPeriodName, exam_type: 'UTBK', mode: 'standard' })
    });
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
    await fetch(`${apiUrl}/admin/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    setNewUser({ username: '', password: '', full_name: '', school: '' });
    fetchData();
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
      await fetch(`${apiUrl}/admin/users/delete-bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: selectedUsers })
      });
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

  // --- RENDERERS ---
  const renderRecap = () => {
    const studentWithResults = users.filter(u => u.results && u.results.length > 0);
    if (studentWithResults.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <BarChart3 size={48} className="mb-4 opacity-20"/>
            <p>Belum ada data nilai ujian masuk.</p>
        </div>
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                    <th className="p-4">Nama Siswa</th>
                    <th className="p-4">Sekolah</th>
                    {["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=><th key={k} className="p-4 text-center">{k}</th>)}
                    <th className="p-4 text-center bg-indigo-50 text-indigo-700">RATA-RATA</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {studentWithResults.map(u => {
                    const scores = { PU:0, PPU:0, PBM:0, PK:0, LBI:0, LBE:0, PM:0 };
                    u.results.forEach(r => {
                        const code = r.exam_id.split('_').pop();
                        if (scores[code] !== undefined) scores[code] = Math.round(r.irt_score);
                    });
                    const avg = Math.round(Object.values(scores).reduce((a,b)=>a+b,0) / 7);
                    return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-medium text-slate-800">{u.full_name}<br/><span className="text-xs text-slate-400 font-normal">{u.username}</span></td>
                        <td className="p-4 text-slate-500">{u.school}</td>
                        {Object.keys(scores).map(k => <td key={k} className="p-4 text-center text-slate-600">{scores[k]}</td>)}
                        <td className="p-4 text-center font-bold text-indigo-600 bg-indigo-50/50">{avg}</td>
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
      {/* SIDEBAR MEWAH */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-8 border-b border-slate-100">
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <LayoutDashboard className="text-indigo-600"/> CBT ADMIN
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">PANEL KONTROL TERPADU</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {[
                {id: 'periods', label: 'Manajemen Ujian', icon: Clock},
                {id: 'users', label: 'Data Siswa', icon: Users},
                {id: 'recap', label: 'Rekap Nilai', icon: BarChart3},
                {id: 'config', label: 'Pengaturan', icon: Settings},
            ].map(item => (
                <button 
                    key={item.id} 
                    onClick={() => setTab(item.id)} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        tab === item.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                >
                    <item.icon size={20} strokeWidth={2}/> {item.label}
                </button>
            ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-all duration-200">
                <LogOut size={18}/> Keluar
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                    {tab === 'periods' && "Manajemen Ujian"}
                    {tab === 'users' && "Data Siswa"}
                    {tab === 'recap' && "Rekapitulasi Nilai"}
                    {tab === 'config' && "Pengaturan Sistem"}
                </h2>
                <p className="text-slate-500 mt-1">Kelola sistem CBT Anda dengan mudah.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">
                    <RefreshCcw size={20} className={loading ? "animate-spin" : ""}/>
                </button>
            </div>
        </header>

        {/* --- TAB UJIAN --- */}
        {tab === 'periods' && (
          <div className="space-y-8 animate-fade-in">
            {/* Input Periode Baru */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Buat Periode Baru</label>
                <input 
                    value={newPeriodName} 
                    onChange={e => setNewPeriodName(e.target.value)} 
                    placeholder="Contoh: Tryout Akbar Nasional 2024" 
                    className="w-full font-semibold text-slate-800 placeholder:text-slate-300 outline-none text-lg bg-transparent"
                />
              </div>
              <button onClick={handleCreatePeriod} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
                <Plus size={20} className="inline mr-2"/> Tambah
              </button>
            </div>
            
            {/* List Periode */}
            <div className="space-y-6">
              {periods.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div 
                    className="p-6 flex justify-between items-center cursor-pointer bg-gradient-to-r from-white to-slate-50 hover:to-indigo-50/30" 
                    onClick={() => setExpandedPeriod(expandedPeriod === p.id ? null : p.id)}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${p.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Clock size={24}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                            <div className="text-sm text-slate-500 font-medium mt-1">
                                {p.is_active ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Sedang Aktif</span> : "Non-Aktif"}
                            </div>
                        </div>
                    </div>
                    {expandedPeriod === p.id ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
                  </div>
                  
                  {expandedPeriod === p.id && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {p.exams.map(ex => (
                          <div key={ex.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-500">{ex.code}</div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${ex.questions.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {ex.questions.length} Soal
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1 line-clamp-1" title={ex.title}>{ex.title}</h4>
                            <p className="text-xs text-slate-400 mb-4">{ex.duration} Menit</p>
                            
                            <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm font-bold text-slate-400 hover:text-indigo-600 gap-2">
                              <Upload size={16}/> Upload Soal
                              <input type="file" hidden onChange={(e) => handleUploadQuestion(e, ex.id)} accept=".csv,.xlsx"/>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB SISWA --- */}
        {tab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            {/* Toolbar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
              <div className="flex flex-wrap gap-3">
                <input type="file" id="upload-users" hidden onChange={handleUploadUsers} accept=".csv,.xlsx"/>
                <label htmlFor="upload-users" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-200 transition-all active:scale-95">
                    <Upload size={18}/> Import Excel
                </label>
                {selectedUsers.length > 0 && (
                    <button onClick={handleDeleteUsers} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95">
                        <Trash2 size={18}/> Hapus ({selectedUsers.length})
                    </button>
                )}
              </div>
              
              <div className="flex gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full xl:w-auto">
                <input 
                    className="bg-transparent outline-none px-2 w-32 text-sm font-medium" 
                    placeholder="Username" 
                    value={newUser.username} 
                    onChange={e=>setNewUser({...newUser, username:e.target.value})}
                />
                <div className="w-px bg-slate-300"></div>
                <input 
                    className="bg-transparent outline-none px-2 w-40 text-sm font-medium" 
                    placeholder="Nama Lengkap" 
                    value={newUser.full_name} 
                    onChange={e=>setNewUser({...newUser, full_name:e.target.value})}
                />
                <button onClick={handleAddUser} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                    <Plus size={18}/>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Search size={18} className="text-slate-400"/>
                    <input 
                        type="text" 
                        placeholder="Cari siswa berdasarkan nama..." 
                        className="bg-transparent outline-none w-full text-sm"
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                    />
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u.id) : [])}/></th>
                            <th className="p-4">Nama Lengkap</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Sekolah/Cabang</th>
                            <th className="p-4 font-mono">Password</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {users.filter(u => u.full_name.toLowerCase().includes(searchUser.toLowerCase())).map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition">
                            <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={(e) => {
                                if(e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                            }}/></td>
                            <td className="p-4 font-bold text-slate-700">{u.full_name}</td>
                            <td className="p-4 text-slate-500">{u.username}</td>
                            <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">{u.school || "-"}</span></td>
                            <td className="p-4 font-mono text-slate-400">••••••</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {/* --- TAB REKAP --- */}
        {tab === 'recap' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                  <h2 className="text-xl font-bold text-slate-800">Laporan Hasil Ujian</h2>
                  <p className="text-sm text-slate-500">Unduh atau lihat data nilai siswa secara real-time.</p>
              </div>
              <div className="flex gap-3">
                <a href={`${apiUrl}/admin/recap/download`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95">
                    <FileText size={18}/> Unduh Excel
                </a>
                <a href={`${apiUrl}/admin/recap/download-pdf`} target="_blank" rel="noreferrer" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg shadow-red-200 transition-all active:scale-95">
                    <FileText size={18}/> Unduh PDF
                </a>
              </div>
            </div>
            {renderRecap()}
          </div>
        )}

        {/* --- TAB CONFIG --- */}
        {tab === 'config' && (
          <div className="space-y-6 animate-fade-in">
            {/* Card Upload Jurusan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex gap-4 items-start mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Target size={24}/></div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Database Jurusan & Passing Grade</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload file Excel berisi daftar jurusan (Format: Universitas, Prodi, Passing_Grade) untuk memperbarui data pilihan siswa.</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all">
                <input type="file" id="upload-major" hidden onChange={handleUploadMajors} accept=".csv,.xlsx"/>
                <label htmlFor="upload-major" className="cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Upload size={24}/>
                  </div>
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Pilih File Excel</span>
                  <p className="text-xs text-slate-400 mt-3">Mendukung format .xlsx dan .csv</p>
                </label>
              </div>
            </div>

            {/* Card Pengumuman */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex gap-4 items-start mb-6">
                <div className={`p-3 rounded-xl ${isReleased ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}><RefreshCcw size={24}/></div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Status Pengumuman Nilai</h3>
                    <p className="text-sm text-slate-500 mt-1">Atur apakah siswa dapat melihat nilai mereka di dashboard.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <button 
                  onClick={async () => {
                    await fetch(`${apiUrl}/config/release`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({value: (!isReleased).toString()}) });
                    setIsReleased(!isReleased);
                  }}
                  className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isReleased ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
                >
                  {isReleased ? "Tutup Akses (Sembunyikan Nilai)" : "Rilis Pengumuman (Tampilkan Nilai)"}
                </button>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">Status Saat Ini</span>
                    <span className={`font-bold ${isReleased ? 'text-emerald-600' : 'text-slate-600'}`}>{isReleased ? "PUBLIK (Dapat Dilihat)" : "PRIVAT (Disembunyikan)"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;