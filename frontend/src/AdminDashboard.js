import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, 
  CheckCircle, Clock, Search, LayoutDashboard, BarChart3, Settings, 
  RefreshCcw, FileText, Target, Filter, Eye, X, Lock, Unlock 
} from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  
  // STATE UJIAN
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState(null); // UNTUK PREVIEW SOAL
  
  // STATE SISWA
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', school: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  
  // STATE FILTER & CONFIG
  const [selectedSchool, setSelectedSchool] = useState('Semua'); 
  const [schoolList, setSchoolList] = useState(['Semua']); 
  const [isReleased, setIsReleased] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FETCH DATA COMPLETE ---
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

  // --- LOGIC FILTER CABANG ---
  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchUser.toLowerCase()) && 
    (selectedSchool === 'Semua' || u.school === selectedSchool)
  );

  // --- ACTION HANDLERS ---
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

  // FITUR PREVIEW SOAL (YANG HILANG)
  const handlePreviewExam = async (examId) => {
      try {
          const res = await fetch(`${apiUrl}/admin/exams/${examId}/preview`);
          const data = await res.json();
          setPreviewQuestions(data);
      } catch { alert("Gagal memuat soal."); }
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

  // --- RENDERERS ---
  const renderText = (text) => {
      if(!text) return "";
      const parts = text.split(/(\$.*?\$)/g);
      return parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) return <span key={index} className="mx-1"><InlineMath math={part.replace(/\$/g, '')} /></span>;
          return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
      });
  };

  // RENDER TABEL REKAP (DENGAN DETAIL SUBTES)
  const renderRecap = () => {
    const studentWithResults = filteredUsers.filter(u => u.results && u.results.length > 0);
    
    if (studentWithResults.length === 0) return <div className="p-10 text-center bg-white border border-dashed rounded-xl text-slate-400">Belum ada data nilai untuk filter ini.</div>;

    const subtests = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"];

    return (
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b font-bold text-slate-600">
                <tr>
                    <th className="p-4 w-48 sticky left-0 bg-slate-50 z-10 border-r">Nama Siswa</th>
                    <th className="p-4 w-32">Sekolah</th>
                    {subtests.map(k=><th key={k} className="p-4 text-center w-16 border-l">{k}</th>)}
                    <th className="p-4 text-center bg-indigo-50 text-indigo-800 w-20 border-l border-indigo-100">AVG</th>
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
                        <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white border-r">{u.full_name}</td>
                        <td className="p-4 text-slate-500 text-xs">{u.school}</td>
                        {subtests.map(k => (
                            <td key={k} className={`p-4 text-center border-l ${scores[k] ? 'font-bold text-slate-700' : 'text-slate-300'}`}>
                                {scores[k] || "-"}
                            </td>
                        ))}
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
      {/* SIDEBAR */}
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

        {/* TAB UJIAN (DENGAN PREVIEW SOAL) */}
        {tab === 'periods' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex gap-4">
                <input value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)} placeholder="Nama Tryout Baru" className="flex-1 border-0 bg-slate-50 rounded-xl px-4 font-bold text-lg focus:ring-2 ring-indigo-500"/>
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
                            <div key={ex.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition text-center group relative">
                                <div className="font-bold text-slate-800 text-lg mb-1">{ex.code}</div>
                                <div className="text-xs text-slate-500 mb-4">{ex.q_count} Soal • {ex.duration} Menit</div>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 rounded-lg text-xs font-bold text-indigo-600 cursor-pointer hover:bg-indigo-100 transition">
                                        <Upload size={14}/> Upload Excel
                                        <input type="file" hidden onChange={(e)=>handleUploadQuestion(e, ex.id)} accept=".csv,.xlsx"/>
                                    </label>
                                    <button onClick={() => handlePreviewExam(ex.id)} className="flex items-center justify-center gap-2 w-full py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition">
                                        <Eye size={14}/> Preview Soal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL PREVIEW SOAL */}
        {previewQuestions && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
                    <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-xl text-slate-800">{previewQuestions.title}</h3>
                        <button onClick={() => setPreviewQuestions(null)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"><X size={24}/></button>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-8 bg-slate-50">
                        {previewQuestions.questions.length === 0 ? <div className="text-center text-slate-400">Belum ada soal.</div> : 
                        previewQuestions.questions.map((q, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{i+1}</div>
                                    <div className="flex-1 space-y-4">
                                        <div className="prose prose-sm max-w-none text-slate-700 font-medium">
                                            {q.reading_material && <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm italic mb-4 whitespace-pre-wrap">{q.reading_material}</div>}
                                            {q.image_url && <img src={q.image_url} alt="Soal" className="max-w-full h-auto rounded-lg mb-4 border border-slate-200"/>}
                                            <p className="whitespace-pre-wrap">{renderText(q.text)}</p>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm"><CheckCircle size={16}/> Kunci: {q.correct_answer}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* TAB SISWA & REKAP (DENGAN FILTER CABANG) */}
        {(tab === 'users' || tab === 'recap') && (
            <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm sticky top-0 z-10">
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

        {/* TAB SISWA */}
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
                    <input placeholder="Sekolah" className="bg-transparent px-2 w-40 font-medium outline-none border-l" value={newUser.school} onChange={e=>setNewUser({...newUser, school:e.target.value})}/>
                    <button onClick={handleAddUser} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={18}/></button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-50"><div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"><Search size={16} className="text-slate-400"/><input placeholder="Cari nama siswa..." className="outline-none text-sm w-full" value={searchUser} onChange={e=>setSearchUser(e.target.value)}/></div></div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 sticky top-0"><tr><th className="p-4 w-10">#</th><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Sekolah</th><th className="p-4">Pwd</th></tr></thead>
                        <tbody className="divide-y">
                            {filteredUsers.map(u=>(
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={e=>{if(e.target.checked)setSelectedUsers([...selectedUsers,u.id]); else setSelectedUsers(selectedUsers.filter(id=>id!==u.id))}}/></td>
                                    <td className="p-4 font-bold text-slate-700">{u.full_name}</td><td className="p-4 text-slate-500">{u.username}</td><td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{u.school}</span></td>
                                    <td className="p-4 text-slate-400 font-mono">{u.password}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {/* TAB REKAP NILAI */}
        {tab === 'recap' && <div className="space-y-6 animate-fade-in">{renderRecap()}</div>}

        {/* TAB CONFIG */}
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
                {/* TOGGLE PENGUMUMAN */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border flex gap-6 items-center">
                    <div className={`p-4 rounded-2xl ${isReleased?'bg-emerald-100 text-emerald-600':'bg-slate-100 text-slate-500'}`}><RefreshCcw size={32}/></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800">Pengumuman Nilai</h3>
                        <p className="text-sm text-slate-500 mb-4">Status saat ini: <strong className={isReleased?"text-emerald-600":"text-slate-600"}>{isReleased?"PUBLIK":"PRIVAT"}</strong></p>
                        <button onClick={async()=>{await fetch(`${apiUrl}/config/release`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:(!isReleased).toString()})}); setIsReleased(!isReleased)}} className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition ${isReleased?'bg-red-500 hover:bg-red-600 shadow-red-200 flex items-center gap-2':'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 flex items-center gap-2'}`}>
                            {isReleased ? <><Lock size={18}/> Tutup Akses Nilai</> : <><Unlock size={18}/> Rilis Nilai ke Siswa</>}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;