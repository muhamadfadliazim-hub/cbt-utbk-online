import React, { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Database, Plus, Trash2, Eye, X, 
    CheckCircle, FileSpreadsheet, Video, Link as LinkIcon, Upload
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Form States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    const [previewExam, setPreviewExam] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK' });
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', url: '' });

    const refreshData = () => {
        fetch(`${API_URL}/admin/users`).then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : []));
        fetch(`${API_URL}/admin/periods`).then(r => r.json()).then(data => setPeriods(Array.isArray(data) ? data : []));
        fetch(`${API_URL}/materials`).then(r => r.json()).then(data => setMaterials(Array.isArray(data) ? data : []));
    };

    useEffect(() => { refreshData(); }, [activeTab]);

    // --- LOGIKA PESERTA ---
    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        }).then(() => { setShowUserModal(false); refreshData(); });
    };

    // --- LOGIKA BANK SOAL ---
    const handleAddPeriod = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newPeriod.name);
        formData.append('exam_type', newPeriod.exam_type);
        fetch(`${API_URL}/admin/periods`, { method: 'POST', body: formData }).then(() => {
            setShowPeriodModal(false); refreshData();
        });
    };

    const handleUploadSoal = (eid, file) => {
        const formData = new FormData();
        formData.append('file', file);
        fetch(`${API_URL}/admin/upload-questions/${eid}`, { method: 'POST', body: formData })
            .then(() => { alert("Soal Berhasil Masuk!"); refreshData(); });
    };

    // --- LOGIKA LMS ---
    const handleAddLms = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newLms.title);
        formData.append('type', newLms.type);
        formData.append('category', newLms.category);
        formData.append('url', newLms.url);
        fetch(`${API_URL}/materials`, { method: 'POST', body: formData }).then(() => {
            setShowLmsModal(false); refreshData();
        });
    };

    const handlePreview = (eid) => {
        fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r => r.json()).then(setPreviewExam);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar Royal */}
            <div className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <h2 className="text-2xl font-black mb-12 italic tracking-tighter">EDU<span className="text-indigo-400">PRIME</span></h2>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Users size={20}/> Database Peserta
                    </button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Database size={20}/> Bank Soal & TO
                    </button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'lms' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <BookOpen size={20}/> LMS & Materi
                    </button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black">LOGOUT</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab} System</h1>
                    <div className="flex gap-4">
                        {activeTab === 'users' && (
                            <>
                                <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><FileSpreadsheet size={18}/> Impor Excel</button>
                                <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> Tambah Manual</button>
                            </>
                        )}
                        {activeTab === 'exams' && (
                            <button onClick={() => setShowPeriodModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> Buat Paket Baru</button>
                        )}
                        {activeTab === 'lms' && (
                            <button onClick={() => setShowLmsModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> Tambah Materi</button>
                        )}
                    </div>
                </header>

                {/* --- VIEW: USERS --- */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase">
                                <tr><th className="p-8">Nama</th><th className="p-8">Username</th><th className="p-8">Role</th><th className="p-8 text-right">Aksi</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-slate-50/50">
                                        <td className="p-8 font-black text-slate-800">{u.full_name}</td>
                                        <td className="p-8 font-mono text-slate-500">{u.username}</td>
                                        <td className="p-8"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">{u.role}</span></td>
                                        <td className="p-8 text-right">
                                            <button onClick={() => fetch(`${API_URL}/admin/users/${u.id}`, {method:'DELETE'}).then(refreshData)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- VIEW: BANK SOAL --- */}
                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border relative">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black">{p.name} <span className="text-indigo-600 ml-2">[{p.exam_type}]</span></h3>
                                    <button onClick={() => fetch(`${API_URL}/admin/periods/${p.id}`, {method:'DELETE'}).then(refreshData)} className="text-rose-400"><Trash2 size={20}/></button>
                                </div>
                                <div className="space-y-4">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center group">
                                            <div><p className="font-bold text-slate-700">{e.title}</p><p className="text-[10px] text-slate-400 font-black">{e.duration} MENIT</p></div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <label className="p-3 bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition-all">
                                                    <Upload size={18}/><input type="file" className="hidden" onChange={(x) => handleUploadSoal(e.id, x.target.files[0])}/>
                                                </label>
                                                <button onClick={() => handlePreview(e.id)} className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Eye size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- VIEW: LMS --- */}
                {activeTab === 'lms' && (
                    <div className="grid gap-8 md:grid-cols-3">
                        {materials.map(m => (
                            <div key={m.id} className="bg-white p-8 rounded-[3rem] shadow-xl border flex flex-col">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${m.type==='video'?'bg-rose-50 text-rose-500':'bg-blue-50 text-blue-500'}`}>
                                    {m.type==='video' ? <Video/> : <FileSpreadsheet/>}
                                </div>
                                <h4 className="text-xl font-black mb-4 flex-1">{m.title}</h4>
                                <div className="flex justify-between items-center pt-6 border-t">
                                    <button onClick={() => window.open(m.content_url)} className="text-indigo-600 font-black text-xs flex items-center gap-2 tracking-widest"><LinkIcon size={14}/> BUKA</button>
                                    <button onClick={() => fetch(`${API_URL}/materials/${m.id}`, {method:'DELETE'}).then(refreshData)} className="text-rose-400"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL: TAMBAH USER */}
            {showUserModal && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddUser} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl">
                        <h3 className="text-3xl font-black mb-8 text-center">Data Peserta Baru</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="ID Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border rounded-2xl font-black" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">STUDENT (PESERTA)</option>
                                <option value="admin">ADMIN (STAFF)</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">BATAL</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30">DAFTARKAN</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL: PREVIEW SOAL */}
            {previewExam && (
                <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-12 animate-in slide-in-from-bottom-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-12 border-b pb-8">
                            <h2 className="text-4xl font-black italic">{previewExam.title} - Preview</h2>
                            <button onClick={() => setPreviewExam(null)} className="p-5 bg-slate-100 rounded-full"><X size={32}/></button>
                        </div>
                        <div className="space-y-8">
                            {previewExam.questions && previewExam.questions.map((q, i) => (
                                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                                    <div className="flex justify-between mb-6">
                                        <span className="bg-indigo-900 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase">Soal {i+1}</span>
                                        <button onClick={() => fetch(`${API_URL}/admin/questions/${q.id}`, {method:'DELETE'}).then(() => handlePreview(previewExam.id))} className="text-rose-500"><Trash2 size={20}/></button>
                                    </div>
                                    <p className="text-2xl font-bold mb-8 text-slate-800 italic">"{q.text}"</p>
                                    <div className="grid gap-3">
                                        {q.options && q.options.map((o, idx) => (
                                            <div key={idx} className={`p-6 rounded-2xl border-2 flex items-center justify-between ${o.is_correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' : 'bg-slate-50 text-slate-400 opacity-60'}`}>
                                                <span>{o.option_index}. {o.label}</span>
                                                {o.is_correct && <CheckCircle size={24}/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;