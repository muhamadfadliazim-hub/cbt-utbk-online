import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Clock, Search, X, Filter, LayoutDashboard, BarChart3, Edit3, Save, FileText, School, Target, Settings, RefreshCcw } from 'lucide-react';

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
  
  // STATE CONFIG
  const [instituteConfig, setInstituteConfig] = useState({});
  const [isReleased, setIsReleased] = useState(false);

  // --- FETCH DATA ---
  const fetchData = useCallback(() => {
    // Periods
    fetch(`${apiUrl}/admin/periods`).then(r => r.json()).then(d => setPeriods(Array.isArray(d) ? d : [])).catch(()=>setPeriods([]));
    // Users (Include Results)
    fetch(`${apiUrl}/admin/users`).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(()=>setUsers([]));
    // Config
    fetch(`${apiUrl}/config/release`).then(r => r.json()).then(d => setIsReleased(d.is_released));
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ACTION HANDLERS ---

  // 1. BUAT PERIODE
  const handleCreatePeriod = async () => {
    if (!newPeriodName) return alert("Isi nama periode");
    await fetch(`${apiUrl}/admin/periods`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPeriodName, exam_type: 'UTBK', mode: 'standard' })
    });
    setNewPeriodName(''); fetchData();
  };

  // 2. UPLOAD SOAL
  const handleUploadQuestion = async (e, examId) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${apiUrl}/admin/upload-questions/${examId}`, { method: 'POST', body: formData });
      const data = await res.json();
      alert(data.message);
      fetchData();
    } catch { alert("Gagal upload soal"); }
  };

  // 3. TAMBAH SISWA
  const handleAddUser = async () => {
    await fetch(`${apiUrl}/admin/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    setNewUser({ username: '', password: '', full_name: '', school: '' });
    fetchData();
  };

  // 4. UPLOAD SISWA (EXCEL)
  const handleUploadUsers = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${apiUrl}/admin/users/bulk`, { method: 'POST', body: formData });
    const d = await res.json();
    alert(d.message); fetchData();
  };

  // 5. HAPUS SISWA
  const handleDeleteUsers = async () => {
    if (window.confirm(`Hapus ${selectedUsers.length} siswa?`)) {
      await fetch(`${apiUrl}/admin/users/delete-bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: selectedUsers })
      });
      setSelectedUsers([]); fetchData();
    }
  };

  // 6. UPLOAD JURUSAN (YANG HILANG KEMARIN)
  const handleUploadMajors = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${apiUrl}/admin/upload-majors`, { method: 'POST', body: formData });
    const d = await res.json();
    alert(d.message);
  };

  // --- RENDER REKAP DATA (CALCULATED FROM USERS) ---
  const renderRecap = () => {
    // Filter hanya siswa yang punya hasil
    const studentWithResults = users.filter(u => u.results && u.results.length > 0);
    
    if (studentWithResults.length === 0) return <div className="p-8 text-center text-slate-400">Belum ada data nilai masuk.</div>;

    return (
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-100 font-bold">
          <tr>
            <th className="p-3">Nama</th>
            <th className="p-3">Sekolah</th>
            <th className="p-3 text-center">PU</th>
            <th className="p-3 text-center">PPU</th>
            <th className="p-3 text-center">PBM</th>
            <th className="p-3 text-center">PK</th>
            <th className="p-3 text-center">LBI</th>
            <th className="p-3 text-center">LBE</th>
            <th className="p-3 text-center">PM</th>
            <th className="p-3 text-center bg-indigo-50">RATA-RATA</th>
          </tr>
        </thead>
        <tbody>
          {studentWithResults.map(u => {
            // Hitung skor dari relasi 'results'
            const scores = { PU:0, PPU:0, PBM:0, PK:0, LBI:0, LBE:0, PM:0 };
            let total = 0;
            u.results.forEach(r => {
               // Ambil kode dari ID (misal P1_PU -> PU)
               const code = r.exam_id.split('_').pop();
               if (scores[code] !== undefined) scores[code] = Math.round(r.irt_score);
            });
            const avg = Math.round(Object.values(scores).reduce((a,b)=>a+b,0) / 7);
            
            return (
              <tr key={u.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{u.full_name}<br/><span className="text-xs text-gray-400">{u.username}</span></td>
                <td className="p-3">{u.school}</td>
                {Object.keys(scores).map(k => <td key={k} className="p-3 text-center">{scores[k]}</td>)}
                <td className="p-3 text-center font-bold text-indigo-600 bg-indigo-50">{avg}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col p-4 gap-2">
        <div className="text-xl font-bold p-4 border-b border-slate-700 mb-2">Admin Panel</div>
        <button onClick={() => setTab('periods')} className={`p-3 rounded text-left flex gap-3 ${tab === 'periods' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}><Clock size={18}/> Ujian</button>
        <button onClick={() => setTab('users')} className={`p-3 rounded text-left flex gap-3 ${tab === 'users' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}><Users size={18}/> Siswa</button>
        <button onClick={() => setTab('recap')} className={`p-3 rounded text-left flex gap-3 ${tab === 'recap' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}><BarChart3 size={18}/> Rekap</button>
        <button onClick={() => setTab('config')} className={`p-3 rounded text-left flex gap-3 ${tab === 'config' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}><Settings size={18}/> Pengaturan</button>
        <div className="flex-1"></div>
        <button onClick={onLogout} className="p-3 rounded bg-red-900/50 text-red-400 hover:bg-red-900 flex gap-2"><LogOut size={18}/> Logout</button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* --- TAB UJIAN --- */}
        {tab === 'periods' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="font-bold text-lg mb-4">Buat Periode Baru</h2>
              <div className="flex gap-2">
                <input value={newPeriodName} onChange={e => setNewPeriodName(e.target.value)} placeholder="Nama Periode (Misal: Tryout Akbar 1)" className="border p-2 rounded flex-1"/>
                <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-4 rounded font-bold">Buat</button>
              </div>
            </div>
            
            <div className="space-y-4">
              {periods.map(p => (
                <div key={p.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer" onClick={() => setExpandedPeriod(expandedPeriod === p.id ? null : p.id)}>
                    <div className="font-bold">{p.name}</div>
                    <div className="flex gap-2 text-sm text-slate-500">
                      {p.is_active ? <span className="text-green-600 font-bold">AKTIF</span> : "Non-Aktif"}
                      {expandedPeriod === p.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </div>
                  </div>
                  {expandedPeriod === p.id && (
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {p.exams.map(ex => (
                          <div key={ex.id} className="border p-3 rounded bg-white">
                            <div className="font-bold text-sm mb-2">{ex.title} ({ex.code})</div>
                            <div className="text-xs text-slate-500 mb-3">{ex.q_count} Soal • {ex.duration} Menit</div>
                            <label className="block w-full text-center py-2 border border-dashed border-indigo-300 rounded cursor-pointer hover:bg-indigo-50 text-indigo-600 text-xs font-bold">
                              Upload Excel ({ex.code})
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
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2 items-center">
                <input type="file" id="upload-users" hidden onChange={handleUploadUsers} accept=".csv,.xlsx"/>
                <label htmlFor="upload-users" className="bg-green-600 text-white px-4 py-2 rounded flex gap-2 items-center cursor-pointer hover:bg-green-700"><Upload size={16}/> Import Excel</label>
                <button onClick={handleDeleteUsers} disabled={selectedUsers.length === 0} className="bg-red-600 text-white px-4 py-2 rounded flex gap-2 items-center hover:bg-red-700 disabled:opacity-50"><Trash2 size={16}/> Hapus ({selectedUsers.length})</button>
              </div>
              <div className="flex gap-2">
                <input placeholder="Username" className="border p-2 rounded w-32" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/>
                <input placeholder="Nama Lengkap" className="border p-2 rounded w-48" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/>
                <button onClick={handleAddUser} className="bg-blue-600 text-white px-4 rounded"><Plus size={20}/></button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 w-10"><input type="checkbox" onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u.id) : [])}/></th>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Sekolah</th>
                    <th className="p-3">Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={(e) => {
                        if(e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                        else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                      }}/></td>
                      <td className="p-3 font-bold">{u.full_name}</td>
                      <td className="p-3">{u.username}</td>
                      <td className="p-3">{u.school || "-"}</td>
                      <td className="p-3 font-mono text-slate-400">{u.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB REKAP --- */}
        {tab === 'recap' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Rekapitulasi Nilai</h2>
              <div className="flex gap-2">
                <a href={`${apiUrl}/admin/recap/download`} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white px-4 py-2 rounded flex gap-2"><FileText size={18}/> Excel</a>
                <a href={`${apiUrl}/admin/recap/download-pdf`} target="_blank" rel="noreferrer" className="bg-red-600 text-white px-4 py-2 rounded flex gap-2"><FileText size={18}/> PDF</a>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {renderRecap()}
            </div>
          </div>
        )}

        {/* --- TAB PENGATURAN (UPLOAD JURUSAN) --- */}
        {tab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target className="text-blue-600"/> Database Jurusan</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-800">Upload file Excel berisi daftar jurusan (Format: Universitas, Prodi, Passing_Grade) di sini jika ingin memperbarui data.</p>
              </div>
              <div className="flex items-center gap-4">
                <input type="file" id="upload-major" hidden onChange={handleUploadMajors} accept=".csv,.xlsx"/>
                <label htmlFor="upload-major" className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 font-bold flex items-center gap-2">
                  <Upload size={20}/> Upload File Jurusan
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-4">Pengumuman Kelulusan</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={async () => {
                    await fetch(`${apiUrl}/config/release`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({value: (!isReleased).toString()}) });
                    setIsReleased(!isReleased);
                  }}
                  className={`px-6 py-3 rounded-lg font-bold text-white transition ${isReleased ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isReleased ? "Tutup Pengumuman (Sembunyikan Nilai)" : "Rilis Pengumuman (Tampilkan Nilai)"}
                </button>
                <span className="text-sm text-slate-500">Status saat ini: <strong>{isReleased ? "DIRILIS" : "DITUTUP"}</strong></span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;