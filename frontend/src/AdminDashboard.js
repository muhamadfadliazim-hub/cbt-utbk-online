import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, FileSpreadsheet, Upload, CheckSquare, Square, LogOut, Edit3, Eye, X } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Render Soal Helper untuk Admin Preview
const RenderPreview = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^\$]+\$)/g);
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

const AdminDashboard = ({ onLogout }) => {
    // ... (State lama sama, tambah state Preview)
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    
    // NEW: PREVIEW STATE
    const [previewExamId, setPreviewExamId] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);

    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK' });
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', url: '' });

    const refresh = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>{setUsers(Array.isArray(d)?d:[]); setSelectedUsers([]);});
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[]));
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>setMaterials(Array.isArray(d)?d:[]));
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // ... (Fungsi Toggle, Delete, Upload sama seperti V33) ...
    const toggleSelect = (id) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleSelectAll = () => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
    const deleteSelected = () => {
        if(!window.confirm(`Hapus ${selectedUsers.length} user?`)) return;
        fetch(`${API_URL}/admin/users/delete-list`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids: selectedUsers })})
        .then(() => { alert("Terhapus!"); refresh(); });
    };
    
    const handleUploadSoal = (eid, file) => {
        const f = new FormData(); f.append('file', file);
        fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Upload Sukses!"));
    };
    const handleUploadPassingGrade = (file) => {
        const f = new FormData(); f.append('file', file);
        fetch(`${API_URL}/admin/majors/bulk`, {method:'POST', body:f}).then(()=>alert("Passing Grade Updated!"));
    };

    // LOGIC PREVIEW
    const openPreview = (eid) => {
        fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d => {
            setPreviewQuestions(d.questions);
            setPreviewExamId(eid);
        });
    };

    // Handlers
    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newUser)}).then(()=>{setShowUserModal(false);refresh()}); };
    const handleAddPeriod = (e) => { e.preventDefault(); const f=new FormData();f.append('name',newPeriod.name);f.append('exam_type',newPeriod.exam_type); fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); };
    const handleAddLms = (e) => { e.preventDefault(); const f=new FormData();f.append('title',newLms.title);f.append('type',newLms.type);f.append('category',newLms.category);f.append('url',newLms.url); fetch(`${API_URL}/materials`,{method:'POST',body:f}).then(()=>{setShowLmsModal(false);refresh()}); };

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
            <aside className="w-64 bg-[#0F172A] text-white p-6 flex flex-col shadow-2xl">
                <h2 className="text-2xl font-black mb-10 italic text-indigo-400">EduPrime V36</h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 ${activeTab==='users'?'bg-indigo-600':'hover:bg-white/5'}`}><Users size={18}/> Peserta</button>
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 ${activeTab==='exams'?'bg-indigo-600':'hover:bg-white/5'}`}><Database size={18}/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('lms')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 ${activeTab==='lms'?'bg-indigo-600':'hover:bg-white/5'}`}><BookOpen size={18}/> LMS</button>
                </nav>
                <button onClick={onLogout} className="mt-auto p-3 bg-rose-500/10 text-rose-500 rounded-xl font-bold flex justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all"><LogOut size={18}/> Logout</button>
            </aside>

            <main className="flex-1 p-10 overflow-y-auto">
                {/* Header & Buttons (Sama V33) */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black uppercase tracking-tight">{activeTab}</h1>
                    {activeTab === 'users' && (
                        <div className="flex gap-2">
                            {selectedUsers.length > 0 && <button onClick={deleteSelected} className="bg-rose-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Trash2 size={18}/> Hapus {selectedUsers.length}</button>}
                            <label className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-2"><Upload size={18}/> Pass Grade <input type="file" className="hidden" onChange={e=>handleUploadPassingGrade(e.target.files[0])}/></label>
                            <label className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-2"><FileSpreadsheet size={18}/> Impor Siswa <input type="file" className="hidden" onChange={e=>{const f=new FormData();f.append('file',e.target.files[0]);fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh)}}/></label>
                            <button onClick={()=>setShowUserModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Plus size={18}/> Manual</button>
                        </div>
                    )}
                    {activeTab === 'exams' && <button onClick={()=>setShowPeriodModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Plus size={18}/> Paket Baru</button>}
                    {activeTab === 'lms' && <button onClick={()=>setShowLmsModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Plus size={18}/> Tambah Materi</button>}
                </div>

                {/* USER TABLE */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-6 w-10 text-center cursor-pointer hover:text-indigo-600" onClick={toggleSelectAll}>{selectedUsers.length===users.length && users.length>0 ? <CheckSquare size={18}/> : <Square size={18}/>}</th>
                                    <th className="p-6">Nama Lengkap</th>
                                    <th className="p-6">Username</th>
                                    <th className="p-6">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className={`border-b hover:bg-slate-50 cursor-pointer ${selectedUsers.includes(u.id)?'bg-indigo-50':''}`} onClick={()=>toggleSelect(u.id)}>
                                        <td className="p-6 text-center">{selectedUsers.includes(u.id)?<CheckSquare className="text-indigo-600" size={18}/>:<Square className="text-slate-300" size={18}/>}</td>
                                        <td className="p-6 font-bold">{u.full_name}</td>
                                        <td className="p-6 font-mono text-sm">{u.username}</td>
                                        <td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* EXAM PERIODS */}
                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black">{p.name} <span className="text-indigo-600 text-lg">[{p.exam_type}]</span></h3>
                                    <button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)} className="text-rose-400 hover:text-rose-600"><Trash2 size={18}/></button>
                                </div>
                                <div className="space-y-3">
                                    {p.exams?.map(e => (
                                        <div key={e.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center hover:bg-slate-100 transition-all">
                                            <div><p className="font-bold text-slate-700">{e.title}</p><p className="text-xs text-slate-400">Order: {e.order_index} | {e.duration} m</p></div>
                                            <div className="flex gap-2">
                                                <button onClick={()=>openPreview(e.id)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all" title="Preview Soal"><Eye size={14}/></button>
                                                <label className="p-2 bg-white border rounded-lg cursor-pointer hover:border-indigo-500 text-indigo-600 flex items-center gap-2 text-xs font-bold">
                                                    <Upload size={14}/> Excel
                                                    <input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LMS (Sama) */}
                {activeTab === 'lms' && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {materials.map(m => (
                            <div key={m.id} className="bg-white p-6 rounded-3xl shadow-lg border">
                                <h4 className="font-bold mb-2">{m.title}</h4>
                                <div className="flex justify-between mt-4">
                                    <button onClick={()=>window.open(m.content_url)} className="text-indigo-600 font-bold text-xs">BUKA</button>
                                    <button onClick={()=>fetch(`${API_URL}/materials/${m.id}`,{method:'DELETE'}).then(refresh)} className="text-rose-400"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            
            {/* Modal PREVIEW SOAL (FITUR BARU) */}
            {previewExamId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[100] backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col relative">
                        <div className="bg-indigo-900 p-6 flex justify-between items-center text-white">
                            <h3 className="font-bold text-xl">PREVIEW SOAL ({previewQuestions.length} Butir)</h3>
                            <button onClick={()=>setPreviewExamId(null)} className="p-2 bg-white/10 rounded-full hover:bg-rose-500"><X size={20}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
                            {previewQuestions.map((q, i) => (
                                <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                                    <div className="font-bold text-indigo-600 mb-2">NO {i+1} ({q.type})</div>
                                    {q.passage && <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-sm font-serif leading-relaxed whitespace-pre-wrap"><RenderPreview text={q.passage}/></div>}
                                    {q.media && <img src={q.media} alt="Soal" className="h-40 object-contain mb-4 border rounded"/>}
                                    <div className="text-lg font-medium mb-4"><RenderPreview text={q.text}/></div>
                                    <div className="grid gap-2">
                                        {q.options.map(o => (
                                            <div key={o.id} className="p-3 border rounded-xl flex gap-3 items-center">
                                                <span className="font-bold w-6 h-6 bg-slate-200 flex items-center justify-center rounded-full text-xs">{o.id}</span>
                                                <RenderPreview text={o.label}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal User & Period & LMS (Sama V33 - Saya singkat agar muat) */}
            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddUser} className="bg-white p-8 rounded-3xl w-full max-w-sm"><h3 className="text-xl font-bold mb-4">Tambah User</h3><input className="w-full mb-3 p-3 border rounded-xl" placeholder="Nama" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})}/><input className="w-full mb-3 p-3 border rounded-xl" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})}/><input className="w-full mb-3 p-3 border rounded-xl" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})}/><button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button><button type="button" onClick={()=>setShowUserModal(false)} className="w-full mt-2 p-3 bg-slate-100 rounded-xl font-bold">Batal</button></form></div>}
            {showPeriodModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddPeriod} className="bg-white p-8 rounded-3xl w-full max-w-sm"><h3 className="text-xl font-bold mb-4">Paket Baru</h3><input className="w-full mb-3 p-3 border rounded-xl" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name: e.target.value})}/><select className="w-full mb-3 p-3 border rounded-xl" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type: e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option></select><button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Buat</button><button type="button" onClick={()=>setShowPeriodModal(false)} className="w-full mt-2 p-3 bg-slate-100 rounded-xl font-bold">Batal</button></form></div>}
            {showLmsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddLms} className="bg-white p-8 rounded-3xl w-full max-w-sm"><h3 className="text-xl font-bold mb-4">Materi Baru</h3><input className="w-full mb-3 p-3 border rounded-xl" placeholder="Judul" value={newLms.title} onChange={e=>setNewLms({...newLms, title: e.target.value})}/><input className="w-full mb-3 p-3 border rounded-xl" placeholder="URL" value={newLms.url} onChange={e=>setNewLms({...newLms, url: e.target.value})}/><button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button><button type="button" onClick={()=>setShowLmsModal(false)} className="w-full mt-2 p-3 bg-slate-100 rounded-xl font-bold">Batal</button></form></div>}
        </div>
    );
};
export default AdminDashboard;