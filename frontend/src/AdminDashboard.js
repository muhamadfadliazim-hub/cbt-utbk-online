import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, FileSpreadsheet, Upload, CheckSquare, Square, LogOut, Eye, X } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const RenderPreview = ({ text }) => { if (!text) return null; const parts = text.split(/(\$[^$]+\$)/g); return (<span>{parts.map((part, index) => { if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />; return <span key={index}>{part}</span>; })}</span>); };

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    const [previewExamId, setPreviewExamId] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    
    // Form States
    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'peserta' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK' });
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', url: '' });

    // State Input Manual Soal (Agar bisa nulis pembahasan)
    const [showManualModal, setShowManualModal] = useState(null); // Exam ID
    const [manualQ, setManualQ] = useState({ text: '', type: 'PG', explanation: '', difficulty: 1.0, options: [{idx:'A', label:'', is_correct:false}, {idx:'B', label:'', is_correct:false}, {idx:'C', label:'', is_correct:false}, {idx:'D', label:'', is_correct:false}, {idx:'E', label:'', is_correct:false}] });

    const refresh = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>{setUsers(Array.isArray(d)?d:[]); setSelectedUsers([]);});
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[]));
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>setMaterials(Array.isArray(d)?d:[]));
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const toggleSelect = (id) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleSelectAll = () => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
    const deleteSelected = () => { if(!window.confirm(`Hapus ${selectedUsers.length} peserta?`)) return; fetch(`${API_URL}/admin/users/delete-list`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids: selectedUsers })}).then(() => { alert("Terhapus!"); refresh(); }); };
    
    const handleUploadSoal = (eid, file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Sukses!")); };
    const handleUploadPassingGrade = (file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/majors/bulk`, {method:'POST', body:f}).then(()=>alert("Passing Grade Updated!")); };
    const openPreview = (eid) => { fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d => { setPreviewQuestions(d.questions); setPreviewExamId(eid); }); };
    
    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newUser)}).then(()=>{setShowUserModal(false);refresh()}); };
    const handleAddPeriod = (e) => { e.preventDefault(); const f=new FormData();f.append('name',newPeriod.name);f.append('exam_type',newPeriod.exam_type); fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); };
    const handleAddLms = (e) => { e.preventDefault(); const f=new FormData();f.append('title',newLms.title);f.append('type',newLms.type);f.append('category',newLms.category);f.append('url',newLms.url); fetch(`${API_URL}/materials`,{method:'POST',body:f}).then(()=>{setShowLmsModal(false);refresh()}); };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
            <aside className="w-full md:w-64 bg-[#0F172A] text-white p-6 flex flex-row md:flex-col justify-between items-center md:items-start shadow-2xl shrink-0">
                <div className="md:mb-10"><h2 className="text-xl md:text-2xl font-black italic text-indigo-400">EduPrime</h2><p className="text-[10px] text-slate-500 hidden md:block uppercase tracking-widest">Admin V42</p></div>
                <nav className="flex md:flex-col gap-4 md:flex-1">
                    <button onClick={()=>setActiveTab('users')} className={`p-3 rounded-xl transition-all ${activeTab==='users'?'bg-indigo-600':'hover:bg-white/10'}`}><Users size={20}/></button>
                    <button onClick={()=>setActiveTab('exams')} className={`p-3 rounded-xl transition-all ${activeTab==='exams'?'bg-indigo-600':'hover:bg-white/10'}`}><Database size={20}/></button>
                    <button onClick={()=>setActiveTab('lms')} className={`p-3 rounded-xl transition-all ${activeTab==='lms'?'bg-indigo-600':'hover:bg-white/10'}`}><BookOpen size={20}/></button>
                </nav>
                <button onClick={onLogout} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><LogOut size={20}/></button>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-black uppercase tracking-tight">{activeTab}</h1>
                    
                    {activeTab === 'users' && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.length > 0 && <button onClick={deleteSelected} className="bg-rose-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs"><Trash2 size={16}/> Hapus {selectedUsers.length}</button>}
                            <label className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-2 text-xs hover:scale-105 transition-all"><Upload size={16}/> Upload Passing Grade <input type="file" className="hidden" onChange={e=>handleUploadPassingGrade(e.target.files[0])}/></label>
                            <label className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-2 text-xs hover:scale-105 transition-all"><FileSpreadsheet size={16}/> Upload Peserta <input type="file" className="hidden" onChange={e=>{const f=new FormData();f.append('file',e.target.files[0]);fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh)}}/></label>
                            <button onClick={()=>setShowUserModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs hover:scale-105 transition-all"><Plus size={16}/> Tambah Manual</button>
                        </div>
                    )}
                    
                    {activeTab === 'exams' && <button onClick={()=>setShowPeriodModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 text-sm hover:scale-105 transition-all"><Plus/> Buat Paket Ujian</button>}
                    {activeTab === 'lms' && <button onClick={()=>setShowLmsModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 text-sm hover:scale-105 transition-all"><Plus/> Tambah Materi</button>}
                </div>

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-xs"><tr><th className="p-6 w-10 text-center"><Square size={18} onClick={toggleSelectAll} className="cursor-pointer"/></th><th className="p-6">Nama Lengkap</th><th className="p-6">Username</th><th className="p-6">Role</th></tr></thead><tbody>{users.map(u => (<tr key={u.id} className={`border-b hover:bg-slate-50 cursor-pointer ${selectedUsers.includes(u.id)?'bg-indigo-50':''}`} onClick={()=>toggleSelect(u.id)}><td className="p-6 text-center">{selectedUsers.includes(u.id)?<CheckSquare className="text-indigo-600" size={18}/>:<Square className="text-slate-300" size={18}/>}</td><td className="p-6 font-bold">{u.full_name}</td><td className="p-6 font-mono text-sm">{u.username}</td><td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td></tr>))}</tbody></table>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">{p.name} <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded text-xs ml-2">{p.exam_type}</span></h3><button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)} className="text-rose-400 hover:text-rose-600"><Trash2 size={18}/></button></div>
                                <div className="space-y-4">{p.exams?.map(e => (<div key={e.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-100 transition-all gap-4"><div><p className="font-bold text-slate-700">{e.title}</p><p className="text-xs text-slate-400 font-bold">{e.duration} Menit</p></div><div className="flex gap-2 w-full sm:w-auto"><button onClick={()=>openPreview(e.id)} className="p-2 bg-white border rounded-lg hover:border-indigo-500 text-indigo-600 flex-1 sm:flex-none justify-center flex"><Eye size={16}/></button><label className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer flex items-center justify-center gap-2 text-xs font-bold flex-1 sm:flex-none hover:bg-indigo-700 transition-all"><Upload size={14}/> Excel<input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/></label></div></div>))}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'lms' && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {materials.map(m => (
                            <div key={m.id} className="bg-white p-6 rounded-[2rem] shadow-lg border relative group"><button onClick={()=>fetch(`${API_URL}/materials/${m.id}`,{method:'DELETE'}).then(refresh)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button><div className="mb-4"><span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded">{m.category}</span></div><h4 className="font-bold mb-2 text-lg leading-tight">{m.title}</h4><a href={m.content_url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-indigo-600 font-bold text-xs border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">BUKA MATERI</a></div>
                        ))}
                    </div>
                )}
            </main>
            
            {/* Modal Preview */}
            {previewExamId && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm"><div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col relative"><div className="bg-indigo-900 p-6 flex justify-between items-center text-white"><h3 className="font-bold text-xl">Preview Soal</h3><button onClick={()=>setPreviewExamId(null)} className="p-2 bg-white/10 rounded-full hover:bg-rose-500"><X size={20}/></button></div><div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">{previewQuestions.map((q, i) => (<div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="font-bold text-indigo-600 mb-2">NO {i+1} ({q.type})</div>{q.passage && <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-sm font-serif leading-relaxed whitespace-pre-wrap"><RenderPreview text={q.passage}/></div>}{q.media && <img src={q.media} alt="Soal" className="h-32 object-contain mb-4 border rounded"/>}<div className="text-lg font-medium mb-4"><RenderPreview text={q.text}/></div>{/* Opsi Preview Sederhana */}<div className="grid gap-2">{q.options.map(o => (<div key={o.id} className={`p-3 border rounded-xl flex gap-3 items-center ${o.is_correct?'bg-emerald-50 border-emerald-200':''}`}><span className="font-bold w-6 h-6 bg-slate-200 flex items-center justify-center rounded-full text-xs">{o.id}</span><RenderPreview text={o.label}/></div>))}</div></div>))}</div></div></div>)}

            {/* Modal User */}
            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6 text-slate-800">Tambah Peserta</h3><div className="space-y-4"><input className="w-full p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})}/><input className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})}/><input className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})}/><select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}><option value="peserta">Peserta</option><option value="admin">Admin</option></select></div><div className="flex gap-2 mt-6"><button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold text-slate-500">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Simpan</button></div></form></div>}
            
            {/* Modal Period */}
            {showPeriodModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddPeriod} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Paket Ujian Baru</h3><div className="space-y-4"><input className="w-full p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Nama Paket (misal: TO Akbar 1)" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name: e.target.value})}/><select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type: e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select></div><div className="flex gap-2 mt-6"><button type="button" onClick={()=>setShowPeriodModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold text-slate-500">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Buat</button></div></form></div>}
            
            {/* Modal LMS */}
            {showLmsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddLms} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Tambah Materi LMS</h3><div className="space-y-4"><input className="w-full p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Judul Materi" value={newLms.title} onChange={e=>setNewLms({...newLms, title: e.target.value})}/><select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={newLms.category} onChange={e=>setNewLms({...newLms, category: e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select><select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={newLms.type} onChange={e=>setNewLms({...newLms, type: e.target.value})}><option value="video">Video</option><option value="pdf">PDF/Dokumen</option></select><input className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Link URL" value={newLms.url} onChange={e=>setNewLms({...newLms, url: e.target.value})}/></div><div className="flex gap-2 mt-6"><button type="button" onClick={()=>setShowLmsModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold text-slate-500">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Simpan</button></div></form></div>}
        </div>
    );
};
export default AdminDashboard;