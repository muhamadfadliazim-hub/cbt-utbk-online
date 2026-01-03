import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Database, Plus, Trash2, Eye, X, CheckCircle, FileSpreadsheet, Video, Link as LinkIcon, Upload, AlertCircle } from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
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

    const handleBulkDelete = () => {
        if (window.confirm("PERINGATAN: Hapus seluruh peserta (student)? Tindakan ini tidak bisa dibatalkan!")) {
            fetch(`${API_URL}/admin/users/bulk-delete`, { method: 'POST' }).then(() => refreshData());
        }
    };

    const handleBulkUser = (file) => {
        const formData = new FormData(); formData.append('file', file);
        fetch(`${API_URL}/admin/users/bulk`, { method: 'POST', body: formData }).then(() => { alert("Impor Berhasil!"); refreshData(); });
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) }).then(() => { setShowUserModal(false); refreshData(); });
    };

    const handleAddPeriod = (e) => {
        e.preventDefault();
        const f = new FormData(); f.append('name', newPeriod.name); f.append('exam_type', newPeriod.exam_type);
        fetch(`${API_URL}/admin/periods`, { method: 'POST', body: f }).then(() => { setShowPeriodModal(false); refreshData(); });
    };

    const handleAddLms = (e) => {
        e.preventDefault();
        const f = new FormData(); f.append('title', newLms.title); f.append('type', newLms.type); f.append('category', newLms.category); f.append('url', newLms.url);
        fetch(`${API_URL}/materials`, { method: 'POST', body: f }).then(() => { setShowLmsModal(false); refreshData(); });
    };

    const handleUploadSoal = (eid, file) => {
        const f = new FormData(); f.append('file', file);
        fetch(`${API_URL}/admin/upload-questions/${eid}`, { method: 'POST', body: f }).then(() => alert("Upload Berhasil!"));
    };

    const handlePreview = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r => r.json()).then(setPreviewExam); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <div className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <h2 className="text-2xl font-black mb-12 italic tracking-tighter uppercase">EduPrime</h2>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}><Users size={20}/> Peserta</button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'lms' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}><BookOpen size={20}/> LMS Materi</button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black uppercase text-xs">Logout</button>
            </div>

            <div className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black capitalize">{activeTab} System</h1>
                    <div className="flex gap-4">
                        {activeTab === 'users' && (
                            <>
                                <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-rose-700 transition-all transform active:scale-95"><Trash2 size={22}/> HAPUS MASAL</button>
                                <label className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl cursor-pointer hover:bg-emerald-700"><FileSpreadsheet size={22}/> IMPOR EXCEL <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleBulkUser(e.target.files[0])}/></label>
                                <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all"><Plus size={22}/> TAMBAH MANUAL</button>
                            </>
                        )}
                        {activeTab === 'exams' && <button onClick={() => setShowPeriodModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700"><Plus size={22}/> BUAT PAKET BARU</button>}
                        {activeTab === 'lms' && <button onClick={() => setShowLmsModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700"><Plus size={22}/> TAMBAH MATERI</button>}
                    </div>
                </header>

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr><th className="p-8">Nama Lengkap</th><th className="p-8">Username ID</th><th className="p-8">Role</th><th className="p-8 text-right">Aksi</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-slate-50/50">
                                        <td className="p-8 font-black">{u.full_name}</td>
                                        <td className="p-8 font-mono">{u.username}</td>
                                        <td className="p-8"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                                        <td className="p-8 text-right"><button onClick={() => fetch(`${API_URL}/admin/users/${u.id}`, {method:'DELETE'}).then(refreshData)} className="p-3 text-rose-400 hover:text-rose-600 transition-all"><Trash2 size={20}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black">{p.name} <span className="text-indigo-600 ml-2">[{p.exam_type}]</span></h3>
                                    <button onClick={() => fetch(`${API_URL}/admin/periods/${p.id}`, {method:'DELETE'}).then(refreshData)} className="text-rose-400"><Trash2 size={20}/></button>
                                </div>
                                <div className="space-y-4">
                                    {p.exams && p.exams.map(e => (
                                        <div key={e.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center group transition-all hover:bg-slate-100">
                                            <div><p className="font-bold text-slate-700">{e.title}</p><p className="text-[10px] text-slate-400 font-black">{e.duration} MINS</p></div>
                                            <div className="flex gap-2">
                                                <label className="p-3 bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Upload size={18}/><input type="file" className="hidden" onChange={(x) => handleUploadSoal(e.id, x.target.files[0])}/></label>
                                                <button onClick={() => handlePreview(e.id)} className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* LMS Tab View Sama Seperti V26 */}
            </div>

            {/* Modal-Modal (User, Period, LMS, Preview) Sama Seperti V26 - Pastikan Tidak Dihapus */}
        </div>
    );
};
export default AdminDashboard;