import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, Users, LogOut, Clock, Search, LayoutDashboard, BarChart3, Settings, RefreshCcw, FileText, Filter, Lock, Unlock, Eye, X, Save } from 'lucide-react';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [targetSchool, setTargetSchool] = useState('Semua'); 
  const [schoolList, setSchoolList] = useState(['Semua']); 
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', school: '', role: 'student' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('Semua');
  const [isReleased, setIsReleased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState(null);
  const [itemAnalysis, setItemAnalysis] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

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
        setSchoolList(s);
        setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreatePeriod = async () => {
    if (!newPeriodName) return;
    await fetch(`${apiUrl}/admin/periods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newPeriodName, target_schools: targetSchool }) });
    setNewPeriodName(''); fetchData();
  };
  const handleDeletePeriod = async (pid) => { if(window.confirm("Hapus TO?")) { await fetch(`${apiUrl}/admin/periods/${pid}`, { method: 'DELETE' }); fetchData(); } };
  const handleTogglePeriod = async (pid) => { await fetch(`${apiUrl}/admin/periods/${pid}/toggle`, { method: 'POST' }); fetchData(); };

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
      try { 
          const res = await fetch(`${apiUrl}/admin/exams/${examId}/preview`); 
          if(!res.ok) throw new Error();
          setPreviewQuestions(await res.json()); 
          
          try {
            const res2 = await fetch(`${apiUrl}/admin/exams/${examId}/analysis`);
            if(res2.ok) setItemAnalysis(await res2.json());
          } catch(e) { setItemAnalysis([]); }
      } catch { alert("Gagal load preview."); }
  };

  const handleSaveQuestion = async () => {
      if(!editingQuestion) return;
      await fetch(`${apiUrl}/admin/questions/${editingQuestion.id}`, { 
          method: 'PUT', headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({
              text: editingQuestion.text,
              explanation: editingQuestion.explanation,
              correct_answer: editingQuestion.correct_answer,
              options: editingQuestion.raw_options
          })
      });
      alert("Tersimpan!"); setEditingQuestion(null); setPreviewQuestions(null);
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return alert("Isi data!");
    const res = await fetch(`${apiUrl}/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    if(res.ok) { alert("Sukses"); setNewUser({ username: '', password: '', full_name: '', school: '', role: 'student' }); fetchData(); }
    else alert("Gagal/Username ada");
  };

  const handleUploadUsers = async (e) => { 
      const file = e.target.files[0]; const formData = new FormData(); formData.append('file', file); setImportLoading(true);
      const res = await fetch(`${apiUrl}/admin/users/bulk`, { method: 'POST', body: formData }); 
      const data = await res.json(); setImportLoading(false); alert(data.message); fetchData(); 
  };
  
  const handleDeleteUsers = async () => { if (window.confirm(`Hapus ${selectedUsers.length} siswa?`)) { await fetch(`${apiUrl}/admin/users/delete-bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_ids: selectedUsers }) }); setSelectedUsers([]); fetchData(); } };
  const handleUploadMajors = async (e) => { const file = e.target.files[0]; const formData = new FormData(); formData.append('file', file); const res = await fetch(`${apiUrl}/admin/upload-majors`, { method: 'POST', body: formData }); alert((await res.json()).message); };

  const handleReset = async (userId, examId = null) => {
      if(!window.confirm("Reset nilai?")) return;
      await fetch(`${apiUrl}/admin/reset-result`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: userId, exam_id: examId }) });
      alert("Berhasil di-reset!"); fetchData();
  };

  const filteredUsers = users.filter(u => u.full_name.toLowerCase().includes(searchUser.toLowerCase()) && (selectedSchoolFilter === 'Semua' || u.school === selectedSchoolFilter));

  const renderText = (text) => {
      if(!text || text === 'nan') return "";
      let formatted = text.replace(/\[B\]/gi, '<b>').replace(/\[\/B\]/gi, '</b>').replace(/\[I\]/gi, '<i>').replace(/\[\/I\]/gi, '</i>');
      return <span dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br/>') }} />;
  };

  const renderRecap = () => {
    const studentWithResults = filteredUsers.filter(u => u.results && u.results.length > 0);
    if (studentWithResults.length === 0) return <div className="p-8 text-center text-slate-400">Belum ada data.</div>;
    return (
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b font-bold"><tr><th className="p-4 sticky left-0 bg-slate-50 border-r">Nama</th><th className="p-4">Sekolah</th>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=><th key={k} className="p-4 text-center border-l w-16">{k}</th>)}<th className="p-4 text-center bg-indigo-50 border-l">AVG</th><th className="p-4 text-center border-l">Aksi</th></tr></thead>
                <tbody className="divide-y">{studentWithResults.map(u => {
                    const scores = {}; u.results.forEach(r => scores[r.exam_id.split('_').pop()] = {val: Math.round(r.irt_score), eid: r.exam_id});
                    const total = Object.values(scores).reduce((a,b)=>a+b.val,0);
                    const avg = Math.round(total/7);
                    return (<tr key={u.id} className="hover:bg-slate-50"><td className="p-4 font-bold sticky left-0 bg-white border-r">{u.full_name}</td><td className="p-4">{u.school}</td>{["PU","PPU","PBM","PK","LBI","LBE","PM"].map(k=> (<td key={k} className={`p-4 text-center border-l cursor-pointer hover:bg-red-50 hover:text-red-600 transition ${scores[k] ? 'font-bold' : 'text-slate-300'}`} onClick={() => scores[k] && handleReset(u.id, scores[k].eid)}>{scores[k]?.val || "-"}</td>))}<td className="p-4 text-center font-bold bg-indigo-50 border-l">{avg}</td><td className="p-4 text-center border-l"><button onClick={() => handleReset(u.id)} className="p-1 bg-red-100 text-red-600 rounded"><Trash2 size={16}/></button></td></tr>);
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
        {tab === 'periods' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex gap-4 items-center">
                <input value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)} placeholder="Nama Tryout" className="flex-1 border-0 bg-slate-50 rounded-xl px-4 py-2 font-bold focus:ring-2 ring-indigo-500"/>
                <select value={targetSchool} onChange={e=>setTargetSchool(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-4 py-2 font-medium outline-none focus:ring-2 ring-indigo-500">{schoolList.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-6 py-2 h-full rounded-xl font-bold hover:bg-indigo-700 shadow-lg"><Plus size={20} className="inline mr-2"/> Buat</button>
            </div>
            <div className="space-y-4">
              {periods.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 flex justify-between items-center bg-white border-b">
                    <div onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)} className="cursor-pointer flex-1">
                        <div className="font-bold text-lg">{p.name}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1 flex gap-2"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Target: {p.target_schools || "Semua"}</span><span className={`px-2 py-0.5 rounded flex items-center gap-1 ${p.is_active?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{p.is_active ? "RILIS" : "TERKUNCI"}</span></div>
                    </div>
                    <div className="flex gap-2"><button onClick={()=>handleTogglePeriod(p.id)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:text-indigo-600">{p.is_active?<Lock size={18}/>:<Unlock size={18}/>}</button><button onClick={()=>handleDeletePeriod(p.id)} className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100"><Trash2 size={18}/></button></div>
                  </div>
                  {expandedPeriod===p.id && (
                    <div className="p-6 grid grid-cols-4 gap-4 bg-slate-50">
                        {p.exams.map(ex => {
                            const hasQ = ex.q_count > 0;
                            return (
                                <div key={ex.id} className={`p-4 border-2 rounded-xl text-center transition ${hasQ ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'}`}>
                                    <div className="font-bold text-slate-800 text-lg mb-1 flex items-center justify-center gap-2">{ex.code} {hasQ && <CheckCircle size={18} className="text-emerald-600"/>}</div>
                                    <div className={`text-xs mb-2 font-medium ${hasQ ? 'text-emerald-600' : 'text-slate-400'}`}>{ex.q_count} Soal Terisi</div>
                                    <div className="flex flex-col gap-2">
                                        <label className={`block w-full py-2 rounded-lg text-xs font-bold cursor-pointer transition ${hasQ ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                            <Upload size={12} className="inline mr-1"/> {hasQ ? 'Update File' : 'Upload Excel'}
                                            <input type="file" hidden onChange={(e)=>handleUploadQuestion(e, ex.id)} accept=".csv,.xlsx"/>
                                        </label>
                                        <button disabled={!hasQ} onClick={()=>handlePreviewExam(ex.id)} className={`flex items-center justify-center gap-2 w-full py-2 border rounded-lg text-xs font-bold transition ${hasQ ? 'border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-600' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}>
                                            <Eye size={12}/> Preview & Edit
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL PREVIEW */}
        {previewQuestions && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold">Preview: {previewQuestions.title}</h3><button onClick={() => setPreviewQuestions(null)}><X/></button></div>
                    <div className="flex-1 overflow-hidden flex">
                        <div className="w-2/3 p-6 overflow-y-auto border-r">
                            {previewQuestions.questions.map((q, i) => (
                                <div key={i} className="mb-6 p-4 border rounded-xl bg-slate-50 relative group">
                                    <button onClick={() => setEditingQuestion(q)} className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow opacity-0 group-hover:opacity-100 text-blue-600"><Edit size={16}/></button>
                                    <div className="font-bold text-xs text-slate-400 mb-2">NO. {i+1} ({q.type})</div>
                                    <div className="prose prose-sm mb-2">{renderText(q.text)}</div>
                                    {q.image_url && <img src={q.image_url} alt="soal" className="max-h-40 rounded mb-2"/>}
                                    {q.options_preview && <ul className="text-sm list-none space-y-1 mb-2 pl-2 border-l-2 border-slate-200">
                                        {q.options_preview.map((opt, idx) => <li key={idx} className="text-slate-600">{renderText(opt)}</li>)}
                                    </ul>}
                                    <div className="text-xs font-bold text-emerald-600">Kunci: {q.correct_answer}</div>
                                    <div className="text-xs text-slate-500 mt-1 border-t pt-1">Pembahasan: {q.explanation || "-"}</div>
                                </div>
                            ))}
                        </div>
                        <div className="w-1/3 p-6 overflow-y-auto bg-slate-50">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 size={18}/> Analisis Butir Soal</h4>
                            {itemAnalysis && itemAnalysis.length > 0 ? (
                                <div className="space-y-2">{itemAnalysis.map(a => (<div key={a.no} className="bg-white p-3 rounded-lg border text-xs"><div className="flex justify-between mb-1"><span className="font-bold">No {a.no}</span><span>Diff: {a.difficulty}</span></div><div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1"><div className="bg-indigo-600 h-full" style={{width: `${a.percent}%`}}></div></div><div className="flex justify-between text-slate-500"><span>Benar: {a.correct}/{a.total}</span><span>{a.percent}%</span></div></div>))}</div>
                            ) : <div className="text-center text-slate-400">Belum ada data.</div>}
                        </div>
                    </div>
                </div>
                {/* MODAL EDIT */}
                {editingQuestion && (
                    <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center">
                        <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h3 className="font-bold mb-4">Edit Soal</h3>
                            <label className="text-xs font-bold text-slate-500">Pertanyaan</label>
                            <textarea className="w-full p-2 border rounded mb-2 h-24" value={editingQuestion.text} onChange={e=>setEditingQuestion({...editingQuestion, text:e.target.value})}></textarea>
                            
                            {(editingQuestion.type === 'multiple_choice' || editingQuestion.type === 'complex') && (
                                <>
                                    <label className="text-xs font-bold text-slate-500 mt-2 block">Opsi A-E</label>
                                    {editingQuestion.raw_options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 mb-1">
                                            <span className="font-bold w-4 text-center">{['A','B','C','D','E'][idx]}</span>
                                            <input className="flex-1 p-1 border rounded text-sm" value={opt} onChange={e => {
                                                const newOpts = [...editingQuestion.raw_options];
                                                newOpts[idx] = e.target.value;
                                                setEditingQuestion({...editingQuestion, raw_options: newOpts});
                                            }}/>
                                        </div>
                                    ))}
                                </>
                            )}

                            <label className="text-xs font-bold text-slate-500 mt-2 block">Kunci Jawaban</label>
                            <input className="w-full p-2 border rounded mb-2" value={editingQuestion.correct_answer} onChange={e=>setEditingQuestion({...editingQuestion, correct_answer:e.target.value})} placeholder="Contoh: A (atau A,B untuk kompleks)"/>

                            <label className="text-xs font-bold text-slate-500 mt-2 block">Pembahasan</label>
                            <textarea className="w-full p-2 border rounded mb-4 h-24" value={editingQuestion.explanation || ''} onChange={e=>setEditingQuestion({...editingQuestion, explanation:e.target.value})} placeholder="Tulis pembahasan disini..."></textarea>
                            
                            <div className="flex gap-2 justify-end">
                                <button onClick={()=>setEditingQuestion(null)} className="px-4 py-2 rounded border">Batal</button>
                                <button onClick={handleSaveQuestion} className="px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2"><Save size={16}/> Simpan</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* ... (SISANYA SAMA) ... */}
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
                <div className="flex gap-3">
                    <label className={`text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 cursor-pointer shadow-lg transition ${importLoading ? 'bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                        {importLoading ? <RefreshCcw className="animate-spin" size={18}/> : <Upload size={18}/>} 
                        {importLoading ? "Mengimport..." : "Import"}
                        <input type="file" hidden onChange={handleUploadUsers} disabled={importLoading}/>
                    </label>
                    <button onClick={handleDeleteUsers} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg transition"><Trash2 size={18}/> Hapus</button>
                </div>
                <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border items-center">
                    <input placeholder="User" className="bg-transparent px-2 w-24 outline-none" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/>
                    <input placeholder="Nama" className="bg-transparent px-2 w-32 outline-none border-l" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/>
                    <input placeholder="Sekolah" className="bg-transparent px-2 w-32 outline-none border-l" value={newUser.school} onChange={e=>setNewUser({...newUser, school:e.target.value})}/>
                    <input placeholder="Pass" className="bg-transparent px-2 w-20 outline-none border-l" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/>
                    <select className="bg-transparent px-2 outline-none border-l text-sm" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}><option value="student">Siswa</option><option value="admin">Admin</option></select>
                    <button onClick={handleAddUser} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={18}/></button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-50"><input placeholder="Cari siswa..." className="outline-none text-sm w-full bg-transparent" value={searchUser} onChange={e=>setSearchUser(e.target.value)}/></div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left"><thead className="bg-slate-50 sticky top-0"><tr><th className="p-4 w-10">#</th><th className="p-4">Nama</th><th className="p-4">User</th><th className="p-4">Sekolah</th><th className="p-4">Role</th><th className="p-4">Pass</th></tr></thead><tbody className="divide-y">{filteredUsers.map(u=>(<tr key={u.id} className="hover:bg-slate-50"><td className="p-4"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={e=>{if(e.target.checked)setSelectedUsers([...selectedUsers,u.id]); else setSelectedUsers(selectedUsers.filter(id=>id!==u.id))}}/></td><td className="p-4 font-bold">{u.full_name}</td><td className="p-4">{u.username}</td><td className="p-4">{u.school}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-50 text-blue-600'}`}>{u.role}</span></td><td className="p-4 font-mono text-slate-500">{u.password}</td></tr>))}</tbody></table>
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
      </main>
    </div>
  );
};

export default AdminDashboard;