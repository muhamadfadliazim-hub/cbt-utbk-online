import React, { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Database, Settings, Plus, Trash2, Eye, 
    Upload, CheckCircle, X, ChevronRight, Layout 
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [previewExam, setPreviewExam] = useState(null);

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const refreshData = () => {
        fetch(`${API_URL}/admin/users`).then(r => r.json()).then(setUsers);
        fetch(`${API_URL}/admin/periods`).then(r => r.json()).then(setPeriods);
        fetch(`${API_URL}/materials`).then(r => r.json()).then(setMaterials);
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        }).then(() => {
            setShowUserModal(false);
            setNewUser({ username: '', full_name: '', password: '', role: 'student' });
            refreshData();
        });
    };

    const deleteUser = (id) => {
        if(window.confirm("Hapus pengguna ini?")) {
            fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' }).then(refreshData);
        }
    };

    const handlePreview = (eid) => {
        fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r => r.json()).then(setPreviewExam);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar Mewah */}
            <div className="w-72 bg-slate-900 text-white p-6 flex flex-col shadow-2xl">
                <h2 className="text-2xl font-black mb-10 tracking-tighter italic">EDUPRIME <span className="text-indigo-400">ADMIN</span></h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5'}`}>
                        <Users size={20}/> Peserta & Staff
                    </button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5'}`}>
                        <Database size={20}/> Bank Soal & Tryout
                    </button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'lms' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5'}`}>
                        <BookOpen size={20}/> LMS & Materi
                    </button>
                </nav>
                <button onClick={onLogout} className="mt-auto p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-bold">Logout Session</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-black text-slate-800 capitalize">{activeTab.replace('_', ' ')}</h1>
                    {activeTab === 'users' && (
                        <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all">
                            <Plus size={20}/> Tambah Anggota
                        </button>
                    )}
                </header>

                {/* Tab: Users Management */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 font-black text-slate-500 uppercase text-xs">Nama Lengkap</th>
                                    <th className="p-6 font-black text-slate-500 uppercase text-xs">ID Username</th>
                                    <th className="p-6 font-black text-slate-500 uppercase text-xs">Otoritas (Role)</th>
                                    <th className="p-6 font-black text-slate-500 uppercase text-xs text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="p-6 font-bold text-slate-700">{u.full_name}</td>
                                        <td className="p-6 text-slate-500 font-mono">{u.username}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button onClick={() => deleteUser(u.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab: Exams Management */}
                {activeTab === 'exams' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-800">{p.name}</h3>
                                    <button onClick={() => { if(window.confirm("Hapus paket ini?")) fetch(`${API_URL}/admin/periods/${p.id}`, {method:'DELETE'}).then(refreshData) }} className="text-rose-400 hover:text-rose-600"><Trash2 size={18}/></button>
                                </div>
                                <div className="space-y-3">
                                    {p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                            <span className="font-bold text-slate-600">{e.title}</span>
                                            <button onClick={() => handlePreview(e.id)} className="flex items-center gap-2 text-indigo-600 font-black text-xs hover:underline">
                                                <Eye size={16}/> PREVIEW
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah User */}
            {showUserModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddUser} className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-6">Daftarkan Anggota Baru</h3>
                        <div className="space-y-4">
                            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" placeholder="ID Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
                            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">Student (Peserta)</option>
                                <option value="admin">Admin (Staff)</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">BATAL</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">SIMPAN</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Preview Soal */}
            {previewExam && (
                <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-10 animate-in slide-in-from-bottom duration-500">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-10 border-b pb-6">
                            <h2 className="text-3xl font-black">{previewExam.title} - Preview Soal</h2>
                            <button onClick={() => setPreviewExam(null)} className="p-4 bg-slate-100 rounded-full"><X size={32}/></button>
                        </div>
                        <div className="space-y-10">
                            {previewExam.questions.map((q, i) => (
                                <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                                    <div className="flex justify-between mb-4">
                                        <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">No. {i+1}</span>
                                        <button onClick={() => {if(window.confirm("Hapus soal ini?")) fetch(`${API_URL}/admin/questions/${q.id}`, {method:'DELETE'}).then(() => handlePreview(previewExam.id))}} className="text-rose-500 hover:bg-rose-100 p-2 rounded-lg transition-all"><Trash2 size={18}/></button>
                                    </div>
                                    <p className="text-xl font-bold mb-6 text-slate-800">{q.text}</p>
                                    <div className="grid gap-3">
                                        {q.options.map((o, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl border-2 ${o.is_correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' : 'border-slate-200 bg-white opacity-60'}`}>
                                                {o.option_index}. {o.label}
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