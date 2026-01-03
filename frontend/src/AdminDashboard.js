import React, { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Database, Plus, Trash2, Eye, X 
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    
    // Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [previewExam, setPreviewExam] = useState(null);

    const refreshData = () => {
        fetch(`${API_URL}/admin/users`).then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : []));
        fetch(`${API_URL}/admin/periods`).then(r => r.json()).then(data => setPeriods(Array.isArray(data) ? data : []));
    };

    useEffect(() => {
        refreshData();
    }, [activeTab]);

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
        if(window.confirm("Hapus pengguna ini secara permanen?")) {
            fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' }).then(refreshData);
        }
    };

    const handlePreview = (eid) => {
        fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r => r.json()).then(setPreviewExam);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar Royal Admin */}
            <div className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <div className="mb-12">
                    <h2 className="text-2xl font-black tracking-tighter italic">EDU<span className="text-indigo-400">PRIME</span></h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Management Console</p>
                </div>
                
                <nav className="space-y-3 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Users size={20}/> Peserta & Staff
                    </button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Database size={20}/> Bank Soal & Tryout
                    </button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'lms' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <BookOpen size={20}/> LMS Materi
                    </button>
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Administrator</p>
                    <button onClick={onLogout} className="w-full p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black hover:bg-rose-500 hover:text-white transition-all">LOGOUT</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab} Management</h1>
                        <p className="text-slate-500 font-medium">Kelola sistem EduPrime dengan otoritas penuh.</p>
                    </div>
                    {activeTab === 'users' && (
                        <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all transform active:scale-95">
                            <Plus size={22}/> TAMBAH ANGGOTA
                        </button>
                    )}
                </header>

                {/* Content: Users */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <th className="p-8">Full Name</th>
                                    <th className="p-8">Username ID</th>
                                    <th className="p-8">Authority Role</th>
                                    <th className="p-8 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map(u => (
                                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="p-8 font-black text-slate-800">{u.full_name}</td>
                                        <td className="p-8 font-mono text-sm text-slate-500">{u.username}</td>
                                        <td className="p-8">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button onClick={() => deleteUser(u.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                                                <Trash2 size={20}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Content: Exams */}
                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 opacity-20"></div>
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-slate-800">{p.name}</h3>
                                    <button onClick={() => { if(window.confirm("Hapus paket ini?")) fetch(`${API_URL}/admin/periods/${p.id}`, {method:'DELETE'}).then(refreshData) }} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={20}/></button>
                                </div>
                                <div className="space-y-4">
                                    {p.exams && p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 transition-all">
                                            <div className="font-bold text-slate-600">{e.title}</div>
                                            <button onClick={() => handlePreview(e.id)} className="flex items-center gap-2 text-indigo-600 font-black text-xs hover:text-indigo-800 tracking-tighter">
                                                <Eye size={18}/> PREVIEW SOAL
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Tambah User (Lengkap dengan Role) */}
            {showUserModal && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddUser} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl relative">
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Daftarkan Anggota</h3>
                            <p className="text-slate-500 font-medium">Tentukan nama, ID, dan otoritas akses.</p>
                        </div>
                        <div className="space-y-5">
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" placeholder="Username ID" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" type="password" placeholder="Password Access" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
                            <div className="pt-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Authority Role</label>
                                <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-700" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                    <option value="student">Student (Peserta Ujian)</option>
                                    <option value="admin">Administrator (Penuh)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-12">
                            <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs">BATAL</button>
                            <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs hover:bg-indigo-700">DAFTARKAN</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Preview Soal */}
            {previewExam && (
                <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-12 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-16 border-b border-slate-100 pb-8">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{previewExam.title}</h2>
                                <p className="text-slate-500 font-bold mt-1 tracking-widest uppercase text-xs">Review Segmen Soal & Kunci Jawaban</p>
                            </div>
                            <button onClick={() => setPreviewExam(null)} className="p-5 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"><X size={32}/></button>
                        </div>
                        <div className="space-y-12">
                            {previewExam.questions && previewExam.questions.map((q, i) => (
                                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                                    <div className="flex justify-between mb-8 items-center">
                                        <span className="bg-indigo-900 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Question {i+1}</span>
                                        <button onClick={() => {if(window.confirm("Hapus soal ini dari paket?")) fetch(`${API_URL}/admin/questions/${q.id}`, {method:'DELETE'}).then(() => handlePreview(previewExam.id))}} className="p-3 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={20}/></button>
                                    </div>
                                    <p className="text-2xl font-bold mb-10 text-slate-800 leading-snug italic">{q.text}</p>
                                    <div className="grid gap-4">
                                        {q.options && q.options.map((o, idx) => (
                                            <div key={idx} className={`p-6 rounded-2xl border-2 flex items-center justify-between ${o.is_correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' : 'border-slate-50 bg-slate-50/50 text-slate-400 opacity-60'}`}>
                                                <span className="text-lg">{o.option_index}. {o.label}</span>
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